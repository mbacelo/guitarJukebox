// Minimal service worker for PWA installability
// No caching - relies on browser cache instead

self.addEventListener('install', () => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Simply pass through to network - no caching
  // Browser's HTTP cache will handle caching automatically
  event.respondWith(fetch(event.request));
});
