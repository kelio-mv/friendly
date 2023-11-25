import { useState, useEffect } from "react";
import Modal from "./Modal";
import TextField from "./TextField";
import Icon from "./Icon";
import storage from "../storage";
import socket from "../socket";
import "./Home.scss";

function Home(props) {
  const [username, setUsername] = useState(storage.username);
  const [password, setPassword] = useState(storage.password);
  const [signUp, setSignUp] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);

  useEffect(() => {
    if (storage.credentials) auth(false);
  }, []);

  function auth(requestedByUser) {
    setConnecting(true);
    socket.connect();
    socket.emit("auth", signUp, username, password, (errorMessage) => {
      if (errorMessage) {
        if (!requestedByUser) storage.deleteCredentials();
        socket.close();
        setConnecting(false);
        setErrorMessage(errorMessage);
      } else {
        if (requestedByUser) storage.saveCredentials(username, password);
        socket.on("disconnect", reauth);
        props.onAuth();
      }
    });
  }

  function reauth() {
    /*
      This function re-authenticates the user once the connection is reestablished so that the
      buffered messages can be sent safely. But apparently, messages sent before triggering the
      disconnect event are ignored as socket.io thinks they were sent.
      Stored credentials are used because the user might have changed their credentials in Settings.
    */
    socket.emit("auth", false, storage.username, storage.password, (errorMessage) => {
      if (errorMessage) {
        storage.deleteCredentials();
        socket.off("disconnect");
        socket.close();
        props.onReauthError();
      } else {
        props.onReauth();
      }
    });
  }

  return (
    <div className="home" style={connecting ? { pointerEvents: "none" } : {}}>
      <img src="logo.png" className="home__logo" />

      <h1 className="home__greeting">Bem-vindo ao Friendly</h1>

      <p className="home__description">Um lugar para desabafar e fazer novos amigos</p>

      <TextField
        type="username"
        placeholder="Nome de usuário"
        value={username}
        onChange={(v) => setUsername(v)}
      />

      <TextField
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(v) => setPassword(v)}
      />

      <button
        className="home__btn btn btn--primary"
        onClick={() => auth(true)}
        disabled={connecting}
      >
        {signUp ? "Cadastrar-se" : "Entrar"}
      </button>

      <p className="home__switch-mode">
        {signUp ? "Já tem uma conta? " : "Não tem uma conta? "}

        <span className="home__switch-mode-btn" onClick={() => setSignUp(!signUp)}>
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
          <p className="modal__btn" onClick={() => setErrorMessage([])}>
            OK
          </p>
        }
      >
        {errorMessage[1]}
      </Modal>
    </div>
  );
}

export default Home;
