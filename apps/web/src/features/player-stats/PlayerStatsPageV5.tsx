/**
 * Player Stats Page V5 - TIER Golf
 *
 * Comprehensive player statistics page using TIER design system.
 * Mobile-first responsive layout with semantic TIER tokens.
 *
 * Zones:
 * - Header: Player profile + Category progress
 * - Overview: Key performance metrics
 * - Strokes Gained: SG breakdown by category
 * - Test Results: Recent benchmark results
 * - Trends: Performance over time
 */

import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  BarChart3,
  Activity,
  ChevronRight,
  Calendar,
  Flag,
  CircleDot,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  User,
} from 'lucide-react';

// Hooks
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import Button from '../../ui/primitives/Button';
import { Card } from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';
import { Badge } from '../../components/shadcn/badge';

// AI Coach
import { AICoachGuide } from '../ai-coach';
import { GUIDE_PRESETS } from '../ai-coach/types';

// ============================================================================
// TYPES
// ============================================================================

interface PlayerProfile {
  id: string;
  name: string;
  category: string;
  handicap: number;
  club: string;
  age: number;
  avatar?: string;
}

interface SGCategory {
  id: string;
  name: string;
  value: number;
  trend: 'up' | 'down' | 'neutral';
  change: string;
  color: string;
  icon: React.ReactNode;
}

interface TestResultSummary {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  date: string;
  passed: boolean;
}

interface PerformanceMetric {
  id: string;
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Player Profile Header
 */
const ProfileHeader: React.FC<{
  player: PlayerProfile;
  onEditProfile?: () => void;
}> = ({ player, onEditProfile }) => {
  const initials = player.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-tier-navy flex items-center justify-center text-white text-xl font-bold">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-tier-navy">{player.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">Category {player.category}</Badge>
            <span className="text-sm text-tier-navy/60">HCP {player.handicap}</span>
          </div>
          <p className="text-xs text-tier-navy/60 mt-1">{player.club}</p>
        </div>

        {/* Edit Button */}
        {onEditProfile && (
          <Button variant="ghost" size="sm" onClick={onEditProfile}>
            <User size={16} />
          </Button>
        )}
      </div>

      {/* Category Progress */}
      <div className="mt-4 pt-4 border-t border-tier-navy/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-tier-navy">Category Progress</span>
          <span className="text-xs text-tier-navy/60">4/7 tests passed</span>
        </div>
        <div className="h-2 bg-tier-navy/10 rounded-full overflow-hidden">
          <div className="h-full bg-tier-success rounded-full" style={{ width: '57%' }} />
        </div>
        <p className="text-xs text-tier-navy/60 mt-2">3 more tests to category {String.fromCharCode(player.category.charCodeAt(0) - 1)}</p>
      </div>
    </Card>
  );
};

/**
 * Performance Overview Grid
 */
const PerformanceOverview: React.FC<{
  metrics: PerformanceMetric[];
}> = ({ metrics }) => (
  <div className="grid grid-cols-2 gap-3">
    {metrics.map((metric) => (
      <Card key={metric.id} className="p-4">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-tier-navy">{metric.value}</span>
          <span className="text-xs text-tier-navy/60">{metric.label}</span>
          {metric.change && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${
              metric.trend === 'up' ? 'text-tier-success' :
              metric.trend === 'down' ? 'text-tier-error' :
              'text-tier-navy/60'
            }`}>
              {metric.trend === 'up' ? <ArrowUpRight size={12} /> :
               metric.trend === 'down' ? <ArrowDownRight size={12} /> :
               <Minus size={12} />}
              {metric.change}
            </div>
          )}
        </div>
      </Card>
    ))}
  </div>
);

/**
 * Strokes Gained Breakdown Card
 */
const StrokesGainedCard: React.FC<{
  categories: SGCategory[];
  totalSG: number;
  onViewDetails: () => void;
}> = ({ categories, totalSG, onViewDetails }) => (
  <Card>
    <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <BarChart3 size={20} className="text-tier-gold" />
        <h3 className="text-base font-semibold text-tier-navy">Strokes Gained</h3>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-lg font-bold ${totalSG >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
          {totalSG >= 0 ? '+' : ''}{totalSG.toFixed(2)}
        </span>
        <Button variant="ghost" size="sm" onClick={onViewDetails}>
          Details
        </Button>
      </div>
    </div>

    <div className="divide-y divide-tier-navy/10">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-3 p-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: `${cat.color}15` }}>
            {cat.icon}
          </div>
          <div className="flex-1">
            <span className="text-sm font-semibold text-tier-navy">{cat.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${cat.value >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
              {cat.value >= 0 ? '+' : ''}{cat.value.toFixed(2)}
            </span>
            <div className={`flex items-center text-xs ${
              cat.trend === 'up' ? 'text-tier-success' :
              cat.trend === 'down' ? 'text-tier-error' :
              'text-tier-navy/60'
            }`}>
              {cat.trend === 'up' ? <TrendingUp size={14} /> :
               cat.trend === 'down' ? <TrendingDown size={14} /> :
               <Minus size={14} />}
            </div>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

/**
 * Test Results Summary Card
 */
const TestResultsCard: React.FC<{
  results: TestResultSummary[];
  onViewAll: () => void;
  onTestClick: (id: string) => void;
}> = ({ results, onViewAll, onTestClick }) => (
  <Card>
    <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <Target size={20} className="text-tier-gold" />
        <h3 className="text-base font-semibold text-tier-navy">Test Results</h3>
      </div>
      <Button variant="ghost" size="sm" onClick={onViewAll}>
        View all
      </Button>
    </div>

    {results.length === 0 ? (
      <div className="flex flex-col items-center gap-3 p-6">
        <Target size={40} className="text-tier-navy/20" />
        <p className="text-sm text-tier-navy/60">No test results yet</p>
        <Button variant="secondary" size="sm">
          Take first test
        </Button>
      </div>
    ) : (
      <div className="divide-y divide-tier-navy/10">
        {results.slice(0, 5).map((result) => (
          <div
            key={result.id}
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-tier-navy/5 transition-colors"
            onClick={() => onTestClick(result.id)}
          >
            <div className={`w-2 h-2 rounded-full ${result.passed ? 'bg-tier-success' : 'bg-tier-error'}`} />
            <div className="flex-1">
              <span className="text-sm font-semibold text-tier-navy">{result.name}</span>
              <span className="text-xs text-tier-navy/60 block">{result.category}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-tier-navy">
                {result.value}{result.unit}
              </span>
              <div className={`flex items-center justify-end gap-1 text-xs ${
                result.trend === 'up' ? 'text-tier-success' :
                result.trend === 'down' ? 'text-tier-error' :
                'text-tier-navy/60'
              }`}>
                {result.trend === 'up' ? <TrendingUp size={12} /> :
                 result.trend === 'down' ? <TrendingDown size={12} /> : null}
                {result.date}
              </div>
            </div>
            <ChevronRight size={16} className="text-tier-navy/40" />
          </div>
        ))}
      </div>
    )}
  </Card>
);

/**
 * Quick Actions Row
 */
const QuickActions: React.FC<{
  onLogRound: () => void;
  onTakeTest: () => void;
  onViewCalendar: () => void;
}> = ({ onLogRound, onTakeTest, onViewCalendar }) => (
  <div className="grid grid-cols-3 gap-3">
    <Button
      variant="secondary"
      className="flex flex-col items-center gap-2 py-4 h-auto"
      onClick={onLogRound}
    >
      <Flag size={20} />
      <span className="text-xs">Log Round</span>
    </Button>
    <Button
      variant="secondary"
      className="flex flex-col items-center gap-2 py-4 h-auto"
      onClick={onTakeTest}
    >
      <Target size={20} />
      <span className="text-xs">Take Test</span>
    </Button>
    <Button
      variant="secondary"
      className="flex flex-col items-center gap-2 py-4 h-auto"
      onClick={onViewCalendar}
    >
      <Calendar size={20} />
      <span className="text-xs">Calendar</span>
    </Button>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PlayerStatsPageV5() {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  // Mock player data - would be fetched from API
  const player: PlayerProfile = useMemo(() => ({
    id: playerId || '1',
    name: (user as { name?: string })?.name || 'Player Name',
    category: (user as { category?: string })?.category || 'B',
    handicap: 12.4,
    club: 'Oslo Golf Club',
    age: 17,
  }), [playerId, user]);

  // Performance metrics
  const performanceMetrics: PerformanceMetric[] = useMemo(() => [
    { id: 'handicap', label: 'Handicap', value: player.handicap, trend: 'down', change: '-0.8' },
    { id: 'avg-score', label: 'Avg Score', value: '78.2', trend: 'down', change: '-1.3' },
    { id: 'rounds', label: 'Rounds (30d)', value: 8, trend: 'up', change: '+2' },
    { id: 'sg-total', label: 'SG Total', value: '+1.24', trend: 'up', change: '+0.15' },
  ], [player.handicap]);

  // Strokes Gained categories
  const sgCategories: SGCategory[] = useMemo(() => [
    {
      id: 'tee',
      name: 'Off the Tee',
      value: 0.45,
      trend: 'up',
      change: '+0.12',
      color: '#0A2540',
      icon: <Activity size={20} style={{ color: '#0A2540' }} />,
    },
    {
      id: 'approach',
      name: 'Approach',
      value: 0.62,
      trend: 'up',
      change: '+0.08',
      color: '#10B981',
      icon: <Target size={20} style={{ color: '#10B981' }} />,
    },
    {
      id: 'short-game',
      name: 'Short Game',
      value: -0.15,
      trend: 'down',
      change: '-0.05',
      color: '#C9A227',
      icon: <Flag size={20} style={{ color: '#C9A227' }} />,
    },
    {
      id: 'putting',
      name: 'Putting',
      value: 0.32,
      trend: 'neutral',
      change: '0.00',
      color: '#8B5CF6',
      icon: <CircleDot size={20} style={{ color: '#8B5CF6' }} />,
    },
  ], []);

  const totalSG = sgCategories.reduce((sum, cat) => sum + cat.value, 0);

  // Test results
  const testResults: TestResultSummary[] = useMemo(() => [
    { id: '1', name: 'Driver Speed', category: 'Speed', value: 165, unit: ' km/h', trend: 'up', date: 'Dec 15', passed: true },
    { id: '2', name: 'Iron Accuracy', category: 'Accuracy', value: 72, unit: '%', trend: 'up', date: 'Dec 14', passed: true },
    { id: '3', name: 'Putting 6m', category: 'Putting', value: 68, unit: '%', trend: 'down', date: 'Dec 12', passed: false },
    { id: '4', name: 'Bunker Save', category: 'Short Game', value: 45, unit: '%', trend: 'neutral', date: 'Dec 10', passed: false },
  ], []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard variant="loading" title="Loading player stats..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4 w-full">
      {/* Player Profile Header */}
      <ProfileHeader
        player={player}
        onEditProfile={() => navigate('/profile/edit')}
      />

      {/* AI Coach Guide */}
      <AICoachGuide config={GUIDE_PRESETS.playerStats} />

      {/* Performance Overview */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-tier-navy">Performance Overview</h2>
        <PerformanceOverview metrics={performanceMetrics} />
      </section>

      {/* Quick Actions */}
      <section className="flex flex-col gap-3">
        <QuickActions
          onLogRound={() => navigate('/rounds/new')}
          onTakeTest={() => navigate('/testprotokoll')}
          onViewCalendar={() => navigate('/kalender')}
        />
      </section>

      {/* Strokes Gained */}
      <section className="flex flex-col gap-3">
        <StrokesGainedCard
          categories={sgCategories}
          totalSG={totalSG}
          onViewDetails={() => navigate('/strokes-gained')}
        />
      </section>

      {/* Test Results */}
      <section className="flex flex-col gap-3">
        <TestResultsCard
          results={testResults}
          onViewAll={() => navigate('/testprotokoll')}
          onTestClick={(id) => navigate(`/testing/${id}`)}
        />
      </section>
    </div>
  );
}
