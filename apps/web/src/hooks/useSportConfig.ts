/**
 * Sport Config API Hook
 *
 * Fetches sport configuration from the API and merges with static config.
 * Provides loading/error states and automatic refetching.
 *
 * @example
 * const { sportId, config, isLoading, error } = useSportConfig();
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error} />;
 *
 * // Use merged config
 * console.log(config.trainingAreas);
 */

import { useState, useEffect, useCallback } from 'react';
import { sportConfigAPI, SportConfigData, SportIdType } from '../services/api';
import { getSportConfig, DEFAULT_SPORT_ID } from '../config/sports';
import type { SportConfig, SportId } from '../config/sports/types';

// Map API SportIdType to internal SportId
const mapApiSportId = (apiSportId: SportIdType): SportId => {
  const mapping: Record<SportIdType, SportId> = {
    GOLF: 'golf',
    RUNNING: 'running',
    HANDBALL: 'handball',
    FOOTBALL: 'football',
    TENNIS: 'tennis',
    SWIMMING: 'swimming',
    JAVELIN: 'javelin',
  };
  return mapping[apiSportId] || 'golf';
};

export interface UseSportConfigResult {
  /** Current sport ID */
  sportId: SportId;
  /** Merged sport configuration (API overrides + static config) */
  config: SportConfig;
  /** API config data (null if using defaults) */
  apiConfig: SportConfigData | null;
  /** Whether tenant has custom configuration */
  hasCustomConfig: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refetch config from API */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and merge sport configuration from API
 *
 * @param enabled - Whether to fetch from API (default: true)
 * @returns Sport config with loading/error states
 */
export function useSportConfig(enabled = true): UseSportConfigResult {
  const [sportId, setSportId] = useState<SportId>(DEFAULT_SPORT_ID);
  const [apiConfig, setApiConfig] = useState<SportConfigData | null>(null);
  const [hasCustomConfig, setHasCustomConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!enabled) return;

    // Check for auth token - if not present, use defaults immediately
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setSportId(DEFAULT_SPORT_ID);
      setApiConfig(null);
      setHasCustomConfig(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await sportConfigAPI.getConfig();
      const { data, sportId: apiSportId, hasCustomConfig: hasCustom } = response.data;

      setSportId(mapApiSportId(apiSportId));
      setApiConfig(data);
      setHasCustomConfig(hasCustom);
    } catch (err) {
      // If API fails, fall back to defaults
      console.warn('Failed to fetch sport config from API, using defaults:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sport configuration');
      setSportId(DEFAULT_SPORT_ID);
      setApiConfig(null);
      setHasCustomConfig(false);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Get base config from static files
  const baseConfig = getSportConfig(sportId);

  // Merge API overrides with base config
  const config: SportConfig = apiConfig
    ? mergeConfig(baseConfig, apiConfig)
    : baseConfig;

  return {
    sportId,
    config,
    apiConfig,
    hasCustomConfig,
    isLoading,
    error,
    refetch: fetchConfig,
  };
}

/**
 * Merge API config overrides with base static config
 */
function mergeConfig(base: SportConfig, apiData: SportConfigData): SportConfig {
  return {
    ...base,
    // Apply training areas override if provided
    trainingAreas: apiData.trainingAreasOverride
      ? mergeArray(base.trainingAreas, apiData.trainingAreasOverride)
      : base.trainingAreas,
    // Apply environments override if provided
    environments: apiData.environmentsOverride
      ? mergeArray(base.environments, apiData.environmentsOverride)
      : base.environments,
    // Apply phases override if provided
    phases: apiData.phasesOverride
      ? mergeArray(base.phases, apiData.phasesOverride)
      : base.phases,
    // Apply terminology override if provided
    terminology: apiData.terminologyOverride
      ? { ...base.terminology, ...(apiData.terminologyOverride as Record<string, string>) }
      : base.terminology,
    // Apply benchmarks override if provided (preserving required structure)
    benchmarks: apiData.benchmarksOverride && base.benchmarks
      ? {
          skillLevels: (apiData.benchmarksOverride as Record<string, unknown>).skillLevels as typeof base.benchmarks.skillLevels ?? base.benchmarks.skillLevels,
          levelBenchmarks: (apiData.benchmarksOverride as Record<string, unknown>).levelBenchmarks as typeof base.benchmarks.levelBenchmarks ?? base.benchmarks.levelBenchmarks,
          source: ((apiData.benchmarksOverride as Record<string, unknown>).source as string) ?? base.benchmarks.source,
        }
      : base.benchmarks,
    // Apply navigation override if provided (preserving required structure)
    navigation: apiData.navigationOverride && base.navigation
      ? {
          quickActions: (apiData.navigationOverride as Record<string, unknown>).quickActions as typeof base.navigation.quickActions ?? base.navigation.quickActions,
          testing: (apiData.navigationOverride as Record<string, unknown>).testing as typeof base.navigation.testing ?? base.navigation.testing,
          itemOverrides: (apiData.navigationOverride as Record<string, unknown>).itemOverrides as typeof base.navigation.itemOverrides ?? base.navigation.itemOverrides,
        }
      : base.navigation,
  };
}

/**
 * Helper to merge arrays (overrides replace matching items by code/id)
 */
function mergeArray<T extends { code?: string; id?: string }>(
  base: T[],
  overrides: Record<string, unknown>
): T[] {
  // If overrides is an array, use it directly
  if (Array.isArray(overrides)) {
    return overrides as T[];
  }

  // Otherwise, merge by code/id
  return base.map((item) => {
    const key = item.code || item.id;
    if (key && overrides[key]) {
      return { ...item, ...overrides[key] } as T;
    }
    return item;
  });
}

/**
 * Hook to check if sport-specific features are enabled
 */
export function useSportFeatures() {
  const { apiConfig, sportId } = useSportConfig();

  // Default features based on sport
  const defaultFeatures = {
    golf: { usesHandicap: true, usesClubSpeed: true, usesSG: true, usesAKFormula: true, usesBenchmarks: true },
    running: { usesHandicap: false, usesClubSpeed: false, usesSG: false, usesAKFormula: false, usesBenchmarks: true },
    handball: { usesHandicap: false, usesClubSpeed: false, usesSG: false, usesAKFormula: false, usesBenchmarks: true },
    football: { usesHandicap: false, usesClubSpeed: false, usesSG: false, usesAKFormula: false, usesBenchmarks: true },
    tennis: { usesHandicap: false, usesClubSpeed: false, usesSG: false, usesAKFormula: false, usesBenchmarks: true },
    swimming: { usesHandicap: false, usesClubSpeed: false, usesSG: false, usesAKFormula: false, usesBenchmarks: true },
    javelin: { usesHandicap: false, usesClubSpeed: false, usesSG: false, usesAKFormula: false, usesBenchmarks: true },
  };

  const defaults = defaultFeatures[sportId] || defaultFeatures.golf;

  return {
    usesHandicap: apiConfig?.usesHandicap ?? defaults.usesHandicap,
    usesClubSpeed: apiConfig?.usesClubSpeed ?? defaults.usesClubSpeed,
    usesSG: apiConfig?.usesSG ?? defaults.usesSG,
    usesAKFormula: apiConfig?.usesAKFormula ?? defaults.usesAKFormula,
    usesBenchmarks: apiConfig?.usesBenchmarks ?? defaults.usesBenchmarks,
  };
}

export default useSportConfig;
