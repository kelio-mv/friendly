const { Server } = require("socket.io");
const storage = require("./storage");
const developmentEnv = false;
const io = new Server(3000, {
  cors: { origin: developmentEnv ? "http://192.168.1.4:5173" : "https://kelio-mv.github.io" },
});
const errors = {
  usernameNotFound: "Seu nome de usuário não foi encontrado. Por favor verifique-o.",
  usernameAlreadyUsed: "Este nome de usuário já está em uso. Por favor, escolha outro nome.",
  passwordIncorrect: "Sua senha está incorreta. Por favor, verifique-a.",
};

function vt(variable, type) {
  // validateType
  if (type === "id") return Number.isInteger(variable) && variable > 0;
  if (type === "array") return Array.isArray(variable);
  return typeof variable === type;
}

function vet(array, type) {
  // validateElementTypes
  return !array.map((element) => vt(element, type)).includes(false);
}

function vu(u) {
  // validateUsername
  return u === u.replace(/[^a-zA-Z0-9_]/g, "") && u.length >= 3 && u.length <= 16;
}

function vp(p) {
  // validatePassword
  return p.length >= 6 && p.length <= 16;
}

function vc(c) {
  // validateContent
  return c.length === c.trim().length && c.length > 0 && c.length <= 1000;
}

function dv(array) {
  // distinctValues
  return new Set(array).size === array.length;
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

  if (
    vt(signUp, "boolean") &&
    vt(username, "string") &&
    vt(password, "string") &&
    (signUp ? vu(username) && vp(password) : true)
  ) {
    const user = storage.getUser("username", username);
    let err;

    if (signUp) {
      if (user) {
        err = errors.usernameAlreadyUsed;
      } else {
        socket.uid = storage.createUser(username, password);
      }
    } else {
      if (user) {
        if (user.password === password) {
          socket.uid = user.id;
        } else {
          err = errors.passwordIncorrect;
        }
      } else {
        err = errors.usernameNotFound;
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
    if (vt(ids, "array") && vet(ids, "id") && dv(ids)) {
      const users = ids.map((id) => storage.getUserData(id)).filter((user) => user);
      socket.emit("add_users", users);
    }
  }

  function handleCreatePost(content, callback) {
    if (vt(content, "string") && vt(callback, "function") && vc(content)) {
      const post = storage.createPost(socket.uid, content);
      callback(post);
      socket.broadcast.emit("add_posts", [post]);
    }
  }

  function handleCreateComment(postId, content, callback) {
    if (
      vt(postId, "id") &&
      vt(content, "string") &&
      vt(callback, "function") &&
      vc(content) &&
      storage.getPost(postId)
    ) {
      const comment = storage.createComment(socket.uid, postId, content);
      callback(comment);
      socket.broadcast.emit("add_comments", [comment]);
    }
  }

  function handleCreateMessage(receiverId, content, callback) {
    if (
      vt(receiverId, "id") &&
      vt(content, "string") &&
      vt(callback, "function") &&
      vc(content) &&
      receiverId !== socket.uid &&
      storage.getUser("id", receiverId)
    ) {
      if (!storage.getChat(socket.uid, receiverId)) {
        const chat = storage.createChat(socket.uid, receiverId);
        const interlocutorChat = storage.createChat(receiverId, socket.uid);
        const interlocutor = getSocket(receiverId);
        socket.emit("add_chats", [chat]);
        if (interlocutor) interlocutor.emit("add_chats", [interlocutorChat]);
      }

      const message = storage.createMessage(socket.uid, receiverId, content);
      const receiver = getSocket(receiverId);
      callback(message);
      if (receiver) receiver.emit("add_messages", [message]);
    }
  }

  function handleEditChat(interlocutorId, lastViewedMessageId) {
    if (
      vt(interlocutorId, "id") &&
      vt(lastViewedMessageId, "id") &&
      storage.getMessage(lastViewedMessageId)
    ) {
      storage.editChat(socket.uid, interlocutorId, "lastViewedMessageId", lastViewedMessageId);
    }
  }

  function handleEditUser({ field, value, currentPassword }, callback) {
    if (
      ["username", "password", "profilePicture", "about"].includes(field) &&
      vt(value, "string") &&
      vt(currentPassword, ["username", "password"].includes(field) ? "string" : "undefined") &&
      vt(callback, "function") &&
      (field === "username" ? vu(value) : true) &&
      (field === "password" ? vp(value) : true)
    ) {
      const user = storage.getUser("id", socket.uid);
      let err;

      if (["username", "password"].includes(field) && currentPassword !== user.password) {
        err = errors.passwordIncorrect;
      } else if (field === "username" && storage.getUser("username", value)) {
        err = errors.usernameAlreadyUsed;
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
    if (vt(id, "id")) {
      const post = storage.getPost(id);
      if (!post || post.authorId !== socket.uid) return;

      storage.deletePost(id);
      socket.emit("del_post", id);
      socket.broadcast.emit("del_post", id);
    }
  }

  function handleDelComment(id) {
    if (vt(id, "id")) {
      const comment = storage.getComment(id);
      if (!comment || comment.authorId !== socket.uid) return;

      storage.deleteComment(id);
      socket.emit("del_comment", id);
      socket.broadcast.emit("del_comment", id);
    }
  }

  function handleDelChat(interlocutorId) {
    if (vt(interlocutorId, "id") && storage.getChat(socket.uid, interlocutorId)) {
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
        callback(errors.passwordIncorrect);
      }
    }
  }
});

console.log("Server is running");
