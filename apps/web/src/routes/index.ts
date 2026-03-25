/**
 * Routes Module
 *
 * This module provides centralized exports for route-related components and utilities.
 * The actual routing is still handled in App.jsx, but this module makes it easier
 * to migrate to a more modular routing structure in the future.
 *
 * V2: Ny rutestruktur med 5 toppnivå for spillerportal:
 * - /hjem
 * - /tren/*
 * - /planlegg/*
 * - /analyser/*
 * - /samhandle/*
 *
 * Usage:
 *   import { layouts, lazyImports } from './routes';
 *   // or
 *   import { AuthenticatedLayout, Login } from './routes';
 */

// Re-export all lazy imports
export * from './lazyImports';

// Re-export all layouts
export * from './layouts';

// ============================================================
// V2 Route Constants - Ny 5-modus struktur
// ============================================================
export const ROUTES_V2 = {
  // ── Hjem ──────────────────────────────────────────────────
  HJEM: '/hjem',

  // ── Tren ──────────────────────────────────────────────────
  TREN: {
    ROOT: '/tren',
    LOGG: '/tren/logg',
    OKTER: '/tren/okter',
    OVELSER: '/tren/ovelser',
    TESTING: '/tren/testing',
    TESTING_REGISTRER: '/tren/testing/registrer',
    TESTING_RESULTATER: '/tren/testing/resultater',
    TESTING_KRAV: '/tren/testing/krav',
  },

  // ── Planlegg ──────────────────────────────────────────────
  PLANLEGG: {
    ROOT: '/planlegg',
    UKEPLAN: '/planlegg/ukeplan',
    KALENDER: '/planlegg/kalender',
    TURNERINGER_KALENDER: '/planlegg/turneringer/kalender',
    TURNERINGER_MINE: '/planlegg/turneringer/mine',
  },

  // ── Analyser ──────────────────────────────────────────────
  ANALYSER: {
    ROOT: '/analyser',
    UTVIKLING: '/analyser/utvikling',
    STATISTIKK: '/analyser/statistikk',
    MAL: '/analyser/mal',
    HISTORIKK: '/analyser/historikk',
  },

  // ── Samhandle ─────────────────────────────────────────────
  SAMHANDLE: {
    ROOT: '/samhandle',
    MELDINGER: '/samhandle/meldinger',
    FEEDBACK: '/samhandle/feedback',
    KUNNSKAP: '/samhandle/kunnskap',
    SKOLE: '/samhandle/skole',
  },
} as const;

// ============================================================
// Legacy Route Constants (for backward compatibility)
// ============================================================
export const ROUTES = {
  // Public
  ROOT: '/',
  LOGIN: '/login',
  WELCOME: '/welcome',
  PRICING: '/pricing',
  CHECKOUT: '/checkout',
  CHECKOUT_SUCCESS: '/checkout/success',

  // Dashboard (redirect to /hjem)
  DASHBOARD: '/dashboard',

  // Profile
  PROFILE: '/profil',
  PROFILE_UPDATE: '/profil/oppdater',

  // Player features (legacy - use ROUTES_V2 for new code)
  GOALS: '/maalsetninger',
  ANNUAL_PLAN: '/aarsplan',
  TRAINING: '/trening',
  CALENDAR: '/calendar',
  SESSIONS: '/sessions',
  TESTS: '/tester',
  ACHIEVEMENTS: '/prestasjoner',
  BADGES: '/merker',
  TOURNAMENTS: '/turneringer',
  MESSAGES: '/meldinger',
  NOTIFICATIONS: '/varsler',
  NOTES: '/notater',
  RESOURCES: '/ressurser',
  ARCHIVE: '/arkiv',
  SETTINGS: '/innstillinger',

  // Billing & Subscription
  BILLING: '/billing',
  SUBSCRIPTION_MANAGEMENT: '/innstillinger/subscription',

  // Video
  VIDEO_LIBRARY: '/video/library',
  VIDEO_ANALYSIS: '/video/analysis',
  VIDEO_COMPARISON: '/video/comparison',
  VIDEO_PROGRESS: '/video/progress',

  // Stats
  STATS: '/stats',
  PLAYER_STATS: '/player-stats',
  STROKES_GAINED: '/strokes-gained',

  // Manual Stats & Rounds
  ROUNDS: '/rounds',
  ROUNDS_NEW: '/rounds/new',
  ROUND_DETAIL: '/rounds/:roundId',
  ROUND_REVIEW: '/rounds/:roundId/review',

  // Development
  PROGRESS: '/min-utvikling',
  BREAKING_POINTS: '/min-utvikling/breaking-points',

  // Mobile
  MOBILE_HOME: '/m/home',
  MOBILE_PLAN: '/m/plan',
  MOBILE_LOG: '/m/log',
  MOBILE_CALENDAR: '/m/calendar',
  MOBILE_CALIBRATION: '/m/calibration',

  // Coach
  COACH: {
    DASHBOARD: '/coach/dashboard',
    ATHLETES: '/coach/athletes',
    ATHLETE_DETAIL: '/coach/athletes/:id',
    GROUPS: '/coach/groups',
    TRAINING_PLAN: '/coach/training-plan',
    MESSAGES: '/coach/messages',
    STATS: '/coach/stats',
    BOOKING: '/coach/booking',
    TOURNAMENTS: '/coach/tournaments',
    EXERCISES: '/coach/exercises',
    SETTINGS: '/coach/settings',
  },

  // Admin
  ADMIN: {
    SYSTEM: '/admin/system-overview',
    COACHES: '/admin/coaches',
    FEATURE_FLAGS: '/admin/feature-flags',
    TIER_MANAGEMENT: '/admin/tier-management',
    ESCALATION: '/admin/escalation',
    PAYMENTS: '/admin/payments',
    SUBSCRIPTION_ANALYTICS: '/admin/analytics/subscriptions',
  },

  // Dev (development only)
  DEV: {
    UI_LAB: '/lab/ui',
    STATS_LAB: '/lab/stats',
    CALENDAR_LAB: '/lab/calendar',
    UI_CANON: '/lab/ui-canon',
  },
} as const;

// Type for route paths
export type RoutePath =
  | typeof ROUTES[keyof Omit<typeof ROUTES, 'COACH' | 'ADMIN' | 'DEV'>]
  | typeof ROUTES.COACH[keyof typeof ROUTES.COACH]
  | typeof ROUTES.ADMIN[keyof typeof ROUTES.ADMIN]
  | typeof ROUTES.DEV[keyof typeof ROUTES.DEV];
