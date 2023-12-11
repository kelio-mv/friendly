const { Server } = require("socket.io");
const storage = require("./storage");
const developmentEnv = true;
const io = new Server(3000, {
  cors: { origin: developmentEnv ? "http://192.168.1.5:5173" : "https://kelio-mv.github.io" },
});

function getPosts(before) {
  const posts = {};
  storage.getPosts(15, before).forEach((post) => {
    const { id, ...rest } = post;
    posts[id] = rest;
  });
  return posts;
}

function getComments(postId, fetched) {
  const all = storage.getComments(postId);
  const allIds = all.map(({ id }) => id);
  const _unfetched = all.filter((c) => !fetched.includes(c.id));
  const deleted = fetched.filter((id) => !allIds.includes(id));
  const unfetched = {};
  _unfetched.forEach((comment) => {
    const { id, ...rest } = comment;
    unfetched[id] = rest;
  });
  return [unfetched, deleted];
}

function getChats(userId) {
  const chats = {};
  storage.getChats(userId).forEach((chat) => {
    const { id, ...rest } = chat;
    chats[id] = rest;
  });
  return chats;
}

function getMessages(chatId) {
  const messages = {};
  storage.getMessages(chatId).forEach((message) => {
    const { id, ...rest } = message;
    messages[id] = rest;
  });
  return messages;
}

function getSocket(userId) {
  for (const [_, socket] of io.of("/").sockets) {
    if (socket.userId === userId) {
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
        socket.userId = storage.createUser(username, password);
      }
    } else {
      if (user) {
        if (user.password === password) {
          socket.userId = user.id;
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
    const { username, profilePicture } = storage.getUser("id", socket.userId);
    callback(socket.userId, { username, profilePicture });
    socket.emit("add_posts", getPosts());
    socket.emit("add_chats", getChats(socket.userId));
  }

  function handleGetPosts(before, callback) {
    const posts = getPosts(before);
    if (Object.keys(posts).length > 0) socket.emit("add_posts", posts);
    callback();
  }

  function handleGetComments(postId, fetched) {
    if (!storage.getPost(postId)) {
      socket.emit("del_post", postId);
      return;
    }
    const [unfetched, deleted] = getComments(postId, fetched);
    if (Object.keys(unfetched).length > 0) socket.emit("add_comments", unfetched);
    if (deleted.length > 0) socket.emit("del_comments", deleted);
    socket.join(postId);
  }

  function handleGetMessages(chatId) {
    const messages = getMessages(chatId);
    if (Object.keys(messages).length > 0) socket.emit("add_messages", messages);
  }

  function handleGetUsers(userIds) {
    const users = {};
    userIds.forEach((userId) => {
      const { username, profilePicture } = storage.getUser("id", userId);
      users[userId] = { username, profilePicture };
    });
    socket.emit("add_users", users);
  }

  function handleLeaveRoom(postId) {
    socket.leave(postId);
  }

  function handleCreatePost(content, callback) {
    const { id, ...rest } = storage.createPost(socket.userId, content);
    callback(id, rest);
    socket.broadcast.emit("add_posts", { [id]: rest });
  }

  function handleCreateComment(postId, content, callback) {
    const { id, ...rest } = storage.createComment(socket.userId, postId, content);
    callback(id, rest);
    io.to(rest.postId).emit("add_comments", { [id]: rest });
  }

  function handleCreateChat(userId, callback) {
    const { id, ...rest } = storage.createChat(socket.userId, userId);
    callback(id, rest);
  }

  function handleCreateMessage(chatId, content, userId) {
    const { id, ...rest } = storage.createMessage(chatId, socket.userId, content);
    socket.emit("add_messages", { [id]: rest });
    getSocket(userId).emit("add_messages", { [id]: rest });
  }

  function handleDelPost(postId) {
    storage.deletePost(postId);
    socket.emit("del_post", postId);
    io.to(postId).emit("del_post", postId);
  }

  function handleDelComment(commentId) {
    const { postId } = storage.deleteComment(commentId);
    socket.emit("del_comments", [commentId]);
    io.to(postId).emit("del_comments", [commentId]);
  }

  function handleEditUser({ field, value, currentPassword }, callback) {
    const user = storage.getUser("id", socket.userId);
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
      storage.editUser(socket.userId, field, value);
      if (["profilePicture", "username"].includes(field)) {
        socket.emit("update_user", socket.userId);
        socket.broadcast.emit("update_user", socket.userId);
      }
    }

    callback(errorMessage);
  }
});

console.log("Server is running");
