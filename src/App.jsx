import React from "react";
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

class App extends React.Component {
  state = {
    display: "Home",
    modal: null,
    users: {},
    posts: {},
    comments: {},
    postId: null,
  };
  postBodyRef = React.createRef();

  componentDidMount() {
    socket.on("add_users", (users) => {
      this.setState({ users: { ...this.state.users, ...users } });
    });

    socket.on("add_posts", (posts) => {
      this.setState({ posts: { ...this.state.posts, ...posts } });
      this.requestUnfetchedUsers(Object.values(posts));
    });

    socket.on("add_comments", (comments) => {
      // const pb = this.postBodyRef.current;
      // const lc = pb.lastElementChild;
      // let callback;

      // if (pb.clientHeight + pb.scrollTop > pb.scrollHeight - lc.offsetHeight) {
      //   callback = () => pb.scrollTo(0, pb.scrollHeight);
      // }

      this.setState({ comments: { ...this.state.comments, ...comments } });
      this.requestUnfetchedUsers(Object.values(comments));
    });

    socket.on("disconnect", () => {
      if (this.state.display !== "Home") {
        this.setState({ display: "Home", users: {}, posts: {}, postId: null });
      }
    });
  }

  requestUnfetchedUsers(articles) {
    const { users } = this.state;
    const unfetched = new Set(articles.map((a) => a.userId).filter((id) => !(id in users)));
    if (unfetched.size > 0) {
      socket.emit("get_users", Array.from(unfetched));
    }
  }

  render() {
    const { display, modal, users, posts, comments, postId } = this.state;
    const { postBodyRef } = this;

    return (
      <>
        {display === "Home" && (
          <Home
            onAuth={() => {
              socket.emit("get_data", (userId, user) => {
                storage.userId = userId;
                this.setState({ display: "Feed", users: { [userId]: user } });
              });
            }}
          />
        )}

        {display === "Feed" && (
          <Feed
            {...{ users, posts }}
            openSidebar={() => this.setState({ modal: "Sidebar" })}
            openNewPost={() => this.setState({ display: "NewPost" })}
            openPost={(postId) => {
              const fetchedComments = Object.entries(comments)
                .filter(([_, comment]) => comment.postId === postId)
                .map(([id]) => parseInt(id));

              socket.emit("get_comments", postId, fetchedComments);
              this.setState({ display: "Post", postId });
            }}
          />
        )}

        {display === "Post" && (
          <Post
            {...{ users, postId, postBodyRef }}
            post={posts[postId]}
            comments={Object.entries(comments).filter(([_, comment]) => comment.postId === postId)}
            onComment={(id, comment) => {
              // will this break if the user receives the message after leaving the post?
              const pb = postBodyRef.current;
              const callback = () => pb.scrollTo(0, pb.scrollHeight);
              this.setState({ comments: { ...comments, [id]: comment } }, callback);
            }}
            close={() => this.setState({ display: "Feed", postId: null })}
          />
        )}

        {display === "NewPost" && (
          <NewPost
            discard={() => this.setState({ display: "Feed" })}
            onPost={(id, post) => {
              this.setState({
                display: "Post",
                posts: { ...this.state.posts, [id]: post },
                postId: id,
              });
            }}
          />
        )}

        {display === "Settings" && (
          <Settings user={users[storage.userId]} close={() => this.setState({ display: "Feed" })} />
        )}

        <Sidebar
          open={modal === "Sidebar"}
          close={() => this.setState({ modal: null })}
          user={users[storage.userId]}
          openInstall={() => this.setState({ modal: "Install" })}
          share={() => {
            navigator.share({
              title: "Friendly",
              text: "Junte-se à melhor comunidade da internet",
              url: "https://kelio-mv.github.io/friendly/",
            });
          }}
          contact={() => window.open("https://www.instagram.com/kelio_mv/", "_blank")}
          openSettings={() => this.setState({ display: "Settings", modal: null })}
          logout={() => {
            socket.close();
            storage.deleteCredentials();
            this.setState({ display: "Home", modal: null });
          }}
        />

        <Install open={modal === "Install"} close={() => this.setState({ modal: null })} />
      </>
    );
  }
}

export default App;
