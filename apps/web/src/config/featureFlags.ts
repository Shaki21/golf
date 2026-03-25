/**
 * Feature Flags for gradual rollout of new functionality
 *
 * Toggle these flags to enable/disable features across the app.
 * In production, these could be controlled via environment variables or a feature flag service.
 */

export const FEATURE_FLAGS = {
  /**
   * Enable live API calls to DataGolf for benchmark data
   * When false, uses demo data for development/testing
   */
  ENABLE_LIVE_BENCHMARK_API: true,

  /**
   * Enable live API calls for peer comparison data
   * When false, shows placeholder or demo data
   */
  ENABLE_LIVE_PEER_COMPARISON: true,

  /**
   * Enable the Trends tab in StatistikkHub
   * Shows historical charts and analytics
   */
  ENABLE_TRENDS_CHART: true,

  /**
   * Enable training analytics API integration
   * Fetches completion rates, streaks, and weekly trends
   */
  ENABLE_TRAINING_ANALYTICS: true,
} as const;

// Type for feature flag keys
export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return FEATURE_FLAGS[flag] ?? false;
}

/**
 * Environment-aware feature check
 * Can be extended to check env vars or remote config
 */
export function checkFeature(flag: FeatureFlagKey): boolean {
  // In development, check for override in localStorage
  if (process.env.NODE_ENV === 'development') {
    const override = localStorage.getItem(`ff_${flag}`);
    if (override !== null) {
      return override === 'true';
    }
  }

  return isFeatureEnabled(flag);
}

export default FEATURE_FLAGS;
