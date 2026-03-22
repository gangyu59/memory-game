// Cache version — bump this string whenever you deploy new assets
const CACHE_VERSION = 'memory-game-v3';

const ASSETS = [
    './',
    './index.html',
    './style.css?v=2.0',
    './main.js?v=2.0',
    './manifest.json',
    './service-worker.js'
];

// Install: cache all assets and skip waiting so the new SW activates immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
            .catch((err) => console.error('SW install: caching failed', err))
    );
});

// Activate: delete all old caches and take control of all clients
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key !== CACHE_VERSION)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch: cache-first for same-origin assets; network-only for everything else
self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                return cached || fetch(event.request).catch(() => caches.match('./index.html'));
            })
        );
    }
});
