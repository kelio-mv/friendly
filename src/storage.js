class Storage {
  credentials = JSON.parse(localStorage.getItem("friendly") || "null");
  username = this.credentials ? this.credentials.username : "";
  password = this.credentials ? this.credentials.password : "";
  signUp = false;
  userId = null;

  saveCredentials() {
    this.credentials = { username: this.username, password: this.password };
    localStorage.setItem("friendly", JSON.stringify(this.credentials));
  }

  deleteCredentials() {
    this.credentials = null;
    this.userId = null;
    localStorage.setItem("friendly", "");
  }
}

export default new Storage();
