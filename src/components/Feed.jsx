import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Article from "./Article";
import Icon from "./Icon";

function Feed(props) {
  const posts = useMemo(
    () => Object.entries(props.posts).sort((a, b) => b[0] - a[0]),
    [props.posts]
  );
  const navigate = useNavigate();

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="menu" onClick={props.openSidebar} />
        <h1>Recentes</h1>
        <div className="top-bar__grow" />
        <Icon name="add_circle" onClick={() => navigate("new-post")} />
      </div>

      <div className="feed__body">
        {posts.map(([id, post]) => (
          <Article
            key={id}
            data={post}
            user={props.users[post.userId]}
            onClick={() => navigate(`post/${id}`)}
            truncate
          />
        ))}
      </div>
    </div>
  );
}

export default Feed;
