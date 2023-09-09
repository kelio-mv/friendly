import Article from "./Article";
import Icon from "./Icon";

function Feed(props) {
  const posts = props.posts.slice().reverse();

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="menu" onClick={props.openSidebar} />
        <h1>Recentes</h1>
        <div className="top-bar__grow"></div>
        <Icon name="add_circle" onClick={props.openNewPost} />
      </div>

      <div className="feed__body">
        {posts.map(
          (post, i) =>
            post && (
              <Article
                key={i}
                data={post}
                user={props.users[post.userId]}
                onClick={() => props.openPost(posts.length - 1 - i)}
              />
            )
        )}
      </div>
    </div>
  );
}

export default Feed;
