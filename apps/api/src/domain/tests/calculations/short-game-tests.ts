/**
 * Short Game Test Calculations (Tests 15-18)
 * Based on DATABASE_FORMLER_KOMPLETT.md
 */

import type {
  Test15Input,
  Test16Input,
  Test17Input,
  Test18Input,
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
// TEST 15: PUTTING - 3M
// Formula: Success rate (%) = (holed_putts / total_putts) * 100
// ============================================================================

export async function calculateTest15(
  input: Test15Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<TestResult> {
  const totalPutts = input.putts.length;
  const holedPutts = input.putts.filter((putt) => putt.holed).length;

  // Calculate success rate percentage
  const successRate = (holedPutts / totalPutts) * 100;

  const requirement = await getRequirement(player, 15, repository);
  return calculateTestResult(successRate, requirement);
}

// ============================================================================
// TEST 16: PUTTING - 6M
// Formula: Success rate (%) = (holed_putts / total_putts) * 100
// ============================================================================

export async function calculateTest16(
  input: Test16Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<TestResult> {
  const totalPutts = input.putts.length;
  const holedPutts = input.putts.filter((putt) => putt.holed).length;

  // Calculate success rate percentage
  const successRate = (holedPutts / totalPutts) * 100;

  const requirement = await getRequirement(player, 16, repository);
  return calculateTestResult(successRate, requirement);
}

// ============================================================================
// TEST 17: CHIPPING
// Formula: Average distance from hole in cm (lower is better)
// ============================================================================

export async function calculateTest17(
  input: Test17Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<TestResult> {
  // Calculate average distance from hole
  const distances = input.chips.map((chip) => chip.distanceFromHoleCm);
  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  const requirement = await getRequirement(player, 17, repository);

  // For "lower is better" tests, invert the percentage calculation
  let passed = false;
  if (requirement.comparison === '<=') {
    passed = avgDistance <= requirement.requirement;
  }

  const percentOfRequirement = round(
    (requirement.requirement / avgDistance) * 100,
    1
  );

  return {
    value: round(avgDistance, 1),
    passed,
    categoryRequirement: requirement.requirement,
    percentOfRequirement,
  };
}

// ============================================================================
// TEST 18: BUNKER
// Formula: Average distance from hole in cm (lower is better)
// ============================================================================

export async function calculateTest18(
  input: Test18Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<TestResult> {
  // Calculate average distance from hole
  const distances = input.shots.map((shot) => shot.distanceFromHoleCm);
  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  const requirement = await getRequirement(player, 18, repository);

  // For "lower is better" tests, invert the percentage calculation
  let passed = false;
  if (requirement.comparison === '<=') {
    passed = avgDistance <= requirement.requirement;
  }

  const percentOfRequirement = round(
    (requirement.requirement / avgDistance) * 100,
    1
  );

  return {
    value: round(avgDistance, 1),
    passed,
    categoryRequirement: requirement.requirement,
    percentOfRequirement,
  };
}
