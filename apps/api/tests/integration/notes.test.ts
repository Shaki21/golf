/**
 * Notes API Integration Tests
 * Tests for user notes CRUD operations
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import {
  getTestApp,
  getTestPrisma,
  closeTestConnections,
  loginDemoPlayer,
  authenticatedRequest,
  parseResponse,
  getDemoIds,
  uniqueString,
} from '../helpers';

describe('Notes API Integration Tests', () => {
  let app: FastifyInstance;
  let prisma: PrismaClient;
  let playerToken: string;
  let demoIds: Awaited<ReturnType<typeof getDemoIds>>;
  let createdNoteIds: string[] = [];

  beforeAll(async () => {
    app = await getTestApp();
    prisma = getTestPrisma();
    demoIds = await getDemoIds();

    const playerAuth = await loginDemoPlayer(app);
    playerToken = playerAuth.accessToken;
  });

  afterAll(async () => {
    // Clean up created notes
    if (createdNoteIds.length > 0) {
      await prisma.note.deleteMany({
        where: { id: { in: createdNoteIds } },
      });
    }
    await closeTestConnections();
  });

  describe('POST /api/v1/notes', () => {
    it('should create a new note', async () => {
      const noteData = {
        title: uniqueString('Test Note'),
        content: 'This is a test note content for integration testing.',
        category: 'training',
        tags: ['test', 'integration'],
      };

      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/notes',
        playerToken,
        noteData
      );

      expect(response.statusCode).toBe(201);
      const body = parseResponse(response);
      expect(body.id).toBeDefined();
      expect(body.title).toBe(noteData.title);
      expect(body.content).toBe(noteData.content);
      expect(body.category).toBe(noteData.category);
      expect(body.tags).toEqual(noteData.tags);

      createdNoteIds.push(body.id);
    });

    it('should require title and content', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/notes',
        playerToken,
        { title: 'Missing content' }
      );

      expect(response.statusCode).toBe(400);
    });

    it('should reject empty title', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/notes',
        playerToken,
        { title: '', content: 'Some content' }
      );

      expect(response.statusCode).toBe(400);
    });

    it('should reject unauthenticated requests', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/notes',
        payload: { title: 'Test', content: 'Test' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/notes', () => {
    it('should list notes for authenticated user', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/notes',
        playerToken
      );

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(Array.isArray(body)).toBe(true);
    });

    it('should filter by category', async () => {
      // First create a note with specific category
      const createResponse = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/notes',
        playerToken,
        {
          title: uniqueString('Category Test'),
          content: 'Testing category filter',
          category: 'mental',
        }
      );
      const created = parseResponse(createResponse);
      createdNoteIds.push(created.id);

      // Then filter by category
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/notes?category=mental',
        playerToken
      );

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(Array.isArray(body)).toBe(true);
      // All notes should have the filtered category
      for (const note of body) {
        expect(note.category).toBe('mental');
      }
    });

    it('should search notes', async () => {
      // Create a note with unique content
      const uniqueContent = uniqueString('unique-search-term');
      const createResponse = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/notes',
        playerToken,
        {
          title: 'Searchable Note',
          content: `This note contains ${uniqueContent} for testing`,
        }
      );
      const created = parseResponse(createResponse);
      createdNoteIds.push(created.id);

      // Search for the unique term
      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/notes?search=${uniqueContent}`,
        playerToken
      );

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/notes/:id', () => {
    let testNoteId: string;

    beforeAll(async () => {
      // Create a test note
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/notes',
        playerToken,
        {
          title: 'Get Test Note',
          content: 'Content for get test',
        }
      );
      const body = parseResponse(response);
      testNoteId = body.id;
      createdNoteIds.push(testNoteId);
    });

    it('should get a specific note', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/notes/${testNoteId}`,
        playerToken
      );

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.id).toBe(testNoteId);
      expect(body.title).toBe('Get Test Note');
    });

    it('should return 404 for non-existent note', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/notes/00000000-0000-0000-0000-000000000999',
        playerToken
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/v1/notes/:id', () => {
    let testNoteId: string;

    beforeAll(async () => {
      // Create a test note
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/notes',
        playerToken,
        {
          title: 'Update Test Note',
          content: 'Original content',
        }
      );
      const body = parseResponse(response);
      testNoteId = body.id;
      createdNoteIds.push(testNoteId);
    });

    it('should update a note', async () => {
      const response = await authenticatedRequest(
        app,
        'PUT',
        `/api/v1/notes/${testNoteId}`,
        playerToken,
        {
          title: 'Updated Title',
          content: 'Updated content',
          isPinned: true,
        }
      );

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.title).toBe('Updated Title');
      expect(body.content).toBe('Updated content');
      expect(body.isPinned).toBe(true);
    });

    it('should return 404 for non-existent note', async () => {
      const response = await authenticatedRequest(
        app,
        'PUT',
        '/api/v1/notes/00000000-0000-0000-0000-000000000999',
        playerToken,
        { title: 'Update', content: 'Content' }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/notes/:id', () => {
    it('should delete a note', async () => {
      // Create a note to delete
      const createResponse = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/notes',
        playerToken,
        {
          title: 'Delete Test Note',
          content: 'This note will be deleted',
        }
      );
      const created = parseResponse(createResponse);

      // Delete the note
      const response = await authenticatedRequest(
        app,
        'DELETE',
        `/api/v1/notes/${created.id}`,
        playerToken
      );

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.success).toBe(true);

      // Verify it's deleted
      const getResponse = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/notes/${created.id}`,
        playerToken
      );
      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 for non-existent note', async () => {
      const response = await authenticatedRequest(
        app,
        'DELETE',
        '/api/v1/notes/00000000-0000-0000-0000-000000000999',
        playerToken
      );

      expect(response.statusCode).toBe(404);
    });
  });
});
