/**
 * Breaking Point Evidence Configuration
 * Constants and thresholds for evidence tracking
 */

// ============================================================================
// EFFORT TRACKING CONFIGURATION
// ============================================================================

/**
 * Number of training sessions required to reach 100% effort
 * This represents "expected" training volume for a breaking point
 */
export const SESSIONS_FOR_FULL_EFFORT = 10;

/**
 * Minimum effort percent increase per session
 */
export const MIN_EFFORT_PER_SESSION = 5;

/**
 * Maximum effort percent (can exceed 100% to show extra effort)
 */
export const MAX_EFFORT_PERCENT = 150;

// ============================================================================
// PROGRESS TRACKING CONFIGURATION
// ============================================================================

/**
 * Progress thresholds for breaking point resolution
 */
export const PROGRESS_THRESHOLDS = {
  /** Minimum progress to consider "making progress" */
  MINIMAL: 25,
  /** Moderate progress */
  MODERATE: 50,
  /** Good progress */
  GOOD: 75,
  /** Breaking point resolved */
  RESOLVED: 100,
} as const;

/**
 * Default benchmark window in days
 * How far back to look for benchmark test results
 */
export const DEFAULT_BENCHMARK_WINDOW_DAYS = 21;

// ============================================================================
// CONFIDENCE LEVELS
// ============================================================================

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export const CONFIDENCE_THRESHOLDS: Record<ConfidenceLevel, { minTests: number; maxAge: number }> = {
  low: { minTests: 1, maxAge: 90 },
  medium: { minTests: 3, maxAge: 60 },
  high: { minTests: 5, maxAge: 30 },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function calculateEffortFromSessions(sessionCount: number): number {
  const rawEffort = (sessionCount / SESSIONS_FOR_FULL_EFFORT) * 100;
  return Math.min(rawEffort, MAX_EFFORT_PERCENT);
}

export function getConfidenceLevel(testCount: number, daysSinceLastTest: number): ConfidenceLevel {
  if (testCount >= CONFIDENCE_THRESHOLDS.high.minTests && 
      daysSinceLastTest <= CONFIDENCE_THRESHOLDS.high.maxAge) {
    return 'high';
  }
  if (testCount >= CONFIDENCE_THRESHOLDS.medium.minTests && 
      daysSinceLastTest <= CONFIDENCE_THRESHOLDS.medium.maxAge) {
    return 'medium';
  }
  return 'low';
}
