/**
 * useTestResults - Centralized hook for player test results
 *
 * Provides unified access to:
 * - All test results with history
 * - Category requirements and progress
 * - Trend analysis and predictions
 * - Coach notes integration
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';

// ============================================================================
// TYPES
// ============================================================================

export type TestCategory =
  | 'golf'
  | 'teknikk'
  | 'fysisk'
  | 'mental'
  | 'strategisk'
  | 'driving'
  | 'jernspill'
  | 'kortspill'
  | 'putting';

export type PlayerCategory = 'K' | 'J' | 'I' | 'H' | 'G' | 'F' | 'E' | 'D' | 'C' | 'B' | 'A';

export interface TestAttempt {
  id: string;
  value: number;
  testDate: string;
  notes?: string;
  coachNotes?: string;
  conditions?: {
    weather?: string;
    temperature?: number;
    equipment?: string;
  };
}

export interface TestDefinition {
  id: string;
  name: string;
  category: TestCategory;
  unit: string;
  description?: string;
  lowerIsBetter: boolean;
  icon?: string;
  requirements: Record<PlayerCategory, number>;
}

export interface TestResult {
  id: string;
  testId: string;
  name: string;
  category: TestCategory;
  unit: string;
  icon: string;
  lowerIsBetter: boolean;
  description?: string;

  // Current state
  currentValue: number;
  previousValue: number | null;
  bestValue: number;
  worstValue: number;
  averageValue: number;

  // Requirements
  requirement: number;
  targetRequirement?: number; // For target category
  meetsCurrent: boolean;
  meetsTarget?: boolean;

  // History
  history: TestAttempt[];
  testCount: number;
  firstTestDate: string | null;
  lastTestDate: string | null;

  // Trend analysis
  trend: 'improving' | 'declining' | 'stable';
  trendPercent: number;
  improvementRate: number; // Units per week
  predictedDaysToTarget: number | null;

  // Coach integration
  coachNotes: CoachNote[];
  recommendations: string[];
}

export interface CoachNote {
  id: string;
  testResultId: string;
  coachId: string;
  coachName: string;
  content: string;
  createdAt: string;
  type: 'observation' | 'recommendation' | 'praise' | 'focus';
}

export interface CategoryProgress {
  category: PlayerCategory;
  testsRequired: number;
  testsMet: number;
  progress: number;
  remainingTests: TestResult[];
  additionalRequirements?: {
    roundsRequired?: number;
    roundsCompleted?: number;
    handicapRequired?: number;
    currentHandicap?: number;
  };
}

// ============================================================================
// TYPE ALIASES FOR MAPPERS COMPATIBILITY
// ============================================================================

/**
 * Type aliases for domain/tests/mappers.ts compatibility.
 * These provide semantic clarity when distinguishing UI types from canonical types.
 */
export type UITestResult = TestResult;
export type UISkillArea = TestCategory;
export type UISkillLevel = PlayerCategory;

export interface UseTestResultsReturn {
  // Data
  tests: TestResult[];
  testsByCategory: Record<TestCategory, TestResult[]>;
  categories: TestCategory[];

  // Player info
  playerCategory: PlayerCategory;
  targetCategory: PlayerCategory;
  categoryProgress: CategoryProgress | null;

  // Stats
  totalTests: number;
  passedTests: number;
  improvingTests: number;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;
  getTestById: (testId: string) => TestResult | undefined;
  getTestsByCategory: (category: TestCategory) => TestResult[];
  getComparisonData: (testIds: string[]) => TestResult[];
  addCoachNote: (testId: string, note: Omit<CoachNote, 'id' | 'createdAt'>) => Promise<void>;
}

// ============================================================================
// CATEGORY REQUIREMENTS (Demo - should come from API)
// ============================================================================

const CATEGORY_ORDER: PlayerCategory[] = ['K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];

const getCategoryIndex = (cat: PlayerCategory): number => CATEGORY_ORDER.indexOf(cat);
const getNextCategory = (cat: PlayerCategory): PlayerCategory | null => {
  const idx = getCategoryIndex(cat);
  return idx < CATEGORY_ORDER.length - 1 ? CATEGORY_ORDER[idx + 1] : null;
};

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoTestResults(): TestResult[] {
  const now = new Date();
  const generateHistory = (
    baseValue: number,
    improvement: number,
    count: number,
    unit: string
  ): TestAttempt[] => {
    return Array.from({ length: count }, (_, i) => {
      const weeksAgo = (count - 1 - i) * 2;
      const date = new Date(now);
      date.setDate(date.getDate() - weeksAgo * 7);

      const variance = (Math.random() - 0.5) * improvement * 0.5;
      const value = baseValue + (improvement * i / count) + variance;

      return {
        id: `attempt-${i}`,
        value: parseFloat(value.toFixed(unit === '' ? 3 : 1)),
        testDate: date.toISOString(),
        notes: i === count - 1 ? 'Siste test' : undefined,
      };
    });
  };

  const tests: Omit<TestResult, 'trend' | 'trendPercent' | 'improvementRate' | 'predictedDaysToTarget'>[] = [
    {
      id: 'driving_distance',
      testId: 'driving_distance',
      name: 'Driver Avstand',
      category: 'driving',
      unit: 'm',
      icon: 'swing',
      lowerIsBetter: false,
      description: 'Gjennomsnittlig driveavstand over 5 slag',
      currentValue: 255,
      previousValue: 252,
      bestValue: 258,
      worstValue: 242,
      averageValue: 250,
      requirement: 250,
      targetRequirement: 265,
      meetsCurrent: true,
      meetsTarget: false,
      history: generateHistory(242, 16, 8, 'm'),
      testCount: 8,
      firstTestDate: new Date(now.getTime() - 16 * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastTestDate: now.toISOString(),
      coachNotes: [
        {
          id: 'note-1',
          testResultId: 'driving_distance',
          coachId: 'coach-1',
          coachName: 'Erik Hansen',
          content: 'Fokuser på hofterotasjon for mer kraft. God fremgang!',
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'recommendation',
        },
      ],
      recommendations: ['Øk hofterotasjon', 'Tren på driving range 3x ukentlig'],
    },
    {
      id: 'fairway_accuracy',
      testId: 'fairway_accuracy',
      name: 'Fairway Treff',
      category: 'driving',
      unit: '%',
      icon: 'target',
      lowerIsBetter: false,
      description: 'Prosent av fairways truffet over 18 hull',
      currentValue: 68,
      previousValue: 65,
      bestValue: 72,
      worstValue: 58,
      averageValue: 65,
      requirement: 70,
      targetRequirement: 75,
      meetsCurrent: false,
      meetsTarget: false,
      history: generateHistory(58, 14, 6, '%'),
      testCount: 6,
      firstTestDate: new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastTestDate: now.toISOString(),
      coachNotes: [],
      recommendations: ['Fokus på retning fremfor avstand'],
    },
    {
      id: 'gir',
      testId: 'gir',
      name: 'GIR (Greens in Regulation)',
      category: 'jernspill',
      unit: '%',
      icon: 'flag',
      lowerIsBetter: false,
      description: 'Prosent av greener nådd i regulation',
      currentValue: 55,
      previousValue: 52,
      bestValue: 58,
      worstValue: 45,
      averageValue: 52,
      requirement: 60,
      targetRequirement: 65,
      meetsCurrent: false,
      meetsTarget: false,
      history: generateHistory(45, 13, 7, '%'),
      testCount: 7,
      firstTestDate: new Date(now.getTime() - 14 * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastTestDate: now.toISOString(),
      coachNotes: [
        {
          id: 'note-2',
          testResultId: 'gir',
          coachId: 'coach-1',
          coachName: 'Erik Hansen',
          content: 'Jobbe med avstandskontroll 150-180m. Veldig god innsats!',
          createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'praise',
        },
      ],
      recommendations: ['Avstandskontroll-drill', 'Visualiser landingssone'],
    },
    {
      id: 'proximity_100m',
      testId: 'proximity_100m',
      name: 'Nærhet til hull fra 100m',
      category: 'jernspill',
      unit: 'm',
      icon: 'ruler',
      lowerIsBetter: true,
      description: 'Gjennomsnittlig avstand til hull fra 100m',
      currentValue: 9.5,
      previousValue: 10.2,
      bestValue: 8.8,
      worstValue: 12.5,
      averageValue: 10.5,
      requirement: 8,
      targetRequirement: 6,
      meetsCurrent: false,
      meetsTarget: false,
      history: generateHistory(12.5, -3.0, 6, 'm'),
      testCount: 6,
      firstTestDate: new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastTestDate: now.toISOString(),
      coachNotes: [],
      recommendations: ['Wedge-drill daglig', 'Fokus på landing, ikke hull'],
    },
    {
      id: 'scrambling',
      testId: 'scrambling',
      name: 'Scrambling',
      category: 'kortspill',
      unit: '%',
      icon: 'trophy',
      lowerIsBetter: false,
      description: 'Prosent up-and-down fra utenfor greenen',
      currentValue: 58,
      previousValue: 55,
      bestValue: 62,
      worstValue: 48,
      averageValue: 55,
      requirement: 60,
      targetRequirement: 65,
      meetsCurrent: false,
      meetsTarget: false,
      history: generateHistory(48, 14, 8, '%'),
      testCount: 8,
      firstTestDate: new Date(now.getTime() - 16 * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastTestDate: now.toISOString(),
      coachNotes: [],
      recommendations: ['Pitch-drill rundt green', 'Øv på ulike lies'],
    },
    {
      id: 'sand_saves',
      testId: 'sand_saves',
      name: 'Sand Saves',
      category: 'kortspill',
      unit: '%',
      icon: 'mountain',
      lowerIsBetter: false,
      description: 'Prosent up-and-down fra bunker',
      currentValue: 55,
      previousValue: 52,
      bestValue: 58,
      worstValue: 42,
      averageValue: 50,
      requirement: 50,
      targetRequirement: 55,
      meetsCurrent: true,
      meetsTarget: true,
      history: generateHistory(42, 16, 6, '%'),
      testCount: 6,
      firstTestDate: new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastTestDate: now.toISOString(),
      coachNotes: [
        {
          id: 'note-3',
          testResultId: 'sand_saves',
          coachId: 'coach-1',
          coachName: 'Erik Hansen',
          content: 'Fantastisk fremgang! Du har nådd målnivå.',
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'praise',
        },
      ],
      recommendations: [],
    },
    {
      id: 'putts_per_round',
      testId: 'putts_per_round',
      name: 'Putts per Runde',
      category: 'putting',
      unit: '',
      icon: 'circle',
      lowerIsBetter: true,
      description: 'Gjennomsnittlig antall putts per 18 hull',
      currentValue: 31.5,
      previousValue: 32.0,
      bestValue: 30.8,
      worstValue: 34.2,
      averageValue: 32.0,
      requirement: 30,
      targetRequirement: 28,
      meetsCurrent: false,
      meetsTarget: false,
      history: generateHistory(34.2, -3.4, 7, ''),
      testCount: 7,
      firstTestDate: new Date(now.getTime() - 14 * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastTestDate: now.toISOString(),
      coachNotes: [],
      recommendations: ['Lag-putting drill', 'Fokus på 1-2m'],
    },
    {
      id: 'one_putt_pct',
      testId: 'one_putt_pct',
      name: 'En-putt Prosent',
      category: 'putting',
      unit: '%',
      icon: 'medal',
      lowerIsBetter: false,
      description: 'Prosent av greener med kun én putt',
      currentValue: 38,
      previousValue: 35,
      bestValue: 42,
      worstValue: 28,
      averageValue: 35,
      requirement: 40,
      targetRequirement: 45,
      meetsCurrent: false,
      meetsTarget: false,
      history: generateHistory(28, 14, 6, '%'),
      testCount: 6,
      firstTestDate: new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastTestDate: now.toISOString(),
      coachNotes: [],
      recommendations: ['Gate-drill 1.5m', 'Speed-kontroll drill'],
    },
    {
      id: 'club_speed',
      testId: 'club_speed',
      name: 'Klubbfart Driver',
      category: 'fysisk',
      unit: 'mph',
      icon: 'zap',
      lowerIsBetter: false,
      description: 'Gjennomsnittlig klubbhodefart med driver',
      currentValue: 108,
      previousValue: 106,
      bestValue: 110,
      worstValue: 98,
      averageValue: 104,
      requirement: 105,
      targetRequirement: 112,
      meetsCurrent: true,
      meetsTarget: false,
      history: generateHistory(98, 12, 8, 'mph'),
      testCount: 8,
      firstTestDate: new Date(now.getTime() - 16 * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastTestDate: now.toISOString(),
      coachNotes: [],
      recommendations: ['Speed-trening 2x ukentlig', 'Overspeed-protokoll'],
    },
    {
      id: 'core_strength',
      testId: 'core_strength',
      name: 'Core-test (Planke)',
      category: 'fysisk',
      unit: 'sek',
      icon: 'dumbbell',
      lowerIsBetter: false,
      description: 'Plankehold i sekunder',
      currentValue: 90,
      previousValue: 85,
      bestValue: 95,
      worstValue: 65,
      averageValue: 80,
      requirement: 80,
      targetRequirement: 100,
      meetsCurrent: true,
      meetsTarget: false,
      history: generateHistory(65, 30, 6, 'sek'),
      testCount: 6,
      firstTestDate: new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastTestDate: now.toISOString(),
      coachNotes: [],
      recommendations: ['Daglig core-rutine', 'Progressiv overbelastning'],
    },
    {
      id: 'mental_toughness',
      testId: 'mental_toughness',
      name: 'Mental Toughness',
      category: 'mental',
      unit: 'pts',
      icon: 'brain',
      lowerIsBetter: false,
      description: 'Mental styrketest (TOPS-2 skala)',
      currentValue: 52,
      previousValue: 50,
      bestValue: 54,
      worstValue: 42,
      averageValue: 48,
      requirement: 55,
      targetRequirement: 60,
      meetsCurrent: false,
      meetsTarget: false,
      history: generateHistory(42, 12, 5, 'pts'),
      testCount: 5,
      firstTestDate: new Date(now.getTime() - 10 * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastTestDate: now.toISOString(),
      coachNotes: [
        {
          id: 'note-4',
          testResultId: 'mental_toughness',
          coachId: 'coach-2',
          coachName: 'Maria Berg',
          content: 'Fokuser på pre-shot rutine. Visualisering før hver runde.',
          createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'focus',
        },
      ],
      recommendations: ['Daglig visualisering', 'Mindfulness 10 min'],
    },
    {
      id: 'course_strategy',
      testId: 'course_strategy',
      name: 'Banestrategi',
      category: 'strategisk',
      unit: 'pts',
      icon: 'map',
      lowerIsBetter: false,
      description: 'Strategisk beslutningstest',
      currentValue: 72,
      previousValue: 68,
      bestValue: 75,
      worstValue: 58,
      averageValue: 68,
      requirement: 70,
      targetRequirement: 80,
      meetsCurrent: true,
      meetsTarget: false,
      history: generateHistory(58, 17, 5, 'pts'),
      testCount: 5,
      firstTestDate: new Date(now.getTime() - 10 * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastTestDate: now.toISOString(),
      coachNotes: [],
      recommendations: ['Studér banekartet før runde', 'Spill simulerte runder mentalt'],
    },
  ];

  // Calculate trend data for each test
  return tests.map(test => {
    const { history, currentValue, previousValue, lowerIsBetter, requirement, targetRequirement } = test;

    // Calculate trend
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    let trendPercent = 0;

    if (previousValue !== null) {
      const diff = currentValue - previousValue;
      const percentChange = (Math.abs(diff) / previousValue) * 100;

      if (percentChange > 2) {
        if (lowerIsBetter) {
          trend = diff < 0 ? 'improving' : 'declining';
        } else {
          trend = diff > 0 ? 'improving' : 'declining';
        }
        trendPercent = percentChange;
      }
    }

    // Calculate improvement rate (per week)
    const firstValue = history[0]?.value ?? currentValue;
    const totalChange = lowerIsBetter ? firstValue - currentValue : currentValue - firstValue;
    const weeksSpan = history.length > 1
      ? (new Date(history[history.length - 1].testDate).getTime() - new Date(history[0].testDate).getTime()) / (7 * 24 * 60 * 60 * 1000)
      : 1;
    const improvementRate = totalChange / Math.max(weeksSpan, 1);

    // Predict days to target
    let predictedDaysToTarget: number | null = null;
    const target = targetRequirement ?? requirement;
    const remaining = lowerIsBetter ? currentValue - target : target - currentValue;

    if (remaining > 0 && improvementRate > 0) {
      const weeksNeeded = remaining / improvementRate;
      predictedDaysToTarget = Math.ceil(weeksNeeded * 7);
    } else if (remaining <= 0) {
      predictedDaysToTarget = 0;
    }

    return {
      ...test,
      trend,
      trendPercent: parseFloat(trendPercent.toFixed(1)),
      improvementRate: parseFloat(improvementRate.toFixed(2)),
      predictedDaysToTarget,
    };
  });
}

// ============================================================================
// HOOK
// ============================================================================

export function useTestResults(playerId?: string): UseTestResultsReturn {
  const { user } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerCategory, setPlayerCategory] = useState<PlayerCategory>('C');
  const [targetCategory, setTargetCategory] = useState<PlayerCategory>('B');

  const fetchTestResults = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const pid = playerId || user?.playerId || user?.id;

      // Try to fetch from API
      const [testsRes, resultsRes, playerRes] = await Promise.all([
        apiClient.get('/tests?isActive=true&limit=50'),
        apiClient.get(`/tests/results?playerId=${pid}&limit=200`),
        apiClient.get('/me'),
      ]);

      const testsData = testsRes.data?.data?.tests || [];
      const resultsData = resultsRes.data?.data?.results || [];
      const playerData = playerRes.data?.data;

      if (playerData?.category) {
        setPlayerCategory(playerData.category);
        const next = getNextCategory(playerData.category);
        if (next) setTargetCategory(next);
      }

      // Transform API data to TestResult format
      if (testsData.length > 0 && resultsData.length > 0) {
        const transformedTests = transformApiData(testsData, resultsData, playerCategory);
        setTests(transformedTests);
      } else {
        // Use demo data
        setTests(getDemoTestResults());
      }
    } catch (err) {
      console.warn('Using demo data:', err);
      setTests(getDemoTestResults());
    } finally {
      setLoading(false);
    }
  }, [playerId, user, playerCategory]);

  useEffect(() => {
    fetchTestResults();
  }, [fetchTestResults]);

  // Group tests by category
  const testsByCategory = useMemo(() => {
    return tests.reduce((acc, test) => {
      if (!acc[test.category]) {
        acc[test.category] = [];
      }
      acc[test.category].push(test);
      return acc;
    }, {} as Record<TestCategory, TestResult[]>);
  }, [tests]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(tests.map(t => t.category))];
  }, [tests]);

  // Calculate stats
  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.meetsCurrent).length;
  const improvingTests = tests.filter(t => t.trend === 'improving').length;

  // Calculate category progress
  const categoryProgress = useMemo((): CategoryProgress | null => {
    const targetTests = tests.filter(t => t.targetRequirement !== undefined);
    const metTests = targetTests.filter(t => t.meetsTarget);
    const remainingTests = targetTests.filter(t => !t.meetsTarget);

    return {
      category: targetCategory,
      testsRequired: targetTests.length,
      testsMet: metTests.length,
      progress: targetTests.length > 0 ? (metTests.length / targetTests.length) * 100 : 0,
      remainingTests,
      additionalRequirements: {
        roundsRequired: 10,
        roundsCompleted: 8,
        handicapRequired: 8.0,
        currentHandicap: 9.2,
      },
    };
  }, [tests, targetCategory]);

  // Helper functions
  const getTestById = useCallback((testId: string) => {
    return tests.find(t => t.id === testId);
  }, [tests]);

  const getTestsByCategory = useCallback((category: TestCategory) => {
    return tests.filter(t => t.category === category);
  }, [tests]);

  const getComparisonData = useCallback((testIds: string[]) => {
    return tests.filter(t => testIds.includes(t.id));
  }, [tests]);

  const addCoachNote = useCallback(async (testId: string, note: Omit<CoachNote, 'id' | 'createdAt'>) => {
    try {
      await apiClient.post(`/tests/results/${testId}/notes`, note);
      await fetchTestResults();
    } catch (err) {
      console.error('Failed to add coach note:', err);
      throw err;
    }
  }, [fetchTestResults]);

  return {
    tests,
    testsByCategory,
    categories,
    playerCategory,
    targetCategory,
    categoryProgress,
    totalTests,
    passedTests,
    improvingTests,
    loading,
    error,
    refetch: fetchTestResults,
    getTestById,
    getTestsByCategory,
    getComparisonData,
    addCoachNote,
  };
}

// ============================================================================
// HELPER: Transform API data
// ============================================================================

function transformApiData(
  testsData: any[],
  resultsData: any[],
  playerCategory: PlayerCategory
): TestResult[] {
  return testsData.map(test => {
    const testResults = resultsData
      .filter((r: any) => r.testId === test.id)
      .sort((a: any, b: any) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

    const history: TestAttempt[] = testResults.map((r: any) => ({
      id: r.id,
      value: r.value || r.pei || 0,
      testDate: r.testDate,
      notes: r.notes,
      coachNotes: r.coachNotes,
    })).reverse();

    const currentValue = history[history.length - 1]?.value ?? 0;
    const previousValue = history[history.length - 2]?.value ?? null;
    const values = history.map(h => h.value);

    const requirement = test.requirements?.[playerCategory] ?? test.requirement ?? 0;

    return {
      id: test.id,
      testId: test.id,
      name: test.name,
      category: test.category,
      unit: test.unit || '',
      icon: test.icon || 'target',
      lowerIsBetter: test.lowerIsBetter || false,
      description: test.description,
      currentValue,
      previousValue,
      bestValue: test.lowerIsBetter ? Math.min(...values) : Math.max(...values),
      worstValue: test.lowerIsBetter ? Math.max(...values) : Math.min(...values),
      averageValue: values.reduce((a, b) => a + b, 0) / values.length,
      requirement,
      meetsCurrent: test.lowerIsBetter ? currentValue <= requirement : currentValue >= requirement,
      history,
      testCount: history.length,
      firstTestDate: history[0]?.testDate ?? null,
      lastTestDate: history[history.length - 1]?.testDate ?? null,
      trend: 'stable' as const,
      trendPercent: 0,
      improvementRate: 0,
      predictedDaysToTarget: null,
      coachNotes: [],
      recommendations: [],
    };
  });
}

export default useTestResults;
