import { useEffect, useRef, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Article from "./Article";
import Icon from "./Icon";
import Modal from "./Modal";
import storage from "../storage";
import socket from "../socket";

function Post(props) {
  const postId = parseInt(useParams().id);
  const post = props.posts.find((post) => post.id === postId);
  const comments = useMemo(
    () => props.comments.filter((comment) => comment.postId === postId),
    [props.comments]
  );
  const [comment, setComment] = useState("");
  const [unseenComments, setUnseenComments] = useState(0);
  const [scrollDown, setScrollDown] = useState(false);
  const [commentId, setCommentId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const postBodyRef = useRef();
  const commentsLength = useRef(comments.length);
  const textareaRef = useRef();
  const unseenElementRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (post) {
      const fetchedComments = comments.map((comment) => comment.id);
      socket.emit("get_comments", postId, fetchedComments);
    } else {
      navigate(-1);
    }
    return () => socket.emit("leave_room", postId);
  }, [post]);

  useEffect(() => {
    const difference = comments.length - commentsLength.current;

    if (difference > 0) {
      const pb = postBodyRef.current;

      if (scrollDown) {
        pb.scrollTo(0, pb.scrollHeight);
        setScrollDown(false);
      } else {
        if (pb.clientHeight < pb.scrollHeight) {
          setUnseenComments((puc) => puc + difference);
        }
      }
    }
    commentsLength.current = comments.length;
  }, [comments]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const unseen = unseenElementRef.current;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
    unseen.style.transform = `translateY(-${textarea.style.height})`;
  }, [comment]);

  function onScroll() {
    // Optional improvement: Dynamically decrease the value as comments are seen
    if (unseenComments > 0) {
      const pb = postBodyRef.current;
      const lc = pb.lastElementChild;
      if (pb.clientHeight + pb.scrollTop > pb.scrollHeight - lc.offsetHeight) {
        setUnseenComments(0);
      }
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
    socket.emit("create_comment", postId, comment.trim(), (comment) => {
      props.addComments([comment]);
      setScrollDown(true);
    });
    setComment("");
    textareaRef.current.focus();
  }

  function deleteArticle() {
    if (deleteConfirmation === "post") {
      socket.emit("del_post", postId);
    } else {
      socket.emit("del_comment", commentId);
    }
    setDeleteConfirmation(null);
  }

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="arrow_back" onClick={() => navigate(-1)} />
        <h1>Publicação</h1>
      </div>

      <div className="post__body" ref={postBodyRef} onScroll={onScroll}>
        {post && (
          <Article
            data={post}
            user={props.users[post.userId]}
            deletable={post.userId === storage.userId}
            delete={() => setDeleteConfirmation("post")}
            onProfileClick={() => navigate(`/profile/${post.userId}`)}
            highlight
          />
        )}
        {comments.map((comment) => (
          <Article
            key={comment.id}
            data={comment}
            user={props.users[comment.userId]}
            deletable={comment.userId === storage.userId}
            delete={() => {
              setCommentId(comment.id);
              setDeleteConfirmation("comment");
            }}
            onProfileClick={() => navigate(`/profile/${comment.userId}`)}
          />
        ))}
      </div>

      <div className="post__footer">
        <textarea
          className="post__textarea"
          ref={textareaRef}
          placeholder="Comente algo..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="1"
          maxLength="500"
          onKeyDown={onKeyDown}
        />
        <Icon name="send" onClick={sendComment} disabled={!comment.trim()} />
      </div>

      <div
        className="post__unseen-comments"
        ref={unseenElementRef}
        style={unseenComments === 0 ? { display: "none" } : {}}
      >
        {unseenComments}
      </div>

      <Modal
        open={deleteConfirmation !== null}
        header="Confirmar exclusão"
        footer={
          <button className="modal__btn" onClick={deleteArticle}>
            Sim
          </button>
        }
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
