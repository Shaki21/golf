/**
 * PEI to Strokes Gained Conversion Module
 *
 * Based on Team Norway SG Profile methodology
 * Uses expected strokes tables from professional tour data
 *
 * Formula: SG = (E_before - 1) - E_after
 * Where:
 *   E_before = Expected strokes from start distance
 *   E_after = Expected putts from leave distance
 *   Leave distance = Start distance × (PEI / 100)
 */

// ============================================================================
// TYPES
// ============================================================================

export type LieType = 'tee' | 'fairway' | 'rough' | 'bunker' | 'recovery' | 'green';

export interface PeiToSgInput {
  startDistance: number; // meters
  pei: number; // PEI value (lower = better, typically 3-15 for good shots)
  lie?: LieType; // defaults to 'fairway'
  category?: 'approach' | 'around_green' | 'putting';
}

export interface PeiToSgResult {
  strokesGained: number;
  expectedBefore: number;
  expectedAfter: number;
  leaveDistance: number;
  lie: LieType;
  category: 'approach' | 'around_green' | 'putting';
}

export interface BatchPeiResult {
  shots: PeiToSgResult[];
  totalStrokesGained: number;
  averageStrokesGained: number;
  category: string;
}

// ============================================================================
// EXPECTED PUTTS TABLE (Green - 0 to 28 meters)
// Based on PGA Tour putting statistics
// ============================================================================

const EXPECTED_PUTTS: Array<[number, number]> = [
  // [maxDistance in meters, expectedPutts]
  [0.1, 1.0],
  [0.2, 1.0],
  [0.3, 1.0],
  [0.4, 1.01],
  [0.5, 1.02],
  [0.6, 1.03],
  [0.7, 1.04],
  [0.8, 1.06],
  [0.9, 1.08],
  [1.0, 1.1],
  [1.1, 1.12],
  [1.2, 1.14],
  [1.3, 1.16],
  [1.4, 1.18],
  [1.5, 1.2],
  [1.6, 1.24],
  [1.7, 1.28],
  [1.8, 1.32],
  [1.9, 1.36],
  [2.0, 1.4],
  [2.1, 1.42],
  [2.2, 1.44],
  [2.3, 1.46],
  [2.4, 1.48],
  [2.5, 1.5],
  [2.6, 1.52],
  [2.7, 1.54],
  [2.8, 1.56],
  [2.9, 1.58],
  [3.0, 1.6],
  [3.5, 1.66],
  [4.0, 1.72],
  [4.5, 1.78],
  [5.0, 1.82],
  [5.5, 1.86],
  [6.0, 1.9],
  [6.5, 1.93],
  [7.0, 1.96],
  [7.5, 1.98],
  [8.0, 2.0],
  [8.5, 2.02],
  [9.0, 2.04],
  [9.5, 2.055],
  [10.0, 2.07],
  [10.5, 2.085],
  [11.0, 2.1],
  [11.5, 2.115],
  [12.0, 2.13],
  [12.5, 2.145],
  [13.0, 2.16],
  [13.5, 2.17],
  [14.0, 2.18],
  [14.5, 2.188],
  [15.0, 2.196],
  [15.5, 2.204],
  [16.0, 2.212],
  [16.5, 2.22],
  [17.0, 2.228],
  [17.5, 2.236],
  [18.0, 2.244],
  [18.5, 2.252],
  [19.0, 2.26],
  [19.5, 2.268],
  [20.0, 2.276],
  [21.0, 2.292],
  [22.0, 2.308],
  [23.0, 2.324],
  [24.0, 2.34],
  [25.0, 2.356],
  [26.0, 2.372],
  [27.0, 2.388],
  [28.0, 2.406],
];

// ============================================================================
// EXPECTED STROKES BY LIE TYPE
// Compressed format: [maxDistance, expectedStrokes]
// Uses key breakpoints with linear interpolation between
// ============================================================================

// Fairway expected strokes (approach shots from fairway)
const EXPECTED_STROKES_FAIRWAY: Array<[number, number]> = [
  [5, 2.06],
  [10, 2.2],
  [15, 2.29],
  [20, 2.38],
  [25, 2.44],
  [30, 2.5],
  [40, 2.58],
  [50, 2.64],
  [60, 2.7],
  [70, 2.75],
  [80, 2.8],
  [90, 2.84],
  [100, 2.88],
  [110, 2.92],
  [120, 2.94],
  [130, 2.97],
  [140, 3.0],
  [150, 3.02],
  [160, 3.06],
  [170, 3.1],
  [180, 3.14],
  [190, 3.2],
  [200, 3.26],
  [220, 3.38],
  [240, 3.52],
  [260, 3.66],
  [280, 3.8],
  [300, 3.94],
  [350, 4.22],
  [400, 4.48],
  [450, 4.72],
  [500, 4.88],
  [550, 4.94],
];

// Rough expected strokes (approach from rough - harder than fairway)
const EXPECTED_STROKES_ROUGH: Array<[number, number]> = [
  [5, 2.22],
  [10, 2.36],
  [15, 2.46],
  [20, 2.54],
  [25, 2.6],
  [30, 2.66],
  [40, 2.74],
  [50, 2.82],
  [60, 2.88],
  [70, 2.94],
  [80, 2.99],
  [90, 3.04],
  [100, 3.08],
  [110, 3.12],
  [120, 3.16],
  [130, 3.2],
  [140, 3.24],
  [150, 3.28],
  [160, 3.34],
  [170, 3.4],
  [180, 3.46],
  [190, 3.54],
  [200, 3.62],
  [220, 3.78],
  [240, 3.94],
  [260, 4.1],
  [280, 4.26],
  [300, 4.42],
  [350, 4.74],
  [400, 5.0],
  [450, 5.06],
  [500, 5.1],
  [550, 5.13],
];

// Bunker expected strokes (greenside bunker shots)
const EXPECTED_STROKES_BUNKER: Array<[number, number]> = [
  [5, 2.26],
  [10, 2.44],
  [12, 2.46],
  [14, 2.48],
  [16, 2.55],
  [18, 2.53],
  [20, 2.56],
  [22, 2.59],
  [24, 2.62],
  [26, 2.65],
  [28, 2.69],
  [30, 2.72],
  [40, 2.82],
  [50, 2.92],
  [60, 3.02],
  [80, 3.18],
  [100, 3.32],
  [150, 3.58],
  [200, 3.84],
  [300, 4.32],
  [400, 4.78],
  [500, 5.04],
  [550, 5.12],
];

// Recovery expected strokes (trees, deep rough, etc.)
const EXPECTED_STROKES_RECOVERY: Array<[number, number]> = [
  [10, 2.54],
  [20, 2.74],
  [30, 2.88],
  [50, 3.08],
  [75, 3.26],
  [100, 3.42],
  [150, 3.72],
  [200, 4.0],
  [250, 4.28],
  [300, 4.54],
  [400, 5.0],
  [500, 5.32],
  [550, 5.46],
];

// Tee expected strokes (par 3, 4, 5 tee shots)
const EXPECTED_STROKES_TEE: Array<[number, number]> = [
  [91, 2.92],
  [100, 2.95],
  [110, 2.99],
  [120, 2.98],
  [130, 2.97],
  [140, 2.98],
  [150, 3.0],
  [160, 3.02],
  [170, 3.06],
  [180, 3.1],
  [190, 3.14],
  [200, 3.2],
  [220, 3.3],
  [240, 3.42],
  [260, 3.54],
  [280, 3.66],
  [300, 3.78],
  [320, 3.88],
  [340, 3.96],
  [360, 4.02],
  [380, 4.08],
  [400, 4.14],
  [420, 4.22],
  [440, 4.32],
  [460, 4.44],
  [480, 4.58],
  [500, 4.72],
  [520, 4.82],
  [540, 4.88],
  [560, 4.9],
  [580, 4.91],
  [600, 4.92],
  [610, 4.926],
];

// ============================================================================
// SHORTGAME EXPECTED STROKES (≤30m with lie adjustment)
// More precise for around-the-green shots
// ============================================================================

interface ShortgameEntry {
  dist: number;
  expected: number;
  puttsLeft: number;
}

const SHORTGAME_FAIRWAY: ShortgameEntry[] = [
  { dist: 10, expected: 2.202, puttsLeft: 1.2 },
  { dist: 12, expected: 2.246, puttsLeft: 1.25 },
  { dist: 14, expected: 2.29, puttsLeft: 1.29 },
  { dist: 16, expected: 2.34, puttsLeft: 1.34 },
  { dist: 18, expected: 2.4, puttsLeft: 1.4 },
  { dist: 20, expected: 2.42, puttsLeft: 1.42 },
  { dist: 22, expected: 2.44, puttsLeft: 1.44 },
  { dist: 24, expected: 2.46, puttsLeft: 1.46 },
  { dist: 26, expected: 2.485, puttsLeft: 1.48 },
  { dist: 28, expected: 2.51, puttsLeft: 1.51 },
  { dist: 30, expected: 2.53, puttsLeft: 1.53 },
];

const SHORTGAME_BUNKER: ShortgameEntry[] = [
  { dist: 10, expected: 2.44, puttsLeft: 1.44 },
  { dist: 12, expected: 2.46, puttsLeft: 1.46 },
  { dist: 14, expected: 2.48, puttsLeft: 1.48 },
  { dist: 16, expected: 2.55, puttsLeft: 1.55 },
  { dist: 18, expected: 2.53, puttsLeft: 1.53 },
  { dist: 20, expected: 2.559, puttsLeft: 1.56 },
  { dist: 22, expected: 2.588, puttsLeft: 1.59 },
  { dist: 24, expected: 2.617, puttsLeft: 1.62 },
  { dist: 26, expected: 2.646, puttsLeft: 1.65 },
  { dist: 28, expected: 2.69, puttsLeft: 1.69 },
  { dist: 30, expected: 2.719, puttsLeft: 1.72 },
];

// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================

/**
 * Linear interpolation between two points
 */
function lerp(x: number, x1: number, y1: number, x2: number, y2: number): number {
  if (x2 === x1) return y1;
  return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
}

/**
 * Lookup expected strokes from a table with interpolation
 */
function lookupFromTable(distance: number, table: Array<[number, number]>): number {
  if (distance <= 0) return table[0][1];
  if (distance >= table[table.length - 1][0]) {
    return table[table.length - 1][1];
  }

  // Find bracketing entries
  for (let i = 0; i < table.length - 1; i++) {
    const [d1, e1] = table[i];
    const [d2, e2] = table[i + 1];
    if (distance <= d2) {
      // Linear interpolation
      return lerp(distance, d1, e1, d2, e2);
    }
  }

  return table[table.length - 1][1];
}

/**
 * Get expected putts from leave distance (meters)
 */
export function getExpectedPutts(leaveDistance: number): number {
  return lookupFromTable(leaveDistance, EXPECTED_PUTTS);
}

/**
 * Get expected strokes from start distance and lie
 */
export function getExpectedStrokes(distance: number, lie: LieType): number {
  // For putting (green), use expected putts directly
  if (lie === 'green') {
    return getExpectedPutts(distance);
  }

  // Select appropriate table based on lie
  let table: Array<[number, number]>;
  switch (lie) {
    case 'tee':
      table = EXPECTED_STROKES_TEE;
      break;
    case 'fairway':
      table = EXPECTED_STROKES_FAIRWAY;
      break;
    case 'rough':
      table = EXPECTED_STROKES_ROUGH;
      break;
    case 'bunker':
      table = EXPECTED_STROKES_BUNKER;
      break;
    case 'recovery':
      table = EXPECTED_STROKES_RECOVERY;
      break;
    default:
      table = EXPECTED_STROKES_FAIRWAY;
  }

  return lookupFromTable(distance, table);
}

/**
 * Get shortgame expected strokes (for around-the-green, ≤30m)
 */
export function getShortgameExpected(
  distance: number,
  lie: 'fairway' | 'bunker'
): { expected: number; puttsLeft: number } {
  const table = lie === 'bunker' ? SHORTGAME_BUNKER : SHORTGAME_FAIRWAY;

  // Clamp distance to table range
  const clampedDist = Math.max(10, Math.min(30, distance));

  // Find closest entries for interpolation
  for (let i = 0; i < table.length - 1; i++) {
    if (clampedDist <= table[i + 1].dist) {
      const t =
        (clampedDist - table[i].dist) / (table[i + 1].dist - table[i].dist);
      return {
        expected: table[i].expected + t * (table[i + 1].expected - table[i].expected),
        puttsLeft: table[i].puttsLeft + t * (table[i + 1].puttsLeft - table[i].puttsLeft),
      };
    }
  }

  return { expected: table[table.length - 1].expected, puttsLeft: table[table.length - 1].puttsLeft };
}

// ============================================================================
// MAIN CONVERSION FUNCTION
// ============================================================================

/**
 * Convert PEI test result to Strokes Gained
 *
 * @param input - PEI test input with start distance and PEI value
 * @returns Strokes gained result with breakdown
 *
 * @example
 * // Approach shot from 100m with PEI of 5 (leave = 5m from hole)
 * const result = convertPeiToStrokesGained({
 *   startDistance: 100,
 *   pei: 5,
 *   lie: 'fairway'
 * });
 * // result.strokesGained ≈ 0.15 (better than average)
 */
export function convertPeiToStrokesGained(input: PeiToSgInput): PeiToSgResult {
  const { startDistance, pei, lie = 'fairway' } = input;

  // Calculate leave distance from PEI
  // PEI = (leave / start) * 100, so leave = start * (pei / 100)
  // For approach tests, PEI typically represents the percentage of distance remaining
  const leaveDistance = startDistance * (pei / 100);

  // Determine category based on start distance
  let category: 'approach' | 'around_green' | 'putting';
  const effectiveLie = lie;

  if (lie === 'green') {
    category = 'putting';
  } else if (startDistance <= 30) {
    category = 'around_green';
  } else {
    category = 'approach';
  }

  // Get expected strokes BEFORE the shot (from start position)
  let expectedBefore: number;
  if (category === 'around_green' && (lie === 'fairway' || lie === 'bunker')) {
    expectedBefore = getShortgameExpected(startDistance, lie).expected;
  } else {
    expectedBefore = getExpectedStrokes(startDistance, effectiveLie);
  }

  // Get expected strokes AFTER the shot (from leave position = expected putts)
  const expectedAfter = getExpectedPutts(leaveDistance);

  // Calculate Strokes Gained
  // SG = (E_before - 1) - E_after
  // The -1 accounts for the shot taken
  const strokesGained = expectedBefore - 1 - expectedAfter;

  return {
    strokesGained: Math.round(strokesGained * 1000) / 1000, // Round to 3 decimals
    expectedBefore: Math.round(expectedBefore * 1000) / 1000,
    expectedAfter: Math.round(expectedAfter * 1000) / 1000,
    leaveDistance: Math.round(leaveDistance * 100) / 100,
    lie: effectiveLie,
    category,
  };
}

/**
 * Convert multiple PEI shots to aggregate Strokes Gained
 * Useful for batch test processing
 */
export function convertBatchPeiToStrokesGained(
  shots: Array<{ startDistance: number; pei: number; lie?: LieType }>
): BatchPeiResult {
  const results = shots.map((shot) => convertPeiToStrokesGained(shot));

  const totalSG = results.reduce((sum, r) => sum + r.strokesGained, 0);
  const avgSG = results.length > 0 ? totalSG / results.length : 0;

  // Determine overall category
  const categories = results.map((r) => r.category);
  const uniqueCategories = Array.from(new Set(categories));
  const category =
    uniqueCategories.length === 1 ? uniqueCategories[0] : 'mixed';

  return {
    shots: results,
    totalStrokesGained: Math.round(totalSG * 1000) / 1000,
    averageStrokesGained: Math.round(avgSG * 1000) / 1000,
    category,
  };
}

// ============================================================================
// IUP TEST SPECIFIC CONVERSIONS
// ============================================================================

/**
 * Convert IUP Approach test (8-11) PEI to Strokes Gained
 * Tests 8-11 are: 25m, 50m, 75m, 100m approach
 */
export function convertIupApproachTestToSG(
  testNumber: 8 | 9 | 10 | 11,
  peiValues: number[]
): BatchPeiResult {
  const distanceMap: Record<number, number> = {
    8: 25,
    9: 50,
    10: 75,
    11: 100,
  };

  const startDistance = distanceMap[testNumber];
  const shots = peiValues.map((pei) => ({
    startDistance,
    pei,
    lie: 'fairway' as LieType,
  }));

  return convertBatchPeiToStrokesGained(shots);
}

/**
 * Convert IUP Chipping test (17) to Strokes Gained Around Green
 */
export function convertIupChippingToSG(
  peiValues: number[],
  startDistance: number = 15,
  lie: 'fairway' | 'bunker' = 'fairway'
): BatchPeiResult {
  const shots = peiValues.map((pei) => ({
    startDistance,
    pei,
    lie: lie as LieType,
  }));

  return convertBatchPeiToStrokesGained(shots);
}

/**
 * Convert IUP Bunker test (18) to Strokes Gained Around Green
 */
export function convertIupBunkerToSG(
  peiValues: number[],
  startDistance: number = 15
): BatchPeiResult {
  const shots = peiValues.map((pei) => ({
    startDistance,
    pei,
    lie: 'bunker' as LieType,
  }));

  return convertBatchPeiToStrokesGained(shots);
}

/**
 * Convert IUP Putting test (15-16) success rate to Strokes Gained
 * Tests 15-16 are: 3m and 6m putting
 *
 * For putting, we calculate SG based on:
 * - Expected putts from start distance
 * - Actual outcome (made = 1 putt, missed = expected putts from leave)
 */
export function convertIupPuttingToSG(
  testNumber: 15 | 16,
  madeCount: number,
  totalAttempts: number,
  avgMissDistance: number = 0.5 // meters for missed putts
): { strokesGained: number; expectedMakeRate: number; actualMakeRate: number } {
  const distanceMap: Record<number, number> = {
    15: 3,
    16: 6,
  };

  const startDistance = distanceMap[testNumber];
  const expectedPuttsFromStart = getExpectedPutts(startDistance);
  const missedCount = totalAttempts - madeCount;

  // Expected putts for missed (made = 1 stroke)
  const expectedPuttsIfMissed = 1 + getExpectedPutts(avgMissDistance);

  // Actual strokes used
  const actualStrokes = madeCount * 1 + missedCount * expectedPuttsIfMissed;

  // Expected strokes if playing at tour average
  const expectedStrokes = totalAttempts * expectedPuttsFromStart;

  // Strokes Gained = expected - actual (positive = better than average)
  const strokesGained = expectedStrokes - actualStrokes;

  // Calculate make rates
  const expectedMakeRate = 1 - (expectedPuttsFromStart - 1); // Simplified approximation
  const actualMakeRate = madeCount / totalAttempts;

  return {
    strokesGained: Math.round(strokesGained * 1000) / 1000,
    expectedMakeRate: Math.round(expectedMakeRate * 100) / 100,
    actualMakeRate: Math.round(actualMakeRate * 100) / 100,
  };
}

// ============================================================================
// DATAGOLF COMPARISON HELPERS
// ============================================================================

/**
 * Calculate percentile vs tour average
 * Positive SG = above average, negative = below average
 *
 * Tour averages for SG components are typically:
 * - PGA Tour top players: +0.5 to +1.5 per category
 * - PGA Tour average: 0
 * - Below average: negative values
 */
export function calculateTourPercentile(
  strokesGained: number,
  category: 'approach' | 'around_green' | 'putting' | 'total'
): number {
  // Standard deviations for SG on PGA Tour (approximate)
  const stdDevMap: Record<string, number> = {
    approach: 0.4,
    around_green: 0.25,
    putting: 0.35,
    total: 0.8,
  };

  const stdDev = stdDevMap[category] || 0.5;

  // Convert SG to z-score (tour average = 0)
  const zScore = strokesGained / stdDev;

  // Convert z-score to percentile using approximation
  // Using error function approximation
  const percentile = 50 * (1 + erf(zScore / Math.sqrt(2)));

  return Math.round(Math.max(0, Math.min(100, percentile)));
}

/**
 * Error function approximation for percentile calculation
 */
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Get tour benchmark for a specific category
 */
export function getTourBenchmark(
  category: 'approach' | 'around_green' | 'putting' | 'total',
  level: 'pga_elite' | 'pga_average' | 'european' | 'amateur_scratch' | 'amateur_mid'
): number {
  const benchmarks: Record<string, Record<string, number>> = {
    approach: {
      pga_elite: 0.8,
      pga_average: 0.0,
      european: -0.1,
      amateur_scratch: -0.3,
      amateur_mid: -0.8,
    },
    around_green: {
      pga_elite: 0.5,
      pga_average: 0.0,
      european: -0.05,
      amateur_scratch: -0.2,
      amateur_mid: -0.5,
    },
    putting: {
      pga_elite: 0.6,
      pga_average: 0.0,
      european: -0.05,
      amateur_scratch: -0.15,
      amateur_mid: -0.4,
    },
    total: {
      pga_elite: 2.5,
      pga_average: 0.0,
      european: -0.2,
      amateur_scratch: -0.7,
      amateur_mid: -2.0,
    },
  };

  return benchmarks[category]?.[level] ?? 0;
}
