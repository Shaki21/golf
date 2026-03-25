/**
 * ================================================================
 * Dashboard API Schema - AK Golf Academy
 * ================================================================
 */

import { z } from 'zod';

// ============================================================================
// Dashboard Response Schemas
// ============================================================================

export const PeriodInfoSchema = z.object({
  type: z.enum(['E', 'G', 'S', 'T']),
  number: z.number(),
  name: z.string(),
  focusAreas: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string().nullable(),
});

export const SessionSchema = z.object({
  id: z.string().uuid(),
  time: z.string(),
  title: z.string(),
  meta: z.string(),
  tags: z.array(z.string()),
  status: z.enum(['completed', 'current', 'upcoming']),
  duration: z.number(),
  sessionType: z.string(),
});

export const BadgeSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  icon: z.string(),
  tier: z.enum(['gold', 'silver', 'bronze', 'platinum']),
  earnedAt: z.string(),
});

export const GoalSchema = z.object({
  id: z.string().uuid(),
  icon: z.string(),
  title: z.string(),
  deadline: z.string(),
  progress: z.number(),
  variant: z.enum(['primary', 'success', 'warning', 'error', 'gold']).optional(),
});

export const StatSchema = z.object({
  id: z.string().optional(),
  value: z.union([z.string(), z.number()]),
  label: z.string(),
  change: z.number().optional(),
  changeUnit: z.string().optional(),
});

export const WeeklyStatsSchema = z.object({
  period: z.string(),
  weekNumber: z.number(),
  year: z.number(),
  stats: z.array(StatSchema),
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  senderName: z.string(),
  avatarInitials: z.string().optional(),
  avatarUrl: z.string().optional(),
  avatarColor: z.string().optional(),
  isGroup: z.boolean().default(false),
  preview: z.string(),
  time: z.string(),
  unread: z.boolean().default(false),
});

export const TournamentEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  date: z.string(),
  location: z.string(),
  type: z.string(),
});

export const TestEventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  date: z.string(),
  location: z.string().optional(),
});

export const BreakingPointSummarySchema = z.object({
  id: z.string().uuid(),
  area: z.string(),
  title: z.string(),
  status: z.enum(['identified', 'working', 'resolved']),
  priority: z.enum(['high', 'medium', 'low']),
  progress: z.number(),
});

export const RecentTestResultSchema = z.object({
  id: z.string().uuid(),
  testId: z.string().uuid(),
  name: z.string(),
  date: z.string(),
  score: z.number(),
  improvement: z.number().optional(),
});

export const DashboardResponseSchema = z.object({
  player: z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    category: z.string(),
    averageScore: z.number().nullable(),
    profileImageUrl: z.string().nullable(),
  }),
  period: PeriodInfoSchema,
  todaySessions: z.array(SessionSchema),
  badges: z.array(BadgeSchema),
  goals: z.array(GoalSchema),
  weeklyStats: WeeklyStatsSchema,
  messages: z.array(MessageSchema),
  unreadCount: z.number(),
  nextTournament: TournamentEventSchema.nullable(),
  nextTest: TestEventSchema.nullable(),
  breakingPoints: z.array(BreakingPointSummarySchema),
  recentTests: z.array(RecentTestResultSchema),
});

// ============================================================================
// Query Schemas
// ============================================================================

export const DashboardQuerySchema = z.object({
  date: z.string().optional().describe('Date in YYYY-MM-DD format, defaults to today'),
});

// ============================================================================
// Types
// ============================================================================

export type PeriodInfo = z.infer<typeof PeriodInfoSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type Badge = z.infer<typeof BadgeSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type Stat = z.infer<typeof StatSchema>;
export type WeeklyStats = z.infer<typeof WeeklyStatsSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type TournamentEvent = z.infer<typeof TournamentEventSchema>;
export type TestEvent = z.infer<typeof TestEventSchema>;
export type BreakingPointSummary = z.infer<typeof BreakingPointSummarySchema>;
export type RecentTestResult = z.infer<typeof RecentTestResultSchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;
