/**
 * Breaking Point Evidence Module
 * Exports for evidence-based progress tracking
 */

export {
  recordTrainingEffort,
  evaluateBenchmark,
  getBreakingPointStatus,
  createBpEvidenceService,
  shouldTransitionStatus,
  applyStatusTransition,
  type BpEvidenceService,
  type BpStatus,
  type StatusTransition,
} from './bp-evidence.service';

export type {
  TestResultEvidence,
  TrainingEvidence,
  BenchmarkResult,
  BreakingPointProgress,
  BreakingPointUpdate,
  RecordTrainingEffortInput,
  RecordTrainingEffortOutput,
  EvaluateBenchmarkInput,
  EvaluateBenchmarkOutput,
  GetBreakingPointStatusInput,
  GetBreakingPointStatusOutput,
  SuccessRuleContext,
  SuccessRuleResult,
} from './bp-evidence.types';

export {
  evaluateSuccessRule,
  buildDefaultSuccessRule,
} from './bp-evidence.rules';

export {
  SESSIONS_FOR_FULL_EFFORT,
  MIN_EFFORT_PER_SESSION,
  MAX_EFFORT_PERCENT,
  PROGRESS_THRESHOLDS,
  DEFAULT_BENCHMARK_WINDOW_DAYS,
  CONFIDENCE_THRESHOLDS,
  calculateEffortFromSessions,
  getConfidenceLevel,
  type ConfidenceLevel,
} from './bp-evidence.config';
