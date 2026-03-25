/**
 * Test Calculations Index
 * Exports all test calculation functions
 */

// Distance Tests (1-7)
export {
  calculateTest1,
  calculateTest2,
  calculateTest3,
  calculateTest4,
  calculateTest5,
  calculateTest6,
  calculateTest7,
} from './distance-tests';

// Approach Tests (8-11)
export {
  calculateTest8,
  calculateTest9,
  calculateTest10,
  calculateTest11,
} from './approach-tests';

// Physical Tests (12-14)
export {
  calculateTest12,
  calculateTest13,
  calculateTest14,
} from './physical-tests';

// Short Game Tests (15-18)
export {
  calculateTest15,
  calculateTest16,
  calculateTest17,
  calculateTest18,
} from './short-game-tests';

// On-Course Tests (19-20)
export {
  calculateTest19,
  calculateTest20,
} from './on-course-tests';

export type { Test19Result, Test20Result } from './on-course-tests';
