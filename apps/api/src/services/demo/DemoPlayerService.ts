/**
 * DemoPlayerService
 * Handles creation of demo players with full onboarding data
 */

import { getPrismaClient } from '../../core/db/prisma';
import { hashPassword } from '../../utils/crypto';

const prisma = getPrismaClient();

export interface DemoPlayerData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: string;
  phone: string;
  handicap: number;
  averageScore: number;
  targetCategory: string;
  club: string;
  careerGoal: string;
  coachEmail?: string;
}

export interface AnnualPlanConfig {
  evaluationPeriod: { start: Date; end: Date; weeklyHours: number };
  baseTrainingPeriod: { start: Date; end: Date; weeklyHours: number };
  specializationPeriod: { start: Date; end: Date; weeklyHours: number };
  tournamentPeriod: { start: Date; end: Date; weeklyHours: number };
}

export class DemoPlayerService {
  /**
   * Create a demo player with full onboarding data
   */
  static async createDemoPlayer(
    tenantId: string,
    playerData: DemoPlayerData,
    annualPlanConfig: AnnualPlanConfig
  ) {
    try {
      // Find coach by email if provided
      let coachId: string | undefined;
      if (playerData.coachEmail) {
        const coach = await prisma.coach.findFirst({
          where: {
            user: {
              email: playerData.coachEmail,
              tenantId,
            },
          },
        });
        coachId = coach?.id;
      }

      // Create user account
      const hashedPassword = await hashPassword('Demo123!');
      const user = await prisma.user.create({
        data: {
          tenantId,
          email: playerData.email,
          passwordHash: hashedPassword,
          firstName: playerData.firstName,
          lastName: playerData.lastName,
          role: 'player',
          isActive: true,
        },
      });

      // Create player profile
      const player = await prisma.player.create({
        data: {
          tenantId,
          userId: user.id,
          firstName: playerData.firstName,
          lastName: playerData.lastName,
          email: playerData.email,
          phone: playerData.phone,
          dateOfBirth: playerData.dateOfBirth,
          gender: playerData.gender,
          handicap: playerData.handicap,
          averageScore: playerData.averageScore,
          category: playerData.targetCategory, // Current category same as target for demo
          targetCategory: playerData.targetCategory,
          club: playerData.club,
          careerGoal: playerData.careerGoal,
          coachId,
          currentPeriod: 'E', // Evaluation period
          weeklyTrainingHours: annualPlanConfig.evaluationPeriod.weeklyHours,
          onboardingComplete: true,
          status: 'active',
        },
      });

      console.log(`✅ Created demo player: ${player.firstName} ${player.lastName}`);

      return { user, player };
    } catch (error) {
      console.error('Error creating demo player:', error);
      throw error;
    }
  }

  /**
   * Create all three demo players
   */
  static async createAllDemoPlayers(tenantId: string) {
    const annualPlanConfig: AnnualPlanConfig = {
      evaluationPeriod: {
        start: new Date('2026-01-11'),
        end: new Date('2026-01-18'),
        weeklyHours: 25,
      },
      baseTrainingPeriod: {
        start: new Date('2026-01-19'),
        end: new Date('2026-04-30'),
        weeklyHours: 25,
      },
      specializationPeriod: {
        start: new Date('2026-05-01'),
        end: new Date('2026-05-25'),
        weeklyHours: 25,
      },
      tournamentPeriod: {
        start: new Date('2026-05-26'),
        end: new Date('2026-10-01'),
        weeklyHours: 25,
      },
    };

    const demoPlayers: DemoPlayerData[] = [
      {
        firstName: 'Anders',
        lastName: 'Kristiansen',
        email: 'anders.kristiansen@demo.com',
        dateOfBirth: new Date('1990-06-19'),
        gender: 'Mann',
        phone: '90967995',
        handicap: 0.0,
        averageScore: 74,
        targetCategory: 'C',
        club: 'WANG Toppidrett Fredrikstad',
        careerGoal: 'Bli profesjonell spiller',
        coachEmail: 'coach@demo.com', // Will link if coach exists
      },
      {
        firstName: 'Nils Jonas',
        lastName: 'Lilja',
        email: 'nils.lilja@demo.com',
        dateOfBirth: new Date('2008-06-15'),
        gender: 'Mann',
        phone: '90934859',
        handicap: 3.2,
        averageScore: 76,
        targetCategory: 'C',
        club: 'WANG Toppidrett Fredrikstad',
        careerGoal: 'Bli profesjonell spiller',
        coachEmail: 'coach@demo.com',
      },
      {
        firstName: 'Øyvind',
        lastName: 'Rohjan',
        email: 'oyvind.rohjan@demo.com',
        dateOfBirth: new Date('2008-03-11'),
        gender: 'Mann',
        phone: '90934384',
        handicap: 1.7,
        averageScore: 76,
        targetCategory: 'C',
        club: 'WANG Toppidrett Fredrikstad',
        careerGoal: 'Bli profesjonell spiller',
        coachEmail: 'coach@demo.com',
      },
    ];

    const results = [];
    for (const playerData of demoPlayers) {
      try {
        const result = await this.createDemoPlayer(
          tenantId,
          playerData,
          annualPlanConfig
        );
        results.push(result);
      } catch (error) {
        console.error(`Failed to create player ${playerData.firstName}:`, error);
      }
    }

    return results;
  }

  /**
   * Delete all demo players (for testing/cleanup)
   */
  static async deleteAllDemoPlayers(tenantId: string) {
    const demoEmails = [
      'anders.kristiansen@demo.com',
      'nils.lilja@demo.com',
      'oyvind.rohjan@demo.com',
    ];

    for (const email of demoEmails) {
      try {
        const user = await prisma.user.findFirst({
          where: { email, tenantId },
          include: { player: true },
        });

        if (user && user.player) {
          // Delete annual plan periods first (with cascade to distributions)
          await prisma.annualPlanPeriod.deleteMany({
            where: { playerId: user.player.id },
          });

          // Delete player
          await prisma.player.delete({
            where: { id: user.player.id },
          });

          // Delete user
          await prisma.user.delete({ where: { id: user.id } });
          console.log(`🗑️  Deleted demo player: ${email}`);
        } else if (user) {
          // User exists but no player - just delete user
          await prisma.user.delete({ where: { id: user.id } });
          console.log(`🗑️  Deleted demo user: ${email}`);
        }
      } catch (error) {
        console.error(`Failed to delete ${email}:`, error);
      }
    }
  }
}

export default DemoPlayerService;
