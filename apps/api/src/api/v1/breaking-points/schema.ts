import { z } from 'zod';

/**
 * Create breaking point schema
 */
export const createBreakingPointSchema = z.object({
  playerId: z.string().uuid('Invalid player ID'),
  processCategory: z.string().min(1, 'Process category is required').max(20),
  specificArea: z.string().min(1, 'Specific area is required').max(100),
  description: z.string().min(1, 'Description is required'),
  identifiedDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  baselineMeasurement: z.string().max(100).optional(),
  targetMeasurement: z.string().max(100).optional(),
  currentMeasurement: z.string().max(100).optional(),
  progressPercent: z.number().int().min(0).max(100).default(0),
  assignedExerciseIds: z.array(z.string().uuid()).default([]),
  hoursPerWeek: z.number().int().min(0).max(168).optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'on_hold']).default('not_started'),
  successHistory: z.array(z.object({
    date: z.string(),
    measurement: z.string(),
    notes: z.string().optional(),
  })).default([]),
  resolvedDate: z.string().optional().refine(
    (date) => !date || !isNaN(Date.parse(date)),
    { message: 'Invalid date format' }
  ),
  notes: z.string().optional(),
});

export type CreateBreakingPointInput = z.infer<typeof createBreakingPointSchema>;

/**
 * Update breaking point schema
 */
export const updateBreakingPointSchema = createBreakingPointSchema.partial().omit({ playerId: true });

export type UpdateBreakingPointInput = z.infer<typeof updateBreakingPointSchema>;

/**
 * Update progress schema (simplified for quick updates)
 */
export const updateProgressSchema = z.object({
  currentMeasurement: z.string().max(100),
  progressPercent: z.number().int().min(0).max(100),
  status: z.enum(['not_started', 'in_progress', 'completed', 'on_hold']).optional(),
  notes: z.string().optional(),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

/**
 * List breaking points query schema
 */
export const listBreakingPointsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
  playerId: z.string().uuid().optional(),
  processCategory: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'on_hold']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['identifiedDate', 'severity', 'progressPercent', 'createdAt']).default('identifiedDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListBreakingPointsQuery = z.infer<typeof listBreakingPointsQuerySchema>;

/**
 * Breaking point ID parameter schema
 */
export const breakingPointIdParamSchema = z.object({
  id: z.string().uuid('Invalid breaking point ID'),
});

export type BreakingPointIdParam = z.infer<typeof breakingPointIdParamSchema>;

// ============================================================================
// BP-EVIDENCE SCHEMAS (V2)
// ============================================================================

/**
 * Record training effort - increases effortPercent based on completed sessions
 */
export const recordEffortSchema = z.object({
  // No body required - effort is calculated from completed sessions
});

export type RecordEffortInput = z.infer<typeof recordEffortSchema>;

/**
 * Evaluate benchmark test result - the ONLY way to increase progressPercent
 */
export const evaluateBenchmarkSchema = z.object({
  testValue: z.number().describe('The measured value from the benchmark test'),
  testDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }).optional().default(() => new Date().toISOString()),
  metricId: z.string().optional().describe('Override the proof metric ID'),
  successRule: z.string().optional().describe('Override the success rule (e.g., "DRIVER_DISTANCE:>=:230")'),
});

export type EvaluateBenchmarkInput = z.infer<typeof evaluateBenchmarkSchema>;

/**
 * Get BP evidence status - detailed status with effort/progress separation
 */
export const getEvidenceStatusSchema = z.object({
  // No params needed beyond the BP ID
});

export type GetEvidenceStatusInput = z.infer<typeof getEvidenceStatusSchema>;

/**
 * Configure BP evidence tracking
 */
export const configureEvidenceSchema = z.object({
  testDomainCode: z.enum(['TEE', 'INN200', 'INN150', 'INN100', 'INN50', 'ARG', 'PUTT', 'PHYS']).optional(),
  proofMetricId: z.string().optional(),
  successRule: z.string().optional(),
  benchmarkTestId: z.number().int().optional(),
  benchmarkWindowDays: z.number().int().min(7).max(90).optional(),
});

export type ConfigureEvidenceInput = z.infer<typeof configureEvidenceSchema>;
