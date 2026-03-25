/**
 * Training Configuration Hook
 *
 * Provides sport-specific training configuration data.
 * This hook abstracts the sport context and provides
 * easy-to-use training-related data.
 *
 * @example
 * const { trainingAreas, environments, phases } = useTrainingConfig();
 *
 * // Use in a form
 * <select>
 *   {trainingAreas.map(group => (
 *     <optgroup key={group.code} label={group.labelNO || group.label}>
 *       {group.areas.map(area => (
 *         <option key={area.code} value={area.code}>
 *           {area.labelNO || area.label}
 *         </option>
 *       ))}
 *     </optgroup>
 *   ))}
 * </select>
 */

import { useMemo } from 'react';
import { useSportSafe } from '../contexts/SportContext';

/**
 * Hook to get training configuration from sport context
 * Falls back to golf config if not within SportProvider
 */
export function useTrainingConfig() {
  const sport = useSportSafe();

  return useMemo(() => ({
    // Grouped training areas
    trainingAreas: sport.trainingAreas,

    // Flat list of all areas
    allAreas: sport.allTrainingAreas,

    // Training environments
    environments: sport.environments,

    // Motor learning phases
    phases: sport.phases,

    // Intensity/speed levels
    intensityLevels: sport.intensityLevels,

    // Pressure levels
    pressureLevels: sport.pressureLevels,

    // Lookup helpers
    getArea: sport.getTrainingArea,
    getEnvironment: sport.getEnvironment,
    getPhase: sport.getPhase,
    getIntensityLevel: sport.getIntensityLevel,
    getPressureLevel: sport.getPressureLevel,

    // Current sport info
    sportId: sport.sportId,
    sportName: sport.config.nameNO || sport.config.name,
    isGolf: sport.isGolf,
  }), [sport]);
}

/**
 * Hook to get goal categories from sport context
 */
export function useGoalCategories() {
  const sport = useSportSafe();

  return useMemo(() => ({
    categories: sport.goalCategories,
    getCategory: sport.getGoalCategory,
  }), [sport]);
}

/**
 * Hook to get performance metrics from sport context
 */
export function usePerformanceMetrics() {
  const sport = useSportSafe();

  return useMemo(() => ({
    metrics: sport.performanceMetrics,
    getMetric: sport.getMetric,
    benchmarkSource: sport.config.benchmarkSource,
  }), [sport]);
}

/**
 * Hook to get test protocols from sport context
 */
export function useTestProtocols() {
  const sport = useSportSafe();

  return useMemo(() => ({
    protocols: sport.testProtocols,
    getProtocol: (id: string) => sport.testProtocols.find((p) => p.id === id),
    getProtocolByNumber: (num: number) => sport.testProtocols.find((p) => p.testNumber === num),
    getProtocolsByCategory: (category: string) =>
      sport.testProtocols.filter((p) => p.category === category),
  }), [sport]);
}

/**
 * Hook to get sport terminology
 */
export function useTerminology() {
  const sport = useSportSafe();

  return useMemo(() => ({
    ...sport.terminology,
    getTerm: sport.getTerm,
  }), [sport]);
}

/**
 * Legacy compatibility: Get training areas in the old format
 * Use this during migration to gradually move components to SportContext
 *
 * @deprecated Use useTrainingConfig().trainingAreas instead
 */
export function useLegacyTrainingAreas() {
  const { trainingAreas } = useTrainingConfig();

  // Convert to old format: { fullSwing: { label, areas: [] }, ... }
  return useMemo(() => {
    const legacy: Record<string, { label: string; areas: Array<{
      code: string;
      label: string;
      icon: string;
      description: string;
      usesCS?: boolean;
    }> }> = {};

    trainingAreas.forEach((group) => {
      legacy[group.code] = {
        label: group.labelNO || group.label,
        areas: group.areas.map((area) => ({
          code: area.code,
          label: area.labelNO || area.label,
          icon: area.icon,
          description: area.descriptionNO || area.description,
          usesCS: area.usesIntensity,
        })),
      };
    });

    return legacy;
  }, [trainingAreas]);
}

/**
 * Legacy compatibility: Get environments in the old format
 *
 * @deprecated Use useTrainingConfig().environments instead
 */
export function useLegacyEnvironments() {
  const { environments } = useTrainingConfig();

  return useMemo(() => {
    return environments.map((env) => ({
      code: env.code,
      label: env.labelNO || env.label,
      description: env.descriptionNO || env.description,
      icon: env.icon,
    }));
  }, [environments]);
}

/**
 * Legacy compatibility: Get phases in the old format
 *
 * @deprecated Use useTrainingConfig().phases instead
 */
export function useLegacyPhases() {
  const { phases } = useTrainingConfig();

  return useMemo(() => {
    return phases.map((phase) => ({
      code: phase.code,
      label: phase.labelNO || phase.label,
      description: phase.descriptionNO || phase.description,
      icon: phase.icon,
      csRange: phase.intensityRange,
    }));
  }, [phases]);
}

/**
 * Legacy compatibility: Get intensity levels in the old format
 *
 * @deprecated Use useTrainingConfig().intensityLevels instead
 */
export function useLegacyIntensityLevels() {
  const { intensityLevels } = useTrainingConfig();

  return useMemo(() => {
    return intensityLevels.map((level) => ({
      code: level.code,
      value: level.value,
      label: level.labelNO || level.label,
      description: level.descriptionNO || level.description,
    }));
  }, [intensityLevels]);
}

/**
 * Legacy compatibility: Get pressure levels in the old format
 *
 * @deprecated Use useTrainingConfig().pressureLevels instead
 */
export function useLegacyPressureLevels() {
  const { pressureLevels } = useTrainingConfig();

  return useMemo(() => {
    return pressureLevels.map((level) => ({
      code: level.code,
      label: level.labelNO || level.label,
      description: level.descriptionNO || level.description,
      icon: level.icon,
    }));
  }, [pressureLevels]);
}

/**
 * Hook to get sport-specific navigation configuration
 *
 * @example
 * const { quickActions, testing } = useNavigation();
 *
 * // Render quick actions
 * quickActions.map(action => (
 *   <Link to={action.href}>
 *     {action.labelNO || action.label}
 *   </Link>
 * ));
 */
export function useNavigation() {
  const sport = useSportSafe();

  return useMemo(() => {
    const navigation = sport.config.navigation;

    // Default navigation if not defined in sport config
    const defaultNavigation = {
      quickActions: [
        {
          label: 'Log Training',
          labelNO: 'Logg trening',
          icon: 'Plus',
          href: '/trening/logg',
          variant: 'primary' as const,
        },
      ],
      testing: {
        hubPath: '/trening/testing',
        registerPath: '/trening/testing/registrer',
        resultsPath: '/analyse/tester',
        label: 'Testing',
        labelNO: 'Testing',
      },
      itemOverrides: [],
    };

    const nav = navigation || defaultNavigation;

    return {
      // Quick actions for dashboard
      quickActions: nav.quickActions,

      // Testing navigation paths
      testing: nav.testing,

      // Item overrides for customizing nav labels
      itemOverrides: nav.itemOverrides || [],

      // Helper to get override for a specific path
      getOverride: (href: string) =>
        nav.itemOverrides?.find((o) => o.targetHref === href),

      // Helper to check if an item should be hidden
      isHidden: (href: string) =>
        nav.itemOverrides?.some((o) => o.targetHref === href && o.hidden),

      // Current sport info
      sportId: sport.sportId,
      sportName: sport.config.nameNO || sport.config.name,
    };
  }, [sport]);
}

/**
 * Hook to get quick actions for dashboard
 * Returns actions formatted for Norwegian display
 */
export function useQuickActions() {
  const { quickActions } = useNavigation();

  return useMemo(() => {
    return quickActions.map((action) => ({
      label: action.labelNO || action.label,
      icon: action.icon,
      href: action.href,
      variant: action.variant,
    }));
  }, [quickActions]);
}

/**
 * Hook to get session configuration from sport context
 *
 * @example
 * const { pyramidCategories, templates, getTemplate } = useSessionConfig();
 *
 * // Render pyramid categories
 * pyramidCategories.map(cat => (
 *   <button key={cat.code} style={{ color: cat.color }}>
 *     {cat.labelNO || cat.label}
 *   </button>
 * ));
 */
export function useSessionConfig() {
  const sport = useSportSafe();

  return useMemo(() => {
    const sessions = sport.config.sessions;

    // Default session config if not defined
    const defaultConfig = {
      pyramidCategories: [],
      templates: [],
      sessionTypes: ['training', 'test', 'tournament', 'recovery'] as const,
      defaultDuration: 60,
      usesAKFormula: false,
    };

    const config = sessions || defaultConfig;

    return {
      // Pyramid categories (training hierarchy)
      pyramidCategories: config.pyramidCategories,

      // Session templates
      templates: config.templates,

      // Available session types
      sessionTypes: config.sessionTypes,

      // Default duration
      defaultDuration: config.defaultDuration,

      // Whether sport uses AK-formula
      usesAKFormula: config.usesAKFormula || false,

      // Helper to get pyramid category by code
      getCategory: (code: string) =>
        config.pyramidCategories.find((c) => c.code === code),

      // Helper to get template by id
      getTemplate: (id: string) =>
        config.templates.find((t) => t.id === id),

      // Helper to get templates by category
      getTemplatesByCategory: (categoryCode: string) =>
        config.templates.filter((t) => t.categoryCode === categoryCode),

      // Current sport info
      sportId: sport.sportId,
      sportName: sport.config.nameNO || sport.config.name,
    };
  }, [sport]);
}

/**
 * Hook to get pyramid categories formatted for forms
 * Returns categories sorted by order with Norwegian labels
 */
export function usePyramidCategories() {
  const { pyramidCategories } = useSessionConfig();

  return useMemo(() => {
    return [...pyramidCategories]
      .sort((a, b) => a.order - b.order)
      .map((cat) => ({
        code: cat.code,
        label: cat.labelNO || cat.label,
        description: cat.descriptionNO || cat.description,
        icon: cat.icon,
        color: cat.color,
        usesIntensity: cat.usesIntensity,
        usesPosition: cat.usesPosition,
      }));
  }, [pyramidCategories]);
}

/**
 * Hook to get session templates formatted for selection
 */
export function useSessionTemplates() {
  const { templates } = useSessionConfig();

  return useMemo(() => {
    return templates.map((t) => ({
      id: t.id,
      name: t.nameNO || t.name,
      description: t.descriptionNO || t.description,
      defaultDuration: t.defaultDuration,
      categoryCode: t.categoryCode,
      defaultAreas: t.defaultAreas,
      defaultEnvironment: t.defaultEnvironment,
      icon: t.icon,
    }));
  }, [templates]);
}

/**
 * Hook to get skill levels and benchmarks from sport context
 *
 * @example
 * const { skillLevels, getBenchmarksForLevel, getSkillLevel } = useBenchmarks();
 *
 * // Get benchmarks for a specific level
 * const eliteBenchmarks = getBenchmarksForLevel('A');
 */
export function useBenchmarks() {
  const sport = useSportSafe();

  return useMemo(() => {
    const benchmarkConfig = sport.config.benchmarks;

    // Default empty config if not defined
    const defaultConfig = {
      skillLevels: [],
      levelBenchmarks: [],
      source: undefined,
    };

    const config = benchmarkConfig || defaultConfig;

    return {
      // All skill levels
      skillLevels: config.skillLevels,

      // All level benchmarks
      levelBenchmarks: config.levelBenchmarks,

      // Data source
      source: config.source,

      // Helper to get skill level by code
      getSkillLevel: (code: string) =>
        config.skillLevels.find((l) => l.code === code),

      // Helper to get benchmarks for a specific level
      getBenchmarksForLevel: (levelCode: string) =>
        config.levelBenchmarks.find((b) => b.levelCode === levelCode),

      // Helper to get benchmark value for a metric at a level
      getBenchmarkValue: (levelCode: string, metricId: string) => {
        const levelBenchmarks = config.levelBenchmarks.find((b) => b.levelCode === levelCode);
        if (!levelBenchmarks) return undefined;
        const benchmark = levelBenchmarks.benchmarks.find((b) => b.metricId === metricId);
        return benchmark?.value;
      },

      // Current sport info
      sportId: sport.sportId,
      sportName: sport.config.nameNO || sport.config.name,
    };
  }, [sport]);
}

/**
 * Hook to get skill levels formatted for UI display
 * Returns levels sorted by order with Norwegian labels
 */
export function useSkillLevels() {
  const { skillLevels } = useBenchmarks();

  return useMemo(() => {
    return [...skillLevels]
      .sort((a, b) => a.order - b.order)
      .map((level) => ({
        code: level.code,
        label: level.labelNO || level.label,
        description: level.descriptionNO || level.description,
        color: level.color,
        icon: level.icon,
        order: level.order,
      }));
  }, [skillLevels]);
}

/**
 * Hook to get combined metrics with benchmark context
 * Combines performance metrics with benchmark targets
 */
export function useMetricsWithBenchmarks() {
  const { metrics, getMetric } = usePerformanceMetrics();
  const { getBenchmarkValue, skillLevels } = useBenchmarks();

  return useMemo(() => {
    return {
      metrics,
      getMetric,

      // Get metric with benchmark values for all levels
      getMetricWithBenchmarks: (metricId: string) => {
        const metric = getMetric(metricId);
        if (!metric) return undefined;

        const benchmarksByLevel: Record<string, number | undefined> = {};
        skillLevels.forEach((level) => {
          benchmarksByLevel[level.code] = getBenchmarkValue(level.code, metricId);
        });

        return {
          ...metric,
          benchmarksByLevel,
        };
      },
    };
  }, [metrics, getMetric, getBenchmarkValue, skillLevels]);
}

export default useTrainingConfig;
