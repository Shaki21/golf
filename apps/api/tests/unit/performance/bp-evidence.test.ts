/**
 * BP Evidence Service Unit Tests
 * Tests for evidence-based progress tracking
 *
 * KEY PRINCIPLE: Completion affects effort, NOT progress.
 * Progress only changes when benchmark test shows improvement.
 */

import { PrismaClient } from '@prisma/client';
import {
  createBpEvidenceService,
  shouldTransitionStatus,
  evaluateSuccessRule,
  buildDefaultSuccessRule,
  calculateEffortFromSessions,
  PROGRESS_THRESHOLDS,
  type BpStatus,
} from '../../../src/domain/performance/bp-evidence';
import { parseSuccessRule } from '../../../src/domain/performance/domain-mapping';

// Mock Prisma Client
const createMockPrisma = () =>
  ({
    breakingPoint: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    trainingSession: {
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    testResult: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  } as unknown as PrismaClient);

describe('BpEvidenceService', () => {
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  const mockBreakingPoint = {
    id: 'bp-1',
    playerId: 'player-1',
    testDomainCode: 'TEE',
    status: 'in_progress',
    effortPercent: 30,
    progressPercent: 0,
    hoursPerWeek: 3,
    benchmarkTestId: 1,
    benchmarkWindowDays: 21,
    baselineMeasurement: '180',
    targetMeasurement: '220',
    currentMeasurement: null,
    successRule: 'DRIVER_DISTANCE_CARRY:>=:220',
    createdAt: new Date(),
    resolvedDate: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = createMockPrisma();
  });

  describe('createBpEvidenceService', () => {
    it('should create a service with required methods', () => {
      const service = createBpEvidenceService(mockPrisma);

      expect(service).toBeDefined();
      expect(typeof service.recordTrainingEffort).toBe('function');
      expect(typeof service.evaluateBenchmark).toBe('function');
      expect(typeof service.getBreakingPointStatus).toBe('function');
    });
  });

  describe('recordTrainingEffort', () => {
    it('should update effort based on session count', async () => {
      (mockPrisma.breakingPoint.findUnique as jest.Mock).mockResolvedValue(mockBreakingPoint);
      (mockPrisma.trainingSession.count as jest.Mock).mockResolvedValue(6);
      (mockPrisma.breakingPoint.update as jest.Mock).mockResolvedValue({
        ...mockBreakingPoint,
        effortPercent: 50,
      });

      const service = createBpEvidenceService(mockPrisma);
      const result = await service.recordTrainingEffort({
        breakingPointId: 'bp-1',
      });

      expect(result.breakingPointId).toBe('bp-1');
      expect(result.previousEffort).toBe(30);
      expect(result.newEffort).toBeGreaterThanOrEqual(0);
      expect(result.sessionsCounted).toBe(6);
    });

    it('should throw error if breaking point not found', async () => {
      (mockPrisma.breakingPoint.findUnique as jest.Mock).mockResolvedValue(null);

      const service = createBpEvidenceService(mockPrisma);

      await expect(
        service.recordTrainingEffort({ breakingPointId: 'nonexistent' })
      ).rejects.toThrow('Breaking point not found');
    });
  });

  describe('evaluateBenchmark', () => {
    it('should update progress when benchmark meets target', async () => {
      (mockPrisma.breakingPoint.findUnique as jest.Mock).mockResolvedValue({
        ...mockBreakingPoint,
        progressPercent: 50,
      });
      (mockPrisma.breakingPoint.update as jest.Mock).mockResolvedValue({});

      const service = createBpEvidenceService(mockPrisma);
      const result = await service.evaluateBenchmark({
        breakingPointId: 'bp-1',
        proofMetric: {
          metricId: 'DRIVER_DISTANCE_CARRY',
          label: 'Driver Carry',
          unit: 'm',
          direction: 'higher_better',
        },
        testValue: 225,
        testDate: new Date(),
        successRule: 'DRIVER_DISTANCE_CARRY:>=:220',
      });

      expect(result.breakingPointId).toBe('bp-1');
      expect(result.meetsTarget).toBe(true);
      expect(result.newProgress).toBe(PROGRESS_THRESHOLDS.RESOLVED);
      expect(result.isResolved).toBe(true);
    });

    it('should calculate partial progress for improvement', async () => {
      (mockPrisma.breakingPoint.findUnique as jest.Mock).mockResolvedValue({
        ...mockBreakingPoint,
        currentMeasurement: '180',
        progressPercent: 0,
      });
      (mockPrisma.breakingPoint.update as jest.Mock).mockResolvedValue({});

      const service = createBpEvidenceService(mockPrisma);
      const result = await service.evaluateBenchmark({
        breakingPointId: 'bp-1',
        proofMetric: {
          metricId: 'DRIVER_DISTANCE_CARRY',
          label: 'Driver Carry',
          unit: 'm',
          direction: 'higher_better',
        },
        testValue: 200, // Progress but not at target
        testDate: new Date(),
        successRule: 'DRIVER_DISTANCE_CARRY:>=:220',
      });

      expect(result.meetsTarget).toBe(false);
      expect(result.benchmarkResult.improvementPercent).toBeGreaterThan(0);
    });

    it('should throw error if breaking point not found', async () => {
      (mockPrisma.breakingPoint.findUnique as jest.Mock).mockResolvedValue(null);

      const service = createBpEvidenceService(mockPrisma);

      await expect(
        service.evaluateBenchmark({
          breakingPointId: 'nonexistent',
          proofMetric: { metricId: 'test', label: 'Test', unit: 'm', direction: 'higher_better' },
          testValue: 200,
          testDate: new Date(),
          successRule: 'test:>=:180',
        })
      ).rejects.toThrow('Breaking point not found');
    });
  });

  describe('getBreakingPointStatus', () => {
    it('should return current status of breaking point', async () => {
      (mockPrisma.breakingPoint.findUnique as jest.Mock).mockResolvedValue(mockBreakingPoint);

      const service = createBpEvidenceService(mockPrisma);
      const result = await service.getBreakingPointStatus({
        breakingPointId: 'bp-1',
      });

      expect(result.breakingPointId).toBe('bp-1');
      expect(result.domainCode).toBe('TEE');
      expect(result.effortPercent).toBe(30);
      expect(result.progressPercent).toBe(0);
      expect(result.isResolved).toBe(false);
    });

    it('should throw error if breaking point not found', async () => {
      (mockPrisma.breakingPoint.findUnique as jest.Mock).mockResolvedValue(null);

      const service = createBpEvidenceService(mockPrisma);

      await expect(
        service.getBreakingPointStatus({ breakingPointId: 'nonexistent' })
      ).rejects.toThrow('Breaking point not found');
    });
  });

  describe('shouldTransitionStatus', () => {
    it('should transition from not_started to in_progress when effort starts', async () => {
      (mockPrisma.breakingPoint.findUnique as jest.Mock).mockResolvedValue({
        ...mockBreakingPoint,
        status: 'not_started',
        effortPercent: 10,
      });
      (mockPrisma.trainingSession.count as jest.Mock).mockResolvedValue(2);

      const result = await shouldTransitionStatus(mockPrisma, 'bp-1');

      expect(result).not.toBeNull();
      expect(result?.from).toBe('not_started');
      expect(result?.to).toBe('in_progress');
    });

    it('should transition from in_progress to awaiting_proof when effort is high', async () => {
      (mockPrisma.breakingPoint.findUnique as jest.Mock).mockResolvedValue({
        ...mockBreakingPoint,
        status: 'in_progress',
        effortPercent: 60,
      });
      (mockPrisma.trainingSession.count as jest.Mock).mockResolvedValue(15);

      const result = await shouldTransitionStatus(mockPrisma, 'bp-1');

      expect(result).not.toBeNull();
      expect(result?.to).toBe('awaiting_proof');
    });

    it('should transition to resolved when progress hits 100%', async () => {
      (mockPrisma.breakingPoint.findUnique as jest.Mock).mockResolvedValue({
        ...mockBreakingPoint,
        status: 'awaiting_proof',
        progressPercent: PROGRESS_THRESHOLDS.RESOLVED,
      });
      (mockPrisma.trainingSession.count as jest.Mock).mockResolvedValue(20);

      const result = await shouldTransitionStatus(mockPrisma, 'bp-1');

      expect(result).not.toBeNull();
      expect(result?.to).toBe('resolved');
    });

    it('should return null if no transition needed', async () => {
      (mockPrisma.breakingPoint.findUnique as jest.Mock).mockResolvedValue({
        ...mockBreakingPoint,
        status: 'in_progress',
        effortPercent: 30,
        progressPercent: 20,
      });
      (mockPrisma.trainingSession.count as jest.Mock).mockResolvedValue(5);

      const result = await shouldTransitionStatus(mockPrisma, 'bp-1');

      expect(result).toBeNull();
    });

    it('should return null if breaking point not found', async () => {
      (mockPrisma.breakingPoint.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await shouldTransitionStatus(mockPrisma, 'nonexistent');

      expect(result).toBeNull();
    });
  });
});

describe('evaluateSuccessRule', () => {
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
  });

  it('should evaluate test pass rule', async () => {
    (mockPrisma.testResult.findFirst as jest.Mock).mockResolvedValue({
      value: '85',
      passed: true,
      testDate: new Date(),
    });

    const result = await evaluateSuccessRule(mockPrisma, {
      playerId: 'player-1',
      successRule: '15:pass',
      benchmarkTestId: 15,
      benchmarkWindowDays: 21,
      asOfDate: new Date(),
    });

    expect(result.passed).toBe(true);
    expect(result.operator).toBe('pass');
  });

  it('should fail test pass rule when test not passed', async () => {
    (mockPrisma.testResult.findFirst as jest.Mock).mockResolvedValue({
      value: '0',
      passed: false,
      testDate: new Date(),
    });

    const result = await evaluateSuccessRule(mockPrisma, {
      playerId: 'player-1',
      successRule: '15:pass',
      benchmarkTestId: 15,
      benchmarkWindowDays: 21,
      asOfDate: new Date(),
    });

    expect(result.passed).toBe(false);
  });

  it('should return invalid for unparseable rules', async () => {
    const result = await evaluateSuccessRule(mockPrisma, {
      playerId: 'player-1',
      successRule: 'invalid_rule',
      benchmarkTestId: null,
      benchmarkWindowDays: 21,
      asOfDate: new Date(),
    });

    expect(result.passed).toBe(false);
    expect(result.reason).toBe('invalid_rule_format');
  });

  it('should evaluate metric threshold rule', async () => {
    (mockPrisma.testResult.findFirst as jest.Mock).mockResolvedValue({
      value: '230',
      testDate: new Date(),
    });

    const result = await evaluateSuccessRule(mockPrisma, {
      playerId: 'player-1',
      successRule: 'DRIVER_DISTANCE_CARRY:>=:220',
      benchmarkTestId: 1,
      benchmarkWindowDays: 21,
      asOfDate: new Date(),
    });

    expect(result.passed).toBe(true);
    expect(result.operator).toBe('>=');
    expect(result.actualValue).toBe(230);
    expect(result.requiredValue).toBe(220);
  });

  it('should fail metric threshold when not met', async () => {
    (mockPrisma.testResult.findFirst as jest.Mock).mockResolvedValue({
      value: '200',
      testDate: new Date(),
    });

    const result = await evaluateSuccessRule(mockPrisma, {
      playerId: 'player-1',
      successRule: 'DRIVER_DISTANCE_CARRY:>=:220',
      benchmarkTestId: 1,
      benchmarkWindowDays: 21,
      asOfDate: new Date(),
    });

    expect(result.passed).toBe(false);
    expect(result.actualValue).toBe(200);
  });

  it('should return no_test_in_window when no test found', async () => {
    (mockPrisma.testResult.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await evaluateSuccessRule(mockPrisma, {
      playerId: 'player-1',
      successRule: 'DRIVER_DISTANCE_CARRY:>=:220',
      benchmarkTestId: 1,
      benchmarkWindowDays: 21,
      asOfDate: new Date(),
    });

    expect(result.passed).toBe(false);
    expect(result.reason).toBe('no_test_in_window');
  });
});

describe('buildDefaultSuccessRule', () => {
  it('should build threshold rule for small gaps', () => {
    const rule = buildDefaultSuccessRule(1, 210, 220, '>=');

    expect(rule).toContain('1');
    expect(rule).toContain('>=');
    expect(rule).toContain('220');
  });

  it('should build improvement rule for large gaps', () => {
    const rule = buildDefaultSuccessRule(1, 150, 220, '>=');

    expect(rule).toContain('improvement');
    expect(rule).toContain('percent');
  });

  it('should use threshold rule when gap is less than 15%', () => {
    // 210 to 220 = 4.8% gap
    const rule = buildDefaultSuccessRule(1, 210, 220, '>=');
    expect(rule).not.toContain('improvement');
  });
});

describe('calculateEffortFromSessions', () => {
  it('should return 0 for 0 sessions', () => {
    expect(calculateEffortFromSessions(0)).toBe(0);
  });

  it('should return proportional effort for sessions', () => {
    const effort5 = calculateEffortFromSessions(5);
    const effort10 = calculateEffortFromSessions(10);

    expect(effort5).toBeGreaterThan(0);
    expect(effort10).toBeGreaterThan(effort5);
  });

  it('should cap effort at MAX_EFFORT_PERCENT (150%)', () => {
    // MAX_EFFORT_PERCENT is 150 to show "extra effort"
    const effort = calculateEffortFromSessions(100);
    expect(effort).toBeLessThanOrEqual(150);
    expect(effort).toBe(150); // 100 sessions = 1000% raw, capped at 150%
  });
});

describe('parseSuccessRule', () => {
  it('should parse test pass rule', () => {
    const result = parseSuccessRule('15:pass');

    expect(result).not.toBeNull();
    expect(result?.type).toBe('test_pass');
    expect(result?.testId).toBe(15);
  });

  it('should parse metric threshold rule', () => {
    const result = parseSuccessRule('DRIVER_DISTANCE_CARRY:>=:230');

    expect(result).not.toBeNull();
    expect(result?.type).toBe('metric_threshold');
    expect(result?.metricId).toBe('DRIVER_DISTANCE_CARRY');
    expect(result?.operator).toBe('>=');
    expect(result?.threshold).toBe(230);
  });

  it('should parse improvement percent rule', () => {
    const result = parseSuccessRule('improvement:percent:15');

    expect(result).not.toBeNull();
    expect(result?.type).toBe('improvement_percent');
    expect(result?.improvementPercent).toBe(15);
  });

  it('should return null for invalid rules', () => {
    expect(parseSuccessRule('')).toBeNull();
    expect(parseSuccessRule('invalid')).toBeNull();
  });
});
