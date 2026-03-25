/**
 * @iup/shared-types - Plan types
 *
 * CANONICAL SOURCE OF TRUTH for training plan models.
 *
 * Write access: training-plan/
 * Read access: calendar/, dashboard/, stats/, coach/
 *
 * Reduced from 60+ fields to 21 core fields (65% reduction).
 * Deleted: Periodization model (absorbed into Assignment.period)
 */

import type {
  UUID,
  ISODateString,
  ISODateTimeString,
  SessionType,
  PlanStatus,
  AssignmentStatus,
  Period,
  LearningPhase,
  PlayerCategory,
  TenantEntity,
  PlayerEntity,
} from './common'

// ============================================================================
// CORE PLAN MODEL
// ============================================================================

/**
 * Minimal canonical Plan model.
 * This is the single source of truth for annual training plans.
 *
 * NOTE: Baseline data (score, handicap, driver speed) is stored only
 * at plan creation time for historical reference. Current values
 * are always read from Player model.
 */
export interface Plan extends TenantEntity {
  playerId: UUID

  // REQUIRED - Plan definition
  name: string
  startDate: ISODateString
  endDate: ISODateString
  status: PlanStatus

  // REQUIRED - Training parameters
  weeklyHoursTarget: number
  playerCategory: PlayerCategory

  // OPTIONAL - Notes
  notes?: string

  // DERIVED - Computed fields (not stored, calculated on read)
  // These are included for convenience but should be computed
  totalWeeks?: number
  currentWeek?: number
  completionPercent?: number
}

/**
 * Input for creating a new plan.
 */
export interface PlanCreateInput {
  playerId: UUID
  tenantId: UUID
  name: string
  startDate: ISODateString
  endDate: ISODateString
  weeklyHoursTarget: number
  playerCategory: PlayerCategory
  notes?: string
}

/**
 * Input for updating a plan.
 */
export interface PlanUpdateInput {
  id: UUID
  name?: string
  startDate?: ISODateString
  endDate?: ISODateString
  status?: PlanStatus
  weeklyHoursTarget?: number
  notes?: string | null
}

// ============================================================================
// ASSIGNMENT MODEL
// ============================================================================

/**
 * Daily training assignment within a plan.
 * Replaces the Periodization model - period context is per-assignment.
 */
export interface Assignment extends PlayerEntity {
  planId: UUID

  // REQUIRED - Schedule
  assignedDate: ISODateString
  weekNumber: number
  dayOfWeek: number // 0-6 (Sunday-Saturday)

  // REQUIRED - Session specification
  sessionType: SessionType
  durationMinutes: number

  // OPTIONAL - Training context (from former Periodization)
  period?: Period
  learningPhase?: LearningPhase
  intensity?: number // 1-5

  // OPTIONAL - Template reference
  templateId?: UUID

  // OPTIONAL - Flags
  isRestDay: boolean
  isOptional: boolean

  // DERIVED - Execution tracking
  status: AssignmentStatus
  completedSessionId?: UUID
  completedAt?: ISODateTimeString

  // OPTIONAL - Notes
  coachNotes?: string
  playerNotes?: string
}

/**
 * Input for creating an assignment.
 */
export interface AssignmentCreateInput {
  planId: UUID
  playerId: UUID
  assignedDate: ISODateString
  weekNumber: number
  dayOfWeek: number
  sessionType: SessionType
  durationMinutes: number
  period?: Period
  learningPhase?: LearningPhase
  intensity?: number
  templateId?: UUID
  isRestDay?: boolean
  isOptional?: boolean
  coachNotes?: string
}

/**
 * Input for updating an assignment.
 */
export interface AssignmentUpdateInput {
  id: UUID
  assignedDate?: ISODateString
  sessionType?: SessionType
  durationMinutes?: number
  period?: Period | null
  learningPhase?: LearningPhase | null
  intensity?: number | null
  templateId?: UUID | null
  isRestDay?: boolean
  isOptional?: boolean
  status?: AssignmentStatus
  completedSessionId?: UUID | null
  coachNotes?: string | null
  playerNotes?: string | null
}

// ============================================================================
// PLAN QUERY TYPES
// ============================================================================

/**
 * Filters for querying plans.
 */
export interface PlanFilters {
  playerId?: UUID
  tenantId?: UUID
  status?: PlanStatus | PlanStatus[]
  dateFrom?: ISODateString
  dateTo?: ISODateString
}

/**
 * Filters for querying assignments.
 */
export interface AssignmentFilters {
  planId?: UUID
  playerId?: UUID
  status?: AssignmentStatus | AssignmentStatus[]
  sessionType?: SessionType | SessionType[]
  period?: Period | Period[]
  weekNumber?: number
  dateFrom?: ISODateString
  dateTo?: ISODateString
  isRestDay?: boolean
}

/**
 * Plan with computed statistics (read-only view).
 */
export interface PlanWithStats extends Plan {
  stats: {
    totalAssignments: number
    completedAssignments: number
    skippedAssignments: number
    totalMinutesPlanned: number
    totalMinutesCompleted: number
    bySessionType: Record<SessionType, { planned: number; completed: number }>
  }
}

/**
 * Weekly view of assignments (computed).
 */
export interface WeekView {
  weekNumber: number
  startDate: ISODateString
  endDate: ISODateString
  period?: Period
  assignments: Assignment[]
  stats: {
    totalMinutes: number
    completedMinutes: number
    byType: Record<SessionType, number>
  }
}

// ============================================================================
// PLAN GENERATION
// ============================================================================

/**
 * Input for generating a new plan from player data.
 */
export interface PlanGenerationInput {
  playerId: UUID
  tenantId: UUID
  name: string
  startDate: ISODateString
  endDate: ISODateString
  weeklyHoursTarget: number

  // Optional constraints
  restDays?: number[] // 0-6
  excludeDates?: ISODateString[]
  tournamentDates?: Array<{
    date: ISODateString
    importance: 'A' | 'B' | 'C'
  }>
}

/**
 * Result of plan generation.
 */
export interface PlanGenerationResult {
  plan: Plan
  assignments: Assignment[]
  warnings?: string[]
}
