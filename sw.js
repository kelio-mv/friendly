oninstall = skipWaiting;
onactivate = (e) => e.waitUntil(clients.claim());
onfetch = (e) => e.respondWith(handleRequest(e.request));

async function handleRequest(req) {
  const match = await caches.match(req);
  if (match) return match;
  const res = await fetch(req);
  const clone = res.clone();
  caches.open("friendly").then((cache) => cache.put(req, clone));
  return res;
}

// const images = [
//   "default_avatar",
//   "favicon",
//   "loading_pfp",
//   "logo",
//   "menu_android",
//   "menu_iphone",
// ];
// const icons = [
//   "add",
//   "alternate_email",
//   "arrow_back",
//   "article",
//   "chat",
//   "close",
//   "contact_support",
//   "delete",
//   "delete_forever",
//   "download",
//   "favorite",
//   "key",
//   "logout",
//   "menu",
//   "person_book",
//   "photo_camera",
//   "send",
//   "settings",
//   "share",
//   "visibility",
//   "visibility_off",
// ];
