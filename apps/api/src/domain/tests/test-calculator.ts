/**
 * Test Calculator Service
 * Main entry point for calculating test results
 */

import type {
  TestInput,
  TestResult,
  PlayerContext,
  Test1Input,
  Test2Input,
  Test3Input,
  Test4Input,
  Test5Input,
  Test6Input,
  Test7Input,
  Test8Input,
  Test9Input,
  Test10Input,
  Test11Input,
  Test12Input,
  Test13Input,
  Test14Input,
  Test15Input,
  Test16Input,
  Test17Input,
  Test18Input,
  Test19Input,
  Test20Input,
} from './types';
import type { RequirementsRepository } from './requirements-repository';
import {
  calculateTest1,
  calculateTest2,
  calculateTest3,
  calculateTest4,
  calculateTest5,
  calculateTest6,
  calculateTest7,
  calculateTest8,
  calculateTest9,
  calculateTest10,
  calculateTest11,
  calculateTest12,
  calculateTest13,
  calculateTest14,
  calculateTest15,
  calculateTest16,
  calculateTest17,
  calculateTest18,
  calculateTest19,
  calculateTest20,
} from './calculations';

/**
 * Calculate test result based on test number
 *
 * @param testNumber - Test number (1-20)
 * @param input - Test input data
 * @param player - Player context with category, gender, etc.
 * @param repository - Optional requirements repository for database lookups (uses defaults if not provided)
 * @returns Calculated test result
 * @deprecated Use calculateTestResultAsync for explicit async usage
 */
export function calculateTestResult(
  testNumber: number,
  input: TestInput,
  player: PlayerContext,
  repository?: RequirementsRepository
): TestResult | Promise<TestResult> {
  // Validate test number first (synchronous validation)
  if (testNumber < 1 || testNumber > 20) {
    throw new Error(`Invalid test number: ${testNumber}`);
  }

  // If repository provided, use async version
  if (repository) {
    return calculateTestResultAsync(testNumber, input, player, repository);
  }

  // Otherwise, throw error as database is required for calculations
  throw new Error('RequirementsRepository is required for test calculations. Use calculateTestResultAsync.');
}

/**
 * Calculate test result based on test number with database-backed requirements
 *
 * @param testNumber - Test number (1-20)
 * @param input - Test input data
 * @param player - Player context with category, gender, etc.
 * @param repository - Requirements repository for database lookups
 * @returns Calculated test result
 */
export async function calculateTestResultAsync(
  testNumber: number,
  input: TestInput,
  player: PlayerContext,
  repository: RequirementsRepository
): Promise<TestResult> {
  switch (testNumber) {
    // Distance Tests (1-7)
    case 1:
      return await calculateTest1(input as Test1Input, player, repository);
    case 2:
      return await calculateTest2(input as Test2Input, player, repository);
    case 3:
      return await calculateTest3(input as Test3Input, player, repository);
    case 4:
      return await calculateTest4(input as Test4Input, player, repository);
    case 5:
      return await calculateTest5(input as Test5Input, player, repository);
    case 6:
      return await calculateTest6(input as Test6Input, player, repository);
    case 7:
      return await calculateTest7(input as Test7Input, player, repository);

    // Approach Tests (8-11)
    case 8:
      return await calculateTest8(input as Test8Input, player, repository);
    case 9:
      return await calculateTest9(input as Test9Input, player, repository);
    case 10:
      return await calculateTest10(input as Test10Input, player, repository);
    case 11:
      return await calculateTest11(input as Test11Input, player, repository);

    // Physical Tests (12-14)
    case 12:
      return await calculateTest12(input as Test12Input, player, repository);
    case 13:
      return await calculateTest13(input as Test13Input, player, repository);
    case 14:
      return await calculateTest14(input as Test14Input, player, repository);

    // Short Game Tests (15-18)
    case 15:
      return await calculateTest15(input as Test15Input, player, repository);
    case 16:
      return await calculateTest16(input as Test16Input, player, repository);
    case 17:
      return await calculateTest17(input as Test17Input, player, repository);
    case 18:
      return await calculateTest18(input as Test18Input, player, repository);

    // On-Course Tests (19-20)
    case 19:
      return await calculateTest19(input as Test19Input, player, repository);
    case 20:
      return await calculateTest20(input as Test20Input, player, repository);

    default:
      throw new Error(`Invalid test number: ${testNumber}`);
  }
}

/**
 * Validate test input based on test number
 * Ensures the input has the correct structure for the test
 *
 * @param testNumber - Test number (1-20)
 * @param input - Test input data to validate
 * @returns true if valid, throws error if invalid
 */
export function validateTestInput(testNumber: number, input: TestInput): boolean {
  // Validate common metadata
  if (!input.metadata) {
    throw new Error('Test input must include metadata');
  }

  const { testDate, location, facility, environment } = input.metadata;

  if (!testDate || !location || !facility || !environment) {
    throw new Error('Metadata must include testDate, location, facility, and environment');
  }

  if (!['indoor', 'outdoor'].includes(environment)) {
    throw new Error('Environment must be "indoor" or "outdoor"');
  }

  // Test-specific validation
  // Cast to any for property access since TestInput is a union type
  const data = input as any;

  switch (testNumber) {
    case 1:
    case 2:
    case 3:
    case 4:
      if (!data.shots || data.shots.length !== 6) {
        throw new Error(`Test ${testNumber} requires exactly 6 shots`);
      }
      break;

    case 5:
      if (!data.shots || data.shots.length !== 6) {
        throw new Error('Test 5 requires exactly 6 shots with club speed');
      }
      break;

    case 6:
      if (!data.shots || data.shots.length !== 6) {
        throw new Error('Test 6 requires exactly 6 shots with ball speed');
      }
      break;

    case 7:
      if (!data.shots || data.shots.length !== 6) {
        throw new Error('Test 7 requires exactly 6 shots with both ball and club speed');
      }
      break;

    case 8:
    case 9:
    case 10:
    case 11:
      if (!data.shots || data.shots.length !== 10) {
        throw new Error(`Test ${testNumber} requires exactly 10 shots`);
      }
      if (!data.targetDistance) {
        throw new Error(`Test ${testNumber} requires targetDistance`);
      }
      break;

    case 12:
      if (data.repetitions === undefined || data.repetitions < 0) {
        throw new Error('Test 12 requires a valid repetitions count');
      }
      break;

    case 13:
      if (data.durationSeconds === undefined || data.durationSeconds < 0) {
        throw new Error('Test 13 requires a valid duration in seconds');
      }
      break;

    case 14:
      if (!data.jumps || data.jumps.length !== 3) {
        throw new Error('Test 14 requires exactly 3 jump attempts');
      }
      break;

    case 15:
    case 16:
      if (!data.putts || data.putts.length !== 10) {
        throw new Error(`Test ${testNumber} requires exactly 10 putts`);
      }
      break;

    case 17:
      if (!data.chips || data.chips.length !== 10) {
        throw new Error('Test 17 requires exactly 10 chips');
      }
      break;

    case 18:
      if (!data.shots || data.shots.length !== 10) {
        throw new Error('Test 18 requires exactly 10 bunker shots');
      }
      break;

    case 19:
      if (!data.holes || data.holes.length !== 9) {
        throw new Error('Test 19 requires exactly 9 holes');
      }
      break;

    case 20:
      if (!data.holes || data.holes.length < 3 || data.holes.length > 6) {
        throw new Error('Test 20 requires 3-6 holes');
      }
      break;

    default:
      throw new Error(`Invalid test number: ${testNumber}`);
  }

  return true;
}
