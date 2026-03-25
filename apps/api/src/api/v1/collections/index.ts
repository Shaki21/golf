import { FastifyInstance } from 'fastify';
import { CollectionsService } from './service';
import { authenticateUser } from '../../../middleware/auth';

const collectionsService = new CollectionsService();

export default async function collectionsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateUser);

  // List all collections for user
  fastify.get('/', async (request, reply) => {
    const userId = request.user!.id;
    const result = await collectionsService.listCollections(userId);
    return reply.code(200).send(result);
  });

  // Get single collection
  fastify.get('/:id', async (request, reply) => {
    const userId = request.user!.id;
    const { id } = request.params as { id: string };
    const result = await collectionsService.getById(id, userId);
    return reply.code(200).send(result);
  });

  // Create collection
  fastify.post('/', async (request, reply) => {
    const userId = request.user!.id;
    const tenantId = request.user!.tenantId;
    const input = request.body as Parameters<typeof collectionsService.create>[2];
    const result = await collectionsService.create(userId, tenantId, input);
    return reply.code(201).send(result);
  });

  // Update collection
  fastify.put('/:id', async (request, reply) => {
    const userId = request.user!.id;
    const { id } = request.params as { id: string };
    const input = request.body as Parameters<typeof collectionsService.update>[2];
    const result = await collectionsService.update(id, userId, input);
    return reply.code(200).send(result);
  });

  // Delete collection
  fastify.delete('/:id', async (request, reply) => {
    const userId = request.user!.id;
    const { id } = request.params as { id: string };
    const result = await collectionsService.delete(id, userId);
    return reply.code(200).send(result);
  });

  // Add item to collection
  fastify.post('/:id/items', async (request, reply) => {
    const userId = request.user!.id;
    const { id } = request.params as { id: string };
    const item = request.body as { type: string; id: string };
    const result = await collectionsService.addItem(id, userId, item);
    return reply.code(200).send(result);
  });

  // Remove item from collection
  fastify.delete('/:id/items/:itemId', async (request, reply) => {
    const userId = request.user!.id;
    const { id, itemId } = request.params as { id: string; itemId: string };
    const result = await collectionsService.removeItem(id, userId, itemId);
    return reply.code(200).send(result);
  });

  // Reorder items in collection
  fastify.put('/:id/reorder', async (request, reply) => {
    const userId = request.user!.id;
    const { id } = request.params as { id: string };
    const { itemIds } = request.body as { itemIds: string[] };
    const result = await collectionsService.reorderItems(id, userId, itemIds);
    return reply.code(200).send(result);
  });
}
