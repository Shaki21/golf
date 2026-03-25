/**
 * Test Fixtures
 * Factory functions for creating test data
 */

import { PrismaClient } from '@prisma/client';
import { getTestPrisma, uniqueEmail, uniqueString, DEMO_IDS } from './testUtils';
import * as argon2 from 'argon2';

/**
 * Create a test tenant
 */
export async function createTestTenant(
  prisma?: PrismaClient,
  overrides: Partial<{
    name: string;
    slug: string;
    status: string;
  }> = {}
) {
  const db = prisma || getTestPrisma();
  const name = overrides.name || uniqueString('Test Academy');

  return db.tenant.create({
    data: {
      name,
      slug: overrides.slug || name.toLowerCase().replace(/\s+/g, '-'),
      status: overrides.status || 'active',
    },
  });
}

/**
 * Create a test user
 */
export async function createTestUser(
  prisma?: PrismaClient,
  overrides: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'coach' | 'player';
    tenantId: string;
    isActive: boolean;
  }> = {}
) {
  const db = prisma || getTestPrisma();
  const password = overrides.password || 'TestPassword123!';
  const passwordHash = await argon2.hash(password);

  // Use existing tenant or create new one
  let tenantId = overrides.tenantId;
  if (!tenantId) {
    const tenant = await createTestTenant(db);
    tenantId = tenant.id;
  }

  const user = await db.user.create({
    data: {
      email: overrides.email || uniqueEmail(),
      passwordHash,
      firstName: overrides.firstName || 'Test',
      lastName: overrides.lastName || 'User',
      role: overrides.role || 'admin',
      tenantId,
      isActive: overrides.isActive ?? true,
    },
  });

  return { user, password, tenantId };
}

/**
 * Create a test coach
 */
export async function createTestCoach(
  prisma?: PrismaClient,
  overrides: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    tenantId: string;
    specializations: string[];
    status: string;
  }> = {}
) {
  const db = prisma || getTestPrisma();

  // Use existing tenant or demo tenant
  const tenantId = overrides.tenantId || DEMO_IDS.tenant;

  // Create coach directly (without user relation for simplicity)
  const coach = await db.coach.create({
    data: {
      tenantId,
      firstName: overrides.firstName || 'Coach',
      lastName: overrides.lastName || 'Test',
      email: overrides.email || uniqueEmail('coach'),
      specializations: overrides.specializations || ['golf'],
      status: overrides.status || 'active',
    },
  });

  return { coach, tenantId };
}

/**
 * Create a test player
 */
export async function createTestPlayer(
  prisma?: PrismaClient,
  overrides: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    tenantId: string;
    coachId: string;
    category: string;
    gender: string;
    handicap: number;
    dateOfBirth: Date;
  }> = {}
) {
  const db = prisma || getTestPrisma();

  // Use demo tenant and coach by default
  const tenantId = overrides.tenantId || DEMO_IDS.tenant;
  const coachId = overrides.coachId || DEMO_IDS.coach;

  // Create player directly
  const player = await db.player.create({
    data: {
      tenantId,
      coachId,
      firstName: overrides.firstName || 'Player',
      lastName: overrides.lastName || 'Test',
      email: overrides.email || uniqueEmail('player'),
      gender: overrides.gender || 'male',
      category: overrides.category || 'C',
      handicap: overrides.handicap ?? 15.0,
      dateOfBirth: overrides.dateOfBirth || new Date('2005-01-01'),
    },
  });

  return { player, tenantId, coachId };
}

/**
 * Create a test training session
 */
export async function createTestSession(
  prisma?: PrismaClient,
  overrides: Partial<{
    playerId: string;
    coachId: string;
    sessionType: string;
    sessionDate: Date;
    duration: number;
    period: string;
  }> = {}
) {
  const db = prisma || getTestPrisma();

  // Use demo player and coach by default
  const playerId = overrides.playerId || DEMO_IDS.player;
  const coachId = overrides.coachId || DEMO_IDS.coach;

  const session = await db.trainingSession.create({
    data: {
      playerId,
      coachId,
      sessionType: overrides.sessionType || 'technique',
      sessionDate: overrides.sessionDate || new Date(),
      duration: overrides.duration || 60,
      period: overrides.period || 'G',
    },
  });

  return { session, playerId, coachId };
}

/**
 * Create a test exercise
 */
export async function createTestExercise(
  prisma?: PrismaClient,
  overrides: Partial<{
    name: string;
    description: string;
    exerciseType: string;
    tenantId: string;
    difficulty: string;
  }> = {}
) {
  const db = prisma || getTestPrisma();
  const tenantId = overrides.tenantId || DEMO_IDS.tenant;

  const exercise = await db.exercise.create({
    data: {
      tenantId,
      name: overrides.name || uniqueString('Test Exercise'),
      description: overrides.description || 'A test exercise for testing',
      exerciseType: overrides.exerciseType || 'technique',
      difficulty: overrides.difficulty || 'medium',
      processCategory: 'technique',
      learningPhases: ['L1', 'L2'],
      settings: ['S1'],
      clubSpeedLevels: ['CS50'],
      categories: ['C'],
      periods: ['G'],
    },
  });

  return exercise;
}

/**
 * Create a test goal
 */
export async function createTestGoal(
  prisma?: PrismaClient,
  overrides: Partial<{
    playerId: string;
    title: string;
    description: string;
    goalType: string;
    timeframe: string;
    targetValue: number;
  }> = {}
) {
  const db = prisma || getTestPrisma();

  const playerId = overrides.playerId || DEMO_IDS.player;

  const goal = await db.playerGoal.create({
    data: {
      playerId,
      title: overrides.title || uniqueString('Test Goal'),
      description: overrides.description || 'A test goal',
      goalType: overrides.goalType || 'technique',
      timeframe: overrides.timeframe || 'short',
      targetValue: overrides.targetValue || 100,
      startDate: new Date(),
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
  });

  return { goal, playerId };
}

/**
 * Create test annual training plan
 */
export async function createTestTrainingPlan(
  prisma?: PrismaClient,
  overrides: Partial<{
    playerId: string;
    tenantId: string;
    planName: string;
    status: string;
  }> = {}
) {
  const db = prisma || getTestPrisma();

  const playerId = overrides.playerId || DEMO_IDS.player;
  const tenantId = overrides.tenantId || DEMO_IDS.tenant;

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const plan = await db.annualTrainingPlan.create({
    data: {
      playerId,
      tenantId,
      planName: overrides.planName || uniqueString('Test Plan'),
      startDate,
      endDate,
      status: overrides.status || 'active',
      baselineAverageScore: 80,
      baselineHandicap: 15,
      playerCategory: 'C',
      basePeriodWeeks: 16,
      specializationWeeks: 20,
      tournamentWeeks: 16,
      weeklyHoursTarget: 10,
      intensityProfile: {},
      generatedAt: new Date(),
    },
  });

  return { plan, playerId, tenantId };
}

/**
 * Create test badge
 */
export async function createTestPlayerBadge(
  prisma?: PrismaClient,
  overrides: Partial<{
    playerId: string;
    badgeId: string;
    progress: number;
  }> = {}
) {
  const db = prisma || getTestPrisma();

  const playerId = overrides.playerId || DEMO_IDS.player;
  const badgeId = overrides.badgeId || uniqueString('test-badge');

  const playerBadge = await db.playerBadge.create({
    data: {
      playerId,
      badgeId,
      progress: overrides.progress || 100,
      earnedAt: new Date(),
    },
  });

  return { playerBadge, playerId, badgeId };
}

/**
 * Cleanup helper - collects IDs to delete at end of test
 */
export class TestDataCollector {
  private userIds: string[] = [];
  private playerIds: string[] = [];
  private coachIds: string[] = [];
  private tenantIds: string[] = [];
  private sessionIds: string[] = [];
  private planIds: string[] = [];
  private exerciseIds: string[] = [];
  private goalIds: string[] = [];
  private badgeIds: string[] = [];

  addUser(id: string) { this.userIds.push(id); }
  addPlayer(id: string) { this.playerIds.push(id); }
  addCoach(id: string) { this.coachIds.push(id); }
  addTenant(id: string) { this.tenantIds.push(id); }
  addSession(id: string) { this.sessionIds.push(id); }
  addPlan(id: string) { this.planIds.push(id); }
  addExercise(id: string) { this.exerciseIds.push(id); }
  addGoal(id: string) { this.goalIds.push(id); }
  addBadge(id: string) { this.badgeIds.push(id); }

  async cleanup(prisma?: PrismaClient) {
    const db = prisma || getTestPrisma();

    try {
      // Delete in reverse dependency order
      if (this.goalIds.length) await db.playerGoal.deleteMany({ where: { id: { in: this.goalIds } } });
      if (this.badgeIds.length) await db.playerBadge.deleteMany({ where: { id: { in: this.badgeIds } } });
      if (this.planIds.length) {
        await db.dailyTrainingAssignment.deleteMany({ where: { annualPlanId: { in: this.planIds } } });
        await db.scheduledTournament.deleteMany({ where: { annualPlanId: { in: this.planIds } } });
        await db.annualTrainingPlan.deleteMany({ where: { id: { in: this.planIds } } });
      }
      if (this.sessionIds.length) {
        await db.trainingSession.deleteMany({ where: { id: { in: this.sessionIds } } });
      }
      if (this.exerciseIds.length) await db.exercise.deleteMany({ where: { id: { in: this.exerciseIds } } });
      if (this.playerIds.length) {
        await db.testResult.deleteMany({ where: { playerId: { in: this.playerIds } } });
        await db.weeklyTrainingStats.deleteMany({ where: { playerId: { in: this.playerIds } } });
        await db.monthlyTrainingStats.deleteMany({ where: { playerId: { in: this.playerIds } } });
        await db.player.deleteMany({ where: { id: { in: this.playerIds } } });
      }
      if (this.coachIds.length) await db.coach.deleteMany({ where: { id: { in: this.coachIds } } });
      if (this.userIds.length) {
        await db.refreshToken.deleteMany({ where: { userId: { in: this.userIds } } });
        await db.user.deleteMany({ where: { id: { in: this.userIds } } });
      }
      // Don't delete demo tenant
      const safeToDelete = this.tenantIds.filter(id => id !== DEMO_IDS.tenant);
      if (safeToDelete.length) await db.tenant.deleteMany({ where: { id: { in: safeToDelete } } });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}
