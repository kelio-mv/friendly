class Storage {
  credentials = JSON.parse(localStorage.getItem("friendly") || "null");
  username = this.credentials ? this.credentials.username : "";
  password = this.credentials ? this.credentials.password : "";
  userId = null;

  saveCredentials(username, password) {
    this.username = username;
    this.password = password;
    localStorage.setItem("friendly", JSON.stringify({ username, password }));
  }

  deleteCredentials() {
    this.credentials = null;
    this.userId = null;
    localStorage.setItem("friendly", "");
  }
}

export default new Storage();
