function ProfilePicture(props) {
  return (
    <img
      src={props.src}
      style={{
        width: props.small ? 48 : 72,
        borderRadius: "50%",
        filter: ["default_avatar.png", "loading_pfp.png"].includes(props.src) ? "invert(1)" : null,
      }}
    />
  );
}

export default ProfilePicture;

// O filtro no Icon e ProfilePicture podem estar comprometendo o desempenho
