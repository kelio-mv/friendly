import { useState } from "react";
import socket from "../socket";

function NewPost(props) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <div className="flex-page">
      <div className="top-bar">
        <img src="cancel.svg" onClick={props.discard} />
        <h1>Nova publicação</h1>
        <div className="top-bar__grow"></div>
        <img
          src="send.svg"
          className={(!content.trim() || sending) && "new-post__send--disabled"}
          onClick={() => {
            setSending(true);
            socket.emit("post", content.trim());
          }}
        />
      </div>

      <textarea
        className="new-post__textarea"
        placeholder="Escreva algo..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength="1000"
      />
    </div>
  );
}

export default NewPost;
