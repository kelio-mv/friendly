import { useState, useEffect, useRef } from "react";
import Home from "./components/Home";
import Feed from "./components/Feed";
import Sidebar from "./components/Sidebar";
import Post from "./components/Post";
import NewPost from "./components/NewPost";
import Install from "./components/Install";
import Settings from "./components/Settings";
import storage from "./storage";
import socket from "./socket";
import "./App.scss";

function App() {
  const [display, setDisplay] = useState("Home");
  const [modal, setModal] = useState(null);
  const [users, setUsers] = useState({});
  const [posts, setPosts] = useState({});
  const [comments, setComments] = useState({});
  const [postId, setPostId] = useState(null);
  const [unseenComments, setUnseenComments] = useState(0);
  const postBodyRef = useRef();

  useEffect(() => {
    socket.on("add_users", addUsers);
    socket.on("add_posts", addPosts);
    socket.on("add_comments", addComments);
    socket.on("del_post", delPost);
    socket.on("del_comment", delComment);

    return () => {
      socket.off("add_users");
      socket.off("add_posts");
      socket.off("add_comments");
      socket.off("del_post");
      socket.off("del_comment");
    };
  }, [users, postId]);

  function addUsers(users) {
    setUsers((prevUsers) => ({ ...prevUsers, ...users }));
  }

  function addPosts(posts) {
    setPosts((prevPosts) => ({ ...prevPosts, ...posts }));
    requestUnfetchedUsers(Object.values(posts));
  }

  function addComments(comments) {
    let callback;
    if (postId === comments[Object.keys(comments)[0]].postId) {
      const pb = postBodyRef.current;
      const lc = pb.lastElementChild;
      if (pb.clientHeight + pb.scrollTop > pb.scrollHeight - lc.offsetHeight) {
        callback = () => pb.scrollTo(0, pb.scrollHeight);
      } else {
        setUnseenComments((prevUnseenComments) => prevUnseenComments + 1);
      }
    }
    setComments((prevComments) => ({ ...prevComments, ...comments }));
    requestUnfetchedUsers(Object.values(comments));
    if (callback) setTimeout(callback);
  }

  function delPost(_postId) {
    if (postId === _postId) {
      setDisplay("Feed");
      setPostId(null);
    }
    setPosts((prevPosts) => {
      const posts = { ...prevPosts };
      delete posts[_postId];
      return posts;
    });
    setComments((prevComments) => {
      const comments = { ...prevComments };
      for (const id in comments) {
        if (comments[id].postId === _postId) delete comments[id];
      }
      return comments;
    });
  }

  function delComment(commentId) {
    setComments((prevComments) => {
      const comments = { ...prevComments };
      delete comments[commentId];
      return comments;
    });
  }

  function requestUnfetchedUsers(articles) {
    const unfetched = new Set(articles.map((a) => a.userId).filter((id) => !(id in users)));
    if (unfetched.size > 0) socket.emit("get_users", Array.from(unfetched));
  }

  return (
    <>
      {display === "Home" && (
        <Home
          onAuth={() => {
            socket.emit("get_data", (userId, user) => {
              storage.userId = userId;
              setUsers({ [userId]: user });
              setDisplay("Feed");
            });
          }}
          onReauth={() => socket.emit("get_posts")}
          onReauthError={() => {
            setModal(null);
            setDisplay("Home");
          }}
        />
      )}

      {display === "Feed" && (
        <Feed
          {...{ users, posts }}
          openSidebar={() => setModal("Sidebar")}
          openNewPost={() => setDisplay("NewPost")}
          openPost={(postId) => {
            const fetchedComments = Object.entries(comments)
              .filter(([_, comment]) => comment.postId === postId)
              .map(([id]) => parseInt(id));

            socket.emit("get_comments", postId, fetchedComments);
            setDisplay("Post");
            setPostId(postId);
          }}
        />
      )}

      {display === "Post" && (
        <Post
          {...{ users, postId, unseenComments, postBodyRef }}
          post={posts[postId]}
          comments={Object.entries(comments).filter(([_, comment]) => comment.postId === postId)}
          onComment={(id, comment) => {
            setComments((prevComments) => ({ ...prevComments, [id]: comment }));
            const pb = postBodyRef.current;
            if (pb) setTimeout(() => pb.scrollTo(0, pb.scrollHeight));
          }}
          onSeeLastComment={() => setUnseenComments(0)}
          close={() => {
            setDisplay("Feed");
            setPostId(null);
            setUnseenComments(0);
          }}
        />
      )}

      {display === "NewPost" && (
        <NewPost
          discard={() => setDisplay("Feed")}
          onPost={(id, post) => {
            setPosts((prevPosts) => ({ ...prevPosts, [id]: post }));
            setPostId(id);
            setDisplay("Post");
          }}
        />
      )}

      {display === "Settings" && (
        <Settings user={users[storage.userId]} close={() => setDisplay("Feed")} />
      )}

      {modal === "Sidebar" && (
        <Sidebar
          close={() => setModal(null)}
          user={users[storage.userId]}
          openInstall={() => setModal("Install")}
          share={() => {
            navigator.share({
              title: "Friendly",
              text: "Conheça o Friendly, um lugar para desabafar e fazer amigos!",
              url: "https://kelio-mv.github.io/friendly/",
            });
          }}
          contact={() => window.open("https://www.instagram.com/kelio_mv/", "_blank")}
          openSettings={() => {
            setDisplay("Settings");
            setModal(null);
          }}
          logout={() => {
            storage.deleteCredentials();
            socket.off("disconnect");
            socket.close();
            setModal(null);
            setDisplay("Home");
          }}
        />
      )}

      {modal === "Install" && <Install close={() => setModal(null)} />}
    </>
  );
}

export default App;
