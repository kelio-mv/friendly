import React from "react";
import Home from "./components/Home";
import Feed from "./components/Feed";
import Post from "./components/Post";
import NewPost from "./components/NewPost";
import socket from "./socket";
import "./App.scss";

class Main extends React.Component {
  state = {
    display: "Home",
    users: {},
    posts: [],
    postId: null,
  };

  componentDidMount() {
    socket.on("set_posts", (posts) => {
      this.setState({ posts });
      this.requestMissingUsers(posts);
    });

    socket.on("add_post", (post) => {
      this.setState({ posts: [...this.state.posts, post] });
      this.requestMissingUsers([post]);
    });

    socket.on("add_users", (users) => {
      this.setState({ users: { ...this.state.users, ...users } });
    });

    socket.on("add_post_response", (post) => {
      this.setState({
        display: "Post",
        posts: [...this.state.posts, post],
        postId: this.state.posts.length,
      });
    });
  }

  requestMissingUsers(posts) {
    const { users } = this.state;
    const missingUsers = new Set();

    posts.forEach((post) => {
      // if (post === null) return;
      if (!(post.uid in users)) {
        missingUsers.add(post.uid);
      }
      post.comments.forEach((comment) => {
        // if (comment === null) return;
        if (!(comment.uid in users)) {
          missingUsers.add(comment.uid);
        }
      });
    });
    if (missingUsers.size > 0) {
      socket.emit("get_users", Array.from(missingUsers));
    }
  }

  render() {
    const { display, users, posts, postId } = this.state;

    switch (display) {
      case "Home":
        return (
          <Home onAuth={() => this.setState({ display: "Feed" }, () => socket.emit("ready"))} />
        );

      case "Feed":
        return (
          <Feed
            {...{ users, posts }}
            openPost={(postId) => this.setState({ display: "Post", postId })}
            newPost={() => this.setState({ display: "NewPost" })}
          />
        );

      case "Post":
        return (
          <Post
            users={users}
            post={posts[postId]}
            close={() => this.setState({ display: "Feed", postId: null })}
          />
        );

      case "NewPost":
        return <NewPost discard={() => this.setState({ display: "Feed" })} />;
    }
  }
}

export default Main;

// Adicionar aviso de "estado de desenvolvimento"
// Adicionar convite de feedback
// Avatar ou imagem?
// Impedir usuário de logar quando já estiver online
// Comentários
// Botão sair
