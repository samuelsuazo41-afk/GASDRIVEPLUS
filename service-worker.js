const CACHE_NAME = 'gasdrive-v7.10';
const urlsToCache = [
  '/GASDRIVEPLUS/',
  '/GASDRIVEPLUS/index.html',
  '/GASDRIVEPLUS/app.js',
  '/GASDRIVEPLUS/manifest.json',
  '/GASDRIVEPLUS/icon-192.png',
  '/GASDRIVEPLUS/icon-512.png'
];

// INSTALAR y cachear todo
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// ACTIVAR y borrar cachés viejas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH: servir desde caché si no hay internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/GASDRIVEPLUS/index.html');
          }
        });
      })
  );
});

// PUSH
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'GasDrive';
  const options = {
    body: data.body || 'Tienes un mensaje nuevo',
    icon: '/GASDRIVEPLUS/icon-192.png',
    badge: '/GASDRIVEPLUS/icon-192.png',
    tag: data.tag || 'gasdrive-general',
    requireInteraction: true
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// CLICK EN NOTIFICACIÓN
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/GASDRIVEPLUS/'));
});