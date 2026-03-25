import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateUser } from '../../../middleware/auth';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  FagService,
  SkoletimeService,
  OppgaveService,
  SkoleplanService,
  CreateFagInput,
  UpdateFagInput,
  CreateSkoletimeInput,
  UpdateSkoletimeInput,
  CreateOppgaveInput,
  UpdateOppgaveInput,
} from './service';

const prisma = getPrismaClient();

// ============================================================================
// SKOLEPLAN API - Full CRUD for Fag, Skoletimer, and Oppgaver
// ============================================================================

export default async function skoleplanRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes
  fastify.addHook('preHandler', authenticateUser);

  // Initialize services
  const fagService = new FagService();
  const skoletimeService = new SkoletimeService();
  const oppgaveService = new OppgaveService();
  const skoleplanService = new SkoleplanService();

  // Helper to get playerId and tenantId from request
  const getPlayerContext = async (request: FastifyRequest) => {
    const userId = request.user!.userId;
    const tenantId = request.user!.tenantId;

    // Get player ID from user
    const player = await prisma.player.findFirst({
      where: { userId, tenantId },
      select: { id: true }
    });

    if (!player) {
      throw new Error('Player profile not found for this user');
    }

    return { playerId: player.id, tenantId };
  };

  // ============================================================================
  // GET ALL DATA - Combined endpoint for initial load
  // ============================================================================

  /**
   * Get all skoleplan data for current player
   * GET /skoleplan
   */
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all skoleplan data (fag, timer, oppgaver)',
        tags: ['skoleplan'],
        response: {
          200: { type: 'object', additionalProperties: true },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { playerId, tenantId } = await getPlayerContext(request);
        const data = await skoleplanService.getFullSkoleplan(playerId, tenantId);
        return reply.send(data);
      } catch (error: any) {
        return reply.code(404).send({ error: error.message });
      }
    }
  );

  // ============================================================================
  // FAG (Subjects) CRUD
  // ============================================================================

  fastify.post<{ Body: CreateFagInput }>(
    '/fag',
    {
      schema: {
        description: 'Create a new subject (fag)',
        tags: ['skoleplan'],
        body: {
          type: 'object',
          required: ['navn'],
          properties: {
            navn: { type: 'string', minLength: 1, maxLength: 100 },
            larer: { type: 'string', maxLength: 100 },
            rom: { type: 'string', maxLength: 50 },
            farge: { type: 'string', maxLength: 20 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { playerId, tenantId } = await getPlayerContext(request);
        const fag = await fagService.createFag(playerId, tenantId, request.body);
        return reply.code(201).send(fag);
      } catch (error: any) {
        return reply.code(400).send({ error: error.message });
      }
    }
  );

  fastify.put<{ Params: { id: string }; Body: UpdateFagInput }>(
    '/fag/:id',
    { schema: { description: 'Update a subject', tags: ['skoleplan'] } },
    async (request, reply) => {
      try {
        const { playerId, tenantId } = await getPlayerContext(request);
        const { id } = request.params;
        const fag = await fagService.updateFag(id, playerId, tenantId, request.body);
        return reply.send(fag);
      } catch (error: any) {
        const status = error.message.includes('ikke funnet') ? 404 : 403;
        return reply.code(status).send({ error: error.message });
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/fag/:id',
    { schema: { description: 'Delete a subject', tags: ['skoleplan'] } },
    async (request, reply) => {
      try {
        const { playerId, tenantId } = await getPlayerContext(request);
        const { id } = request.params;
        await fagService.deleteFag(id, playerId, tenantId);
        return reply.code(204).send();
      } catch (error: any) {
        const status = error.message.includes('ikke funnet') ? 404 : 403;
        return reply.code(status).send({ error: error.message });
      }
    }
  );

  // ============================================================================
  // TIMER (Class periods) CRUD
  // ============================================================================

  fastify.post<{ Body: CreateSkoletimeInput }>(
    '/timer',
    {
      schema: {
        description: 'Create a new class period',
        tags: ['skoleplan'],
        body: {
          type: 'object',
          required: ['fagId', 'ukedag', 'startTid', 'sluttTid'],
          properties: {
            fagId: { type: 'string', format: 'uuid' },
            ukedag: { type: 'string', enum: ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag'] },
            startTid: { type: 'string', pattern: '^[0-2][0-9]:[0-5][0-9]$' },
            sluttTid: { type: 'string', pattern: '^[0-2][0-9]:[0-5][0-9]$' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { playerId, tenantId } = await getPlayerContext(request);
        const timer = await skoletimeService.createSkoletime(playerId, tenantId, request.body);
        return reply.code(201).send(timer);
      } catch (error: any) {
        return reply.code(400).send({ error: error.message });
      }
    }
  );

  fastify.put<{ Params: { id: string }; Body: UpdateSkoletimeInput }>(
    '/timer/:id',
    { schema: { description: 'Update a class period', tags: ['skoleplan'] } },
    async (request, reply) => {
      try {
        const { playerId, tenantId } = await getPlayerContext(request);
        const { id } = request.params;
        const timer = await skoletimeService.updateSkoletime(id, playerId, tenantId, request.body);
        return reply.send(timer);
      } catch (error: any) {
        const status = error.message.includes('ikke funnet') ? 404 : 403;
        return reply.code(status).send({ error: error.message });
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/timer/:id',
    { schema: { description: 'Delete a class period', tags: ['skoleplan'] } },
    async (request, reply) => {
      try {
        const { playerId, tenantId } = await getPlayerContext(request);
        const { id } = request.params;
        await skoletimeService.deleteSkoletime(id, playerId, tenantId);
        return reply.code(204).send();
      } catch (error: any) {
        const status = error.message.includes('ikke funnet') ? 404 : 403;
        return reply.code(status).send({ error: error.message });
      }
    }
  );

  // ============================================================================
  // OPPGAVER (Assignments) CRUD
  // ============================================================================

  fastify.post<{ Body: CreateOppgaveInput }>(
    '/oppgaver',
    {
      schema: {
        description: 'Create a new assignment (optionally linked to a test)',
        tags: ['skoleplan'],
        body: {
          type: 'object',
          required: ['fagId', 'tittel', 'frist'],
          properties: {
            fagId: { type: 'string', format: 'uuid' },
            testId: { type: 'string', format: 'uuid', description: 'Optional: Link to test protocol' },
            tittel: { type: 'string', minLength: 1, maxLength: 255 },
            beskrivelse: { type: 'string' },
            frist: { type: 'string', format: 'date' },
            testDate: { type: 'string', format: 'date', description: 'When test is scheduled (if test-related)' },
            prioritet: { type: 'string', enum: ['low', 'medium', 'high'] },
            estimatedMinutes: { type: 'number', minimum: 0 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { playerId, tenantId } = await getPlayerContext(request);
        const oppgave = await oppgaveService.createOppgave(playerId, tenantId, request.body);
        return reply.code(201).send(oppgave);
      } catch (error: any) {
        return reply.code(400).send({ error: error.message });
      }
    }
  );

  fastify.put<{ Params: { id: string }; Body: UpdateOppgaveInput }>(
    '/oppgaver/:id',
    { schema: { description: 'Update an assignment', tags: ['skoleplan'] } },
    async (request, reply) => {
      try {
        const { playerId, tenantId } = await getPlayerContext(request);
        const { id } = request.params;
        const oppgave = await oppgaveService.updateOppgave(id, playerId, tenantId, request.body);
        return reply.send(oppgave);
      } catch (error: any) {
        const status = error.message.includes('ikke funnet') ? 404 : 403;
        return reply.code(status).send({ error: error.message });
      }
    }
  );

  fastify.patch<{ Params: { id: string }; Body: { status: string } }>(
    '/oppgaver/:id/status',
    {
      schema: {
        description: 'Update assignment status (toggle completion)',
        tags: ['skoleplan'],
        body: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['pending', 'completed'] },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { playerId, tenantId } = await getPlayerContext(request);
        const { id } = request.params;
        const { status } = request.body;
        const oppgave = await oppgaveService.updateOppgaveStatus(id, playerId, tenantId, status);
        return reply.send(oppgave);
      } catch (error: any) {
        const status = error.message.includes('ikke funnet') ? 404 : 403;
        return reply.code(status).send({ error: error.message });
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    '/oppgaver/:id',
    { schema: { description: 'Delete an assignment', tags: ['skoleplan'] } },
    async (request, reply) => {
      try {
        const { playerId, tenantId } = await getPlayerContext(request);
        const { id } = request.params;
        await oppgaveService.deleteOppgave(id, playerId, tenantId);
        return reply.code(204).send();
      } catch (error: any) {
        const status = error.message.includes('ikke funnet') ? 404 : 403;
        return reply.code(status).send({ error: error.message });
      }
    }
  );
}
