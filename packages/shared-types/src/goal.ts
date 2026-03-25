/**
 * @iup/shared-types - Goal types
 *
 * CANONICAL SOURCE OF TRUTH for player goal models.
 *
 * Write access: goals/
 * Read access: dashboard/, coach/, achievements/
 *
 * Single Goal model with optional milestones.
 */

import type {
  UUID,
  ISODateString,
  ISODateTimeString,
  GoalType,
  GoalTimeframe,
  GoalStatus,
  GoalProgressTrend,
  GoalActivityType,
  UserEntity,
} from './common'

import {
  GOAL_TYPES,
  GOAL_TIMEFRAMES,
  GOAL_STATUSES,
  GOAL_PROGRESS_TRENDS,
  GOAL_ACTIVITY_TYPES,
} from './common'

// ============================================================================
// CORE GOAL MODEL
// ============================================================================

/**
 * Canonical Goal model.
 * User-scoped (userId) to support both players and coaches having goals.
 */
export interface Goal extends UserEntity {
  // REQUIRED - Goal definition
  title: string
  goalType: GoalType
  timeframe: GoalTimeframe
  startDate: ISODateString
  targetDate: ISODateString
  status: GoalStatus

  // OPTIONAL - Description
  description?: string

  // OPTIONAL - Measurable target
  targetValue?: number
  currentValue?: number
  startValue?: number
  unit?: string // 'score', 'mph', 'meters', 'percent', etc.

  // DERIVED - Progress (computed from values)
  progressPercent: number

  // OPTIONAL - Completion
  completedDate?: ISODateString

  // OPTIONAL - Visual
  icon?: string
  color?: string

  // OPTIONAL - Notes
  notes?: string

  // OPTIONAL - Milestones
  milestones?: GoalMilestone[]
}

/**
 * Goal milestone for tracking intermediate progress.
 */
export interface GoalMilestone {
  id: UUID
  title: string
  targetValue?: number
  completed: boolean
  completedDate?: ISODateString
}

/**
 * Input for creating a new goal.
 */
export interface GoalCreateInput {
  userId: UUID
  title: string
  goalType: GoalType
  timeframe: GoalTimeframe
  startDate: ISODateString
  targetDate: ISODateString
  description?: string
  targetValue?: number
  startValue?: number
  unit?: string
  icon?: string
  color?: string
  notes?: string
  milestones?: Array<{
    title: string
    targetValue?: number
  }>
}

/**
 * Input for updating a goal.
 */
export interface GoalUpdateInput {
  id: UUID
  title?: string
  description?: string | null
  goalType?: GoalType
  timeframe?: GoalTimeframe
  startDate?: ISODateString
  targetDate?: ISODateString
  status?: GoalStatus
  targetValue?: number | null
  currentValue?: number | null
  unit?: string | null
  completedDate?: ISODateString | null
  icon?: string | null
  color?: string | null
  notes?: string | null
}

/**
 * Input for updating a milestone within a goal.
 */
export interface MilestoneUpdateInput {
  goalId: UUID
  milestoneId: UUID
  title?: string
  targetValue?: number | null
  completed?: boolean
  completedDate?: ISODateString | null
}

// ============================================================================
// GOAL QUERY TYPES
// ============================================================================

/**
 * Filters for querying goals.
 */
export interface GoalFilters {
  userId?: UUID
  goalType?: GoalType | GoalType[]
  timeframe?: GoalTimeframe | GoalTimeframe[]
  status?: GoalStatus | GoalStatus[]
  dateFrom?: ISODateString
  dateTo?: ISODateString
}

/**
 * Goal summary for list views.
 */
export interface GoalSummary {
  id: UUID
  title: string
  goalType: GoalType
  timeframe: GoalTimeframe
  status: GoalStatus
  progressPercent: number
  targetDate: ISODateString
  daysRemaining?: number
}

/**
 * Goals grouped by type or timeframe.
 */
export interface GoalsByType {
  type: GoalType
  goals: GoalSummary[]
  totalCount: number
  completedCount: number
}

export interface GoalsByTimeframe {
  timeframe: GoalTimeframe
  goals: GoalSummary[]
  totalCount: number
  completedCount: number
}

// ============================================================================
// GOAL PROGRESS (Computed)
// ============================================================================

/**
 * Computed goal progress with trend analysis.
 */
export interface GoalProgress {
  goalId: UUID
  currentValue: number
  targetValue: number
  startValue: number
  progressPercent: number
  trend: GoalProgressTrend
  projectedCompletionDate?: ISODateString
  milestonesCompleted: number
  milestonesTotal: number
}

/**
 * Goal activity for timeline display.
 */
export interface GoalActivity {
  goalId: UUID
  date: ISODateTimeString
  type: GoalActivityType
  description: string
  previousValue?: number
  newValue?: number
}

// ============================================================================
// UNSAFE BOUNDARY TYPES (DB/API Ingress)
// ============================================================================

/**
 * UNSAFE: Raw goal data from database with unvalidated string enums.
 * Use parseGoalType(), parseGoalTimeframe(), parseGoalStatus() to convert.
 */
export interface UnsafeGoalFromDB {
  id: string
  userId: string
  title: string
  description: string | null
  goalType: string // UNSAFE - may not be valid GoalType
  timeframe: string // UNSAFE - may not be valid GoalTimeframe
  targetValue: number | null
  currentValue: number | null
  startValue: number | null
  unit: string | null
  progressPercent: number
  startDate: Date | string
  targetDate: Date | string
  completedDate: Date | string | null
  status: string // UNSAFE - may not be valid GoalStatus
  icon: string | null
  color: string | null
  notes: string | null
  milestones: unknown // JSON from DB
  createdAt: Date | string
  updatedAt: Date | string
}

/**
 * UNSAFE: Raw goal input from API request body.
 */
export interface UnsafeGoalInput {
  title?: string
  description?: string
  goalType?: string // UNSAFE - needs validation
  timeframe?: string // UNSAFE - needs validation
  targetValue?: number
  currentValue?: number
  startValue?: number
  unit?: string
  startDate?: string
  targetDate?: string
  status?: string // UNSAFE - needs validation
  icon?: string
  color?: string
  notes?: string
  milestones?: unknown[]
}

// ============================================================================
// PARSE HELPERS (Safe Conversion)
// ============================================================================

/**
 * Parses a string to GoalType, returns undefined if invalid.
 */
export function parseGoalType(value: string | undefined | null): GoalType | undefined {
  if (!value) return undefined
  const normalized = value.toLowerCase().trim()
  return GOAL_TYPES.includes(normalized as GoalType)
    ? (normalized as GoalType)
    : undefined
}

/**
 * Parses a string to GoalType with fallback.
 */
export function parseGoalTypeOrDefault(
  value: string | undefined | null,
  fallback: GoalType = 'score'
): GoalType {
  return parseGoalType(value) ?? fallback
}

/**
 * Parses a string to GoalTimeframe, returns undefined if invalid.
 */
export function parseGoalTimeframe(value: string | undefined | null): GoalTimeframe | undefined {
  if (!value) return undefined
  const normalized = value.toLowerCase().trim()
  return GOAL_TIMEFRAMES.includes(normalized as GoalTimeframe)
    ? (normalized as GoalTimeframe)
    : undefined
}

/**
 * Parses a string to GoalTimeframe with fallback.
 */
export function parseGoalTimeframeOrDefault(
  value: string | undefined | null,
  fallback: GoalTimeframe = 'short'
): GoalTimeframe {
  return parseGoalTimeframe(value) ?? fallback
}

/**
 * Parses a string to GoalStatus, returns undefined if invalid.
 */
export function parseGoalStatus(value: string | undefined | null): GoalStatus | undefined {
  if (!value) return undefined
  const normalized = value.toLowerCase().trim()
  return GOAL_STATUSES.includes(normalized as GoalStatus)
    ? (normalized as GoalStatus)
    : undefined
}

/**
 * Parses a string to GoalStatus with fallback.
 */
export function parseGoalStatusOrDefault(
  value: string | undefined | null,
  fallback: GoalStatus = 'active'
): GoalStatus {
  return parseGoalStatus(value) ?? fallback
}

/**
 * Parses a string to GoalProgressTrend, returns undefined if invalid.
 */
export function parseGoalProgressTrend(
  value: string | undefined | null
): GoalProgressTrend | undefined {
  if (!value) return undefined
  const normalized = value.toLowerCase().trim()
  return GOAL_PROGRESS_TRENDS.includes(normalized as GoalProgressTrend)
    ? (normalized as GoalProgressTrend)
    : undefined
}

/**
 * Parses a string to GoalActivityType, returns undefined if invalid.
 */
export function parseGoalActivityType(
  value: string | undefined | null
): GoalActivityType | undefined {
  if (!value) return undefined
  const normalized = value.toLowerCase().trim()
  return GOAL_ACTIVITY_TYPES.includes(normalized as GoalActivityType)
    ? (normalized as GoalActivityType)
    : undefined
}
