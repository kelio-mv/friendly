const { Server } = require("socket.io");
const storage = require("./storage");
const io = new Server(3000, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("auth", (signUp, username, password, callback) => {
    const [user, userId] = storage.getUser(username);

    if (signUp) {
      if (username.length < 3) {
        callback(["Nome inválido", "O nome de usuário precisa ter pelo menos 3 caracteres."]);
        return;
      }
      if (password.length < 6) {
        callback(["Senha inválida", "A senha precisa ter pelo menos 6 caracteres."]);
        return;
      }
      if (user) {
        callback([
          "Nome indisponível",
          "Este nome de usuário já está em uso. Por favor, escolha outro nome.",
        ]);
      } else {
        socket.userId = storage.addUser(username, password);
        callback();
      }
    } else {
      if (user) {
        if (user.password === password) {
          socket.userId = userId;
          callback();
        } else {
          callback(["Senha incorreta", "Sua senha está incorreta. Por favor, verifique-a."]);
        }
      } else {
        callback([
          "Não encontrado",
          "Seu nome de usuário não foi encontrado. Por favor verifique-o.",
        ]);
      }
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

  socket.on("update_user", (args, callback) => {
    const user = storage.users[socket.userId];
    let newUser;

    switch (args.prop) {
      case "profilePicture":
        newUser = storage.updateUser(socket.userId, { profilePicture: args.profilePicture });
        break;

      case "username":
        if (args.username.length < 3) {
          callback("O nome de usuário precisa ter pelo menos 3 caracteres.");
        } else if (args.currentPassword !== user.password) {
          callback("Sua senha está incorreta. Por favor, verifique-a.");
        } else if (storage.isUsernameUsed(args.username)) {
          callback("Este nome de usuário já está em uso. Por favor, escolha outro nome.");
        } else {
          newUser = storage.updateUser(socket.userId, { username: args.username });
        }
        break;

      case "password":
        if (args.currentPassword !== user.password) {
          callback("Sua senha está incorreta. Por favor, verifique-a.");
        } else if (args.password.length < 6) {
          callback("A senha precisa ter pelo menos 6 caracteres.");
        } else {
          newUser = storage.updateUser(socket.userId, { password: args.password });
        }
    }

    if (newUser) {
      socket.emit("add_users", { [socket.userId]: newUser });
      callback();
      socket.broadcast.emit("add_users", { [socket.userId]: newUser });
    }
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
