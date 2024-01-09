import basename from "../basename";

function preloadImages() {
  const images = [
    "default_avatar",
    "favicon",
    "loading_pfp",
    "logo",
    "menu_android",
    "menu_iphone",
  ];
  const icons = [
    "add",
    "alternate_email",
    "arrow_back",
    "article",
    "chat",
    "close",
    "contact_support",
    "delete",
    "delete_forever",
    "download",
    "favorite",
    "key",
    "logout",
    "menu",
    "person_book",
    "photo_camera",
    "send",
    "settings",
    "share",
    "visibility",
    "visibility_off",
  ];
  images.forEach((name) => {
    const image = new Image();
    image.src = `/${basename}/${name}.png`;
  });
  icons.forEach((name) => {
    const image = new Image();
    image.src = `/${basename}/${name}.svg`;
  });
}

export default preloadImages;
