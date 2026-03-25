import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../../middleware/errors';
import {
  CreateBreakingPointInput,
  UpdateBreakingPointInput,
  UpdateProgressInput,
  ListBreakingPointsQuery,
  EvaluateBenchmarkInput,
  ConfigureEvidenceInput,
} from './schema';
import {
  recordTrainingEffort,
  evaluateBenchmark,
  getBreakingPointStatus,
  shouldTransitionStatus,
  applyStatusTransition,
  type BpStatus,
  type StatusTransition,
} from '../../../domain/performance/bp-evidence';
import {
  getProofMetricById,
  type ProofMetric,
} from '../../../domain/performance/domain-mapping';

/**
 * Breaking point with player relations
 */
type BreakingPointWithPlayer = Prisma.BreakingPointGetPayload<{
  include: {
    player: { select: { id: true; firstName: true; lastName: true; category: true } };
  };
}>;

/**
 * Success history entry
 */
interface SuccessHistoryEntry {
  date: string;
  measurement: string;
  notes?: string;
}

export interface BreakingPointListResponse {
  breakingPoints: BreakingPointWithPlayer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class BreakingPointService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new breaking point
   */
  async createBreakingPoint(tenantId: string, input: CreateBreakingPointInput): Promise<BreakingPointWithPlayer> {
    // Verify player exists
    const player = await this.prisma.player.findFirst({
      where: { id: input.playerId, tenantId },
    });

    if (!player) {
      throw new BadRequestError('Player not found');
    }

    // Verify exercises exist if assigned
    if (input.assignedExerciseIds.length > 0) {
      const exercises = await this.prisma.exercise.findMany({
        where: {
          id: { in: input.assignedExerciseIds },
          tenantId,
        },
      });

      if (exercises.length !== input.assignedExerciseIds.length) {
        throw new BadRequestError('One or more assigned exercises not found');
      }
    }

    const breakingPoint = await this.prisma.breakingPoint.create({
      data: {
        playerId: input.playerId,
        processCategory: input.processCategory,
        specificArea: input.specificArea,
        description: input.description,
        identifiedDate: new Date(input.identifiedDate),
        severity: input.severity,
        baselineMeasurement: input.baselineMeasurement,
        targetMeasurement: input.targetMeasurement,
        currentMeasurement: input.currentMeasurement,
        progressPercent: input.progressPercent,
        assignedExerciseIds: input.assignedExerciseIds,
        hoursPerWeek: input.hoursPerWeek,
        status: input.status,
        successHistory: input.successHistory as Prisma.InputJsonValue,
        resolvedDate: input.resolvedDate ? new Date(input.resolvedDate) : null,
        notes: input.notes,
      },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            category: true,
          },
        },
      },
    });

    return breakingPoint;
  }

  /**
   * Get breaking point by ID
   */
  async getBreakingPointById(tenantId: string, breakingPointId: string): Promise<BreakingPointWithPlayer> {
    const breakingPoint = await this.prisma.breakingPoint.findFirst({
      where: {
        id: breakingPointId,
        player: { tenantId },
      },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            category: true,
          },
        },
      },
    });

    if (!breakingPoint) {
      throw new NotFoundError('Breaking point not found');
    }

    // Get assigned exercises details
    if (breakingPoint.assignedExerciseIds.length > 0) {
      const exercises = await this.prisma.exercise.findMany({
        where: {
          id: { in: breakingPoint.assignedExerciseIds },
          tenantId,
        },
        select: {
          id: true,
          name: true,
          exerciseType: true,
          difficulty: true,
        },
      });

      // Return with exercises as extended property (type assertion for additional data)
      return {
        ...breakingPoint,
        assignedExercises: exercises,
      } as BreakingPointWithPlayer & { assignedExercises: typeof exercises };
    }

    return breakingPoint;
  }

  /**
   * List breaking points with filters and pagination
   */
  async listBreakingPoints(tenantId: string, query: ListBreakingPointsQuery): Promise<BreakingPointListResponse> {
    const {
      page = 1,
      limit = 50,
      playerId,
      processCategory,
      severity,
      status,
      search,
      sortBy,
      sortOrder,
    } = query;

    // Build where clause
    const where: Prisma.BreakingPointWhereInput = {
      player: { tenantId },
    };

    if (playerId) {
      where.playerId = playerId;
    }

    if (processCategory) {
      where.processCategory = processCategory;
    }

    if (severity) {
      where.severity = severity;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { specificArea: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.breakingPoint.count({ where });

    // Get breaking points
    const breakingPoints = await this.prisma.breakingPoint.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            category: true,
          },
        },
      },
    });

    return {
      breakingPoints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update breaking point
   */
  async updateBreakingPoint(
    tenantId: string,
    breakingPointId: string,
    input: UpdateBreakingPointInput
  ): Promise<BreakingPointWithPlayer> {
    // Check if breaking point exists
    const existing = await this.prisma.breakingPoint.findFirst({
      where: {
        id: breakingPointId,
        player: { tenantId },
      },
    });

    if (!existing) {
      throw new NotFoundError('Breaking point not found');
    }

    // Verify exercises if updating assigned exercises
    if (input.assignedExerciseIds && input.assignedExerciseIds.length > 0) {
      const exercises = await this.prisma.exercise.findMany({
        where: {
          id: { in: input.assignedExerciseIds },
          tenantId,
        },
      });

      if (exercises.length !== input.assignedExerciseIds.length) {
        throw new BadRequestError('One or more assigned exercises not found');
      }
    }

    // Build update data
    const updateData: Prisma.BreakingPointUpdateInput = {};

    if (input.processCategory !== undefined) updateData.processCategory = input.processCategory;
    if (input.specificArea !== undefined) updateData.specificArea = input.specificArea;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.identifiedDate !== undefined) updateData.identifiedDate = new Date(input.identifiedDate);
    if (input.severity !== undefined) updateData.severity = input.severity;
    if (input.baselineMeasurement !== undefined) updateData.baselineMeasurement = input.baselineMeasurement;
    if (input.targetMeasurement !== undefined) updateData.targetMeasurement = input.targetMeasurement;
    if (input.currentMeasurement !== undefined) updateData.currentMeasurement = input.currentMeasurement;
    if (input.progressPercent !== undefined) updateData.progressPercent = input.progressPercent;
    if (input.assignedExerciseIds !== undefined) updateData.assignedExerciseIds = input.assignedExerciseIds;
    if (input.hoursPerWeek !== undefined) updateData.hoursPerWeek = input.hoursPerWeek;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.successHistory !== undefined) updateData.successHistory = input.successHistory;
    if (input.resolvedDate !== undefined) {
      updateData.resolvedDate = input.resolvedDate ? new Date(input.resolvedDate) : null;
    }
    if (input.notes !== undefined) updateData.notes = input.notes;

    // Auto-set resolvedDate when status changes to completed
    if (input.status === 'completed' && !existing.resolvedDate) {
      updateData.resolvedDate = new Date();
    }

    const breakingPoint = await this.prisma.breakingPoint.update({
      where: { id: breakingPointId },
      data: updateData,
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            category: true,
          },
        },
      },
    });

    return breakingPoint;
  }

  /**
   * Update progress (quick update)
   */
  async updateProgress(
    tenantId: string,
    breakingPointId: string,
    input: UpdateProgressInput
  ): Promise<BreakingPointWithPlayer> {
    const existing = await this.prisma.breakingPoint.findFirst({
      where: {
        id: breakingPointId,
        player: { tenantId },
      },
    });

    if (!existing) {
      throw new NotFoundError('Breaking point not found');
    }

    // Add to success history
    const successHistory = (existing.successHistory as SuccessHistoryEntry[] | null) ?? [];
    const newEntry: SuccessHistoryEntry = {
      date: new Date().toISOString().split('T')[0],
      measurement: input.currentMeasurement || '',
      notes: input.notes,
    };
    successHistory.push(newEntry);

    const updateData: Prisma.BreakingPointUpdateInput = {
      currentMeasurement: input.currentMeasurement,
      progressPercent: input.progressPercent,
      successHistory: successHistory as unknown as Prisma.InputJsonValue,
    };

    if (input.status) {
      updateData.status = input.status;

      // Auto-set resolvedDate when status changes to completed
      if (input.status === 'completed' && !existing.resolvedDate) {
        updateData.resolvedDate = new Date();
      }
    }

    if (input.notes) {
      updateData.notes = input.notes;
    }

    const breakingPoint = await this.prisma.breakingPoint.update({
      where: { id: breakingPointId },
      data: updateData,
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            category: true,
          },
        },
      },
    });

    return breakingPoint;
  }

  /**
   * Delete breaking point
   */
  async deleteBreakingPoint(tenantId: string, breakingPointId: string): Promise<void> {
    const breakingPoint = await this.prisma.breakingPoint.findFirst({
      where: {
        id: breakingPointId,
        player: { tenantId },
      },
    });

    if (!breakingPoint) {
      throw new NotFoundError('Breaking point not found');
    }

    await this.prisma.breakingPoint.delete({
      where: { id: breakingPointId },
    });
  }

  // ==========================================================================
  // BP-EVIDENCE METHODS (V2)
  // ==========================================================================

  /**
   * Record training effort for a breaking point
   * This increases effortPercent based on completed sessions, NOT progressPercent
   */
  async recordEffort(tenantId: string, breakingPointId: string) {
    // Verify BP exists and belongs to tenant
    const bp = await this.prisma.breakingPoint.findFirst({
      where: {
        id: breakingPointId,
        player: { tenantId },
      },
    });

    if (!bp) {
      throw new NotFoundError('Breaking point not found');
    }

    // Record effort using bp-evidence service
    const result = await recordTrainingEffort(this.prisma, { breakingPointId });

    // Check for status transition
    const transition = await applyStatusTransition(this.prisma, breakingPointId);

    return {
      ...result,
      statusTransition: transition,
    };
  }

  /**
   * Evaluate a benchmark test result against the breaking point
   * This is the ONLY way to increase progressPercent
   */
  async evaluateBenchmarkTest(
    tenantId: string,
    breakingPointId: string,
    input: EvaluateBenchmarkInput
  ) {
    // Verify BP exists and belongs to tenant
    const bp = await this.prisma.breakingPoint.findFirst({
      where: {
        id: breakingPointId,
        player: { tenantId },
      },
    });

    if (!bp) {
      throw new NotFoundError('Breaking point not found');
    }

    // Get proof metric - either from input override or from BP configuration
    const metricId = input.metricId || bp.proofMetricId;
    if (!metricId) {
      throw new BadRequestError(
        'No proof metric configured. Set proofMetricId on the breaking point or provide metricId in request.'
      );
    }

    const proofMetric = getProofMetricById(metricId);
    if (!proofMetric) {
      throw new BadRequestError(`Unknown proof metric: ${metricId}`);
    }

    // Get success rule - either from input override or from BP configuration
    const successRule = input.successRule || bp.successRule;
    if (!successRule) {
      throw new BadRequestError(
        'No success rule configured. Set successRule on the breaking point or provide successRule in request.'
      );
    }

    // Evaluate benchmark
    const result = await evaluateBenchmark(this.prisma, {
      breakingPointId,
      proofMetric: {
        metricId: proofMetric.id,
        direction: proofMetric.direction,
      },
      testValue: input.testValue,
      testDate: new Date(input.testDate || new Date()),
      successRule,
    });

    // Check for status transition
    const transition = await applyStatusTransition(this.prisma, breakingPointId);

    return {
      ...result,
      statusTransition: transition,
    };
  }

  /**
   * Get detailed evidence status for a breaking point
   */
  async getEvidenceStatus(tenantId: string, breakingPointId: string) {
    // Verify BP exists and belongs to tenant
    const bp = await this.prisma.breakingPoint.findFirst({
      where: {
        id: breakingPointId,
        player: { tenantId },
      },
      include: {
        player: {
          select: { id: true, firstName: true, lastName: true, category: true },
        },
      },
    });

    if (!bp) {
      throw new NotFoundError('Breaking point not found');
    }

    // Get status from bp-evidence service
    const status = await getBreakingPointStatus(this.prisma, { breakingPointId });

    // Check if a transition is pending
    const pendingTransition = await shouldTransitionStatus(this.prisma, breakingPointId);

    // Get proof metric details if configured
    let proofMetricDetails: ProofMetric | null = null;
    if (bp.proofMetricId) {
      proofMetricDetails = getProofMetricById(bp.proofMetricId);
    }

    return {
      breakingPoint: {
        id: bp.id,
        specificArea: bp.specificArea,
        description: bp.description,
        status: bp.status as BpStatus,
        player: bp.player,
      },
      evidence: {
        effortPercent: status.effortPercent,
        progressPercent: status.progressPercent,
        isResolved: status.isResolved,
        lastBenchmarkDate: status.lastBenchmarkDate,
        createdAt: status.createdAt,
      },
      configuration: {
        testDomainCode: bp.testDomainCode,
        proofMetricId: bp.proofMetricId,
        proofMetricDetails,
        successRule: bp.successRule,
        benchmarkTestId: bp.benchmarkTestId,
        benchmarkWindowDays: bp.benchmarkWindowDays,
        confidence: bp.confidence,
      },
      pendingTransition,
    };
  }

  /**
   * Configure evidence tracking for a breaking point
   */
  async configureEvidence(
    tenantId: string,
    breakingPointId: string,
    input: ConfigureEvidenceInput
  ) {
    // Verify BP exists and belongs to tenant
    const bp = await this.prisma.breakingPoint.findFirst({
      where: {
        id: breakingPointId,
        player: { tenantId },
      },
    });

    if (!bp) {
      throw new NotFoundError('Breaking point not found');
    }

    // Validate proof metric if provided
    if (input.proofMetricId) {
      const metric = getProofMetricById(input.proofMetricId);
      if (!metric) {
        throw new BadRequestError(`Unknown proof metric: ${input.proofMetricId}`);
      }
    }

    // Update BP with evidence configuration
    const updated = await this.prisma.breakingPoint.update({
      where: { id: breakingPointId },
      data: {
        testDomainCode: input.testDomainCode,
        proofMetricId: input.proofMetricId,
        successRule: input.successRule,
        benchmarkTestId: input.benchmarkTestId,
        benchmarkWindowDays: input.benchmarkWindowDays,
      },
      include: {
        player: {
          select: { id: true, firstName: true, lastName: true, category: true },
        },
      },
    });

    return updated;
  }

  /**
   * Apply pending status transition
   */
  async applyTransition(tenantId: string, breakingPointId: string): Promise<StatusTransition | null> {
    // Verify BP exists and belongs to tenant
    const bp = await this.prisma.breakingPoint.findFirst({
      where: {
        id: breakingPointId,
        player: { tenantId },
      },
    });

    if (!bp) {
      throw new NotFoundError('Breaking point not found');
    }

    return applyStatusTransition(this.prisma, breakingPointId);
  }
}
