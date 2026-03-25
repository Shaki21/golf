/**
 * useTemplatePeriodPlanning Hook
 * Manages period planning, load calculations, and macro-level metrics
 */

import { useState, useMemo, useCallback } from 'react';
import { addWeeks, addDays, startOfWeek, endOfWeek, format } from 'date-fns';
import {
  TrainingPlanTemplate,
  TemplateSession,
  TemplatePeriod,
  WeeklyMetrics,
  PeriodMetrics,
  MacroPlanData,
  PeriodType
} from '../types/template.types';

interface UseTemplatePeriodPlanningProps {
  template: TrainingPlanTemplate;
  startDate?: string;
  initialPeriods?: TemplatePeriod[];
}

interface UseTemplatePeriodPlanningReturn {
  periods: TemplatePeriod[];
  weeklyMetrics: WeeklyMetrics[];
  periodMetrics: PeriodMetrics[];
  macroPlanData: MacroPlanData;
  addPeriod: (period: Omit<TemplatePeriod, 'id'>) => void;
  updatePeriod: (periodId: string, updates: Partial<TemplatePeriod>) => void;
  deletePeriod: (periodId: string) => void;
  getPeriodForWeek: (weekNumber: number) => TemplatePeriod | undefined;
  calculateLoadScore: (minutes: number, sessionCount: number) => number;
}

// Period type color mapping
export const PERIOD_COLORS: Record<PeriodType, string> = {
  preparation: '#9333ea',   // Purple
  base: '#f59e0b',          // Orange
  build: '#10b981',         // Emerald
  competition: '#fbbf24',   // Amber
  taper: '#06b6d4',         // Cyan
  recovery: '#8b5cf6',      // Violet
  transition: '#6b7280'     // Gray
};

export function useTemplatePeriodPlanning({
  template,
  startDate = new Date().toISOString().split('T')[0],
  initialPeriods = []
}: UseTemplatePeriodPlanningProps): UseTemplatePeriodPlanningReturn {
  const [periods, setPeriods] = useState<TemplatePeriod[]>(initialPeriods);

  // Calculate base start date
  const baseStartDate = useMemo(() => {
    return startOfWeek(new Date(startDate), { weekStartsOn: 1 }); // Monday
  }, [startDate]);

  // Calculate load score (0-100) based on minutes and session count
  const calculateLoadScore = useCallback((minutes: number, sessionCount: number): number => {
    // Normalize: ~420 min/week (7 days × 60 min) = 100% load
    // Also factor in session density
    const minutesScore = Math.min(100, (minutes / 420) * 100);
    const sessionScore = Math.min(100, (sessionCount / 7) * 100); // 7 sessions/week = max

    // Weighted average: 70% minutes, 30% session count
    return Math.round(minutesScore * 0.7 + sessionScore * 0.3);
  }, []);

  // Calculate weekly metrics
  const weeklyMetrics = useMemo((): WeeklyMetrics[] => {
    const metrics: WeeklyMetrics[] = [];

    for (let week = 1; week <= template.durationWeeks; week++) {
      const weekStart = addWeeks(baseStartDate, week - 1);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

      // Filter sessions for this week
      const weekSessions = template.sessions.filter(s => s.weekNumber === week);

      // Calculate totals
      const totalMinutes = weekSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      const sessionCount = weekSessions.length;
      const avgSessionDuration = sessionCount > 0 ? totalMinutes / sessionCount : 0;

      // Category breakdown
      const categoryBreakdown: Record<string, { minutes: number; sessions: number; percentage: number }> = {};
      weekSessions.forEach(session => {
        session.categories.forEach(cat => {
          if (!categoryBreakdown[cat]) {
            categoryBreakdown[cat] = { minutes: 0, sessions: 0, percentage: 0 };
          }
          categoryBreakdown[cat].minutes += session.durationMinutes;
          categoryBreakdown[cat].sessions += 1;
        });
      });

      // Calculate percentages
      Object.keys(categoryBreakdown).forEach(cat => {
        categoryBreakdown[cat].percentage = totalMinutes > 0
          ? Math.round((categoryBreakdown[cat].minutes / totalMinutes) * 100)
          : 0;
      });

      // Days with sessions
      const daysWithSessions = new Set(weekSessions.map(s => s.dayOfWeek)).size;

      // Load score
      const loadScore = calculateLoadScore(totalMinutes, sessionCount);

      // Find associated period
      const period = periods.find(p => week >= p.startWeek && week <= p.endWeek);

      metrics.push({
        weekNumber: week,
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        totalMinutes,
        sessionCount,
        avgSessionDuration,
        categoryBreakdown,
        daysWithSessions,
        loadScore,
        periodId: period?.id
      });
    }

    return metrics;
  }, [template, baseStartDate, periods, calculateLoadScore]);

  // Calculate period-level metrics
  const periodMetrics = useMemo((): PeriodMetrics[] => {
    return periods.map(period => {
      // Filter weeks for this period
      const periodWeeks = weeklyMetrics.filter(
        w => w.weekNumber >= period.startWeek && w.weekNumber <= period.endWeek
      );

      const weekCount = periodWeeks.length;
      const totalMinutes = periodWeeks.reduce((sum, w) => sum + w.totalMinutes, 0);
      const totalSessions = periodWeeks.reduce((sum, w) => sum + w.sessionCount, 0);

      // Average metrics
      const avgMinutesPerWeek = weekCount > 0 ? totalMinutes / weekCount : 0;
      const avgSessionsPerWeek = weekCount > 0 ? totalSessions / weekCount : 0;
      const avgLoadScore = weekCount > 0
        ? periodWeeks.reduce((sum, w) => sum + w.loadScore, 0) / weekCount
        : 0;

      // Category breakdown aggregation
      const categoryBreakdown: Record<string, { minutes: number; sessions: number; percentage: number }> = {};
      periodWeeks.forEach(week => {
        Object.entries(week.categoryBreakdown).forEach(([cat, data]) => {
          if (!categoryBreakdown[cat]) {
            categoryBreakdown[cat] = { minutes: 0, sessions: 0, percentage: 0 };
          }
          categoryBreakdown[cat].minutes += data.minutes;
          categoryBreakdown[cat].sessions += data.sessions;
        });
      });

      // Calculate percentages
      Object.keys(categoryBreakdown).forEach(cat => {
        categoryBreakdown[cat].percentage = totalMinutes > 0
          ? Math.round((categoryBreakdown[cat].minutes / totalMinutes) * 100)
          : 0;
      });

      // Find peak and lowest weeks
      const sortedByLoad = [...periodWeeks].sort((a, b) => b.loadScore - a.loadScore);
      const peakWeek = sortedByLoad[0] || { weekNumber: period.startWeek, totalMinutes: 0, loadScore: 0 };
      const lowestWeek = sortedByLoad[sortedByLoad.length - 1] || { weekNumber: period.startWeek, totalMinutes: 0, loadScore: 0 };

      return {
        periodId: period.id,
        periodType: period.type,
        weekCount,
        totalMinutes,
        totalSessions,
        avgMinutesPerWeek,
        avgSessionsPerWeek,
        avgLoadScore,
        categoryBreakdown,
        peakWeek: {
          weekNumber: peakWeek.weekNumber,
          minutes: peakWeek.totalMinutes,
          loadScore: peakWeek.loadScore
        },
        lowestWeek: {
          weekNumber: lowestWeek.weekNumber,
          minutes: lowestWeek.totalMinutes,
          loadScore: lowestWeek.loadScore
        }
      };
    });
  }, [periods, weeklyMetrics]);

  // Macro plan data aggregation
  const macroPlanData = useMemo((): MacroPlanData => {
    const totalMinutes = weeklyMetrics.reduce((sum, w) => sum + w.totalMinutes, 0);
    const totalSessions = weeklyMetrics.reduce((sum, w) => sum + w.sessionCount, 0);
    const avgWeeklyMinutes = template.durationWeeks > 0 ? totalMinutes / template.durationWeeks : 0;
    const avgWeeklySessions = template.durationWeeks > 0 ? totalSessions / template.durationWeeks : 0;

    return {
      template,
      periods,
      weeklyMetrics,
      periodMetrics,
      totalLoad: {
        totalMinutes,
        totalSessions,
        avgWeeklyMinutes,
        avgWeeklySessions
      }
    };
  }, [template, periods, weeklyMetrics, periodMetrics]);

  // Add period
  const addPeriod = useCallback((periodData: Omit<TemplatePeriod, 'id'>) => {
    const newPeriod: TemplatePeriod = {
      ...periodData,
      id: `period-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      color: periodData.color || PERIOD_COLORS[periodData.type]
    };
    setPeriods(prev => [...prev, newPeriod]);
  }, []);

  // Update period
  const updatePeriod = useCallback((periodId: string, updates: Partial<TemplatePeriod>) => {
    setPeriods(prev =>
      prev.map(p => (p.id === periodId ? { ...p, ...updates } : p))
    );
  }, []);

  // Delete period
  const deletePeriod = useCallback((periodId: string) => {
    setPeriods(prev => prev.filter(p => p.id !== periodId));
  }, []);

  // Get period for specific week
  const getPeriodForWeek = useCallback((weekNumber: number): TemplatePeriod | undefined => {
    return periods.find(p => weekNumber >= p.startWeek && weekNumber <= p.endWeek);
  }, [periods]);

  return {
    periods,
    weeklyMetrics,
    periodMetrics,
    macroPlanData,
    addPeriod,
    updatePeriod,
    deletePeriod,
    getPeriodForWeek,
    calculateLoadScore
  };
}

export default useTemplatePeriodPlanning;
