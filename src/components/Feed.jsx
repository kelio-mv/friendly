import { useState } from "react";
import Article from "./Article";
import storage from "../storage";

function Feed(props) {
  const posts = props.posts.slice().reverse();

  return (
    <div className="flex-page">
      <div className="top-bar">
        <img src="menu.svg" onClick={props.openSidebar} />
        <h1>Recentes</h1>
        <div className="top-bar__grow"></div>
        <img src="add.svg" onClick={props.openNewPost} />
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
    </div>
  );
}

export default Feed;
