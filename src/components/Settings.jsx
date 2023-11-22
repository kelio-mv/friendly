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
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [profilePicture, setProfilePicture] = useState(props.user.profilePicture);
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <>
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

      <Modal
        open={display === "ProfilePicture"}
        header="Imagem de perfil"
        footer={
          <ModalButton
            onClick={() => {
              setSaving(true);
              const data = { field: "profilePicture", value: profilePicture };
              socket.emit("edit_user", data, () => {
                setDisplay("");
                setSaving(false);
              });
            }}
            disabled={profilePicture === props.user.profilePicture || saving}
          >
            Salvar
          </ModalButton>
        }
        close={() => {
          setDisplay("");
          setProfilePicture(props.user.profilePicture);
        }}
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
                  setDisplay("");
                  setSaving(false);
                  setErrorMessage(null);
                  setUsername("");
                  setCurrentPassword("");
                }
              };
              socket.emit("edit_user", data, callback);
            }}
            disabled={!username || !currentPassword || saving}
          >
            Salvar
          </ModalButton>
        }
        close={() => {
          setDisplay("");
          setErrorMessage("");
          setUsername("");
          setCurrentPassword("");
        }}
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
                  setDisplay("");
                  setSaving(false);
                  setErrorMessage(null);
                  setCurrentPassword("");
                  setPassword("");
                }
              };
              socket.emit("edit_user", data, callback);
            }}
            disabled={!currentPassword || !password || saving}
          >
            Salvar
          </ModalButton>
        }
        close={() => {
          setDisplay("");
          setErrorMessage("");
          setCurrentPassword("");
          setPassword("");
        }}
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
