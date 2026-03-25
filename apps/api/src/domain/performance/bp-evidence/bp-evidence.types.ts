/**
 * Breaking Point Evidence Types
 * Types for evidence-based progress tracking
 */

import type { TestDomainCode, ProofMetric } from '../domain-mapping';

// ============================================================================
// EVIDENCE TYPES
// ============================================================================

export interface TestResultEvidence {
  testResultId: string;
  testNumber: number;
  value: number;
  testDate: Date;
  meetsThreshold: boolean;
}

export interface TrainingEvidence {
  sessionId: string;
  sessionDate: Date;
  exerciseCount: number;
  totalDuration: number;
}

export interface BenchmarkResult {
  metricId: string;
  currentValue: number;
  previousValue: number | null;
  targetValue: number;
  improvementPercent: number;
  meetsTarget: boolean;
  testDate: Date;
}

// ============================================================================
// BREAKING POINT TYPES
// ============================================================================

export interface BreakingPointProgress {
  breakingPointId: string;
  domainCode: TestDomainCode;
  effortPercent: number;
  progressPercent: number;
  lastBenchmarkDate: Date | null;
  benchmarkResult: BenchmarkResult | null;
  trainingSessionCount: number;
  isResolved: boolean;
}

export interface BreakingPointUpdate {
  effortPercent?: number;
  progressPercent?: number;
  lastBenchmarkDate?: Date;
  isResolved?: boolean;
}

// ============================================================================
// SERVICE INPUT/OUTPUT TYPES
// ============================================================================

export interface RecordTrainingEffortInput {
  breakingPointId: string;
  sessionId: string;
  sessionDate: Date;
}

export interface RecordTrainingEffortOutput {
  breakingPointId: string;
  previousEffort: number;
  newEffort: number;
  sessionsCounted: number;
}

export interface EvaluateBenchmarkInput {
  breakingPointId: string;
  testResultId: string;
  domainCode: TestDomainCode;
  proofMetric: ProofMetric;
  testValue: number;
  testDate: Date;
  successRule: string;
}

export interface EvaluateBenchmarkOutput {
  breakingPointId: string;
  previousProgress: number;
  newProgress: number;
  meetsTarget: boolean;
  isResolved: boolean;
  benchmarkResult: BenchmarkResult;
}

export interface GetBreakingPointStatusInput {
  breakingPointId: string;
}

export interface GetBreakingPointStatusOutput {
  breakingPointId: string;
  domainCode: TestDomainCode | null;
  effortPercent: number;
  progressPercent: number;
  isResolved: boolean;
  lastBenchmarkDate: Date | null;
  createdAt: Date;
}

// ============================================================================
// SUCCESS RULE EVALUATION TYPES
// ============================================================================

export interface SuccessRuleContext {
  playerId: string;
  successRule: string;
  benchmarkTestId: number | null;
  benchmarkWindowDays: number;
  asOfDate: Date;
}

export interface SuccessRuleResult {
  passed: boolean;
  rule: string;
  actualValue: number | null;
  requiredValue: number | null;
  operator: string | null;
  reason: string;
  evidenceDate: Date | null;
}
