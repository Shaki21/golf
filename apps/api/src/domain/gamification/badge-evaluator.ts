/**
 * AK Golf Academy - Badge Evaluator Service
 * Evaluates player metrics and awards badges automatically
 */

import { PrismaClient } from '@prisma/client';
import {
  PlayerMetrics,
  VolumeMetrics,
  StreakMetrics,
  StrengthMetrics,
  PerformanceMetrics,
  PhaseMetrics,
  PhaseRecord,
  BadgeProgress,
  BadgeUnlockEvent,
  TrainingPhase,
  TrainingType,
  GolfFitnessMetrics,
} from './types';

// Re-export for convenience
export type { BadgeUnlockEvent } from './types';
import {
  calculateAllBadgeProgress,
  processBadgeUnlocks,
  getLevelFromXP,
  getXPToNextLevel,
} from './badge-calculator';
import { ALL_BADGES } from './achievement-definitions';
import { filterAvailableBadges } from './badge-availability';
import { DateRangeCalculator, SessionFilter } from './utils';
import { GamificationConfig, createDefaultHoursByType } from './gamification.config';
import { logger } from '../../utils/logger';
import { config } from '../../config';

// ═══════════════════════════════════════════════════════════════
// BADGE EVALUATOR SERVICE
// ═══════════════════════════════════════════════════════════════

export class BadgeEvaluatorService {
  private logger = logger;
  private static readonly MAX_RETRIES = config.retry.maxAttempts;
  private static readonly RETRY_DELAY_MS = config.retry.delayMs;

  constructor(private prisma: PrismaClient) {}

  /**
   * Retry wrapper for operations that may fail due to transient errors
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = BadgeEvaluatorService.MAX_RETRIES
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on validation errors or not found errors
        if (this.isNonRetryableError(lastError)) {
          throw lastError;
        }

        this.logger.warn(
          { attempt, maxRetries, operationName, error: lastError.message },
          `Badge evaluator operation failed, ${attempt < maxRetries ? 'retrying...' : 'giving up'}`
        );

        if (attempt < maxRetries) {
          // Exponential backoff
          await this.delay(BadgeEvaluatorService.RETRY_DELAY_MS * Math.pow(2, attempt - 1));
        }
      }
    }

    throw lastError;
  }

  /**
   * Check if an error should not be retried
   */
  private isNonRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes('not found') ||
      message.includes('validation') ||
      message.includes('unique constraint') ||
      message.includes('foreign key')
    );
  }

  /**
   * Delay helper for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Main entry point: Evaluate all badges for a player
   * Call this after any action that might trigger a badge
   * Includes retry logic for transient failures
   */
  async evaluatePlayerBadges(playerId: string): Promise<{
    unlockedBadges: BadgeUnlockEvent[];
    xpGained: number;
    newLevel?: number;
    updatedProgress: BadgeProgress[];
  }> {
    return this.withRetry(
      async () => {
        // 1. Calculate current player metrics
        const metrics = await this.calculatePlayerMetrics(playerId);

        // 2. Get existing badge progress
        const existingProgress = await this.getExistingBadgeProgress(playerId);
        const existingProgressMap = new Map(existingProgress.map((bp) => [bp.badgeId, bp]));

        // 3. Get available badges only (skip unavailable ones)
        const availableBadges = filterAvailableBadges(ALL_BADGES);

        // 4. Calculate new progress for all badges
        const newProgress = calculateAllBadgeProgress(metrics, availableBadges, existingProgressMap);

        // 5. Process unlocks
        const { events: unlockedBadges, xpGained } = processBadgeUnlocks(
          playerId,
          availableBadges,
          existingProgress,
          newProgress,
          metrics
        );

        // 6. Persist changes with retry
        await this.persistBadgeProgress(playerId, newProgress);

        // 7. Award XP and check for level up
        let newLevel: number | undefined;
        if (xpGained > 0) {
          newLevel = await this.awardXP(playerId, xpGained);
        }

        // 8. Create notification for each unlocked badge (non-critical, don't fail on error)
        for (const event of unlockedBadges) {
          try {
            await this.createBadgeNotification(playerId, event);
          } catch (notifError) {
            this.logger.warn(
              { playerId, badgeId: event.badgeId, error: notifError },
              'Failed to create badge notification, continuing'
            );
          }
        }

        return {
          unlockedBadges,
          xpGained,
          newLevel,
          updatedProgress: newProgress,
        };
      },
      'evaluatePlayerBadges'
    );
  }

  /**
   * Safe version of evaluatePlayerBadges that never throws
   * Returns null on failure instead of throwing
   */
  async evaluatePlayerBadgesSafe(playerId: string): Promise<{
    unlockedBadges: BadgeUnlockEvent[];
    xpGained: number;
    newLevel?: number;
    updatedProgress: BadgeProgress[];
  } | null> {
    try {
      return await this.evaluatePlayerBadges(playerId);
    } catch (error) {
      this.logger.error(
        { playerId, error },
        'Badge evaluation failed after all retries'
      );
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // METRICS CALCULATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Calculate all player metrics from database
   */
  async calculatePlayerMetrics(playerId: string): Promise<PlayerMetrics> {
    const [volume, streaks, strength, performance, phase, playerData] = await Promise.all([
      this.calculateVolumeMetrics(playerId),
      this.calculateStreakMetrics(playerId),
      this.calculateStrengthMetrics(playerId),
      this.calculatePerformanceMetrics(playerId),
      this.calculatePhaseMetrics(playerId),
      // Calculate XP from earned badges
      this.prisma.playerBadge.findMany({
        where: { playerId, earnedAt: { not: null } },
      }),
    ]);

    // Calculate totalXP from earned badges (each badge gives xpValue based on tier)
    const totalXP = playerData?.length ? playerData.length * GamificationConfig.xp.perBadge : 0;

    return {
      playerId,
      volume,
      streaks,
      strength,
      performance,
      phase,
      totalXP,
      currentLevel: getLevelFromXP(totalXP),
      xpToNextLevel: getXPToNextLevel(totalXP),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastCalculated: new Date(),
    };
  }

  /**
   * Calculate volume metrics (hours, sessions, swings)
   */
  private async calculateVolumeMetrics(playerId: string): Promise<VolumeMetrics> {
    // Get all completed sessions
    const rawSessions = await this.prisma.trainingSession.findMany({
      where: {
        playerId,
        completionStatus: { in: ['completed', 'auto_completed'] },
      },
      select: {
        duration: true,
        sessionType: true,
        totalShots: true,
        sessionDate: true,
      },
    });

    const sessions = SessionFilter.from(rawSessions);

    // Total metrics
    const totalMinutes = sessions.sumDuration();
    const totalHours = totalMinutes / 60;
    const totalSwings = rawSessions.reduce((sum, s) => sum + (s.totalShots || 0), 0);

    // Hours by training type using utility
    const hoursByType = createDefaultHoursByType();
    rawSessions.forEach((s: typeof rawSessions[0]) => {
      const type = s.sessionType?.toLowerCase() || 'other';
      if (type in hoursByType) {
        hoursByType[type] += (s.duration || 0) / 60;
      }
    });

    // Sessions by time period using SessionFilter
    const sessionsThisWeek = sessions.thisWeek().count();
    const sessionsThisMonth = sessions.thisMonth().count();
    const sessionsThisYear = sessions.thisYear().count();

    // Hours by time period
    const weeklyHours = sessions.thisWeek().sumHours();
    const monthlyHours = sessions.thisMonth().sumHours();
    const yearlyHours = sessions.thisYear().sumHours();

    // Calculate completion rate (completed sessions / planned sessions)
    const completedSessions = sessions.count();
    const firstSession = sessions.first();
    const weeksActive = firstSession
      ? Math.max(1, DateRangeCalculator.diffInWeeks(new Date(firstSession.sessionDate), new Date()))
      : 1;
    const estimatedPlanned = weeksActive * GamificationConfig.sessions.plannedPerWeek;
    const completionRate = Math.min(100, Math.round((completedSessions / estimatedPlanned) * 100));

    return {
      totalHours,
      hoursByType: hoursByType as Record<TrainingType, number>,
      totalSessions: sessions.count(),
      sessionsThisWeek,
      sessionsThisMonth,
      sessionsThisYear,
      completionRate,
      totalSwings,
      swingsByClub: {} as VolumeMetrics['swingsByClub'],
      totalDrillsCompleted: 0,
      drillsByCategory: {},
      weeklyHours,
      monthlyHours,
      yearlyHours,
    };
  }

  /**
   * Calculate streak metrics
   */
  private async calculateStreakMetrics(playerId: string): Promise<StreakMetrics> {
    // Get all session dates
    const rawSessions = await this.prisma.trainingSession.findMany({
      where: {
        playerId,
        completionStatus: { in: ['completed', 'auto_completed'] },
      },
      select: {
        sessionDate: true,
      },
      orderBy: { sessionDate: 'desc' },
    });

    if (rawSessions.length === 0) {
      return this.createEmptyStreakMetrics();
    }

    const sessions = SessionFilter.from(rawSessions);
    const uniqueDates = sessions.uniqueDates();
    const sortedDates = Array.from(uniqueDates).sort().reverse();

    // Calculate streak metrics
    const currentStreak = this.calculateCurrentStreak(sortedDates);
    const longestStreak = this.calculateLongestStreak(sortedDates, currentStreak);

    // Count time-based sessions using SessionFilter
    const earlyMorningSessions = sessions.earlyMorning().count();
    const eveningSessions = sessions.evening().count();
    const weekendSessions = sessions.weekends().count();

    // Calculate perfect weeks
    const weeklySessionCounts = sessions.groupByWeek();
    const { perfectWeeks, consecutivePerfectWeeks } = this.calculatePerfectWeeks(weeklySessionCounts);

    // Consistency score based on active days in last 30 days
    const consistencyScore = Math.min(100, (uniqueDates.size / GamificationConfig.consistency.windowDays) * 100);

    return {
      currentStreak,
      longestStreak,
      perfectWeeks,
      consecutivePerfectWeeks,
      earlyMorningSessions,
      eveningSessions,
      weekendSessions,
      consistencyScore,
      lastActiveDate: new Date(sortedDates[0]),
      daysActive: uniqueDates.size,
    };
  }

  /**
   * Create empty streak metrics for players with no sessions
   */
  private createEmptyStreakMetrics(): StreakMetrics {
    return {
      currentStreak: 0,
      longestStreak: 0,
      perfectWeeks: 0,
      consecutivePerfectWeeks: 0,
      earlyMorningSessions: 0,
      eveningSessions: 0,
      weekendSessions: 0,
      consistencyScore: 0,
      lastActiveDate: new Date(0),
      daysActive: 0,
    };
  }

  /**
   * Calculate current streak from sorted dates (most recent first)
   */
  private calculateCurrentStreak(sortedDates: string[]): number {
    if (sortedDates.length === 0) return 0;

    const today = DateRangeCalculator.toDateString(new Date());
    const yesterday = DateRangeCalculator.toDateString(DateRangeCalculator.getYesterday());
    const maxGap = GamificationConfig.streaks.maxGapDays;

    // Must have trained today or yesterday to have a current streak
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }

    let currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = (prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000);

      if (diffDays <= maxGap) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  }

  /**
   * Calculate longest streak from sorted dates (most recent first)
   */
  private calculateLongestStreak(sortedDates: string[], currentStreak: number): number {
    if (sortedDates.length === 0) return 0;

    const maxGap = GamificationConfig.streaks.maxGapDays;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = (prevDate.getTime() - currDate.getTime()) / (24 * 60 * 60 * 1000);

      if (diffDays <= maxGap) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    return Math.max(longestStreak, tempStreak, currentStreak);
  }

  /**
   * Calculate perfect weeks and consecutive perfect weeks
   */
  private calculatePerfectWeeks(weeklySessionCounts: Map<string, unknown[]>): {
    perfectWeeks: number;
    consecutivePerfectWeeks: number;
  } {
    const threshold = GamificationConfig.sessions.perfectWeekThreshold;

    // Count perfect weeks
    const perfectWeekKeys = Array.from(weeklySessionCounts.entries())
      .filter(([_, sessions]) => sessions.length >= threshold)
      .map(([weekKey]) => weekKey)
      .sort()
      .reverse();

    const perfectWeeks = perfectWeekKeys.length;

    // Calculate consecutive perfect weeks (from most recent)
    let consecutivePerfectWeeks = 0;
    for (let i = 0; i < perfectWeekKeys.length; i++) {
      if (i === 0) {
        consecutivePerfectWeeks = 1;
      } else {
        const prevWeek = new Date(perfectWeekKeys[i - 1]);
        const currWeek = new Date(perfectWeekKeys[i]);
        const diffWeeks = DateRangeCalculator.diffInWeeks(currWeek, prevWeek);
        if (diffWeeks === 1) {
          consecutivePerfectWeeks++;
        } else {
          break;
        }
      }
    }

    return { perfectWeeks, consecutivePerfectWeeks };
  }

  /**
   * Calculate strength metrics
   */
  private async calculateStrengthMetrics(playerId: string): Promise<StrengthMetrics> {
    // Get gym sessions
    const rawGymSessions = await this.prisma.trainingSession.findMany({
      where: {
        playerId,
        sessionType: 'fysisk',
        completionStatus: { in: ['completed', 'auto_completed'] },
      },
      select: {
        sessionDate: true,
        duration: true,
      },
      orderBy: { sessionDate: 'desc' },
    });

    const gymSessions = SessionFilter.from(rawGymSessions);

    // Calculate gym streak (unique weeks with gym sessions)
    const gymStreak = gymSessions.groupByWeek().size;

    // Sessions by time period using utilities
    const gymSessionsThisWeek = gymSessions.thisWeek().count();
    const gymSessionsThisMonth = gymSessions.thisMonth().count();

    // Get bodyweight from player intake
    const bodyweight = await this.getPlayerBodyweight(playerId);

    // Get golf fitness metrics from test results
    const golfFitness = await this.calculateGolfFitnessMetrics(playerId);

    // Note: Tonnage and PR tracking requires ExerciseLog/PersonalRecord models
    // which are not yet implemented in the schema. These will remain 0 until
    // the schema is extended to support detailed exercise tracking.
    return {
      totalTonnage: 0,
      weeklyTonnage: 0,
      monthlyTonnage: 0,
      bodyweight,
      prs: {} as StrengthMetrics['prs'],
      prCount: 0,
      prCountThisMonth: 0,
      relativeStrength: {
        squat: 0,
        deadlift: 0,
        benchPress: 0,
      },
      golfFitness,
      gymSessionsThisWeek,
      gymSessionsThisMonth,
      gymStreak,
    };
  }

  /**
   * Get player bodyweight from intake form
   */
  private async getPlayerBodyweight(playerId: string): Promise<number> {
    const intake = await this.prisma.playerIntake.findFirst({
      where: { playerId, isComplete: true },
      orderBy: { submittedAt: 'desc' },
      select: { health: true },
    });

    if (intake?.health && typeof intake.health === 'object') {
      const health = intake.health as Record<string, unknown>;
      if (typeof health.bodyweight === 'number') {
        return health.bodyweight;
      }
      if (typeof health.weight === 'number') {
        return health.weight;
      }
    }

    return GamificationConfig.strength.defaultBodyweightKg;
  }

  /**
   * Calculate golf fitness metrics from test results
   */
  private async calculateGolfFitnessMetrics(playerId: string): Promise<GolfFitnessMetrics> {
    const fitnessTests = await this.prisma.testResult.findMany({
      where: {
        playerId,
        test: {
          testType: {
            in: ['med_ball_throw', 'vertical_jump', 'broad_jump', 'hip_rotation',
                 'thoracic_rotation', 'shoulder_mobility', 'balance', 'plank',
                 'clubhead_speed', 'driver_speed'],
          },
        },
      },
      include: { test: true },
      orderBy: { testDate: 'desc' },
    });

    const golfFitness: GolfFitnessMetrics = {
      medBallThrow: 0,
      verticalJump: 0,
      broadJump: 0,
      hipRotationLeft: 0,
      hipRotationRight: 0,
      thoracicRotation: 0,
      shoulderMobility: 0,
      singleLegBalanceLeft: 0,
      singleLegBalanceRight: 0,
      plankHold: 0,
      clubheadSpeedDriver: 0,
      clubheadSpeed7Iron: 0,
      lastAssessmentDate: fitnessTests[0]?.testDate || new Date(),
    };

    // Map test results to golf fitness metrics using config mapping
    for (const test of fitnessTests) {
      const value = Number(test.value) || 0;
      const testType = test.test.testType?.toLowerCase() || '';

      this.mapTestToGolfFitness(testType, value, golfFitness);
    }

    return golfFitness;
  }

  /**
   * Map a test type to the appropriate golf fitness metric
   */
  private mapTestToGolfFitness(testType: string, value: number, golfFitness: GolfFitnessMetrics): void {
    // Use config-based mapping where possible, with fallback to pattern matching
    if (testType.includes('med_ball') || testType.includes('medball')) {
      golfFitness.medBallThrow = value;
    } else if (testType.includes('vertical')) {
      golfFitness.verticalJump = value;
    } else if (testType.includes('broad')) {
      golfFitness.broadJump = value;
    } else if (testType.includes('hip') && testType.includes('left')) {
      golfFitness.hipRotationLeft = value;
    } else if (testType.includes('hip') && testType.includes('right')) {
      golfFitness.hipRotationRight = value;
    } else if (testType.includes('hip')) {
      golfFitness.hipRotationLeft = golfFitness.hipRotationRight = value;
    } else if (testType.includes('thoracic')) {
      golfFitness.thoracicRotation = value;
    } else if (testType.includes('shoulder')) {
      golfFitness.shoulderMobility = value;
    } else if (testType.includes('balance') && testType.includes('left')) {
      golfFitness.singleLegBalanceLeft = value;
    } else if (testType.includes('balance') && testType.includes('right')) {
      golfFitness.singleLegBalanceRight = value;
    } else if (testType.includes('balance')) {
      golfFitness.singleLegBalanceLeft = golfFitness.singleLegBalanceRight = value;
    } else if (testType.includes('plank')) {
      golfFitness.plankHold = value;
    } else if (testType.includes('driver') || testType.includes('clubhead')) {
      golfFitness.clubheadSpeedDriver = value;
    }
  }

  /**
   * Calculate performance metrics (from tests and tournaments)
   */
  private async calculatePerformanceMetrics(playerId: string): Promise<PerformanceMetrics> {
    // Get test results for speed via test relation
    const speedTests = await this.prisma.testResult.findMany({
      where: {
        playerId,
        test: { testType: { in: ['driver_speed', 'clubhead_speed', 'speed'] } },
      },
      orderBy: { testDate: 'desc' },
      take: 5,
    });

    const latestSpeed = speedTests[0]?.value ? Number(speedTests[0].value) : 0;

    // Get tournament results
    const tournaments = await this.prisma.tournamentResult.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    });

    const scores = tournaments.map((t) => t.totalScore).filter((s) => s !== null) as number[];
    const bestScore = scores.length > 0 ? Math.min(...scores) : 0;
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Get player handicap
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { handicap: true },
    });

    return {
      speed: {
        driverSpeed: latestSpeed,
        sevenIronSpeed: 0,
        wedgeSpeed: 0,
        driverSpeedBaseline: 0,
        baselineDate: new Date(),
        speedImprovement: 0,
        driverBallSpeed: 0,
        smashFactor: 0,
        launchAngle: 0,
        spinRate: 0,
      },
      accuracy: {
        fairwayHitPct: 0,
        avgDrivingDistance: 0,
        drivingDispersion: 0,
        missDirection: 'balanced',
        girPct: 0,
        avgProximity: 0,
        proximityFrom100: 0,
        proximityFrom150: 0,
        roundsTracked: tournaments.length,
      },
      putting: {
        avgPuttsPerRound: 0,
        onePuttPct: 0,
        threePuttPct: 0,
        makeRateInside3ft: 0,
        makeRate3to6ft: 0,
        makeRate6to10ft: 0,
        makeRate10to20ft: 0,
        makeRateOver20ft: 0,
        avgFirstPuttDistance: 0,
        totalPuttingDrills: 0,
        puttingDrillAccuracy: 0,
      },
      shortGame: {
        upAndDownPct: 0,
        sandSavePct: 0,
        scramblingPct: 0,
        proximityFrom50: 0,
        proximityFrom30: 0,
        proximityChip: 0,
        totalShortGameDrills: 0,
        shortGameDrillAccuracy: 0,
      },
      scoring: {
        bestScore18: bestScore,
        bestScore9: 0,
        avgScore18: avgScore,
        avgScoreLast10: avgScore,
        avgScoreLast20: avgScore,
        roundsUnder80: scores.filter((s) => s < 80).length,
        roundsUnder75: scores.filter((s) => s < 75).length,
        roundsUnder70: scores.filter((s) => s < 70).length,
        roundsUnderPar: scores.filter((s) => s < GamificationConfig.scoring.par18).length,
        currentHandicap: player?.handicap ? Number(player.handicap) : GamificationConfig.scoring.defaultHandicap,
        lowHandicap: player?.handicap ? Number(player.handicap) : GamificationConfig.scoring.defaultHandicap,
        handicapTrend: 'stable',
        totalRoundsPlayed: tournaments.length,
        competitiveRounds: tournaments.length,
      },
    };
  }

  /**
   * Calculate phase metrics from WeeklyPeriodization and AnnualTrainingPlan
   */
  private async calculatePhaseMetrics(playerId: string): Promise<PhaseMetrics> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const weekNumber = DateRangeCalculator.getWeekNumber(now);
    const currentWeekStart = DateRangeCalculator.getStartOfWeek(now);

    // Fetch annual plan and periodization data
    const { annualPlan, periodization } = await this.fetchPlanData(playerId, now, currentYear, weekNumber);

    // Determine current phase
    const currentPhaseStr = periodization?.periodPhase ||
      annualPlan?.periodizations?.find((w) => w.weekNumber === weekNumber)?.periodPhase ||
      'grunnlag';
    const currentPhase = this.mapPeriodPhase(currentPhaseStr);

    // Calculate phase boundaries
    const { phaseStartDate, phaseEndDate } = this.calculatePhaseBoundaries(
      annualPlan?.periodizations || [],
      weekNumber,
      currentPhase,
      currentWeekStart
    );

    const daysInPhase = DateRangeCalculator.diffInDays(phaseStartDate, now);

    // Calculate compliance metrics
    const complianceMetrics = await this.calculateComplianceMetrics(
      playerId,
      annualPlan?.dailyAssignments || [],
      phaseStartDate,
      now
    );

    // Build phase history
    const { phaseHistory, phasesCompleted } = this.buildPhaseHistory(
      annualPlan?.periodizations || [],
      now
    );

    // Count yearly goals
    const yearlyGoalsAchieved = await this.countYearlyGoalsAchieved(playerId, currentYear);

    return {
      currentPhase,
      phaseStartDate,
      phaseEndDate,
      daysInPhase: Math.max(1, daysInPhase),
      phaseCompliance: complianceMetrics.phaseCompliance,
      volumeVsPlan: complianceMetrics.volumeVsPlan,
      intensityVsPlan: complianceMetrics.intensityVsPlan,
      phasesCompleted,
      phaseHistory,
      annualPlanCompliance: complianceMetrics.annualPlanCompliance,
      yearlyGoalsAchieved,
    };
  }

  /**
   * Fetch annual plan and periodization data
   */
  private async fetchPlanData(
    playerId: string,
    now: Date,
    currentYear: number,
    weekNumber: number
  ) {
    const [annualPlan, periodization] = await Promise.all([
      this.prisma.annualTrainingPlan.findFirst({
        where: {
          playerId,
          status: 'active',
          startDate: { lte: now },
          endDate: { gte: now },
        },
        include: {
          periodizations: {
            orderBy: { weekNumber: 'asc' },
          },
          dailyAssignments: {
            where: {
              assignedDate: {
                gte: new Date(currentYear, 0, 1),
                lte: now,
              },
            },
          },
        },
      }),
      this.prisma.periodization.findFirst({
        where: { playerId, weekNumber },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { annualPlan, periodization };
  }

  /**
   * Map period phase string to TrainingPhase enum
   */
  private mapPeriodPhase(phase: string | null): TrainingPhase {
    if (!phase) return TrainingPhase.GRUNNLAG;

    const normalizedPhase = phase.toLowerCase();
    const mapping = GamificationConfig.phaseMapping;

    if (normalizedPhase in mapping) {
      const mappedPhase = mapping[normalizedPhase];
      switch (mappedPhase) {
        case 'grunnlag': return TrainingPhase.GRUNNLAG;
        case 'oppbygging': return TrainingPhase.OPPBYGGING;
        case 'konkurranse': return TrainingPhase.KONKURRANSE;
        case 'overgang': return TrainingPhase.OVERGANG;
      }
    }

    return TrainingPhase.GRUNNLAG;
  }

  /**
   * Calculate phase start and end dates from weekly periodizations
   */
  private calculatePhaseBoundaries(
    weeklyPeriods: Array<{ weekNumber: number; periodPhase: string | null }>,
    currentWeekNumber: number,
    currentPhase: TrainingPhase,
    fallbackStart: Date
  ): { phaseStartDate: Date; phaseEndDate: Date } {
    let phaseStartDate = fallbackStart;
    let phaseEndDate = new Date(fallbackStart);
    phaseEndDate.setDate(phaseEndDate.getDate() + 7);

    if (weeklyPeriods.length === 0) {
      return { phaseStartDate, phaseEndDate };
    }

    const currentWeekIdx = weeklyPeriods.findIndex(w => w.weekNumber === currentWeekNumber);
    if (currentWeekIdx < 0) {
      return { phaseStartDate, phaseEndDate };
    }

    // Find phase start (first week of this phase going backwards)
    let startIdx = currentWeekIdx;
    while (startIdx > 0 && this.mapPeriodPhase(weeklyPeriods[startIdx - 1].periodPhase) === currentPhase) {
      startIdx--;
    }

    // Find phase end (last week of this phase going forwards)
    let endIdx = currentWeekIdx;
    while (endIdx < weeklyPeriods.length - 1 && this.mapPeriodPhase(weeklyPeriods[endIdx + 1].periodPhase) === currentPhase) {
      endIdx++;
    }

    // Calculate dates from week numbers
    const year = fallbackStart.getFullYear();
    if (startIdx < weeklyPeriods.length) {
      phaseStartDate = DateRangeCalculator.getWeekStartDate(year, weeklyPeriods[startIdx].weekNumber);
    }
    if (endIdx < weeklyPeriods.length) {
      phaseEndDate = DateRangeCalculator.getWeekEndDate(year, weeklyPeriods[endIdx].weekNumber);
    }

    return { phaseStartDate, phaseEndDate };
  }

  /**
   * Calculate compliance metrics for annual plan and current phase
   */
  private async calculateComplianceMetrics(
    playerId: string,
    assignments: Array<{ status: string; assignedDate: Date; estimatedDuration: number; intensity: number | null }>,
    phaseStartDate: Date,
    now: Date
  ): Promise<{
    phaseCompliance: number;
    volumeVsPlan: number;
    intensityVsPlan: number;
    annualPlanCompliance: number;
  }> {
    if (assignments.length === 0) {
      return {
        phaseCompliance: 0,
        volumeVsPlan: 0,
        intensityVsPlan: 0,
        annualPlanCompliance: 0,
      };
    }

    // Annual plan compliance
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const annualPlanCompliance = Math.round((completedAssignments / assignments.length) * 100);

    // Phase-specific assignments
    const phaseAssignments = assignments.filter(a => {
      const assignDate = new Date(a.assignedDate);
      return assignDate >= phaseStartDate && assignDate <= now;
    });

    const phaseCompleted = phaseAssignments.filter(a => a.status === 'completed').length;
    const phaseCompliance = phaseAssignments.length > 0
      ? Math.round((phaseCompleted / phaseAssignments.length) * 100)
      : 0;

    // Get sessions for volume/intensity calculations
    const rawSessions = await this.prisma.trainingSession.findMany({
      where: {
        playerId,
        sessionDate: { gte: phaseStartDate, lte: now },
        completionStatus: { in: ['completed', 'auto_completed'] },
      },
      select: { sessionDate: true, duration: true, intensity: true },
    });

    const sessions = SessionFilter.from(rawSessions);
    const actualMinutes = sessions.sumDuration();
    const defaultDuration = GamificationConfig.sessions.defaultDurationMinutes;
    const plannedMinutes = phaseAssignments.reduce((sum, a) => sum + (a.estimatedDuration || defaultDuration), 0);
    const volumeVsPlan = plannedMinutes > 0 ? Math.round((actualMinutes / plannedMinutes) * 100) : 0;

    // Calculate intensity ratio
    const defaultIntensity = GamificationConfig.sessions.defaultIntensity;
    const actualIntensity = sessions.averageIntensity() || 0;
    const plannedIntensity = phaseAssignments.length > 0
      ? phaseAssignments.reduce((sum, a) => sum + (a.intensity || defaultIntensity), 0) / phaseAssignments.length
      : 0;
    const intensityVsPlan = plannedIntensity > 0 ? Math.round((actualIntensity / plannedIntensity) * 100) : 0;

    return { phaseCompliance, volumeVsPlan, intensityVsPlan, annualPlanCompliance };
  }

  /**
   * Build phase history from weekly periodizations
   */
  private buildPhaseHistory(
    weeklyPeriods: Array<{ weekNumber: number; periodPhase: string | null; actualHours: number | null }>,
    now: Date
  ): { phaseHistory: PhaseRecord[]; phasesCompleted: number } {
    const phaseHistory: PhaseRecord[] = [];
    let phasesCompleted = 0;

    if (weeklyPeriods.length === 0) {
      return { phaseHistory, phasesCompleted };
    }

    const year = now.getFullYear();
    let currentPhaseBlock: { phase: TrainingPhase; startWeek: number; endWeek: number; totalHours: number } | null = null;

    for (let i = 0; i < weeklyPeriods.length; i++) {
      const period = weeklyPeriods[i];
      const phase = this.mapPeriodPhase(period.periodPhase);
      const periodEnd = DateRangeCalculator.getWeekEndDate(year, period.weekNumber);

      if (!currentPhaseBlock || currentPhaseBlock.phase !== phase) {
        // Save previous phase block if it's complete
        if (currentPhaseBlock && periodEnd < now) {
          const startPeriod = weeklyPeriods[currentPhaseBlock.startWeek];
          const endPeriod = weeklyPeriods[currentPhaseBlock.endWeek];

          phaseHistory.push({
            phase: currentPhaseBlock.phase,
            startDate: DateRangeCalculator.getWeekStartDate(year, startPeriod.weekNumber),
            endDate: DateRangeCalculator.getWeekEndDate(year, endPeriod.weekNumber),
            compliance: 0, // Would need to calculate from session completion
            volumeCompleted: currentPhaseBlock.totalHours,
            goalsAchieved: [],
          });
          phasesCompleted++;
        }
        currentPhaseBlock = { phase, startWeek: i, endWeek: i, totalHours: period.actualHours || 0 };
      } else {
        currentPhaseBlock.endWeek = i;
        currentPhaseBlock.totalHours += period.actualHours || 0;
      }
    }

    return { phaseHistory, phasesCompleted };
  }

  /**
   * Count yearly goals achieved for a player
   */
  private async countYearlyGoalsAchieved(playerId: string, year: number): Promise<number> {
    try {
      const player = await this.prisma.player.findUnique({
        where: { id: playerId },
        select: { userId: true },
      });

      if (!player?.userId) return 0;

      return await this.prisma.goal.count({
        where: {
          userId: player.userId,
          status: 'achieved',
          targetDate: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31),
          },
        },
      });
    } catch {
      // Goal model might not exist yet
      return 0;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // DATABASE OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get existing badge progress from database
   */
  private async getExistingBadgeProgress(playerId: string): Promise<BadgeProgress[]> {
    const records = await this.prisma.playerBadge.findMany({
      where: { playerId },
    });

    return records.map((r) => ({
      badgeId: r.badgeId,
      playerId: r.playerId,
      earned: r.earnedAt !== null,
      earnedAt: r.earnedAt ?? undefined,
      progress: r.progress ?? 0,
      requirementProgress: [],
      isNew: false,
      viewedAt: r.viewedAt ?? undefined,
    }));
  }

  /**
   * Persist badge progress to database
   * Uses parallel upserts with configurable batch size for better performance
   */
  private async persistBadgeProgress(
    playerId: string,
    progress: BadgeProgress[]
  ): Promise<void> {
    const batchSize = GamificationConfig.batching.badgeUpsertBatch;

    // Process in batches to avoid overwhelming the database
    for (let i = 0; i < progress.length; i += batchSize) {
      const batch = progress.slice(i, i + batchSize);

      // Execute batch in parallel
      await Promise.all(
        batch.map((bp) =>
          this.prisma.playerBadge.upsert({
            where: {
              playerId_badgeId: {
                playerId,
                badgeId: bp.badgeId,
              },
            },
            update: {
              progress: bp.progress,
              earnedAt: bp.earned && bp.earnedAt ? bp.earnedAt : undefined,
            },
            create: {
              playerId,
              badgeId: bp.badgeId,
              progress: bp.progress,
              earnedAt: bp.earned ? bp.earnedAt ?? new Date() : null,
            },
          })
        )
      );
    }
  }

  /**
   * Award XP to player and return new level if leveled up
   * Note: XP is calculated from earned badges, not stored directly on Player
   */
  private async awardXP(playerId: string, xpAmount: number): Promise<number | undefined> {
    // Get current XP from earned badges
    const earnedBadges = await this.prisma.playerBadge.findMany({
      where: { playerId, earnedAt: { not: null } },
    });

    const oldXP = earnedBadges.length * GamificationConfig.xp.perBadge;
    const newXP = oldXP + xpAmount;
    const oldLevel = getLevelFromXP(oldXP);
    const newLevel = getLevelFromXP(newXP);

    // XP is tracked implicitly through badges, no direct update needed

    return newLevel > oldLevel ? newLevel : undefined;
  }

  /**
   * Create notification for badge unlock
   */
  private async createBadgeNotification(
    playerId: string,
    event: BadgeUnlockEvent
  ): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          recipientType: 'player',
          recipientId: playerId,
          notificationType: 'badge_unlocked',
          title: `Badge opptjent: ${event.badge.name}`,
          message: event.badge.description,
          metadata: {
            badgeId: event.badgeId,
            xpAwarded: event.xpAwarded,
            tier: event.badge.tier,
            category: event.badge.category,
            symbol: event.badge.symbol,
          },
          priority: 'normal',
          status: 'pending',
        },
      });
    } catch (error) {
      // Notification table might not exist yet
      this.logger.warn({ error }, 'Could not create badge notification');
    }
  }
}

/**
 * Factory function
 */
export function createBadgeEvaluatorService(prisma: PrismaClient): BadgeEvaluatorService {
  return new BadgeEvaluatorService(prisma);
}
