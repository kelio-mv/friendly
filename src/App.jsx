import { useEffect, useState } from "react";
import Home from "./components/Home";
import Main from "./components/Main";
import socket from "./socket";
import "./App.scss";

function App() {
  const [display, setDisplay] = useState("Home");

  useEffect(() => {
    socket.on("disconnect", () => setDisplay("Home"));
  }, []);

  switch (display) {
    case "Home":
      return <Home onAuth={() => setDisplay("Main")} />;

    case "Main":
      return <Main />;
  }
}

export default App;

// Devo mesmo conectar antes de fazer login/cadastro ?
// Desabilitar os botões de login/cadastro enqt n estiver conectado?
// Adicionar aviso de "estado de desenvolvimento"
// Adicionar convite de feedback
// Avatar ou imagem?
// Impedir usuário de logar quando já estiver online
// Comentários
// Botão sair
