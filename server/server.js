const { Server } = require("socket.io");
const storage = require("./storage");
const io = new Server(3000, { cors: { origin: "https://kelio-mv.github.io" } });

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
  });

  socket.on("get_posts", () => {
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

  socket.on("del_post", (postId) => {
    storage.deletePost(postId);
    socket.emit("del_post", postId);
    socket.broadcast.emit("del_post", postId);
  });

  socket.on("del_comment", (commentId) => {
    storage.deleteComment(commentId);
    socket.emit("del_comment", commentId);
    socket.broadcast.emit("del_comment", commentId);
  });

  socket.on("edit_user", ({ field, value, currentPassword }, callback) => {
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
        const { username, profilePicture } = storage.getUser("id", socket.userId);
        socket.emit("add_users", { [socket.userId]: { username, profilePicture } });
        socket.broadcast.emit("add_users", { [socket.userId]: { username, profilePicture } });
      }
    }

    callback(errorMessage);
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
