import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useScrollRestoration from "../useScrollRestoration";
import Article from "./Article";
import Icon from "./Icon";
import Modal from "./Modal";
import TextArea from "./TextArea";
import credentials from "../credentials";
import socket from "../socket";

function Post(props) {
  const postId = parseInt(useParams().id);
  const post = props.posts.find((post) => post.id === postId);
  const comments = props.comments.filter((comment) => comment.postId === postId);
  const [unviewedComments, setUnviewedComments] = useState(0);
  const [commentId, setCommentId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const postBodyRef = useScrollRestoration();
  const scrollDown = useRef(false);
  const commentsLength = useRef(comments.length);
  const unviewedElemRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (!post) navigate(-1);
  }, [post]);

  useEffect(() => {
    const difference = comments.length - commentsLength.current;
    const pb = postBodyRef.current;
    commentsLength.current = comments.length;

    if (difference > 0) {
      if (scrollDown.current) {
        pb.scrollTo(0, pb.scrollHeight);
        scrollDown.current = false;
      } else if (pb.clientHeight < pb.scrollHeight) {
        setUnviewedComments((puc) => puc + difference);
      }
    }
  }, [props.comments]);

  function onScroll() {
    if (unviewedComments > 0) {
      const pb = postBodyRef.current;
      const lc = pb.lastElementChild;
      if (pb.clientHeight + pb.scrollTop > pb.scrollHeight - lc.offsetHeight) {
        setUnviewedComments(0);
      }
    }
  }

  function sendComment(content) {
    socket.emit("create_comment", postId, content, (comment) => {
      props.addComments([comment]);
      scrollDown.current = true;
    });
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
        <Icon name="arrow_back" onClick={() => navigate(-1)} invert />
        <h1>Publicação</h1>
        <div className="top-bar__grow" />
        {post && post.authorId === credentials.userId && (
          <Icon name="delete" onClick={() => setDeleteConfirmation("post")} invert />
        )}
      </div>

      <div className="post__body" ref={postBodyRef} onScroll={onScroll}>
        {post && (
          <Article
            data={post}
            user={props.users[post.authorId]}
            onProfileClick={() => navigate(`/profile/${post.authorId}`)}
            highlight
          />
        )}
        {comments.map((comment) => (
          <Article
            key={comment.id}
            data={comment}
            user={props.users[comment.authorId]}
            deletable={comment.authorId === credentials.userId}
            delete={() => {
              setCommentId(comment.id);
              setDeleteConfirmation("comment");
            }}
            onProfileClick={() => navigate(`/profile/${comment.authorId}`)}
          />
        ))}
      </div>

      <TextArea
        placeholder="Comente algo..."
        onHeightChange={(height) => {
          unviewedElemRef.current.style.transform = `translateY(-${height})`;
        }}
        send={sendComment}
      />

      <div
        className="unviewed"
        ref={unviewedElemRef}
        style={unviewedComments === 0 ? { display: "none" } : {}}
      >
        {unviewedComments}
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
