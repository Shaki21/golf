/**
 * ============================================================
 * MOCK DATA - TIER Golf
 * ============================================================
 *
 * Mock data for development and testing.
 * Used by hub pages and dashboard components.
 *
 * ============================================================
 */

// =============================================================================
// USER DATA
// =============================================================================

export const mockPlayer = {
  id: 'player-001',
  firstName: 'Anders',
  lastName: 'Kristiansen',
  email: 'anders@example.com',
  role: 'player',
  avatar: null,
  kategori: 3,
  klubb: 'Holtsmark Golf',
  hcp: 12.4,
  registeredAt: '2024-01-15',
};

export const mockCoaches = [
  {
    id: 'coach-001',
    firstName: 'Erik',
    lastName: 'Hansen',
    role: 'head_coach',
    specialty: 'Long game',
    avatar: null,
  },
  {
    id: 'coach-002',
    firstName: 'Maria',
    lastName: 'Olsen',
    role: 'coach',
    specialty: 'Short game',
    avatar: null,
  },
];

// =============================================================================
// DASHBOARD STATS
// =============================================================================

export const mockDashboardStats = {
  trainingDays: 12,
  upcomingTests: 2,
  weeklyGoal: 75,
  badges: 8,
};

export const mockTreningStats = {
  sessionsThisMonth: 15,
  hoursTrained: 24,
  exercisesCompleted: 87,
  testsCompleted: 3,
};

export const mockUtviklingStats = {
  categoryProgress: 68,
  testScore: 82,
  badgesEarned: 12,
  weeklyImprovement: 5,
};

export const mockPlanStats = {
  plannedSessions: 8,
  upcomingTournaments: 3,
  activeGoals: 5,
  completedGoals: 12,
};

export const mockMerStats = {
  unreadMessages: 3,
  newFeedback: 2,
  resources: 45,
};

// =============================================================================
// RECENT ACTIVITIES
// =============================================================================

export const mockRecentActivities = [
  {
    id: 'activity-001',
    title: 'Training session: Short game focus',
    type: 'training',
    date: 'Today, 14:30',
    icon: 'Dumbbell',
    color: '#059669',
  },
  {
    id: 'activity-002',
    title: 'Test completed: Putting precision',
    type: 'test',
    date: 'Yesterday, 10:00',
    icon: 'Target',
    color: '#0284C7',
  },
  {
    id: 'activity-003',
    title: 'Badge earned: Consistent training',
    type: 'badge',
    date: '2 days ago',
    icon: 'Award',
    color: '#B8860B',
  },
  {
    id: 'activity-004',
    title: 'Goal completed: 10 training sessions',
    type: 'goal',
    date: '3 days ago',
    icon: 'CheckCircle',
    color: '#059669',
  },
];

// =============================================================================
// TRAINING SESSIONS
// =============================================================================

export const mockSessions = [
  {
    id: 'session-001',
    title: 'Short game focus',
    date: '2025-01-03',
    duration: 90,
    focusArea: 'Short game',
    status: 'completed',
    rating: 4,
    notes: 'Good session focusing on chipping',
  },
  {
    id: 'session-002',
    title: 'Driver and fairway',
    date: '2025-01-02',
    duration: 60,
    focusArea: 'Long game',
    status: 'completed',
    rating: 3,
    notes: 'Challenges with slice',
  },
  {
    id: 'session-003',
    title: 'Putting drill',
    date: '2025-01-01',
    duration: 45,
    focusArea: 'Putting',
    status: 'completed',
    rating: 5,
    notes: 'Best putting session in a long time!',
  },
];

export const mockUpcomingSessions = [
  {
    id: 'upcoming-001',
    title: 'Coach session with Erik',
    date: '2025-01-05',
    time: '10:00',
    duration: 60,
    coach: 'Erik Hansen',
    location: 'Holtsmark Golf',
  },
  {
    id: 'upcoming-002',
    title: 'Group training',
    date: '2025-01-07',
    time: '14:00',
    duration: 120,
    coach: 'Maria Olsen',
    location: 'Indoor range',
  },
];

// =============================================================================
// TESTS & RESULTS
// =============================================================================

export const mockTestResults = [
  {
    id: 'test-001',
    testType: 'putting_precision',
    name: 'Putting precision',
    date: '2025-01-02',
    score: 82,
    previousScore: 75,
    improvement: 7,
    category: 'putting',
  },
  {
    id: 'test-002',
    testType: 'driver_distance',
    name: 'Driver distance',
    date: '2024-12-28',
    score: 245,
    previousScore: 238,
    improvement: 7,
    unit: 'm',
    category: 'long_game',
  },
  {
    id: 'test-003',
    testType: 'chip_accuracy',
    name: 'Chip accuracy',
    date: '2024-12-20',
    score: 68,
    previousScore: 62,
    improvement: 6,
    unit: '%',
    category: 'short_game',
  },
];

export const mockUpcomingTests = [
  {
    id: 'upcoming-test-001',
    name: 'Putting precision',
    scheduledDate: '2025-01-10',
    category: 'putting',
  },
  {
    id: 'upcoming-test-002',
    name: 'Bunker escape rate',
    scheduledDate: '2025-01-15',
    category: 'short_game',
  },
];

// =============================================================================
// BADGES & ACHIEVEMENTS
// =============================================================================

export const mockBadges = [
  {
    id: 'badge-001',
    name: 'Consistent training',
    description: '10 training sessions in 30 days',
    earnedAt: '2025-01-01',
    icon: 'Dumbbell',
    tier: 'bronze',
  },
  {
    id: 'badge-002',
    name: 'Putting master',
    description: '85% precision on putting test',
    earnedAt: '2024-12-28',
    icon: 'Target',
    tier: 'silver',
  },
  {
    id: 'badge-003',
    name: 'Goal-oriented',
    description: 'Completed 5 goals',
    earnedAt: '2024-12-15',
    icon: 'Award',
    tier: 'gold',
  },
];

export const mockNextBadges = [
  {
    id: 'next-badge-001',
    name: 'Training addict',
    description: '25 training sessions in 30 days',
    progress: 60,
    requirement: 25,
    current: 15,
  },
  {
    id: 'next-badge-002',
    name: 'Driver king',
    description: '260m average on driver test',
    progress: 94,
    requirement: 260,
    current: 245,
    unit: 'm',
  },
];

// =============================================================================
// GOALS
// =============================================================================

export const mockGoals = [
  {
    id: 'goal-001',
    title: 'Reduce HCP to 10',
    type: 'season',
    targetDate: '2025-06-30',
    progress: 45,
    status: 'in_progress',
    metrics: {
      target: 10,
      current: 12.4,
      unit: 'hcp',
    },
  },
  {
    id: 'goal-002',
    title: '20 training sessions this month',
    type: 'short_term',
    targetDate: '2025-01-31',
    progress: 75,
    status: 'in_progress',
    metrics: {
      target: 20,
      current: 15,
      unit: 'sessions',
    },
  },
  {
    id: 'goal-003',
    title: 'Pass category 2 test',
    type: 'long_term',
    targetDate: '2025-12-31',
    progress: 68,
    status: 'in_progress',
    metrics: {
      target: 100,
      current: 68,
      unit: '%',
    },
  },
];

// =============================================================================
// CALENDAR & TOURNAMENTS
// =============================================================================

export const mockCalendarEvents = [
  {
    id: 'event-001',
    title: 'Coach session',
    date: '2025-01-05',
    time: '10:00',
    type: 'training',
    location: 'Holtsmark Golf',
  },
  {
    id: 'event-002',
    title: 'Winter tournament',
    date: '2025-01-12',
    time: '08:00',
    type: 'tournament',
    location: 'Losby Golf',
  },
  {
    id: 'event-003',
    title: 'Category test',
    date: '2025-01-15',
    time: '14:00',
    type: 'test',
    location: 'Holtsmark Golf',
  },
];

export const mockTournaments = [
  {
    id: 'tournament-001',
    name: 'Winter Tournament 2025',
    date: '2025-01-12',
    location: 'Losby Golf',
    status: 'registered',
    category: 'League',
  },
  {
    id: 'tournament-002',
    name: 'Spring Cup',
    date: '2025-03-15',
    location: 'Oslo GK',
    status: 'open',
    category: 'Open',
    deadline: '2025-03-01',
  },
  {
    id: 'tournament-003',
    name: 'Junior Series Round 1',
    date: '2025-04-20',
    location: 'Holtsmark Golf',
    status: 'open',
    category: 'Junior',
    deadline: '2025-04-10',
  },
];

// =============================================================================
// MESSAGES & NOTIFICATIONS
// =============================================================================

export const mockMessages = [
  {
    id: 'msg-001',
    from: 'Erik Hansen',
    subject: 'Session summary',
    preview: 'Hi! Great work today. Here are some key points...',
    date: '2025-01-03',
    unread: true,
  },
  {
    id: 'msg-002',
    from: 'Maria Olsen',
    subject: 'Next group training',
    preview: 'We start with short game focus...',
    date: '2025-01-02',
    unread: true,
  },
  {
    id: 'msg-003',
    from: 'TIER Golf',
    subject: 'New badge earned!',
    preview: 'Congratulations! You have earned "Consistent training"...',
    date: '2025-01-01',
    unread: false,
  },
];

export const mockNotifications = [
  {
    id: 'notif-001',
    type: 'reminder',
    title: 'Coach session tomorrow',
    message: 'You have an appointment with Erik Hansen at 10:00',
    date: '2025-01-04',
    read: false,
  },
  {
    id: 'notif-002',
    type: 'achievement',
    title: 'Badge earned!',
    message: 'You have earned the badge "Consistent training"',
    date: '2025-01-01',
    read: true,
  },
];

// =============================================================================
// EXERCISES & RESOURCES
// =============================================================================

export const mockExercises = [
  {
    id: 'exercise-001',
    name: 'Gate drill',
    category: 'putting',
    difficulty: 'beginner',
    duration: 15,
    description: 'Exercise to improve putting precision',
    videoUrl: null,
  },
  {
    id: 'exercise-002',
    name: 'Ladder drill',
    category: 'putting',
    difficulty: 'intermediate',
    duration: 20,
    description: 'Distance control exercise',
    videoUrl: null,
  },
  {
    id: 'exercise-003',
    name: 'Alignment stick drill',
    category: 'full_swing',
    difficulty: 'beginner',
    duration: 15,
    description: 'Exercise for better alignment',
    videoUrl: null,
  },
];

export const mockKnowledgeArticles = [
  {
    id: 'article-001',
    title: 'Putting: The 5 most important fundamentals',
    category: 'technique',
    readTime: 5,
    publishedAt: '2024-12-15',
  },
  {
    id: 'article-002',
    title: 'Mental preparation before tournament',
    category: 'mental',
    readTime: 8,
    publishedAt: '2024-12-10',
  },
  {
    id: 'article-003',
    title: 'Warm-up: Optimal routine',
    category: 'fitness',
    readTime: 4,
    publishedAt: '2024-12-05',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Simulate API delay
 */
export async function simulateDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get mock data with simulated delay
 */
export async function getMockData<T>(data: T, delayMs: number = 500): Promise<T> {
  await simulateDelay(delayMs);
  return data;
}

export default {
  player: mockPlayer,
  coaches: mockCoaches,
  dashboardStats: mockDashboardStats,
  treningStats: mockTreningStats,
  utviklingStats: mockUtviklingStats,
  planStats: mockPlanStats,
  merStats: mockMerStats,
  recentActivities: mockRecentActivities,
  sessions: mockSessions,
  upcomingSessions: mockUpcomingSessions,
  testResults: mockTestResults,
  upcomingTests: mockUpcomingTests,
  badges: mockBadges,
  nextBadges: mockNextBadges,
  goals: mockGoals,
  calendarEvents: mockCalendarEvents,
  tournaments: mockTournaments,
  messages: mockMessages,
  notifications: mockNotifications,
  exercises: mockExercises,
  knowledgeArticles: mockKnowledgeArticles,
};
