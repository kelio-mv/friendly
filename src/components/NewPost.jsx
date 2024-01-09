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
        <Icon name="close" onClick={() => navigate(-1)} invert />
        <h1>Nova publicação</h1>
        <div className="top-bar__grow" />
        <Icon
          name="send"
          onClick={() => {
            setSending(true);
            socket.emit("create_post", content.trim(), (post) => {
              props.addPosts([post]);
              navigate(`/post/${post.id}`, { replace: true });
            });
          }}
          disabled={!content.trim() || sending}
          invert
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
