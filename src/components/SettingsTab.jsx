function SettingsTab(props) {
  return (
    <div className="flex-page">
      <div className="top-bar">
        <img src="back.svg" onClick={props.back} />
        <h1>{props.title}</h1>
      </div>
      <div className={props.home ? "settings__body" : "settings-tab__body"}>{props.children}</div>
      <div className="settings-tab__footer">{props.footer}</div>
    </div>
  );
}

export default SettingsTab;
