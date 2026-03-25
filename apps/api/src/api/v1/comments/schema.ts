import { z } from 'zod';

/**
 * Video Comment validation schemas
 */

// Create comment
export const createCommentSchema = z.object({
  videoId: z.string().uuid(),
  parentId: z.string().uuid().optional(), // For threaded replies
  body: z.string().min(1).max(2000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// Update comment
export const updateCommentSchema = z.object({
  id: z.string().uuid(),
  body: z.string().min(1).max(2000),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

// List comments for a video
export const listCommentsSchema = z.object({
  videoId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable(), // null for top-level only
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ListCommentsInput = z.infer<typeof listCommentsSchema>;

// Get comment by ID
export const getCommentSchema = z.object({
  id: z.string().uuid(),
});

export type GetCommentInput = z.infer<typeof getCommentSchema>;

// Delete comment
export const deleteCommentSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;

// Get replies to a comment
export const getCommentRepliesSchema = z.object({
  parentId: z.string().uuid(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type GetCommentRepliesInput = z.infer<typeof getCommentRepliesSchema>;
