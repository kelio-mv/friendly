import { useState } from "react";
import Article from "./Article";
import socket from "../socket";

function Post(props) {
  const user = props.users[props.post.uid];
  const [comment, setComment] = useState("");

  return (
    <div className="flex-page">
      <div className="top-bar">
        <img src="back.svg" onClick={props.close} />
        <h1>Post de @{user.name}</h1>
      </div>

      <div className="post__body">
        <Article data={props.post} user={user} />
        {props.post.comments.map((comment, i) => (
          <Article key={i} data={comment} user={props.users[comment.uid]} />
        ))}
      </div>

      <div className="post__footer">
        <textarea
          className="post__textarea"
          placeholder="Comente algo..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="1"
        />
        <img
          src="send.svg"
          className="post__send"
          onClick={() => {
            socket.emit("comment", props.postId, comment);
            setComment("");
          }}
        />
      </div>
    </div>
  );
}

export default Post;
