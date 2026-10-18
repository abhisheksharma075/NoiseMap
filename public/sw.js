/**
 * NoiseMap Service Worker (PWA & Web Push Alerts)
 * Compatible with offline caching & W3C Push API
 * 
 * ZERO-RAW-AUDIO PRIVACY ARCHITECTURE:
 * Push notifications and cached assets strictly process scalar telemetry
 * (dBA metrics, timestamps, coordinate grids, incident status). No audio
 * streams or recordings are ever handled, stored, or transmitted by this worker.
 */

const CACHE_NAME = 'noisemap-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/radar-icon.svg',
  '/manifest.webmanifest',
];

// 1. Service Worker Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Service Worker Activation & Cache Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Network-First with Cache Fallback for dynamic assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          event.request.url.startsWith(self.location.origin)
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// 4. Web Push Notification Event Handler (Background Push API)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || '🚨 NOISEMAP THRESHOLD ALERT';
  const options = {
    body: data.body || 'Geofenced acoustic threshold breach detected in your monitored zone.',
    icon: data.icon || '/radar-icon.svg',
    badge: data.badge || '/radar-icon.svg',
    tag: data.tag || 'noisemap-geofence-alert',
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: data.requireInteraction ?? false,
    data: {
      url: data.url || '/?tab=map',
      incident_id: data.incident_id || null,
      pin_id: data.pin_id || null,
      timestamp: Date.now(),
    },
    actions: [
      { action: 'explore', title: 'Open Radar Map' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. Notification Click Handler (Interactive Navigation)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/?tab=map';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open on the app, focus and navigate it
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 6. Direct Client Message Relay (Allows main thread to trigger notifications via SW registration)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'DISPATCH_LOCAL_ALERT') {
    const { title, options } = event.data.payload || {};
    if (title) {
      self.registration.showNotification(title, {
        icon: '/radar-icon.svg',
        badge: '/radar-icon.svg',
        vibrate: [200, 100, 200],
        ...options,
      });
    }
  }
});
