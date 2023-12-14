import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Feed from "./components/Feed";
import Post from "./components/Post";
import NewPost from "./components/NewPost";
import Chats from "./components/Chats";
import Chat from "./components/Chat";
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
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("add_users", addUsers);
    socket.on("add_posts", addPosts);
    socket.on("add_comments", addComments);
    socket.on("add_chats", addChats);
    socket.on("add_messages", addMessages);
    socket.on("del_post", delPost);
    socket.on("del_comments", delComments);
    socket.on("del_chat", delChat);
    socket.on("update_user", updateUser);
  }, []);

  function onAuth() {
    socket.emit("get_data", (user) => {
      storage.userId = user.id;
      setUsers({ [user.id]: user });
      setAuthenticated(true);
    });
  }

  function addUsers(users) {
    setUsers((prevUsers) => ({
      ...prevUsers,
      ...Object.fromEntries(users.map((user) => [user.id, user])),
    }));
  }

  function addPosts(posts) {
    setPosts((prevPosts) => [...prevPosts, ...posts].sort((a, b) => b.id - a.id));
    requestUnfetchedUsers(posts.map((post) => post.authorId));
  }

  function addComments(comments) {
    setComments((prevComments) => [...prevComments, ...comments]);
    requestUnfetchedUsers(comments.map((comment) => comment.authorId));
  }

  function addChats(chats) {
    setChats((prevChats) => [...prevChats, ...chats]);
    requestUnfetchedUsers(chats.map((chat) => chat.interlocutorId));
  }

  function addMessages(messages) {
    setMessages((prevMessages) => [...prevMessages, ...messages].sort((a, b) => a.id - b.id));
  }

  function delPost(id) {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    setComments((prevComments) => prevComments.filter((comment) => comment.postId !== id));
  }

  function delComments(ids) {
    setComments((prevComments) => prevComments.filter((comment) => !ids.includes(comment.id)));
  }

  function delChat(interlocutorId) {
    setChats((prevChats) => prevChats.filter((chat) => chat.interlocutorId !== interlocutorId));
    setMessages((prevMessages) =>
      prevMessages.filter(
        (message) => !(message.senderId === interlocutorId || message.receiverId === interlocutorId)
      )
    );
  }

  function updateUser(id) {
    setUsers((users) => {
      if (id in users) socket.emit("get_users", [id]);
      return users;
    });
  }

  function requestUnfetchedUsers(ids) {
    setUsers((users) => {
      const unfetched = new Set(ids.filter((id) => !(id in users)));
      if (unfetched.size > 0) socket.emit("get_users", Array.from(unfetched));
      return users;
    });
  }

  function resetState() {
    setUsers({});
    setPosts([]);
    setComments([]);
    setChats([]);
    setMessages([]);
    setModal(null);
    setAuthenticated(false);
  }

  if (!authenticated) {
    return (
      <Routes>
        <Route
          path="/"
          element={<Home onAuth={onAuth} onReauth={() => {}} onReauthError={resetState} />}
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

        <Route path="post/:id" element={<Post {...{ users, posts, comments, addComments }} />} />

        <Route path="new-post" element={<NewPost addPosts={addPosts} />} />

        <Route path="chats" element={<Chats {...{ users, chats, messages }} />} />

        <Route path="chat/:id" element={<Chat {...{ users, chats, messages, addMessages }} />} />

        <Route path="profile/:id" element={<Profile {...{ users, posts, chats }} />} />

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
