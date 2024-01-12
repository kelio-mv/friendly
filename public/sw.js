self.oninstall = () => skipWaiting();
self.onactivate = (e) => e.waitUntil(clients.claim());
self.onfetch = (e) => {
  e.respondWith(
    e.request.destination === "image" ? staleWhileRevalidate(e.request) : networkFirst(e.request)
  );
};

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    fetch(request).then((response) => store(request, response));
    return cachedResponse;
  }
  const response = await fetch(request);
  store(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    store(request, response.clone());
    return response;
  } catch {
    console.log(request);
    return caches.match(request);
  }
}

function store(req, res) {
  caches.open("friendly").then((cache) => cache.put(req, res));
}
