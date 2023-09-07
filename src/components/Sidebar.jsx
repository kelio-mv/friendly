import ProfilePicture from "./ProfilePicture";
import Icon from "./Icon";
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
          <Icon name="download" />
          Instalar
        </div>

        <div className="sidebar__item" onClick={props.openShare}>
          <Icon name="share" />
          Compartilhar
        </div>

        <div className="sidebar__item sidebar__item--disabled">
          <Icon name="contact_support" />
          Contato
        </div>

        <div className="sidebar__item sidebar__item--disabled">
          <Icon name="pending_actions" />
          Planejamento
        </div>

        <div className="sidebar__item" onClick={props.openSettings}>
          <Icon name="settings" />
          Configurações
        </div>

        <div className="sidebar__item" onClick={props.logout}>
          <Icon name="logout" />
          Sair
        </div>
      </div>

      <div className="sidebar__background" onClick={props.close} />
    </div>
  );
}

export default Sidebar;
