// Basic Service Worker for offline support
const CACHE_NAME = 'caixa-cache-v1';
const assetsToCache = [
  '/',
  'index.html',
  'historico.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'icon-192.png',
  'trash-can.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assetsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
