/**
 * Breaking Point Success Rules
 * Parser and evaluator for success rule strings
 */

import type { SuccessRuleResult, SuccessRuleContext } from './bp-evidence.types';
import { parseSuccessRule, type ParsedSuccessRule } from '../domain-mapping';
import { PrismaClient } from '@prisma/client';

// ============================================================================
// RULE EVALUATION
// ============================================================================

/**
 * Evaluate a success rule against player's data
 */
export async function evaluateSuccessRule(
  prisma: PrismaClient,
  context: SuccessRuleContext
): Promise<SuccessRuleResult> {
  const { playerId, successRule, benchmarkTestId, benchmarkWindowDays, asOfDate } = context;

  // Parse the rule
  const parsed = parseSuccessRule(successRule);
  if (!parsed) {
    return {
      passed: false,
      rule: successRule,
      actualValue: null,
      requiredValue: null,
      operator: null,
      reason: 'invalid_rule_format',
      evidenceDate: null,
    };
  }

  // Evaluate based on rule type
  switch (parsed.type) {
    case 'test_pass':
      return await evaluateTestPassRule(prisma, playerId, parsed, benchmarkWindowDays, asOfDate);

    case 'metric_threshold':
      return await evaluateMetricThresholdRule(
        prisma,
        playerId,
        parsed,
        benchmarkTestId,
        benchmarkWindowDays,
        asOfDate
      );

    case 'improvement_percent':
      return await evaluateImprovementRule(
        prisma,
        playerId,
        parsed,
        benchmarkTestId,
        benchmarkWindowDays,
        asOfDate
      );

    default:
      return {
        passed: false,
        rule: successRule,
        actualValue: null,
        requiredValue: null,
        operator: null,
        reason: 'unknown_rule_type',
        evidenceDate: null,
      };
  }
}

/**
 * Evaluate a test pass rule: "test_id:pass"
 */
async function evaluateTestPassRule(
  prisma: PrismaClient,
  playerId: string,
  parsed: ParsedSuccessRule,
  windowDays: number,
  asOfDate: Date
): Promise<SuccessRuleResult> {
  if (!parsed.testId) {
    return {
      passed: false,
      rule: `${parsed.testId}:pass`,
      actualValue: null,
      requiredValue: null,
      operator: 'pass',
      reason: 'missing_test_id',
      evidenceDate: null,
    };
  }

  const windowStart = new Date(asOfDate);
  windowStart.setDate(windowStart.getDate() - windowDays);

  // Find test result within window
  const testResult = await prisma.testResult.findFirst({
    where: {
      playerId,
      test: { testNumber: parsed.testId },
      testDate: {
        gte: windowStart,
        lte: asOfDate,
      },
    },
    orderBy: { testDate: 'desc' },
  });

  if (!testResult) {
    return {
      passed: false,
      rule: `${parsed.testId}:pass`,
      actualValue: null,
      requiredValue: null,
      operator: 'pass',
      reason: 'no_test_in_window',
      evidenceDate: null,
    };
  }

  // Check if test passed (assume passed field or use value > 0)
  const passed = testResult.passed === true || Number(testResult.value) > 0;

  return {
    passed,
    rule: `${parsed.testId}:pass`,
    actualValue: Number(testResult.value),
    requiredValue: null,
    operator: 'pass',
    reason: passed ? 'test_passed' : 'test_not_passed',
    evidenceDate: testResult.testDate,
  };
}

/**
 * Evaluate a metric threshold rule: "metric_id:operator:threshold"
 */
async function evaluateMetricThresholdRule(
  prisma: PrismaClient,
  playerId: string,
  parsed: ParsedSuccessRule,
  benchmarkTestId: number | null,
  windowDays: number,
  asOfDate: Date
): Promise<SuccessRuleResult> {
  if (!parsed.metricId || !parsed.operator || parsed.threshold === undefined) {
    return {
      passed: false,
      rule: `${parsed.metricId}:${parsed.operator}:${parsed.threshold}`,
      actualValue: null,
      requiredValue: parsed.threshold ?? null,
      operator: parsed.operator ?? null,
      reason: 'incomplete_rule',
      evidenceDate: null,
    };
  }

  const windowStart = new Date(asOfDate);
  windowStart.setDate(windowStart.getDate() - windowDays);

  // Find relevant test result
  const testNumber = benchmarkTestId || inferTestNumberFromMetric(parsed.metricId);

  if (!testNumber) {
    return {
      passed: false,
      rule: `${parsed.metricId}:${parsed.operator}:${parsed.threshold}`,
      actualValue: null,
      requiredValue: parsed.threshold,
      operator: parsed.operator,
      reason: 'cannot_determine_test',
      evidenceDate: null,
    };
  }

  const testResult = await prisma.testResult.findFirst({
    where: {
      playerId,
      test: { testNumber },
      testDate: {
        gte: windowStart,
        lte: asOfDate,
      },
    },
    orderBy: { testDate: 'desc' },
  });

  if (!testResult) {
    return {
      passed: false,
      rule: `${parsed.metricId}:${parsed.operator}:${parsed.threshold}`,
      actualValue: null,
      requiredValue: parsed.threshold,
      operator: parsed.operator,
      reason: 'no_test_in_window',
      evidenceDate: null,
    };
  }

  const actualValue = Number(testResult.value);
  const passed = compareValues(actualValue, parsed.operator, parsed.threshold);

  return {
    passed,
    rule: `${parsed.metricId}:${parsed.operator}:${parsed.threshold}`,
    actualValue,
    requiredValue: parsed.threshold,
    operator: parsed.operator,
    reason: passed ? 'threshold_met' : 'threshold_not_met',
    evidenceDate: testResult.testDate,
  };
}

/**
 * Evaluate an improvement rule: "improvement:percent:value"
 */
async function evaluateImprovementRule(
  prisma: PrismaClient,
  playerId: string,
  parsed: ParsedSuccessRule,
  benchmarkTestId: number | null,
  windowDays: number,
  asOfDate: Date
): Promise<SuccessRuleResult> {
  if (!parsed.improvementPercent || !benchmarkTestId) {
    return {
      passed: false,
      rule: `improvement:percent:${parsed.improvementPercent}`,
      actualValue: null,
      requiredValue: parsed.improvementPercent ?? null,
      operator: 'improvement',
      reason: 'missing_improvement_params',
      evidenceDate: null,
    };
  }

  const windowStart = new Date(asOfDate);
  windowStart.setDate(windowStart.getDate() - windowDays);

  // Get baseline (oldest in window) and current (newest)
  const testResults = await prisma.testResult.findMany({
    where: {
      playerId,
      test: { testNumber: benchmarkTestId },
      testDate: {
        gte: windowStart,
        lte: asOfDate,
      },
    },
    orderBy: { testDate: 'asc' },
  });

  if (testResults.length < 2) {
    return {
      passed: false,
      rule: `improvement:percent:${parsed.improvementPercent}`,
      actualValue: null,
      requiredValue: parsed.improvementPercent,
      operator: 'improvement',
      reason: 'insufficient_tests_for_comparison',
      evidenceDate: testResults[testResults.length - 1]?.testDate ?? null,
    };
  }

  const baseline = Number(testResults[0].value);
  const current = Number(testResults[testResults.length - 1].value);
  const improvement = baseline !== 0 ? ((current - baseline) / Math.abs(baseline)) * 100 : 0;
  const passed = improvement >= parsed.improvementPercent;

  return {
    passed,
    rule: `improvement:percent:${parsed.improvementPercent}`,
    actualValue: improvement,
    requiredValue: parsed.improvementPercent,
    operator: 'improvement',
    reason: passed ? 'improvement_achieved' : 'improvement_not_achieved',
    evidenceDate: testResults[testResults.length - 1].testDate,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Compare values based on operator
 */
function compareValues(
  actual: number,
  operator: '>=' | '<=' | '>' | '<' | '==',
  threshold: number
): boolean {
  switch (operator) {
    case '>=': return actual >= threshold;
    case '>': return actual > threshold;
    case '<=': return actual <= threshold;
    case '<': return actual < threshold;
    case '==': return actual === threshold;
    default: return false;
  }
}

/**
 * Infer test number from metric ID
 * Maps common metric IDs to their corresponding test numbers
 */
function inferTestNumberFromMetric(metricId: string): number | null {
  const metricToTest: Record<string, number> = {
    'DRIVER_DISTANCE_CARRY': 1,
    'THREE_WOOD_DISTANCE': 2,
    'IRON_5_DISTANCE': 3,
    'WEDGE_PW_DISTANCE': 4,
    'CLUB_SPEED_DRIVER': 5,
    'BALL_SPEED_DRIVER': 6,
    'SMASH_FACTOR': 7,
    'PEI_25M': 8,
    'PEI_50M': 9,
    'PEI_75M': 10,
    'PEI_100M': 11,
    'BENCH_1RM': 12,
    'DEADLIFT_1RM': 13,
    'RUN_3000M_TIME': 14,
    'PUTT_3M_PCT': 15,
    'PUTT_6M_PCT': 16,
    'CHIP_PROX_AVG': 17,
    'BUNKER_PROX_AVG': 18,
  };

  return metricToTest[metricId] ?? null;
}

/**
 * Build a default success rule for a domain
 */
export function buildDefaultSuccessRule(
  testNumber: number,
  currentValue: number,
  targetValue: number,
  comparison: '>=' | '<='
): string {
  // For improvement-based rules
  const gap = Math.abs(targetValue - currentValue);
  const gapPercent = (gap / Math.abs(currentValue)) * 100;

  // If small gap, use threshold rule
  if (gapPercent < 15) {
    return `${testNumber}:${comparison}:${targetValue}`;
  }

  // For larger gaps, use 50% improvement rule
  return `improvement:percent:50`;
}
