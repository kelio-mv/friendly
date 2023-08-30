import React from "react";
import Modal from "./Modal";
import storage from "../storage";
import socket from "../socket";
import "./Home.scss";

class Home extends React.Component {
  state = {
    username: storage.username,
    password: storage.password,
    showPassword: false,
    signUp: false,
    connecting: storage.credentials,
    errorMessage: [],
  };

  componentDidMount() {
    socket.on("connect", () => {
      const { signUp, username, password } = this.state;
      socket.emit(signUp ? "sign-up" : "sign-in", username, password);
    });

    socket.on("connect_error", () => {
      this.setState({
        connecting: false,
        errorMessage: ["Erro de conexão", "Não foi possível se conectar ao servidor."],
      });
    });

    socket.on("auth-response", (errorMessage) => {
      if (errorMessage) {
        socket.close();
        storage.deleteCredentials();
        this.setState({ connecting: false, errorMessage });
      } else {
        const { username, password } = this.state;
        storage.saveCredentials(username, password);
        this.props.onAuth();
      }
    });

    if (storage.credentials) {
      socket.connect();
    }
  }

  componentWillUnmount() {
    socket.off("connect");
    socket.off("connect_error");
    socket.off("auth-response");
  }

  render() {
    const { username, password, showPassword, signUp, connecting, errorMessage } = this.state;

    return (
      <div className="home">
        <img src="chat.png" className="home__logo" />

        <h1 className="home__greeting">Bem-vindo ao Friendly</h1>

        <p className="home__description">Um lugar para desabafar e fazer novos amigos</p>

        <input
          type="text"
          className="home__input"
          placeholder="Nome de usuário"
          maxLength={16}
          value={username}
          onChange={(e) => this.setState({ username: e.target.value.trim() })}
        />

        <div className="home__pw-container">
          <input
            type={showPassword ? "text" : "password"}
            className="home__input"
            placeholder="Senha"
            maxLength={16}
            value={password}
            onChange={(e) => this.setState({ password: e.target.value.trim() })}
          />

          <img
            src={showPassword ? "hide_password.svg" : "show_password.svg"}
            className="home__pw-visibility"
            onClick={() => this.setState({ showPassword: !showPassword })}
          />
        </div>

        <button
          className="home__access"
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

        <div className="home__alert">
          <img src="heart.svg" className="home__alert-icon" />
          <p>Não exibimos anúncios</p>
        </div>

        <Modal
          open={errorMessage.length > 0}
          header={errorMessage[0]}
          footer={<p onClick={() => this.setState({ errorMessage: [] })}>OK</p>}
        >
          {errorMessage[1]}
        </Modal>
      </div>
    );
  }
}

export default Home;
