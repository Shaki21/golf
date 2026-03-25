/**
 * Stats Page V5 - TIER Golf
 *
 * Player statistics dashboard using TIER design system with Tailwind utilities.
 * Mobile-first responsive layout with semantic TIER tokens.
 *
 * Zones:
 * - Header: Stats Overview + Period Selector
 * - KPIs: Key metrics in card grid
 * - Trends: Training trend visualization
 * - Category Breakdown: Performance by training area
 * - Recent Activity: Latest sessions
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Calendar,
  ChevronRight,
  BarChart3,
  Activity,
  Flame,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Hooks
import { useStats } from '../../data';
import { useTrainingAnalytics } from '../../hooks/useTrainingAnalytics';
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import Button from '../../ui/primitives/Button';
import { Card } from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';
import { Badge } from '../../components/shadcn/badge';
import { GolfAreaChart, chartColors } from '../../components/shadcn/chart';

// AI Coach
import { AICoachGuide } from '../ai-coach';
import { GUIDE_PRESETS } from '../ai-coach/types';

// ============================================================================
// TYPES
// ============================================================================

interface StatKPI {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
  color?: string;
}

interface TrainingCategory {
  id: string;
  name: string;
  sessions: number;
  hours: number;
  trend: 'up' | 'down' | 'neutral';
  progress: number;
  icon: React.ReactNode;
}

interface RecentSession {
  id: string;
  title: string;
  type: string;
  duration: string;
  date: string;
  score?: number;
}

type TimePeriod = '7d' | '30d' | '90d' | 'all';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Page Header with period selector
 */
const StatsHeader: React.FC<{
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}> = ({ period, onPeriodChange }) => {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: 'all', label: 'All time' },
  ];

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-tier-navy">Statistics</h1>
          <p className="text-sm text-tier-navy/60">Track your training progress</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <BarChart3 size={14} />
          Overview
        </Badge>
      </div>

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
 * KPI Card Component
 */
const KPICard: React.FC<{ stat: StatKPI }> = ({ stat }) => (
  <Card className="flex items-center gap-3 p-4">
    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-tier-navy/5">
      {stat.icon}
    </div>
    <div className="flex flex-col flex-1">
      <span className="text-xl font-bold text-tier-navy">{stat.value}</span>
      <span className="text-xs text-tier-navy/60">{stat.label}</span>
    </div>
    {stat.change && (
      <div className={`flex items-center gap-0.5 text-xs font-semibold ${
        stat.trend === 'up' ? 'text-tier-success' :
        stat.trend === 'down' ? 'text-tier-error' :
        'text-tier-navy/60'
      }`}>
        {stat.trend === 'up' ? <ArrowUpRight size={14} /> :
         stat.trend === 'down' ? <ArrowDownRight size={14} /> : null}
        {stat.change}
      </div>
    )}
  </Card>
);

/**
 * KPI Stats Grid
 */
const StatsKPIGrid: React.FC<{ stats: StatKPI[] }> = ({ stats }) => (
  <div className="grid grid-cols-2 gap-3">
    {stats.map((stat) => (
      <KPICard key={stat.id} stat={stat} />
    ))}
  </div>
);

/**
 * Training Trend Chart Card
 */
const TrendChart: React.FC<{
  data: Array<{ name: string; Completed: number; Planned: number }>;
  completionRate: number;
}> = ({ data, completionRate }) => (
  <Card>
    <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <TrendingUp size={20} className="text-tier-gold" />
        <h3 className="text-base font-semibold text-tier-navy">Training Trend</h3>
      </div>
      <div className="flex items-center gap-1 px-2 py-1 bg-tier-navy/5 rounded-lg">
        {completionRate >= 70 ? (
          <TrendingUp size={14} className="text-tier-success" />
        ) : (
          <TrendingDown size={14} className="text-tier-warning" />
        )}
        <span className={`text-xs font-semibold ${
          completionRate >= 70 ? 'text-tier-success' : 'text-tier-warning'
        }`}>
          {completionRate.toFixed(0)}%
        </span>
      </div>
    </div>

    <div className="p-4">
      {data.length > 1 ? (
        <>
          <GolfAreaChart
            data={data}
            dataKeys={['Completed', 'Planned']}
            xAxisKey="name"
            colors={[chartColors.success, chartColors.mist]}
            height={180}
            stacked={false}
          />
          <p className="text-xs text-tier-navy/60 text-center mt-3">
            Weekly training session completion
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <BarChart3 size={40} className="mb-3 text-tier-navy/20" />
          <p className="text-sm font-semibold text-tier-navy">Not enough data yet</p>
          <p className="text-xs text-tier-navy/60 mt-1">
            Complete more training sessions to see trends
          </p>
        </div>
      )}
    </div>
  </Card>
);

/**
 * Category Performance Card
 */
const CategoryCard: React.FC<{
  category: TrainingCategory;
  onClick: () => void;
}> = ({ category, onClick }) => (
  <div
    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-tier-navy/5 transition-colors rounded-lg"
    onClick={onClick}
  >
    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-tier-navy/5">
      {category.icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-tier-navy">{category.name}</span>
        <span className={`text-xs font-semibold ${
          category.trend === 'up' ? 'text-tier-success' :
          category.trend === 'down' ? 'text-tier-error' :
          'text-tier-navy/60'
        }`}>
          {category.trend === 'up' ? '+' : category.trend === 'down' ? '-' : ''}
          {category.sessions} sessions
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-tier-navy/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              category.progress >= 70 ? 'bg-tier-success' :
              category.progress >= 40 ? 'bg-tier-warning' :
              'bg-tier-error'
            }`}
            style={{ width: `${category.progress}%` }}
          />
        </div>
        <span className="text-xs text-tier-navy/60 w-8">{category.progress}%</span>
      </div>
    </div>
    <ChevronRight size={18} className="text-tier-navy/40" />
  </div>
);

/**
 * Categories Section
 */
const CategoriesSection: React.FC<{
  categories: TrainingCategory[];
  onCategoryClick: (id: string) => void;
}> = ({ categories, onCategoryClick }) => (
  <Card>
    <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <Target size={20} className="text-tier-gold" />
        <h3 className="text-base font-semibold text-tier-navy">Training Areas</h3>
      </div>
    </div>

    <div className="divide-y divide-tier-navy/10">
      {categories.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          onClick={() => onCategoryClick(cat.id)}
        />
      ))}
    </div>
  </Card>
);

/**
 * Recent Activity Card
 */
const RecentActivityCard: React.FC<{
  sessions: RecentSession[];
  onViewAll: () => void;
  onSessionClick: (id: string) => void;
}> = ({ sessions, onViewAll, onSessionClick }) => (
  <Card>
    <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <Clock size={20} className="text-tier-gold" />
        <h3 className="text-base font-semibold text-tier-navy">Recent Activity</h3>
      </div>
      <Button variant="ghost" size="sm" onClick={onViewAll}>
        View all
      </Button>
    </div>

    {sessions.length === 0 ? (
      <div className="flex flex-col items-center gap-3 p-6">
        <Activity size={40} className="text-tier-navy/20" />
        <p className="text-sm text-tier-navy/60">No recent activity</p>
        <Button variant="secondary" size="sm">
          Start training
        </Button>
      </div>
    ) : (
      <div className="divide-y divide-tier-navy/10">
        {sessions.slice(0, 5).map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-tier-navy/5 transition-colors"
            onClick={() => onSessionClick(session.id)}
          >
            <div className="flex-1">
              <span className="text-sm font-semibold text-tier-navy">{session.title}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-tier-navy/60">{session.type}</span>
                <span className="text-xs text-tier-navy/40">·</span>
                <span className="text-xs text-tier-navy/60">{session.duration}</span>
              </div>
            </div>
            <span className="text-xs text-tier-navy/40">{session.date}</span>
            <ChevronRight size={16} className="text-tier-navy/40" />
          </div>
        ))}
      </div>
    )}
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StatsPageV5() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [period, setPeriod] = useState<TimePeriod>('7d');

  const { data, isLoading, error, refetch } = useStats();
  const { data: analyticsData } = useTrainingAnalytics();

  // Transform weekly trend data for chart
  const trendChartData = useMemo(() => {
    if (!analyticsData?.weeklyTrend) return [];
    return analyticsData.weeklyTrend.map((week) => ({
      name: `W${week.weekNumber}`,
      Completed: week.completed,
      Planned: week.planned,
    }));
  }, [analyticsData?.weeklyTrend]);

  // Build KPI stats
  const kpiStats: StatKPI[] = useMemo(() => {
    const stats = data?.kpis ?? [];
    return [
      {
        id: 'sessions',
        label: 'Sessions',
        value: analyticsData?.overview?.totalSessionsCompleted ?? stats[0]?.value ?? 0,
        icon: <Calendar size={20} className="text-tier-gold" />,
        trend: 'up',
        change: '+3 this week',
      },
      {
        id: 'hours',
        label: 'Training Hours',
        value: analyticsData?.overview?.totalHoursCompleted?.toFixed(1) ?? stats[1]?.value ?? '0',
        icon: <Clock size={20} className="text-tier-success" />,
        trend: 'up',
        change: '+2.5h',
      },
      {
        id: 'streak',
        label: 'Current Streak',
        value: analyticsData?.overview?.currentStreak ?? 0,
        icon: <Flame size={20} className="text-tier-warning" />,
        trend: 'up',
        change: 'days',
      },
      {
        id: 'completion',
        label: 'Completion Rate',
        value: `${analyticsData?.overview?.completionRate?.toFixed(0) ?? 0}%`,
        icon: <Target size={20} className="text-tier-navy" />,
        trend: (analyticsData?.overview?.completionRate ?? 0) >= 70 ? 'up' : 'down',
        change: 'of planned',
      },
    ];
  }, [data, analyticsData]);

  // Training categories
  const categories: TrainingCategory[] = useMemo(() => [
    {
      id: 'technique',
      name: 'Technique',
      sessions: 12,
      hours: 8.5,
      trend: 'up',
      progress: 75,
      icon: <Activity size={20} className="text-tier-gold" />,
    },
    {
      id: 'short-game',
      name: 'Short Game',
      sessions: 8,
      hours: 5.5,
      trend: 'up',
      progress: 60,
      icon: <Target size={20} className="text-tier-success" />,
    },
    {
      id: 'putting',
      name: 'Putting',
      sessions: 10,
      hours: 4.0,
      trend: 'neutral',
      progress: 80,
      icon: <Award size={20} className="text-tier-navy" />,
    },
    {
      id: 'physical',
      name: 'Physical',
      sessions: 6,
      hours: 6.0,
      trend: 'down',
      progress: 45,
      icon: <Flame size={20} className="text-tier-error" />,
    },
  ], []);

  // Recent sessions from data
  const recentSessions: RecentSession[] = useMemo(() => {
    return data?.recentSessions?.slice(0, 5) ?? [];
  }, [data]);

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard variant="loading" title="Loading statistics..." />
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard
          variant="error"
          title="Could not load statistics"
          description={error}
          action={
            <Button variant="primary" onClick={refetch}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const completionRate = analyticsData?.overview?.completionRate ?? 0;

  return (
    <div className="flex flex-col gap-5 p-4 w-full">
      {/* Header with Period Selector */}
      <StatsHeader period={period} onPeriodChange={setPeriod} />

      {/* AI Coach Guide */}
      <AICoachGuide config={GUIDE_PRESETS.stats} />

      {/* KPI Grid */}
      <section className="flex flex-col gap-3">
        <StatsKPIGrid stats={kpiStats} />
      </section>

      {/* Training Trend Chart */}
      <section className="flex flex-col gap-3">
        <TrendChart data={trendChartData} completionRate={completionRate} />
      </section>

      {/* Category Breakdown */}
      <section className="flex flex-col gap-3">
        <CategoriesSection
          categories={categories}
          onCategoryClick={(id) => navigate(`/stats/${id}`)}
        />
      </section>

      {/* Recent Activity */}
      <section className="flex flex-col gap-3">
        <RecentActivityCard
          sessions={recentSessions}
          onViewAll={() => navigate('/trening/logg')}
          onSessionClick={(id) => navigate(`/sessions/${id}`)}
        />
      </section>
    </div>
  );
}
