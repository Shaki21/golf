/**
 * Platform Detection Utilities
 * Detects iOS devices and capabilities for focus mode integration
 */

/**
 * Check if current device is iOS
 * @returns {boolean} True if running on iPad, iPhone, or iPod
 */
export function isIOS() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Check for iOS devices
  const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

  // Also check for iOS 13+ on iPad which pretends to be macOS
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  return isIOSDevice || isIPadOS;
}

/**
 * Get iOS version number
 * @returns {number|null} iOS version number or null if not iOS
 */
export function iOSVersion() {
  if (!isIOS()) return null;

  const userAgent = navigator.userAgent;
  const match = userAgent.match(/OS (\d+)_/);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  // Fallback for iPadOS 13+ which doesn't report OS in user agent
  // Assume modern iOS if we detected iPad but can't get version
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
    return 15; // Safe assumption for modern iPads
  }

  return null;
}

/**
 * Check if device supports iOS Focus mode
 * Focus mode was introduced in iOS 15
 * @returns {boolean} True if iOS 15 or higher
 */
export function supportsFocusMode() {
  const version = iOSVersion();
  return version !== null && version >= 15;
}

/**
 * Check if device supports Web APIs needed for focus session
 * @returns {object} Object indicating which APIs are available
 */
export function getFocusCapabilities() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      fullscreen: false,
      wakeLock: false,
      notifications: false,
      standalone: false
    };
  }

  return {
    // Fullscreen API (enter immersive mode)
    fullscreen: !!(
      document.documentElement.requestFullscreen ||
      document.documentElement.webkitRequestFullscreen ||
      document.documentElement.mozRequestFullScreen ||
      document.documentElement.msRequestFullscreen
    ),

    // Wake Lock API (keep screen on)
    wakeLock: 'wakeLock' in navigator,

    // Notifications API
    notifications: 'Notification' in window,

    // Running as installed PWA (standalone mode)
    standalone: window.navigator.standalone === true ||
                window.matchMedia('(display-mode: standalone)').matches
  };
}

/**
 * Check if app is running in standalone mode (installed as PWA)
 * @returns {boolean} True if installed to home screen
 */
export function isStandalone() {
  if (typeof window === 'undefined') return false;

  return (
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

/**
 * Get device model (iPhone, iPad, etc.)
 * @returns {string} Device model or 'unknown'
 */
export function getDeviceModel() {
  if (!isIOS()) return 'unknown';

  const userAgent = navigator.userAgent;

  if (/iPad/.test(userAgent)) return 'iPad';
  if (/iPhone/.test(userAgent)) return 'iPhone';
  if (/iPod/.test(userAgent)) return 'iPod';

  // iPadOS 13+ pretends to be Mac
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
    return 'iPad';
  }

  return 'unknown';
}

/**
 * Check if user has granted notification permissions
 * @returns {Promise<boolean>} True if notifications are granted
 */
export async function hasNotificationPermission() {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      return false;
    }
  }

  return false;
}

/**
 * Generate iOS Shortcut URL for Golf Training Focus mode
 * @param {object} options Configuration options
 * @returns {string} Shortcut URL or instructions URL
 */
export function generateShortcutURL(options = {}) {
  const {
    focusName = 'Golf Training',
    duration = 60, // minutes
    appURL = window.location.origin
  } = options;

  // For now, return link to shortcuts gallery or instructions
  // In production, this would link to a pre-made shortcut template
  const shortcutConfig = encodeURIComponent(JSON.stringify({
    name: `Start ${focusName}`,
    actions: [
      {
        type: 'SetFocus',
        parameters: {
          focusMode: focusName,
          enabled: true,
          duration: duration
        }
      },
      {
        type: 'OpenURL',
        parameters: {
          url: `${appURL}?focus=start&duration=${duration}`
        }
      }
    ]
  }));

  // Return app-specific URL scheme (if you have one) or web link
  return `shortcuts://run-shortcut?name=Start%20Golf%20Training`;
}

/**
 * Platform info object for debugging
 * @returns {object} Complete platform information
 */
export function getPlatformInfo() {
  return {
    isIOS: isIOS(),
    iOSVersion: iOSVersion(),
    deviceModel: getDeviceModel(),
    supportsFocusMode: supportsFocusMode(),
    capabilities: getFocusCapabilities(),
    isStandalone: isStandalone(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown'
  };
}
