/**
 * Strokes Gained Page V5 - TIER Golf
 *
 * Comprehensive Strokes Gained analysis page using TIER design system.
 * Mobile-first responsive layout with semantic TIER tokens.
 *
 * Zones:
 * - Header: Total SG + Period selector
 * - Category Breakdown: SG by TEE/APPROACH/SHORT_GAME/PUTTING
 * - Comparison: vs Tour avg, vs Self, vs Peer group
 * - Trend Chart: SG over time
 * - Shot Details: Recent shot-level data
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Flag,
  CircleDot,
  Activity,
  BarChart3,
  ChevronRight,
  Calendar,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  User,
  Globe,
} from 'lucide-react';

// Hooks
import { useAuth } from '../../contexts/AuthContext';
import { useStrokesGainedDashboard, usePlayerRounds } from '../../hooks/useManualStats';

// UI Components
import Button from '../../ui/primitives/Button';
import { Card } from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';
import { Badge } from '../../components/shadcn/badge';
import { GolfAreaChart, chartColors } from '../../components/shadcn/chart';

// AI Coach
import { AICoachGuide } from '../ai-coach';
import { GUIDE_PRESETS } from '../ai-coach/types';

// Feature Components
import BenchmarkComparison from './components/BenchmarkComparison';
import SGGoalTracker from './components/SGGoalTracker';

// ============================================================================
// TYPES
// ============================================================================

interface SGCategory {
  id: 'tee' | 'approach' | 'short_game' | 'putting';
  name: string;
  value: number;
  shotCount: number;
  trend: 'up' | 'down' | 'neutral';
  change: string;
  benchmarkDiff: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface SGComparison {
  label: string;
  value: number;
  icon: React.ReactNode;
}

interface SGTrendData {
  name: string;
  Total: number;
  Tee: number;
  Approach: number;
  ShortGame: number;
  Putting: number;
  [key: string]: string | number;
}

interface RecentRound {
  id: string;
  course: string;
  date: string;
  score: number;
  sgTotal: number;
  sgTee: number;
  sgApproach: number;
  sgShortGame: number;
  sgPutting: number;
}

type TimePeriod = '7d' | '30d' | '90d' | 'season';
type ComparisonType = 'tour' | 'self' | 'peers';

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_CONFIG = {
  tee: {
    name: 'Off the Tee',
    icon: Activity,
    color: '#0A2540',
    description: 'Drives and tee shots on par 4s/5s',
  },
  approach: {
    name: 'Approach',
    icon: Target,
    color: '#10B981',
    description: 'Shots from 100+ yards into the green',
  },
  short_game: {
    name: 'Short Game',
    icon: Flag,
    color: '#C9A227',
    description: 'Chips, pitches, and bunker shots under 50m',
  },
  putting: {
    name: 'Putting',
    icon: CircleDot,
    color: '#8B5CF6',
    description: 'All putts on the green',
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Page Header with total SG and period selector
 */
const SGHeader: React.FC<{
  totalSG: number;
  trend: 'up' | 'down' | 'neutral';
  change: string;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}> = ({ totalSG, trend, change, period, onPeriodChange }) => {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: 'season', label: 'Season' },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-tier-navy">Strokes Gained</h1>
          <p className="text-sm text-tier-navy/60">Analyze your performance vs baseline</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <BarChart3 size={14} />
          Analysis
        </Badge>
      </div>

      {/* Total SG Card */}
      <Card className="p-5 bg-gradient-to-br from-tier-navy to-tier-navy/90">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-white/70">Total Strokes Gained</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-4xl font-bold ${totalSG >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
                {totalSG >= 0 ? '+' : ''}{totalSG.toFixed(2)}
              </span>
              <div className={`flex items-center gap-1 text-sm ${
                trend === 'up' ? 'text-tier-success' :
                trend === 'down' ? 'text-tier-error' :
                'text-white/60'
              }`}>
                {trend === 'up' ? <ArrowUpRight size={16} /> :
                 trend === 'down' ? <ArrowDownRight size={16} /> :
                 <Minus size={16} />}
                {change}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/60">Per round avg</span>
            <span className="block text-white text-lg font-semibold">8 rounds</span>
          </div>
        </div>
      </Card>

      {/* Period Tabs */}
      <div className="flex gap-2 p-1 bg-tier-navy/5 rounded-lg">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => onPeriodChange(p.value)}
            className={`
              flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all
              ${period === p.value
                ? 'bg-white text-tier-navy shadow-sm'
                : 'text-tier-navy/60 hover:text-tier-navy'
              }
            `}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Category Breakdown Card
 */
const CategoryBreakdown: React.FC<{
  categories: SGCategory[];
  onCategoryClick: (id: string) => void;
}> = ({ categories, onCategoryClick }) => (
  <Card>
    <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
      <h3 className="text-base font-semibold text-tier-navy">Category Breakdown</h3>
      <Button variant="ghost" size="sm">
        <Info size={16} />
      </Button>
    </div>

    <div className="divide-y divide-tier-navy/10">
      {categories.map((cat) => {
        const config = CATEGORY_CONFIG[cat.id];
        const CategoryIcon = config.icon;

        return (
          <div
            key={cat.id}
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-tier-navy/5 transition-colors"
            onClick={() => onCategoryClick(cat.id)}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${config.color}15` }}
            >
              <CategoryIcon size={22} style={{ color: config.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-tier-navy">{config.name}</span>
                <span className={`text-sm font-bold ${cat.value >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
                  {cat.value >= 0 ? '+' : ''}{cat.value.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-tier-navy/60">{cat.shotCount} shots</span>
                <div className={`flex items-center gap-1 text-xs ${
                  cat.trend === 'up' ? 'text-tier-success' :
                  cat.trend === 'down' ? 'text-tier-error' :
                  'text-tier-navy/60'
                }`}>
                  {cat.trend === 'up' ? <TrendingUp size={12} /> :
                   cat.trend === 'down' ? <TrendingDown size={12} /> :
                   <Minus size={12} />}
                  {cat.change}
                </div>
              </div>

              {/* Mini progress bar showing relative strength */}
              <div className="mt-2 h-1.5 bg-tier-navy/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat.value >= 0 ? 'bg-tier-success' : 'bg-tier-error'}`}
                  style={{ width: `${Math.min(Math.abs(cat.value) * 30 + 50, 100)}%` }}
                />
              </div>
            </div>

            <ChevronRight size={18} className="text-tier-navy/40" />
          </div>
        );
      })}
    </div>
  </Card>
);

/**
 * Comparison Selector and Display
 */
const ComparisonCard: React.FC<{
  type: ComparisonType;
  onTypeChange: (type: ComparisonType) => void;
  comparisons: SGComparison[];
}> = ({ type, onTypeChange, comparisons }) => {
  const types: { value: ComparisonType; label: string; icon: React.ReactNode }[] = [
    { value: 'tour', label: 'vs Tour', icon: <Globe size={14} /> },
    { value: 'self', label: 'vs Self', icon: <User size={14} /> },
    { value: 'peers', label: 'vs Peers', icon: <Users size={14} /> },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
        <h3 className="text-base font-semibold text-tier-navy">Comparison</h3>

        {/* Type Toggle */}
        <div className="flex gap-1 p-0.5 bg-tier-navy/5 rounded-lg">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => onTypeChange(t.value)}
              className={`
                flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-all
                ${type === t.value
                  ? 'bg-white text-tier-navy shadow-sm'
                  : 'text-tier-navy/60 hover:text-tier-navy'
                }
              `}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 p-4">
        {comparisons.map((comp, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <span className={`text-lg font-bold ${comp.value >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
              {comp.value >= 0 ? '+' : ''}{comp.value.toFixed(1)}
            </span>
            <span className="text-xs text-tier-navy/60">{comp.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * Trend Chart Card
 */
const TrendChartCard: React.FC<{
  data: SGTrendData[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}> = ({ data, selectedCategory, onCategorySelect }) => {
  const categories = ['Total', 'Tee', 'Approach', 'ShortGame', 'Putting'];

  return (
    <Card>
      <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-tier-gold" />
          <h3 className="text-base font-semibold text-tier-navy">Trend</h3>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1">
          {categories.slice(0, 3).map((cat) => (
            <button
              key={cat}
              onClick={() => onCategorySelect(cat)}
              className={`
                px-2 py-1 text-xs font-medium rounded transition-all
                ${selectedCategory === cat
                  ? 'bg-tier-navy text-white'
                  : 'text-tier-navy/60 hover:text-tier-navy hover:bg-tier-navy/5'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {data.length > 1 ? (
          <>
            <GolfAreaChart
              data={data}
              dataKeys={[selectedCategory]}
              xAxisKey="name"
              colors={[chartColors.success]}
              height={180}
              stacked={false}
            />
            <p className="text-xs text-tier-navy/60 text-center mt-3">
              {selectedCategory} Strokes Gained per round
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <BarChart3 size={40} className="mb-3 text-tier-navy/20" />
            <p className="text-sm font-semibold text-tier-navy">Not enough data yet</p>
            <p className="text-xs text-tier-navy/60 mt-1">
              Log more rounds to see your trend
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Recent Rounds Card
 */
const RecentRoundsCard: React.FC<{
  rounds: RecentRound[];
  onRoundClick: (id: string) => void;
  onViewAll: () => void;
}> = ({ rounds, onRoundClick, onViewAll }) => (
  <Card>
    <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <Calendar size={20} className="text-tier-gold" />
        <h3 className="text-base font-semibold text-tier-navy">Recent Rounds</h3>
      </div>
      <Button variant="ghost" size="sm" onClick={onViewAll}>
        View all
      </Button>
    </div>

    {rounds.length === 0 ? (
      <div className="flex flex-col items-center gap-3 p-6">
        <Flag size={40} className="text-tier-navy/20" />
        <p className="text-sm text-tier-navy/60">No rounds logged yet</p>
        <Button variant="secondary" size="sm">
          Log first round
        </Button>
      </div>
    ) : (
      <div className="divide-y divide-tier-navy/10">
        {rounds.slice(0, 4).map((round) => (
          <div
            key={round.id}
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-tier-navy/5 transition-colors"
            onClick={() => onRoundClick(round.id)}
          >
            <div className="flex-1">
              <span className="text-sm font-semibold text-tier-navy">{round.course}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-tier-navy/60">{round.date}</span>
                <span className="text-xs text-tier-navy/40">·</span>
                <span className="text-xs font-medium text-tier-navy">{round.score}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${round.sgTotal >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
                {round.sgTotal >= 0 ? '+' : ''}{round.sgTotal.toFixed(1)}
              </span>
              <ChevronRight size={16} className="text-tier-navy/40" />
            </div>
          </div>
        ))}
      </div>
    )}
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StrokesGainedPageV5() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const playerId = (user as { playerId?: string })?.playerId;

  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [comparisonType, setComparisonType] = useState<ComparisonType>('tour');
  const [selectedTrendCategory, setSelectedTrendCategory] = useState('Total');

  // Fetch real data from API
  const { summary, chartData, recentRounds: apiRounds, isLoading } = useStrokesGainedDashboard(playerId);
  const { data: allRounds } = usePlayerRounds(playerId, { limit: 10 });

  // Build SG categories from summary data
  const sgCategories: SGCategory[] = useMemo(() => {
    if (!summary) {
      return [
        { id: 'tee', name: 'Off the Tee', value: 0, shotCount: 0, trend: 'neutral', change: '0.00', benchmarkDiff: 0, icon: <Activity size={20} />, color: '#0A2540', description: 'Drives and tee shots' },
        { id: 'approach', name: 'Approach', value: 0, shotCount: 0, trend: 'neutral', change: '0.00', benchmarkDiff: 0, icon: <Target size={20} />, color: '#10B981', description: 'Approach shots' },
        { id: 'short_game', name: 'Short Game', value: 0, shotCount: 0, trend: 'neutral', change: '0.00', benchmarkDiff: 0, icon: <Flag size={20} />, color: '#C9A227', description: 'Chips and pitches' },
        { id: 'putting', name: 'Putting', value: 0, shotCount: 0, trend: 'neutral', change: '0.00', benchmarkDiff: 0, icon: <CircleDot size={20} />, color: '#8B5CF6', description: 'Putting' },
      ];
    }

    const formatChange = (trend: 'up' | 'down' | 'neutral' | undefined, value: number) => {
      if (!trend) return '0.00';
      const sign = trend === 'up' ? '+' : trend === 'down' ? '-' : '';
      return `${sign}${Math.abs(value * 0.1).toFixed(2)}`; // Approximate change
    };

    return [
      {
        id: 'tee',
        name: 'Off the Tee',
        value: summary.sgTee ?? 0,
        shotCount: 0, // Would need shot count data from API
        trend: summary.trends?.sgTee ?? 'neutral',
        change: formatChange(summary.trends?.sgTee, summary.sgTee ?? 0),
        benchmarkDiff: summary.sgTee ?? 0,
        icon: <Activity size={20} />,
        color: '#0A2540',
        description: 'Drives and tee shots',
      },
      {
        id: 'approach',
        name: 'Approach',
        value: summary.sgApproach ?? 0,
        shotCount: 0,
        trend: summary.trends?.sgApproach ?? 'neutral',
        change: formatChange(summary.trends?.sgApproach, summary.sgApproach ?? 0),
        benchmarkDiff: summary.sgApproach ?? 0,
        icon: <Target size={20} />,
        color: '#10B981',
        description: 'Approach shots',
      },
      {
        id: 'short_game',
        name: 'Short Game',
        value: summary.sgShortGame ?? 0,
        shotCount: 0,
        trend: summary.trends?.sgShortGame ?? 'neutral',
        change: formatChange(summary.trends?.sgShortGame, summary.sgShortGame ?? 0),
        benchmarkDiff: summary.sgShortGame ?? 0,
        icon: <Flag size={20} />,
        color: '#C9A227',
        description: 'Chips and pitches',
      },
      {
        id: 'putting',
        name: 'Putting',
        value: summary.sgPutting ?? 0,
        shotCount: 0,
        trend: summary.trends?.sgPutting ?? 'neutral',
        change: formatChange(summary.trends?.sgPutting, summary.sgPutting ?? 0),
        benchmarkDiff: summary.sgPutting ?? 0,
        icon: <CircleDot size={20} />,
        color: '#8B5CF6',
        description: 'Putting',
      },
    ];
  }, [summary]);

  const totalSG = summary?.sgTotal ?? sgCategories.reduce((sum, cat) => sum + cat.value, 0);

  // Comparison data from summary
  const comparisons: SGComparison[] = useMemo(() => [
    { label: 'Tee', value: summary?.sgTee ?? 0, icon: <Activity size={14} /> },
    { label: 'App', value: summary?.sgApproach ?? 0, icon: <Target size={14} /> },
    { label: 'Short', value: summary?.sgShortGame ?? 0, icon: <Flag size={14} /> },
    { label: 'Putt', value: summary?.sgPutting ?? 0, icon: <CircleDot size={14} /> },
  ], [summary]);

  // Trend data from chartData
  const trendData: SGTrendData[] = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [];
    }
    return chartData.map((week) => ({
      name: week.name,
      Total: week.Total ?? 0,
      Tee: week.Tee ?? 0,
      Approach: week.Approach ?? 0,
      ShortGame: week.ShortGame ?? 0,
      Putting: week.Putting ?? 0,
    }));
  }, [chartData]);

  // Transform recent rounds from API data
  const recentRounds: RecentRound[] = useMemo(() => {
    if (!allRounds) return [];
    return allRounds
      .filter(r => r.status === 'FINALIZED')
      .slice(0, 4)
      .map(r => ({
        id: r.id,
        course: r.courseName || 'Unknown Course',
        date: new Date(r.roundDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: r.totalScore ?? 0,
        sgTotal: 0, // Would need SG data per round from API
        sgTee: 0,
        sgApproach: 0,
        sgShortGame: 0,
        sgPutting: 0,
      }));
  }, [allRounds]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard variant="loading" title="Loading Strokes Gained data..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4 w-full">
      {/* Header with Total SG and Period Selector */}
      <SGHeader
        totalSG={totalSG}
        trend={summary?.trends?.sgTotal ?? 'neutral'}
        change={summary?.trends?.sgTotal === 'up' ? '+0.1' : summary?.trends?.sgTotal === 'down' ? '-0.1' : '0.0'}
        period={period}
        onPeriodChange={setPeriod}
      />

      {/* AI Coach Guide */}
      <AICoachGuide config={GUIDE_PRESETS.strokesGained} />

      {/* Category Breakdown */}
      <section className="flex flex-col gap-3">
        <CategoryBreakdown
          categories={sgCategories}
          onCategoryClick={(id) => navigate(`/strokes-gained/${id}`)}
        />
      </section>

      {/* Benchmark Comparison */}
      <section className="flex flex-col gap-3">
        <BenchmarkComparison
          playerData={{
            sgTotal: totalSG,
            sgTee: summary?.sgTee ?? 0,
            sgApproach: summary?.sgApproach ?? 0,
            sgShortGame: summary?.sgShortGame ?? 0,
            sgPutting: summary?.sgPutting ?? 0,
          }}
        />
      </section>

      {/* SG Goals */}
      <section className="flex flex-col gap-3">
        <SGGoalTracker
          goals={[]}
          currentSG={{
            total: totalSG,
            tee: summary?.sgTee ?? 0,
            approach: summary?.sgApproach ?? 0,
            shortGame: summary?.sgShortGame ?? 0,
            putting: summary?.sgPutting ?? 0,
          }}
          onAddGoal={(category, target, deadline) => {
            console.log('Add goal:', category, target, deadline);
            // TODO: Connect to goals API
          }}
        />
      </section>

      {/* Trend Chart */}
      <section className="flex flex-col gap-3">
        <TrendChartCard
          data={trendData}
          selectedCategory={selectedTrendCategory}
          onCategorySelect={setSelectedTrendCategory}
        />
      </section>

      {/* Recent Rounds */}
      <section className="flex flex-col gap-3">
        <RecentRoundsCard
          rounds={recentRounds}
          onRoundClick={(id) => navigate(`/rounds/${id}`)}
          onViewAll={() => navigate('/rounds')}
        />
      </section>
    </div>
  );
}
