import { useState } from "react";
import Article from "./Article";
import Sidebar from "./Sidebar";

function Feed(props) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="feed">
      <div className="top-bar">
        <img src="menu.svg" onClick={() => setShowSidebar(true)} />
        <h1>Home</h1>
        <div className="top-bar__grow"> </div>
        <img src="add.svg" onClick={props.newPost} />
      </div>
      {props.posts.map(
        (post, i) =>
          post && (
            <Article
              key={i}
              data={post}
              user={props.users[post.uid]}
              onClick={() => props.openPost(i)}
            />
          )
      )}
      <Sidebar open={showSidebar} close={() => setShowSidebar(false)} />
    </div>
  );
}

export default Feed;
