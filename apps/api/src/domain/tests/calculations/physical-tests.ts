/**
 * Physical Test Calculations (Tests 12-14)
 * Based on DATABASE_FORMLER_KOMPLETT.md
 */

import type {
  Test12Input,
  Test13Input,
  Test14Input,
  TestResult,
  PlayerContext,
  CategoryRequirement,
} from '../types';
import type { RequirementsRepository } from '../requirements-repository';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Round to specified decimal places
 */
function round(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Get category requirement (to be implemented with database lookup)
 */
async function getRequirement(
  player: PlayerContext,
  testNumber: number,
  repository?: RequirementsRepository
): Promise<CategoryRequirement> {
  if (repository) {
    return await repository.getRequirement(
      player.category,
      player.gender,
      testNumber
    );
  }

  // Fallback to defaults if no repository provided (for backward compatibility)
  return {
    category: player.category,
    gender: player.gender,
    testNumber,
    requirement: 200,
    unit: 'm',
    comparison: '>=' as const,
  };
}

/**
 * Calculate test result with requirement comparison
 */
function calculateTestResult(
  value: number,
  requirement: CategoryRequirement
): TestResult {
  let passed = false;

  switch (requirement.comparison) {
    case '>=':
      passed = value >= requirement.requirement;
      break;
    case '<=':
      passed = value <= requirement.requirement;
      break;
    case 'range':
      if (requirement.rangeMin !== undefined && requirement.rangeMax !== undefined) {
        passed = value >= requirement.rangeMin && value <= requirement.rangeMax;
      }
      break;
  }

  const percentOfRequirement = round(
    (value / requirement.requirement) * 100,
    1
  );

  return {
    value: round(value, 1),
    passed,
    categoryRequirement: requirement.requirement,
    percentOfRequirement,
  };
}

// ============================================================================
// TEST 12: PULL-UPS
// Formula: Total repetitions completed
// ============================================================================

export async function calculateTest12(
  input: Test12Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<TestResult> {
  // Test 12: 1RM Deadlift - use weightKg as the result
  const weightKg = input.weightKg;
  const requirement = await getRequirement(player, 12, repository);
  return calculateTestResult(weightKg, requirement);
}

// ============================================================================
// TEST 13: PLANK
// Formula: Total duration in seconds
// ============================================================================

export async function calculateTest13(
  input: Test13Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<TestResult> {
  // Test 13: 1RM Trap Bar Deadlift - use weightKg as the result
  const weightKg = input.weightKg;
  const requirement = await getRequirement(player, 13, repository);
  return calculateTestResult(weightKg, requirement);
}

// ============================================================================
// TEST 14: VERTICAL JUMP
// Formula: Best of 3 attempts in cm
// ============================================================================

export async function calculateTest14(
  input: Test14Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<TestResult> {
  // Test 14: 3000m Run - use timeSeconds as the result (lower is better)
  const timeSeconds = input.timeSeconds;
  const requirement = await getRequirement(player, 14, repository);
  // Note: For time-based tests, lower values are better
  return calculateTestResult(timeSeconds, requirement);
}
