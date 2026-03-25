/**
 * Strokes Gained Category Benchmarks
 *
 * Defines performance requirements for each player category (K through A)
 * based on Strokes Gained (SG) metrics from Data Golf.
 *
 * Values are estimated based on professional tour data and amateur benchmarks:
 * - PGA Tour Average: ~0.0 SG across all categories
 * - PGA Tour Elite (Top 10%): +1.5 to +2.0 SG Total
 * - Amateur Mid-handicap (15-20): -2.0 to -3.0 SG Total
 * - Amateur High-handicap (25+): -4.0 to -5.0 SG Total
 */

export interface CategorySGBenchmark {
  category: string;
  label: string;
  handicapRange: [number, number];
  averageScore: number;
  sgBenchmarks: {
    sgTotal: number;
    sgTee: number;
    sgApproach: number;
    sgApproach200Plus: number;
    sgApproach150to200: number;
    sgApproach100to150: number;
    sgApproachUnder100: number;
    sgAroundGreen: number;
    sgPutting: number;
  };
  testRequirements: {
    // Approach tests (distance-based PEI requirements)
    approach25m: number; // Max PEI value (lower is better)
    approach50m: number;
    approach75m: number;
    approach100m: number;
    // Short game tests
    chipping: number; // Max PEI value
    bunker: number; // Max PEI value
    // Putting tests
    putting3m: number; // Min make percentage
    putting6m: number; // Min make percentage
  };
  roundsRequired: number;
}

/**
 * Category benchmarks from K (beginner) to A (elite)
 *
 * Estimation methodology:
 * - K-H: High handicappers (25-54 HCP) → -4.0 to -6.0 SG Total
 * - G-E: Mid handicappers (15-25 HCP) → -2.5 to -3.5 SG Total
 * - D-C: Low handicappers (8-15 HCP) → -1.5 to -2.5 SG Total
 * - B: Single digit handicap (5-8 HCP) → -1.0 to -1.5 SG Total
 * - A: Scratch/plus handicap (0-5 HCP) → -0.5 to +0.5 SG Total
 */
export const CATEGORY_SG_BENCHMARKS: CategorySGBenchmark[] = [
  {
    category: 'K',
    label: 'Nybegynner',
    handicapRange: [45, 54],
    averageScore: 125,
    sgBenchmarks: {
      sgTotal: -6.0,
      sgTee: -1.5,
      sgApproach: -2.5,
      sgApproach200Plus: -1.0,
      sgApproach150to200: -0.8,
      sgApproach100to150: -0.5,
      sgApproachUnder100: -0.2,
      sgAroundGreen: -1.5,
      sgPutting: -0.5,
    },
    testRequirements: {
      approach25m: 85, // Very high PEI acceptable
      approach50m: 90,
      approach75m: 95,
      approach100m: 100,
      chipping: 90,
      bunker: 95,
      putting3m: 40, // 40% make rate
      putting6m: 15, // 15% make rate
    },
    roundsRequired: 5,
  },
  {
    category: 'J',
    label: 'Grunnleggende',
    handicapRange: [37, 44],
    averageScore: 115,
    sgBenchmarks: {
      sgTotal: -5.0,
      sgTee: -1.3,
      sgApproach: -2.0,
      sgApproach200Plus: -0.8,
      sgApproach150to200: -0.7,
      sgApproach100to150: -0.4,
      sgApproachUnder100: -0.1,
      sgAroundGreen: -1.2,
      sgPutting: -0.5,
    },
    testRequirements: {
      approach25m: 75,
      approach50m: 80,
      approach75m: 85,
      approach100m: 90,
      chipping: 80,
      bunker: 85,
      putting3m: 50,
      putting6m: 20,
    },
    roundsRequired: 6,
  },
  {
    category: 'I',
    label: 'Utviklende',
    handicapRange: [30, 36],
    averageScore: 108,
    sgBenchmarks: {
      sgTotal: -4.0,
      sgTee: -1.0,
      sgApproach: -1.7,
      sgApproach200Plus: -0.7,
      sgApproach150to200: -0.6,
      sgApproach100to150: -0.3,
      sgApproachUnder100: -0.1,
      sgAroundGreen: -0.9,
      sgPutting: -0.4,
    },
    testRequirements: {
      approach25m: 65,
      approach50m: 70,
      approach75m: 75,
      approach100m: 80,
      chipping: 70,
      bunker: 75,
      putting3m: 60,
      putting6m: 25,
    },
    roundsRequired: 7,
  },
  {
    category: 'H',
    label: 'Fremskritt',
    handicapRange: [25, 29],
    averageScore: 103,
    sgBenchmarks: {
      sgTotal: -3.5,
      sgTee: -0.9,
      sgApproach: -1.5,
      sgApproach200Plus: -0.6,
      sgApproach150to200: -0.5,
      sgApproach100to150: -0.3,
      sgApproachUnder100: -0.1,
      sgAroundGreen: -0.8,
      sgPutting: -0.3,
    },
    testRequirements: {
      approach25m: 55,
      approach50m: 60,
      approach75m: 65,
      approach100m: 70,
      chipping: 60,
      bunker: 65,
      putting3m: 65,
      putting6m: 30,
    },
    roundsRequired: 8,
  },
  {
    category: 'G',
    label: 'Mellomnivå',
    handicapRange: [20, 24],
    averageScore: 98,
    sgBenchmarks: {
      sgTotal: -3.0,
      sgTee: -0.8,
      sgApproach: -1.3,
      sgApproach200Plus: -0.5,
      sgApproach150to200: -0.4,
      sgApproach100to150: -0.3,
      sgApproachUnder100: -0.1,
      sgAroundGreen: -0.6,
      sgPutting: -0.3,
    },
    testRequirements: {
      approach25m: 45,
      approach50m: 50,
      approach75m: 55,
      approach100m: 60,
      chipping: 50,
      bunker: 55,
      putting3m: 70,
      putting6m: 35,
    },
    roundsRequired: 9,
  },
  {
    category: 'F',
    label: 'Kompetent',
    handicapRange: [15, 19],
    averageScore: 93,
    sgBenchmarks: {
      sgTotal: -2.5,
      sgTee: -0.7,
      sgApproach: -1.1,
      sgApproach200Plus: -0.4,
      sgApproach150to200: -0.4,
      sgApproach100to150: -0.2,
      sgApproachUnder100: -0.1,
      sgAroundGreen: -0.5,
      sgPutting: -0.2,
    },
    testRequirements: {
      approach25m: 38,
      approach50m: 43,
      approach75m: 48,
      approach100m: 53,
      chipping: 43,
      bunker: 48,
      putting3m: 75,
      putting6m: 40,
    },
    roundsRequired: 10,
  },
  {
    category: 'E',
    label: 'Avansert',
    handicapRange: [12, 14],
    averageScore: 90,
    sgBenchmarks: {
      sgTotal: -2.0,
      sgTee: -0.6,
      sgApproach: -0.9,
      sgApproach200Plus: -0.3,
      sgApproach150to200: -0.3,
      sgApproach100to150: -0.2,
      sgApproachUnder100: -0.1,
      sgAroundGreen: -0.4,
      sgPutting: -0.1,
    },
    testRequirements: {
      approach25m: 32,
      approach50m: 37,
      approach75m: 42,
      approach100m: 47,
      chipping: 37,
      bunker: 42,
      putting3m: 78,
      putting6m: 45,
    },
    roundsRequired: 10,
  },
  {
    category: 'D',
    label: 'Dyktig',
    handicapRange: [9, 11],
    averageScore: 87,
    sgBenchmarks: {
      sgTotal: -1.7,
      sgTee: -0.5,
      sgApproach: -0.7,
      sgApproach200Plus: -0.3,
      sgApproach150to200: -0.2,
      sgApproach100to150: -0.1,
      sgApproachUnder100: -0.1,
      sgAroundGreen: -0.3,
      sgPutting: -0.2,
    },
    testRequirements: {
      approach25m: 28,
      approach50m: 33,
      approach75m: 38,
      approach100m: 43,
      chipping: 33,
      bunker: 38,
      putting3m: 80,
      putting6m: 50,
    },
    roundsRequired: 12,
  },
  {
    category: 'C',
    label: 'Meget dyktig',
    handicapRange: [6, 8],
    averageScore: 84,
    sgBenchmarks: {
      sgTotal: -1.3,
      sgTee: -0.4,
      sgApproach: -0.5,
      sgApproach200Plus: -0.2,
      sgApproach150to200: -0.2,
      sgApproach100to150: -0.1,
      sgApproachUnder100: 0.0,
      sgAroundGreen: -0.2,
      sgPutting: -0.2,
    },
    testRequirements: {
      approach25m: 24,
      approach50m: 29,
      approach75m: 34,
      approach100m: 39,
      chipping: 29,
      bunker: 34,
      putting3m: 82,
      putting6m: 55,
    },
    roundsRequired: 12,
  },
  {
    category: 'B',
    label: 'Expert',
    handicapRange: [3, 5],
    averageScore: 81,
    sgBenchmarks: {
      sgTotal: -0.8,
      sgTee: -0.3,
      sgApproach: -0.3,
      sgApproach200Plus: -0.1,
      sgApproach150to200: -0.1,
      sgApproach100to150: -0.1,
      sgApproachUnder100: 0.0,
      sgAroundGreen: -0.1,
      sgPutting: -0.1,
    },
    testRequirements: {
      approach25m: 20,
      approach50m: 25,
      approach75m: 30,
      approach100m: 35,
      chipping: 25,
      bunker: 30,
      putting3m: 85,
      putting6m: 60,
    },
    roundsRequired: 15,
  },
  {
    category: 'A',
    label: 'Elite',
    handicapRange: [0, 2],
    averageScore: 78,
    sgBenchmarks: {
      sgTotal: -0.3,
      sgTee: -0.1,
      sgApproach: -0.1,
      sgApproach200Plus: 0.0,
      sgApproach150to200: 0.0,
      sgApproach100to150: -0.1,
      sgApproachUnder100: 0.0,
      sgAroundGreen: 0.0,
      sgPutting: -0.1,
    },
    testRequirements: {
      approach25m: 15,
      approach50m: 20,
      approach75m: 25,
      approach100m: 30,
      chipping: 20,
      bunker: 25,
      putting3m: 88,
      putting6m: 65,
    },
    roundsRequired: 18,
  },
];

/**
 * Get category benchmark by category level
 */
export const getCategoryBenchmark = (category: string): CategorySGBenchmark | undefined => {
  return CATEGORY_SG_BENCHMARKS.find(b => b.category === category);
};

/**
 * Get category by handicap
 */
export const getCategoryByHandicap = (handicap: number): CategorySGBenchmark | undefined => {
  return CATEGORY_SG_BENCHMARKS.find(
    b => handicap >= b.handicapRange[0] && handicap <= b.handicapRange[1]
  );
};

/**
 * Get next category level
 */
export const getNextCategory = (currentCategory: string): CategorySGBenchmark | undefined => {
  const currentIndex = CATEGORY_SG_BENCHMARKS.findIndex(b => b.category === currentCategory);
  if (currentIndex === -1 || currentIndex === CATEGORY_SG_BENCHMARKS.length - 1) return undefined;
  return CATEGORY_SG_BENCHMARKS[currentIndex + 1];
};

/**
 * Calculate if player meets category requirements
 */
export interface CategoryRequirementCheck {
  category: string;
  meetsRequirements: boolean;
  sgChecks: {
    sgTotal: boolean;
    sgTee: boolean;
    sgApproach: boolean;
    sgAroundGreen: boolean;
    sgPutting: boolean;
  };
  testChecks: {
    approach25m: boolean;
    approach50m: boolean;
    approach75m: boolean;
    approach100m: boolean;
    chipping: boolean;
    bunker: boolean;
    putting3m: boolean;
    putting6m: boolean;
  };
  roundsCheck: boolean;
  handicapCheck: boolean;
}

export default {
  CATEGORY_SG_BENCHMARKS,
  getCategoryBenchmark,
  getCategoryByHandicap,
  getNextCategory,
};
