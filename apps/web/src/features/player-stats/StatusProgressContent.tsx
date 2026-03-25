/**
 * StatusProgressContent - Status & Goals progress
 * Design System v3.1 - Tailwind CSS
 * Used within StatistikkHub as tab content
 */

import React from 'react';
import {
  TrendingUp,
  Target,
  Award,
  CheckCircle2,
  Circle,
  Zap,
  Calendar,
  Star
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import Badge from '../../ui/primitives/Badge.primitive';
import StateCard from '../../ui/composites/StateCard';
import { useStrokesGained } from '../../hooks/useStrokesGained';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

const StatusProgressContent: React.FC = () => {
  const { data, loading } = useStrokesGained();

  // Demo goals data
  const goals = [
    {
      id: 1,
      title: 'Approach SG > +0.3',
      description: 'Forbedre approach-slag til over +0.3 strokes gained',
      category: 'approach',
      target: 0.3,
      current: data?.byCategory?.approach?.value || 0.15,
      deadline: '2025-03-01',
      status: 'in_progress',
    },
    {
      id: 2,
      title: 'Gjennomfør 50 tester',
      description: 'Fullfør minst 50 testslagsmålinger',
      category: 'general',
      target: 50,
      current: Object.values(data?.byCategory || {}).reduce((sum: number, cat: any) => sum + (cat.testCount || 0), 0),
      deadline: '2025-06-01',
      status: 'in_progress',
    },
    {
      id: 3,
      title: 'Putting forbedring',
      description: 'Nå +0.2 SG på putting',
      category: 'putting',
      target: 0.2,
      current: data?.byCategory?.putting?.value || 0.12,
      deadline: '2025-04-01',
      status: 'in_progress',
    },
  ];

  // Demo milestones
  const milestones = [
    { id: 1, title: 'Første test gjennomført', achieved: true, date: '2025-12-15' },
    { id: 2, title: 'Positiv total SG', achieved: (data?.total || 0) > 0, date: '2025-12-20' },
    { id: 3, title: '10 tester fullført', achieved: true, date: '2025-12-25' },
    { id: 4, title: 'Approach SG > 0', achieved: (data?.byCategory?.approach?.value || 0) > 0, date: null },
    { id: 5, title: 'Alle kategorier testet', achieved: true, date: '2025-12-22' },
  ];

  const getProgressPercent = (current: number, target: number) => {
    return Math.min(100, Math.max(0, (current / target) * 100));
  };

  const formatValue = (value: number, isCount: boolean = false) => {
    if (isCount) return Math.round(value).toString();
    if (value > 0) return `+${value.toFixed(2)}`;
    return value.toFixed(2);
  };

  if (loading) {
    return (
      <StateCard
        variant="loading"
        title="Laster status..."
        description="Henter dine mål og progresjon"
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* Current Status Summary */}
      <section className="mb-6">
        <Card variant="elevated" padding="spacious">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-tier-gold to-green-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Zap size={24} className="text-white" />
              </div>
              <div>
                <SectionTitle className="mb-0">Din status</SectionTitle>
                <p className="text-base text-tier-text-secondary m-0">Basert på dine siste resultater</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-tier-surface-subtle rounded-lg">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-tier-text-tertiary">Total SG</span>
                <span className={`text-xl font-bold tabular-nums ${(data?.total || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatValue(data?.total || 0)}
                </span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-tier-text-tertiary">Percentil</span>
                <span className="text-xl font-bold tabular-nums text-tier-navy">{data?.percentile || 0}%</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-tier-text-tertiary">Trend</span>
                <span className={`text-xl font-bold tabular-nums ${(data?.trend || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatValue(data?.trend || 0)}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge
                variant={(data?.total || 0) >= 0.3 ? 'success' : (data?.total || 0) >= 0 ? 'accent' : 'warning'}
                size="md"
              >
                {(data?.total || 0) >= 0.5 ? 'Elite-nivå' :
                  (data?.total || 0) >= 0.2 ? 'Over gjennomsnitt' :
                    (data?.total || 0) >= 0 ? 'Gjennomsnitt' : 'Under gjennomsnitt'}
              </Badge>
            </div>
          </div>
        </Card>
      </section>

      {/* Goals Progress */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle className="m-0">Aktive mål</SectionTitle>
          <Target size={20} className="text-tier-text-secondary" />
        </div>

        <div className="flex flex-col gap-3">
          {goals.map(goal => {
            const progress = getProgressPercent(goal.current, goal.target);
            const isCount = goal.category === 'general';

            return (
              <Card key={goal.id} padding="md">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <SubSectionTitle className="m-0">{goal.title}</SubSectionTitle>
                      <p className="text-sm text-tier-text-tertiary mt-1 mb-0">{goal.description}</p>
                    </div>
                    <Badge
                      variant={progress >= 100 ? 'success' : progress >= 50 ? 'accent' : 'warning'}
                      size="sm"
                    >
                      {Math.round(progress)}%
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="flex flex-col gap-1">
                    <div className="h-2 bg-tier-surface-subtle rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-300 ${
                          progress >= 100 ? 'bg-green-500' :
                          progress >= 50 ? 'bg-tier-gold' : 'bg-amber-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-tier-text-tertiary">
                      <span>Nå: {formatValue(goal.current, isCount)}</span>
                      <span>Mål: {formatValue(goal.target, isCount)}</span>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-tier-text-tertiary" />
                    <span className="text-xs text-tier-text-tertiary">Frist: {goal.deadline}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Milestones */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle className="m-0">Milepæler</SectionTitle>
          <Award size={20} className="text-tier-text-secondary" />
        </div>

        <Card padding="md">
          <div className="flex flex-col gap-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`flex items-center gap-3 p-2 rounded transition-colors ${milestone.achieved ? 'opacity-100' : 'opacity-60'}`}
              >
                <div className="shrink-0">
                  {milestone.achieved ? (
                    <CheckCircle2 size={20} className="text-green-600" />
                  ) : (
                    <Circle size={20} className="text-tier-text-tertiary" />
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <span className="text-base font-medium text-tier-navy">
                    {milestone.title}
                  </span>
                  {milestone.achieved && milestone.date && (
                    <span className="text-xs text-tier-text-tertiary">{milestone.date}</span>
                  )}
                </div>
                {milestone.achieved && (
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Recommendations */}
      <section className="mb-6">
        <SectionTitle className="mb-3">
          Anbefalinger
        </SectionTitle>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
          {[
            {
              icon: Target,
              title: 'Fokuser på Approach',
              description: 'Approach-slag gir størst forbedringspotensial',
              colorClass: 'bg-indigo-50 text-tier-gold',
            },
            {
              icon: TrendingUp,
              title: 'Fortsett trenden',
              description: 'Du er på rett vei med positiv utvikling',
              colorClass: 'bg-green-50 text-green-600',
            },
            {
              icon: Calendar,
              title: 'Test regelmessig',
              description: 'Gjennomfør tester hver uke for bedre data',
              colorClass: 'bg-amber-50 text-amber-500',
            },
          ].map((rec, index) => {
            const Icon = rec.icon;
            return (
              <Card key={index} padding="md">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${rec.colorClass.split(' ')[0]}`}>
                    <Icon size={20} className={rec.colorClass.split(' ')[1]} />
                  </div>
                  <div>
                    <span className="block text-base font-semibold text-tier-navy">{rec.title}</span>
                    <p className="text-sm text-tier-text-tertiary mt-1 mb-0">{rec.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default StatusProgressContent;
