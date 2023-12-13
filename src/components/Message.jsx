import { useMemo } from "react";
import storage from "../storage";
import "./Message.scss";

function Message(props) {
  const fromMe = props.senderId === storage.userId;
  const time = useMemo(() => new Date(props.timestamp * 1000).toTimeString().substring(0, 5), []);

  return (
    <div className={`message ${fromMe ? "message--from-me" : ""}`}>
      <span className="message__content">{props.content}</span>
      <span className="message__time">{time}</span>
    </div>
  );
}

export default Message;

// Alinhar hora à direita com pseudo-element
