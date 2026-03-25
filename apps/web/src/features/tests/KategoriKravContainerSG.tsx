/**
 * Kategori Krav - Strokes Gained Edition
 * Shows category requirements based on Data Golf SG benchmarks and player test results
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  CheckCircle,
  Circle,
  Info,
  Target,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography/Headings';
import Card from '../../ui/primitives/Card';
import Badge from '../../ui/primitives/Badge.primitive';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { AICoachGuide } from '../ai-coach';
import { GUIDE_PRESETS } from '../ai-coach/types';
import {
  CATEGORY_SG_BENCHMARKS,
  getCategoryBenchmark,
  getCategoryByHandicap,
  getNextCategory,
  type CategorySGBenchmark,
} from '../../config/category-sg-benchmarks';
import { getPlayerSgSummary, convertIupTestToSg } from '../../services/dataGolfService';
import { playersAPI, testsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// ============================================================================
// TYPES
// ============================================================================

interface PlayerTestResult {
  id: string;
  testId: string;
  testNumber: number;
  testName: string;
  value: number;
  pei: number | null;
  results: any; // JSON field with raw test data
  testDate: string;
  passed: boolean;
}

interface PlayerSGStats {
  sgTotal: number;
  sgTee: number | null;
  sgApproach: number;
  sgApproachByDistance: {
    '25m': number | null;
    '50m': number | null;
    '75m': number | null;
    '100m': number | null;
  };
  sgAroundGreen: number;
  sgPutting: number;
  testResults: PlayerTestResult[];
}

interface RequirementDetail {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  requirement: number;
  current: number | null;
  unit: string;
  met: boolean;
  lowerIsBetter: boolean;
  description: string;
  sgValue?: number; // Calculated SG value
  tourPercentile?: number; // Percentile vs tour
}

// ============================================================================
// REQUIREMENT CARD COMPONENT
// ============================================================================

const RequirementCardSG: React.FC<{ requirement: RequirementDetail }> = ({ requirement }) => {
  const progressPercent = requirement.current === null
    ? 0
    : requirement.lowerIsBetter
    ? Math.min(100, Math.max(0, (requirement.requirement / requirement.current) * 100))
    : Math.min(100, Math.max(0, (requirement.current / requirement.requirement) * 100));

  const difference = requirement.current === null
    ? null
    : requirement.lowerIsBetter
    ? requirement.requirement - requirement.current
    : requirement.current - requirement.requirement;

  return (
    <Card variant="default" padding="md">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="accent" size="sm">{requirement.category}</Badge>
            {requirement.subcategory && (
              <Badge variant="neutral" size="sm">{requirement.subcategory}</Badge>
            )}
            {requirement.met ? (
              <CheckCircle size={14} className="text-tier-success" />
            ) : (
              <Circle size={14} className="text-tier-text-tertiary" />
            )}
          </div>
          <CardTitle className="text-sm font-semibold text-tier-navy mb-1">
            {requirement.name}
          </CardTitle>
          <p className="text-[11px] text-tier-text-secondary">
            {requirement.description}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="h-1.5 bg-tier-surface-base rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              requirement.met
                ? 'bg-tier-success'
                : progressPercent >= 80
                ? 'bg-tier-warning'
                : 'bg-tier-error'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex justify-between items-center text-xs">
        <div>
          <div className="text-tier-text-tertiary">Krav</div>
          <div className="font-semibold text-tier-navy">
            {requirement.lowerIsBetter ? '≤' : '≥'} {requirement.requirement.toFixed(2)}{requirement.unit}
          </div>
        </div>
        <div className="text-center">
          <div className="text-tier-text-tertiary">Din</div>
          <div
            className={`font-semibold ${
              requirement.current === null
                ? 'text-tier-text-tertiary'
                : requirement.met
                ? 'text-tier-success'
                : 'text-tier-error'
            }`}
          >
            {requirement.current !== null ? `${requirement.current.toFixed(2)}${requirement.unit}` : 'N/A'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-tier-text-tertiary">Diff</div>
          <div
            className={`font-semibold ${
              difference === null
                ? 'text-tier-text-tertiary'
                : difference >= 0
                ? 'text-tier-success'
                : 'text-tier-error'
            }`}
          >
            {difference !== null ? `${difference >= 0 ? '+' : ''}${difference.toFixed(2)}${requirement.unit}` : 'N/A'}
          </div>
        </div>
      </div>

      {/* SG Value if available */}
      {requirement.sgValue !== undefined && (
        <div className="mt-2 pt-2 border-t border-tier-border-default">
          <div className="flex justify-between items-center text-xs">
            <span className="text-tier-text-secondary">Strokes Gained</span>
            <span
              className={`font-semibold ${
                requirement.sgValue > 0
                  ? 'text-tier-success'
                  : requirement.sgValue < 0
                  ? 'text-tier-error'
                  : 'text-tier-text-secondary'
              }`}
            >
              {requirement.sgValue > 0 ? '+' : ''}{requirement.sgValue.toFixed(3)}
            </span>
          </div>
          {requirement.tourPercentile !== undefined && (
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-tier-text-secondary">Tour Percentile</span>
              <span className="font-semibold text-tier-navy">
                {requirement.tourPercentile}%
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// CATEGORY SELECTOR
// ============================================================================

const CategorySelector: React.FC<{
  selected: string;
  current: string;
  onChange: (category: string) => void;
}> = ({ selected, current, onChange }) => (
  <Card variant="default" padding="md" className="mb-5">
    <SubSectionTitle className="text-sm font-semibold text-tier-navy mb-3">
      Velg kategori
    </SubSectionTitle>
    <div className="flex gap-2 overflow-x-auto pb-1">
      {CATEGORY_SG_BENCHMARKS.slice().reverse().map((cat) => {
        const isCurrent = cat.category === current;
        const isSelected = cat.category === selected;

        return (
          <Button
            key={cat.category}
            onClick={() => onChange(cat.category)}
            variant={isSelected ? 'primary' : 'ghost'}
            size="sm"
            className={`${
              isCurrent && !isSelected ? 'bg-tier-success/15 text-tier-success' : ''
            } ${isSelected ? 'border-2 border-tier-navy' : 'border-2 border-transparent'}`}
          >
            {cat.category}
            {isCurrent && ' ✓'}
          </Button>
        );
      })}
    </div>
  </Card>
);

// ============================================================================
// SUMMARY CARD
// ============================================================================

const SummaryCardSG: React.FC<{
  benchmark: CategorySGBenchmark;
  meetsCount: number;
  totalCount: number;
  handicap: number;
  roundsPlayed: number;
}> = ({ benchmark, meetsCount, totalCount, handicap, roundsPlayed }) => {
  const handicapMet = handicap <= benchmark.handicapRange[1];
  const roundsMet = roundsPlayed >= benchmark.roundsRequired;

  return (
    <Card variant="default" padding="md" className="mb-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-tier-navy/15 flex items-center justify-center">
          <Award size={24} className="text-tier-navy" />
        </div>
        <div>
          <SectionTitle className="text-lg font-bold text-tier-navy m-0">
            Krav for Kategori {benchmark.category}
          </SectionTitle>
          <p className="text-[13px] text-tier-text-secondary mt-0.5">
            {meetsCount} av {totalCount} krav oppfylt
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-tier-surface-base rounded-lg text-center">
          <div
            className={`text-2xl font-bold ${
              meetsCount === totalCount ? 'text-tier-success' : 'text-tier-navy'
            }`}
          >
            {meetsCount}/{totalCount}
          </div>
          <div className="text-[11px] text-tier-text-secondary">Testkrav</div>
        </div>

        <div className="p-3 bg-tier-surface-base rounded-lg text-center">
          <div className={`text-2xl font-bold ${roundsMet ? 'text-tier-success' : 'text-tier-warning'}`}>
            {roundsPlayed}/{benchmark.roundsRequired}
          </div>
          <div className="text-[11px] text-tier-text-secondary">Runder</div>
        </div>

        <div className="p-3 bg-tier-surface-base rounded-lg text-center">
          <div className={`text-2xl font-bold ${handicapMet ? 'text-tier-success' : 'text-tier-error'}`}>
            {handicap.toFixed(1)}
          </div>
          <div className="text-[11px] text-tier-text-secondary">
            HCP (≤{benchmark.handicapRange[1]})
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MAIN CONTAINER
// ============================================================================

export const KategoriKravContainerSG: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerSGStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('B');
  const [currentCategory, setCurrentCategory] = useState<string>('C');
  const [handicap, setHandicap] = useState<number>(9.2);
  const [roundsPlayed, setRoundsPlayed] = useState<number>(8);

  // Fetch player SG data on mount
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Get player profile to fetch handicap
        const playerProfileResponse = await playersAPI.getProfile();
        const playerProfile = playerProfileResponse.data.data;
        const playerHandicap = playerProfile.handicap ? Number(playerProfile.handicap) : 9.2;
        setHandicap(playerHandicap);

        // 2. Get player test results
        const testResultsResponse = await testsAPI.getResults(playerProfile.id);
        const allTestResults = testResultsResponse.data.data;

        // 3. Filter for relevant tests (8-11 approach, 15-16 putting, 17-18 short game)
        const relevantTests = allTestResults.filter((tr: any) => {
          const testNum = parseInt(tr.test?.testNumber || '0');
          return testNum >= 8 && testNum <= 18;
        });

        // 4. Get most recent result for each test type
        const testMap: Record<number, PlayerTestResult> = {};
        relevantTests.forEach((tr: any) => {
          const testNum = parseInt(tr.test?.testNumber || '0');
          if (!testMap[testNum] || new Date(tr.testDate) > new Date(testMap[testNum].testDate)) {
            testMap[testNum] = {
              id: tr.id,
              testId: tr.testId,
              testNumber: testNum,
              testName: tr.test?.name || `Test ${testNum}`,
              value: Number(tr.value),
              pei: tr.pei ? Number(tr.pei) : null,
              results: tr.results,
              testDate: tr.testDate,
              passed: tr.passed,
            };
          }
        });

        // 5. Convert PEI values to SG for approach tests
        const sgApproachByDistance: {
          '25m': number | null;
          '50m': number | null;
          '75m': number | null;
          '100m': number | null;
        } = {
          '25m': null,
          '50m': null,
          '75m': null,
          '100m': null,
        };

        // Test 8: 25m approach
        if (testMap[8]?.pei !== null) {
          try {
            const sgResult = await convertIupTestToSg({
              testNumber: 8,
              peiValues: [testMap[8].pei!],
              startDistance: 25,
            });
            sgApproachByDistance['25m'] = sgResult.averageSG || 0;
          } catch (err) {
            console.error('Error converting test 8 to SG:', err);
          }
        }

        // Test 9: 50m approach
        if (testMap[9]?.pei !== null) {
          try {
            const sgResult = await convertIupTestToSg({
              testNumber: 9,
              peiValues: [testMap[9].pei!],
              startDistance: 50,
            });
            sgApproachByDistance['50m'] = sgResult.averageSG || 0;
          } catch (err) {
            console.error('Error converting test 9 to SG:', err);
          }
        }

        // Test 10: 75m approach
        if (testMap[10]?.pei !== null) {
          try {
            const sgResult = await convertIupTestToSg({
              testNumber: 10,
              peiValues: [testMap[10].pei!],
              startDistance: 75,
            });
            sgApproachByDistance['75m'] = sgResult.averageSG || 0;
          } catch (err) {
            console.error('Error converting test 10 to SG:', err);
          }
        }

        // Test 11: 100m approach
        if (testMap[11]?.pei !== null) {
          try {
            const sgResult = await convertIupTestToSg({
              testNumber: 11,
              peiValues: [testMap[11].pei!],
              startDistance: 100,
            });
            sgApproachByDistance['100m'] = sgResult.averageSG || 0;
          } catch (err) {
            console.error('Error converting test 11 to SG:', err);
          }
        }

        // 6. Get player SG summary from Data Golf
        let sgData;
        try {
          sgData = await getPlayerSgSummary(playerProfile.id);
        } catch (err) {
          console.error('Error fetching player SG summary:', err);
          // Use default values if SG data unavailable
          sgData = {
            total: 0,
            byCategory: {
              approach: { value: 0 },
              around_green: { value: 0 },
              putting: { value: 0 },
            },
          };
        }

        // 7. Build player stats
        const stats: PlayerSGStats = {
          sgTotal: sgData.total || 0,
          sgTee: null, // Would need specific test
          sgApproach: sgData.byCategory?.approach?.value || 0,
          sgApproachByDistance,
          sgAroundGreen: sgData.byCategory?.around_green?.value || 0,
          sgPutting: sgData.byCategory?.putting?.value || 0,
          testResults: Object.values(testMap),
        };

        setPlayerStats(stats);

        // 8. Estimate rounds played from test history
        const uniqueTestDates = new Set(allTestResults.map((tr: any) => tr.testDate));
        setRoundsPlayed(Math.min(uniqueTestDates.size, 20)); // Cap at 20

        // 9. Determine current category from handicap
        const catByHcp = getCategoryByHandicap(playerHandicap);
        if (catByHcp) {
          setCurrentCategory(catByHcp.category);
          setSelectedCategory(catByHcp.category);
        }
      } catch (err: any) {
        console.error('Error fetching player data:', err);
        setError(err.message || 'Kunne ikke hente spillerdata');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, []);

  // Build requirements from selected category benchmark
  const requirements = useMemo(() => {
    const benchmark = getCategoryBenchmark(selectedCategory);
    if (!benchmark || !playerStats) return [];

    const reqs: RequirementDetail[] = [];

    // SG Total
    reqs.push({
      id: 'sg_total',
      name: 'Strokes Gained Total',
      category: 'Totalt',
      requirement: benchmark.sgBenchmarks.sgTotal,
      current: playerStats.sgTotal,
      unit: ' SG',
      met: playerStats.sgTotal >= benchmark.sgBenchmarks.sgTotal,
      lowerIsBetter: false,
      description: 'Samlet Strokes Gained alle kategorier',
      sgValue: playerStats.sgTotal,
    });

    // SG Tee
    if (playerStats.sgTee !== null) {
      reqs.push({
        id: 'sg_tee',
        name: 'Strokes Gained: Tee',
        category: 'Driving',
        requirement: benchmark.sgBenchmarks.sgTee,
        current: playerStats.sgTee,
        unit: ' SG',
        met: playerStats.sgTee >= benchmark.sgBenchmarks.sgTee,
        lowerIsBetter: false,
        description: 'SG fra teeslag',
        sgValue: playerStats.sgTee,
      });
    }

    // SG Approach (overall)
    reqs.push({
      id: 'sg_approach',
      name: 'Strokes Gained: Approach',
      category: 'Innspill',
      requirement: benchmark.sgBenchmarks.sgApproach,
      current: playerStats.sgApproach,
      unit: ' SG',
      met: playerStats.sgApproach >= benchmark.sgBenchmarks.sgApproach,
      lowerIsBetter: false,
      description: 'SG fra approach-slag totalt',
      sgValue: playerStats.sgApproach,
    });

    // SG Approach by distance (granular)
    const approachDistances = [
      { test: 8, key: '25m' as const, label: '25m', req: benchmark.sgBenchmarks.sgApproachUnder100 },
      { test: 9, key: '50m' as const, label: '50m', req: benchmark.sgBenchmarks.sgApproachUnder100 },
      { test: 10, key: '75m' as const, label: '75m', req: benchmark.sgBenchmarks.sgApproach100to150 },
      { test: 11, key: '100m' as const, label: '100m', req: benchmark.sgBenchmarks.sgApproach100to150 },
    ];

    approachDistances.forEach(({ test, key, label, req }) => {
      const value = playerStats.sgApproachByDistance[key];
      if (value !== null) {
        reqs.push({
          id: `sg_approach_${key}`,
          name: `SG: Approach ${label}`,
          category: 'Innspill',
          subcategory: label,
          requirement: req,
          current: value,
          unit: ' SG',
          met: value >= req,
          lowerIsBetter: false,
          description: `Strokes Gained fra ${label} approach`,
          sgValue: value,
        });
      }
    });

    // SG Around the Green
    reqs.push({
      id: 'sg_around',
      name: 'Strokes Gained: Around Green',
      category: 'Naerspill',
      requirement: benchmark.sgBenchmarks.sgAroundGreen,
      current: playerStats.sgAroundGreen,
      unit: ' SG',
      met: playerStats.sgAroundGreen >= benchmark.sgBenchmarks.sgAroundGreen,
      lowerIsBetter: false,
      description: 'SG fra chipping og bunker',
      sgValue: playerStats.sgAroundGreen,
    });

    // SG Putting
    reqs.push({
      id: 'sg_putting',
      name: 'Strokes Gained: Putting',
      category: 'Putting',
      requirement: benchmark.sgBenchmarks.sgPutting,
      current: playerStats.sgPutting,
      unit: ' SG',
      met: playerStats.sgPutting >= benchmark.sgBenchmarks.sgPutting,
      lowerIsBetter: false,
      description: 'SG fra putting',
      sgValue: playerStats.sgPutting,
    });

    // Test-based requirements (PEI values)
    // Get test results from playerStats
    const testResults = playerStats.testResults || [];
    const testMap: Record<number, any> = {};
    testResults.forEach((tr) => {
      testMap[tr.testNumber] = tr;
    });

    // Approach tests
    const test8 = testMap[8];
    if (test8) {
      reqs.push({
        id: 'test_approach_25m',
        name: 'Approach Test 25m (PEI)',
        category: 'Innspill',
        subcategory: '25m',
        requirement: benchmark.testRequirements.approach25m,
        current: test8.pei !== null ? test8.pei : null,
        unit: ' PEI',
        met: test8.pei !== null ? test8.pei <= benchmark.testRequirements.approach25m : false,
        lowerIsBetter: true,
        description: 'Max PEI verdi for 25m approach test',
        sgValue: playerStats.sgApproachByDistance['25m'] ?? undefined,
      });
    }

    const test9 = testMap[9];
    if (test9) {
      reqs.push({
        id: 'test_approach_50m',
        name: 'Approach Test 50m (PEI)',
        category: 'Innspill',
        subcategory: '50m',
        requirement: benchmark.testRequirements.approach50m,
        current: test9.pei !== null ? test9.pei : null,
        unit: ' PEI',
        met: test9.pei !== null ? test9.pei <= benchmark.testRequirements.approach50m : false,
        lowerIsBetter: true,
        description: 'Max PEI verdi for 50m approach test',
        sgValue: playerStats.sgApproachByDistance['50m'] ?? undefined,
      });
    }

    const test10 = testMap[10];
    if (test10) {
      reqs.push({
        id: 'test_approach_75m',
        name: 'Approach Test 75m (PEI)',
        category: 'Innspill',
        subcategory: '75m',
        requirement: benchmark.testRequirements.approach75m,
        current: test10.pei !== null ? test10.pei : null,
        unit: ' PEI',
        met: test10.pei !== null ? test10.pei <= benchmark.testRequirements.approach75m : false,
        lowerIsBetter: true,
        description: 'Max PEI verdi for 75m approach test',
        sgValue: playerStats.sgApproachByDistance['75m'] ?? undefined,
      });
    }

    const test11 = testMap[11];
    if (test11) {
      reqs.push({
        id: 'test_approach_100m',
        name: 'Approach Test 100m (PEI)',
        category: 'Innspill',
        subcategory: '100m',
        requirement: benchmark.testRequirements.approach100m,
        current: test11.pei !== null ? test11.pei : null,
        unit: ' PEI',
        met: test11.pei !== null ? test11.pei <= benchmark.testRequirements.approach100m : false,
        lowerIsBetter: true,
        description: 'Max PEI verdi for 100m approach test',
        sgValue: playerStats.sgApproachByDistance['100m'] ?? undefined,
      });
    }

    // Putting tests (Tests 15 & 16)
    const test15 = testMap[15];
    if (test15 && test15.results) {
      // Test 15 is 3m putting - calculate make percentage from results
      const made = test15.results.made || 0;
      const total = test15.results.total || 10;
      const makePercent = (made / total) * 100;

      reqs.push({
        id: 'test_putting_3m',
        name: 'Putting 3m',
        category: 'Putting',
        subcategory: '3m',
        requirement: benchmark.testRequirements.putting3m,
        current: makePercent,
        unit: '%',
        met: makePercent >= benchmark.testRequirements.putting3m,
        lowerIsBetter: false,
        description: 'Min % treff fra 3 meter',
      });
    }

    const test16 = testMap[16];
    if (test16 && test16.results) {
      // Test 16 is 6m putting
      const made = test16.results.made || 0;
      const total = test16.results.total || 10;
      const makePercent = (made / total) * 100;

      reqs.push({
        id: 'test_putting_6m',
        name: 'Putting 6m',
        category: 'Putting',
        subcategory: '6m',
        requirement: benchmark.testRequirements.putting6m,
        current: makePercent,
        unit: '%',
        met: makePercent >= benchmark.testRequirements.putting6m,
        lowerIsBetter: false,
        description: 'Min % treff fra 6 meter',
      });
    }

    // Short game tests (Tests 17 & 18)
    const test17 = testMap[17];
    if (test17) {
      reqs.push({
        id: 'test_chipping',
        name: 'Chipping Test (PEI)',
        category: 'Naerspill',
        subcategory: 'Chipping',
        requirement: benchmark.testRequirements.chipping,
        current: test17.pei !== null ? test17.pei : null,
        unit: ' PEI',
        met: test17.pei !== null ? test17.pei <= benchmark.testRequirements.chipping : false,
        lowerIsBetter: true,
        description: 'Max PEI verdi for chipping test',
      });
    }

    const test18 = testMap[18];
    if (test18) {
      reqs.push({
        id: 'test_bunker',
        name: 'Bunker Test (PEI)',
        category: 'Naerspill',
        subcategory: 'Bunker',
        requirement: benchmark.testRequirements.bunker,
        current: test18.pei !== null ? test18.pei : null,
        unit: ' PEI',
        met: test18.pei !== null ? test18.pei <= benchmark.testRequirements.bunker : false,
        lowerIsBetter: true,
        description: 'Max PEI verdi for bunker test',
      });
    }

    return reqs;
  }, [selectedCategory, playerStats]);

  // Group requirements by category
  const groupedRequirements = useMemo(() => {
    const grouped: Record<string, RequirementDetail[]> = {};
    requirements.forEach((req) => {
      if (!grouped[req.category]) grouped[req.category] = [];
      grouped[req.category].push(req);
    });
    return grouped;
  }, [requirements]);

  // Calculate met count
  const meetsCount = requirements.filter((r) => r.met).length;
  const selectedBenchmark = getCategoryBenchmark(selectedCategory);

  if (loading) {
    return (
      <div className="w-full">
        <StateCard variant="loading" title="Laster kategorikrav..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <StateCard
          variant="error"
          title="Kunne ikke laste kategorikrav"
          description={error}
        />
      </div>
    );
  }

  if (!selectedBenchmark) {
    return (
      <div className="w-full">
        <StateCard variant="empty" title="Ingen data tilgjengelig" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* AI Coach Guide */}
      <AICoachGuide config={GUIDE_PRESETS.categoryRequirements} />

      {/* Category Selector */}
      <CategorySelector
        selected={selectedCategory}
        current={currentCategory}
        onChange={setSelectedCategory}
      />

      {/* Summary */}
      <SummaryCardSG
        benchmark={selectedBenchmark}
        meetsCount={meetsCount}
        totalCount={requirements.length}
        handicap={handicap}
        roundsPlayed={roundsPlayed}
      />

      {/* Requirements by Category */}
      {Object.entries(groupedRequirements).map(([category, reqs]) => (
        <div key={category} className="mb-6">
          <SubSectionTitle className="text-[15px] font-semibold text-tier-navy mb-3 flex items-center gap-2">
            {category}
            <span className="text-[12px] font-medium text-tier-text-secondary">
              ({reqs.filter((r) => r.met).length}/{reqs.length} oppfylt)
            </span>
          </SubSectionTitle>
          <div className="flex flex-col gap-2">
            {reqs.map((req) => (
              <RequirementCardSG key={req.id} requirement={req} />
            ))}
          </div>
        </div>
      ))}

      {/* Info Card */}
      <Card variant="default" padding="md" className="bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Om Strokes Gained Kategorikrav
            </p>
            <p className="text-sm text-blue-700">
              Kategorikravene er basert på Strokes Gained (SG) data fra Data Golf og professional tour.
              Positive SG-verdier betyr bedre enn tour-gjennomsnittet. Kravene er delt inn i granulære
              avstandskategorier for mer presis måling av ferdigheter.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default KategoriKravContainerSG;
