import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";

function Chats(props) {
  const navigate = useNavigate();

  function getLastMessage(interlocutorId) {
    const messages = props.messages.filter(
      (message) => message.senderId === interlocutorId || message.receiverId === interlocutorId
    );
    return messages[messages.length - 1];
  }

  function parseTimestamp(timestamp) {
    const now = new Date();
    const date = new Date(timestamp * 1000);
    if (now.toDateString() === date.toDateString()) {
      return date.toTimeString().substring(0, 5);
    }
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (now - date === 86400000) {
      return "Ontem";
    }
    return date.toLocaleDateString();
  }

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="arrow_back" onClick={() => navigate(-1)} />
        <h1>Conversas</h1>
      </div>

      <div className="chats__body">
        {props.chats.map((chat) => {
          const user = props.users[chat.interlocutorId];
          const lastMessage = getLastMessage(chat.interlocutorId);

          return (
            <div
              key={chat.interlocutorId}
              className="chats__item"
              onClick={() => navigate(`/chat/${chat.interlocutorId}`)}
            >
              <ProfilePicture src={user.profilePicture} size={48} />

              <div style={{ marginLeft: "0.75rem", marginRight: "auto" }}>
                <p>@{user.username}</p>
                <p className="chats__last-message">{lastMessage.content}</p>
              </div>

              <p className="chats__date">{parseTimestamp(lastMessage.timestamp)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Chats;
