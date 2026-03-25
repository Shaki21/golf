/**
 * Peer Comparison Types
 * Based on SAMMENLIGNING_OG_ANALYTICS.md
 */

// ============================================================================
// PEER GROUP DEFINITION
// ============================================================================

export interface PeerCriteria {
  category?: string; // Same category
  gender?: string; // Same gender
  ageRange?: {
    min: number;
    max: number;
  };
  handicapRange?: {
    min: number;
    max: number;
  };
  customFilters?: Record<string, any>;
}

export interface PeerGroup {
  criteria: PeerCriteria;
  playerIds: string[];
  count: number;
}

// ============================================================================
// STATISTICAL METRICS
// ============================================================================

export interface StatisticalMetrics {
  count: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  q1: number; // 25th percentile
  q3: number; // 75th percentile
}

// ============================================================================
// PERCENTILE RANKING
// ============================================================================

export interface PercentileRanking {
  value: number;
  percentile: number; // 0-100
  rank: number; // 1-based ranking
  totalCount: number;
  zScore: number;
}

// ============================================================================
// PEER COMPARISON RESULT
// ============================================================================

export interface PeerComparisonResult {
  playerId: string;
  testNumber: number;
  testResultId: string;

  // Peer metrics
  peerCount: number;
  peerMean: number;
  peerMedian: number;
  peerStdDev: number;
  peerMin: number;
  peerMax: number;

  // Player metrics
  playerValue: number;
  playerPercentile: number;
  playerRank: number;
  playerZScore: number;

  // Context
  peerCriteria: PeerCriteria;
  comparisonText: string;
}

// ============================================================================
// MULTI-LEVEL COMPARISON (COACH VIEW)
// ============================================================================

export interface CategoryComparison {
  category: string;
  percentile: number;
  rank: number;
  totalInCategory: number;
  readinessScore: number; // 0-100, how ready for this category
}

export interface MultiLevelComparison {
  playerId: string;
  playerCategory: string;
  testNumber: number;
  playerValue: number;

  // Comparison across all categories
  byCategory: Record<string, CategoryComparison>;

  // Progression outlook
  nextCategoryReadiness: number; // 0-100
  previousCategoryPerformance: number; // 0-100

  // Overall positioning
  overallPercentile: number; // Across all players
  categoryStrengthScore: number; // How strong in current category
}
