import ProfilePicture from "./ProfilePicture";
import Icon from "./Icon";
import "./Article.scss";

function Article(props) {
  const user = props.user || { username: "...", profilePicture: "loading_pfp.png" };
  const truncate = {
    display: "-webkit-box",
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 3,
  };

  function parseTime(time) {
    const elapsed = new Date() / 1000 - time;

    if (elapsed < 60) return "há poucos segundos";
    if (elapsed < 120) return "há 1 minuto";
    if (elapsed < 3600) return `há ${Math.floor(elapsed / 60)} minutos`;
    if (elapsed < 7200) return "há 1 hora";
    if (elapsed < 86400) return `há ${Math.floor(elapsed / 3600)} horas`;
    if (elapsed < 172800) return "há 1 dia";
    return `há ${Math.floor(elapsed / 86400)} dias`;
  }

  return (
    <article
      className={`article ${props.highlight ? "article--highlight" : ""}`}
      onClick={props.onClick}
    >
      <header className="article__header">
        <ProfilePicture src={user.profilePicture} onClick={props.onProfileClick} size={48} />
        <div>
          <p
            onClick={props.onProfileClick}
            style={props.onProfileClick ? { cursor: "pointer" } : null}
          >
            @{user.username}
          </p>
          <p className="article__date">{parseTime(props.data.timestamp)}</p>
        </div>
        <div className="article__grow" />
        {props.deletable && <Icon name="delete" onClick={props.delete} dimmed />}
      </header>

      <p className="article__body" style={props.truncate ? truncate : {}}>
        {props.data.content}
      </p>
    </article>
  );
}

export default Article;

/*
  Why set a fallback value for user?
  - Articles can be displayed while user data is loading
  - Automatic scroll down works properly
  - It's easier to identify bugs related to missing user data

  Function parseTime is running too many times. Is this ok?
  Truncate styles limits the content to 3 lines but still renders all the text (slow)
*/
