/**
 * Mobile Utilities for Capacitor
 *
 * Provides native mobile features when running in Capacitor:
 * - Status bar configuration
 * - Keyboard handling
 * - Haptic feedback
 * - Splash screen control
 */

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { SplashScreen } from '@capacitor/splash-screen';

/**
 * Check if running in native app (iOS/Android)
 */
export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * Status Bar utilities
 */
export const statusBar = {
  /**
   * Set status bar to dark content (for light backgrounds)
   */
  setDark: async () => {
    if (!isNative()) return;
    try {
      await StatusBar.setStyle({ style: Style.Dark });
    } catch (e) {
      console.warn('StatusBar.setStyle failed:', e);
    }
  },

  /**
   * Set status bar to light content (for dark backgrounds)
   */
  setLight: async () => {
    if (!isNative()) return;
    try {
      await StatusBar.setStyle({ style: Style.Light });
    } catch (e) {
      console.warn('StatusBar.setStyle failed:', e);
    }
  },

  /**
   * Hide status bar
   */
  hide: async () => {
    if (!isNative()) return;
    try {
      await StatusBar.hide();
    } catch (e) {
      console.warn('StatusBar.hide failed:', e);
    }
  },

  /**
   * Show status bar
   */
  show: async () => {
    if (!isNative()) return;
    try {
      await StatusBar.show();
    } catch (e) {
      console.warn('StatusBar.show failed:', e);
    }
  },

  /**
   * Set background color (Android only)
   */
  setBackgroundColor: async (color: string) => {
    if (!isAndroid()) return;
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (e) {
      console.warn('StatusBar.setBackgroundColor failed:', e);
    }
  },
};

/**
 * Keyboard utilities
 */
export const keyboard = {
  /**
   * Hide the keyboard
   */
  hide: async () => {
    if (!isNative()) return;
    try {
      await Keyboard.hide();
    } catch (e) {
      console.warn('Keyboard.hide failed:', e);
    }
  },

  /**
   * Add keyboard show listener
   */
  onShow: (callback: (info: { keyboardHeight: number }) => void) => {
    if (!isNative()) return { remove: () => {} };
    return Keyboard.addListener('keyboardWillShow', callback);
  },

  /**
   * Add keyboard hide listener
   */
  onHide: (callback: () => void) => {
    if (!isNative()) return { remove: () => {} };
    return Keyboard.addListener('keyboardWillHide', callback);
  },
};

/**
 * Haptic feedback utilities
 */
export const haptics = {
  /**
   * Light impact feedback (button taps)
   */
  light: async () => {
    if (!isNative()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Silently fail - haptics not critical
    }
  },

  /**
   * Medium impact feedback (selections)
   */
  medium: async () => {
    if (!isNative()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Silently fail
    }
  },

  /**
   * Heavy impact feedback (important actions)
   */
  heavy: async () => {
    if (!isNative()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      // Silently fail
    }
  },

  /**
   * Success notification feedback
   */
  success: async () => {
    if (!isNative()) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
      // Silently fail
    }
  },

  /**
   * Warning notification feedback
   */
  warning: async () => {
    if (!isNative()) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (e) {
      // Silently fail
    }
  },

  /**
   * Error notification feedback
   */
  error: async () => {
    if (!isNative()) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (e) {
      // Silently fail
    }
  },

  /**
   * Selection changed feedback
   */
  selection: async () => {
    if (!isNative()) return;
    try {
      await Haptics.selectionChanged();
    } catch (e) {
      // Silently fail
    }
  },
};

/**
 * Splash screen utilities
 */
export const splash = {
  /**
   * Hide the splash screen
   */
  hide: async (fadeOutDuration = 300) => {
    if (!isNative()) return;
    try {
      await SplashScreen.hide({ fadeOutDuration });
    } catch (e) {
      console.warn('SplashScreen.hide failed:', e);
    }
  },

  /**
   * Show the splash screen
   */
  show: async () => {
    if (!isNative()) return;
    try {
      await SplashScreen.show();
    } catch (e) {
      console.warn('SplashScreen.show failed:', e);
    }
  },
};

/**
 * Initialize mobile app
 * Call this in App.tsx on mount
 */
export const initMobileApp = async () => {
  if (!isNative()) {
    console.log('Running in web mode');
    return;
  }

  console.log(`Running on ${Capacitor.getPlatform()}`);

  // Configure status bar
  await statusBar.setDark();

  // Hide splash after app is ready
  await splash.hide(500);
};

/**
 * Safe area insets hook helper
 * Returns CSS env() values for safe areas
 */
export const getSafeAreaInsets = () => ({
  top: 'env(safe-area-inset-top, 0px)',
  bottom: 'env(safe-area-inset-bottom, 0px)',
  left: 'env(safe-area-inset-left, 0px)',
  right: 'env(safe-area-inset-right, 0px)',
});

export default {
  isNative,
  isIOS,
  isAndroid,
  statusBar,
  keyboard,
  haptics,
  splash,
  initMobileApp,
  getSafeAreaInsets,
};
