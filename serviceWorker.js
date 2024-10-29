const CACHE_NAME = 'guitar-jukebox-site-v1.0'
const resourcesToPrecache = [
  'index.html',
  'css/style.css',
  'js/api-utils.js',
  'js/dom-utils.js',
  'js/event-handlers.js'
]

self.addEventListener('install', installEvent => {
  installEvent.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(resourcesToPrecache)
    })
  )
})

// Fetch event - cache-first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return the cached response if found
      // ## remove cache to test new analytics
      // if (cachedResponse) {
      //   return cachedResponse;
      // }

      // Otherwise, fetch from the network
      return fetch(event.request).then(networkResponse => {
        // Cache the new response for future requests
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Only the current cache should be kept

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // If the cache name is not in the whitelist, delete it
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});