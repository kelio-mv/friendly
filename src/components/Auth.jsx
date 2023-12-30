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
  const [connecting, setConnecting] = useState(storage.credentials);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (storage.credentials) socket.connect();

    socket.off("connect");
    socket.off("connect_error");
    socket.on("connect", () => {
      const isUserRequest = !storage.credentials;
      const isFirstAuth = !storage.userId;
      if (isUserRequest) {
        storage.saveCredentials();
        storage.signUp = false;
      }
      isFirstAuth ? props.onAuth() : props.onReauth();
    });
    socket.on("connect_error", (err) => {
      if (err.message === "auth error") {
        const isUserRequest = !storage.credentials;
        const isFirstAuth = !storage.userId;
        if (!isUserRequest) storage.deleteCredentials();
        if (isFirstAuth) {
          setConnecting(false);
          setErrorMessage(err.data);
        } else {
          props.onReauthError();
        }
      }
    });
  }, []);

  function auth() {
    setConnecting(true);
    Object.assign(storage, { username, password, signUp });
    socket.connect();
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

      <button className="auth__btn btn btn--primary" onClick={auth} disabled={connecting}>
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
