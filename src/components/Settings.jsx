import React from "react";
import socket from "../socket";
import "./Settings.scss";

class Settings extends React.Component {
  state = {
    picture: this.props.user.picture,
    saving: false,
  };
  fileRef = React.createRef();

  onFileLoad(file) {
    if (!file) return;

    const pictureSize = 96;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = pictureSize;
        canvas.height = pictureSize;
        ctx.imageSmoothingQuality = "medium";
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        ctx.drawImage(img, x, y, size, size, 0, 0, pictureSize, pictureSize);
        this.setState({ picture: canvas.toDataURL("image/jpeg", 0.9) });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  render() {
    const { picture, saving } = this.state;
    const { fileRef } = this;

    return (
      <div className="flex-page">
        <div className="top-bar">
          <img src="back.svg" onClick={this.props.close} />
          <h1>Configurações </h1>
        </div>
        <div className="settings">
          <img
            src={picture}
            className="settings__picture"
            style={picture === "avatar.png" ? { filter: "invert(1)" } : {}}
            onClick={() => fileRef.current.click()}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={(e) => this.onFileLoad(e.target.files[0])}
            style={{ display: "none" }}
          />
          <button className="settings__remove">Remover</button>
          <button
            className="home__access"
            onClick={() => {
              this.setState({ saving: true });
              socket.emit("set_user", { picture }, this.props.close);
            }}
            disabled={saving}
          >
            Salvar
          </button>
        </div>
      </div>
    );
  }
}

export default Settings;
