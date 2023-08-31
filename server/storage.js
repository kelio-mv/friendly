const fs = require("fs");

class Storage {
  constructor() {
    this.users = [];
    this.posts = [];

    try {
      this.users = JSON.parse(fs.readFileSync("users.json"));
      this.posts = JSON.parse(fs.readFileSync("posts.json"));
    } catch {
      // this code is dangerous as you might break the json
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
    const { name, picture } = this.users[userId];
    return { name, picture };
  }

  addUser(username, password) {
    this.users.push({
      name: username,
      pw: password,
      picture: "avatar.png",
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

  addComment(postId, userId, content) {
    const comment = {
      uid: userId,
      date: Math.floor(new Date() / 1000),
      content,
    };
    this.posts[postId].comments.push(comment);
    fs.writeFileSync("posts.json", JSON.stringify(this.posts));
    return comment;
  }
}

module.exports = new Storage();
