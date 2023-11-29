import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import socket from "../socket";

function NewPost(props) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="close" onClick={() => navigate(-1)} />
        <h1>Nova publicação</h1>
        <div className="top-bar__grow" />
        <Icon
          name="send"
          onClick={() => {
            setSending(true);
            socket.emit("post", content.trim(), (id, post) => {
              props.addPost(id, post);
              navigate(`/post/${id}`, { replace: true });
            });
          }}
          disabled={!content.trim() || sending}
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
