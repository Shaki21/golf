/**
 * Test Protocol V5 - TIER Golf
 *
 * Test protocol page using TIER design system with Tailwind utilities.
 * Mobile-first responsive layout with semantic TIER tokens.
 *
 * Zones:
 * - Header: Player info + Quick stats
 * - Search: Filter tests
 * - Categories: Test groups by category
 * - Test Cards: Individual test items
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  Ruler,
  Target,
  Flag,
  Circle,
  Dumbbell,
  Activity,
  FlagTriangleRight,
  Brain,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Calendar,
  Search,
  Plus,
  X,
} from 'lucide-react';

// Hooks
import { useTestProtocols } from '../../hooks/useTrainingConfig';
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import Button from '../../ui/primitives/Button';
import { Card } from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';
import { Badge } from '../../components/shadcn/badge';

// Local Components
import StartTestModal from './StartTestModal';
import TestRegistrationForm from './TestRegistrationForm';
import { getScoreLevel, ScoringThresholds } from './config/testDefinitions';

// Services
import apiClient from '../../services/apiClient';

// AI Coach
import { AICoachGuide } from '../ai-coach';
import { GUIDE_PRESETS } from '../ai-coach/types';

// ============================================================================
// TYPES
// ============================================================================

interface TestResult {
  id: string;
  currentResult: number | null;
}

interface TestDefinition {
  id: string;
  testNumber: number;
  name: string;
  shortName: string;
  description: string;
  category: TestCategory;
  duration: string;
  unit: string;
  scoring: ScoringThresholds;
  lowerIsBetter: boolean;
  attempts?: number;
  formType?: string;
}

interface PlayerInfo {
  id?: string;
  firstName?: string;
  lastName?: string;
  category?: string;
  birthDate?: string;
  age?: number;
}

type TestCategory = 'speed' | 'distance' | 'accuracy' | 'short_game' | 'putting' | 'physical' | 'scoring' | 'mental' | 'endurance' | 'strength';

// ============================================================================
// CATEGORY CONFIGURATION
// ============================================================================

const CATEGORY_CONFIG: Record<TestCategory, {
  label: string;
  icon: React.ElementType;
  color: string;
  bgClass: string;
}> = {
  speed: {
    label: 'Speed',
    icon: Activity,
    color: '#0A2540',
    bgClass: 'bg-tier-navy/10',
  },
  distance: {
    label: 'Distance',
    icon: Ruler,
    color: '#14B8A6',
    bgClass: 'bg-teal-100',
  },
  accuracy: {
    label: 'Accuracy',
    icon: Target,
    color: '#8B5CF6',
    bgClass: 'bg-purple-100',
  },
  short_game: {
    label: 'Short Game',
    icon: Flag,
    color: '#10B981',
    bgClass: 'bg-emerald-100',
  },
  putting: {
    label: 'Putting',
    icon: Circle,
    color: '#0A2540',
    bgClass: 'bg-tier-navy/10',
  },
  physical: {
    label: 'Physical',
    icon: Dumbbell,
    color: '#EF4444',
    bgClass: 'bg-red-100',
  },
  endurance: {
    label: 'Endurance',
    icon: Activity,
    color: '#F97316',
    bgClass: 'bg-orange-100',
  },
  strength: {
    label: 'Strength',
    icon: Dumbbell,
    color: '#DC2626',
    bgClass: 'bg-red-200',
  },
  scoring: {
    label: 'Scoring',
    icon: FlagTriangleRight,
    color: '#C9A227',
    bgClass: 'bg-amber-100',
  },
  mental: {
    label: 'Mental',
    icon: Brain,
    color: '#6366F1',
    bgClass: 'bg-indigo-100',
  },
};

const CATEGORY_ORDER: TestCategory[] = [
  'speed', 'distance', 'accuracy', 'short_game', 'putting', 'physical', 'endurance', 'strength', 'scoring', 'mental'
];

// Map English category to Norwegian TestKategori
const CATEGORY_TO_KATEGORI: Record<TestCategory, string> = {
  speed: 'hastighet',
  distance: 'avstand',
  accuracy: 'presisjon',
  short_game: 'naerspill',
  putting: 'putting',
  physical: 'fysisk',
  scoring: 'scoring',
  mental: 'mental',
  endurance: 'fysisk', // Map endurance to fysisk
  strength: 'fysisk', // Map strength to fysisk
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Page Header with player info
 */
const TestHeader: React.FC<{
  playerName: string;
  category: string;
  initials: string;
  stats: {
    total: number;
    completed: number;
    passed: number;
  };
}> = ({ playerName, category, initials, stats }) => (
  <div className="flex flex-col gap-4 mb-6">
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold text-tier-navy">Test Protocol</h1>
        <p className="text-sm text-tier-navy/60">Complete overview of tests and results</p>
      </div>
    </div>

    {/* Player Card + Stats Row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Player Info */}
      <Card className="col-span-2 md:col-span-1 flex items-center gap-3 p-4">
        <div className="w-12 h-12 rounded-full bg-tier-navy flex items-center justify-center text-white font-semibold">
          {initials}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-tier-navy">{playerName}</span>
          <span className="text-xs text-tier-navy/60">Category {category}</span>
        </div>
      </Card>

      {/* Stats Cards */}
      <Card className="flex flex-col items-center justify-center p-4">
        <span className="text-2xl font-bold text-tier-success">{stats.passed}</span>
        <span className="text-xs text-tier-navy/60">Passed</span>
      </Card>

      <Card className="flex flex-col items-center justify-center p-4">
        <span className="text-2xl font-bold text-tier-navy">{stats.completed}</span>
        <span className="text-xs text-tier-navy/60">Completed</span>
      </Card>

      <Card className="flex flex-col items-center justify-center p-4">
        <span className="text-2xl font-bold text-tier-warning">{stats.total - stats.passed}</span>
        <span className="text-xs text-tier-navy/60">Focus Areas</span>
      </Card>
    </div>
  </div>
);

/**
 * Search Bar Component
 */
const SearchBar: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}> = ({ value, onChange, onClear }) => (
  <div className="relative mb-6">
    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-navy/40" />
    <input
      type="text"
      placeholder="Search tests..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-10 py-3 rounded-xl border border-tier-navy/20 bg-white text-tier-navy placeholder:text-tier-navy/40 focus:outline-none focus:ring-2 focus:ring-tier-navy/20 focus:border-tier-navy transition-all"
    />
    {value && (
      <button
        onClick={onClear}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-tier-navy/10 rounded-full transition-colors"
      >
        <X size={16} className="text-tier-navy/40" />
      </button>
    )}
  </div>
);

/**
 * Individual Test Card
 */
const TestCard: React.FC<{
  test: TestDefinition;
  result?: TestResult | null;
  onSelect: () => void;
}> = ({ test, result, onSelect }) => {
  const config = CATEGORY_CONFIG[test.category];
  const CategoryIcon = config.icon;

  const hasResult = result && result.currentResult !== null;
  const isValidScoring = test.scoring &&
    typeof test.scoring === 'object' &&
    'excellent' in test.scoring &&
    'good' in test.scoring &&
    'average' in test.scoring &&
    'needsWork' in test.scoring;
  const scoreLevel = hasResult && isValidScoring
    ? getScoreLevel(result.currentResult!, test.scoring as ScoringThresholds, test.lowerIsBetter)
    : null;

  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-tier-navy/10 cursor-pointer hover:border-tier-navy/30 hover:shadow-sm transition-all group"
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${config.color}15` }}
      >
        <CategoryIcon size={22} style={{ color: config.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-sm font-semibold text-tier-navy group-hover:text-tier-navy/80 transition-colors truncate block">
              {test.shortName}
            </span>
            <span className="text-xs text-tier-navy/60">
              Test {test.testNumber} · {test.duration}
            </span>
          </div>

          {/* Status Badge */}
          <Badge
            variant={hasResult ? 'default' : 'secondary'}
            className={`flex items-center gap-1 ${
              hasResult ? 'bg-tier-success/10 text-tier-success' : ''
            }`}
          >
            {hasResult ? (
              <>
                <CheckCircle2 size={12} />
                Done
              </>
            ) : (
              <>
                <Clock size={12} />
                Pending
              </>
            )}
          </Badge>
        </div>

        {/* Result Preview */}
        {hasResult && (
          <div className="mt-2 pt-2 border-t border-tier-navy/10 flex items-center justify-between">
            <span className="text-xs text-tier-navy/60">Latest result:</span>
            <span
              className="text-sm font-semibold"
              style={{ color: scoreLevel?.color || '#0A2540' }}
            >
              {result.currentResult}{test.unit}
            </span>
          </div>
        )}
      </div>

      <ChevronRight size={18} className="text-tier-navy/40 group-hover:text-tier-navy transition-colors flex-shrink-0" />
    </div>
  );
};

/**
 * Category Section with Tests
 */
const CategorySection: React.FC<{
  category: TestCategory;
  tests: TestDefinition[];
  results?: TestResult[];
  onTestSelect: (test: TestDefinition) => void;
}> = ({ category, tests, results, onTestSelect }) => {
  const config = CATEGORY_CONFIG[category];
  const CategoryIcon = config.icon;

  return (
    <div className="mb-6">
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <CategoryIcon size={18} style={{ color: config.color }} />
        </div>
        <h2 className="text-base font-semibold text-tier-navy">{config.label}</h2>
        <span className="text-sm text-tier-navy/60">
          ({tests.length} {tests.length === 1 ? 'test' : 'tests'})
        </span>
      </div>

      {/* Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tests.map((test) => (
          <TestCard
            key={test.id}
            test={test}
            result={results?.find((r) => r.id === test.testNumber.toString() || r.id === test.id)}
            onSelect={() => onTestSelect(test)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Empty Search State
 */
const EmptySearchState: React.FC<{ query: string }> = ({ query }) => (
  <Card className="flex flex-col items-center justify-center py-12">
    <Search size={48} className="mb-4 text-tier-navy/20" />
    <h3 className="text-base font-semibold text-tier-navy mb-1">No tests found</h3>
    <p className="text-sm text-tier-navy/60">
      No results for "{query}". Try another search term.
    </p>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface TestprotokollV5Props {
  player?: PlayerInfo | null;
  tests?: TestResult[] | null;
  onRefresh?: () => Promise<void>;
}

export default function TestprotokollV5({
  player: apiPlayer = null,
  tests: apiTests = null,
  onRefresh = undefined,
}: TestprotokollV5Props) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestDefinition | null>(null);

  // Get test protocols
  const { protocols: testDefinitions } = useTestProtocols();

  // Player info
  const player = useMemo(() => {
    if (apiPlayer) {
      return {
        name: `${apiPlayer.firstName || ''} ${apiPlayer.lastName || ''}`.trim() || 'Player',
        category: apiPlayer.category || 'B',
        age: apiPlayer.age || (apiPlayer.birthDate
          ? Math.floor((Date.now() - new Date(apiPlayer.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null),
      };
    }
    return {
      name: (user as { name?: string })?.name || 'Player',
      category: (user as { category?: string })?.category || 'B',
      age: null,
    };
  }, [apiPlayer, user]);

  const initials = player.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'PL';

  // Group tests by category
  const testsByCategory = useMemo(() => {
    const grouped: Partial<Record<TestCategory, TestDefinition[]>> = {};
    CATEGORY_ORDER.forEach((cat) => {
      const categoryTests = testDefinitions.filter((t) => t.category === cat) as TestDefinition[];
      if (categoryTests.length > 0) {
        grouped[cat] = categoryTests;
      }
    });
    return grouped;
  }, [testDefinitions]);

  // Filter tests by search
  const filteredTestsByCategory = useMemo(() => {
    if (!searchQuery.trim()) return testsByCategory;

    const query = searchQuery.toLowerCase();
    const filtered: Partial<Record<TestCategory, TestDefinition[]>> = {};

    Object.entries(testsByCategory).forEach(([cat, tests]) => {
      const matchingTests = (tests as TestDefinition[]).filter((t) =>
        t.name.toLowerCase().includes(query) ||
        t.shortName.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
      if (matchingTests.length > 0) {
        filtered[cat as TestCategory] = matchingTests;
      }
    });

    return filtered;
  }, [testsByCategory, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalTests = testDefinitions.length;
    const completedTests = apiTests?.filter(
      (t) => t.currentResult !== null && t.currentResult !== undefined
    ).length ?? 0;
    const passedTests = 0; // Would need actual requirement checking

    return {
      total: totalTests,
      completed: completedTests,
      passed: passedTests,
    };
  }, [testDefinitions, apiTests]);

  // Handle test submission
  const handleSubmitTestResult = async (resultData: {
    testId: string;
    testDate: string;
    value: number;
    results: unknown;
    passed: boolean;
  }) => {
    try {
      await apiClient.post('/tests/results', {
        testId: resultData.testId,
        playerId: apiPlayer?.id,
        testDate: resultData.testDate,
        value: resultData.value,
        results: resultData.results,
        passed: resultData.passed,
      });

      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Error submitting test result:', error);
      throw error;
    }
  };

  // Handle test selection
  const handleTestSelect = (test: TestDefinition) => {
    navigate(`/testing/${test.id}`);
  };

  return (
    <div className="flex flex-col gap-5 p-4 w-full">
      {/* Header */}
      <TestHeader
        playerName={player.name}
        category={player.category}
        initials={initials}
        stats={stats}
      />

      {/* AI Coach Guide */}
      <AICoachGuide config={GUIDE_PRESETS.tests} />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      {/* Section Header with New Test Button */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-tier-navy">
            All {testDefinitions.length} Tests
          </h2>
          <p className="text-xs text-tier-navy/60">
            Select a test to view details and register results
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={16} />}
          onClick={() => setShowNewTestModal(true)}
        >
          New Test
        </Button>
      </div>

      {/* Test Categories */}
      {Object.keys(filteredTestsByCategory).length > 0 ? (
        Object.entries(filteredTestsByCategory).map(([category, tests]) => (
          <CategorySection
            key={category}
            category={category as TestCategory}
            tests={tests as TestDefinition[]}
            results={apiTests ?? undefined}
            onTestSelect={handleTestSelect}
          />
        ))
      ) : searchQuery ? (
        <EmptySearchState query={searchQuery} />
      ) : (
        <StateCard
          variant="empty"
          title="No tests available"
          description="Test protocols are not yet configured"
        />
      )}

      {/* Info Card */}
      <Card className="p-4 bg-tier-navy/5 border-tier-navy/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-tier-navy/10 flex items-center justify-center flex-shrink-0">
            <Activity size={20} className="text-tier-navy" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-tier-navy mb-1">About the test protocol</h3>
            <p className="text-xs text-tier-navy/60 leading-relaxed">
              The test protocol contains official tests based on Team Norway standards.
              Benchmarks are conducted every 3 weeks. For category {player.category},
              a minimum of 4 out of 7 golf tests must be passed for promotion.
            </p>
          </div>
        </div>
      </Card>

      {/* Test Registration Modal */}
      {showNewTestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-tier-navy/10">
              <h3 className="text-base font-semibold text-tier-navy">Select test to register</h3>
              <button
                onClick={() => setShowNewTestModal(false)}
                className="p-2 hover:bg-tier-navy/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-tier-navy/60" />
              </button>
            </div>

            {/* Test List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(testDefinitions as TestDefinition[]).map((test) => {
                  const config = CATEGORY_CONFIG[test.category];
                  const CategoryIcon = config.icon;

                  return (
                    <button
                      key={test.id}
                      onClick={() => {
                        setSelectedTest(test);
                        setShowNewTestModal(false);
                      }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-tier-navy/10 hover:border-tier-navy/30 hover:bg-tier-navy/5 transition-all text-left group"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${config.color}15` }}
                      >
                        <CategoryIcon size={20} style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-tier-navy group-hover:text-tier-navy/80 transition-colors block">
                          {test.shortName}
                        </span>
                        <span className="text-xs text-tier-navy/60 truncate block">
                          {config.label} · {test.attempts || 6} attempts
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-tier-navy/40 group-hover:text-tier-navy transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Test Registration Form */}
      {selectedTest && (
        <TestRegistrationForm
          test={{
            id: selectedTest.id,
            navn: selectedTest.name,
            beskrivelse: selectedTest.description,
            maling: selectedTest.unit,
            registrering: selectedTest.formType || 'simple',
            slag: Array.from({ length: selectedTest.attempts || 6 }, (_, i) => ({
              nr: i + 1,
              slagType: selectedTest.shortName,
              målLengde: 0,
              resultatLengde: null,
              poeng: null,
            })),
          }}
          playerId={apiPlayer?.id}
          kategori={CATEGORY_TO_KATEGORI[selectedTest.category] as 'presisjon' | 'hastighet' | 'avstand' | 'naerspill' | 'putting' | 'fysisk' | 'scoring' | 'mental'}
          onSubmit={async (result) => {
            await handleSubmitTestResult({
              testId: result.testId,
              value: result.totalPoeng,
              results: { slag: result.slag },
              testDate: result.dato?.toISOString() || new Date().toISOString(),
              passed: true,
            });
            if (onRefresh) await onRefresh();
          }}
          onClose={() => setSelectedTest(null)}
        />
      )}
    </div>
  );
}
