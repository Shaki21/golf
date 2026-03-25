/**
 * ============================================================
 * PLAYER NAVIGATION V4 - TIER Golf
 * ============================================================
 *
 * Hub-based navigation structure with reduced menu complexity:
 *
 * MAIN AREAS:
 * 1. Dashboard (Home) - Overview and summary
 * 2. Goals (Yellow) - Goals and progression
 * 3. Planner (Amber) - Annual plan, training plan, school plan, tournaments
 * 4. Training (Green) - Logging, sessions, exercises, testing
 * 5. Analysis (Blue) - Progress, statistics, comparisons (replaces "My Development")
 * 6. More (Purple) - Profile, settings, resources
 *
 * KEY CHANGES IN V4:
 * - "My Development" → "Analysis" (17 menu items → 6 hub items)
 * - Hub-based structure with tabs instead of separate pages
 * - ~60% reduction in menu items for the analysis area
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
 * Main navigation for player portal V4 (5 areas, hub-based)
 */
export const playerNavigationV4: NavArea[] = [
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
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 2. GOALS - Goals and progression (YELLOW)
  // ────────────────────────────────────────────────────────────
  {
    id: 'maalsetninger',
    label: 'Goals',
    icon: 'TargetIcon',
    color: 'amber',
    href: '/maalsetninger',
    hubPath: '/maalsetninger',
    sections: [
      {
        id: 'maal',
        label: 'Goals',
        items: [
          { href: '/maalsetninger', label: 'My goals', icon: 'TargetIcon', description: 'Result goals and process goals' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 3. PLANNER - Annual plan, training plan, school plan (AMBER/ORANGE)
  // ────────────────────────────────────────────────────────────
  {
    id: 'planlegger',
    label: 'Planner',
    icon: 'CalendarIcon',
    color: 'amber',
    href: '/plan',
    hubPath: '/plan',
    sections: [
      {
        id: 'planer',
        label: 'Plans',
        items: [
          { href: '/plan/aarsplan', label: 'Annual plan', icon: 'ScorecardIcon', description: 'Periodization and annual plan' },
          { href: '/plan/ukeplan', label: 'Training plan', icon: 'CalendarIcon', description: 'Weekly training plan' },
          { href: '/plan/skole', label: 'School plan', icon: 'CalendarIcon', description: 'School hours, exams and assignments' },
        ],
      },
      {
        id: 'turneringer',
        label: 'Tournaments',
        items: [
          { href: '/plan/turneringer/mine', label: 'My tournaments', icon: 'GolfFlagIcon', description: 'Registered tournaments' },
          { href: '/plan/turneringer', label: 'Tournament calendar', icon: 'GolfFlagIcon', description: 'All tournaments' },
          { href: '/plan/turneringsforberedelse', label: 'Tournament preparation', icon: 'TargetIcon', description: 'Course strategy and checklist' },
        ],
      },
      {
        id: 'diverse',
        label: 'Other',
        items: [
          { href: '/plan/booking', label: 'Booking', icon: 'CalendarIcon', description: 'Book training time' },
          { href: '/mer/samlinger', label: 'Camps', icon: 'GolfFlagIcon', description: 'Training camps' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 4. TRAINING - Logging, sessions, exercises, testing (GREEN)
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
        id: 'okter',
        label: 'Training',
        items: [
          { href: '/trening/okter', label: 'My sessions', icon: 'LessonsIcon', description: 'Scheduled sessions' },
          { href: '/trening/plan', label: 'My training plan', icon: 'CalendarIcon', description: 'Weekly plan' },
        ],
      },
      {
        id: 'logging',
        label: 'Log',
        items: [
          { href: '/trening/logg', label: 'Log training session', icon: 'AddIcon', description: 'Register training session' },
          { href: '/trening/dagbok', label: 'Training history', icon: 'ScorecardIcon', description: 'View training history' },
        ],
      },
      {
        id: 'ovelser',
        label: 'Technical plan',
        items: [
          { href: '/trening/teknikkplan', label: 'Technique plan', icon: 'TargetIcon', description: 'Technical development plan' },
          { href: '/trening/ovelser', label: 'My exercises', icon: 'ClubIcon', description: 'My exercises' },
          { href: '/trening/video', label: 'Video', icon: 'VideoIcon', description: 'Videos, comparison and annotation' },
        ],
      },
      {
        id: 'testing',
        label: 'Testing',
        items: [
          { href: '/trening/testing', label: 'Test protocol', icon: 'TargetIcon', description: 'Test overview' },
          { href: '/trening/testing/registrer', label: 'Register test', icon: 'AddIcon', description: 'New test result' },
        ],
      },
      {
        id: 'kunnskap',
        label: 'Knowledge',
        items: [
          { href: '/trening/fokus', label: 'Training focus', icon: 'TargetIcon', description: 'AI-based recommendations for what to focus on' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 5. ANALYSIS - Progress, statistics, comparisons (BLUE)
  // ────────────────────────────────────────────────────────────
  // NOTE: This replaces "My Development" and reduces 17 items to 6 hubs
  // ────────────────────────────────────────────────────────────
  {
    id: 'analyse',
    label: 'Analysis',
    icon: 'StatsIcon',
    color: 'blue',
    href: '/analyse',
    hubPath: '/analyse',
    sections: [
      {
        id: 'analyse-hubs',
        label: 'Analysis',
        items: [
          {
            href: '/analyse/statistikk',
            label: 'Statistics',
            icon: 'ChartBarIcon',
            description: 'Stats, progress, strokes gained, trends'
          },
          {
            href: '/analyse/sammenligninger',
            label: 'Comparisons',
            icon: 'UsersIcon',
            description: 'Peer, pro and multi-player'
          },
          {
            href: '/analyse/rapporter',
            label: 'Reports',
            icon: 'DocumentIcon',
            description: 'Progress reports from coach'
          },
          {
            href: '/analyse/tester',
            label: 'Tests',
            icon: 'ClipboardCheckIcon',
            description: 'Test results and requirements'
          },
          {
            href: '/analyse/prestasjoner',
            label: 'Achievements',
            icon: 'TrophyIcon',
            description: 'Badges and achievements'
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 6. MORE - Profile, settings, resources (PURPLE)
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
        id: 'profil',
        label: 'Profile',
        items: [
          { href: '/mer/profil', label: 'My profile', icon: 'ProfileIcon', description: 'Your profile' },
          { href: '/mer/trenerteam', label: 'Coach team', icon: 'ProfileIcon', description: 'Your coaches' },
        ],
      },
      {
        id: 'kommunikasjon',
        label: 'Communication',
        items: [
          { href: '/mer/meldinger', label: 'Messages', icon: 'ChatIcon', description: 'Inbox' },
          { href: '/mer/feedback', label: 'Coach feedback', icon: 'ChatIcon', description: 'Feedback' },
        ],
      },
      {
        id: 'ressurser',
        label: 'Resources',
        items: [
          { href: '/plan/kalender?action=book', label: 'Book coach', icon: 'UsersIcon', description: 'Book time with coach' },
          { href: '/mer/arkiv', label: 'Archive', icon: 'ArchiveIcon', description: 'Manage archived items' },
          { href: '/mer/betaling', label: 'Payment & Billing', icon: 'CreditCardIcon', description: 'Manage payment methods and subscriptions' },
        ],
      },
      {
        id: 'innstillinger',
        label: 'Settings',
        items: [
          { href: '/mer/innstillinger', label: 'Settings', icon: 'SettingsIcon', description: 'App settings' },
          { href: '/mer/kalibrering', label: 'Calibration', icon: 'SettingsIcon', description: 'Test calibration' },
          { href: '/mer/support', label: 'Support', icon: 'ChatIcon', description: 'Get help and support' },
        ],
      },
      {
        id: 'admin',
        label: 'Administration',
        items: [
          { href: '/mer/admin', label: 'Admin Panel', icon: 'SettingsIcon', description: 'System administration' },
          { href: '/mer/admin/feature-flags', label: 'Feature Flags', icon: 'SettingsIcon', description: 'Feature flags administration' },
          { href: '/mer/admin/audit', label: 'Audit log', icon: 'ClipboardIcon', description: 'System audit log' },
        ],
      },
    ],
  },
];

/**
 * Quick actions for dashboard
 */
export const playerQuickActionsV4 = [
  {
    label: 'Log training',
    icon: 'AddIcon',
    href: '/trening/logg',
    variant: 'primary' as const,
  },
  {
    label: 'Register test',
    icon: 'TargetIcon',
    href: '/trening/testing/registrer',
    variant: 'secondary' as const,
  },
];

/**
 * Bottom navigation items (mobile)
 */
export const bottomNavItemsV4 = playerNavigationV4.map(area => ({
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
  return playerNavigationV4.find(area => {
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
  return playerNavigationV4.find(area => area.id === id);
}

/**
 * Flat list of all navigation items
 */
export function getAllNavItems(): Array<NavSubItem & { areaId: string; areaLabel: string; color: AreaColor }> {
  const items: Array<NavSubItem & { areaId: string; areaLabel: string; color: AreaColor }> = [];

  for (const area of playerNavigationV4) {
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
 * ============================================================
 * V4 ROUTE REDIRECTS - From old "utvikling/*" to new "analyse/*"
 * ============================================================
 *
 * These redirects ensure that old links still work:
 * - Bookmarks
 * - SEO
 * - External links
 *
 * All /utvikling/* paths redirect to corresponding /analyse/* paths
 */
export const routeRedirectsV4: Record<string, string> = {
  // Root redirects
  '/': '/dashboard',
  '/hjem': '/dashboard',

  // ===================================================================
  // ANALYSIS REDIRECTS - Old /utvikling/* → New /analyse/* structure
  // ===================================================================

  // Hub redirect
  '/utvikling': '/analyse',
  '/utvikling/oversikt': '/analyse',

  // Statistikk hub (4 tabs: oversikt, strokes-gained, trender, status-maal)
  '/utvikling/statistikk': '/analyse/statistikk',
  '/utvikling/strokes-gained': '/analyse/statistikk?tab=strokes-gained',
  '/utvikling/fremgang': '/analyse/statistikk?tab=trender',
  '/utvikling/historikk': '/analyse/statistikk/historikk',  // Deep page

  // Absorbed into StatistikkHub tabs:
  '/utvikling/vendepunkter': '/analyse/statistikk?tab=oversikt#vendepunkter',
  '/utvikling/innsikter': '/analyse/statistikk?tab=status-maal',
  '/utvikling/treningsomrader': '/analyse/statistikk?tab=trender#treningsomrader',

  // Sammenligninger hub (3 tabs: peer, proff, multi)
  '/utvikling/peer-sammenligning': '/analyse/sammenligninger?tab=peer',
  '/utvikling/sammenlign-proff': '/analyse/sammenligninger?tab=proff',
  '/utvikling/datagolf': '/analyse/sammenligninger?tab=proff',
  '/utvikling/sammenligninger': '/analyse/sammenligninger?tab=multi',

  // Rapporter hub
  '/utvikling/rapporter': '/analyse/rapporter',

  // Tester hub (3 tabs: oversikt, resultater, krav)
  '/utvikling/testresultater': '/analyse/tester?tab=resultater',
  '/utvikling/krav': '/analyse/tester?tab=krav',

  // Prestasjoner hub (2 tabs: badges, achievements)
  '/utvikling/badges': '/analyse/prestasjoner?tab=badges',
  '/utvikling/achievements': '/analyse/prestasjoner?tab=achievements',

  // ===================================================================
  // TRENING REDIRECTS - V2 → V3 (unchanged from v3)
  // ===================================================================
  '/tren': '/trening',
  '/tren/logg': '/trening/logg',
  '/tren/okter': '/trening/okter',
  '/tren/ovelser': '/trening/ovelser',
  '/tren/testing': '/trening/testing',
  '/tren/testing/registrer': '/trening/testing/registrer',
  '/tren/testing/resultater': '/analyse/tester?tab=resultater',
  '/tren/testing/krav': '/analyse/tester?tab=krav',

  // ===================================================================
  // PLAN → PLANLEGGER & MÅLSETNINGER REDIRECTS (V4 restructure)
  // ===================================================================
  // Old /plan/* paths redirected to new structure
  '/plan': '/planlegger',
  '/plan/kalender': '/planlegger/treningsplan',
  '/plan/aarsplan': '/planlegger/aarsplan',
  '/plan/skole': '/planlegger/skoleplan',
  '/plan/turneringer': '/planlegger/turneringer',
  '/plan/turneringer/mine': '/planlegger/turneringer/mine',
  '/plan/turneringsforberedelse': '/planlegger/turneringsforberedelse',
  '/plan/booking': '/planlegger/booking',
  '/plan/sesonger': '/planlegger/aarsplan',
  '/plan/intake': '/mer/intake',

  // Målsetninger
  '/plan/maal': '/maalsetninger/mine',
  '/analyser/mal': '/maalsetninger/mine',

  // Legacy V2 → V4
  '/planlegg': '/planlegger',
  '/planlegg/ukeplan': '/planlegger/treningsplan',
  '/planlegg/kalender': '/planlegger/treningsplan',
  '/planlegg/turneringer/kalender': '/planlegger/turneringer',
  '/planlegg/turneringer/mine': '/planlegger/turneringer/mine',

  // ===================================================================
  // MER REDIRECTS - V2 → V3 (unchanged from v3)
  // ===================================================================
  '/samhandle': '/mer',
  '/samhandle/meldinger': '/mer/meldinger',
  '/samhandle/feedback': '/mer/feedback',
  '/samhandle/kunnskap': '/mer/kunnskap',
  '/profil': '/mer/profil',
  '/profil/oppdater': '/mer/profil/rediger',
  '/innstillinger': '/mer/innstillinger',
  '/innstillinger/varsler': '/mer/varsler',
  '/trenerteam': '/mer/trenerteam',
  '/kalibrering': '/mer/kalibrering',
};

/**
 * ============================================================
 * AREA TABS CONFIGURATION
 * ============================================================
 * Tabs shown at the top of hub pages for quick navigation
 */
export const areaTabsConfig = {
  trening: [
    { href: '/trening', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/trening/logg', label: 'Log session', icon: 'Plus' },
    { href: '/trening/dagbok', label: 'History', icon: 'History' },
    { href: '/trening/ovelser', label: 'Exercises', icon: 'Dumbbell' },
    { href: '/trening/testing', label: 'Testing', icon: 'Target' },
  ],
  analyse: [
    { href: '/analyse', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/analyse/statistikk', label: 'Statistics', icon: 'BarChart3' },
    { href: '/analyse/tester', label: 'Tests', icon: 'ClipboardList' },
    { href: '/analyse/prestasjoner', label: 'Achievements', icon: 'Award' },
  ],
  maalsetninger: [
    { href: '/maalsetninger', label: 'Goals', icon: 'Target' },
  ],
  planlegger: [
    { href: '/plan', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/plan/aarsplan', label: 'Annual plan', icon: 'Calendar' },
    { href: '/plan/ukeplan', label: 'Training plan', icon: 'Calendar' },
    { href: '/plan/skole', label: 'School plan', icon: 'BookOpen' },
    { href: '/plan/turneringer/mine', label: 'Tournaments', icon: 'Trophy' },
  ],
  // Video tabs - consolidated from separate pages
  video: [
    { href: '/trening/video', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/trening/video/bibliotek', label: 'Videos', icon: 'Video' },
    { href: '/trening/video/sammenligning', label: 'Compare', icon: 'GitCompare' },
    { href: '/trening/video/annotering', label: 'Annotate', icon: 'PenTool' },
  ],
};

/**
 * Get tabs for a specific area
 */
export function getAreaTabs(areaId: string) {
  return areaTabsConfig[areaId as keyof typeof areaTabsConfig] || [];
}

export default playerNavigationV4;
