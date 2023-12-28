import { useNavigate } from "react-router-dom";
import Article from "./Article";

function Posts(props) {
  const navigate = useNavigate();

  return (
    <div className="posts__body">
      {props.posts.map((post) => (
        <Article
          key={post.id}
          data={post}
          user={props.users[post.authorId]}
          onClick={() => navigate(`post/${post.id}`)}
          truncate
        />
      ))}
    </div>
  );
}

export default Posts;
