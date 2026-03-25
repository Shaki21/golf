import { z } from 'zod';

/**
 * Video validation schemas
 */

// Initiate upload
export const initiateUploadSchema = z.object({
  clientUploadId: z.string().uuid(),
  title: z.string().min(1).max(255),
  playerId: z.string().uuid(),
  fileName: z.string().min(1),
  fileSize: z.number().int().positive().max(5 * 1024 * 1024 * 1024), // 5GB max
  mimeType: z.string().regex(/^video\//),
  category: z.enum(['swing', 'putting', 'short_game', 'other']).optional(),
  clubType: z.string().max(50).optional(),
  viewAngle: z.enum(['face_on', 'down_the_line', 'overhead', 'side']).optional(),
  description: z.string().optional(),
});

export type InitiateUploadInput = z.infer<typeof initiateUploadSchema>;

// Complete upload
export const completeUploadSchema = z.object({
  videoId: z.string().uuid(),
  uploadId: z.string(),
  parts: z.array(
    z.object({
      etag: z.string(),
      partNumber: z.number().int().positive(),
    })
  ).min(1),
  duration: z.number().int().positive().optional(), // in seconds
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  fps: z.number().positive().optional(),
});

export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;

// List videos
export const listVideosSchema = z.object({
  playerId: z.string().uuid().optional(),
  category: z.enum(['swing', 'putting', 'short_game', 'other']).optional(),
  status: z.enum(['processing', 'ready', 'reviewed', 'failed', 'deleted']).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
  cursor: z.string().uuid().optional(), // Cursor for stable pagination (video ID)
  sortBy: z.enum(['createdAt', 'title', 'duration']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListVideosInput = z.infer<typeof listVideosSchema>;

// Get video by ID
export const getVideoSchema = z.object({
  id: z.string().uuid(),
});

export type GetVideoInput = z.infer<typeof getVideoSchema>;

// Update video metadata
export const updateVideoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  category: z.enum(['swing', 'putting', 'short_game', 'other']).optional(),
  clubType: z.string().max(50).optional(),
  viewAngle: z.enum(['face_on', 'down_the_line', 'overhead', 'side']).optional(),
  visibility: z.enum(['private', 'shared', 'public']).optional(),
  shareExpiresAt: z.string().datetime().optional().nullable(),
  status: z.enum(['processing', 'ready', 'reviewed', 'failed', 'deleted']).optional(),
});

export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;

// Delete video
export const deleteVideoSchema = z.object({
  id: z.string().uuid(),
  hardDelete: z.boolean().default(false),
});

export type DeleteVideoInput = z.infer<typeof deleteVideoSchema>;

// Get playback URL
export const getPlaybackUrlSchema = z.object({
  id: z.string().uuid(),
  expiresIn: z.number().int().positive().max(3600).default(300), // max 1 hour
});

export type GetPlaybackUrlInput = z.infer<typeof getPlaybackUrlSchema>;

// Share video with players
export const shareVideoSchema = z.object({
  id: z.string().uuid(),
  playerIds: z.array(z.string().uuid()).min(1).max(50),
});

export type ShareVideoInput = z.infer<typeof shareVideoSchema>;

// Create video request (coach requests player to upload video)
export const createVideoRequestSchema = z.object({
  playerId: z.string().uuid(),
  drillType: z.string().max(100).optional(),
  category: z.enum(['swing', 'putting', 'short_game', 'other']).optional(),
  viewAngle: z.enum(['face_on', 'down_the_line', 'overhead', 'side']).optional(),
  instructions: z.string().max(1000).optional(),
  dueDate: z.string().datetime().optional(),
});

export type CreateVideoRequestInput = z.infer<typeof createVideoRequestSchema>;

// List video requests
export const listVideoRequestsSchema = z.object({
  playerId: z.string().uuid().optional(),
  status: z.enum(['pending', 'fulfilled', 'expired', 'cancelled']).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type ListVideoRequestsInput = z.infer<typeof listVideoRequestsSchema>;
