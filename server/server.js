const { Server } = require("socket.io");
const storage = require("./storage");
const io = new Server(3000, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("sign-in", (username, password) => {
    const [user, userId] = storage.getUser(username);

    if (user) {
      if (user.pw === password) {
        socket.userId = userId;
        socket.emit("auth-response");
      } else {
        socket.emit("auth-response", "Sua senha está incorreta!");
      }
    } else {
      socket.emit("auth-response", "Seu nome de usuário não foi encontrado!");
    }
  });

  socket.on("sign-up", (username, password) => {
    const [user] = storage.getUser(username);

    if (user) {
      socket.emit("auth-response", "Seu nome de usuário já foi utilizado!");
    } else {
      socket.userId = storage.addUser(username, password);
      socket.emit("auth-response");
    }
  });

  socket.on("ready", () => {
    const userId = socket.userId;
    socket.emit("add_users", { [userId]: storage.getUserById(userId) });
    socket.emit("set_posts", storage.posts);
  });

  socket.on("get_users", (userIds) => {
    const response = {};

    for (const userId of userIds) {
      response[userId] = storage.getUserById(userId);
    }
    socket.emit("add_users", response);
  });

  socket.on("add_post", (content) => {
    const post = storage.addPost(socket.userId, content);
    socket.emit("add_post_response", post);
    socket.broadcast.emit("add_post", post);
  });

  socket.onAny((...args) => console.log("Received:", ...args));
  socket.onAnyOutgoing((...args) => console.log("Sent:", ...args));
});

console.log("Server is running");
