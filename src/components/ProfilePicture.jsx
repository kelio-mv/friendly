function ProfilePicture(props) {
  const isDefault = ["default_avatar.png", "loading_pfp.png"].includes(props.src);

  return (
    <img
      src={isDefault ? `/${props.src}` : props.src}
      style={{
        width: props.small ? 48 : 72,
        borderRadius: "50%",
        filter: isDefault ? "invert(1)" : null,
      }}
    />
  );
}

export default ProfilePicture;

/*
The invert filter in Icon and ProfilePicture might be slowing down the rendering
Once people vote whether to implement light mode or not, i'll decide what to do
*/
