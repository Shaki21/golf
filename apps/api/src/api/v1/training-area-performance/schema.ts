import { z } from 'zod';

/**
 * Training areas enum (16 areas from AK-formula)
 */
export const TRAINING_AREAS = [
  'TEE',
  'INN200',
  'INN150',
  'INN100',
  'INN50',
  'CHIP',
  'PITCH',
  'LOB',
  'BUNKER',
  'PUTT0-3',
  'PUTT3-8',
  'PUTT8-15',
  'PUTT15-25',
  'PUTT25-40',
  'PUTT40+',
  'SPILL',
] as const;

export type TrainingArea = typeof TRAINING_AREAS[number];

/**
 * Create training area performance schema
 */
export const createPerformanceSchema = z.object({
  trainingArea: z.enum(TRAINING_AREAS, {
    errorMap: () => ({ message: 'Invalid training area' }),
  }),
  performanceDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  sessionId: z.string().uuid().optional(),

  // Performance metrics
  successRate: z.number().min(0).max(100).optional(),
  accuracy: z.number().optional(),
  consistencyScore: z.number().int().min(1).max(10).optional(),
  repetitions: z.number().int().min(0).optional(),
  successfulReps: z.number().int().min(0).optional(),

  // Specific metrics
  distanceMeters: z.number().optional(),
  carryDistance: z.number().optional(),
  dispersion: z.number().optional(),
  averageDistanceFromTarget: z.number().optional(),
  madePutts: z.number().int().min(0).optional(),
  totalPutts: z.number().int().min(0).optional(),
  upAndDownSuccess: z.number().int().min(0).optional(),
  upAndDownAttempts: z.number().int().min(0).optional(),

  // Context
  learningPhase: z.enum(['L-KROPP', 'L-ARM', 'L-KØLLE', 'L-BALL', 'L-AUTO']).optional(),
  clubSpeed: z.string().regex(/^CS\d+$/).optional(),
  environment: z.string().regex(/^M[0-5]$/).optional(),
  pressure: z.string().regex(/^PR[1-5]$/).optional(),

  // Ratings
  feelRating: z.number().int().min(1).max(10).optional(),
  technicalRating: z.number().int().min(1).max(10).optional(),
  mentalRating: z.number().int().min(1).max(10).optional(),

  // Notes
  notes: z.string().optional(),
  keyLearning: z.string().optional(),
  nextFocus: z.string().optional(),
});

export type CreatePerformanceInput = z.infer<typeof createPerformanceSchema>;

/**
 * Update training area performance schema
 */
export const updatePerformanceSchema = createPerformanceSchema.partial();

export type UpdatePerformanceInput = z.infer<typeof updatePerformanceSchema>;

/**
 * List performance query schema
 */
export const listPerformanceQuerySchema = z.object({
  trainingArea: z.enum(TRAINING_AREAS).optional(),
  startDate: z.string().optional().refine((date) => !date || !isNaN(Date.parse(date)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().optional().refine((date) => !date || !isNaN(Date.parse(date)), {
    message: 'Invalid end date format',
  }),
  sessionId: z.string().uuid().optional(),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
  offset: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 0)),
});

export type ListPerformanceQuery = z.infer<typeof listPerformanceQuerySchema>;

/**
 * Performance ID parameter schema
 */
export const performanceIdParamSchema = z.object({
  id: z.string().uuid('Invalid performance ID'),
});

export type PerformanceIdParam = z.infer<typeof performanceIdParamSchema>;

/**
 * Progress statistics query schema
 */
export const progressStatsQuerySchema = z.object({
  trainingArea: z.enum(TRAINING_AREAS),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date format',
  }),
});

export type ProgressStatsQuery = z.infer<typeof progressStatsQuerySchema>;
