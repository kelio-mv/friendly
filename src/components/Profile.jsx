import { useParams, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";
import Article from "./Article";
import credentials from "../credentials";
import "./Profile.scss";

function Profile(props) {
  const userId = parseInt(useParams().id);
  const user = props.users[userId];
  const posts = props.posts.filter((post) => post.authorId === userId);
  const navigate = useNavigate();

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="arrow_back" onClick={() => navigate(-1)} invert />
        <h1>Perfil</h1>
        <div className="top-bar__grow" />
        {userId !== credentials.userId && (
          <Icon name="chat" onClick={() => navigate(`/chat/${userId}`)} invert />
        )}
      </div>

      <div className="profile__header">
        <ProfilePicture src={user.profilePicture} />
        <p className="profile__username">@{user.username}</p>
        <div className="profile__about">
          {user.about && <p className="profile__about-header">Sobre</p>}
          <p className="profile__about-content">{user.about}</p>
        </div>
      </div>

      {posts.map((post) => (
        <Article
          key={post.id}
          data={post}
          user={user}
          onClick={() => navigate(`/post/${post.id}`)}
          truncate
        />
      ))}
    </div>
  );
}

export default Profile;
