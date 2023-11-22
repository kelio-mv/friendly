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
  const [newComments, setNewComments] = useState(0);
  const postBodyRef = useRef();

  useEffect(() => {
    socket.on("add_users", (users) => {
      setUsers((prevUsers) => ({ ...prevUsers, ...users }));
    });

    socket.on("add_posts", (posts) => {
      setPosts((prevPosts) => ({ ...prevPosts, ...posts }));
      requestUnfetchedUsers(Object.values(posts));
    });

    socket.on("add_comments", (comments) => {
      let callback;

      if (postId === comments[Object.keys(comments)[0]].postId) {
        const pb = postBodyRef.current;
        const lc = pb.lastElementChild;
        if (pb.clientHeight + pb.scrollTop > pb.scrollHeight - lc.offsetHeight) {
          callback = () => pb.scrollTo(0, pb.scrollHeight);
        } else {
          setNewComments((prevNewComments) => prevNewComments + 1);
        }
      }
      setComments((prevComments) => ({ ...prevComments, ...comments }));
      requestUnfetchedUsers(Object.values(comments));
      if (callback) setTimeout(callback);
    });

    socket.on("del_post", (_postId) => {
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
    });

    socket.on("del_comment", (commentId) => {
      setComments((prevComments) => {
        const comments = { ...prevComments };
        delete comments[commentId];
        return comments;
      });
    });

    // Make sure to remove all previous listeners on update
    // Deps must only have variables that you need their current state
    return () => {
      socket.off("add_users");
      socket.off("add_posts");
      socket.off("add_comments");
      socket.off("del_post");
      socket.off("del_comment");
    };
  }, [users, postId]);

  function requestUnfetchedUsers(articles) {
    const unfetched = new Set(articles.map((a) => a.userId).filter((id) => !(id in users)));
    if (unfetched.size > 0) socket.emit("get_users", Array.from(unfetched));
  }

  return (
    <>
      {display === "Home" && (
        <Home
          onAuth={() => {
            // Get user data on first connection
            if (storage.userId === null) {
              socket.emit("get_data", (userId, user) => {
                storage.userId = userId;
                setDisplay("Feed");
                setUsers({ [userId]: user });
              });
            }
            socket.emit("get_posts");
          }}
          onAuthError={() => {
            // Return to Home if auth fails on reconnect
            if (storage.userId !== null) setDisplay("Home");
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
          {...{ users, postId, newComments, postBodyRef }}
          post={posts[postId]}
          comments={Object.entries(comments).filter(([_, comment]) => comment.postId === postId)}
          onComment={(id, comment) => {
            setComments((prevComments) => ({ ...prevComments, [id]: comment }));
            const pb = postBodyRef.current;
            if (pb) setTimeout(() => pb.scrollTo(0, pb.scrollHeight));
          }}
          resetNewComments={() => setNewComments(0)}
          close={() => {
            setDisplay("Feed");
            setPostId(null);
            setNewComments(0);
          }}
        />
      )}

      {display === "NewPost" && (
        <NewPost
          discard={() => setDisplay("Feed")}
          onPost={(id, post) => {
            setDisplay("Post");
            setPosts((prevPosts) => ({ ...prevPosts, [id]: post }));
            setPostId(id);
          }}
        />
      )}

      {display === "Settings" && (
        <Settings user={users[storage.userId]} close={() => setDisplay("Feed")} />
      )}

      <Sidebar
        open={modal === "Sidebar"}
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
          socket.off("disconnect");
          socket.close();
          storage.deleteCredentials();
          setDisplay("Home");
          setModal(null);
        }}
      />

      <Install open={modal === "Install"} close={() => setModal(null)} />
    </>
  );
}

export default App;
