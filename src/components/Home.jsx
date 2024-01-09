import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Posts from "./Posts";
import Chats from "./Chats";
import Icon from "./Icon";

function Home(props) {
  const prevTab = sessionStorage.getItem("tab");
  const [tab, setTab] = useState(prevTab || "posts");
  const navigate = useNavigate();

  useEffect(() => sessionStorage.setItem("tab", tab), [tab]);

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="menu" onClick={props.openSidebar} invert />
        <h1>{tab === "posts" ? "Publicações" : "Conversas"}</h1>
      </div>

      {tab === "posts" ? (
        <Posts users={props.users} posts={props.posts} />
      ) : (
        <Chats users={props.users} chats={props.chats} messages={props.messages} />
      )}

      <div className="home__bottom-bar">
        <Icon name="article" highlight={tab === "posts"} onClick={() => setTab("posts")} />
        <Icon name="chat" highlight={tab === "chats"} onClick={() => setTab("chats")} />
        <Icon name="add" onClick={() => navigate("new-post")} />
      </div>
    </div>
  );
}

export default Home;
