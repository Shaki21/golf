/**
 * Video Keyframes Validation Schemas
 */

import { z } from 'zod';

export const createKeyframeSchema = z.object({
  videoId: z.string().uuid(),
  timestamp: z.number().min(0),
  s3Key: z.string().optional(), // Will be generated
  thumbnailKey: z.string().optional(),
  label: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export const listKeyframesSchema = z.object({
  videoId: z.string().uuid(),
  playerId: z.string().uuid().optional(),
});

export const getKeyframeSchema = z.object({
  id: z.string().uuid(),
});

export const deleteKeyframeSchema = z.object({
  id: z.string().uuid(),
});

export const updateKeyframeSchema = z.object({
  id: z.string().uuid(),
  label: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateKeyframeInput = z.infer<typeof createKeyframeSchema>;
export type ListKeyframesInput = z.infer<typeof listKeyframesSchema>;
export type GetKeyframeInput = z.infer<typeof getKeyframeSchema>;
export type DeleteKeyframeInput = z.infer<typeof deleteKeyframeSchema>;
export type UpdateKeyframeInput = z.infer<typeof updateKeyframeSchema>;
