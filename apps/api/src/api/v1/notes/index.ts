import { FastifyInstance } from 'fastify';
import { NotesService } from './service';
import {
  createNoteSchema,
  updateNoteSchema,
  getNoteSchema,
  listNotesSchema,
  deleteNoteSchema
} from './schema';
import { authenticateUser } from '../../../middleware/auth';

const notesService = new NotesService();

export default async function notesRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes in this plugin
  fastify.addHook('preHandler', authenticateUser);

  // List notes (with optional filtering)
  fastify.get(
    '/',
    { schema: listNotesSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { category, search } = request.query as { category?: string; search?: string };

      let notes;
      if (search) {
        notes = await notesService.searchNotes(userId, search);
      } else if (category) {
        notes = await notesService.getNotesByCategory(userId, category);
      } else {
        notes = await notesService.listNotes(userId);
      }

      return reply.code(200).send(notes);
    }
  );

  // Get single note
  fastify.get(
    '/:id',
    { schema: getNoteSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const note = await notesService.getNoteById(id, userId);
      return reply.code(200).send(note);
    }
  );

  // Create note
  fastify.post(
    '/',
    { schema: createNoteSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const input = request.body as Parameters<typeof notesService.createNote>[1];
      const note = await notesService.createNote(userId, input);
      return reply.code(201).send(note);
    }
  );

  // Update note
  fastify.put(
    '/:id',
    { schema: updateNoteSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };
      const input = request.body as Parameters<typeof notesService.updateNote>[2];

      const note = await notesService.updateNote(id, userId, input);
      return reply.code(200).send(note);
    }
  );

  // Delete note
  fastify.delete(
    '/:id',
    { schema: deleteNoteSchema },
    async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const result = await notesService.deleteNote(id, userId);
      return reply.code(200).send(result);
    }
  );
}
