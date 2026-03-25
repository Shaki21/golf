// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Clock, Target, Activity, Award, TrendingUp, TrendingDown,
  Flame, ChevronRight, Star, Filter, BarChart3, Dumbbell, Wrench, Zap, Trophy, Flag
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '../../components/shadcn';
import { StreakBadge } from '../../components/shadcn/golf';
import { cn } from 'lib/utils';
import { SectionTitle, SubSectionTitle, CardTitle as TypographyCardTitle } from '../../ui/primitives/typography';

// ============================================================================
// TYPES
// ============================================================================

interface Stats {
  totalSessions?: number;
  totalHours?: number;
  currentStreak?: number;
  completionRate?: number;
  weeklyGoal?: number;
  weeklyCompleted?: number;
  byPyramid?: Record<string, { sessions: number; hours: number }>;
  byArea?: Record<string, { sessions: number; hours: number; byPyramid?: Record<string, number> }>;
}

interface TimeRange {
  id: string;
  label: string;
}

interface PyramidLevel {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
}

interface TrainingArea {
  id: string;
  label: string;
  shortLabel: string;
  category: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TIME_RANGES: TimeRange[] = [
  { id: 'week', label: 'Denne uken' },
  { id: 'month', label: 'Denne måneden' },
  { id: 'quarter', label: 'Siste 3 mnd' },
  { id: 'year', label: 'I år' },
];

// Pyramid levels matching AK Formula
const PYRAMID_LEVELS: PyramidLevel[] = [
  { id: 'ALL', label: 'Alle', color: 'rgb(var(--text-primary))', bgColor: 'bg-tier-surface-base', icon: Star },
  { id: 'FYS', label: 'Fysisk', color: 'rgb(var(--status-error))', bgColor: 'bg-red-100', icon: Dumbbell },
  { id: 'TEK', label: 'Teknikk', color: 'rgb(var(--tier-gold))', bgColor: 'bg-amber-100', icon: Wrench },
  { id: 'SLAG', label: 'Golfslag', color: 'rgb(var(--tier-navy))', bgColor: 'bg-blue-100', icon: Target },
  { id: 'SPILL', label: 'Spill', color: 'rgb(var(--status-success))', bgColor: 'bg-emerald-100', icon: Activity },
  { id: 'TURN', label: 'Turnering', color: 'rgb(var(--tier-gold))', bgColor: 'bg-amber-100', icon: Trophy },
];

// Training areas grouped by category
const TRAINING_AREAS: TrainingArea[] = [
  // Full Swing (Tee/Drive)
  { id: 'TEE', label: 'Tee Total', shortLabel: 'Tee', category: 'fullSwing' },
  // Innspill (Approach shots at various distances)
  { id: 'INN200', label: 'Innspill 200m+', shortLabel: '200m+', category: 'innspill' },
  { id: 'INN150', label: 'Innspill 150-200m', shortLabel: '150-200m', category: 'innspill' },
  { id: 'INN100', label: 'Innspill 100-150m', shortLabel: '100-150m', category: 'innspill' },
  { id: 'INN50', label: 'Innspill 50-100m', shortLabel: '50-100m', category: 'innspill' },
  // Short Game (Naerspill)
  { id: 'CHIP', label: 'Chip', shortLabel: 'Chip', category: 'shortGame' },
  { id: 'PITCH', label: 'Pitch', shortLabel: 'Pitch', category: 'shortGame' },
  { id: 'LOB', label: 'Lob', shortLabel: 'Lob', category: 'shortGame' },
  { id: 'BUNKER', label: 'Bunker', shortLabel: 'Bunker', category: 'shortGame' },
  // Putting
  { id: 'PUTT_SHORT', label: 'Putting 0-2m', shortLabel: '0-2m', category: 'putting' },
  { id: 'PUTT_MED', label: 'Putting 2-5m', shortLabel: '2-5m', category: 'putting' },
  { id: 'PUTT_LONG', label: 'Putting 5m+', shortLabel: '5m+', category: 'putting' },
  // Play
  { id: 'BANE', label: 'Bane/Runder', shortLabel: 'Bane', category: 'play' },
];

const AREA_CATEGORIES = [
  { id: 'fullSwing', label: 'Tee/Drive' },
  { id: 'innspill', label: 'Innspill' },
  { id: 'shortGame', label: 'Naerspill' },
  { id: 'putting', label: 'Putting' },
  { id: 'play', label: 'Spill' },
];

// ============================================================================
// CHART COMPONENTS
// ============================================================================

// Weekly Heatmap Component
interface WeeklyHeatmapProps {
  data: Array<{ day: string; pyramids: Record<string, number> }>;
  pyramidLevels: PyramidLevel[];
}

const WeeklyHeatmap: React.FC<WeeklyHeatmapProps> = ({ data, pyramidLevels }) => {
  const maxMinutes = Math.max(...data.flatMap(d => Object.values(d.pyramids)));

  const getIntensity = (minutes: number): string => {
    if (minutes === 0) return 'transparent';
    const ratio = minutes / Math.max(maxMinutes, 1);
    if (ratio < 0.25) return 'var(--tier-navy/20)';
    if (ratio < 0.5) return 'var(--tier-navy/60)';
    if (ratio < 0.75) return 'var(--tier-navy/80)';
    return 'var(--tier-navy)';
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <div className="w-12" /> {/* Spacer for labels */}
        {pyramidLevels.filter(p => p.id !== 'ALL').map(pyramid => (
          <div
            key={pyramid.id}
            className="flex-1 text-[10px] text-center font-medium"
            style={{ color: pyramid.color }}
          >
            {pyramid.label.substring(0, 3)}
          </div>
        ))}
      </div>
      {data.map((dayData, i) => (
        <div key={i} className="flex gap-1 items-center">
          <div className="w-12 text-[11px] text-text-secondary">{dayData.day}</div>
          {pyramidLevels.filter(p => p.id !== 'ALL').map(pyramid => {
            const minutes = dayData.pyramids[pyramid.id] || 0;
            return (
              <div
                key={pyramid.id}
                className="flex-1 h-8 rounded transition-all hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: minutes > 0 ? `${pyramid.color}${Math.min(80, 20 + (minutes / Math.max(maxMinutes, 1)) * 60)}` : 'var(--background-secondary)',
                  border: minutes > 0 ? `1px solid ${pyramid.color}40` : '1px solid var(--border-subtle)'
                }}
                title={`${dayData.day} - ${pyramid.label}: ${minutes} min`}
              >
                {minutes > 0 && (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-medium" style={{ color: pyramid.color }}>
                    {minutes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Trend Line Chart Component
interface TrendLineChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
  color?: string;
  showArea?: boolean;
}

const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  height = 120,
  color = 'var(--tier-navy)',
  showArea = true
}) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue || 1;

  // Create SVG path points
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - ((d.value - minValue) / range) * 100,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L 100 100 L 0 100 Z`;

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--border-subtle)" strokeWidth="0.5" />
        ))}

        {/* Area fill */}
        {showArea && <path d={areaPath} fill="url(#areaGradient)" />}

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} className="hover:r-3 transition-all" />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-text-secondary -mb-4">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};

// Goal Progress Ring Component
interface GoalProgressRingProps {
  current: number;
  goal: number;
  unit: string;
  label: string;
  color?: string;
  size?: number;
}

const GoalProgressRing: React.FC<GoalProgressRingProps> = ({
  current,
  goal,
  unit,
  label,
  color = 'var(--tier-navy)',
  size = 100
}) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--border-default)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-text-primary">{current}</span>
          <span className="text-[10px] text-text-secondary">/ {goal} {unit}</span>
        </div>
      </div>
      <span className="text-xs text-text-secondary mt-2">{label}</span>
    </div>
  );
};

// Distribution Donut Chart
interface DonutChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 120,
  centerLabel,
  centerValue
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercentage = 0;
  const segments = data.map(d => {
    const percentage = (d.value / total) * 100;
    const segment = {
      ...d,
      percentage,
      offset: cumulativePercentage,
    };
    cumulativePercentage += percentage;
    return segment;
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {segments.map((segment, i) => {
          const dashArray = (segment.percentage / 100) * circumference;
          const dashOffset = -(segment.offset / 100) * circumference;

          return (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="12"
              strokeDasharray={`${dashArray} ${circumference}`}
              strokeDashoffset={dashOffset}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerValue && <span className="text-lg font-bold text-text-primary">{centerValue}</span>}
        {centerLabel && <span className="text-[10px] text-text-secondary">{centerLabel}</span>}
      </div>
    </div>
  );
};

// ============================================================================
// ELITE COACH COMPONENTS
// ============================================================================

// 1. ACWR (Acute:Chronic Workload Ratio) Component
interface ACWRData {
  current: number;
  acute: number;    // Last 7 days
  chronic: number;  // Last 28 days rolling average
  history: Array<{ date: string; ratio: number }>;
}

interface ACWRGaugeProps {
  data: ACWRData;
}

const ACWRGauge: React.FC<ACWRGaugeProps> = ({ data }) => {
  const { current, acute, chronic, history } = data;

  // ACWR zones: <0.8 = undertrained, 0.8-1.3 = optimal, >1.5 = danger
  const getZoneColor = (ratio: number): string => {
    if (ratio < 0.8) return 'var(--status-warning)';
    if (ratio <= 1.3) return 'var(--status-success)';
    if (ratio <= 1.5) return 'var(--status-warning)';
    return 'var(--status-error)';
  };

  const getZoneLabel = (ratio: number): string => {
    if (ratio < 0.8) return 'Undertrening';
    if (ratio <= 1.3) return 'Optimal sone';
    if (ratio <= 1.5) return 'Advarsel';
    return 'Høy risiko';
  };

  // Position on gauge (0-100%)
  const gaugePosition = Math.min(Math.max((current / 2) * 100, 0), 100);

  return (
    <div className="space-y-4">
      {/* Main gauge */}
      <div className="relative h-8 rounded-full overflow-hidden bg-background-secondary">
        {/* Zone backgrounds */}
        <div className="absolute inset-0 flex">
          <div className="w-[40%] bg-warning/30" /> {/* 0-0.8 */}
          <div className="w-[25%] bg-success/30" /> {/* 0.8-1.3 */}
          <div className="w-[10%] bg-warning/30" /> {/* 1.3-1.5 */}
          <div className="w-[25%] bg-error/30" /> {/* 1.5+ */}
        </div>
        {/* Current position indicator */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-text-primary rounded-full shadow-lg transition-all duration-500"
          style={{ left: `${gaugePosition}%` }}
        />
        {/* Zone labels */}
        <div className="absolute inset-0 flex items-center text-[9px] font-medium">
          <span className="w-[40%] text-center text-warning">Under</span>
          <span className="w-[25%] text-center text-success">Optimal</span>
          <span className="w-[10%] text-center text-warning">!</span>
          <span className="w-[25%] text-center text-error">Risiko</span>
        </div>
      </div>

      {/* Current value display */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-3xl font-bold" style={{ color: getZoneColor(current) }}>
            {current.toFixed(2)}
          </span>
          <span className="text-sm text-text-secondary ml-2">ACWR</span>
        </div>
        <Badge
          className="text-xs px-2 py-1"
          style={{
            backgroundColor: `${getZoneColor(current)}20`,
            color: getZoneColor(current),
            border: `1px solid ${getZoneColor(current)}40`
          }}
        >
          {getZoneLabel(current)}
        </Badge>
      </div>

      {/* Acute vs Chronic breakdown */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
        <div>
          <p className="text-xs text-text-secondary">Akutt (7 dager)</p>
          <p className="text-lg font-semibold text-text-primary">{acute.toFixed(0)} min</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Kronisk (28 dager)</p>
          <p className="text-lg font-semibold text-text-primary">{chronic.toFixed(0)} min</p>
        </div>
      </div>

      {/* Mini trend */}
      <div className="flex items-end gap-0.5 h-12">
        {history.slice(-14).map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t transition-all"
            style={{
              height: `${Math.min((h.ratio / 2) * 100, 100)}%`,
              backgroundColor: getZoneColor(h.ratio),
              opacity: 0.3 + (i / 14) * 0.7
            }}
            title={`${h.date}: ${h.ratio.toFixed(2)}`}
          />
        ))}
      </div>
    </div>
  );
};

// 2. Training Quality Score - Radar Chart
interface QualityDimension {
  label: string;
  value: number; // 0-100
  benchmark?: number;
}

interface QualityRadarProps {
  dimensions: QualityDimension[];
  size?: number;
}

const QualityRadar: React.FC<QualityRadarProps> = ({ dimensions, size = 200 }) => {
  const center = size / 2;
  const radius = (size / 2) - 30;
  const angleStep = (2 * Math.PI) / dimensions.length;

  // Calculate polygon points
  const getPoint = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const valuePoints = dimensions.map((d, i) => getPoint(d.value, i));
  const benchmarkPoints = dimensions.map((d, i) => getPoint(d.benchmark || 0, i));

  const valuePath = valuePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const benchmarkPath = benchmarkPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Calculate overall score
  const overallScore = Math.round(dimensions.reduce((sum, d) => sum + d.value, 0) / dimensions.length);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid circles */}
        {[25, 50, 75, 100].map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 100) * radius}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="1"
            strokeDasharray={level === 100 ? "none" : "2,2"}
          />
        ))}

        {/* Axis lines */}
        {dimensions.map((_, i) => {
          const endPoint = getPoint(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="var(--border-subtle)"
              strokeWidth="1"
            />
          );
        })}

        {/* Benchmark polygon (if exists) */}
        {dimensions.some(d => d.benchmark) && (
          <path
            d={benchmarkPath}
            fill="var(--text-secondary)"
            fillOpacity="0.1"
            stroke="var(--text-secondary)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        )}

        {/* Value polygon */}
        <path
          d={valuePath}
          fill="var(--tier-navy)"
          fillOpacity="0.2"
          stroke="var(--tier-navy)"
          strokeWidth="2"
        />

        {/* Data points */}
        {valuePoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="var(--tier-navy)"
            stroke="var(--background-default)"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {dimensions.map((d, i) => {
          const labelPoint = getPoint(115, i);
          return (
            <text
              key={i}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-text-secondary"
            >
              {d.label}
            </text>
          );
        })}

        {/* Center score */}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          className="text-2xl font-bold fill-text-primary"
        >
          {overallScore}
        </text>
        <text
          x={center}
          y={center + 10}
          textAnchor="middle"
          className="text-[10px] fill-text-secondary"
        >
          Kvalitet
        </text>
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-tier-navy/30 border border-tier-navy" />
          Din score
        </span>
        {dimensions.some(d => d.benchmark) && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-text-secondary/10 border border-text-secondary border-dashed" />
            Elite benchmark
          </span>
        )}
      </div>
    </div>
  );
};

// 3. Test Result Curves - Multi-line chart
interface TestResult {
  date: string;
  value: number;
}

interface TestSeries {
  id: string;
  label: string;
  unit: string;
  color: string;
  data: TestResult[];
  target?: number;
}

interface TestCurvesProps {
  series: TestSeries[];
  height?: number;
}

const TestCurves: React.FC<TestCurvesProps> = ({ series, height = 180 }) => {
  const [activeSeries, setActiveSeries] = useState<string[]>(series.map(s => s.id));
  const [hoveredPoint, setHoveredPoint] = useState<{ seriesId: string; index: number } | null>(null);

  // Get all dates for x-axis
  const allDates = [...new Set(series.flatMap(s => s.data.map(d => d.date)))].sort();

  // Get min/max values for visible series
  const visibleSeries = series.filter(s => activeSeries.includes(s.id));
  const allValues = visibleSeries.flatMap(s => [...s.data.map(d => d.value), s.target || 0]);
  const minValue = Math.min(...allValues) * 0.9;
  const maxValue = Math.max(...allValues) * 1.1;
  const range = maxValue - minValue || 1;

  const getY = (value: number) => height - ((value - minValue) / range) * height;
  const getX = (date: string) => (allDates.indexOf(date) / (allDates.length - 1)) * 100;

  return (
    <div className="space-y-3">
      {/* Legend / Toggle */}
      <div className="flex flex-wrap gap-2">
        {series.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSeries(prev =>
              prev.includes(s.id)
                ? prev.filter(id => id !== s.id)
                : [...prev, s.id]
            )}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all",
              activeSeries.includes(s.id)
                ? "bg-background-elevated"
                : "bg-background-secondary opacity-50"
            )}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(pct => (
            <line
              key={pct}
              x1="0"
              y1={height * (pct / 100)}
              x2="100"
              y2={height * (pct / 100)}
              stroke="var(--border-subtle)"
              strokeWidth="0.3"
            />
          ))}

          {/* Series lines and areas */}
          {visibleSeries.map(s => {
            const points = s.data.map(d => ({
              x: getX(d.date),
              y: getY(d.value),
              value: d.value,
              date: d.date
            }));

            const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

            return (
              <g key={s.id}>
                {/* Area fill */}
                <path
                  d={areaPath}
                  fill={s.color}
                  fillOpacity="0.1"
                />
                {/* Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Target line */}
                {s.target && (
                  <line
                    x1="0"
                    y1={getY(s.target)}
                    x2="100"
                    y2={getY(s.target)}
                    stroke={s.color}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.5"
                  />
                )}
                {/* Data points */}
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.seriesId === s.id && hoveredPoint?.index === i ? 5 : 3}
                    fill={s.color}
                    stroke="var(--background-default)"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPoint({ seriesId: s.id, index: i })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (() => {
          const s = series.find(s => s.id === hoveredPoint.seriesId);
          const point = s?.data[hoveredPoint.index];
          if (!s || !point) return null;
          return (
            <div
              className="absolute bg-background-elevated border border-border-default rounded-lg shadow-lg p-2 text-xs pointer-events-none z-10"
              style={{
                left: `${getX(point.date)}%`,
                top: getY(point.value) - 50,
                transform: 'translateX(-50%)'
              }}
            >
              <p className="font-medium" style={{ color: s.color }}>{s.label}</p>
              <p className="text-text-primary font-bold">{point.value} {s.unit}</p>
              <p className="text-text-secondary">{point.date}</p>
            </div>
          );
        })()}

        {/* X-axis labels */}
        <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-[9px] text-text-secondary">
          {allDates.filter((_, i) => i % Math.ceil(allDates.length / 6) === 0).map(date => (
            <span key={date}>{date}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4. Periodization Timeline Component
interface PeriodPhase {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  type: 'base' | 'build' | 'peak' | 'taper' | 'recovery' | 'competition';
  color: string;
}

interface PeriodizationTimelineProps {
  phases: PeriodPhase[];
  currentDate: string;
  nextCompetition?: { name: string; date: string };
}

const PeriodizationTimeline: React.FC<PeriodizationTimelineProps> = ({
  phases,
  currentDate,
  nextCompetition
}) => {
  // Calculate timeline bounds
  const allDates = phases.flatMap(p => [new Date(p.startDate), new Date(p.endDate)]);
  const minDate = Math.min(...allDates.map(d => d.getTime()));
  const maxDate = Math.max(...allDates.map(d => d.getTime()));
  const totalDuration = maxDate - minDate;

  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr).getTime();
    return ((date - minDate) / totalDuration) * 100;
  };

  const currentPosition = getPosition(currentDate);
  const currentPhase = phases.find(p =>
    new Date(currentDate) >= new Date(p.startDate) &&
    new Date(currentDate) <= new Date(p.endDate)
  );

  // Days until next competition
  const daysUntilComp = nextCompetition
    ? Math.ceil((new Date(nextCompetition.date).getTime() - new Date(currentDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-4">
      {/* Current phase display */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text-secondary">Nåværende fase</p>
          <p className="text-lg font-bold" style={{ color: currentPhase?.color || 'var(--text-primary)' }}>
            {currentPhase?.label || 'Ukjent'}
          </p>
        </div>
        {nextCompetition && (
          <div className="text-right">
            <p className="text-xs text-text-secondary">Neste konkurranse</p>
            <p className="text-sm font-semibold text-text-primary">{nextCompetition.name}</p>
            <p className="text-lg font-bold text-achievement">{daysUntilComp} dager</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative h-12 rounded-lg overflow-hidden bg-background-secondary">
        {/* Phase blocks */}
        {phases.map((phase, i) => {
          const start = getPosition(phase.startDate);
          const end = getPosition(phase.endDate);
          const width = end - start;

          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 flex items-center justify-center text-[10px] font-medium transition-all hover:brightness-110"
              style={{
                left: `${start}%`,
                width: `${width}%`,
                backgroundColor: phase.color,
                color: 'white',
                opacity: phase === currentPhase ? 1 : 0.6
              }}
              title={`${phase.label}: ${phase.startDate} - ${phase.endDate}`}
            >
              {width > 10 && phase.label}
            </div>
          );
        })}

        {/* Current position marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-text-primary z-10"
          style={{ left: `${currentPosition}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-text-primary rounded-full border-2 border-background-default" />
        </div>

        {/* Competition marker */}
        {nextCompetition && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-achievement z-10"
            style={{ left: `${getPosition(nextCompetition.date)}%` }}
          >
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <Flame size={14} className="text-achievement" />
            </div>
          </div>
        )}
      </div>

      {/* Phase legend */}
      <div className="flex flex-wrap gap-2">
        {[
          { type: 'base', label: 'Grunntrening', color: 'var(--tier-navy)' },
          { type: 'build', label: 'Oppbygging', color: 'var(--status-success)' },
          { type: 'peak', label: 'Toppform', color: 'var(--achievement)' },
          { type: 'taper', label: 'Nedtrapping', color: 'var(--status-warning)' },
          { type: 'competition', label: 'Konkurranse', color: 'var(--status-error)' },
          { type: 'recovery', label: 'Restitusjon', color: 'var(--text-secondary)' },
        ].map(item => (
          <span key={item.type} className="flex items-center gap-1 text-[10px] text-text-secondary">
            <span className="w-2 h-2 rounded" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>

      {/* Mesocycle info */}
      {currentPhase && (
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border-subtle">
          <div>
            <p className="text-[10px] text-text-secondary uppercase">Fase start</p>
            <p className="text-sm font-medium text-text-primary">{currentPhase.startDate}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-secondary uppercase">Fase slutt</p>
            <p className="text-sm font-medium text-text-primary">{currentPhase.endDate}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-secondary uppercase">Fremgang</p>
            <Progress
              value={(() => {
                const start = new Date(currentPhase.startDate).getTime();
                const end = new Date(currentPhase.endDate).getTime();
                const current = new Date(currentDate).getTime();
                return ((current - start) / (end - start)) * 100;
              })()}
              className="mt-1 h-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Recent Sessions List Component
interface RecentSession {
  id: string;
  title: string;
  pyramid: string;
  duration: number;
  date: string;
  rating?: number;
}

interface RecentSessionsListProps {
  sessions: RecentSession[];
  pyramidLevels: PyramidLevel[];
}

const RecentSessionsList: React.FC<RecentSessionsListProps> = ({ sessions, pyramidLevels }) => (
  <div className="space-y-2">
    {sessions.map(session => {
      const pyramid = pyramidLevels.find(p => p.id === session.pyramid);
      return (
        <div
          key={session.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-background-secondary hover:bg-background-elevated transition-colors cursor-pointer"
        >
          <div
            className="w-2 h-10 rounded-full"
            style={{ backgroundColor: pyramid?.color || 'var(--text-secondary)' }}
          />
          <div className="flex-1 min-w-0">
            <TypographyCardTitle style={{ marginBottom: 0 }} className="text-sm font-medium text-text-primary truncate">{session.title}</TypographyCardTitle>
            <p className="text-[11px] text-text-secondary">{session.date}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary">{session.duration}min</p>
            {session.rating && (
              <div className="flex items-center gap-0.5 justify-end">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={10}
                    className={star <= session.rating! ? 'fill-warning text-warning' : 'text-border-default'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

interface CompareBarChartProps {
  data: Array<{ label: string; value1: number; value2: number; color1: string; color2: string }>;
  height?: number;
  legend?: { label1: string; label2: string };
}

const CompareBarChart: React.FC<CompareBarChartProps> = ({ data, height = 140, legend }) => {
  const maxValue = Math.max(...data.flatMap(d => [d.value1, d.value2]));

  return (
    <div className="space-y-2">
      {legend && (
        <div className="flex justify-center gap-6 text-xs mb-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: data[0]?.color1 }} />
            {legend.label1}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: data[0]?.color2 }} />
            {legend.label2}
          </span>
        </div>
      )}
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex gap-1 w-full justify-center" style={{ height: height - 20 }}>
              <div
                className="flex-1 max-w-6 rounded-t transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${maxValue > 0 ? (item.value1 / maxValue) * 100 : 0}%`,
                  backgroundColor: item.color1,
                  minHeight: item.value1 > 0 ? 4 : 0,
                }}
              />
              <div
                className="flex-1 max-w-6 rounded-t transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${maxValue > 0 ? (item.value2 / maxValue) * 100 : 0}%`,
                  backgroundColor: item.color2,
                  minHeight: item.value2 > 0 ? 4 : 0,
                }}
              />
            </div>
            <span className="text-[10px] text-text-secondary text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SimpleBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  height?: number;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, height = 100 }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t transition-all duration-300 hover:opacity-80"
            style={{
              height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
              backgroundColor: item.color || 'var(--tier-navy)',
              minHeight: item.value > 0 ? 4 : 0,
            }}
          />
          <span className="text-[10px] text-text-secondary">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  label: string;
  badge?: React.ReactNode;
  progress?: { value: number; max: number };
  trend?: { value: number; positive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBg,
  value,
  label,
  badge,
  progress,
  trend
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          {icon}
        </div>
        {badge}
        {trend && (
          <span className={cn(
            "flex items-center gap-1 text-xs",
            trend.positive ? "text-success" : "text-error"
          )}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
      {progress && (
        <Progress
          value={(progress.value / progress.max) * 100}
          className="mt-2 h-1.5"
        />
      )}
    </CardContent>
  </Card>
);

// ============================================================================
// AREA CARD COMPONENT
// ============================================================================

interface AreaCardProps {
  area: TrainingArea;
  hours: number;
  sessions: number;
  byPyramid?: Record<string, number>;
  selectedPyramid: string;
  pyramidLevels: PyramidLevel[];
}

const AreaCard: React.FC<AreaCardProps> = ({
  area,
  hours,
  sessions,
  byPyramid,
  selectedPyramid,
  pyramidLevels
}) => {
  const pyramidColor = pyramidLevels.find(p => p.id === selectedPyramid)?.color || 'var(--tier-navy)';

  return (
    <Card className="hover:border-tier-navy/30 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <TypographyCardTitle style={{ marginBottom: 0 }} className="font-semibold text-text-primary text-sm">{area.label}</TypographyCardTitle>
            <p className="text-[10px] text-text-secondary uppercase">{
              AREA_CATEGORIES.find(c => c.id === area.category)?.label
            }</p>
          </div>
          <BarChart3 size={16} style={{ color: pyramidColor }} />
        </div>

        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-2xl font-bold text-text-primary">{hours.toFixed(1)}t</span>
          <span className="text-xs text-text-secondary">{sessions} økter</span>
        </div>

        {/* Pyramid breakdown when viewing "Alle" */}
        {selectedPyramid === 'ALL' && byPyramid && Object.keys(byPyramid).length > 0 && (
          <div className="mt-3 pt-2 border-t border-border-subtle">
            <div className="flex flex-wrap gap-1">
              {Object.entries(byPyramid)
                .filter(([_, val]) => val > 0)
                .map(([pyramidId, hours]) => {
                  const pyramid = pyramidLevels.find(p => p.id === pyramidId);
                  if (!pyramid || pyramidId === 'ALL') return null;
                  return (
                    <Badge
                      key={pyramidId}
                      variant="outline"
                      className="text-[9px] px-1.5 py-0"
                      style={{ borderColor: pyramid.color, color: pyramid.color }}
                    >
                      {pyramid.label}: {hours.toFixed(1)}t
                    </Badge>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// PYRAMID TAB COMPONENT
// ============================================================================

interface PyramidTabsProps {
  selected: string;
  onSelect: (id: string) => void;
  pyramidLevels: PyramidLevel[];
  stats?: Record<string, { sessions: number; hours: number }>;
}

const PyramidTabs: React.FC<PyramidTabsProps> = ({ selected, onSelect, pyramidLevels, stats }) => (
  <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
    {pyramidLevels.map((level) => {
      const isActive = selected === level.id;
      const levelStats = stats?.[level.id];

      return (
        <button
          key={level.id}
          onClick={() => onSelect(level.id)}
          className={cn(
            "flex flex-col items-center px-4 py-2 rounded-lg transition-all min-w-[80px]",
            "border-2",
            isActive
              ? "border-current shadow-sm"
              : "border-transparent bg-background-elevated hover:bg-background-secondary"
          )}
          style={{
            borderColor: isActive ? level.color : 'transparent',
            backgroundColor: isActive ? `${level.color}10` : undefined
          }}
        >
          <span
            className="font-semibold text-sm"
            style={{ color: isActive ? level.color : 'var(--text-secondary)' }}
          >
            {level.label}
          </span>
          {levelStats && level.id !== 'ALL' && (
            <span className="text-[10px] text-text-secondary mt-0.5">
              {levelStats.hours.toFixed(1)}t
            </span>
          )}
        </button>
      );
    })}
  </div>
);

// ============================================================================
// COMPARE FILTER COMPONENT
// ============================================================================

interface CompareFilterProps {
  pyramid1: string;
  pyramid2: string;
  area: string;
  onPyramid1Change: (val: string) => void;
  onPyramid2Change: (val: string) => void;
  onAreaChange: (val: string) => void;
  pyramidLevels: PyramidLevel[];
  trainingAreas: TrainingArea[];
}

const CompareFilter: React.FC<CompareFilterProps> = ({
  pyramid1,
  pyramid2,
  area,
  onPyramid1Change,
  onPyramid2Change,
  onAreaChange,
  pyramidLevels,
  trainingAreas
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={16} className="text-text-secondary" />
        <span className="text-sm font-medium text-text-primary">Sammenlign pyramidenivå</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={pyramid1} onValueChange={onPyramid1Change}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Velg..." />
          </SelectTrigger>
          <SelectContent>
            {pyramidLevels.filter(p => p.id !== 'ALL').map(level => (
              <SelectItem key={level.id} value={level.id}>
                <span style={{ color: level.color }}>{level.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-text-secondary text-sm font-medium">vs</span>

        <Select value={pyramid2} onValueChange={onPyramid2Change}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Velg..." />
          </SelectTrigger>
          <SelectContent>
            {pyramidLevels.filter(p => p.id !== 'ALL').map(level => (
              <SelectItem key={level.id} value={level.id}>
                <span style={{ color: level.color }}>{level.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-text-secondary text-sm">på</span>

        <Select value={area} onValueChange={onAreaChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Alle områder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Alle områder</SelectItem>
            <Separator className="my-1" />
            {AREA_CATEGORIES.map(cat => (
              <React.Fragment key={cat.id}>
                <div className="px-2 py-1 text-[10px] font-semibold text-text-secondary uppercase">
                  {cat.label}
                </div>
                {trainingAreas.filter(a => a.category === cat.id).map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                ))}
              </React.Fragment>
            ))}
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface TreningsstatistikkProps {
  stats?: Stats | null;
  onRefresh?: () => void;
}

const Treningsstatistikk: React.FC<TreningsstatistikkProps> = ({
  stats: apiStats = null,
  onRefresh
}) => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedPyramid, setSelectedPyramid] = useState('ALL');
  const [comparePyramid1, setComparePyramid1] = useState('TEK');
  const [comparePyramid2, setComparePyramid2] = useState('SLAG');
  const [compareArea, setCompareArea] = useState('ALL');

  // Demo data for pyramid stats
  const pyramidStats: Record<string, { sessions: number; hours: number }> = apiStats?.byPyramid || {
    ALL: { sessions: 45, hours: 67.5 },
    FYS: { sessions: 8, hours: 6.0 },
    TEK: { sessions: 15, hours: 22.5 },
    SLAG: { sessions: 12, hours: 18.0 },
    SPILL: { sessions: 7, hours: 14.0 },
    TURN: { sessions: 3, hours: 7.0 },
  };

  // Demo data for area stats with pyramid breakdown
  const areaStats: Record<string, { sessions: number; hours: number; byPyramid: Record<string, number> }> = apiStats?.byArea || {
    TEE: { sessions: 12, hours: 8.5, byPyramid: { TEK: 4.5, SLAG: 3.0, SPILL: 1.0 } },
    INN200: { sessions: 5, hours: 3.0, byPyramid: { TEK: 1.5, SLAG: 1.0, SPILL: 0.5 } },
    INN150: { sessions: 8, hours: 5.5, byPyramid: { TEK: 3.0, SLAG: 2.0, SPILL: 0.5 } },
    INN100: { sessions: 10, hours: 7.0, byPyramid: { TEK: 4.0, SLAG: 2.5, SPILL: 0.5 } },
    INN50: { sessions: 6, hours: 4.0, byPyramid: { TEK: 2.0, SLAG: 1.5, SPILL: 0.5 } },
    CHIP: { sessions: 8, hours: 4.5, byPyramid: { TEK: 2.5, SLAG: 1.5, SPILL: 0.5 } },
    PITCH: { sessions: 7, hours: 4.0, byPyramid: { TEK: 2.0, SLAG: 1.5, SPILL: 0.5 } },
    LOB: { sessions: 4, hours: 2.5, byPyramid: { TEK: 1.5, SLAG: 0.5, SPILL: 0.5 } },
    BUNKER: { sessions: 5, hours: 3.0, byPyramid: { TEK: 1.5, SLAG: 1.0, SPILL: 0.5 } },
    PUTT_SHORT: { sessions: 10, hours: 5.0, byPyramid: { TEK: 2.5, SLAG: 2.0, SPILL: 0.5 } },
    PUTT_MED: { sessions: 8, hours: 4.0, byPyramid: { TEK: 2.0, SLAG: 1.5, SPILL: 0.5 } },
    PUTT_LONG: { sessions: 5, hours: 2.5, byPyramid: { TEK: 1.0, SLAG: 1.0, SPILL: 0.5 } },
    BANE: { sessions: 7, hours: 14.0, byPyramid: { SPILL: 10.0, TURN: 4.0 } },
  };

  // Weekly stats with fallbacks
  const weeklyStats = {
    totalHours: pyramidStats.ALL?.hours || 67.5,
    targetHours: apiStats?.weeklyGoal || 25,
    sessionsCompleted: pyramidStats.ALL?.sessions || 45,
    targetSessions: 50,
    streak: apiStats?.currentStreak || 14,
  };

  // Demo data for weekly heatmap
  const weeklyHeatmapData = [
    { day: 'Man', pyramids: { FYS: 45, TEK: 60, SLAG: 30, SPILL: 0, TURN: 0 } },
    { day: 'Tir', pyramids: { FYS: 30, TEK: 45, SLAG: 45, SPILL: 90, TURN: 0 } },
    { day: 'Ons', pyramids: { FYS: 0, TEK: 60, SLAG: 60, SPILL: 0, TURN: 0 } },
    { day: 'Tor', pyramids: { FYS: 45, TEK: 30, SLAG: 0, SPILL: 60, TURN: 0 } },
    { day: 'Fre', pyramids: { FYS: 0, TEK: 90, SLAG: 45, SPILL: 0, TURN: 0 } },
    { day: 'Lør', pyramids: { FYS: 30, TEK: 0, SLAG: 30, SPILL: 120, TURN: 180 } },
    { day: 'Søn', pyramids: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 90, TURN: 0 } },
  ];

  // Demo data for trend line (last 8 weeks)
  const trendData = [
    { label: 'U45', value: 12.5 },
    { label: 'U46', value: 15.0 },
    { label: 'U47', value: 11.5 },
    { label: 'U48', value: 18.0 },
    { label: 'U49', value: 14.0 },
    { label: 'U50', value: 20.5 },
    { label: 'U51', value: 17.5 },
    { label: 'U52', value: 22.0 },
  ];

  // Demo data for recent sessions
  const recentSessions: RecentSession[] = [
    { id: '1', title: 'Driver-teknikk', pyramid: 'TEK', duration: 60, date: 'I dag, 14:00', rating: 4 },
    { id: '2', title: 'Putting-drill', pyramid: 'SLAG', duration: 45, date: 'I dag, 10:30', rating: 5 },
    { id: '3', title: 'Styrketrening', pyramid: 'FYS', duration: 50, date: 'I går, 16:00', rating: 3 },
    { id: '4', title: '9 hull runde', pyramid: 'SPILL', duration: 120, date: 'I går, 09:00', rating: 4 },
    { id: '5', title: 'Innspill 100m', pyramid: 'SLAG', duration: 40, date: '2 dager siden', rating: 4 },
  ];

  // Donut chart data
  const donutData = PYRAMID_LEVELS.filter(p => p.id !== 'ALL').map(level => ({
    label: level.label,
    value: pyramidStats[level.id]?.hours || 0,
    color: level.color,
  }));

  // ============================================================================
  // ELITE COACH DATA
  // ============================================================================

  // 1. ACWR Data
  const acwrData: ACWRData = {
    current: 1.12,
    acute: 840,  // 7 days total minutes
    chronic: 750, // 28 days average per week
    history: [
      { date: '20/12', ratio: 0.95 },
      { date: '21/12', ratio: 0.98 },
      { date: '22/12', ratio: 1.02 },
      { date: '23/12', ratio: 1.05 },
      { date: '24/12', ratio: 1.08 },
      { date: '25/12', ratio: 0.72 }, // Holiday
      { date: '26/12', ratio: 0.85 },
      { date: '27/12', ratio: 0.92 },
      { date: '28/12', ratio: 1.05 },
      { date: '29/12', ratio: 1.15 },
      { date: '30/12', ratio: 1.18 },
      { date: '31/12', ratio: 0.95 },
      { date: '01/01', ratio: 0.88 },
      { date: '02/01', ratio: 1.12 },
    ],
  };

  // 2. Quality Score Dimensions
  const qualityDimensions: QualityDimension[] = [
    { label: 'Fokus', value: 85, benchmark: 90 },
    { label: 'Intensitet', value: 78, benchmark: 85 },
    { label: 'Teknikk', value: 82, benchmark: 88 },
    { label: 'Målrettet', value: 70, benchmark: 85 },
    { label: 'Utførelse', value: 88, benchmark: 92 },
    { label: 'Konsistens', value: 75, benchmark: 80 },
  ];

  // 3. Test Result Series
  const testSeries: TestSeries[] = [
    {
      id: 'clubSpeed',
      label: 'Klubbfart',
      unit: 'mph',
      color: 'var(--tier-navy)',
      target: 115,
      data: [
        { date: 'Jan', value: 108 },
        { date: 'Feb', value: 109 },
        { date: 'Mar', value: 110 },
        { date: 'Apr', value: 111 },
        { date: 'Mai', value: 110 },
        { date: 'Jun', value: 112 },
        { date: 'Jul', value: 113 },
        { date: 'Aug', value: 112 },
        { date: 'Sep', value: 114 },
        { date: 'Okt', value: 113 },
        { date: 'Nov', value: 115 },
        { date: 'Des', value: 114 },
      ],
    },
    {
      id: 'sgTotal',
      label: 'Strokes Gained',
      unit: 'SG',
      color: 'var(--status-success)',
      target: 3.0,
      data: [
        { date: 'Jan', value: 1.2 },
        { date: 'Feb', value: 1.4 },
        { date: 'Mar', value: 1.5 },
        { date: 'Apr', value: 1.8 },
        { date: 'Mai', value: 1.6 },
        { date: 'Jun', value: 2.0 },
        { date: 'Jul', value: 2.2 },
        { date: 'Aug', value: 2.1 },
        { date: 'Sep', value: 2.4 },
        { date: 'Okt', value: 2.3 },
        { date: 'Nov', value: 2.6 },
        { date: 'Des', value: 2.5 },
      ],
    },
    {
      id: 'averageScore',
      label: 'Snitt Score',
      unit: 'slag',
      color: 'var(--achievement)',
      target: 72,
      data: [
        { date: 'Jan', value: 76.2 },
        { date: 'Feb', value: 76.0 },
        { date: 'Mar', value: 75.8 },
        { date: 'Apr', value: 75.5 },
        { date: 'Mai', value: 75.6 },
        { date: 'Jun', value: 75.2 },
        { date: 'Jul', value: 74.9 },
        { date: 'Aug', value: 75.0 },
        { date: 'Sep', value: 74.6 },
        { date: 'Okt', value: 74.4 },
        { date: 'Nov', value: 74.1 },
        { date: 'Des', value: 73.8 },
      ],
    },
  ];

  // 4. Periodization Phases
  const periodPhases: PeriodPhase[] = [
    { id: '1', label: 'Grunntrening', startDate: '2025-10-01', endDate: '2025-11-30', type: 'base', color: 'var(--tier-navy)' },
    { id: '2', label: 'Oppbygging', startDate: '2025-12-01', endDate: '2026-01-15', type: 'build', color: 'var(--status-success)' },
    { id: '3', label: 'Toppform', startDate: '2026-01-16', endDate: '2026-02-10', type: 'peak', color: 'var(--achievement)' },
    { id: '4', label: 'Nedtrapping', startDate: '2026-02-11', endDate: '2026-02-17', type: 'taper', color: 'var(--status-warning)' },
    { id: '5', label: 'Konkurranse', startDate: '2026-02-18', endDate: '2026-02-23', type: 'competition', color: 'var(--status-error)' },
    { id: '6', label: 'Restitusjon', startDate: '2026-02-24', endDate: '2026-03-10', type: 'recovery', color: 'var(--text-secondary)' },
  ];

  const nextCompetition = { name: 'NM Innendørs', date: '2026-02-20' };

  // Filter areas based on selected pyramid
  const filteredAreaStats = useMemo(() => {
    if (selectedPyramid === 'ALL') {
      return areaStats;
    }

    // Filter to only show areas with hours in the selected pyramid
    const filtered: typeof areaStats = {};
    Object.entries(areaStats).forEach(([areaId, stats]) => {
      const pyramidHours = stats.byPyramid?.[selectedPyramid] || 0;
      if (pyramidHours > 0) {
        filtered[areaId] = {
          ...stats,
          hours: pyramidHours,
          sessions: Math.round(stats.sessions * (pyramidHours / stats.hours)),
        };
      }
    });
    return filtered;
  }, [selectedPyramid, areaStats]);

  // Compare chart data
  const compareChartData = useMemo(() => {
    const areasToShow = compareArea === 'ALL'
      ? TRAINING_AREAS
      : TRAINING_AREAS.filter(a => a.id === compareArea);

    const pyramid1Data = PYRAMID_LEVELS.find(p => p.id === comparePyramid1);
    const pyramid2Data = PYRAMID_LEVELS.find(p => p.id === comparePyramid2);

    return areasToShow.map(area => ({
      label: area.shortLabel,
      value1: areaStats[area.id]?.byPyramid?.[comparePyramid1] || 0,
      value2: areaStats[area.id]?.byPyramid?.[comparePyramid2] || 0,
      color1: pyramid1Data?.color || 'var(--tier-navy)',
      color2: pyramid2Data?.color || 'var(--status-success)',
    }));
  }, [comparePyramid1, comparePyramid2, compareArea, areaStats]);

  // Group areas by category for display
  const groupedAreas = useMemo(() => {
    const groups: Record<string, TrainingArea[]> = {};
    TRAINING_AREAS.forEach(area => {
      if (!groups[area.category]) {
        groups[area.category] = [];
      }
      groups[area.category].push(area);
    });
    return groups;
  }, []);

  return (
    <div className="min-h-screen bg-background-default">
      {/* Header */}
      <PageHeader
        title="Treningsstatistikk"
        subtitle="Oversikt over treningsaktivitet"
        helpText="Se statistikk over din treningsaktivitet. Analyser trender og forbedringsområder."
        actions={
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map(range => (
                <SelectItem key={range.id} value={range.id}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Clock className="w-5 h-5 text-tier-navy" />}
            iconBg="bg-tier-navy/10"
            value={`${weeklyStats.totalHours}t`}
            label="Total treningstid"
            badge={<Badge className="bg-success/15 text-success border-0">+15%</Badge>}
          />
          <StatCard
            icon={<Target className="w-5 h-5 text-success" />}
            iconBg="bg-success/10"
            value={weeklyStats.sessionsCompleted}
            label="økter fullført"
            progress={{ value: weeklyStats.sessionsCompleted, max: weeklyStats.targetSessions }}
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-achievement" />}
            iconBg="bg-achievement/10"
            value={`${Math.round((weeklyStats.totalHours / weeklyStats.sessionsCompleted) * 60)}min`}
            label="snitt per økt"
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            icon={<Award className="w-5 h-5 text-error" />}
            iconBg="bg-error/10"
            value={weeklyStats.streak}
            label="dager på rad"
            badge={<StreakBadge streak={weeklyStats.streak} size="sm" />}
          />
        </div>

        {/* Visual Statistics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Weekly Activity Heatmap */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Flame size={16} className="text-warning" />
                Ukeaktivitet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyHeatmap data={weeklyHeatmapData} pyramidLevels={PYRAMID_LEVELS} />
            </CardContent>
          </Card>

          {/* Goal Progress + Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Ukemål</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-6">
                <GoalProgressRing
                  current={Math.round(weeklyStats.totalHours)}
                  goal={weeklyStats.targetHours}
                  unit="t"
                  label="Timer"
                  color="var(--tier-navy)"
                  size={90}
                />
                <GoalProgressRing
                  current={weeklyStats.sessionsCompleted}
                  goal={weeklyStats.targetSessions}
                  unit="økter"
                  label="Økter"
                  color="var(--status-success)"
                  size={90}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend and Distribution Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trend Line Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp size={16} className="text-success" />
                Treningstrend (siste 8 uker)
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <TrendLineChart data={trendData} height={140} color="var(--tier-navy)" />
              <div className="mt-6 flex items-center justify-between text-xs text-text-secondary">
                <span>Gjennomsnitt: {(trendData.reduce((sum, d) => sum + d.value, 0) / trendData.length).toFixed(1)}t/uke</span>
                <span className="flex items-center gap-1 text-success">
                  <TrendingUp size={12} />
                  +{((trendData[trendData.length - 1].value - trendData[0].value) / trendData[0].value * 100).toFixed(0)}% fra start
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Donut + Recent Sessions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Fordeling</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <DonutChart
                  data={donutData}
                  size={120}
                  centerValue={`${pyramidStats.ALL?.hours.toFixed(0)}t`}
                  centerLabel="totalt"
                />
                {/* Legend */}
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 w-full">
                  {donutData.map(d => (
                    <div key={d.label} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-text-secondary truncate">{d.label}</span>
                      <span className="font-medium text-text-primary ml-auto">{d.value.toFixed(1)}t</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions - HIDDEN per user request */}
        {/* <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity size={16} className="text-tier-navy" />
                Siste økter
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-text-secondary">
                Se alle
                <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RecentSessionsList sessions={recentSessions} pyramidLevels={PYRAMID_LEVELS} />
          </CardContent>
        </Card> */}

        {/* ============================================================ */}
        {/* ELITE COACH SECTION */}
        {/* ============================================================ */}

        <Separator className="my-2" />

        <div className="flex items-center gap-2 mb-4">
          <Award size={20} className="text-achievement" />
          <SectionTitle style={{ marginBottom: 0 }}>Elite Trener Innsikt</SectionTitle>
          <Badge variant="outline" className="text-[10px] bg-achievement/10 text-achievement border-achievement/30">
            PRO
          </Badge>
        </div>

        {/* Row 1: ACWR + Quality Score */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ACWR Gauge */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity size={16} className="text-error" />
                Belastningsstyring (ACWR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ACWRGauge data={acwrData} />
            </CardContent>
          </Card>

          {/* Quality Score Radar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Star size={16} className="text-warning" />
                Treningskvalitet
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <QualityRadar dimensions={qualityDimensions} size={220} />
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Test Curves */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp size={16} className="text-success" />
              Testresultater over tid
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <TestCurves series={testSeries} height={200} />
          </CardContent>
        </Card>

        {/* Row 3: Periodization Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target size={16} className="text-tier-navy" />
              Periodisering & Årsplan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PeriodizationTimeline
              phases={periodPhases}
              currentDate="2026-01-05"
              nextCompetition={nextCompetition}
            />
          </CardContent>
        </Card>

        <Separator className="my-2" />

        {/* Pyramid Level Tabs */}
        <Card>
          <CardContent className="p-4">
            <SubSectionTitle style={{ marginBottom: '0.75rem' }} className="text-sm font-semibold text-text-primary">Treningskategorier</SubSectionTitle>
            <PyramidTabs
              selected={selectedPyramid}
              onSelect={setSelectedPyramid}
              pyramidLevels={PYRAMID_LEVELS}
              stats={pyramidStats}
            />
          </CardContent>
        </Card>

        {/* Compare Filter */}
        <CompareFilter
          pyramid1={comparePyramid1}
          pyramid2={comparePyramid2}
          area={compareArea}
          onPyramid1Change={setComparePyramid1}
          onPyramid2Change={setComparePyramid2}
          onAreaChange={setCompareArea}
          pyramidLevels={PYRAMID_LEVELS}
          trainingAreas={TRAINING_AREAS}
        />

        {/* Compare Chart */}
        {comparePyramid1 && comparePyramid2 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                {PYRAMID_LEVELS.find(p => p.id === comparePyramid1)?.label} vs {PYRAMID_LEVELS.find(p => p.id === comparePyramid2)?.label}
                {compareArea !== 'ALL' && ` - ${TRAINING_AREAS.find(a => a.id === compareArea)?.label}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompareBarChart
                data={compareChartData}
                height={160}
                legend={{
                  label1: PYRAMID_LEVELS.find(p => p.id === comparePyramid1)?.label || '',
                  label2: PYRAMID_LEVELS.find(p => p.id === comparePyramid2)?.label || '',
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Training Areas by Category */}
        {AREA_CATEGORIES.map(category => {
          const categoryAreas = groupedAreas[category.id] || [];
          const visibleAreas = categoryAreas.filter(area => filteredAreaStats[area.id]);

          if (visibleAreas.length === 0) return null;

          return (
            <div key={category.id}>
              <SubSectionTitle style={{ marginBottom: '0.75rem' }} className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                {category.label}
              </SubSectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {visibleAreas.map(area => {
                  const stats = filteredAreaStats[area.id];
                  if (!stats) return null;

                  return (
                    <AreaCard
                      key={area.id}
                      area={area}
                      hours={stats.hours}
                      sessions={stats.sessions}
                      byPyramid={selectedPyramid === 'ALL' ? stats.byPyramid : undefined}
                      selectedPyramid={selectedPyramid}
                      pyramidLevels={PYRAMID_LEVELS}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {Object.keys(filteredAreaStats).length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 size={48} className="mx-auto mb-4 text-text-secondary opacity-30" />
              <SubSectionTitle style={{ marginBottom: '0.5rem' }} className="text-lg font-semibold text-text-primary">Ingen data</SubSectionTitle>
              <p className="text-sm text-text-secondary">
                Ingen treningsdata for valgt pyramidenivå. Prøv å velge "Alle" eller en annen kategori.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Summary by Pyramid */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Fordeling per kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={PYRAMID_LEVELS.filter(p => p.id !== 'ALL').map(level => ({
                label: level.label.substring(0, 3),
                value: pyramidStats[level.id]?.hours || 0,
                color: level.color,
              }))}
              height={120}
            />
            <div className="mt-4 grid grid-cols-5 gap-2">
              {PYRAMID_LEVELS.filter(p => p.id !== 'ALL').map(level => {
                const Icon = level.icon;
                return (
                  <div key={level.id} className="text-center">
                    {Icon && (
                      <div className="flex justify-center mb-1">
                        <Icon size={16} style={{ color: level.color }} />
                      </div>
                    )}
                    <p className="text-lg font-bold" style={{ color: level.color }}>
                      {pyramidStats[level.id]?.hours.toFixed(1)}t
                    </p>
                    <p className="text-[10px] text-text-secondary">{level.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Treningsstatistikk;
