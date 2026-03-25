/**
 * @iup/shared-types - Common types and enums
 *
 * CANONICAL SOURCE OF TRUTH for domain enums used across frontend and backend.
 * Do not redefine these types elsewhere in the codebase.
 */

// ============================================================================
// SESSION TYPES
// ============================================================================

/**
 * Canonical session types matching the golf training domain.
 * Maps to Norwegian: teknikk, golfslag, spill, fysisk, mental, konkurranse
 */
export type SessionType =
  | 'teknikk'      // Technique training
  | 'golfslag'     // Golf shot training
  | 'spill'        // Game/play training
  | 'fysisk'       // Physical training
  | 'mental'       // Mental training
  | 'konkurranse'  // Competition

export const SESSION_TYPES: readonly SessionType[] = [
  'teknikk',
  'golfslag',
  'spill',
  'fysisk',
  'mental',
  'konkurranse',
] as const

/**
 * Session completion status
 */
export type SessionStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'auto_completed'
  | 'skipped'
  | 'abandoned'

export const SESSION_STATUSES: readonly SessionStatus[] = [
  'planned',
  'in_progress',
  'completed',
  'auto_completed',
  'skipped',
  'abandoned',
] as const

// ============================================================================
// TRAINING PERIODS
// ============================================================================

/**
 * Periodization periods (E/G/S/T)
 * - E: Etablering (Establishment/Base)
 * - G: Grunnleggende (Foundation)
 * - S: Spesialisering (Specialization)
 * - T: Topping (Tournament/Peak)
 */
export type Period = 'E' | 'G' | 'S' | 'T'

export const PERIODS: readonly Period[] = ['E', 'G', 'S', 'T'] as const

export const PERIOD_LABELS: Record<Period, string> = {
  E: 'Etablering',
  G: 'Grunnleggende',
  S: 'Spesialisering',
  T: 'Topping',
}

// ============================================================================
// LEARNING PHASES
// ============================================================================

/**
 * Learning phase progression (L1-L5)
 */
export type LearningPhase = 'L1' | 'L2' | 'L3' | 'L4' | 'L5'

export const LEARNING_PHASES: readonly LearningPhase[] = [
  'L1',
  'L2',
  'L3',
  'L4',
  'L5',
] as const

// ============================================================================
// PLAYER CATEGORIES
// ============================================================================

/**
 * Player skill categories (A1-D2)
 */
export type PlayerCategory =
  | 'A1' | 'A2'
  | 'B1' | 'B2'
  | 'C1' | 'C2'
  | 'D1' | 'D2'

export const PLAYER_CATEGORIES: readonly PlayerCategory[] = [
  'A1', 'A2',
  'B1', 'B2',
  'C1', 'C2',
  'D1', 'D2',
] as const

// ============================================================================
// PLAN STATUS
// ============================================================================

export type PlanStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export const PLAN_STATUSES: readonly PlanStatus[] = [
  'active',
  'completed',
  'paused',
  'cancelled',
] as const

// ============================================================================
// ASSIGNMENT STATUS
// ============================================================================

export type AssignmentStatus = 'planned' | 'completed' | 'skipped' | 'rescheduled'

export const ASSIGNMENT_STATUSES: readonly AssignmentStatus[] = [
  'planned',
  'completed',
  'skipped',
  'rescheduled',
] as const

// ============================================================================
// GOAL TYPES
// ============================================================================

export type GoalType = 'score' | 'technique' | 'physical' | 'mental' | 'competition'

export const GOAL_TYPES: readonly GoalType[] = [
  'score',
  'technique',
  'physical',
  'mental',
  'competition',
] as const

export type GoalTimeframe = 'short' | 'medium' | 'long'

export const GOAL_TIMEFRAMES: readonly GoalTimeframe[] = [
  'short',
  'medium',
  'long',
] as const

export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export const GOAL_STATUSES: readonly GoalStatus[] = [
  'active',
  'completed',
  'paused',
  'cancelled',
] as const

// ============================================================================
// GOAL PROGRESS & ACTIVITY TYPES
// ============================================================================

/**
 * Goal progress trend for analytics and projections.
 */
export type GoalProgressTrend = 'on_track' | 'ahead' | 'behind' | 'at_risk'

export const GOAL_PROGRESS_TRENDS: readonly GoalProgressTrend[] = [
  'on_track',
  'ahead',
  'behind',
  'at_risk',
] as const

/**
 * Goal activity types for timeline/history.
 */
export type GoalActivityType =
  | 'created'
  | 'updated'
  | 'milestone_completed'
  | 'value_changed'
  | 'status_changed'
  | 'completed'

export const GOAL_ACTIVITY_TYPES: readonly GoalActivityType[] = [
  'created',
  'updated',
  'milestone_completed',
  'value_changed',
  'status_changed',
  'completed',
] as const

// ============================================================================
// TEST TYPES
// ============================================================================

export type TestCategory = 'putting' | 'chipping' | 'pitching' | 'bunker' | 'iron' | 'driver' | 'physical' | 'mental'

export const TEST_CATEGORIES: readonly TestCategory[] = [
  'putting',
  'chipping',
  'pitching',
  'bunker',
  'iron',
  'driver',
  'physical',
  'mental',
] as const

export type TestEnvironment = 'indoor' | 'outdoor'

export const TEST_ENVIRONMENTS: readonly TestEnvironment[] = [
  'indoor',
  'outdoor',
] as const

// ============================================================================
// USER ROLES
// ============================================================================

export type UserRole = 'admin' | 'coach' | 'player' | 'parent'

export const USER_ROLES: readonly UserRole[] = [
  'admin',
  'coach',
  'player',
  'parent',
] as const

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * UUID string type alias for documentation
 */
export type UUID = string

/**
 * ISO date string (YYYY-MM-DD)
 */
export type ISODateString = string

/**
 * ISO datetime string (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
export type ISODateTimeString = string

/**
 * Base entity fields present on all persisted models
 */
export interface BaseEntity {
  id: UUID
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

/**
 * Tenant-scoped entity
 */
export interface TenantEntity extends BaseEntity {
  tenantId: UUID
}

/**
 * Player-scoped entity
 */
export interface PlayerEntity extends BaseEntity {
  playerId: UUID
}

/**
 * User-scoped entity
 */
export interface UserEntity extends BaseEntity {
  userId: UUID
}
