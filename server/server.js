const { Server } = require("socket.io");
const storage = require("./storage");
const io = new Server(3000, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("sign-in", (username, password) => {
    const [user, userId] = storage.getUser(username);

    if (user && user.pw === password) {
      socket.userId = userId;
      socket.emit("auth-response");
    } else {
      socket.emit("auth-response", [
        "Dados Incorretos",
        "O nome de usuário ou senha estão incorretos.",
      ]);
    }
  });

  socket.on("sign-up", (username, password) => {
    const [user] = storage.getUser(username);

    if (user) {
      socket.emit("auth-response", ["Nome Indisponível", "Este nome de usuário já está em uso."]);
    } else {
      socket.userId = storage.addUser(username, password);
      socket.emit("auth-response");
    }
  });

  socket.on("ready", () => {
    const userId = socket.userId;
    socket.emit("set_user", userId, storage.getUserData(userId));
    socket.emit("add_posts", storage.posts);
  });

  socket.on("get_users", (userIds) => {
    const response = {};

    for (const userId of userIds) {
      response[userId] = storage.getUserData(userId);
    }
    socket.emit("add_users", response);
  });

  socket.on("post", (content) => {
    const post = storage.addPost(socket.userId, content);
    socket.emit("post_response", post);
    socket.broadcast.emit("add_posts", [post]);
  });

  socket.on("comment", (postId, content) => {
    const comment = storage.addComment(postId, socket.userId, content);
    socket.emit("comment_response", postId, comment);
    socket.broadcast.emit("add_comment", postId, comment);
  });

  socket.on("set_user", (args, callback) => {
    const newUser = storage.setUserData(socket.userId, args);
    socket.emit("add_users", { [socket.userId]: newUser });
    callback();
    socket.broadcast.emit("add_users", { [socket.userId]: newUser });
  });
});

console.log("Server is running");

/*
function isUserConnected(userId) {
  for (const [id, socket] of io.of("/").sockets) {
    if (socket.userId === userId) {
      return true;
    }
  }
}
*/
