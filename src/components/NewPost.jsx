import { useState } from "react";
import socket from "../socket";

function NewPost(props) {
  const [content, setContent] = useState("");

  return (
    <div className="flex-page">
      <div className="top-bar">
        <img src="cancel.svg" onClick={props.discard} />
        <h1>Nova publicação</h1>
        <div className="top-bar__grow"></div>
        <img src="send.svg" onClick={() => socket.emit("post", content)} />
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
