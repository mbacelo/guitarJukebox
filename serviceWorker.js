const cacheName = 'guitar-jukebox-site-v1.0'
const resourcesToPrecache = [
  'index.html',
  'css/style.css',
  'js/app-utils.js',
  'js/dom-utils.js',
  'js/event-handlers.js'
]

self.addEventListener('install', installEvent => {
  installEvent.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(resourcesToPrecache)
    })
  )
})

//The stale-while-revalidate strategy serves the cached resource immediately while simultaneously fetching the latest version from the network. 
//The cache is updated with the new response. This approach ensures that users get fast responses and that the cache stays up to date.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {      
      // Start a network request in the background
      const networkFetch = fetch(event.request).then(networkResponse => {
        // Update the cache with the new response
        return caches.open(cacheName).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });

      // Return the cached response immediately, or wait for network if not cached
      return cachedResponse || networkFetch;
    })
  );
});