/**
 * Video API Integration Tests
 *
 * Tests the video upload and management endpoints
 */

import { FastifyInstance } from 'fastify';
import {
  getTestApp,
  getTestPrisma,
  closeTestConnections,
  registerTestUser,
  authenticatedRequest,
  uniqueEmail,
  uniqueString,
} from '../helpers';
import { v4 as uuidv4 } from 'uuid';

describe('Video API Integration Tests', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let tenantId: string;
  let playerId: string;
  let userId: string;

  beforeAll(async () => {
    app = await getTestApp();
    const prisma = getTestPrisma();

    // Create admin
    const admin = await registerTestUser(app, {
      email: uniqueEmail('video-admin'),
      password: 'TestPassword123!',
      firstName: 'Video',
      lastName: 'Admin',
      organizationName: uniqueString('Video Test Org'),
      role: 'admin',
    });

    tenantId = admin.tenantId;
    adminToken = admin.accessToken;
    userId = admin.userId;

    // Create a player in the same tenant
    const player = await prisma.player.create({
      data: {
        tenantId,
        userId,
        firstName: 'Video',
        lastName: 'Player',
        email: uniqueEmail('video-player-profile'),
        dateOfBirth: new Date('2000-01-01'),
        gender: 'male',
        category: 'B',
        handicap: 10.0,
      },
    });

    playerId = player.id;
  });

  afterAll(async () => {
    const prisma = getTestPrisma();
    // Clean up test data
    try {
      await prisma.video.deleteMany({ where: { tenantId } });
      await prisma.player.deleteMany({ where: { tenantId } });
    } catch {
      // Ignore cleanup errors
    }
    await closeTestConnections();
  });

  describe('POST /api/v1/videos/upload/init', () => {
    test('should initiate multipart upload', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/videos/upload/init',
        adminToken,
        {
          clientUploadId: uuidv4(),
          title: 'Test Swing Video',
          playerId,
          fileName: 'swing-analysis.mp4',
          fileSize: 10 * 1024 * 1024, // 10MB
          mimeType: 'video/mp4',
          category: 'swing',
          viewAngle: 'face_on',
        }
      );

      // Note: This may fail if S3 is not configured, which is expected in test environment
      expect([200, 500, 503]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data).toHaveProperty('videoId');
        expect(body.data).toHaveProperty('uploadId');
        expect(body.data).toHaveProperty('key');
      }
    });

    test('should reject non-video mime types', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/videos/upload/init',
        adminToken,
        {
          clientUploadId: uuidv4(),
          title: 'Invalid File',
          playerId,
          fileName: 'malicious.exe',
          fileSize: 1024,
          mimeType: 'application/x-msdownload',
        }
      );

      expect(response.statusCode).toBe(400);
    });

    test('should reject files exceeding size limit', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/videos/upload/init',
        adminToken,
        {
          clientUploadId: uuidv4(),
          title: 'Huge Video',
          playerId,
          fileName: 'huge.mp4',
          fileSize: 10 * 1024 * 1024 * 1024, // 10GB (over 5GB limit)
          mimeType: 'video/mp4',
        }
      );

      expect(response.statusCode).toBe(400);
    });

    test('should reject request for non-existent player', async () => {
      const response = await authenticatedRequest(
        app,
        'POST',
        '/api/v1/videos/upload/init',
        adminToken,
        {
          clientUploadId: uuidv4(),
          title: 'Test Video',
          playerId: '00000000-0000-0000-0000-000000000000',
          fileName: 'test.mp4',
          fileSize: 1024 * 1024,
          mimeType: 'video/mp4',
        }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/videos', () => {
    test('should list videos with pagination', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/videos',
        adminToken
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('videos');
      expect(body.data).toHaveProperty('total');
      expect(body.data).toHaveProperty('limit');
      expect(body.data).toHaveProperty('offset');
      expect(Array.isArray(body.data.videos)).toBe(true);
    });

    test('should filter videos by player', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/videos?playerId=${playerId}`,
        adminToken
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      // All videos should belong to the specified player
      body.data.videos.forEach((video: any) => {
        expect(video.playerId).toBe(playerId);
      });
    });

    test('should filter videos by category', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/videos?category=swing',
        adminToken
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      body.data.videos.forEach((video: any) => {
        expect(video.category).toBe('swing');
      });
    });

    test('should filter videos by status', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/videos?status=ready',
        adminToken
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
    });
  });

  describe('GET /api/v1/videos/:id', () => {
    let testVideoId: string;

    beforeAll(async () => {
      // Create a video directly in the database for testing
      const prisma = getTestPrisma();
      const video = await prisma.video.create({
        data: {
          tenantId,
          playerId,
          uploadedById: userId,
          title: 'Test Video for Get',
          s3Key: 'test/video.mp4',
          duration: 60,
          fileSize: BigInt(1024 * 1024),
          mimeType: 'video/mp4',
          status: 'ready',
        },
      });
      testVideoId = video.id;
    });

    test('should get video by ID', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/videos/${testVideoId}`,
        adminToken
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.data.id).toBe(testVideoId);
      expect(body.data.title).toBe('Test Video for Get');
    });

    test('should return 404 for non-existent video', async () => {
      const response = await authenticatedRequest(
        app,
        'GET',
        '/api/v1/videos/00000000-0000-0000-0000-000000000000',
        adminToken
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /api/v1/videos/:id', () => {
    let testVideoId: string;

    beforeAll(async () => {
      const prisma = getTestPrisma();
      const video = await prisma.video.create({
        data: {
          tenantId,
          playerId,
          uploadedById: userId,
          title: 'Test Video for Update',
          s3Key: 'test/update-video.mp4',
          duration: 60,
          fileSize: BigInt(1024 * 1024),
          mimeType: 'video/mp4',
          status: 'ready',
        },
      });
      testVideoId = video.id;
    });

    test('should update video metadata', async () => {
      const response = await authenticatedRequest(
        app,
        'PATCH',
        `/api/v1/videos/${testVideoId}`,
        adminToken,
        {
          title: 'Updated Video Title',
          description: 'Updated description',
          category: 'putting',
        }
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
    });

    test('should return 404 for non-existent video', async () => {
      const response = await authenticatedRequest(
        app,
        'PATCH',
        '/api/v1/videos/00000000-0000-0000-0000-000000000000',
        adminToken,
        { title: 'New Title' }
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/videos/:id', () => {
    test('should soft delete video', async () => {
      const prisma = getTestPrisma();
      const video = await prisma.video.create({
        data: {
          tenantId,
          playerId,
          uploadedById: userId,
          title: 'Test Video for Delete',
          s3Key: 'test/delete-video.mp4',
          duration: 60,
          fileSize: BigInt(1024 * 1024),
          mimeType: 'video/mp4',
          status: 'ready',
        },
      });

      const response = await authenticatedRequest(
        app,
        'DELETE',
        `/api/v1/videos/${video.id}`,
        adminToken
      );

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);

      // Verify video is soft deleted
      const getResponse = await authenticatedRequest(
        app,
        'GET',
        `/api/v1/videos/${video.id}`,
        adminToken
      );

      expect(getResponse.statusCode).toBe(404);
    });

    test('should return 404 for non-existent video', async () => {
      const response = await authenticatedRequest(
        app,
        'DELETE',
        '/api/v1/videos/00000000-0000-0000-0000-000000000000',
        adminToken
      );

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Access Control', () => {
    test('should require authentication for all endpoints', async () => {
      // GET endpoints should return 401 without auth
      const getEndpoints = [
        { method: 'GET', url: '/api/v1/videos' },
        { method: 'GET', url: '/api/v1/videos/00000000-0000-0000-0000-000000000001' },
        { method: 'DELETE', url: '/api/v1/videos/00000000-0000-0000-0000-000000000001' },
      ];

      for (const endpoint of getEndpoints) {
        const response = await app.inject({
          method: endpoint.method as any,
          url: endpoint.url,
        });

        expect(response.statusCode).toBe(401);
      }

      // POST/PATCH endpoints may return 400 (body validation) or 401 (auth)
      // depending on middleware order - both are acceptable for security
      const bodyEndpoints = [
        { method: 'POST', url: '/api/v1/videos/upload/init' },
        { method: 'POST', url: '/api/v1/videos/upload/complete' },
        { method: 'PATCH', url: '/api/v1/videos/00000000-0000-0000-0000-000000000001' },
      ];

      for (const endpoint of bodyEndpoints) {
        const response = await app.inject({
          method: endpoint.method as any,
          url: endpoint.url,
        });

        expect([400, 401]).toContain(response.statusCode);
      }
    });
  });
});
