/**
 * Progress Reports API
 *
 * For parent portal - coaches create reports, parents view them
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { z } from 'zod';
import { AppError } from '../../../core/errors';

const createReportSchema = z.object({
  playerId: z.string().uuid(),
  reportType: z.enum(['weekly', 'monthly', 'quarterly', 'annual']),
  summary: z.string(),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  sessionsCompleted: z.number().int().min(0),
  handicapChange: z.number().optional(),
  goals: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional(),
});

export async function progressReportRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();

  // Create progress report
  app.post<{ Body: z.infer<typeof createReportSchema> }>(
    '/',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const input = createReportSchema.parse(request.body);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;
      const coachId = request.user!.coachId;

      if (!coachId) {
        throw new AppError('Only coaches can create progress reports', 403);
      }

      const report = await prisma.progressReport.create({
        data: {
          tenantId,
          playerId: input.playerId,
          coachId,
          reportType: input.reportType,
          summary: input.summary,
          strengths: input.strengths,
          areasForImprovement: input.areasForImprovement,
          sessionsCompleted: input.sessionsCompleted,
          handicapChange: input.handicapChange,
          goals: input.goals || [],
          nextSteps: input.nextSteps || [],
          status: 'draft',
        },
        include: {
          player: { select: { id: true, firstName: true, lastName: true } },
          coach: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      return reply.status(201).send({ success: true, data: report });
    }
  );

  // List reports
  app.get<{ Querystring: { playerId?: string; status?: string } }>(
    '/',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { playerId, status } = request.query;
      const tenantId = request.user!.tenantId;

      const reports = await prisma.progressReport.findMany({
        where: {
          tenantId,
          ...(playerId && { playerId }),
          ...(status && { status }),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          player: { select: { firstName: true, lastName: true } },
          coach: { select: { firstName: true, lastName: true } },
        },
      });

      return reply.send({ success: true, data: reports });
    }
  );

  // Get report by ID
  app.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.user!.tenantId;

      const report = await prisma.progressReport.findFirst({
        where: { id, tenantId },
        include: {
          player: true,
          coach: { select: { firstName: true, lastName: true } },
        },
      });

      if (!report) throw new AppError('Report not found', 404);

      return reply.send({ success: true, data: report });
    }
  );

  // Publish report (makes it visible to parents)
  app.post<{ Params: { id: string } }>(
    '/:id/publish',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.user!.tenantId;

      const report = await prisma.progressReport.update({
        where: { id, tenantId },
        data: { status: 'published', publishedAt: new Date() },
      });

      // TODO: Send email notification to parent

      return reply.send({ success: true, data: report });
    }
  );

  // Update report
  app.patch<{ Params: { id: string }; Body: Partial<z.infer<typeof createReportSchema>> }>(
    '/:id',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.user!.tenantId;

      const report = await prisma.progressReport.update({
        where: { id, tenantId },
        data: request.body,
      });

      return reply.send({ success: true, data: report });
    }
  );
}
