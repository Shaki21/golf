/**
 * Annual Plan Service
 * Handles annual plan CRUD operations for coaches
 */

import { PrismaClient } from '@prisma/client';

export interface Period {
  id: string;
  type: 'E' | 'G' | 'S' | 'T';
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  weeklyFrequency: number;
  goals: string[];
  color: string;
  textColor: string;
}

export interface AnnualPlanData {
  playerId: string;
  playerName?: string;
  name: string;
  startDate: string;
  endDate: string;
  periods: Period[];
}

export interface CreateAnnualPlanInput extends AnnualPlanData {}

export interface UpdateAnnualPlanInput {
  name?: string;
  startDate?: string;
  endDate?: string;
  periods?: Period[];
  status?: string;
}

export class AnnualPlanService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new annual plan
   */
  async createPlan(tenantId: string, coachId: string, input: CreateAnnualPlanInput) {
    const { playerId, name, startDate, endDate, periods } = input;

    // Validate player belongs to coach's tenant
    const player = await this.prisma.player.findFirst({
      where: {
        id: playerId,
        tenantId,
      },
    });

    if (!player) {
      throw new Error('Player not found or does not belong to your organization');
    }

    // Check if plan already exists
    const existing = await this.prisma.annualTrainingPlan.findFirst({
      where: {
        playerId,
        tenantId,
      },
    });

    if (existing) {
      throw new Error('Annual plan already exists for this player. Please update the existing plan.');
    }

    // Calculate period structure for old fields (for backward compatibility)
    const basePeriodWeeks = periods
      .filter(p => p.type === 'G')
      .reduce((sum, p) => {
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + Math.ceil(days / 7);
      }, 0) || 8;

    const specializationWeeks = periods
      .filter(p => p.type === 'S')
      .reduce((sum, p) => {
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + Math.ceil(days / 7);
      }, 0) || 4;

    const tournamentWeeks = periods
      .filter(p => p.type === 'T')
      .reduce((sum, p) => {
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + Math.ceil(days / 7);
      }, 0) || 4;

    const avgWeeklyFrequency =
      periods.length > 0
        ? Math.round(periods.reduce((sum, p) => sum + p.weeklyFrequency, 0) / periods.length)
        : 3;

    // Create plan with periods stored in intensityProfile as JSONB
    const plan = await this.prisma.annualTrainingPlan.create({
      data: {
        playerId,
        tenantId,
        planName: name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'active',

        // Legacy fields for backward compatibility
        baselineAverageScore: 0,
        baselineHandicap: null,
        baselineDriverSpeed: null,
        playerCategory: 'U0', // Will be populated from player data
        basePeriodWeeks,
        specializationWeeks,
        tournamentWeeks,
        weeklyHoursTarget: avgWeeklyFrequency * 60, // Assuming 60 min per session

        // Store our flexible period structure in intensityProfile
        intensityProfile: {
          version: '2.0',
          periods,
        },

        generatedAt: new Date(),
        generatedBy: coachId,
        generationAlgorithm: 'manual-v2.0',
      },
    });

    return {
      id: plan.id,
      playerId: plan.playerId,
      name: plan.planName,
      startDate: plan.startDate.toISOString().split('T')[0],
      endDate: plan.endDate.toISOString().split('T')[0],
      status: plan.status,
      periods: (plan.intensityProfile as any).periods || [],
      createdAt: plan.generatedAt,
    };
  }

  /**
   * Get annual plan by player ID
   */
  async getPlanByPlayerId(tenantId: string, playerId: string) {
    const plan = await this.prisma.annualTrainingPlan.findFirst({
      where: {
        playerId,
        tenantId,
      },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!plan) {
      return null;
    }

    return {
      id: plan.id,
      playerId: plan.playerId,
      playerName: `${plan.player.firstName} ${plan.player.lastName}`,
      name: plan.planName,
      startDate: plan.startDate.toISOString().split('T')[0],
      endDate: plan.endDate.toISOString().split('T')[0],
      status: plan.status,
      periods: (plan.intensityProfile as any).periods || [],
      createdAt: plan.generatedAt,
    };
  }

  /**
   * Get annual plan by ID
   */
  async getPlanById(tenantId: string, planId: string) {
    const plan = await this.prisma.annualTrainingPlan.findFirst({
      where: {
        id: planId,
        tenantId,
      },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!plan) {
      return null;
    }

    return {
      id: plan.id,
      playerId: plan.playerId,
      playerName: `${plan.player.firstName} ${plan.player.lastName}`,
      name: plan.planName,
      startDate: plan.startDate.toISOString().split('T')[0],
      endDate: plan.endDate.toISOString().split('T')[0],
      status: plan.status,
      periods: (plan.intensityProfile as any).periods || [],
      createdAt: plan.generatedAt,
    };
  }

  /**
   * Update annual plan
   */
  async updatePlan(tenantId: string, planId: string, input: UpdateAnnualPlanInput) {
    const existing = await this.prisma.annualTrainingPlan.findFirst({
      where: {
        id: planId,
        tenantId,
      },
    });

    if (!existing) {
      throw new Error('Annual plan not found');
    }

    const updateData: any = {};

    if (input.name) updateData.planName = input.name;
    if (input.startDate) updateData.startDate = new Date(input.startDate);
    if (input.endDate) updateData.endDate = new Date(input.endDate);
    if (input.status) updateData.status = input.status;

    if (input.periods) {
      // Recalculate legacy fields
      const basePeriodWeeks = input.periods
        .filter(p => p.type === 'G')
        .reduce((sum, p) => {
          const start = new Date(p.startDate);
          const end = new Date(p.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + Math.ceil(days / 7);
        }, 0) || existing.basePeriodWeeks;

      const specializationWeeks = input.periods
        .filter(p => p.type === 'S')
        .reduce((sum, p) => {
          const start = new Date(p.startDate);
          const end = new Date(p.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + Math.ceil(days / 7);
        }, 0) || existing.specializationWeeks;

      const tournamentWeeks = input.periods
        .filter(p => p.type === 'T')
        .reduce((sum, p) => {
          const start = new Date(p.startDate);
          const end = new Date(p.endDate);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + Math.ceil(days / 7);
        }, 0) || existing.tournamentWeeks;

      updateData.basePeriodWeeks = basePeriodWeeks;
      updateData.specializationWeeks = specializationWeeks;
      updateData.tournamentWeeks = tournamentWeeks;

      // Update periods in intensityProfile
      updateData.intensityProfile = {
        version: '2.0',
        periods: input.periods,
      };
    }

    const plan = await this.prisma.annualTrainingPlan.update({
      where: { id: planId },
      data: updateData,
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      id: plan.id,
      playerId: plan.playerId,
      playerName: `${plan.player.firstName} ${plan.player.lastName}`,
      name: plan.planName,
      startDate: plan.startDate.toISOString().split('T')[0],
      endDate: plan.endDate.toISOString().split('T')[0],
      status: plan.status,
      periods: (plan.intensityProfile as any).periods || [],
      createdAt: plan.generatedAt,
    };
  }

  /**
   * Delete annual plan
   */
  async deletePlan(tenantId: string, planId: string) {
    const existing = await this.prisma.annualTrainingPlan.findFirst({
      where: {
        id: planId,
        tenantId,
      },
    });

    if (!existing) {
      throw new Error('Annual plan not found');
    }

    await this.prisma.annualTrainingPlan.delete({
      where: { id: planId },
    });

    return { success: true };
  }

  /**
   * List all annual plans for coach's players
   */
  async listPlans(tenantId: string, coachId: string) {
    // Get all players assigned to this coach
    const players = await this.prisma.player.findMany({
      where: {
        tenantId,
        // TODO: Add coach relationship filter when available
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        annualTrainingPlans: {
          select: {
            id: true,
            planName: true,
            startDate: true,
            endDate: true,
            status: true,
            generatedAt: true,
          },
        },
      },
    });

    const plans = players.flatMap(player =>
      player.annualTrainingPlans.map(plan => ({
        id: plan.id,
        playerId: player.id,
        playerName: `${player.firstName} ${player.lastName}`,
        name: plan.planName,
        startDate: plan.startDate.toISOString().split('T')[0],
        endDate: plan.endDate.toISOString().split('T')[0],
        status: plan.status,
        createdAt: plan.generatedAt,
      }))
    );

    return plans;
  }
}
