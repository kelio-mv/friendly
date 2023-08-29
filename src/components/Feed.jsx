import { useState } from "react";
import Article from "./Article";

function Feed(props) {
  return (
    <div className="feed">
      <div className="top-bar">
        <img src="menu.svg" />
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
              onClick={() => props.displayPost(i)}
            />
          )
      )}
    </div>
  );
}

export default Feed;
