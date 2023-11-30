import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import ProfilePicture from "./ProfilePicture";
import Article from "./Article";

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

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="arrow_back" onClick={() => navigate(-1)} />
        <h1>Perfil</h1>
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
