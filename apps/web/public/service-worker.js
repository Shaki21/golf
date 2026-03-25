/**
 * TIER Golf - Service Worker
 * Handles push notifications, caching, and offline support
 *
 * IMPORTANT: This service worker uses BUILD_SHA-scoped caches.
 * Each deploy gets a unique cache, and old caches are automatically deleted.
 *
 * The __BUILD_SHA__ placeholder is replaced at build time with the actual commit SHA.
 */

// BUILD_SHA is injected at build time (see Dockerfile)
// Falls back to timestamp if not replaced (dev mode)
const BUILD_SHA = '__BUILD_SHA__'.startsWith('__') ? `dev-${Date.now()}` : '__BUILD_SHA__';
const CACHE_NAME = `tier-golf-cache-${BUILD_SHA}`;

// Log build info for debugging
console.log('[SW] Service Worker Build:', BUILD_SHA);
console.log('[SW] Cache Name:', CACHE_NAME);

// Minimal cache - only essential offline assets that are KNOWN to exist
const STATIC_CACHE_URLS = [
  '/logo192.webp',
  '/logo512.webp',
  '/favicon.svg',
];

// =============================================================================
// HELPER: Guarded cache - skip failures instead of failing entire install
// =============================================================================

async function cacheWithFallback(cache, urls) {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) {
          await cache.put(url, response);
          console.log('[SW] Cached:', url);
          return { url, status: 'cached' };
        } else {
          console.warn('[SW] Skip cache (not ok):', url, response.status);
          return { url, status: 'skipped', reason: response.status };
        }
      } catch (error) {
        console.warn('[SW] Skip cache (error):', url, error.message);
        return { url, status: 'error', reason: error.message };
      }
    })
  );

  const cached = results.filter(r => r.status === 'fulfilled' && r.value.status === 'cached').length;
  const skipped = results.length - cached;
  console.log(`[SW] Caching complete: ${cached} cached, ${skipped} skipped`);
}

// =============================================================================
// INSTALL EVENT - Clear ALL old caches and cache minimal assets
// =============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...', BUILD_SHA);

  event.waitUntil(
    // First, delete ALL existing caches (different BUILD_SHA = new cache)
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          console.log('[SW] Deleting old cache:', name);
          return caches.delete(name);
        })
      );
    }).then(() => {
      // Then cache essential assets with error handling (won't fail install)
      return caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching minimal assets for build:', BUILD_SHA);
        return cacheWithFallback(cache, STATIC_CACHE_URLS);
      });
    })
  );

  // Activate immediately - don't wait for old SW to finish
  self.skipWaiting();
});

// =============================================================================
// ACTIVATE EVENT - Clean up and claim clients
// =============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...', BUILD_SHA);

  event.waitUntil(
    // Delete any caches that don't match current BUILD_SHA
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Purging stale cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Service worker activated for build:', BUILD_SHA);
    })
  );

  // Claim all clients immediately - critical for getting new content
  self.clients.claim();
});

// =============================================================================
// FETCH EVENT - Network first, cache fallback (for offline only)
// =============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests: network only, no caching
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Offline', message: 'Ingen internettforbindelse' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // HTML/Navigation: ALWAYS network first (critical for deploy updates)
  if (request.mode === 'navigate' || request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets (JS, CSS, images): network first with cache fallback for offline
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// =============================================================================
// PUSH EVENT - Handle incoming push notifications
// =============================================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {
    title: 'TIER Golf',
    body: 'Du har en ny varsling',
    icon: '/logo192.webp',
    badge: '/icons/icon-72.webp',
    tag: 'default',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo192.webp',
    badge: data.badge || '/icons/icon-72.webp',
    tag: data.tag || 'default',
    vibrate: data.vibrate || [200, 100, 200],
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || '/',
      ...data.data,
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// =============================================================================
// NOTIFICATION CLICK EVENT - Handle notification clicks
// =============================================================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  if (event.action) {
    console.log('[SW] Action clicked:', event.action);
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});

// =============================================================================
// MESSAGE EVENT - Handle messages from main thread
// =============================================================================

self.addEventListener('message', (event) => {
  const { type } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      });
      break;

    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME, buildSha: BUILD_SHA });
      break;

    default:
      console.log('[SW] Unknown message type:', type);
  }
});

console.log('[SW] Service worker script loaded, build:', BUILD_SHA);
