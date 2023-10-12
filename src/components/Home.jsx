import React from "react";
import Modal from "./Modal";
import TextField from "./TextField";
import Icon from "./Icon";
import storage from "../storage";
import socket from "../socket";
import "./Home.scss";

class Home extends React.Component {
  state = {
    username: storage.username,
    password: storage.password,
    signUp: false,
    connecting: storage.credentials,
    errorMessage: [],
  };

  componentDidMount() {
    socket.on("connect", this.auth);

    if (storage.credentials) {
      socket.connect();
    }
  }

  auth = () => {
    const { signUp, username, password } = this.state;
    const callback = (errorMessage) => {
      if (errorMessage) {
        socket.close();
        this.props.onAuthError();
        storage.deleteCredentials();
        this.setState({ connecting: false, errorMessage });
      } else {
        socket.off("connect");
        socket.once("disconnect", this.auth);
        storage.saveCredentials(username, password);
        this.props.onAuth();
      }
    };
    socket.emit("auth", signUp, username, password, callback);
  };

  render() {
    const { username, password, signUp, connecting, errorMessage } = this.state;

    return (
      <div className="home" style={connecting ? { pointerEvents: "none" } : {}}>
        <img src="logo.png" className="home__logo" />

        <h1 className="home__greeting">Bem-vindo ao Friendly</h1>

        <p className="home__description">Um lugar para desabafar e fazer novos amigos</p>

        <TextField
          type="username"
          placeholder="Nome de usuário"
          value={username}
          onChange={(v) => this.setState({ username: v })}
        />

        <TextField
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(v) => this.setState({ password: v })}
        />

        <button
          className="home__btn btn btn--primary"
          onClick={() => {
            this.setState({ connecting: true });
            socket.connect();
          }}
          disabled={connecting}
        >
          {signUp ? "Cadastrar-se" : "Entrar"}
        </button>

        <p className="home__switch-mode">
          {signUp ? "Já tem uma conta? " : "Não tem uma conta? "}

          <span
            className="home__switch-mode-btn"
            onClick={() => this.setState({ signUp: !signUp })}
          >
            {signUp ? "Faça login" : "Cadastre-se"}
          </span>
        </p>

        <div className="home__ads">
          <Icon name="favorite" dimmed />
          <p>Não exibimos anúncios</p>
        </div>

        <Modal
          open={errorMessage.length > 0}
          header={errorMessage[0]}
          footer={
            <p className="modal__btn" onClick={() => this.setState({ errorMessage: [] })}>
              OK
            </p>
          }
        >
          {errorMessage[1]}
        </Modal>
      </div>
    );
  }
}

export default Home;
