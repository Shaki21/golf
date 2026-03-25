/**
 * StrokesGainedDashboardPro
 *
 * Professional Strokes Gained analytics dashboard with:
 * - Clear information hierarchy (Primary > Secondary > Tertiary)
 * - Semantic color system (positive/negative/neutral)
 * - Enterprise-grade typography and spacing
 * - Standardized number formatting
 *
 * Layout:
 * 1. Primary KPI: Total Strokes Gained (hero)
 * 2. Secondary Row: Delta 30d, Percentile, vs Category benchmark
 * 3. Tertiary Grid: Tee, Approach, Short Game, Putting breakdown
 */

import React from 'react';
import { useStrokesGained } from '../../hooks/useStrokesGained';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import {
  PrimaryKPICard,
  InsightCard,
  InsightCardGrid,
  DiagnosticCard,
  DiagnosticCardGrid,
  DiagnosticSection,
} from '../../components/dashboard/cards';
import {
  formatSG,
  formatDelta,
  formatPercentile,
  getSGSemantic,
} from '../../utils/sgFormatting';
import { TrendingUp, Percent, Users, Target, Flag, Circle, Crosshair } from 'lucide-react';
import { PageTitle, SubSectionTitle } from '../../components/typography';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface StrokesGainedDashboardProProps {
  className?: string;
  playerId?: string;
  onBack?: () => void;
}

// ═══════════════════════════════════════════
// CATEGORY ICONS
// ═══════════════════════════════════════════

const categoryIcons: Record<string, React.ReactNode> = {
  tee: <Target size={16} />,
  approach: <Crosshair size={16} />,
  around_green: <Flag size={16} />,
  putting: <Circle size={16} />,
};

const categoryLabels: Record<string, string> = {
  tee: 'Tee',
  approach: 'Approach',
  around_green: 'Short Game',
  putting: 'Putting',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function StrokesGainedDashboardPro({
  className = '',
  playerId,
  onBack,
}: StrokesGainedDashboardProProps) {
  const { data, loading, error, refetch } = useStrokesGained(playerId);

  // Loading state
  if (loading) {
    return (
      <div className={`pro-section ${className}`}>
        <StateCard variant="loading" title="Loading Strokes Gained analytics..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`pro-section ${className}`}>
        <StateCard
          variant="error"
          title="Could not load analytics"
          description={error}
          action={<Button variant="primary" onClick={refetch}>Try again</Button>}
        />
      </div>
    );
  }

  // No data state
  if (!data || !data.hasData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Header onBack={onBack} onRefresh={refetch} />
        <StateCard
          variant="info"
          title="No data available"
          description="Complete tests to generate Strokes Gained analytics"
        />
      </div>
    );
  }

  // Calculate benchmark comparison
  const categoryBenchmark = data.categoryBenchmark || 0;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <Header onBack={onBack} onRefresh={refetch} isDemo={data.isDemo} />

      {/* Primary KPI: Total Strokes Gained */}
      <section className="pro-section">
        <PrimaryKPICard
          value={data.total}
          label="Total Strokes Gained"
          subtitle="Performance vs PGA Tour average"
          delta={data.trend}
          deltaPeriod="30d"
          percentile={data.percentile}
          benchmarkLabel={`Category ${data.playerCategory || 'B'}`}
          benchmarkValue={categoryBenchmark}
          monoValue
        />
      </section>

      {/* Secondary KPIs: Delta, Percentile, Benchmark */}
      <section className="pro-section">
        <InsightCardGrid columns={3}>
          {/* Delta 30d */}
          <InsightCard
            value={formatDelta(data.trend, '30d', '/round')}
            label="30-Day Trend"
            sublabel="Change per round"
            semantic={getSGSemantic(data.trend)}
            icon={<TrendingUp size={16} />}
          />

          {/* Percentile */}
          <InsightCard
            value={formatPercentile(data.percentile)}
            label="Percentile"
            sublabel={`Better than ${data.percentile || 50}% of players`}
            semantic="info"
            icon={<Percent size={16} />}
          />

          {/* vs Category */}
          <InsightCard
            value={formatSG(data.total - categoryBenchmark)}
            label={`vs Category ${data.playerCategory || 'B'}`}
            sublabel="Comparison with level"
            semantic={getSGSemantic(data.total - categoryBenchmark)}
            icon={<Users size={16} />}
          />
        </InsightCardGrid>
      </section>

      {/* Tertiary: Category Breakdown */}
      <DiagnosticSection title="Kategori Breakdown">
        <DiagnosticCardGrid columns={4}>
          {/* Tee */}
          {data.byCategory?.tee && (
            <DiagnosticCard
              title={categoryLabels.tee}
              value={data.byCategory.tee.value}
              icon={categoryIcons.tee}
              benchmarkLabel="PGA Elite"
              benchmarkValue={data.byCategory.tee.pgaElite}
              testCount={data.byCategory.tee.testCount}
            />
          )}

          {/* Approach */}
          {data.byCategory?.approach && (
            <DiagnosticCard
              title={categoryLabels.approach}
              value={data.byCategory.approach.value}
              icon={categoryIcons.approach}
              benchmarkLabel="PGA Elite"
              benchmarkValue={data.byCategory.approach.pgaElite}
              testCount={data.byCategory.approach.testCount}
            />
          )}

          {/* Around Green / Short Game */}
          {data.byCategory?.around_green && (
            <DiagnosticCard
              title={categoryLabels.around_green}
              value={data.byCategory.around_green.value}
              icon={categoryIcons.around_green}
              benchmarkLabel="PGA Elite"
              benchmarkValue={data.byCategory.around_green.pgaElite}
              testCount={data.byCategory.around_green.testCount}
            />
          )}

          {/* Putting */}
          {data.byCategory?.putting && (
            <DiagnosticCard
              title={categoryLabels.putting}
              value={data.byCategory.putting.value}
              icon={categoryIcons.putting}
              benchmarkLabel="PGA Elite"
              benchmarkValue={data.byCategory.putting.pgaElite}
              testCount={data.byCategory.putting.testCount}
            />
          )}
        </DiagnosticCardGrid>
      </DiagnosticSection>

      {/* Recent Tests */}
      {data.recentTests && data.recentTests.length > 0 && (
        <section className="pro-section">
          <RecentTestsList tests={data.recentTests} />
        </section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════

/**
 * Dashboard Header
 */
function Header({
  onBack,
  onRefresh,
  isDemo,
}: {
  onBack?: () => void;
  onRefresh?: () => void;
  isDemo?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <PageTitle style={{ marginBottom: 0 }}>
          Strokes Gained Analytics
        </PageTitle>
        <div className="flex gap-2">
          {onBack && (
            <Button variant="secondary" size="sm" onClick={onBack}>
              Back
            </Button>
          )}
          {onRefresh && (
            <Button variant="secondary" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          )}
        </div>
      </div>

      {isDemo && (
        <div className="px-4 py-2 bg-[var(--semantic-warning-bg)] border border-[var(--semantic-warning)] rounded-[var(--pro-radius-sm)] text-sm text-[var(--semantic-warning-text)]">
          Demo data is displayed. Complete tests to see real results.
        </div>
      )}
    </div>
  );
}

/**
 * Recent Tests List
 */
function RecentTestsList({
  tests,
}: {
  tests: Array<{
    testName: string;
    date: string;
    category: string;
    sg: number;
  }>;
}) {
  return (
    <div className="space-y-3">
      <SubSectionTitle style={{ marginBottom: 0 }}>
        Recent Tests
      </SubSectionTitle>
      <div className="space-y-2">
        {tests.slice(0, 5).map((test, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-[var(--card-diagnostic-bg)] border border-[var(--card-diagnostic-border)] rounded-[var(--pro-radius-sm)]"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[rgb(var(--text-primary))] truncate">
                {test.testName}
              </div>
              <div className="text-xs text-[rgb(var(--text-tertiary))]">
                {new Date(test.date).toLocaleDateString('en-US')} • {test.category}
              </div>
            </div>
            <div
              className="kpi-value-mono text-base font-semibold ml-4"
              style={{
                color: test.sg >= 0
                  ? 'var(--semantic-positive-text)'
                  : 'var(--semantic-negative-text)',
              }}
            >
              {formatSG(test.sg)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StrokesGainedDashboardPro;
