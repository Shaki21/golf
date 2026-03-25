/**
 * Proof Metrics Configuration
 * Defines measurable metrics that prove domain improvement
 */

import type {
  TestDomainCode,
  ProofMetric,
  DomainProofMetrics,
  CategoryAK,
} from './domain-mapping.types';

// Helper to create category targets
function createTargets(mValues: number[], kValues: number[]): { M: Record<CategoryAK, number>; K: Record<CategoryAK, number> } {
  const categories: CategoryAK[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  const M: Record<string, number> = {};
  const K: Record<string, number> = {};
  categories.forEach((cat, i) => {
    M[cat] = mValues[i] ?? mValues[mValues.length - 1];
    K[cat] = kValues[i] ?? kValues[kValues.length - 1];
  });
  return { M: M as Record<CategoryAK, number>, K: K as Record<CategoryAK, number> };
}

// ============================================================================
// DOMAIN PROOF METRICS
// ============================================================================

export const DOMAIN_PROOF_METRICS: Record<TestDomainCode, DomainProofMetrics> = {
  TEE: {
    primaryMetric: {
      id: 'DRIVER_DISTANCE_CARRY',
      metricId: 'DRIVER_DISTANCE_CARRY',
      label: 'Driver Carry Distance',
      unit: 'm',
      direction: 'higher_better',
      testNumber: 1,
      categoryTargets: createTargets(
        [280, 270, 260, 250, 240, 230, 220, 210, 200, 190, 180],
        [240, 230, 220, 210, 200, 190, 180, 170, 160, 150, 140]
      ),
    },
    secondaryMetrics: [
      {
        id: 'CLUB_SPEED_DRIVER',
        metricId: 'CLUB_SPEED_DRIVER',
        label: 'Driver Club Speed',
        unit: 'mph',
        direction: 'higher_better',
        testNumber: 5,
        categoryTargets: createTargets(
          [120, 115, 110, 105, 102, 98, 95, 92, 88, 85, 80],
          [100, 95, 92, 88, 85, 82, 78, 75, 72, 68, 65]
        ),
      },
    ],
  },
  INN200: {
    primaryMetric: {
      id: 'PEI_100M',
      metricId: 'PEI_100M',
      label: 'Proximity 100m',
      unit: '%',
      direction: 'higher_better',
      testNumber: 11,
      categoryTargets: createTargets(
        [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30],
        [75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25]
      ),
    },
    secondaryMetrics: [],
  },
  INN150: {
    primaryMetric: {
      id: 'PEI_75M',
      metricId: 'PEI_75M',
      label: 'Proximity 75m',
      unit: '%',
      direction: 'higher_better',
      testNumber: 10,
      categoryTargets: createTargets(
        [85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35],
        [80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30]
      ),
    },
    secondaryMetrics: [],
  },
  INN100: {
    primaryMetric: {
      id: 'PEI_50M',
      metricId: 'PEI_50M',
      label: 'Proximity 50m',
      unit: '%',
      direction: 'higher_better',
      testNumber: 9,
      categoryTargets: createTargets(
        [90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40],
        [85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35]
      ),
    },
    secondaryMetrics: [],
  },
  INN50: {
    primaryMetric: {
      id: 'PEI_25M',
      metricId: 'PEI_25M',
      label: 'Proximity 25m',
      unit: '%',
      direction: 'higher_better',
      testNumber: 8,
      categoryTargets: createTargets(
        [95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45],
        [90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40]
      ),
    },
    secondaryMetrics: [],
  },
  ARG: {
    primaryMetric: {
      id: 'CHIP_PROX_AVG',
      metricId: 'CHIP_PROX_AVG',
      label: 'Chip Proximity Avg',
      unit: 'm',
      direction: 'lower_better',
      testNumber: 17,
      categoryTargets: createTargets(
        [1.5, 1.8, 2.0, 2.3, 2.6, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0],
        [1.8, 2.0, 2.3, 2.6, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.5]
      ),
    },
    secondaryMetrics: [
      {
        id: 'BUNKER_PROX_AVG',
        metricId: 'BUNKER_PROX_AVG',
        label: 'Bunker Proximity Avg',
        unit: 'm',
        direction: 'lower_better',
        testNumber: 18,
        categoryTargets: createTargets(
          [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 7.0, 8.0],
          [2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 7.0, 8.0, 9.0]
        ),
      },
    ],
  },
  PUTT: {
    primaryMetric: {
      id: 'PUTT_3M_PCT',
      metricId: 'PUTT_3M_PCT',
      label: '3m Putt Success Rate',
      unit: '%',
      direction: 'higher_better',
      testNumber: 15,
      categoryTargets: createTargets(
        [95, 92, 88, 85, 82, 78, 75, 70, 65, 60, 55],
        [92, 88, 85, 82, 78, 75, 70, 65, 60, 55, 50]
      ),
    },
    secondaryMetrics: [
      {
        id: 'PUTT_6M_PCT',
        metricId: 'PUTT_6M_PCT',
        label: '6m Putt Success Rate',
        unit: '%',
        direction: 'higher_better',
        testNumber: 16,
        categoryTargets: createTargets(
          [70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20],
          [65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15]
        ),
      },
    ],
  },
  PHYS: {
    primaryMetric: {
      id: 'CLUB_SPEED_DRIVER',
      metricId: 'CLUB_SPEED_DRIVER',
      label: 'Driver Club Speed',
      unit: 'mph',
      direction: 'higher_better',
      testNumber: 5,
      categoryTargets: createTargets(
        [120, 115, 110, 105, 102, 98, 95, 92, 88, 85, 80],
        [100, 95, 92, 88, 85, 82, 78, 75, 72, 68, 65]
      ),
    },
    secondaryMetrics: [
      {
        id: 'RUN_3000M_TIME',
        metricId: 'RUN_3000M_TIME',
        label: '3000m Run Time',
        unit: 'sec',
        direction: 'lower_better',
        testNumber: 14,
        categoryTargets: createTargets(
          [660, 690, 720, 750, 780, 810, 840, 900, 960, 1020, 1080],
          [720, 750, 780, 810, 840, 870, 900, 960, 1020, 1080, 1140]
        ),
      },
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAllMetricsForDomain(domainCode: TestDomainCode): ProofMetric[] {
  const config = DOMAIN_PROOF_METRICS[domainCode];
  if (!config) return [];
  return [config.primaryMetric, ...config.secondaryMetrics];
}

export function getMetricById(metricId: string): ProofMetric | undefined {
  for (const domain of Object.values(DOMAIN_PROOF_METRICS)) {
    if (domain.primaryMetric.id === metricId) return domain.primaryMetric;
    const secondary = domain.secondaryMetrics.find(m => m.id === metricId);
    if (secondary) return secondary;
  }
  return undefined;
}

export function getAllMetricIds(): string[] {
  const ids: string[] = [];
  for (const domain of Object.values(DOMAIN_PROOF_METRICS)) {
    ids.push(domain.primaryMetric.id);
    domain.secondaryMetrics.forEach(m => ids.push(m.id));
  }
  return [...new Set(ids)];
}
