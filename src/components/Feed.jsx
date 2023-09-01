import { useState } from "react";
import Article from "./Article";
import Sidebar from "./Sidebar";
import storage from "../storage";

function Feed(props) {
  const [showSidebar, setShowSidebar] = useState(false);
  const posts = props.posts.slice().reverse();

  return (
    <div className="flex-page">
      <div className="top-bar">
        <img src="menu.svg" onClick={() => setShowSidebar(true)} />
        <h1>Recentes</h1>
        <div className="top-bar__grow"></div>
        <img src="add.svg" onClick={props.newPost} />
      </div>

      <div className="feed__body">
        {posts.map(
          (post, i) =>
            post && (
              <Article
                key={i}
                data={post}
                user={props.users[post.uid]}
                onClick={() => props.openPost(posts.length - 1 - i)}
              />
            )
        )}
      </div>

      <Sidebar
        open={showSidebar}
        close={() => setShowSidebar(false)}
        user={props.users[storage.userId]}
        logout={props.logout}
        openSettings={props.openSettings}
      />
    </div>
  );
}

export default Feed;
