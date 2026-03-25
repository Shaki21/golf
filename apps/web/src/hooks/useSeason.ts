/**
 * useSeason Hook
 * Manages season baseline selection and recommendations
 */

import { useState, useCallback } from 'react';
import { seasonAPI, SeasonBaseline, BaselineRecommendation } from '../services/api';

interface UseSeasonReturn {
  baseline: SeasonBaseline | null;
  recommendation: BaselineRecommendation | null;
  loading: boolean;
  error: string | null;
  getRecommendation: (season: number) => Promise<BaselineRecommendation | null>;
  getBaseline: (season: number) => Promise<SeasonBaseline | null>;
  setBaseline: (data: {
    season: number;
    baselineType: 'season_average' | 'last_8_rounds';
    baselineScore: number;
    metadata?: Record<string, unknown>;
  }) => Promise<SeasonBaseline | null>;
}

export function useSeason(): UseSeasonReturn {
  const [baseline, setBaselineState] = useState<SeasonBaseline | null>(null);
  const [recommendation, setRecommendation] = useState<BaselineRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendation = useCallback(async (season: number): Promise<BaselineRecommendation | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await seasonAPI.getRecommendation(season);
      if (response.data) {
        setRecommendation(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente anbefaling');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBaseline = useCallback(async (season: number): Promise<SeasonBaseline | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await seasonAPI.getBaseline(season);
      if (response.data) {
        setBaselineState(response.data);
        return response.data;
      }
      return null;
    } catch (err: unknown) {
      // 404 is expected if no baseline set yet
      if ((err as { response?: { status?: number } })?.response?.status !== 404) {
        setError(err instanceof Error ? err.message : 'Kunne ikke hente baseline');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const setBaseline = useCallback(async (data: {
    season: number;
    baselineType: 'season_average' | 'last_8_rounds';
    baselineScore: number;
    metadata?: Record<string, unknown>;
  }): Promise<SeasonBaseline | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await seasonAPI.setBaseline(data);
      if (response.data) {
        setBaselineState(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke sette baseline');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    baseline,
    recommendation,
    loading,
    error,
    getRecommendation,
    getBaseline,
    setBaseline,
  };
}

export default useSeason;
