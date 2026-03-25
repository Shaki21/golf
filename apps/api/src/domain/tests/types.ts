/**
 * Test Domain Types
 * Based on TEST_SPESIFIKASJONER_APP.md
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface TestMetadata {
  testDate: Date;
  testTime?: string; // HH:MM format
  location: string;
  facility: string;
  environment: 'indoor' | 'outdoor';
  conditions?: {
    weather?: string;
    wind?: string;
    temperature?: number;
  };
}

export interface TestResult {
  value: number;
  passed: boolean;
  categoryRequirement: number;
  percentOfRequirement: number;
  pei?: number; // For PEI-based tests
}

export interface PlayerContext {
  id: string;
  category: string; // A-K
  gender: 'M' | 'K';
  age: number;
  handicap?: number;
}

// ============================================================================
// TEST 1: DRIVER AVSTAND
// ============================================================================

export interface Test1Shot {
  shotNumber: number;
  carryDistanceMeters: number;
}

export interface Test1Input {
  metadata: TestMetadata;
  shots: Test1Shot[]; // 6 shots
}

// ============================================================================
// TEST 2: 3-TRE AVSTAND
// ============================================================================

export interface Test2Shot {
  shotNumber: number;
  carryDistanceMeters: number;
}

export interface Test2Input {
  metadata: TestMetadata;
  shots: Test2Shot[]; // 6 shots
}

// ============================================================================
// TEST 3: JERN AVSTAND (5-JERN)
// ============================================================================

export interface Test3Shot {
  shotNumber: number;
  carryDistanceMeters: number;
}

export interface Test3Input {
  metadata: TestMetadata;
  shots: Test3Shot[]; // 6 shots
}

// ============================================================================
// TEST 4: WEDGE AVSTAND (PW)
// ============================================================================

export interface Test4Shot {
  shotNumber: number;
  carryDistanceMeters: number;
}

export interface Test4Input {
  metadata: TestMetadata;
  shots: Test4Shot[]; // 6 shots
}

// ============================================================================
// TEST 5: KLUBBHASTIGHET (DRIVER)
// ============================================================================

export interface Test5Shot {
  shotNumber: number;
  clubSpeedKmh: number;
}

export interface Test5Input {
  metadata: TestMetadata;
  shots: Test5Shot[]; // 6 shots
}

// ============================================================================
// TEST 6: BALLHASTIGHET (DRIVER)
// ============================================================================

export interface Test6Shot {
  shotNumber: number;
  ballSpeedKmh: number;
}

export interface Test6Input {
  metadata: TestMetadata;
  shots: Test6Shot[]; // 6 shots
}

// ============================================================================
// TEST 7: SMASH FACTOR (DRIVER)
// ============================================================================

export interface Test7Shot {
  shotNumber: number;
  ballSpeedKmh: number;
  clubSpeedKmh: number;
}

export interface Test7Input {
  metadata: TestMetadata;
  shots: Test7Shot[]; // 6 shots
}

// ============================================================================
// TEST 8: APPROACH - 25M
// ============================================================================

export interface Test8Shot {
  shotNumber: number;
  distanceToHoleMeters: number;
}

export interface Test8Input {
  metadata: TestMetadata;
  shots: Test8Shot[]; // 10 shots
  targetDistance: number; // 25m
}

// ============================================================================
// TEST 9: APPROACH - 50M
// ============================================================================

export interface Test9Shot {
  shotNumber: number;
  distanceToHoleMeters: number;
}

export interface Test9Input {
  metadata: TestMetadata;
  shots: Test9Shot[]; // 10 shots
  targetDistance: number; // 50m
}

// ============================================================================
// TEST 10: APPROACH - 75M
// ============================================================================

export interface Test10Shot {
  shotNumber: number;
  distanceToHoleMeters: number;
}

export interface Test10Input {
  metadata: TestMetadata;
  shots: Test10Shot[]; // 10 shots
  targetDistance: number; // 75m
}

// ============================================================================
// TEST 11: APPROACH - 100M
// ============================================================================

export interface Test11Shot {
  shotNumber: number;
  distanceToHoleMeters: number;
}

export interface Test11Input {
  metadata: TestMetadata;
  shots: Test11Shot[]; // 10 shots
  targetDistance: number; // 100m
}

// ============================================================================
// TEST 12: BENKPRESS (1RM kg)
// ============================================================================

export interface Test12Input {
  metadata: TestMetadata;
  weightKg: number; // 1RM in kg
  warmupSets?: {
    weight: number;
    reps: number;
  }[];
}

// ============================================================================
// TEST 13: MARKLØFT TRAPBAR (1RM kg)
// ============================================================================

export interface Test13Input {
  metadata: TestMetadata;
  weightKg: number; // 1RM in kg
  warmupSets?: {
    weight: number;
    reps: number;
  }[];
}

// ============================================================================
// TEST 14: 3000M LØPING - MØLLE (tid i sekunder, lavere er bedre)
// ============================================================================

export interface Test14Input {
  metadata: TestMetadata;
  timeSeconds: number; // Total tid i sekunder
  timeFormatted?: string; // Display format "MM:SS"
  treadmillSettings?: {
    incline?: number; // % incline
    startSpeed?: number; // km/h
  };
}

// ============================================================================
// TEST 15: PUTTING - 3M
// ============================================================================

export interface Test15Putt {
  puttNumber: number;
  holed: boolean;
  distanceFromHoleCm?: number; // If not holed
}

export interface Test15Input {
  metadata: TestMetadata;
  putts: Test15Putt[]; // 10 putts
}

// ============================================================================
// TEST 16: PUTTING - 6M
// ============================================================================

export interface Test16Putt {
  puttNumber: number;
  holed: boolean;
  distanceFromHoleCm?: number; // If not holed
}

export interface Test16Input {
  metadata: TestMetadata;
  putts: Test16Putt[]; // 10 putts
}

// ============================================================================
// TEST 17: CHIPPING
// ============================================================================

export interface Test17Chip {
  chipNumber: number;
  distanceFromHoleCm: number;
}

export interface Test17Input {
  metadata: TestMetadata;
  chips: Test17Chip[]; // 10 chips
}

// ============================================================================
// TEST 18: BUNKER
// ============================================================================

export interface Test18Shot {
  shotNumber: number;
  distanceFromHoleCm: number;
}

export interface Test18Input {
  metadata: TestMetadata;
  shots: Test18Shot[]; // 10 shots
}

// ============================================================================
// TEST 19: 9-HULLS SIMULERING
// ============================================================================

export interface Test19Hole {
  holeNumber: number;
  par: number;
  score: number;
  fairwayHit?: boolean; // Par 4/5 only
  girReached?: boolean; // Green in regulation
  putts: number;
  upAndDown?: boolean; // If GIR missed
}

export interface Test19Input {
  metadata: TestMetadata;
  holes: Test19Hole[]; // 9 holes
}

// ============================================================================
// TEST 20: ON-COURSE SKILLS
// ============================================================================

export interface Test20Hole {
  holeNumber: number;
  par: number;
  score: number;
  fairwayHit?: boolean;
  girReached?: boolean;
  putts: number;
  scrambling?: boolean;
  penalties: number;
}

export interface Test20Input {
  metadata: TestMetadata;
  holes: Test20Hole[]; // 3-6 holes
}

// ============================================================================
// CATEGORY REQUIREMENTS
// ============================================================================

export interface CategoryRequirement {
  category: string; // A-K
  gender: 'M' | 'K';
  testNumber: number; // 1-20
  requirement: number;
  unit: string;
  comparison: '>=' | '<=' | 'range';
  rangeMin?: number;
  rangeMax?: number;
}

// ============================================================================
// TEST INPUT UNION TYPE
// ============================================================================

export type TestInput =
  | Test1Input
  | Test2Input
  | Test3Input
  | Test4Input
  | Test5Input
  | Test6Input
  | Test7Input
  | Test8Input
  | Test9Input
  | Test10Input
  | Test11Input
  | Test12Input
  | Test13Input
  | Test14Input
  | Test15Input
  | Test16Input
  | Test17Input
  | Test18Input
  | Test19Input
  | Test20Input;
