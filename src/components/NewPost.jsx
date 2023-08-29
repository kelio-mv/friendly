import { useState } from "react";
import socket from "../socket";
import "./NewPost.scss";

function NewPost(props) {
  const [content, setContent] = useState("");

  function sendPost() {
    socket.emit("add_post", content);
  }

  return (
    <div className="new-post">
      <div className="top-bar">
        <img src="cancel.svg" onClick={props.discard} />
        <h1>Nova publicação</h1>
        <div className="top-bar__grow"></div>
        <img src="send.svg" onClick={sendPost} />
      </div>

      <textarea
        className="new-post__textarea"
        placeholder="Escreva algo..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
}

export default NewPost;
