import { useEffect, useRef, useState } from "react";
import Article from "./Article";
import Icon from "./Icon";
import socket from "../socket";

function Post(props) {
  const [comment, setComment] = useState("");
  const commentRef = useRef();

  useEffect(() => {
    const comment = commentRef.current;
    comment.style.height = "auto";
    comment.style.height = comment.scrollHeight + "px";
  }, [comment]);

  function onKeyDown(e) {
    // Send the comment when a desktop user presses Enter
    if ("ontouchstart" in document.documentElement) {
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendComment();
    }
  }

  function sendComment() {
    socket.emit("comment", props.postId, comment.trim());
    setComment("");
    commentRef.current.focus();
  }

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="arrow_back" onClick={props.close} />
        <h1>Publicação</h1>
      </div>

      <div className="post__body" ref={props.postBodyRef}>
        <Article data={props.post} user={props.users[props.post.userId]} />
        {props.post.comments.map((comment, i) => (
          <Article key={i} data={comment} user={props.users[comment.userId]} />
        ))}
      </div>

      <div className="post__footer">
        <textarea
          className="post__textarea"
          ref={commentRef}
          placeholder="Comente algo..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="1"
          maxLength="500"
          onKeyDown={onKeyDown}
        />
        <Icon name="send" onClick={sendComment} disabled={!comment.trim()} />
      </div>
    </div>
  );
}

export default Post;
