const CACHE = ‘guitar-practice-v1’;

const ASSETS = [
‘./index.html’,
‘./manifest.json’,
‘./icon-192.png’,
‘./icon-512.png’,
‘https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap’
];

// Install — cache all core assets
self.addEventListener(‘install’, e => {
e.waitUntil(
caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
);
});

// Activate — clean up old caches
self.addEventListener(‘activate’, e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
).then(() => self.clients.claim())
);
});

// Fetch — serve from cache, fall back to network
self.addEventListener(‘fetch’, e => {
e.respondWith(
caches.match(e.request).then(cached => {
if (cached) return cached;
return fetch(e.request).then(response => {
// Cache successful GET responses
if (e.request.method === ‘GET’ && response.status === 200) {
const clone = response.clone();
caches.open(CACHE).then(cache => cache.put(e.request, clone));
}
return response;
}).catch(() => {
// If offline and not cached, return the main app shell
if (e.request.destination === ‘document’) {
return caches.match(’./index.html’);
}
});
})
);
});
