import "./Sidebar.scss";

function Sidebar(props) {
  if (!props.open) {
    return;
  }

  return (
    <div className="sidebar">
      <div className="sidebar__content">
        <div className="sidebar__item">
          <img src="install.svg" />
          Instalar
        </div>
        <div className="sidebar__item">
          <img src="share.svg" />
          Compartilhar
        </div>
        <div className="sidebar__item">
          <img src="contact.svg" />
          Contato
        </div>
        <div className="sidebar__item">
          <img src="pending.svg" />
          Planejamento
        </div>
        <div className="sidebar__item">
          <img src="settings.svg" />
          Configurações
        </div>
        <div className="sidebar__item">
          <img src="logout.svg" />
          Sair
        </div>
      </div>
      <div className="sidebar__background" onClick={props.close} />
    </div>
  );
}

export default Sidebar;
