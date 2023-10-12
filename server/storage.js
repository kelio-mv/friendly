const Database = require("better-sqlite3");

class Storage {
  constructor() {
    this.db = new Database(".storage.db");
    this.init();
    // Salvar statements pra otimizar queries
  }

  init() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(16) NOT NULL,
      password VARCHAR(16) NOT NULL,
      profilePicture TEXT NOT NULL DEFAULT 'default_avatar.png'
    )`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      content TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id)
    )`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      postId INTEGER NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      content TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (postId) REFERENCES posts (id)
    )`);
  }

  createUser(username, password) {
    const stmt = this.db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    return stmt.run(username, password).lastInsertRowid;
  }

  getUser(field, value) {
    return this.db.prepare(`SELECT * FROM users WHERE ${field} = ?`).get(value);
  }

  editUser(id, field, value) {
    this.db.prepare(`UPDATE users SET ${field} = ? WHERE id = ?`).run(value, id);
  }

  createPost(userId, content) {
    const stmt = this.db.prepare("INSERT INTO posts (userId, content) VALUES (?, ?)");
    return this.getPost(stmt.run(userId, content).lastInsertRowid);
  }

  getPost(id) {
    return this.db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
  }

  getPosts() {
    return this.db.prepare("SELECT * FROM posts").all();
  }

  deletePost(postId) {
    this.db.prepare("DELETE FROM comments WHERE postId = ?").run(postId);
    this.db.prepare("DELETE FROM posts WHERE id = ?").run(postId);
  }

  createComment(userId, postId, content) {
    const stmt = this.db.prepare("INSERT INTO comments (userId, postId, content) VALUES (?, ?, ?)");
    return this.getComment(stmt.run(userId, postId, content).lastInsertRowid);
  }

  getComment(id) {
    return this.db.prepare("SELECT * FROM comments WHERE id = ?").get(id);
  }

  getComments(postId) {
    return this.db.prepare("SELECT * FROM comments WHERE postId = ?").all(postId);
  }

  deleteComment(commentId) {
    this.db.prepare("DELETE FROM comments WHERE id = ?").run(commentId);
  }
}

module.exports = new Storage();
