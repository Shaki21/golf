import { PrismaClient, TrainingSession, Prisma } from '@prisma/client';
import { validationError } from '../../../core/errors';
import { NotFoundError } from '../../../middleware/errors';
import {
  CreateSessionInput,
  UpdateSessionInput,
  SessionEvaluationInput,
  CompleteSessionInput,
  ListSessionsQuery,
  PlayerSessionsQuery,
} from './schema';
import {
  AntiGamingService,
  createAntiGamingService,
  ValidationResult,
} from '../../../domain/gamification/anti-gaming';
import {
  BadgeEvaluatorService,
  createBadgeEvaluatorService,
} from '../../../domain/gamification/badge-evaluator';
import { BadgeUnlockEvent } from '../../../domain/gamification/types';
import { logger } from '../../../utils/logger';

export interface SessionCompletionResult {
  session: TrainingSession;
  badgeUnlocks?: BadgeUnlockEvent[];
  xpGained?: number;
  newLevel?: number;
}

export class SessionService {
  private antiGaming: AntiGamingService;
  private badgeEvaluator: BadgeEvaluatorService;

  constructor(private prisma: PrismaClient) {
    this.antiGaming = createAntiGamingService(prisma);
    this.badgeEvaluator = createBadgeEvaluatorService(prisma);
  }

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new training session
   * Includes anti-gaming validation to prevent abuse
   */
  async createSession(
    playerId: string,
    coachId: string | null,
    input: CreateSessionInput,
    skipAntiGaming: boolean = false
  ): Promise<TrainingSession> {
    const sessionDate = new Date(input.sessionDate);

    // Anti-gaming validation (can be skipped by coaches/admins)
    if (!skipAntiGaming) {
      const validation = await this.antiGaming.validateSession({
        playerId,
        sessionDate,
        duration: input.duration,
        sessionType: input.sessionType,
      });

      if (!validation.valid) {
        throw validationError(
          validation.message || 'Session validation failed',
          {
            code: validation.code,
            suggestions: validation.suggestions,
          }
        );
      }
    }

    // Check streak eligibility
    const streakInfo = await this.antiGaming.validateStreakEligibility(playerId, sessionDate);

    const session = await this.prisma.trainingSession.create({
      data: {
        playerId,
        coachId,
        sessionType: input.sessionType,
        sessionDate,
        duration: input.duration,
        learningPhase: input.learningPhase,
        clubSpeed: input.clubSpeed,
        setting: input.setting,
        surface: input.surface,
        focusArea: input.focusArea,
        drillIds: input.drillIds,
        period: input.period,
        intensity: input.intensity,
        notes: input.notes,
        dailyAssignmentId: input.dailyAssignmentId,
        completionStatus: 'in_progress',
        technicalCues: [],
        mediaUrls: [],
        // AK Golf Kategori Hierarki v2.0 felter
        akFormula: input.akFormula,
        environment: input.environment,
        pressure: input.pressure,
        positionStart: input.positionStart,
        positionEnd: input.positionEnd,
        puttingFocus: input.puttingFocus,
        puttingPhases: input.puttingPhases,
      },
    });

    // Log streak eligibility for debugging (streak calculation happens separately)
    if (!streakInfo.countsForStreak) {
      logger.debug({ sessionId: session.id, reason: streakInfo.reason }, 'Session does not count for streak');
    }

    return session;
  }

  /**
   * Get anti-gaming validation status (for UI preview)
   */
  async prevalidateSession(
    playerId: string,
    sessionDate: Date,
    duration: number,
    sessionType: string
  ): Promise<ValidationResult> {
    return this.antiGaming.validateSession({
      playerId,
      sessionDate,
      duration,
      sessionType,
    });
  }

  /**
   * Get player's training pattern summary (for coach review)
   */
  async getPlayerPatternSummary(playerId: string) {
    return this.antiGaming.getPatternSummary(playerId);
  }

  /**
   * Detect anomalies in player's training patterns
   */
  async detectPlayerAnomalies(playerId: string) {
    return this.antiGaming.detectAnomalies(playerId);
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string): Promise<TrainingSession> {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            category: true,
          },
        },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    return session;
  }

  /**
   * List sessions with filters
   */
  async listSessions(query: ListSessionsQuery) {
    const where: Prisma.TrainingSessionWhereInput = {};
    const page = query.page || 1;
    const limit = query.limit || 20;
    const sortBy = query.sortBy || 'sessionDate';
    const sortOrder = query.sortOrder || 'desc';

    if (query.playerId) where.playerId = query.playerId;
    if (query.sessionType) where.sessionType = query.sessionType;
    if (query.period) where.period = query.period;
    if (query.learningPhase) where.learningPhase = query.learningPhase;
    if (query.completionStatus) where.completionStatus = query.completionStatus;
    // AK Golf Kategori Hierarki v2.0 filtere
    if (query.environment) where.environment = query.environment;
    if (query.pressure) where.pressure = query.pressure;

    if (query.fromDate || query.toDate) {
      where.sessionDate = {};
      if (query.fromDate) where.sessionDate.gte = new Date(query.fromDate);
      if (query.toDate) where.sessionDate.lte = new Date(query.toDate);
    }

    const [sessions, total] = await Promise.all([
      this.prisma.trainingSession.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      this.prisma.trainingSession.count({ where }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get player's own sessions
   */
  async getPlayerSessions(playerId: string, query: PlayerSessionsQuery) {
    const where: Prisma.TrainingSessionWhereInput = { playerId };
    const page = query.page || 1;
    const limit = query.limit || 20;

    if (query.sessionType) where.sessionType = query.sessionType;
    if (query.period) where.period = query.period;
    if (query.completionStatus) where.completionStatus = query.completionStatus;

    if (query.fromDate || query.toDate) {
      where.sessionDate = {};
      if (query.fromDate) where.sessionDate.gte = new Date(query.fromDate);
      if (query.toDate) where.sessionDate.lte = new Date(query.toDate);
    }

    const [sessions, total] = await Promise.all([
      this.prisma.trainingSession.findMany({
        where,
        orderBy: { sessionDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.trainingSession.count({ where }),
    ]);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update session
   */
  async updateSession(
    sessionId: string,
    input: UpdateSessionInput
  ): Promise<TrainingSession> {
    await this.getSessionById(sessionId); // Verify exists

    return this.prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        ...(input.sessionType && { sessionType: input.sessionType }),
        ...(input.sessionDate && { sessionDate: new Date(input.sessionDate) }),
        ...(input.duration && { duration: input.duration }),
        ...(input.learningPhase !== undefined && { learningPhase: input.learningPhase }),
        ...(input.clubSpeed !== undefined && { clubSpeed: input.clubSpeed }),
        ...(input.setting !== undefined && { setting: input.setting }),
        ...(input.surface !== undefined && { surface: input.surface }),
        ...(input.focusArea !== undefined && { focusArea: input.focusArea }),
        ...(input.drillIds !== undefined && { drillIds: input.drillIds }),
        ...(input.period !== undefined && { period: input.period }),
        ...(input.intensity !== undefined && { intensity: input.intensity }),
        ...(input.notes !== undefined && { notes: input.notes }),
        // AK Golf Kategori Hierarki v2.0 felter
        ...(input.akFormula !== undefined && { akFormula: input.akFormula }),
        ...(input.environment !== undefined && { environment: input.environment }),
        ...(input.pressure !== undefined && { pressure: input.pressure }),
        ...(input.positionStart !== undefined && { positionStart: input.positionStart }),
        ...(input.positionEnd !== undefined && { positionEnd: input.positionEnd }),
        ...(input.puttingFocus !== undefined && { puttingFocus: input.puttingFocus }),
        ...(input.puttingPhases !== undefined && { puttingPhases: input.puttingPhases }),
      },
    });
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.getSessionById(sessionId); // Verify exists

    await this.prisma.trainingSession.delete({
      where: { id: sessionId },
    });
  }

  // ============================================================================
  // EVALUATION OPERATIONS
  // ============================================================================

  /**
   * Update session evaluation (save progress)
   */
  async updateEvaluation(
    sessionId: string,
    input: SessionEvaluationInput
  ): Promise<TrainingSession> {
    const session = await this.getSessionById(sessionId);

    // Only allow evaluation updates for in-progress sessions
    if (session.completionStatus !== 'in_progress') {
      throw validationError('Cannot update evaluation for completed session');
    }

    return this.prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        evaluationFocus: input.evaluationFocus,
        evaluationTechnical: input.evaluationTechnical,
        evaluationEnergy: input.evaluationEnergy,
        evaluationMental: input.evaluationMental,
        preShotConsistency: input.preShotConsistency,
        preShotCount: input.preShotCount,
        totalShots: input.totalShots,
        technicalCues: input.technicalCues || [],
        customCue: input.customCue,
        whatWentWell: input.whatWentWell,
        nextSessionFocus: input.nextSessionFocus,
        mediaUrls: input.mediaUrls || [],
        notes: input.notes,
      },
    });
  }

  /**
   * Complete session with final evaluation
   * Also triggers badge evaluation and returns any unlocked badges
   */
  async completeSession(
    sessionId: string,
    input: CompleteSessionInput
  ): Promise<SessionCompletionResult> {
    const session = await this.getSessionById(sessionId);

    // Only allow completion for in-progress sessions
    if (session.completionStatus !== 'in_progress') {
      throw validationError('Session is already completed');
    }

    const completedSession = await this.prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        // Evaluation data
        evaluationFocus: input.evaluationFocus,
        evaluationTechnical: input.evaluationTechnical,
        evaluationEnergy: input.evaluationEnergy,
        evaluationMental: input.evaluationMental,
        preShotConsistency: input.preShotConsistency,
        preShotCount: input.preShotCount,
        totalShots: input.totalShots,
        technicalCues: input.technicalCues || [],
        customCue: input.customCue,
        whatWentWell: input.whatWentWell,
        nextSessionFocus: input.nextSessionFocus,
        mediaUrls: input.mediaUrls || [],
        notes: input.notes,

        // Completion status
        completionStatus: input.completionStatus,
        completedAt: new Date(),
      },
    });

    // Evaluate badges after session completion (only if playerId exists)
    let badgeUnlocks: BadgeUnlockEvent[] = [];
    let xpGained = 0;
    let newLevel: number | undefined;

    if (session.playerId) {
      const badgeResult = await this.badgeEvaluator.evaluatePlayerBadges(session.playerId);
      badgeUnlocks = badgeResult.unlockedBadges;
      xpGained = badgeResult.xpGained;
      newLevel = badgeResult.newLevel;
    }

    return {
      session: completedSession,
      badgeUnlocks,
      xpGained,
      newLevel,
    };
  }

  /**
   * Auto-complete session (timeout)
   * Also triggers badge evaluation
   */
  async autoCompleteSession(sessionId: string): Promise<SessionCompletionResult> {
    const session = await this.getSessionById(sessionId);

    // Only auto-complete in-progress sessions
    if (session.completionStatus !== 'in_progress') {
      throw validationError('Session is already completed');
    }

    const completedSession = await this.prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        completionStatus: 'auto_completed',
        autoCompletedAt: new Date(),
        completedAt: new Date(),
      },
    });

    // Evaluate badges after auto-completion (only if playerId exists)
    let badgeUnlocks: BadgeUnlockEvent[] = [];
    let xpGained = 0;
    let newLevel: number | undefined;

    if (session.playerId) {
      const badgeResult = await this.badgeEvaluator.evaluatePlayerBadges(session.playerId);
      badgeUnlocks = badgeResult.unlockedBadges;
      xpGained = badgeResult.xpGained;
      newLevel = badgeResult.newLevel;
    }

    return {
      session: completedSession,
      badgeUnlocks,
      xpGained,
      newLevel,
    };
  }

  /**
   * Get in-progress sessions for a player (to check for auto-complete)
   */
  async getInProgressSessions(playerId: string): Promise<TrainingSession[]> {
    return this.prisma.trainingSession.findMany({
      where: {
        playerId,
        completionStatus: 'in_progress',
      },
      orderBy: { sessionDate: 'desc' },
    });
  }

  /**
   * Get sessions that should be auto-completed (older than timeout)
   */
  async getSessionsForAutoComplete(timeoutMinutes: number = 15): Promise<TrainingSession[]> {
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    return this.prisma.trainingSession.findMany({
      where: {
        completionStatus: 'in_progress',
        updatedAt: {
          lt: cutoffTime,
        },
      },
    });
  }

  /**
   * Batch auto-complete stale sessions
   */
  async batchAutoComplete(timeoutMinutes: number = 15): Promise<number> {
    const staleSessions = await this.getSessionsForAutoComplete(timeoutMinutes);

    if (staleSessions.length === 0) return 0;

    await this.prisma.trainingSession.updateMany({
      where: {
        id: { in: staleSessions.map((s) => s.id) },
      },
      data: {
        completionStatus: 'auto_completed',
        autoCompletedAt: new Date(),
        completedAt: new Date(),
      },
    });

    return staleSessions.length;
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  /**
   * Get evaluation statistics for a player
   */
  async getPlayerEvaluationStats(playerId: string, fromDate?: Date, toDate?: Date) {
    const where: Prisma.TrainingSessionWhereInput = {
      playerId,
      completionStatus: { in: ['completed', 'auto_completed'] },
    };

    if (fromDate || toDate) {
      where.sessionDate = {};
      if (fromDate) where.sessionDate.gte = fromDate;
      if (toDate) where.sessionDate.lte = toDate;
    }

    const sessions = await this.prisma.trainingSession.findMany({
      where,
      select: {
        evaluationFocus: true,
        evaluationTechnical: true,
        evaluationEnergy: true,
        evaluationMental: true,
        preShotConsistency: true,
        preShotCount: true,
        totalShots: true,
        technicalCues: true,
        sessionDate: true,
      },
    });

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averages: null,
        preShotStats: null,
        topCues: [],
      };
    }

    // Calculate averages
    const validFocus = sessions.filter((s) => s.evaluationFocus !== null);
    const validTechnical = sessions.filter((s) => s.evaluationTechnical !== null);
    const validEnergy = sessions.filter((s) => s.evaluationEnergy !== null);
    const validMental = sessions.filter((s) => s.evaluationMental !== null);

    const averages = {
      focus: validFocus.length > 0
        ? validFocus.reduce((sum, s) => sum + (s.evaluationFocus || 0), 0) / validFocus.length
        : null,
      technical: validTechnical.length > 0
        ? validTechnical.reduce((sum, s) => sum + (s.evaluationTechnical || 0), 0) / validTechnical.length
        : null,
      energy: validEnergy.length > 0
        ? validEnergy.reduce((sum, s) => sum + (s.evaluationEnergy || 0), 0) / validEnergy.length
        : null,
      mental: validMental.length > 0
        ? validMental.reduce((sum, s) => sum + (s.evaluationMental || 0), 0) / validMental.length
        : null,
    };

    // Pre-shot routine stats
    const preShotSessions = sessions.filter((s) => s.preShotConsistency !== null);
    const preShotStats = {
      totalSessions: preShotSessions.length,
      yesCount: preShotSessions.filter((s) => s.preShotConsistency === 'yes').length,
      partialCount: preShotSessions.filter((s) => s.preShotConsistency === 'partial').length,
      noCount: preShotSessions.filter((s) => s.preShotConsistency === 'no').length,
      averageRoutinePercentage: preShotSessions.length > 0
        ? preShotSessions.reduce((sum, s) => {
            if (s.totalShots && s.totalShots > 0 && s.preShotCount !== null) {
              return sum + (s.preShotCount / s.totalShots) * 100;
            }
            return sum;
          }, 0) / preShotSessions.filter((s) => s.totalShots && s.totalShots > 0).length || 0
        : 0,
    };

    // Top technical cues
    const cueCount: Record<string, number> = {};
    sessions.forEach((s) => {
      (s.technicalCues as string[])?.forEach((cue) => {
        cueCount[cue] = (cueCount[cue] || 0) + 1;
      });
    });

    const topCues = Object.entries(cueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cue, count]) => ({ cue, count }));

    return {
      totalSessions: sessions.length,
      averages,
      preShotStats,
      topCues,
    };
  }
}
