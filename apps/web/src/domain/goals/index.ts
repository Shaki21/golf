/**
 * Goal Domain Module
 *
 * Centralized exports for goal-related domain logic including:
 * - Type mappers (canonical → UI)
 * - Timeframe/status mappings with semantic gap handling
 * - Utility functions for goal calculations
 * - Semantic gap documentation
 *
 * NAMING CONVENTION: See docs/naming.md
 * - All exports use English names
 * - Canonical types re-exported from @iup/shared-types
 */

// ============================================================================
// CANONICAL TYPES (Defined locally to avoid CRA webpack issues)
// ============================================================================

// Re-export canonical types from mappers (defined locally there)
export type {
  CanonicalGoal as Goal,
  GoalSummary,
  GoalType,
  GoalTimeframe,
  GoalStatus,
} from './mappers';

// Constants for canonical types
export const GOAL_TYPES = ['score', 'technique', 'physical', 'mental', 'competition'] as const;
export const GOAL_TIMEFRAMES = ['short', 'medium', 'long'] as const;
export const GOAL_STATUSES = ['active', 'completed', 'paused', 'cancelled'] as const;
export const GOAL_PROGRESS_TRENDS = ['on_track', 'ahead', 'behind', 'at_risk'] as const;
export const GOAL_ACTIVITY_TYPES = ['created', 'updated', 'milestone_completed', 'value_changed', 'status_changed', 'completed'] as const;

// Additional types (not currently used by mappers but may be needed)
export type GoalProgressTrend = 'on_track' | 'ahead' | 'behind' | 'at_risk';
export type GoalActivityType = 'created' | 'updated' | 'milestone_completed' | 'value_changed' | 'status_changed' | 'completed';

// ============================================================================
// UI TYPES & MAPPERS
// ============================================================================

export {
  // UI Types
  type UIGoal,
  type UIGoalStatus,
  type UIGoalType,
  type UIGoalStatsItem,
  type UIGoalsData,

  // API Types
  type ApiGoalResponse,
  type ApiGoalsListResponse,

  // Canonical → UI mappers
  mapGoalTimeframeToUIType,
  mapGoalStatusToUI,
  mapCanonicalGoalToUI,
  mapGoalSummaryToUI,

  // API/String → UI mappers (with fallback)
  mapStringToUIGoalType,
  mapStringToUIGoalStatus,
  mapApiGoalToUI,
  mapApiGoalsToUIData,

  // Utility functions
  calculateAverageProgress,
  groupGoalsByType,
  groupGoalsByStatus,

  // Deprecated aliases
  mapGoalStatus,
} from './mappers';
