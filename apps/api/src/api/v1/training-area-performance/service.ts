import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../../middleware/errors';
import {
  CreatePerformanceInput,
  UpdatePerformanceInput,
  ListPerformanceQuery,
  ProgressStatsQuery,
} from './schema';

/**
 * Training Area Performance with relations
 */
type PerformanceWithRelations = Prisma.TrainingAreaPerformanceGetPayload<{
  include: {
    session: { select: { id: true; sessionDate: true; focusArea: true } };
  };
}>;

export interface PerformanceListResponse {
  performances: PerformanceWithRelations[];
  total: number;
}

export interface ProgressStats {
  trainingArea: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalSessions: number;
  averageSuccessRate: number | null;
  averageConsistencyScore: number | null;
  improvement: {
    successRate: number | null; // percentage points change
    consistencyScore: number | null; // points change
  };
  recentPerformances: Array<{
    date: string;
    successRate: number | null;
    consistencyScore: number | null;
  }>;
  nextLevelRequirements?: {
    currentLevel: string;
    nextLevel: string;
    requirements: {
      successRate: number;
      consistencyScore: number;
      description: string;
    };
  };
}

export class TrainingAreaPerformanceService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new performance entry
   */
  async createPerformance(
    tenantId: string,
    playerId: string,
    input: CreatePerformanceInput
  ): Promise<PerformanceWithRelations> {
    // Validate session exists if provided
    if (input.sessionId) {
      const session = await this.prisma.trainingSession.findFirst({
        where: { id: input.sessionId, playerId },
      });

      if (!session) {
        throw new BadRequestError('Training session not found');
      }
    }

    const performance = await this.prisma.trainingAreaPerformance.create({
      data: {
        tenantId,
        playerId,
        trainingArea: input.trainingArea,
        performanceDate: new Date(input.performanceDate),
        sessionId: input.sessionId,
        successRate: input.successRate ? new Prisma.Decimal(input.successRate) : null,
        accuracy: input.accuracy ? new Prisma.Decimal(input.accuracy) : null,
        consistencyScore: input.consistencyScore,
        repetitions: input.repetitions,
        successfulReps: input.successfulReps,
        distanceMeters: input.distanceMeters ? new Prisma.Decimal(input.distanceMeters) : null,
        carryDistance: input.carryDistance ? new Prisma.Decimal(input.carryDistance) : null,
        dispersion: input.dispersion ? new Prisma.Decimal(input.dispersion) : null,
        averageDistanceFromTarget: input.averageDistanceFromTarget
          ? new Prisma.Decimal(input.averageDistanceFromTarget)
          : null,
        madePutts: input.madePutts,
        totalPutts: input.totalPutts,
        upAndDownSuccess: input.upAndDownSuccess,
        upAndDownAttempts: input.upAndDownAttempts,
        learningPhase: input.learningPhase,
        clubSpeed: input.clubSpeed,
        environment: input.environment,
        pressure: input.pressure,
        feelRating: input.feelRating,
        technicalRating: input.technicalRating,
        mentalRating: input.mentalRating,
        notes: input.notes,
        keyLearning: input.keyLearning,
        nextFocus: input.nextFocus,
      },
      include: {
        session: {
          select: {
            id: true,
            sessionDate: true,
            focusArea: true,
          },
        },
      },
    });

    return performance;
  }

  /**
   * Get performance by ID
   */
  async getPerformanceById(
    tenantId: string,
    playerId: string,
    performanceId: string
  ): Promise<PerformanceWithRelations> {
    const performance = await this.prisma.trainingAreaPerformance.findFirst({
      where: {
        id: performanceId,
        tenantId,
        playerId,
      },
      include: {
        session: {
          select: {
            id: true,
            sessionDate: true,
            focusArea: true,
          },
        },
      },
    });

    if (!performance) {
      throw new NotFoundError('Performance entry not found');
    }

    return performance;
  }

  /**
   * List performances with filters
   */
  async listPerformances(
    tenantId: string,
    playerId: string,
    query: ListPerformanceQuery
  ): Promise<PerformanceListResponse> {
    const where: Prisma.TrainingAreaPerformanceWhereInput = {
      tenantId,
      playerId,
      ...(query.trainingArea && { trainingArea: query.trainingArea }),
      ...(query.sessionId && { sessionId: query.sessionId }),
      ...(query.startDate &&
        query.endDate && {
          performanceDate: {
            gte: new Date(query.startDate),
            lte: new Date(query.endDate),
          },
        }),
    };

    const [performances, total] = await Promise.all([
      this.prisma.trainingAreaPerformance.findMany({
        where,
        include: {
          session: {
            select: {
              id: true,
              sessionDate: true,
              focusArea: true,
            },
          },
        },
        orderBy: { performanceDate: 'desc' },
        take: query.limit || 50,
        skip: query.offset || 0,
      }),
      this.prisma.trainingAreaPerformance.count({ where }),
    ]);

    return { performances, total };
  }

  /**
   * Update performance entry
   */
  async updatePerformance(
    tenantId: string,
    playerId: string,
    performanceId: string,
    input: UpdatePerformanceInput
  ): Promise<PerformanceWithRelations> {
    // Check if performance exists
    await this.getPerformanceById(tenantId, playerId, performanceId);

    const performance = await this.prisma.trainingAreaPerformance.update({
      where: { id: performanceId },
      data: {
        ...(input.trainingArea && { trainingArea: input.trainingArea }),
        ...(input.performanceDate && { performanceDate: new Date(input.performanceDate) }),
        ...(input.successRate !== undefined && { successRate: input.successRate ? new Prisma.Decimal(input.successRate) : null }),
        ...(input.accuracy !== undefined && { accuracy: input.accuracy ? new Prisma.Decimal(input.accuracy) : null }),
        ...(input.consistencyScore !== undefined && { consistencyScore: input.consistencyScore }),
        ...(input.repetitions !== undefined && { repetitions: input.repetitions }),
        ...(input.successfulReps !== undefined && { successfulReps: input.successfulReps }),
        ...(input.distanceMeters !== undefined && {
          distanceMeters: input.distanceMeters ? new Prisma.Decimal(input.distanceMeters) : null,
        }),
        ...(input.carryDistance !== undefined && {
          carryDistance: input.carryDistance ? new Prisma.Decimal(input.carryDistance) : null,
        }),
        ...(input.dispersion !== undefined && {
          dispersion: input.dispersion ? new Prisma.Decimal(input.dispersion) : null,
        }),
        ...(input.averageDistanceFromTarget !== undefined && {
          averageDistanceFromTarget: input.averageDistanceFromTarget
            ? new Prisma.Decimal(input.averageDistanceFromTarget)
            : null,
        }),
        ...(input.madePutts !== undefined && { madePutts: input.madePutts }),
        ...(input.totalPutts !== undefined && { totalPutts: input.totalPutts }),
        ...(input.upAndDownSuccess !== undefined && { upAndDownSuccess: input.upAndDownSuccess }),
        ...(input.upAndDownAttempts !== undefined && { upAndDownAttempts: input.upAndDownAttempts }),
        ...(input.learningPhase !== undefined && { learningPhase: input.learningPhase }),
        ...(input.clubSpeed !== undefined && { clubSpeed: input.clubSpeed }),
        ...(input.environment !== undefined && { environment: input.environment }),
        ...(input.pressure !== undefined && { pressure: input.pressure }),
        ...(input.feelRating !== undefined && { feelRating: input.feelRating }),
        ...(input.technicalRating !== undefined && { technicalRating: input.technicalRating }),
        ...(input.mentalRating !== undefined && { mentalRating: input.mentalRating }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.keyLearning !== undefined && { keyLearning: input.keyLearning }),
        ...(input.nextFocus !== undefined && { nextFocus: input.nextFocus }),
      },
      include: {
        session: {
          select: {
            id: true,
            sessionDate: true,
            focusArea: true,
          },
        },
      },
    });

    return performance;
  }

  /**
   * Delete performance entry
   */
  async deletePerformance(
    tenantId: string,
    playerId: string,
    performanceId: string
  ): Promise<void> {
    // Check if performance exists
    await this.getPerformanceById(tenantId, playerId, performanceId);

    await this.prisma.trainingAreaPerformance.delete({
      where: { id: performanceId },
    });
  }

  /**
   * Get progress statistics for a training area over time
   */
  async getProgressStats(
    tenantId: string,
    playerId: string,
    query: ProgressStatsQuery
  ): Promise<ProgressStats> {
    const performances = await this.prisma.trainingAreaPerformance.findMany({
      where: {
        tenantId,
        playerId,
        trainingArea: query.trainingArea,
        performanceDate: {
          gte: new Date(query.startDate),
          lte: new Date(query.endDate),
        },
      },
      orderBy: { performanceDate: 'asc' },
      select: {
        performanceDate: true,
        successRate: true,
        consistencyScore: true,
      },
    });

    const totalSessions = performances.length;

    // Calculate averages
    const avgSuccessRate =
      performances.reduce((sum, p) => sum + Number(p.successRate || 0), 0) / totalSessions || null;
    const avgConsistencyScore =
      performances.reduce((sum, p) => sum + (p.consistencyScore || 0), 0) / totalSessions || null;

    // Calculate improvement (first vs last 3 sessions)
    const firstThree = performances.slice(0, Math.min(3, totalSessions));
    const lastThree = performances.slice(Math.max(0, totalSessions - 3));

    const firstAvgSuccess =
      firstThree.reduce((sum, p) => sum + Number(p.successRate || 0), 0) / firstThree.length || 0;
    const lastAvgSuccess =
      lastThree.reduce((sum, p) => sum + Number(p.successRate || 0), 0) / lastThree.length || 0;

    const firstAvgConsistency =
      firstThree.reduce((sum, p) => sum + (p.consistencyScore || 0), 0) / firstThree.length || 0;
    const lastAvgConsistency =
      lastThree.reduce((sum, p) => sum + (p.consistencyScore || 0), 0) / lastThree.length || 0;

    return {
      trainingArea: query.trainingArea,
      period: {
        startDate: query.startDate,
        endDate: query.endDate,
      },
      totalSessions,
      averageSuccessRate: avgSuccessRate,
      averageConsistencyScore: avgConsistencyScore,
      improvement: {
        successRate: lastAvgSuccess - firstAvgSuccess,
        consistencyScore: lastAvgConsistency - firstAvgConsistency,
      },
      recentPerformances: performances.slice(-10).map((p) => ({
        date: p.performanceDate.toISOString().split('T')[0],
        successRate: p.successRate ? Number(p.successRate) : null,
        consistencyScore: p.consistencyScore,
      })),
      // TODO: Add next level requirements based on category system
    };
  }
}
