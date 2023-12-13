const Database = require("better-sqlite3");
const db = new Database(".data/storage.db");

// Salvar statements pra otimizar queries

class Storage {
  constructor() {
    db.exec(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(16) NOT NULL,
      password VARCHAR(16) NOT NULL,
      profilePicture TEXT NOT NULL DEFAULT 'default_avatar.png',
      lastLoginAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      content TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      postId INTEGER NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      content TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE CASCADE
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS chats (
      userId INTEGER NOT NULL,
      interlocutorId INTEGER NOT NULL,
      lastViewedMessageId INTEGER,
      PRIMARY KEY (userId, interlocutorId),
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (interlocutorId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (lastViewedMessageId) REFERENCES messages (id)
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId INTEGER NOT NULL,
      receiverId INTEGER NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      content TEXT NOT NULL,
      FOREIGN KEY (senderId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (receiverId) REFERENCES users (id) ON DELETE CASCADE
    )`);
  }

  createUser(username, password) {
    const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    return stmt.run(username, password).lastInsertRowid;
  }

  getUser(field, value) {
    return db.prepare(`SELECT * FROM users WHERE ${field} = ?`).get(value);
  }

  getUserData(id) {
    return db.prepare(`SELECT id, username, profilePicture FROM users WHERE id = ?`).get(id);
  }

  editUser(id, field, value) {
    db.prepare(`UPDATE users SET ${field} = ? WHERE id = ?`).run(value, id);
  }

  createPost(userId, content) {
    const stmt = db.prepare("INSERT INTO posts (userId, content) VALUES (?, ?)");
    return this.getPost(stmt.run(userId, content).lastInsertRowid);
  }

  getPost(id) {
    return db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
  }

  getPosts(limit, before) {
    const where = before ? `WHERE id < ${before}` : "";
    return db.prepare(`SELECT * FROM posts ${where} ORDER BY id DESC LIMIT ?`).all(limit);
  }

  deletePost(id) {
    db.prepare("DELETE FROM posts WHERE id = ?").run(id);
  }

  createComment(userId, postId, content) {
    const stmt = db.prepare("INSERT INTO comments (userId, postId, content) VALUES (?, ?, ?)");
    return this.getComment(stmt.run(userId, postId, content).lastInsertRowid);
  }

  getComment(id) {
    return db.prepare("SELECT * FROM comments WHERE id = ?").get(id);
  }

  getComments(postId) {
    return db.prepare("SELECT * FROM comments WHERE postId = ?").all(postId);
  }

  deleteComment(id) {
    const comment = this.getComment(id);
    db.prepare("DELETE FROM comments WHERE id = ?").run(id);
    return comment;
  }

  createChat(userId, interlocutorId) {
    const stmt = db.prepare("INSERT INTO chats (userId, interlocutorId) VALUES (?, ?)");
    stmt.run(userId, interlocutorId);
    return this.getChat(userId, interlocutorId);
  }

  getChat(userId, interlocutorId) {
    const stmt = db.prepare("SELECT * FROM chats WHERE userId = ? AND interlocutorId = ?");
    return stmt.get(userId, interlocutorId);
  }

  getChats(userId) {
    return db.prepare("SELECT * FROM chats WHERE userId = ?").all(userId);
  }

  deleteChat(userId, interlocutorId) {
    const stmt = db.prepare("DELETE FROM chats WHERE userId = ? AND interlocutorId = ?");
    stmt.run(userId, interlocutorId);
  }

  createMessage(senderId, receiverId, content) {
    const stmt = db.prepare(
      "INSERT INTO messages (senderId, receiverId, content) VALUES (?, ?, ?)"
    );
    return this.getMessage(stmt.run(senderId, receiverId, content).lastInsertRowid);
  }

  getMessage(messageId) {
    return db.prepare("SELECT * FROM messages WHERE id = ?").get(messageId);
  }

  getMessages(userId, interlocutorId) {
    const stmt = db.prepare(`
      SELECT * FROM messages
      WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
    `);
    return stmt.all(userId, interlocutorId, interlocutorId, userId);
  }

  getLastMessage(userId, interlocutorId) {
    const stmt = db.prepare(`
      SELECT * FROM messages
      WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
      ORDER BY id DESC LIMIT 1
    `);
    return stmt.get(userId, interlocutorId, interlocutorId, userId);
  }

  deleteMessages(userId, interlocutorId) {
    const stmt = db.prepare(`
      DELETE FROM messages
      WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
    `);
    stmt.run(userId, interlocutorId, interlocutorId, userId);
  }
}

module.exports = new Storage();
