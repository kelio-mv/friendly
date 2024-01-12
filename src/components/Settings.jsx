import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import ProfilePicture from "./ProfilePicture";
import Form from "./Form";
import TextField from "./TextField";
import Icon from "./Icon";
import credentials from "../credentials";
import socket from "../socket";
import "./Settings.scss";

function Settings(props) {
  const [modal, setModal] = useState("");
  const [profilePicture, setProfilePicture] = useState(props.user.profilePicture);
  const [about, setAbout] = useState(props.user.about);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  function saveProfilePicture() {
    setSaving(true);
    const data = { field: "profilePicture", value: profilePicture };
    const callback = () => reset("modal", "saving");
    socket.emit("edit_user", data, callback);
  }

  function saveAbout() {
    setSaving(true);
    setAbout(about.trim());
    const data = { field: "about", value: about.trim() };
    const callback = () => reset("modal", "saving");
    socket.emit("edit_user", data, callback);
  }

  function saveUsername() {
    setSaving(true);
    const data = { field: "username", value: username, currentPassword };
    const callback = (err) => {
      if (err) {
        setErrorMessage(err);
        setSaving(false);
      } else {
        credentials.username = username;
        credentials.save();
        reset("modal", "saving", "errorMessage", "username", "currentPassword");
      }
    };
    socket.emit("edit_user", data, callback);
  }

  function savePassword() {
    setSaving(true);
    const data = { field: "password", value: password, currentPassword };
    const callback = (err) => {
      if (err) {
        setErrorMessage(err);
        setSaving(false);
      } else {
        credentials.password = password;
        credentials.save();
        reset("modal", "saving", "errorMessage", "currentPassword", "password");
      }
    };
    socket.emit("edit_user", data, callback);
  }

  function deleteAccount() {
    setSaving(true);
    const callback = (err) => {
      if (err) {
        setErrorMessage(err);
        setSaving(false);
      } else {
        socket.close();
        credentials.delete();
        props.onAccountDelete();
      }
    };
    socket.emit("del_user", currentPassword, callback);
  }

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
      modal: () => setModal(""),
      profilePicture: () => setProfilePicture(props.user.profilePicture),
      about: () => setAbout(props.user.about),
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
          <Icon name="arrow_back" onClick={() => navigate(-1)} invert />
          <h1>Configurações</h1>
        </div>
        <div className="settings__body">
          <div className="settings__item" onClick={() => setModal("ProfilePicture")}>
            <Icon name="photo_camera" />
            Imagem de perfil
          </div>
          <div className="settings__item" onClick={() => setModal("About")}>
            <Icon name="person_book" />
            Sobre mim
          </div>
          <div className="settings__item" onClick={() => setModal("Username")}>
            <Icon name="alternate_email" />
            Nome de usuário
          </div>
          <div className="settings__item" onClick={() => setModal("Password")}>
            <Icon name="key" />
            Senha
          </div>
          <div className="settings__item" onClick={() => setModal("DeleteAccount")}>
            <Icon name="delete_forever" />
            Excluir conta
          </div>
        </div>
      </div>

      {/* Profile Picture */}
      <Modal
        open={modal === "ProfilePicture"}
        header="Imagem de perfil"
        footer={
          <button
            className="modal__btn"
            onClick={saveProfilePicture}
            disabled={profilePicture === props.user.profilePicture || saving}
          >
            Salvar
          </button>
        }
        close={() => reset("modal", "profilePicture")}
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

      {/* About */}
      <Modal
        open={modal === "About"}
        header="Sobre mim"
        footer={
          <button
            className="modal__btn"
            onClick={saveAbout}
            disabled={about === props.user.about || saving}
          >
            Salvar
          </button>
        }
        close={() => reset("modal", "about")}
      >
        <textarea
          placeholder="Escreva algo..."
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          rows="4"
          maxLength="150"
        />
      </Modal>

      {/* Username */}
      <Modal
        open={modal === "Username"}
        header="Nome de usuário"
        footer={
          <button
            className="modal__btn"
            form="settings__username"
            disabled={!username || !currentPassword || saving}
          >
            Salvar
          </button>
        }
        close={() => reset("modal", "errorMessage", "username", "currentPassword")}
        center
      >
        <Form id="settings__username" onSubmit={saveUsername}>
          <TextField
            type="username"
            placeholder={props.user.username}
            value={username}
            onChange={(v) => setUsername(v)}
            validateLength
            modalChild
          />

          <TextField
            type="password"
            placeholder="Confirmar senha"
            value={currentPassword}
            onChange={(v) => setCurrentPassword(v)}
            modalChild
          />
        </Form>

        {errorMessage && <p className="settings__error">{errorMessage}</p>}
      </Modal>

      {/* Password */}
      <Modal
        open={modal === "Password"}
        header="Senha"
        footer={
          <button
            className="modal__btn"
            form="settings__password"
            disabled={!currentPassword || !password || saving}
          >
            Salvar
          </button>
        }
        close={() => reset("modal", "errorMessage", "currentPassword", "password")}
        center
      >
        <Form id="settings__password" onSubmit={savePassword}>
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
            validateLength
            modalChild
          />
        </Form>

        {errorMessage && <p className="settings__error">{errorMessage}</p>}
      </Modal>

      <Modal
        open={modal === "DeleteAccount"}
        header="Excluir conta"
        footer={
          <button
            className="modal__btn modal__btn--danger"
            form="settings__delete-account"
            disabled={!currentPassword || saving}
          >
            Sim
          </button>
        }
        close={() => reset("modal", "errorMessage", "currentPassword")}
        center
      >
        <p>Você tem certeza que deseja excluir sua conta?</p>

        <Form id="settings__delete-account" onSubmit={deleteAccount}>
          <TextField
            type="password"
            placeholder="Confirmar senha"
            value={currentPassword}
            onChange={(v) => setCurrentPassword(v)}
            modalChild
          />
        </Form>

        {errorMessage && <p className="settings__error">{errorMessage}</p>}
      </Modal>
    </>
  );
}

export default Settings;
