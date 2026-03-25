/**
 * Zod validation schemas for Technique Plan API
 */

import { z } from 'zod';

// Task schemas
export const createTaskSchema = z.object({
  playerId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  instructions: z.string().optional(),
  videoUrl: z.string().url().max(500).optional(),
  technicalArea: z.enum([
    'swing',
    'putting',
    'chipping',
    'pitching',
    'bunker',
    'driving',
    'irons',
    'wedges',
    'mental',
    'other',
  ]),
  targetMetrics: z.record(z.number()).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime().optional(),
  // P-System fields
  pLevel: z.string().regex(/^P([1-9]|10)\.0$/).optional(),
  repetitions: z.number().int().min(0).optional(),
  priorityOrder: z.number().int().min(0).optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  instructions: z.string().optional(),
  videoUrl: z.string().url().max(500).optional().nullable(),
  technicalArea: z.enum([
    'swing',
    'putting',
    'chipping',
    'pitching',
    'bunker',
    'driving',
    'irons',
    'wedges',
    'mental',
    'other',
  ]).optional(),
  targetMetrics: z.record(z.number()).optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  // P-System fields
  pLevel: z.string().regex(/^P([1-9]|10)\.0$/).optional().nullable(),
  repetitions: z.number().int().min(0).optional(),
  priorityOrder: z.number().int().min(0).optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

export const listTasksQuerySchema = z.object({
  playerId: z.string().uuid().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  technicalArea: z.string().optional(),
  creatorType: z.enum(['coach', 'player']).optional(),
  pLevel: z.string().regex(/^P([1-9]|10)\.0$/).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// Goal schemas
export const createGoalSchema = z.object({
  playerId: z.string().uuid(),
  title: z.string().min(1).max(255),
  metricType: z.enum([
    'clubPath',
    'attackAngle',
    'swingDirection',
    'faceToPath',
    'dynamicLoft',
  ]),
  baselineValue: z.number().optional(),
  targetValue: z.number(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  targetValue: z.number().optional(),
  status: z.enum(['active', 'achieved', 'paused']).optional(),
});

export const listGoalsQuerySchema = z.object({
  playerId: z.string().uuid().optional(),
  metricType: z.string().optional(),
  status: z.enum(['active', 'achieved', 'paused']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// Import schemas
export const importQuerySchema = z.object({
  playerId: z.string().uuid(),
});

export const listImportsQuerySchema = z.object({
  playerId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// Stats query schema
export const statsQuerySchema = z.object({
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  club: z.string().optional(),
});

// Types
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type ListGoalsQuery = z.infer<typeof listGoalsQuerySchema>;
export type ImportQuery = z.infer<typeof importQuerySchema>;
export type ListImportsQuery = z.infer<typeof listImportsQuerySchema>;
export type StatsQuery = z.infer<typeof statsQuerySchema>;
