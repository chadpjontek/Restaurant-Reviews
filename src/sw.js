// store static cache name in a variable for future app updates
const staticCacheName = 'restaurant-v1';

// install the service worker and cache the files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(staticCacheName).then(cache =>
      cache.addAll([
        '/',
        '/index.bundle.js',
        '/index.css',
        '/index.html',
        '/restaurant.bundle.js',
        '/restaurant.css',
        '/restaurant.html'
      ])
    )
  );
});

// check the current version and delete old service workers
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cachesNames => {
      return Promise.all(
        cachesNames.filter(cacheName => {
          return cacheName.startsWith('restaurant-') && cacheName != staticCacheName;
        }).map(cacheName => {
          return cache.delete(cacheName);
        })
      );
    })
  );
});

// fetch from the cache if available and then
// check network for new version to cache, otherwise get from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      const fetchRequest = event.request.clone();
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(staticCacheName)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      });
    })
  );
});