/**
 * StatsPageV2
 * Statistics page using UI templates
 * Composes AppShellTemplate + StatsGridTemplate + Card + BottomNav
 * Data fetched via useStats hook
 *
 * DEV: Test states via querystring:
 *   /stats?state=loading
 *   /stats?state=error
 *   /stats?state=empty
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import AppShellTemplate from '../../ui/templates/AppShellTemplate';
import StatsGridTemplate from '../../ui/templates/StatsGridTemplate';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { RefreshCw, Plus, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useStats } from '../../data';
import type { StatsOverviewItem } from '../../data';
import { getSimState } from '../../dev/simulateState';
import { useScreenView } from '../../analytics/useScreenView';
import { SectionTitle } from '../../components/typography/Headings';
import { useTrainingAnalytics } from '../../hooks/useTrainingAnalytics';
import { GolfAreaChart, chartColors } from '../../components/shadcn/chart';

// ============================================================================
// HELPERS
// ============================================================================

// Pure function - moved outside component to avoid recreation
const getTrendColor = (trend?: 'positive' | 'negative' | 'neutral'): string => {
  switch (trend) {
    case 'positive':
      return 'var(--status-success)';
    case 'negative':
      return 'var(--status-error)';
    default:
      return 'var(--text-secondary)';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const StatsPageV2: React.FC = () => {
  useScreenView('Statistikk');
  const location = useLocation();
  const simState = getSimState(location.search);

  const hookResult = useStats();
  const { data: analyticsData } = useTrainingAnalytics();

  // Transform weekly trend data for chart
  const trendChartData = useMemo(() => {
    if (!analyticsData?.weeklyTrend) return [];
    return analyticsData.weeklyTrend.map(week => ({
      name: `U${week.weekNumber}`,
      Fullfort: week.completed,
      Planlagt: week.planned,
    }));
  }, [analyticsData?.weeklyTrend]);

  // Override data based on simState (DEV only)
  const { data, isLoading, error, refetch } = simState
    ? {
        data: simState === 'empty' ? { kpis: [], overview: [], recentSessions: [] } : null,
        isLoading: simState === 'loading',
        error: simState === 'error' ? 'Simulert feil (DEV)' : null,
        refetch: hookResult.refetch,
      }
    : hookResult;

  // Loading state
  if (isLoading && !data) {
    return (
      <AppShellTemplate
        title="Statistikk"
        subtitle="Siste 7 dager"
      >
        <section className="mb-6">
          <StateCard
            variant="loading"
            title="Laster..."
            description="Henter din statistikk"
          />
        </section>
      </AppShellTemplate>
    );
  }

  const kpis = data?.kpis ?? [];
  const overview = data?.overview ?? [];
  const recentSessions = data?.recentSessions ?? [];

  return (
    <AppShellTemplate
      title="Statistikk"
      subtitle="Siste 7 dager"
    >
      {/* Error message */}
      {error && (
        <section className="mb-6">
          <StateCard
            variant="error"
            title="Noe gikk galt"
            description={error}
            action={
              <Button size="sm" variant="ghost" leftIcon={<RefreshCw size={14} />} onClick={refetch}>
                Prøv igjen
              </Button>
            }
          />
        </section>
      )}

      {/* Stats Grid */}
      <section className="mb-6">
        <StatsGridTemplate items={kpis} columns={3} />
      </section>

      {/* Overview Card */}
      <section className="mb-6">
        <SectionTitle className="mb-3">Oversikt</SectionTitle>
        <Card>
          <div className="flex flex-col gap-2">
            {overview.map((item: StatsOverviewItem) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-tier-border-default last:border-b-0">
                <span className="text-sm text-tier-navy">{item.label}</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: getTrendColor(item.trend) }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Recent Sessions Card - HIDDEN per user request */}
      {/* <section className="mb-6">
        <SectionTitle className="mb-3">Siste økter</SectionTitle>
        {recentSessions.length === 0 ? (
          <StateCard
            variant="empty"
            title="Ingen data ennå"
            description="Fullfør treningsøkter for å se statistikk"
            action={
              <Button size="sm" leftIcon={<Plus size={14} />}>
                Ny økt
              </Button>
            }
          />
        ) : (
          <Card>
            <div className="flex flex-col gap-3">
              {recentSessions.map((session: { id: string; title: string; type: string; duration: string; date: string }) => (
                <div key={session.id} className="flex justify-between items-center">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-tier-navy">{session.title}</span>
                    <span className="text-xs text-tier-text-secondary">
                      {session.type} • {session.duration}
                    </span>
                  </div>
                  <span className="text-xs text-tier-text-tertiary">{session.date}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section> */}

      {/* Trend Chart */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle className="m-0">Treningstrend</SectionTitle>
          {analyticsData?.overview && (
            <div className="flex items-center gap-1 px-2 py-1 bg-tier-white rounded-lg">
              {analyticsData.overview.completionRate >= 70 ? (
                <TrendingUp size={14} className="text-tier-success" />
              ) : (
                <TrendingDown size={14} className="text-tier-warning" />
              )}
              <span
                className={`text-xs font-semibold ${
                  analyticsData.overview.completionRate >= 70
                    ? 'text-tier-success'
                    : 'text-tier-warning'
                }`}
              >
                {analyticsData.overview.completionRate.toFixed(0)}%
              </span>
            </div>
          )}
        </div>
        <Card>
          {trendChartData.length > 1 ? (
            <div className="p-2">
              <GolfAreaChart
                data={trendChartData}
                dataKeys={['Fullfort', 'Planlagt']}
                xAxisKey="name"
                colors={[chartColors.success, chartColors.mist]}
                height={180}
                stacked={false}
              />
              <p className="text-xs text-tier-text-tertiary text-center mt-2 mb-0">
                Ukentlig gjennomføring av treningsøkter
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-tier-surface-base rounded-lg">
              <BarChart3 size={40} className="mb-3 opacity-30 text-tier-text-tertiary" />
              <p className="text-sm font-semibold text-tier-navy m-0">Ikke nok data ennå</p>
              <p className="text-xs text-tier-text-secondary m-0 mt-1">
                Fullfør flere treningsøkter for å se din trend
              </p>
            </div>
          )}
        </Card>
      </section>
    </AppShellTemplate>
  );
};

export default StatsPageV2;
