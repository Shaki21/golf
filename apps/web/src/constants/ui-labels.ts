/**
 * UI Labels - English Constants
 *
 * Centralized UI text for consistent language across the app.
 * All labels are in English per project language policy.
 */

// =============================================================================
// STATUS LABELS
// =============================================================================

export const STATUS_LABELS = {
  // Goal/Progress Status
  atRisk: 'At risk',
  behind: 'Behind schedule',
  onTrack: 'On track',
  completed: 'Completed',
  ahead: 'Ahead of plan',
  notStarted: 'Not started',
  inProgress: 'In progress',

  // Session Status
  scheduled: 'Scheduled',
  cancelled: 'Cancelled',
  missed: 'Missed',

  // Priority
  urgent: 'Urgent',
  high: 'High priority',
  normal: 'Normal',
  low: 'Low priority',
} as const;

export type StatusLabel = keyof typeof STATUS_LABELS;

// =============================================================================
// ACTION LABELS
// =============================================================================

export const ACTION_LABELS = {
  // Training Actions
  startTraining: 'Start training',
  logSession: 'Log session',
  logTraining: 'Log training',
  logTest: 'Log test',
  logRound: 'Log round',

  // Navigation Actions
  viewAll: 'View all',
  viewDetails: 'View details',
  viewPlan: 'View plan',
  viewCalendar: 'View calendar',

  // CRUD Actions
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',

  // Goal Actions
  adjustGoal: 'Adjust goal',
  setGoal: 'Set goal',

  // Development Actions
  viewDevelopment: 'View development',
  viewProgress: 'View progress',

  // Misc Actions
  seeMore: 'See more',
  showLess: 'Show less',
  retry: 'Retry',
  refresh: 'Refresh',
  tryAgain: 'Try again',
} as const;

export type ActionLabel = keyof typeof ACTION_LABELS;

// =============================================================================
// TIME LABELS
// =============================================================================

export const TIME_LABELS = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  yesterday: 'Yesterday',
  thisWeek: 'This week',
  lastWeek: 'Last week',
  nextWeek: 'Next week',
  thisMonth: 'This month',

  // Units
  sessions: 'sessions',
  session: 'session',
  minutes: 'min',
  hours: 'hours',
  hour: 'hour',
  days: 'days',
  day: 'day',
  weeks: 'weeks',
  week: 'week',

  // Misc
  deadline: 'Deadline',
} as const;

// =============================================================================
// METRIC LABELS
// =============================================================================

export const METRIC_LABELS = {
  progress: 'Progress',
  target: 'Target',
  current: 'Current',
  remaining: 'Remaining',
  streak: 'Streak',
  record: 'Record',
  average: 'Average',
  total: 'Total',
  completed: 'Completed',
  planned: 'Planned',
} as const;

// =============================================================================
// INSIGHT MESSAGES
// =============================================================================

export const INSIGHT_MESSAGES = {
  // Behind schedule
  behindByOne: (unit: string) => `Train 1 more ${unit} to reach your goal`,
  behindByMany: (count: number, unit: string) => `Train ${count} more ${unit}s to reach your goal`,
  behindWeekly: (count: number) => `${count} sessions behind this week`,

  // On track
  onTrackKeepGoing: 'Keep it up! You\'re on track',
  onTrackRemaining: (count: number, unit: string) => `${count} ${unit}s remaining this week`,

  // Completed
  goalReached: 'Goal reached!',
  weekCompleted: 'Week completed!',

  // Analysis insights
  biggestImprovement: (area: string) => `Your biggest improvement is ${area}`,
  biggestOpportunity: (area: string) => `${area} is your biggest opportunity`,

  // Today specific
  trainTodayToStayOnTrack: 'Train today to stay on track',
  nothingPlannedToday: 'Nothing planned for today',
  allDoneForToday: 'All done for today!',
} as const;

// =============================================================================
// CATEGORY LABELS
// =============================================================================

export const CATEGORY_LABELS = {
  physical: 'Physical',
  technique: 'Technique',
  shots: 'Shots',
  play: 'Course play',
  tournament: 'Tournament',
  mental: 'Mental',

  // Golf specific
  driving: 'Driving',
  approach: 'Approach',
  shortGame: 'Short game',
  putting: 'Putting',
  tee: 'Tee shots',
} as const;

// =============================================================================
// PAGE TITLES
// =============================================================================

export const PAGE_TITLES = {
  dashboard: 'Dashboard',
  todaysFocus: 'Today\'s Focus',
  training: 'Training',
  plan: 'Plan',
  analysis: 'Analysis',
  more: 'More',
  profile: 'Profile',
  settings: 'Settings',
  messages: 'Messages',
  myDevelopment: 'My Development',
  goals: 'Goals',
  exercises: 'Exercises',
  tests: 'Tests',
} as const;

// =============================================================================
// EMPTY STATE MESSAGES
// =============================================================================

export const EMPTY_STATES = {
  noSessionsToday: 'No sessions planned for today',
  noGoalsSet: 'No goals set yet',
  noDataAvailable: 'No data available',
  noMessagesYet: 'No messages yet',
  noUpcomingTests: 'No upcoming tests',
} as const;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  loadingFailed: 'Failed to load data',
  saveFailed: 'Failed to save',
  networkError: 'Network error. Please try again.',
  unexpectedError: 'An unexpected error occurred',
  couldNotLoadDashboard: 'Could not load dashboard',
  couldNotLoadLiveData: 'Could not load live data. Showing demo data.',
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Format session count with proper pluralization
 */
export function formatSessionCount(count: number): string {
  return `${count} ${count === 1 ? TIME_LABELS.session : TIME_LABELS.sessions}`;
}

/**
 * Format progress as "X / Y unit"
 */
export function formatProgress(current: number, target: number, unit: string): string {
  return `${current} / ${target} ${unit}`;
}

/**
 * Get insight message based on progress status
 */
export function getProgressInsight(
  current: number,
  target: number,
  unit: string = 'session'
): { status: 'positive' | 'warning' | 'critical'; message: string } {
  const remaining = target - current;
  const percentage = (current / target) * 100;

  if (current >= target) {
    return { status: 'positive', message: INSIGHT_MESSAGES.goalReached };
  }

  if (percentage >= 70) {
    return {
      status: 'positive',
      message: INSIGHT_MESSAGES.onTrackRemaining(remaining, unit)
    };
  }

  if (percentage >= 40) {
    return {
      status: 'warning',
      message: remaining === 1
        ? INSIGHT_MESSAGES.behindByOne(unit)
        : INSIGHT_MESSAGES.behindByMany(remaining, unit)
    };
  }

  return {
    status: 'critical',
    message: INSIGHT_MESSAGES.behindByMany(remaining, unit)
  };
}
