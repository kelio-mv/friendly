import ProfilePicture from "./ProfilePicture";
import "./Sidebar.scss";

function Sidebar(props) {
  if (!props.open) {
    return;
  }

  return (
    <div className="sidebar">
      <div className="sidebar__content">
        <div className="sidebar__header">
          <ProfilePicture src={props.user.profilePicture} style={{ margin: "0 auto 0.75rem" }} />
          <p>@{props.user.username}</p>
        </div>

        <div className="sidebar__item" onClick={props.openInstall}>
          <img src="install.svg" />
          Instalar
        </div>
        <div className="sidebar__item" onClick={props.openShare}>
          <img src="share.svg" />
          Compartilhar
        </div>
        <div className="sidebar__item sidebar__item--disabled">
          <img src="contact.svg" />
          Contato
        </div>
        <div className="sidebar__item sidebar__item--disabled">
          <img src="pending.svg" />
          Planejamento
        </div>
        <div className="sidebar__item" onClick={props.openSettings}>
          <img src="settings.svg" />
          Configurações
        </div>
        <div className="sidebar__item" onClick={props.logout}>
          <img src="logout.svg" />
          Sair
        </div>
      </div>
      <div className="sidebar__background" onClick={props.close} />
    </div>
  );
}

export default Sidebar;
