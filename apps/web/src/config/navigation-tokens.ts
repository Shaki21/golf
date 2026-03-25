/**
 * ============================================================
 * NAVIGATION DESIGN TOKENS - TIER Golf
 * ============================================================
 *
 * Fargepalett og design tokens for fargekodet navigasjon.
 * Brukes sammen med player-navigation-v3.ts
 *
 * ============================================================
 */

/**
 * Farger for hvert hovedområde
 */
export const navigationColors = {
  // Dashboard - TIER Navy (default)
  dashboard: {
    primary: 'rgb(var(--tier-navy))',
    light: 'rgb(var(--tier-navy-light))',
    dark: 'rgb(var(--tier-navy-dark))',
    surface: 'rgb(var(--surface-secondary))',
    surfaceHover: 'rgb(var(--surface-elevated))',
    text: 'rgb(var(--text-primary))',
    textMuted: 'rgb(var(--text-secondary))',
    border: 'rgb(var(--border-light))',
    accent: 'rgb(var(--tier-gold))', // TIER Gold accent
  },

  // Trening - Success Green (aktivitet, logging)
  trening: {
    primary: 'rgb(var(--status-success))',
    light: 'rgb(var(--status-success-light))',
    dark: 'rgb(var(--status-success-dark))',
    surface: 'rgb(var(--surface-tertiary))',
    surfaceHover: 'rgb(var(--surface-elevated))',
    text: 'rgb(var(--text-primary))',
    textMuted: 'rgb(var(--text-secondary))',
    border: 'rgb(var(--border-light))',
    accent: 'rgb(var(--status-success-light))',
  },

  // Utvikling - Info Blue (fremgang, statistikk)
  utvikling: {
    primary: 'rgb(var(--status-info))',
    light: 'rgb(var(--status-info-light))',
    dark: 'rgb(var(--status-info-dark))',
    surface: 'rgb(var(--surface-tertiary))',
    surfaceHover: 'rgb(var(--surface-elevated))',
    text: 'rgb(var(--text-primary))',
    textMuted: 'rgb(var(--text-secondary))',
    border: 'rgb(var(--border-light))',
    accent: 'rgb(var(--status-info-light))',
  },

  // Plan - Warning Amber (kalender, mål)
  plan: {
    primary: 'rgb(var(--status-warning))',
    light: 'rgb(var(--status-warning-light))',
    dark: 'rgb(var(--status-warning-dark))',
    surface: 'rgb(var(--surface-tertiary))',
    surfaceHover: 'rgb(var(--surface-elevated))',
    text: 'rgb(var(--text-primary))',
    textMuted: 'rgb(var(--text-secondary))',
    border: 'rgb(var(--border-light))',
    accent: 'rgb(var(--status-warning))',
  },

  // Mer - Category J Purple (profil, innstillinger)
  mer: {
    primary: 'rgb(var(--category-j))',
    light: 'rgb(var(--category-k))',
    dark: 'rgb(var(--category-j))',
    surface: 'rgb(var(--category-j-bg))',
    surfaceHover: 'rgb(var(--surface-elevated))',
    text: 'rgb(var(--text-primary))',
    textMuted: 'rgb(var(--text-secondary))',
    border: 'rgb(var(--border-light))',
    accent: 'rgb(var(--category-k))',
  },
} as const;

export type NavigationColorKey = keyof typeof navigationColors;

/**
 * CSS Custom Properties for navigasjonsfarger
 * Generer disse i runtime eller som CSS variabler
 */
export function getNavigationCSSVars(area: NavigationColorKey): Record<string, string> {
  const colors = navigationColors[area];
  return {
    '--nav-primary': colors.primary,
    '--nav-light': colors.light,
    '--nav-dark': colors.dark,
    '--nav-surface': colors.surface,
    '--nav-surface-hover': colors.surfaceHover,
    '--nav-text': colors.text,
    '--nav-text-muted': colors.textMuted,
    '--nav-border': colors.border,
    '--nav-accent': colors.accent,
  };
}

/**
 * Navigasjonsikoner mapping
 */
export const navigationIcons = {
  dashboard: 'Home',
  trening: 'Dumbbell',
  utvikling: 'TrendingUp',
  plan: 'Calendar',
  mer: 'MoreHorizontal',
} as const;

/**
 * Sidebar konfigurasjon
 */
export const sidebarConfig = {
  width: {
    collapsed: 72,
    expanded: 280,
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
  },
  animation: {
    duration: 200,
    easing: 'ease-in-out',
  },
};

/**
 * Bottom navigation konfigurasjon
 */
export const bottomNavConfig = {
  height: 64,
  iconSize: 24,
  labelSize: 12,
  activeScale: 1.1,
};

/**
 * Hub page layout konfigurasjon
 */
export const hubPageConfig = {
  maxWidth: 1200,
  padding: {
    mobile: 16,
    desktop: 32,
  },
  grid: {
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
    },
    gap: 16,
  },
  section: {
    headerHeight: 48,
    itemHeight: 64,
    borderRadius: 12,
  },
};

/**
 * Quick actions konfigurasjon
 */
export const quickActionsConfig = {
  buttonHeight: 44,
  borderRadius: 10,
  iconSize: 18,
};

/**
 * Badge konfigurasjon
 */
export const badgeConfig = {
  minWidth: 20,
  height: 20,
  borderRadius: 10,
  fontSize: 11,
  maxCount: 99,
};

export default navigationColors;
