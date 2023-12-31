const { Server } = require("socket.io");
const storage = require("./storage");
const developmentEnv = true;
const io = new Server(3000, {
  cors: { origin: developmentEnv ? "http://192.168.1.4:5173" : "https://kelio-mv.github.io" },
});
const errors = {
  username: {
    minLength: "O nome de usuário precisa ter pelo menos 3 caracteres.",
    alreadyUsed: "Este nome de usuário já está em uso. Por favor, escolha outro nome.",
    notFound: "Seu nome de usuário não foi encontrado. Por favor verifique-o.",
  },
  password: {
    minLength: "A senha precisa ter pelo menos 6 caracteres.",
    incorrect: "Sua senha está incorreta. Por favor, verifique-a.",
  },
};

function vt(...args) {
  const [variable, ...types] = args;
  const matches = types.map((type) => {
    if (type === "integer") return Number.isInteger(variable);
    if (type === "array") return Array.isArray(variable);
    return typeof variable === type;
  });
  return matches.includes(true);
}

function getSocket(userId) {
  for (const [_, socket] of io.of("/").sockets) {
    if (socket.uid === userId) {
      return socket;
    }
  }
}

io.use((socket, next) => {
  const { signUp, username, password } = socket.handshake.auth;

  if (vt(signUp, "boolean") && vt(username, "string") && vt(password, "string")) {
    const user = storage.getUser("username", username);
    let err;

    if (signUp) {
      if (username.length < 3) {
        err = errors.username.minLength;
      } else if (password.length < 6) {
        err = errors.password.minLength;
      } else if (user) {
        err = errors.username.alreadyUsed;
      } else {
        socket.uid = storage.createUser(username, password);
      }
    } else {
      if (user) {
        if (user.password === password) {
          socket.uid = user.id;
        } else {
          err = errors.password.incorrect;
        }
      } else {
        err = errors.username.notFound;
      }
    }
    if (err) {
      const error = new Error("auth error");
      error.data = err;
      next(error);
    } else {
      next();
    }
  } else {
    next(new Error());
  }
});

io.on("connection", (socket) => {
  socket.on("get_data", handleGetData);
  socket.on("get_users", handleGetUsers);
  socket.on("create_post", handleCreatePost);
  socket.on("create_comment", handleCreateComment);
  socket.on("create_chat", handleCreateChat);
  socket.on("create_message", handleCreateMessage);
  socket.on("edit_chat", handleEditChat);
  socket.on("edit_user", handleEditUser);
  socket.on("del_post", handleDelPost);
  socket.on("del_comment", handleDelComment);
  socket.on("del_chat", handleDelChat);
  socket.on("del_user", handleDelUser);

  function handleGetData(callback) {
    if (vt(callback, "function")) {
      const user = storage.getUserData(socket.uid);
      const posts = storage.getPosts();
      const comments = storage.getComments();
      const chats = storage.getChats(socket.uid);
      const messages = chats.map((chat) => storage.getMessages(chat.userId, chat.interlocutorId));
      callback(user);
      socket.emit("add_posts", posts);
      socket.emit("add_comments", comments);
      socket.emit("add_chats", chats);
      socket.emit("add_messages", messages.flat());
    }
  }

  function handleGetUsers(ids) {
    if (vt(ids, "array")) {
      const users = ids.map((id) => storage.getUserData(id));
      socket.emit("add_users", users);
    }
  }

  function handleCreatePost(content, callback) {
    if (vt(content, "string") && vt(callback, "function")) {
      const post = storage.createPost(socket.uid, content);
      callback(post);
      socket.broadcast.emit("add_posts", [post]);
    }
  }

  function handleCreateComment(postId, content, callback) {
    if (vt(postId, "integer") && vt(content, "string") && vt(callback, "function")) {
      const comment = storage.createComment(socket.uid, postId, content);
      callback(comment);
      socket.broadcast.emit("add_comments", [comment]);
    }
  }

  function handleCreateChat(interlocutorId) {
    if (vt(interlocutorId, "integer")) {
      const userChat = storage.createChat(socket.uid, interlocutorId);
      const interlocutorChat = storage.createChat(interlocutorId, socket.uid);
      const interlocutor = getSocket(interlocutorId);
      socket.emit("add_chats", [userChat]);
      if (interlocutor) interlocutor.emit("add_chats", [interlocutorChat]);
    }
  }

  function handleCreateMessage(receiverId, content, callback) {
    if (vt(receiverId, "integer") && vt(content, "string") && vt(callback, "function")) {
      const message = storage.createMessage(socket.uid, receiverId, content);
      const receiver = getSocket(receiverId);
      callback(message);
      if (receiver) receiver.emit("add_messages", [message]);
    }
  }

  function handleEditChat(interlocutorId, lastViewedMessageId) {
    if (vt(interlocutorId, "integer") && vt(lastViewedMessageId, "integer")) {
      storage.editChat(socket.uid, interlocutorId, "lastViewedMessageId", lastViewedMessageId);
    }
  }

  function handleEditUser({ field, value, currentPassword }, callback) {
    if (
      vt(field, "string") &&
      vt(value, "string") &&
      vt(currentPassword, "string", "undefined") &&
      vt(callback, "function")
    ) {
      const user = storage.getUser("id", socket.uid);
      let err;

      switch (field) {
        case "username":
          if (value.length < 3) {
            err = errors.username.minLength;
          } else if (currentPassword !== user.password) {
            err = errors.password.incorrect;
          } else if (storage.getUser("username", value)) {
            err = errors.username.alreadyUsed;
          }
          break;

        case "password":
          if (value.length < 6) {
            err = errors.password.minLength;
          } else if (currentPassword !== user.password) {
            err = errors.password.incorrect;
          }
          break;
      }

      if (!err) {
        const user = storage.editUser(socket.uid, field, value);
        if (["username", "profilePicture", "about"].includes(field)) {
          socket.emit("add_users", [user]);
          socket.broadcast.emit("update_user", socket.uid);
        }
      }

      callback(err);
    }
  }

  function handleDelPost(id) {
    if (vt(id, "integer")) {
      const post = storage.getPost(id);
      if (!post || post.authorId !== socket.uid) return;

      storage.deletePost(id);
      socket.emit("del_post", id);
      socket.broadcast.emit("del_post", id);
    }
  }

  function handleDelComment(id) {
    if (vt(id, "integer")) {
      const comment = storage.getComment(id);
      if (!comment || comment.authorId !== socket.uid) return;

      storage.deleteComment(id);
      socket.emit("del_comment", id);
      socket.broadcast.emit("del_comment", id);
    }
  }

  function handleDelChat(interlocutorId) {
    if (vt(interlocutorId, "integer")) {
      storage.deleteChat(socket.uid, interlocutorId);
      storage.deleteChat(interlocutorId, socket.uid);
      storage.deleteMessages(socket.uid, interlocutorId);
      socket.emit("del_chat", interlocutorId);
      const interlocutor = getSocket(interlocutorId);
      if (interlocutor) interlocutor.emit("del_chat", socket.uid);
    }
  }

  function handleDelUser(currentPassword, callback) {
    if (vt(currentPassword, "string") && vt(callback, "function")) {
      const { password } = storage.getUser("id", socket.uid);
      if (password === currentPassword) {
        storage.deleteUser(socket.uid);
        callback();
        socket.broadcast.emit("del_user", socket.uid);
      } else {
        callback("Sua senha está incorreta. Por favor, verifique-a.");
      }
    }
  }
});

console.log("Server is running");
