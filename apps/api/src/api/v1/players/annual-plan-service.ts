/**
 * Player Annual Plan Service
 * Self-service annual plan creation for players
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

export interface CreatePlayerAnnualPlanInput {
  name: string;
  startDate: string;
  endDate: string;
  periods: Period[];
}

export interface UpdatePlayerAnnualPlanInput {
  name?: string;
  startDate?: string;
  endDate?: string;
  periods?: Period[];
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
}

export class PlayerAnnualPlanService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get player's current annual plan
   */
  async getPlayerPlan(tenantId: string, playerId: string) {
    const plan = await this.prisma.annualTrainingPlan.findFirst({
      where: {
        playerId,
        tenantId,
        status: { not: 'cancelled' },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      plan,
      hasActivePlan: !!plan && plan.status === 'active',
    };
  }

  /**
   * Create new annual plan for player
   */
  async createPlayerPlan(
    tenantId: string,
    playerId: string,
    data: CreatePlayerAnnualPlanInput
  ) {
    // Validate player exists
    const player = await this.prisma.player.findFirst({
      where: { id: playerId, tenantId },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    // Check if active plan exists
    const existingPlan = await this.prisma.annualTrainingPlan.findFirst({
      where: {
        playerId,
        tenantId,
        status: 'active',
      },
    });

    if (existingPlan) {
      throw new Error(
        'An active annual plan already exists. Please complete or cancel it first.'
      );
    }

    // Validate periods don't overlap
    this.validatePeriods(data.periods);

    // Validate date range
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      throw new Error('End date must be after start date');
    }

    // Calculate period totals
    const periodTypeCounts = data.periods.reduce((acc, period) => {
      const type = period.type;
      if (!acc[type]) acc[type] = 0;
      const weeks = Math.ceil((new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000));
      acc[type] += weeks;
      return acc;
    }, {} as Record<string, number>);

    // Create plan
    const plan = await this.prisma.annualTrainingPlan.create({
      data: {
        tenantId,
        playerId,
        planName: data.name,
        startDate: start,
        endDate: end,
        periods: data.periods as any,
        status: 'active',
        // Required baseline fields - use defaults for player-created plans
        baselineAverageScore: 0,
        playerCategory: 'B', // Default category
        basePeriodWeeks: periodTypeCounts['G'] || 0,
        specializationWeeks: periodTypeCounts['S'] || 0,
        tournamentWeeks: periodTypeCounts['T'] || 0,
        weeklyHoursTarget: 10, // Default 10 hours per week
        intensityProfile: {
          base: { volume: 'medium', intensity: 'medium' },
          recovery: { volume: 'low', intensity: 'low' },
          specialization: { volume: 'medium', intensity: 'high' },
          tournament: { volume: 'medium', intensity: 'peak' },
        },
        generatedAt: new Date(),
      },
    });

    return plan;
  }

  /**
   * Update existing annual plan
   */
  async updatePlayerPlan(
    tenantId: string,
    playerId: string,
    data: UpdatePlayerAnnualPlanInput
  ) {
    const plan = await this.prisma.annualTrainingPlan.findFirst({
      where: {
        playerId,
        tenantId,
        status: { not: 'cancelled' },
      },
    });

    if (!plan) {
      throw new Error('No active annual plan found');
    }

    // Validate periods if provided
    if (data.periods) {
      this.validatePeriods(data.periods);
    }

    // Validate dates if provided
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end <= start) {
        throw new Error('End date must be after start date');
      }
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.periods) updateData.periods = data.periods;
    if (data.status) updateData.status = data.status;

    return await this.prisma.annualTrainingPlan.update({
      where: { id: plan.id },
      data: updateData,
    });
  }

  /**
   * Cancel annual plan
   */
  async cancelPlayerPlan(tenantId: string, playerId: string) {
    const plan = await this.prisma.annualTrainingPlan.findFirst({
      where: {
        playerId,
        tenantId,
        status: { not: 'cancelled' },
      },
    });

    if (!plan) {
      throw new Error('No active annual plan found');
    }

    return await this.prisma.annualTrainingPlan.update({
      where: { id: plan.id },
      data: { status: 'cancelled' },
    });
  }

  /**
   * Get predefined templates
   */
  async getTemplates() {
    return ANNUAL_PLAN_TEMPLATES;
  }

  /**
   * Validate periods don't overlap and have valid data
   */
  private validatePeriods(periods: Period[]) {
    if (periods.length === 0) {
      throw new Error('At least one period is required');
    }

    const sorted = [...periods].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      const currentEnd = new Date(current.endDate);
      const nextStart = new Date(next.startDate);

      if (currentEnd >= nextStart) {
        throw new Error(
          `Period overlap detected: ${current.name} and ${next.name}`
        );
      }

      // Validate period has valid dates
      const periodStart = new Date(current.startDate);
      const periodEnd = new Date(current.endDate);
      if (periodEnd <= periodStart) {
        throw new Error(
          `Invalid period dates for ${current.name}: end date must be after start date`
        );
      }

      // Validate weekly frequency
      if (current.weeklyFrequency < 1 || current.weeklyFrequency > 7) {
        throw new Error(
          `Invalid weekly frequency for ${current.name}: must be between 1 and 7`
        );
      }
    }

    // Validate last period
    const last = sorted[sorted.length - 1];
    const lastStart = new Date(last.startDate);
    const lastEnd = new Date(last.endDate);
    if (lastEnd <= lastStart) {
      throw new Error(
        `Invalid period dates for ${last.name}: end date must be after start date`
      );
    }
    if (last.weeklyFrequency < 1 || last.weeklyFrequency > 7) {
      throw new Error(
        `Invalid weekly frequency for ${last.name}: must be between 1 and 7`
      );
    }
  }
}

// Predefined templates
const ANNUAL_PLAN_TEMPLATES = [
  {
    id: 'elite-52weeks',
    name: 'Elite Årsplan (52 uker)',
    description: 'Komplett periodisert plan for elite-spillere',
    targetLevel: 'elite',
    durationWeeks: 52,
    periods: [
      {
        id: 'e1',
        type: 'E' as const,
        name: 'Etablering',
        description: 'Bygge grunnlag etter sesong',
        weeklyFrequency: 3,
        weeks: 6,
        goals: ['Restitusjon', 'Grunnkondisjon', 'Teknisk evaluering'],
        color: '#10B981',
        textColor: '#065F46',
      },
      {
        id: 'g1',
        type: 'G' as const,
        name: 'Grunntrening Fase 1',
        description: 'Bygge volum og styrke',
        weeklyFrequency: 5,
        weeks: 12,
        goals: ['Øke treningsvolum', 'Styrketrening', 'Teknisk utvikling'],
        color: '#3B82F6',
        textColor: '#1E3A8A',
      },
      {
        id: 's1',
        type: 'S' as const,
        name: 'Pre-sesong Spesialisering',
        description: 'Golf-spesifikk forberedelse',
        weeklyFrequency: 4,
        weeks: 10,
        goals: [
          'Turnerings-forberedelse',
          'Short game fokus',
          'Mental trening',
        ],
        color: '#F59E0B',
        textColor: '#92400E',
      },
      {
        id: 't1',
        type: 'T' as const,
        name: 'Konkurransesesong',
        description: 'Prestere og vedlikeholde',
        weeklyFrequency: 4,
        weeks: 20,
        goals: ['Prestere i turneringer', 'Vedlikeholde form', 'Analysere'],
        color: '#EF4444',
        textColor: '#991B1B',
      },
      {
        id: 'g2',
        type: 'G' as const,
        name: 'Mid-sesong Grunntrening',
        description: 'Regenerering og vedlikehold',
        weeklyFrequency: 3,
        weeks: 4,
        goals: ['Restitusjon', 'Vedlikeholde styrke', 'Mental pause'],
        color: '#3B82F6',
        textColor: '#1E3A8A',
      },
    ],
  },
  {
    id: 'talent-40weeks',
    name: 'Talent Årsplan (40 uker)',
    description: 'Periodisert plan for talent-spillere',
    targetLevel: 'talent',
    durationWeeks: 40,
    periods: [
      {
        id: 'e1',
        type: 'E' as const,
        name: 'Etablering',
        weeklyFrequency: 3,
        weeks: 6,
        goals: ['Bygge treningsvaner', 'Grunnleggende teknikk', 'Baseline'],
        color: '#10B981',
        textColor: '#065F46',
      },
      {
        id: 'g1',
        type: 'G' as const,
        name: 'Grunntrening',
        weeklyFrequency: 4,
        weeks: 16,
        goals: ['Teknisk utvikling', 'Øke volum', 'Fysisk grunnlag'],
        color: '#3B82F6',
        textColor: '#1E3A8A',
      },
      {
        id: 's1',
        type: 'S' as const,
        name: 'Spesialisering',
        weeklyFrequency: 4,
        weeks: 8,
        goals: ['Golf-spesifikk', 'Pre-sesong', 'Mental forberedelse'],
        color: '#F59E0B',
        textColor: '#92400E',
      },
      {
        id: 't1',
        type: 'T' as const,
        name: 'Turnering',
        weeklyFrequency: 3,
        weeks: 10,
        goals: ['Konkurransesesong', 'Prestere', 'Lære av resultater'],
        color: '#EF4444',
        textColor: '#991B1B',
      },
    ],
  },
];
