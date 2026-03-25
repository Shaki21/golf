/**
 * Team Analytics Types
 * Type definitions for team analytics data
 */

export interface TeamMetrics {
  totalPlayers: number;
  activeThisWeek: number;
  averageSessionsPerWeek: number;
  totalSessionsThisMonth: number;
  averageGoalCompletion: number;
  playersNeedingAttention: number;
}

export interface PerformanceTrend {
  date: string; // ISO date string
  averageScore: number;
  sessionCount: number;
  activePlayerCount: number;
}

export interface PlayerComparison {
  playerId: string;
  playerName: string;
  sessionsThisMonth: number;
  averageSessionDuration: number; // minutes
  goalsCompleted: number;
  goalsTotal: number;
  lastSessionDate: string | null;
  performanceScore: number; // 0-100
  category: 'A' | 'B' | 'C' | null;
}

export interface TrainingLoad {
  weekStart: string; // ISO date string
  totalHours: number;
  sessionCount: number;
  averageIntensity: number; // 0-10
  playerCount: number;
}

export interface TeamAnalyticsData {
  metrics: TeamMetrics;
  performanceTrends: PerformanceTrend[];
  playerComparisons: PlayerComparison[];
  trainingLoad: TrainingLoad[];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface TeamAnalyticsFilters {
  timeRange: '7d' | '30d' | '90d' | '1y';
  playerCategory?: 'A' | 'B' | 'C';
  includeInactive?: boolean;
}
