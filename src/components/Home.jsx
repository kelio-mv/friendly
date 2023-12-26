import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Article from "./Article";
import Icon from "./Icon";
import socket from "../socket";

function Home(props) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function onScroll(e) {
    if (loading) return;

    const fb = e.target;
    const lc = fb.lastElementChild;
    if (fb.clientHeight + fb.scrollTop > fb.scrollHeight - lc.offsetHeight) {
      setLoading(true);
      const before = props.posts[props.posts.length - 1].id;
      socket.emit("get_posts", before, () => setLoading(false));
    }
  }

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="menu" onClick={props.openSidebar} />
        <h1>Home</h1>
        <div className="top-bar__grow" />
        <Icon name="chat" onClick={() => navigate("chats")} />
        <Icon name="add_circle" onClick={() => navigate("new-post")} />
      </div>

      <div className="home__body" onScroll={onScroll}>
        {props.posts.map((post) => (
          <Article
            key={post.id}
            data={post}
            user={props.users[post.authorId]}
            onClick={() => navigate(`post/${post.id}`)}
            truncate
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
