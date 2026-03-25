/**
 * @iup/shared-types
 *
 * CANONICAL SOURCE OF TRUTH for IUP Golf domain types.
 *
 * This package provides the single authoritative type definitions
 * for all core domain models. Do not redefine these types elsewhere.
 *
 * Usage:
 *   import type { Session, Plan, TestResult, Goal } from '@iup/shared-types'
 *   import { SESSION_TYPES, PERIODS } from '@iup/shared-types'
 *
 * Or import from specific modules:
 *   import type { Session } from '@iup/shared-types/session'
 *   import type { Plan } from '@iup/shared-types/plan'
 */

// ============================================================================
// COMMON TYPES AND ENUMS
// ============================================================================

export type {
  // Session types
  SessionType,
  SessionStatus,
  // Periods and phases
  Period,
  LearningPhase,
  // Categories
  PlayerCategory,
  // Plan status
  PlanStatus,
  AssignmentStatus,
  // Goal types
  GoalType,
  GoalTimeframe,
  GoalStatus,
  GoalProgressTrend,
  GoalActivityType,
  // Test types
  TestCategory,
  TestEnvironment,
  // User types
  UserRole,
  // Utility types
  UUID,
  ISODateString,
  ISODateTimeString,
  BaseEntity,
  TenantEntity,
  PlayerEntity,
  UserEntity,
} from './common'

export {
  // Session constants
  SESSION_TYPES,
  SESSION_STATUSES,
  // Period constants
  PERIODS,
  PERIOD_LABELS,
  // Learning phase constants
  LEARNING_PHASES,
  // Category constants
  PLAYER_CATEGORIES,
  // Plan status constants
  PLAN_STATUSES,
  ASSIGNMENT_STATUSES,
  // Goal constants
  GOAL_TYPES,
  GOAL_TIMEFRAMES,
  GOAL_STATUSES,
  GOAL_PROGRESS_TRENDS,
  GOAL_ACTIVITY_TYPES,
  // Test constants
  TEST_CATEGORIES,
  TEST_ENVIRONMENTS,
  // User constants
  USER_ROLES,
} from './common'

// ============================================================================
// SESSION TYPES
// ============================================================================

export type {
  Session,
  SessionCreateInput,
  SessionUpdateInput,
  SessionEvaluation,
  SessionEvaluationInput,
  SessionFilters,
  SessionWithEvaluation,
  SessionSummary,
  SessionStats,
} from './session'

// ============================================================================
// PLAN TYPES
// ============================================================================

export type {
  Plan,
  PlanCreateInput,
  PlanUpdateInput,
  Assignment,
  AssignmentCreateInput,
  AssignmentUpdateInput,
  PlanFilters,
  AssignmentFilters,
  PlanWithStats,
  WeekView,
  PlanGenerationInput,
  PlanGenerationResult,
} from './plan'

// ============================================================================
// TEST TYPES
// ============================================================================

export type {
  TestDefinition,
  TestDefinitionCreateInput,
  TestResult,
  TestResultCreateInput,
  TestResultUpdateInput,
  TestResultFilters,
  TestResultWithDefinition,
  TestResultSummary,
  CategoryRequirements,
  TestProgress,
  BenchmarkSummary,
} from './test'

// ============================================================================
// GOAL TYPES
// ============================================================================

export type {
  Goal,
  GoalMilestone,
  GoalCreateInput,
  GoalUpdateInput,
  MilestoneUpdateInput,
  GoalFilters,
  GoalSummary,
  GoalsByType,
  GoalsByTimeframe,
  GoalProgress,
  GoalActivity,
  // Unsafe boundary types
  UnsafeGoalFromDB,
  UnsafeGoalInput,
} from './goal'

export {
  // Parse helpers
  parseGoalType,
  parseGoalTypeOrDefault,
  parseGoalTimeframe,
  parseGoalTimeframeOrDefault,
  parseGoalStatus,
  parseGoalStatusOrDefault,
  parseGoalProgressTrend,
  parseGoalActivityType,
} from './goal'

// ============================================================================
// PERIOD MAPPING (UI ↔ Domain)
// ============================================================================

export type {
  DagbokPeriod,
  UnsafePeriodString,
  UnsafeLearningPhaseString,
  LegacyLearningPhasesArray,
} from './period-mapping'

export {
  DAGBOK_PERIODS,
  // Type guards
  isPeriod,
  isDagbokPeriod,
  isLearningPhase,
  // Parsers (return null on invalid)
  parsePeriod,
  parseDagbokPeriod,
  parseLearningPhase,
  parseLearningPhases,
  // Strict parsers (throw on invalid)
  parsePeriodStrict,
  parseLearningPhasesStrict,
} from './period-mapping'

// ============================================================================
// TEST MAPPING (Validation & Parsing)
// ============================================================================

export type {
  UnsafeTestCategoryString,
  UnsafeTestEnvironmentString,
  UnsafePlayerCategoryString,
} from './test-mapping'

export {
  // Type guards
  isTestCategory,
  isTestEnvironment,
  isPlayerCategory,
  // Parsers (return null on invalid)
  parseTestCategory,
  parseTestEnvironment,
  parsePlayerCategory,
  // Strict parsers (throw on invalid)
  parseTestCategoryStrict,
  parseTestEnvironmentStrict,
  parsePlayerCategoryStrict,
} from './test-mapping'
