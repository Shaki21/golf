/**
 * Video Comment Service Unit Tests
 * Tests threaded comments, CRUD operations, and access control
 */

import { CommentService } from '../../../src/api/v1/comments/service';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../../../src/middleware/errors';

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
  videoComment: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
} as unknown as PrismaClient;

describe('CommentService', () => {
  let service: CommentService;
  const tenantId = 'tenant-123';
  const userId = 'user-123';
  const videoId = 'video-123';
  const commentId = 'comment-123';

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CommentService(mockPrisma);
  });

  describe('createComment', () => {
    const validInput = {
      videoId,
      body: 'Great swing technique!',
    };

    it('should create a top-level comment', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
        deletedAt: null,
      });

      (mockPrisma.videoComment.create as jest.Mock).mockResolvedValue({
        id: commentId,
        videoId,
        createdById: userId,
        parentId: null,
        body: 'Great swing technique!',
        createdAt: new Date(),
        createdBy: { id: userId, firstName: 'Test', lastName: 'User' },
      });

      const result = await service.createComment(validInput, userId, tenantId);

      expect(result.id).toBe(commentId);
      expect(result.videoId).toBe(videoId);
      expect(result.parentId).toBeNull();
      expect(result.body).toBe('Great swing technique!');
      expect(result.author.firstName).toBe('Test');
    });

    it('should create a reply to an existing comment', async () => {
      const parentCommentId = 'parent-comment-123';
      const inputWithParent = { ...validInput, parentId: parentCommentId };

      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
      });

      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue({
        id: parentCommentId,
        videoId,
        deletedAt: null,
      });

      (mockPrisma.videoComment.create as jest.Mock).mockResolvedValue({
        id: commentId,
        videoId,
        createdById: userId,
        parentId: parentCommentId,
        body: 'Great swing technique!',
        createdAt: new Date(),
        createdBy: { id: userId, firstName: 'Test', lastName: 'User' },
      });

      const result = await service.createComment(inputWithParent, userId, tenantId);

      expect(result.parentId).toBe(parentCommentId);
    });

    it('should throw NotFoundError when video does not exist', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createComment(validInput, userId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when parent comment does not exist', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
      });

      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createComment(
          { ...validInput, parentId: 'non-existent-parent' },
          userId,
          tenantId
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getComment', () => {
    it('should return comment with reply count', async () => {
      const mockComment = {
        id: commentId,
        videoId,
        createdById: userId,
        parentId: null,
        body: 'Great technique!',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        video: { tenantId },
        createdBy: { id: userId, firstName: 'Test', lastName: 'User' },
        _count: { replies: 5 },
      };

      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue(mockComment);

      const result = await service.getComment(commentId, tenantId);

      expect(result.id).toBe(commentId);
      expect(result.body).toBe('Great technique!');
      expect(result.replyCount).toBe(5);
      expect(result.author.firstName).toBe('Test');
    });

    it('should throw NotFoundError when comment does not exist', async () => {
      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getComment(commentId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when tenant mismatch', async () => {
      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue({
        id: commentId,
        video: { tenantId: 'other-tenant' },
        createdBy: { id: userId, firstName: 'Test', lastName: 'User' },
        _count: { replies: 0 },
      });

      await expect(
        service.getComment(commentId, tenantId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('listComments', () => {
    it('should return all comments for a video', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
      });

      const mockComments = [
        {
          id: 'comment-1',
          parentId: null,
          body: 'First comment',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: { id: userId, firstName: 'Test', lastName: 'User' },
          _count: { replies: 2 },
        },
        {
          id: 'comment-2',
          parentId: null,
          body: 'Second comment',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: { id: 'user-2', firstName: 'Other', lastName: 'User' },
          _count: { replies: 0 },
        },
      ];

      (mockPrisma.videoComment.findMany as jest.Mock).mockResolvedValue(mockComments);
      (mockPrisma.videoComment.count as jest.Mock).mockResolvedValue(2);

      const result = await service.listComments(
        { videoId, limit: 50, offset: 0, sortOrder: 'asc' },
        tenantId
      );

      expect(result.comments).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.comments[0].body).toBe('First comment');
      expect(result.comments[0].replyCount).toBe(2);
    });

    it('should filter to only top-level comments when parentId is null', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
      });

      (mockPrisma.videoComment.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.videoComment.count as jest.Mock).mockResolvedValue(0);

      await service.listComments(
        { videoId, parentId: null, limit: 50, offset: 0, sortOrder: 'asc' },
        tenantId
      );

      expect(mockPrisma.videoComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ parentId: null }),
        })
      );
    });

    it('should paginate results', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
      });

      (mockPrisma.videoComment.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.videoComment.count as jest.Mock).mockResolvedValue(100);

      const result = await service.listComments(
        { videoId, limit: 20, offset: 40, sortOrder: 'asc' },
        tenantId
      );

      expect(result.limit).toBe(20);
      expect(result.offset).toBe(40);
      expect(mockPrisma.videoComment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 40,
        })
      );
    });

    it('should throw NotFoundError when video does not exist', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.listComments({ videoId, limit: 50, offset: 0, sortOrder: 'asc' }, tenantId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getCommentReplies', () => {
    it('should return replies to a comment', async () => {
      const parentCommentId = 'parent-123';

      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue({
        id: parentCommentId,
        deletedAt: null,
        video: { tenantId },
      });

      const mockReplies = [
        {
          id: 'reply-1',
          body: 'Reply 1',
          createdAt: new Date(),
          createdBy: { id: userId, firstName: 'Test', lastName: 'User' },
        },
        {
          id: 'reply-2',
          body: 'Reply 2',
          createdAt: new Date(),
          createdBy: { id: 'user-2', firstName: 'Other', lastName: 'User' },
        },
      ];

      (mockPrisma.videoComment.findMany as jest.Mock).mockResolvedValue(mockReplies);
      (mockPrisma.videoComment.count as jest.Mock).mockResolvedValue(2);

      const result = await service.getCommentReplies(
        { parentId: parentCommentId, limit: 20, offset: 0 },
        tenantId
      );

      expect(result.replies).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.replies[0].body).toBe('Reply 1');
    });

    it('should throw NotFoundError when parent comment does not exist', async () => {
      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getCommentReplies(
          { parentId: 'non-existent', limit: 20, offset: 0 },
          tenantId
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateComment', () => {
    it('should update comment when user is author', async () => {
      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue({
        id: commentId,
        createdById: userId,
        deletedAt: null,
        video: { tenantId },
      });

      (mockPrisma.videoComment.update as jest.Mock).mockResolvedValue({});

      await service.updateComment(
        { id: commentId, body: 'Updated comment text' },
        userId,
        tenantId
      );

      expect(mockPrisma.videoComment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: { body: 'Updated comment text' },
      });
    });

    it('should throw NotFoundError when comment does not exist', async () => {
      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateComment(
          { id: commentId, body: 'Updated text' },
          userId,
          tenantId
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user is not author', async () => {
      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue({
        id: commentId,
        createdById: 'other-user',
        deletedAt: null,
        video: { tenantId },
      });

      await expect(
        service.updateComment(
          { id: commentId, body: 'Updated text' },
          userId,
          tenantId
        )
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError when tenant mismatch', async () => {
      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue({
        id: commentId,
        createdById: userId,
        deletedAt: null,
        video: { tenantId: 'other-tenant' },
      });

      await expect(
        service.updateComment(
          { id: commentId, body: 'Updated text' },
          userId,
          tenantId
        )
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteComment', () => {
    it('should soft delete comment when user is author', async () => {
      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue({
        id: commentId,
        createdById: userId,
        deletedAt: null,
        video: { tenantId },
      });

      (mockPrisma.videoComment.update as jest.Mock).mockResolvedValue({});

      await service.deleteComment(commentId, userId, tenantId);

      expect(mockPrisma.videoComment.update).toHaveBeenCalledWith({
        where: { id: commentId },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundError when comment does not exist', async () => {
      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deleteComment(commentId, userId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user is not author', async () => {
      (mockPrisma.videoComment.findFirst as jest.Mock).mockResolvedValue({
        id: commentId,
        createdById: 'other-user',
        deletedAt: null,
        video: { tenantId },
      });

      await expect(
        service.deleteComment(commentId, userId, tenantId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getCommentCount', () => {
    it('should return total comment count for a video', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue({
        id: videoId,
        tenantId,
      });

      (mockPrisma.videoComment.count as jest.Mock).mockResolvedValue(42);

      const result = await service.getCommentCount(videoId, tenantId);

      expect(result.count).toBe(42);
      expect(mockPrisma.videoComment.count).toHaveBeenCalledWith({
        where: { videoId, deletedAt: null },
      });
    });

    it('should throw NotFoundError when video does not exist', async () => {
      (mockPrisma.video.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.getCommentCount(videoId, tenantId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
