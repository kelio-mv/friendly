import { useEffect, useRef, useState } from "react";
import Article from "./Article";
import Icon from "./Icon";
import Modal from "./Modal";
import ModalButton from "./ModalButton";
import storage from "../storage";
import socket from "../socket";

function Post(props) {
  const [comment, setComment] = useState("");
  const [commentId, setCommentId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const commentRef = useRef();

  useEffect(() => {
    const comment = commentRef.current;
    comment.style.height = "auto";
    comment.style.height = comment.scrollHeight + "px";
  }, [comment]);

  function onScroll() {
    if (props.newComments === 0) return;
    // Esta função está prejudicando o desempenho em dispositivos móveis
    const pb = props.postBodyRef.current;
    const lc = pb.lastElementChild;

    if (pb.clientHeight + pb.scrollTop > pb.scrollHeight - lc.offsetHeight) {
      props.resetNewComments();
    }
  }

  function onKeyDown(e) {
    if ("ontouchstart" in document.documentElement) return;
    // Send the comment when a desktop user presses Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (comment.trim()) sendComment();
    }
  }

  function sendComment() {
    socket.emit("comment", props.postId, comment.trim(), props.onComment);
    setComment("");
    commentRef.current.focus();
  }

  function deleteArticle() {
    if (deleteConfirmation === "post") {
      socket.emit("del_post", props.postId);
    } else {
      socket.emit("del_comment", commentId);
    }
    setDeleteConfirmation(null);
  }

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="arrow_back" onClick={props.close} />
        <h1>Publicação</h1>
      </div>

      <div className="post__body" ref={props.postBodyRef} onScroll={onScroll}>
        <Article
          data={props.post}
          user={props.users[props.post.userId]}
          deletable={props.post.userId === storage.userId}
          delete={() => setDeleteConfirmation("post")}
        />
        {props.comments.map(([id, comment]) => (
          <Article
            key={id}
            data={comment}
            user={props.users[comment.userId]}
            deletable={comment.userId === storage.userId}
            delete={() => {
              setCommentId(id);
              setDeleteConfirmation("comment");
            }}
          />
        ))}
        {props.newComments > 0 && <div className="post__new-comments">{props.newComments}</div>}
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
        open={deleteConfirmation !== null}
        header="Confirmar exclusão"
        footer={<ModalButton onClick={deleteArticle}>Sim</ModalButton>}
        close={() => setDeleteConfirmation(null)}
      >
        {`Você tem certeza que deseja apagar este ${
          deleteConfirmation === "post" ? "post" : "comentário"
        }?`}
      </Modal>
    </div>
  );
}

export default Post;
