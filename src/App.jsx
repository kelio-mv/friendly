import { useState } from "react";
import "./App.scss";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

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

      <button className="home__access">{signingUp ? "Cadastrar-se" : "Entrar"}</button>

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

export default App;

// Adicionar aviso de "estado de desenvolvimento"
// Adicionar convite de feedback
