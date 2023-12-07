import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";
import Article from "./Article";
import storage from "../storage";
import socket from "../socket";

function Profile(props) {
  const userId = parseInt(useParams().id);
  const user = props.users[userId];
  const posts = useMemo(getUserPosts, [props.posts]);
  const navigate = useNavigate();

  function getUserPosts() {
    return Object.entries(props.posts)
      .filter(([_, post]) => post.userId === userId)
      .sort((a, b) => b[0] - a[0]);
  }

  function openChat() {
    for (const [id, chat] of Object.entries(props.chats)) {
      if (chat.user1Id === userId || chat.user2Id === userId) {
        navigate(`/chat/${id}`);
        return;
      }
    }
    socket.emit("create_chat", userId);
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

      {posts.map(([id, post]) => (
        <Article
          key={id}
          data={post}
          user={user}
          onClick={() => navigate(`/post/${id}`)}
          truncate
        />
      ))}
    </div>
  );
}

export default Profile;
