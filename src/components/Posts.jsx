import { useNavigate } from "react-router-dom";
import useScrollRestoration from "../useScrollRestoration";
import Article from "./Article";

function Posts(props) {
  const navigate = useNavigate();
  const postBodyRef = useScrollRestoration();

  return (
    <div className="posts__body" ref={postBodyRef}>
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
