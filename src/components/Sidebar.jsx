import { useNavigate } from "react-router-dom";
import ProfilePicture from "./ProfilePicture";
import Icon from "./Icon";
import storage from "../storage";
import socket from "../socket";
import "./Sidebar.scss";

function Sidebar(props) {
  const navigate = useNavigate();

  function share() {
    navigator.share({
      title: "Friendly",
      text: "Conheça o Friendly, um lugar para desabafar e fazer amigos!",
      url: "https://kelio-mv.github.io/friendly/",
    });
  }

  function contact() {
    window.open("https://www.instagram.com/kelio_mv/", "_blank");
  }

  function openSettings() {
    props.close();
    navigate("settings");
  }

  function logout() {
    storage.deleteCredentials();
    socket.off("disconnect");
    socket.close();
    props.onLogout();
  }

  return (
    <div className="sidebar" onMouseDown={props.close}>
      <div className="sidebar__content" onMouseDown={(e) => e.stopPropagation()}>
        <header className="sidebar__header">
          <ProfilePicture src={props.user.profilePicture} />
          <p>@{props.user.username}</p>
        </header>

        <div className="sidebar__body">
          <div className="sidebar__item" onClick={props.openInstall}>
            <Icon name="download" />
            Instalar
          </div>

          <div className="sidebar__item" onClick={share}>
            <Icon name="share" />
            Compartilhar
          </div>

          <div className="sidebar__item" onClick={contact}>
            <Icon name="contact_support" />
            Contato
          </div>

          <div className="sidebar__item" onClick={openSettings}>
            <Icon name="settings" />
            Configurações
          </div>

          <div className="sidebar__item" onClick={logout}>
            <Icon name="logout" />
            Sair
          </div>
        </div>

        <footer className="sidebar__footer">
          <Icon name="code" dimmed /> Em desenvolvimento
        </footer>
      </div>
    </div>
  );
}

export default Sidebar;
