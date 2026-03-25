import { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser, requireRole } from '../../../middleware/auth';

const prisma = getPrismaClient();

export default async function adminRoutes(fastify: FastifyInstance) {
  // All admin routes require authentication and admin role
  fastify.addHook('preHandler', authenticateUser);
  fastify.addHook('preHandler', requireRole(['admin']));

  // ============================================================================
  // SYSTEM STATUS
  // ============================================================================

  fastify.get('/system/status', async (_request, reply) => {
    const startTime = Date.now();

    // Get basic system info
    const environment = process.env.NODE_ENV || 'development';
    const version = process.env.npm_package_version || '1.0.0';

    // Calculate uptime in hours
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);

    // Get counts (without exposing sensitive data)
    const [userCount, coachCount, playerCount] = await Promise.all([
      prisma.user.count(),
      prisma.coach.count(),
      prisma.player.count(),
    ]);

    return reply.code(200).send({
      data: {
        environment,
        version,
        uptimeHours,
        uptime: uptimeSeconds,
        timestamp: new Date().toISOString(),
        counts: {
          users: userCount,
          coaches: coachCount,
          players: playerCount,
        },
        responseTime: Date.now() - startTime,
      },
    });
  });

  // ============================================================================
  // FEATURE FLAGS
  // ============================================================================

  fastify.get('/feature-flags', async (_request, reply) => {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });
    return reply.code(200).send({ data: flags });
  });

  fastify.post('/feature-flags', async (request, reply) => {
    const input = request.body as {
      key: string;
      name: string;
      description?: string;
      enabled?: boolean;
    };

    const flag = await prisma.featureFlag.create({
      data: {
        key: input.key,
        name: input.name,
        description: input.description,
        enabled: input.enabled ?? false,
      },
    });
    return reply.code(201).send({ data: flag });
  });

  fastify.patch('/feature-flags/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = request.body as {
      name?: string;
      description?: string;
      enabled?: boolean;
      rolloutPercentage?: number;
    };

    const flag = await prisma.featureFlag.update({
      where: { id },
      data: input,
    });
    return reply.code(200).send({ data: flag });
  });

  fastify.delete('/feature-flags/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.featureFlag.delete({ where: { id } });
    return reply.code(200).send({ success: true });
  });

  // ============================================================================
  // SUPPORT CASES
  // ============================================================================

  fastify.get('/support-cases', async (request, reply) => {
    const { status } = request.query as { status?: string };

    const where = status ? { status } : {};
    const cases = await prisma.supportCase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return reply.code(200).send({ data: cases });
  });

  fastify.get('/support-cases/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const supportCase = await prisma.supportCase.findUnique({ where: { id } });

    if (!supportCase) {
      return reply.code(404).send({ error: 'Support case not found' });
    }
    return reply.code(200).send({ data: supportCase });
  });

  fastify.post('/support-cases', async (request, reply) => {
    const input = request.body as {
      title: string;
      description?: string;
      category?: string;
      priority?: string;
    };

    const supportCase = await prisma.supportCase.create({
      data: {
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority || 'normal',
        reportedById: request.user!.id,
      },
    });
    return reply.code(201).send({ data: supportCase });
  });

  fastify.patch('/support-cases/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = request.body as {
      status?: string;
      resolution?: string;
      priority?: string;
    };

    const data: Record<string, unknown> = { ...input };
    if (input.status === 'closed') {
      data.closedAt = new Date();
    }

    const supportCase = await prisma.supportCase.update({
      where: { id },
      data,
    });
    return reply.code(200).send({ data: supportCase });
  });

  // ============================================================================
  // TIERS MANAGEMENT
  // ============================================================================

  fastify.get('/tiers', async (_request, reply) => {
    // Return tier configuration (from env or defaults)
    const tiers = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'monthly',
        features: { proof_enabled: true, trajectory_view: false, coach_notes: false },
        active: true,
      },
      {
        id: 'standard',
        name: 'Standard',
        price: 99,
        interval: 'monthly',
        features: { proof_enabled: true, trajectory_view: true, coach_notes: false },
        active: true,
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 199,
        interval: 'monthly',
        features: { proof_enabled: true, trajectory_view: true, coach_notes: true },
        active: true,
      },
    ];
    return reply.code(200).send({ data: { tiers } });
  });

  fastify.patch('/tiers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const input = request.body as { active?: boolean };

    // In a real implementation, this would update a database
    // For now, just acknowledge the request
    return reply.code(200).send({
      data: { id, ...input, updated: true },
    });
  });
}
