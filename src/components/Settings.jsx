import React from "react";
import Modal from "./Modal";
import ModalButton from "./ModalButton";
import storage from "../storage";
import socket from "../socket";
import "./Settings.scss";

class Settings extends React.Component {
  state = {
    display: "",
    saving: false,
    profilePicture: this.props.user.picture,
    newUsername: "",
    currentPassword: "",
    newPassword: "",
  };
  savedProfilePicture = this.state.profilePicture;
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
    const { display, saving } = this.state;
    const { profilePicture, newUsername, currentPassword, newPassword } = this.state;
    const { savedProfilePicture, fileRef } = this;
    // const pattern = /[^a-zA-Z0-9_]/g;

    return (
      <>
        <div className="flex-page">
          <div className="top-bar">
            <img src="back.svg" onClick={this.props.close} />
            <h1>Configurações</h1>
          </div>
          <div className="settings__body">
            <div
              className="settings__item"
              onClick={() => this.setState({ display: "ProfilePicture" })}
            >
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
          </div>
        </div>

        <Modal
          open={display === "ProfilePicture"}
          header="Imagem de perfil"
          footer={
            <ModalButton
              onClick={() => {
                this.setState({ saving: true });
                socket.emit("set_user", { prop: "picture", picture: profilePicture }, () => {
                  this.savedProfilePicture = profilePicture;
                  this.setState({ display: "", saving: false });
                });
              }}
              disabled={profilePicture === savedProfilePicture || saving}
            >
              Salvar
            </ModalButton>
          }
          close={() => this.setState({ display: "", profilePicture: savedProfilePicture })}
        >
          <div className="settings__modal">
            <img
              src={profilePicture}
              className="settings__picture"
              style={profilePicture === "avatar.png" ? { filter: "invert(1)" } : {}}
            />
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
          </div>
        </Modal>

        <Modal
          open={display === "Username"}
          header="Nome de usuário"
          footer={
            <ModalButton
              onClick={() => {
                this.setState({ saving: true });
                socket.emit("set_user", { prop: "name", name: newUsername }, () => {
                  storage.saveCredentials(newUsername, storage.password);
                  this.setState({
                    display: "",
                    saving: false,
                    newUsername: "",
                    currentPassword: "",
                  });
                });
              }}
              disabled={saving || !newUsername || !currentPassword}
            >
              Salvar
            </ModalButton>
          }
          close={() => this.setState({ display: "", newUsername: "", currentPassword: "" })}
        >
          <div className="settings__modal">
            <p>@{this.props.user.name}</p>
            <input
              type="text"
              className="text-input"
              placeholder="Novo nome de usuário"
              value={newUsername}
              onChange={(e) => this.setState({ newUsername: e.target.value })}
              maxLength={16}
            />
            <input
              type="password"
              className="text-input"
              placeholder="Senha atual"
              value={currentPassword}
              onChange={(e) => this.setState({ currentPassword: e.target.value })}
              maxLength={16}
            />
          </div>
        </Modal>
      </>
    );
  }
}

export default Settings;
