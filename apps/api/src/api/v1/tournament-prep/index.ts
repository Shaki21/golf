/**
 * Tournament Preparation API
 *
 * Complete tournament prep system with course strategy and checklists
 */

import { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { z } from 'zod';

const createPrepSchema = z.object({
  playerId: z.string().uuid(),
  tournamentId: z.string().uuid(),
  goals: z.array(z.string()),
  processGoals: z.array(z.string()).optional(),
  mentalScore: z.number().int().min(1).max(10).optional(),
  confidenceLevel: z.number().int().min(1).max(10).optional(),
});

const createCourseStrategySchema = z.object({
  prepId: z.string().uuid(),
  courseName: z.string(),
  overallNotes: z.string().optional(),
  windStrategy: z.string().optional(),
});

const createHoleStrategySchema = z.object({
  courseStrategyId: z.string().uuid(),
  holeNumber: z.number().int().min(1).max(18),
  teeClub: z.string().optional(),
  targetLine: z.string().optional(),
  approachStrategy: z.string().optional(),
  greenReading: z.string().optional(),
  hazards: z.array(z.string()).optional(),
  missableAreas: z.array(z.string()).optional(),
});

export async function tournamentPrepRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();

  // Create preparation
  app.post<{ Body: z.infer<typeof createPrepSchema> }>(
    '/',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const input = createPrepSchema.parse(request.body);
      const tenantId = request.user!.tenantId;

      const prep = await prisma.tournamentPreparation.create({
        data: {
          tenantId,
          playerId: input.playerId,
          coachId: request.user!.coachId,
          tournamentId: input.tournamentId,
          goals: input.goals,
          processGoals: input.processGoals || [],
          mentalScore: input.mentalScore,
          confidenceLevel: input.confidenceLevel,
          checklistProgress: 0,
          checklistItems: { items: [] }, // Default empty checklist
        },
        include: {
          tournament: true,
          player: { select: { firstName: true, lastName: true } },
        },
      });

      return reply.status(201).send({ success: true, data: prep });
    }
  );

  // Create course strategy
  app.post<{ Body: z.infer<typeof createCourseStrategySchema> }>(
    '/course-strategy',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const input = createCourseStrategySchema.parse(request.body);
      const tenantId = request.user!.tenantId;

      const strategy = await prisma.courseStrategy.create({
        data: {
          tenantId,
          prepId: input.prepId,
          courseName: input.courseName,
          overallNotes: input.overallNotes,
          windStrategy: input.windStrategy,
        },
      });

      return reply.status(201).send({ success: true, data: strategy });
    }
  );

  // Create hole strategy
  app.post<{ Body: z.infer<typeof createHoleStrategySchema> }>(
    '/hole-strategy',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const input = createHoleStrategySchema.parse(request.body);
      const tenantId = request.user!.tenantId;

      const holeStrategy = await prisma.holeStrategy.create({
        data: {
          tenantId,
          courseStrategyId: input.courseStrategyId,
          holeNumber: input.holeNumber,
          teeClub: input.teeClub,
          targetLine: input.targetLine,
          approachStrategy: input.approachStrategy,
          greenReading: input.greenReading,
          hazards: input.hazards || [],
          missableAreas: input.missableAreas || [],
        },
      });

      return reply.status(201).send({ success: true, data: holeStrategy });
    }
  );

  // Get preparation with full details
  app.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { id } = request.params;
      const tenantId = request.user!.tenantId;

      const prep = await prisma.tournamentPreparation.findFirst({
        where: { id, tenantId },
        include: {
          tournament: true,
          player: true,
          courseStrategies: {
            include: {
              holeStrategies: { orderBy: { holeNumber: 'asc' } },
            },
          },
          checklists: true,
        },
      });

      return reply.send({ success: true, data: prep });
    }
  );

  // Update checklist progress
  app.patch<{ Params: { id: string }; Body: { checklistProgress: number; checklistItems: any } }>(
    '/:id/checklist',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { id } = request.params;
      const { checklistProgress, checklistItems } = request.body;

      const updated = await prisma.tournamentPreparation.update({
        where: { id },
        data: { checklistProgress, checklistItems },
      });

      return reply.send({ success: true, data: updated });
    }
  );
}
