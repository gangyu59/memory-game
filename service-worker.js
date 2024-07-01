self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('memory-game-cache').then((cache) => {
            return cache.addAll([
                './index.html',
                './style.css',
                './main.js',
                './manifest.json',
                './service-worker.js',
                './icons/icon-192.png', // Ensure your icons are added here
                './icons/icon-512.png'  // Ensure your icons are added here
            ]);
        }).catch(error => {
            console.error('Caching failed:', error);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(error => {
            console.error('Fetching failed:', error);
        })
    );
});