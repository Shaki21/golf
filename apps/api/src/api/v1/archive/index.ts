import { FastifyInstance } from 'fastify';
import { ArchiveService } from './service';
import {
  archiveItemSchema,
  getArchivedSchema,
  listArchivedSchema,
  deleteArchivedSchema,
  restoreItemSchema,
  archiveCountSchema,
  bulkDeleteSchema
} from './schema';
import { authenticateUser } from '../../../middleware/auth';

const archiveService = new ArchiveService();

export default async function archiveRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this plugin
  fastify.addHook('preHandler', authenticateUser);

  // List archived items (with optional filtering by type)
  fastify.get(
    '/',
    { schema: listArchivedSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { entityType } = request.query as { entityType?: string };

      const items = await archiveService.listArchived(userId, entityType);
      return reply.code(200).send(items);
    }
  );

  // Get archive count
  fastify.get(
    '/count',
    { schema: archiveCountSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const count = await archiveService.getArchiveCount(userId);
      return reply.code(200).send(count);
    }
  );

  // Get single archived item
  fastify.get(
    '/:id',
    { schema: getArchivedSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const item = await archiveService.getArchivedById(id, userId);
      return reply.code(200).send(item);
    }
  );

  // Archive an item
  fastify.post(
    '/',
    { schema: archiveItemSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const input = request.body as Parameters<typeof archiveService.archiveItem>[1];
      const archivedItem = await archiveService.archiveItem(userId, input);
      return reply.code(201).send(archivedItem);
    }
  );

  // Restore archived item
  fastify.post(
    '/:id/restore',
    { schema: restoreItemSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const result = await archiveService.restoreItem(id, userId);
      return reply.code(200).send(result);
    }
  );

  // Bulk delete archived items
  fastify.post(
    '/bulk-delete',
    { schema: bulkDeleteSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { archiveIds } = request.body as { archiveIds: string[] };

      const result = await archiveService.bulkDelete(userId, archiveIds);
      return reply.code(200).send(result);
    }
  );

  // Delete archived item permanently
  fastify.delete(
    '/:id',
    { schema: deleteArchivedSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const result = await archiveService.deleteArchived(id, userId);
      return reply.code(200).send(result);
    }
  );
}
