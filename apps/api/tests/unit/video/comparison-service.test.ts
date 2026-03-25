/**
 * Video Comparison Service Unit Tests
 * Tests side-by-side video comparison CRUD and sync point management
 */

import { ComparisonService } from '../../../src/api/v1/comparisons/service';
import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../../src/middleware/errors';

// Mock storage service
jest.mock('../../../src/services/storage.service', () => ({
  storageService: {
    getSignedPlaybackUrl: jest.fn().mockResolvedValue('https://s3.example.com/playback-url'),
  },
}));

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Prisma Client
const mockPrisma = {
  video: {
    findFirst: jest.fn(),
  },
  videoComparison: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
} as unknown as PrismaClient;

describe('ComparisonService', () => {
  let service: ComparisonService;
  const tenantId = 'tenant-123';
  const userId = 'user-123';
  const primaryVideoId = 'video-primary';
  const comparisonVideoId = 'video-comparison';
  const comparisonId = 'comparison-123';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ComparisonService(mockPrisma);
  });

  describe('createComparison', () => {
    const validInput = {
      primaryVideoId,
      comparisonVideoId,
      title: 'Before vs After',
      notes: 'Compare swing improvement',
      syncPoint1: 2.5,
      syncPoint2: 3.0,
    };

    it('should create comparison when both videos exist', async () => {
      (mockPrisma.video.findFirst as jest.Mock)
        .mockResolvedValueOnce({
          id: primaryVideoId,
          tenantId,
          status: 'ready',
          deletedAt: null,
        })
        .mockResolvedValueOnce({
          id: comparisonVideoId,
          tenantId,
          status: 'ready',
          deletedAt: null,
        });

      (mockPrisma.videoComparison.create as jest.Mock).mockResolvedValue({
        id: comparisonId,
        tenantId,
        createdById: userId,
        primaryVideoId,
        comparisonVideoId,
        title: 'Before vs After',
        notes: 'Compare swing improvement',
        syncPoint1: new Prisma.Decimal(2.5),
        syncPoint2: new Prisma.Decimal(3.0),
        createdAt: new Date(),
        primaryVideo: { id: primaryVideoId, title: 'Primary Video' },
        comparisonVideo: { id: comparisonVideoId, title: 'Comparison Video' },
      });

      const result = await service.createComparison(validInput, userId, tenantId);

      expect(result.id).toBe(comparisonId);
      expect(result.title).toBe('Before vs After');
      expect(result.syncPoint1).toBe(2.5);
      expect(result.syncPoint2).toBe(3.0);
      expect(result.primaryVideo.title).toBe('Primary Video');
      expect(result.comparisonVideo.title).toBe('Comparison Video');
    });

    it('should throw NotFoundError when primary video does not exist', async () => {
      (mockPrisma.video.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: comparisonVideoId,
          tenantId,
          status: 'ready',
        });

      await expect(
        service.createComparison(validInput, userId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when comparison video does not exist', async () => {
      (mockPrisma.video.findFirst as jest.Mock)
        .mockResolvedValueOnce({
          id: primaryVideoId,
          tenantId,
          status: 'ready',
        })
        .mockResolvedValueOnce(null);

      await expect(
        service.createComparison(validInput, userId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError when comparing video with itself', async () => {
      const sameVideoInput = {
        ...validInput,
        primaryVideoId: 'same-video',
        comparisonVideoId: 'same-video',
      };

      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: 'same-video',
        tenantId,
        status: 'ready',
      });

      await expect(
        service.createComparison(sameVideoInput, userId, tenantId)
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError when primary video is not ready', async () => {
      // When status is not 'ready', findFirst returns null due to the where clause
      (mockPrisma.video.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // Primary video not found (not ready)
        .mockResolvedValueOnce({
          id: comparisonVideoId,
          tenantId,
          status: 'ready',
        });

      await expect(
        service.createComparison(validInput, userId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getComparison', () => {
    it('should return comparison with playback URLs', async () => {
      const mockComparison = {
        id: comparisonId,
        tenantId,
        title: 'Before vs After',
        notes: 'Swing comparison',
        syncPoint1: new Prisma.Decimal(2.5),
        syncPoint2: new Prisma.Decimal(3.0),
        createdAt: new Date(),
        createdBy: { id: userId, firstName: 'Test', lastName: 'User' },
        primaryVideo: {
          id: primaryVideoId,
          title: 'Primary Video',
          duration: 60,
          category: 'swing',
          playerId: 'player-123',
          s3Key: 'tenants/tenant-123/videos/primary.mp4',
        },
        comparisonVideo: {
          id: comparisonVideoId,
          title: 'Comparison Video',
          duration: 45,
          category: 'swing',
          playerId: 'player-123',
          s3Key: 'tenants/tenant-123/videos/comparison.mp4',
        },
      };

      (mockPrisma.videoComparison.findFirst as jest.Mock).mockResolvedValue(mockComparison);

      const result = await service.getComparison(comparisonId, tenantId);

      expect(result.id).toBe(comparisonId);
      expect(result.title).toBe('Before vs After');
      expect(result.syncPoint1).toBe(2.5);
      expect(result.syncPoint2).toBe(3.0);
      expect(result.playbackUrls.primaryVideoUrl).toBe('https://s3.example.com/playback-url');
      expect(result.playbackUrls.comparisonVideoUrl).toBe('https://s3.example.com/playback-url');
      expect(result.playbackUrls.expiresAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundError when comparison does not exist', async () => {
      (mockPrisma.videoComparison.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getComparison(comparisonId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('listComparisons', () => {
    it('should return paginated comparisons', async () => {
      const mockComparisons = [
        {
          id: 'comp-1',
          title: 'Comparison 1',
          syncPoint1: new Prisma.Decimal(1.0),
          syncPoint2: new Prisma.Decimal(2.0),
          createdAt: new Date(),
          primaryVideo: { id: 'video-1', title: 'Video 1', category: 'swing' },
          comparisonVideo: { id: 'video-2', title: 'Video 2', category: 'swing' },
          createdBy: { id: userId, firstName: 'Test', lastName: 'User' },
        },
        {
          id: 'comp-2',
          title: 'Comparison 2',
          syncPoint1: new Prisma.Decimal(3.0),
          syncPoint2: new Prisma.Decimal(4.0),
          createdAt: new Date(),
          primaryVideo: { id: 'video-3', title: 'Video 3', category: 'putting' },
          comparisonVideo: { id: 'video-4', title: 'Video 4', category: 'putting' },
          createdBy: { id: 'user-2', firstName: 'Other', lastName: 'User' },
        },
      ];

      (mockPrisma.videoComparison.findMany as jest.Mock).mockResolvedValue(mockComparisons);
      (mockPrisma.videoComparison.count as jest.Mock).mockResolvedValue(2);

      const result = await service.listComparisons(
        { limit: 20, offset: 0, sortBy: 'createdAt', sortOrder: 'desc' },
        tenantId
      );

      expect(result.comparisons).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.comparisons[0].syncPoint1).toBe(1.0);
    });

    it('should filter by videoId', async () => {
      (mockPrisma.videoComparison.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.videoComparison.count as jest.Mock).mockResolvedValue(0);

      await service.listComparisons(
        { videoId: primaryVideoId, limit: 20, offset: 0, sortBy: 'createdAt', sortOrder: 'desc' },
        tenantId
      );

      expect(mockPrisma.videoComparison.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { primaryVideoId },
              { comparisonVideoId: primaryVideoId },
            ],
          }),
        })
      );
    });

    it('should support sorting', async () => {
      (mockPrisma.videoComparison.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.videoComparison.count as jest.Mock).mockResolvedValue(0);

      await service.listComparisons(
        { limit: 20, offset: 0, sortBy: 'title', sortOrder: 'asc' },
        tenantId
      );

      expect(mockPrisma.videoComparison.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { title: 'asc' },
        })
      );
    });
  });

  describe('updateComparison', () => {
    it('should update comparison when user is creator', async () => {
      (mockPrisma.videoComparison.findFirst as jest.Mock).mockResolvedValue({
        id: comparisonId,
        tenantId,
        createdById: userId,
      });

      (mockPrisma.videoComparison.update as jest.Mock).mockResolvedValue({});

      await service.updateComparison(
        { id: comparisonId, title: 'Updated Title', syncPoint1: 5.0 },
        userId,
        tenantId
      );

      expect(mockPrisma.videoComparison.update).toHaveBeenCalledWith({
        where: { id: comparisonId },
        data: expect.objectContaining({
          title: 'Updated Title',
          syncPoint1: expect.any(Prisma.Decimal),
        }),
      });
    });

    it('should allow updating notes', async () => {
      (mockPrisma.videoComparison.findFirst as jest.Mock).mockResolvedValue({
        id: comparisonId,
        tenantId,
        createdById: userId,
      });

      (mockPrisma.videoComparison.update as jest.Mock).mockResolvedValue({});

      await service.updateComparison(
        { id: comparisonId, notes: 'Updated notes about the comparison' },
        userId,
        tenantId
      );

      expect(mockPrisma.videoComparison.update).toHaveBeenCalledWith({
        where: { id: comparisonId },
        data: expect.objectContaining({
          notes: 'Updated notes about the comparison',
        }),
      });
    });

    it('should allow updating sync points independently', async () => {
      (mockPrisma.videoComparison.findFirst as jest.Mock).mockResolvedValue({
        id: comparisonId,
        tenantId,
        createdById: userId,
      });

      (mockPrisma.videoComparison.update as jest.Mock).mockResolvedValue({});

      await service.updateComparison(
        { id: comparisonId, syncPoint2: 8.5 },
        userId,
        tenantId
      );

      expect(mockPrisma.videoComparison.update).toHaveBeenCalledWith({
        where: { id: comparisonId },
        data: expect.objectContaining({
          syncPoint2: expect.any(Prisma.Decimal),
        }),
      });
    });

    it('should throw NotFoundError when comparison does not exist', async () => {
      (mockPrisma.videoComparison.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateComparison({ id: comparisonId, title: 'Updated' }, userId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user is not creator', async () => {
      (mockPrisma.videoComparison.findFirst as jest.Mock).mockResolvedValue({
        id: comparisonId,
        tenantId,
        createdById: 'other-user',
      });

      await expect(
        service.updateComparison({ id: comparisonId, title: 'Updated' }, userId, tenantId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteComparison', () => {
    it('should delete comparison when user is creator', async () => {
      (mockPrisma.videoComparison.findFirst as jest.Mock).mockResolvedValue({
        id: comparisonId,
        tenantId,
        createdById: userId,
      });

      (mockPrisma.videoComparison.delete as jest.Mock).mockResolvedValue({});

      await service.deleteComparison(comparisonId, userId, tenantId);

      expect(mockPrisma.videoComparison.delete).toHaveBeenCalledWith({
        where: { id: comparisonId },
      });
    });

    it('should throw NotFoundError when comparison does not exist', async () => {
      (mockPrisma.videoComparison.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deleteComparison(comparisonId, userId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user is not creator', async () => {
      (mockPrisma.videoComparison.findFirst as jest.Mock).mockResolvedValue({
        id: comparisonId,
        tenantId,
        createdById: 'other-user',
      });

      await expect(
        service.deleteComparison(comparisonId, userId, tenantId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getVideoComparisons', () => {
    it('should return comparisons for a video (both primary and comparison)', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: primaryVideoId,
        tenantId,
      });

      const asPrimaryMock = [
        {
          id: 'comp-1',
          title: 'As Primary',
          createdAt: new Date('2025-01-01'),
          comparisonVideo: { id: 'other-1', title: 'Other Video 1' },
        },
      ];

      const asComparisonMock = [
        {
          id: 'comp-2',
          title: 'As Comparison',
          createdAt: new Date('2025-01-02'),
          primaryVideo: { id: 'other-2', title: 'Other Video 2' },
        },
      ];

      (mockPrisma.videoComparison.findMany as jest.Mock)
        .mockResolvedValueOnce(asPrimaryMock)
        .mockResolvedValueOnce(asComparisonMock);

      const result = await service.getVideoComparisons(primaryVideoId, tenantId);

      expect(result.comparisons).toHaveLength(2);

      // Should be sorted by createdAt desc
      expect(result.comparisons[0].role).toBe('comparison');
      expect(result.comparisons[0].id).toBe('comp-2');
      expect(result.comparisons[0].otherVideo.title).toBe('Other Video 2');

      expect(result.comparisons[1].role).toBe('primary');
      expect(result.comparisons[1].id).toBe('comp-1');
      expect(result.comparisons[1].otherVideo.title).toBe('Other Video 1');
    });

    it('should return empty array when video has no comparisons', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: primaryVideoId,
        tenantId,
      });

      (mockPrisma.videoComparison.findMany as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.getVideoComparisons(primaryVideoId, tenantId);

      expect(result.comparisons).toHaveLength(0);
    });

    it('should throw NotFoundError when video does not exist', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getVideoComparisons(primaryVideoId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
