function Icon(props) {
  const filter = props.invert ? "invert(1)" : null;
  const highlightFilter =
    "brightness(0) saturate(100%) invert(55%) sepia(57%) saturate(617%) hue-rotate(124deg) brightness(95%) contrast(89%)";

  return (
    <img
      src={`/friendly/${props.name}.svg`}
      className="icon"
      onClick={props.onClick}
      style={{
        filter: props.highlight ? highlightFilter : filter,
        display: props.inline ? "inline" : null,
        verticalAlign: props.inline ? "middle" : null,
        opacity: props.dimmed || props.disabled ? 0.5 : null,
        cursor: props.onClick ? "pointer" : null,
        pointerEvents: props.disabled ? "none" : null,
      }}
    />
  );
}

export default Icon;

/*
  Fix the prop "src" here and in ProfilePicture when possible
  https://stackoverflow.com/questions/74168824/vite-not-prepending-base-path-to-anything-in-public-directory
*/
