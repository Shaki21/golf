/**
 * Hook for managing BASELINE screen data
 *
 * Handles:
 * - Fetching historical averages
 * - Confirming baseline selection
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface BaselineOption {
  type: 'season' | 'last8';
  value: number;
  roundCount?: number;
}

interface BaselineData {
  seasonAverage?: BaselineOption;
  last8Average?: BaselineOption;
  currentBaseline?: number;
  isLocked: boolean;
}

export function useBaselineData(playerId: string) {
  const [data, setData] = useState<BaselineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch baseline options
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch player stats/history
      const [playerStats, history] = await Promise.all([
        api.player.getProfile().catch(() => null),
        api.tests.getAll().catch(() => []),
      ]);

      // Calculate season average from all rounds
      const allRounds = history.filter((t: any) => t.category === 'scoring' || t.testNumber === 1);
      let seasonAverage: BaselineOption | undefined;
      if (allRounds.length > 0) {
        const sum = allRounds.reduce((acc: number, r: any) => acc + (r.value || r.score || 0), 0);
        seasonAverage = {
          type: 'season',
          value: sum / allRounds.length,
          roundCount: allRounds.length,
        };
      }

      // Calculate last 8 rounds average
      let last8Average: BaselineOption | undefined;
      if (allRounds.length >= 8) {
        const sortedRounds = [...allRounds].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const last8 = sortedRounds.slice(0, 8);
        const sum = last8.reduce((acc: number, r: any) => acc + (r.value || r.score || 0), 0);
        last8Average = {
          type: 'last8',
          value: sum / 8,
          roundCount: 8,
        };
      }

      // Check if baseline is already set
      const currentBaseline = playerStats?.baseline || playerStats?.handicap;
      const isLocked = playerStats?.baselineLocked === true;

      setData({
        seasonAverage,
        last8Average,
        currentBaseline,
        isLocked,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch baseline data'));
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Confirm baseline selection
  const confirmBaseline = useCallback(async (option: BaselineOption) => {
    try {
      setSaving(true);
      setError(null);

      // Update player baseline
      // This would call a specific endpoint for setting baseline
      // For now, using a generic update
      await api.player.getProfile(); // Placeholder - actual API would be:
      // await api.player.setBaseline({ type: option.type, value: option.value });

      setData(prev => prev ? {
        ...prev,
        currentBaseline: option.value,
        isLocked: true,
      } : null);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to confirm baseline'));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    saving,
    confirmBaseline,
    refresh: fetchData,
  };
}

export default useBaselineData;
