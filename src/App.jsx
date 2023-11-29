import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
  const [authenticated, setAuthenticated] = useState(false);
  const [modal, setModal] = useState(null);
  const [users, setUsers] = useState({});
  const [posts, setPosts] = useState({});
  const [comments, setComments] = useState({});
  const navigate = useNavigate();

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
  }, [users]);

  function addUsers(users) {
    setUsers((prevUsers) => ({ ...prevUsers, ...users }));
  }

  function addPosts(posts) {
    setPosts((prevPosts) => ({ ...prevPosts, ...posts }));
    requestUnfetchedUsers(Object.values(posts));
  }

  function addComments(comments) {
    setComments((prevComments) => ({ ...prevComments, ...comments }));
    requestUnfetchedUsers(Object.values(comments));
  }

  function delPost(postId) {
    setPosts((prevPosts) => {
      const posts = { ...prevPosts };
      delete posts[postId];
      return posts;
    });
    setComments((prevComments) => {
      const comments = { ...prevComments };
      for (const id in comments) {
        if (comments[id].postId === postId) delete comments[id];
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

  function resetState() {
    setUsers({});
    setPosts({});
    setComments({});
    setModal(null);
    setAuthenticated(false);
  }

  if (!authenticated) {
    return (
      <Routes>
        <Route
          path="/"
          element={
            <Home
              onAuth={() => {
                socket.emit("get_data", (userId, user) => {
                  storage.userId = userId;
                  setUsers({ [userId]: user });
                  setAuthenticated(true);
                });
              }}
              onReauth={() => socket.emit("get_posts")}
              onReauthError={resetState}
            />
          }
        />
        <Route path="*" element={<Navigate to="/ " />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Feed
              {...{ users, posts }}
              openSidebar={() => setModal("Sidebar")}
              openNewPost={() => navigate("new-post")}
              openPost={(id) => navigate(`post/${id}`)}
            />
          }
        />

        <Route
          path="post/:id"
          element={
            <Post
              {...{ users, posts, comments }}
              addComment={(id, comment) => {
                setComments((prevComments) => ({ ...prevComments, [id]: comment }));
              }}
            />
          }
        />

        <Route
          path="new-post"
          element={
            <NewPost
              discard={() => navigate(-1)}
              onPost={(id, post) => {
                setPosts((prevPosts) => ({ ...prevPosts, [id]: post }));
                navigate(`post/${id}`, { replace: true });
              }}
            />
          }
        />

        <Route
          path="settings"
          element={<Settings user={users[storage.userId]} close={() => navigate(-1)} />}
        />
      </Routes>

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
            setModal(null);
            navigate("settings");
          }}
          logout={() => {
            storage.deleteCredentials();
            socket.off("disconnect");
            socket.close();
            resetState();
          }}
        />
      )}

      {modal === "Install" && <Install close={() => setModal(null)} />}
    </>
  );
}

export default App;
