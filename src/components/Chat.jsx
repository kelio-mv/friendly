import { useState, useRef, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";
import Message from "./Message";
import socket from "../socket";
import storage from "../storage";
import "./Chat.scss";

function Chat(props) {
  const param = useParams().id;
  const chatId = param.startsWith("u") ? null : parseInt(param);
  const userId = getUserId();
  const user = props.users[userId];
  const messages = useMemo(getMessages, [props.messages]);
  const [message, setMessage] = useState("");
  const chatBodyRef = useRef();
  const textareaRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (chatId) socket.emit("get_messages", chatId);
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

  function getUserId() {
    if (chatId) {
      const { user1Id, user2Id } = props.chats[chatId];
      return user1Id === storage.userId ? user2Id : user1Id;
    } else {
      return param.substring(1); // bug?
    }
  }

  function getMessages() {
    return Object.entries(props.messages).filter(([_, message]) => message.chatId === chatId);
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
    if (chatId) {
      socket.emit("create_message", chatId, message.trim(), userId);
    } else {
      socket.emit("create_chat", userId, (id, rest) => {
        props.addChats({ [id]: rest });
        navigate(`/chat/${id}`, { replace: true });
        socket.emit("create_message", id, message.trim(), userId);
      });
    }
    setMessage("");
    textareaRef.current.focus();
  }

  return (
    <div className="flex-page">
      <div className="top-bar" style={{ padding: "5px 0.875rem" }}>
        <Icon name="arrow_back" onClick={() => navigate(-1)} />
        <ProfilePicture src={user.profilePicture} size={48} />
        <p className="chat__username">@{user.username}</p>
      </div>
      <div className="chat__body" ref={chatBodyRef}>
        {messages.map(([id, message]) => (
          <Message key={id} {...message} />
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
