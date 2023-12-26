const { Server } = require("socket.io");
const storage = require("./storage");
const developmentEnv = true;
const io = new Server(3000, {
  cors: { origin: developmentEnv ? "http://192.168.1.5:5173" : "https://kelio-mv.github.io" },
});

function getSocket(userId) {
  for (const [_, socket] of io.of("/").sockets) {
    if (socket.uid === userId) {
      return socket;
    }
  }
}

io.on("connection", (socket) => {
  socket.on("auth", handleAuth);
  socket.on("get_data", handleGetData);
  socket.on("get_posts", handleGetPosts);
  socket.on("get_comments", handleGetComments);
  socket.on("get_messages", handleGetMessages);
  socket.on("get_users", handleGetUsers);
  socket.on("leave_room", handleLeaveRoom);
  socket.on("create_post", handleCreatePost);
  socket.on("create_comment", handleCreateComment);
  socket.on("create_chat", handleCreateChat);
  socket.on("create_message", handleCreateMessage);
  socket.on("del_post", handleDelPost);
  socket.on("del_comment", handleDelComment);
  socket.on("del_chat", handleDelChat);
  socket.on("edit_chat", handleEditChat);
  socket.on("edit_user", handleEditUser);

  function handleAuth(signUp, username, password, callback) {
    const user = storage.getUser("username", username);
    let errorMessage;

    if (signUp) {
      if (username.length < 3) {
        errorMessage = ["Nome inválido", "O nome de usuário precisa ter pelo menos 3 caracteres."];
      } else if (password.length < 6) {
        errorMessage = ["Senha inválida", "A senha precisa ter pelo menos 6 caracteres."];
      } else if (user) {
        errorMessage = [
          "Nome indisponível",
          "Este nome de usuário já está em uso. Por favor, escolha outro nome.",
        ];
      } else {
        socket.uid = storage.createUser(username, password);
      }
    } else {
      if (user) {
        if (user.password === password) {
          socket.uid = user.id;
        } else {
          errorMessage = ["Senha incorreta", "Sua senha está incorreta. Por favor, verifique-a."];
        }
      } else {
        errorMessage = [
          "Não encontrado",
          "Seu nome de usuário não foi encontrado. Por favor verifique-o.",
        ];
      }
    }
    callback(errorMessage);
  }

  function handleGetData(callback) {
    const user = storage.getUserData(socket.uid);
    const posts = storage.getPosts(15);
    const chats = storage.getChats(socket.uid);
    const lastMessages = chats.map((chat) =>
      storage.getMessages(chat.userId, chat.interlocutorId, chat.lastViewedMessageId)
    );
    callback(user);
    socket.emit("add_posts", posts);
    socket.emit("add_chats", chats);
    socket.emit("add_messages", lastMessages.flat());
  }

  function handleGetPosts(before, callback) {
    const posts = storage.getPosts(15, before);
    if (posts.length > 0) socket.emit("add_posts", posts);
    callback();
  }

  function handleGetComments(postId, fetched) {
    if (!storage.getPost(postId)) {
      socket.emit("del_post", postId);
      return;
    }
    const all = storage.getComments(postId);
    const allIds = all.map(({ id }) => id);
    const unfetched = all.filter((c) => !fetched.includes(c.id));
    const deleted = fetched.filter((id) => !allIds.includes(id));

    if (unfetched.length > 0) socket.emit("add_comments", unfetched);
    if (deleted.length > 0) socket.emit("del_comments", deleted);
    socket.join(postId);
  }

  function handleGetMessages(interlocutorId, fetched) {
    const all = storage.getMessages(socket.uid, interlocutorId);
    const unfetched = all.filter(({ id }) => !fetched.includes(id));
    if (unfetched.length > 0) socket.emit("add_messages", unfetched);
  }

  function handleGetUsers(ids) {
    const users = ids.map((id) => storage.getUserData(id));
    socket.emit("add_users", users);
  }

  function handleLeaveRoom(postId) {
    socket.leave(postId);
  }

  function handleCreatePost(content, callback) {
    const post = storage.createPost(socket.uid, content);
    callback(post);
    socket.broadcast.emit("add_posts", [post]);
  }

  function handleCreateComment(postId, content, callback) {
    const comment = storage.createComment(socket.uid, postId, content);
    callback(comment);
    socket.broadcast.to(comment.postId).emit("add_comments", [comment]);
  }

  function handleCreateChat(interlocutorId) {
    const userChat = storage.createChat(socket.uid, interlocutorId);
    const interlocutorChat = storage.createChat(interlocutorId, socket.uid);
    const interlocutor = getSocket(interlocutorId);
    socket.emit("add_chats", [userChat]);
    if (interlocutor) interlocutor.emit("add_chats", [interlocutorChat]);
  }

  function handleCreateMessage(receiverId, content, callback) {
    const message = storage.createMessage(socket.uid, receiverId, content);
    const receiver = getSocket(receiverId);
    callback(message);
    if (receiver) receiver.emit("add_messages", [message]);
  }

  function handleDelPost(postId) {
    storage.deletePost(postId);
    socket.emit("del_post", postId);
    socket.broadcast.to(postId).emit("del_post", postId);
  }

  function handleDelComment(id) {
    const { postId } = storage.deleteComment(id);
    socket.emit("del_comments", [id]);
    socket.broadcast.to(postId).emit("del_comments", [id]);
  }

  function handleDelChat(interlocutorId) {
    storage.deleteChat(socket.uid, interlocutorId);
    storage.deleteChat(interlocutorId, socket.uid);
    storage.deleteMessages(socket.uid, interlocutorId);
    socket.emit("del_chat", interlocutorId);
    const interlocutor = getSocket(interlocutorId);
    if (interlocutor) interlocutor.emit("del_chat", socket.uid);
  }

  function handleEditChat(interlocutorId, lastViewedMessageId) {
    storage.editChat(socket.uid, interlocutorId, "lastViewedMessageId", lastViewedMessageId);
  }

  function handleEditUser({ field, value, currentPassword }, callback) {
    const user = storage.getUser("id", socket.uid);
    let errorMessage;

    switch (field) {
      case "username":
        if (value.length < 3) {
          errorMessage = "O nome de usuário precisa ter pelo menos 3 caracteres.";
        } else if (currentPassword !== user.password) {
          errorMessage = "Sua senha está incorreta. Por favor, verifique-a.";
        } else if (storage.getUser("username", value)) {
          errorMessage = "Este nome de usuário já está em uso. Por favor, escolha outro nome.";
        }
        break;

      case "password":
        if (currentPassword !== user.password) {
          errorMessage = "Sua senha está incorreta. Por favor, verifique-a.";
        } else if (value.length < 6) {
          errorMessage = "A senha precisa ter pelo menos 6 caracteres.";
        }
        break;
    }

    if (!errorMessage) {
      storage.editUser(socket.uid, field, value);
      if (["username", "profilePicture", "about"].includes(field)) {
        socket.emit("update_user", socket.uid);
        socket.broadcast.emit("update_user", socket.uid);
      }
    }

    callback(errorMessage);
  }
});

console.log("Server is running");
