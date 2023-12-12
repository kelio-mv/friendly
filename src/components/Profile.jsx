import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";
import Article from "./Article";
import storage from "../storage";

function Profile(props) {
  const userId = parseInt(useParams().id);
  const user = props.users.find((user) => user.id === userId);
  const posts = useMemo(() => props.posts.filter((post) => post.userId === userId), [props.posts]);
  const navigate = useNavigate();

  function openChat() {
    let chatId;
    for (const chat of props.chats) {
      if (chat.user1Id === userId || chat.user2Id === userId) {
        chatId = chat.id;
        break;
      }
    }
    if (chatId) navigate(`/chat/${chatId}`);
    else navigate(`/chat/u${userId}`);
  }

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="arrow_back" onClick={() => navigate(-1)} />
        <h1>Perfil</h1>
        <div className="top-bar__grow" />
        {userId !== storage.userId && <Icon name="send" onClick={openChat} />}
      </div>

      <div className="profile__header">
        <ProfilePicture src={user.profilePicture} />
        <p>@{user.username}</p>
      </div>

      {posts.map((post) => (
        <Article
          key={post.id}
          data={post}
          users={props.users}
          onClick={() => navigate(`/post/${post.id}`)}
          truncate
        />
      ))}
    </div>
  );
}

export default Profile;
