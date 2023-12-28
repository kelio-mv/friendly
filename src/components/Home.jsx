import { useNavigate } from "react-router-dom";
import Posts from "./Posts";
import Chats from "./Chats";
import Icon from "./Icon";

function Home(props) {
  const navigate = useNavigate();

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="menu" onClick={props.openSidebar} />
        <h1>{props.tab === "posts" ? "Publicações" : "Conversas"}</h1>
      </div>

      {props.tab === "posts" ? (
        <Posts users={props.users} posts={props.posts} />
      ) : (
        <Chats users={props.users} chats={props.chats} messages={props.messages} />
      )}

      <div className="home__bottom-bar">
        <Icon
          name="article"
          highlight={props.tab === "posts"}
          onClick={() => props.setTab("posts")}
        />
        <Icon name="chat" highlight={props.tab === "chats"} onClick={() => props.setTab("chats")} />
        <Icon name="add" onClick={() => navigate("new-post")} />
      </div>
    </div>
  );
}

export default Home;
