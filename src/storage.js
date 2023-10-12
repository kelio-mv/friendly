class Storage {
  credentials = localStorage.friendly ? JSON.parse(localStorage.friendly) : null;
  username = this.credentials ? this.credentials.username : "";
  password = this.credentials ? this.credentials.password : "";
  userId = null;

  saveCredentials(username, password) {
    this.username = username;
    this.password = password;
    localStorage.friendly = JSON.stringify({ username, password });
  }

  deleteCredentials() {
    this.credentials = null;
    this.userId = null;
    localStorage.removeItem("friendly");
  }
}

export default new Storage();
