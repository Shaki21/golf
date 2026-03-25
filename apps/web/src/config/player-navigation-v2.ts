/**
 * ============================================================
 * PLAYER NAVIGATION V2 - TIER Golf
 * ============================================================
 *
 * Simplified 5-mode navigation structure for the player portal.
 * Reduced from 13 to 5 top-level options for better UX.
 *
 * TOP LEVEL (5 modes):
 * 1. Home     - Dashboard and overview
 * 2. Train    - Training, logging, sessions, testing
 * 3. Plan     - Calendar, weekly plan, tournaments
 * 4. Analyze  - Development, statistics, goals, history
 * 5. Collaborate - Messages, feedback, knowledge, (school)
 *
 * ============================================================
 */

export interface NavSubItem {
  href: string;
  label: string;
  icon?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  submenu?: NavSubItem[];
  badge?: string;
}

/**
 * Main navigation for player portal (5 top level)
 */
export const playerNavigationV2: NavItem[] = [
  // ────────────────────────────────────────────────────────────
  // 1. HOME - Dashboard and overview
  // ────────────────────────────────────────────────────────────
  {
    id: 'hjem',
    label: 'Home',
    icon: 'Home',
    href: '/hjem',
  },

  // ────────────────────────────────────────────────────────────
  // 2. TRAIN - Training, logging, sessions, testing
  // ────────────────────────────────────────────────────────────
  {
    id: 'tren',
    label: 'Train',
    icon: 'Dumbbell',
    submenu: [
      { href: '/tren/logg', label: 'Log training', icon: 'Plus' },
      { href: '/tren/okter', label: 'My sessions', icon: 'ClipboardList' },
      { href: '/tren/ovelser', label: 'Exercise library', icon: 'Library' },
      { href: '/tren/testing', label: 'Testing', icon: 'Target' },
      { href: '/tren/testing/registrer', label: 'Register test', icon: 'PlusCircle' },
      { href: '/tren/testing/resultater', label: 'Test results', icon: 'BarChart' },
      { href: '/tren/testing/krav', label: 'Category requirements', icon: 'Award' },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 3. PLAN - Calendar, weekly plan, tournaments
  // ────────────────────────────────────────────────────────────
  {
    id: 'planlegg',
    label: 'Plan',
    icon: 'Calendar',
    submenu: [
      { href: '/planlegg/ukeplan', label: 'Weekly plan', icon: 'CalendarDays' },
      { href: '/planlegg/kalender', label: 'Calendar', icon: 'Calendar' },
      { href: '/planlegg/turneringer/kalender', label: 'Tournament calendar', icon: 'Trophy' },
      { href: '/planlegg/turneringer/mine', label: 'My tournaments', icon: 'Flag' },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 4. ANALYZE - Development, statistics, goals, history
  // ────────────────────────────────────────────────────────────
  {
    id: 'analyser',
    label: 'Analyze',
    icon: 'TrendingUp',
    submenu: [
      { href: '/analyser/utvikling', label: 'My development', icon: 'TrendingUp' },
      { href: '/analyser/statistikk', label: 'Statistics', icon: 'BarChart3' },
      { href: '/analyser/mal', label: 'Goals', icon: 'Target' },
      { href: '/analyser/historikk', label: 'History', icon: 'History' },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 5. COLLABORATE - Messages, feedback, knowledge
  // ────────────────────────────────────────────────────────────
  {
    id: 'samhandle',
    label: 'Collaborate',
    icon: 'MessageCircle',
    badge: 'unreadMessages',
    submenu: [
      { href: '/samhandle/meldinger', label: 'Messages', icon: 'Mail' },
      { href: '/samhandle/feedback', label: 'Coach feedback', icon: 'MessageSquare' },
      { href: '/samhandle/kunnskap', label: 'Resources', icon: 'BookOpen' },
    ],
  },
];

/**
 * Quick actions for player dashboard
 */
export const playerQuickActionsV2 = [
  {
    label: 'Log training',
    icon: 'Plus',
    href: '/tren/logg',
    variant: 'primary' as const,
  },
  {
    label: 'Register test',
    icon: 'Target',
    href: '/tren/testing/registrer',
    variant: 'secondary' as const,
  },
];

/**
 * Settings menu items (moved to profile dropdown)
 */
export const settingsMenuItems = [
  { href: '/profil', label: 'My profile', icon: 'User' },
  { href: '/profil/oppdater', label: 'Edit profile', icon: 'Edit' },
  { href: '/innstillinger/varsler', label: 'Notification settings', icon: 'Bell' },
  { href: '/trenerteam', label: 'Coaching team', icon: 'Users' },
  { href: '/kalibrering', label: 'Calibration', icon: 'Sliders' },
];

/**
 * School menu (only visible if player has school context)
 * Integrated as submenu item in Collaborate
 */
export const schoolMenuItem: NavSubItem = {
  href: '/samhandle/skole',
  label: 'School',
  icon: 'GraduationCap',
};

/**
 * Badge configurations
 */
export const badgeConfigV2 = {
  unreadMessages: {
    source: 'notifications',
    color: 'error',
    max: 99,
  },
};

/**
 * Mapping from old to new URL structure
 */
export const routeRedirects: Record<string, string> = {
  '/': '/hjem',
  '/dashboard': '/hjem',
  '/trening/logg': '/tren/logg',
  '/trening/dagbok': '/tren/logg',
  '/sessions': '/tren/okter',
  '/ovelsesbibliotek': '/tren/ovelser',
  '/oevelser': '/tren/ovelser',
  '/testprotokoll': '/tren/testing',
  '/testing/registrer': '/tren/testing/registrer',
  '/testresultater': '/tren/testing/resultater',
  '/testing/krav': '/tren/testing/krav',
  '/kalender': '/planlegg/kalender',
  '/turneringskalender': '/planlegg/turneringer/kalender',
  '/mine-turneringer': '/planlegg/turneringer/mine',
  '/statistikk': '/analyser/statistikk',
  '/min-utvikling': '/analyser/utvikling',
  '/utvikling': '/analyser/utvikling',
  '/maalsetninger': '/analyser/mal',
  '/progress': '/analyser/historikk',
  '/meldinger': '/samhandle/meldinger',
  '/kommunikasjon': '/samhandle/meldinger',
  '/ressurser': '/samhandle/kunnskap',
  '/kunnskap': '/samhandle/kunnskap',
  '/skoleplan': '/samhandle/skole',
};

export default playerNavigationV2;
