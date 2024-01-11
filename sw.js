self.addEventListener("install", (e) => {
  console.log("Installed");
});

self.addEventListener("activate", (e) => {
  console.log("Activated");
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(handleRequest(e.request));
});

async function handleRequest(req) {
  const match = await caches.match(req);
  if (match) return match;
  const res = await fetch(req);
  putInCache(req, res.clone());
  return res;
}

async function putInCache(req, res) {
  const cache = await caches.open("friendly");
  await cache.put(req, res);
}

// if (match) return match;
// else {
//   const res = await fetch(req);
//   const cache = await caches.open("friendly");
//   await cache.put(req, res);
// }
