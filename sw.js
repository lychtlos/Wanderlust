// Wanderlust Service Worker
// Zweck: Erfüllt die PWA-Installierbarkeitskriterien (registrierter SW mit
// fetch-Handler) und liefert einen einfachen Offline-Cache für die App-Hülle.

const CACHE = 'wanderlust-v1';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Firebase/Firestore/Storage und andere APIs niemals cachen –
  // die brauchen immer die Live-Verbindung.
  const url = req.url;
  if (
    req.method !== 'GET' ||
    url.includes('firestore.googleapis.com') ||
    url.includes('firebasestorage.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('googleapis.com') ||
    url.includes('gstatic.com') ||
    url.includes('photon.komoot.io') ||
    url.includes('project-osrm.org')
  ) {
    return; // Browser-Standard: direkt aus dem Netz
  }

  // App-Hülle: Cache-first mit Netz-Fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req)
          .then((res) => {
            // Erfolgreiche gleiche-Origin-Antworten nachträglich cachen
            if (res.ok && new URL(url).origin === self.location.origin) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached)
      );
    })
  );
});
