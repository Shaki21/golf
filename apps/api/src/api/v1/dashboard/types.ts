/**
 * ================================================================
 * Dashboard API TypeScript Type Definitions
 * ================================================================
 *
 * Shared types for dashboard API requests and responses.
 * These types can be imported by frontend applications in the monorepo.
 */

/**
 * Generic JSON value type for arbitrary data
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Player status tier
 */
export type PlayerTier = 'beginner' | 'intermediate' | 'advanced' | 'elite';

/**
 * Session type classification
 */
export type SessionType = 'training' | 'test' | 'tournament' | 'recovery';

/**
 * Session status
 */
export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

/**
 * Badge/achievement tier
 */
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * Goal status
 */
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

/**
 * Goal priority
 */
export type GoalPriority = 'low' | 'medium' | 'high';

/**
 * Breaking point severity
 */
export type BreakingPointSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Breaking point status
 */
export type BreakingPointStatus = 'identified' | 'working' | 'in_progress' | 'resolved';

/**
 * Player profile information
 */
export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string | null;
  tier: PlayerTier;
  hcp: number | null;
}

/**
 * Training period information
 */
export interface PeriodInfo {
  week: number;  // ISO week number (1-53)
  year: number;
  month: number;  // Month number (1-12)
  monthName: string;  // Localized month name
}

/**
 * Training session
 */
export interface TrainingSession {
  id: string;
  sessionType: SessionType;
  title: string;
  scheduledTime: string;  // ISO 8601 date-time
  duration: number;  // Duration in minutes
  status: SessionStatus;
}

/**
 * Player achievement/badge
 */
export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  tier: BadgeTier;
  category: string | null;
  earnedAt: string;  // ISO 8601 date-time
  context: Record<string, JsonValue> | null;
}

/**
 * Player goal
 */
export interface Goal {
  id: string;
  title: string;
  category: string | null;
  targetValue: number | null;
  currentValue: number | null;
  unit: string | null;
  progress: number | null;  // Progress percentage (0-100)
  status: GoalStatus;
  priority: GoalPriority | null;
  targetDate: string | null;  // ISO 8601 date
  createdAt: string;  // ISO 8601 date-time
  completedAt: string | null;  // ISO 8601 date-time
}

/**
 * Weekly training statistics
 */
export interface WeeklyStats {
  week?: number;
  year?: number;
  sessionsCompleted: number;
  totalMinutes: number;
  peiGained: number;
  streak: number;  // Consecutive days trained
  byCategory?: Record<string, {
    sessions: number;
    minutes: number;
  }>;
}

/**
 * Message from coach
 */
export interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  sentAt: string;  // ISO 8601 date-time
  read: boolean;
}

/**
 * Upcoming tournament
 */
export interface Tournament {
  id: string;
  name: string;
  startDate: string;  // ISO 8601 date
  location: string;
  daysUntil: number;
}

/**
 * Upcoming test
 */
export interface Test {
  id: string;
  testName: string;
  scheduledDate: string;  // ISO 8601 date
  category: string;
  daysUntil: number;
}

/**
 * Breaking point requiring attention
 */
export interface BreakingPoint {
  id: string;
  category: string;
  area: string;
  severity: BreakingPointSeverity;
  status: BreakingPointStatus;
  progress: number;  // Progress percentage (0-100)
}

/**
 * Test result
 */
export interface TestResult {
  id: string;
  testName: string;
  testDate: string;  // ISO 8601 date
  pei: number;
  value: number;
}

/**
 * Complete dashboard response
 */
export interface DashboardResponse {
  player: PlayerProfile;
  period: PeriodInfo;
  todaySessions: TrainingSession[];
  badges: Badge[];
  goals: Goal[];
  weeklyStats: WeeklyStats;
  messages: Message[];
  unreadCount: number;
  nextTournament: Tournament | null;
  nextTest: Test | null;
  breakingPoints: BreakingPoint[];
  recentTests: TestResult[];
}

/**
 * Dashboard query parameters
 */
export interface DashboardQueryParams {
  date?: string;  // YYYY-MM-DD format
}

/**
 * Weekly stats query parameters
 */
export interface WeeklyStatsQueryParams {
  week?: number;  // ISO week number (1-53)
  year?: number;  // Year (YYYY)
}

/**
 * Goals query parameters
 */
export interface GoalsQueryParams {
  status?: GoalStatus;
}

/**
 * API Error response
 */
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * Type guards
 */
export function isDashboardResponse(obj: unknown): obj is DashboardResponse {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'player' in obj &&
    'period' in obj &&
    'todaySessions' in obj &&
    'badges' in obj &&
    'goals' in obj &&
    'weeklyStats' in obj &&
    'messages' in obj &&
    'unreadCount' in obj
  );
}

export function isApiError(obj: unknown): obj is ApiError {
  return obj !== null && typeof obj === 'object' && 'error' in obj;
}
