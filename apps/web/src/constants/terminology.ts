/**
 * Terminology Dictionary for IUP Golf App
 *
 * Centralized file for all English terms and expressions.
 * Use these constants instead of hardcoded strings.
 *
 * Decisions:
 * - "Player" for persons who train golf
 * - "Dashboard" for the main page
 * - English golf terms retained (Putting, Driving, etc.)
 */

// =============================================================================
// PERSONS
// =============================================================================

export const PERSON = {
  player: 'Player',
  players: 'Players',
  coach: 'Coach',
  coaches: 'Coaches',
  parent: 'Parent',
  parents: 'Parents',
  admin: 'Administrator',
} as const;

// =============================================================================
// NAVIGATION
// =============================================================================

export const NAV = {
  dashboard: 'Dashboard',
  training: 'Training',
  development: 'Development',
  plan: 'Plan',
  more: 'More',
  calendar: 'Calendar',
  messages: 'Messages',
  statistics: 'Statistics',
  settings: 'Settings',
  profile: 'Profile',
  library: 'Library',
  exercises: 'Exercises',
  tournaments: 'Tournaments',
  notes: 'Notes',
  groups: 'Groups',
  insights: 'Insights',
  alerts: 'Alerts',
} as const;

// =============================================================================
// TRAINING
// =============================================================================

export const TRAINING = {
  session: 'Session',
  sessions: 'Sessions',
  exercise: 'Exercise',
  exercises: 'Exercises',
  trainingPlan: 'Training Plan',
  trainingPlans: 'Training Plans',
  workout: 'Workout',
  logTraining: 'Log Training',
  mySessions: 'My Sessions',
  exerciseBank: 'Exercise Bank',
  weeklyPlan: 'Weekly Plan',
  annualPlan: 'Annual Plan',
} as const;

// =============================================================================
// GOLF CATEGORIES
// =============================================================================

export const GOLF_CATEGORIES = {
  technique: 'Technique',
  shortGame: 'Short Game',
  longGame: 'Long Game',
  putting: 'Putting',
  coursePlay: 'Course Play',
  mental: 'Mental',
  physical: 'Physical',
  driving: 'Driving',
} as const;

// =============================================================================
// STATUS
// =============================================================================

export const STATUS = {
  completed: 'Completed',
  inProgress: 'In Progress',
  planned: 'Planned',
  pending: 'Pending',
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
  published: 'Published',
  cancelled: 'Cancelled',
  ready: 'Ready',
  limited: 'Limited',
  injured: 'Injured',
  available: 'Available',
  booked: 'Booked',
  blocked: 'Blocked',
} as const;

// =============================================================================
// ACHIEVEMENTS
// =============================================================================

export const ACHIEVEMENTS = {
  achievements: 'Achievements',
  badges: 'Badges',
  badge: 'Badge',
  milestone: 'Milestone',
  milestones: 'Milestones',
  progress: 'Progress',
  development: 'Development',
  goals: 'Goals',
  goal: 'Goal',
  objectives: 'Objectives',
} as const;

// =============================================================================
// ACTIONS
// =============================================================================

export const ACTIONS = {
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  retry: 'Try Again',
  confirm: 'Confirm',
  close: 'Close',
  open: 'Open',
  view: 'View',
  viewAll: 'View All',
  add: 'Add',
  remove: 'Remove',
  create: 'Create',
  update: 'Update',
  send: 'Send',
  search: 'Search',
  filter: 'Filter',
  sort: 'Sort',
  export: 'Export',
  import: 'Import',
  download: 'Download',
  upload: 'Upload',
  approve: 'Approve',
  reject: 'Reject',
  assign: 'Assign',
} as const;

// =============================================================================
// LOADING & ERROR MESSAGES
// =============================================================================

export const LOADING = {
  default: 'Loading...',
  players: 'Loading players...',
  calendar: 'Loading calendar...',
  dashboard: 'Loading dashboard...',
  training: 'Loading training...',
  statistics: 'Loading statistics...',
  profile: 'Loading profile...',
  exercises: 'Loading exercises...',
  sessions: 'Loading sessions...',
  messages: 'Loading messages...',
  notes: 'Loading notes...',
  progress: 'Loading progress data...',
  archive: 'Loading archive...',
  achievements: 'Loading achievements...',
  groups: 'Loading groups...',
  tests: 'Loading tests...',
} as const;

export const ERRORS = {
  default: 'Something went wrong',
  loadFailed: 'Could not load data',
  saveFailed: 'Could not save',
  deleteFailed: 'Could not delete',
  networkError: 'Network error',
  unauthorized: 'Unauthorized',
  notFound: 'Not found',
  validationError: 'Invalid data',
  serverError: 'Server error',
  tryAgain: 'Try again',
} as const;

export const EMPTY_STATES = {
  noData: 'No data',
  noPlayers: 'No players',
  noSessions: 'No sessions',
  noExercises: 'No exercises',
  noMessages: 'No messages',
  noNotes: 'No notes',
  noResults: 'No results',
  noTasks: 'No tasks',
  noPending: 'No pending tasks',
} as const;

// =============================================================================
// TIME AND DATE
// =============================================================================

export const TIME = {
  today: 'Today',
  yesterday: 'Yesterday',
  tomorrow: 'Tomorrow',
  thisWeek: 'This Week',
  lastWeek: 'Last Week',
  nextWeek: 'Next Week',
  thisMonth: 'This Month',
  hoursAgo: 'hours ago',
  daysAgo: 'days ago',
  justNow: 'Just now',
  lastActive: 'Last active',
} as const;

export const DAYS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
} as const;

export const DAYS_SHORT = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
} as const;

// =============================================================================
// COLORS (for UI labels)
// =============================================================================

export const COLORS = {
  blue: 'Blue',
  green: 'Green',
  gold: 'Gold',
  red: 'Red',
  lightBlue: 'Light Blue',
  purple: 'Purple',
  pink: 'Pink',
  teal: 'Teal',
  orange: 'Orange',
  gray: 'Gray',
} as const;

// =============================================================================
// CATEGORIES (player level)
// =============================================================================

export const PLAYER_CATEGORIES = {
  categoryA: 'Category A',
  categoryB: 'Category B',
  categoryC: 'Category C',
  catA: 'Cat. A',
  catB: 'Cat. B',
  catC: 'Cat. C',
} as const;

// =============================================================================
// TRAINING PERIODS
// =============================================================================

export const PERIODS = {
  G: 'Fundamental',
  S: 'Specific',
  T: 'Tournament',
  E: 'Evaluation',
  fundamental: 'Fundamental',
  specific: 'Specific',
  tournament: 'Tournament',
  evaluation: 'Evaluation',
} as const;

// =============================================================================
// ENERGY AND STRESS (for status)
// =============================================================================

export const LEVELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  noInjuries: 'No injuries',
} as const;

// =============================================================================
// GREETINGS
// =============================================================================

export const GREETINGS = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
  welcomeBack: 'Welcome back',
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const TERMINOLOGY = {
  person: PERSON,
  nav: NAV,
  training: TRAINING,
  golfCategories: GOLF_CATEGORIES,
  status: STATUS,
  achievements: ACHIEVEMENTS,
  actions: ACTIONS,
  loading: LOADING,
  errors: ERRORS,
  emptyStates: EMPTY_STATES,
  time: TIME,
  days: DAYS,
  daysShort: DAYS_SHORT,
  colors: COLORS,
  playerCategories: PLAYER_CATEGORIES,
  periods: PERIODS,
  levels: LEVELS,
  greetings: GREETINGS,
} as const;

export default TERMINOLOGY;
