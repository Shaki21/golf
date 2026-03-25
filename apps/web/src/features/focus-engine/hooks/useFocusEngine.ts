/**
 * useFocusEngine Hook
 * Fetches focus recommendations from the Focus Engine API
 *
 * Returns the player's recommended focus component, scores, and training split
 * based on strokes gained analysis and test cluster performance.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../../../data/apiClient';

// =============================================================================
// Types
// =============================================================================

/** Golf performance components */
export type FocusComponent = 'OTT' | 'APP' | 'ARG' | 'PUTT';

/** Confidence level of the recommendation */
export type ConfidenceLevel = 'high' | 'med' | 'low';

/** Reason codes explaining the focus recommendation */
export type FocusReasonCode =
  | 'weak_ott_test_cluster'
  | 'weak_app_test_cluster'
  | 'weak_arg_test_cluster'
  | 'weak_putt_test_cluster'
  | 'high_weight_ott'
  | 'high_weight_app'
  | 'high_weight_arg'
  | 'high_weight_putt'
  | 'insufficient_test_data';

/** Scores for each component (0-100 scale) */
export interface FocusScores {
  OTT: number;
  APP: number;
  ARG: number;
  PUTT: number;
}

/** Recommended training time split (fractions summing to 1.0) */
export interface RecommendedSplit {
  OTT: number;
  APP: number;
  ARG: number;
  PUTT: number;
}

/** Focus recommendation data returned by the API */
export interface FocusData {
  /** Primary component to focus on */
  focusComponent: FocusComponent;
  /** Scores for each component */
  focusScores: FocusScores;
  /** Recommended training time distribution */
  recommendedSplit: RecommendedSplit;
  /** Reason codes explaining the recommendation */
  reasonCodes: FocusReasonCode[];
  /** Confidence level of the recommendation */
  confidence: ConfidenceLevel;
  /** Specific approach distance bucket if APP is focus (e.g., "100_125") */
  approachWeakestBucket?: string;
}

/** API response wrapper */
interface ApiFocusResponse {
  success: boolean;
  data: FocusData;
}

// =============================================================================
// Fallback Data
// =============================================================================

function createFallbackData(): FocusData {
  return {
    focusComponent: 'PUTT',
    focusScores: {
      OTT: 70,
      APP: 65,
      ARG: 60,
      PUTT: 55,
    },
    recommendedSplit: {
      OTT: 0.2,
      APP: 0.25,
      ARG: 0.25,
      PUTT: 0.3,
    },
    reasonCodes: ['insufficient_test_data'],
    confidence: 'low',
  };
}

// =============================================================================
// Hook Result Type
// =============================================================================

export interface UseFocusEngineResult {
  /** Focus recommendation data */
  focusData: FocusData;
  /** Loading state */
  isLoading: boolean;
  /** Error message if request failed */
  error: string | null;
  /** Function to manually refresh the data */
  refresh: () => Promise<void>;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Fetches and manages focus recommendation data from the Focus Engine API
 *
 * @param includeApproachDetail - Whether to include detailed approach bucket analysis
 * @returns Focus data, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * const { focusData, isLoading, error, refresh } = useFocusEngine();
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage message={error} />;
 *
 * return (
 *   <div>
 *     <h2>Focus: {focusData.focusComponent}</h2>
 *     <p>Confidence: {focusData.confidence}</p>
 *   </div>
 * );
 * ```
 */
export function useFocusEngine(includeApproachDetail = true): UseFocusEngineResult {
  const [focusData, setFocusData] = useState<FocusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = `/focus-engine/me/focus${includeApproachDetail ? '?includeApproachDetail=true' : ''}`;
      const response = await apiGet<ApiFocusResponse>(endpoint);

      if (response.success && response.data) {
        setFocusData(response.data);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load focus recommendations';
      setError(message);
      // Use fallback data on error
      setFocusData(createFallbackData());
    } finally {
      setIsLoading(false);
    }
  }, [includeApproachDetail]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Return fallback data while loading or on error
  const resolvedData = focusData || createFallbackData();

  return {
    focusData: resolvedData,
    isLoading,
    error,
    refresh: fetchData,
  };
}

export default useFocusEngine;
