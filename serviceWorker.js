const CACHE_NAME = 'guitar-jukebox-site-v1.0'
const resourcesToPrecache = [
  'index.html',
  'css/style.css',
  'js/api.js',
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
  // Only handle GET requests for caching
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return the cached response if found      
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch from the network
      return fetch(event.request).then(networkResponse => {
        // Only cache successful responses
        if (networkResponse.ok) {
          // Cache the new response for future requests
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(error => {
        // Handle fetch errors gracefully
        console.error('Fetch failed:', error);
        // You could return a custom offline page here if needed
        throw error;
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