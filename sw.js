oninstall = (e) => {
  e.waitUntil(addToCache());
  skipWaiting();
};
onactivate = (e) => e.waitUntil(clients.claim());
onfetch = (e) => e.respondWith(handleRequest(e.request));

async function addToCache() {
  const cache = await caches.open("friendly");
  await cache.addAll(["index.html", "assets/index-fcc81b7c.js", "assets/index-16984635.css"]);
}

async function handleRequest(req) {
  const match = await caches.match(req);
  if (match) return match;
  const res = await fetch(req);
  const clone = res.clone();
  caches.open("friendly").then((cache) => cache.put(req, clone));
  return res;
}
