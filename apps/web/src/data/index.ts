/**
 * Data Layer
 * Central exports for API client, types, and hooks
 */

// API Client
export { apiGet, apiPost, apiPut, apiDelete, apiClient } from './apiClient';

// Types
export type {
  HookResult,
  DashboardData,
  DashboardSession,
  DashboardStatsItem,
  CalendarSession,
  CalendarData,
  Goal,
  GoalsData,
  GoalsStatsItem,
  StatsData,
  StatsKpiItem,
  StatsOverviewItem,
  RecentSession,
} from './types';

// Hooks
export { useDashboardData } from './hooks/useDashboardData';
export { useCalendarSessions } from './hooks/useCalendarSessions';
export { useGoals } from './hooks/useGoals';
export { useStats } from './hooks/useStats';
