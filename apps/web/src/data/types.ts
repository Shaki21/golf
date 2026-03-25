/**
 * Data Types
 * Type definitions for API responses and UI data
 * Maps to StatsGridTemplate, CalendarTemplate, and page components
 */

// ═══════════════════════════════════════════
// COMMON TYPES
// ═══════════════════════════════════════════

export interface HookResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// ═══════════════════════════════════════════
// DASHBOARD TYPES
// ═══════════════════════════════════════════

export interface DashboardSession {
  id: string;
  title: string;
  start: string;
  end: string;
  status: 'planned' | 'completed' | 'in_progress';
}

export interface DashboardStatsItem {
  id: string;
  label: string;
  value: string | number;
  sublabel?: string;
  change?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

export interface DashboardData {
  sessions: DashboardSession[];
  stats: DashboardStatsItem[];
}

// ═══════════════════════════════════════════
// CALENDAR TYPES
// ═══════════════════════════════════════════

export interface CalendarSession {
  id: string;
  title: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  date: string; // "YYYY-MM-DD"
  meta?: string; // session type: training, tournament, test, session
}

export interface CalendarData {
  sessions: CalendarSession[];
}

// ═══════════════════════════════════════════
// GOALS TYPES
// ═══════════════════════════════════════════

export interface Goal {
  id: string;
  title: string;
  description?: string;
  current: number;
  target: number;
  unit: string;
  status: 'active' | 'completed' | 'paused';
  type: 'short' | 'long';
}

export interface GoalsStatsItem {
  id: string;
  label: string;
  value: string | number;
  sublabel?: string;
  change?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

export interface GoalsData {
  goals: Goal[];
  stats: GoalsStatsItem[];
}

// ═══════════════════════════════════════════
// STATS TYPES
// ═══════════════════════════════════════════

export interface StatsKpiItem {
  id: string;
  label: string;
  value: string | number;
  sublabel?: string;
  change?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

export interface StatsOverviewItem {
  id: string;
  label: string;
  value: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

export interface RecentSession {
  id: string;
  title: string;
  date: string;
  duration: string;
  type: string;
}

export interface StatsData {
  kpis: StatsKpiItem[];
  overview: StatsOverviewItem[];
  recentSessions: RecentSession[];
}

// ═══════════════════════════════════════════
// API RESPONSE TYPES (from backend)
// Aligned with backend Fastify routes and Prisma schema
// ═══════════════════════════════════════════

export interface ApiDashboardResponse {
  player: {
    firstName: string;
    lastName: string;
    category: string;
    profileImageUrl?: string;
    totalXP?: number;
  };
  period: string;
  todaySessions: Array<{
    id: string;
    title: string;
    time: string;
    duration: number;
    status: string;
    sessionType?: string;
    meta?: string;
  }>;
  weeklyStats?: {
    stats: Array<{
      id: string;
      value: number | string;
      label: string;
    }>;
    streak?: number;
  };
  goals: Array<{
    id: string;
    title: string;
    progress: number;
    variant?: string;
  }>;
  badges: Array<{
    id: string;
    name: string;
    code: string;
    icon: string;
  }>;
  messages: Array<{
    id: string;
    senderName: string;
    preview: string;
    time: string;
    unread: boolean;
    isGroup: boolean;
  }>;
  unreadCount: number;
}

export interface ApiCalendarResponse {
  events: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    date: string;
    type?: string;
  }>;
}

export interface ApiGoalsResponse {
  goals: Array<{
    id: string;
    title: string;
    description?: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    status: string;
    goalType: string;
  }>;
  stats?: {
    active: number;
    completed: number;
    averageProgress: number;
  };
}

export interface ApiStatsResponse {
  kpis: Array<{
    id: string;
    label: string;
    value: number | string;
    sublabel?: string;
    changeValue?: string;
    changeDirection?: string;
  }>;
  overview: Array<{
    id: string;
    label: string;
    value: string;
    trend?: string;
  }>;
  recentSessions: Array<{
    id: string;
    title: string;
    date: string;
    durationMinutes: number;
    sessionType: string;
  }>;
}
