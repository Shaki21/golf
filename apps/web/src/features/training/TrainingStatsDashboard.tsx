/**
 * TrainingStatsDashboard.tsx
 * Design System v3.0 - Premium Light
 *
 * FASE 7.3: Redesigned training stats dashboard
 *
 * Features:
 * - 4 KPI cards (default view)
 * - Comparison views (Hours vs Reps, TEK vs SLAG)
 * - Visual charts (bar, line)
 * - Clean, motivating design
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  Clock,
  Repeat,
  TrendingUp,
  BarChart3,
  LineChart,
  ChevronRight,
} from 'lucide-react';
import { Page } from '../../ui/components/Page';
import { Text } from '../../ui/primitives';
import Button from '../../ui/primitives/Button';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';

// ============================================================================
// TYPES
// ============================================================================

interface TrainingStatsData {
  avgFocusPerSession: number; // 1-10 rating
  hoursThisWeek: number;
  repsThisWeek: number;
  hoursThisMonth: number;
  repsThisMonth: number;
  hoursThisYear: number;
  repsThisYear: number;
  // Comparison data
  weeklyBreakdown?: Array<{
    week: string;
    hours: number;
    reps: number;
  }>;
  categoryBreakdown?: Array<{
    category: string; // TEK or SLAG
    area: string;
    hours: number;
  }>;
}

type ComparisonView = 'none' | 'hours-vs-reps' | 'tek-vs-slag';

// ============================================================================
// COMPONENT
// ============================================================================

export default function TrainingStatsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TrainingStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparisonView, setComparisonView] = useState<ComparisonView>('none');

  // Fetch training statistics
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/v1/training-stats/summary');
      setStats(response.data.data || response.data);
    } catch (err) {
      console.error('Failed to fetch training stats:', err);
      // Mock data for development
      setStats({
        avgFocusPerSession: 7.8,
        hoursThisWeek: 12,
        repsThisWeek: 450,
        hoursThisMonth: 48,
        repsThisMonth: 1850,
        hoursThisYear: 220,
        repsThisYear: 8500,
        weeklyBreakdown: [
          { week: 'Uke 1', hours: 10, reps: 400 },
          { week: 'Uke 2', hours: 12, reps: 450 },
          { week: 'Uke 3', hours: 11, reps: 420 },
          { week: 'Uke 4', hours: 15, reps: 580 },
        ],
        categoryBreakdown: [
          { category: 'TEK', area: 'Driver', hours: 15 },
          { category: 'TEK', area: 'Iron', hours: 12 },
          { category: 'SLAG', area: 'Approach', hours: 18 },
          { category: 'SLAG', area: 'Putting', hours: 22 },
          { category: 'TEK', area: 'Chipping', hours: 8 },
          { category: 'SLAG', area: 'Driving Range', hours: 14 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Calculate TEK vs SLAG totals
  const tekVsSlagData = useMemo(() => {
    if (!stats?.categoryBreakdown) return null;

    const tekHours = stats.categoryBreakdown
      .filter((item) => item.category === 'TEK')
      .reduce((sum, item) => sum + item.hours, 0);

    const slagHours = stats.categoryBreakdown
      .filter((item) => item.category === 'SLAG')
      .reduce((sum, item) => sum + item.hours, 0);

    const tekAreas = stats.categoryBreakdown.filter((item) => item.category === 'TEK');
    const slagAreas = stats.categoryBreakdown.filter((item) => item.category === 'SLAG');

    return {
      tekHours,
      slagHours,
      tekAreas,
      slagAreas,
      total: tekHours + slagHours,
    };
  }, [stats]);

  const pageState = loading ? 'loading' : error ? 'error' : 'idle';

  return (
    <Page state={pageState} maxWidth="xl">
      <Page.Header
        title="Treningsstatistikk"
        subtitle="Oversikt over treningstimer og repetisjoner"
        helpText="FASE 7.3: Ny design med fokus på KPI-er og sammenligninger. Se gjennomsnittlig fokus, timer og repetisjoner for uke, måned og år. Sammenlign timer vs repetisjoner eller TEKNIKK vs GOLFSLAG."
      />

      <Page.Content>
        {error ? (
          <div className="text-center py-12">
            <Text variant="body" color="secondary">
              {error}
            </Text>
            <Button onClick={fetchStats} variant="primary" className="mt-4">
              Prøv igjen
            </Button>
          </div>
        ) : (
          <>
            {/* 4 KPI Cards - Default View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Avg Focus */}
              <div className="bg-gradient-to-br from-tier-navy/5 to-tier-navy/10 border-2 border-tier-navy/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-tier-navy flex items-center justify-center">
                    <Target size={24} className="text-white" />
                  </div>
                  <Text className="text-sm font-medium text-tier-text-secondary">
                    Gj.snitt fokus pr økt
                  </Text>
                </div>
                <div className="flex items-baseline gap-2">
                  <Text className="text-5xl font-bold text-tier-navy">
                    {stats?.avgFocusPerSession?.toFixed(1) || '0.0'}
                  </Text>
                  <Text className="text-2xl text-tier-text-secondary">/10</Text>
                </div>
                <div className="mt-3 h-2 bg-tier-surface-base rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tier-navy transition-all duration-500"
                    style={{ width: `${((stats?.avgFocusPerSession || 0) / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* This Week */}
              <div className="bg-gradient-to-br from-tier-success/5 to-tier-success/10 border-2 border-tier-success/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-tier-success flex items-center justify-center">
                    <Clock size={24} className="text-white" />
                  </div>
                  <Text className="text-sm font-medium text-tier-text-secondary">
                    Denne uken
                  </Text>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <Text className="text-3xl font-bold text-tier-success">
                      {stats?.hoursThisWeek || 0}t
                    </Text>
                    <Text className="text-sm text-tier-text-tertiary">timer</Text>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Text className="text-3xl font-bold text-tier-success">
                      {stats?.repsThisWeek || 0}
                    </Text>
                    <Text className="text-sm text-tier-text-tertiary">reps</Text>
                  </div>
                </div>
              </div>

              {/* This Month */}
              <div className="bg-gradient-to-br from-tier-warning/5 to-tier-warning/10 border-2 border-tier-warning/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-tier-warning flex items-center justify-center">
                    <BarChart3 size={24} className="text-white" />
                  </div>
                  <Text className="text-sm font-medium text-tier-text-secondary">
                    Denne måneden
                  </Text>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <Text className="text-3xl font-bold text-tier-warning">
                      {stats?.hoursThisMonth || 0}t
                    </Text>
                    <Text className="text-sm text-tier-text-tertiary">timer</Text>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Text className="text-3xl font-bold text-tier-warning">
                      {stats?.repsThisMonth || 0}
                    </Text>
                    <Text className="text-sm text-tier-text-tertiary">reps</Text>
                  </div>
                </div>
              </div>

              {/* This Year */}
              <div className="bg-gradient-to-br from-tier-gold/10 to-tier-gold/20 border-2 border-tier-gold/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-tier-gold flex items-center justify-center">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <Text className="text-sm font-medium text-tier-text-secondary">
                    Hittil i år
                  </Text>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <Text className="text-3xl font-bold text-tier-gold">
                      {stats?.hoursThisYear || 0}t
                    </Text>
                    <Text className="text-sm text-tier-text-tertiary">timer</Text>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <Text className="text-3xl font-bold text-tier-gold">
                      {stats?.repsThisYear || 0}
                    </Text>
                    <Text className="text-sm text-tier-text-tertiary">reps</Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison View Selector */}
            <div className="bg-tier-white border border-tier-border-default rounded-xl p-6 mb-6">
              <Text className="font-semibold text-tier-navy mb-4">
                Sammenligninger
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() =>
                    setComparisonView(comparisonView === 'hours-vs-reps' ? 'none' : 'hours-vs-reps')
                  }
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    comparisonView === 'hours-vs-reps'
                      ? 'bg-tier-navy text-white border-tier-navy'
                      : 'bg-tier-surface-base border-tier-border-default hover:border-tier-navy'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <LineChart size={20} />
                      <span className="font-medium">Timer vs Repetisjoner</span>
                    </div>
                    <ChevronRight size={20} />
                  </div>
                </button>

                <button
                  onClick={() =>
                    setComparisonView(comparisonView === 'tek-vs-slag' ? 'none' : 'tek-vs-slag')
                  }
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    comparisonView === 'tek-vs-slag'
                      ? 'bg-tier-navy text-white border-tier-navy'
                      : 'bg-tier-surface-base border-tier-border-default hover:border-tier-navy'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 size={20} />
                      <span className="font-medium">TEKNIKK vs GOLFSLAG</span>
                    </div>
                    <ChevronRight size={20} />
                  </div>
                </button>
              </div>
            </div>

            {/* Hours vs Reps Comparison */}
            {comparisonView === 'hours-vs-reps' && stats?.weeklyBreakdown && (
              <div className="bg-tier-white border border-tier-border-default rounded-xl p-6 mb-6">
                <Text className="font-semibold text-tier-navy mb-6">
                  Timer vs Repetisjoner (Ukentlig)
                </Text>
                <div className="space-y-4">
                  {stats.weeklyBreakdown.map((week, index) => {
                    const maxHours = Math.max(...stats.weeklyBreakdown!.map((w) => w.hours));
                    const maxReps = Math.max(...stats.weeklyBreakdown!.map((w) => w.reps));
                    const hoursPercent = (week.hours / maxHours) * 100;
                    const repsPercent = (week.reps / maxReps) * 100;

                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <Text className="font-medium text-tier-navy">{week.week}</Text>
                          <div className="flex gap-6 text-sm">
                            <span className="text-tier-navy">{week.hours}t</span>
                            <span className="text-tier-success">{week.reps} reps</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-20 text-xs text-tier-text-secondary">Timer</div>
                            <div className="flex-1 h-8 bg-tier-surface-base rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-tier-navy transition-all duration-500"
                                style={{ width: `${hoursPercent}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 text-xs text-tier-text-secondary">Reps</div>
                            <div className="flex-1 h-8 bg-tier-surface-base rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-tier-success transition-all duration-500"
                                style={{ width: `${repsPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TEK vs SLAG Comparison */}
            {comparisonView === 'tek-vs-slag' && tekVsSlagData && (
              <div className="bg-tier-white border border-tier-border-default rounded-xl p-6">
                <Text className="font-semibold text-tier-navy mb-6">
                  TEKNIKK vs GOLFSLAG per Treningsområde
                </Text>

                {/* Overview */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                    <Text className="text-sm text-purple-600 mb-2">TEKNIKK</Text>
                    <Text className="text-3xl font-bold text-purple-700">
                      {tekVsSlagData.tekHours}t
                    </Text>
                    <Text className="text-sm text-purple-600 mt-1">
                      {((tekVsSlagData.tekHours / tekVsSlagData.total) * 100).toFixed(0)}% av total
                    </Text>
                  </div>
                  <div className="p-4 bg-teal-50 border-2 border-teal-200 rounded-lg">
                    <Text className="text-sm text-teal-600 mb-2">GOLFSLAG</Text>
                    <Text className="text-3xl font-bold text-teal-700">
                      {tekVsSlagData.slagHours}t
                    </Text>
                    <Text className="text-sm text-teal-600 mt-1">
                      {((tekVsSlagData.slagHours / tekVsSlagData.total) * 100).toFixed(0)}% av total
                    </Text>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Text className="font-medium text-purple-700 mb-3">TEKNIKK</Text>
                    <div className="space-y-2">
                      {tekVsSlagData.tekAreas.map((area, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <Text className="text-sm text-tier-navy">{area.area}</Text>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-purple-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-600"
                                style={{
                                  width: `${(area.hours / tekVsSlagData.tekHours) * 100}%`,
                                }}
                              />
                            </div>
                            <Text className="text-sm font-medium text-purple-700 w-8 text-right">
                              {area.hours}t
                            </Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Text className="font-medium text-teal-700 mb-3">GOLFSLAG</Text>
                    <div className="space-y-2">
                      {tekVsSlagData.slagAreas.map((area, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <Text className="text-sm text-tier-navy">{area.area}</Text>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-teal-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-600"
                                style={{
                                  width: `${(area.hours / tekVsSlagData.slagHours) * 100}%`,
                                }}
                              />
                            </div>
                            <Text className="text-sm font-medium text-teal-700 w-8 text-right">
                              {area.hours}t
                            </Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Page.Content>
    </Page>
  );
}
