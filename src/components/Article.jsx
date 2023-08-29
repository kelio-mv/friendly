import "./Article.scss";

function Article(props) {
  if (props.user) {
    return (
      <article
        className={`article ${props.highlight ? "article--highlight" : ""}`}
        onClick={props.onClick}
      >
        <header className="article__header">
          <div
            style={{ backgroundImage: `url(${props.user.picture})` }}
            className="article__picture"
          />

          <div>
            <p>@{props.user.name}</p>
            <p className="article__date">{parseDate(props.data.date)}</p>
          </div>
        </header>

        <p className="article__body" style={props.truncate ? truncate : {}}>
          {props.data.content}
        </p>
      </article>
    );
  }
}

function parseDate(date) {
  // This function is running too many times
  const elapsed = new Date() / 1000 - date;

  if (elapsed < 60) {
    return "agora mesmo";
  }
  if (elapsed < 120) {
    return "há 1 minuto";
  }
  if (elapsed < 3600) {
    return `há ${Math.floor(elapsed / 60)} minutos`;
  }
  if (elapsed < 86400) {
    return `há ${Math.floor(elapsed / 3600)} horas`;
  }
  return `há ${Math.floor(elapsed / 86400)} dias`;
}

const truncate = {
  /* Limit content to 3 lines but still render all the text (slow) */
  display: "-webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
};

export default Article;
