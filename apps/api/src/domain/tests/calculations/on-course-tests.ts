/**
 * On-Course Test Calculations (Tests 19-20)
 * Based on DATABASE_FORMLER_KOMPLETT.md
 */

import type {
  Test19Input,
  Test20Input,
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
// TEST 19: 9-HULLS SIMULERING
// Formula: Total score relative to par (strokes over/under par)
// Additional metrics: FIR%, GIR%, Putts/hole, Up&Down%
// ============================================================================

export interface Test19Result extends TestResult {
  totalScore: number;
  totalPar: number;
  scoreToPar: number;
  fairwayHitPercentage: number;
  girPercentage: number;
  averagePutts: number;
  upAndDownPercentage: number;
}

export async function calculateTest19(
  input: Test19Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<Test19Result> {
  // Calculate total score and par
  const totalScore = input.holes.reduce((sum, hole) => sum + hole.score, 0);
  const totalPar = input.holes.reduce((sum, hole) => sum + hole.par, 0);
  const scoreToPar = totalScore - totalPar;

  // Calculate Fairway Hit %
  const par4And5Holes = input.holes.filter(
    (hole) => hole.par === 4 || hole.par === 5
  );
  const fairwayHits = par4And5Holes.filter(
    (hole) => hole.fairwayHit === true
  ).length;
  const fairwayHitPercentage = par4And5Holes.length > 0
    ? round((fairwayHits / par4And5Holes.length) * 100, 1)
    : 0;

  // Calculate GIR %
  const girCount = input.holes.filter((hole) => hole.girReached === true).length;
  const girPercentage = round((girCount / input.holes.length) * 100, 1);

  // Calculate average putts
  const totalPutts = input.holes.reduce((sum, hole) => sum + hole.putts, 0);
  const averagePutts = round(totalPutts / input.holes.length, 2);

  // Calculate Up & Down %
  const missedGirHoles = input.holes.filter((hole) => hole.girReached === false);
  const upAndDownCount = missedGirHoles.filter(
    (hole) => hole.upAndDown === true
  ).length;
  const upAndDownPercentage = missedGirHoles.length > 0
    ? round((upAndDownCount / missedGirHoles.length) * 100, 1)
    : 0;

  // Get requirement (score to par)
  const requirement = await getRequirement(player, 19, repository);

  // Calculate base result
  const baseResult = calculateTestResult(scoreToPar, requirement);

  return {
    ...baseResult,
    totalScore,
    totalPar,
    scoreToPar,
    fairwayHitPercentage,
    girPercentage,
    averagePutts,
    upAndDownPercentage,
  };
}

// ============================================================================
// TEST 20: ON-COURSE SKILLS
// Formula: Composite score based on multiple performance metrics
// Metrics: Score to par, FIR%, GIR%, Scrambling%, Penalty count
// ============================================================================

export interface Test20Result extends TestResult {
  totalScore: number;
  totalPar: number;
  scoreToPar: number;
  fairwayHitPercentage: number;
  girPercentage: number;
  scramblingPercentage: number;
  totalPenalties: number;
  averagePutts: number;
}

export async function calculateTest20(
  input: Test20Input,
  player: PlayerContext,
  repository?: RequirementsRepository
): Promise<Test20Result> {
  // Calculate total score and par
  const totalScore = input.holes.reduce((sum, hole) => sum + hole.score, 0);
  const totalPar = input.holes.reduce((sum, hole) => sum + hole.par, 0);
  const scoreToPar = totalScore - totalPar;

  // Calculate Fairway Hit %
  const par4And5Holes = input.holes.filter(
    (hole) => hole.par === 4 || hole.par === 5
  );
  const fairwayHits = par4And5Holes.filter(
    (hole) => hole.fairwayHit === true
  ).length;
  const fairwayHitPercentage = par4And5Holes.length > 0
    ? round((fairwayHits / par4And5Holes.length) * 100, 1)
    : 0;

  // Calculate GIR %
  const girCount = input.holes.filter((hole) => hole.girReached === true).length;
  const girPercentage = round((girCount / input.holes.length) * 100, 1);

  // Calculate Scrambling %
  const missedGirHoles = input.holes.filter((hole) => hole.girReached === false);
  const scramblingCount = missedGirHoles.filter(
    (hole) => hole.scrambling === true
  ).length;
  const scramblingPercentage = missedGirHoles.length > 0
    ? round((scramblingCount / missedGirHoles.length) * 100, 1)
    : 0;

  // Calculate total penalties
  const totalPenalties = input.holes.reduce(
    (sum, hole) => sum + hole.penalties,
    0
  );

  // Calculate average putts
  const totalPutts = input.holes.reduce((sum, hole) => sum + hole.putts, 0);
  const averagePutts = round(totalPutts / input.holes.length, 2);

  // Get requirement (score to par)
  const requirement = await getRequirement(player, 20, repository);

  // Calculate base result
  const baseResult = calculateTestResult(scoreToPar, requirement);

  return {
    ...baseResult,
    totalScore,
    totalPar,
    scoreToPar,
    fairwayHitPercentage,
    girPercentage,
    scramblingPercentage,
    totalPenalties,
    averagePutts,
  };
}
