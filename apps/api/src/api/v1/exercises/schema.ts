import { z } from 'zod';

/**
 * Create exercise request schema
 */
export const createExerciseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().min(1, 'Description is required'),
  purpose: z.string().optional(),
  exerciseType: z.string().min(1, 'Exercise type is required').max(50),
  learningPhases: z.array(z.string()).default([]),
  settings: z.array(z.string()).default([]),
  clubSpeedLevels: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  periods: z.array(z.enum(['E', 'G', 'S', 'T'])).default([]),
  repsOrTime: z.string().max(100).optional(),
  equipment: z.array(z.string()).optional(),
  location: z.enum(['indoor', 'outdoor', 'both']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'elite']).optional(),
  progressionSteps: z.string().optional(),
  regressionSteps: z.string().optional(),
  successCriteria: z.string().optional(),
  commonMistakes: z.string().optional(),
  coachingCues: z.string().optional(),
  addressesBreakingPoints: z.array(z.string()).default([]),
  processCategory: z.string().min(1, 'Process category is required').max(20),
  videoUrl: z.string().url().max(500).optional(),
  imageUrl: z.string().url().max(500).optional(),
  source: z.string().max(255).optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;

/**
 * Update exercise request schema
 */
export const updateExerciseSchema = createExerciseSchema.partial();

export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;

/**
 * List exercises query schema
 */
export const listExercisesQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
  search: z.string().optional(),
  exerciseType: z.string().optional(),
  category: z.string().optional(),
  period: z.enum(['E', 'G', 'S', 'T']).optional(),
  learningPhase: z.string().optional(),
  clubSpeedLevel: z.string().optional(),
  setting: z.string().optional(),
  processCategory: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'elite']).optional(),
  location: z.enum(['indoor', 'outdoor', 'both']).optional(),
  breakingPoint: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'exerciseType', 'difficulty', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ListExercisesQuery = z.infer<typeof listExercisesQuerySchema>;

/**
 * Exercise ID parameter schema
 */
export const exerciseIdParamSchema = z.object({
  id: z.string().uuid('Invalid exercise ID'),
});

export type ExerciseIdParam = z.infer<typeof exerciseIdParamSchema>;
