/**
 * StrokesGainedDashboard
 * Main dashboard for Strokes Gained analytics
 *
 * Features:
 * - Overall SG performance
 * - Category breakdown (approach, around-green, putting)
 * - Trend visualization
 * - Benchmark comparison
 * - Recent tests
 * - Percentile ranking
 */

import React from 'react';
import { useStrokesGained } from '../../hooks/useStrokesGained';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { track } from '../../analytics/track';
import { PageTitle, SectionTitle, SubSectionTitle } from '../../components/typography';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6',
  header: 'flex items-center justify-between',
  title: 'text-2xl font-bold text-[var(--text-inverse)] m-0',
  headerActions: 'flex gap-2',
  summaryGrid: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  summaryCard: 'p-6 bg-surface rounded-xl border border-border',
  summaryLabel: 'text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider mb-2',
  summaryValue: 'text-4xl font-bold text-[var(--text-inverse)] mb-2',
  summaryTrend: 'text-sm',
  trendPositive: 'text-tier-success',
  trendNegative: 'text-tier-error',
  trendNeutral: 'text-[var(--video-text-secondary)]',
  percentile: 'text-sm text-[var(--video-text-secondary)]',
  categoryGrid: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  categoryCard: 'p-5 bg-surface rounded-xl border border-border',
  categoryHeader: 'flex items-center justify-between mb-4',
  categoryTitle: 'text-base font-semibold text-[var(--text-inverse)]',
  categoryIcon: 'text-2xl',
  categoryValue: 'text-3xl font-bold text-[var(--text-inverse)] mb-2',
  categoryBenchmark: 'flex items-center gap-2 text-sm text-[var(--video-text-secondary)] mb-2',
  categoryTestCount: 'text-xs text-[var(--video-text-tertiary)]',
  trendsSection: 'p-6 bg-surface rounded-xl border border-border',
  sectionTitle: 'text-lg font-semibold text-[var(--text-inverse)] mb-4',
  trendsChart: 'h-64 bg-surface-elevated rounded-lg flex items-center justify-center text-[var(--video-text-tertiary)]',
  recentTestsSection: 'p-6 bg-surface rounded-xl border border-border',
  testsList: 'flex flex-col gap-2',
  testItem: 'p-3 bg-surface-elevated rounded-lg flex items-center justify-between',
  testInfo: 'flex-1',
  testName: 'text-sm font-medium text-[var(--text-inverse)]',
  testDate: 'text-xs text-[var(--video-text-secondary)]',
  testValue: 'text-base font-bold',
  valuePositive: 'text-tier-success',
  valueNegative: 'text-tier-error',
  infoCard: 'p-4 bg-blue-500/10 rounded-xl border border-blue-500',
  infoTitle: 'text-sm font-semibold text-[var(--text-inverse)] mb-2',
  infoText: 'text-xs text-[var(--video-text-secondary)]',
  demoNotice: 'p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-500 text-sm text-center',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function StrokesGainedDashboard({
  className = '',
  playerId,
  onBack,
}) {
  const { data, loading, error, refetch } = useStrokesGained(playerId);

  // Format SG value
  const formatSg = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}`;
  };

  // Get trend indicator
  const getTrendIndicator = (value) => {
    if (!value || Math.abs(value) < 0.01) return { className: tw.trendNeutral, text: '→ Stabilt' };
    return value > 0
      ? { className: tw.trendPositive, text: `↑ ${formatSg(value)}` }
      : { className: tw.trendNegative, text: `↓ ${formatSg(value)}` };
  };

  // Get value color class
  const getValueClass = (value) => {
    if (value === null || value === undefined || Math.abs(value) < 0.01) {
      return tw.trendNeutral;
    }
    return value > 0 ? tw.valuePositive : tw.valueNegative;
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard variant="loading" title="Laster Strokes Gained analytics..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${tw.container} ${className}`}>
        <StateCard
          variant="error"
          title="Kunne ikke laste analytics"
          description={error}
          action={<Button variant="primary" onClick={refetch}>Prøv igjen</Button>}
        />
      </div>
    );
  }

  // No data
  if (!data || !data.hasData) {
    return (
      <div className={`${tw.container} ${className}`}>
        <div className={tw.header}>
          <PageTitle style={{ marginBottom: 0 }}>Strokes Gained Analytics</PageTitle>
        </div>
        <StateCard
          variant="info"
          title="Ingen data tilgjengelig"
          description="Utfør tester for å generere Strokes Gained analytics"
        />
      </div>
    );
  }

  const trend = getTrendIndicator(data.trend);

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <PageTitle style={{ marginBottom: 0 }}>Strokes Gained Analytics</PageTitle>
        <div className={tw.headerActions}>
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              ← Tilbake
            </Button>
          )}
          <Button variant="secondary" onClick={refetch}>
            🔄 Oppdater
          </Button>
        </div>
      </div>

      {/* Demo Notice */}
      {data.isDemo && (
        <div className={tw.demoNotice}>
          alert-triangle️ Demo-data vises. Utfør tester for å se reelle resultater.
        </div>
      )}

      {/* Info Card */}
      <div className={tw.infoCard}>
        <SubSectionTitle style={{ marginBottom: 0 }}>💡 Om Strokes Gained</SubSectionTitle>
        <p className={tw.infoText}>
          Strokes Gained måler hvor mange slag du vinner eller taper sammenlignet med et benchmark.
          Positive verdier betyr du er bedre enn gjennomsnittet, negative verdier betyr det er et forbedringsområde.
        </p>
      </div>

      {/* Summary Cards */}
      <div className={tw.summaryGrid}>
        <div className={tw.summaryCard}>
          <div className={tw.summaryLabel}>Total SG</div>
          <div className={`${tw.summaryValue} ${getValueClass(data.total)}`}>
            {formatSg(data.total)}
          </div>
          <div className={`${tw.summaryTrend} ${trend.className}`}>
            {trend.text}
          </div>
        </div>

        <div className={tw.summaryCard}>
          <div className={tw.summaryLabel}>Percentil</div>
          <div className={tw.summaryValue}>
            {data.percentile || 50}
            <span className="text-xl">%</span>
          </div>
          <div className={tw.percentile}>
            Bedre enn {data.percentile || 50}% av spillere
          </div>
        </div>

        <div className={tw.summaryCard}>
          <div className={tw.summaryLabel}>Tester totalt</div>
          <div className={tw.summaryValue}>
            {Object.values(data.byCategory || {}).reduce((sum, cat) => sum + (cat.testCount || 0), 0)}
          </div>
          <div className={tw.percentile}>
            Tester registrert
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <SectionTitle style={{ marginBottom: '1rem' }}>Kategori Breakdown</SectionTitle>
        <div className={tw.categoryGrid}>
          {/* Approach */}
          {data.byCategory?.approach && (
            <div className={tw.categoryCard}>
              <div className={tw.categoryHeader}>
                <SubSectionTitle style={{ marginBottom: 0 }}>Approach</SubSectionTitle>
                <span className={tw.categoryIcon}>🎯</span>
              </div>
              <div className={`${tw.categoryValue} ${getValueClass(data.byCategory.approach.value)}`}>
                {formatSg(data.byCategory.approach.value)}
              </div>
              <div className={tw.categoryBenchmark}>
                <span>PGA Elite:</span>
                <span className="font-semibold">{formatSg(data.byCategory.approach.pgaElite)}</span>
              </div>
              <div className={tw.categoryTestCount}>
                {data.byCategory.approach.testCount} tester
              </div>
            </div>
          )}

          {/* Around Green */}
          {data.byCategory?.around_green && (
            <div className={tw.categoryCard}>
              <div className={tw.categoryHeader}>
                <SubSectionTitle style={{ marginBottom: 0 }}>Around Green</SubSectionTitle>
                <span className={tw.categoryIcon}>⛳</span>
              </div>
              <div className={`${tw.categoryValue} ${getValueClass(data.byCategory.around_green.value)}`}>
                {formatSg(data.byCategory.around_green.value)}
              </div>
              <div className={tw.categoryBenchmark}>
                <span>PGA Elite:</span>
                <span className="font-semibold">{formatSg(data.byCategory.around_green.pgaElite)}</span>
              </div>
              <div className={tw.categoryTestCount}>
                {data.byCategory.around_green.testCount} tester
              </div>
            </div>
          )}

          {/* Putting */}
          {data.byCategory?.putting && (
            <div className={tw.categoryCard}>
              <div className={tw.categoryHeader}>
                <SubSectionTitle style={{ marginBottom: 0 }}>Putting</SubSectionTitle>
                <span className={tw.categoryIcon}>🏌️</span>
              </div>
              <div className={`${tw.categoryValue} ${getValueClass(data.byCategory.putting.value)}`}>
                {formatSg(data.byCategory.putting.value)}
              </div>
              <div className={tw.categoryBenchmark}>
                <span>PGA Elite:</span>
                <span className="font-semibold">{formatSg(data.byCategory.putting.pgaElite)}</span>
              </div>
              <div className={tw.categoryTestCount}>
                {data.byCategory.putting.testCount} tester
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trends */}
      {data.weeklyTrend && data.weeklyTrend.length > 0 && (
        <div className={tw.trendsSection}>
          <SectionTitle style={{ marginBottom: '1rem' }}>Utvikling Over Tid</SectionTitle>
          <div className={tw.trendsChart}>
            📊 Trend-diagram kommer snart
          </div>
        </div>
      )}

      {/* Recent Tests */}
      {data.recentTests && data.recentTests.length > 0 && (
        <div className={tw.recentTestsSection}>
          <SectionTitle style={{ marginBottom: '1rem' }}>Nylige Tester</SectionTitle>
          <div className={tw.testsList}>
            {data.recentTests.map((test, index) => (
              <div key={index} className={tw.testItem}>
                <div className={tw.testInfo}>
                  <div className={tw.testName}>{test.testName}</div>
                  <div className={tw.testDate}>
                    {new Date(test.date).toLocaleDateString('nb-NO')} • {test.category}
                  </div>
                </div>
                <div className={`${tw.testValue} ${getValueClass(test.sg)}`}>
                  {formatSg(test.sg)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StrokesGainedDashboard;
