/**
 * ============================================================
 * COACH NAVIGATION V3 - TIER Golf
 * ============================================================
 *
 * New 5-mode navigation structure with color-coded areas:
 *
 * MAIN AREAS:
 * 1. Home (Navy) - Dashboard, notifications, activity
 * 2. Players (Green) - Athletes, training plans, evaluations
 * 3. Analysis (Blue) - Statistics, exercises, templates
 * 4. Plan (Yellow/Amber) - Calendar, booking, tournaments
 * 5. More (Purple) - Messages, groups, settings
 *
 * ============================================================
 */

// Area color type (same as player navigation)
export type AreaColor = 'default' | 'green' | 'blue' | 'amber' | 'purple';

// Import shared colors from player navigation
import { areaColors as playerAreaColors } from './player-navigation-v3';
export const areaColors = playerAreaColors;

export interface CoachNavSubItem {
  href: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface CoachNavSection {
  id: string;
  label: string;
  items: CoachNavSubItem[];
}

export interface CoachNavArea {
  id: string;
  label: string;
  icon: string;
  color: AreaColor;
  href: string;
  hubPath: string;
  sections?: CoachNavSection[];
  badge?: string;
}

/**
 * Main navigation for coach portal (5 areas)
 */
export const coachNavigationV3: CoachNavArea[] = [
  // ────────────────────────────────────────────────────────────
  // 1. HOME - Dashboard, notifications, activity (NAVY)
  // ────────────────────────────────────────────────────────────
  {
    id: 'hjem',
    label: 'Home',
    icon: 'Home',
    color: 'default',
    href: '/coach',
    hubPath: '/coach',
    sections: [
      {
        id: 'oversikt',
        label: 'Overview',
        items: [
          { href: '/coach', label: 'Dashboard', icon: 'LayoutDashboard', description: 'Main overview' },
          { href: '/coach/alerts', label: 'Notifications', icon: 'Bell', description: 'Important notifications' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 2. PLAYERS - Athletes, training plans, evaluations (GREEN)
  // ────────────────────────────────────────────────────────────
  {
    id: 'spillere',
    label: 'Players',
    icon: 'Users',
    color: 'green',
    href: '/coach/spillere',
    hubPath: '/coach/spillere',
    sections: [
      {
        id: 'utovere',
        label: 'Athletes',
        items: [
          { href: '/coach/athletes', label: 'All Players', icon: 'Users', description: 'Player overview' },
          { href: '/coach/athlete-status', label: 'Player Status', icon: 'Activity', description: 'Health and status' },
        ],
      },
      {
        id: 'planer',
        label: 'Training Plans',
        items: [
          { href: '/coach/planning', label: 'Planning', icon: 'ClipboardList', description: 'Training planner' },
          { href: '/coach/planning/annual-plan', label: 'Annual Plan', icon: 'Calendar', description: 'Annual planning' },
          { href: '/coach/training-plan-templates', label: 'Plan Templates', icon: 'BookTemplate', description: 'Template library' },
        ],
      },
      {
        id: 'evaluering',
        label: 'Evaluation',
        items: [
          { href: '/coach/session-evaluations', label: 'Evaluations', icon: 'CheckCircle', description: 'Session evaluations' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 3. ANALYSIS - Statistics, exercises, templates (BLUE)
  // ────────────────────────────────────────────────────────────
  {
    id: 'analyse',
    label: 'Analysis',
    icon: 'BarChart3',
    color: 'blue',
    href: '/coach/analyse',
    hubPath: '/coach/analyse',
    sections: [
      {
        id: 'statistikk',
        label: 'Statistics',
        items: [
          { href: '/coach/stats', label: 'Overview', icon: 'LayoutDashboard', description: 'Statistics overview' },
          { href: '/coach/stats/progress', label: 'Progress', icon: 'TrendingUp', description: 'Player progress' },
          { href: '/coach/stats/regression', label: 'Regression', icon: 'TrendingDown', description: 'Regression analysis' },
          { href: '/coach/stats/datagolf', label: 'DataGolf', icon: 'Database', description: 'Advanced analysis' },
        ],
      },
      {
        id: 'bibliotek',
        label: 'Library',
        items: [
          { href: '/coach/exercises', label: 'Exercises', icon: 'Dumbbell', description: 'Exercise library' },
          { href: '/coach/exercises/mine', label: 'My Exercises', icon: 'User', description: 'Custom exercises' },
          { href: '/coach/exercises/templates', label: 'Templates', icon: 'FileText', description: 'Session templates' },
          { href: '/coach/training-system', label: 'Training System', icon: 'Settings', description: 'Category system' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 4. PLAN - Calendar, booking, tournaments (AMBER)
  // ────────────────────────────────────────────────────────────
  {
    id: 'plan',
    label: 'Plan',
    icon: 'Calendar',
    color: 'amber',
    href: '/coach/plan',
    hubPath: '/coach/plan',
    sections: [
      {
        id: 'kalender',
        label: 'Calendar',
        items: [
          { href: '/coach/booking', label: 'Calendar', icon: 'Calendar', description: 'Booking calendar' },
          { href: '/coach/booking/requests', label: 'Requests', icon: 'MessageSquare', description: 'Booking requests' },
          { href: '/coach/booking/settings', label: 'Availability', icon: 'Clock', description: 'Availability settings' },
        ],
      },
      {
        id: 'turneringer',
        label: 'Tournaments',
        items: [
          { href: '/coach/tournaments', label: 'Tournament Calendar', icon: 'Trophy', description: 'All tournaments' },
          { href: '/coach/tournaments/players', label: 'Participants', icon: 'Users', description: 'Registered players' },
          { href: '/coach/tournaments/results', label: 'Results', icon: 'Award', description: 'Tournament results' },
        ],
      },
      {
        id: 'samlinger',
        label: 'Camps',
        items: [
          { href: '/coach/samlinger', label: 'Camps', icon: 'Tent', description: 'Training camps' },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 5. MORE - Messages, groups, settings (PURPLE)
  // ────────────────────────────────────────────────────────────
  {
    id: 'mer',
    label: 'More',
    icon: 'MoreHorizontal',
    color: 'purple',
    href: '/coach/mer',
    hubPath: '/coach/mer',
    badge: 'unreadMessages',
    sections: [
      {
        id: 'kommunikasjon',
        label: 'Communication',
        items: [
          { href: '/coach/messages', label: 'Messages', icon: 'MessageSquare', description: 'Sent messages' },
          { href: '/coach/messages/compose', label: 'New Message', icon: 'PenSquare', description: 'Write message' },
          { href: '/coach/messages/scheduled', label: 'Scheduled', icon: 'Clock', description: 'Scheduled messages' },
        ],
      },
      {
        id: 'grupper',
        label: 'Groups',
        items: [
          { href: '/coach/groups', label: 'Groups', icon: 'Users', description: 'Player groups' },
        ],
      },
      {
        id: 'innstillinger',
        label: 'Settings',
        items: [
          { href: '/coach/settings', label: 'Settings', icon: 'Settings', description: 'Account settings' },
          { href: '/coach/modification-requests', label: 'Change Requests', icon: 'GitPullRequest', description: 'Handle requests' },
        ],
      },
    ],
  },
];

/**
 * Quick actions for coach dashboard
 */
export const coachQuickActionsV3 = [
  {
    label: 'New Session',
    icon: 'Plus',
    href: '/coach/planning',
    variant: 'primary' as const,
  },
  {
    label: 'New Message',
    icon: 'MessageSquare',
    href: '/coach/messages/compose',
    variant: 'secondary' as const,
  },
];

// ============================================================
// FLAT NAVIGATION - Simplified 5-mode structure
// ============================================================

export interface CoachFlatNavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  color: AreaColor;
  badge?: string;
}

/**
 * Simplified navigation with only 5 main elements (no nesting)
 */
export const coachNavigationFlat: CoachFlatNavItem[] = [
  {
    id: 'hjem',
    label: 'Home',
    icon: 'Home',
    href: '/coach',
    color: 'default',
    badge: 'dashboardAttention',
  },
  {
    id: 'spillere',
    label: 'Players',
    icon: 'Users',
    href: '/coach/spillere',
    color: 'green',
  },
  {
    id: 'analyse',
    label: 'Analysis',
    icon: 'BarChart3',
    href: '/coach/analyse',
    color: 'blue',
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: 'Calendar',
    href: '/coach/plan',
    color: 'amber',
  },
  {
    id: 'mer',
    label: 'More',
    icon: 'MoreHorizontal',
    href: '/coach/mer',
    color: 'purple',
    badge: 'unreadMessages',
  },
];

/**
 * Horizontal tabs for each area (displayed on hub pages)
 */
export const coachAreaTabsConfig = {
  spillere: [
    { href: '/coach/spillere', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/coach/athletes', label: 'Athletes', icon: 'Users' },
    { href: '/coach/planning', label: 'Planning', icon: 'ClipboardList' },
    { href: '/coach/training-plan-templates', label: 'Plan Templates', icon: 'BookTemplate' },
    { href: '/coach/session-evaluations', label: 'Evaluations', icon: 'CheckCircle' },
    { href: '/coach/athlete-status', label: 'Status', icon: 'Activity' },
  ],
  analyse: [
    { href: '/coach/analyse', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/coach/stats', label: 'Statistics', icon: 'BarChart3' },
    { href: '/coach/exercises', label: 'Exercises', icon: 'Dumbbell' },
    { href: '/coach/training-system', label: 'System', icon: 'Settings' },
  ],
  plan: [
    { href: '/coach/plan', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/coach/booking', label: 'Calendar', icon: 'Calendar' },
    { href: '/coach/tournaments', label: 'Tournaments', icon: 'Trophy' },
    { href: '/coach/samlinger', label: 'Camps', icon: 'Tent' },
  ],
  mer: [
    { href: '/coach/mer', label: 'Overview', icon: 'LayoutDashboard' },
    { href: '/coach/messages', label: 'Messages', icon: 'MessageSquare' },
    { href: '/coach/groups', label: 'Groups', icon: 'Users' },
    { href: '/coach/settings', label: 'Settings', icon: 'Settings' },
  ],
};

/**
 * Get tabs for an area
 */
export function getCoachTabsForArea(areaId: string): Array<{ href: string; label: string; icon: string }> {
  return coachAreaTabsConfig[areaId as keyof typeof coachAreaTabsConfig] || [];
}

/**
 * Find area based on path
 */
export function getCoachAreaByPath(path: string): CoachNavArea | undefined {
  return coachNavigationV3.find(area => {
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
export function getCoachAreaById(id: string): CoachNavArea | undefined {
  return coachNavigationV3.find(area => area.id === id);
}

/**
 * Find flat area based on path
 */
export function getCoachFlatAreaByPath(path: string): CoachFlatNavItem | undefined {
  // Special handling for /coach root
  if (path === '/coach') {
    return coachNavigationFlat.find(item => item.id === 'hjem');
  }

  // Check /coach/athletes -> players
  if (path.startsWith('/coach/athletes') || path.startsWith('/coach/planning') ||
      path.startsWith('/coach/athlete-status') || path.startsWith('/coach/session-evaluations') ||
      path.startsWith('/coach/training-plan-templates')) {
    return coachNavigationFlat.find(item => item.id === 'spillere');
  }

  // Check /coach/stats or /coach/exercises -> analysis
  if (path.startsWith('/coach/stats') || path.startsWith('/coach/exercises') ||
      path.startsWith('/coach/training-system')) {
    return coachNavigationFlat.find(item => item.id === 'analyse');
  }

  // Check /coach/booking or /coach/tournaments or /coach/samlinger -> plan
  if (path.startsWith('/coach/booking') || path.startsWith('/coach/tournaments') ||
      path.startsWith('/coach/samlinger')) {
    return coachNavigationFlat.find(item => item.id === 'plan');
  }

  // Check /coach/messages or /coach/groups or /coach/settings -> more
  if (path.startsWith('/coach/messages') || path.startsWith('/coach/groups') ||
      path.startsWith('/coach/settings') || path.startsWith('/coach/modification-requests')) {
    return coachNavigationFlat.find(item => item.id === 'mer');
  }

  // Standard matching
  return coachNavigationFlat.find(item => {
    if (path === item.href) return true;
    if (item.href !== '/coach' && path.startsWith(item.href)) return true;
    return false;
  });
}

/**
 * Route redirects for backward compatibility
 */
export const coachRouteRedirects: Record<string, string> = {
  '/coach/alerts': '/coach',
};

export default coachNavigationV3;
