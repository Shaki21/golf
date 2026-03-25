/**
 * Coach Analytics Service
 * Based on SAMMENLIGNING_OG_ANALYTICS.md
 */

import type {
  PlayerTestSummary,
  PlayerOverview,
  CategoryProgressionRequirement,
  CategoryProgression,
  PlayerComparisonRow,
  MultiPlayerComparison,
  TeamTestStatistics,
  TeamAnalytics,
  // CoachDashboard,
} from './types';

// ============================================================================
// TREND ANALYSIS
// ============================================================================

/**
 * Determine trend between two test results
 */
export function analyzeTrend(
  current: number,
  previous: number | undefined,
  higherIsBetter: boolean = true
): {
  trend: 'improving' | 'declining' | 'stable' | 'no_data';
  percentChange?: number;
} {
  if (previous === undefined) {
    return { trend: 'no_data' };
  }

  const change = current - previous;
  const percentChange = (change / previous) * 100;

  // Determine threshold for "stable" (within 5%)
  const isStable = Math.abs(percentChange) < 5;

  if (isStable) {
    return { trend: 'stable', percentChange };
  }

  const isImproving = higherIsBetter ? change > 0 : change < 0;

  return {
    trend: isImproving ? 'improving' : 'declining',
    percentChange,
  };
}

// ============================================================================
// PLAYER OVERVIEW
// ============================================================================

/**
 * Calculate player overview with test summaries
 */
export function calculatePlayerOverview(
  player: {
    id: string;
    firstName: string;
    lastName: string;
    category: string;
    gender: string;
    dateOfBirth: Date;
    handicap?: number | null;
  },
  testResults: Array<{
    testNumber: number;
    testName: string;
    value: number;
    passed: boolean;
    date: Date;
    percentile?: number;
  }>,
  testMetadata: Array<{
    testNumber: number;
    higherIsBetter: boolean;
  }>
): PlayerOverview {
  const age = new Date().getFullYear() - player.dateOfBirth.getFullYear();
  const totalTests = 20;

  // Group results by test number
  const resultsByTest = new Map<number, typeof testResults>();
  testResults.forEach((result) => {
    const existing = resultsByTest.get(result.testNumber) || [];
    existing.push(result);
    resultsByTest.set(result.testNumber, existing);
  });

  // Create test summaries
  const testSummaries: PlayerTestSummary[] = [];
  let testsPassed = 0;
  let testsFailed = 0;

  for (let testNum = 1; testNum <= totalTests; testNum++) {
    const results = resultsByTest.get(testNum) || [];
    if (results.length === 0) {
      testSummaries.push({
        testNumber: testNum,
        testName: `Test ${testNum}`,
        trend: 'no_data',
      });
      continue;
    }

    // Sort by date descending
    results.sort((a, b) => b.date.getTime() - a.date.getTime());
    const latest = results[0];
    const previous = results[1];

    if (latest.passed) testsPassed++;
    else testsFailed++;

    const metadata = testMetadata.find((m) => m.testNumber === testNum);
    const higherIsBetter = metadata?.higherIsBetter ?? true;

    const trendAnalysis = analyzeTrend(
      latest.value,
      previous?.value,
      higherIsBetter
    );

    testSummaries.push({
      testNumber: testNum,
      testName: latest.testName,
      latestResult: {
        value: latest.value,
        passed: latest.passed,
        date: latest.date,
        percentile: latest.percentile,
      },
      previousResult: previous
        ? {
            value: previous.value,
            date: previous.date,
          }
        : undefined,
      trend: trendAnalysis.trend,
      percentChange: trendAnalysis.percentChange,
    });
  }

  const testsCompleted = resultsByTest.size;
  const completionPercentage = Math.round((testsCompleted / totalTests) * 100);
  const passRate =
    testsPassed + testsFailed > 0
      ? Math.round((testsPassed / (testsPassed + testsFailed)) * 100)
      : 0;

  // Identify strengths (top 25%) and weaknesses (bottom 25%)
  const testsWithPercentile = testSummaries.filter(
    (t) => t.latestResult?.percentile !== undefined
  );
  testsWithPercentile.sort(
    (a, b) => (b.latestResult?.percentile || 0) - (a.latestResult?.percentile || 0)
  );

  const strengthCount = Math.ceil(testsWithPercentile.length * 0.25);
  const weaknessCount = Math.ceil(testsWithPercentile.length * 0.25);

  const strengthAreas = testsWithPercentile
    .slice(0, strengthCount)
    .filter((t) => (t.latestResult?.percentile || 0) >= 75)
    .map((t) => t.testNumber);

  const weaknessAreas = testsWithPercentile
    .slice(-weaknessCount)
    .filter((t) => (t.latestResult?.percentile || 0) < 40)
    .map((t) => t.testNumber);

  // Calculate overall percentile (average across all completed tests)
  const percentiles = testSummaries
    .map((t) => t.latestResult?.percentile)
    .filter((p) => p !== undefined) as number[];
  const overallPercentile =
    percentiles.length > 0
      ? Math.round(
          percentiles.reduce((sum, p) => sum + p, 0) / percentiles.length
        )
      : undefined;

  return {
    playerId: player.id,
    playerName: `${player.firstName} ${player.lastName}`,
    category: player.category,
    gender: player.gender,
    age,
    handicap: player.handicap || undefined,

    testsCompleted,
    totalTests,
    completionPercentage,

    testsPassed,
    testsFailed,
    passRate,

    testSummaries,

    overallPercentile,
    categoryReadiness: passRate, // Simplified - could be more sophisticated
    strengthAreas,
    weaknessAreas,
  };
}

// ============================================================================
// CATEGORY PROGRESSION
// ============================================================================

/**
 * Calculate category progression analysis
 */
export function calculateCategoryProgression(
  player: {
    id: string;
    category: string;
  },
  currentResults: Array<{
    testNumber: number;
    testName: string;
    value: number;
    passed: boolean;
  }>,
  nextCategoryRequirements: Array<{
    testNumber: number;
    testName: string;
    requirement: number;
    unit: string;
    higherIsBetter: boolean;
  }>
): CategoryProgression {
  const categories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  const currentIndex = categories.indexOf(player.category);
  const nextCategory = currentIndex > 0 ? categories[currentIndex - 1] : 'A';

  // Map current results
  const resultMap = new Map(
    currentResults.map((r) => [r.testNumber, r])
  );

  // Calculate requirements
  const requirements: CategoryProgressionRequirement[] =
    nextCategoryRequirements.map((req) => {
      const currentResult = resultMap.get(req.testNumber);
      const currentValue = currentResult?.value;
      const passed = currentValue !== undefined
        ? req.higherIsBetter
          ? currentValue >= req.requirement
          : currentValue <= req.requirement
        : false;

      let gap: number | undefined;
      let gapPercentage: number | undefined;

      if (currentValue !== undefined) {
        gap = req.higherIsBetter
          ? req.requirement - currentValue
          : currentValue - req.requirement;

        gapPercentage = Math.round((gap / req.requirement) * 100);
      }

      return {
        testNumber: req.testNumber,
        testName: req.testName,
        requirement: req.requirement,
        currentValue,
        passed,
        gap,
        gapPercentage,
      };
    });

  const testsPassedForNext = requirements.filter((r) => r.passed).length;
  const totalRequiredTests = requirements.length;
  const overallReadiness = Math.round(
    (testsPassedForNext / totalRequiredTests) * 100
  );

  // Determine trend
  let recentTrend: 'on_track' | 'needs_attention' | 'excellent';
  if (overallReadiness >= 80) {
    recentTrend = 'excellent';
  } else if (overallReadiness >= 50) {
    recentTrend = 'on_track';
  } else {
    recentTrend = 'needs_attention';
  }

  return {
    playerId: player.id,
    currentCategory: player.category,
    nextCategory,
    requirements,
    testsPassedForNext,
    totalRequiredTests,
    overallReadiness,
    recentTrend,
  };
}

// ============================================================================
// MULTI-PLAYER COMPARISON
// ============================================================================

/**
 * Compare multiple players across selected tests
 */
export function compareMultiplePlayers(
  players: Array<{
    id: string;
    firstName: string;
    lastName: string;
    category: string;
  }>,
  testResults: Array<{
    playerId: string;
    testNumber: number;
    value: number;
    passed: boolean;
    percentile?: number;
  }>,
  testNumbers: number[]
): MultiPlayerComparison {
  // Group results by player
  const resultsByPlayer = new Map<string, typeof testResults>();
  testResults.forEach((result) => {
    const existing = resultsByPlayer.get(result.playerId) || [];
    existing.push(result);
    resultsByPlayer.set(result.playerId, existing);
  });

  // Create comparison rows
  const comparisonRows: PlayerComparisonRow[] = players.map((player) => {
    const results = resultsByPlayer.get(player.id) || [];
    const testResultsMap: Record<number, any> = {};

    testNumbers.forEach((testNum) => {
      const result = results.find((r) => r.testNumber === testNum);
      if (result) {
        testResultsMap[testNum] = {
          value: result.value,
          passed: result.passed,
          percentile: result.percentile,
        };
      }
    });

    // Calculate overall score (average percentile)
    const percentiles = Object.values(testResultsMap)
      .map((r) => r.percentile)
      .filter((p) => p !== undefined) as number[];

    const overallScore =
      percentiles.length > 0
        ? Math.round(
            percentiles.reduce((sum, p) => sum + p, 0) / percentiles.length
          )
        : 0;

    return {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      category: player.category,
      testResults: testResultsMap,
      overallScore,
      rank: 0, // Will be set after sorting
    };
  });

  // Sort by overall score and assign ranks
  comparisonRows.sort((a, b) => b.overallScore - a.overallScore);
  comparisonRows.forEach((row, index) => {
    row.rank = index + 1;
  });

  return {
    testNumbers,
    players: comparisonRows,
    filters: {}, // Can be extended
  };
}

// ============================================================================
// TEAM ANALYTICS
// ============================================================================

/**
 * Calculate team-wide test statistics
 */
export function calculateTeamTestStatistics(
  testNumber: number,
  testName: string,
  players: Array<{ id: string; firstName: string; lastName: string }>,
  testResults: Array<{
    playerId: string;
    value: number;
    passed: boolean;
  }>
): TeamTestStatistics {
  const totalPlayers = players.length;
  const playersCompleted = new Set(testResults.map((r) => r.playerId)).size;

  const passedCount = testResults.filter((r) => r.passed).length;
  const passRate =
    testResults.length > 0
      ? Math.round((passedCount / testResults.length) * 100)
      : 0;

  const values = testResults.map((r) => r.value);
  const averageValue =
    values.length > 0
      ? Math.round(
          (values.reduce((sum, v) => sum + v, 0) / values.length) * 100
        ) / 100
      : 0;

  // Calculate median
  const sortedValues = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sortedValues.length / 2);
  const medianValue =
    sortedValues.length > 0
      ? sortedValues.length % 2 === 0
        ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
        : sortedValues[mid]
      : 0;

  // Find best performer
  const bestResult = testResults.reduce(
    (best, current) => (current.value > best.value ? current : best),
    testResults[0] || { playerId: '', value: 0 }
  );

  const bestPlayer = players.find((p) => p.id === bestResult.playerId);
  const bestPerformer = {
    playerId: bestResult.playerId,
    playerName: bestPlayer
      ? `${bestPlayer.firstName} ${bestPlayer.lastName}`
      : 'Unknown',
    value: bestResult.value,
  };

  // Find players needing improvement (failed the test)
  const needsImprovement = testResults
    .filter((r) => !r.passed)
    .map((r) => r.playerId);

  return {
    testNumber,
    testName,
    playersCompleted,
    totalPlayers,
    passRate,
    averageValue,
    medianValue,
    bestPerformer,
    needsImprovement,
  };
}

/**
 * Calculate comprehensive team analytics
 */
export function calculateTeamAnalytics(
  coachId: string,
  players: Array<{
    id: string;
    firstName: string;
    lastName: string;
    category: string;
  }>,
  allTestResults: Array<{
    playerId: string;
    testNumber: number;
    testName: string;
    value: number;
    passed: boolean;
    date: Date;
  }>
): TeamAnalytics {
  const totalPlayers = players.length;

  // Count players by category
  const playersByCategory: Record<string, number> = {};
  players.forEach((player) => {
    playersByCategory[player.category] =
      (playersByCategory[player.category] || 0) + 1;
  });

  // Calculate overall completion
  const totalTests = 20;
  const testsPossibleTotal = totalPlayers * totalTests;
  const testsCompletedTotal = allTestResults.length;
  const overallCompletionRate = Math.round(
    (testsCompletedTotal / testsPossibleTotal) * 100
  );

  // Per-test statistics
  const testStatistics: TeamTestStatistics[] = [];
  for (let testNum = 1; testNum <= totalTests; testNum++) {
    const testResults = allTestResults.filter((r) => r.testNumber === testNum);
    if (testResults.length === 0) continue;

    const testName = testResults[0].testName;
    const stats = calculateTeamTestStatistics(
      testNum,
      testName,
      players,
      testResults
    );
    testStatistics.push(stats);
  }

  // Recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentActivityCount = allTestResults.filter(
    (r) => r.date >= thirtyDaysAgo
  ).length;

  // Calculate monthly trend by comparing last 30 days to previous 30 days
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const last30DaysTests = allTestResults.filter(
    (r) => r.date >= thirtyDaysAgo
  ).length;
  const previous30DaysTests = allTestResults.filter(
    (r) => r.date >= sixtyDaysAgo && r.date < thirtyDaysAgo
  ).length;

  let monthlyTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (previous30DaysTests > 0) {
    const changePercent = ((last30DaysTests - previous30DaysTests) / previous30DaysTests) * 100;
    if (changePercent > 10) {
      monthlyTrend = 'increasing';
    } else if (changePercent < -10) {
      monthlyTrend = 'decreasing';
    }
  } else if (last30DaysTests > 0) {
    monthlyTrend = 'increasing'; // New activity where there was none
  }

  return {
    coachId,
    totalPlayers,
    playersByCategory,
    overallCompletionRate,
    testsCompletedTotal,
    testsPossibleTotal,
    testStatistics,
    recentActivityCount,
    monthlyTrend,
  };
}
