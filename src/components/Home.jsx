import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Chats from "./Chats";
import Article from "./Article";
import Icon from "./Icon";
import socket from "../socket";

function Home(props) {
  const [loading, setLoading] = useState(false);
  const posts = props.posts.filter((post) => post.section === props.tab);
  const headers = { recent: "Recentes", following: "Seguindo", chats: "Conversas" };
  const navigate = useNavigate();

  function onScroll(e) {
    // if (loading) return;
    // const fb = e.target;
    // const lc = fb.lastElementChild;
    // if (fb.clientHeight + fb.scrollTop > fb.scrollHeight - lc.offsetHeight) {
    //   setLoading(true);
    //   const before = props.posts[props.posts.length - 1].id;
    //   socket.emit("get_posts", before, () => setLoading(false));
    // }
  }

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="menu" onClick={props.openSidebar} />
        <h1>{headers[props.tab]}</h1>
      </div>

      {props.tab === "chats" ? (
        <Chats users={props.users} chats={props.chats} messages={props.messages} />
      ) : (
        <div className="posts__body" onScroll={onScroll}>
          {posts.map((post) => (
            <Article
              key={post.id}
              data={post}
              user={props.users[post.authorId]}
              onClick={() => navigate(`post/${post.id}`)}
              truncate
            />
          ))}
        </div>
      )}

      <div className="home__bottom-bar">
        <Icon
          name="schedule"
          highlight={props.tab === "recent"}
          onClick={() => props.setTab("recent")}
        />
        <Icon
          name="forum"
          highlight={props.tab === "following"}
          onClick={() => props.setTab("following")}
        />
        <Icon name="chat" highlight={props.tab === "chats"} onClick={() => props.setTab("chats")} />
        <Icon name="add" onClick={() => navigate("new-post")} />
      </div>
    </div>
  );
}

export default Home;
