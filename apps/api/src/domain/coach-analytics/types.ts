/**
 * Coach Analytics Types
 * Based on SAMMENLIGNING_OG_ANALYTICS.md
 */

// ============================================================================
// PLAYER OVERVIEW
// ============================================================================

export interface PlayerTestSummary {
  testNumber: number;
  testName: string;
  latestResult?: {
    value: number;
    passed: boolean;
    date: Date;
    percentile?: number;
  };
  previousResult?: {
    value: number;
    date: Date;
  };
  trend: 'improving' | 'declining' | 'stable' | 'no_data';
  percentChange?: number;
}

export interface PlayerOverview {
  playerId: string;
  playerName: string;
  category: string;
  gender: string;
  age: number;
  handicap?: number;

  // Test completion
  testsCompleted: number;
  totalTests: number;
  completionPercentage: number;

  // Performance metrics
  testsPassed: number;
  testsFailed: number;
  passRate: number;

  // Summary by test
  testSummaries: PlayerTestSummary[];

  // Overall metrics
  overallPercentile?: number;
  categoryReadiness: number; // 0-100
  strengthAreas: number[]; // Test numbers where player excels
  weaknessAreas: number[]; // Test numbers needing improvement
}

// ============================================================================
// CATEGORY PROGRESSION
// ============================================================================

export interface CategoryProgressionRequirement {
  testNumber: number;
  testName: string;
  requirement: number;
  currentValue?: number;
  passed: boolean;
  gap?: number; // Difference from requirement
  gapPercentage?: number;
}

export interface CategoryProgression {
  playerId: string;
  currentCategory: string;
  nextCategory: string;

  // Requirements for next category
  requirements: CategoryProgressionRequirement[];

  // Overall readiness
  testsPassedForNext: number;
  totalRequiredTests: number;
  overallReadiness: number; // 0-100

  // Estimated timeline
  estimatedMonthsToNext?: number;
  recentTrend: 'on_track' | 'needs_attention' | 'excellent';
}

// ============================================================================
// MULTI-PLAYER COMPARISON
// ============================================================================

export interface PlayerComparisonRow {
  playerId: string;
  playerName: string;
  category: string;
  testResults: Record<number, {
    value: number;
    passed: boolean;
    percentile?: number;
  }>;
  overallScore: number; // Composite score across all tests
  rank: number; // Ranking among compared players
}

export interface MultiPlayerComparison {
  testNumbers: number[];
  players: PlayerComparisonRow[];
  filters: {
    categories?: string[];
    gender?: string;
    ageRange?: { min: number; max: number };
  };
}

// ============================================================================
// TEAM ANALYTICS
// ============================================================================

export interface TeamTestStatistics {
  testNumber: number;
  testName: string;
  playersCompleted: number;
  totalPlayers: number;
  passRate: number;
  averageValue: number;
  medianValue: number;
  bestPerformer: {
    playerId: string;
    playerName: string;
    value: number;
  };
  needsImprovement: string[]; // Player IDs
}

export interface TeamAnalytics {
  coachId: string;
  totalPlayers: number;
  playersByCategory: Record<string, number>;

  // Overall test completion
  overallCompletionRate: number;
  testsCompletedTotal: number;
  testsPossibleTotal: number;

  // Per-test statistics
  testStatistics: TeamTestStatistics[];

  // Trends
  recentActivityCount: number; // Tests completed in last 30 days
  monthlyTrend: 'increasing' | 'decreasing' | 'stable';
}

// ============================================================================
// SAVED FILTERS
// ============================================================================

export interface SavedFilter {
  id: string;
  coachId: string;
  name: string;
  description?: string;

  filters: {
    categories?: string[];
    gender?: string;
    ageRange?: { min: number; max: number };
    handicapRange?: { min: number; max: number };
    testNumbers?: number[];
    dateRange?: { from: Date; to: Date };
  };

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ANALYTICS DASHBOARD DATA
// ============================================================================

export interface CoachDashboard {
  coach: {
    id: string;
    name: string;
  };

  // Summary cards
  summary: {
    totalPlayers: number;
    activePlayersLast30Days: number;
    totalTestsCompleted: number;
    averageCompletionRate: number;
  };

  // Team analytics
  teamAnalytics: TeamAnalytics;

  // Recent activity
  recentTests: Array<{
    playerId: string;
    playerName: string;
    testNumber: number;
    testName: string;
    value: number;
    passed: boolean;
    date: Date;
  }>;

  // Alerts and notifications
  alerts: Array<{
    type: 'category_ready' | 'test_overdue' | 'declining_performance';
    playerId: string;
    playerName: string;
    message: string;
    severity: 'info' | 'warning' | 'urgent';
  }>;
}
