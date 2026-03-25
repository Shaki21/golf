/**
 * ImprovementVelocityWidget - Track improvement rate and predict goal achievement
 * Design System v3.1 - Tailwind CSS
 *
 * Features:
 * - Improvement rate per week/month
 * - Velocity trend (accelerating/decelerating)
 * - Goal prediction with confidence
 * - Historical velocity chart
 */

import React, { useMemo } from 'react';
import {
  Zap,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import Badge from '../../ui/primitives/Badge.primitive';
import { SectionTitle } from '../../components/typography/Headings';
import useTestResults, { TestResult } from '../../hooks/useTestResults';

// ============================================================================
// TYPES
// ============================================================================

interface VelocityData {
  test: TestResult;
  weeklyRate: number;
  monthlyRate: number;
  velocityTrend: 'accelerating' | 'decelerating' | 'stable';
  predictedDate: Date | null;
  confidence: 'high' | 'medium' | 'low';
  weeksToGoal: number | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateVelocityData(test: TestResult): VelocityData {
  const history = test.history;
  if (history.length < 2) {
    return {
      test,
      weeklyRate: 0,
      monthlyRate: 0,
      velocityTrend: 'stable',
      predictedDate: null,
      confidence: 'low',
      weeksToGoal: null,
    };
  }

  // Calculate weekly rate from overall improvement
  const firstValue = history[0].value;
  const lastValue = history[history.length - 1].value;
  const firstDate = new Date(history[0].testDate);
  const lastDate = new Date(history[history.length - 1].testDate);
  const weeksSpan = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

  const totalChange = test.lowerIsBetter ? firstValue - lastValue : lastValue - firstValue;
  const weeklyRate = totalChange / weeksSpan;
  const monthlyRate = weeklyRate * 4.33;

  // Calculate velocity trend (compare recent rate to older rate)
  let velocityTrend: 'accelerating' | 'decelerating' | 'stable' = 'stable';
  if (history.length >= 4) {
    const midPoint = Math.floor(history.length / 2);
    const firstHalf = history.slice(0, midPoint);
    const secondHalf = history.slice(midPoint);

    const firstHalfChange = test.lowerIsBetter
      ? firstHalf[0].value - firstHalf[firstHalf.length - 1].value
      : firstHalf[firstHalf.length - 1].value - firstHalf[0].value;

    const secondHalfChange = test.lowerIsBetter
      ? secondHalf[0].value - secondHalf[secondHalf.length - 1].value
      : secondHalf[secondHalf.length - 1].value - secondHalf[0].value;

    const firstHalfWeeks = Math.max(1, (new Date(firstHalf[firstHalf.length - 1].testDate).getTime() - new Date(firstHalf[0].testDate).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const secondHalfWeeks = Math.max(1, (new Date(secondHalf[secondHalf.length - 1].testDate).getTime() - new Date(secondHalf[0].testDate).getTime()) / (7 * 24 * 60 * 60 * 1000));

    const firstHalfRate = firstHalfChange / firstHalfWeeks;
    const secondHalfRate = secondHalfChange / secondHalfWeeks;

    if (secondHalfRate > firstHalfRate * 1.2) {
      velocityTrend = 'accelerating';
    } else if (secondHalfRate < firstHalfRate * 0.8) {
      velocityTrend = 'decelerating';
    }
  }

  // Calculate prediction
  let predictedDate: Date | null = null;
  let weeksToGoal: number | null = null;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  const target = test.targetRequirement ?? test.requirement;
  const remaining = test.lowerIsBetter
    ? test.currentValue - target
    : target - test.currentValue;

  if (remaining <= 0) {
    // Already achieved
    predictedDate = new Date();
    weeksToGoal = 0;
    confidence = 'high';
  } else if (weeklyRate > 0) {
    weeksToGoal = remaining / weeklyRate;
    predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() + Math.ceil(weeksToGoal * 7));

    // Determine confidence based on data quality
    if (history.length >= 6 && velocityTrend !== 'decelerating') {
      confidence = 'high';
    } else if (history.length >= 3) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
  }

  return {
    test,
    weeklyRate: parseFloat(weeklyRate.toFixed(3)),
    monthlyRate: parseFloat(monthlyRate.toFixed(2)),
    velocityTrend,
    predictedDate,
    confidence,
    weeksToGoal: weeksToGoal ? parseFloat(weeksToGoal.toFixed(1)) : null,
  };
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface VelocityCardProps {
  data: VelocityData;
  onViewDetails?: () => void;
}

const VelocityCard: React.FC<VelocityCardProps> = ({ data, onViewDetails }) => {
  const { test, weeklyRate, velocityTrend, predictedDate, confidence, weeksToGoal } = data;

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Ukjent';
    if (weeksToGoal === 0) return 'Oppnådd!';
    return date.toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTimeRemaining = (): string => {
    if (weeksToGoal === null) return 'Beregner...';
    if (weeksToGoal === 0) return 'Fullført!';
    if (weeksToGoal < 1) return `${Math.ceil(weeksToGoal * 7)} dager`;
    if (weeksToGoal < 4) return `${Math.ceil(weeksToGoal)} uker`;
    if (weeksToGoal < 52) return `${Math.ceil(weeksToGoal / 4.33)} måneder`;
    return `${(weeksToGoal / 52).toFixed(1)} år`;
  };

  const trendIcon = velocityTrend === 'accelerating' ? (
    <TrendingUp size={14} className="text-green-600" />
  ) : velocityTrend === 'decelerating' ? (
    <TrendingDown size={14} className="text-amber-500" />
  ) : (
    <Minus size={14} className="text-tier-text-tertiary" />
  );

  const confidenceColorClass = {
    high: 'text-green-600',
    medium: 'text-amber-500',
    low: 'text-tier-text-tertiary',
  };

  const weeklyRateColorClass = weeklyRate > 0 ? 'text-green-600' : weeklyRate < 0 ? 'text-red-600' : 'text-tier-text-tertiary';

  const progressPercent = Math.min(100, test.lowerIsBetter
    ? (test.requirement / test.currentValue) * 100
    : (test.currentValue / test.requirement) * 100);

  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{test.icon}</span>
          <div>
            <span className="block text-base font-semibold text-tier-navy mb-1">{test.name}</span>
            <Badge
              variant={test.meetsCurrent ? 'success' : 'warning'}
              size="sm"
            >
              {test.meetsCurrent ? 'Oppfylt' : `${Math.abs(test.currentValue - test.requirement).toFixed(1)}${test.unit} igjen`}
            </Badge>
          </div>
        </div>
        <button
          onClick={onViewDetails}
          className="flex items-center justify-center w-8 h-8 rounded border-none bg-tier-surface-subtle text-tier-text-tertiary cursor-pointer hover:bg-tier-surface-base transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {/* Weekly Rate */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Zap size={14} className="text-tier-gold" />
            <span className="text-xs text-tier-text-tertiary">Per uke</span>
          </div>
          <span className={`text-base font-semibold ${weeklyRateColorClass}`}>
            {weeklyRate > 0 ? '+' : ''}{weeklyRate}{test.unit}
          </span>
        </div>

        {/* Velocity Trend */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            {trendIcon}
            <span className="text-xs text-tier-text-tertiary">Trend</span>
          </div>
          <span className="text-base font-semibold text-tier-navy">
            {velocityTrend === 'accelerating' ? 'Økende' :
              velocityTrend === 'decelerating' ? 'Avtagende' : 'Stabil'}
          </span>
        </div>

        {/* Time to Goal */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-tier-gold" />
            <span className="text-xs text-tier-text-tertiary">Tid til mål</span>
          </div>
          <span className={`text-base font-semibold ${weeksToGoal === 0 ? 'text-green-600' : 'text-tier-navy'}`}>
            {formatTimeRemaining()}
          </span>
        </div>

        {/* Confidence */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Target size={14} className={confidenceColorClass[confidence]} />
            <span className="text-xs text-tier-text-tertiary">Sikkerhet</span>
          </div>
          <span className={`text-base font-semibold ${confidenceColorClass[confidence]}`}>
            {confidence === 'high' ? 'Høy' : confidence === 'medium' ? 'Medium' : 'Lav'}
          </span>
        </div>
      </div>

      {/* Prediction */}
      {predictedDate && weeksToGoal !== 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-tier-surface-subtle rounded text-sm text-tier-text-secondary">
          <Calendar size={14} />
          <span>Forventet måloppnåelse: <strong>{formatDate(predictedDate)}</strong></span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex flex-col gap-1">
        <div className="h-2 bg-tier-surface-subtle rounded overflow-hidden">
          <div
            className={`h-full rounded transition-all duration-300 ${test.meetsCurrent ? 'bg-green-500' : 'bg-tier-gold'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-tier-text-tertiary">
          <span>{test.currentValue}{test.unit}</span>
          <span>{test.lowerIsBetter ? '≤' : '≥'} {test.requirement}{test.unit}</span>
        </div>
      </div>
    </Card>
  );
};

interface SummaryStatsProps {
  velocityData: VelocityData[];
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ velocityData }) => {
  const stats = useMemo(() => {
    const improving = velocityData.filter(d => d.weeklyRate > 0);
    const declining = velocityData.filter(d => d.weeklyRate < 0);
    const accelerating = velocityData.filter(d => d.velocityTrend === 'accelerating');

    const avgWeeksToGoal = velocityData
      .filter(d => d.weeksToGoal !== null && d.weeksToGoal > 0)
      .reduce((sum, d) => sum + (d.weeksToGoal || 0), 0) / velocityData.filter(d => d.weeksToGoal !== null && d.weeksToGoal > 0).length || 0;

    const closestToGoal = velocityData
      .filter(d => !d.test.meetsCurrent && d.weeksToGoal !== null)
      .sort((a, b) => (a.weeksToGoal || Infinity) - (b.weeksToGoal || Infinity))[0];

    return {
      improving: improving.length,
      declining: declining.length,
      accelerating: accelerating.length,
      avgWeeksToGoal: Math.round(avgWeeksToGoal),
      closestToGoal,
    };
  }, [velocityData]);

  return (
    <Card variant="elevated" padding="spacious" className="bg-gradient-to-br from-white to-tier-surface-subtle">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-tier-navy">{stats.improving}</span>
            <span className="text-xs text-tier-text-tertiary">Forbedrer seg</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-tier-gold" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-tier-navy">{stats.accelerating}</span>
            <span className="text-xs text-tier-text-tertiary">Akselererer</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Clock size={20} className="text-amber-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-tier-navy">{stats.avgWeeksToGoal || '-'}</span>
            <span className="text-xs text-tier-text-tertiary">Gj.snitt uker til mål</span>
          </div>
        </div>

        {stats.closestToGoal && (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <Award size={20} className="text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-tier-navy">{stats.closestToGoal.test.icon}</span>
              <span className="text-xs text-tier-text-tertiary">Nærmest mål</span>
            </div>
          </div>
        )}
      </div>

      {stats.declining > 0 && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 rounded-lg text-sm text-tier-navy">
          <AlertTriangle size={16} className="text-amber-500" />
          <span>{stats.declining} test{stats.declining > 1 ? 'er' : ''} viser nedgang. Vurder å justere treningsplanen.</span>
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ImprovementVelocityWidgetProps {
  onViewTestDetails?: (testId: string) => void;
}

const ImprovementVelocityWidget: React.FC<ImprovementVelocityWidgetProps> = ({
  onViewTestDetails,
}) => {
  const { tests, loading } = useTestResults();

  const velocityData = useMemo(() => {
    return tests
      .filter(t => t.history.length >= 2)
      .map(calculateVelocityData)
      .sort((a, b) => {
        // Sort by: achieved first, then by closest to goal
        if (a.weeksToGoal === 0 && b.weeksToGoal !== 0) return -1;
        if (b.weeksToGoal === 0 && a.weeksToGoal !== 0) return 1;
        if (a.weeksToGoal === null) return 1;
        if (b.weeksToGoal === null) return -1;
        return a.weeksToGoal - b.weeksToGoal;
      });
  }, [tests]);

  if (loading) {
    return (
      <Card padding="spacious">
        <div className="flex items-center justify-center p-8 text-tier-text-tertiary">
          Beregner forbedringshastighet...
        </div>
      </Card>
    );
  }

  if (velocityData.length === 0) {
    return (
      <Card padding="spacious">
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-tier-text-tertiary text-center">
          <Zap size={32} />
          <p className="m-0">Trenger minst 2 tester per kategori for å beregne hastighet</p>
        </div>
      </Card>
    );
  }

  // Separate achieved vs in-progress
  const achieved = velocityData.filter(d => d.weeksToGoal === 0);
  const inProgress = velocityData.filter(d => d.weeksToGoal !== 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Summary Stats */}
      <SummaryStats velocityData={velocityData} />

      {/* Achieved Goals */}
      {achieved.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" />
            <SectionTitle className="m-0">Oppnådde mål ({achieved.length})</SectionTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            {achieved.map(d => (
              <Card key={d.test.id} padding="sm" className="flex items-center gap-2 bg-green-50 border border-green-500">
                <span className="text-base">{d.test.icon}</span>
                <span className="text-sm font-medium text-tier-navy">{d.test.name}</span>
                <CheckCircle2 size={14} className="text-green-600" />
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionTitle className="m-0">Pågående forbedring</SectionTitle>
          <div className="flex flex-col gap-3">
            {inProgress.map(d => (
              <VelocityCard
                key={d.test.id}
                data={d}
                onViewDetails={() => onViewTestDetails?.(d.test.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ImprovementVelocityWidget;
