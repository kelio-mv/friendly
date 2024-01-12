oninstall = () => skipWaiting();
onactivate = (e) => e.waitUntil(clients.claim());
onfetch = (e) => e.respondWith(handleRequest(e.request));

async function handleRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  const response = await fetch(request);
  const responseClone = response.clone();
  caches.open("friendly").then((cache) => cache.put(request, responseClone));
  return response;
}
