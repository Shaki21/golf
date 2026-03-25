/**
 * Domain Mapping Unit Tests
 * Tests for TestDomainCode to SgComponent mapping
 */

import {
  mapTestDomainToComponent,
  getProofMetricsForDomain,
  parseSuccessRule,
  getTestToDomainMapping,
  isValidTestDomainCode,
  isValidSgComponent,
  type TestDomainCode,
  type SgComponent,
} from '../../../src/domain/performance/domain-mapping';

describe('Domain Mapping', () => {
  describe('mapTestDomainToComponent', () => {
    it('should map TEE to OTT', () => {
      const result = mapTestDomainToComponent('TEE');
      expect(result.sgComponent).toBe('OTT');
      expect(result.relatedTestNumbers).toContain(1); // Driver carry
      expect(result.relatedTestNumbers).toContain(5); // Club speed
    });

    it('should map INN200 to APP', () => {
      const result = mapTestDomainToComponent('INN200');
      expect(result.sgComponent).toBe('APP');
      expect(result.description).toBeDefined();
    });

    it('should map INN100 to APP', () => {
      const result = mapTestDomainToComponent('INN100');
      expect(result.sgComponent).toBe('APP');
    });

    it('should map ARG to ARG', () => {
      const result = mapTestDomainToComponent('ARG');
      expect(result.sgComponent).toBe('ARG');
      expect(result.relatedTestNumbers).toContain(17); // Chip prox
      expect(result.relatedTestNumbers).toContain(18); // Bunker prox
    });

    it('should map PUTT to PUTT', () => {
      const result = mapTestDomainToComponent('PUTT');
      expect(result.sgComponent).toBe('PUTT');
      expect(result.relatedTestNumbers).toContain(15); // 3m putt
      expect(result.relatedTestNumbers).toContain(16); // 6m putt
    });

    it('should map PHYS to TOTAL', () => {
      const result = mapTestDomainToComponent('PHYS');
      expect(result.sgComponent).toBe('TOTAL');
      expect(result.relatedTestNumbers).toContain(12); // Bench
      expect(result.relatedTestNumbers).toContain(13); // Deadlift
    });

    it('should throw for invalid domain', () => {
      expect(() => mapTestDomainToComponent('INVALID' as TestDomainCode)).toThrow();
    });
  });

  describe('getTestToDomainMapping', () => {
    it('should return mapping from test numbers to domains', () => {
      const mapping = getTestToDomainMapping();

      expect(mapping[1]).toBe('TEE'); // Driver carry
      expect(mapping[5]).toBe('TEE'); // Club speed
      expect(mapping[8]).toBe('INN50'); // PEI 25m (short approach 50-100m bucket)
      expect(mapping[15]).toBe('PUTT'); // 3m putt
      expect(mapping[17]).toBe('ARG'); // Chip prox
    });

    it('should have at least 18 test mappings', () => {
      const mapping = getTestToDomainMapping();
      const mappedTests = Object.keys(mapping).map(Number).filter((n) => n > 0);
      expect(mappedTests.length).toBeGreaterThanOrEqual(18);
    });
  });

  describe('getProofMetricsForDomain', () => {
    it('should return metrics for TEE domain', () => {
      const metrics = getProofMetricsForDomain('TEE');

      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics.some((m) => m.id === 'DRIVER_DISTANCE_CARRY')).toBe(true);
      expect(metrics.some((m) => m.id === 'CLUB_SPEED_DRIVER')).toBe(true);
    });

    it('should return metrics for PUTT domain', () => {
      const metrics = getProofMetricsForDomain('PUTT');

      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics.some((m) => m.id === 'PUTT_3M_PCT')).toBe(true);
    });

    it('should include category targets for each metric', () => {
      const metrics = getProofMetricsForDomain('TEE');

      metrics.forEach((metric) => {
        expect(metric.categoryTargets).toBeDefined();
        expect(metric.categoryTargets.M).toBeDefined();
        expect(metric.categoryTargets.K).toBeDefined();
        // Should have targets for categories A-K
        expect(metric.categoryTargets.M.A).toBeDefined();
        expect(metric.categoryTargets.M.K).toBeDefined();
      });
    });

    it('should return empty array for unknown domain', () => {
      const metrics = getProofMetricsForDomain('UNKNOWN' as TestDomainCode);
      expect(metrics).toEqual([]);
    });
  });

  describe('parseSuccessRule', () => {
    it('should parse test pass rule', () => {
      const result = parseSuccessRule('15:pass');

      expect(result).not.toBeNull();
      expect(result?.type).toBe('test_pass');
      expect(result?.testId).toBe(15);
    });

    it('should parse metric threshold rule with >=', () => {
      const result = parseSuccessRule('DRIVER_DISTANCE_CARRY:>=:230');

      expect(result).not.toBeNull();
      expect(result?.type).toBe('metric_threshold');
      expect(result?.metricId).toBe('DRIVER_DISTANCE_CARRY');
      expect(result?.operator).toBe('>=');
      expect(result?.threshold).toBe(230);
    });

    it('should parse metric threshold rule with <=', () => {
      const result = parseSuccessRule('RUN_3000M_TIME:<=:720');

      expect(result).not.toBeNull();
      expect(result?.type).toBe('metric_threshold');
      expect(result?.operator).toBe('<=');
      expect(result?.threshold).toBe(720);
    });

    it('should parse improvement percent rule', () => {
      const result = parseSuccessRule('improvement:percent:15');

      expect(result).not.toBeNull();
      expect(result?.type).toBe('improvement_percent');
      expect(result?.improvementPercent).toBe(15);
    });

    it('should return null for invalid rule', () => {
      expect(parseSuccessRule('')).toBeNull();
      expect(parseSuccessRule('invalid')).toBeNull();
      expect(parseSuccessRule('foo:bar')).toBeNull();
    });
  });

  describe('isValidTestDomainCode', () => {
    it('should validate valid domain codes', () => {
      expect(isValidTestDomainCode('TEE')).toBe(true);
      expect(isValidTestDomainCode('INN200')).toBe(true);
      expect(isValidTestDomainCode('INN150')).toBe(true);
      expect(isValidTestDomainCode('INN100')).toBe(true);
      expect(isValidTestDomainCode('INN50')).toBe(true);
      expect(isValidTestDomainCode('ARG')).toBe(true);
      expect(isValidTestDomainCode('PUTT')).toBe(true);
      expect(isValidTestDomainCode('PHYS')).toBe(true);
    });

    it('should reject invalid domain codes', () => {
      expect(isValidTestDomainCode('INVALID')).toBe(false);
      expect(isValidTestDomainCode('')).toBe(false);
      expect(isValidTestDomainCode('tee')).toBe(false); // case sensitive
    });
  });

  describe('isValidSgComponent', () => {
    it('should validate valid SG components', () => {
      expect(isValidSgComponent('OTT')).toBe(true);
      expect(isValidSgComponent('APP')).toBe(true);
      expect(isValidSgComponent('ARG')).toBe(true);
      expect(isValidSgComponent('PUTT')).toBe(true);
      expect(isValidSgComponent('TOTAL')).toBe(true);
    });

    it('should reject invalid SG components', () => {
      expect(isValidSgComponent('INVALID')).toBe(false);
      expect(isValidSgComponent('')).toBe(false);
    });
  });
});
