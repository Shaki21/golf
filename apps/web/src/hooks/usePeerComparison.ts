/**
 * usePeerComparison Hook
 * Fetches peer comparison data from the API
 *
 * Compares a player's performance against peers in the same category
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { checkFeature } from '../config/featureFlags';

export interface PeerComparisonData {
  playerId: string;
  playerPercentile: number;
  playerRank: number;
  peerCount: number;
  peerMean: number;
  peerMedian: number;
  comparisonText: string;
  category?: string;
  testType?: string;
}

export interface MultiLevelComparison {
  sameCategory: PeerComparisonData | null;
  adjacentCategories: PeerComparisonData | null;
  overall: PeerComparisonData | null;
}

interface UsePeerComparisonResult {
  data: PeerComparisonData | null;
  multiLevel: MultiLevelComparison | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Demo data for when API is not available
const getDemoPeerComparison = (playerId: string): PeerComparisonData => ({
  playerId,
  playerPercentile: 72,
  playerRank: 8,
  peerCount: 28,
  peerMean: 68.5,
  peerMedian: 70.2,
  comparisonText: 'Du er blant de beste 30% i din kategori',
  category: 'C',
  testType: 'Driving Distance',
});

const getDemoMultiLevel = (playerId: string): MultiLevelComparison => ({
  sameCategory: {
    playerId,
    playerPercentile: 72,
    playerRank: 8,
    peerCount: 28,
    peerMean: 68.5,
    peerMedian: 70.2,
    comparisonText: 'Du er blant de beste 30% i kategori C',
    category: 'C',
  },
  adjacentCategories: {
    playerId,
    playerPercentile: 45,
    playerRank: 18,
    peerCount: 42,
    peerMean: 72.1,
    peerMedian: 73.5,
    comparisonText: 'Du er på nivå med spillere i kategori B-D',
    category: 'B-D',
  },
  overall: {
    playerId,
    playerPercentile: 38,
    playerRank: 52,
    peerCount: 85,
    peerMean: 74.2,
    peerMedian: 75.0,
    comparisonText: 'Totalt blant alle spillere',
    category: 'Alle',
  },
});

/**
 * Hook for fetching peer comparison data
 */
export function usePeerComparison(
  playerId: string | null | undefined,
  testNumber: number = 1,
  showMultiLevel: boolean = false
): UsePeerComparisonResult {
  const [data, setData] = useState<PeerComparisonData | null>(null);
  const [multiLevel, setMultiLevel] = useState<MultiLevelComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!playerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Check if live API is enabled
    if (!checkFeature('ENABLE_LIVE_PEER_COMPARISON')) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setData(getDemoPeerComparison(playerId));
      if (showMultiLevel) {
        setMultiLevel(getDemoMultiLevel(playerId));
      }
      setLoading(false);
      return;
    }

    try {
      if (showMultiLevel) {
        // Fetch multi-level comparison
        const response = await apiClient.get('/peer-comparison/multi-level', {
          params: { playerId, testNumber }
        });

        if (response.data?.success && response.data?.data) {
          const apiData = response.data.data;
          setMultiLevel({
            sameCategory: apiData.sameCategory || null,
            adjacentCategories: apiData.adjacentCategories || null,
            overall: apiData.overall || null,
          });
          setData(apiData.sameCategory || null);
        } else {
          // Fallback to demo data
          setData(getDemoPeerComparison(playerId));
          setMultiLevel(getDemoMultiLevel(playerId));
        }
      } else {
        // Fetch single comparison
        const response = await apiClient.get('/peer-comparison', {
          params: { playerId, testNumber }
        });

        if (response.data?.success && response.data?.data) {
          setData(response.data.data);
        } else {
          setData(getDemoPeerComparison(playerId));
        }
      }
    } catch (err) {
      console.warn('[usePeerComparison] API failed, using demo data:', err);
      setError('Kunne ikke hente peer-sammenligning');
      setData(getDemoPeerComparison(playerId));
      if (showMultiLevel) {
        setMultiLevel(getDemoMultiLevel(playerId));
      }
    } finally {
      setLoading(false);
    }
  }, [playerId, testNumber, showMultiLevel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, multiLevel, loading, error, refetch: fetchData };
}

export default usePeerComparison;
