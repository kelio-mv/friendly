const Database = require("better-sqlite3");

class Storage {
  constructor() {
    this.db = new Database(".data/storage.db");
    this.init();
    // Salvar statements pra otimizar queries
  }

  init() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(16) NOT NULL,
      password VARCHAR(16) NOT NULL,
      profilePicture TEXT NOT NULL DEFAULT 'default_avatar.png',
      lastLoginAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      content TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      postId INTEGER NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      content TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE CASCADE
    )`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1Id INTEGER NOT NULL,
      user2Id INTEGER NOT NULL,
      lastViewedMessageId INTEGER,
      FOREIGN KEY (user1Id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (user2Id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (lastViewedMessageId) REFERENCES messages (id)
    )`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chatId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      content TEXT NOT NULL,
      FOREIGN KEY (chatId) REFERENCES chats (id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users (id)
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

  getPosts(limit, before) {
    const where = before ? `WHERE id < ${before}` : "";
    return this.db.prepare(`SELECT * FROM posts ${where} ORDER BY id DESC LIMIT ?`).all(limit);
  }

  deletePost(postId) {
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
    const comment = this.getComment(commentId);
    this.db.prepare("DELETE FROM comments WHERE id = ?").run(commentId);
    return comment;
  }

  createChat(user1Id, user2Id) {
    const stmt = this.db.prepare("INSERT INTO chats (user1Id, user2Id) VALUES (?, ?)");
    return this.getChat(stmt.run(user1Id, user2Id).lastInsertRowid);
  }

  getChat(chatId) {
    return this.db.prepare("SELECT * FROM chats WHERE id = ?").get(chatId);
  }

  getChats(userId) {
    const stmt = this.db.prepare("SELECT * FROM chats WHERE user1Id = ? OR user2Id = ?");
    return stmt.all(userId, userId);
  }

  createMessage(chatId, userId, content) {
    const stmt = this.db.prepare("INSERT INTO messages (chatId, userId, content) VALUES (?, ?, ?)");
    return this.getMessage(stmt.run(chatId, userId, content).lastInsertRowid);
  }

  getMessage(messageId) {
    return this.db.prepare("SELECT * FROM messages WHERE id = ?").get(messageId);
  }

  getMessages(chatId) {
    return this.db.prepare("SELECT * FROM messages WHERE chatId = ?").all(chatId);
  }

  getLastMessage(chatId) {
    const stmt = this.db.prepare(
      "SELECT * FROM messages WHERE chatId = ? ORDER BY id DESC LIMIT 1"
    );
    return stmt.get(chatId);
  }
}

module.exports = new Storage();
