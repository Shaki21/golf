/**
 * Breaking Point Evidence Service
 * Tracks effort and progress for breaking points based on evidence
 *
 * KEY PRINCIPLE:
 * - Completion of training sessions affects EFFORT only
 * - Progress only changes when benchmark test shows improvement
 * - Breaking points are never resolved without test evidence
 */

import type { PrismaClient } from '@prisma/client';
import type { TestDomainCode } from '../domain-mapping';
import { parseSuccessRule, getBenchmarkWindowDays } from '../domain-mapping';
import type {
  BenchmarkResult,
  RecordTrainingEffortInput,
  RecordTrainingEffortOutput,
  EvaluateBenchmarkInput,
  EvaluateBenchmarkOutput,
  GetBreakingPointStatusInput,
  GetBreakingPointStatusOutput,
} from './bp-evidence.types';
import {
  calculateEffortFromSessions,
  PROGRESS_THRESHOLDS,
} from './bp-evidence.config';

// ============================================================================
// EFFORT TRACKING
// ============================================================================

/**
 * Records training effort for a breaking point
 * This increases effortPercent but NOT progressPercent
 */
export async function recordTrainingEffort(
  prisma: PrismaClient,
  input: RecordTrainingEffortInput
): Promise<RecordTrainingEffortOutput> {
  const { breakingPointId } = input;

  // Get current breaking point
  const bp = await prisma.breakingPoint.findUnique({
    where: { id: breakingPointId },
  });

  if (!bp) {
    throw new Error(`Breaking point not found: ${breakingPointId}`);
  }

  // Count completed sessions for this breaking point's domain
  const domainCode = bp.testDomainCode as TestDomainCode | null;
  const windowDays = domainCode ? getBenchmarkWindowDays(domainCode) : 21;
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - windowDays);

  // Count sessions for the player within the benchmark window
  const sessionCount = await prisma.trainingSession.count({
    where: {
      playerId: bp.playerId,
      completedAt: { not: null },
      sessionDate: { gte: windowStart },
    },
  });

  const previousEffort = bp.effortPercent ?? 0;
  const newEffort = calculateEffortFromSessions(sessionCount);

  // Update breaking point effort only
  await prisma.breakingPoint.update({
    where: { id: breakingPointId },
    data: { effortPercent: newEffort },
  });

  return {
    breakingPointId,
    previousEffort,
    newEffort,
    sessionsCounted: sessionCount,
  };
}

// ============================================================================
// BENCHMARK EVALUATION
// ============================================================================

/**
 * Evaluates a benchmark test result against breaking point success criteria
 * This is the ONLY way progress can increase
 */
export async function evaluateBenchmark(
  prisma: PrismaClient,
  input: EvaluateBenchmarkInput
): Promise<EvaluateBenchmarkOutput> {
  const { breakingPointId, proofMetric, testValue, testDate, successRule } = input;

  // Get current breaking point
  const bp = await prisma.breakingPoint.findUnique({
    where: { id: breakingPointId },
  });

  if (!bp) {
    throw new Error(`Breaking point not found: ${breakingPointId}`);
  }

  // Parse success rule
  const parsed = parseSuccessRule(successRule);
  if (!parsed) {
    throw new Error(`Invalid success rule: ${successRule}`);
  }

  // Get previous benchmark value if exists (stored as string, parse to number)
  const previousValue = bp.currentMeasurement ? parseFloat(bp.currentMeasurement) : null;

  // Evaluate against success criteria
  let meetsTarget = false;
  let improvementPercent = 0;

  if (parsed.type === 'metric_threshold') {
    const { operator, threshold } = parsed;
    switch (operator) {
      case '>=':
        meetsTarget = testValue >= (threshold ?? 0);
        break;
      case '<=':
        meetsTarget = testValue <= (threshold ?? 0);
        break;
      case '>':
        meetsTarget = testValue > (threshold ?? 0);
        break;
      case '<':
        meetsTarget = testValue < (threshold ?? 0);
        break;
      case '==':
        meetsTarget = testValue === threshold;
        break;
    }

    if (previousValue !== null && parsed.threshold !== undefined) {
      const targetGap = Math.abs(parsed.threshold - previousValue);
      const currentGap = Math.abs(parsed.threshold - testValue);
      if (targetGap > 0) {
        improvementPercent = ((targetGap - currentGap) / targetGap) * 100;
      }
    }
  } else if (parsed.type === 'improvement_percent') {
    if (previousValue !== null && previousValue !== 0) {
      const isLowerBetter = proofMetric.direction === 'lower_better';
      if (isLowerBetter) {
        improvementPercent = ((previousValue - testValue) / previousValue) * 100;
      } else {
        improvementPercent = ((testValue - previousValue) / previousValue) * 100;
      }
      meetsTarget = improvementPercent >= (parsed.improvementPercent ?? 0);
    }
  }

  // Calculate new progress
  const previousProgress = bp.progressPercent ?? 0;
  let newProgress = previousProgress;

  if (meetsTarget) {
    newProgress = PROGRESS_THRESHOLDS.RESOLVED;
  } else if (improvementPercent > 0) {
    // Partial progress based on improvement
    newProgress = Math.min(
      PROGRESS_THRESHOLDS.GOOD,
      previousProgress + (improvementPercent / 2)
    );
  }

  const isResolved = newProgress >= PROGRESS_THRESHOLDS.RESOLVED;

  // Update breaking point
  await prisma.breakingPoint.update({
    where: { id: breakingPointId },
    data: {
      progressPercent: newProgress,
      currentMeasurement: String(testValue),
      resolvedDate: isResolved ? new Date() : null,
    },
  });

  const benchmarkResult: BenchmarkResult = {
    metricId: proofMetric.metricId,
    currentValue: testValue,
    previousValue,
    targetValue: parsed.threshold ?? 0,
    improvementPercent,
    meetsTarget,
    testDate,
  };

  return {
    breakingPointId,
    previousProgress,
    newProgress,
    meetsTarget,
    isResolved,
    benchmarkResult,
  };
}

// ============================================================================
// STATUS TRANSITIONS
// ============================================================================

/**
 * BP Status values:
 * - not_started: Initial state, no work begun
 * - identified: Coach/system has identified the BP
 * - in_progress: Player is actively working on it (sessions started)
 * - awaiting_proof: Within benchmark window, waiting for test
 * - resolved: Success rule satisfied
 * - regressed: Was resolved but metric fell below threshold
 * - paused: Temporarily on hold
 */
export type BpStatus =
  | 'not_started'
  | 'identified'
  | 'in_progress'
  | 'awaiting_proof'
  | 'resolved'
  | 'regressed'
  | 'paused';

export interface StatusTransition {
  from: BpStatus;
  to: BpStatus;
  reason: string;
}

/**
 * Determines if a breaking point should transition to a new status
 */
export async function shouldTransitionStatus(
  prisma: PrismaClient,
  breakingPointId: string
): Promise<StatusTransition | null> {
  const bp = await prisma.breakingPoint.findUnique({
    where: { id: breakingPointId },
  });

  if (!bp) return null;

  const currentStatus = bp.status as BpStatus;
  const effortPercent = bp.effortPercent ?? 0;
  const progressPercent = bp.progressPercent ?? 0;
  const domainCode = bp.testDomainCode as TestDomainCode | null;
  const windowDays = domainCode ? getBenchmarkWindowDays(domainCode) : 21;

  // Check if within last 7 days of benchmark window
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - windowDays);
  const proofWindowStart = new Date();
  proofWindowStart.setDate(proofWindowStart.getDate() - 7);

  // Count recent sessions
  const recentSessionCount = await prisma.trainingSession.count({
    where: {
      playerId: bp.playerId,
      completedAt: { not: null },
      sessionDate: { gte: windowStart },
    },
  });

  // Transition rules
  switch (currentStatus) {
    case 'not_started':
    case 'identified':
      // Transition to in_progress when first session is completed
      if (recentSessionCount > 0 || effortPercent > 0) {
        return {
          from: currentStatus,
          to: 'in_progress',
          reason: 'First training session completed',
        };
      }
      break;

    case 'in_progress':
      // Transition to awaiting_proof when effort is high or within proof window
      if (effortPercent >= 50) {
        return {
          from: 'in_progress',
          to: 'awaiting_proof',
          reason: 'Sufficient effort invested, awaiting benchmark test',
        };
      }
      break;

    case 'awaiting_proof':
      // Transition to resolved when progress hits 100%
      if (progressPercent >= PROGRESS_THRESHOLDS.RESOLVED) {
        return {
          from: 'awaiting_proof',
          to: 'resolved',
          reason: 'Success criteria met based on benchmark test',
        };
      }
      break;

    case 'resolved':
      // Transition to regressed if metric falls below threshold
      // (This would be checked during benchmark evaluation)
      if (progressPercent < PROGRESS_THRESHOLDS.GOOD) {
        return {
          from: 'resolved',
          to: 'regressed',
          reason: 'Performance dropped below threshold',
        };
      }
      break;

    case 'regressed':
      // Can transition back to in_progress with new effort
      if (effortPercent >= 25) {
        return {
          from: 'regressed',
          to: 'in_progress',
          reason: 'Resumed training to address regression',
        };
      }
      break;
  }

  return null;
}

/**
 * Applies a status transition if one is warranted
 */
export async function applyStatusTransition(
  prisma: PrismaClient,
  breakingPointId: string
): Promise<StatusTransition | null> {
  const transition = await shouldTransitionStatus(prisma, breakingPointId);

  if (transition) {
    await prisma.breakingPoint.update({
      where: { id: breakingPointId },
      data: {
        status: transition.to,
        resolvedDate: transition.to === 'resolved' ? new Date() : undefined,
      },
    });
  }

  return transition;
}

// ============================================================================
// STATUS QUERIES
// ============================================================================

/**
 * Gets the current status of a breaking point
 */
export async function getBreakingPointStatus(
  prisma: PrismaClient,
  input: GetBreakingPointStatusInput
): Promise<GetBreakingPointStatusOutput> {
  const bp = await prisma.breakingPoint.findUnique({
    where: { id: input.breakingPointId },
  });

  if (!bp) {
    throw new Error(`Breaking point not found: ${input.breakingPointId}`);
  }

  return {
    breakingPointId: bp.id,
    domainCode: bp.testDomainCode as TestDomainCode | null,
    effortPercent: bp.effortPercent ?? 0,
    progressPercent: bp.progressPercent ?? 0,
    isResolved: bp.resolvedDate !== null,
    lastBenchmarkDate: null, // Would need to query test results
    createdAt: bp.createdAt,
  };
}

// ============================================================================
// SERVICE FACTORY
// ============================================================================

export interface BpEvidenceService {
  recordTrainingEffort(input: RecordTrainingEffortInput): Promise<RecordTrainingEffortOutput>;
  evaluateBenchmark(input: EvaluateBenchmarkInput): Promise<EvaluateBenchmarkOutput>;
  getBreakingPointStatus(input: GetBreakingPointStatusInput): Promise<GetBreakingPointStatusOutput>;
}

export function createBpEvidenceService(prisma: PrismaClient): BpEvidenceService {
  return {
    recordTrainingEffort: (input) => recordTrainingEffort(prisma, input),
    evaluateBenchmark: (input) => evaluateBenchmark(prisma, input),
    getBreakingPointStatus: (input) => getBreakingPointStatus(prisma, input),
  };
}
