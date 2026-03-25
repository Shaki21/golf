/**
 * Domain Mapping Service
 * Single source of truth for test domain to SG component mappings
 */

import type {
  TestDomainCode,
  SgComponent,
  ApproachSubBucket,
  DomainMappingResult,
  ProofMetric,
  DomainInfoResponse,
  AllDomainsResponse,
  ParsedSuccessRule,
  SuccessRuleFormat,
} from './domain-mapping.types';

import {
  DOMAIN_COMPONENT_MAPPINGS,
  DOMAIN_BENCHMARK_CONFIGS,
  TEST_TO_DOMAIN_MAP,
  ALL_DOMAIN_CODES,
  isValidDomainCode,
} from './domain-mapping.config';

import {
  DOMAIN_PROOF_METRICS,
  getAllMetricsForDomain,
  getMetricById,
} from './proof-metrics.config';

// ============================================================================
// CORE MAPPING FUNCTIONS
// ============================================================================

export function mapTestDomainToComponent(domainCode: TestDomainCode): DomainMappingResult {
  const mapping = DOMAIN_COMPONENT_MAPPINGS[domainCode];
  if (!mapping) {
    throw new Error(`Unknown domain code: ${domainCode}`);
  }
  return {
    sgComponent: mapping.sgComponent,
    subBucket: mapping.subBucket,
    relatedTestNumbers: mapping.relatedTestNumbers,
    description: mapping.description,
  };
}

export function mapTestNumberToDomain(testNumber: number): TestDomainCode | undefined {
  return TEST_TO_DOMAIN_MAP[testNumber];
}

export function getTestNumbersForDomain(domainCode: TestDomainCode): number[] {
  return DOMAIN_COMPONENT_MAPPINGS[domainCode]?.relatedTestNumbers ?? [];
}

export function getSgComponentForDomain(domainCode: TestDomainCode): SgComponent {
  return DOMAIN_COMPONENT_MAPPINGS[domainCode].sgComponent;
}

export function getSubBucketForDomain(domainCode: TestDomainCode): ApproachSubBucket | undefined {
  return DOMAIN_COMPONENT_MAPPINGS[domainCode].subBucket;
}

// ============================================================================
// PROOF METRICS FUNCTIONS
// ============================================================================

export function getProofMetricsForDomain(domainCode: TestDomainCode): ProofMetric[] {
  return getAllMetricsForDomain(domainCode);
}

export function getPrimaryProofMetric(domainCode: TestDomainCode): ProofMetric {
  return DOMAIN_PROOF_METRICS[domainCode].primaryMetric;
}

export function getProofMetricById(metricId: string): ProofMetric | undefined {
  return getMetricById(metricId);
}

// ============================================================================
// BENCHMARK TEST FUNCTIONS
// ============================================================================

export function getDefaultBenchmarkTestIdsForDomain(domainCode: TestDomainCode): number[] {
  return DOMAIN_BENCHMARK_CONFIGS[domainCode].benchmarkTestIds;
}

export function getBenchmarkWindowDays(domainCode: TestDomainCode): number {
  return DOMAIN_BENCHMARK_CONFIGS[domainCode].benchmarkWindowDays;
}

// ============================================================================
// SUCCESS RULE PARSING
// ============================================================================

export function parseSuccessRule(rule: SuccessRuleFormat): ParsedSuccessRule | null {
  if (!rule || typeof rule !== 'string') return null;
  const parts = rule.split(':');
  if (parts.length < 2) return null;

  // Test pass format: "test_id:pass"
  if (parts[1] === 'pass') {
    const testId = parseInt(parts[0], 10);
    if (isNaN(testId)) return null;
    return { type: 'test_pass', testId };
  }

  // Improvement format: "improvement:percent:value"
  if (parts[0] === 'improvement' && parts[1] === 'percent') {
    const percent = parseFloat(parts[2]);
    if (isNaN(percent)) return null;
    return { type: 'improvement_percent', improvementPercent: percent };
  }

  // Metric threshold format: "metric_id:operator:threshold"
  if (parts.length >= 3) {
    const metricId = parts[0];
    const operator = parts[1] as '>=' | '<=' | '>' | '<' | '==';
    const threshold = parseFloat(parts[2]);
    if (!['>=', '<=', '>', '<', '=='].includes(operator) || isNaN(threshold)) return null;
    return { type: 'metric_threshold', metricId, operator, threshold };
  }

  return null;
}

export function buildSuccessRule(
  type: 'metric_threshold' | 'test_pass' | 'improvement_percent',
  options: {
    metricId?: string;
    testId?: number;
    operator?: '>=' | '<=' | '>' | '<' | '==';
    threshold?: number;
    improvementPercent?: number;
  }
): SuccessRuleFormat {
  switch (type) {
    case 'test_pass':
      if (!options.testId) throw new Error('testId required');
      return `${options.testId}:pass`;
    case 'improvement_percent':
      if (options.improvementPercent === undefined) throw new Error('improvementPercent required');
      return `improvement:percent:${options.improvementPercent}`;
    case 'metric_threshold':
      if (!options.metricId || !options.operator || options.threshold === undefined) {
        throw new Error('metricId, operator, threshold required');
      }
      return `${options.metricId}:${options.operator}:${options.threshold}`;
    default:
      throw new Error(`Unknown rule type: ${type}`);
  }
}

// ============================================================================
// API RESPONSE BUILDERS
// ============================================================================

export function getDomainInfo(domainCode: TestDomainCode): DomainInfoResponse {
  const mapping = DOMAIN_COMPONENT_MAPPINGS[domainCode];
  const proofMetrics = getProofMetricsForDomain(domainCode);
  const benchmarkConfig = DOMAIN_BENCHMARK_CONFIGS[domainCode];

  return {
    domainCode,
    sgComponent: mapping.sgComponent,
    subBucket: mapping.subBucket,
    description: mapping.description,
    proofMetrics: proofMetrics.map(m => ({
      metricId: m.metricId,
      label: m.label,
      unit: m.unit,
      direction: m.direction,
    })),
    benchmarkTestIds: benchmarkConfig.benchmarkTestIds,
  };
}

export function getAllDomainsInfo(): AllDomainsResponse {
  return {
    domains: ALL_DOMAIN_CODES.map(code => getDomainInfo(code)),
    lastUpdated: new Date(),
  };
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateDomainCode(code: string): code is TestDomainCode {
  return isValidDomainCode(code);
}

export function isValidTestDomainCode(code: string): boolean {
  return isValidDomainCode(code);
}

export function isValidSgComponent(component: string): component is SgComponent {
  return ['OTT', 'APP', 'ARG', 'PUTT', 'TOTAL'].includes(component);
}

export function getAllDomainCodes(): TestDomainCode[] {
  return [...ALL_DOMAIN_CODES];
}

export function getTestToDomainMapping(): Record<number, TestDomainCode> {
  return { ...TEST_TO_DOMAIN_MAP };
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export type {
  TestDomainCode,
  SgComponent,
  ApproachSubBucket,
  ProofMetric,
  DomainMappingResult,
  DomainInfoResponse,
};
