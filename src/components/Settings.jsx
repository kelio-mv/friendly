import React from "react";
import SettingsTab from "./SettingsTab";
import socket from "../socket";
import "./Settings.scss";

class Settings extends React.Component {
  state = {
    display: "",
    settings: {
      picture: this.props.user.picture,
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
    const { picture } = settings;
    const { savedSettings, fileRef } = this;

    switch (display) {
      case "":
        return (
          <SettingsTab title="Configurações" back={this.props.close} home>
            <div className="settings__item" onClick={() => this.setState({ display: "Picture" })}>
              <img src="picture.svg" />
              Imagem de perfil
            </div>
            <div className="settings__item">
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
                className="btn btn--primary"
                onClick={() => {
                  socket.emit("set_user", { picture }, () => {
                    this.savedSettings = JSON.stringify(this.state.settings);
                    this.setState({ display: "" });
                  });
                }}
                disabled={JSON.stringify(settings) === savedSettings}
                style={{ minWidth: "unset" }}
              >
                Salvar
              </button>
            }
            back={() => this.setState({ display: "" })}
          >
            <div className="settings__grow" />
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
            <div className="settings__grow" />
          </SettingsTab>
        );
    }
  }
}

export default Settings;
