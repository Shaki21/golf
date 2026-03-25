/**
 * Intake Processing Service
 * Validates and processes player intake forms to generate training plans
 */

import { getPrismaClient } from '../../core/db/prisma';
import { Prisma } from '@prisma/client';
import type {
  PlayerIntakeForm,
  ProcessedIntake,
  IntakeValidation,
  TournamentGoal,
} from './intake.types';
import { PlanGenerationService } from '../training-plan/plan-generation.service';
import type { GenerateAnnualPlanInput } from '../training-plan/plan-generation.types';

// Helper to convert typed data to Prisma JSON input
const toJsonValue = <T>(data: T | undefined): Prisma.InputJsonValue | undefined => {
  return data as Prisma.InputJsonValue | undefined;
};

// Type for Prisma PlayerIntake with JSON fields
type PlayerIntakeRecord = {
  id: string;
  playerId: string;
  tenantId: string;
  background: Prisma.JsonValue;
  availability: Prisma.JsonValue;
  goals: Prisma.JsonValue;
  weaknesses: Prisma.JsonValue;
  health: Prisma.JsonValue;
  lifestyle: Prisma.JsonValue;
  equipment: Prisma.JsonValue;
  learning: Prisma.JsonValue;
  completionPercentage: number;
  isComplete: boolean;
  generatedPlanId: string | null;
  player?: { id: string };
};

const prisma = getPrismaClient();

export class IntakeProcessingService {
  /**
   * Submit or update intake form
   */
  static async submitIntake(
    playerId: string,
    tenantId: string,
    intakeData: Partial<PlayerIntakeForm>
  ): Promise<{
    id: string;
    completionPercentage: number;
    isComplete: boolean;
  }> {
    // Calculate completion percentage
    const validation = this.validateIntake(intakeData);

    // Get or create intake record
    const existing = await prisma.playerIntake.findFirst({
      where: {
        playerId,
        isComplete: false, // Only get incomplete intake
      },
      orderBy: { createdAt: 'desc' },
    });

    const intakeRecord = existing
      ? await prisma.playerIntake.update({
          where: { id: existing.id },
          data: {
            background: (toJsonValue(intakeData.background) ?? existing.background) as Prisma.InputJsonValue,
            availability: (toJsonValue(intakeData.availability) ?? existing.availability) as Prisma.InputJsonValue,
            goals: (toJsonValue(intakeData.goals) ?? existing.goals) as Prisma.InputJsonValue,
            weaknesses: (toJsonValue(intakeData.weaknesses) ?? existing.weaknesses) as Prisma.InputJsonValue,
            health: (toJsonValue(intakeData.health) ?? existing.health) as Prisma.InputJsonValue,
            lifestyle: (toJsonValue(intakeData.lifestyle) ?? existing.lifestyle) as Prisma.InputJsonValue,
            equipment: (toJsonValue(intakeData.equipment) ?? existing.equipment) as Prisma.InputJsonValue,
            learning: (toJsonValue(intakeData.learning) ?? existing.learning) as Prisma.InputJsonValue,
            completionPercentage: validation.completionPercentage,
            isComplete: validation.isComplete,
          },
        })
      : await prisma.playerIntake.create({
          data: {
            playerId,
            tenantId,
            background: toJsonValue(intakeData.background) ?? Prisma.JsonNull,
            availability: toJsonValue(intakeData.availability) ?? Prisma.JsonNull,
            goals: toJsonValue(intakeData.goals) ?? Prisma.JsonNull,
            weaknesses: toJsonValue(intakeData.weaknesses) ?? Prisma.JsonNull,
            health: toJsonValue(intakeData.health) ?? Prisma.JsonNull,
            lifestyle: toJsonValue(intakeData.lifestyle) ?? Prisma.JsonNull,
            equipment: toJsonValue(intakeData.equipment) ?? Prisma.JsonNull,
            learning: toJsonValue(intakeData.learning) ?? Prisma.JsonNull,
            completionPercentage: validation.completionPercentage,
            isComplete: validation.isComplete,
          },
        });

    return {
      id: intakeRecord.id,
      completionPercentage: validation.completionPercentage,
      isComplete: validation.isComplete,
    };
  }

  /**
   * Validate intake completeness
   */
  static validateIntake(intake: Partial<PlayerIntakeForm>): IntakeValidation {
    const required = [
      'background',
      'availability',
      'goals',
      'weaknesses',
      'health',
    ];
    const optional = ['lifestyle', 'equipment', 'learning'];

    const missingRequired: string[] = [];
    const warnings: string[] = [];

    // Check required sections
    for (const section of required) {
      if (!intake[section as keyof PlayerIntakeForm]) {
        missingRequired.push(section);
      }
    }

    // Check optional sections for warnings
    for (const section of optional) {
      if (!intake[section as keyof PlayerIntakeForm]) {
        warnings.push(`Optional section '${section}' not filled - plan may be less personalized`);
      }
    }

    const totalSections = required.length + optional.length;
    const completedSections =
      totalSections - missingRequired.length - (warnings.length > 0 ? warnings.length : 0);

    const completionPercentage = Math.round((completedSections / totalSections) * 100);
    const isComplete = missingRequired.length === 0;

    return {
      isComplete,
      completionPercentage,
      missingRequired,
      warnings,
    };
  }

  /**
   * Process intake and generate training plan
   */
  static async generatePlanFromIntake(intakeId: string): Promise<any> {
    // Get intake data
    const intake = await prisma.playerIntake.findUnique({
      where: { id: intakeId },
      include: { player: true },
    });

    if (!intake) {
      throw new Error('Intake not found');
    }

    if (!intake.isComplete) {
      throw new Error('Intake form is not complete. Please fill all required sections.');
    }

    // Process intake to plan input
    const processedIntake = this.processIntakeData(intake);

    // Generate plan using existing service
    const planInput = await this.convertToPlanGenerationInput(
      intake.playerId,
      intake.tenantId,
      processedIntake
    );

    const planResult = await PlanGenerationService.generateAnnualPlan(planInput);

    // Link plan to intake
    await prisma.playerIntake.update({
      where: { id: intakeId },
      data: { generatedPlanId: planResult.annualPlan.id },
    });

    return planResult;
  }

  /**
   * Process intake data into structured format
   */
  private static processIntakeData(intake: PlayerIntakeRecord): ProcessedIntake {
    const background = intake.background as unknown as PlayerIntakeForm['background'];
    const availability = intake.availability as unknown as PlayerIntakeForm['availability'];
    const goals = intake.goals as unknown as PlayerIntakeForm['goals'];
    const weaknesses = intake.weaknesses as unknown as PlayerIntakeForm['weaknesses'];
    const health = intake.health as unknown as PlayerIntakeForm['health'];
    const lifestyle = intake.lifestyle as unknown as PlayerIntakeForm['lifestyle'];
    // Equipment is available as intake.equipment if needed in the future

    // Determine player category from average score
    const playerCategory = this.categorizePlayer(background.averageScore);

    // Calculate weekly hours (consider availability and lifestyle)
    const weeklyHoursTarget = this.calculateWeeklyHours(
      availability.hoursPerWeek,
      lifestyle?.stressLevel,
      health?.ageGroup
    );

    // Determine plan duration based on goal timeframe
    const planDuration = this.calculatePlanDuration(goals.timeframe);

    // Process tournaments
    const tournaments = this.processTournaments(goals.tournaments || []);

    // Extract priority areas from weaknesses
    const priorityAreas = this.extractPriorityAreas(weaknesses);

    // Extract restrictions from health
    const restrictions = this.extractRestrictions(health);

    // Intensity modifiers
    const intensityModifiers = {
      reduceForAge: this.shouldReduceForAge(health?.ageGroup),
      reduceForInjury: health?.currentInjuries?.length > 0,
      reduceForStress: (lifestyle?.stressLevel || 0) >= 4,
      increaseForGoals: goals.primaryGoal === 'compete_tournaments',
    };

    return {
      playerCategory,
      weeklyHoursTarget,
      planDuration,
      startDate: new Date(),
      tournaments,
      priorityAreas,
      restrictions,
      preferredTrainingDays: availability.preferredDays,
      intensityModifiers,
    };
  }

  /**
   * Convert processed intake to plan generation input
   */
  private static async convertToPlanGenerationInput(
    playerId: string,
    tenantId: string,
    processed: ProcessedIntake
  ): Promise<GenerateAnnualPlanInput> {
    // Get baseline metrics
    const baselineMetrics = await this.getBaselineMetrics(playerId);

    return {
      playerId,
      tenantId,
      startDate: processed.startDate,
      baselineAverageScore: baselineMetrics.averageScore,
      baselineHandicap: baselineMetrics.handicap,
      baselineDriverSpeed: baselineMetrics.driverSpeed,
      planName: `${new Date().getFullYear()} Treningsplan`,
      weeklyHoursTarget: processed.weeklyHoursTarget,
      tournaments: processed.tournaments,
      preferredTrainingDays: processed.preferredTrainingDays,
    };
  }

  /**
   * Categorize player based on average score
   */
  private static categorizePlayer(averageScore: number): 'E1' | 'A1' | 'I1' | 'D1' | 'B1' {
    if (averageScore < 70) return 'E1'; // Elite
    if (averageScore < 75) return 'A1'; // Advanced
    if (averageScore < 80) return 'I1'; // Intermediate
    if (averageScore < 85) return 'D1'; // Developing
    return 'B1'; // Beginner
  }

  /**
   * Calculate appropriate weekly hours
   */
  private static calculateWeeklyHours(
    requestedHours: number,
    stressLevel?: number,
    ageGroup?: string
  ): number {
    let hours = requestedHours;

    // Reduce for high stress
    if (stressLevel && stressLevel >= 4) {
      hours = hours * 0.85; // 15% reduction
    }

    // Reduce for older age groups
    if (ageGroup && ['55-65', '65+'].includes(ageGroup)) {
      hours = hours * 0.9; // 10% reduction
    }

    // Cap at reasonable limits
    return Math.max(8, Math.min(25, Math.round(hours)));
  }

  /**
   * Calculate plan duration
   */
  private static calculatePlanDuration(timeframe: string): number {
    switch (timeframe) {
      case '3_months':
        return 12;
      case '6_months':
        return 26;
      case '12_months':
      default:
        return 52;
    }
  }

  /**
   * Process tournament goals
   */
  private static processTournaments(tournamentGoals: TournamentGoal[]): any[] {
    return tournamentGoals.map((t) => ({
      name: t.name,
      startDate: new Date(t.date),
      endDate: new Date(t.date), // Assume 1-day for now, can be extended
      importance: t.importance === 'major' ? 'A' : t.importance === 'important' ? 'B' : 'C',
    }));
  }

  /**
   * Extract priority areas from weaknesses
   */
  private static extractPriorityAreas(weaknesses: PlayerIntakeForm['weaknesses']): string[] {
    const areas: string[] = [];

    if (weaknesses.problemAreas) {
      areas.push(...weaknesses.problemAreas);
    }

    if (weaknesses.biggestFrustration) {
      areas.push(weaknesses.biggestFrustration);
    }

    return areas;
  }

  /**
   * Extract restrictions from health data
   */
  private static extractRestrictions(health: PlayerIntakeForm['health']): string[] {
    const restrictions: string[] = [];

    if (health.currentInjuries) {
      health.currentInjuries.forEach((injury) => {
        if (injury.requiresModification) {
          restrictions.push(`Injury: ${injury.type}`);
        }
      });
    }

    if (health.mobilityIssues) {
      health.mobilityIssues.forEach((issue: string) => {
        restrictions.push(`Mobility: ${issue}`);
      });
    }

    return restrictions;
  }

  /**
   * Should reduce intensity for age
   */
  private static shouldReduceForAge(ageGroup?: string): boolean {
    return ageGroup ? ['55-65', '65+'].includes(ageGroup) : false;
  }

  /**
   * Get baseline metrics from player profile and calibration data
   */
  private static async getBaselineMetrics(playerId: string): Promise<{
    averageScore: number;
    handicap?: number;
    driverSpeed?: number;
  }> {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: {
        averageScore: true,
        handicap: true,
      },
    });

    const calibration = await prisma.clubSpeedCalibration.findFirst({
      where: { playerId },
      orderBy: { calibrationDate: 'desc' },
    });

    return {
      averageScore: player?.averageScore ? Number(player.averageScore) : 80,
      handicap: player?.handicap ? Number(player.handicap) : undefined,
      driverSpeed: calibration?.driverSpeed ? Number(calibration.driverSpeed) : undefined,
    };
  }

  /**
   * Get intake by player ID
   */
  static async getPlayerIntake(playerId: string): Promise<any> {
    return await prisma.playerIntake.findFirst({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all intakes for a tenant (for admin)
   */
  static async getTenantIntakes(tenantId: string, filters?: {
    isComplete?: boolean;
    hasGeneratedPlan?: boolean;
  }): Promise<any[]> {
    return await prisma.playerIntake.findMany({
      where: {
        tenantId,
        ...(filters?.isComplete !== undefined && { isComplete: filters.isComplete }),
        ...(filters?.hasGeneratedPlan !== undefined && {
          generatedPlanId: filters.hasGeneratedPlan ? { not: null } : null,
        }),
      },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
