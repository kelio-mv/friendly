import { useState, useEffect } from "react";
import Modal from "./Modal";
import Form from "./Form";
import TextField from "./TextField";
import Icon from "./Icon";
import credentials from "../credentials";
import socket from "../socket";
import "./Auth.scss";

function Auth(props) {
  const [username, setUsername] = useState(credentials.username);
  const [password, setPassword] = useState(credentials.password);
  const [signUp, setSignUp] = useState(false);
  const [connecting, setConnecting] = useState(credentials.data);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    socket.off("connect");
    socket.off("connect_error");
    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    if (credentials.data) socket.connect();
  }, []);

  function onConnect() {
    if (credentials.userId) {
      props.onReauth();
    } else {
      if (!credentials.data) {
        credentials.save();
        credentials.signUp = false;
      }
      props.onAuth();
    }
  }

  function onConnectError(err) {
    if (err.message !== "auth error") return;

    if (credentials.userId) {
      credentials.delete();
      props.onReauthError();
    } else {
      if (credentials.data) {
        credentials.delete();
      }
      setConnecting(false);
      setErrorMessage(err.data);
    }
  }

  function auth() {
    setConnecting(true);
    Object.assign(credentials, { username, password, signUp });
    socket.connect();
  }

  return (
    <div className="auth" style={connecting ? { pointerEvents: "none" } : {}}>
      <img src="logo.png" className="auth__logo" />

      <h1 className="auth__greeting">Bem-vindo ao Friendly</h1>

      <p className="auth__description">Um lugar para desabafar e fazer novos amigos</p>

      <Form className="auth__form" onSubmit={auth}>
        <TextField
          type="username"
          placeholder="Nome de usuário"
          value={username}
          onChange={(v) => setUsername(v)}
          validateLength={signUp}
        />

        <TextField
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(v) => setPassword(v)}
          validateLength={signUp}
        />

        <button className="btn btn--primary" disabled={connecting}>
          {signUp ? "Cadastrar-se" : "Entrar"}
        </button>
      </Form>

      <p className="auth__toggle-sign-up">
        {signUp ? "Já tem uma conta? " : "Não tem uma conta? "}

        <span className="auth__toggle-sign-up-btn" onClick={() => setSignUp(!signUp)}>
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
