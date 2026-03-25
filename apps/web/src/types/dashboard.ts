/**
 * ================================================================
 * Dashboard Frontend Type Definitions
 * ================================================================
 *
 * Types for dashboard API requests and responses.
 */

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
  week: number;
  year: number;
  month: number;
  monthName: string;
}

/**
 * Training session
 */
export interface TrainingSession {
  id: string;
  sessionType: SessionType;
  title: string;
  scheduledTime: string;
  duration: number;
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
  earnedAt: string;
  context: Record<string, unknown> | null;
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
  progress: number | null;
  status: GoalStatus;
  priority: GoalPriority | null;
  targetDate: string | null;
  createdAt: string;
  completedAt: string | null;
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
  streak: number;
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
  sentAt: string;
  read: boolean;
}

/**
 * Upcoming tournament
 */
export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  location: string;
  daysUntil: number;
}

/**
 * Upcoming test
 */
export interface Test {
  id: string;
  testName: string;
  scheduledDate: string;
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
  progress: number;
}

/**
 * Test result
 */
export interface TestResult {
  id: string;
  testName: string;
  testDate: string;
  pei: number;
  value: number;
}

/**
 * Type alias for domain/tests/mappers.ts compatibility.
 * DashboardTestResult is the same as TestResult, but provides semantic clarity
 * when distinguishing from canonical TestResult in @iup/shared-types.
 */
export type DashboardTestResult = TestResult;

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
  date?: string;
}

/**
 * Weekly stats query parameters
 */
export interface WeeklyStatsQueryParams {
  week?: number;
  year?: number;
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

/**
 * Frontend-specific types
 */

/**
 * Dashboard loading state
 */
export type DashboardLoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * useDashboard hook return type
 */
export interface UseDashboardReturn {
  dashboardData: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Dashboard filter options
 */
export interface DashboardFilters {
  date?: Date;
  showOnlyActive?: boolean;
}

/**
 * UI State for dashboard widgets
 */
export interface WidgetState {
  isExpanded: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Chart data point for stats visualization
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  color?: string;
}

/**
 * Type guard for checking if a session is scheduled today
 */
export function isToday(session: TrainingSession): boolean {
  const sessionDate = new Date(session.scheduledTime);
  const today = new Date();
  return (
    sessionDate.getDate() === today.getDate() &&
    sessionDate.getMonth() === today.getMonth() &&
    sessionDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Type guard for checking if a goal is overdue
 */
export function isOverdue(goal: Goal): boolean {
  if (!goal.targetDate) return false;
  const targetDate = new Date(goal.targetDate);
  const today = new Date();
  return targetDate < today && goal.status === 'active';
}

/**
 * Helper to format session duration
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}t ${mins}min` : `${hours}t`;
}

/**
 * Helper to get severity color class
 */
export function getSeverityColor(severity: BreakingPointSeverity): string {
  const colors: Record<BreakingPointSeverity, string> = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  };
  return colors[severity];
}

/**
 * Helper to get badge tier color
 */
export function getBadgeTierColor(tier: BadgeTier): string {
  const colors: Record<BadgeTier, string> = {
    bronze: 'text-amber-700',
    silver: 'text-gray-400',
    gold: 'text-yellow-500',
    platinum: 'text-purple-400',
  };
  return colors[tier];
}
