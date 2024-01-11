oninstall = (e) => {
  e.waitUntil(addToCache());
  skipWaiting();
};
onactivate = (e) => e.waitUntil(clients.claim());
onfetch = (e) => e.respondWith(handleRequest(e.request));

async function addToCache() {
  const cache = await caches.open("friendly");
  await cache.addAll(["index.html"]);
}

async function handleRequest(req) {
  return fetch(req);
  // const match = await caches.match(req);
  // if (match) return match;
  // const res = await fetch(req);
  // const clone = res.clone();
  // caches.open("friendly").then((cache) => cache.put(req, clone));
  // return res;
}
