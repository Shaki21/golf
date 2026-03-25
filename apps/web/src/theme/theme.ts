/**
 * Theme Management
 * Handles light/dark/system mode with localStorage persistence
 * and system preference detection.
 */

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'tier-golf-theme';

/**
 * Get the initial theme from localStorage or default to 'system'
 */
export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }

  return 'system';
}

/**
 * Get the resolved theme (light or dark) based on mode and system preference
 */
export function getResolvedTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return mode;
}

/**
 * Apply theme to document and persist choice
 */
export function applyTheme(mode: ThemeMode): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Persist choice
  localStorage.setItem(STORAGE_KEY, mode);

  const resolved = getResolvedTheme(mode);
  const root = document.documentElement;

  // Set data-theme attribute (used by CSS)
  root.setAttribute('data-theme', resolved);

  // Also set class for compatibility
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): ThemeMode {
  const mode = getInitialTheme();
  applyTheme(mode);
  return mode;
}

/**
 * Subscribe to system preference changes
 * Returns cleanup function
 */
export function subscribeToSystemTheme(callback: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = () => {
    // Only update if mode is 'system'
    const currentMode = getInitialTheme();
    if (currentMode === 'system') {
      applyTheme('system');
      callback();
    }
  };

  // Modern API
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  // Legacy API fallback
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}
