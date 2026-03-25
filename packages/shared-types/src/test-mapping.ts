/**
 * Test Mapping Module
 *
 * Provides type-safe conversions and validation for test-related types.
 *
 * Canonical Types:
 * - TestCategory: 'putting' | 'chipping' | 'pitching' | 'bunker' | 'iron' | 'driver' | 'physical' | 'mental'
 * - TestEnvironment: 'indoor' | 'outdoor'
 * - PlayerCategory: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'D1' | 'D2'
 *
 * Use these helpers at API/UI boundaries for validation and normalization.
 */

import type { TestCategory, TestEnvironment, PlayerCategory } from './common'
import { TEST_CATEGORIES, TEST_ENVIRONMENTS, PLAYER_CATEGORIES } from './common'

// Re-export constants for test access
export { TEST_CATEGORIES, TEST_ENVIRONMENTS, PLAYER_CATEGORIES }

// ============================================================================
// TEST CATEGORY TYPE GUARDS & PARSERS
// ============================================================================

/**
 * Type guard for canonical TestCategory
 */
export function isTestCategory(value: unknown): value is TestCategory {
  return typeof value === 'string' && TEST_CATEGORIES.includes(value as TestCategory)
}

/**
 * Parse unknown input to canonical TestCategory.
 * Returns null if invalid.
 */
export function parseTestCategory(input: unknown): TestCategory | null {
  if (isTestCategory(input)) {
    return input
  }

  if (typeof input === 'string') {
    const normalized = input.toLowerCase().trim()
    if (isTestCategory(normalized)) {
      return normalized as TestCategory
    }

    // Handle common aliases
    const aliasMap: Record<string, TestCategory> = {
      'putt': 'putting',
      'chip': 'chipping',
      'pitch': 'pitching',
      'sand': 'bunker',
      'irons': 'iron',
      'driving': 'driver',
      'fitness': 'physical',
      'psych': 'mental',
      'psychology': 'mental',
    }

    if (aliasMap[normalized]) {
      return aliasMap[normalized]
    }
  }

  return null
}

/**
 * Parse unknown input to canonical TestCategory.
 * Throws if invalid.
 */
export function parseTestCategoryStrict(input: unknown): TestCategory {
  const result = parseTestCategory(input)
  if (result === null) {
    throw new Error(`Invalid TestCategory: ${JSON.stringify(input)}. Expected one of: ${TEST_CATEGORIES.join(', ')}`)
  }
  return result
}

// ============================================================================
// TEST ENVIRONMENT TYPE GUARDS & PARSERS
// ============================================================================

/**
 * Type guard for canonical TestEnvironment
 */
export function isTestEnvironment(value: unknown): value is TestEnvironment {
  return typeof value === 'string' && TEST_ENVIRONMENTS.includes(value as TestEnvironment)
}

/**
 * Parse unknown input to canonical TestEnvironment.
 * Returns null if invalid.
 */
export function parseTestEnvironment(input: unknown): TestEnvironment | null {
  if (isTestEnvironment(input)) {
    return input
  }

  if (typeof input === 'string') {
    const normalized = input.toLowerCase().trim()
    if (isTestEnvironment(normalized)) {
      return normalized as TestEnvironment
    }

    // Handle common aliases
    const aliasMap: Record<string, TestEnvironment> = {
      'inside': 'indoor',
      'indoors': 'indoor',
      'outside': 'outdoor',
      'outdoors': 'outdoor',
      'range': 'outdoor',
      'simulator': 'indoor',
    }

    if (aliasMap[normalized]) {
      return aliasMap[normalized]
    }
  }

  return null
}

/**
 * Parse unknown input to canonical TestEnvironment.
 * Throws if invalid.
 */
export function parseTestEnvironmentStrict(input: unknown): TestEnvironment {
  const result = parseTestEnvironment(input)
  if (result === null) {
    throw new Error(`Invalid TestEnvironment: ${JSON.stringify(input)}. Expected one of: ${TEST_ENVIRONMENTS.join(', ')}`)
  }
  return result
}

// ============================================================================
// PLAYER CATEGORY TYPE GUARDS & PARSERS
// ============================================================================

/**
 * Type guard for canonical PlayerCategory
 */
export function isPlayerCategory(value: unknown): value is PlayerCategory {
  return typeof value === 'string' && PLAYER_CATEGORIES.includes(value as PlayerCategory)
}

/**
 * Parse unknown input to canonical PlayerCategory.
 * Returns null if invalid.
 */
export function parsePlayerCategory(input: unknown): PlayerCategory | null {
  if (isPlayerCategory(input)) {
    return input
  }

  if (typeof input === 'string') {
    const normalized = input.toUpperCase().trim()
    if (isPlayerCategory(normalized)) {
      return normalized as PlayerCategory
    }
  }

  return null
}

/**
 * Parse unknown input to canonical PlayerCategory.
 * Throws if invalid.
 */
export function parsePlayerCategoryStrict(input: unknown): PlayerCategory {
  const result = parsePlayerCategory(input)
  if (result === null) {
    throw new Error(`Invalid PlayerCategory: ${JSON.stringify(input)}. Expected one of: ${PLAYER_CATEGORIES.join(', ')}`)
  }
  return result
}

// ============================================================================
// LEGACY/UNSAFE BOUNDARY TYPES
// ============================================================================

/**
 * Unsafe test category string from external sources (API input, DB, etc.)
 * Use parseTestCategory() to convert to canonical TestCategory.
 *
 * @deprecated Use at API boundaries only. Prefer TestCategory in domain code.
 */
export type UnsafeTestCategoryString = string

/**
 * Unsafe test environment string from external sources.
 * Use parseTestEnvironment() to convert to canonical TestEnvironment.
 *
 * @deprecated Use at API boundaries only. Prefer TestEnvironment in domain code.
 */
export type UnsafeTestEnvironmentString = string

/**
 * Unsafe player category string from external sources.
 * Use parsePlayerCategory() to convert to canonical PlayerCategory.
 *
 * @deprecated Use at API boundaries only. Prefer PlayerCategory in domain code.
 */
export type UnsafePlayerCategoryString = string
