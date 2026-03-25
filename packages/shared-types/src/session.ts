/**
 * @iup/shared-types - Session types
 *
 * CANONICAL SOURCE OF TRUTH for training session models.
 *
 * Write access: sessions/, training-plan/
 * Read access: calendar/, dashboard/, stats/, achievements/, coach/
 *
 * Reduced from 45+ fields to 18 core fields (60% reduction).
 */

import type {
  UUID,
  ISODateString,
  ISODateTimeString,
  SessionType,
  SessionStatus,
  LearningPhase,
  Period,
  PlayerEntity,
} from './common'

// ============================================================================
// CORE SESSION MODEL
// ============================================================================

/**
 * Minimal canonical Session model.
 * This is the single source of truth for training sessions.
 */
export interface Session extends PlayerEntity {
  // REQUIRED - Core identification
  sessionType: SessionType
  sessionDate: ISODateTimeString
  durationMinutes: number

  // OPTIONAL - Context
  coachId?: UUID
  assignmentId?: UUID
  templateId?: UUID
  learningPhase?: LearningPhase
  period?: Period
  focusArea?: string
  notes?: string

  // DERIVED - Computed by system, not user-provided
  status: SessionStatus
  completedAt?: ISODateTimeString
  actualDurationMinutes?: number
}

/**
 * Input for creating a new session.
 * Excludes system-managed fields.
 */
export interface SessionCreateInput {
  playerId: UUID
  sessionType: SessionType
  sessionDate: ISODateTimeString
  durationMinutes: number

  coachId?: UUID
  assignmentId?: UUID
  templateId?: UUID
  learningPhase?: LearningPhase
  period?: Period
  focusArea?: string
  notes?: string
}

/**
 * Input for updating a session.
 * All fields optional except id.
 */
export interface SessionUpdateInput {
  id: UUID
  sessionType?: SessionType
  sessionDate?: ISODateTimeString
  durationMinutes?: number
  coachId?: UUID | null
  assignmentId?: UUID | null
  templateId?: UUID | null
  learningPhase?: LearningPhase | null
  period?: Period | null
  focusArea?: string | null
  notes?: string | null
  status?: SessionStatus
  completedAt?: ISODateTimeString | null
  actualDurationMinutes?: number | null
}

// ============================================================================
// SESSION EVALUATION (Separate concern)
// ============================================================================

/**
 * Session evaluation data, stored separately from the session.
 * Optional post-session reflection by the player.
 */
export interface SessionEvaluation {
  sessionId: UUID

  // Ratings (1-10 scale)
  focusRating?: number
  technicalRating?: number
  energyRating?: number
  mentalRating?: number

  // Pre-shot routine tracking
  preShotConsistency?: 'yes' | 'partial' | 'no'
  preShotCount?: number
  totalShots?: number

  // Technical cues used
  technicalCues?: string[]
  customCue?: string

  // Reflection notes
  whatWentWell?: string
  nextSessionFocus?: string

  // Media attachments
  mediaUrls?: string[]
}

/**
 * Input for saving session evaluation.
 */
export interface SessionEvaluationInput {
  sessionId: UUID
  focusRating?: number
  technicalRating?: number
  energyRating?: number
  mentalRating?: number
  preShotConsistency?: 'yes' | 'partial' | 'no'
  preShotCount?: number
  totalShots?: number
  technicalCues?: string[]
  customCue?: string
  whatWentWell?: string
  nextSessionFocus?: string
  mediaUrls?: string[]
}

// ============================================================================
// SESSION QUERY TYPES
// ============================================================================

/**
 * Filters for querying sessions.
 */
export interface SessionFilters {
  playerId?: UUID
  coachId?: UUID
  sessionType?: SessionType | SessionType[]
  status?: SessionStatus | SessionStatus[]
  period?: Period | Period[]
  dateFrom?: ISODateString
  dateTo?: ISODateString
  hasEvaluation?: boolean
}

/**
 * Session with joined evaluation data (read-only view).
 */
export interface SessionWithEvaluation extends Session {
  evaluation?: SessionEvaluation
}

/**
 * Session summary for list views (minimal fields).
 */
export interface SessionSummary {
  id: UUID
  sessionType: SessionType
  sessionDate: ISODateTimeString
  durationMinutes: number
  status: SessionStatus
  focusArea?: string
}

// ============================================================================
// SESSION STATISTICS (Computed, not stored)
// ============================================================================

/**
 * Computed session statistics for a time period.
 * These are NEVER stored in the database - always computed on demand.
 */
export interface SessionStats {
  period: {
    from: ISODateString
    to: ISODateString
  }
  totalSessions: number
  totalMinutes: number
  completedSessions: number
  skippedSessions: number
  byType: Record<SessionType, number>
  byPeriod: Record<Period, number>
  averageRatings?: {
    focus: number
    technical: number
    energy: number
    mental: number
  }
}
