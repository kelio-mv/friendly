const { Server } = require("socket.io");
const storage = require("./storage");
const io = new Server(3000, { cors: { origin: "*" } });

function createPost(userId, content) {
  const post = storage.createPost(userId, content);
  const { id } = post;
  delete post.id;
  return [id, post];
}

function getPosts() {
  const posts = {};
  storage.getPosts().forEach((post) => {
    posts[post.id] = post;
    delete posts[post.id].id;
  });
  return posts;
}

function createComment(userId, postId, content) {
  const comment = storage.createComment(userId, postId, content);
  const { id } = comment;
  delete comment.id;
  return [id, comment];
}

function getComments(postId, except) {
  const comments = {};
  storage
    .getComments(postId)
    .filter((c) => !except.includes(c.id))
    .forEach((comment) => {
      comments[comment.id] = comment;
      delete comments[comment.id].id;
    });
  return comments;
}

io.on("connection", (socket) => {
  socket.on("auth", (signUp, username, password, callback) => {
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
  });

  socket.on("get_data", (callback) => {
    const { username, profilePicture } = storage.getUser("id", socket.userId);
    callback(socket.userId, { username, profilePicture });
    socket.emit("add_posts", getPosts());
  });

  socket.on("get_users", (userIds) => {
    const users = {};
    userIds.forEach((userId) => {
      const { username, profilePicture } = storage.getUser("id", userId);
      users[userId] = { username, profilePicture };
    });
    socket.emit("add_users", users);
  });

  socket.on("get_comments", (postId, except) => {
    const comments = getComments(postId, except);
    if (Object.keys(comments).length > 0) {
      socket.emit("add_comments", comments);
    }
  });

  socket.on("post", (content, callback) => {
    const [id, post] = createPost(socket.userId, content);
    callback(id, post);
    socket.broadcast.emit("add_posts", { [id]: post });
  });

  socket.on("comment", (postId, content, callback) => {
    const [id, comment] = createComment(socket.userId, postId, content);
    callback(id, comment);
    socket.broadcast.emit("add_comments", { [id]: comment });
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
- fix origin
*/
