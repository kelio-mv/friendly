import { useEffect, useRef, useState } from "react";
import Article from "./Article";
import Icon from "./Icon";
import Modal from "./Modal";
import ModalButton from "./ModalButton";
import storage from "../storage";
import socket from "../socket";

function Post(props) {
  const [comment, setComment] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [confirmDeletion, setConfirmDeletion] = useState(null);
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
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="arrow_back" onClick={props.close} />
        <h1>Publicação</h1>
      </div>

      <div className="post__body" ref={props.postBodyRef}>
        <Article
          data={props.post}
          user={props.users[props.post.userId]}
          delete={props.post.userId === storage.userId ? () => setConfirmDeletion("post") : null}
        />
        {props.comments.map(([id, comment]) => (
          <Article
            key={id}
            data={comment}
            user={props.users[comment.userId]}
            delete={
              comment.userId === storage.userId
                ? () => {
                    setConfirmDeletion("comment");
                    setSelectedComment(id);
                  }
                : null
            }
          />
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
        open={confirmDeletion !== null}
        header="Confirmar exclusão"
        footer={
          <ModalButton
            onClick={() => {
              socket.emit(
                confirmDeletion === "post" ? "del_post" : "del_comment",
                confirmDeletion === "post" ? props.postId : selectedComment
              );
              setConfirmDeletion(null);
            }}
          >
            Sim
          </ModalButton>
        }
        close={() => setConfirmDeletion(null)}
      >
        {`Você tem certeza que quer apagar este ${
          confirmDeletion === "post" ? "post" : "comentário"
        }?`}
      </Modal>
    </div>
  );
}

export default Post;
