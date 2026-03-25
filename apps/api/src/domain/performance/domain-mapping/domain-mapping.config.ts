/**
 * Domain Mapping Configuration
 * Hardcoded mappings from test domains to SG components
 */

import type {
  TestDomainCode,
  DomainToComponentMapping,
  DomainBenchmarkMapping,
} from './domain-mapping.types';

// ============================================================================
// DOMAIN TO COMPONENT MAPPINGS
// ============================================================================

export const DOMAIN_COMPONENT_MAPPINGS: Record<TestDomainCode, DomainToComponentMapping> = {
  TEE: {
    sgComponent: 'OTT',
    description: 'Tee shots - driving distance and accuracy',
    relatedTestNumbers: [1, 2, 5, 6, 7],
  },
  INN200: {
    sgComponent: 'APP',
    subBucket: '200+',
    description: 'Long approach shots (200+ meters)',
    relatedTestNumbers: [3, 11],
  },
  INN150: {
    sgComponent: 'APP',
    subBucket: '150-200',
    description: 'Medium-long approach shots (150-200 meters)',
    relatedTestNumbers: [3, 10, 11],
  },
  INN100: {
    sgComponent: 'APP',
    subBucket: '100-150',
    description: 'Medium approach shots (100-150 meters)',
    relatedTestNumbers: [4, 9, 10],
  },
  INN50: {
    sgComponent: 'APP',
    subBucket: '50-100',
    description: 'Short approach shots (50-100 meters)',
    relatedTestNumbers: [4, 8, 9],
  },
  ARG: {
    sgComponent: 'ARG',
    description: 'Around the green - chipping, pitching, bunkers',
    relatedTestNumbers: [17, 18, 19],
  },
  PUTT: {
    sgComponent: 'PUTT',
    description: 'Putting',
    relatedTestNumbers: [15, 16, 20],
  },
  PHYS: {
    sgComponent: 'TOTAL',
    description: 'Physical fitness and conditioning',
    relatedTestNumbers: [12, 13, 14],
  },
};

// ============================================================================
// BENCHMARK CONFIGURATIONS
// ============================================================================

export const DOMAIN_BENCHMARK_CONFIGS: Record<TestDomainCode, DomainBenchmarkMapping> = {
  TEE: {
    benchmarkTestIds: [1, 5],
    benchmarkWindowDays: 21,
    defaultSuccessRule: 'DRIVER_DISTANCE_CARRY:>=:230',
  },
  INN200: {
    benchmarkTestIds: [3, 11],
    benchmarkWindowDays: 21,
    defaultSuccessRule: 'improvement:percent:10',
  },
  INN150: {
    benchmarkTestIds: [3, 10],
    benchmarkWindowDays: 21,
    defaultSuccessRule: 'improvement:percent:10',
  },
  INN100: {
    benchmarkTestIds: [4, 9],
    benchmarkWindowDays: 21,
    defaultSuccessRule: 'PEI_75M:>=:60',
  },
  INN50: {
    benchmarkTestIds: [4, 8],
    benchmarkWindowDays: 21,
    defaultSuccessRule: 'PEI_25M:>=:70',
  },
  ARG: {
    benchmarkTestIds: [17, 18],
    benchmarkWindowDays: 21,
    defaultSuccessRule: 'CHIP_PROX_AVG:<=:3.0',
  },
  PUTT: {
    benchmarkTestIds: [15, 16],
    benchmarkWindowDays: 21,
    defaultSuccessRule: 'PUTT_3M_PCT:>=:85',
  },
  PHYS: {
    benchmarkTestIds: [12, 13, 14],
    benchmarkWindowDays: 28,
    defaultSuccessRule: 'improvement:percent:5',
  },
};

// ============================================================================
// TEST NUMBER TO DOMAIN MAPPING
// ============================================================================

export const TEST_TO_DOMAIN_MAP: Record<number, TestDomainCode> = {
  1: 'TEE',    // Driver carry
  2: 'TEE',    // 3-wood distance
  3: 'INN150', // 5-iron distance
  4: 'INN100', // PW distance
  5: 'TEE',    // Club speed driver
  6: 'TEE',    // Ball speed driver
  7: 'TEE',    // Smash factor
  8: 'INN50',  // PEI 25m
  9: 'INN100', // PEI 50m
  10: 'INN150', // PEI 75m
  11: 'INN200', // PEI 100m
  12: 'PHYS',  // Bench 1RM
  13: 'PHYS',  // Deadlift 1RM
  14: 'PHYS',  // 3000m run
  15: 'PUTT',  // 3m putt %
  16: 'PUTT',  // 6m putt %
  17: 'ARG',   // Chip proximity
  18: 'ARG',   // Bunker proximity
  19: 'ARG',   // Pitch proximity
  20: 'PUTT',  // Putt speed control
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const ALL_DOMAIN_CODES: TestDomainCode[] = [
  'TEE', 'INN200', 'INN150', 'INN100', 'INN50', 'ARG', 'PUTT', 'PHYS'
];

export const DOMAIN_PRIORITY_ORDER: TestDomainCode[] = [
  'TEE', 'INN100', 'ARG', 'PUTT', 'INN50', 'INN150', 'INN200', 'PHYS'
];

// ============================================================================
// UI LABELS (Norwegian)
// ============================================================================

export const DOMAIN_LABELS_NO: Record<TestDomainCode, string> = {
  TEE: 'Tee Total',
  INN200: 'Innspill 200+ m',
  INN150: 'Innspill 150–200 m',
  INN100: 'Innspill 100–150 m',
  INN50: 'Innspill 50–100 m',
  ARG: 'Rundt green',
  PUTT: 'Putting',
  PHYS: 'Fysikk',
};

export const DOMAIN_LABELS_EN: Record<TestDomainCode, string> = {
  TEE: 'Tee Total',
  INN200: 'Approach 200+ m',
  INN150: 'Approach 150–200 m',
  INN100: 'Approach 100–150 m',
  INN50: 'Approach 50–100 m',
  ARG: 'Around the Green',
  PUTT: 'Putting',
  PHYS: 'Physical',
};

export function getDomainLabel(code: TestDomainCode, locale: 'no' | 'en' = 'no'): string {
  return locale === 'no' ? DOMAIN_LABELS_NO[code] : DOMAIN_LABELS_EN[code];
}

// ============================================================================
// VALIDATION
// ============================================================================

export function isValidDomainCode(code: string): code is TestDomainCode {
  return ALL_DOMAIN_CODES.includes(code as TestDomainCode);
}
