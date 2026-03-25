/**
 * useProPlayerSearch Hook
 * Search for professional golfers from DataGolf for comparison
 *
 * Features:
 * - Typeahead search with debounce
 * - Get single player by ID
 * - Norwegian player suggestions (e.g., Kristoffer Reitan)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../services/apiClient';
import { checkFeature } from '../config/featureFlags';

export interface ProPlayerStats {
  sgTotal: number | null;
  sgTee: number | null;
  sgApproach: number | null;
  sgAround: number | null;
  sgPutting: number | null;
  drivingDistance: number | null;
  drivingAccuracy: number | null;
}

export interface ProPlayer {
  rank: number;
  dataGolfId: string;
  playerName: string;
  tour: string | null;
  stats: ProPlayerStats;
  lastSynced: string;
}

interface UseProPlayerSearchResult {
  results: ProPlayer[];
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
  clearResults: () => void;
}

interface UseProPlayerResult {
  player: ProPlayer | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Demo data for Norwegian players when API is not available
const DEMO_NORWEGIAN_PLAYERS: ProPlayer[] = [
  {
    rank: 8,
    dataGolfId: 'viktor-hovland',
    playerName: 'Viktor Hovland',
    tour: 'pga',
    stats: {
      sgTotal: 1.89,
      sgTee: 0.88,
      sgApproach: 0.95,
      sgAround: 0.18,
      sgPutting: -0.12,
      drivingDistance: 302,
      drivingAccuracy: 0.58,
    },
    lastSynced: new Date().toISOString(),
  },
  {
    rank: 156,
    dataGolfId: 'kristoffer-reitan',
    playerName: 'Kristoffer Reitan',
    tour: 'euro',
    stats: {
      sgTotal: 0.85,
      sgTee: 0.22,
      sgApproach: 0.35,
      sgAround: 0.15,
      sgPutting: 0.13,
      drivingDistance: 295,
      drivingAccuracy: 0.62,
    },
    lastSynced: new Date().toISOString(),
  },
  {
    rank: 243,
    dataGolfId: 'kristian-krogh-johannessen',
    playerName: 'Kristian Krogh Johannessen',
    tour: 'euro',
    stats: {
      sgTotal: 0.42,
      sgTee: 0.18,
      sgApproach: 0.22,
      sgAround: 0.08,
      sgPutting: -0.06,
      drivingDistance: 288,
      drivingAccuracy: 0.65,
    },
    lastSynced: new Date().toISOString(),
  },
];

// Popular players for demo
const DEMO_POPULAR_PLAYERS: ProPlayer[] = [
  {
    rank: 1,
    dataGolfId: 'scottie-scheffler',
    playerName: 'Scottie Scheffler',
    tour: 'pga',
    stats: {
      sgTotal: 3.29,
      sgTee: 1.44,
      sgApproach: 1.12,
      sgAround: 0.45,
      sgPutting: 0.28,
      drivingDistance: 308,
      drivingAccuracy: 0.61,
    },
    lastSynced: new Date().toISOString(),
  },
  {
    rank: 3,
    dataGolfId: 'rory-mcilroy',
    playerName: 'Rory McIlroy',
    tour: 'pga',
    stats: {
      sgTotal: 2.18,
      sgTee: 0.97,
      sgApproach: 0.78,
      sgAround: 0.28,
      sgPutting: 0.15,
      drivingDistance: 318,
      drivingAccuracy: 0.55,
    },
    lastSynced: new Date().toISOString(),
  },
  {
    rank: 14,
    dataGolfId: 'jon-rahm',
    playerName: 'Jon Rahm',
    tour: 'liv',
    stats: {
      sgTotal: 2.05,
      sgTee: 0.66,
      sgApproach: 0.85,
      sgAround: 0.32,
      sgPutting: 0.22,
      drivingDistance: 305,
      drivingAccuracy: 0.59,
    },
    lastSynced: new Date().toISOString(),
  },
];

/**
 * Search for pro players by name
 */
export function useProPlayerSearch(debounceMs: number = 300): UseProPlayerSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      // Check if live API is enabled
      if (!checkFeature('ENABLE_LIVE_BENCHMARK_API')) {
        // Use demo data with filtering
        await new Promise(resolve => setTimeout(resolve, 200));
        const allDemoPlayers = [...DEMO_NORWEGIAN_PLAYERS, ...DEMO_POPULAR_PLAYERS];
        const filtered = allDemoPlayers.filter(p =>
          p.playerName.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setLoading(false);
        return;
      }

      try {
        // Search across ALL tours (pga, euro/DP World, kft) - do not filter by tour
        const response = await apiClient.get('/datagolf/pro-players/search', {
          params: {
            q: query,
            limit: 20,
            // No tour filter - search all tours to find PGA, DP World (euro), and Korn Ferry players
          },
        });

        if (response.data?.success && response.data?.data) {
          setResults(response.data.data);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.warn('[useProPlayerSearch] API failed:', err);
        setError('Kunne ikke søke etter spillere');
        // Fallback to demo data
        const allDemoPlayers = [...DEMO_NORWEGIAN_PLAYERS, ...DEMO_POPULAR_PLAYERS];
        const filtered = allDemoPlayers.filter(p =>
          p.playerName.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return { results, loading, error, search, clearResults };
}

/**
 * Get a specific pro player by DataGolf ID
 */
export function useProPlayer(dataGolfId: string | null): UseProPlayerResult {
  const [player, setPlayer] = useState<ProPlayer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayer = useCallback(async () => {
    if (!dataGolfId) {
      setPlayer(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Check if live API is enabled
    if (!checkFeature('ENABLE_LIVE_BENCHMARK_API')) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const allDemoPlayers = [...DEMO_NORWEGIAN_PLAYERS, ...DEMO_POPULAR_PLAYERS];
      const found = allDemoPlayers.find(p => p.dataGolfId === dataGolfId);
      setPlayer(found || null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(`/datagolf/pro-players/${dataGolfId}`);

      if (response.data?.success && response.data?.data) {
        setPlayer(response.data.data);
      } else {
        setPlayer(null);
      }
    } catch (err) {
      console.warn('[useProPlayer] API failed:', err);
      setError('Kunne ikke hente spiller');
      // Fallback to demo data
      const allDemoPlayers = [...DEMO_NORWEGIAN_PLAYERS, ...DEMO_POPULAR_PLAYERS];
      const found = allDemoPlayers.find(p => p.dataGolfId === dataGolfId);
      setPlayer(found || null);
    } finally {
      setLoading(false);
    }
  }, [dataGolfId]);

  useEffect(() => {
    fetchPlayer();
  }, [fetchPlayer]);

  return { player, loading, error, refetch: fetchPlayer };
}

/**
 * Get suggested Norwegian pro players
 */
export function useNorwegianProPlayers(): { players: ProPlayer[]; loading: boolean } {
  const [players, setPlayers] = useState<ProPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNorwegianPlayers = async () => {
      if (!checkFeature('ENABLE_LIVE_BENCHMARK_API')) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setPlayers(DEMO_NORWEGIAN_PLAYERS);
        setLoading(false);
        return;
      }

      try {
        // Search for Norwegian names
        const response = await apiClient.get('/datagolf/pro-players/search', {
          params: { q: 'hovland', limit: 10 },
        });

        if (response.data?.success && response.data?.data?.length > 0) {
          setPlayers(response.data.data.slice(0, 5));
        } else {
          setPlayers(DEMO_NORWEGIAN_PLAYERS);
        }
      } catch {
        setPlayers(DEMO_NORWEGIAN_PLAYERS);
      } finally {
        setLoading(false);
      }
    };

    fetchNorwegianPlayers();
  }, []);

  return { players, loading };
}

export default useProPlayerSearch;
