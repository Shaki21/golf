/**
 * Goal Domain Mappers
 *
 * PURE FUNCTIONS ONLY - All functions in this module must be:
 * - Deterministic: same inputs → same outputs
 * - Side-effect free: no I/O, no logging, no global state
 * - Time-independent: no Date.now(), new Date() without arguments
 *
 * Centralized conversion functions from canonical @iup/shared-types models
 * to UI-specific types used in goal views and hooks.
 *
 * SEMANTIC GAPS (cannot be safely mapped):
 *
 * 1. Canonical GoalTimeframe vs UI Goal.type:
 *    - Canonical: 'short' | 'medium' | 'long'
 *    - UI: 'short' | 'long' (medium collapsed to short)
 *    Use mapGoalTimeframeToUIType() with explicit handling.
 *
 * 2. Canonical GoalStatus vs UI Goal.status:
 *    - Canonical: 'active' | 'completed' | 'paused' | 'cancelled'
 *    - UI: 'active' | 'completed' | 'paused' (cancelled mapped to paused)
 *    Use mapGoalStatusToUI() with fallback.
 *
 * SAFE MAPPINGS:
 * - Canonical Goal → UIGoal (with field renaming)
 * - API Response → UIGoal (via mapApiGoalToUI)
 */

// ============================================================================
// CANONICAL TYPES - LOCAL MIRROR OF @iup/shared-types
// ============================================================================
//
// TECHNICAL DEBT: These types are intentionally duplicated from @iup/shared-types.
//
// WHY: Create React App's webpack configuration cannot transpile raw TypeScript
// files from pnpm workspace packages. CRA expects pre-compiled JavaScript, but
// @iup/shared-types only provides .ts source files.
//
// RISK: Type drift if shared-types changes without updating this file.
// MITIGATION: Types verified accurate as of 2026-01-02. Run type comparison
// when updating shared-types: compare packages/shared-types/src/*.ts with these.
//
// EXIT PATH (choose one):
// 1. Migrate from CRA to Vite/Next.js (supports workspace TS transpilation)
// 2. Add build step to shared-types that emits .js + .d.ts files
// 3. Use tsup/unbuild to pre-compile shared-types before web build
//
// See: apps/web/tsconfig.json, packages/shared-types/
// ============================================================================

/**
 * Canonical goal types.
 */
export type GoalType = 'score' | 'technique' | 'physical' | 'mental' | 'competition';

/**
 * Canonical goal timeframe.
 */
export type GoalTimeframe = 'short' | 'medium' | 'long';

/**
 * Canonical goal status.
 */
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

/**
 * Canonical goal from @iup/shared-types.
 */
export interface CanonicalGoal {
  id: string;
  userId: string;
  title: string;
  goalType: GoalType;
  timeframe: GoalTimeframe;
  startDate: string;
  targetDate: string;
  status: GoalStatus;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  startValue?: number;
  unit?: string;
  progressPercent: number;
  completedDate?: string;
  icon?: string;
  color?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Goal summary from @iup/shared-types.
 */
export interface GoalSummary {
  id: string;
  title: string;
  goalType: GoalType;
  timeframe: GoalTimeframe;
  status: GoalStatus;
  progressPercent: number;
  targetDate: string;
}

// ============================================================================
// UI TYPES (View Models)
// ============================================================================

/**
 * UI Goal type for simplified list/card display.
 * Used by GoalsPage and goal progress cards.
 */
export interface UIGoal {
  id: string;
  title: string;
  description?: string;
  current: number;
  target: number;
  unit: string;
  status: UIGoalStatus;
  type: UIGoalType;
}

/**
 * UI goal status (simplified from canonical).
 * 'cancelled' is mapped to 'paused' in UI.
 */
export type UIGoalStatus = 'active' | 'completed' | 'paused';

/**
 * UI goal type (timeframe simplified).
 * 'medium' is mapped to 'short' in UI.
 */
export type UIGoalType = 'short' | 'long';

/**
 * UI Goal stats for dashboard display.
 */
export interface UIGoalStatsItem {
  id: string;
  label: string;
  value: string | number;
  sublabel?: string;
  change?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

/**
 * Complete UI goals data structure.
 */
export interface UIGoalsData {
  goals: UIGoal[];
  stats: UIGoalStatsItem[];
}

/**
 * Raw API response for goals.
 */
export interface ApiGoalResponse {
  id: string;
  title: string;
  description?: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: string;
  goalType: string;
  timeframe?: string;
}

export interface ApiGoalsListResponse {
  goals: ApiGoalResponse[];
  stats?: {
    active: number;
    completed: number;
    averageProgress: number;
  };
}

// ============================================================================
// CANONICAL GoalTimeframe → UIGoalType MAPPING
// ============================================================================

/**
 * Maps canonical GoalTimeframe to UIGoalType.
 *
 * SEMANTIC GAP: 'medium' timeframe has no UI equivalent.
 * Medium is collapsed to 'short' for display purposes.
 *
 * @param timeframe - Canonical GoalTimeframe from @iup/shared-types
 * @returns UIGoalType ('short' | 'long')
 */
export function mapGoalTimeframeToUIType(timeframe: GoalTimeframe): UIGoalType {
  switch (timeframe) {
    case 'long':
      return 'long';
    case 'short':
    case 'medium':
    default:
      return 'short';
  }
}

/**
 * Maps string to UIGoalType with fallback.
 * For API responses where timeframe is a raw string.
 */
export function mapStringToUIGoalType(
  value: string | undefined,
  fallback: UIGoalType = 'short'
): UIGoalType {
  if (!value) return fallback;
  const normalized = value.toLowerCase().trim();
  if (normalized === 'long' || normalized === 'long_term') return 'long';
  return 'short';
}

// ============================================================================
// CANONICAL GoalStatus → UIGoalStatus MAPPING
// ============================================================================

/**
 * Maps canonical GoalStatus to UIGoalStatus.
 *
 * SEMANTIC GAP: 'cancelled' status has no UI equivalent.
 * Cancelled is mapped to 'paused' for display purposes.
 *
 * @param status - Canonical GoalStatus from @iup/shared-types
 * @returns UIGoalStatus ('active' | 'completed' | 'paused')
 */
export function mapGoalStatusToUI(status: GoalStatus): UIGoalStatus {
  switch (status) {
    case 'completed':
      return 'completed';
    case 'paused':
    case 'cancelled':
      return 'paused';
    case 'active':
    default:
      return 'active';
  }
}

/**
 * Maps string to UIGoalStatus with fallback.
 * Handles various API response formats.
 */
export function mapStringToUIGoalStatus(
  value: string | undefined,
  fallback: UIGoalStatus = 'active'
): UIGoalStatus {
  if (!value) return fallback;
  const normalized = value.toLowerCase().trim();

  switch (normalized) {
    case 'completed':
    case 'done':
      return 'completed';
    case 'paused':
    case 'inactive':
    case 'cancelled':
      return 'paused';
    case 'active':
    default:
      return 'active';
  }
}

// ============================================================================
// API → UI MAPPERS
// ============================================================================

/**
 * Maps API goal response to UIGoal.
 *
 * @param apiGoal - Raw API goal response
 * @returns UIGoal for display
 */
export function mapApiGoalToUI(apiGoal: ApiGoalResponse): UIGoal {
  return {
    id: apiGoal.id,
    title: apiGoal.title,
    description: apiGoal.description,
    current: apiGoal.currentValue ?? 0,
    target: apiGoal.targetValue ?? 0,
    unit: apiGoal.unit ?? '',
    status: mapStringToUIGoalStatus(apiGoal.status),
    type: mapStringToUIGoalType(apiGoal.timeframe ?? apiGoal.goalType),
  };
}

/**
 * Maps API goals list response to UIGoalsData.
 *
 * @param response - Raw API goals list response
 * @returns UIGoalsData for display
 */
export function mapApiGoalsToUIData(response: ApiGoalsListResponse): UIGoalsData {
  const goals = response.goals.map(mapApiGoalToUI);

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const avgProgress = calculateAverageProgress(activeGoals);

  const stats: UIGoalStatsItem[] = [
    { id: '1', label: 'Aktive mål', value: String(activeGoals.length) },
    { id: '2', label: 'Fullført', value: String(completedGoals.length), sublabel: 'Denne måneden' },
    {
      id: '3',
      label: 'Progresjon',
      value: `${Math.round(avgProgress)}%`,
      sublabel: 'Gjennomsnitt',
      // Note: Trend calculation requires historical data not available in this mapper
    },
  ];

  return { goals, stats };
}

// ============================================================================
// CANONICAL → UI MAPPERS
// ============================================================================

/**
 * Maps canonical Goal to UIGoal.
 *
 * @param goal - Canonical Goal from @iup/shared-types
 * @returns UIGoal for display
 */
export function mapCanonicalGoalToUI(goal: CanonicalGoal): UIGoal {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    current: goal.currentValue ?? 0,
    target: goal.targetValue ?? 0,
    unit: goal.unit ?? '',
    status: mapGoalStatusToUI(goal.status),
    type: mapGoalTimeframeToUIType(goal.timeframe),
  };
}

/**
 * Maps canonical GoalSummary to UIGoal.
 *
 * @param summary - Canonical GoalSummary
 * @returns UIGoal for display (with some fields defaulted)
 */
export function mapGoalSummaryToUI(summary: GoalSummary): UIGoal {
  return {
    id: summary.id,
    title: summary.title,
    description: undefined,
    current: summary.progressPercent,
    target: 100,
    unit: '%',
    status: mapGoalStatusToUI(summary.status),
    type: mapGoalTimeframeToUIType(summary.timeframe),
  };
}

// ============================================================================
// UTILITY FUNCTIONS (Pure)
// ============================================================================

/**
 * Calculates average progress percentage for a list of goals.
 *
 * @param goals - Array of UIGoals
 * @returns Average progress percentage (0-100)
 */
export function calculateAverageProgress(goals: UIGoal[]): number {
  if (goals.length === 0) return 0;

  const totalProgress = goals.reduce((sum, goal) => {
    const progress = goal.target > 0
      ? (goal.current / goal.target) * 100
      : 0;
    return sum + Math.min(progress, 100);
  }, 0);

  return totalProgress / goals.length;
}

/**
 * Groups goals by their UI type.
 *
 * @param goals - Array of UIGoals
 * @returns Object with 'short' and 'long' arrays
 */
export function groupGoalsByType(goals: UIGoal[]): Record<UIGoalType, UIGoal[]> {
  return {
    short: goals.filter(g => g.type === 'short'),
    long: goals.filter(g => g.type === 'long'),
  };
}

/**
 * Groups goals by their UI status.
 *
 * @param goals - Array of UIGoals
 * @returns Object with status keys and goal arrays
 */
export function groupGoalsByStatus(goals: UIGoal[]): Record<UIGoalStatus, UIGoal[]> {
  return {
    active: goals.filter(g => g.status === 'active'),
    completed: goals.filter(g => g.status === 'completed'),
    paused: goals.filter(g => g.status === 'paused'),
  };
}

// ============================================================================
// DEPRECATED ALIASES (Backward Compatibility)
// ============================================================================

/**
 * @deprecated Use mapStringToUIGoalStatus instead.
 * Kept for backward compatibility with existing useGoals hook.
 */
export function mapGoalStatus(status: string): UIGoalStatus {
  return mapStringToUIGoalStatus(status);
}
