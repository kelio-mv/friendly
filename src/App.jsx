import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Feed from "./components/Feed";
import Post from "./components/Post";
import Chats from "./components/Chats";
import NewPost from "./components/NewPost";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Sidebar from "./components/Sidebar";
import Install from "./components/Install";
import storage from "./storage";
import socket from "./socket";
import "./App.scss";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [modal, setModal] = useState(null);
  const [users, setUsers] = useState({});
  const [posts, setPosts] = useState({});
  const [comments, setComments] = useState({});
  const [chats, setChats] = useState({});

  useEffect(() => {
    socket.on("add_users", addUsers);
    socket.on("add_posts", addPosts);
    socket.on("add_comments", addComments);
    socket.on("del_post", delPost);
    socket.on("del_comments", delComments);
    socket.on("update_user", updateUser);

    return () => {
      socket.off("add_users");
      socket.off("add_posts");
      socket.off("add_comments");
      socket.off("del_post");
      socket.off("del_comment");
      socket.off("update_user");
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

  function delComments(commentIds) {
    setComments((prevComments) => {
      const comments = { ...prevComments };
      commentIds.forEach((commentId) => delete comments[commentId]);
      return comments;
    });
  }

  function updateUser(userId) {
    if (userId in users) socket.emit("get_users", [userId]);
  }

  function requestUnfetchedUsers(articles) {
    const unfetched = new Set(articles.map((a) => a.userId).filter((id) => !(id in users)));
    if (unfetched.size > 0) socket.emit("get_users", Array.from(unfetched));
  }

  function resetState() {
    setUsers({});
    setPosts({});
    setComments({});
    setChats({});
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
              onReauth={() => {
                /* dynamic post loading */
              }}
              onReauthError={resetState}
            />
          }
        />
        <Route path="*" element={<Navigate to="/ " replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Feed {...{ users, posts }} openSidebar={() => setModal("Sidebar")} />}
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

        <Route path="chats" element={<Chats />} />

        <Route
          path="new-post"
          element={
            <NewPost
              addPost={(id, post) => setPosts((prevPosts) => ({ ...prevPosts, [id]: post }))}
            />
          }
        />

        <Route path="profile/:id" element={<Profile {...{ users, posts }} />} />

        <Route path="settings" element={<Settings user={users[storage.userId]} />} />
      </Routes>

      {modal === "Sidebar" && (
        <Sidebar
          close={() => setModal(null)}
          user={users[storage.userId]}
          openInstall={() => setModal("Install")}
          onLogout={resetState}
        />
      )}

      {modal === "Install" && <Install close={() => setModal(null)} />}
    </>
  );
}

export default App;
