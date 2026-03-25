/**
 * useCoachSpillereHubStats - Hook for fetching Coach Spillere Hub statistics
 *
 * Fetches:
 * - Total number of athletes/players
 * - Active players this month (with recent sessions)
 * - Number of training plans
 * - Number of evaluations this month
 * - Sessions needing feedback
 * - Plans expiring soon
 * - Inactive players
 * - New players
 * - Players needing attention list
 */

import { useState, useEffect, useCallback } from 'react';
import { coachesAPI, sessionsAPI, trainingPlanAPI } from '../services/api';

interface PlayerAttentionItem {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  issue: string;
  issueType: 'feedback' | 'inactive' | 'plan' | 'new';
  daysSince?: number;
}

interface CoachSpillereHubStats {
  totaltSpillere: number;
  aktiveDenneMnd: number;
  treningsplaner: number;
  evalueringer: number;
  sessionsNeedingFeedback: number;
  plansExpiringSoon: number;
  inactivePlayers: number;
  newPlayers: number;
  playersNeedingAttention: PlayerAttentionItem[];
}

interface UseCoachSpillereHubStatsReturn {
  stats: CoachSpillereHubStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Generate a consistent color based on name
function getAvatarColor(name: string): string {
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Get initials from name
function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
}

// Calculate days since a date
function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function useCoachSpillereHubStats(): UseCoachSpillereHubStatsReturn {
  const [stats, setStats] = useState<CoachSpillereHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current date and boundaries
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Fetch coach's athletes
      const athletesResponse = await coachesAPI.getAthletes();
      const athletes = athletesResponse.data?.data || [];
      const totaltSpillere = athletes.length;

      // Fetch sessions for this month
      const sessionsResponse = await sessionsAPI.list({
        coachId: 'me',
        fromDate: startOfMonthStr,
        limit: 1000,
      } as any);

      const sessions = (sessionsResponse.data?.data as any)?.sessions || sessionsResponse.data?.data || [];

      // Calculate active players (players with sessions this month)
      const activePlayerIds = new Set<string>();
      const playerLastSession: Record<string, string> = {};

      sessions.forEach((session: any) => {
        if (session.playerId) {
          activePlayerIds.add(session.playerId);
          // Track last session date per player
          if (!playerLastSession[session.playerId] ||
              new Date(session.sessionDate) > new Date(playerLastSession[session.playerId])) {
            playerLastSession[session.playerId] = session.sessionDate;
          }
        }
      });
      const aktiveDenneMnd = activePlayerIds.size;

      // Count training plans and check for expiring plans
      let treningsplaner = 0;
      let plansExpiringSoon = 0;

      // Try to get training plans
      try {
        const plansResponse = await trainingPlanAPI.getAll();
        const plans = plansResponse.data?.data || [];
        treningsplaner = plans.filter((p: any) => p.status === 'active' || p.status === 'accepted').length;

        // Check for plans expiring within 7 days
        plansExpiringSoon = plans.filter((p: any) => {
          if (p.endDate) {
            const endDate = new Date(p.endDate);
            return endDate <= oneWeekFromNow && endDate >= now;
          }
          return false;
        }).length;
      } catch {
        // Fallback: count from athletes
        treningsplaner = athletes.filter((athlete: any) => {
          return athlete.hasActivePlan || athlete.trainingPlan || athlete.currentPlan || athlete.activePlan;
        }).length;
      }

      // Count evaluations this month
      const evalueringer = sessions.filter((session: any) => {
        return session.evaluation ||
               session.evaluationData ||
               session.sessionType?.toLowerCase().includes('evaluation') ||
               session.sessionType?.toLowerCase().includes('evaluering') ||
               session.hasEvaluation;
      }).length;

      // Calculate sessions needing feedback
      // Completed sessions without evaluation data
      const sessionsNeedingFeedback = sessions.filter((session: any) => {
        const isCompleted = session.status === 'completed' || session.completedAt;
        const hasNoFeedback = !session.evaluation &&
                             !session.evaluationData &&
                             !session.coachNotes &&
                             !session.coachFeedback;
        return isCompleted && hasNoFeedback;
      }).length;

      // Calculate inactive players (no session in 14+ days)
      const inactivePlayers = athletes.filter((athlete: any) => {
        const lastSession = playerLastSession[athlete.id];
        if (!lastSession) return true; // Never had a session
        return new Date(lastSession) < twoWeeksAgo;
      }).length;

      // Calculate new players (created in last 7 days)
      const newPlayers = athletes.filter((athlete: any) => {
        if (athlete.createdAt) {
          return new Date(athlete.createdAt) >= oneWeekAgo;
        }
        return false;
      }).length;

      // Build players needing attention list
      const playersNeedingAttention: PlayerAttentionItem[] = [];

      // Add players needing feedback (from completed sessions)
      const playersNeedingFeedbackIds = new Set<string>();
      sessions.forEach((session: any) => {
        const isCompleted = session.status === 'completed' || session.completedAt;
        const hasNoFeedback = !session.evaluation &&
                             !session.evaluationData &&
                             !session.coachNotes &&
                             !session.coachFeedback;
        if (isCompleted && hasNoFeedback && session.playerId) {
          playersNeedingFeedbackIds.add(session.playerId);
        }
      });

      playersNeedingFeedbackIds.forEach((playerId) => {
        const athlete = athletes.find((a: any) => a.id === playerId) as any;
        if (athlete) {
          const name = `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim() || athlete.name || 'Unknown';
          const lastSessionDate = playerLastSession[playerId];
          playersNeedingAttention.push({
            id: playerId,
            name,
            initials: getInitials(athlete.firstName || '', athlete.lastName || ''),
            avatarColor: getAvatarColor(name),
            issue: 'Needs feedback',
            issueType: 'feedback',
            daysSince: lastSessionDate ? daysSince(lastSessionDate) : undefined,
          });
        }
      });

      // Add inactive players
      athletes.forEach((athlete: any) => {
        const lastSession = playerLastSession[athlete.id];
        const isInactive = !lastSession || new Date(lastSession) < twoWeeksAgo;

        if (isInactive && !playersNeedingFeedbackIds.has(athlete.id)) {
          const name = `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim() || athlete.name || 'Unknown';
          playersNeedingAttention.push({
            id: athlete.id,
            name,
            initials: getInitials(athlete.firstName || '', athlete.lastName || ''),
            avatarColor: getAvatarColor(name),
            issue: 'Inactive',
            issueType: 'inactive',
            daysSince: lastSession ? daysSince(lastSession) : undefined,
          });
        }
      });

      // Add new players needing onboarding
      athletes.forEach((athlete: any) => {
        if (athlete.createdAt && new Date(athlete.createdAt) >= oneWeekAgo) {
          const alreadyAdded = playersNeedingAttention.some((p) => p.id === athlete.id);
          if (!alreadyAdded) {
            const name = `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim() || athlete.name || 'Unknown';
            playersNeedingAttention.push({
              id: athlete.id,
              name,
              initials: getInitials(athlete.firstName || '', athlete.lastName || ''),
              avatarColor: getAvatarColor(name),
              issue: 'New player',
              issueType: 'new',
              daysSince: daysSince(athlete.createdAt),
            });
          }
        }
      });

      // Sort by urgency: feedback first, then inactive, then new
      const issueOrder = { feedback: 0, plan: 1, inactive: 2, new: 3 };
      playersNeedingAttention.sort((a, b) => issueOrder[a.issueType] - issueOrder[b.issueType]);

      setStats({
        totaltSpillere,
        aktiveDenneMnd,
        treningsplaner,
        evalueringer,
        sessionsNeedingFeedback,
        plansExpiringSoon,
        inactivePlayers,
        newPlayers,
        playersNeedingAttention,
      });
    } catch (err: any) {
      console.error('Failed to fetch coach spillere hub stats:', err);
      setError(err.response?.data?.message || 'Could not load player statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

export default useCoachSpillereHubStats;
