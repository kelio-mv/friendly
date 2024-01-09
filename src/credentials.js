class Credentials {
  data = JSON.parse(localStorage.getItem("friendly") || "null");
  username = this.data ? this.data.username : "";
  password = this.data ? this.data.password : "";
  signUp = false;
  userId = null;

  send = (callback) => {
    const { username, password, signUp } = this;
    callback({ username, password, signUp });
  };

  save() {
    this.data = { username: this.username, password: this.password };
    localStorage.setItem("friendly", JSON.stringify(this.data));
  }

  delete() {
    this.data = null;
    this.userId = null;
    localStorage.setItem("friendly", "");
  }
}

export default new Credentials();
