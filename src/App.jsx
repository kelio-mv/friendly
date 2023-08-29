import { useState } from "react";
import Home from "./components/Home";
import Main from "./components/Main";
import "./App.scss";

function App() {
  const [display, setDisplay] = useState("Home");

  switch (display) {
    case "Home":
      return <Home onAuth={() => setDisplay("Main")} />;

    case "Main":
      return <Main />;
  }
}

export default App;

// Adicionar aviso de "estado de desenvolvimento"
// Adicionar convite de feedback
// Avatar ou imagem?
