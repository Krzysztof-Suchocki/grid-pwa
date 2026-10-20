// Service Worker dla GitHub Pages i lokalnego serwera HTTP(S).
// Adres aplikacji jest wyznaczany na podstawie zakresu rejestracji.
const CACHE_NAME = 'grid-pwa-v2';
const APP_BASE = self.registration.scope;
const OFFLINE_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_FILES.map((path) => new URL(path, APP_BASE).href)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name.startsWith('grid-pwa-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(APP_BASE)) return;

  if (request.mode === 'navigate') {
    // Stronę aktualizuj z sieci, a offline użyj zapisanej kopii.
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
        }
        return response;
      }).catch(async () => {
        return (await caches.match(request)) ||
          (await caches.match(new URL('./index.html', APP_BASE))) ||
          Response.error();
      })
    );
    return;
  }

  // Zasoby statyczne: najpierw pamięć podręczna, potem sieć.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
