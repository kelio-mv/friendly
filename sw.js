oninstall = (e) => e.waitUntil(skipWaiting());
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
