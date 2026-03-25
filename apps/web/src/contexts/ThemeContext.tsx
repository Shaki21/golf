import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  cycleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// =============================================================================
// Constants
// =============================================================================

const THEME_KEY = 'tier-golf-theme';

// =============================================================================
// Context
// =============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// =============================================================================
// Provider
// =============================================================================

export function ThemeProvider({ children }: ThemeProviderProps): React.ReactElement {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Apply theme to document
  const applyTheme = useCallback((themeValue: ThemeMode): void => {
    const root = document.documentElement;
    const isDark = themeValue === 'dark' ||
      (themeValue === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }

    setResolvedTheme(isDark ? 'dark' : 'light');
  }, []);

  // Set theme and persist
  const setTheme = useCallback((newTheme: ThemeMode): void => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  }, [applyTheme]);

  // Toggle between light and dark
  const toggleTheme = useCallback((): void => {
    const newTheme: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Cycle through themes: light -> dark -> system
  const cycleTheme = useCallback((): void => {
    const themeOrder: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  }, [theme, setTheme]);

  // Initialize and listen for system changes
  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (): void => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    cycleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
