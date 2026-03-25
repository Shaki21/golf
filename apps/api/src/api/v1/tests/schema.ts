import { z } from 'zod';

/**
 * Create test definition schema
 */
export const createTestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  testNumber: z.number().int().min(1).max(20),
  category: z.string().min(1, 'Category is required').max(50),
  testType: z.string().min(1, 'Test type is required').max(50),
  protocolName: z.string().min(1, 'Protocol name is required').max(255),
  protocolVersion: z.string().max(10).default('1.0'),
  description: z.string().min(1, 'Description is required'),
  targetCategory: z.string().max(2).optional(),
  testDetails: z.object({
    equipment: z.array(z.string()).optional(),
    setup: z.string().optional(),
    instructions: z.string().optional(),
    scoringCriteria: z.string().optional(),
    warmupRequired: z.boolean().optional(),
    duration: z.number().optional(),
    repetitions: z.number().optional(),
  }),
  benchmarkWeek: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type CreateTestInput = z.infer<typeof createTestSchema>;

/**
 * Update test definition schema
 */
export const updateTestSchema = createTestSchema.partial();

export type UpdateTestInput = z.infer<typeof updateTestSchema>;

/**
 * Record test result schema
 */
export const recordTestResultSchema = z.object({
  testId: z.string().uuid('Invalid test ID'),
  playerId: z.string().uuid('Invalid player ID'),
  testDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid test date format',
  }),
  location: z.string().max(255).optional(),
  weather: z.string().max(255).optional(),
  equipment: z.string().max(255).optional(),
  results: z.record(z.any()),
  value: z.number().optional(), // Main test value (can be derived from results if not provided)
  pei: z.number().min(0).max(10).optional(),
  categoryBenchmark: z.boolean().default(false),
  improvementFromLast: z.number().optional(),
  videoUrl: z.string().url().max(500).optional(),
  trackerData: z.record(z.any()).optional(),
  coachFeedback: z.string().optional(),
  playerFeedback: z.string().optional(),
});

export type RecordTestResultInput = z.infer<typeof recordTestResultSchema>;

/**
 * Update test result schema
 */
export const updateTestResultSchema = recordTestResultSchema.partial().omit({ testId: true, playerId: true });

export type UpdateTestResultInput = z.infer<typeof updateTestResultSchema>;

/**
 * List tests query schema
 */
export const listTestsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
  search: z.string().optional(),
  category: z.string().optional(),
  testType: z.string().optional(),
  targetCategory: z.string().optional(),
  benchmarkWeek: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  isActive: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  sortBy: z.enum(['name', 'testNumber', 'category', 'createdAt']).default('testNumber'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ListTestsQuery = z.infer<typeof listTestsQuerySchema>;

/**
 * List test results query schema
 */
export const listTestResultsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  playerId: z.string().uuid().optional(),
  testId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryBenchmark: z.string().optional().transform((val) => val === 'true' ? true : val === 'false' ? false : undefined),
  sortBy: z.enum(['testDate', 'pei', 'createdAt']).default('testDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ListTestResultsQuery = z.infer<typeof listTestResultsQuerySchema>;

/**
 * Test ID parameter schema
 */
export const testIdParamSchema = z.object({
  id: z.string().uuid('Invalid test ID'),
});

export type TestIdParam = z.infer<typeof testIdParamSchema>;

/**
 * Test result ID parameter schema
 */
export const testResultIdParamSchema = z.object({
  id: z.string().uuid('Invalid test result ID'),
});

export type TestResultIdParam = z.infer<typeof testResultIdParamSchema>;

/**
 * Player progress query schema
 */
export const playerProgressQuerySchema = z.object({
  playerId: z.string().uuid('Invalid player ID'),
  testId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type PlayerProgressQuery = z.infer<typeof playerProgressQuerySchema>;
