/**
 * Category Requirements Seed Data
 * Based on DATABASE_FORMLER_KOMPLETT.md
 *
 * Creates requirements for all 20 tests across 11 categories (A-K) and 2 genders (M/K)
 */

import prisma from '../client';


// ============================================================================
// TEST 1: DRIVER AVSTAND (CARRY)
// Unit: meters, Comparison: >=
// ============================================================================

const test1Requirements = [
  // Men
  { category: 'A', gender: 'M', testNumber: 1, requirement: 270, unit: 'meters', comparison: '>=' },
  { category: 'B', gender: 'M', testNumber: 1, requirement: 260, unit: 'meters', comparison: '>=' },
  { category: 'C', gender: 'M', testNumber: 1, requirement: 250, unit: 'meters', comparison: '>=' },
  { category: 'D', gender: 'M', testNumber: 1, requirement: 240, unit: 'meters', comparison: '>=' },
  { category: 'E', gender: 'M', testNumber: 1, requirement: 230, unit: 'meters', comparison: '>=' },
  { category: 'F', gender: 'M', testNumber: 1, requirement: 220, unit: 'meters', comparison: '>=' },
  { category: 'G', gender: 'M', testNumber: 1, requirement: 210, unit: 'meters', comparison: '>=' },
  { category: 'H', gender: 'M', testNumber: 1, requirement: 200, unit: 'meters', comparison: '>=' },
  { category: 'I', gender: 'M', testNumber: 1, requirement: 190, unit: 'meters', comparison: '>=' },
  { category: 'J', gender: 'M', testNumber: 1, requirement: 180, unit: 'meters', comparison: '>=' },
  { category: 'K', gender: 'M', testNumber: 1, requirement: 170, unit: 'meters', comparison: '>=' },

  // Women
  { category: 'A', gender: 'K', testNumber: 1, requirement: 240, unit: 'meters', comparison: '>=' },
  { category: 'B', gender: 'K', testNumber: 1, requirement: 230, unit: 'meters', comparison: '>=' },
  { category: 'C', gender: 'K', testNumber: 1, requirement: 220, unit: 'meters', comparison: '>=' },
  { category: 'D', gender: 'K', testNumber: 1, requirement: 210, unit: 'meters', comparison: '>=' },
  { category: 'E', gender: 'K', testNumber: 1, requirement: 200, unit: 'meters', comparison: '>=' },
  { category: 'F', gender: 'K', testNumber: 1, requirement: 190, unit: 'meters', comparison: '>=' },
  { category: 'G', gender: 'K', testNumber: 1, requirement: 180, unit: 'meters', comparison: '>=' },
  { category: 'H', gender: 'K', testNumber: 1, requirement: 170, unit: 'meters', comparison: '>=' },
  { category: 'I', gender: 'K', testNumber: 1, requirement: 160, unit: 'meters', comparison: '>=' },
  { category: 'J', gender: 'K', testNumber: 1, requirement: 150, unit: 'meters', comparison: '>=' },
  { category: 'K', gender: 'K', testNumber: 1, requirement: 140, unit: 'meters', comparison: '>=' },
];

// ============================================================================
// TEST 2: 3-TRE AVSTAND
// Unit: meters, Comparison: >=
// ============================================================================

const test2Requirements = [
  // Men
  { category: 'A', gender: 'M', testNumber: 2, requirement: 250, unit: 'meters', comparison: '>=' },
  { category: 'B', gender: 'M', testNumber: 2, requirement: 240, unit: 'meters', comparison: '>=' },
  { category: 'C', gender: 'M', testNumber: 2, requirement: 230, unit: 'meters', comparison: '>=' },
  { category: 'D', gender: 'M', testNumber: 2, requirement: 220, unit: 'meters', comparison: '>=' },
  { category: 'E', gender: 'M', testNumber: 2, requirement: 210, unit: 'meters', comparison: '>=' },
  { category: 'F', gender: 'M', testNumber: 2, requirement: 200, unit: 'meters', comparison: '>=' },
  { category: 'G', gender: 'M', testNumber: 2, requirement: 190, unit: 'meters', comparison: '>=' },
  { category: 'H', gender: 'M', testNumber: 2, requirement: 180, unit: 'meters', comparison: '>=' },
  { category: 'I', gender: 'M', testNumber: 2, requirement: 170, unit: 'meters', comparison: '>=' },
  { category: 'J', gender: 'M', testNumber: 2, requirement: 160, unit: 'meters', comparison: '>=' },
  { category: 'K', gender: 'M', testNumber: 2, requirement: 150, unit: 'meters', comparison: '>=' },

  // Women
  { category: 'A', gender: 'K', testNumber: 2, requirement: 210, unit: 'meters', comparison: '>=' },
  { category: 'B', gender: 'K', testNumber: 2, requirement: 200, unit: 'meters', comparison: '>=' },
  { category: 'C', gender: 'K', testNumber: 2, requirement: 190, unit: 'meters', comparison: '>=' },
  { category: 'D', gender: 'K', testNumber: 2, requirement: 180, unit: 'meters', comparison: '>=' },
  { category: 'E', gender: 'K', testNumber: 2, requirement: 170, unit: 'meters', comparison: '>=' },
  { category: 'F', gender: 'K', testNumber: 2, requirement: 160, unit: 'meters', comparison: '>=' },
  { category: 'G', gender: 'K', testNumber: 2, requirement: 150, unit: 'meters', comparison: '>=' },
  { category: 'H', gender: 'K', testNumber: 2, requirement: 140, unit: 'meters', comparison: '>=' },
  { category: 'I', gender: 'K', testNumber: 2, requirement: 130, unit: 'meters', comparison: '>=' },
  { category: 'J', gender: 'K', testNumber: 2, requirement: 120, unit: 'meters', comparison: '>=' },
  { category: 'K', gender: 'K', testNumber: 2, requirement: 110, unit: 'meters', comparison: '>=' },
];

// ============================================================================
// TEST 3: 5-JERN AVSTAND
// Unit: meters, Comparison: >=
// ============================================================================

const test3Requirements = [
  // Men
  { category: 'A', gender: 'M', testNumber: 3, requirement: 190, unit: 'meters', comparison: '>=' },
  { category: 'B', gender: 'M', testNumber: 3, requirement: 185, unit: 'meters', comparison: '>=' },
  { category: 'C', gender: 'M', testNumber: 3, requirement: 180, unit: 'meters', comparison: '>=' },
  { category: 'D', gender: 'M', testNumber: 3, requirement: 175, unit: 'meters', comparison: '>=' },
  { category: 'E', gender: 'M', testNumber: 3, requirement: 170, unit: 'meters', comparison: '>=' },
  { category: 'F', gender: 'M', testNumber: 3, requirement: 165, unit: 'meters', comparison: '>=' },
  { category: 'G', gender: 'M', testNumber: 3, requirement: 160, unit: 'meters', comparison: '>=' },
  { category: 'H', gender: 'M', testNumber: 3, requirement: 155, unit: 'meters', comparison: '>=' },
  { category: 'I', gender: 'M', testNumber: 3, requirement: 150, unit: 'meters', comparison: '>=' },
  { category: 'J', gender: 'M', testNumber: 3, requirement: 145, unit: 'meters', comparison: '>=' },
  { category: 'K', gender: 'M', testNumber: 3, requirement: 140, unit: 'meters', comparison: '>=' },

  // Women
  { category: 'A', gender: 'K', testNumber: 3, requirement: 165, unit: 'meters', comparison: '>=' },
  { category: 'B', gender: 'K', testNumber: 3, requirement: 160, unit: 'meters', comparison: '>=' },
  { category: 'C', gender: 'K', testNumber: 3, requirement: 155, unit: 'meters', comparison: '>=' },
  { category: 'D', gender: 'K', testNumber: 3, requirement: 150, unit: 'meters', comparison: '>=' },
  { category: 'E', gender: 'K', testNumber: 3, requirement: 145, unit: 'meters', comparison: '>=' },
  { category: 'F', gender: 'K', testNumber: 3, requirement: 140, unit: 'meters', comparison: '>=' },
  { category: 'G', gender: 'K', testNumber: 3, requirement: 135, unit: 'meters', comparison: '>=' },
  { category: 'H', gender: 'K', testNumber: 3, requirement: 130, unit: 'meters', comparison: '>=' },
  { category: 'I', gender: 'K', testNumber: 3, requirement: 125, unit: 'meters', comparison: '>=' },
  { category: 'J', gender: 'K', testNumber: 3, requirement: 120, unit: 'meters', comparison: '>=' },
  { category: 'K', gender: 'K', testNumber: 3, requirement: 115, unit: 'meters', comparison: '>=' },
];

// ============================================================================
// TEST 4: WEDGE AVSTAND (PW)
// Unit: meters, Comparison: >=
// ============================================================================

const test4Requirements = [
  // Men
  { category: 'A', gender: 'M', testNumber: 4, requirement: 130, unit: 'meters', comparison: '>=' },
  { category: 'B', gender: 'M', testNumber: 4, requirement: 125, unit: 'meters', comparison: '>=' },
  { category: 'C', gender: 'M', testNumber: 4, requirement: 120, unit: 'meters', comparison: '>=' },
  { category: 'D', gender: 'M', testNumber: 4, requirement: 115, unit: 'meters', comparison: '>=' },
  { category: 'E', gender: 'M', testNumber: 4, requirement: 110, unit: 'meters', comparison: '>=' },
  { category: 'F', gender: 'M', testNumber: 4, requirement: 105, unit: 'meters', comparison: '>=' },
  { category: 'G', gender: 'M', testNumber: 4, requirement: 100, unit: 'meters', comparison: '>=' },
  { category: 'H', gender: 'M', testNumber: 4, requirement: 95, unit: 'meters', comparison: '>=' },
  { category: 'I', gender: 'M', testNumber: 4, requirement: 90, unit: 'meters', comparison: '>=' },
  { category: 'J', gender: 'M', testNumber: 4, requirement: 85, unit: 'meters', comparison: '>=' },
  { category: 'K', gender: 'M', testNumber: 4, requirement: 80, unit: 'meters', comparison: '>=' },

  // Women
  { category: 'A', gender: 'K', testNumber: 4, requirement: 110, unit: 'meters', comparison: '>=' },
  { category: 'B', gender: 'K', testNumber: 4, requirement: 105, unit: 'meters', comparison: '>=' },
  { category: 'C', gender: 'K', testNumber: 4, requirement: 100, unit: 'meters', comparison: '>=' },
  { category: 'D', gender: 'K', testNumber: 4, requirement: 95, unit: 'meters', comparison: '>=' },
  { category: 'E', gender: 'K', testNumber: 4, requirement: 90, unit: 'meters', comparison: '>=' },
  { category: 'F', gender: 'K', testNumber: 4, requirement: 85, unit: 'meters', comparison: '>=' },
  { category: 'G', gender: 'K', testNumber: 4, requirement: 80, unit: 'meters', comparison: '>=' },
  { category: 'H', gender: 'K', testNumber: 4, requirement: 75, unit: 'meters', comparison: '>=' },
  { category: 'I', gender: 'K', testNumber: 4, requirement: 70, unit: 'meters', comparison: '>=' },
  { category: 'J', gender: 'K', testNumber: 4, requirement: 65, unit: 'meters', comparison: '>=' },
  { category: 'K', gender: 'K', testNumber: 4, requirement: 60, unit: 'meters', comparison: '>=' },
];

// ============================================================================
// TEST 5: KLUBBHASTIGHET (DRIVER)
// Unit: km/h, Comparison: >=
// ============================================================================

const test5Requirements = [
  // Men
  { category: 'A', gender: 'M', testNumber: 5, requirement: 193, unit: 'km/h', comparison: '>=' },
  { category: 'B', gender: 'M', testNumber: 5, requirement: 185, unit: 'km/h', comparison: '>=' },
  { category: 'C', gender: 'M', testNumber: 5, requirement: 177, unit: 'km/h', comparison: '>=' },
  { category: 'D', gender: 'M', testNumber: 5, requirement: 169, unit: 'km/h', comparison: '>=' },
  { category: 'E', gender: 'M', testNumber: 5, requirement: 161, unit: 'km/h', comparison: '>=' },
  { category: 'F', gender: 'M', testNumber: 5, requirement: 153, unit: 'km/h', comparison: '>=' },
  { category: 'G', gender: 'M', testNumber: 5, requirement: 145, unit: 'km/h', comparison: '>=' },
  { category: 'H', gender: 'M', testNumber: 5, requirement: 137, unit: 'km/h', comparison: '>=' },
  { category: 'I', gender: 'M', testNumber: 5, requirement: 129, unit: 'km/h', comparison: '>=' },
  { category: 'J', gender: 'M', testNumber: 5, requirement: 121, unit: 'km/h', comparison: '>=' },
  { category: 'K', gender: 'M', testNumber: 5, requirement: 113, unit: 'km/h', comparison: '>=' },

  // Women
  { category: 'A', gender: 'K', testNumber: 5, requirement: 169, unit: 'km/h', comparison: '>=' },
  { category: 'B', gender: 'K', testNumber: 5, requirement: 161, unit: 'km/h', comparison: '>=' },
  { category: 'C', gender: 'K', testNumber: 5, requirement: 153, unit: 'km/h', comparison: '>=' },
  { category: 'D', gender: 'K', testNumber: 5, requirement: 145, unit: 'km/h', comparison: '>=' },
  { category: 'E', gender: 'K', testNumber: 5, requirement: 137, unit: 'km/h', comparison: '>=' },
  { category: 'F', gender: 'K', testNumber: 5, requirement: 129, unit: 'km/h', comparison: '>=' },
  { category: 'G', gender: 'K', testNumber: 5, requirement: 121, unit: 'km/h', comparison: '>=' },
  { category: 'H', gender: 'K', testNumber: 5, requirement: 113, unit: 'km/h', comparison: '>=' },
  { category: 'I', gender: 'K', testNumber: 5, requirement: 105, unit: 'km/h', comparison: '>=' },
  { category: 'J', gender: 'K', testNumber: 5, requirement: 97, unit: 'km/h', comparison: '>=' },
  { category: 'K', gender: 'K', testNumber: 5, requirement: 89, unit: 'km/h', comparison: '>=' },
];

// ============================================================================
// TEST 6: BALLHASTIGHET (DRIVER)
// Unit: km/h, Comparison: >=
// ============================================================================

const test6Requirements = [
  // Men
  { category: 'A', gender: 'M', testNumber: 6, requirement: 285, unit: 'km/h', comparison: '>=' },
  { category: 'B', gender: 'M', testNumber: 6, requirement: 270, unit: 'km/h', comparison: '>=' },
  { category: 'C', gender: 'M', testNumber: 6, requirement: 255, unit: 'km/h', comparison: '>=' },
  { category: 'D', gender: 'M', testNumber: 6, requirement: 240, unit: 'km/h', comparison: '>=' },
  { category: 'E', gender: 'M', testNumber: 6, requirement: 225, unit: 'km/h', comparison: '>=' },
  { category: 'F', gender: 'M', testNumber: 6, requirement: 210, unit: 'km/h', comparison: '>=' },
  { category: 'G', gender: 'M', testNumber: 6, requirement: 195, unit: 'km/h', comparison: '>=' },
  { category: 'H', gender: 'M', testNumber: 6, requirement: 180, unit: 'km/h', comparison: '>=' },
  { category: 'I', gender: 'M', testNumber: 6, requirement: 170, unit: 'km/h', comparison: '>=' },
  { category: 'J', gender: 'M', testNumber: 6, requirement: 160, unit: 'km/h', comparison: '>=' },
  { category: 'K', gender: 'M', testNumber: 6, requirement: 145, unit: 'km/h', comparison: '>=' },

  // Women
  { category: 'A', gender: 'K', testNumber: 6, requirement: 250, unit: 'km/h', comparison: '>=' },
  { category: 'B', gender: 'K', testNumber: 6, requirement: 235, unit: 'km/h', comparison: '>=' },
  { category: 'C', gender: 'K', testNumber: 6, requirement: 220, unit: 'km/h', comparison: '>=' },
  { category: 'D', gender: 'K', testNumber: 6, requirement: 205, unit: 'km/h', comparison: '>=' },
  { category: 'E', gender: 'K', testNumber: 6, requirement: 190, unit: 'km/h', comparison: '>=' },
  { category: 'F', gender: 'K', testNumber: 6, requirement: 180, unit: 'km/h', comparison: '>=' },
  { category: 'G', gender: 'K', testNumber: 6, requirement: 170, unit: 'km/h', comparison: '>=' },
  { category: 'H', gender: 'K', testNumber: 6, requirement: 160, unit: 'km/h', comparison: '>=' },
  { category: 'I', gender: 'K', testNumber: 6, requirement: 150, unit: 'km/h', comparison: '>=' },
  { category: 'J', gender: 'K', testNumber: 6, requirement: 140, unit: 'km/h', comparison: '>=' },
  { category: 'K', gender: 'K', testNumber: 6, requirement: 130, unit: 'km/h', comparison: '>=' },
];

// ============================================================================
// TEST 7: SMASH FACTOR (DRIVER)
// Unit: ratio, Comparison: >=
// ============================================================================

const test7Requirements = [
  // Men & Women (same requirements)
  { category: 'A', gender: 'M', testNumber: 7, requirement: 1.48, unit: 'ratio', comparison: '>=' },
  { category: 'B', gender: 'M', testNumber: 7, requirement: 1.46, unit: 'ratio', comparison: '>=' },
  { category: 'C', gender: 'M', testNumber: 7, requirement: 1.44, unit: 'ratio', comparison: '>=' },
  { category: 'D', gender: 'M', testNumber: 7, requirement: 1.42, unit: 'ratio', comparison: '>=' },
  { category: 'E', gender: 'M', testNumber: 7, requirement: 1.40, unit: 'ratio', comparison: '>=' },
  { category: 'F', gender: 'M', testNumber: 7, requirement: 1.38, unit: 'ratio', comparison: '>=' },
  { category: 'G', gender: 'M', testNumber: 7, requirement: 1.36, unit: 'ratio', comparison: '>=' },
  { category: 'H', gender: 'M', testNumber: 7, requirement: 1.34, unit: 'ratio', comparison: '>=' },
  { category: 'I', gender: 'M', testNumber: 7, requirement: 1.32, unit: 'ratio', comparison: '>=' },
  { category: 'J', gender: 'M', testNumber: 7, requirement: 1.30, unit: 'ratio', comparison: '>=' },
  { category: 'K', gender: 'M', testNumber: 7, requirement: 1.28, unit: 'ratio', comparison: '>=' },

  { category: 'A', gender: 'K', testNumber: 7, requirement: 1.48, unit: 'ratio', comparison: '>=' },
  { category: 'B', gender: 'K', testNumber: 7, requirement: 1.46, unit: 'ratio', comparison: '>=' },
  { category: 'C', gender: 'K', testNumber: 7, requirement: 1.44, unit: 'ratio', comparison: '>=' },
  { category: 'D', gender: 'K', testNumber: 7, requirement: 1.42, unit: 'ratio', comparison: '>=' },
  { category: 'E', gender: 'K', testNumber: 7, requirement: 1.40, unit: 'ratio', comparison: '>=' },
  { category: 'F', gender: 'K', testNumber: 7, requirement: 1.38, unit: 'ratio', comparison: '>=' },
  { category: 'G', gender: 'K', testNumber: 7, requirement: 1.36, unit: 'ratio', comparison: '>=' },
  { category: 'H', gender: 'K', testNumber: 7, requirement: 1.34, unit: 'ratio', comparison: '>=' },
  { category: 'I', gender: 'K', testNumber: 7, requirement: 1.32, unit: 'ratio', comparison: '>=' },
  { category: 'J', gender: 'K', testNumber: 7, requirement: 1.30, unit: 'ratio', comparison: '>=' },
  { category: 'K', gender: 'K', testNumber: 7, requirement: 1.28, unit: 'ratio', comparison: '>=' },
];

// ============================================================================
// TESTS 8-11: APPROACH TESTS WITH PEI
// Unit: PEI ratio, Comparison: <= (lower is better)
// ============================================================================

// Test 8: 25m Approach (ideal 2.5m, max avg distance from hole)
const test8Requirements = [
  // Men
  { category: 'A', gender: 'M', testNumber: 8, requirement: 1.0, unit: 'PEI', comparison: '<=' },
  { category: 'B', gender: 'M', testNumber: 8, requirement: 1.2, unit: 'PEI', comparison: '<=' },
  { category: 'C', gender: 'M', testNumber: 8, requirement: 1.4, unit: 'PEI', comparison: '<=' },
  { category: 'D', gender: 'M', testNumber: 8, requirement: 1.6, unit: 'PEI', comparison: '<=' },
  { category: 'E', gender: 'M', testNumber: 8, requirement: 1.8, unit: 'PEI', comparison: '<=' },
  { category: 'F', gender: 'M', testNumber: 8, requirement: 2.0, unit: 'PEI', comparison: '<=' },
  { category: 'G', gender: 'M', testNumber: 8, requirement: 2.2, unit: 'PEI', comparison: '<=' },
  { category: 'H', gender: 'M', testNumber: 8, requirement: 2.4, unit: 'PEI', comparison: '<=' },
  { category: 'I', gender: 'M', testNumber: 8, requirement: 2.6, unit: 'PEI', comparison: '<=' },
  { category: 'J', gender: 'M', testNumber: 8, requirement: 2.8, unit: 'PEI', comparison: '<=' },
  { category: 'K', gender: 'M', testNumber: 8, requirement: 3.0, unit: 'PEI', comparison: '<=' },

  // Women (same as men for approach tests)
  { category: 'A', gender: 'K', testNumber: 8, requirement: 1.0, unit: 'PEI', comparison: '<=' },
  { category: 'B', gender: 'K', testNumber: 8, requirement: 1.2, unit: 'PEI', comparison: '<=' },
  { category: 'C', gender: 'K', testNumber: 8, requirement: 1.4, unit: 'PEI', comparison: '<=' },
  { category: 'D', gender: 'K', testNumber: 8, requirement: 1.6, unit: 'PEI', comparison: '<=' },
  { category: 'E', gender: 'K', testNumber: 8, requirement: 1.8, unit: 'PEI', comparison: '<=' },
  { category: 'F', gender: 'K', testNumber: 8, requirement: 2.0, unit: 'PEI', comparison: '<=' },
  { category: 'G', gender: 'K', testNumber: 8, requirement: 2.2, unit: 'PEI', comparison: '<=' },
  { category: 'H', gender: 'K', testNumber: 8, requirement: 2.4, unit: 'PEI', comparison: '<=' },
  { category: 'I', gender: 'K', testNumber: 8, requirement: 2.6, unit: 'PEI', comparison: '<=' },
  { category: 'J', gender: 'K', testNumber: 8, requirement: 2.8, unit: 'PEI', comparison: '<=' },
  { category: 'K', gender: 'K', testNumber: 8, requirement: 3.0, unit: 'PEI', comparison: '<=' },
];

// Test 9: 50m Approach
const test9Requirements = [
  // Men
  { category: 'A', gender: 'M', testNumber: 9, requirement: 1.0, unit: 'PEI', comparison: '<=' },
  { category: 'B', gender: 'M', testNumber: 9, requirement: 1.2, unit: 'PEI', comparison: '<=' },
  { category: 'C', gender: 'M', testNumber: 9, requirement: 1.4, unit: 'PEI', comparison: '<=' },
  { category: 'D', gender: 'M', testNumber: 9, requirement: 1.6, unit: 'PEI', comparison: '<=' },
  { category: 'E', gender: 'M', testNumber: 9, requirement: 1.8, unit: 'PEI', comparison: '<=' },
  { category: 'F', gender: 'M', testNumber: 9, requirement: 2.0, unit: 'PEI', comparison: '<=' },
  { category: 'G', gender: 'M', testNumber: 9, requirement: 2.2, unit: 'PEI', comparison: '<=' },
  { category: 'H', gender: 'M', testNumber: 9, requirement: 2.4, unit: 'PEI', comparison: '<=' },
  { category: 'I', gender: 'M', testNumber: 9, requirement: 2.6, unit: 'PEI', comparison: '<=' },
  { category: 'J', gender: 'M', testNumber: 9, requirement: 2.8, unit: 'PEI', comparison: '<=' },
  { category: 'K', gender: 'M', testNumber: 9, requirement: 3.0, unit: 'PEI', comparison: '<=' },

  // Women
  { category: 'A', gender: 'K', testNumber: 9, requirement: 1.0, unit: 'PEI', comparison: '<=' },
  { category: 'B', gender: 'K', testNumber: 9, requirement: 1.2, unit: 'PEI', comparison: '<=' },
  { category: 'C', gender: 'K', testNumber: 9, requirement: 1.4, unit: 'PEI', comparison: '<=' },
  { category: 'D', gender: 'K', testNumber: 9, requirement: 1.6, unit: 'PEI', comparison: '<=' },
  { category: 'E', gender: 'K', testNumber: 9, requirement: 1.8, unit: 'PEI', comparison: '<=' },
  { category: 'F', gender: 'K', testNumber: 9, requirement: 2.0, unit: 'PEI', comparison: '<=' },
  { category: 'G', gender: 'K', testNumber: 9, requirement: 2.2, unit: 'PEI', comparison: '<=' },
  { category: 'H', gender: 'K', testNumber: 9, requirement: 2.4, unit: 'PEI', comparison: '<=' },
  { category: 'I', gender: 'K', testNumber: 9, requirement: 2.6, unit: 'PEI', comparison: '<=' },
  { category: 'J', gender: 'K', testNumber: 9, requirement: 2.8, unit: 'PEI', comparison: '<=' },
  { category: 'K', gender: 'K', testNumber: 9, requirement: 3.0, unit: 'PEI', comparison: '<=' },
];

// Test 10: 75m Approach
const test10Requirements = [
  // Men
  { category: 'A', gender: 'M', testNumber: 10, requirement: 1.0, unit: 'PEI', comparison: '<=' },
  { category: 'B', gender: 'M', testNumber: 10, requirement: 1.2, unit: 'PEI', comparison: '<=' },
  { category: 'C', gender: 'M', testNumber: 10, requirement: 1.4, unit: 'PEI', comparison: '<=' },
  { category: 'D', gender: 'M', testNumber: 10, requirement: 1.6, unit: 'PEI', comparison: '<=' },
  { category: 'E', gender: 'M', testNumber: 10, requirement: 1.8, unit: 'PEI', comparison: '<=' },
  { category: 'F', gender: 'M', testNumber: 10, requirement: 2.0, unit: 'PEI', comparison: '<=' },
  { category: 'G', gender: 'M', testNumber: 10, requirement: 2.2, unit: 'PEI', comparison: '<=' },
  { category: 'H', gender: 'M', testNumber: 10, requirement: 2.4, unit: 'PEI', comparison: '<=' },
  { category: 'I', gender: 'M', testNumber: 10, requirement: 2.6, unit: 'PEI', comparison: '<=' },
  { category: 'J', gender: 'M', testNumber: 10, requirement: 2.8, unit: 'PEI', comparison: '<=' },
  { category: 'K', gender: 'M', testNumber: 10, requirement: 3.0, unit: 'PEI', comparison: '<=' },

  // Women
  { category: 'A', gender: 'K', testNumber: 10, requirement: 1.0, unit: 'PEI', comparison: '<=' },
  { category: 'B', gender: 'K', testNumber: 10, requirement: 1.2, unit: 'PEI', comparison: '<=' },
  { category: 'C', gender: 'K', testNumber: 10, requirement: 1.4, unit: 'PEI', comparison: '<=' },
  { category: 'D', gender: 'K', testNumber: 10, requirement: 1.6, unit: 'PEI', comparison: '<=' },
  { category: 'E', gender: 'K', testNumber: 10, requirement: 1.8, unit: 'PEI', comparison: '<=' },
  { category: 'F', gender: 'K', testNumber: 10, requirement: 2.0, unit: 'PEI', comparison: '<=' },
  { category: 'G', gender: 'K', testNumber: 10, requirement: 2.2, unit: 'PEI', comparison: '<=' },
  { category: 'H', gender: 'K', testNumber: 10, requirement: 2.4, unit: 'PEI', comparison: '<=' },
  { category: 'I', gender: 'K', testNumber: 10, requirement: 2.6, unit: 'PEI', comparison: '<=' },
  { category: 'J', gender: 'K', testNumber: 10, requirement: 2.8, unit: 'PEI', comparison: '<=' },
  { category: 'K', gender: 'K', testNumber: 10, requirement: 3.0, unit: 'PEI', comparison: '<=' },
];

// Test 11: 100m Approach
const test11Requirements = [
  // Men
  { category: 'A', gender: 'M', testNumber: 11, requirement: 1.0, unit: 'PEI', comparison: '<=' },
  { category: 'B', gender: 'M', testNumber: 11, requirement: 1.2, unit: 'PEI', comparison: '<=' },
  { category: 'C', gender: 'M', testNumber: 11, requirement: 1.4, unit: 'PEI', comparison: '<=' },
  { category: 'D', gender: 'M', testNumber: 11, requirement: 1.6, unit: 'PEI', comparison: '<=' },
  { category: 'E', gender: 'M', testNumber: 11, requirement: 1.8, unit: 'PEI', comparison: '<=' },
  { category: 'F', gender: 'M', testNumber: 11, requirement: 2.0, unit: 'PEI', comparison: '<=' },
  { category: 'G', gender: 'M', testNumber: 11, requirement: 2.2, unit: 'PEI', comparison: '<=' },
  { category: 'H', gender: 'M', testNumber: 11, requirement: 2.4, unit: 'PEI', comparison: '<=' },
  { category: 'I', gender: 'M', testNumber: 11, requirement: 2.6, unit: 'PEI', comparison: '<=' },
  { category: 'J', gender: 'M', testNumber: 11, requirement: 2.8, unit: 'PEI', comparison: '<=' },
  { category: 'K', gender: 'M', testNumber: 11, requirement: 3.0, unit: 'PEI', comparison: '<=' },

  // Women
  { category: 'A', gender: 'K', testNumber: 11, requirement: 1.0, unit: 'PEI', comparison: '<=' },
  { category: 'B', gender: 'K', testNumber: 11, requirement: 1.2, unit: 'PEI', comparison: '<=' },
  { category: 'C', gender: 'K', testNumber: 11, requirement: 1.4, unit: 'PEI', comparison: '<=' },
  { category: 'D', gender: 'K', testNumber: 11, requirement: 1.6, unit: 'PEI', comparison: '<=' },
  { category: 'E', gender: 'K', testNumber: 11, requirement: 1.8, unit: 'PEI', comparison: '<=' },
  { category: 'F', gender: 'K', testNumber: 11, requirement: 2.0, unit: 'PEI', comparison: '<=' },
  { category: 'G', gender: 'K', testNumber: 11, requirement: 2.2, unit: 'PEI', comparison: '<=' },
  { category: 'H', gender: 'K', testNumber: 11, requirement: 2.4, unit: 'PEI', comparison: '<=' },
  { category: 'I', gender: 'K', testNumber: 11, requirement: 2.6, unit: 'PEI', comparison: '<=' },
  { category: 'J', gender: 'K', testNumber: 11, requirement: 2.8, unit: 'PEI', comparison: '<=' },
  { category: 'K', gender: 'K', testNumber: 11, requirement: 3.0, unit: 'PEI', comparison: '<=' },
];

// ============================================================================
// TESTS 12-14: PHYSICAL TESTS
// ============================================================================

// Test 12: Benkpress (1RM kg)
const test12Requirements = [
  // Men
  { category: 'A', gender: 'M', testNumber: 12, requirement: 140, unit: 'kg', comparison: '>=' },
  { category: 'B', gender: 'M', testNumber: 12, requirement: 130, unit: 'kg', comparison: '>=' },
  { category: 'C', gender: 'M', testNumber: 12, requirement: 120, unit: 'kg', comparison: '>=' },
  { category: 'D', gender: 'M', testNumber: 12, requirement: 110, unit: 'kg', comparison: '>=' },
  { category: 'E', gender: 'M', testNumber: 12, requirement: 100, unit: 'kg', comparison: '>=' },
  { category: 'F', gender: 'M', testNumber: 12, requirement: 90, unit: 'kg', comparison: '>=' },
  { category: 'G', gender: 'M', testNumber: 12, requirement: 80, unit: 'kg', comparison: '>=' },
  { category: 'H', gender: 'M', testNumber: 12, requirement: 70, unit: 'kg', comparison: '>=' },
  { category: 'I', gender: 'M', testNumber: 12, requirement: 60, unit: 'kg', comparison: '>=' },
  { category: 'J', gender: 'M', testNumber: 12, requirement: 50, unit: 'kg', comparison: '>=' },
  { category: 'K', gender: 'M', testNumber: 12, requirement: 40, unit: 'kg', comparison: '>=' },

  // Women
  { category: 'A', gender: 'K', testNumber: 12, requirement: 100, unit: 'kg', comparison: '>=' },
  { category: 'B', gender: 'K', testNumber: 12, requirement: 90, unit: 'kg', comparison: '>=' },
  { category: 'C', gender: 'K', testNumber: 12, requirement: 80, unit: 'kg', comparison: '>=' },
  { category: 'D', gender: 'K', testNumber: 12, requirement: 70, unit: 'kg', comparison: '>=' },
  { category: 'E', gender: 'K', testNumber: 12, requirement: 60, unit: 'kg', comparison: '>=' },
  { category: 'F', gender: 'K', testNumber: 12, requirement: 50, unit: 'kg', comparison: '>=' },
  { category: 'G', gender: 'K', testNumber: 12, requirement: 45, unit: 'kg', comparison: '>=' },
  { category: 'H', gender: 'K', testNumber: 12, requirement: 40, unit: 'kg', comparison: '>=' },
  { category: 'I', gender: 'K', testNumber: 12, requirement: 35, unit: 'kg', comparison: '>=' },
  { category: 'J', gender: 'K', testNumber: 12, requirement: 30, unit: 'kg', comparison: '>=' },
  { category: 'K', gender: 'K', testNumber: 12, requirement: 25, unit: 'kg', comparison: '>=' },
];

// Test 13: Markløft Trapbar (1RM kg)
const test13Requirements = [
  // Men
  { category: 'A', gender: 'M', testNumber: 13, requirement: 200, unit: 'kg', comparison: '>=' },
  { category: 'B', gender: 'M', testNumber: 13, requirement: 185, unit: 'kg', comparison: '>=' },
  { category: 'C', gender: 'M', testNumber: 13, requirement: 170, unit: 'kg', comparison: '>=' },
  { category: 'D', gender: 'M', testNumber: 13, requirement: 155, unit: 'kg', comparison: '>=' },
  { category: 'E', gender: 'M', testNumber: 13, requirement: 140, unit: 'kg', comparison: '>=' },
  { category: 'F', gender: 'M', testNumber: 13, requirement: 125, unit: 'kg', comparison: '>=' },
  { category: 'G', gender: 'M', testNumber: 13, requirement: 110, unit: 'kg', comparison: '>=' },
  { category: 'H', gender: 'M', testNumber: 13, requirement: 95, unit: 'kg', comparison: '>=' },
  { category: 'I', gender: 'M', testNumber: 13, requirement: 80, unit: 'kg', comparison: '>=' },
  { category: 'J', gender: 'M', testNumber: 13, requirement: 65, unit: 'kg', comparison: '>=' },
  { category: 'K', gender: 'M', testNumber: 13, requirement: 50, unit: 'kg', comparison: '>=' },

  // Women
  { category: 'A', gender: 'K', testNumber: 13, requirement: 140, unit: 'kg', comparison: '>=' },
  { category: 'B', gender: 'K', testNumber: 13, requirement: 130, unit: 'kg', comparison: '>=' },
  { category: 'C', gender: 'K', testNumber: 13, requirement: 120, unit: 'kg', comparison: '>=' },
  { category: 'D', gender: 'K', testNumber: 13, requirement: 110, unit: 'kg', comparison: '>=' },
  { category: 'E', gender: 'K', testNumber: 13, requirement: 100, unit: 'kg', comparison: '>=' },
  { category: 'F', gender: 'K', testNumber: 13, requirement: 90, unit: 'kg', comparison: '>=' },
  { category: 'G', gender: 'K', testNumber: 13, requirement: 80, unit: 'kg', comparison: '>=' },
  { category: 'H', gender: 'K', testNumber: 13, requirement: 70, unit: 'kg', comparison: '>=' },
  { category: 'I', gender: 'K', testNumber: 13, requirement: 60, unit: 'kg', comparison: '>=' },
  { category: 'J', gender: 'K', testNumber: 13, requirement: 50, unit: 'kg', comparison: '>=' },
  { category: 'K', gender: 'K', testNumber: 13, requirement: 40, unit: 'kg', comparison: '>=' },
];

// Test 14: 3000m Løping - Mølle (seconds, lower is better)
const test14Requirements = [
  // Men (times in seconds)
  { category: 'A', gender: 'M', testNumber: 14, requirement: 660, unit: 'seconds', comparison: '<=' },  // 11:00
  { category: 'B', gender: 'M', testNumber: 14, requirement: 690, unit: 'seconds', comparison: '<=' },  // 11:30
  { category: 'C', gender: 'M', testNumber: 14, requirement: 720, unit: 'seconds', comparison: '<=' },  // 12:00
  { category: 'D', gender: 'M', testNumber: 14, requirement: 750, unit: 'seconds', comparison: '<=' },  // 12:30
  { category: 'E', gender: 'M', testNumber: 14, requirement: 780, unit: 'seconds', comparison: '<=' },  // 13:00
  { category: 'F', gender: 'M', testNumber: 14, requirement: 810, unit: 'seconds', comparison: '<=' },  // 13:30
  { category: 'G', gender: 'M', testNumber: 14, requirement: 840, unit: 'seconds', comparison: '<=' },  // 14:00
  { category: 'H', gender: 'M', testNumber: 14, requirement: 900, unit: 'seconds', comparison: '<=' },  // 15:00
  { category: 'I', gender: 'M', testNumber: 14, requirement: 960, unit: 'seconds', comparison: '<=' },  // 16:00
  { category: 'J', gender: 'M', testNumber: 14, requirement: 1020, unit: 'seconds', comparison: '<=' }, // 17:00
  { category: 'K', gender: 'M', testNumber: 14, requirement: 1080, unit: 'seconds', comparison: '<=' }, // 18:00

  // Women (times in seconds)
  { category: 'A', gender: 'K', testNumber: 14, requirement: 750, unit: 'seconds', comparison: '<=' },  // 12:30
  { category: 'B', gender: 'K', testNumber: 14, requirement: 780, unit: 'seconds', comparison: '<=' },  // 13:00
  { category: 'C', gender: 'K', testNumber: 14, requirement: 810, unit: 'seconds', comparison: '<=' },  // 13:30
  { category: 'D', gender: 'K', testNumber: 14, requirement: 840, unit: 'seconds', comparison: '<=' },  // 14:00
  { category: 'E', gender: 'K', testNumber: 14, requirement: 870, unit: 'seconds', comparison: '<=' },  // 14:30
  { category: 'F', gender: 'K', testNumber: 14, requirement: 900, unit: 'seconds', comparison: '<=' },  // 15:00
  { category: 'G', gender: 'K', testNumber: 14, requirement: 930, unit: 'seconds', comparison: '<=' },  // 15:30
  { category: 'H', gender: 'K', testNumber: 14, requirement: 990, unit: 'seconds', comparison: '<=' },  // 16:30
  { category: 'I', gender: 'K', testNumber: 14, requirement: 1050, unit: 'seconds', comparison: '<=' }, // 17:30
  { category: 'J', gender: 'K', testNumber: 14, requirement: 1110, unit: 'seconds', comparison: '<=' }, // 18:30
  { category: 'K', gender: 'K', testNumber: 14, requirement: 1200, unit: 'seconds', comparison: '<=' }, // 20:00
];

// ============================================================================
// TESTS 15-18: SHORT GAME TESTS
// ============================================================================

// Test 15: Putting 3m (success rate %)
const test15Requirements = [
  // Men & Women (same requirements)
  { category: 'A', gender: 'M', testNumber: 15, requirement: 90, unit: 'percent', comparison: '>=' },
  { category: 'B', gender: 'M', testNumber: 15, requirement: 80, unit: 'percent', comparison: '>=' },
  { category: 'C', gender: 'M', testNumber: 15, requirement: 70, unit: 'percent', comparison: '>=' },
  { category: 'D', gender: 'M', testNumber: 15, requirement: 60, unit: 'percent', comparison: '>=' },
  { category: 'E', gender: 'M', testNumber: 15, requirement: 50, unit: 'percent', comparison: '>=' },
  { category: 'F', gender: 'M', testNumber: 15, requirement: 40, unit: 'percent', comparison: '>=' },
  { category: 'G', gender: 'M', testNumber: 15, requirement: 35, unit: 'percent', comparison: '>=' },
  { category: 'H', gender: 'M', testNumber: 15, requirement: 30, unit: 'percent', comparison: '>=' },
  { category: 'I', gender: 'M', testNumber: 15, requirement: 25, unit: 'percent', comparison: '>=' },
  { category: 'J', gender: 'M', testNumber: 15, requirement: 20, unit: 'percent', comparison: '>=' },
  { category: 'K', gender: 'M', testNumber: 15, requirement: 15, unit: 'percent', comparison: '>=' },

  { category: 'A', gender: 'K', testNumber: 15, requirement: 90, unit: 'percent', comparison: '>=' },
  { category: 'B', gender: 'K', testNumber: 15, requirement: 80, unit: 'percent', comparison: '>=' },
  { category: 'C', gender: 'K', testNumber: 15, requirement: 70, unit: 'percent', comparison: '>=' },
  { category: 'D', gender: 'K', testNumber: 15, requirement: 60, unit: 'percent', comparison: '>=' },
  { category: 'E', gender: 'K', testNumber: 15, requirement: 50, unit: 'percent', comparison: '>=' },
  { category: 'F', gender: 'K', testNumber: 15, requirement: 40, unit: 'percent', comparison: '>=' },
  { category: 'G', gender: 'K', testNumber: 15, requirement: 35, unit: 'percent', comparison: '>=' },
  { category: 'H', gender: 'K', testNumber: 15, requirement: 30, unit: 'percent', comparison: '>=' },
  { category: 'I', gender: 'K', testNumber: 15, requirement: 25, unit: 'percent', comparison: '>=' },
  { category: 'J', gender: 'K', testNumber: 15, requirement: 20, unit: 'percent', comparison: '>=' },
  { category: 'K', gender: 'K', testNumber: 15, requirement: 15, unit: 'percent', comparison: '>=' },
];

// Test 16: Putting 6m (success rate %)
const test16Requirements = [
  // Men & Women (same requirements)
  { category: 'A', gender: 'M', testNumber: 16, requirement: 50, unit: 'percent', comparison: '>=' },
  { category: 'B', gender: 'M', testNumber: 16, requirement: 40, unit: 'percent', comparison: '>=' },
  { category: 'C', gender: 'M', testNumber: 16, requirement: 30, unit: 'percent', comparison: '>=' },
  { category: 'D', gender: 'M', testNumber: 16, requirement: 25, unit: 'percent', comparison: '>=' },
  { category: 'E', gender: 'M', testNumber: 16, requirement: 20, unit: 'percent', comparison: '>=' },
  { category: 'F', gender: 'M', testNumber: 16, requirement: 15, unit: 'percent', comparison: '>=' },
  { category: 'G', gender: 'M', testNumber: 16, requirement: 12, unit: 'percent', comparison: '>=' },
  { category: 'H', gender: 'M', testNumber: 16, requirement: 10, unit: 'percent', comparison: '>=' },
  { category: 'I', gender: 'M', testNumber: 16, requirement: 8, unit: 'percent', comparison: '>=' },
  { category: 'J', gender: 'M', testNumber: 16, requirement: 5, unit: 'percent', comparison: '>=' },
  { category: 'K', gender: 'M', testNumber: 16, requirement: 5, unit: 'percent', comparison: '>=' },

  { category: 'A', gender: 'K', testNumber: 16, requirement: 50, unit: 'percent', comparison: '>=' },
  { category: 'B', gender: 'K', testNumber: 16, requirement: 40, unit: 'percent', comparison: '>=' },
  { category: 'C', gender: 'K', testNumber: 16, requirement: 30, unit: 'percent', comparison: '>=' },
  { category: 'D', gender: 'K', testNumber: 16, requirement: 25, unit: 'percent', comparison: '>=' },
  { category: 'E', gender: 'K', testNumber: 16, requirement: 20, unit: 'percent', comparison: '>=' },
  { category: 'F', gender: 'K', testNumber: 16, requirement: 15, unit: 'percent', comparison: '>=' },
  { category: 'G', gender: 'K', testNumber: 16, requirement: 12, unit: 'percent', comparison: '>=' },
  { category: 'H', gender: 'K', testNumber: 16, requirement: 10, unit: 'percent', comparison: '>=' },
  { category: 'I', gender: 'K', testNumber: 16, requirement: 8, unit: 'percent', comparison: '>=' },
  { category: 'J', gender: 'K', testNumber: 16, requirement: 5, unit: 'percent', comparison: '>=' },
  { category: 'K', gender: 'K', testNumber: 16, requirement: 5, unit: 'percent', comparison: '>=' },
];

// Test 17: Chipping (avg distance from hole in cm, lower is better)
const test17Requirements = [
  // Men & Women (same requirements)
  { category: 'A', gender: 'M', testNumber: 17, requirement: 100, unit: 'cm', comparison: '<=' },
  { category: 'B', gender: 'M', testNumber: 17, requirement: 120, unit: 'cm', comparison: '<=' },
  { category: 'C', gender: 'M', testNumber: 17, requirement: 150, unit: 'cm', comparison: '<=' },
  { category: 'D', gender: 'M', testNumber: 17, requirement: 180, unit: 'cm', comparison: '<=' },
  { category: 'E', gender: 'M', testNumber: 17, requirement: 200, unit: 'cm', comparison: '<=' },
  { category: 'F', gender: 'M', testNumber: 17, requirement: 220, unit: 'cm', comparison: '<=' },
  { category: 'G', gender: 'M', testNumber: 17, requirement: 250, unit: 'cm', comparison: '<=' },
  { category: 'H', gender: 'M', testNumber: 17, requirement: 280, unit: 'cm', comparison: '<=' },
  { category: 'I', gender: 'M', testNumber: 17, requirement: 300, unit: 'cm', comparison: '<=' },
  { category: 'J', gender: 'M', testNumber: 17, requirement: 320, unit: 'cm', comparison: '<=' },
  { category: 'K', gender: 'M', testNumber: 17, requirement: 350, unit: 'cm', comparison: '<=' },

  { category: 'A', gender: 'K', testNumber: 17, requirement: 100, unit: 'cm', comparison: '<=' },
  { category: 'B', gender: 'K', testNumber: 17, requirement: 120, unit: 'cm', comparison: '<=' },
  { category: 'C', gender: 'K', testNumber: 17, requirement: 150, unit: 'cm', comparison: '<=' },
  { category: 'D', gender: 'K', testNumber: 17, requirement: 180, unit: 'cm', comparison: '<=' },
  { category: 'E', gender: 'K', testNumber: 17, requirement: 200, unit: 'cm', comparison: '<=' },
  { category: 'F', gender: 'K', testNumber: 17, requirement: 220, unit: 'cm', comparison: '<=' },
  { category: 'G', gender: 'K', testNumber: 17, requirement: 250, unit: 'cm', comparison: '<=' },
  { category: 'H', gender: 'K', testNumber: 17, requirement: 280, unit: 'cm', comparison: '<=' },
  { category: 'I', gender: 'K', testNumber: 17, requirement: 300, unit: 'cm', comparison: '<=' },
  { category: 'J', gender: 'K', testNumber: 17, requirement: 320, unit: 'cm', comparison: '<=' },
  { category: 'K', gender: 'K', testNumber: 17, requirement: 350, unit: 'cm', comparison: '<=' },
];

// Test 18: Bunker (avg distance from hole in cm, lower is better)
const test18Requirements = [
  // Men & Women (same requirements)
  { category: 'A', gender: 'M', testNumber: 18, requirement: 150, unit: 'cm', comparison: '<=' },
  { category: 'B', gender: 'M', testNumber: 18, requirement: 180, unit: 'cm', comparison: '<=' },
  { category: 'C', gender: 'M', testNumber: 18, requirement: 200, unit: 'cm', comparison: '<=' },
  { category: 'D', gender: 'M', testNumber: 18, requirement: 220, unit: 'cm', comparison: '<=' },
  { category: 'E', gender: 'M', testNumber: 18, requirement: 250, unit: 'cm', comparison: '<=' },
  { category: 'F', gender: 'M', testNumber: 18, requirement: 280, unit: 'cm', comparison: '<=' },
  { category: 'G', gender: 'M', testNumber: 18, requirement: 300, unit: 'cm', comparison: '<=' },
  { category: 'H', gender: 'M', testNumber: 18, requirement: 320, unit: 'cm', comparison: '<=' },
  { category: 'I', gender: 'M', testNumber: 18, requirement: 350, unit: 'cm', comparison: '<=' },
  { category: 'J', gender: 'M', testNumber: 18, requirement: 380, unit: 'cm', comparison: '<=' },
  { category: 'K', gender: 'M', testNumber: 18, requirement: 400, unit: 'cm', comparison: '<=' },

  { category: 'A', gender: 'K', testNumber: 18, requirement: 150, unit: 'cm', comparison: '<=' },
  { category: 'B', gender: 'K', testNumber: 18, requirement: 180, unit: 'cm', comparison: '<=' },
  { category: 'C', gender: 'K', testNumber: 18, requirement: 200, unit: 'cm', comparison: '<=' },
  { category: 'D', gender: 'K', testNumber: 18, requirement: 220, unit: 'cm', comparison: '<=' },
  { category: 'E', gender: 'K', testNumber: 18, requirement: 250, unit: 'cm', comparison: '<=' },
  { category: 'F', gender: 'K', testNumber: 18, requirement: 280, unit: 'cm', comparison: '<=' },
  { category: 'G', gender: 'K', testNumber: 18, requirement: 300, unit: 'cm', comparison: '<=' },
  { category: 'H', gender: 'K', testNumber: 18, requirement: 320, unit: 'cm', comparison: '<=' },
  { category: 'I', gender: 'K', testNumber: 18, requirement: 350, unit: 'cm', comparison: '<=' },
  { category: 'J', gender: 'K', testNumber: 18, requirement: 380, unit: 'cm', comparison: '<=' },
  { category: 'K', gender: 'K', testNumber: 18, requirement: 400, unit: 'cm', comparison: '<=' },
];

// ============================================================================
// TESTS 19-20: ON-COURSE TESTS
// ============================================================================

// Test 19: 9-hulls simulering (score to par, lower is better)
const test19Requirements = [
  // Men & Women (same requirements)
  { category: 'A', gender: 'M', testNumber: 19, requirement: 0, unit: 'score_to_par', comparison: '<=' },
  { category: 'B', gender: 'M', testNumber: 19, requirement: 2, unit: 'score_to_par', comparison: '<=' },
  { category: 'C', gender: 'M', testNumber: 19, requirement: 4, unit: 'score_to_par', comparison: '<=' },
  { category: 'D', gender: 'M', testNumber: 19, requirement: 6, unit: 'score_to_par', comparison: '<=' },
  { category: 'E', gender: 'M', testNumber: 19, requirement: 8, unit: 'score_to_par', comparison: '<=' },
  { category: 'F', gender: 'M', testNumber: 19, requirement: 10, unit: 'score_to_par', comparison: '<=' },
  { category: 'G', gender: 'M', testNumber: 19, requirement: 12, unit: 'score_to_par', comparison: '<=' },
  { category: 'H', gender: 'M', testNumber: 19, requirement: 14, unit: 'score_to_par', comparison: '<=' },
  { category: 'I', gender: 'M', testNumber: 19, requirement: 16, unit: 'score_to_par', comparison: '<=' },
  { category: 'J', gender: 'M', testNumber: 19, requirement: 18, unit: 'score_to_par', comparison: '<=' },
  { category: 'K', gender: 'M', testNumber: 19, requirement: 20, unit: 'score_to_par', comparison: '<=' },

  { category: 'A', gender: 'K', testNumber: 19, requirement: 0, unit: 'score_to_par', comparison: '<=' },
  { category: 'B', gender: 'K', testNumber: 19, requirement: 2, unit: 'score_to_par', comparison: '<=' },
  { category: 'C', gender: 'K', testNumber: 19, requirement: 4, unit: 'score_to_par', comparison: '<=' },
  { category: 'D', gender: 'K', testNumber: 19, requirement: 6, unit: 'score_to_par', comparison: '<=' },
  { category: 'E', gender: 'K', testNumber: 19, requirement: 8, unit: 'score_to_par', comparison: '<=' },
  { category: 'F', gender: 'K', testNumber: 19, requirement: 10, unit: 'score_to_par', comparison: '<=' },
  { category: 'G', gender: 'K', testNumber: 19, requirement: 12, unit: 'score_to_par', comparison: '<=' },
  { category: 'H', gender: 'K', testNumber: 19, requirement: 14, unit: 'score_to_par', comparison: '<=' },
  { category: 'I', gender: 'K', testNumber: 19, requirement: 16, unit: 'score_to_par', comparison: '<=' },
  { category: 'J', gender: 'K', testNumber: 19, requirement: 18, unit: 'score_to_par', comparison: '<=' },
  { category: 'K', gender: 'K', testNumber: 19, requirement: 20, unit: 'score_to_par', comparison: '<=' },
];

// Test 20: On-course skills (score to par, lower is better)
const test20Requirements = [
  // Men & Women (same requirements)
  { category: 'A', gender: 'M', testNumber: 20, requirement: 0, unit: 'score_to_par', comparison: '<=' },
  { category: 'B', gender: 'M', testNumber: 20, requirement: 1, unit: 'score_to_par', comparison: '<=' },
  { category: 'C', gender: 'M', testNumber: 20, requirement: 2, unit: 'score_to_par', comparison: '<=' },
  { category: 'D', gender: 'M', testNumber: 20, requirement: 3, unit: 'score_to_par', comparison: '<=' },
  { category: 'E', gender: 'M', testNumber: 20, requirement: 4, unit: 'score_to_par', comparison: '<=' },
  { category: 'F', gender: 'M', testNumber: 20, requirement: 5, unit: 'score_to_par', comparison: '<=' },
  { category: 'G', gender: 'M', testNumber: 20, requirement: 6, unit: 'score_to_par', comparison: '<=' },
  { category: 'H', gender: 'M', testNumber: 20, requirement: 7, unit: 'score_to_par', comparison: '<=' },
  { category: 'I', gender: 'M', testNumber: 20, requirement: 8, unit: 'score_to_par', comparison: '<=' },
  { category: 'J', gender: 'M', testNumber: 20, requirement: 10, unit: 'score_to_par', comparison: '<=' },
  { category: 'K', gender: 'M', testNumber: 20, requirement: 12, unit: 'score_to_par', comparison: '<=' },

  { category: 'A', gender: 'K', testNumber: 20, requirement: 0, unit: 'score_to_par', comparison: '<=' },
  { category: 'B', gender: 'K', testNumber: 20, requirement: 1, unit: 'score_to_par', comparison: '<=' },
  { category: 'C', gender: 'K', testNumber: 20, requirement: 2, unit: 'score_to_par', comparison: '<=' },
  { category: 'D', gender: 'K', testNumber: 20, requirement: 3, unit: 'score_to_par', comparison: '<=' },
  { category: 'E', gender: 'K', testNumber: 20, requirement: 4, unit: 'score_to_par', comparison: '<=' },
  { category: 'F', gender: 'K', testNumber: 20, requirement: 5, unit: 'score_to_par', comparison: '<=' },
  { category: 'G', gender: 'K', testNumber: 20, requirement: 6, unit: 'score_to_par', comparison: '<=' },
  { category: 'H', gender: 'K', testNumber: 20, requirement: 7, unit: 'score_to_par', comparison: '<=' },
  { category: 'I', gender: 'K', testNumber: 20, requirement: 8, unit: 'score_to_par', comparison: '<=' },
  { category: 'J', gender: 'K', testNumber: 20, requirement: 10, unit: 'score_to_par', comparison: '<=' },
  { category: 'K', gender: 'K', testNumber: 20, requirement: 12, unit: 'score_to_par', comparison: '<=' },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

export async function seedCategoryRequirements() {
  console.log('🌱 Seeding category requirements...');

  const allRequirements = [
    ...test1Requirements,
    ...test2Requirements,
    ...test3Requirements,
    ...test4Requirements,
    ...test5Requirements,
    ...test6Requirements,
    ...test7Requirements,
    ...test8Requirements,
    ...test9Requirements,
    ...test10Requirements,
    ...test11Requirements,
    ...test12Requirements,
    ...test13Requirements,
    ...test14Requirements,
    ...test15Requirements,
    ...test16Requirements,
    ...test17Requirements,
    ...test18Requirements,
    ...test19Requirements,
    ...test20Requirements,
  ];

  console.log(`📊 Total requirements to seed: ${allRequirements.length}`);

  // Use createMany for bulk insert
  const result = await prisma.categoryRequirement.createMany({
    data: allRequirements as any,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${result.count} category requirements`);

  return result;
}

// Run seed if called directly
if (require.main === module) {
  seedCategoryRequirements()
    .then(() => {
      console.log('✅ Seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
