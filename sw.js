// Wanderlust Service Worker
// Zweck: PWA-Installierbarkeit + Offline-Fallback.
// Strategie: index.html/HTML immer network-first (damit Updates sofort ankommen),
// nur statische Assets (Icons, Manifest) cache-first.

const CACHE = 'wanderlust-v2';
const ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  // Nur statische Assets vorab cachen – NICHT die HTML.
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // Alle Fremd-APIs und nicht-GET-Requests: Service Worker haelt sich komplett raus.
  if (
    req.method !== 'GET' ||
    url.includes('googleapis.com') ||
    url.includes('gstatic.com') ||
    url.includes('firebaseio.com') ||
    url.includes('firebase') ||
    url.includes('google.com') ||
    url.includes('photon.komoot.io') ||
    url.includes('project-osrm.org') ||
    url.includes('cdn.tailwindcss.com') ||
    url.includes('cdnjs.cloudflare.com') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com')
  ) {
    return; // Browser-Standard: direkt aus dem Netz
  }

  // Nur gleiche Origin ab hier behandeln
  if (new URL(url).origin !== self.location.origin) return;

  const isHTML = req.mode === 'navigate'
    || req.destination === 'document'
    || url.endsWith('.html')
    || url.endsWith('/');

  if (isHTML) {
    // Network-first: immer die frische App laden, Cache nur als Offline-Fallback
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // Statische Assets: cache-first mit Netz-Fallback
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached)
    )
  );
});
