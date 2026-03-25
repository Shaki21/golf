/**
 * Peer Comparison Service
 * Based on SAMMENLIGNING_OG_ANALYTICS.md
 */

import type {
  PeerCriteria,
  // PeerGroup,
  StatisticalMetrics,
  PercentileRanking,
  PeerComparisonResult,
  CategoryComparison,
  MultiLevelComparison,
} from './types';

// ============================================================================
// STATISTICAL FUNCTIONS
// ============================================================================

/**
 * Calculate mean (average)
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate median
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[], mean?: number): number {
  if (values.length === 0) return 0;
  const avg = mean ?? calculateMean(values);
  const squaredDiffs = values.map((val) => Math.pow(val - avg, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Calculate z-score (standard score)
 * z = (x - μ) / σ
 */
function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Get quartile value
 */
function getQuartile(values: number[], quartile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * quartile;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

/**
 * Calculate complete statistical metrics
 */
export function calculateStatistics(values: number[]): StatisticalMetrics {
  if (values.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      q1: 0,
      q3: 0,
    };
  }

  const mean = calculateMean(values);
  const median = calculateMedian(values);
  const stdDev = calculateStdDev(values, mean);
  const sorted = [...values].sort((a, b) => a - b);

  return {
    count: values.length,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    q1: getQuartile(values, 0.25),
    q3: getQuartile(values, 0.75),
  };
}

// ============================================================================
// PERCENTILE RANKING
// ============================================================================

/**
 * Calculate percentile ranking for a player's value
 *
 * @param playerValue - Player's test value
 * @param peerValues - Array of peer values
 * @param lowerIsBetter - True for tests where lower values are better (e.g., PEI, score to par)
 */
export function calculatePercentileRank(
  playerValue: number,
  peerValues: number[],
  lowerIsBetter: boolean = false
): PercentileRanking {
  if (peerValues.length === 0) {
    return {
      value: playerValue,
      percentile: 0,
      rank: 1,
      totalCount: 1,
      zScore: 0,
    };
  }

  const allValues = [...peerValues, playerValue];
  const sorted = [...allValues].sort((a, b) => a - b);

  // Find player's rank
  const rank = sorted.indexOf(playerValue) + 1;

  // Calculate percentile
  let percentile = (rank / sorted.length) * 100;

  // Invert percentile for "lower is better" tests
  if (lowerIsBetter) {
    percentile = 100 - percentile;
  }

  // Calculate z-score
  const stats = calculateStatistics(peerValues);
  const zScore = calculateZScore(playerValue, stats.mean, stats.stdDev);

  return {
    value: playerValue,
    percentile: Math.round(percentile * 10) / 10,
    rank,
    totalCount: allValues.length,
    zScore: Math.round(zScore * 1000) / 1000,
  };
}

// ============================================================================
// COMPARISON TEXT GENERATION
// ============================================================================

/**
 * Generate human-readable comparison text
 */
export function generateComparisonText(
  percentile: number,
  peerCount: number,
  _testNumber: number
): string {
  if (percentile >= 90) {
    return `Excellent! Top ${100 - Math.round(percentile)}% among ${peerCount} peers`;
  } else if (percentile >= 75) {
    return `Very good! Top ${100 - Math.round(percentile)}% among ${peerCount} peers`;
  } else if (percentile >= 60) {
    return `Above average among ${peerCount} peers (${Math.round(percentile)}th percentile)`;
  } else if (percentile >= 40) {
    return `Average performance among ${peerCount} peers`;
  } else if (percentile >= 25) {
    return `Below average - room for improvement (${Math.round(percentile)}th percentile)`;
  } else {
    return `Needs attention - focus area for training (${Math.round(percentile)}th percentile)`;
  }
}

// ============================================================================
// PEER COMPARISON CALCULATION
// ============================================================================

/**
 * Calculate peer comparison for a player's test result
 *
 * @param playerId - Player ID
 * @param testNumber - Test number (1-20)
 * @param testResultId - Test result ID
 * @param playerValue - Player's test value
 * @param peerValues - Array of peer values
 * @param peerCriteria - Criteria used to select peers
 * @param lowerIsBetter - True for tests where lower is better
 */
export function calculatePeerComparison(
  playerId: string,
  testNumber: number,
  testResultId: string,
  playerValue: number,
  peerValues: number[],
  peerCriteria: PeerCriteria,
  lowerIsBetter: boolean = false
): PeerComparisonResult {
  // Calculate statistics for peer group
  const stats = calculateStatistics(peerValues);

  // Calculate percentile ranking
  const ranking = calculatePercentileRank(playerValue, peerValues, lowerIsBetter);

  // Generate comparison text
  const comparisonText = generateComparisonText(
    ranking.percentile,
    peerValues.length,
    testNumber
  );

  return {
    playerId,
    testNumber,
    testResultId,

    // Peer metrics
    peerCount: stats.count,
    peerMean: stats.mean,
    peerMedian: stats.median,
    peerStdDev: stats.stdDev,
    peerMin: stats.min,
    peerMax: stats.max,

    // Player metrics
    playerValue,
    playerPercentile: ranking.percentile,
    playerRank: ranking.rank,
    playerZScore: ranking.zScore,

    // Context
    peerCriteria,
    comparisonText,
  };
}

// ============================================================================
// MULTI-LEVEL COMPARISON (COACH VIEW)
// ============================================================================

/**
 * Calculate category readiness score
 * Based on how close player is to the requirement
 *
 * @param playerValue - Player's test value
 * @param requirement - Category requirement value
 * @param higherIsBetter - True for tests where higher is better
 */
function calculateReadinessScore(
  playerValue: number,
  requirement: number,
  higherIsBetter: boolean = true
): number {
  let score: number;

  if (higherIsBetter) {
    score = (playerValue / requirement) * 100;
  } else {
    score = (requirement / playerValue) * 100;
  }

  // Cap at 100
  return Math.min(Math.round(score), 100);
}

/**
 * Compare player across all category levels
 * Used by coaches to see where player stands relative to all categories
 *
 * @param playerId - Player ID
 * @param playerCategory - Player's current category
 * @param testNumber - Test number (1-20)
 * @param playerValue - Player's test value
 * @param valuesByCategory - Test values grouped by category { [category]: values[] }
 * @param requirementsByCategory - Requirements by category { [category]: requirement }
 * @param lowerIsBetter - True for tests where lower is better
 */
export function calculateMultiLevelComparison(
  playerId: string,
  playerCategory: string,
  testNumber: number,
  playerValue: number,
  valuesByCategory: Record<string, number[]>,
  requirementsByCategory: Record<string, number>,
  lowerIsBetter: boolean = false
): MultiLevelComparison {
  const categories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  const byCategory: Record<string, CategoryComparison> = {};

  // Calculate comparison for each category
  for (const category of categories) {
    const categoryValues = valuesByCategory[category] || [];
    if (categoryValues.length === 0) continue;

    const ranking = calculatePercentileRank(
      playerValue,
      categoryValues,
      lowerIsBetter
    );

    const requirement = requirementsByCategory[category] || 0;
    const readinessScore = calculateReadinessScore(
      playerValue,
      requirement,
      !lowerIsBetter
    );

    byCategory[category] = {
      category,
      percentile: ranking.percentile,
      rank: ranking.rank,
      totalInCategory: categoryValues.length,
      readinessScore,
    };
  }

  // Calculate progression metrics
  const currentCategoryIndex = categories.indexOf(playerCategory);
  const nextCategory = categories[currentCategoryIndex - 1]; // A is higher than B
  const previousCategory = categories[currentCategoryIndex + 1];

  const nextCategoryReadiness = nextCategory
    ? byCategory[nextCategory]?.readinessScore || 0
    : 100;

  const previousCategoryPerformance = previousCategory
    ? byCategory[previousCategory]?.readinessScore || 0
    : 100;

  // Calculate overall metrics
  const allValues = Object.values(valuesByCategory).flat();
  const overallRanking = calculatePercentileRank(
    playerValue,
    allValues,
    lowerIsBetter
  );

  const currentCategoryStats = byCategory[playerCategory];
  const categoryStrengthScore = currentCategoryStats?.readinessScore || 0;

  return {
    playerId,
    playerCategory,
    testNumber,
    playerValue,
    byCategory,
    nextCategoryReadiness,
    previousCategoryPerformance,
    overallPercentile: overallRanking.percentile,
    categoryStrengthScore,
  };
}

// ============================================================================
// PEER GROUP FILTERING
// ============================================================================

/**
 * Check if a player matches the peer criteria
 */
export function matchesPeerCriteria(
  player: {
    id: string;
    category: string;
    gender: string;
    dateOfBirth: Date;
    handicap?: number | null;
  },
  criteria: PeerCriteria,
  excludePlayerId?: string
): boolean {
  // Exclude the player themselves
  if (excludePlayerId && player.id === excludePlayerId) {
    return false;
  }

  // Check category
  if (criteria.category && player.category !== criteria.category) {
    return false;
  }

  // Check gender
  if (criteria.gender && player.gender !== criteria.gender) {
    return false;
  }

  // Check age range
  if (criteria.ageRange) {
    const age = new Date().getFullYear() - player.dateOfBirth.getFullYear();
    if (age < criteria.ageRange.min || age > criteria.ageRange.max) {
      return false;
    }
  }

  // Check handicap range
  if (criteria.handicapRange && player.handicap !== null) {
    const handicap = player.handicap || 0;
    if (
      handicap < criteria.handicapRange.min ||
      handicap > criteria.handicapRange.max
    ) {
      return false;
    }
  }

  return true;
}
