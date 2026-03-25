/**
 * Approach Test Calculations with PEI (Tests 8-11)
 * Based on DATABASE_FORMLER_KOMPLETT.md
 *
 * PEI (Precision Efficiency Index) Formula:
 * PEI = avg_distance_to_pin / ideal_approach_distance
 *
 * Ideal distances by target:
 * - 25m: 2.5m
 * - 50m: 5.0m
 * - 75m: 7.5m
 * - 100m: 10.0m
 */

import type {
  Test8Input,
  Test9Input,
  Test10Input,
  Test11Input,
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
 * Get category requirement from database or use defaults
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
 * Calculate PEI score
 * PEI = avg_distance_to_pin / ideal_approach_distance
 * Lower is better
 */
function calculatePEI(
  avgDistanceToPinMeters: number,
  idealDistanceMeters: number
): number {
  return round(avgDistanceToPinMeters / idealDistanceMeters, 4);
}

/**
 * Calculate approach test result with PEI
 */
function calculateApproachResult(
  distances: number[],
  idealDistance: number,
  requirement: CategoryRequirement
): TestResult & { pei: number } {
  // Calculate average distance to pin
  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  // Calculate PEI
  const pei = calculatePEI(avgDistance, idealDistance);

  // Determine if passed (PEI requirement is <=, lower is better)
  const passed = pei <= requirement.requirement;

  // Calculate percent of requirement (inverted for PEI - lower is better)
  const percentOfRequirement = round(
    (requirement.requirement / pei) * 100,
    1
  );

  return {
    value: round(avgDistance, 1),
    passed,
    categoryRequirement: requirement.requirement,
    percentOfRequirement,
    pei: round(pei, 4),
  };
}

// ============================================================================
// TEST 8: APPROACH - 25M
// Formula: PEI = avg_distance_to_pin / 2.5m
// ============================================================================

export async function calculateTest8(
  input: Test8Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<TestResult & { pei: number }> {
  const distances = input.shots.map((shot) => shot.distanceToHoleMeters);
  const requirement = await getRequirement(player, 8, repository);
  const idealDistance = 2.5; // meters

  return calculateApproachResult(distances, idealDistance, requirement);
}

// ============================================================================
// TEST 9: APPROACH - 50M
// Formula: PEI = avg_distance_to_pin / 5.0m
// ============================================================================

export async function calculateTest9(
  input: Test9Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<TestResult & { pei: number }> {
  const distances = input.shots.map((shot) => shot.distanceToHoleMeters);
  const requirement = await getRequirement(player, 9, repository);
  const idealDistance = 5.0; // meters

  return calculateApproachResult(distances, idealDistance, requirement);
}

// ============================================================================
// TEST 10: APPROACH - 75M
// Formula: PEI = avg_distance_to_pin / 7.5m
// ============================================================================

export async function calculateTest10(
  input: Test10Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<TestResult & { pei: number }> {
  const distances = input.shots.map((shot) => shot.distanceToHoleMeters);
  const requirement = await getRequirement(player, 10, repository);
  const idealDistance = 7.5; // meters

  return calculateApproachResult(distances, idealDistance, requirement);
}

// ============================================================================
// TEST 11: APPROACH - 100M
// Formula: PEI = avg_distance_to_pin / 10.0m
// ============================================================================

export async function calculateTest11(
  input: Test11Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<TestResult & { pei: number }> {
  const distances = input.shots.map((shot) => shot.distanceToHoleMeters);
  const requirement = await getRequirement(player, 11, repository);
  const idealDistance = 10.0; // meters

  return calculateApproachResult(distances, idealDistance, requirement);
}
