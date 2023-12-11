import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Article from "./Article";
import Icon from "./Icon";
import socket from "../socket";

function Feed(props) {
  const posts = useMemo(getPosts, [props.posts]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function getPosts() {
    return Object.entries(props.posts).sort((a, b) => b[0] - a[0]);
  }

  function onScroll(e) {
    if (loading) return;

    const fb = e.target;
    const lc = fb.lastElementChild;
    if (fb.clientHeight + fb.scrollTop > fb.scrollHeight - lc.offsetHeight) {
      setLoading(true);
      const before = posts[posts.length - 1][0];
      socket.emit("get_posts", before, () => setLoading(false));
    }
  }

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="menu" onClick={props.openSidebar} />
        <h1>Recentes</h1>
        <div className="top-bar__grow" />
        <Icon name="chat" onClick={() => navigate("chats")} />
        <Icon name="add_circle" onClick={() => navigate("new-post")} />
      </div>

      <div className="feed__body" onScroll={onScroll}>
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
