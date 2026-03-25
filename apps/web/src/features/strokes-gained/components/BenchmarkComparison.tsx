/**
 * Benchmark Comparison Component - TIER Golf
 *
 * Displays player's strokes gained performance compared to various benchmarks:
 * - PGA Tour Average
 * - LPGA Tour Average
 * - Scratch Golfer
 * - Player's historical average
 */

import React, { useMemo, useState } from 'react';
import { Card } from '../../../ui/primitives/Card';
import { Badge } from '../../../components/shadcn/badge';
import {
  Globe,
  User,
  Users,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Info,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type BenchmarkType = 'pga_tour' | 'lpga_tour' | 'scratch' | 'self_avg';

interface BenchmarkData {
  sgTotal: number;
  sgTee: number;
  sgApproach: number;
  sgShortGame: number;
  sgPutting: number;
}

interface BenchmarkComparisonProps {
  playerData: BenchmarkData;
  selectedBenchmark?: BenchmarkType;
  onBenchmarkChange?: (benchmark: BenchmarkType) => void;
}

interface CategoryComparison {
  category: string;
  categoryKey: keyof Omit<BenchmarkData, 'sgTotal'>;
  playerValue: number;
  benchmarkValue: number;
  difference: number;
  percentile?: number;
  color: string;
}

// ============================================================================
// CONSTANTS - BENCHMARK DATA
// ============================================================================

const BENCHMARK_VALUES: Record<BenchmarkType, BenchmarkData & { label: string; icon: React.ReactNode }> = {
  pga_tour: {
    label: 'PGA Tour Avg',
    icon: <Trophy size={16} />,
    sgTotal: 0, // Tour average is baseline
    sgTee: 0,
    sgApproach: 0,
    sgShortGame: 0,
    sgPutting: 0,
  },
  lpga_tour: {
    label: 'LPGA Tour Avg',
    icon: <Trophy size={16} />,
    sgTotal: -2.5, // LPGA average relative to PGA
    sgTee: -0.8,
    sgApproach: -0.6,
    sgShortGame: -0.4,
    sgPutting: -0.7,
  },
  scratch: {
    label: 'Scratch Golfer',
    icon: <User size={16} />,
    sgTotal: -4.0, // Scratch golfer relative to PGA
    sgTee: -1.0,
    sgApproach: -1.2,
    sgShortGame: -0.8,
    sgPutting: -1.0,
  },
  self_avg: {
    label: 'Your Average',
    icon: <User size={16} />,
    sgTotal: 0,
    sgTee: 0,
    sgApproach: 0,
    sgShortGame: 0,
    sgPutting: 0,
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  sgTee: '#0A2540',
  sgApproach: '#10B981',
  sgShortGame: '#C9A227',
  sgPutting: '#8B5CF6',
};

const CATEGORY_LABELS: Record<string, string> = {
  sgTee: 'Off the Tee',
  sgApproach: 'Approach',
  sgShortGame: 'Short Game',
  sgPutting: 'Putting',
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const TrendIcon: React.FC<{ value: number }> = ({ value }) => {
  if (value > 0.1) return <TrendingUp size={14} className="text-tier-success" />;
  if (value < -0.1) return <TrendingDown size={14} className="text-tier-error" />;
  return <Minus size={14} className="text-tier-navy/40" />;
};

const ComparisonBar: React.FC<{
  playerValue: number;
  benchmarkValue: number;
  maxRange?: number;
  color: string;
}> = ({ playerValue, benchmarkValue, maxRange = 3, color }) => {
  const playerPercent = Math.min(Math.max((playerValue + maxRange) / (maxRange * 2), 0), 1) * 100;
  const benchmarkPercent = Math.min(Math.max((benchmarkValue + maxRange) / (maxRange * 2), 0), 1) * 100;

  return (
    <div className="relative h-3 bg-tier-navy/10 rounded-full overflow-hidden">
      {/* Center line (baseline) */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-tier-navy/30" />

      {/* Benchmark marker */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-tier-navy/40 rounded-full"
        style={{ left: `${benchmarkPercent}%`, transform: 'translateX(-50%)' }}
      />

      {/* Player value */}
      <div
        className="absolute top-0 bottom-0 w-2.5 rounded-full shadow-sm"
        style={{
          left: `${playerPercent}%`,
          transform: 'translateX(-50%)',
          backgroundColor: color,
        }}
      />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BenchmarkComparison({
  playerData,
  selectedBenchmark = 'pga_tour',
  onBenchmarkChange,
}: BenchmarkComparisonProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeBenchmark, setActiveBenchmark] = useState(selectedBenchmark);

  const handleBenchmarkChange = (benchmark: BenchmarkType) => {
    setActiveBenchmark(benchmark);
    onBenchmarkChange?.(benchmark);
  };

  // Calculate comparisons
  const comparisons: CategoryComparison[] = useMemo(() => {
    const benchmark = BENCHMARK_VALUES[activeBenchmark];
    const categories: (keyof Omit<BenchmarkData, 'sgTotal'>)[] = [
      'sgTee',
      'sgApproach',
      'sgShortGame',
      'sgPutting',
    ];

    return categories.map((key) => ({
      category: CATEGORY_LABELS[key],
      categoryKey: key,
      playerValue: playerData[key],
      benchmarkValue: benchmark[key],
      difference: playerData[key] - benchmark[key],
      color: CATEGORY_COLORS[key],
    }));
  }, [playerData, activeBenchmark]);

  const totalDifference = useMemo(() => {
    const benchmark = BENCHMARK_VALUES[activeBenchmark];
    return playerData.sgTotal - benchmark.sgTotal;
  }, [playerData, activeBenchmark]);

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-tier-navy/10">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-tier-gold" />
          <h3 className="text-base font-semibold text-tier-navy">Benchmark Comparison</h3>
        </div>
        <Badge
          variant="secondary"
          className={`flex items-center gap-1 ${
            totalDifference >= 0 ? 'text-tier-success' : 'text-tier-error'
          }`}
        >
          {totalDifference >= 0 ? '+' : ''}
          {totalDifference.toFixed(2)} vs benchmark
        </Badge>
      </div>

      {/* Benchmark Selector */}
      <div className="flex gap-2 p-3 border-b border-tier-navy/10 overflow-x-auto">
        {(Object.keys(BENCHMARK_VALUES) as BenchmarkType[]).map((key) => {
          const benchmark = BENCHMARK_VALUES[key];
          const isActive = activeBenchmark === key;

          return (
            <button
              key={key}
              onClick={() => handleBenchmarkChange(key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                whitespace-nowrap transition-all flex-shrink-0
                ${isActive
                  ? 'bg-tier-navy text-white'
                  : 'bg-tier-navy/5 text-tier-navy/70 hover:bg-tier-navy/10'
                }
              `}
            >
              {benchmark.icon}
              {benchmark.label}
            </button>
          );
        })}
      </div>

      {/* Total Comparison */}
      <div className="p-4 bg-gradient-to-r from-tier-navy/5 to-transparent">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-tier-navy/60">Total Strokes Gained</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-tier-navy">
              {playerData.sgTotal >= 0 ? '+' : ''}
              {playerData.sgTotal.toFixed(2)}
            </span>
            <TrendIcon value={totalDifference} />
          </div>
        </div>
        <ComparisonBar
          playerValue={playerData.sgTotal}
          benchmarkValue={BENCHMARK_VALUES[activeBenchmark].sgTotal}
          maxRange={5}
          color="#0A2540"
        />
        <div className="flex justify-between mt-1 text-xs text-tier-navy/40">
          <span>-5.0</span>
          <span>0.0</span>
          <span>+5.0</span>
        </div>
      </div>

      {/* Category Comparisons */}
      <div className="divide-y divide-tier-navy/10">
        {comparisons.map((comp) => (
          <div key={comp.categoryKey} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: comp.color }}
                />
                <span className="text-sm font-medium text-tier-navy">{comp.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${
                    comp.difference >= 0 ? 'text-tier-success' : 'text-tier-error'
                  }`}
                >
                  {comp.difference >= 0 ? '+' : ''}
                  {comp.difference.toFixed(2)}
                </span>
                <TrendIcon value={comp.difference} />
              </div>
            </div>
            <ComparisonBar
              playerValue={comp.playerValue}
              benchmarkValue={comp.benchmarkValue}
              color={comp.color}
            />
          </div>
        ))}
      </div>

      {/* Expand/Collapse for Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-center gap-1 w-full p-3 border-t border-tier-navy/10 text-sm text-tier-navy/60 hover:text-tier-navy hover:bg-tier-navy/5 transition-colors"
      >
        {expanded ? 'Hide Details' : 'Show Details'}
        <ChevronDown
          size={16}
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 border-t border-tier-navy/10 bg-tier-navy/5">
          <div className="flex items-start gap-2 text-sm text-tier-navy/70">
            <Info size={16} className="flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p>
                <strong>Strokes Gained</strong> measures how many strokes better (positive) or worse
                (negative) you perform compared to the selected benchmark.
              </p>
              <p>
                <strong>{BENCHMARK_VALUES[activeBenchmark].label}</strong>
                {activeBenchmark === 'pga_tour' &&
                  ' represents the average performance on the PGA Tour, considered the gold standard.'}
                {activeBenchmark === 'lpga_tour' &&
                  ' represents the average performance on the LPGA Tour.'}
                {activeBenchmark === 'scratch' &&
                  ' represents a typical scratch golfer (0 handicap).'}
                {activeBenchmark === 'self_avg' &&
                  ' compares your recent rounds to your overall average.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
