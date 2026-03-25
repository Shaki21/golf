/**
 * @iup/shared-types - Test types
 *
 * CANONICAL SOURCE OF TRUTH for test and test result models.
 *
 * Write access: tests/, domain/tests/
 * Read access: stats/, dashboard/, coach/, achievements/
 *
 * Two models: TestDefinition (static) and TestResult (player-specific).
 * Reduced from 36 fields to 22 core fields (39% reduction).
 */

import type {
  UUID,
  ISODateString,
  ISODateTimeString,
  TestCategory,
  TestEnvironment,
  PlayerCategory,
  TenantEntity,
} from './common'

// ============================================================================
// TEST DEFINITION MODEL
// ============================================================================

/**
 * Static test definition (tenant-owned).
 * Defines the protocol and requirements for a specific test.
 */
export interface TestDefinition extends TenantEntity {
  // REQUIRED - Identification
  testNumber: number // 1-20 (Team Norway standard)
  name: string
  category: TestCategory
  protocolName: string

  // REQUIRED - Description
  description: string

  // OPTIONAL - Target category for pass/fail
  targetCategory?: PlayerCategory

  // OPTIONAL - Detailed protocol
  testDetails?: Record<string, unknown>

  // FLAGS
  benchmarkWeek: boolean
  isActive: boolean
}

/**
 * Input for creating a test definition.
 */
export interface TestDefinitionCreateInput {
  tenantId: UUID
  testNumber: number
  name: string
  category: TestCategory
  protocolName: string
  description: string
  targetCategory?: PlayerCategory
  testDetails?: Record<string, unknown>
  benchmarkWeek?: boolean
}

// ============================================================================
// TEST RESULT MODEL
// ============================================================================

/**
 * Player's result for a specific test.
 */
export interface TestResult {
  id: UUID
  testId: UUID
  playerId: UUID

  // REQUIRED - When and where
  testDate: ISODateString
  testTime?: string // HH:MM
  location?: string
  environment?: TestEnvironment

  // REQUIRED - Raw result data
  results: Record<string, unknown> // Protocol-specific structure

  // DERIVED - Calculated values (computed by domain/tests/calculations)
  value: number // Main test value
  pei?: number // Performance Efficiency Index (Test 4)
  passed: boolean

  // OPTIONAL - Category context
  categoryRequirement?: number
  percentOfRequirement?: number
  improvementFromLast?: number

  // OPTIONAL - Feedback
  coachFeedback?: string
  playerFeedback?: string

  // OPTIONAL - Evidence
  videoUrl?: string

  // Timestamps
  createdAt: ISODateTimeString
  updatedAt: ISODateTimeString
}

/**
 * Input for recording a test result.
 */
export interface TestResultCreateInput {
  testId: UUID
  playerId: UUID
  testDate: ISODateString
  testTime?: string
  location?: string
  environment?: TestEnvironment
  results: Record<string, unknown>
  videoUrl?: string
}

/**
 * Input for updating a test result.
 */
export interface TestResultUpdateInput {
  id: UUID
  testDate?: ISODateString
  testTime?: string | null
  location?: string | null
  environment?: TestEnvironment | null
  results?: Record<string, unknown>
  coachFeedback?: string | null
  playerFeedback?: string | null
  videoUrl?: string | null
}

// ============================================================================
// TEST QUERY TYPES
// ============================================================================

/**
 * Filters for querying test results.
 */
export interface TestResultFilters {
  playerId?: UUID
  testId?: UUID
  testNumber?: number
  category?: TestCategory | TestCategory[]
  passed?: boolean
  dateFrom?: ISODateString
  dateTo?: ISODateString
  benchmarkOnly?: boolean
}

/**
 * Test result with joined test definition (read-only view).
 */
export interface TestResultWithDefinition extends TestResult {
  test: TestDefinition
}

/**
 * Summary of test results for a player.
 */
export interface TestResultSummary {
  testId: UUID
  testNumber: number
  testName: string
  category: TestCategory
  latestResult?: {
    date: ISODateString
    value: number
    passed: boolean
  }
  bestResult?: {
    date: ISODateString
    value: number
  }
  totalAttempts: number
  passCount: number
}

// ============================================================================
// TEST CALCULATIONS (Computed)
// ============================================================================

/**
 * Category requirements for tests (computed from player category).
 */
export interface CategoryRequirements {
  playerCategory: PlayerCategory
  requirements: Record<number, number> // testNumber -> required value
}

/**
 * Test progress tracking (computed).
 */
export interface TestProgress {
  testNumber: number
  currentValue: number
  requiredValue: number
  percentOfRequirement: number
  trend: 'improving' | 'stable' | 'declining'
  lastTestDate: ISODateString
  daysUntilBenchmark?: number
}

/**
 * Benchmark session summary (computed from multiple test results).
 */
export interface BenchmarkSummary {
  weekNumber: number
  date: ISODateString
  testsCompleted: number
  testsPassed: number
  passRate: number
  strengths: TestCategory[]
  weaknesses: TestCategory[]
}
