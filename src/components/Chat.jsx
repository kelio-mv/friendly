import { useState, useRef, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";
import Message from "./Message";
import socket from "../socket";
import "./Chat.scss";

function Chat(props) {
  const interlocutorId = parseInt(useParams().id);
  const interlocutor = props.users[interlocutorId];
  const chat = useMemo(getChat, [props.chats]);
  const messages = useMemo(getMessages, [props.messages]);
  const [message, setMessage] = useState("");
  const chatBodyRef = useRef();
  const textareaRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (chat) {
      const fetchedMessages = messages.map((message) => message.id);
      socket.emit("get_messages", interlocutorId, fetchedMessages);
    }
  }, []);

  useEffect(() => {
    const cb = chatBodyRef.current;
    cb.scrollTo(0, cb.scrollHeight);
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }, [message]);

  function getChat() {
    return props.chats.find((chat) => chat.interlocutorId === interlocutorId);
  }

  function getMessages() {
    return props.messages.filter(
      (message) => message.senderId === interlocutorId || message.receiverId === interlocutorId
    );
  }

  function onKeyDown(e) {
    if ("ontouchstart" in document.documentElement) return;
    // Send the message when a desktop user presses Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) sendMessage();
    }
  }

  function sendMessage() {
    socket.emit("create_message", interlocutorId, message.trim());
    if (!chat) socket.emit("create_chat", interlocutorId);
    setMessage("");
    textareaRef.current.focus();
  }

  return (
    <div className="flex-page">
      <div className="top-bar" style={{ padding: "5px 0.875rem" }}>
        <Icon name="arrow_back" onClick={() => navigate(-1)} />
        <ProfilePicture src={interlocutor.profilePicture} size={48} />
        <p className="chat__username">@{interlocutor.username}</p>
      </div>
      <div className="chat__body" ref={chatBodyRef}>
        {messages.map((message) => (
          <Message key={message.id} {...message} />
        ))}
      </div>
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
