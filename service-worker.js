// PM Tracker - Service Worker offline-aware
// Strategia: cache-first per asset statici, network-first per API GitHub con fallback graceful

const SW_VERSION = 'v2';
const CACHE_NAME = `pm-tracker-${SW_VERSION}`;

// Asset statici da pre-cachare all'installazione
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/app.js',
  '/manifest.json'
];

// ─── INSTALL: pre-cacha gli asset statici ────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// ─── ACTIVATE: rimuovi cache vecchie ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Le chiamate API GitHub vanno sempre in rete (dati sempre freschi).
  // Se offline, risponde con un JSON di errore leggibile dall'app.
  if (url.hostname === 'api.github.com') {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(
          JSON.stringify({ message: 'offline' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // CDN esterni (Bootstrap, dayjs): network-first con fallback cache
  if (url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Asset locali (HTML, JS, CSS, immagini): cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
