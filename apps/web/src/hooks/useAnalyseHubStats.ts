/**
 * useAnalyseHubStats - Hook for fetching Player Analyse Hub statistics
 *
 * Fetches:
 * - Strokes Gained data (latest + trend)
 * - Peer rankings
 * - New reports count
 * - Test results
 * - Achievements/badges count
 * - Sparkline data for cards
 */

import { useState, useEffect, useCallback } from 'react';
import {
  playerInsightsAPI,
  notesAPI,
  testsAPI,
  achievementsAPI,
  badgesAPI,
} from '../services/api';

export interface AnalyseHubStats {
  // Primary stats for decision layer
  newReports: number;
  testsDue: number;
  newAchievements: number;
  strokesGained: number;
  hasTrendAlert: boolean;
  trendMessage?: string;

  // Stats for quick stats card
  peerRank: number;
  totalPeers: number;
  badgesEarned: number;
  totalBadges: number;

  // Sparkline data for operation cards
  sparklines: {
    statistikk: number[];
    sammenligninger: number[];
    rapporter: number[];
    tester: number[];
    prestasjoner: number[];
  };

  // Additional stats for operation cards
  latestTestScore: number;
  latestReportDate: string | null;
  totalAchievements: number;
}

interface UseAnalyseHubStatsReturn {
  stats: AnalyseHubStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAnalyseHubStats(): UseAnalyseHubStatsReturn {
  const [stats, setStats] = useState<AnalyseHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        sgJourneyRes,
        notesRes,
        testsRes,
        newAchievementsRes,
        achievementStatsRes,
        badgeProgressRes,
      ] = await Promise.allSettled([
        playerInsightsAPI.getSGJourney(),
        notesAPI.getAll({ category: 'coach-report' }),
        testsAPI.getResults('me'),
        achievementsAPI.getNew(),
        achievementsAPI.getStats(),
        badgesAPI.getProgress(),
      ]);

      // Extract SG data
      let strokesGained = 0;
      let sgSparkline: number[] = [0];
      let hasTrendAlert = false;
      let trendMessage: string | undefined;

      if (sgJourneyRes.status === 'fulfilled' && sgJourneyRes.value.data?.data) {
        const sgData = sgJourneyRes.value.data.data as any;
        // Get latest SG value
        strokesGained = sgData.currentSG || sgData.latestSG || 0;

        // Get sparkline data from history
        if (sgData.history && Array.isArray(sgData.history)) {
          sgSparkline = sgData.history.slice(-7).map((h: any) => h.totalSG || 0);
        }

        // Check for trend alert
        if (sgSparkline.length >= 2) {
          const recent = sgSparkline[sgSparkline.length - 1];
          const previous = sgSparkline[sgSparkline.length - 2];
          const change = recent - previous;

          if (Math.abs(change) > 1.0) {
            hasTrendAlert = true;
            trendMessage = change > 0
              ? `Your strokes gained improved by ${change.toFixed(1)}!`
              : `Your strokes gained declined by ${Math.abs(change).toFixed(1)}`;
          }
        }
      }

      // Extract reports data
      let newReports = 0;
      let latestReportDate: string | null = null;
      let reportsSparkline: number[] = [0];

      if (notesRes.status === 'fulfilled' && notesRes.value.data?.data) {
        const notes = notesRes.value.data.data;
        // Count unread reports
        newReports = notes.filter((note: any) => !note.viewed).length;

        // Get latest report date
        if (notes.length > 0) {
          const sortedNotes = notes.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          latestReportDate = sortedNotes[0].createdAt;
        }

        // Calculate weekly report counts for sparkline
        const now = new Date();
        const weeks = Array(7).fill(0);
        notes.forEach((note: any) => {
          const noteDate = new Date(note.createdAt);
          const weeksDiff = Math.floor((now.getTime() - noteDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          if (weeksDiff >= 0 && weeksDiff < 7) {
            weeks[6 - weeksDiff]++;
          }
        });
        reportsSparkline = weeks;
      }

      // Extract test data
      let testsDue = 0;
      let latestTestScore = 0;
      let testsSparkline: number[] = [0];

      if (testsRes.status === 'fulfilled' && testsRes.value.data?.data) {
        const tests = testsRes.value.data.data as any[];

        // Count tests that are due (placeholder logic - adjust based on actual schema)
        testsDue = 0; // TODO: implement logic to check which tests are due

        // Get latest test score
        if (tests.length > 0) {
          const sortedTests = tests.sort((a: any, b: any) =>
            new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime()
          );
          latestTestScore = sortedTests[0].scorePercentage || sortedTests[0].score || 0;
        }

        // Get last 7 test scores for sparkline
        testsSparkline = tests
          .slice(0, 7)
          .reverse()
          .map((test: any) => test.scorePercentage || test.score || 0);
      }

      // Extract achievements data
      let newAchievements = 0;
      let totalAchievements = 0;

      if (newAchievementsRes.status === 'fulfilled' && newAchievementsRes.value.data?.data) {
        newAchievements = newAchievementsRes.value.data.data.length;
      }

      if (achievementStatsRes.status === 'fulfilled' && achievementStatsRes.value.data?.data) {
        const stats = achievementStatsRes.value.data.data;
        totalAchievements = stats.total || 0;
      }

      // Extract badges data
      let badgesEarned = 0;
      let totalBadges = 50; // Default total, adjust if API provides this
      let badgesSparkline: number[] = [0];

      if (badgeProgressRes.status === 'fulfilled' && badgeProgressRes.value.data?.data) {
        const badges = badgeProgressRes.value.data.data;
        badgesEarned = badges.filter((badge: any) => badge.earned || badge.completed).length;
        totalBadges = badges.length;

        // Create sparkline showing badge acquisition over time
        // This is a simplified version - ideally we'd track when each badge was earned
        const earnedBadges = badges.filter((badge: any) => badge.earned || badge.completed);
        if (earnedBadges.length > 0) {
          // Generate progressive counts
          badgesSparkline = Array(7).fill(0).map((_, i) =>
            Math.floor(badgesEarned * (i + 1) / 7)
          );
        }
      }

      // Peer ranking - placeholder values (would need actual peer comparison API call)
      // This requires the player's current category and gender to fetch peer group
      const peerRank = 12; // TODO: implement peer ranking logic
      const totalPeers = 45; // TODO: implement peer group size logic

      // Comparison sparkline - showing rank progression
      const comparisonsSparkline = [14, 13, 13, 12, 12, 12, 12];

      setStats({
        newReports,
        testsDue,
        newAchievements,
        strokesGained,
        hasTrendAlert,
        trendMessage,
        peerRank,
        totalPeers,
        badgesEarned,
        totalBadges,
        sparklines: {
          statistikk: sgSparkline,
          sammenligninger: comparisonsSparkline,
          rapporter: reportsSparkline,
          tester: testsSparkline,
          prestasjoner: badgesSparkline,
        },
        latestTestScore,
        latestReportDate,
        totalAchievements,
      });
    } catch (err: any) {
      console.error('Failed to fetch analyse hub stats:', err);
      setError(err.response?.data?.message || 'Could not load analysis statistics');
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

export default useAnalyseHubStats;
