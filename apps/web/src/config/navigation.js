/**
 * ============================================================
 * PLAYER NAVIGATION CONFIGURATION - TIER Golf
 * ============================================================
 *
 * Complete navigation for players in TIER Golf.
 * Based on complete database schema analysis.
 *
 * STRUCTURE:
 * - label: Name displayed in menu
 * - icon: Icon from lucide-react
 * - href: URL path (for direct links)
 * - submenu: Array with submenu items
 * - badge: Dynamic badge (e.g., unread messages)
 *
 * ============================================================
 */

export const navigationConfig = [
  // ────────────────────────────────────────────────────────────
  // DASHBOARD
  // ────────────────────────────────────────────────────────────
  {
    label: 'Overview',
    icon: 'Home',
    href: '/'
  },

  // ────────────────────────────────────────────────────────────
  // MY DEVELOPMENT
  // Breaking Points, Category Progress, Benchmark
  // ────────────────────────────────────────────────────────────
  {
    label: 'My Development',
    icon: 'TrendingUp',
    submenu: [
      { href: '/utvikling', label: 'Overview', icon: 'LayoutDashboard' },
      { href: '/utvikling/breaking-points', label: 'Breaking Points', icon: 'Zap' },
      { href: '/utvikling/kategori', label: 'Category Progress', icon: 'Layers' },
      { href: '/utvikling/benchmark', label: 'Benchmark History', icon: 'BarChart2' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // TRAINING
  // Daily/weekly plans, training diary, exercises
  // ────────────────────────────────────────────────────────────
  {
    label: 'Training',
    icon: 'Activity',
    submenu: [
      { href: '/trening/dagens', label: 'Today\'s Plan', icon: 'CalendarCheck' },
      { href: '/trening/ukens', label: 'This Week\'s Plan', icon: 'CalendarDays' },
      { href: '/sessions', label: 'All Sessions', icon: 'ListChecks' },
      { href: '/trening/dagbok', label: 'Training Diary', icon: 'BookOpen' },
      { href: '/trening/logg', label: 'Log Training', icon: 'Plus' },
      { href: '/evaluering', label: 'Evaluations', icon: 'ClipboardCheck' },
      { href: '/ovelsesbibliotek', label: 'Exercise Library', icon: 'Library' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // CALENDAR
  // Training plan, monthly overview, booking
  // ────────────────────────────────────────────────────────────
  {
    label: 'Calendar',
    icon: 'Calendar',
    submenu: [
      { href: '/kalender?view=week', label: 'Weekly Plan', icon: 'CalendarRange' },
      { href: '/kalender?view=month', label: 'Monthly Overview', icon: 'Calendar' },
      { href: '/kalender/booking', label: 'Book Coach', icon: 'UserPlus' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // PLANNER
  // Annual plan with periodization, tournament plan, goals
  // ────────────────────────────────────────────────────────────
  {
    label: 'Planner',
    icon: 'Map',
    submenu: [
      { href: '/aarsplan', label: 'Annual Plan', icon: 'Calendar' },
      { href: '/aarsplan/ny', label: 'Create Annual Plan', icon: 'FilePlus' },
      { href: '/aarsplan/perioder', label: 'Periodization', icon: 'Layers' },
      { href: '/periodeplaner', label: 'Period Plans', icon: 'FileStack' },
      { href: '/turneringer/planlegger', label: 'Tournament Plan', icon: 'Trophy' },
      { href: '/aarsplan/fokus', label: 'Focus Areas', icon: 'Focus' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // TESTING
  // Test protocol, results, category requirements
  // ────────────────────────────────────────────────────────────
  {
    label: 'Testing',
    icon: 'Target',
    submenu: [
      { href: '/testprotokoll', label: 'Test Protocol', icon: 'ClipboardList' },
      { href: '/testresultater', label: 'My Results', icon: 'FileCheck' },
      { href: '/testing/krav', label: 'Category Requirements', icon: 'ListOrdered' },
      { href: '/testing/registrer', label: 'Log Test', icon: 'PlusCircle' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // TOURNAMENTS
  // Calendar, my tournaments, results
  // ────────────────────────────────────────────────────────────
  {
    label: 'Tournaments',
    icon: 'Trophy',
    submenu: [
      { href: '/turneringskalender', label: 'Calendar', icon: 'CalendarDays' },
      { href: '/mine-turneringer', label: 'My Tournaments', icon: 'Medal' },
      { href: '/turneringer/resultater', label: 'Results', icon: 'Award' },
      { href: '/turneringer/registrer', label: 'Log Result', icon: 'Plus' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // STATISTICS
  // Unified hub with tabs: Overview, Strokes Gained, Benchmark, Results, Status
  // ────────────────────────────────────────────────────────────
  {
    label: 'Statistics',
    icon: 'BarChart3',
    submenu: [
      { href: '/statistikk', label: 'Statistics Hub', icon: 'LayoutDashboard' },
      { href: '/statistikk?tab=strokes-gained', label: 'Strokes Gained', icon: 'TrendingUp' },
      { href: '/statistikk?tab=benchmark', label: 'Benchmark', icon: 'BarChart2' },
      { href: '/statistikk?tab=testresultater', label: 'Test Results', icon: 'FileCheck' },
      { href: '/statistikk?tab=status', label: 'Status & Goals', icon: 'Target' },
      { href: '/stats/guide', label: 'How It Works', icon: 'BookOpen' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // COMMUNICATION
  // Messages, notifications, from coach
  // ────────────────────────────────────────────────────────────
  {
    label: 'Communication',
    icon: 'MessageSquare',
    badge: 'unreadMessages',
    submenu: [
      { href: '/meldinger', label: 'Messages', icon: 'Mail' },
      { href: '/varsler', label: 'Notifications', icon: 'Bell' },
      { href: '/meldinger/trener', label: 'From Coach', icon: 'User' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // GOALS AND PROGRESSION
  // Goals, progress, achievements
  // ────────────────────────────────────────────────────────────
  {
    label: 'Goals and Progression',
    icon: 'Flag',
    submenu: [
      { href: '/maalsetninger', label: 'My Goals', icon: 'Target' },
      { href: '/progress', label: 'Progress', icon: 'TrendingUp' },
      { href: '/achievements', label: 'Achievements', icon: 'Award' },
      { href: '/badges', label: 'Badges', icon: 'BadgeCheck' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // KNOWLEDGE
  // Resources, notes, video evidence, archive
  // ────────────────────────────────────────────────────────────
  {
    label: 'Knowledge',
    icon: 'BookMarked',
    submenu: [
      { href: '/ressurser', label: 'Resources', icon: 'FileText' },
      { href: '/videos', label: 'Videos', icon: 'Video' },
      { href: '/notater', label: 'Notes', icon: 'StickyNote' },
      { href: '/bevis', label: 'Video Evidence', icon: 'Film' },
      { href: '/samlinger', label: 'Collections', icon: 'FolderOpen' },
      { href: '/arkiv', label: 'Archive', icon: 'Archive' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // SCHOOL
  // Schedule, assignments
  // ────────────────────────────────────────────────────────────
  {
    label: 'School',
    icon: 'GraduationCap',
    submenu: [
      { href: '/skoleplan', label: 'Schedule', icon: 'Clock' },
      { href: '/skole/oppgaver', label: 'Assignments', icon: 'CheckSquare' },
    ]
  },

  // ────────────────────────────────────────────────────────────
  // SETTINGS
  // Profile, calibration, coach team, preferences
  // ────────────────────────────────────────────────────────────
  {
    label: 'Settings',
    icon: 'Settings',
    submenu: [
      { href: '/profil', label: 'My Profile', icon: 'User' },
      { href: '/kalibrering', label: 'Calibration', icon: 'Sliders' },
      { href: '/trenerteam', label: 'Coach Team', icon: 'Users' },
      { href: '/innstillinger/varsler', label: 'Notification Settings', icon: 'BellRing' },
    ]
  },
];

/**
 * ============================================================
 * QUICK ACTIONS FOR PLAYER
 * ============================================================
 *
 * Displayed on dashboard for quick access.
 */

export const playerQuickActions = [
  {
    label: 'Log Training',
    icon: 'Plus',
    href: '/trening/logg',
    variant: 'primary'
  },
  {
    label: 'Log Test',
    icon: 'Target',
    href: '/testing/registrer',
    variant: 'secondary'
  },
  {
    label: 'Book Coach',
    icon: 'Calendar',
    href: '/kalender/booking',
    variant: 'secondary'
  },
];

/**
 * ============================================================
 * BADGE CONFIGURATIONS
 * ============================================================
 *
 * Dynamic badges displayed at menu items.
 */

export const badgeConfig = {
  unreadMessages: {
    source: 'notifications',
    color: 'error',
    max: 99,
  },
  pendingTests: {
    source: 'tests',
    color: 'warning',
    max: 9,
  },
  newAchievements: {
    source: 'achievements',
    color: 'success',
    max: 9,
  },
};

/**
 * ============================================================
 * SECTIONS FOR SIDEBAR
 * ============================================================
 */

export const sidebarSections = {
  main: navigationConfig.slice(0, 8),      // Dashboard, Development, Training, Calendar, Planner, Testing, Tournaments, Statistics
  communication: navigationConfig.slice(8, 10), // Communication, Goals & Progress
  resources: navigationConfig.slice(10, 12),    // Knowledge, School
  settings: navigationConfig.slice(12),        // Settings
};

/**
 * ============================================================
 * AVAILABLE ICONS (from lucide-react)
 * ============================================================
 *
 * Home, Users, Trophy, ClipboardList, TrendingUp,
 * Activity, Calendar, GraduationCap, BookMarked,
 * Target, Settings, BarChart3, FileText, MessageSquare,
 * Bell, Star, Award, Zap, Heart, Flag, Map, Compass,
 * Clock, CheckCircle, AlertCircle, Info, HelpCircle,
 * FileCheck, Edit, Trash, Download, Plus, Send
 *
 * See all icons: https://lucide.dev/icons
 * ============================================================
 */
