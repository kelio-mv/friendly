import Article from "./Article";
import Icon from "./Icon";

function Feed(props) {
  const posts = Object.entries(props.posts).sort((a, b) => b[0] - a[0]);

  return (
    <div className="flex-page">
      <div className="top-bar">
        <Icon name="menu" onClick={props.openSidebar} />
        <h1>Recentes</h1>
        <div className="top-bar__grow" />
        <Icon name="add_circle" onClick={props.openNewPost} />
      </div>

      <div className="feed__body">
        {posts.map(([id, post]) => (
          <Article
            key={id}
            data={post}
            user={props.users[post.userId]}
            onClick={() => props.openPost(parseInt(id))}
            truncate
          />
        ))}
      </div>
    </div>
  );
}

export default Feed;

// A função sort está sendo executada sempre que o componente atualiza
