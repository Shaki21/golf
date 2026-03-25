/**
 * Admin Seed Endpoint
 * Protected endpoint to seed demo data in production
 * Requires ADMIN_SEED_KEY environment variable
 */

import { FastifyPluginAsync } from 'fastify';
import { getPrismaClient } from '../../../core/db/prisma';
import { hashPassword } from '../../../utils/crypto';

const prisma = getPrismaClient();

// Demo user IDs (fixed UUIDs for consistency)
const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_ADMIN_ID = '00000000-0000-0000-0000-000000000002';
const DEMO_COACH_ID = '00000000-0000-0000-0000-000000000003';
const DEMO_PLAYER_ID = '00000000-0000-0000-0000-000000000004';

export const adminSeedRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/seed', {
    schema: {
      description: 'Seed demo data (requires admin key)',
      tags: ['Admin'],
      body: {
        type: 'object',
        required: ['adminKey'],
        properties: {
          adminKey: { type: 'string' },
          cleanFirst: { type: 'boolean', default: false },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { adminKey, cleanFirst } = request.body as { adminKey: string; cleanFirst?: boolean };

      try {
        const results: string[] = [];

        // Check if demo tenant already exists
        const existingTenant = await prisma.tenant.findUnique({
          where: { id: DEMO_TENANT_ID },
        });

        // Verify admin key (allow bootstrap if no key configured and no demo data exists)
        const expectedKey = process.env.ADMIN_SEED_KEY;
        const isBootstrap = !expectedKey && !existingTenant && adminKey === 'bootstrap';

        if (!isBootstrap && (!expectedKey || adminKey !== expectedKey)) {
          return reply.code(403).send({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: !expectedKey
                ? 'ADMIN_SEED_KEY not configured. Use "bootstrap" as key for first-time seeding when no data exists.'
                : 'Invalid admin key'
            },
          });
        }

        if (existingTenant && !cleanFirst) {
          return reply.send({
            success: true,
            message: 'Demo data already exists',
            data: { alreadySeeded: true },
          });
        }

        // Clean existing demo data if requested
        if (cleanFirst) {
          // Delete in order due to foreign key constraints
          await prisma.player.deleteMany({ where: { id: DEMO_PLAYER_ID } });
          await prisma.coach.deleteMany({ where: { id: DEMO_COACH_ID } });
          await prisma.user.deleteMany({
            where: {
              OR: [
                { id: DEMO_ADMIN_ID },
                { id: DEMO_COACH_ID },
                { id: DEMO_PLAYER_ID },
                { email: { in: ['admin@demo.com', 'coach@demo.com', 'player@demo.com'] } },
              ]
            }
          });
          if (existingTenant) {
            await prisma.tenant.delete({ where: { id: DEMO_TENANT_ID } });
          }
          results.push('Cleaned existing demo data');
        }

        // Create demo tenant
        await prisma.tenant.create({
          data: {
            id: DEMO_TENANT_ID,
            name: 'AK Golf Demo',
            slug: 'ak-golf-demo',
            subscriptionTier: 'premium',
            settings: {},
          },
        });
        results.push('Created demo tenant');

        // Hash password
        const hashedPassword = await hashPassword('demo123');

        // Create admin user
        await prisma.user.create({
          data: {
            id: DEMO_ADMIN_ID,
            email: 'admin@demo.com',
            passwordHash: hashedPassword,
            firstName: 'Admin',
            lastName: 'Demo',
            role: 'admin',
            tenantId: DEMO_TENANT_ID,
            isActive: true,
          },
        });
        results.push('Created admin user (admin@demo.com / demo123)');

        // Create coach user with profile
        const coachUser = await prisma.user.create({
          data: {
            id: DEMO_COACH_ID,
            email: 'coach@demo.com',
            passwordHash: hashedPassword,
            firstName: 'Trener',
            lastName: 'Hansen',
            role: 'coach',
            tenantId: DEMO_TENANT_ID,
            isActive: true,
          },
        });

        await prisma.coach.create({
          data: {
            id: DEMO_COACH_ID,
            userId: coachUser.id,
            tenantId: DEMO_TENANT_ID,
            firstName: 'Trener',
            lastName: 'Hansen',
            email: 'coach@demo.com',
            specializations: ['Long Game', 'Short Game', 'Mental'],
            certifications: ['PGA Professional', 'TPI Certified'],
          },
        });
        results.push('Created coach user (coach@demo.com / demo123)');

        // Create player user with profile
        const playerUser = await prisma.user.create({
          data: {
            id: DEMO_PLAYER_ID,
            email: 'player@demo.com',
            passwordHash: hashedPassword,
            firstName: 'Spiller',
            lastName: 'Olsen',
            role: 'player',
            tenantId: DEMO_TENANT_ID,
            isActive: true,
          },
        });

        await prisma.player.create({
          data: {
            id: DEMO_PLAYER_ID,
            userId: playerUser.id,
            tenantId: DEMO_TENANT_ID,
            firstName: 'Spiller',
            lastName: 'Olsen',
            email: 'player@demo.com',
            dateOfBirth: new Date('2008-05-15'),
            gender: 'male',
            category: 'B',
            handicap: 12.5,
            club: 'Oslo Golfklubb',
            coachId: DEMO_COACH_ID,
          },
        });
        results.push('Created player user (player@demo.com / demo123)');

        return reply.send({
          success: true,
          message: 'Demo data seeded successfully',
          data: {
            results,
            users: {
              admin: 'admin@demo.com',
              coach: 'coach@demo.com',
              player: 'player@demo.com',
            },
            password: 'demo123',
          },
        });
      } catch (error: any) {
        fastify.log.error({ err: error }, 'Failed to seed demo data');
        return reply.code(500).send({
          success: false,
          error: { code: 'SEED_FAILED', message: error.message },
        });
      }
    },
  });

  // Add custom player
  fastify.post('/add-player', {
    schema: {
      description: 'Add a new player (requires admin key)',
      tags: ['Admin'],
      body: {
        type: 'object',
        required: ['adminKey', 'email', 'firstName', 'lastName'],
        properties: {
          adminKey: { type: 'string' },
          email: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          password: { type: 'string', default: 'Demo123456' },
          handicap: { type: 'number', default: 15.0 },
          category: { type: 'string', default: 'G' },
          gender: { type: 'string', default: 'male' },
          dateOfBirth: { type: 'string' },
        },
      },
    },
    handler: async (request, reply) => {
      const {
        adminKey,
        email,
        firstName,
        lastName,
        password = 'Demo123456',
        handicap = 15.0,
        category = 'G',
        gender = 'male',
        dateOfBirth,
      } = request.body as any;

      // Verify admin key
      const expectedKey = process.env.ADMIN_SEED_KEY;
      if (!expectedKey || adminKey !== expectedKey) {
        return reply.code(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Invalid admin key' },
        });
      }

      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return reply.code(400).send({
            success: false,
            error: { code: 'USER_EXISTS', message: `User ${email} already exists` },
          });
        }

        const playerId = crypto.randomUUID();
        const hashedPassword = await hashPassword(password);

        // Create user
        await prisma.user.create({
          data: {
            id: playerId,
            email,
            passwordHash: hashedPassword,
            firstName,
            lastName,
            role: 'player',
            tenantId: DEMO_TENANT_ID,
            isActive: true,
          },
        });

        // Create player profile
        await prisma.player.create({
          data: {
            id: playerId,
            userId: playerId,
            tenantId: DEMO_TENANT_ID,
            firstName,
            lastName,
            email,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1990-01-01'),
            gender,
            category,
            handicap,
            coachId: DEMO_COACH_ID,
          },
        });

        return reply.send({
          success: true,
          message: `Player ${firstName} ${lastName} created successfully`,
          data: {
            playerId,
            email,
            password,
          },
        });
      } catch (error: any) {
        fastify.log.error({ err: error }, 'Failed to add player');
        return reply.code(500).send({
          success: false,
          error: { code: 'CREATE_FAILED', message: error.message },
        });
      }
    },
  });

  // Health check for seeded data
  fastify.get('/seed/status', {
    schema: {
      description: 'Check if demo data exists',
      tags: ['Admin'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const tenant = await prisma.tenant.findUnique({
        where: { id: DEMO_TENANT_ID },
      });

      const users = await prisma.user.count({
        where: { tenantId: DEMO_TENANT_ID },
      });

      return reply.send({
        success: true,
        data: {
          demoTenantExists: !!tenant,
          demoUserCount: users,
        },
      });
    },
  });
};

export default adminSeedRoutes;
