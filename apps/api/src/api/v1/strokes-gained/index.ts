/**
 * Strokes Gained API
 *
 * Track and analyze strokes gained across categories
 */

import { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { z } from 'zod';

const createSGDataSchema = z.object({
  playerId: z.string().uuid(),
  roundId: z.string().uuid().optional(),
  sgOffTheTee: z.number().optional(),
  sgApproach: z.number().optional(),
  sgAroundGreen: z.number().optional(),
  sgPutting: z.number().optional(),
  benchmarkType: z.enum(['scratch', 'tour', 'peer']).optional(),
  shotData: z.any().optional(), // JSONB field for detailed shot-by-shot data
});

export async function strokesGainedRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();

  // Create SG data
  app.post<{ Body: z.infer<typeof createSGDataSchema> }>(
    '/',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const input = createSGDataSchema.parse(request.body);
      const tenantId = request.user!.tenantId;

      // Calculate total SG
      const sgTotal =
        (input.sgOffTheTee || 0) +
        (input.sgApproach || 0) +
        (input.sgAroundGreen || 0) +
        (input.sgPutting || 0);

      const sgData = await prisma.strokesGainedData.create({
        data: {
          tenantId,
          playerId: input.playerId,
          roundId: input.roundId,
          sgOffTheTee: input.sgOffTheTee,
          sgApproach: input.sgApproach,
          sgAroundGreen: input.sgAroundGreen,
          sgPutting: input.sgPutting,
          sgTotal,
          benchmarkType: input.benchmarkType || 'scratch',
          shotData: input.shotData,
        },
      });

      return reply.status(201).send({ success: true, data: sgData });
    }
  );

  // Get player SG data
  app.get<{ Params: { playerId: string } }>(
    '/:playerId',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { playerId } = request.params;
      const tenantId = request.user!.tenantId;

      const sgData = await prisma.strokesGainedData.findMany({
        where: { playerId, tenantId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return reply.send({ success: true, data: sgData });
    }
  );

  // Get category breakdown
  app.get<{ Params: { playerId: string } }>(
    '/:playerId/breakdown',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { playerId } = request.params;
      const tenantId = request.user!.tenantId;

      const data = await prisma.strokesGainedData.findMany({
        where: { playerId, tenantId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Calculate averages
      const avgSG = {
        offTheTee: data.reduce((sum, d) => sum + (d.sgOffTheTee?.toNumber() || 0), 0) / data.length,
        approach: data.reduce((sum, d) => sum + (d.sgApproach?.toNumber() || 0), 0) / data.length,
        aroundGreen: data.reduce((sum, d) => sum + (d.sgAroundGreen?.toNumber() || 0), 0) / data.length,
        putting: data.reduce((sum, d) => sum + (d.sgPutting?.toNumber() || 0), 0) / data.length,
        total: data.reduce((sum, d) => sum + (d.sgTotal?.toNumber() || 0), 0) / data.length,
      };

      return reply.send({ success: true, data: { rounds: data, averages: avgSG } });
    }
  );
}
