function Icon(props) {
  return (
    <img
      src={`${props.name}.svg`}
      className={props.className}
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
