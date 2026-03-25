/**
 * ============================================================
 * PLAYER NAVIGATION V3 - TIER Golf
 * ============================================================
 *
 * New 5-mode navigation structure with color-coded areas:
 *
 * MAIN AREAS:
 * 1. Dashboard (Home) - Overview and summary
 * 2. Plan (Amber) - Calendar, goals, tournaments
 * 3. Training (Green) - Logging, sessions, exercises, testing
 * 4. Analysis (Blue) - Progress, statistics, comparisons
 * 5. More (Purple) - Profile, settings, resources
 *
 * ============================================================
 */

export type AreaColor = 'default' | 'green' | 'blue' | 'amber' | 'purple';

export interface NavSubItem {
  href: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface NavArea {
  id: string;
  label: string;
  icon: string;
  color: AreaColor;
  href: string;
  hubPath: string;
  sections?: NavSection[];
  badge?: string;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavSubItem[];
}

/**
 * Color palette for the 5 areas
 */
export const areaColors: Record<AreaColor, {
  primary: string;
  light: string;
  dark: string;
  surface: string;
  text: string;
}> = {
  default: {
    primary: 'rgb(var(--tier-navy))', // TIER Navy (brand)
    light: 'rgb(var(--tier-navy-light))',
    dark: 'rgb(var(--tier-navy-dark))',
    surface: 'rgb(var(--surface-secondary))',
    text: 'rgb(var(--text-primary))',
  },
  green: {
    primary: 'rgb(var(--status-success))', // Success Green
    light: 'rgb(var(--status-success-light))',
    dark: 'rgb(var(--status-success-dark))',
    surface: 'rgb(var(--surface-tertiary))',
    text: 'rgb(var(--text-primary))',
  },
  blue: {
    primary: 'rgb(var(--status-info))', // Info Blue
    light: 'rgb(var(--status-info-light))',
    dark: 'rgb(var(--status-info-dark))',
    surface: 'rgb(var(--surface-tertiary))',
    text: 'rgb(var(--text-primary))',
  },
  amber: {
    primary: 'rgb(var(--status-warning))', // Warning Amber
    light: 'rgb(var(--status-warning-light))',
    dark: 'rgb(var(--status-warning-dark))',
    surface: 'rgb(var(--surface-tertiary))',
    text: 'rgb(var(--text-primary))',
  },
  purple: {
    primary: 'rgb(var(--category-j))', // Category J Purple
    light: 'rgb(var(--category-k))',
    dark: 'rgb(var(--category-j))',
    surface: 'rgb(var(--category-j-bg))',
    text: 'rgb(var(--text-primary))',
  },
};

/**
 * Main navigation for the player portal (5 areas)
 */
export const playerNavigationV3: NavArea[] = [
  // ────────────────────────────────────────────────────────────
  // 1. DASHBOARD - Overview and summary
  // ────────────────────────────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Overview',
    icon: 'HomeIcon',
    color: 'default',
    href: '/dashboard',
    hubPath: '/dashboard',
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        items: [
          { href: '/dashboard', label: 'Home', icon: 'HomeIcon', description: 'Your personal overview' },
          { href: '/dashboard/aktivitet', label: 'Status', icon: 'StatsIcon', description: 'Recent activities' },
          { href: '/mer/varsler', label: 'Sharing', icon: 'ShareIcon', description: 'Sharing settings' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 2. PLAN - Calendar, goals, tournaments (AMBER)
  // ────────────────────────────────────────────────────────────
  {
    id: 'plan',
    label: 'Plan',
    icon: 'CalendarIcon',
    color: 'amber',
    href: '/plan',
    hubPath: '/plan',
    sections: [
      {
        id: 'calendar',
        label: 'Calendar',
        items: [
          { href: '/plan/kalender', label: 'Calendar', icon: 'CalendarIcon', description: 'Your calendar' },
          { href: '/plan/booking', label: 'Booking', icon: 'CalendarIcon', description: 'Book training time' },
          { href: '/samlinger', label: 'Camps', icon: 'GolfFlagIcon', description: 'Training camps' },
        ],
      },
      {
        id: 'school',
        label: 'School',
        items: [
          { href: '/plan/skole', label: 'School Schedule', icon: 'CalendarIcon', description: 'Classes, subjects and assignments' },
        ],
      },
      {
        id: 'goals',
        label: 'Goals',
        items: [
          { href: '/plan/maal', label: 'Goals', icon: 'TargetIcon', description: 'Your goals' },
          { href: '/plan/aarsplan', label: 'Annual Plan', icon: 'ScorecardIcon', description: 'Long-term plan' },
        ],
      },
      {
        id: 'tournaments',
        label: 'Tournaments',
        items: [
          { href: '/plan/turneringer', label: 'Tournament Calendar', icon: 'GolfFlagIcon', description: 'All tournaments' },
          { href: '/plan/turneringer/mine', label: 'My Tournaments', icon: 'GolfFlagIcon', description: 'Registered tournaments' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 3. TRAINING - Logging, sessions, exercises, testing (GREEN)
  // ────────────────────────────────────────────────────────────
  {
    id: 'trening',
    label: 'Training',
    icon: 'SwingIcon',
    color: 'green',
    href: '/trening',
    hubPath: '/trening',
    sections: [
      {
        id: 'sessions',
        label: 'Training',
        items: [
          { href: '/trening/okter', label: 'My Sessions', icon: 'LessonsIcon', description: 'Planned sessions' },
          { href: '/trening/plan', label: 'My Training Plan', icon: 'CalendarIcon', description: 'Weekly plan' },
        ],
      },
      {
        id: 'logging',
        label: 'Log',
        items: [
          { href: '/trening/logg', label: 'Log Training Session', icon: 'AddIcon', description: 'Log training session' },
          { href: '/trening/dagbok', label: 'Training History', icon: 'ScorecardIcon', description: 'View training history' },
          { href: '/training/statistics', label: 'Training Analysis', icon: 'StatsIcon', description: 'Weekly/monthly statistics and analysis' },
        ],
      },
      {
        id: 'exercises',
        label: 'Technical Plan',
        items: [
          { href: '/plan/teknisk-plan', label: 'P-System (P1.0-P10.0)', icon: 'TargetIcon', description: 'Technical development plan P-system' },
          { href: '/trening/ovelser', label: 'Exercises', icon: 'ClubIcon', description: 'Exercise library' },
          { href: '/trening/videoer', label: 'Videos', icon: 'VideoIcon', description: 'Instructional videos' },
          { href: '/videos/compare', label: 'Compare Videos', icon: 'CompareIcon', description: 'Compare videos side-by-side' },
          { href: '/trening/trackman-upload', label: 'TrackMan', icon: 'RefreshIcon', description: 'Upload TrackMan data' },
        ],
      },
      {
        id: 'testing',
        label: 'Testing',
        items: [
          { href: '/trening/testing', label: 'Test Protocol', icon: 'TargetIcon', description: 'Test overview' },
          { href: '/trening/testing/registrer', label: 'Log Test', icon: 'AddIcon', description: 'New test result' },
        ],
      },
      {
        id: 'knowledge',
        label: 'Knowledge',
        items: [
          { href: '/trening/kategorisystem', label: 'Category System', icon: 'LessonsIcon', description: 'Understand the training system' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 4. ANALYSIS - Progress, statistics, comparisons (BLUE)
  // ────────────────────────────────────────────────────────────
  {
    id: 'utvikling',
    label: 'Analysis',
    icon: 'StatsIcon',
    color: 'blue',
    href: '/analyse',
    hubPath: '/analyse',
    sections: [
      {
        id: 'progress',
        label: 'Progress & Statistics',
        items: [
          { href: '/analyse', label: 'Overview', icon: 'StatsIcon', description: 'Your progression' },
          { href: '/analyse/statistikk', label: 'Statistics', icon: 'ScorecardIcon', description: 'Detailed statistics' },
          { href: '/analyse/sammenligninger', label: 'Comparisons', icon: 'CompareIcon', description: 'Compare performances' },
          { href: '/analyse/rapporter', label: 'Reports', icon: 'StatsIcon', description: 'Progress reports' },
          { href: '/utvikling/historikk', label: 'History', icon: 'RefreshIcon', description: 'Previous results' },
        ],
      },
      {
        id: 'tests',
        label: 'Tests',
        items: [
          { href: '/analyse/tester', label: 'Test Results', icon: 'TargetIcon', description: 'All test results' },
        ],
      },
      {
        id: 'achievements',
        label: 'Achievements',
        items: [
          { href: '/analyse/prestasjoner', label: 'Achievements', icon: 'CheckIcon', description: 'Badges and achievements' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 5. MORE - Profile, settings, resources (PURPLE)
  // ────────────────────────────────────────────────────────────
  {
    id: 'mer',
    label: 'More',
    icon: 'SettingsIcon',
    color: 'purple',
    href: '/mer',
    hubPath: '/mer',
    badge: 'unreadMessages',
    sections: [
      {
        id: 'profile',
        label: 'Profile',
        items: [
          { href: '/mer/profil', label: 'My Profile', icon: 'ProfileIcon', description: 'Your profile' },
          { href: '/mer/trenerteam', label: 'Coaching Team', icon: 'ProfileIcon', description: 'Your coaches' },
        ],
      },
      {
        id: 'communication',
        label: 'Communication',
        items: [
          { href: '/mer/meldinger', label: 'Messages', icon: 'ChatIcon', description: 'Inbox' },
          { href: '/mer/chat', label: 'Chat', icon: 'ChatIcon', description: 'Real-time chat with coach' },
          { href: '/mer/feedback', label: 'Coach Feedback', icon: 'ChatIcon', description: 'Feedback' },
        ],
      },
      {
        id: 'resources',
        label: 'Resources',
        items: [
          { href: '/mer/kunnskap', label: 'Knowledge Base', icon: 'LessonsIcon', description: 'Articles and guides' },
          { href: '/plan/kalender?action=book', label: 'Book Coach', icon: 'UsersIcon', description: 'Schedule time with coach' },
          { href: '/mer/notater', label: 'Notes', icon: 'ScorecardIcon', description: 'Your notes' },
          { href: '/samlinger', label: 'Camps', icon: 'FolderIcon', description: 'Training camps' },
          { href: '/arkiv', label: 'Archive', icon: 'ArchiveIcon', description: 'Archived items' },
        ],
      },
      {
        id: 'settings',
        label: 'Settings',
        items: [
          { href: '/mer/innstillinger', label: 'Settings', icon: 'SettingsIcon', description: 'App settings' },
          { href: '/mer/varsler', label: 'Notifications & Sharing', icon: 'ShareIcon', description: 'Sharing settings' },
          { href: '/mer/kalibrering', label: 'Calibration', icon: 'SettingsIcon', description: 'Test calibration' },
          { href: '/billing', label: 'Subscription', icon: 'CreditCardIcon', description: 'Manage subscription' },
        ],
      },
    ],
  },
];

/**
 * Quick actions for dashboard
 */
export const playerQuickActionsV3 = [
  {
    label: 'Plan New Session',
    icon: 'AddIcon',
    href: '/session/new',
    variant: 'primary' as const,
  },
  {
    label: 'Quick Log',
    icon: 'ClockIcon',
    href: '/session/quick',
    variant: 'secondary' as const,
  },
  {
    label: 'Log Test',
    icon: 'TargetIcon',
    href: '/trening/testing/registrer',
    variant: 'secondary' as const,
  },
];

/**
 * Bottom navigation items (mobile)
 */
export const bottomNavItems = playerNavigationV3.map(area => ({
  id: area.id,
  label: area.label,
  icon: area.icon,
  href: area.hubPath,
  color: area.color,
  badge: area.badge,
}));

/**
 * Find area based on path
 */
export function getAreaByPath(path: string): NavArea | undefined {
  return playerNavigationV3.find(area => {
    if (path === area.hubPath || path.startsWith(area.hubPath + '/')) return true;
    if (area.sections) {
      for (const section of area.sections) {
        for (const item of section.items) {
          if (path === item.href || path.startsWith(item.href + '/')) return true;
        }
      }
    }
    return false;
  });
}

/**
 * Find area based on ID
 */
export function getAreaById(id: string): NavArea | undefined {
  return playerNavigationV3.find(area => area.id === id);
}

/**
 * Flat list of all navigation items
 */
export function getAllNavItems(): Array<NavSubItem & { areaId: string; areaLabel: string; color: AreaColor }> {
  const items: Array<NavSubItem & { areaId: string; areaLabel: string; color: AreaColor }> = [];

  for (const area of playerNavigationV3) {
    if (area.sections) {
      for (const section of area.sections) {
        for (const item of section.items) {
          items.push({
            ...item,
            areaId: area.id,
            areaLabel: area.label,
            color: area.color,
          });
        }
      }
    }
  }

  return items;
}

/**
 * Route redirects from old to new paths
 */
export const routeRedirectsV3: Record<string, string> = {
  '/': '/dashboard',
  '/hjem': '/dashboard',
  '/tren/logg': '/trening/logg',
  '/tren/okter': '/trening/okter',
  '/tren/ovelser': '/trening/ovelser',
  '/tren/testing': '/trening/testing',
  '/tren/testing/registrer': '/trening/testing/registrer',
  '/tren/testing/resultater': '/utvikling/testresultater',
  '/tren/testing/krav': '/utvikling/krav',
  '/analyser/utvikling': '/utvikling/oversikt',
  '/analyser/statistikk': '/utvikling/statistikk',
  '/analyser/mal': '/plan/maal',
  '/analyser/historikk': '/utvikling/historikk',
  '/planlegg/ukeplan': '/plan/ukeplan',
  '/planlegg/kalender': '/plan/kalender',
  '/planlegg/turneringer/kalender': '/plan/turneringer',
  '/planlegg/turneringer/mine': '/plan/turneringer/mine',
  '/samhandle/meldinger': '/mer/meldinger',
  '/samhandle/feedback': '/mer/feedback',
  '/samhandle/kunnskap': '/mer/kunnskap',
  '/profil': '/mer/profil',
  '/innstillinger': '/mer/innstillinger',
};

// ============================================================
// FLAT NAVIGATION - Simplified 5-mode structure (Phase 1 UX)
// ============================================================
// Used by new sidebar without nested menus.
// Sub-pages are shown as horizontal tabs on each hub page.

export interface FlatNavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  color: AreaColor;
  badge?: string;
}

/**
 * Simplified navigation with 5 main items (no nesting)
 * Matches V4 navigation structure: Home, Plan, Training, Analysis, More
 */
export const playerNavigationFlat: FlatNavItem[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: 'Home',
    href: '/dashboard',
    color: 'default',
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: 'Calendar',
    href: '/plan',
    color: 'amber',
  },
  {
    id: 'trening',
    label: 'Training',
    icon: 'Dumbbell',
    href: '/trening',
    color: 'green',
  },
  {
    id: 'fremgang',
    label: 'Analysis',
    icon: 'TrendingUp',
    href: '/analyse',
    color: 'blue',
  },
  {
    id: 'mer',
    label: 'More',
    icon: 'MoreHorizontal',
    href: '/mer',
    color: 'purple',
    badge: 'unreadMessages',
  },
];

/**
 * User menu dropdown items (shown in header)
 */
export const userMenuItems = [
  { href: '/mer/profil', label: 'My Profile', icon: 'User' },
  { href: '/mer/innstillinger', label: 'Settings', icon: 'Settings' },
  { href: '/billing', label: 'Subscription', icon: 'CreditCard' },
  { href: '/mer/kunnskap', label: 'Help & Support', icon: 'HelpCircle' },
];

/**
 * Horizontal tabs for each area (shown on hub pages)
 */
export const areaTabsConfig = {
  trening: [
    { href: '/trening', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/trening/logg', label: 'Log Session', icon: 'Plus' },
    { href: '/trening/dagbok', label: 'History', icon: 'History' },
    { href: '/trening/ovelser', label: 'Exercises', icon: 'Dumbbell' },
    { href: '/trening/testing', label: 'Testing', icon: 'Target' },
  ],
  fremgang: [
    { href: '/analyse', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/analyse/statistikk', label: 'Statistics', icon: 'BarChart3' },
    { href: '/analyse/tester', label: 'Tests', icon: 'ClipboardList' },
    { href: '/analyse/prestasjoner', label: 'Achievements', icon: 'Award' },
  ],
  // Keep utvikling as alias for fremgang for backwards compatibility
  utvikling: [
    { href: '/analyse', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/analyse/statistikk', label: 'Statistics', icon: 'BarChart3' },
    { href: '/analyse/tester', label: 'Tests', icon: 'ClipboardList' },
    { href: '/analyse/prestasjoner', label: 'Achievements', icon: 'Award' },
  ],
  plan: [
    { href: '/plan', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/plan/maal', label: 'Goals', icon: 'Target' },
    { href: '/plan/kalender', label: 'Planner', icon: 'Calendar' },
    { href: '/plan/turneringer', label: 'Tournaments', icon: 'Trophy' },
  ],
};

/**
 * Get tabs for an area
 */
export function getTabsForArea(areaId: string): Array<{ href: string; label: string; icon: string }> {
  return areaTabsConfig[areaId as keyof typeof areaTabsConfig] || [];
}

/**
 * Find area based on path (for flat navigation)
 */
export function getFlatAreaByPath(path: string): FlatNavItem | undefined {
  return playerNavigationFlat.find(item => {
    if (path === item.href) return true;
    if (item.href !== '/' && path.startsWith(item.href + '/')) return true;
    return false;
  });
}

export default playerNavigationV3;
