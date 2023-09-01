import "./Sidebar.scss";

function Sidebar(props) {
  if (!props.open) {
    return;
  }

  return (
    <div className="sidebar">
      <div className="sidebar__content">
        <div className="sidebar__header">
          <img
            src={props.user.picture}
            className="sidebar__picture"
            style={props.user.picture === "avatar.png" ? { filter: "invert(1)" } : {}}
          />
          <p>@{props.user.name}</p>
        </div>

        <div className="sidebar__item sidebar__item--disabled">
          <img src="install.svg" />
          Instalar
        </div>
        <div className="sidebar__item sidebar__item--disabled">
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
