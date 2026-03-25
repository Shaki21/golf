/**
 * Training Plan Generation Service
 * Generates complete 12-month training plans
 *
 * V2 Enhancements:
 * - Integrates Category Constraints for binding constraints
 * - Uses Domain Mapping for testDomainCode assignment
 * - Enhanced session selection with constraint awareness
 */

import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../../core/db/prisma';
import {
  getTemplateForScoringAverage,
  getPlayerCategory,
  calculateIntensityProfile,
  type PeriodizationTemplate,
} from './periodization-templates';
import { SessionSelectionService } from './session-selection.service';
import type {
  GenerateAnnualPlanInput,
  AnnualPlanGenerationResult,
  TournamentInput,
  TournamentSchedule,
  PeriodizationWeek,
  DailyAssignmentContext,
} from './plan-generation.types';
import {
  createCategoryConstraintsService,
  type GetBindingConstraintsOutput,
  type BindingConstraint,
  type PlayerDomainPerformance,
  getNextCategory,
} from '../performance/category-constraints';
import { getTestToDomainMapping, mapTestNumberToDomain } from '../performance/domain-mapping';
import type { CategoryAK, Gender } from '../performance/domain-mapping';

const prisma = getPrismaClient();

export class PlanGenerationService {
  /**
   * Generate complete 12-month training plan
   */
  static async generateAnnualPlan(
    input: GenerateAnnualPlanInput
  ): Promise<AnnualPlanGenerationResult> {
    // 1. Get periodization template based on scoring average
    const template = getTemplateForScoringAverage(input.baselineAverageScore);
    const playerCategory = getPlayerCategory(input.baselineAverageScore);

    // 2. Calculate plan structure
    const endDate = new Date(input.startDate);
    endDate.setDate(endDate.getDate() + 364); // 52 weeks

    const weeklyHoursTarget =
      input.weeklyHoursTarget || Math.round((template.weeklyHours[0] + template.weeklyHours[1]) / 2);

    const intensityProfile = calculateIntensityProfile(template);

    // 3. Create AnnualTrainingPlan record
    const annualPlan = await prisma.annualTrainingPlan.create({
      data: {
        playerId: input.playerId,
        tenantId: input.tenantId,
        planName: input.planName || `${input.baselineAverageScore} avg - 12-month plan`,
        startDate: input.startDate,
        endDate,
        status: 'active',
        baselineAverageScore: input.baselineAverageScore,
        baselineHandicap: input.baselineHandicap,
        baselineDriverSpeed: input.baselineDriverSpeed,
        playerCategory,
        basePeriodWeeks: template.basePeriodWeeks,
        specializationWeeks: template.specializationWeeks,
        tournamentWeeks: template.tournamentWeeks,
        weeklyHoursTarget,
        intensityProfile: intensityProfile as Prisma.InputJsonValue,
        generatedAt: new Date(),
      },
    });

    // 4. Schedule tournaments
    const tournamentSchedules = await this.scheduleTournaments(
      annualPlan.id,
      input.startDate,
      input.tournaments || [],
      template
    );

    // 5. Generate periodization structure (52 weeks)
    const periodizationWeeks = this.generatePeriodizationStructure(
      input.startDate,
      template,
      tournamentSchedules
    );

    // Create Periodization records in batch
    await prisma.periodization.createMany({
      data: periodizationWeeks.map((week) => ({
        playerId: input.playerId,
        annualPlanId: annualPlan.id,
        weekNumber: week.weekNumber,
        period: week.period,
        periodPhase: week.periodPhase,
        weekInPeriod: week.weekInPeriod,
        volumeIntensity: week.volumeIntensity,
        plannedHours: week.targetHours,
      })),
    });

    // 6. Get player's club speed level
    const clubSpeedLevel = await this.getPlayerClubSpeedLevel(
      input.playerId,
      input.baselineDriverSpeed
    );

    // 7. Get player's breaking points with domain mapping
    const breakingPoints = await prisma.breakingPoint.findMany({
      where: {
        playerId: input.playerId,
        status: {
          in: ['not_started', 'in_progress', 'identified'],
        },
      },
      select: {
        id: true,
        testDomainCode: true,
        benchmarkTestId: true,
      },
    });

    const breakingPointIds = breakingPoints.map((bp) => bp.id);

    // V2: Assign testDomainCode to breaking points that don't have one
    const testToDomainMap = getTestToDomainMapping();
    for (const bp of breakingPoints) {
      if (!bp.testDomainCode && bp.benchmarkTestId) {
        const domain = testToDomainMap[bp.benchmarkTestId];
        if (domain) {
          await prisma.breakingPoint.update({
            where: { id: bp.id },
            data: { testDomainCode: domain },
          });
        }
      }
    }

    // V2: Get category constraints for the player
    const constraintsService = createCategoryConstraintsService(prisma);

    // Fetch player profile for gender
    const playerProfile = await prisma.player.findUnique({
      where: { id: input.playerId },
      select: { gender: true },
    });
    const playerGender = (playerProfile?.gender === 'F' ? 'F' : 'M') as Gender;

    // Fetch latest test results for constraint calculation
    const testResults = await prisma.testResult.findMany({
      where: {
        playerId: input.playerId,
        testDate: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Last 90 days
      },
      orderBy: { testDate: 'desc' },
      include: { test: { select: { testNumber: true } } },
    });

    // Build latest values map (testNumber -> value)
    const latestValues: Record<number, number> = {};
    for (const result of testResults) {
      const testNum = result.test?.testNumber;
      if (testNum && !latestValues[testNum]) {
        latestValues[testNum] = Number(result.value);
      }
    }

    // Compute category constraints (V2)
    let categoryConstraints: GetBindingConstraintsOutput | null = null;
    let topConstraints: BindingConstraint[] = [];

    try {
      // Convert latest test values to PlayerDomainPerformance format
      const performances: PlayerDomainPerformance[] = Object.entries(latestValues)
        .map(([testNumber, value]) => {
          const domainCode = mapTestNumberToDomain(Number(testNumber));
          if (!domainCode) return null;
          return {
            domainCode,
            currentValue: value,
            testCount: 1,
          };
        })
        .filter((p): p is PlayerDomainPerformance => p !== null);

      const currentCategory = playerCategory as CategoryAK;
      const targetCategory = getNextCategory(currentCategory);

      if (targetCategory) {
        categoryConstraints = constraintsService.calculateBindingConstraints({
          playerId: input.playerId,
          currentCategory,
          targetCategory,
          gender: playerGender,
          performances,
        });
        topConstraints = categoryConstraints.bindingConstraints;
      }
    } catch (error) {
      // If constraint calculation fails, continue without constraints
      console.warn('Failed to compute category constraints:', error);
    }

    // 8. Generate daily assignments (365 days) with V2 constraint awareness
    const dailyAssignments = await this.generateDailyAssignments(
      annualPlan.id,
      input.playerId,
      input.tenantId,
      input.startDate,
      periodizationWeeks,
      clubSpeedLevel,
      breakingPointIds,
      input.preferredTrainingDays,
      input.excludeDates || [],
      topConstraints // V2: Pass binding constraints for session selection
    );

    // 9. Build result
    const result: AnnualPlanGenerationResult = {
      annualPlan: {
        id: annualPlan.id,
        playerId: annualPlan.playerId,
        planName: annualPlan.planName,
        startDate: annualPlan.startDate,
        endDate: annualPlan.endDate,
        playerCategory: annualPlan.playerCategory,
        basePeriodWeeks: annualPlan.basePeriodWeeks,
        specializationWeeks: annualPlan.specializationWeeks,
        tournamentWeeks: annualPlan.tournamentWeeks,
      },
      periodizations: {
        created: periodizationWeeks.length,
        weekRange: { from: 1, to: 52 },
      },
      dailyAssignments: {
        created: dailyAssignments.created,
        dateRange: { from: input.startDate, to: endDate },
        sessionsByType: dailyAssignments.byType,
      },
      tournaments: {
        scheduled: tournamentSchedules.length,
        list: tournamentSchedules.map((t) => ({
          name: t.name,
          startDate: t.startDate,
          importance: t.importance,
        })),
      },
      breakingPoints: {
        linked: breakingPointIds.length,
      },
      // V2: Category constraints info
      categoryConstraints: categoryConstraints
        ? {
            currentCategory: playerCategory,
            totalGap: categoryConstraints.totalGap,
            canAdvance: topConstraints.length === 0,
            topBindingConstraints: topConstraints.slice(0, 4).map((c) => ({
              domain: c.domainCode,
              currentValue: c.currentValue,
              requiredValue: c.requiredValue,
              gapPercent: c.gapPercent,
              priority: c.priority,
            })),
          }
        : null,
    };

    return result;
  }

  /**
   * Generate periodization structure for 52 weeks
   */
  private static generatePeriodizationStructure(
    startDate: Date,
    template: PeriodizationTemplate,
    tournaments: TournamentSchedule[]
  ): PeriodizationWeek[] {
    const weeks: PeriodizationWeek[] = [];
    const currentDate = new Date(startDate);

    // Base period
    for (let i = 0; i < template.basePeriodWeeks; i++) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekNumber = i + 1;
      const period = i < template.basePeriodWeeks / 2 ? 'E' : 'G';

      weeks.push({
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        period,
        periodPhase: 'base',
        weekInPeriod: i + 1,
        learningPhases: template.learningPhaseDistribution.base,
        volumeIntensity: this.calculateVolumeIntensity('base', i, template.basePeriodWeeks),
        targetHours: template.weeklyHours[0],
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Specialization period
    for (let i = 0; i < template.specializationWeeks; i++) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekNumber = template.basePeriodWeeks + i + 1;
      const period = i < template.specializationWeeks / 2 ? 'G' : 'S';

      weeks.push({
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        period,
        periodPhase: 'specialization',
        weekInPeriod: i + 1,
        learningPhases: template.learningPhaseDistribution.specialization,
        volumeIntensity: this.calculateVolumeIntensity(
          'specialization',
          i,
          template.specializationWeeks
        ),
        targetHours: template.weeklyHours[1],
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Tournament period
    for (let i = 0; i < template.tournamentWeeks; i++) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekNumber = template.basePeriodWeeks + template.specializationWeeks + i + 1;
      const period = i < template.tournamentWeeks / 3 ? 'S' : 'T';

      weeks.push({
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        period,
        periodPhase: 'tournament',
        weekInPeriod: i + 1,
        learningPhases: template.learningPhaseDistribution.tournament,
        volumeIntensity: this.calculateVolumeIntensity('tournament', i, template.tournamentWeeks),
        targetHours: Math.round((template.weeklyHours[0] + template.weeklyHours[1]) / 2),
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Recovery period
    for (let i = 0; i < template.recoveryWeeks; i++) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekNumber = template.basePeriodWeeks + template.specializationWeeks + template.tournamentWeeks + i + 1;

      weeks.push({
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd,
        period: 'G',
        periodPhase: 'recovery',
        weekInPeriod: i + 1,
        learningPhases: ['L1', 'L2'],
        volumeIntensity: 'low',
        targetHours: Math.round(template.weeklyHours[0] / 2),
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Apply tournament adjustments
    this.applyTournamentAdjustments(weeks, tournaments);

    return weeks;
  }

  /**
   * Calculate volume intensity for a specific week in a period
   */
  private static calculateVolumeIntensity(
    phase: string,
    weekIndex: number,
    totalWeeks: number
  ): string {
    const progress = weekIndex / totalWeeks;

    if (phase === 'base') {
      if (progress < 0.3) return 'medium';
      if (progress < 0.7) return 'high';
      return 'medium'; // Taper slightly at end
    }

    if (phase === 'specialization') {
      return 'high';
    }

    if (phase === 'tournament') {
      if (progress < 0.5) return 'peak';
      return 'taper';
    }

    return 'low';
  }

  /**
   * Apply tournament-specific adjustments to periodization weeks
   */
  private static applyTournamentAdjustments(
    weeks: PeriodizationWeek[],
    tournaments: TournamentSchedule[]
  ): void {
    for (const tournament of tournaments) {
      // Topping period (build-up weeks before tournament)
      for (let i = 0; i < tournament.toppingDurationWeeks; i++) {
        const weekNum = tournament.toppingStartWeek + i;
        const week = weeks.find((w) => w.weekNumber === weekNum);
        if (week) {
          week.period = 'S';
          week.volumeIntensity = 'peak';
        }
      }

      // Tournament week
      const tournamentWeek = weeks.find((w) => w.weekNumber === tournament.weekNumber);
      if (tournamentWeek) {
        tournamentWeek.period = 'T';
        tournamentWeek.volumeIntensity = 'taper';
      }
    }
  }

  /**
   * Schedule tournaments and calculate preparation periods
   */
  private static async scheduleTournaments(
    annualPlanId: string,
    planStartDate: Date,
    tournaments: TournamentInput[],
    _template: PeriodizationTemplate
  ): Promise<TournamentSchedule[]> {
    const schedules: TournamentSchedule[] = [];

    for (const tournament of tournaments) {
      // Calculate week number
      const weekNumber = this.getWeekNumber(planStartDate, tournament.startDate);

      // Determine preparation periods based on importance
      const toppingWeeks = tournament.importance === 'A' ? 3 : tournament.importance === 'B' ? 2 : 1;
      const taperingDays = tournament.importance === 'A' ? 7 : tournament.importance === 'B' ? 5 : 3;

      const toppingStartWeek = Math.max(1, weekNumber - toppingWeeks);
      const taperingStartDate = new Date(tournament.startDate);
      taperingStartDate.setDate(taperingStartDate.getDate() - taperingDays);

      // Create schedule
      const schedule: TournamentSchedule = {
        tournamentId: tournament.tournamentId || '',
        name: tournament.name,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        weekNumber,
        importance: tournament.importance,
        toppingStartWeek,
        toppingDurationWeeks: toppingWeeks,
        taperingStartDate,
        taperingDurationDays: taperingDays,
        focusAreas: this.getTournamentFocusAreas(tournament.importance),
      };

      schedules.push(schedule);

      // Create ScheduledTournament record
      await prisma.scheduledTournament.create({
        data: {
          annualPlanId,
          tournamentId: tournament.tournamentId,
          name: tournament.name,
          startDate: tournament.startDate,
          endDate: tournament.endDate,
          importance: tournament.importance,
          weekNumber,
          period: 'T',
          toppingStartWeek,
          toppingDurationWeeks: toppingWeeks,
          taperingStartDate,
          taperingDurationDays: taperingDays,
          focusAreas: schedule.focusAreas as Prisma.InputJsonValue,
        },
      });
    }

    return schedules;
  }

  /**
   * Get focus areas for tournament preparation
   */
  private static getTournamentFocusAreas(importance: string): string[] {
    const focusAreas = {
      A: ['Mental preparation', 'Course strategy', 'Peak performance', 'Recovery optimization'],
      B: ['Competition readiness', 'Mental skills', 'Tactical preparation'],
      C: ['Competition exposure', 'Performance habits'],
    };

    return focusAreas[importance as keyof typeof focusAreas] || focusAreas.C;
  }

  /**
   * Generate daily training assignments for 365 days
   * V2: Optimized with batch inserts, in-memory hour tracking, and constraint awareness
   */
  private static async generateDailyAssignments(
    annualPlanId: string,
    playerId: string,
    tenantId: string,
    startDate: Date,
    periodizationWeeks: PeriodizationWeek[],
    clubSpeedLevel: string,
    breakingPointIds: string[],
    preferredTrainingDays?: number[],
    excludeDates: Date[] = [],
    topConstraints: BindingConstraint[] = [] // V2: Binding constraints for session selection
  ): Promise<{ created: number; byType: Record<string, number> }> {
    const byType: Record<string, number> = {};

    // Track hours allocated per week in memory (avoids N+1 DB queries)
    const weeklyHoursAllocated: Record<number, number> = {};

    // Build all assignments first, then batch insert
    const assignmentsToCreate: Array<{
      annualPlanId: string;
      playerId: string;
      assignedDate: Date;
      weekNumber: number;
      dayOfWeek: number;
      sessionTemplateId: string | null;
      sessionType: string;
      estimatedDuration: number;
      period: string;
      learningPhase: string | null;
      clubSpeed: string;
      intensity: number;
      isRestDay: boolean;
      status: string;
    }> = [];

    // Convert excludeDates to timestamps for O(1) lookup
    const excludeTimestamps = new Set(excludeDates.map(d => d.getTime()));

    for (let day = 0; day < 365; day++) {
      // Use UTC to avoid daylight saving time issues
      const currentDate = new Date(Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate() + day
      ));

      // Skip excluded dates (O(1) lookup with Set)
      if (excludeTimestamps.has(currentDate.getTime())) {
        continue;
      }

      const dayOfWeek = currentDate.getDay();
      const weekNumber = Math.floor(day / 7) + 1;

      // Find periodization week
      const periodWeek = periodizationWeeks.find((w) => w.weekNumber === weekNumber);
      if (!periodWeek) continue;

      // Determine if rest day
      const isRestDay = SessionSelectionService.shouldBeRestDay(
        dayOfWeek,
        weekNumber,
        periodWeek.volumeIntensity,
        preferredTrainingDays
      );

      // Get hours allocated from in-memory tracking (no DB query needed)
      const hoursAllocatedSoFar = weeklyHoursAllocated[weekNumber] || 0;

      // Build context for session selection
      const context: DailyAssignmentContext = {
        playerId,
        tenantId,
        annualPlanId,
        date: currentDate,
        weekNumber,
        dayOfWeek,
        period: periodWeek.period,
        periodPhase: periodWeek.periodPhase,
        weekInPeriod: periodWeek.weekInPeriod,
        learningPhases: periodWeek.learningPhases,
        settings: this.getSettingsForPeriod(periodWeek.period),
        clubSpeedLevel,
        breakingPointIds,
        targetHoursThisWeek: periodWeek.targetHours,
        hoursAllocatedSoFar,
        intensity: periodWeek.volumeIntensity,
        isRestDay,
        isTournamentWeek: periodWeek.period === 'T',
        isTaperingWeek: periodWeek.volumeIntensity === 'taper',
        isToppingWeek: periodWeek.volumeIntensity === 'peak' && periodWeek.periodPhase === 'tournament',
      };

      // V2: Select session with constraint awareness
      const session = topConstraints.length > 0
        ? await SessionSelectionService.selectSessionForDayWithContext(context, topConstraints)
        : await SessionSelectionService.selectSessionForDay(context);

      const estimatedDuration = session?.estimatedDuration || 0;
      const sessionType = session?.sessionType || 'rest';

      // Add to batch array instead of creating individually
      assignmentsToCreate.push({
        annualPlanId,
        playerId,
        assignedDate: currentDate,
        weekNumber,
        dayOfWeek,
        sessionTemplateId: session?.sessionTemplateId || null,
        sessionType,
        estimatedDuration,
        period: periodWeek.period,
        learningPhase: session?.learningPhase || null,
        clubSpeed: clubSpeedLevel,
        intensity: this.intensityStringToNumber(periodWeek.volumeIntensity),
        isRestDay,
        status: 'planned',
      });

      // Update in-memory hours tracking (convert minutes to hours)
      weeklyHoursAllocated[weekNumber] = (weeklyHoursAllocated[weekNumber] || 0) + (estimatedDuration / 60);

      // Track by type
      byType[sessionType] = (byType[sessionType] || 0) + 1;
    }

    // Batch insert all assignments at once
    await prisma.dailyTrainingAssignment.createMany({
      data: assignmentsToCreate,
    });

    return { created: assignmentsToCreate.length, byType };
  }

  /**
   * Get settings appropriate for a period
   */
  private static getSettingsForPeriod(period: string): string[] {
    const settingsMap: Record<string, string[]> = {
      E: ['S1', 'S2', 'S3'],
      G: ['S3', 'S4', 'S5', 'S6'],
      S: ['S5', 'S6', 'S7', 'S8'],
      T: ['S7', 'S8', 'S9', 'S10'],
    };

    return settingsMap[period] || ['S1', 'S2', 'S3'];
  }

  /**
   * Get player's club speed level
   */
  private static async getPlayerClubSpeedLevel(
    playerId: string,
    baselineDriverSpeed?: number
  ): Promise<string> {
    if (!baselineDriverSpeed) {
      // Try to get from calibration
      const calibration = await prisma.clubSpeedCalibration.findUnique({
        where: { playerId },
      });

      if (calibration) {
        baselineDriverSpeed = Number(calibration.driverSpeed);
      }
    }

    if (!baselineDriverSpeed) {
      return 'CS90'; // Default to average
    }

    // Map to CS level
    const mapping = await prisma.speedCategoryMapping.findFirst({
      where: {
        minDriverSpeed: { lte: baselineDriverSpeed },
        maxDriverSpeed: { gte: baselineDriverSpeed },
        isActive: true,
      },
    });

    return mapping?.clubSpeedLevel || 'CS90';
  }

  /**
   * Get week number from plan start date
   */
  private static getWeekNumber(planStartDate: Date, targetDate: Date): number {
    const diffTime = targetDate.getTime() - planStartDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  }

  /**
   * Convert intensity string to number
   */
  private static intensityStringToNumber(intensity: string): number {
    const map: Record<string, number> = {
      low: 3,
      medium: 5,
      high: 7,
      peak: 9,
      taper: 4,
    };

    return map[intensity] || 5;
  }
}
