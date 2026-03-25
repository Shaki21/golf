/**
 * useAITriggers Hook
 *
 * Evaluates AI triggers based on user data and returns
 * the most relevant trigger to display.
 */

import { useMemo } from 'react';
import { AI_TRIGGERS, AITriggerConfig } from '../types';

interface UserState {
  // Goals
  hasActiveGoals?: boolean;
  goalsBehindSchedule?: boolean;
  goalsNearCompletion?: boolean;

  // Sessions
  sessionsThisWeek?: number;

  // Tests
  hasNewTestResult?: boolean;

  // Trends
  showsNegativeTrend?: boolean;
  showsPositiveTrend?: boolean;
}

/**
 * Evaluates triggers and returns the most relevant one
 */
export function useAITriggers(userState: UserState): AITriggerConfig | null {
  const activeTrigger = useMemo(() => {
    // Priority order for triggers (first match wins)

    // Dashboard: No goals (highest priority for new users)
    if (userState.hasActiveGoals === false) {
      return AI_TRIGGERS.noGoals;
    }

    // Dashboard: No sessions this week
    if (userState.sessionsThisWeek === 0) {
      return AI_TRIGGERS.noSessions;
    }

    // Dashboard: Few sessions
    if (userState.sessionsThisWeek !== undefined && userState.sessionsThisWeek < 3) {
      return AI_TRIGGERS.fewSessions;
    }

    // Goals: Behind schedule
    if (userState.goalsBehindSchedule) {
      return AI_TRIGGERS.behindSchedule;
    }

    // Goals: Near completion (positive reinforcement)
    if (userState.goalsNearCompletion) {
      return AI_TRIGGERS.goalNearCompletion;
    }

    // Tests: New result
    if (userState.hasNewTestResult) {
      return AI_TRIGGERS.newTestResult;
    }

    // Analysis: Negative trend (needs attention)
    if (userState.showsNegativeTrend) {
      return AI_TRIGGERS.negativeTrend;
    }

    // Analysis: Positive trend (celebrate & build momentum)
    if (userState.showsPositiveTrend) {
      return AI_TRIGGERS.positiveTrend;
    }

    return null;
  }, [userState]);

  return activeTrigger;
}

/**
 * Convert trigger to guide config for AICoachGuide component
 */
export function triggerToGuideConfig(trigger: AITriggerConfig) {
  return {
    id: trigger.id,
    title: trigger.title,
    description: trigger.description,
    suggestions: [trigger.primaryAction, ...trigger.suggestions],
  };
}

export default useAITriggers;
