import ProfilePicture from "./ProfilePicture";
import Icon from "./Icon";
import "./Sidebar.scss";

function Sidebar(props) {
  return (
    <div className="sidebar" onClick={props.close}>
      <div className="sidebar__content" onClick={(e) => e.stopPropagation()}>
        <header className="sidebar__header">
          <ProfilePicture src={props.user.profilePicture} />
          <p>@{props.user.username}</p>
        </header>

        <div className="sidebar__body">
          <div className="sidebar__item" onClick={props.openInstall}>
            <Icon name="download" />
            Instalar
          </div>

          <div className="sidebar__item" onClick={props.share}>
            <Icon name="share" />
            Compartilhar
          </div>

          <div className="sidebar__item" onClick={props.contact}>
            <Icon name="contact_support" />
            Contato
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

        <footer className="sidebar__footer">
          <Icon name="code" dimmed /> Em desenvolvimento
        </footer>
      </div>
    </div>
  );
}

export default Sidebar;

// Mesmo problema do Modal
