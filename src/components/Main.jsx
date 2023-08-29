import React from "react";
import Feed from "./Feed";
import Post from "./Post";
import NewPost from "./NewPost";
import socket from "../socket";

class Main extends React.Component {
  state = {
    display: "Feed",
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

    socket.emit("ready");
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
      case "Feed":
        return (
          <Feed
            {...{ users, posts }}
            displayPost={(postId) => this.setState({ display: "Post", postId })}
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
