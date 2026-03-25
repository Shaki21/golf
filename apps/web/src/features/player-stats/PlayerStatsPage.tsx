/**
 * Player Stats Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What should I focus on to improve my game?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with SG summary and next action
 * Layer 2 (40%) — Control & Progress: SG Breakdown + Recent tests
 * Layer 3 (30%) — Operations & Admin: Quick links to detailed analysis
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { useStrokesGained } from '../../hooks/useStrokesGained';
import { useScreenView } from '../../analytics/useScreenView';
import { ExportButton } from '../../components/common/ExportButton';
import { getStrokesGainedIcon } from '../../constants/icons';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  ChevronRight,
  RefreshCw,
  Info,
  Trophy,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface StrokesGainedData {
  hasData: boolean;
  isDemo?: boolean;
  total: number;
  trend: number;
  percentile: number;
  byCategory: {
    approach: { value: number; tourAvg: number; pgaElite: number; testCount: number };
    around_green: { value: number; tourAvg: number; pgaElite: number; testCount: number };
    putting: { value: number; tourAvg: number; pgaElite: number; testCount: number };
  };
  recentTests: Array<{ date: string; category: string; sg: number; testName: string }>;
  weeklyTrend: Array<{ week: number; total: number }>;
}

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type StatsState =
  | 'needs_tests'        // No test data yet
  | 'weakness_detected'  // Clear area to improve
  | 'improving'          // Positive trend
  | 'declining'          // Negative trend
  | 'on_track';          // Stable performance

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

function computeStatsState(sgData: StrokesGainedData | null): { state: StatsState; action: PrimaryAction } {
  // Priority 1: No data
  if (!sgData || !sgData.hasData || sgData.isDemo) {
    return {
      state: 'needs_tests',
      action: {
        headline: 'Start tracking your performance',
        subtext: 'Complete tests to see your Strokes Gained analysis',
        ctaLabel: 'Register Test',
        ctaHref: '/trening/testing/registrer',
        urgency: 'medium',
      },
    };
  }

  // Find weakest category
  const categories = Object.entries(sgData.byCategory);
  const weakest = categories.reduce((min, [key, cat]) =>
    cat.value < min.value ? { key, ...cat } : min,
    { key: '', value: Infinity, tourAvg: 0, pgaElite: 0, testCount: 0 }
  );

  // Priority 2: Clear weakness (more than 0.5 below tour avg)
  if (weakest.value < weakest.tourAvg - 0.5) {
    const categoryLabels: Record<string, string> = {
      approach: 'Approach',
      around_green: 'Around Green',
      putting: 'Putting',
    };
    return {
      state: 'weakness_detected',
      action: {
        headline: `Focus on ${categoryLabels[weakest.key] || weakest.key}`,
        subtext: `Your ${categoryLabels[weakest.key]?.toLowerCase()} is ${Math.abs(weakest.value - weakest.tourAvg).toFixed(1)} strokes below tour average`,
        ctaLabel: 'View Analysis',
        ctaHref: '/statistikk/strokes-gained',
        urgency: 'high',
      },
    };
  }

  // Priority 3: Declining trend
  if (sgData.trend < -0.2) {
    return {
      state: 'declining',
      action: {
        headline: 'Performance trending down',
        subtext: `${sgData.trend.toFixed(2)} strokes gained this week - time to focus`,
        ctaLabel: 'View Trends',
        ctaHref: '/statistikk/strokes-gained',
        urgency: 'high',
      },
    };
  }

  // Priority 4: Improving
  if (sgData.trend > 0.2) {
    return {
      state: 'improving',
      action: {
        headline: 'Great progress!',
        subtext: `+${sgData.trend.toFixed(2)} strokes gained this week - keep it up`,
        ctaLabel: 'View Progress',
        ctaHref: '/statistikk/strokes-gained',
        urgency: 'low',
      },
    };
  }

  // Default: On track
  return {
    state: 'on_track',
    action: {
      headline: 'Performance is stable',
      subtext: 'Continue your training to maintain and improve',
      ctaLabel: 'View Statistics',
      ctaHref: '/statistikk/strokes-gained',
      urgency: 'low',
    },
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatSG = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '-';
  if (value > 0) return `+${value.toFixed(2)}`;
  return value.toFixed(2);
};

const getSGColorClass = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'text-tier-text-tertiary';
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-tier-text-secondary';
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'approach': return 'Approach';
    case 'around_green': return 'Around Green';
    case 'putting': return 'Putting';
    default: return category;
  }
};

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface StatsHeroCardProps {
  action: PrimaryAction;
  userName: string;
  sgTotal: number | null;
  trend: number;
  percentile: number;
}

function StatsHeroDecisionCard({ action, userName, sgTotal, trend, percentile }: StatsHeroCardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const urgencyColors = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-white border-tier-border-default',
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${urgencyColors[action.urgency]}`}>
      {/* Greeting + SG Badge */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-tier-text-secondary">
          {getGreeting()}, <span className="font-semibold text-tier-navy">{userName}</span>
        </h2>
        {sgTotal !== null && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            sgTotal >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {formatSG(sgTotal)} SG Total
          </span>
        )}
      </div>

      {/* Primary Action */}
      <h1 className="text-2xl md:text-3xl font-bold text-tier-navy mb-2">
        {action.headline}
      </h1>
      <p className="text-tier-text-secondary mb-6">
        {action.subtext}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={action.ctaHref}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors shadow-sm"
        >
          <BarChart3 size={18} />
          {action.ctaLabel}
        </Link>
        <Link
          to="/trening/testing/registrer"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-tier-border-default bg-white text-tier-navy font-medium hover:bg-tier-surface-subtle transition-colors"
        >
          <Target size={16} />
          Register Test
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// SG BREAKDOWN CARD
// =============================================================================

interface SGBreakdownCardProps {
  byCategory: StrokesGainedData['byCategory'] | undefined;
  selectedCategory: string | null;
  onSelectCategory: (key: string | null) => void;
}

function SGBreakdownCard({ byCategory, selectedCategory, onSelectCategory }: SGBreakdownCardProps) {
  if (!byCategory) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
        <h3 className="text-lg font-semibold text-tier-navy mb-4">Strokes Gained Breakdown</h3>
        <div className="text-center py-8 text-tier-text-secondary">
          <Target size={32} className="mx-auto mb-2 opacity-50" />
          <p>Complete tests to see your breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Strokes Gained Breakdown</h3>
        <Link
          to="/statistikk/strokes-gained"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Details
        </Link>
      </div>

      <div className="space-y-4">
        {Object.entries(byCategory).map(([key, cat]) => {
          const Icon = getStrokesGainedIcon(key);
          const isSelected = selectedCategory === key;
          const colorClass = getSGColorClass(cat.value);

          return (
            <div key={key}>
              <button
                onClick={() => onSelectCategory(isSelected ? null : key)}
                className="w-full flex items-center gap-3 p-3 -mx-3 rounded-lg hover:bg-tier-surface-subtle transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-tier-gold/10 text-tier-gold">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-tier-navy">{getCategoryLabel(key)}</div>
                  <div className="text-xs text-tier-text-secondary">{cat.testCount} tests</div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${colorClass}`}>{formatSG(cat.value)}</div>
                </div>
                <ChevronRight size={16} className={`text-tier-text-tertiary transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </button>

              {isSelected && (
                <div className="ml-13 pl-3 mt-2 pt-3 border-l-2 border-tier-border-subtle space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-tier-text-secondary">Tour Average</span>
                    <span className="text-tier-text-primary">{formatSG(cat.tourAvg)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-tier-text-secondary">PGA Elite</span>
                    <span className="text-green-600">{formatSG(cat.pgaElite)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-tier-text-secondary">Gap to Elite</span>
                    <span className={getSGColorClass(cat.value - cat.pgaElite)}>
                      {formatSG(cat.value - cat.pgaElite)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// RECENT TESTS CARD
// =============================================================================

interface RecentTestsCardProps {
  recentTests: StrokesGainedData['recentTests'] | undefined;
}

function RecentTestsCard({ recentTests }: RecentTestsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Recent Tests</h3>
        <Link
          to="/statistikk/testresultater"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>

      {!recentTests || recentTests.length === 0 ? (
        <div className="text-center py-8">
          <Target size={32} className="mx-auto mb-2 text-tier-text-tertiary opacity-50" />
          <p className="text-tier-text-secondary mb-4">No tests registered yet</p>
          <Link
            to="/trening/testing/registrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-tier-navy text-white text-sm font-medium hover:bg-tier-navy/90 transition-colors"
          >
            Register Test
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentTests.slice(0, 5).map((test, index) => {
            const Icon = getStrokesGainedIcon(test.category);
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-tier-surface-subtle text-tier-text-secondary">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-tier-navy truncate">{test.testName}</div>
                  <div className="text-xs text-tier-text-secondary">{test.date}</div>
                </div>
                <div className={`text-sm font-semibold ${getSGColorClass(test.sg)}`}>
                  {formatSG(test.sg)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// OPERATIONS SECTION
// =============================================================================

function StatsOperationsSection() {
  const operations = [
    { label: 'Strokes Gained Details', href: '/statistikk/strokes-gained', icon: BarChart3, description: 'Deep analysis and comparison' },
    { label: 'Test Results', href: '/statistikk/testresultater', icon: Target, description: 'Complete test history' },
    { label: 'Benchmark vs Elite', href: '/statistikk/benchmark', icon: Trophy, description: 'Compare with PGA & WAGR' },
    { label: 'Status & Progress', href: '/statistikk/status', icon: TrendingUp, description: 'Your progression over time' },
  ];

  return (
    <div className="bg-white rounded-xl border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle">
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          Explore Statistics
        </h3>
      </div>
      <div className="p-2">
        {operations.map((op) => (
          <Link
            key={op.href}
            to={op.href}
            className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-tier-surface-subtle transition-colors"
          >
            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
              <op.icon size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-tier-body font-medium text-tier-navy group-hover:text-tier-navy-dark">
                {op.label}
              </div>
              <div className="text-tier-footnote text-tier-text-secondary">
                {op.description}
              </div>
            </div>
            <ChevronRight size={16} className="text-tier-text-tertiary" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const PlayerStatsPage: React.FC = () => {
  useScreenView('Statistikk');
  const { user } = useAuth();
  const { data, loading, error, refetch } = useStrokesGained();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const playerId = user?.playerId || user?.id;
  const userName = user?.firstName || 'Player';
  const sgData = data as StrokesGainedData | null;

  // Compute state and action
  const { action } = computeStatsState(sgData);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Statistics"
          subtitle="Your game statistics"
        />
        <PageContainer paddingY="lg" background="base">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-white rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-white rounded-xl" />
              <div className="h-64 bg-white rounded-xl" />
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Error state
  if (error && !sgData) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Statistics"
          subtitle="Your game statistics"
        />
        <PageContainer paddingY="lg" background="base">
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-tier-navy mb-2">Could not load data</h3>
            <p className="text-tier-text-secondary mb-6">{error}</p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-tier-navy text-white rounded-lg hover:bg-tier-navy/90 transition-colors"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Statistics"
        subtitle="Your game statistics and Strokes Gained"
        helpText="Player statistics with Strokes Gained analysis. Dashboard showing your current golf performance with Total SG, SG Approach, SG Around Green and SG Putting."
      />

      <PageContainer paddingY="lg" background="base">
        {/* Demo banner */}
        {sgData?.isDemo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm flex items-center gap-2">
            <Info size={16} />
            <span>Showing demo data. Complete tests to see your own results.</span>
          </div>
        )}

        {/* Export buttons */}
        {playerId && !sgData?.isDemo && (
          <div className="flex justify-end gap-2 mb-4">
            <ExportButton
              type="statistics"
              playerId={playerId}
              variant="ghost"
              size="sm"
              label="Export Statistics"
            />
            <ExportButton
              type="testResults"
              playerId={playerId}
              variant="ghost"
              size="sm"
              label="Export Test Results"
            />
          </div>
        )}

        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with SG summary and next action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          <StatsHeroDecisionCard
            action={action}
            userName={userName}
            sgTotal={sgData?.total ?? null}
            trend={sgData?.trend ?? 0}
            percentile={sgData?.percentile ?? 0}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            SG Breakdown + Recent tests
            ============================================================ */}
        <section className="mb-8" aria-label="Statistics overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SGBreakdownCard
              byCategory={sgData?.byCategory}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
            <RecentTestsCard recentTests={sgData?.recentTests} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Quick links to detailed analysis
            ============================================================ */}
        <section aria-label="Statistics tools">
          <StatsOperationsSection />
        </section>
      </PageContainer>
    </div>
  );
};

export default PlayerStatsPage;
