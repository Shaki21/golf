/**
 * PlayerStatsContent - Main statistics overview content
 * Design System v3.1 - Tailwind CSS
 * Used within StatistikkHub as tab content
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Info,
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';

import { useStrokesGained } from '../../hooks/useStrokesGained';
import { SectionTitle, CardTitle } from '../../components/typography/Headings';
import { getStrokesGainedIcon } from '../../constants/icons';

interface StrokesGainedData {
  hasData: boolean;
  isDemo?: boolean;
  total: number;
  trend: number;
  percentile: number;
  byCategory: {
    approach: { value: number; tourAvg: number; pgaElite: number; testCount: number };
    around_green: { value: number; tourAvg: number; pgaElite: number; testCount: number };
    putting: { value: number; tourAvg: number; pgaElite: number; testCount: number };
  };
  recentTests: Array<{ date: string; category: string; sg: number; testName: string }>;
  weeklyTrend: Array<{ week: number; total: number }>;
}

const PlayerStatsContent: React.FC = () => {
  const { data, loading, error, refetch } = useStrokesGained();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const sgData = data as StrokesGainedData | null;

  const formatSG = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    if (value > 0) return `+${value.toFixed(2)}`;
    return value.toFixed(2);
  };

  const getSGColorClass = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'text-tier-text-tertiary';
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-tier-text-secondary';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp size={16} className="text-green-600" />;
    if (trend < 0) return <TrendingDown size={16} className="text-red-600" />;
    return <Activity size={16} className="text-tier-text-tertiary" />;
  };

  const getCategoryIcon = (category: string) => {
    return getStrokesGainedIcon(category);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'approach': return 'Approach';
      case 'around_green': return 'Rundt green';
      case 'putting': return 'Putting';
      default: return category;
    }
  };

  if (loading) {
    return (
      <StateCard
        variant="loading"
        title="Laster statistikk..."
        description="Henter dine data"
      />
    );
  }

  if (error && !sgData) {
    return (
      <StateCard
        variant="error"
        title="Kunne ikke laste data"
        description={error}
        action={
          <Button variant="primary" onClick={refetch}>
            Prøv igjen
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* Demo banner */}
      {sgData?.isDemo && (
        <div className="flex items-center gap-2 px-4 py-3 bg-sky-50 border border-sky-200/50 rounded-lg mb-4 text-sm text-tier-text-secondary">
          <Info size={16} className="text-sky-600" />
          <span>Viser demodata. Fullfør tester for å se dine egne resultater.</span>
        </div>
      )}

      {/* Total SG Card */}
      <section className="mb-6">
        <Card>
          <div className="p-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                <BarChart3 size={24} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-tier-navy m-0">Strokes Gained Total</CardTitle>
                <p className="text-sm text-tier-text-tertiary m-0">Estimert basert på testresultater</p>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2">
                <span className={`text-4xl font-bold ${getSGColorClass(sgData?.total)}`}>
                  {formatSG(sgData?.total)}
                </span>
                <div className="flex items-center gap-1">
                  {getTrendIcon(sgData?.trend || 0)}
                  <span className={`text-sm font-semibold ${(sgData?.trend || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatSG(sgData?.trend)} siste uke
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center p-3 bg-tier-surface-subtle rounded-lg">
                <span className="text-2xl font-bold text-tier-navy">{sgData?.percentile || 0}%</span>
                <span className="text-xs text-tier-text-tertiary">Percentil</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* SG Breakdown */}
      <section className="mb-6">
        <SectionTitle className="mb-3">Strokes Gained Breakdown</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
          {sgData?.byCategory && Object.entries(sgData.byCategory).map(([key, cat]) => {
            const Icon = getCategoryIcon(key);
            return (
              <Card key={key}>
                <div
                  className="cursor-pointer p-1"
                  onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center">
                      <Icon size={18} className="text-tier-gold" />
                    </div>
                    <span className="text-sm font-medium text-tier-text-secondary">{getCategoryLabel(key)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-2xl font-bold ${getSGColorClass(cat.value)}`}>
                      {formatSG(cat.value)}
                    </span>
                    <span className="text-xs text-tier-text-tertiary">{cat.testCount} tester</span>
                  </div>
                  {selectedCategory === key && (
                    <div className="mt-3 pt-3 border-t border-tier-border-subtle flex flex-col gap-2">
                      <div className="flex justify-between text-xs text-tier-text-secondary">
                        <span>Tour gjennomsnitt</span>
                        <span>{formatSG(cat.tourAvg)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-tier-text-secondary">
                        <span>PGA Elite</span>
                        <span className="text-green-600">{formatSG(cat.pgaElite)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-tier-text-secondary">
                        <span>Din gap til elite</span>
                        <span className={getSGColorClass(cat.value - cat.pgaElite)}>
                          {formatSG(cat.value - cat.pgaElite)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Recent Tests */}
      <section className="mb-6">
        <SectionTitle className="mb-3">Siste tester</SectionTitle>
        <Card>
          <div className="flex flex-col">
            {sgData?.recentTests?.slice(0, 5).map((test, index) => {
              const Icon = getCategoryIcon(test.category);
              return (
                <div key={index} className="flex justify-between items-center py-3 border-b border-tier-border-subtle last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-tier-surface-subtle flex items-center justify-center">
                      <Icon size={16} className="text-tier-text-secondary" />
                    </div>
                    <div>
                      <span className="block text-base font-medium text-tier-navy">{test.testName}</span>
                      <span className="block text-xs text-tier-text-tertiary">{test.date}</span>
                    </div>
                  </div>
                  <span className={`text-base font-semibold ${getSGColorClass(test.sg)}`}>
                    {formatSG(test.sg)}
                  </span>
                </div>
              );
            })}
            {(!sgData?.recentTests || sgData.recentTests.length === 0) && (
              <div className="text-center p-6 text-tier-text-tertiary">
                <p className="m-0">Ingen tester registrert enda</p>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Weekly Trend Chart */}
      {sgData?.weeklyTrend && sgData.weeklyTrend.length > 0 && (
        <section className="mb-6">
          <SectionTitle className="mb-3">Ukentlig utvikling</SectionTitle>
          <Card>
            <div className="flex justify-around items-end h-[150px] p-4">
              {sgData.weeklyTrend.map((week) => (
                <div key={week.week} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full max-w-[40px] h-20 bg-tier-surface-subtle rounded flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded transition-all duration-300 ${week.total >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ height: `${Math.max(20, (week.total + 0.5) * 80)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-tier-text-tertiary">U{week.week}</span>
                  <span className={`text-xs font-semibold ${getSGColorClass(week.total)}`}>
                    {formatSG(week.total)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
};

export default PlayerStatsContent;
