import { useEffect, useState } from "react";
import socket from "../socket";
import "./Home.scss";

function Home(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

  useEffect(() => {
    socket.on("auth-response", (err) => {
      if (err) {
        alert(err);
      } else {
        props.onAuth();
      }
    });
  }, []);

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
        onChange={(e) => setUsername(e.target.value.trim())}
      />

      <div className="home__pw-container">
        <input
          type={showPassword ? "text" : "password"}
          className="home__input"
          placeholder="Senha"
          maxLength={16}
          value={password}
          onChange={(e) => setPassword(e.target.value.trim())}
        />

        <img
          src={showPassword ? "hide_password.svg" : "show_password.svg"}
          className="home__pw-visibility"
          onClick={() => setShowPassword(!showPassword)}
        />
      </div>

      <button
        className="home__access"
        onClick={() => {
          socket.emit(signingUp ? "sign-up" : "sign-in", username, password);
        }}
      >
        {signingUp ? "Cadastrar-se" : "Entrar"}
      </button>

      <p className="home__switch-mode">
        {signingUp ? "Já tem uma conta? " : "Não tem uma conta? "}

        <span className="home__switch-mode-btn" onClick={() => setSigningUp(!signingUp)}>
          {signingUp ? "Faça login" : "Cadastre-se"}
        </span>
      </p>

      <div className="home__alert">
        <img src="heart.svg" className="home__alert-icon" />
        <p>Não exibimos anúncios</p>
      </div>
    </div>
  );
}

export default Home;
