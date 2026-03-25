/**
 * CategoryProgressionWidget Component
 * Design System v3.1 - Tailwind CSS
 *
 * Features:
 * - Visual timeline from current to target category
 * - Per-test progress indicators
 * - Estimated time to reach target
 * - Milestone tracking
 */

import React, { useMemo } from 'react';
import {
  Target,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Zap,
  ArrowRight,
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import Badge from '../../ui/primitives/Badge.primitive';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import useTestResults, { TestResult, PlayerCategory } from '../../hooks/useTestResults';

// ============================================================================
// TYPES
// ============================================================================

interface CategoryInfo {
  level: PlayerCategory;
  name: string;
  description: string;
  color: string;
}

const CATEGORY_INFO: Record<PlayerCategory, CategoryInfo> = {
  K: { level: 'K', name: 'Rekrutt', description: 'Startpunkt', color: '#6b7280' },
  J: { level: 'J', name: 'Junior 3', description: 'Grunnleggende', color: '#4b5563' },
  I: { level: 'I', name: 'Junior 2', description: 'Utviklende', color: '#0A2540' },
  H: { level: 'H', name: 'Junior 1', description: 'Progresjon', color: '#16a34a' },
  G: { level: 'G', name: 'Aspirant', description: 'Fremadstormende', color: '#16a34a' },
  F: { level: 'F', name: 'Klubb', description: 'Konkurransenivå', color: '#0284c7' },
  E: { level: 'E', name: 'Region', description: 'Regionalt nivå', color: '#0284c7' },
  D: { level: 'D', name: 'Nasjonal', description: 'Nasjonalt nivå', color: '#7c3aed' },
  C: { level: 'C', name: 'Talent', description: 'Høyt talent', color: '#7c3aed' },
  B: { level: 'B', name: 'Elite', description: 'Elitenivå', color: '#f59e0b' },
  A: { level: 'A', name: 'Proff', description: 'Profesjonelt', color: '#C9A227' },
};

const CATEGORY_ORDER: PlayerCategory[] = ['K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];

// ============================================================================
// COMPONENTS
// ============================================================================

interface CategoryBadgeProps {
  category: PlayerCategory;
  isCurrent?: boolean;
  isTarget?: boolean;
  isCompleted?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  isCurrent,
  isTarget,
  isCompleted,
  size = 'md',
}) => {
  const info = CATEGORY_INFO[category];
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative`}
      style={{
        backgroundColor: isCompleted ? info.color : `${info.color}20`,
        border: `3px solid ${info.color}`,
        boxShadow: isCurrent ? `0 0 0 4px ${info.color}30` : 'none',
      }}
    >
      <span
        className="font-bold"
        style={{ color: isCompleted ? 'white' : info.color }}
      >
        {category}
      </span>
      {isTarget && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-tier-gold flex items-center justify-center">
          <Target size={10} className="text-white" />
        </div>
      )}
      {isCurrent && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-white text-[8px] font-semibold px-1 py-0.5 rounded whitespace-nowrap"
          style={{ backgroundColor: info.color }}
        >
          DU
        </div>
      )}
    </div>
  );
};

interface TestProgressItemProps {
  test: TestResult;
  onViewDetails?: () => void;
}

const TestProgressItem: React.FC<TestProgressItemProps> = ({ test, onViewDetails }) => {
  const progress = useMemo(() => {
    if (!test.targetRequirement) return 100;
    if (test.lowerIsBetter) {
      return Math.min(100, (test.targetRequirement / test.currentValue) * 100);
    }
    return Math.min(100, (test.currentValue / test.targetRequirement) * 100);
  }, [test]);

  const remaining = useMemo(() => {
    if (!test.targetRequirement) return 0;
    if (test.lowerIsBetter) {
      return Math.max(0, test.currentValue - test.targetRequirement);
    }
    return Math.max(0, test.targetRequirement - test.currentValue);
  }, [test]);

  const progressColorClass = progress >= 100 ? 'bg-green-500' : progress >= 80 ? 'bg-amber-500' : 'bg-tier-gold';

  return (
    <div className="flex items-center gap-3 p-2 bg-tier-surface-subtle rounded-lg">
      <div className="text-2xl">{test.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-tier-navy">{test.name}</span>
          {test.meetsTarget ? (
            <CheckCircle2 size={16} className="text-green-600" />
          ) : (
            <span className="text-xs text-amber-500 font-medium">
              {remaining.toFixed(test.unit === '' ? 1 : 0)}{test.unit} igjen
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-tier-surface-base rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressColorClass}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-tier-text-tertiary whitespace-nowrap">
            {test.currentValue}{test.unit} / {test.targetRequirement}{test.unit}
          </span>
        </div>
      </div>
      <button
        onClick={onViewDetails}
        className="flex items-center justify-center w-8 h-8 rounded border-none bg-transparent text-tier-text-tertiary cursor-pointer hover:bg-tier-surface-base transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface CategoryProgressionWidgetProps {
  onViewTestDetails?: (testId: string) => void;
}

const CategoryProgressionWidget: React.FC<CategoryProgressionWidgetProps> = ({
  onViewTestDetails,
}) => {
  const {
    tests,
    playerCategory,
    targetCategory,
    categoryProgress,
    loading,
  } = useTestResults();

  const timelineCategories = useMemo(() => {
    const currentIdx = CATEGORY_ORDER.indexOf(playerCategory);
    const targetIdx = CATEGORY_ORDER.indexOf(targetCategory);

    const startIdx = Math.max(0, currentIdx - 2);
    const endIdx = Math.min(CATEGORY_ORDER.length - 1, targetIdx + 1);

    return CATEGORY_ORDER.slice(startIdx, endIdx + 1);
  }, [playerCategory, targetCategory]);

  const estimatedTimeToTarget = useMemo(() => {
    if (!categoryProgress) return null;

    const remainingTests = categoryProgress.remainingTests;
    if (remainingTests.length === 0) return 0;

    const validPredictions = remainingTests
      .filter(t => t.predictedDaysToTarget !== null && t.predictedDaysToTarget > 0)
      .map(t => t.predictedDaysToTarget as number);

    if (validPredictions.length === 0) return null;

    return Math.max(...validPredictions);
  }, [categoryProgress]);

  const formatTime = (days: number | null): string => {
    if (days === null) return 'Beregner...';
    if (days === 0) return 'Nesten der!';
    if (days < 7) return `${days} dager`;
    if (days < 30) return `${Math.ceil(days / 7)} uker`;
    if (days < 365) return `${Math.ceil(days / 30)} måneder`;
    return `${(days / 365).toFixed(1)} år`;
  };

  if (loading) {
    return (
      <Card padding="spacious">
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-tier-text-tertiary">
          <div className="w-8 h-8 border-3 border-tier-border-subtle border-t-tier-gold rounded-full animate-spin" />
          <span>Laster progresjon...</span>
        </div>
      </Card>
    );
  }

  const currentInfo = CATEGORY_INFO[playerCategory];
  const targetInfo = CATEGORY_INFO[targetCategory];

  return (
    <div className="flex flex-col gap-5">
      {/* Hero Section */}
      <Card variant="elevated" padding="spacious" className="bg-gradient-to-br from-white to-tier-surface-subtle">
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Current Category */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-tier-text-tertiary uppercase tracking-wide">Nåværende</span>
            <CategoryBadge category={playerCategory} isCurrent size="lg" />
            <span className="text-sm font-semibold text-tier-navy">{currentInfo.name}</span>
          </div>

          {/* Progress Arrow */}
          <div className="flex items-center gap-3">
            <div className="relative w-[60px] h-[60px]">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--border-subtle)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={targetInfo.color}
                  strokeWidth="3"
                  strokeDasharray={`${categoryProgress?.progress || 0}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-bold text-tier-navy">
                {Math.round(categoryProgress?.progress || 0)}%
              </span>
            </div>
            <ArrowRight size={24} className="text-tier-text-tertiary" />
          </div>

          {/* Target Category */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-tier-text-tertiary uppercase tracking-wide">Mål</span>
            <CategoryBadge category={targetCategory} isTarget size="lg" />
            <span className="text-sm font-semibold text-tier-navy">{targetInfo.name}</span>
          </div>
        </div>

        {/* Time Estimate */}
        <div className="flex items-center justify-center gap-2 p-3 bg-tier-surface-subtle rounded-lg text-sm text-tier-text-secondary">
          <Clock size={16} />
          <span>Estimert tid: </span>
          <strong style={{ color: targetInfo.color }}>
            {formatTime(estimatedTimeToTarget)}
          </strong>
        </div>
      </Card>

      {/* Category Timeline */}
      <section className="flex flex-col gap-3">
        <SectionTitle className="m-0">Kategorireise</SectionTitle>
        <Card padding="md">
          <div className="flex items-center justify-center gap-2 py-3 overflow-x-auto">
            {timelineCategories.map((cat, i) => {
              const isCompleted = CATEGORY_ORDER.indexOf(cat) < CATEGORY_ORDER.indexOf(playerCategory);
              const isCurrent = cat === playerCategory;
              const isTarget = cat === targetCategory;

              return (
                <React.Fragment key={cat}>
                  <div className="flex flex-col items-center gap-1 min-w-[60px]">
                    <CategoryBadge
                      category={cat}
                      isCurrent={isCurrent}
                      isTarget={isTarget}
                      isCompleted={isCompleted}
                      size="sm"
                    />
                    <span
                      className="text-[10px]"
                      style={{
                        color: isCurrent ? CATEGORY_INFO[cat].color : 'var(--text-secondary)',
                        fontWeight: isCurrent ? 600 : 400,
                      }}
                    >
                      {CATEGORY_INFO[cat].name}
                    </span>
                  </div>
                  {i < timelineCategories.length - 1 && (
                    <div
                      className="w-6 h-0.5 rounded-full"
                      style={{
                        backgroundColor: isCompleted ? CATEGORY_INFO[cat].color : 'var(--border-subtle)',
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </Card>
      </section>

      {/* Requirements Status */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <SectionTitle className="m-0">
            Krav for {targetInfo.name} ({targetCategory})
          </SectionTitle>
          <Badge variant={categoryProgress?.progress === 100 ? 'success' : 'accent'} size="sm">
            {categoryProgress?.testsMet}/{categoryProgress?.testsRequired} oppfylt
          </Badge>
        </div>

        {/* Completed Tests */}
        {tests.filter(t => t.meetsTarget).length > 0 && (
          <Card padding="md" className="bg-green-50 border border-green-500">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={18} className="text-green-600" />
              <SubSectionTitle className="m-0 text-green-600">
                Oppfylte krav ({tests.filter(t => t.meetsTarget).length})
              </SubSectionTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              {tests.filter(t => t.meetsTarget).map(test => (
                <div key={test.id} className="flex items-center gap-1 px-2 py-1 bg-white rounded text-sm">
                  <span>{test.icon}</span>
                  <span className="text-tier-navy">{test.name}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Remaining Tests */}
        {categoryProgress?.remainingTests && categoryProgress.remainingTests.length > 0 && (
          <Card padding="md">
            <SubSectionTitle className="m-0 mb-3">
              Gjenstående ({categoryProgress.remainingTests.length})
            </SubSectionTitle>
            <div className="flex flex-col gap-3">
              {categoryProgress.remainingTests
                .sort((a, b) => {
                  const aProgress = a.lowerIsBetter
                    ? (a.targetRequirement! / a.currentValue) * 100
                    : (a.currentValue / a.targetRequirement!) * 100;
                  const bProgress = b.lowerIsBetter
                    ? (b.targetRequirement! / b.currentValue) * 100
                    : (b.currentValue / b.targetRequirement!) * 100;
                  return bProgress - aProgress;
                })
                .map(test => (
                  <TestProgressItem
                    key={test.id}
                    test={test}
                    onViewDetails={() => onViewTestDetails?.(test.id)}
                  />
                ))}
            </div>
          </Card>
        )}

        {/* Additional Requirements */}
        {categoryProgress?.additionalRequirements && (
          <Card padding="md">
            <SubSectionTitle className="m-0 mb-3">
              Tilleggskrav
            </SubSectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 p-3 bg-tier-surface-subtle rounded">
                <span className="text-xs text-tier-text-tertiary">Runder spilt</span>
                <div className="flex items-center justify-between text-base font-semibold text-tier-navy">
                  <span>
                    {categoryProgress.additionalRequirements.roundsCompleted}/
                    {categoryProgress.additionalRequirements.roundsRequired}
                  </span>
                  {(categoryProgress.additionalRequirements.roundsCompleted ?? 0) >=
                    (categoryProgress.additionalRequirements.roundsRequired ?? 0) ? (
                    <CheckCircle2 size={14} className="text-green-600" />
                  ) : (
                    <Circle size={14} className="text-tier-text-tertiary" />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-tier-surface-subtle rounded">
                <span className="text-xs text-tier-text-tertiary">Handicap</span>
                <div className="flex items-center justify-between text-base font-semibold text-tier-navy">
                  <span>
                    {categoryProgress.additionalRequirements.currentHandicap}
                    {' '}(krav: ≤{categoryProgress.additionalRequirements.handicapRequired})
                  </span>
                  {(categoryProgress.additionalRequirements.currentHandicap ?? 999) <=
                    (categoryProgress.additionalRequirements.handicapRequired ?? 0) ? (
                    <CheckCircle2 size={14} className="text-green-600" />
                  ) : (
                    <Circle size={14} className="text-tier-text-tertiary" />
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* Motivation */}
      <Card variant="elevated" padding="md" className="bg-gradient-to-br from-tier-gold to-green-500">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <SubSectionTitle className="m-0 text-white font-bold">
              Du er på god vei!
            </SubSectionTitle>
            <p className="mt-1 mb-0 text-sm text-white/90">
              {categoryProgress?.progress && categoryProgress.progress >= 80
                ? 'Nesten fremme! Bare litt til så når du neste nivå.'
                : categoryProgress?.progress && categoryProgress.progress >= 50
                  ? 'Halvveis der! Fortsett det gode arbeidet.'
                  : 'Hver test bringer deg nærmere målet. Stå på!'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CategoryProgressionWidget;
