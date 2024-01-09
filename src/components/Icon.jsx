import basename from "../../basename";

function Icon(props) {
  const filter = props.invert ? "invert(1)" : null;
  const highlightFilter =
    "brightness(0) saturate(100%) invert(55%) sepia(57%) saturate(617%) hue-rotate(124deg) brightness(95%) contrast(89%)";

  return (
    <img
      src={`/${basename}/${props.name}.svg`}
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
