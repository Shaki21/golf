import { getPrismaClient } from '../../../core/db/prisma';
import { AppError } from '../../../core/errors';

const prisma = getPrismaClient();

export interface CreateNoteInput {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  color?: string;
  mood?: number;
  sharedWithCoach?: boolean;
  linkedEntityType?: string;
  linkedEntityId?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPinned?: boolean;
  color?: string;
  mood?: number;
  sharedWithCoach?: boolean;
  linkedEntityType?: string;
  linkedEntityId?: string;
}

export class NotesService {
  async listNotes(userId: string) {
    return prisma.note.findMany({
      where: { userId },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async getNoteById(noteId: string, userId: string) {
    const note = await prisma.note.findUnique({
      where: { id: noteId }
    });

    if (!note) {
      throw new AppError('validation_error', 'Note not found', 404, { noteId });
    }

    if (note.userId !== userId) {
      throw new AppError('authorization_error', 'You do not have permission to access this note', 403);
    }

    return note;
  }

  async createNote(userId: string, input: CreateNoteInput) {
    return prisma.note.create({
      data: {
        userId,
        title: input.title,
        content: input.content,
        category: input.category,
        tags: input.tags || [],
        isPinned: input.isPinned || false,
        color: input.color,
        mood: input.mood,
        sharedWithCoach: input.sharedWithCoach || false,
        linkedEntityType: input.linkedEntityType,
        linkedEntityId: input.linkedEntityId
      }
    });
  }

  async updateNote(noteId: string, userId: string, input: UpdateNoteInput) {
    // First verify ownership
    await this.getNoteById(noteId, userId);

    return prisma.note.update({
      where: { id: noteId },
      data: {
        ...input,
        updatedAt: new Date()
      }
    });
  }

  async deleteNote(noteId: string, userId: string) {
    // First verify ownership
    await this.getNoteById(noteId, userId);

    await prisma.note.delete({
      where: { id: noteId }
    });

    return { success: true };
  }

  async searchNotes(userId: string, query: string) {
    return prisma.note.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } }
        ]
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async getNotesByCategory(userId: string, category: string) {
    return prisma.note.findMany({
      where: {
        userId,
        category
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }
}
