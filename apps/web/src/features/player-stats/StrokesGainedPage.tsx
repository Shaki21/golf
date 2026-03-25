/**
 * Strokes Gained Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "Where am I gaining or losing strokes?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with total SG and weakest area
 * Layer 2 (40%) — Control & Progress: Category breakdown with expandable details
 * Layer 3 (30%) — Operations & Admin: Weekly trend chart
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Crosshair,
  CircleDot,
  Flag,
  Activity,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { useStrokesGained } from '../../hooks/useStrokesGained';
import { useScreenView } from '../../analytics/useScreenView';

// =============================================================================
// TYPES
// =============================================================================

interface CategoryData {
  value: number;
  tourAvg: number;
  pgaElite: number;
  testCount: number;
}

interface StrokesGainedData {
  hasData: boolean;
  isDemo?: boolean;
  total: number;
  trend: number;
  percentile: number;
  byCategory: {
    approach: CategoryData;
    around_green: CategoryData;
    putting: CategoryData;
  };
  recentTests: Array<{ date: string; category: string; sg: number; testName: string }>;
  weeklyTrend: Array<{ week: number; total: number }>;
}

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

function computeSGState(sgData: StrokesGainedData | null): PrimaryAction {
  // No data
  if (!sgData || !sgData.hasData) {
    return {
      headline: 'Start tracking your performance',
      subtext: 'Complete tests to see your Strokes Gained analysis',
      ctaLabel: 'Register Test',
      ctaHref: '/trening/testing/registrer',
      urgency: 'medium',
    };
  }

  // Find weakest category
  if (sgData.byCategory) {
    const categories = Object.entries(sgData.byCategory);
    const weakest = categories.reduce(
      (min, [key, cat]) => (cat.value < min.value ? { key, ...cat } : min),
      { key: '', value: Infinity, tourAvg: 0, pgaElite: 0, testCount: 0 }
    );

    // Clear weakness (significantly below tour average)
    if (weakest.value < weakest.tourAvg - 0.3) {
      const categoryLabel =
        weakest.key === 'approach'
          ? 'Approach'
          : weakest.key === 'around_green'
          ? 'Around Green'
          : 'Putting';

      return {
        headline: `Focus on ${categoryLabel}`,
        subtext: `You're losing ${Math.abs(weakest.value).toFixed(2)} strokes per round in this area`,
        ctaLabel: 'View Details',
        ctaHref: '#categories',
        urgency: 'high',
      };
    }
  }

  // Declining trend
  if (sgData.trend < -0.2) {
    return {
      headline: 'Performance trending down',
      subtext: `Down ${Math.abs(sgData.trend).toFixed(2)} strokes from last period`,
      ctaLabel: 'View Trends',
      ctaHref: '/statistikk?tab=trends',
      urgency: 'high',
    };
  }

  // Good performance
  if (sgData.total > 0) {
    return {
      headline: 'Above average performance',
      subtext: `You're gaining ${sgData.total.toFixed(2)} strokes vs field average`,
      ctaLabel: 'View Benchmark',
      ctaHref: '/statistikk?tab=benchmark',
      urgency: 'low',
    };
  }

  // Default
  return {
    headline: 'Analyze your game',
    subtext: 'Review your Strokes Gained breakdown by category',
    ctaLabel: 'View Categories',
    ctaHref: '#categories',
    urgency: 'medium',
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatSG(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  if (value > 0) return `+${value.toFixed(2)}`;
  return value.toFixed(2);
}

function getSGColorClass(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'text-tier-text-tertiary';
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-tier-text-secondary';
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'approach':
      return Crosshair;
    case 'around_green':
      return Flag;
    case 'putting':
      return CircleDot;
    default:
      return Target;
  }
}

function getCategoryInfo(category: string) {
  switch (category) {
    case 'approach':
      return {
        label: 'Approach',
        description: 'Shots from fairway/rough towards green (50-200m)',
        tips: [
          'Focus on precision over distance',
          'Practice various distances',
          'Work on lie variation',
        ],
      };
    case 'around_green':
      return {
        label: 'Around Green',
        description: 'Chipping, pitching and bunker shots within 50m',
        tips: [
          'Develop varied shot types',
          'Prioritize up-and-down practice',
          'Train on different surfaces',
        ],
      };
    case 'putting':
      return {
        label: 'Putting',
        description: 'All shots on the green',
        tips: [
          'Work on distances 1-3m',
          'Practice long putts for lag control',
          'Focus on green reading',
        ],
      };
    default:
      return { label: category, description: '', tips: [] };
  }
}

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface SGHeroCardProps {
  action: PrimaryAction;
  sgTotal: number | null;
  trend: number;
  percentile: number;
  testCount: number;
}

function SGHeroDecisionCard({
  action,
  sgTotal,
  trend,
  percentile,
  testCount,
}: SGHeroCardProps) {
  const urgencyColors = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-white border-tier-border-default',
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${urgencyColors[action.urgency]}`}>
      {/* Stats Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-lg text-tier-text-secondary">Strokes Gained Analysis</h2>
        <div className="flex items-center gap-2">
          {sgTotal !== null && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                sgTotal >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {formatSG(sgTotal)} Total
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tier-surface-subtle text-tier-text-secondary text-sm font-medium">
            Top {100 - percentile}%
          </span>
        </div>
      </div>

      {/* Primary Action */}
      <h1 className="text-2xl md:text-3xl font-bold text-tier-navy mb-2">
        {action.headline}
      </h1>
      <p className="text-tier-text-secondary mb-6">{action.subtext}</p>

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

      {/* Test count note */}
      <p className="mt-4 text-xs text-tier-text-tertiary">
        Based on {testCount} registered tests
      </p>
    </div>
  );
}

// =============================================================================
// TOUR SELECTOR
// =============================================================================

interface TourSelectorProps {
  selectedTour: 'pga' | 'euro' | 'kft';
  onSelect: (tour: 'pga' | 'euro' | 'kft') => void;
}

function TourSelector({ selectedTour, onSelect }: TourSelectorProps) {
  const tours = [
    { id: 'pga' as const, label: 'PGA' },
    { id: 'euro' as const, label: 'EURO' },
    { id: 'kft' as const, label: 'KFT' },
  ];

  return (
    <div className="flex items-center justify-between p-3 bg-tier-surface-subtle rounded-lg">
      <span className="text-sm text-tier-text-secondary">Compare with:</span>
      <div className="flex gap-2">
        {tours.map((tour) => (
          <button
            key={tour.id}
            onClick={() => onSelect(tour.id)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              selectedTour === tour.id
                ? 'bg-tier-navy text-white'
                : 'bg-white text-tier-text-secondary hover:bg-tier-surface-secondary'
            }`}
          >
            {tour.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// TOTAL OVERVIEW CARD
// =============================================================================

interface TotalOverviewCardProps {
  total: number;
  trend: number;
  percentile: number;
  testCount: number;
}

function TotalOverviewCard({ total, trend, percentile, testCount }: TotalOverviewCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <BarChart3 size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-tier-navy">Strokes Gained Total</h3>
            <p className="text-sm text-tier-text-tertiary">Based on {testCount} tests</p>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <span className={`text-4xl font-bold ${getSGColorClass(total)}`}>
              {formatSG(total)}
            </span>
            <div className="flex items-center gap-1 mt-1 text-sm">
              {trend >= 0 ? (
                <TrendingUp size={14} className="text-green-500" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              )}
              <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatSG(trend)} from previous
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-tier-surface-subtle flex items-baseline justify-center pt-4">
              <span className="text-2xl font-bold text-tier-navy">{percentile}</span>
              <span className="text-sm text-tier-text-tertiary">%</span>
            </div>
            <p className="text-xs text-tier-text-tertiary mt-1 max-w-[100px]">
              Better than {percentile}% at your level
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CATEGORY CARD
// =============================================================================

interface CategoryCardProps {
  categoryKey: string;
  data: CategoryData;
  isExpanded: boolean;
  onToggle: () => void;
}

function CategoryCard({ categoryKey, data, isExpanded, onToggle }: CategoryCardProps) {
  const Icon = getCategoryIcon(categoryKey);
  const info = getCategoryInfo(categoryKey);

  const calculateProgress = (current: number, elite: number) => {
    if (elite <= 0) return 0;
    const progress = ((current + 1) / (elite + 1)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const progress = calculateProgress(data.value, data.pgaElite);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default overflow-hidden">
      {/* Header */}
      <div
        onClick={onToggle}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-tier-surface-subtle transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-tier-gold/10 flex items-center justify-center">
            <Icon size={20} className="text-tier-gold" />
          </div>
          <div>
            <h4 className="font-semibold text-tier-navy">{info.label}</h4>
            <p className="text-xs text-tier-text-tertiary">{info.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-bold ${getSGColorClass(data.value)}`}>
            {formatSG(data.value)}
          </span>
          {isExpanded ? (
            <ChevronUp size={20} className="text-tier-text-tertiary" />
          ) : (
            <ChevronDown size={20} className="text-tier-text-tertiary" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-tier-border-subtle">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-tier-text-tertiary mb-2">
              <span>Your value</span>
              <span>PGA Elite ({formatSG(data.pgaElite)})</span>
            </div>
            <div className="h-2 bg-tier-surface-secondary rounded-full relative overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  data.value >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${progress}%` }}
              />
              <div className="absolute right-0 top-[-2px] w-0.5 h-3 bg-green-600" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-tier-surface-subtle p-3 rounded-lg text-center">
              <span className="block text-xs text-tier-text-tertiary mb-1">Your SG</span>
              <span className={`block text-lg font-bold ${getSGColorClass(data.value)}`}>
                {formatSG(data.value)}
              </span>
            </div>
            <div className="bg-tier-surface-subtle p-3 rounded-lg text-center">
              <span className="block text-xs text-tier-text-tertiary mb-1">Tour Avg</span>
              <span className="block text-lg font-bold text-tier-navy">
                {formatSG(data.tourAvg)}
              </span>
            </div>
            <div className="bg-tier-surface-subtle p-3 rounded-lg text-center">
              <span className="block text-xs text-tier-text-tertiary mb-1">PGA Elite</span>
              <span className="block text-lg font-bold text-green-600">
                {formatSG(data.pgaElite)}
              </span>
            </div>
            <div className="bg-tier-surface-subtle p-3 rounded-lg text-center">
              <span className="block text-xs text-tier-text-tertiary mb-1">Gap to Elite</span>
              <span
                className={`block text-lg font-bold ${getSGColorClass(
                  data.value - data.pgaElite
                )}`}
              >
                {formatSG(data.value - data.pgaElite)}
              </span>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-indigo-50 p-3 rounded-lg mb-3">
            <h5 className="text-sm font-medium text-tier-navy mb-2">Tips for improvement</h5>
            <ul className="list-disc list-inside space-y-1">
              {info.tips.map((tip, i) => (
                <li key={i} className="text-xs text-tier-text-secondary">
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Test Count */}
          <div className="flex items-center gap-2 text-xs text-tier-text-tertiary">
            <Target size={14} />
            <span>{data.testCount} tests registered</span>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// WEEKLY TREND CARD
// =============================================================================

interface WeeklyTrendCardProps {
  weeklyTrend: Array<{ week: number; total: number }>;
}

function WeeklyTrendCard({ weeklyTrend }: WeeklyTrendCardProps) {
  if (!weeklyTrend || weeklyTrend.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-tier-border-default overflow-hidden">
      <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle">
        <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
          Weekly Development
        </h3>
      </div>
      <div className="p-5">
        <div className="flex justify-around items-end h-[150px]">
          {weeklyTrend.map((week) => (
            <div key={week.week} className="flex flex-col items-center gap-1 flex-1">
              <div className="w-full max-w-[40px] h-20 bg-tier-surface-secondary rounded flex items-end overflow-hidden">
                <div
                  className={`w-full rounded transition-all duration-300 ${
                    week.total >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{
                    height: `${Math.max(20, (Math.abs(week.total) + 0.5) * 60)}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-tier-text-tertiary">Week {week.week}</span>
              <span className={`text-xs font-semibold ${getSGColorClass(week.total)}`}>
                {formatSG(week.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// INFO BANNER
// =============================================================================

function SGInfoBanner() {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
      <div className="flex gap-3">
        <Info size={20} className="text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-tier-text-secondary leading-relaxed">
            <strong>Strokes Gained</strong> measures how many strokes you gain or lose
            compared to a reference player. Positive values = better than average.
          </p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// DEMO NOTICE
// =============================================================================

function DemoNotice() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <Info size={18} className="text-blue-600" />
        <span className="text-sm text-tier-text-secondary">
          Showing demo data. Complete more tests to see your own results.
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const StrokesGainedPage: React.FC = () => {
  useScreenView('Strokes Gained');
  const { data, loading, error, refetch } = useStrokesGained();
  const [selectedTour, setSelectedTour] = useState<'pga' | 'euro' | 'kft'>('pga');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['approach', 'around_green', 'putting'])
  );

  const sgData = data as StrokesGainedData | null;

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const testCount = sgData?.byCategory
    ? Object.values(sgData.byCategory).reduce((sum, cat) => sum + cat.testCount, 0)
    : 0;

  const action = computeSGState(sgData);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Strokes Gained"
          subtitle="Detailed analysis"
          helpText="Strokes Gained analysis showing how many strokes you gain or lose compared to reference players."
        />
        <PageContainer paddingY="lg" background="base">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-white rounded-xl" />
            <div className="h-32 bg-white rounded-xl" />
            <div className="space-y-4">
              <div className="h-24 bg-white rounded-xl" />
              <div className="h-24 bg-white rounded-xl" />
              <div className="h-24 bg-white rounded-xl" />
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
        <PageHeader title="Strokes Gained" subtitle="Detailed analysis" />
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
        title="Strokes Gained"
        subtitle="Detailed analysis and comparison"
        helpText="Strokes Gained analysis showing how many strokes you gain or lose compared to reference players (PGA Tour, European Tour, Korn Ferry). Detailed breakdown per category: Approach (towards green), Around Green (short game), Putting. See total SG, trend, percentile, comparison with tour average and PGA Elite."
      />

      <PageContainer paddingY="lg" background="base">
        {/* Demo notice */}
        {sgData?.isDemo && (
          <div className="mb-6">
            <DemoNotice />
          </div>
        )}

        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with total SG and weakest area
            ============================================================ */}
        <section className="mb-8" aria-label="Strokes Gained overview">
          <SGHeroDecisionCard
            action={action}
            sgTotal={sgData?.total ?? null}
            trend={sgData?.trend ?? 0}
            percentile={sgData?.percentile ?? 0}
            testCount={testCount}
          />
        </section>

        {/* Info Banner */}
        <section className="mb-6">
          <SGInfoBanner />
        </section>

        {/* Tour Selection */}
        <section className="mb-6">
          <TourSelector selectedTour={selectedTour} onSelect={setSelectedTour} />
        </section>

        {/* Total Overview Card */}
        <section className="mb-8">
          <TotalOverviewCard
            total={sgData?.total ?? 0}
            trend={sgData?.trend ?? 0}
            percentile={sgData?.percentile ?? 0}
            testCount={testCount}
          />
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Category breakdown with expandable details
            ============================================================ */}
        <section className="mb-8" aria-label="Category analysis" id="categories">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
              Category Analysis
            </h2>
          </div>
          <div className="space-y-4">
            {sgData?.byCategory &&
              Object.entries(sgData.byCategory).map(([key, cat]) => (
                <CategoryCard
                  key={key}
                  categoryKey={key}
                  data={cat}
                  isExpanded={expandedCategories.has(key)}
                  onToggle={() => toggleCategory(key)}
                />
              ))}
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Weekly trend chart
            ============================================================ */}
        <section aria-label="Weekly development">
          {sgData?.weeklyTrend && <WeeklyTrendCard weeklyTrend={sgData.weeklyTrend} />}
        </section>
      </PageContainer>
    </div>
  );
};

export default StrokesGainedPage;
