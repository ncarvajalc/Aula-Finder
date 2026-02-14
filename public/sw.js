const CACHE_NAME = 'aula-finder-v1';
const BASE_PATH = '/Aula-Finder';

// Assets to pre-cache during installation
const PRECACHE_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/icons/icon-192x192.png`,
  `${BASE_PATH}/icons/icon-512x512.png`,
];

// Install event: pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event: serve from cache, fall back to network, then cache the response
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Only handle same-origin requests and requests under our base path
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        event.waitUntil(
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {
              // Network unavailable, cached version is fine
            })
        );
        return cachedResponse;
      }

      // No cache hit: fetch from network and cache the response
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If both cache and network fail, return a basic offline page
          if (request.headers.get('accept')?.includes('text/html')) {
            return new Response(
              '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aula-Finder - Sin conexión</title></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1B2A4A;color:white;text-align:center"><div><h1 style="color:#F0B000">Aula-Finder</h1><p>No hay conexión a internet.</p><p>Intenta de nuevo cuando tengas conexión.</p></div></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
        });
    })
  );
});
