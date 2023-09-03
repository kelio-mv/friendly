import React from "react";
import SettingsTab from "./SettingsTab";
import storage from "../storage";
import socket from "../socket";
import "./Settings.scss";

class Settings extends React.Component {
  state = {
    display: "",
    settings: {
      picture: this.props.user.picture,
      username: "",
      password: "",
    },
  };
  savedSettings = JSON.stringify(this.state.settings);
  fileRef = React.createRef();

  setSettings(settings) {
    this.setState({ settings: { ...this.state.settings, ...settings } });
  }

  onFileLoad(file) {
    if (!file) return;

    const options = { size: 144, quality: 0.8 };

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = options.size;
        canvas.height = options.size;
        ctx.imageSmoothingQuality = "medium";
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        ctx.drawImage(img, x, y, size, size, 0, 0, options.size, options.size);
        this.setSettings({ picture: canvas.toDataURL("image/jpeg", options.quality) });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  render() {
    const { display, settings } = this.state;
    const { picture, username, password } = settings;
    const { savedSettings, fileRef } = this;
    const pattern = /[^a-zA-Z0-9_]/g;

    switch (display) {
      case "":
        return (
          <SettingsTab title="Configurações" back={this.props.close} home>
            <div className="settings__item" onClick={() => this.setState({ display: "Picture" })}>
              <img src="picture.svg" />
              Imagem de perfil
            </div>
            <div className="settings__item" onClick={() => this.setState({ display: "Username" })}>
              <img src="username.svg" />
              Nome de usuário
            </div>
            <div className="settings__item">
              <img src="password.svg" />
              Senha
            </div>
          </SettingsTab>
        );

      case "Picture":
        return (
          <SettingsTab
            title="Imagem de perfil"
            footer={
              <button
                className="btn btn--primary btn--sm"
                onClick={() => {
                  socket.emit("set_user", { prop: "picture", picture }, () => {
                    this.savedSettings = JSON.stringify(this.state.settings);
                    this.setState({ display: "" });
                  });
                }}
                disabled={JSON.stringify(settings) === savedSettings}
              >
                Salvar
              </button>
            }
            back={() => this.setState({ display: "", settings: JSON.parse(savedSettings) })}
          >
            <img
              src={picture}
              className="settings__picture"
              style={picture === "avatar.png" ? { filter: "invert(1)" } : {}}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={(e) => this.onFileLoad(e.target.files[0])}
              style={{ display: "none" }}
            />
            <button className="btn btn--secondary" onClick={() => fileRef.current.click()}>
              Enviar imagem
            </button>
            <button
              className="btn btn--danger"
              onClick={() => {
                fileRef.current.value = "";
                this.setSettings({ picture: "avatar.png" });
              }}
              disabled={picture === "avatar.png"}
            >
              Remover
            </button>
          </SettingsTab>
        );

      case "Username":
        return (
          <SettingsTab
            title="Nome de usuário"
            footer={
              <button
                className="btn btn--primary btn--sm"
                onClick={() => {
                  socket.emit("set_user", { prop: "name", name: username }, () => {
                    storage.saveCredentials(username, storage.password);
                    this.setState({ display: "", username: "", password: "" });
                  });
                }}
                disabled={
                  JSON.stringify(settings) === savedSettings ||
                  username.length < 3 ||
                  username.startsWith("_") ||
                  username.endsWith("_")
                }
              >
                Salvar
              </button>
            }
            back={() => this.setState({ display: "", settings: JSON.parse(savedSettings) })}
          >
            <p className="settings__username-label">Seu nome de usuário: @{this.props.user.name}</p>
            <input
              type="text"
              className="text-input"
              placeholder="Editar nome de usuário"
              value={username}
              onChange={(e) => this.setSettings({ username: e.target.value })}
              maxLength={16}
            />
            <input
              type="password"
              className="text-input"
              placeholder="Senha atual"
              value={password}
              onChange={(e) => this.setSettings({ password: e.target.value })}
              maxLength={16}
            />
          </SettingsTab>
        );
    }
  }
}

export default Settings;
