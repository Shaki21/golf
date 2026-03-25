/**
 * AI Coach Types
 *
 * Centralized type definitions for the AI Coach feature.
 */

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Guide configuration for contextual help
 */
export interface GuideConfig {
  id: string;
  title: string;
  description: string;
  suggestions: string[];
  pageContext?: string;
}

/**
 * AI Trigger configuration for proactive suggestions
 * Based on user data state
 */
export interface AITriggerConfig {
  id: string;
  condition: string; // Description of when this trigger fires
  title: string;
  description: string;
  primaryAction: string;
  suggestions: string[];
}

/**
 * AI Trigger presets based on user state
 */
export const AI_TRIGGERS: Record<string, AITriggerConfig> = {
  // Dashboard triggers
  noGoals: {
    id: 'no-goals',
    condition: 'User has no active goals',
    title: 'Set your first goal!',
    description: 'You have no active goals yet. Goals help you stay focused and track progress. Let me help you set a realistic goal!',
    primaryAction: 'Help me set a goal',
    suggestions: ['What is a good goal?', 'Show examples of goals'],
  },
  noSessions: {
    id: 'no-sessions',
    condition: 'User has no sessions this week',
    title: 'Plan this week\'s training',
    description: 'You have no scheduled sessions this week. Should I help you create a training plan?',
    primaryAction: 'Create weekly plan',
    suggestions: ['How much should I train?', 'Suggest exercises'],
  },
  fewSessions: {
    id: 'few-sessions',
    condition: 'User has less than 3 sessions this week',
    title: 'Need more sessions?',
    description: 'You only have a few sessions planned. For good development, a minimum of 3 sessions per week is recommended.',
    primaryAction: 'Add more sessions',
    suggestions: ['What can I train on?', 'Show exercise library'],
  },
  // Goals triggers
  behindSchedule: {
    id: 'behind-schedule',
    condition: 'User is behind on goal progress',
    title: 'Slightly behind schedule',
    description: 'You\'re a bit behind on some goals. Let me look at possible adjustments or alternative approaches.',
    primaryAction: 'Adjust my goals',
    suggestions: ['Why am I behind?', 'Suggest actions'],
  },
  goalNearCompletion: {
    id: 'goal-near-completion',
    condition: 'User is close to completing a goal',
    title: 'Almost there!',
    description: 'You\'re close to reaching one of your goals! Let me give you some tips to finish strong.',
    primaryAction: 'Give me finishing tips',
    suggestions: ['What is the next step?', 'Set new goal'],
  },
  // Tests triggers
  newTestResult: {
    id: 'new-test-result',
    condition: 'User has a new test result',
    title: 'New test result',
    description: 'I see you have a new test result. Would you like me to explain what it means for your training?',
    primaryAction: 'Explain the result',
    suggestions: ['What should I improve?', 'Compare with previous test'],
  },
  // Analysis triggers
  negativeTrend: {
    id: 'negative-trend',
    condition: 'User shows declining performance',
    title: 'Let\'s look at the development',
    description: 'I see a downward trend in some areas. This can have several causes. Let me help you analyze.',
    primaryAction: 'Analyze the trend',
    suggestions: ['What could be the cause?', 'Suggest adjustments'],
  },
  positiveTrend: {
    id: 'positive-trend',
    condition: 'User shows improving performance',
    title: 'Great progress!',
    description: 'You\'re showing good progress! Let me suggest how you can build on this momentum.',
    primaryAction: 'Maximize progress',
    suggestions: ['What is working?', 'Next challenge'],
  },
};

/**
 * AI Coach state
 */
export interface AICoachState {
  isOpen: boolean;
  isMinimized: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  isAvailable: boolean;
  unreadCount: number;
  hiddenGuides: string[];
}

/**
 * AI Coach context value
 */
export interface AICoachContextValue extends AICoachState {
  // Panel actions
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  minimizePanel: () => void;
  maximizePanel: () => void;

  // Chat actions
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  markAsRead: () => void;

  // Guide actions
  hideGuide: (guideId: string) => void;
  isGuideHidden: (guideId: string) => boolean;
  resetHiddenGuides: () => void;

  // Navigation from guide
  openPanelWithMessage: (message: string) => void;
}

/**
 * Quick action suggestion
 */
export interface QuickAction {
  label: string;
  message: string;
}

/**
 * Guide presets for different pages
 */
export const GUIDE_PRESETS: Record<string, GuideConfig> = {
  dashboard: {
    id: 'dashboard',
    title: 'Welcome to the dashboard',
    description: 'Here you get an overview of your golf development. I can help you understand the data and set good goals.',
    suggestions: [
      'Explain my results',
      'What should I focus on?',
      'Set a new goal',
    ],
    pageContext: 'dashboard',
  },
  categoryRequirements: {
    id: 'category-requirements',
    title: 'Category requirements',
    description: 'See which skills are required to reach the next level. I can explain the requirements and give you training suggestions.',
    suggestions: [
      'Explain the requirements for my level',
      'Which skills am I missing?',
      'Create a training plan',
    ],
    pageContext: 'category-requirements',
  },
  weeklyPlan: {
    id: 'weekly-plan',
    title: 'Weekly Plan',
    description: 'Your personal training plan. Ask me about exercises or how to customize the plan.',
    suggestions: [
      'Explain today\'s session',
      'Customize my plan',
      'Show alternatives',
    ],
    pageContext: 'weekly-plan',
  },
  tests: {
    id: 'tests',
    title: 'Tests and results',
    description: 'Track your progress through tests. I can analyze the results and suggest improvements.',
    suggestions: [
      'Analyze my results',
      'What does this test mean?',
      'How can I improve?',
    ],
    pageContext: 'tests',
  },
  goals: {
    id: 'goals',
    title: 'Goals and progression',
    description: 'Set and follow up on your goals. Let me help you create realistic and motivating goals.',
    suggestions: [
      'Set a new goal',
      'Check my progress',
      'Adjust my goals',
    ],
    pageContext: 'goals',
  },
  sessions: {
    id: 'sessions',
    title: 'Training sessions',
    description: 'Here you see an overview of all your sessions. I can help you plan your next session or analyze your training history.',
    suggestions: [
      'Plan a new session',
      'Analyze training history',
      'What should I train on?',
    ],
    pageContext: 'sessions',
  },
  statistics: {
    id: 'statistics',
    title: 'Statistics and analysis',
    description: 'Here you can see detailed statistics about your performance. I can explain the trends and help you understand the data.',
    suggestions: [
      'Explain my trends',
      'Compare periods',
      'What should I improve?',
    ],
    pageContext: 'statistics',
  },
  calendar: {
    id: 'calendar',
    title: 'Calendar and planning',
    description: 'Overview of sessions, tournaments and other activities. Let me help you plan your time efficiently.',
    suggestions: [
      'Optimize the weekly plan',
      'When should I rest?',
      'Balance training/tournament',
    ],
    pageContext: 'calendar',
  },
  tournaments: {
    id: 'tournaments',
    title: 'Tournaments',
    description: 'See upcoming and past tournaments. I can help you prepare mentally and physically.',
    suggestions: [
      'Prepare for tournament',
      'Analyze previous rounds',
      'Tips for tournament play',
    ],
    pageContext: 'tournaments',
  },
  videoAnalysis: {
    id: 'video-analysis',
    title: 'Video analysis',
    description: 'Analyze your technique through video. I can help you understand what you see and suggest improvements.',
    suggestions: [
      'What should I look for?',
      'Compare with ideal technique',
      'Exercises for improvement',
    ],
    pageContext: 'video-analysis',
  },
  coachAthletes: {
    id: 'coach-athletes',
    title: 'Player management',
    description: 'Manage your players efficiently. I can help you analyze player progress, plan training sessions, and provide personalized coaching insights.',
    suggestions: [
      'Analyze player progress',
      'Create group training plan',
      'Identify improvement areas',
    ],
    pageContext: 'coach-athletes',
  },
};

/**
 * Default quick actions for empty chat
 */
export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { label: 'Training suggestions', message: 'What should I focus on in my training?' },
  { label: 'Technique tips', message: 'Give me tips to improve my technique' },
  { label: 'Mental strength', message: 'How can I become mentally stronger on the course?' },
  { label: 'Goal setting', message: 'Help me set realistic goals' },
];
