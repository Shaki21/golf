/**
 * Video Annotation Service Unit Tests
 * Tests annotation CRUD, audio voice-over, and bulk operations
 */

import { AnnotationService } from '../../../src/api/v1/annotations/service';
import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../../src/middleware/errors';

// Mock storage service
jest.mock('../../../src/services/storage.service', () => ({
  storageService: {
    getSignedUploadUrl: jest.fn().mockResolvedValue('https://s3.example.com/upload-url'),
    getSignedPlaybackUrl: jest.fn().mockResolvedValue('https://s3.example.com/playback-url'),
    deleteObject: jest.fn().mockResolvedValue(undefined),
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
  videoAnnotation: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
} as unknown as PrismaClient;

describe('AnnotationService', () => {
  let service: AnnotationService;
  const tenantId = 'tenant-123';
  const userId = 'user-123';
  const videoId = 'video-123';
  const annotationId = 'annotation-123';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AnnotationService(mockPrisma);
  });

  describe('createAnnotation', () => {
    const validInput = {
      videoId,
      timestamp: 5.5,
      type: 'line' as const,
      drawingData: {
        startPoint: { x: 0.1, y: 0.2 },
        endPoint: { x: 0.8, y: 0.9 },
      },
      color: '#FF0000',
      strokeWidth: 3,
      note: 'Check swing plane',
    };

    it('should create annotation when video exists', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
        deletedAt: null,
      });

      (mockPrisma.videoAnnotation.create as jest.Mock).mockResolvedValue({
        id: annotationId,
        videoId,
        createdById: userId,
        timestamp: new Prisma.Decimal(5.5),
        type: 'line',
        drawingData: validInput.drawingData,
        color: '#FF0000',
        strokeWidth: 3,
        createdAt: new Date(),
      });

      const result = await service.createAnnotation(validInput, userId, tenantId);

      expect(result.id).toBe(annotationId);
      expect(result.videoId).toBe(videoId);
      expect(result.timestamp).toBe(5.5);
      expect(result.type).toBe('line');
      expect(result.color).toBe('#FF0000');
      expect(mockPrisma.video.findFirst).toHaveBeenCalledWith({
        where: { id: videoId, tenantId, deletedAt: null },
      });
    });

    it('should throw NotFoundError when video does not exist', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createAnnotation(validInput, userId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should create annotation with optional duration', async () => {
      const inputWithDuration = { ...validInput, duration: 2.5 };

      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
      });

      (mockPrisma.videoAnnotation.create as jest.Mock).mockResolvedValue({
        id: annotationId,
        videoId,
        createdById: userId,
        timestamp: new Prisma.Decimal(5.5),
        duration: new Prisma.Decimal(2.5),
        type: 'line',
        drawingData: validInput.drawingData,
        color: '#FF0000',
        strokeWidth: 3,
        createdAt: new Date(),
      });

      const result = await service.createAnnotation(inputWithDuration, userId, tenantId);

      expect(result).toBeDefined();
      expect(mockPrisma.videoAnnotation.create).toHaveBeenCalled();
    });

    it('should handle all annotation types', async () => {
      const types: Array<'line' | 'circle' | 'arrow' | 'angle' | 'freehand' | 'text'> = [
        'line', 'circle', 'arrow', 'angle', 'freehand', 'text'
      ];

      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
      });

      for (const type of types) {
        (mockPrisma.videoAnnotation.create as jest.Mock).mockResolvedValue({
          id: annotationId,
          videoId,
          createdById: userId,
          timestamp: new Prisma.Decimal(5.5),
          type,
          drawingData: {},
          color: '#FF0000',
          strokeWidth: 3,
          createdAt: new Date(),
        });

        const result = await service.createAnnotation(
          { ...validInput, type },
          userId,
          tenantId
        );

        expect(result.type).toBe(type);
      }
    });
  });

  describe('bulkCreateAnnotations', () => {
    it('should create multiple annotations in a transaction', async () => {
      const input = {
        videoId,
        annotations: [
          { timestamp: 1.0, type: 'line' as const, drawingData: {}, color: '#FF0000', strokeWidth: 3 },
          { timestamp: 2.0, type: 'circle' as const, drawingData: {}, color: '#00FF00', strokeWidth: 2 },
          { timestamp: 3.0, type: 'arrow' as const, drawingData: {}, color: '#0000FF', strokeWidth: 4 },
        ],
      };

      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
      });

      (mockPrisma.$transaction as jest.Mock).mockResolvedValue([
        { id: 'ann-1' },
        { id: 'ann-2' },
        { id: 'ann-3' },
      ]);

      const result = await service.bulkCreateAnnotations(input, userId, tenantId);

      expect(result.created).toBe(3);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundError when video does not exist', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.bulkCreateAnnotations(
          { videoId, annotations: [{ timestamp: 1.0, type: 'line', drawingData: {}, color: '#FF0000', strokeWidth: 3 }] },
          userId,
          tenantId
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAnnotation', () => {
    it('should return annotation when found', async () => {
      const mockAnnotation = {
        id: annotationId,
        videoId,
        createdById: userId,
        timestamp: new Prisma.Decimal(5.5),
        duration: null,
        frameNumber: null,
        type: 'line',
        drawingData: { startPoint: { x: 0.1, y: 0.2 }, endPoint: { x: 0.8, y: 0.9 } },
        color: '#FF0000',
        strokeWidth: 3,
        audioKey: null,
        audioDuration: null,
        note: 'Test note',
        createdAt: new Date(),
        updatedAt: new Date(),
        video: { tenantId },
        createdBy: { id: userId, firstName: 'Test', lastName: 'User' },
      };

      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue(mockAnnotation);

      const result = await service.getAnnotation(annotationId, tenantId);

      expect(result.id).toBe(annotationId);
      expect(result.timestamp).toBe(5.5);
      expect(result.type).toBe('line');
      expect(result.createdBy.firstName).toBe('Test');
    });

    it('should throw NotFoundError when annotation does not exist', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getAnnotation(annotationId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when tenant mismatch', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue({
        id: annotationId,
        video: { tenantId: 'other-tenant' },
        createdBy: { id: userId, firstName: 'Test', lastName: 'User' },
      });

      await expect(
        service.getAnnotation(annotationId, tenantId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('listAnnotations', () => {
    it('should return annotations for a video', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
      });

      const mockAnnotations = [
        {
          id: 'ann-1',
          timestamp: new Prisma.Decimal(1.0),
          duration: null,
          frameNumber: null,
          type: 'line',
          drawingData: {},
          color: '#FF0000',
          strokeWidth: 3,
          audioKey: null,
          audioDuration: null,
          note: null,
          createdAt: new Date(),
          createdBy: { id: userId, firstName: 'Test', lastName: 'User' },
        },
        {
          id: 'ann-2',
          timestamp: new Prisma.Decimal(5.0),
          duration: null,
          frameNumber: null,
          type: 'circle',
          drawingData: {},
          color: '#00FF00',
          strokeWidth: 2,
          audioKey: null,
          audioDuration: null,
          note: 'Check this',
          createdAt: new Date(),
          createdBy: { id: userId, firstName: 'Test', lastName: 'User' },
        },
      ];

      (mockPrisma.videoAnnotation.findMany as jest.Mock).mockResolvedValue(mockAnnotations);
      (mockPrisma.videoAnnotation.count as jest.Mock).mockResolvedValue(2);

      const result = await service.listAnnotations({ videoId }, tenantId);

      expect(result.annotations).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.annotations[0].timestamp).toBe(1.0);
      expect(result.annotations[1].timestamp).toBe(5.0);
    });

    it('should filter by type', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
      });

      (mockPrisma.videoAnnotation.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.videoAnnotation.count as jest.Mock).mockResolvedValue(0);

      await service.listAnnotations({ videoId, type: 'arrow' }, tenantId);

      expect(mockPrisma.videoAnnotation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'arrow' }),
        })
      );
    });

    it('should filter by timestamp range', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
      });

      (mockPrisma.videoAnnotation.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.videoAnnotation.count as jest.Mock).mockResolvedValue(0);

      await service.listAnnotations(
        { videoId, startTimestamp: 5.0, endTimestamp: 10.0 },
        tenantId
      );

      expect(mockPrisma.videoAnnotation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            timestamp: expect.objectContaining({
              gte: expect.any(Prisma.Decimal),
              lte: expect.any(Prisma.Decimal),
            }),
          }),
        })
      );
    });

    it('should throw NotFoundError when video does not exist', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.listAnnotations({ videoId }, tenantId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateAnnotation', () => {
    it('should update annotation when user is creator', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue({
        id: annotationId,
        createdById: userId,
        video: { tenantId },
      });

      (mockPrisma.videoAnnotation.update as jest.Mock).mockResolvedValue({});

      await service.updateAnnotation(
        { id: annotationId, timestamp: 10.5, color: '#00FF00' },
        userId,
        tenantId
      );

      expect(mockPrisma.videoAnnotation.update).toHaveBeenCalledWith({
        where: { id: annotationId },
        data: expect.objectContaining({
          timestamp: expect.any(Prisma.Decimal),
          color: '#00FF00',
        }),
      });
    });

    it('should throw NotFoundError when annotation does not exist', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateAnnotation({ id: annotationId, timestamp: 10.5 }, userId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user is not creator', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue({
        id: annotationId,
        createdById: 'other-user',
        video: { tenantId },
      });

      await expect(
        service.updateAnnotation({ id: annotationId, timestamp: 10.5 }, userId, tenantId)
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError when tenant mismatch', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue({
        id: annotationId,
        createdById: userId,
        video: { tenantId: 'other-tenant' },
      });

      await expect(
        service.updateAnnotation({ id: annotationId, timestamp: 10.5 }, userId, tenantId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteAnnotation', () => {
    it('should delete annotation when user is creator', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue({
        id: annotationId,
        createdById: userId,
        audioKey: null,
        video: { tenantId },
      });

      (mockPrisma.videoAnnotation.delete as jest.Mock).mockResolvedValue({});

      await service.deleteAnnotation(annotationId, userId, tenantId);

      expect(mockPrisma.videoAnnotation.delete).toHaveBeenCalledWith({
        where: { id: annotationId },
      });
    });

    it('should delete audio from S3 when annotation has audio', async () => {
      const { storageService } = require('../../../src/services/storage.service');

      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue({
        id: annotationId,
        createdById: userId,
        audioKey: 'tenants/tenant-123/audio/player-123/audio-file.webm',
        video: { tenantId },
      });

      (mockPrisma.videoAnnotation.delete as jest.Mock).mockResolvedValue({});

      await service.deleteAnnotation(annotationId, userId, tenantId);

      expect(storageService.deleteObject).toHaveBeenCalledWith(
        'tenants/tenant-123/audio/player-123/audio-file.webm'
      );
    });

    it('should throw NotFoundError when annotation does not exist', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deleteAnnotation(annotationId, userId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user is not creator', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue({
        id: annotationId,
        createdById: 'other-user',
        video: { tenantId },
      });

      await expect(
        service.deleteAnnotation(annotationId, userId, tenantId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getAudioUploadUrl', () => {
    it('should return upload URL for voice-over', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue({
        id: annotationId,
        createdById: userId,
        video: { tenantId, playerId: 'player-123' },
      });

      const result = await service.getAudioUploadUrl(
        { annotationId, mimeType: 'audio/webm', duration: 30 },
        userId,
        tenantId
      );

      expect(result.uploadUrl).toBe('https://s3.example.com/upload-url');
      expect(result.audioKey).toContain('tenants/tenant-123/audio/');
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should throw ForbiddenError when user is not creator', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue({
        id: annotationId,
        createdById: 'other-user',
        video: { tenantId, playerId: 'player-123' },
      });

      await expect(
        service.getAudioUploadUrl(
          { annotationId, mimeType: 'audio/webm', duration: 30 },
          userId,
          tenantId
        )
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('confirmAudioUpload', () => {
    it('should update annotation with audio duration', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue({
        id: annotationId,
        createdById: userId,
        video: { tenantId },
      });

      (mockPrisma.videoAnnotation.update as jest.Mock).mockResolvedValue({});

      await service.confirmAudioUpload(
        { annotationId, audioDuration: 45.5 },
        userId,
        tenantId
      );

      expect(mockPrisma.videoAnnotation.update).toHaveBeenCalledWith({
        where: { id: annotationId },
        data: { audioDuration: expect.any(Prisma.Decimal) },
      });
    });
  });

  describe('getAudioPlaybackUrl', () => {
    it('should return playback URL for voice-over', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue({
        id: annotationId,
        audioKey: 'tenants/tenant-123/audio/player-123/audio-file.webm',
        video: { tenantId },
      });

      const result = await service.getAudioPlaybackUrl(annotationId, tenantId);

      expect(result.url).toBe('https://s3.example.com/playback-url');
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('should throw BadRequestError when annotation has no audio', async () => {
      (mockPrisma.videoAnnotation.findFirst as jest.Mock).mockResolvedValue({
        id: annotationId,
        audioKey: null,
        video: { tenantId },
      });

      await expect(
        service.getAudioPlaybackUrl(annotationId, tenantId)
      ).rejects.toThrow(BadRequestError);
    });
  });
});
