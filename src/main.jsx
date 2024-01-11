import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import basename from "../basename.js";
import "./index.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>
);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
