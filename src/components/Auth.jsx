import { useState, useEffect } from "react";
import Modal from "./Modal";
import TextField from "./TextField";
import Icon from "./Icon";
import storage from "../storage";
import socket from "../socket";
import "./Auth.scss";

function Auth(props) {
  const [username, setUsername] = useState(storage.username);
  const [password, setPassword] = useState(storage.password);
  const [signUp, setSignUp] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

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
      This function re-authenticates the user when the connection is reestablished so that the
      buffered messages can be sent safely. But apparently, messages sent before triggering the
      disconnect event are ignored as socket.io thinks they were sent.
      Stored credentials are used because the user might have changed their credentials in Settings.
    */
    socket.emit("auth", false, storage.username, storage.password, (e) => {
      e ? props.onReauthError() : props.onReauth();
    });
  }

  return (
    <div className="auth" style={connecting ? { pointerEvents: "none" } : {}}>
      <img src="logo.png" className="auth__logo" />

      <h1 className="auth__greeting">Bem-vindo ao Friendly</h1>

      <p className="auth__description">Um lugar para desabafar e fazer novos amigos</p>

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
        className="auth__btn btn btn--primary"
        onClick={() => auth(true)}
        disabled={connecting}
      >
        {signUp ? "Cadastrar-se" : "Entrar"}
      </button>

      <p className="auth__switch-mode">
        {signUp ? "Já tem uma conta? " : "Não tem uma conta? "}

        <span className="auth__switch-mode-btn" onClick={() => setSignUp(!signUp)}>
          {signUp ? "Faça login" : "Cadastre-se"}
        </span>
      </p>

      <div className="auth__ads">
        Made with <Icon name="favorite" dimmed /> by @kelio_mv
      </div>

      <Modal
        open={errorMessage}
        header="Erro de autenticação"
        footer={
          <p className="modal__btn" onClick={() => setErrorMessage(null)}>
            OK
          </p>
        }
      >
        {errorMessage}
      </Modal>
    </div>
  );
}

export default Auth;
