/**
 * useDashboard Hook
 * Fetches and manages dashboard data from API
 * TypeScript version with proper types
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

// =============================================================================
// Types
// =============================================================================

export interface DashboardPlayer {
  name: string;
  category: string;
  avatarUrl?: string;
}

export interface DashboardStats {
  sessionsCompleted: number;
  sessionsTotal: number;
  hoursThisWeek: number;
  hoursGoal: number;
  streak: number;
}

export interface CalendarEvent {
  id: string | number;
  title: string;
  startTime: string;
  endTime: string;
  type: 'training' | 'meeting';
  location: string;
  sessionId?: string | number;
}

export interface UpcomingSession {
  id: string | number;
  title: string;
  time: string;
  location: string;
  duration: number;
  status?: string;
}

export interface DashboardTask {
  id: string | number;
  title: string;
  area?: string;
  completed: boolean;
  priority: 'high' | 'normal' | 'low';
}

export interface DashboardMessage {
  id: string | number;
  from: string;
  preview: string;
  time: string;
  read: boolean;
  isGroup?: boolean;
}

export interface DashboardAchievement {
  id: string | number;
  icon?: string | null;
  iconEmoji?: string;
  title: string;
  description: string;
}

export interface DashboardNotification {
  id: string | number;
  type: string;
  title: string;
  message: string;
  time: string;
}

export interface UpcomingEvent {
  title: string;
  date: string;
  location: string;
}

export interface DashboardData {
  player: DashboardPlayer;
  period?: string;
  stats: DashboardStats;
  calendarEvents: CalendarEvent[];
  upcomingSessions: UpcomingSession[];
  tasks: DashboardTask[];
  messages: DashboardMessage[];
  achievements: DashboardAchievement[];
  notifications: DashboardNotification[];
  nextTournament?: UpcomingEvent;
  nextTest?: UpcomingEvent;
  breakingPoints?: unknown[];
  recentTests?: unknown[];
  weather?: unknown;
  performance?: unknown;
  xp: number;
  totalXp: number;
  level: number;
  nextLevelXp: number;
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// API Response types (what we get from the server)
interface ApiSession {
  id: string | number;
  title: string;
  time: string;
  duration: number;
  sessionType?: string;
  status?: string;
  meta?: string;
}

interface ApiBadge {
  id: string | number;
  icon: string;
  name: string;
  code: string;
}

interface ApiGoal {
  id: string | number;
  title: string;
  progress: number;
  variant?: string;
}

interface ApiMessage {
  id: string | number;
  senderName: string;
  preview: string;
  time: string;
  unread: boolean;
  isGroup?: boolean;
}

interface ApiPlayer {
  firstName: string;
  lastName: string;
  category: string;
  profileImageUrl?: string;
  totalXP?: number;
}

interface ApiWeeklyStats {
  stats?: Array<{ id: string; value: number | string }>;
  streak?: number;
}

interface ApiDashboardResponse {
  player: ApiPlayer;
  period?: string;
  todaySessions: ApiSession[];
  badges: ApiBadge[];
  goals: ApiGoal[];
  weeklyStats?: ApiWeeklyStats;
  messages: ApiMessage[];
  unreadCount?: number;
  nextTournament?: UpcomingEvent;
  nextTest?: UpcomingEvent;
  breakingPoints?: unknown[];
  recentTests?: unknown[];
  streak?: number;
  gamification?: {
    totalXP?: number;
    currentLevel?: number;
  };
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useDashboard(date: Date | null = null): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = date ? { date: date.toISOString().split('T')[0] } : {};
      const response = await apiClient.get<ApiDashboardResponse>('/dashboard', { params });

      // Transform API response to match component expectations
      const dashboardData = transformApiResponse(response.data);
      setData(dashboardData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Could not load dashboard';
      setError(errorMessage);

      // Use fallback demo data on error
      setData(getFallbackData());
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const refetch = () => {
    fetchDashboard();
  };

  return { data, loading, error, refetch };
}

// =============================================================================
// Transform Functions
// =============================================================================

function transformApiResponse(apiData: ApiDashboardResponse): DashboardData {
  const { player, period, todaySessions, badges, goals, weeklyStats, messages, nextTournament, nextTest, breakingPoints, recentTests } = apiData;

  // Transform sessions to calendar events format
  const calendarEvents: CalendarEvent[] = todaySessions.map(session => ({
    id: session.id,
    title: session.title,
    startTime: session.time,
    endTime: calculateEndTime(session.time, session.duration),
    type: session.sessionType === 'training' ? 'training' : 'meeting',
    location: session.meta?.split(' - ')[1] || 'TIER Golf',
    sessionId: session.id,
  }));

  // Transform upcoming sessions
  const upcomingSessions: UpcomingSession[] = todaySessions.map(session => ({
    id: session.id,
    title: session.title,
    time: session.time,
    location: session.meta?.split(' - ')[1] || 'TIER Golf',
    duration: session.duration,
    status: session.status,
  }));

  // Transform stats
  const stats = weeklyStats?.stats || [];
  const sessionsStats = stats.find(s => s.id === 'sessions');
  const hoursStats = stats.find(s => s.id === 'hours');

  const trainingStats: DashboardStats = {
    sessionsCompleted: typeof sessionsStats?.value === 'number' ? sessionsStats.value : 0,
    sessionsTotal: 12, // Default weekly goal
    hoursThisWeek: typeof hoursStats?.value === 'string' ? parseFloat(hoursStats.value) : (hoursStats?.value as number) || 0,
    hoursGoal: 20, // Default weekly goal
    streak: weeklyStats?.streak || apiData.streak || 0,
  };

  // Transform messages
  const transformedMessages: DashboardMessage[] = messages.map(msg => ({
    id: msg.id,
    from: msg.senderName,
    preview: msg.preview,
    time: msg.time,
    read: !msg.unread,
    isGroup: msg.isGroup,
  }));

  // Transform badges to achievements
  const achievements: DashboardAchievement[] = badges.map(badge => ({
    id: badge.id,
    icon: null,
    iconEmoji: badge.icon,
    title: badge.name,
    description: badge.code,
  }));

  // Transform goals to tasks
  const tasks: DashboardTask[] = goals.map(goal => ({
    id: goal.id,
    title: goal.title,
    area: 'Goals',
    completed: goal.progress >= 100,
    priority: goal.variant === 'error' ? 'high' : 'normal',
  }));

  // Create notifications from various sources
  const notifications: DashboardNotification[] = [];
  if (badges.length > 0) {
    notifications.push({
      id: `badge-${badges[0].id}`,
      type: 'achievement',
      title: 'New achievement!',
      message: `${badges[0].icon} ${badges[0].name}`,
      time: 'Recently',
    });
  }

  // XP and level data
  const gamification = apiData.gamification || {};
  const totalXp = gamification.totalXP || player.totalXP || 0;
  const currentLevel = gamification.currentLevel || Math.floor(Math.sqrt(totalXp / 50)) + 1;
  const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 50;
  const xpForNextLevel = Math.pow(currentLevel, 2) * 50;
  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;

  const fallback = getFallbackData();

  return {
    player: {
      name: `${player.firstName} ${player.lastName}`,
      category: player.category,
      avatarUrl: player.profileImageUrl,
    },
    period,
    stats: trainingStats,
    calendarEvents,
    upcomingSessions,
    tasks: tasks.length > 0 ? tasks : fallback.tasks,
    messages: transformedMessages.length > 0 ? transformedMessages : fallback.messages,
    achievements: achievements.length > 0 ? achievements : fallback.achievements,
    notifications: notifications.length > 0 ? notifications : fallback.notifications,
    nextTournament: nextTournament || fallback.nextTournament,
    nextTest: nextTest || fallback.nextTest,
    breakingPoints: breakingPoints || [],
    recentTests: recentTests && recentTests.length > 0 ? recentTests : fallback.recentTests,
    weather: fallback.weather,
    performance: fallback.performance,
    xp: xpInLevel,
    totalXp,
    level: currentLevel,
    nextLevelXp: xpNeededForNext,
  };
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

// =============================================================================
// Fallback Data
// =============================================================================

function getFallbackData(): DashboardData {
  return {
    player: {
      name: 'Demo Player',
      category: 'B',
    },
    stats: {
      sessionsCompleted: 8,
      sessionsTotal: 12,
      hoursThisWeek: 14.5,
      hoursGoal: 20,
      streak: 7,
    },
    nextTournament: {
      title: 'National Championship 2026',
      date: '2026-06-15',
      location: 'Miklagard Golf',
    },
    nextTest: {
      title: 'Category Test Q1',
      date: '2026-01-20',
      location: 'TIER Golf',
    },
    tasks: [
      { id: 1, title: 'Review swing video', area: 'Technique', completed: true, priority: 'normal' },
      { id: 2, title: '100 putts under 2 meters', area: 'Putting', completed: false, priority: 'high' },
      { id: 3, title: 'Log nutrition for the week', area: 'Physical', completed: false, priority: 'normal' },
      { id: 4, title: 'Mental preparation - visualization', area: 'Mental', completed: false, priority: 'normal' },
    ],
    messages: [
      { id: 1, from: 'Anders Kristiansen', preview: 'Hi! Can we go through the training plan?', time: '10 min', read: false, isGroup: false },
      { id: 2, from: 'Team Norway Juniors', preview: 'Training camp next week - registration open', time: '1h', read: false, isGroup: true },
      { id: 3, from: 'Mental Coach', preview: 'Great job with the visualization!', time: '3h', read: true, isGroup: false },
    ],
    achievements: [
      { id: 1, icon: 'flame', title: '7-day streak', description: 'Trained 7 days in a row' },
      { id: 2, icon: 'target', title: 'Precise putter', description: '50 putts in a row within 1m' },
      { id: 3, icon: 'dumbbell', title: 'Iron will', description: 'Completed 100 sessions' },
    ],
    notifications: [
      { id: 1, type: 'goal', title: 'Goal updated', message: 'You have reached 75% of your swing speed goal!', time: '10 min ago' },
      { id: 2, type: 'session', title: 'New session assigned', message: 'Your coach has added "Mental exercises" to the calendar', time: '1h ago' },
    ],
    calendarEvents: [
      { id: 1, title: 'Putting Drills', startTime: '08:00', endTime: '09:30', type: 'training', location: 'Indoor Range' },
      { id: 2, title: 'Coach meeting', startTime: '10:00', endTime: '10:30', type: 'meeting', location: 'Clubhouse' },
      { id: 3, title: 'Long game - Driver', startTime: '13:00', endTime: '15:00', type: 'training', location: 'Driving Range' },
    ],
    upcomingSessions: [
      { id: 1, title: 'Putting Drills', time: '08:00', location: 'Indoor Range', duration: 90 },
      { id: 2, title: 'Long game - Driver', time: '13:00', location: 'Driving Range', duration: 120 },
    ],
    recentTests: [],
    xp: 350,
    totalXp: 850,
    level: 5,
    nextLevelXp: 500,
  };
}

export default useDashboard;
