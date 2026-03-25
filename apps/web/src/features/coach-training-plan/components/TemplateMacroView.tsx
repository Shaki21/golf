/**
 * TemplateMacroView Component
 * Macro-level view showing periods, load distribution, and statistics
 */

import React, { useState } from 'react';
import { Calendar, TrendingUp, BarChart3, Target } from 'lucide-react';
import { Card } from '../../../ui/primitives/Card';
import { Badge } from '../../../components/shadcn/badge';
import { TrainingPlanTemplate, TemplatePeriod } from '../types/template.types';
import { useTemplatePeriodPlanning } from '../hooks/useTemplatePeriodPlanning';
import TemplatePeriodTimeline from './TemplatePeriodTimeline';
import TemplateLoadChart from './TemplateLoadChart';

interface TemplateMacroViewProps {
  template: TrainingPlanTemplate;
  startDate?: string;
  initialPeriods?: TemplatePeriod[];
}

export function TemplateMacroView({
  template,
  startDate,
  initialPeriods
}: TemplateMacroViewProps) {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>();

  // Use period planning hook
  const {
    periods,
    weeklyMetrics,
    periodMetrics,
    macroPlanData
  } = useTemplatePeriodPlanning({
    template,
    startDate,
    initialPeriods
  });

  // Calculate summary statistics
  const totalDuration = template.durationWeeks;
  const avgWeeklyLoad = macroPlanData.totalLoad.avgWeeklyMinutes;
  const avgWeeklySessions = macroPlanData.totalLoad.avgWeeklySessions;

  // Find peak week
  const peakWeek = weeklyMetrics.reduce((max, week) =>
    week.totalMinutes > max.totalMinutes ? week : max
  , weeklyMetrics[0] || { weekNumber: 0, totalMinutes: 0, loadScore: 0 });

  // Get selected period metrics
  const selectedPeriod = selectedPeriodId
    ? periods.find(p => p.id === selectedPeriodId)
    : null;

  const selectedPeriodMetrics = selectedPeriodId
    ? periodMetrics.find(pm => pm.periodId === selectedPeriodId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header with overall stats */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Duration */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="text-tier-gold" size={24} />
            </div>
            <div className="text-3xl font-bold text-tier-navy">
              {totalDuration}
            </div>
            <div className="text-sm text-tier-navy/60 mt-1">
              {totalDuration === 1 ? 'Week' : 'Weeks'} Total
            </div>
          </div>

          {/* Total Training Time */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="text-tier-gold" size={24} />
            </div>
            <div className="text-3xl font-bold text-tier-navy">
              {Math.round(macroPlanData.totalLoad.totalMinutes / 60)}h
            </div>
            <div className="text-sm text-tier-navy/60 mt-1">
              Total Training
            </div>
          </div>

          {/* Avg Weekly Load */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="text-tier-gold" size={24} />
            </div>
            <div className="text-3xl font-bold text-tier-navy">
              {Math.round(avgWeeklyLoad)}
            </div>
            <div className="text-sm text-tier-navy/60 mt-1">
              Avg Min/Week
            </div>
          </div>

          {/* Total Sessions */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="text-tier-gold" size={24} />
            </div>
            <div className="text-3xl font-bold text-tier-navy">
              {macroPlanData.totalLoad.totalSessions}
            </div>
            <div className="text-sm text-tier-navy/60 mt-1">
              Total Sessions
            </div>
          </div>
        </div>

        {/* Additional stats row */}
        <div className="mt-6 pt-6 border-t border-tier-navy/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-sm text-tier-navy/60">Avg Sessions/Week:</span>
              <span className="ml-2 font-semibold text-tier-navy">
                {avgWeeklySessions.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-sm text-tier-navy/60">Peak Week:</span>
              <span className="ml-2 font-semibold text-tier-navy">
                W{peakWeek.weekNumber} ({peakWeek.totalMinutes} min)
              </span>
            </div>
            <div>
              <span className="text-sm text-tier-navy/60">Periods:</span>
              <span className="ml-2 font-semibold text-tier-navy">
                {periods.length}
              </span>
            </div>
            <div>
              <span className="text-sm text-tier-navy/60">Categories:</span>
              <span className="ml-2 font-semibold text-tier-navy">
                {new Set(template.sessions.flatMap(s => s.categories)).size}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Period Timeline */}
      <TemplatePeriodTimeline
        totalWeeks={template.durationWeeks}
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        onPeriodClick={(period) => {
          setSelectedPeriodId(period.id === selectedPeriodId ? undefined : period.id);
        }}
      />

      {/* Selected Period Details */}
      {selectedPeriod && selectedPeriodMetrics && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-tier-navy">{selectedPeriod.name}</h3>
                <p className="text-sm text-tier-navy/70 mt-1">
                  {selectedPeriod.description}
                </p>
              </div>
              <Badge variant="secondary">
                {selectedPeriodMetrics.weekCount} weeks
              </Badge>
            </div>

            {/* Period Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-tier-navy/5 rounded">
                <div className="text-sm text-tier-navy/60">Total Training</div>
                <div className="text-xl font-bold text-tier-navy mt-1">
                  {Math.round(selectedPeriodMetrics.totalMinutes / 60)}h
                </div>
              </div>

              <div className="p-3 bg-tier-navy/5 rounded">
                <div className="text-sm text-tier-navy/60">Sessions</div>
                <div className="text-xl font-bold text-tier-navy mt-1">
                  {selectedPeriodMetrics.totalSessions}
                </div>
              </div>

              <div className="p-3 bg-tier-navy/5 rounded">
                <div className="text-sm text-tier-navy/60">Avg Weekly</div>
                <div className="text-xl font-bold text-tier-navy mt-1">
                  {Math.round(selectedPeriodMetrics.avgMinutesPerWeek)} min
                </div>
              </div>

              <div className="p-3 bg-tier-navy/5 rounded">
                <div className="text-sm text-tier-navy/60">Avg Load</div>
                <div className="text-xl font-bold text-tier-navy mt-1">
                  {Math.round(selectedPeriodMetrics.avgLoadScore)}/100
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-tier-navy mb-2">Category Distribution</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedPeriodMetrics.categoryBreakdown).map(([category, data]) => (
                  <div key={category} className="flex items-center gap-2 px-3 py-2 bg-tier-navy/5 rounded">
                    <span className="text-sm font-medium text-tier-navy">{category}</span>
                    <span className="text-xs text-tier-navy/60">
                      {data.minutes} min ({data.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Peak and Lowest Weeks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                <div className="text-xs text-emerald-700 font-semibold mb-1">Peak Week</div>
                <div className="text-lg font-bold text-emerald-900">
                  Week {selectedPeriodMetrics.peakWeek.weekNumber}
                </div>
                <div className="text-xs text-emerald-700">
                  {selectedPeriodMetrics.peakWeek.minutes} min (Load: {selectedPeriodMetrics.peakWeek.loadScore})
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-xs text-blue-700 font-semibold mb-1">Lowest Week</div>
                <div className="text-lg font-bold text-blue-900">
                  Week {selectedPeriodMetrics.lowestWeek.weekNumber}
                </div>
                <div className="text-xs text-blue-700">
                  {selectedPeriodMetrics.lowestWeek.minutes} min (Load: {selectedPeriodMetrics.lowestWeek.loadScore})
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Load Distribution Chart */}
      <TemplateLoadChart
        weeklyMetrics={weeklyMetrics}
        periods={periods}
        height={400}
        showLoadLine={true}
      />

      {/* Weekly Breakdown Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-tier-navy mb-4">Weekly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tier-navy/10">
                <th className="text-left py-2 px-3 font-semibold text-tier-navy">Week</th>
                <th className="text-left py-2 px-3 font-semibold text-tier-navy">Period</th>
                <th className="text-right py-2 px-3 font-semibold text-tier-navy">Minutes</th>
                <th className="text-right py-2 px-3 font-semibold text-tier-navy">Sessions</th>
                <th className="text-right py-2 px-3 font-semibold text-tier-navy">Load</th>
                <th className="text-left py-2 px-3 font-semibold text-tier-navy">Categories</th>
              </tr>
            </thead>
            <tbody>
              {weeklyMetrics.map((week) => {
                const period = periods.find(p => week.weekNumber >= p.startWeek && week.weekNumber <= p.endWeek);
                return (
                  <tr key={week.weekNumber} className="border-b border-tier-navy/5 hover:bg-tier-navy/5">
                    <td className="py-2 px-3 font-medium text-tier-navy">Week {week.weekNumber}</td>
                    <td className="py-2 px-3">
                      {period ? (
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: period.color }}
                        >
                          {period.name}
                        </span>
                      ) : (
                        <span className="text-xs text-tier-navy/40">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-tier-navy">{week.totalMinutes}</td>
                    <td className="py-2 px-3 text-right text-tier-navy">{week.sessionCount}</td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`
                          font-medium
                          ${week.loadScore >= 75 ? 'text-red-600' :
                            week.loadScore >= 50 ? 'text-amber-600' :
                            'text-emerald-600'}
                        `}
                      >
                        {week.loadScore}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-1">
                        {Object.keys(week.categoryBreakdown).map(cat => (
                          <span key={cat} className="text-xs text-tier-navy/70">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default TemplateMacroView;
