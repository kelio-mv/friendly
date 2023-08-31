import { useEffect, useRef, useState } from "react";
import Article from "./Article";
import socket from "../socket";

function Post(props) {
  const [comment, setComment] = useState("");
  const commentRef = useRef();

  useEffect(() => {
    const comment = commentRef.current;
    comment.style.height = "auto";
    comment.style.height = comment.scrollHeight + "px";
  }, [comment]);

  return (
    <div className="flex-page">
      <div className="top-bar">
        <img src="back.svg" onClick={props.close} />
        <h1>Publicação</h1>
      </div>

      <div className="post__body">
        <Article data={props.post} user={props.users[props.post.uid]} />
        {props.post.comments.map((comment, i) => (
          <Article key={i} data={comment} user={props.users[comment.uid]} />
        ))}
      </div>

      <div className="post__footer">
        <textarea
          ref={commentRef}
          className="post__textarea"
          placeholder="Comente algo..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="1"
          maxLength="500"
        />
        <img
          src="send.svg"
          className={`post__send ${comment.trim() ? "" : "post__send--disabled"}`}
          onClick={() => {
            socket.emit("comment", props.postId, comment.trim());
            setComment("");
          }}
        />
      </div>
    </div>
  );
}

export default Post;
