function Icon(props) {
  return (
    <img
      src={`/friendly/${props.name}.svg`}
      onClick={props.onClick}
      style={{
        filter: "invert(1)",
        display: props.inline ? "inline" : null,
        verticalAlign: props.inline ? "middle" : null,
        opacity: props.dimmed || props.disabled ? 0.5 : 1,
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
