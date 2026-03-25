/**
 * useUtviklingsData Hook
 * Fetches development/progress data from various API endpoints
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Map test categories to development areas
const TEST_CATEGORY_MAP = {
  1: { id: 'driving', name: 'Driving' },
  2: { id: 'driving', name: 'Driving' },
  3: { id: 'iron_play', name: 'Jernspill' },
  4: { id: 'iron_play', name: 'Jernspill' },
  5: { id: 'iron_play', name: 'Jernspill' },
  6: { id: 'iron_play', name: 'Jernspill' },
  7: { id: 'iron_play', name: 'Jernspill' },
  8: { id: 'short_game', name: 'Kortspill' },
  9: { id: 'short_game', name: 'Kortspill' },
  10: { id: 'short_game', name: 'Kortspill' },
  11: { id: 'short_game', name: 'Kortspill' },
  12: { id: 'putting', name: 'Putting' },
  13: { id: 'putting', name: 'Putting' },
  14: { id: 'putting', name: 'Putting' },
  15: { id: 'putting', name: 'Putting' },
  16: { id: 'putting', name: 'Putting' },
  17: { id: 'short_game', name: 'Kortspill' },
  18: { id: 'short_game', name: 'Kortspill' },
};

// Fallback data for when API is unavailable
const FALLBACK_DATA = {
  category: {
    level: 'C',
    points: 0,
    nextLevel: 'B',
    pointsNeeded: 1000,
    percentToNext: 0,
  },
  developmentAreas: [
    { id: 'driving', name: 'Driving', score: 0, trend: 'stable', change: '0', status: 'stable' },
    { id: 'iron_play', name: 'Jernspill', score: 0, trend: 'stable', change: '0', status: 'stable' },
    { id: 'short_game', name: 'Kortspill', score: 0, trend: 'stable', change: '0', status: 'stable' },
    { id: 'putting', name: 'Putting', score: 0, trend: 'stable', change: '0', status: 'stable' },
    { id: 'mental', name: 'Mental', score: 0, trend: 'stable', change: '0', status: 'stable' },
    { id: 'physical', name: 'Fysisk', score: 0, trend: 'stable', change: '0', status: 'stable' },
  ],
  achievements: [],
  breakingPointsCount: 0,
};

export function useUtviklingsData() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (!user?.playerId) {
        setData(FALLBACK_DATA);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch data in parallel
        const [
          playerResponse,
          testResultsResponse,
          breakingPointsResponse,
          achievementsResponse,
        ] = await Promise.allSettled([
          api.get(`/players/${user.playerId}`),
          api.get(`/tests/results/player/${user.playerId}?limit=50`),
          api.get('/breaking-points'),
          api.get('/achievements/recent?limit=5'),
        ]);

        // Process player data for category
        let category = FALLBACK_DATA.category;
        if (playerResponse.status === 'fulfilled' && playerResponse.value.data.success) {
          const player = playerResponse.value.data.data;
          const categoryLevel = player.category || 'C';
          const handicap = player.handicap || 54;

          // Simple category points calculation based on handicap
          const maxPoints = 1000;
          const points = Math.max(0, Math.round(maxPoints - (handicap * 15)));

          const categoryOrder = ['D', 'C', 'B', 'A', 'Elite'];
          const currentIndex = categoryOrder.indexOf(categoryLevel);
          const nextLevel = currentIndex < categoryOrder.length - 1
            ? categoryOrder[currentIndex + 1]
            : 'Elite';

          const pointsPerCategory = 250;
          const categoryBasePoints = currentIndex * pointsPerCategory;
          const pointsInCategory = points - categoryBasePoints;
          const percentToNext = Math.min(100, Math.max(0, Math.round((pointsInCategory / pointsPerCategory) * 100)));

          category = {
            level: categoryLevel,
            points,
            nextLevel,
            pointsNeeded: Math.max(0, pointsPerCategory - pointsInCategory),
            percentToNext,
          };
        }

        // Process test results into development areas
        let developmentAreas = [...FALLBACK_DATA.developmentAreas];
        if (testResultsResponse.status === 'fulfilled' && testResultsResponse.value.data.success) {
          const testResults = testResultsResponse.value.data.data || [];

          // Group by area and calculate scores
          const areaScores = {};
          const areaTrends = {};

          testResults.forEach((result, index) => {
            const testNumber = result.test?.testNumber || result.testNumber;
            const areaInfo = TEST_CATEGORY_MAP[testNumber];
            if (!areaInfo) return;

            const areaId = areaInfo.id;
            const score = Number(result.score || result.value || 0);

            if (!areaScores[areaId]) {
              areaScores[areaId] = { recent: [], older: [] };
            }

            // Split into recent (first 10) and older results for trend
            if (index < 10) {
              areaScores[areaId].recent.push(score);
            } else {
              areaScores[areaId].older.push(score);
            }
          });

          // Calculate averages and trends
          developmentAreas = developmentAreas.map(area => {
            const scores = areaScores[area.id];
            if (!scores || scores.recent.length === 0) {
              return area;
            }

            const recentAvg = scores.recent.reduce((a, b) => a + b, 0) / scores.recent.length;
            const olderAvg = scores.older.length > 0
              ? scores.older.reduce((a, b) => a + b, 0) / scores.older.length
              : recentAvg;

            const change = recentAvg - olderAvg;
            let trend = 'stable';
            let status = 'stable';

            if (change > 5) {
              trend = 'up';
              status = 'improving';
            } else if (change < -5) {
              trend = 'down';
              status = 'needs_attention';
            }

            return {
              ...area,
              score: Math.round(recentAvg),
              trend,
              change: change >= 0 ? `+${Math.round(change)}` : `${Math.round(change)}`,
              status,
              lastUpdated: testResults[0]?.testDate || new Date().toISOString(),
            };
          });
        }

        // Process breaking points
        let breakingPointsCount = 0;
        if (breakingPointsResponse.status === 'fulfilled' && breakingPointsResponse.value.data.success) {
          const breakingPoints = breakingPointsResponse.value.data.data || [];
          breakingPointsCount = breakingPoints.filter(bp => bp.status !== 'resolved').length;
        }

        // Process achievements
        let achievements = [];
        if (achievementsResponse.status === 'fulfilled' && achievementsResponse.value.data.success) {
          achievements = (achievementsResponse.value.data.data || []).slice(0, 3).map(a => ({
            id: a.id,
            title: a.title || a.name,
            date: a.earnedAt || a.createdAt,
            type: a.type || 'achievement',
          }));
        }

        setData({
          category,
          developmentAreas,
          achievements,
          breakingPointsCount,
        });
      } catch (err) {
        console.error('Error fetching utvikling data:', err);
        setError(err.message || 'Kunne ikke laste data');
        setData(FALLBACK_DATA);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user?.playerId]);

  return { data, loading, error };
}

export default useUtviklingsData;
