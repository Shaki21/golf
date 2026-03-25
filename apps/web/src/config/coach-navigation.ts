/**
 * ============================================================
 * COACH NAVIGATION CONFIG - TIER Golf
 * ============================================================
 *
 * Single source of truth for coach navigation.
 * Updated based on COACH_MODULE_FUNCTIONS.md specification.
 *
 * STRUCTURE (10 top-level items):
 * 1. Dashboard
 * 2. Athletes
 * 3. Planning
 * 4. Alerts
 * 5. Calendar (Booking & Calendar)
 * 6. Messages
 * 7. Library (Exercises & Templates)
 * 8. Insights (Statistics)
 * 9. Tournaments
 * 10. More (Status, Evaluations, Requests, Settings)
 *
 * DESIGN PRINCIPLES:
 * - Neutrality: No athlete ranking, alphabetical A-Z
 * - Parity: Proof/Trajectory viewers identical to player
 * - Immutability: Past sessions cannot be edited
 * - Clarity: Clear statuses and labeling
 * ============================================================
 */

export interface NavItem {
  label: string;
  labelNO: string;  // Norwegian label (kept for i18n support)
  icon: string;
  href?: string;
  badge?: string | 'unreadCount';
  mobileNav?: boolean;  // Show in mobile bottom nav
  hideFromSidebar?: boolean;  // Hide from main navigation sidebar (accessible via Dashboard)
  submenu?: Array<{
    href: string;
    label: string;
    labelNO: string;
    icon?: string;  // Icon for card display
    badge?: string;
  }>;
}

export const coachNavigationConfig: NavItem[] = [
  // ────────────────────────────────────────────────────────────
  // 1. DASHBOARD
  // "What needs attention today?"
  // ────────────────────────────────────────────────────────────
  {
    label: 'Dashboard',
    labelNO: 'Dashboard',
    icon: 'HomeIcon',
    href: '/coach',
    mobileNav: true,
  },

  // ────────────────────────────────────────────────────────────
  // 2. ATHLETES
  // Alphabetical list A-Z, neutral presentation, no ranking
  // Accessible via Dashboard quick actions
  // ────────────────────────────────────────────────────────────
  {
    label: 'Athletes',
    labelNO: 'Athletes',
    icon: 'ProfileIcon',
    href: '/coach/athletes',
    mobileNav: true,
    hideFromSidebar: true,
  },

  // ────────────────────────────────────────────────────────────
  // 3. PLANNING
  // "Who has plans and who needs plans?"
  // Tabs: Players vs Groups
  // ────────────────────────────────────────────────────────────
  {
    label: 'Planning',
    labelNO: 'Planning',
    icon: 'LessonsIcon',
    href: '/coach/planning',
    mobileNav: true,
    submenu: [
      { href: '/coach/planning', label: 'Overview', labelNO: 'Overview', icon: 'HomeIcon' },
      { href: '/coach/planning/annual-plan', label: 'Annual Plan', labelNO: 'Annual Plan', icon: 'CalendarIcon' },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 4. ALERTS
  // "What requires coach attention"
  // Always grouped alphabetically by athlete name
  // Accessible via Dashboard quick actions
  // ────────────────────────────────────────────────────────────
  {
    label: 'Alerts',
    labelNO: 'Alerts',
    icon: 'NotificationsIcon',
    href: '/coach/alerts',
    badge: 'unreadCount',
    mobileNav: true,
    hideFromSidebar: true,
  },

  // ────────────────────────────────────────────────────────────
  // 5. CALENDAR (Booking & Calendar)
  // Manage schedule and requests
  // ────────────────────────────────────────────────────────────
  {
    label: 'Calendar',
    labelNO: 'Calendar',
    icon: 'CalendarIcon',
    href: '/coach/booking',
    mobileNav: true,
    submenu: [
      { href: '/coach/booking', label: 'Calendar', labelNO: 'Calendar', icon: 'CalendarIcon' },
      { href: '/coach/booking/requests', label: 'Requests', labelNO: 'Requests', icon: 'ChatIcon' },
      { href: '/coach/booking/settings', label: 'Availability', labelNO: 'Availability', icon: 'SettingsIcon' },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 6. MESSAGES
  // Coach outbound messaging
  // Accessible via Dashboard quick actions
  // ────────────────────────────────────────────────────────────
  {
    label: 'Messages',
    labelNO: 'Messages',
    icon: 'ChatIcon',
    href: '/coach/messages',
    mobileNav: true,
    hideFromSidebar: true,
    submenu: [
      { href: '/coach/messages', label: 'Sent', labelNO: 'Sent', icon: 'ChatIcon' },
      { href: '/coach/messages/compose', label: 'Compose', labelNO: 'Compose', icon: 'EditIcon' },
      { href: '/coach/messages/scheduled', label: 'Scheduled', labelNO: 'Scheduled', icon: 'CalendarIcon' },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 7. LIBRARY (Exercises & Templates)
  // Coaching library with exercises, templates, and training system
  // ────────────────────────────────────────────────────────────
  {
    label: 'Library',
    labelNO: 'Library',
    icon: 'ClubIcon',
    submenu: [
      { href: '/coach/exercises', label: 'Exercise Library', labelNO: 'Exercise Library', icon: 'ClubIcon' },
      { href: '/coach/exercises/mine', label: 'My Exercises', labelNO: 'My Exercises', icon: 'ProfileIcon' },
      { href: '/coach/exercises/templates', label: 'Templates', labelNO: 'Templates', icon: 'LessonsIcon' },
      { href: '/coach/training-system', label: 'Training System', labelNO: 'Training System', icon: 'SettingsIcon' },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 8. INSIGHTS (Statistics)
  // Team-level overview
  // ────────────────────────────────────────────────────────────
  {
    label: 'Insights',
    labelNO: 'Insights',
    icon: 'StatsIcon',
    submenu: [
      { href: '/coach/stats', label: 'Overview', labelNO: 'Overview', icon: 'HomeIcon' },
      { href: '/coach/stats/progress', label: 'Progress', labelNO: 'Progress', icon: 'StatsIcon' },
      { href: '/coach/stats/regression', label: 'Regression', labelNO: 'Regression', icon: 'StatsIcon' },
      { href: '/training/statistics', label: 'Training Analysis', labelNO: 'Training Analysis', icon: 'StatsIcon' },
      { href: '/coach/stats/datagolf', label: 'Tools', labelNO: 'Tools', icon: 'ScorecardIcon' },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 9. TOURNAMENTS
  // Team competition overview
  // ────────────────────────────────────────────────────────────
  {
    label: 'Tournaments',
    labelNO: 'Tournaments',
    icon: 'GolfFlagIcon',
    submenu: [
      { href: '/coach/tournaments', label: 'Calendar', labelNO: 'Calendar', icon: 'CalendarIcon' },
      { href: '/coach/tournaments/players', label: 'Participants', labelNO: 'Participants', icon: 'ProfileIcon' },
      { href: '/coach/tournaments/results', label: 'Results', labelNO: 'Results', icon: 'HandicapIcon' },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // 10. MORE
  // Status, Evaluations, Requests, Settings
  // ────────────────────────────────────────────────────────────
  {
    label: 'More',
    labelNO: 'More',
    icon: 'SettingsIcon',
    submenu: [
      { href: '/coach/groups', label: 'Groups', labelNO: 'Groups', icon: 'ProfileIcon' },
      { href: '/coach/athlete-status', label: 'Athlete Status', labelNO: 'Athlete Status', icon: 'StatsIcon' },
      { href: '/coach/session-evaluations', label: 'Evaluations', labelNO: 'Evaluations', icon: 'CheckIcon' },
      { href: '/coach/modification-requests', label: 'Requests', labelNO: 'Requests', icon: 'ChatIcon' },
      { href: '/coach/samlinger', label: 'Training Camps', labelNO: 'Training Camps', icon: 'GolfFlagIcon' },
      { href: '/coach/settings', label: 'Settings', labelNO: 'Settings', icon: 'SettingsIcon' },
    ],
  },
];

/**
 * ============================================================
 * QUICK ACTIONS FOR COACH SIDEBAR
 * ============================================================
 */
export const coachQuickActions = [
  {
    label: 'New message',
    icon: 'ChatIcon',
    href: '/coach/messages/compose',
    variant: 'primary' as const,
  },
  {
    label: 'New session',
    icon: 'AddIcon',
    href: '/coach/planning',
    variant: 'secondary' as const,
  },
];

/**
 * ============================================================
 * MOBILE BOTTOM NAV ITEMS
 * First 5-6 most used areas
 * ============================================================
 */
export const coachMobileNavItems = coachNavigationConfig
  .filter(item => item.mobileNav)
  .slice(0, 6);

/**
 * ============================================================
 * COACH ALERT TYPES
 * ============================================================
 */
export const coachAlertTypes = {
  PROOF_UPLOADED: { label: 'Proof uploaded', labelNO: 'Proof uploaded', icon: 'VideoIcon', color: 'info' },
  PLAN_PENDING: { label: 'Plan pending', labelNO: 'Plan pending', icon: 'LessonsIcon', color: 'warning' },
  NOTE_REQUEST: { label: 'Note request', labelNO: 'Note request', icon: 'ChatIcon', color: 'info' },
  MILESTONE: { label: 'Milestone reached', labelNO: 'Milestone reached', icon: 'GolfFlagIcon', color: 'success' },
  INJURY: { label: 'Illness/injury', labelNO: 'Illness/injury', icon: 'NotificationsIcon', color: 'error' },
  TEST_COMPLETED: { label: 'Test completed', labelNO: 'Test completed', icon: 'CheckIcon', color: 'success' },
} as const;

/**
 * ============================================================
 * ATHLETE ACTIONS (for Athlete Detail hub)
 * 5 main actions as tiles
 * ============================================================
 */
export const athleteDetailActions = [
  {
    id: 'proof',
    label: 'View Proof',
    icon: 'VideoIcon',
    href: (id: string) => `/coach/athletes/${id}/proof`,
    description: 'View training videos and photos',
  },
  {
    id: 'trajectory',
    label: 'View Progress',
    icon: 'StatsIcon',
    href: (id: string) => `/coach/athletes/${id}/trajectory`,
    description: 'Historical progression',
  },
  {
    id: 'tests',
    label: 'Test Protocol',
    icon: 'TargetIcon',
    href: (id: string) => `/coach/athletes/${id}/tests`,
    description: 'View test results and progression',
  },
  {
    id: 'plan',
    label: 'Training Plan',
    icon: 'LessonsIcon',
    href: (id: string) => `/coach/athletes/${id}/plan`,
    description: 'View and edit training plan',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: 'ScorecardIcon',
    href: (id: string) => `/coach/athletes/${id}/notes`,
    description: 'Coach notes',
  },
] as const;

/**
 * ============================================================
 * EXERCISE CATEGORIES
 * 7 categories per spec
 * ============================================================
 */
export const exerciseCategories = [
  { id: 'putting', label: 'Putting', labelNO: 'Putting', icon: 'target' },
  { id: 'driving', label: 'Driving', labelNO: 'Driving', icon: 'swing' },
  { id: 'iron', label: 'Iron', labelNO: 'Iron', icon: 'flag' },
  { id: 'wedge', label: 'Wedge', labelNO: 'Wedge', icon: 'triangle' },
  { id: 'bunker', label: 'Bunker', labelNO: 'Bunker', icon: 'mountain' },
  { id: 'mental', label: 'Mental', labelNO: 'Mental', icon: 'brain' },
  { id: 'fitness', label: 'Fitness', labelNO: 'Fitness', icon: 'dumbbell' },
] as const;

/**
 * ============================================================
 * DIFFICULTY LEVELS
 * ============================================================
 */
export const difficultyLevels = [
  { id: 'beginner', label: 'Beginner', labelNO: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate', labelNO: 'Intermediate' },
  { id: 'advanced', label: 'Advanced', labelNO: 'Advanced' },
] as const;

/**
 * ============================================================
 * BOOKING STATUSES
 * ============================================================
 */
export const bookingStatuses = {
  available: { label: 'Available', labelNO: 'Available', color: 'success', icon: 'circle-check' },
  booked: { label: 'Booked', labelNO: 'Booked', color: 'info', icon: 'circle-dot' },
  pending: { label: 'Pending', labelNO: 'Pending', color: 'warning', icon: 'circle-alert' },
  blocked: { label: 'Blocked', labelNO: 'Blocked', color: 'error', icon: 'circle-x' },
} as const;

/**
 * ============================================================
 * MESSAGE CATEGORIES
 * ============================================================
 */
export const messageCategories = [
  { id: 'training', label: 'Training', labelNO: 'Training', icon: 'dumbbell' },
  { id: 'tournament', label: 'Tournament', labelNO: 'Tournament', icon: 'trophy' },
  { id: 'important', label: 'Important', labelNO: 'Important', icon: 'alert-triangle' },
  { id: 'general', label: 'General', labelNO: 'General', icon: 'message-circle' },
] as const;

/**
 * ============================================================
 * ATHLETE STATUS OPTIONS
 * ============================================================
 */
export const athleteStatusOptions = [
  { id: 'ready', label: 'Ready', labelNO: 'Ready', color: 'success', icon: 'circle-check' },
  { id: 'limited', label: 'Limited', labelNO: 'Limited', color: 'warning', icon: 'circle-alert' },
  { id: 'injured', label: 'Injured', labelNO: 'Injured', color: 'error', icon: 'circle-x' },
] as const;

/**
 * ============================================================
 * MODIFICATION REQUEST STATUSES
 * ============================================================
 */
export const modificationRequestStatuses = [
  { id: 'waiting', label: 'Waiting', labelNO: 'Waiting', icon: 'clock' },
  { id: 'in_review', label: 'In Review', labelNO: 'In Review', icon: 'search' },
  { id: 'resolved', label: 'Resolved', labelNO: 'Resolved', icon: 'check-circle' },
  { id: 'rejected', label: 'Rejected', labelNO: 'Rejected', icon: 'x-circle' },
] as const;

/**
 * ============================================================
 * MODIFICATION REQUEST PRIORITY
 * ============================================================
 */
export const modificationRequestPriority = [
  { id: 'low', label: 'Low', labelNO: 'Low', color: 'success' },
  { id: 'medium', label: 'Medium', labelNO: 'Medium', color: 'warning' },
  { id: 'high', label: 'High', labelNO: 'High', color: 'error' },
] as const;

// Default export for backwards compatibility
export default coachNavigationConfig;
