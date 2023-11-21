function ProfilePicture(props) {
  return (
    <img
      src={props.src}
      style={{
        width: props.small ? 48 : 72,
        borderRadius: "50%",
        filter: props.src === "default_avatar.png" ? "invert(1)" : null,
      }}
    />
  );
}

export default ProfilePicture;

// O filtro no Icon e ProfilePicture podem estar comprometendo o desempenho
