/**
 * Service Worker Registration
 *
 * PRODUCTION SAFETY: Service Worker is DISABLED by default in production.
 * This prevents stale UI issues caused by aggressive caching.
 *
 * To enable PWA features (offline support, push notifications), set:
 *   REACT_APP_ENABLE_PWA=true
 *
 * When enabled, the service worker uses BUILD_SHA-scoped caches
 * to ensure each deploy gets fresh assets.
 */

// Check if PWA is explicitly enabled
const isPWAEnabled = process.env.REACT_APP_ENABLE_PWA === 'true';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  // CRITICAL: Only register if PWA is explicitly enabled
  if (!isPWAEnabled) {
    console.log('[PWA] Service worker DISABLED (set REACT_APP_ENABLE_PWA=true to enable)');
    // Unregister any existing service workers to clear stale caches
    unregisterAll();
    return;
  }

  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);

    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('[PWA] Service worker ready (localhost mode)');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('[PWA] Service worker registered');

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('[PWA] New content available; please refresh.');

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('[PWA] Content cached for offline use.');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('[PWA] Service worker registration failed:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');

      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('[PWA] No internet connection. App running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('[PWA] Service worker unregistration failed:', error);
      });
  }
}

/**
 * Unregister ALL service workers and clear ALL caches
 * This ensures no stale content remains after disabling PWA
 */
export async function unregisterAll() {
  if ('serviceWorker' in navigator) {
    try {
      // Get all registrations and unregister them
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('[PWA] Unregistered service worker:', registration.scope);
      }

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log('[PWA] Deleted cache:', cacheName);
        }
      }

      console.log('[PWA] All service workers and caches cleared');
    } catch (error) {
      console.error('[PWA] Error during cleanup:', error);
    }
  }
}

// Helper to request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Helper to subscribe to push notifications
export async function subscribeToPush() {
  if (!isPWAEnabled) {
    console.warn('[PWA] Push notifications require REACT_APP_ENABLE_PWA=true');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
      ),
    });

    return subscription;
  } catch (error) {
    console.error('[PWA] Push subscription failed:', error);
    return null;
  }
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Helper to send message to service worker
export function sendMessageToSW(message) {
  if (!isPWAEnabled) return;
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  }
}

// Helper to clear all caches
export function clearAllCaches() {
  sendMessageToSW({ type: 'CLEAR_CACHE' });
}

// Helper to trigger skip waiting
export function skipWaiting() {
  sendMessageToSW({ type: 'SKIP_WAITING' });
}
