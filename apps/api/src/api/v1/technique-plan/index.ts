/**
 * Technique Plan API Routes
 *
 * Endpoints for managing technique tasks, goals, and TrackMan imports
 */

import { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../../core/db/prisma';
import { authenticateUser } from '../../../middleware/auth';
import { TechniquePlanService } from './service';
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
  createGoalSchema,
  updateGoalSchema,
  listGoalsQuerySchema,
  importQuerySchema,
  listImportsQuerySchema,
  statsQuerySchema,
} from './schema';

export async function techniquePlanRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const service = new TechniquePlanService(prisma);

  // =========================================================================
  // TASKS
  // =========================================================================

  // Create task
  app.post('/tasks', { preHandler: authenticateUser }, async (request, reply) => {
    const input = createTaskSchema.parse(request.body);
    const user = request.user!;

    // Determine creator type
    const creatorType = user.role === 'coach' ? 'coach' : 'player';
    const createdById = user.id;

    const task = await service.createTask(input, createdById, creatorType, user.tenantId);

    return reply.status(201).send({ success: true, data: task });
  });

  // List tasks
  app.get('/tasks', { preHandler: authenticateUser }, async (request, reply) => {
    const query = listTasksQuerySchema.parse(request.query);
    const user = request.user!;

    // Players can only see their own tasks
    if (user.role === 'player' && user.playerId) {
      query.playerId = user.playerId;
    }

    const result = await service.listTasks(query, user.tenantId);

    return reply.send({
      success: true,
      data: result.tasks,
      pagination: {
        total: result.total,
        limit: query.limit,
        offset: query.offset,
      },
    });
  });

  // Get single task
  app.get<{ Params: { id: string } }>('/tasks/:id', { preHandler: authenticateUser }, async (request, reply) => {
    const task = await service.getTask(request.params.id, request.user!.tenantId);

    if (!task) {
      return reply.status(404).send({ success: false, error: 'Task not found' });
    }

    return reply.send({ success: true, data: task });
  });

  // Update task
  app.patch<{ Params: { id: string } }>('/tasks/:id', { preHandler: authenticateUser }, async (request, reply) => {
    const input = updateTaskSchema.parse(request.body);
    const task = await service.updateTask(request.params.id, input, request.user!.tenantId);

    return reply.send({ success: true, data: task });
  });

  // Delete task
  app.delete<{ Params: { id: string } }>('/tasks/:id', { preHandler: authenticateUser }, async (request, reply) => {
    await service.deleteTask(request.params.id, request.user!.tenantId);

    return reply.send({ success: true });
  });

  // =========================================================================
  // P-SYSTEM: DRILLS
  // =========================================================================

  // Add drill to task
  app.post<{ Params: { id: string }; Body: { exerciseId: string; orderIndex?: number; notes?: string } }>(
    '/tasks/:id/drills',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { exerciseId, orderIndex, notes } = request.body;
      const drill = await service.addDrillToTask(
        request.params.id,
        exerciseId,
        orderIndex,
        notes,
        request.user!.tenantId
      );

      return reply.status(201).send({ success: true, data: drill });
    }
  );

  // Remove drill from task
  app.delete<{ Params: { id: string; drillId: string } }>(
    '/tasks/:id/drills/:drillId',
    { preHandler: authenticateUser },
    async (request, reply) => {
      await service.removeDrillFromTask(
        request.params.id,
        request.params.drillId,
        request.user!.tenantId
      );

      return reply.send({ success: true });
    }
  );

  // =========================================================================
  // P-SYSTEM: RESPONSIBLE PERSONS
  // =========================================================================

  // Assign responsible person to task
  app.post<{ Params: { id: string }; Body: { userId: string; role?: string } }>(
    '/tasks/:id/responsible',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { userId, role } = request.body;
      const responsible = await service.assignResponsible(
        request.params.id,
        userId,
        role,
        request.user!.tenantId
      );

      return reply.status(201).send({ success: true, data: responsible });
    }
  );

  // Remove responsible person from task
  app.delete<{ Params: { id: string; responsibleId: string } }>(
    '/tasks/:id/responsible/:responsibleId',
    { preHandler: authenticateUser },
    async (request, reply) => {
      await service.removeResponsible(
        request.params.id,
        request.params.responsibleId,
        request.user!.tenantId
      );

      return reply.send({ success: true });
    }
  );

  // =========================================================================
  // P-SYSTEM: PRIORITY & P-LEVEL
  // =========================================================================

  // Update task priority order (drag-and-drop)
  app.patch<{ Params: { id: string }; Body: { priorityOrder: number } }>(
    '/tasks/:id/priority',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { priorityOrder } = request.body;
      const task = await service.updateTaskPriority(
        request.params.id,
        priorityOrder,
        request.user!.tenantId
      );

      return reply.send({ success: true, data: task });
    }
  );

  // Get tasks by P-level
  app.get<{ Querystring: { playerId: string; pLevel: string } }>(
    '/tasks/by-p-level',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const { playerId, pLevel } = request.query;
      const tasks = await service.getTasksByPLevel(
        playerId,
        pLevel,
        request.user!.tenantId
      );

      return reply.send({ success: true, data: tasks });
    }
  );

  // Get task with full details (including drills and responsible persons)
  app.get<{ Params: { id: string } }>(
    '/tasks/:id/full',
    { preHandler: authenticateUser },
    async (request, reply) => {
      const task = await service.getTaskWithFullDetails(
        request.params.id,
        request.user!.tenantId
      );

      if (!task) {
        return reply.status(404).send({ success: false, error: 'Task not found' });
      }

      return reply.send({ success: true, data: task });
    }
  );

  // =========================================================================
  // GOALS
  // =========================================================================

  // Create goal
  app.post('/goals', { preHandler: authenticateUser }, async (request, reply) => {
    const input = createGoalSchema.parse(request.body);
    const goal = await service.createGoal(input, request.user!.tenantId);

    return reply.status(201).send({ success: true, data: goal });
  });

  // List goals
  app.get('/goals', { preHandler: authenticateUser }, async (request, reply) => {
    const query = listGoalsQuerySchema.parse(request.query);
    const user = request.user!;

    // Players can only see their own goals
    if (user.role === 'player' && user.playerId) {
      query.playerId = user.playerId;
    }

    const result = await service.listGoals(query, user.tenantId);

    return reply.send({
      success: true,
      data: result.goals,
      pagination: {
        total: result.total,
        limit: query.limit,
        offset: query.offset,
      },
    });
  });

  // Update goal
  app.patch<{ Params: { id: string } }>('/goals/:id', { preHandler: authenticateUser }, async (request, reply) => {
    const input = updateGoalSchema.parse(request.body);
    const goal = await service.updateGoal(request.params.id, input, request.user!.tenantId);

    return reply.send({ success: true, data: goal });
  });

  // =========================================================================
  // IMPORTS
  // =========================================================================

  // Import TrackMan CSV
  app.post('/import/trackman', { preHandler: authenticateUser }, async (request, reply) => {
    const query = importQuerySchema.parse(request.query);
    const user = request.user!;

    // Get multipart file
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ success: false, error: 'No file uploaded' });
    }

    // Read file content
    const buffer = await data.toBuffer();
    const csvContent = buffer.toString('utf-8');

    // Import
    const result = await service.importTrackmanCSV(
      csvContent,
      data.filename,
      query.playerId,
      user.id,
      user.tenantId
    );

    return reply.status(201).send({ success: true, data: result });
  });

  // Import TrackMan PDF
  app.post('/import/trackman-pdf', { preHandler: authenticateUser }, async (request, reply) => {
    const query = importQuerySchema.parse(request.query);
    const user = request.user!;

    // Get multipart file
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ success: false, error: 'No file uploaded' });
    }

    // Check file type
    if (!data.filename.toLowerCase().endsWith('.pdf')) {
      return reply.status(400).send({ success: false, error: 'Only PDF files are supported' });
    }

    // Read file content
    const buffer = await data.toBuffer();

    // Import
    const result = await service.importTrackmanPDF(
      buffer,
      data.filename,
      query.playerId,
      user.id,
      user.tenantId
    );

    return reply.status(201).send({ success: true, data: result });
  });

  // List imports
  app.get('/imports', { preHandler: authenticateUser }, async (request, reply) => {
    const query = listImportsQuerySchema.parse(request.query);
    const user = request.user!;

    // Players can only see their own imports
    if (user.role === 'player' && user.playerId) {
      query.playerId = user.playerId;
    }

    const result = await service.listImports(query, user.tenantId);

    return reply.send({
      success: true,
      data: result.imports,
      pagination: {
        total: result.total,
        limit: query.limit,
        offset: query.offset,
      },
    });
  });

  // =========================================================================
  // STATS
  // =========================================================================

  // Get player technique stats
  app.get<{ Params: { playerId: string } }>('/stats/:playerId', { preHandler: authenticateUser }, async (request, reply) => {
    const query = statsQuerySchema.parse(request.query);
    const stats = await service.getPlayerStats(request.params.playerId, query, request.user!.tenantId);

    return reply.send({ success: true, data: stats });
  });
}
