function ProfilePicture(props) {
  return (
    <img
      src={props.src}
      style={{
        width: props.small ? 48 : 72,
        borderRadius: "50%",
        filter: props.src === "avatar.png" ? "invert(1)" : null,
        ...props.style,
      }}
    />
  );
}

export default ProfilePicture;
