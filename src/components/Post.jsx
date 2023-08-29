import Article from "./Article";

function Post(props) {
  const user = props.users[props.post.uid];

  return (
    <div>
      <div className="top-bar">
        <img src="back.svg" onClick={props.close} />
        <h1>Post de @{user.name}</h1>
      </div>
      <Article data={props.post} user={user} />
    </div>
  );
}

export default Post;
