import React from "react";
import Modal from "./Modal";
import ModalButton from "./ModalButton";
import ProfilePicture from "./ProfilePicture";
import TextField from "./TextField";
import Icon from "./Icon";
import storage from "../storage";
import socket from "../socket";
import "./Settings.scss";

class Settings extends React.Component {
  state = {
    display: "",
    saving: false,
    errorMessage: null,
    profilePicture: this.props.user.profilePicture,
    username: "",
    currentPassword: "",
    password: "",
  };
  fileRef = React.createRef();

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
        this.setState({ profilePicture: canvas.toDataURL("image/jpeg", options.quality) });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  render() {
    const { fileRef } = this;
    const { user } = this.props;
    const { display, saving, errorMessage } = this.state;
    const { profilePicture, username, currentPassword, password } = this.state;

    return (
      <>
        <div className="flex-page">
          <div className="top-bar">
            <Icon name="arrow_back" onClick={this.props.close} />
            <h1>Configurações</h1>
          </div>
          <div className="settings__body">
            <div
              className="settings__item"
              onClick={() => this.setState({ display: "ProfilePicture" })}
            >
              <Icon name="photo_camera" />
              Imagem de perfil
            </div>
            <div className="settings__item" onClick={() => this.setState({ display: "Username" })}>
              <Icon name="alternate_email" />
              Nome de usuário
            </div>
            <div className="settings__item" onClick={() => this.setState({ display: "Password" })}>
              <Icon name="key" />
              Senha
            </div>
          </div>
        </div>

        <Modal
          open={display === "ProfilePicture"}
          header="Imagem de perfil"
          footer={
            <ModalButton
              onClick={() => {
                this.setState({ saving: true });
                socket.emit("update_user", { prop: "profilePicture", profilePicture }, () => {
                  this.setState({ display: "", saving: false });
                });
              }}
              disabled={profilePicture === user.profilePicture || saving}
            >
              Salvar
            </ModalButton>
          }
          close={() => this.setState({ display: "", profilePicture: user.profilePicture })}
          center
        >
          <ProfilePicture src={profilePicture} />
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={(e) => this.onFileLoad(e.target.files[0])}
            style={{ display: "none" }}
          />
          <button className="btn btn--primary" onClick={() => fileRef.current.click()}>
            Enviar imagem
          </button>
          <button
            className="btn btn--danger"
            onClick={() => {
              fileRef.current.value = "";
              this.setState({ profilePicture: "avatar.png" });
            }}
            disabled={profilePicture === "avatar.png"}
          >
            Remover
          </button>
        </Modal>

        <Modal
          open={display === "Username"}
          header="Nome de usuário"
          footer={
            <ModalButton
              onClick={() => {
                this.setState({ saving: true });
                const data = { prop: "username", username, currentPassword };
                const callback = (errorMessage) => {
                  if (errorMessage) {
                    this.setState({ errorMessage, saving: false });
                  } else {
                    storage.saveCredentials(username, storage.password);
                    this.setState({
                      display: "",
                      saving: false,
                      errorMessage: null,
                      username: "",
                      currentPassword: "",
                    });
                  }
                };
                socket.emit("update_user", data, callback);
              }}
              disabled={!username || !currentPassword || saving}
            >
              Salvar
            </ModalButton>
          }
          close={() =>
            this.setState({
              display: "",
              errorMessage: "",
              username: "",
              currentPassword: "",
            })
          }
          center
        >
          <TextField
            type="username"
            placeholder={user.username}
            value={username}
            onChange={(v) => this.setState({ username: v })}
            modalChild
          />

          <TextField
            type="password"
            placeholder="Senha atual"
            value={currentPassword}
            onChange={(v) => this.setState({ currentPassword: v })}
            modalChild
          />

          {errorMessage && <p className="settings__error">{errorMessage}</p>}
        </Modal>

        <Modal
          open={display === "Password"}
          header="Senha"
          footer={
            <ModalButton
              onClick={() => {
                this.setState({ saving: true });
                const data = { prop: "password", password, currentPassword };
                const callback = (errorMessage) => {
                  if (errorMessage) {
                    this.setState({ errorMessage, saving: false });
                  } else {
                    storage.saveCredentials(storage.username, password);
                    this.setState({
                      display: "",
                      saving: false,
                      errorMessage: null,
                      currentPassword: "",
                      password: "",
                    });
                  }
                };
                socket.emit("update_user", data, callback);
              }}
              disabled={!currentPassword || !password || saving}
            >
              Salvar
            </ModalButton>
          }
          close={() =>
            this.setState({
              display: "",
              errorMessage: "",
              currentPassword: "",
              password: "",
            })
          }
          center
        >
          <TextField
            type="password"
            placeholder="Senha atual"
            value={currentPassword}
            onChange={(v) => this.setState({ currentPassword: v })}
            modalChild
          />

          <TextField
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(v) => this.setState({ password: v })}
            modalChild
          />

          {errorMessage && <p className="settings__error">{errorMessage}</p>}
        </Modal>
      </>
    );
  }
}

export default Settings;
