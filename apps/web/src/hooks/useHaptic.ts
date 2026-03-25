/**
 * useHaptic Hook
 *
 * Provides haptic feedback wrapper for click handlers.
 * Automatically triggers appropriate haptic feedback on native platforms.
 */

import { haptics } from '../utils/mobile';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Wrap a click handler with haptic feedback
 */
export function withHaptic<T extends (...args: unknown[]) => void>(
  handler: T,
  type: HapticType = 'light'
): T {
  return ((...args: unknown[]) => {
    // Trigger haptic feedback
    switch (type) {
      case 'light':
        haptics.light();
        break;
      case 'medium':
        haptics.medium();
        break;
      case 'heavy':
        haptics.heavy();
        break;
      case 'success':
        haptics.success();
        break;
      case 'warning':
        haptics.warning();
        break;
      case 'error':
        haptics.error();
        break;
      case 'selection':
        haptics.selection();
        break;
    }

    // Call original handler
    return handler(...args);
  }) as T;
}

/**
 * Hook to create haptic-enhanced click handler
 */
export function useHaptic(type: HapticType = 'light') {
  return <T extends (...args: unknown[]) => void>(handler: T): T => {
    return withHaptic(handler, type);
  };
}

/**
 * Simple haptic trigger functions for direct use
 */
export const triggerHaptic = {
  /** Light tap - for regular button presses */
  tap: () => haptics.light(),

  /** Medium impact - for selections, toggles */
  select: () => haptics.selection(),

  /** Success - for completed actions */
  success: () => haptics.success(),

  /** Warning - for destructive actions */
  warning: () => haptics.warning(),

  /** Error - for failed actions */
  error: () => haptics.error(),

  /** Heavy - for significant actions */
  heavy: () => haptics.heavy(),
};

export default useHaptic;
