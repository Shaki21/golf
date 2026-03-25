/**
 * AnnualPlanGenerator
 * Generates annual training plans with periodization and training distribution
 */

import { getPrismaClient } from '../../core/db/prisma';

const prisma = getPrismaClient();

export interface PeriodConfig {
  type: 'evaluation' | 'base_training' | 'specialization' | 'tournament';
  startDate: Date;
  endDate: Date;
  weeklyHours: number;
}

export interface TrainingDistribution {
  physical: number; // Percentage 0-100
  technique: number;
  golfShots: number;
  coursePlay: number;
  tournament: number;
}

export class AnnualPlanGenerator {
  /**
   * Default training distribution per period type
   * Based on training pyramid principles
   */
  private static readonly PERIOD_DISTRIBUTIONS: Record<
    PeriodConfig['type'],
    TrainingDistribution
  > = {
    evaluation: {
      physical: 20,
      technique: 30,
      golfShots: 30,
      coursePlay: 15,
      tournament: 5,
    },
    base_training: {
      physical: 35, // Focus on foundation
      technique: 30,
      golfShots: 25,
      coursePlay: 10,
      tournament: 0,
    },
    specialization: {
      physical: 20,
      technique: 25,
      golfShots: 35, // Focus on specific shots
      coursePlay: 20,
      tournament: 0,
    },
    tournament: {
      physical: 15, // Maintenance
      technique: 15,
      golfShots: 25,
      coursePlay: 25,
      tournament: 20, // Peak competition
    },
  };

  /**
   * Generate annual plan for a player
   */
  static async generateAnnualPlan(
    playerId: string,
    periods: PeriodConfig[],
    customDistributions?: Partial<Record<PeriodConfig['type'], Partial<TrainingDistribution>>>
  ) {
    try {
      const createdPeriods = [];

      for (const periodConfig of periods) {
        // Get distribution (custom or default)
        const defaultDist = this.PERIOD_DISTRIBUTIONS[periodConfig.type];
        const customDist = customDistributions?.[periodConfig.type];
        const distribution: TrainingDistribution = {
          ...defaultDist,
          ...customDist,
        };

        // Calculate hours per category
        const hoursPerCategory = {
          physical: (periodConfig.weeklyHours * distribution.physical) / 100,
          technique: (periodConfig.weeklyHours * distribution.technique) / 100,
          golfShots: (periodConfig.weeklyHours * distribution.golfShots) / 100,
          coursePlay: (periodConfig.weeklyHours * distribution.coursePlay) / 100,
          tournament: (periodConfig.weeklyHours * distribution.tournament) / 100,
        };

        // Create period
        const period = await prisma.annualPlanPeriod.create({
          data: {
            playerId,
            periodType: periodConfig.type,
            startDate: periodConfig.startDate,
            endDate: periodConfig.endDate,
            weeklyHours: periodConfig.weeklyHours,
          },
        });

        // Create training distributions for each category
        const distributionRecords = [];
        for (const [category, hours] of Object.entries(hoursPerCategory)) {
          if (hours > 0) {
            const dist = await prisma.periodTrainingDistribution.create({
              data: {
                periodId: period.id,
                category: this.categoryToDbName(category),
                hoursPerWeek: hours,
                percentage: distribution[category as keyof TrainingDistribution],
              },
            });
            distributionRecords.push(dist);
          }
        }

        createdPeriods.push({
          period,
          distributions: distributionRecords,
        });

        console.log(
          `✅ Created ${periodConfig.type} period (${periodConfig.startDate.toISOString().split('T')[0]} - ${periodConfig.endDate.toISOString().split('T')[0]})`
        );
      }

      return createdPeriods;
    } catch (error) {
      console.error('Error generating annual plan:', error);
      throw error;
    }
  }

  /**
   * Generate standard 4-period annual plan
   */
  static async generateStandardAnnualPlan(playerId: string, weeklyHours: number = 25) {
    const periods: PeriodConfig[] = [
      {
        type: 'evaluation',
        startDate: new Date('2026-01-11'),
        endDate: new Date('2026-01-18'),
        weeklyHours,
      },
      {
        type: 'base_training',
        startDate: new Date('2026-01-19'),
        endDate: new Date('2026-04-30'),
        weeklyHours,
      },
      {
        type: 'specialization',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-05-25'),
        weeklyHours,
      },
      {
        type: 'tournament',
        startDate: new Date('2026-05-26'),
        endDate: new Date('2026-10-01'),
        weeklyHours,
      },
    ];

    return await this.generateAnnualPlan(playerId, periods);
  }

  /**
   * Get annual plan summary for a player
   */
  static async getAnnualPlanSummary(playerId: string) {
    const periods = await prisma.annualPlanPeriod.findMany({
      where: { playerId },
      include: {
        periodTrainingDistribution: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return periods.map((period) => ({
      type: period.periodType,
      startDate: period.startDate,
      endDate: period.endDate,
      weeklyHours: period.weeklyHours,
      distribution: period.periodTrainingDistribution.reduce(
        (acc, dist) => {
          acc[dist.category] = {
            hours: Number(dist.hoursPerWeek),
            percentage: Number(dist.percentage),
          };
          return acc;
        },
        {} as Record<string, { hours: number; percentage: number }>
      ),
    }));
  }

  /**
   * Delete annual plan for a player
   */
  static async deleteAnnualPlan(playerId: string) {
    await prisma.annualPlanPeriod.deleteMany({
      where: { playerId },
    });
    console.log(`🗑️  Deleted annual plan for player ${playerId}`);
  }

  /**
   * Helper: Convert category name to database name
   */
  private static categoryToDbName(category: string): string {
    const mapping: Record<string, string> = {
      physical: 'physical',
      technique: 'technique',
      golfShots: 'golf_shots',
      coursePlay: 'course_play',
      tournament: 'tournament',
    };
    return mapping[category] || category;
  }

  /**
   * Calculate total training hours for a period
   */
  static async calculatePeriodTotalHours(periodId: string): Promise<number> {
    const period = await prisma.annualPlanPeriod.findUnique({
      where: { id: periodId },
    });

    if (!period) {
      throw new Error(`Period ${periodId} not found`);
    }

    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    const weeks = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    return period.weeklyHours * weeks;
  }

  /**
   * Get current active period for a player
   */
  static async getCurrentPeriod(playerId: string) {
    const now = new Date();
    const period = await prisma.annualPlanPeriod.findFirst({
      where: {
        playerId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        periodTrainingDistribution: true,
      },
    });

    return period;
  }
}

export default AnnualPlanGenerator;
