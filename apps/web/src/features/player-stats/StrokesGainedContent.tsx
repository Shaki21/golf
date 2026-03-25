/**
 * StrokesGainedContent - Detailed SG analysis content
 * Design System v3.1 - Tailwind CSS
 * Used within StatistikkHub as tab content
 */

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Crosshair,
  CircleDot,
  Flag,
  Activity,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';

import { useStrokesGained } from '../../hooks/useStrokesGained';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography/Headings';

interface CategoryData {
  value: number;
  tourAvg: number;
  pgaElite: number;
  testCount: number;
}

interface StrokesGainedData {
  hasData: boolean;
  isDemo?: boolean;
  total: number;
  trend: number;
  percentile: number;
  byCategory: {
    approach: CategoryData;
    around_green: CategoryData;
    putting: CategoryData;
  };
  recentTests: Array<{ date: string; category: string; sg: number; testName: string }>;
  weeklyTrend: Array<{ week: number; total: number }>;
}

const StrokesGainedContent: React.FC = () => {
  const { data, loading, error, refetch } = useStrokesGained();
  const [selectedTour, setSelectedTour] = useState<'pga' | 'euro' | 'kft'>('pga');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['approach', 'around_green', 'putting'])
  );

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
    if (trend > 0) return <TrendingUp size={14} className="text-green-600" />;
    if (trend < 0) return <TrendingDown size={14} className="text-red-600" />;
    return <Activity size={14} className="text-tier-text-tertiary" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'approach': return Crosshair;
      case 'around_green': return Flag;
      case 'putting': return CircleDot;
      default: return Target;
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'approach':
        return {
          label: 'Innspill',
          description: 'Slag fra fairway/rough inn mot green (50-200m)',
          tips: ['Fokuser på presisjon fremfor distanse', 'Tren på ulike avstander', 'Jobb med lie-variasjon']
        };
      case 'around_green':
        return {
          label: 'Rundt Green',
          description: 'Chipping, pitching og bunkerslag innenfor 50m',
          tips: ['Utvikle varierte slag', 'Prioriter oppslagsøvelser', 'Tren på ulike underlag']
        };
      case 'putting':
        return {
          label: 'Putting',
          description: 'Alle slag på green',
          tips: ['Jobb med avstander 1-3m', 'Tren på lange putter for lagkontroll', 'Fokuser på lesing av green']
        };
      default:
        return { label: category, description: '', tips: [] };
    }
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const calculateProgress = (current: number, elite: number) => {
    if (elite <= 0) return 0;
    const progress = ((current + 1) / (elite + 1)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <StateCard
        variant="loading"
        title="Laster Strokes Gained..."
        description="Beregner dine data"
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
    <div className="flex flex-col gap-4">
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
        <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-tier-text-secondary m-0 leading-relaxed">
            <strong>Strokes Gained</strong> måler hvor mange slag du tjener eller taper sammenlignet med en referansespiller.
            Positive verdier = bedre enn gjennomsnitt.
          </p>
        </div>
      </div>

      {/* Tour Selection */}
      <div className="flex items-center justify-between p-3 bg-tier-surface-subtle rounded-lg">
        <span className="text-sm text-tier-text-secondary">Sammenlign med:</span>
        <div className="flex gap-2">
          {(['pga', 'euro', 'kft'] as const).map(tour => (
            <button
              key={tour}
              onClick={() => setSelectedTour(tour)}
              className={`px-3 py-2 rounded text-xs font-semibold border-none cursor-pointer transition-all duration-200 ${
                selectedTour === tour
                  ? 'bg-indigo-500 text-white'
                  : 'bg-tier-surface-base text-tier-text-secondary hover:bg-tier-surface-subtle'
              }`}
            >
              {tour.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Total Overview */}
      <section className="mb-2">
        <Card>
          <div className="p-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                <BarChart3 size={24} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-tier-navy m-0">Strokes Gained Total</CardTitle>
                <p className="text-sm text-tier-text-tertiary m-0">
                  Basert på {sgData?.byCategory ?
                    Object.values(sgData.byCategory).reduce((sum, cat) => sum + cat.testCount, 0) : 0} tester
                </p>
              </div>
            </div>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="flex flex-col gap-1">
                <span className={`text-4xl font-bold ${getSGColorClass(sgData?.total)}`}>
                  {formatSG(sgData?.total)}
                </span>
                <div className="flex items-center gap-1 text-sm">
                  {getTrendIcon(sgData?.trend || 0)}
                  <span className={(sgData?.trend || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatSG(sgData?.trend)} fra forrige
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-[72px] h-[72px] rounded-full bg-tier-surface-subtle flex items-baseline justify-center pt-5">
                  <span className="text-3xl font-bold text-tier-navy">{sgData?.percentile || 0}</span>
                  <span className="text-sm text-tier-text-tertiary">%</span>
                </div>
                <span className="text-xs text-tier-text-tertiary text-center max-w-[150px]">
                  Du er bedre enn {sgData?.percentile || 0}% av spillere på ditt nivå
                </span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Category Breakdown */}
      <section className="mb-2">
        <SectionTitle className="mb-3">Kategori-analyse</SectionTitle>
        <div className="flex flex-col gap-3">
          {sgData?.byCategory && Object.entries(sgData.byCategory).map(([key, cat]) => {
            const Icon = getCategoryIcon(key);
            const info = getCategoryInfo(key);
            const isExpanded = expandedCategories.has(key);
            const progress = calculateProgress(cat.value, cat.pgaElite);

            return (
              <Card key={key}>
                <div className="p-1">
                  <div
                    className="flex justify-between items-center cursor-pointer p-2"
                    onClick={() => toggleCategory(key)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Icon size={20} className="text-tier-gold" />
                      </div>
                      <div>
                        <SubSectionTitle className="m-0">{info.label}</SubSectionTitle>
                        <p className="text-xs text-tier-text-tertiary m-0">{info.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${getSGColorClass(cat.value)}`}>
                        {formatSG(cat.value)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-tier-text-tertiary" />
                      ) : (
                        <ChevronDown size={20} className="text-tier-text-tertiary" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pt-4 border-t border-tier-border-subtle mt-3">
                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-tier-text-tertiary mb-2">
                          <span>Din verdi</span>
                          <span>PGA Elite ({formatSG(cat.pgaElite)})</span>
                        </div>
                        <div className="h-2 bg-tier-surface-subtle rounded overflow-hidden relative">
                          <div
                            className={`h-full rounded transition-all duration-300 ${
                              cat.value > 0 ? 'bg-green-500' : cat.value < 0 ? 'bg-red-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                          <div className="absolute right-0 -top-0.5 w-0.5 h-3 bg-green-500" />
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-tier-surface-subtle p-3 rounded text-center">
                          <span className="block text-xs text-tier-text-tertiary mb-0.5">Din SG</span>
                          <span className={`block text-lg font-bold ${getSGColorClass(cat.value)}`}>
                            {formatSG(cat.value)}
                          </span>
                        </div>
                        <div className="bg-tier-surface-subtle p-3 rounded text-center">
                          <span className="block text-xs text-tier-text-tertiary mb-0.5">Tour Avg</span>
                          <span className="block text-lg font-bold text-tier-navy">{formatSG(cat.tourAvg)}</span>
                        </div>
                        <div className="bg-tier-surface-subtle p-3 rounded text-center">
                          <span className="block text-xs text-tier-text-tertiary mb-0.5">PGA Elite</span>
                          <span className="block text-lg font-bold text-green-600">{formatSG(cat.pgaElite)}</span>
                        </div>
                        <div className="bg-tier-surface-subtle p-3 rounded text-center">
                          <span className="block text-xs text-tier-text-tertiary mb-0.5">Gap til Elite</span>
                          <span className={`block text-lg font-bold ${getSGColorClass(cat.value - cat.pgaElite)}`}>
                            {formatSG(cat.value - cat.pgaElite)}
                          </span>
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="bg-indigo-50/50 p-3 rounded mb-3">
                        <CardTitle className="text-sm text-tier-text-secondary m-0 mb-2">Tips for forbedring</CardTitle>
                        <ul className="m-0 pl-4">
                          {info.tips.map((tip, i) => (
                            <li key={i} className="text-xs text-tier-text-secondary mb-1">{tip}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Test count */}
                      <div className="flex items-center gap-2 text-xs text-tier-text-tertiary">
                        <Target size={14} />
                        <span>{cat.testCount} tester registrert</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Weekly Trend */}
      <section className="mb-2">
        <SectionTitle className="mb-3">Ukentlig utvikling</SectionTitle>
        <Card>
          <div className="flex justify-around items-end h-[150px] p-4">
            {sgData?.weeklyTrend?.map((week) => (
              <div key={week.week} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full max-w-[40px] h-20 bg-tier-surface-subtle rounded flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded transition-all duration-300 ${
                      week.total >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ height: `${Math.max(20, (week.total + 0.5) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-tier-text-tertiary">Uke {week.week}</span>
                <span className={`text-xs font-semibold ${getSGColorClass(week.total)}`}>
                  {formatSG(week.total)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Demo notice */}
      {sgData?.isDemo && (
        <div className="flex items-center gap-2 px-4 py-3 bg-sky-50 border border-sky-100 rounded-lg mb-4 text-sm text-tier-text-secondary">
          <Info size={16} className="text-sky-600" />
          <span>Viser demodata. Fullfør flere tester for å se dine egne resultater.</span>
        </div>
      )}
    </div>
  );
};

export default StrokesGainedContent;
