import { useEffect, useRef, useState } from "react";
import Article from "./Article";
import Icon from "./Icon";
import Modal from "./Modal";
import ModalButton from "./ModalButton";
import storage from "../storage";
import socket from "../socket";

function Post(props) {
  const [comment, setComment] = useState("");
  const [confirmDeletion, setConfirmDeletion] = useState(null);
  const [deleting, setDeleting] = useState(false);
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
    setComment("");
    socket.emit("comment", props.postId, comment.trim(), (id, comment) => {
      props.onComment(id, comment);
    });
    commentRef.current.focus();
  }

  return (
    <div className="flex-page" style={deleting ? { pointerEvents: "none" } : {}}>
      <div className="top-bar">
        <Icon name="arrow_back" onClick={props.close} />
        <h1>Publicação</h1>
        <div className="top-bar__grow"></div>
        {props.post.userId === storage.userId && (
          <Icon name="delete" onClick={() => setConfirmDeletion("post")} />
        )}
      </div>

      <div className="post__body" ref={props.postBodyRef}>
        <Article data={props.post} user={props.users[props.post.userId]} />
        {props.comments.map(([id, comment]) => (
          <Article key={id} data={comment} user={props.users[comment.userId]} />
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

      <Modal
        open={confirmDeletion}
        header="Confirmar exclusão"
        footer={
          <ModalButton
            onClick={() => {
              setDeleting(true);
              socket.emit("del_post", props.postId);
            }}
            disabled={deleting}
          >
            Sim
          </ModalButton>
        }
        close={() => setConfirmDeletion(null)}
      >
        Você tem certeza que quer apagar o seu post?
      </Modal>
    </div>
  );
}

export default Post;
