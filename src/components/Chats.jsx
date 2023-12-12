import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";
import storage from "../storage";

function Chats(props) {
  const navigate = useNavigate();
  const chats = Object.entries(props.chats);

  function getUser(chat) {
    const { user1Id, user2Id } = chat;
    const userId = user1Id === storage.userId ? user2Id : user1Id;
    console.log(props.users);
    return props.users[userId];
  }

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="arrow_back" onClick={() => navigate(-1)} />
        <h1>Conversas</h1>
      </div>
      <div className="chats__body">
        {chats.map(([id, rest]) => (
          <Chat key={id} user={getUser(rest)} />
        ))}
      </div>
    </div>
  );
}

function Chat(props) {
  console.log(props.user);

  return (
    <div className="chats__chat">
      <ProfilePicture src={props.user.profilePicture} />
    </div>
  );
}

export default Chats;
