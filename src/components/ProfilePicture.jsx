import basename from "../../basename";

function ProfilePicture(props) {
  const isDefault = ["default_avatar.png", "loading_pfp.png"].includes(props.src);

  return (
    <img
      src={isDefault ? `/${basename}/${props.src}` : props.src}
      className={isDefault ? "profile-picture--default" : null}
      onClick={props.onClick}
      style={{
        width: props.size ? props.size : 72,
        borderRadius: "50%",
        cursor: props.onClick ? "pointer" : null,
      }}
    />
  );
}

export default ProfilePicture;

// The invert filter in Icon and ProfilePicture might be slowing down the rendering
