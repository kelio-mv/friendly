import { useState, useRef } from "react";
import Modal from "./Modal";
import ModalButton from "./ModalButton";
import ProfilePicture from "./ProfilePicture";
import TextField from "./TextField";
import Icon from "./Icon";
import storage from "../storage";
import socket from "../socket";
import "./Settings.scss";

function Settings(props) {
  const [display, setDisplay] = useState("");
  const [profilePicture, setProfilePicture] = useState(props.user.profilePicture);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  function onFileLoad(file) {
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
        setProfilePicture(canvas.toDataURL("image/jpeg", options.quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function reset(...variables) {
    const functions = {
      display: () => setDisplay(""),
      profilePicture: () => setProfilePicture(props.user.profilePicture),
      username: () => setUsername(""),
      password: () => setPassword(""),
      currentPassword: () => setCurrentPassword(""),
      errorMessage: () => setErrorMessage(null),
      saving: () => setSaving(false),
    };
    variables.forEach((v) => functions[v]());
  }

  return (
    <>
      {/* Home */}
      <div className="flex-page">
        <div className="top-bar">
          <Icon name="arrow_back" onClick={props.close} />
          <h1>Configurações</h1>
        </div>
        <div className="settings__body">
          <div className="settings__item" onClick={() => setDisplay("ProfilePicture")}>
            <Icon name="photo_camera" />
            Imagem de perfil
          </div>
          <div className="settings__item" onClick={() => setDisplay("Username")}>
            <Icon name="alternate_email" />
            Nome de usuário
          </div>
          <div className="settings__item" onClick={() => setDisplay("Password")}>
            <Icon name="key" />
            Senha
          </div>
        </div>
      </div>

      {/* Profile Picture */}
      <Modal
        open={display === "ProfilePicture"}
        header="Imagem de perfil"
        footer={
          <ModalButton
            onClick={() => {
              setSaving(true);
              const data = { field: "profilePicture", value: profilePicture };
              const callback = () => reset("display", "saving");
              socket.emit("edit_user", data, callback);
            }}
            disabled={profilePicture === props.user.profilePicture || saving}
          >
            Salvar
          </ModalButton>
        }
        close={() => reset("display", "profilePicture")}
        center
      >
        <ProfilePicture src={profilePicture} />
        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          onChange={(e) => onFileLoad(e.target.files[0])}
          style={{ display: "none" }}
        />
        <button className="btn btn--primary" onClick={() => fileRef.current.click()}>
          Enviar imagem
        </button>
        <button
          className="btn btn--danger"
          onClick={() => {
            fileRef.current.value = "";
            setProfilePicture("default_avatar.png");
          }}
          disabled={profilePicture === "default_avatar.png"}
        >
          Remover
        </button>
      </Modal>

      {/* Username */}
      <Modal
        open={display === "Username"}
        header="Nome de usuário"
        footer={
          <ModalButton
            onClick={() => {
              setSaving(true);
              const data = { field: "username", value: username, currentPassword };
              const callback = (errorMessage) => {
                if (errorMessage) {
                  setErrorMessage(errorMessage);
                  setSaving(false);
                } else {
                  storage.saveCredentials(username, storage.password);
                  reset("display", "saving", "errorMessage", "username", "currentPassword");
                }
              };
              socket.emit("edit_user", data, callback);
            }}
            disabled={!username || !currentPassword || saving}
          >
            Salvar
          </ModalButton>
        }
        close={() => reset("display", "errorMessage", "username", "currentPassword")}
        center
      >
        <TextField
          type="username"
          placeholder={props.user.username}
          value={username}
          onChange={(v) => setUsername(v)}
          modalChild
        />

        <TextField
          type="password"
          placeholder="Senha atual"
          value={currentPassword}
          onChange={(v) => setCurrentPassword(v)}
          modalChild
        />

        {errorMessage && <p className="settings__error">{errorMessage}</p>}
      </Modal>

      {/* Password */}
      <Modal
        open={display === "Password"}
        header="Senha"
        footer={
          <ModalButton
            onClick={() => {
              setSaving(true);
              const data = { field: "password", value: password, currentPassword };
              const callback = (errorMessage) => {
                if (errorMessage) {
                  setErrorMessage(errorMessage);
                  setSaving(false);
                } else {
                  storage.saveCredentials(storage.username, password);
                  reset("display", "saving", "errorMessage", "currentPassword", "password");
                }
              };
              socket.emit("edit_user", data, callback);
            }}
            disabled={!currentPassword || !password || saving}
          >
            Salvar
          </ModalButton>
        }
        close={() => reset("display", "errorMessage", "currentPassword", "password")}
        center
      >
        <TextField
          type="password"
          placeholder="Senha atual"
          value={currentPassword}
          onChange={(v) => setCurrentPassword(v)}
          modalChild
        />

        <TextField
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(v) => setPassword(v)}
          modalChild
        />

        {errorMessage && <p className="settings__error">{errorMessage}</p>}
      </Modal>
    </>
  );
}

export default Settings;
