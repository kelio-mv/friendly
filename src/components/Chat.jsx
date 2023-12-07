import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";
import "./Chat.scss";

function Chat(props) {
  const userId = useParams().id;
  const user = props.users[userId];
  const [message, setMessage] = useState("");
  const textareaRef = useRef();
  const navigate = useNavigate();

  function onKeyDown(e) {
    if ("ontouchstart" in document.documentElement) return;
    // Send the message when a desktop user presses Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) sendMessage();
    }
  }

  function sendMessage() {}

  return (
    <div className="flex-page">
      <div className="top-bar" style={{ padding: "11px 0.875rem" }}>
        <Icon name="arrow_back" onClick={() => navigate(-1)} />
        <ProfilePicture src={user.profilePicture} size={36} />
        <p>@{user.username}</p>
      </div>
      <div className="chat__body"></div>
      <div className="chat__footer">
        <textarea
          className="chat__textarea"
          ref={textareaRef}
          placeholder="Mensagem..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="1"
          maxLength="500"
          onKeyDown={onKeyDown}
        />
        <Icon name="send" onClick={sendMessage} disabled={!message.trim()} />
      </div>
    </div>
  );
}

export default Chat;

// Create component for post__footer and chat__footer
