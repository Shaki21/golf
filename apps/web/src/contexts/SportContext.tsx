/**
 * Sport Context
 *
 * Provides sport-specific configuration throughout the application.
 * This context enables multi-sport support by injecting the appropriate
 * configuration based on the current user's sport selection.
 *
 * Usage:
 *   // In a component
 *   const { config, sportId, terminology } = useSport();
 *   const trainingAreas = config.trainingAreas;
 *
 *   // Get localized term
 *   const playerLabel = terminology.athlete; // "Player" for golf
 *
 * Provider Setup:
 *   <SportProvider sportId="golf">
 *     <App />
 *   </SportProvider>
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import type {
  SportConfig,
  SportId,
  TrainingAreaGroup,
  TrainingArea,
  Environment,
  TrainingPhase,
  IntensityLevel,
  PressureLevel,
  GoalCategory,
  PerformanceMetric,
  SportTerminology,
  Equipment,
  TestProtocol,
} from '../config/sports/types';
import { getSportConfig, DEFAULT_SPORT_CONFIG, DEFAULT_SPORT_ID } from '../config/sports';
import { useSportConfig as useSportConfigAPI } from '../hooks/useSportConfig';

// ============================================================================
// CONTEXT TYPES
// ============================================================================

interface SportContextValue {
  /** Current sport ID */
  sportId: SportId;

  /** Full sport configuration */
  config: SportConfig;

  /** Sport terminology for localization */
  terminology: SportTerminology;

  /** Training areas grouped by category */
  trainingAreas: TrainingAreaGroup[];

  /** Flat list of all training areas */
  allTrainingAreas: TrainingArea[];

  /** Available training environments */
  environments: Environment[];

  /** Training phases (motor learning progression) */
  phases: TrainingPhase[];

  /** Intensity/speed levels */
  intensityLevels: IntensityLevel[];

  /** Pressure/stress levels */
  pressureLevels: PressureLevel[];

  /** Goal categories */
  goalCategories: GoalCategory[];

  /** Performance metrics */
  performanceMetrics: PerformanceMetric[];

  /** Test protocols */
  testProtocols: TestProtocol[];

  /** Equipment */
  equipment: Equipment[];

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /** Get training area by code */
  getTrainingArea: (code: string) => TrainingArea | undefined;

  /** Get environment by code */
  getEnvironment: (code: string) => Environment | undefined;

  /** Get phase by code */
  getPhase: (code: string) => TrainingPhase | undefined;

  /** Get intensity level by code */
  getIntensityLevel: (code: string) => IntensityLevel | undefined;

  /** Get pressure level by code */
  getPressureLevel: (code: string) => PressureLevel | undefined;

  /** Get goal category by id */
  getGoalCategory: (id: string) => GoalCategory | undefined;

  /** Get performance metric by id */
  getMetric: (id: string) => PerformanceMetric | undefined;

  /** Get localized term (Norwegian if available, else English) */
  getTerm: (key: string, useNorwegian?: boolean) => string;

  /** Check if sport is golf (for legacy compatibility) */
  isGolf: boolean;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const SportContext = createContext<SportContextValue | null>(null);

// ============================================================================
// PROVIDER PROPS
// ============================================================================

interface SportProviderProps {
  children: ReactNode;
  /** Sport to load configuration for */
  sportId?: SportId;
  /** Override config (useful for testing) */
  overrideConfig?: Partial<SportConfig>;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function SportProvider({
  children,
  sportId = DEFAULT_SPORT_ID,
  overrideConfig,
}: SportProviderProps) {
  const value = useMemo<SportContextValue>(() => {
    // Get base config
    const baseConfig = getSportConfig(sportId);

    // Merge with overrides if provided
    const config: SportConfig = overrideConfig
      ? { ...baseConfig, ...overrideConfig }
      : baseConfig;

    // Flatten all training areas for easy lookup
    const allTrainingAreas = config.trainingAreas.flatMap((group) => group.areas);

    // Create lookup maps for performance
    const trainingAreaMap = new Map(allTrainingAreas.map((a) => [a.code, a]));
    const environmentMap = new Map(config.environments.map((e) => [e.code, e]));
    const phaseMap = new Map(config.phases.map((p) => [p.code, p]));
    const intensityMap = new Map(config.intensityLevels.map((i) => [i.code, i]));
    const pressureMap = new Map(config.pressureLevels.map((p) => [p.code, p]));
    const goalCategoryMap = new Map(config.goalCategories.map((g) => [g.id, g]));
    const metricMap = new Map(config.performanceMetrics.map((m) => [m.id, m]));

    return {
      sportId,
      config,
      terminology: config.terminology,
      trainingAreas: config.trainingAreas,
      allTrainingAreas,
      environments: config.environments,
      phases: config.phases,
      intensityLevels: config.intensityLevels,
      pressureLevels: config.pressureLevels,
      goalCategories: config.goalCategories,
      performanceMetrics: config.performanceMetrics,
      testProtocols: config.testProtocols,
      equipment: config.equipment || [],

      // Helper functions
      getTrainingArea: (code) => trainingAreaMap.get(code),
      getEnvironment: (code) => environmentMap.get(code),
      getPhase: (code) => phaseMap.get(code),
      getIntensityLevel: (code) => intensityMap.get(code),
      getPressureLevel: (code) => pressureMap.get(code),
      getGoalCategory: (id) => goalCategoryMap.get(id),
      getMetric: (id) => metricMap.get(id),

      getTerm: (key, useNorwegian = true) => {
        if (useNorwegian) {
          // Try Norwegian key first (e.g., "athleteNO")
          const noKey = `${key}NO`;
          if (config.terminology[noKey]) {
            return config.terminology[noKey];
          }
          // Try labelNO pattern
          const labelNoKey = `${key}LabelNO`;
          if (config.terminology[labelNoKey]) {
            return config.terminology[labelNoKey];
          }
        }
        // Fall back to English
        return config.terminology[key] || key;
      },

      isGolf: sportId === 'golf',
    };
  }, [sportId, overrideConfig]);

  return <SportContext.Provider value={value}>{children}</SportContext.Provider>;
}

// ============================================================================
// API-ENABLED PROVIDER
// ============================================================================

interface ApiSportProviderProps {
  children: ReactNode;
  /** Fallback sport ID while loading */
  fallbackSportId?: SportId;
  /** Show loading spinner while fetching */
  showLoading?: boolean;
  /** Custom loading component */
  loadingComponent?: ReactNode;
}

/**
 * Sport Provider that fetches configuration from API
 *
 * This provider automatically fetches the tenant's sport configuration
 * from the API and merges it with the static config. Falls back to
 * defaults if API is unavailable.
 *
 * @example
 * <ApiSportProvider>
 *   <App />
 * </ApiSportProvider>
 */
export function ApiSportProvider({
  children,
  fallbackSportId = DEFAULT_SPORT_ID,
  showLoading = false,
  loadingComponent = null,
}: ApiSportProviderProps) {
  const { sportId, config, isLoading, error } = useSportConfigAPI(true);

  // Show loading state if enabled
  if (showLoading && isLoading) {
    return <>{loadingComponent || <div>Loading sport configuration...</div>}</>;
  }

  // Log errors but continue with fallback config
  if (error) {
    console.warn('Sport config API error, using defaults:', error);
  }

  const value = useMemo<SportContextValue>(() => {
    const effectiveSportId = sportId || fallbackSportId;
    const effectiveConfig = config || getSportConfig(effectiveSportId);

    // Flatten all training areas for easy lookup
    const allTrainingAreas = effectiveConfig.trainingAreas.flatMap((group) => group.areas);

    // Create lookup maps for performance
    const trainingAreaMap = new Map(allTrainingAreas.map((a) => [a.code, a]));
    const environmentMap = new Map(effectiveConfig.environments.map((e) => [e.code, e]));
    const phaseMap = new Map(effectiveConfig.phases.map((p) => [p.code, p]));
    const intensityMap = new Map(effectiveConfig.intensityLevels.map((i) => [i.code, i]));
    const pressureMap = new Map(effectiveConfig.pressureLevels.map((p) => [p.code, p]));
    const goalCategoryMap = new Map(effectiveConfig.goalCategories.map((g) => [g.id, g]));
    const metricMap = new Map(effectiveConfig.performanceMetrics.map((m) => [m.id, m]));

    return {
      sportId: effectiveSportId,
      config: effectiveConfig,
      terminology: effectiveConfig.terminology,
      trainingAreas: effectiveConfig.trainingAreas,
      allTrainingAreas,
      environments: effectiveConfig.environments,
      phases: effectiveConfig.phases,
      intensityLevels: effectiveConfig.intensityLevels,
      pressureLevels: effectiveConfig.pressureLevels,
      goalCategories: effectiveConfig.goalCategories,
      performanceMetrics: effectiveConfig.performanceMetrics,
      testProtocols: effectiveConfig.testProtocols,
      equipment: effectiveConfig.equipment || [],

      // Helper functions
      getTrainingArea: (code) => trainingAreaMap.get(code),
      getEnvironment: (code) => environmentMap.get(code),
      getPhase: (code) => phaseMap.get(code),
      getIntensityLevel: (code) => intensityMap.get(code),
      getPressureLevel: (code) => pressureMap.get(code),
      getGoalCategory: (id) => goalCategoryMap.get(id),
      getMetric: (id) => metricMap.get(id),

      getTerm: (key, useNorwegian = true) => {
        if (useNorwegian) {
          const noKey = `${key}NO`;
          if (effectiveConfig.terminology[noKey]) {
            return effectiveConfig.terminology[noKey];
          }
          const labelNoKey = `${key}LabelNO`;
          if (effectiveConfig.terminology[labelNoKey]) {
            return effectiveConfig.terminology[labelNoKey];
          }
        }
        return effectiveConfig.terminology[key] || key;
      },

      isGolf: effectiveSportId === 'golf',
    };
  }, [sportId, config, fallbackSportId]);

  return <SportContext.Provider value={value}>{children}</SportContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access sport configuration
 *
 * @example
 * const { config, terminology, getTrainingArea } = useSport();
 * const area = getTrainingArea('TEE');
 * console.log(area?.label); // "Tee Total"
 *
 * @throws Error if used outside SportProvider
 */
export function useSport(): SportContextValue {
  const context = useContext(SportContext);
  if (!context) {
    throw new Error('useSport must be used within a SportProvider');
  }
  return context;
}

/**
 * Hook to access sport configuration with fallback
 * Returns default config if not within provider (safe for use anywhere)
 */
export function useSportSafe(): SportContextValue {
  const context = useContext(SportContext);
  if (!context) {
    // Return a minimal context with defaults
    const config = DEFAULT_SPORT_CONFIG;
    const allTrainingAreas = config.trainingAreas.flatMap((g) => g.areas);

    return {
      sportId: DEFAULT_SPORT_ID,
      config,
      terminology: config.terminology,
      trainingAreas: config.trainingAreas,
      allTrainingAreas,
      environments: config.environments,
      phases: config.phases,
      intensityLevels: config.intensityLevels,
      pressureLevels: config.pressureLevels,
      goalCategories: config.goalCategories,
      performanceMetrics: config.performanceMetrics,
      testProtocols: config.testProtocols,
      equipment: config.equipment || [],
      getTrainingArea: (code) => allTrainingAreas.find((a) => a.code === code),
      getEnvironment: (code) => config.environments.find((e) => e.code === code),
      getPhase: (code) => config.phases.find((p) => p.code === code),
      getIntensityLevel: (code) => config.intensityLevels.find((i) => i.code === code),
      getPressureLevel: (code) => config.pressureLevels.find((p) => p.code === code),
      getGoalCategory: (id) => config.goalCategories.find((g) => g.id === id),
      getMetric: (id) => config.performanceMetrics.find((m) => m.id === id),
      getTerm: (key) => config.terminology[key] || key,
      isGolf: true,
    };
  }
  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { SportContext };
export type { SportContextValue, SportProviderProps, ApiSportProviderProps };
