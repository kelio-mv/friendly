const fs = require("fs");

class Storage {
  constructor() {
    this.users = [];
    this.posts = [];

    try {
      this.users = JSON.parse(fs.readFileSync("users.json"));
      this.posts = JSON.parse(fs.readFileSync("posts.json"));
    } catch {
      fs.writeFileSync("users.json", "[]");
      fs.writeFileSync("posts.json", "[]");
    }
  }

  getUser(username) {
    for (let userId = 0; userId < this.users.length; userId++) {
      const user = this.users[userId];
      if (user.name === username) {
        return [user, userId];
      }
    }
    return [];
  }

  getUserById(userId) {
    // This function will crash the server when receive an invalid userId
    const { name, picture } = this.users[userId];
    return { name, picture };
  }

  addUser(username, password) {
    this.users.push({
      name: username,
      pw: password,
      picture: null,
    });
    fs.writeFileSync("users.json", JSON.stringify(this.users));
    return this.users.length - 1;
  }

  addPost(userId, content) {
    const post = {
      uid: userId,
      date: Math.floor(new Date() / 1000),
      content,
      comments: [],
    };
    this.posts.push(post);
    fs.writeFileSync("posts.json", JSON.stringify(this.posts));
    return post;
  }
}

module.exports = new Storage();
