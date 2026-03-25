import { z } from 'zod';

/**
 * Video Comparison validation schemas
 */

// Create comparison
export const createComparisonSchema = z.object({
  primaryVideoId: z.string().uuid(),
  comparisonVideoId: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  notes: z.string().max(2000).optional(),
  syncPoint1: z.number().min(0), // Timestamp in primary video (seconds)
  syncPoint2: z.number().min(0), // Timestamp in comparison video (seconds)
});

export type CreateComparisonInput = z.infer<typeof createComparisonSchema>;

// Update comparison
export const updateComparisonSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  syncPoint1: z.number().min(0).optional(),
  syncPoint2: z.number().min(0).optional(),
});

export type UpdateComparisonInput = z.infer<typeof updateComparisonSchema>;

// List comparisons
export const listComparisonsSchema = z.object({
  videoId: z.string().uuid().optional(), // Filter by either primary or comparison video
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['createdAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListComparisonsInput = z.infer<typeof listComparisonsSchema>;

// Get comparison by ID
export const getComparisonSchema = z.object({
  id: z.string().uuid(),
});

export type GetComparisonInput = z.infer<typeof getComparisonSchema>;

// Delete comparison
export const deleteComparisonSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteComparisonInput = z.infer<typeof deleteComparisonSchema>;
