// PM Tracker - Service Worker offline-aware
// Strategia: cache-first per asset statici, network-only per API (Supabase/GitHub)

const SW_VERSION = 'v12';
const CACHE_NAME = `pm-tracker-${SW_VERSION}`;

// Asset statici da pre-cachare all'installazione.
// Percorsi RELATIVI alla posizione dello SW: su GitHub Pages l'app vive in
// /pm-tracker/, quindi "/" risolverebbe alla radice del dominio (404).
const STATIC_ASSETS = [
  './',
  './index.html',
  './assets/app.js',
  './assets/supabase-config.js',
  './assets/styles.css',
  './assets/brand/logo-telepass.svg',
  './manifest.json'
];

// ─── INSTALL: pre-cacha gli asset statici ────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // add singolo: un asset mancante non deve far fallire l'intera installazione
      Promise.all(STATIC_ASSETS.map(url => cache.add(url).catch(err => {
        console.warn('Precache fallito per', url, err && err.message);
        return null;
      })))
    )
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

  // Le chiamate API (Supabase, GitHub) vanno sempre in rete: dati sempre freschi.
  // Se offline, risponde con un JSON di errore leggibile dall'app.
  if (url.hostname === 'api.github.com' || url.hostname.endsWith('.supabase.co')) {
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

  // Navigazioni (HTML): network-first, così un deploy si vede subito.
  // Offline: fallback alla pagina in cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then(m => m || caches.match('./index.html')))
    );
    return;
  }

  // Asset locali. JS/CSS: network-first (un deploy si vede subito e la cache
  // resta solo come fallback offline). Immagini e altri file: cache-first con
  // aggiornamento in background (stale-while-revalidate).
  // NB: niente match con ignoreSearch sul primo tentativo — la query `?v=` è
  // proprio ciò che rende riconoscibile una nuova versione.
  const isCode = /\.(?:css|js|mjs|json)$/i.test(url.pathname);

  if (isCode) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => null);
      return cached || network.then(r => r || new Response('', { status: 504 }));
    })
  );
});
