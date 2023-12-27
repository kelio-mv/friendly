import { useNavigate } from "react-router-dom";
import ProfilePicture from "./ProfilePicture";
import "./Chats.scss";

function Chats(props) {
  const navigate = useNavigate();

  function getMessages(interlocutorId) {
    return props.messages.filter(
      (message) => message.senderId === interlocutorId || message.receiverId === interlocutorId
    );
  }

  function parseTimestamp(timestamp) {
    const now = new Date();
    const date = new Date(timestamp * 1000);
    if (date.toDateString() === now.toDateString()) {
      return date.toTimeString().substring(0, 5);
    }
    now.setDate(now.getDate() - 1);
    if (date.toDateString() === now.toDateString()) {
      return "Ontem";
    }
    return date.toLocaleDateString();
  }

  return (
    <div className="chats__body">
      {props.chats.map((chat) => {
        const user = props.users[chat.interlocutorId];
        const messages = getMessages(chat.interlocutorId);
        const lastMessage = messages[messages.length - 1];
        const unviewedMessages = messages.filter((m) => m.id > chat.lastViewedMessageId).length;

        if (!user || !lastMessage) return;

        return (
          <div
            key={chat.interlocutorId}
            className="chats__item"
            onClick={() => navigate(`/chat/${chat.interlocutorId}`)}
          >
            <ProfilePicture src={user.profilePicture} size={48} />

            <div className="chats__wrapper">
              <p>@{user.username}</p>
              <p className="chats__last-message">{lastMessage.content}</p>
            </div>
            <div>
              <p className="chats__date">{parseTimestamp(lastMessage.timestamp)}</p>
              <div
                className="chats__unviewed"
                style={{ visibility: unviewedMessages ? null : "hidden" }}
              >
                {unviewedMessages}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Chats;
