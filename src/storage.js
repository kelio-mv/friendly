class Storage {
  credentials = localStorage.friendly ? JSON.parse(localStorage.friendly) : null;
  username = this.credentials ? this.credentials.username : "";
  password = this.credentials ? this.credentials.password : "";

  saveCredentials(username, password) {
    localStorage.friendly = JSON.stringify({ username, password });
  }

  deleteCredentials() {
    this.credentials = null;
    localStorage.removeItem("friendly");
  }
}

export default new Storage();
