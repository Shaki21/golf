/**
 * HLS Player Utility
 *
 * Handles HLS playback with fallback:
 * - Safari: Native HLS support via <video src="...m3u8">
 * - Other browsers: hls.js library
 *
 * Usage:
 * const hls = initHls(videoElement, hlsUrl, { onError });
 * // Later:
 * destroyHls(hls);
 */

// Check if browser supports HLS natively (Safari, iOS)
export function supportsNativeHls() {
  const video = document.createElement('video');
  return video.canPlayType('application/vnd.apple.mpegurl') !== '';
}

// Check if hls.js is supported
export function supportsHlsJs() {
  return typeof window !== 'undefined' && window.Hls && window.Hls.isSupported();
}

// Check if we can play HLS at all
export function canPlayHls() {
  return supportsNativeHls() || supportsHlsJs();
}

/**
 * Initialize HLS playback
 *
 * @param {HTMLVideoElement} videoElement - The video element to attach to
 * @param {string} hlsUrl - The HLS manifest URL (.m3u8)
 * @param {Object} options - Options
 * @param {Function} options.onError - Error callback
 * @param {Function} options.onLevelLoaded - Called when quality levels are loaded
 * @returns {Object|null} HLS instance (for cleanup) or null for native
 */
export function initHls(videoElement, hlsUrl, options = {}) {
  const { onError, onLevelLoaded } = options;

  if (!videoElement || !hlsUrl) {
    return null;
  }

  // Use native HLS if supported (Safari, iOS)
  if (supportsNativeHls()) {
    videoElement.src = hlsUrl;
    return null;
  }

  // Use hls.js for other browsers
  if (supportsHlsJs()) {
    const hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: false,
      // Start with auto quality
      startLevel: -1,
    });

    hls.loadSource(hlsUrl);
    hls.attachMedia(videoElement);

    // Event handlers
    hls.on(window.Hls.Events.MANIFEST_PARSED, (_event, data) => {
      if (onLevelLoaded) {
        onLevelLoaded(data.levels);
      }
    });

    hls.on(window.Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case window.Hls.ErrorTypes.NETWORK_ERROR:
            // Try to recover network errors
            hls.startLoad();
            break;
          case window.Hls.ErrorTypes.MEDIA_ERROR:
            // Try to recover media errors
            hls.recoverMediaError();
            break;
          default:
            // Unrecoverable error
            if (onError) {
              onError(`HLS error: ${data.details}`);
            }
            hls.destroy();
            break;
        }
      }
    });

    return hls;
  }

  // No HLS support available
  if (onError) {
    onError('HLS playback is not supported in this browser');
  }
  return null;
}

/**
 * Destroy HLS instance and clean up
 *
 * @param {Object|null} hlsInstance - The HLS instance from initHls
 */
export function destroyHls(hlsInstance) {
  if (hlsInstance && typeof hlsInstance.destroy === 'function') {
    hlsInstance.destroy();
  }
}

/**
 * Load hls.js dynamically (only when needed)
 *
 * @returns {Promise<boolean>} Whether hls.js was loaded successfully
 */
export async function loadHlsJs() {
  // Already loaded
  if (window.Hls) {
    return true;
  }

  // Native HLS support, no need for hls.js
  if (supportsNativeHls()) {
    return true;
  }

  // Load hls.js from CDN
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export default {
  supportsNativeHls,
  supportsHlsJs,
  canPlayHls,
  initHls,
  destroyHls,
  loadHlsJs,
};
