/**
 * Domain Mapping Module
 * Single source of truth for test domain to SG component mappings
 */

export {
  mapTestDomainToComponent,
  mapTestNumberToDomain,
  getTestNumbersForDomain,
  getSgComponentForDomain,
  getSubBucketForDomain,
  getProofMetricsForDomain,
  getPrimaryProofMetric,
  getProofMetricById,
  getDefaultBenchmarkTestIdsForDomain,
  getBenchmarkWindowDays,
  parseSuccessRule,
  buildSuccessRule,
  getDomainInfo,
  getAllDomainsInfo,
  validateDomainCode,
  isValidTestDomainCode,
  isValidSgComponent,
  getAllDomainCodes,
  getTestToDomainMapping,
} from './domain-mapping.service';

export type {
  TestDomainCode,
  SgComponent,
  ApproachSubBucket,
  ProofMetric,
  DomainMappingResult,
  DomainInfoResponse,
  CategoryAK,
  Gender,
  MetricDirection,
  CategoryTargets,
  DomainProofMetrics,
  ParsedSuccessRule,
  SuccessRuleFormat,
  AllDomainsResponse,
} from './domain-mapping.types';

export {
  DOMAIN_COMPONENT_MAPPINGS,
  DOMAIN_BENCHMARK_CONFIGS,
  TEST_TO_DOMAIN_MAP,
  ALL_DOMAIN_CODES,
  DOMAIN_PRIORITY_ORDER,
  DOMAIN_LABELS_NO,
  DOMAIN_LABELS_EN,
  getDomainLabel,
  isValidDomainCode,
} from './domain-mapping.config';

export {
  DOMAIN_PROOF_METRICS,
  getAllMetricsForDomain,
  getMetricById,
  getAllMetricIds,
} from './proof-metrics.config';
