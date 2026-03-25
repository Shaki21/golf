/**
 * Domain Mapping Types
 * Types for mapping test domains to SG components
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type TestDomainCode =
  | 'TEE'
  | 'INN200'
  | 'INN150'
  | 'INN100'
  | 'INN50'
  | 'ARG'
  | 'PUTT'
  | 'PHYS';

export type SgComponent = 'OTT' | 'APP' | 'ARG' | 'PUTT' | 'TOTAL';

export type ApproachSubBucket = '200+' | '150-200' | '100-150' | '50-100';

export type CategoryAK = 'A' | 'B' | 'C' | 'D' | 'E' | 'G' | 'H' | 'I' | 'J';

export type Gender = 'M' | 'K';

// ============================================================================
// MAPPING TYPES
// ============================================================================

export interface DomainToComponentMapping {
  sgComponent: SgComponent;
  subBucket?: ApproachSubBucket;
  description: string;
  relatedTestNumbers: number[];
}

export interface DomainMappingResult {
  sgComponent: SgComponent;
  subBucket?: ApproachSubBucket;
  relatedTestNumbers: number[];
  description?: string;
}

// ============================================================================
// PROOF METRIC TYPES
// ============================================================================

export type MetricDirection = 'higher_better' | 'lower_better';

export interface CategoryTargets {
  M: Record<CategoryAK, number>;
  K: Record<CategoryAK, number>;
}

export interface ProofMetric {
  id: string;
  metricId: string;
  label: string;
  unit: string;
  direction: MetricDirection;
  testNumber?: number;
  categoryTargets: CategoryTargets;
}

export interface DomainProofMetrics {
  primaryMetric: ProofMetric;
  secondaryMetrics: ProofMetric[];
}

export interface DomainBenchmarkMapping {
  benchmarkTestIds: number[];
  benchmarkWindowDays: number;
  defaultSuccessRule: string;
}

// ============================================================================
// SUCCESS RULE TYPES
// ============================================================================

export type SuccessRuleFormat = string;

export interface ParsedSuccessRule {
  type: 'metric_threshold' | 'test_pass' | 'improvement_percent';
  metricId?: string;
  testId?: number;
  operator?: '>=' | '<=' | '>' | '<' | '==';
  threshold?: number;
  improvementPercent?: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface DomainInfoResponse {
  domainCode: TestDomainCode;
  sgComponent: SgComponent;
  subBucket?: ApproachSubBucket;
  description: string;
  proofMetrics: Array<{
    metricId: string;
    label: string;
    unit: string;
    direction: MetricDirection;
  }>;
  benchmarkTestIds: number[];
}

export interface AllDomainsResponse {
  domains: DomainInfoResponse[];
  lastUpdated: Date;
}
