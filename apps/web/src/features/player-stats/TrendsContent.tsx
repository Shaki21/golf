/**
 * TrendsContent - Historical trends and progress visualization
 * Design System v3.1 - Tailwind CSS
 * Shows training completion trends, strokes gained over time, and analytics
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Clock,
  Target,
  BarChart3,
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';
import { GolfLineChart, GolfAreaChart, GolfBarChart, chartColors } from '../../components/shadcn/chart';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import { useTrainingAnalytics } from '../../hooks/useTrainingAnalytics';
import { useStrokesGained } from '../../hooks/useStrokesGained';

const TrendsContent: React.FC = () => {
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError } = useTrainingAnalytics();
  const { data: sgData, loading: sgLoading } = useStrokesGained();

  const loading = analyticsLoading || sgLoading;

  // Transform weekly trend data for completion chart
  const completionChartData = useMemo(() => {
    if (!analyticsData?.weeklyTrend) return [];
    return analyticsData.weeklyTrend.map(week => ({
      name: `U${week.weekNumber}`,
      Fullfort: week.completed,
      Planlagt: week.planned,
      Rate: week.completionRate,
    }));
  }, [analyticsData?.weeklyTrend]);

  // Transform weekly trend data for hours chart
  const hoursChartData = useMemo(() => {
    if (!analyticsData?.weeklyTrend) return [];
    return analyticsData.weeklyTrend.map(week => ({
      name: `U${week.weekNumber}`,
      Timer: week.totalHours,
    }));
  }, [analyticsData?.weeklyTrend]);

  // Transform strokes gained trend
  const sgChartData = useMemo(() => {
    if (!sgData?.weeklyTrend) return [];
    return sgData.weeklyTrend.map(week => ({
      name: `U${week.week}`,
      SG: week.total,
    }));
  }, [sgData?.weeklyTrend]);

  // Period breakdown for bar chart
  const periodChartData = useMemo(() => {
    if (!analyticsData?.periodBreakdown) return [];
    return Object.entries(analyticsData.periodBreakdown).map(([period, data]) => ({
      name: period,
      Fullfort: data.completed,
      Planlagt: data.planned,
      Rate: Math.round(data.completionRate),
    }));
  }, [analyticsData?.periodBreakdown]);

  if (loading) {
    return (
      <StateCard
        variant="loading"
        title="Laster trenddata..."
        description="Henter historikk og analyser"
      />
    );
  }

  if (analyticsError) {
    return (
      <StateCard
        variant="error"
        title="Kunne ikke laste data"
        description={analyticsError}
      />
    );
  }

  const overview = analyticsData?.overview;

  return (
    <div className="flex flex-col">
      {/* Summary Stats Grid */}
      <section className="mb-6">
        <SectionTitle className="mb-4">
          Din progresjon
        </SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-green-100">
                <Target size={20} className="text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-tier-navy leading-tight">
                  {overview?.completionRate?.toFixed(0) || 0}%
                </span>
                <span className="text-xs text-tier-text-tertiary">Gjennomforingsrate</span>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-amber-100">
                <Flame size={20} className="text-amber-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-tier-navy leading-tight">
                  {overview?.currentStreak || 0}
                </span>
                <span className="text-xs text-tier-text-tertiary">Dagers streak</span>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-indigo-100">
                <Clock size={20} className="text-tier-gold" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-tier-navy leading-tight">
                  {overview?.totalHoursCompleted?.toFixed(1) || 0}
                </span>
                <span className="text-xs text-tier-text-tertiary">Timer trent</span>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-sky-100">
                <Activity size={20} className="text-sky-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-tier-navy leading-tight">
                  {overview?.averageSessionsPerWeek?.toFixed(1) || 0}
                </span>
                <span className="text-xs text-tier-text-tertiary">Okter/uke</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Strokes Gained Trend */}
      {sgChartData.length > 1 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle className="m-0">Strokes Gained Utvikling</SectionTitle>
            {sgData?.trend !== undefined && (
              <div className="flex items-center gap-1 px-2 py-1 bg-tier-surface-subtle rounded-lg text-sm">
                {sgData.trend >= 0 ? (
                  <TrendingUp size={16} className="text-green-600" />
                ) : (
                  <TrendingDown size={16} className="text-red-600" />
                )}
                <span className={`font-semibold ${sgData.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {sgData.trend >= 0 ? '+' : ''}{(sgData.trend * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
          <Card padding="md">
            <GolfLineChart
              data={sgChartData}
              dataKeys={['SG']}
              xAxisKey="name"
              colors={[chartColors.success]}
              height={220}
              showLegend={false}
            />
            <p className="text-xs text-tier-text-tertiary mt-3 text-center m-0">
              Strokes Gained viser hvor mange slag du sparer/taper per runde sammenlignet med scratch
            </p>
          </Card>
        </section>
      )}

      {/* Weekly Completion Trend */}
      {completionChartData.length > 1 && (
        <section className="mb-6">
          <SectionTitle className="mb-4">
            Ukentlig treningsgjennomforing
          </SectionTitle>
          <Card padding="md">
            <GolfAreaChart
              data={completionChartData}
              dataKeys={['Fullfort', 'Planlagt']}
              xAxisKey="name"
              colors={[chartColors.success, chartColors.mist]}
              height={200}
              stacked={false}
            />
          </Card>
        </section>
      )}

      {/* Hours Per Week */}
      {hoursChartData.length > 1 && (
        <section className="mb-6">
          <SectionTitle className="mb-4">
            Treningstimer per uke
          </SectionTitle>
          <Card padding="md">
            <GolfBarChart
              data={hoursChartData}
              dataKeys={['Timer']}
              xAxisKey="name"
              colors={[chartColors.primary]}
              height={180}
            />
          </Card>
        </section>
      )}

      {/* Period Breakdown */}
      {periodChartData.length > 0 && (
        <section className="mb-6">
          <SectionTitle className="mb-4">
            Periodeoversikt
          </SectionTitle>
          <Card padding="md">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
              {periodChartData.map(period => (
                <div key={period.name} className="flex flex-col gap-2 p-3 bg-tier-surface-subtle rounded-lg">
                  <div className="flex justify-between items-center">
                    <SubSectionTitle className="m-0">{period.name}</SubSectionTitle>
                    <span className={`text-base font-bold ${
                      period.Rate >= 80 ? 'text-green-600' :
                      period.Rate >= 60 ? 'text-amber-500' : 'text-red-600'
                    }`}>
                      {period.Rate}%
                    </span>
                  </div>
                  <div className="h-2 bg-tier-border-subtle rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all duration-300 ${
                        period.Rate >= 80 ? 'bg-green-500' :
                        period.Rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${period.Rate}%` }}
                    />
                  </div>
                  <span className="text-xs text-tier-text-secondary">
                    {period.Fullfort} av {period.Planlagt} økter
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Empty State */}
      {completionChartData.length <= 1 && sgChartData.length <= 1 && (
        <Card padding="spacious">
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <BarChart3 size={48} className="opacity-30 mb-4 text-tier-text-tertiary" />
            <SubSectionTitle className="mb-0">Ikke nok data enna</SubSectionTitle>
            <p className="text-base text-tier-text-secondary mt-2 m-0 max-w-[320px]">
              Fullfør flere treningsøkter og tester for å se din utvikling over tid.
              Vi trenger minst 2 ukers data for å vise trender.
            </p>
          </div>
        </Card>
      )}

      {/* Streak Info */}
      {overview && overview.longestStreak > 0 && (
        <Card variant="flat" padding="md">
          <div className="flex items-center gap-3">
            <Flame size={24} className="text-amber-500" />
            <div>
              <span className="block text-base font-semibold text-tier-navy">
                Beste streak: {overview.longestStreak} dager
              </span>
              <span className="block text-xs text-tier-text-secondary">
                {overview.currentStreak > 0
                  ? `Du er på ${overview.currentStreak} dager na - fortsett slik!`
                  : 'Start en ny streak i dag!'
                }
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TrendsContent;
