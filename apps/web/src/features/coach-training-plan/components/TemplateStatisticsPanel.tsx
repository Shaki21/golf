/**
 * TemplateStatisticsPanel Component
 * Comprehensive statistics and analytics for training templates
 */

import React, { useMemo } from 'react';
import {
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Activity
} from 'lucide-react';
import { Card } from '../../../ui/primitives/Card';
import { Badge } from '../../../components/shadcn/badge';
import { TrainingPlanTemplate } from '../types/template.types';

interface TemplateStatisticsPanelProps {
  template: TrainingPlanTemplate;
}

export function TemplateStatisticsPanel({ template }: TemplateStatisticsPanelProps) {
  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const sessions = template.sessions;

    // Basic stats
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalHours = Math.round(totalMinutes / 60);
    const avgSessionDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    const avgSessionsPerWeek = totalSessions > 0 ? (totalSessions / template.durationWeeks).toFixed(1) : '0';

    // Category breakdown
    const categoryBreakdown: Record<string, { count: number; minutes: number }> = {};
    sessions.forEach(session => {
      session.categories.forEach(cat => {
        if (!categoryBreakdown[cat]) {
          categoryBreakdown[cat] = { count: 0, minutes: 0 };
        }
        categoryBreakdown[cat].count++;
        categoryBreakdown[cat].minutes += session.durationMinutes;
      });
    });

    // Sort categories by minutes
    const sortedCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1].minutes - a[1].minutes)
      .map(([category, data]) => ({
        category,
        count: data.count,
        minutes: data.minutes,
        percentage: ((data.minutes / totalMinutes) * 100).toFixed(1)
      }));

    // Sessions per week distribution
    const sessionsPerWeek = new Map<number, number>();
    sessions.forEach(session => {
      sessionsPerWeek.set(
        session.weekNumber,
        (sessionsPerWeek.get(session.weekNumber) || 0) + 1
      );
    });
    const sessionsPerWeekValues = Array.from(sessionsPerWeek.values());
    const maxSessionsInWeek = sessionsPerWeekValues.length > 0
      ? Math.max(...sessionsPerWeekValues)
      : 0;
    const nonZeroSessionsPerWeek = sessionsPerWeekValues.filter(v => v > 0);
    const minSessionsInWeek = nonZeroSessionsPerWeek.length > 0
      ? Math.min(...nonZeroSessionsPerWeek)
      : 0;

    // Duration distribution
    const minutesPerWeek = new Map<number, number>();
    sessions.forEach(session => {
      minutesPerWeek.set(
        session.weekNumber,
        (minutesPerWeek.get(session.weekNumber) || 0) + session.durationMinutes
      );
    });
    const maxMinutesInWeek = Math.max(...Array.from(minutesPerWeek.values()), 0);
    const avgMinutesPerWeek = totalMinutes / template.durationWeeks;

    // Exercise count
    const totalExercises = sessions.reduce(
      (sum, s) => sum + (s.exercises?.length || 0),
      0
    );
    const sessionsWithExercises = sessions.filter(
      s => s.exercises && s.exercises.length > 0
    ).length;

    // Phase distribution
    const phaseBreakdown: Record<string, number> = {};
    sessions.forEach(session => {
      if (session.phase) {
        phaseBreakdown[session.phase] = (phaseBreakdown[session.phase] || 0) + 1;
      }
    });

    return {
      totalSessions,
      totalMinutes,
      totalHours,
      avgSessionDuration,
      avgSessionsPerWeek,
      categoryBreakdown: sortedCategories,
      maxSessionsInWeek,
      minSessionsInWeek,
      maxMinutesInWeek,
      avgMinutesPerWeek,
      totalExercises,
      sessionsWithExercises,
      phaseBreakdown,
    };
  }, [template]);

  // Category colors
  const categoryColors: Record<string, string> = {
    TEE: 'bg-tier-gold/20 text-tier-gold border-tier-gold',
    APP: 'bg-tier-navy/20 text-tier-navy border-tier-navy',
    SGR: 'bg-tier-success/20 text-tier-success border-tier-success',
    PGR: 'bg-tier-accent/20 text-tier-accent border-tier-accent',
    GBR: 'bg-tier-warning/20 text-tier-warning border-tier-warning',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 size={24} className="text-tier-gold" />
        <h3 className="text-lg font-semibold text-tier-navy">Template Statistics</h3>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Duration */}
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="text-tier-gold" size={24} />
          </div>
          <div className="text-2xl font-bold text-tier-navy">
            {stats.totalHours}h
          </div>
          <div className="text-xs text-tier-navy/60 mt-1">
            Total Training
          </div>
          <div className="text-xs text-tier-navy/40 mt-0.5">
            {stats.totalMinutes} minutes
          </div>
        </Card>

        {/* Total Sessions */}
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="text-tier-gold" size={24} />
          </div>
          <div className="text-2xl font-bold text-tier-navy">
            {stats.totalSessions}
          </div>
          <div className="text-xs text-tier-navy/60 mt-1">
            Total Sessions
          </div>
          <div className="text-xs text-tier-navy/40 mt-0.5">
            {stats.avgSessionsPerWeek} per week
          </div>
        </Card>

        {/* Avg Session Duration */}
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Activity className="text-tier-gold" size={24} />
          </div>
          <div className="text-2xl font-bold text-tier-navy">
            {stats.avgSessionDuration}
          </div>
          <div className="text-xs text-tier-navy/60 mt-1">
            Avg Minutes
          </div>
          <div className="text-xs text-tier-navy/40 mt-0.5">
            per session
          </div>
        </Card>

        {/* Total Exercises */}
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Award className="text-tier-gold" size={24} />
          </div>
          <div className="text-2xl font-bold text-tier-navy">
            {stats.totalExercises}
          </div>
          <div className="text-xs text-tier-navy/60 mt-1">
            Total Exercises
          </div>
          <div className="text-xs text-tier-navy/40 mt-0.5">
            in {stats.sessionsWithExercises} sessions
          </div>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-tier-navy" />
          <h4 className="text-sm font-semibold text-tier-navy">Category Distribution</h4>
        </div>
        <div className="space-y-3">
          {stats.categoryBreakdown.map(({ category, count, minutes, percentage }) => {
            const colorClass = categoryColors[category] || categoryColors.APP;
            return (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${colorClass}`}>
                      {category}
                    </span>
                    <span className="text-tier-navy/70">
                      {count} {count === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-tier-navy/60 text-xs">
                      {minutes} min
                    </span>
                    <span className="text-tier-navy font-semibold text-xs">
                      {percentage}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-2 bg-tier-navy/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tier-gold transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Weekly Distribution */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-tier-navy" />
          <h4 className="text-sm font-semibold text-tier-navy">Weekly Distribution</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-tier-navy/5 rounded-lg">
            <div className="text-xs text-tier-navy/60 mb-1">Peak Week Load</div>
            <div className="text-xl font-bold text-tier-navy">
              {stats.maxMinutesInWeek} min
            </div>
            <div className="text-xs text-tier-navy/40 mt-0.5">
              {stats.maxSessionsInWeek} sessions
            </div>
          </div>
          <div className="p-3 bg-tier-navy/5 rounded-lg">
            <div className="text-xs text-tier-navy/60 mb-1">Avg Weekly Load</div>
            <div className="text-xl font-bold text-tier-navy">
              {Math.round(stats.avgMinutesPerWeek)} min
            </div>
            <div className="text-xs text-tier-navy/40 mt-0.5">
              {stats.avgSessionsPerWeek} sessions
            </div>
          </div>
        </div>
      </Card>

      {/* Phase Distribution */}
      {Object.keys(stats.phaseBreakdown).length > 0 && (
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-tier-navy mb-3">Learning Phase Distribution</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.phaseBreakdown)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([phase, count]) => (
                <div key={phase} className="flex items-center gap-2 px-3 py-2 bg-tier-navy/5 rounded-lg">
                  <Badge variant="secondary">{phase}</Badge>
                  <span className="text-sm text-tier-navy">
                    {count} {count === 1 ? 'session' : 'sessions'}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Summary */}
      <Card className="p-6 bg-tier-gold/10 border-tier-gold/30">
        <h4 className="text-sm font-semibold text-tier-navy mb-2">Summary</h4>
        <p className="text-sm text-tier-navy/70 leading-relaxed">
          This <strong>{template.durationWeeks}-week</strong> template includes{' '}
          <strong>{stats.totalSessions} training sessions</strong> totaling{' '}
          <strong>{stats.totalHours} hours</strong> of practice. Athletes will train an average of{' '}
          <strong>{stats.avgSessionsPerWeek} sessions per week</strong>, with each session lasting approximately{' '}
          <strong>{stats.avgSessionDuration} minutes</strong>.
          {stats.totalExercises > 0 && (
            <> The template includes <strong>{stats.totalExercises} specific exercises</strong> across {stats.sessionsWithExercises} sessions.</>
          )}
        </p>
      </Card>
    </div>
  );
}

export default TemplateStatisticsPanel;
