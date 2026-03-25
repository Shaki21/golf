/**
 * useProBenchmark Hook
 * Provides professional benchmark data from DataGolf for comparison
 *
 * Data sources:
 * - DataGolf Performance: Season-level SG data (2000-2026)
 * - DataGolf Skills: Approach metrics by distance
 * - WAGR Rankings: World Amateur Golf Rankings
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { checkFeature } from '../config/featureFlags';

// Types for benchmark data
export interface ProBenchmarkPlayer {
  name: string;
  sgTotal: number;
  sgPutt: number;
  sgArg: number;
  sgApp: number;
  sgOtt: number;
  eventsPlayed: number;
  wins: number;
  year: number;
}

export interface ApproachSkillData {
  distance: string;
  distanceRange: [number, number];
  fairway: {
    sgPerShot: number;
    shotCount: number;
    proximity: number;
    greenHitRate: number;
    greatShotRate: number;
    badShotRate: number;
  };
  rough: {
    sgPerShot: number;
    shotCount: number;
    proximity: number;
    greenHitRate: number;
    greatShotRate: number;
    badShotRate: number;
  };
}

export interface WAGRPlayer {
  rank: number;
  name: string;
  country: string;
  pointsAvg: number;
  move: number;
  gender: 'men' | 'women';
}

export interface TourAverages {
  total: number;
  putting: number;
  aroundGreen: number;
  approach: number;
  offTheTee: number;
}

export interface EliteBenchmarks {
  top10: TourAverages;
  top50: TourAverages;
  tourAverage: TourAverages;
}

// Demo data for when API is not available
const getDemoEliteBenchmarks = (): EliteBenchmarks => ({
  top10: {
    total: 2.45,
    putting: 0.42,
    aroundGreen: 0.38,
    approach: 0.85,
    offTheTee: 0.80,
  },
  top50: {
    total: 1.65,
    putting: 0.28,
    aroundGreen: 0.25,
    approach: 0.58,
    offTheTee: 0.54,
  },
  tourAverage: {
    total: 0.0,
    putting: 0.0,
    aroundGreen: 0.0,
    approach: 0.0,
    offTheTee: 0.0,
  },
});

const getDemoTopPlayers = (): ProBenchmarkPlayer[] => [
  { name: 'Scottie Scheffler', sgTotal: 3.29, sgPutt: 0.28, sgArg: 0.45, sgApp: 1.12, sgOtt: 1.44, eventsPlayed: 21, wins: 6, year: 2025 },
  { name: 'Xander Schauffele', sgTotal: 2.42, sgPutt: 0.35, sgArg: 0.38, sgApp: 0.92, sgOtt: 0.77, eventsPlayed: 19, wins: 3, year: 2025 },
  { name: 'Rory McIlroy', sgTotal: 2.18, sgPutt: 0.15, sgArg: 0.28, sgApp: 0.78, sgOtt: 0.97, eventsPlayed: 18, wins: 2, year: 2025 },
  { name: 'Jon Rahm', sgTotal: 2.05, sgPutt: 0.22, sgArg: 0.32, sgApp: 0.85, sgOtt: 0.66, eventsPlayed: 15, wins: 1, year: 2025 },
  { name: 'Viktor Hovland', sgTotal: 1.89, sgPutt: -0.12, sgArg: 0.18, sgApp: 0.95, sgOtt: 0.88, eventsPlayed: 20, wins: 1, year: 2025 },
];

const getDemoApproachSkills = (): ApproachSkillData[] => [
  {
    distance: '50-100m',
    distanceRange: [50, 100],
    fairway: { sgPerShot: 0.12, shotCount: 850, proximity: 5.2, greenHitRate: 0.82, greatShotRate: 0.28, badShotRate: 0.08 },
    rough: { sgPerShot: 0.05, shotCount: 320, proximity: 7.8, greenHitRate: 0.68, greatShotRate: 0.18, badShotRate: 0.15 },
  },
  {
    distance: '100-150m',
    distanceRange: [100, 150],
    fairway: { sgPerShot: 0.08, shotCount: 1200, proximity: 7.5, greenHitRate: 0.72, greatShotRate: 0.22, badShotRate: 0.12 },
    rough: { sgPerShot: -0.02, shotCount: 480, proximity: 10.2, greenHitRate: 0.55, greatShotRate: 0.12, badShotRate: 0.22 },
  },
  {
    distance: '150-200m',
    distanceRange: [150, 200],
    fairway: { sgPerShot: 0.02, shotCount: 980, proximity: 10.8, greenHitRate: 0.58, greatShotRate: 0.15, badShotRate: 0.18 },
    rough: { sgPerShot: -0.12, shotCount: 280, proximity: 14.5, greenHitRate: 0.38, greatShotRate: 0.08, badShotRate: 0.28 },
  },
  {
    distance: '200m+',
    distanceRange: [200, 300],
    fairway: { sgPerShot: -0.05, shotCount: 520, proximity: 14.2, greenHitRate: 0.42, greatShotRate: 0.10, badShotRate: 0.25 },
    rough: { sgPerShot: -0.22, shotCount: 150, proximity: 18.5, greenHitRate: 0.25, greatShotRate: 0.05, badShotRate: 0.38 },
  },
];

const getDemoWAGRPlayers = (): WAGRPlayer[] => [
  { rank: 1, name: 'Jackson Koivun', country: 'USA', pointsAvg: 1428.63, move: 0, gender: 'men' },
  { rank: 2, name: 'Luke Clanton', country: 'USA', pointsAvg: 1285.42, move: 1, gender: 'men' },
  { rank: 3, name: 'Hiroshi Tai', country: 'USA', pointsAvg: 1182.15, move: -1, gender: 'men' },
  { rank: 4, name: 'Dominic Clemons', country: 'USA', pointsAvg: 1098.22, move: 2, gender: 'men' },
  { rank: 5, name: 'Noah Kent', country: 'ENG', pointsAvg: 1045.88, move: 0, gender: 'men' },
  { rank: 1, name: 'Kiara Romero', country: 'USA', pointsAvg: 1538.30, move: 0, gender: 'women' },
  { rank: 2, name: 'Rianne Malixi', country: 'PHI', pointsAvg: 1425.18, move: 1, gender: 'women' },
  { rank: 3, name: 'Meja Örtengren', country: 'SWE', pointsAvg: 1312.45, move: -1, gender: 'women' },
];

/**
 * Hook for fetching elite benchmark data
 */
export function useEliteBenchmarks() {
  const [data, setData] = useState<EliteBenchmarks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check if live API is enabled
    if (!checkFeature('ENABLE_LIVE_BENCHMARK_API')) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setData(getDemoEliteBenchmarks());
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/datagolf/tour-averages', {
        params: { tour: 'PGA' }
      });

      if (response.data?.success && response.data?.data) {
        const apiData = response.data.data;
        setData({
          top10: apiData.top10 || getDemoEliteBenchmarks().top10,
          top50: apiData.top50 || getDemoEliteBenchmarks().top50,
          tourAverage: apiData.tourAverage || getDemoEliteBenchmarks().tourAverage,
        });
      } else {
        // API returned but no valid data - use demo
        setData(getDemoEliteBenchmarks());
      }
    } catch (err) {
      console.warn('[useEliteBenchmarks] API failed, using demo data:', err);
      setError('Kunne ikke laste benchmark-data');
      setData(getDemoEliteBenchmarks()); // Graceful degradation
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching top PGA players data
 */
export function useTopPlayers(limit: number = 10) {
  const [data, setData] = useState<ProBenchmarkPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check if live API is enabled
    if (!checkFeature('ENABLE_LIVE_BENCHMARK_API')) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setData(getDemoTopPlayers().slice(0, limit));
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/datagolf/pro-players', {
        params: { tour: 'pga', limit }
      });

      if (response.data?.success && response.data?.data?.length > 0) {
        setData(response.data.data.slice(0, limit));
      } else {
        setData(getDemoTopPlayers().slice(0, limit));
      }
    } catch (err) {
      console.warn('[useTopPlayers] API failed, using demo data:', err);
      setError('Kunne ikke laste spillerdata');
      setData(getDemoTopPlayers().slice(0, limit));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching approach skill data by distance
 */
export function useApproachSkills() {
  const [data, setData] = useState<ApproachSkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check if live API is enabled
    if (!checkFeature('ENABLE_LIVE_BENCHMARK_API')) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setData(getDemoApproachSkills());
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/datagolf/approach-skill');

      if (response.data?.success && response.data?.data?.length > 0) {
        setData(response.data.data);
      } else {
        setData(getDemoApproachSkills());
      }
    } catch (err) {
      console.warn('[useApproachSkills] API failed, using demo data:', err);
      setError('Kunne ikke laste approach-data');
      setData(getDemoApproachSkills());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching WAGR rankings
 */
export function useWAGRRankings(gender: 'men' | 'women' | 'all' = 'all', limit: number = 10) {
  const [data, setData] = useState<WAGRPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      let players = getDemoWAGRPlayers();
      if (gender !== 'all') {
        players = players.filter(p => p.gender === gender);
      }
      setData(players.slice(0, limit));
    } catch (err) {
      setError('Kunne ikke laste WAGR-data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [gender, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Combined hook for all benchmark data
 */
export function useProBenchmark() {
  const eliteBenchmarks = useEliteBenchmarks();
  const topPlayers = useTopPlayers(5);
  const approachSkills = useApproachSkills();
  const wagrMen = useWAGRRankings('men', 5);
  const wagrWomen = useWAGRRankings('women', 5);

  return {
    eliteBenchmarks: eliteBenchmarks.data,
    topPlayers: topPlayers.data,
    approachSkills: approachSkills.data,
    wagrRankings: {
      men: wagrMen.data,
      women: wagrWomen.data,
    },
    loading: eliteBenchmarks.loading || topPlayers.loading || approachSkills.loading || wagrMen.loading,
    error: eliteBenchmarks.error || topPlayers.error || approachSkills.error || wagrMen.error,
    refetch: () => {
      eliteBenchmarks.refetch();
      topPlayers.refetch();
      approachSkills.refetch();
      wagrMen.refetch();
      wagrWomen.refetch();
    },
  };
}

export default useProBenchmark;
