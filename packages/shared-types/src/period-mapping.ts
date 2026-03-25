/**
 * Period Mapping Module
 *
 * Provides type-safe conversions between UI period filters (DagbokPeriod)
 * and canonical training periodization (Period).
 *
 * UI Period (DagbokPeriod): 'week' | 'month' | 'custom' - calendar navigation
 * Domain Period: 'E' | 'G' | 'S' | 'T' - training macrocycle phase
 *
 * These are semantically distinct concepts and do NOT map 1:1.
 * Use these helpers at API/UI boundaries for validation and normalization.
 */

import type { Period, LearningPhase } from './common'
import { PERIODS, LEARNING_PHASES } from './common'

// Re-export constants for test access
export { PERIODS, LEARNING_PHASES }

// ============================================================================
// UI PERIOD FILTER TYPE (for dagbok/calendar navigation)
// ============================================================================

/**
 * UI date range filter period.
 * NOT the same as training periodization Period ('E' | 'G' | 'S' | 'T').
 */
export type DagbokPeriod = 'week' | 'month' | 'custom'

export const DAGBOK_PERIODS: readonly DagbokPeriod[] = [
  'week',
  'month',
  'custom',
] as const

// ============================================================================
// PERIOD PARSING & VALIDATION
// ============================================================================

/**
 * Type guard for canonical Period
 */
export function isPeriod(value: unknown): value is Period {
  return typeof value === 'string' && PERIODS.includes(value as Period)
}

/**
 * Type guard for DagbokPeriod
 */
export function isDagbokPeriod(value: unknown): value is DagbokPeriod {
  return typeof value === 'string' && DAGBOK_PERIODS.includes(value as DagbokPeriod)
}

/**
 * Parse unknown input to canonical Period.
 * Returns null if invalid.
 */
export function parsePeriod(input: unknown): Period | null {
  if (isPeriod(input)) {
    return input
  }

  // Handle string normalization
  if (typeof input === 'string') {
    const normalized = input.toUpperCase().trim()
    if (isPeriod(normalized)) {
      return normalized
    }

    // Handle full names
    const nameMap: Record<string, Period> = {
      'ETABLERING': 'E',
      'ESTABLISHMENT': 'E',
      'BASE': 'E',
      'GRUNNLEGGENDE': 'G',
      'FOUNDATION': 'G',
      'GRUNDLAG': 'G',
      'SPESIALISERING': 'S',
      'SPECIALIZATION': 'S',
      'TOPPING': 'T',
      'TOURNAMENT': 'T',
      'PEAK': 'T',
    }

    if (nameMap[normalized]) {
      return nameMap[normalized]
    }
  }

  return null
}

/**
 * Parse unknown input to canonical Period.
 * Throws if invalid.
 */
export function parsePeriodStrict(input: unknown): Period {
  const result = parsePeriod(input)
  if (result === null) {
    throw new Error(`Invalid Period: ${JSON.stringify(input)}. Expected one of: ${PERIODS.join(', ')}`)
  }
  return result
}

/**
 * Parse unknown input to DagbokPeriod.
 * Returns null if invalid.
 */
export function parseDagbokPeriod(input: unknown): DagbokPeriod | null {
  if (isDagbokPeriod(input)) {
    return input
  }

  if (typeof input === 'string') {
    const normalized = input.toLowerCase().trim()
    if (isDagbokPeriod(normalized)) {
      return normalized
    }
  }

  return null
}

// ============================================================================
// LEARNING PHASE PARSING & VALIDATION
// ============================================================================

/**
 * Type guard for canonical LearningPhase
 */
export function isLearningPhase(value: unknown): value is LearningPhase {
  return typeof value === 'string' && LEARNING_PHASES.includes(value as LearningPhase)
}

/**
 * Parse unknown input to canonical LearningPhase.
 * Returns null if invalid.
 */
export function parseLearningPhase(input: unknown): LearningPhase | null {
  if (isLearningPhase(input)) {
    return input
  }

  if (typeof input === 'string') {
    const normalized = input.toUpperCase().trim()
    if (isLearningPhase(normalized)) {
      return normalized as LearningPhase
    }
  }

  return null
}

/**
 * Parse array of unknown inputs to LearningPhase[].
 * Filters out invalid values.
 */
export function parseLearningPhases(input: unknown[]): LearningPhase[] {
  return input
    .map(parseLearningPhase)
    .filter((p): p is LearningPhase => p !== null)
}

/**
 * Parse array of unknown inputs to LearningPhase[].
 * Throws if any value is invalid.
 */
export function parseLearningPhasesStrict(input: unknown[]): LearningPhase[] {
  return input.map((item, index) => {
    const result = parseLearningPhase(item)
    if (result === null) {
      throw new Error(`Invalid LearningPhase at index ${index}: ${JSON.stringify(item)}`)
    }
    return result
  })
}

// ============================================================================
// LEGACY/UNSAFE BOUNDARY TYPES
// ============================================================================

/**
 * Unsafe period string from external sources (API input, DB, etc.)
 * Use parsePeriod() to convert to canonical Period.
 *
 * @deprecated Use at API boundaries only. Prefer Period in domain code.
 */
export type UnsafePeriodString = string

/**
 * Unsafe learning phase string from external sources.
 * Use parseLearningPhase() to convert to canonical LearningPhase.
 *
 * @deprecated Use at API boundaries only. Prefer LearningPhase in domain code.
 */
export type UnsafeLearningPhaseString = string

/**
 * Legacy learning phases array that may contain non-canonical strings.
 * Use parseLearningPhases() to convert.
 *
 * NOTE: Mutable array for Prisma/DB compatibility.
 * @deprecated Use at boundaries only. Prefer LearningPhase[] in domain code.
 */
export type LegacyLearningPhasesArray = string[]
