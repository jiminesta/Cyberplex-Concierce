const CACHE_NAME = 'concierge-2099-cache-v1';

self.addEventListener('install', event => {
  // Pre-caching essential assets
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icon.svg'
        // Other assets will be cached on the fly by the fetch handler
      ]).catch(err => {
        console.error('Failed to pre-cache assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Use a cache-first strategy
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return the cached response if it exists
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from the network
      return fetch(event.request).then(networkResponse => {
        // Check for a valid, cacheable response
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(error => {
        // If the network request fails and there's no cache, the browser will handle the error.
        console.warn('Fetch failed; resource not in cache.', event.request.url, error);
      });
    })
  );
});
