import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";
import storage from "../storage";
import "./Chats.scss";

function Chats(props) {
  const navigate = useNavigate();

  function getUser(chat) {
    const { user1Id, user2Id } = chat;
    const userId = user1Id === storage.userId ? user2Id : user1Id;
    return props.users[userId];
  }

  function getLastMessage(chatId) {
    const messages = props.messages.filter((message) => message.chatId === chatId);
    return messages[messages.length - 1];
  }

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="arrow_back" onClick={() => navigate(-1)} />
        <h1>Conversas</h1>
      </div>
      <div className="chats__body">
        {props.chats.map((chat) => (
          <Chat
            key={chat.id}
            user={getUser(chat)}
            lastMessage={getLastMessage(chat.id)}
            onClick={() => navigate(`/chat/${chat.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function Chat({ user, lastMessage, onClick }) {
  return (
    <div className="chats__chat" onClick={onClick}>
      <ProfilePicture src={user.profilePicture} size={48} />
      <div style={{ marginLeft: "0.75rem", marginRight: "auto" }}>
        <p>@{user.username}</p>
        <p className="chats__last-message">{lastMessage.content}</p>
      </div>
      <p className="chats__date">{parseTime(lastMessage.timestamp)}</p>
    </div>
  );
}

function parseTime(time) {
  const elapsed = new Date() / 1000 - time;

  if (elapsed < 60) return "há poucos segundos";
  if (elapsed < 120) return "há 1 minuto";
  if (elapsed < 3600) return `há ${Math.floor(elapsed / 60)} minutos`;
  if (elapsed < 7200) return "há 1 hora";
  if (elapsed < 86400) return `há ${Math.floor(elapsed / 3600)} horas`;
  if (elapsed < 172800) return "há 1 dia";
  return `há ${Math.floor(elapsed / 86400)} dias`;
}

export default Chats;
