/**
 * Category Deep Dive Page - TIER Golf
 *
 * Detailed analysis of a specific strokes gained category with:
 * - Historical trends
 * - Shot dispersion charts
 * - Distance-based breakdowns
 * - Actionable insights
 */

import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Target,
  Flag,
  CircleDot,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ChevronRight,
  Info,
  Lightbulb,
  BarChart3,
} from 'lucide-react';

// Hooks
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import Button from '../../ui/primitives/Button';
import { Card } from '../../ui/primitives/Card';
import { Badge } from '../../components/shadcn/badge';
import StateCard from '../../ui/composites/StateCard';

// Feature Components
import ShotDispersionChart from './components/ShotDispersionChart';
import BenchmarkComparison from './components/BenchmarkComparison';

// ============================================================================
// TYPES
// ============================================================================

type CategoryId = 'tee' | 'approach' | 'short_game' | 'putting';

interface DistanceBreakdown {
  range: string;
  shotCount: number;
  sgValue: number;
  avgResult: string;
  trend: 'up' | 'down' | 'neutral';
}

interface PracticeRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  drillType: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_CONFIG: Record<CategoryId, {
  name: string;
  icon: typeof Activity;
  color: string;
  description: string;
  benchmarkNotes: string;
}> = {
  tee: {
    name: 'Off the Tee',
    icon: Activity,
    color: '#0A2540',
    description: 'Drives and tee shots on par 4s and par 5s',
    benchmarkNotes: 'PGA Tour average driving distance is 295 yards with 60% fairways hit.',
  },
  approach: {
    name: 'Approach',
    icon: Target,
    color: '#10B981',
    description: 'Shots from 100+ yards into the green',
    benchmarkNotes: 'PGA Tour players average 66% GIR with approach shots.',
  },
  short_game: {
    name: 'Short Game',
    icon: Flag,
    color: '#C9A227',
    description: 'Chips, pitches, and bunker shots under 50 meters',
    benchmarkNotes: 'Tour players get up-and-down 58% from inside 30 yards.',
  },
  putting: {
    name: 'Putting',
    icon: CircleDot,
    color: '#8B5CF6',
    description: 'All putts on the green',
    benchmarkNotes: 'PGA Tour averages 28.7 putts per round.',
  },
};

// Mock distance breakdowns by category
const DISTANCE_BREAKDOWNS: Record<CategoryId, DistanceBreakdown[]> = {
  tee: [
    { range: 'Par 4 Short (<400y)', shotCount: 12, sgValue: 0.15, avgResult: '268y, 67% FW', trend: 'up' },
    { range: 'Par 4 Medium (400-450y)', shotCount: 18, sgValue: -0.08, avgResult: '275y, 58% FW', trend: 'neutral' },
    { range: 'Par 4 Long (>450y)', shotCount: 8, sgValue: -0.22, avgResult: '280y, 45% FW', trend: 'down' },
    { range: 'Par 5s', shotCount: 10, sgValue: 0.12, avgResult: '285y, 62% FW', trend: 'up' },
  ],
  approach: [
    { range: '100-125 yards', shotCount: 15, sgValue: 0.25, avgResult: '18ft avg', trend: 'up' },
    { range: '125-150 yards', shotCount: 20, sgValue: 0.08, avgResult: '24ft avg', trend: 'neutral' },
    { range: '150-175 yards', shotCount: 18, sgValue: -0.12, avgResult: '32ft avg', trend: 'down' },
    { range: '175-200 yards', shotCount: 12, sgValue: -0.28, avgResult: '42ft avg', trend: 'down' },
    { range: '200+ yards', shotCount: 8, sgValue: -0.35, avgResult: '48ft avg', trend: 'down' },
  ],
  short_game: [
    { range: '0-10 yards', shotCount: 8, sgValue: 0.18, avgResult: '4ft avg', trend: 'up' },
    { range: '10-20 yards', shotCount: 12, sgValue: 0.05, avgResult: '8ft avg', trend: 'neutral' },
    { range: '20-30 yards', shotCount: 10, sgValue: -0.10, avgResult: '12ft avg', trend: 'down' },
    { range: '30-50 yards', shotCount: 8, sgValue: -0.22, avgResult: '18ft avg', trend: 'down' },
    { range: 'Bunker Shots', shotCount: 6, sgValue: -0.15, avgResult: '10ft avg', trend: 'neutral' },
  ],
  putting: [
    { range: '0-5 feet', shotCount: 45, sgValue: 0.12, avgResult: '95% made', trend: 'up' },
    { range: '5-10 feet', shotCount: 28, sgValue: -0.05, avgResult: '48% made', trend: 'neutral' },
    { range: '10-20 feet', shotCount: 22, sgValue: -0.18, avgResult: '18% made', trend: 'down' },
    { range: '20-30 feet', shotCount: 15, sgValue: -0.08, avgResult: '8% made', trend: 'neutral' },
    { range: '30+ feet', shotCount: 10, sgValue: 0.02, avgResult: 'Avg 3.2ft remain', trend: 'up' },
  ],
};

// Mock practice recommendations by category
const RECOMMENDATIONS: Record<CategoryId, PracticeRecommendation[]> = {
  tee: [
    {
      title: 'Long Iron Tee Shots',
      description: 'Practice tee shots with 3-iron and hybrid on longer par 4s to improve accuracy.',
      priority: 'high',
      drillType: 'Range Session',
    },
    {
      title: 'Fairway Finder Drill',
      description: 'Focus on 75% swings with driver to prioritize fairways over distance.',
      priority: 'medium',
      drillType: 'Course Strategy',
    },
  ],
  approach: [
    {
      title: '150-175 Yard Focus',
      description: 'Dedicate extra practice to this distance range where you\'re losing strokes.',
      priority: 'high',
      drillType: 'Range Session',
    },
    {
      title: 'Stock Shot Library',
      description: 'Build reliable stock shots for each approach club distance.',
      priority: 'medium',
      drillType: 'Technical Work',
    },
  ],
  short_game: [
    {
      title: '30-50 Yard Pitches',
      description: 'This distance range shows the most room for improvement.',
      priority: 'high',
      drillType: 'Short Game Area',
    },
    {
      title: 'Up-and-Down Challenge',
      description: 'Practice getting up-and-down from various lies around the green.',
      priority: 'medium',
      drillType: 'Game Simulation',
    },
  ],
  putting: [
    {
      title: '10-20 Foot Putts',
      description: 'Focus on speed control and start line for mid-range putts.',
      priority: 'high',
      drillType: 'Putting Green',
    },
    {
      title: 'Gate Drill',
      description: 'Use gate drill for 5-10 foot putts to improve accuracy.',
      priority: 'medium',
      drillType: 'Technical Drill',
    },
  ],
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const CategoryHeader: React.FC<{
  category: typeof CATEGORY_CONFIG[CategoryId];
  sgValue: number;
  onBack: () => void;
}> = ({ category, sgValue, onBack }) => {
  const Icon = category.icon;

  return (
    <div className="mb-6">
      <Button variant="ghost" size="sm" className="mb-4" onClick={onBack}>
        <ArrowLeft size={16} className="mr-1" />
        Back to Strokes Gained
      </Button>

      <Card className="p-5" style={{ backgroundColor: `${category.color}10` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: category.color }}
          >
            <Icon size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-tier-navy">{category.name}</h1>
            <p className="text-sm text-tier-navy/60">{category.description}</p>
          </div>
          <div className="text-right">
            <span
              className={`text-2xl font-bold ${
                sgValue >= 0 ? 'text-tier-success' : 'text-tier-error'
              }`}
            >
              {sgValue >= 0 ? '+' : ''}
              {sgValue.toFixed(2)}
            </span>
            <span className="block text-xs text-tier-navy/60">SG Average</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

const DistanceBreakdownCard: React.FC<{
  breakdowns: DistanceBreakdown[];
  categoryColor: string;
}> = ({ breakdowns, categoryColor }) => (
  <Card>
    <div className="flex items-center justify-between p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <BarChart3 size={18} className="text-tier-gold" />
        <h3 className="text-base font-semibold text-tier-navy">Distance Breakdown</h3>
      </div>
      <Badge variant="secondary">{breakdowns.length} ranges</Badge>
    </div>

    <div className="divide-y divide-tier-navy/10">
      {breakdowns.map((breakdown, idx) => (
        <div key={idx} className="flex items-center gap-3 p-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-tier-navy">{breakdown.range}</span>
              <span
                className={`text-sm font-bold ${
                  breakdown.sgValue >= 0 ? 'text-tier-success' : 'text-tier-error'
                }`}
              >
                {breakdown.sgValue >= 0 ? '+' : ''}
                {breakdown.sgValue.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-tier-navy/60">
                {breakdown.shotCount} shots · {breakdown.avgResult}
              </span>
              {breakdown.trend === 'up' ? (
                <TrendingUp size={14} className="text-tier-success" />
              ) : breakdown.trend === 'down' ? (
                <TrendingDown size={14} className="text-tier-error" />
              ) : (
                <Minus size={14} className="text-tier-navy/40" />
              )}
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-tier-navy/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(Math.abs(breakdown.sgValue) * 100 + 50, 100)}%`,
                  backgroundColor: breakdown.sgValue >= 0 ? '#10B981' : '#EF4444',
                }}
              />
            </div>
          </div>
          <ChevronRight size={16} className="text-tier-navy/30" />
        </div>
      ))}
    </div>
  </Card>
);

const RecommendationsCard: React.FC<{
  recommendations: PracticeRecommendation[];
}> = ({ recommendations }) => {
  const priorityColors = {
    high: 'bg-tier-error/10 text-tier-error',
    medium: 'bg-tier-gold/10 text-tier-gold',
    low: 'bg-tier-navy/10 text-tier-navy/60',
  };

  return (
    <Card>
      <div className="flex items-center justify-between p-4 border-b border-tier-navy/10">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-tier-gold" />
          <h3 className="text-base font-semibold text-tier-navy">Practice Recommendations</h3>
        </div>
      </div>

      <div className="divide-y divide-tier-navy/10">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-tier-navy">{rec.title}</span>
              <Badge className={priorityColors[rec.priority]}>
                {rec.priority}
              </Badge>
            </div>
            <p className="text-sm text-tier-navy/70 mb-2">{rec.description}</p>
            <Badge variant="secondary">{rec.drillType}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};

const TrendChartPlaceholder: React.FC<{ category: string }> = ({ category }) => (
  <Card>
    <div className="flex items-center justify-between p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <TrendingUp size={18} className="text-tier-gold" />
        <h3 className="text-base font-semibold text-tier-navy">{category} Trend</h3>
      </div>
      <Badge variant="secondary">Last 30 days</Badge>
    </div>
    <div className="flex flex-col items-center justify-center p-8">
      <Calendar size={40} className="text-tier-navy/20 mb-3" />
      <p className="text-sm font-medium text-tier-navy">Trend chart coming soon</p>
      <p className="text-xs text-tier-navy/60 mt-1">
        Log more rounds to see your {category.toLowerCase()} trend
      </p>
    </div>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CategoryDeepDivePage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Validate category
  const validCategoryId = (categoryId as CategoryId) || 'tee';
  const isValidCategory = Object.keys(CATEGORY_CONFIG).includes(validCategoryId);

  if (!isValidCategory) {
    return (
      <div className="p-4">
        <StateCard
          variant="error"
          title="Category Not Found"
          description="The requested strokes gained category does not exist."
          action={
            <Button variant="primary" onClick={() => navigate('/strokes-gained')}>
              Back to Strokes Gained
            </Button>
          }
        />
      </div>
    );
  }

  const category = CATEGORY_CONFIG[validCategoryId];
  const breakdowns = DISTANCE_BREAKDOWNS[validCategoryId];
  const recommendations = RECOMMENDATIONS[validCategoryId];

  // Mock SG value for the category
  const mockSGValue = {
    tee: 0.15,
    approach: -0.18,
    short_game: 0.05,
    putting: -0.12,
  }[validCategoryId];

  // Mock shot data for dispersion chart
  const mockShots = useMemo(() => {
    const shots: Array<{
      x: number;
      y: number;
      category: 'TEE' | 'APPROACH' | 'SHORT_GAME';
      result: 'excellent' | 'good' | 'average' | 'poor';
    }> = [];
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 60 + (validCategoryId === 'tee' ? 10 : 0);
      const y = Math.random() * 40 + 50;
      const rand = Math.random();
      const result: 'excellent' | 'good' | 'average' | 'poor' =
        rand < 0.2 ? 'excellent' : rand < 0.5 ? 'good' : rand < 0.8 ? 'average' : 'poor';
      const category: 'TEE' | 'APPROACH' | 'SHORT_GAME' =
        validCategoryId === 'putting' ? 'SHORT_GAME' : validCategoryId.toUpperCase().replace('_', '_') as 'TEE' | 'APPROACH' | 'SHORT_GAME';
      shots.push({ x, y, category, result });
    }
    return shots;
  }, [validCategoryId]);

  // Mock player data for benchmark comparison
  const mockPlayerData = {
    sgTotal: mockSGValue,
    sgTee: validCategoryId === 'tee' ? mockSGValue : 0.15,
    sgApproach: validCategoryId === 'approach' ? mockSGValue : -0.18,
    sgShortGame: validCategoryId === 'short_game' ? mockSGValue : 0.05,
    sgPutting: validCategoryId === 'putting' ? mockSGValue : -0.12,
  };

  return (
    <div className="flex flex-col gap-5 p-4 w-full">
      {/* Header */}
      <CategoryHeader
        category={category}
        sgValue={mockSGValue}
        onBack={() => navigate('/strokes-gained')}
      />

      {/* Benchmark Note */}
      <div className="flex items-start gap-2 p-3 bg-tier-navy/5 rounded-lg">
        <Info size={16} className="text-tier-navy/60 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-tier-navy/70">{category.benchmarkNotes}</p>
      </div>

      {/* Shot Dispersion */}
      <ShotDispersionChart
        title={`${category.name} Dispersion`}
        shots={mockShots}
        targetX={0}
        targetY={75}
        width={320}
        height={400}
      />

      {/* Distance Breakdown */}
      <DistanceBreakdownCard breakdowns={breakdowns} categoryColor={category.color} />

      {/* Benchmark Comparison */}
      <BenchmarkComparison playerData={mockPlayerData} />

      {/* Trend Chart */}
      <TrendChartPlaceholder category={category.name} />

      {/* Practice Recommendations */}
      <RecommendationsCard recommendations={recommendations} />
    </div>
  );
}
