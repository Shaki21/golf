/**
 * Video Comment Service
 * Business logic for threaded video comments
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../../../middleware/errors';
import {
  CreateCommentInput,
  UpdateCommentInput,
  ListCommentsInput,
  GetCommentRepliesInput,
} from './schema';

export class CommentService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new comment
   */
  async createComment(
    input: CreateCommentInput,
    userId: string,
    tenantId: string
  ): Promise<{
    id: string;
    videoId: string;
    parentId: string | null;
    body: string;
    createdAt: Date;
    author: { id: string; firstName: string; lastName: string };
  }> {
    // Verify video exists and belongs to tenant
    const video = await this.prisma.video.findFirst({
      where: {
        id: input.videoId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    // If parentId is provided, verify parent comment exists
    if (input.parentId) {
      const parentComment = await this.prisma.videoComment.findFirst({
        where: {
          id: input.parentId,
          videoId: input.videoId,
          deletedAt: null,
        },
      });

      if (!parentComment) {
        throw new NotFoundError('Parent comment not found');
      }
    }

    const comment = await this.prisma.videoComment.create({
      data: {
        videoId: input.videoId,
        createdById: userId,
        parentId: input.parentId || null,
        body: input.body,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return {
      id: comment.id,
      videoId: comment.videoId,
      parentId: comment.parentId,
      body: comment.body,
      createdAt: comment.createdAt,
      author: comment.createdBy,
    };
  }

  /**
   * Get comment by ID
   */
  async getComment(
    commentId: string,
    tenantId: string
  ): Promise<{
    id: string;
    videoId: string;
    parentId: string | null;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    author: { id: string; firstName: string; lastName: string };
    replyCount: number;
  }> {
    const comment = await this.prisma.videoComment.findFirst({
      where: {
        id: commentId,
        deletedAt: null,
      },
      include: {
        video: { select: { tenantId: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { replies: true } },
      },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.video.tenantId !== tenantId) {
      throw new ForbiddenError('Access denied');
    }

    return {
      id: comment.id,
      videoId: comment.videoId,
      parentId: comment.parentId,
      body: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.createdBy,
      replyCount: comment._count.replies,
    };
  }

  /**
   * List comments for a video
   */
  async listComments(
    input: ListCommentsInput,
    tenantId: string
  ): Promise<{
    comments: Array<{
      id: string;
      parentId: string | null;
      body: string;
      createdAt: Date;
      updatedAt: Date;
      author: { id: string; firstName: string; lastName: string };
      replyCount: number;
    }>;
    total: number;
    limit: number;
    offset: number;
  }> {
    // Verify video exists and belongs to tenant
    const video = await this.prisma.video.findFirst({
      where: {
        id: input.videoId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    // Build where clause
    const where: Prisma.VideoCommentWhereInput = {
      videoId: input.videoId,
      deletedAt: null,
    };

    // If parentId is explicitly null, get only top-level comments
    // If parentId is undefined, get all comments
    if (input.parentId === null) {
      where.parentId = null;
    } else if (input.parentId !== undefined) {
      where.parentId = input.parentId;
    }

    const [comments, total] = await Promise.all([
      this.prisma.videoComment.findMany({
        where,
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: input.sortOrder },
        take: input.limit,
        skip: input.offset,
      }),
      this.prisma.videoComment.count({ where }),
    ]);

    return {
      comments: comments.map((c) => ({
        id: c.id,
        parentId: c.parentId,
        body: c.body,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        author: c.createdBy,
        replyCount: c._count.replies,
      })),
      total,
      limit: input.limit,
      offset: input.offset,
    };
  }

  /**
   * Get replies to a comment
   */
  async getCommentReplies(
    input: GetCommentRepliesInput,
    tenantId: string
  ): Promise<{
    replies: Array<{
      id: string;
      body: string;
      createdAt: Date;
      author: { id: string; firstName: string; lastName: string };
    }>;
    total: number;
  }> {
    // Verify parent comment exists and belongs to tenant
    const parentComment = await this.prisma.videoComment.findFirst({
      where: {
        id: input.parentId,
        deletedAt: null,
      },
      include: {
        video: { select: { tenantId: true } },
      },
    });

    if (!parentComment) {
      throw new NotFoundError('Parent comment not found');
    }

    if (parentComment.video.tenantId !== tenantId) {
      throw new ForbiddenError('Access denied');
    }

    const where: Prisma.VideoCommentWhereInput = {
      parentId: input.parentId,
      deletedAt: null,
    };

    const [replies, total] = await Promise.all([
      this.prisma.videoComment.findMany({
        where,
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'asc' },
        take: input.limit,
        skip: input.offset,
      }),
      this.prisma.videoComment.count({ where }),
    ]);

    return {
      replies: replies.map((r) => ({
        id: r.id,
        body: r.body,
        createdAt: r.createdAt,
        author: r.createdBy,
      })),
      total,
    };
  }

  /**
   * Update comment
   */
  async updateComment(
    input: UpdateCommentInput,
    userId: string,
    tenantId: string
  ): Promise<void> {
    const comment = await this.prisma.videoComment.findFirst({
      where: {
        id: input.id,
        deletedAt: null,
      },
      include: {
        video: { select: { tenantId: true } },
      },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.video.tenantId !== tenantId) {
      throw new ForbiddenError('Access denied');
    }

    // Only author can update their comment
    if (comment.createdById !== userId) {
      throw new ForbiddenError('Only the author can update this comment');
    }

    await this.prisma.videoComment.update({
      where: { id: input.id },
      data: { body: input.body },
    });
  }

  /**
   * Delete comment (soft delete)
   */
  async deleteComment(commentId: string, userId: string, tenantId: string): Promise<void> {
    const comment = await this.prisma.videoComment.findFirst({
      where: {
        id: commentId,
        deletedAt: null,
      },
      include: {
        video: { select: { tenantId: true } },
      },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.video.tenantId !== tenantId) {
      throw new ForbiddenError('Access denied');
    }

    // Only author can delete their comment
    if (comment.createdById !== userId) {
      throw new ForbiddenError('Only the author can delete this comment');
    }

    // Soft delete
    await this.prisma.videoComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Get comment count for a video
   */
  async getCommentCount(videoId: string, tenantId: string): Promise<{ count: number }> {
    // Verify video exists and belongs to tenant
    const video = await this.prisma.video.findFirst({
      where: {
        id: videoId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    const count = await this.prisma.videoComment.count({
      where: {
        videoId,
        deletedAt: null,
      },
    });

    return { count };
  }
}
