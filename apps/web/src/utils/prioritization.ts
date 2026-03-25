/**
 * Prioritization Algorithm
 *
 * Determines what training session should be shown to the user today.
 * Uses a priority system based on goal status and scheduled sessions.
 *
 * Priority Order:
 * 1. At-risk goals with sessions due today
 * 2. On-track goals with sessions due today
 * 3. Recommended sessions based on recent performance
 * 4. Any planned session for today
 */

// =============================================================================
// TYPES
// =============================================================================

export type GoalStatus = 'at-risk' | 'behind' | 'on-track' | 'ahead' | 'completed';
export type SessionPriority = 1 | 2 | 3;

export interface Goal {
  id: string;
  name: string;
  status: GoalStatus;
  currentProgress: number;
  targetProgress: number;
  unit: string;
  sessionsBehind?: number;
  riskScore?: number; // 0-100, higher = more at risk
  deadline?: Date;
  recommendedExerciseId?: string;
  recommendedExerciseName?: string;
}

export interface PlannedSession {
  id: string;
  title: string;
  type: 'exercise' | 'test' | 'round';
  scheduledDate: Date;
  estimatedDuration: number; // minutes
  goalId?: string;
  category?: string;
  description?: string;
}

export interface TodaySession {
  id: string;
  type: 'exercise' | 'test' | 'round';
  title: string;
  time?: string;
  goalConnection?: {
    goalId: string;
    goalName: string;
    status: GoalStatus;
  };
  estimatedDuration: number;
  priority: SessionPriority;
  reason: string;
  actionHref: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export interface TodayState {
  primarySession: TodaySession | null;
  secondarySessions: TodaySession[];
  completedToday: number;
  plannedToday: number;
  isEmpty: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Calculate risk score for a goal
 * Higher score = more urgent
 */
export function calculateRiskScore(goal: Goal): number {
  let score = 0;

  // Base score from status
  const statusScores: Record<GoalStatus, number> = {
    'at-risk': 80,
    'behind': 60,
    'on-track': 30,
    'ahead': 10,
    'completed': 0,
  };
  score += statusScores[goal.status] || 0;

  // Add points for sessions behind
  if (goal.sessionsBehind && goal.sessionsBehind > 0) {
    score += Math.min(goal.sessionsBehind * 10, 30);
  }

  // Add points if deadline is approaching
  if (goal.deadline) {
    const daysUntilDeadline = Math.ceil(
      (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDeadline <= 7) {
      score += 20;
    } else if (daysUntilDeadline <= 14) {
      score += 10;
    }
  }

  // Cap at 100
  return Math.min(score, 100);
}

/**
 * Generate priority reason message
 */
function generateReason(goal: Goal | null, priority: SessionPriority): string {
  if (!goal) {
    return 'Recommended for you today';
  }

  switch (priority) {
    case 1:
      if (goal.sessionsBehind && goal.sessionsBehind > 0) {
        return `You're ${goal.sessionsBehind} ${goal.sessionsBehind === 1 ? 'session' : 'sessions'} behind on ${goal.name.toLowerCase()}`;
      }
      return `Urgent: ${goal.name} needs attention`;
    case 2:
      return `Scheduled session to stay on track with ${goal.name.toLowerCase()}`;
    case 3:
    default:
      return `Recommended to improve ${goal.name.toLowerCase()}`;
  }
}

/**
 * Get action href for a session
 */
function getActionHref(session: PlannedSession, goal?: Goal): string {
  // If there's a specific exercise, link directly to it
  if (goal?.recommendedExerciseId) {
    return `/trening/start/${goal.recommendedExerciseId}`;
  }

  // Otherwise link to the session or exercise library
  if (session.type === 'test') {
    return '/trening/testing/registrer';
  }

  if (session.type === 'round') {
    return '/trening/logg?type=round';
  }

  return `/trening/logg`;
}

// =============================================================================
// MAIN PRIORITIZATION FUNCTION
// =============================================================================

/**
 * Calculate today's priority session and secondary sessions
 */
export function calculateTodayPriority(
  goals: Goal[],
  plannedSessions: PlannedSession[],
  completedSessionIds: string[] = []
): TodayState {
  // Filter to today's sessions that aren't completed
  const todaySessions = plannedSessions.filter(
    (s) => isToday(s.scheduledDate) && !completedSessionIds.includes(s.id)
  );

  // If no sessions today, return empty state
  if (todaySessions.length === 0 && goals.length === 0) {
    return {
      primarySession: null,
      secondarySessions: [],
      completedToday: completedSessionIds.length,
      plannedToday: 0,
      isEmpty: true,
    };
  }

  // Calculate risk scores for all goals
  const goalsWithRisk = goals.map((goal) => ({
    ...goal,
    riskScore: goal.riskScore ?? calculateRiskScore(goal),
  }));

  // Sort goals by risk score (highest first)
  const sortedGoals = [...goalsWithRisk].sort(
    (a, b) => (b.riskScore || 0) - (a.riskScore || 0)
  );

  const todaySessionResults: TodaySession[] = [];

  // Priority 1: At-risk goals with sessions due today
  const atRiskGoals = sortedGoals.filter(
    (g) => g.status === 'at-risk' || g.status === 'behind'
  );

  for (const goal of atRiskGoals) {
    const goalSession = todaySessions.find((s) => s.goalId === goal.id);
    if (goalSession) {
      todaySessionResults.push({
        id: goalSession.id,
        type: goalSession.type,
        title: goalSession.title,
        goalConnection: {
          goalId: goal.id,
          goalName: goal.name,
          status: goal.status,
        },
        estimatedDuration: goalSession.estimatedDuration,
        priority: 1,
        reason: generateReason(goal, 1),
        actionHref: getActionHref(goalSession, goal),
      });
    } else if (goal.recommendedExerciseId) {
      // Create a session from the goal's recommended exercise
      todaySessionResults.push({
        id: `goal-${goal.id}`,
        type: 'exercise',
        title: goal.recommendedExerciseName || goal.name,
        goalConnection: {
          goalId: goal.id,
          goalName: goal.name,
          status: goal.status,
        },
        estimatedDuration: 30, // Default duration
        priority: 1,
        reason: generateReason(goal, 1),
        actionHref: `/trening/start/${goal.recommendedExerciseId}`,
      });
    }
  }

  // Priority 2: On-track goals with sessions due today
  const onTrackGoals = sortedGoals.filter(
    (g) => g.status === 'on-track' || g.status === 'ahead'
  );

  for (const goal of onTrackGoals) {
    const goalSession = todaySessions.find((s) => s.goalId === goal.id);
    if (goalSession && !todaySessionResults.some((r) => r.id === goalSession.id)) {
      todaySessionResults.push({
        id: goalSession.id,
        type: goalSession.type,
        title: goalSession.title,
        goalConnection: {
          goalId: goal.id,
          goalName: goal.name,
          status: goal.status,
        },
        estimatedDuration: goalSession.estimatedDuration,
        priority: 2,
        reason: generateReason(goal, 2),
        actionHref: getActionHref(goalSession, goal),
      });
    }
  }

  // Priority 3: Any remaining planned sessions for today
  for (const session of todaySessions) {
    if (!todaySessionResults.some((r) => r.id === session.id)) {
      const connectedGoal = goals.find((g) => g.id === session.goalId);
      todaySessionResults.push({
        id: session.id,
        type: session.type,
        title: session.title,
        goalConnection: connectedGoal
          ? {
              goalId: connectedGoal.id,
              goalName: connectedGoal.name,
              status: connectedGoal.status,
            }
          : undefined,
        estimatedDuration: session.estimatedDuration,
        priority: 3,
        reason: generateReason(connectedGoal || null, 3),
        actionHref: getActionHref(session, connectedGoal),
      });
    }
  }

  // Sort by priority
  todaySessionResults.sort((a, b) => a.priority - b.priority);

  return {
    primarySession: todaySessionResults[0] || null,
    secondarySessions: todaySessionResults.slice(1),
    completedToday: completedSessionIds.length,
    plannedToday: todaySessions.length + completedSessionIds.length,
    isEmpty: todaySessionResults.length === 0,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default calculateTodayPriority;
