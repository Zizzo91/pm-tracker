// PM Tracker - Service Worker minimale
// Non fa cache aggressiva: i dati vengono sempre freschi dall'API GitHub

const SW_VERSION = 'v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// Fetch: lascia passare tutto senza intercettare (no cache offline)
// L'app richiede sempre dati freschi da GitHub API
self.addEventListener('fetch', (event) => {
  // Passa-through: nessuna cache
  event.respondWith(fetch(event.request));
});
