/**
 * Test Utilities
 * Common helpers for integration tests
 */

import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app';
import { getPrismaClient } from '../../src/core/db/prisma';
import { PrismaClient } from '@prisma/client';

// Singleton instances
let appInstance: FastifyInstance | null = null;
let prismaInstance: PrismaClient | null = null;

/**
 * Get or create the Fastify app instance
 */
export async function getTestApp(): Promise<FastifyInstance> {
  if (!appInstance) {
    appInstance = await buildApp({ logger: false });
    await appInstance.ready();
  }
  return appInstance;
}

/**
 * Get or create the Prisma client instance
 */
export function getTestPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = getPrismaClient();
  }
  return prismaInstance;
}

/**
 * Close all test connections
 */
export async function closeTestConnections(): Promise<void> {
  if (appInstance) {
    await appInstance.close();
    appInstance = null;
  }
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}

/**
 * Clean up test data by deleting records in correct order (respecting FK constraints)
 */
export async function cleanupTestData(options: {
  userIds?: string[];
  playerIds?: string[];
  coachIds?: string[];
  tenantIds?: string[];
  sessionIds?: string[];
  planIds?: string[];
}): Promise<void> {
  const prisma = getTestPrisma();
  const { userIds = [], playerIds = [], coachIds = [], tenantIds = [], sessionIds = [], planIds = [] } = options;

  try {
    // Delete in reverse dependency order

    // Training related
    if (planIds.length > 0) {
      await prisma.dailyTrainingAssignment.deleteMany({ where: { annualPlanId: { in: planIds } } });
      await prisma.scheduledTournament.deleteMany({ where: { annualPlanId: { in: planIds } } });
      await prisma.annualTrainingPlan.deleteMany({ where: { id: { in: planIds } } });
    }

    // Sessions
    if (sessionIds.length > 0) {
      await prisma.trainingSession.deleteMany({ where: { id: { in: sessionIds } } });
    }

    // Player related
    if (playerIds.length > 0) {
      await prisma.playerGoal.deleteMany({ where: { playerId: { in: playerIds } } });
      await prisma.playerBadge.deleteMany({ where: { playerId: { in: playerIds } } });
      await prisma.testResult.deleteMany({ where: { playerId: { in: playerIds } } });
      await prisma.weeklyTrainingStats.deleteMany({ where: { playerId: { in: playerIds } } });
      await prisma.monthlyTrainingStats.deleteMany({ where: { playerId: { in: playerIds } } });
      await prisma.player.deleteMany({ where: { id: { in: playerIds } } });
    }

    // Coach related
    if (coachIds.length > 0) {
      await prisma.coach.deleteMany({ where: { id: { in: coachIds } } });
    }

    // User related
    if (userIds.length > 0) {
      await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }

    // Tenant - only delete test tenants (not the seeded demo tenant)
    if (tenantIds.length > 0) {
      // Don't delete the default demo tenant
      const safeToDelete = tenantIds.filter(id => id !== '00000000-0000-0000-0000-000000000001');
      if (safeToDelete.length > 0) {
        await prisma.tenant.deleteMany({ where: { id: { in: safeToDelete } } });
      }
    }
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

/**
 * Register a test user and return tokens
 */
export async function registerTestUser(
  app: FastifyInstance,
  userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    role: 'admin' | 'coach' | 'player';
  }
): Promise<{
  accessToken: string;
  refreshToken: string;
  userId: string;
  tenantId: string;
}> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    payload: userData,
  });

  if (response.statusCode !== 201) {
    throw new Error(`Failed to register user: ${response.body}`);
  }

  const body = JSON.parse(response.body);
  return {
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken,
    userId: body.data.user.id,
    tenantId: body.data.user.tenantId,
  };
}

/**
 * Login and return tokens
 */
export async function loginTestUser(
  app: FastifyInstance,
  email: string,
  password: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  userId: string;
  tenantId: string;
}> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email, password },
  });

  if (response.statusCode !== 200) {
    throw new Error(`Failed to login: ${response.body}`);
  }

  const body = JSON.parse(response.body);
  return {
    accessToken: body.data.accessToken,
    refreshToken: body.data.refreshToken,
    userId: body.data.user.id,
    tenantId: body.data.user.tenantId,
  };
}

/**
 * Login with demo accounts (seeded data)
 */
export async function loginDemoAdmin(app: FastifyInstance) {
  return loginTestUser(app, 'admin@demo.com', 'admin123');
}

export async function loginDemoCoach(app: FastifyInstance) {
  return loginTestUser(app, 'coach@demo.com', 'coach123');
}

export async function loginDemoPlayer(app: FastifyInstance) {
  return loginTestUser(app, 'player@demo.com', 'player123');
}

/**
 * Make an authenticated request
 */
export async function authenticatedRequest(
  app: FastifyInstance,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  accessToken: string,
  payload?: any
) {
  const options: any = {
    method,
    url,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  };

  if (payload) {
    options.payload = payload;
  }

  return app.inject(options);
}

/**
 * Parse response body safely
 */
export function parseResponse(response: { body: string }) {
  try {
    return JSON.parse(response.body);
  } catch {
    return { raw: response.body };
  }
}

/**
 * Cached demo IDs (fetched once from database)
 */
let cachedDemoIds: {
  tenant: string;
  admin: string;
  coach: string;
  coachEntity: string; // Coach entity ID (from coaches table)
  player: string;
  playerEntity: string; // Player entity ID (from players table)
} | null = null;

/**
 * Get demo IDs from the database
 * These are created by the seed script and have dynamic UUIDs
 */
export async function getDemoIds() {
  if (cachedDemoIds) {
    return cachedDemoIds;
  }

  const prisma = getTestPrisma();

  // Find demo users by email
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@demo.com' } });
  const coachUser = await prisma.user.findUnique({ where: { email: 'coach@demo.com' } });
  const playerUser = await prisma.user.findUnique({ where: { email: 'player@demo.com' } });

  if (!adminUser || !coachUser || !playerUser) {
    throw new Error('Demo users not found. Please run: npx prisma db seed');
  }

  // Find coach and player entities
  const coachEntity = await prisma.coach.findFirst({ where: { email: 'coach@demo.com' } });
  const playerEntity = await prisma.player.findFirst({ where: { email: 'player@demo.com' } });

  if (!coachEntity || !playerEntity) {
    throw new Error('Demo coach/player entities not found. Please run: npx prisma db seed');
  }

  cachedDemoIds = {
    tenant: adminUser.tenantId,
    admin: adminUser.id,
    coach: coachUser.id,
    coachEntity: coachEntity.id,
    player: playerUser.id,
    playerEntity: playerEntity.id,
  };

  return cachedDemoIds;
}

/**
 * Legacy DEMO_IDS for backwards compatibility (use getDemoIds() for actual IDs)
 * These are placeholder values - tests should use getDemoIds() instead
 */
export const DEMO_IDS = {
  tenant: '00000000-0000-0000-0000-000000000001',
  admin: '00000000-0000-0000-0000-000000000002',
  coach: '00000000-0000-0000-0000-000000000003',
  player: '00000000-0000-0000-0000-000000000004',
};

/**
 * Get demo tenant ID (legacy - use getDemoIds().tenant instead)
 */
export const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Generate unique email for tests
 */
export function uniqueEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
}

/**
 * Generate unique string
 */
export function uniqueString(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
