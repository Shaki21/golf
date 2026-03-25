/**
 * useDagbokHeatmap Hook
 *
 * Computes weekly heatmap data from sessions.
 * 7 rows (Mon-Sun) x 5 columns (FYS/TEK/SLAG/SPILL/TURN)
 */

import { useMemo } from 'react';

import type {
  DagbokSession,
  WeeklyHeatmapData,
  HeatmapCell,
  Pyramid,
} from '../types';

import {
  getHeatmapIntensity,
  HEATMAP_PYRAMID_ORDER,
  DAY_NAMES_FULL,
} from '../constants';

// =============================================================================
// HELPERS
// =============================================================================

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getDayIndex(dateStr: string): number {
  // Returns 0-6 where 0 = Monday
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

// =============================================================================
// HOOK
// =============================================================================

export interface UseDagbokHeatmapResult {
  heatmapData: WeeklyHeatmapData;
}

export function useDagbokHeatmap(
  sessions: DagbokSession[],
  anchorDate: Date
): UseDagbokHeatmapResult {
  const heatmapData = useMemo<WeeklyHeatmapData>(() => {
    const weekStart = getWeekStart(anchorDate);
    const weekEnd = getWeekEnd(anchorDate);
    const weekNumber = getWeekNumber(anchorDate);
    const year = anchorDate.getFullYear();

    // Initialize cell matrix: 7 days x 5 pyramids
    const cellMatrix: Record<string, HeatmapCell> = {};

    // Initialize all cells to zero
    for (let day = 0; day < 7; day++) {
      for (const pyramid of HEATMAP_PYRAMID_ORDER) {
        const key = `${day}-${pyramid}`;
        cellMatrix[key] = {
          day,
          pyramid,
          minutes: 0,
          sessions: 0,
          intensity: 0,
          plannedMinutes: 0,
          complianceRate: 0,
        };
      }
    }

    // Daily totals
    const dailyTotals: { day: number; dayName: string; minutes: number; sessions: number }[] = [];
    for (let day = 0; day < 7; day++) {
      dailyTotals.push({
        day,
        dayName: DAY_NAMES_FULL[day],
        minutes: 0,
        sessions: 0,
      });
    }

    // Pyramid totals
    const pyramidTotals: Record<Pyramid, { minutes: number; sessions: number }> = {
      FYS: { minutes: 0, sessions: 0 },
      TEK: { minutes: 0, sessions: 0 },
      SLAG: { minutes: 0, sessions: 0 },
      SPILL: { minutes: 0, sessions: 0 },
      TURN: { minutes: 0, sessions: 0 },
    };

    // Process sessions
    let totalMinutes = 0;
    let totalSessions = 0;

    for (const session of sessions) {
      const dayIndex = getDayIndex(session.date);
      const pyramid = session.pyramid;

      // Skip if outside week or invalid pyramid
      if (dayIndex < 0 || dayIndex > 6) continue;
      if (!HEATMAP_PYRAMID_ORDER.includes(pyramid)) continue;

      const key = `${dayIndex}-${pyramid}`;
      const cell = cellMatrix[key];

      cell.minutes += session.duration;
      cell.sessions++;
      if (session.isPlanned) {
        cell.plannedMinutes += session.duration;
      }

      // Update daily totals
      dailyTotals[dayIndex].minutes += session.duration;
      dailyTotals[dayIndex].sessions++;

      // Update pyramid totals
      pyramidTotals[pyramid].minutes += session.duration;
      pyramidTotals[pyramid].sessions++;

      // Update overall totals
      totalMinutes += session.duration;
      totalSessions++;
    }

    // Compute intensity levels for each cell
    const cells: HeatmapCell[] = [];
    for (let day = 0; day < 7; day++) {
      for (const pyramid of HEATMAP_PYRAMID_ORDER) {
        const key = `${day}-${pyramid}`;
        const cell = cellMatrix[key];

        // Compute intensity based on minutes
        cell.intensity = getHeatmapIntensity(cell.minutes);

        // Compute compliance (if planned, how much was done)
        if (cell.plannedMinutes > 0) {
          cell.complianceRate = Math.min(100, Math.round((cell.minutes / cell.plannedMinutes) * 100));
        } else {
          cell.complianceRate = cell.minutes > 0 ? 100 : 0;
        }

        cells.push(cell);
      }
    }

    // Average minutes per day (counting only days with sessions)
    const daysWithSessions = dailyTotals.filter(d => d.sessions > 0).length;
    const avgMinutesPerDay = daysWithSessions > 0
      ? Math.round(totalMinutes / daysWithSessions)
      : 0;

    return {
      weekNumber,
      year,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      cells,
      dailyTotals,
      pyramidTotals,
      totalMinutes,
      totalSessions,
      avgMinutesPerDay,
    };
  }, [sessions, anchorDate]);

  return { heatmapData };
}

export default useDagbokHeatmap;
