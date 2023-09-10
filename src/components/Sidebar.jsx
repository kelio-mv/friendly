import { useState, useEffect } from "react";
import ProfilePicture from "./ProfilePicture";
import Icon from "./Icon";
import "./Sidebar.scss";

function Sidebar(props) {
  if (!props.open) {
    return;
  }

  useEffect(() => {
    setStyles({});
  }, []);

  const [styles, setStyles] = useState({
    sidebar: { background: "none" },
    content: { transform: "translateX(-100%)" },
  });

  return (
    <div className="sidebar" style={styles.sidebar} onClick={props.close}>
      <div className="sidebar__content" style={styles.content} onClick={(e) => e.stopPropagation()}>
        <header className="sidebar__header">
          <ProfilePicture src={props.user.profilePicture} style={{ margin: "0 auto 0.75rem" }} />
          <p>@{props.user.username}</p>
        </header>

        <section className="sidebar__body">
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
        </section>

        <footer className="sidebar__footer">
          <Icon name="code" dimmed /> Em desenvolvimento
        </footer>
      </div>
    </div>
  );
}

export default Sidebar;
