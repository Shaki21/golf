/**
 * Manual Stats Module - Zod Schemas
 *
 * Validation schemas for API requests and AI extraction output.
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const LieCategorySchema = z.enum([
  'TEE',
  'FAIRWAY',
  'ROUGH',
  'BUNKER',
  'RECOVERY',
  'GREEN',
  'PENALTY',
  'OTHER',
]);

export const ShotCategorySchema = z.enum([
  'TEE',
  'APPROACH',
  'SHORT_GAME',
  'PUTTING',
]);

export const DistanceTypeSchema = z.enum(['TOTAL', 'CARRY']);

export const ExtractionStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REQUIRES_REVIEW',
]);

export const RoundStatusSchema = z.enum([
  'DRAFT',
  'PENDING_EXTRACTION',
  'PENDING_REVIEW',
  'FINALIZED',
  'ARCHIVED',
]);

// ============================================================================
// AI EXTRACTION OUTPUT SCHEMA
// ============================================================================

export const ExtractionTeeShotSchema = z.object({
  club: z.string().max(20),
  distance_m: z.number().int().min(0).max(400),
  distance_type: DistanceTypeSchema.default('TOTAL'),
  confidence: z.number().min(0).max(1),
});

export const ExtractionApproachShotSchema = z.object({
  start_distance_m: z.number().int().min(0).max(300),
  lie: LieCategorySchema,
  club: z.string().max(20),
  end: z
    .object({
      distance_to_hole_m: z.number().int().min(0).max(100),
      lie: LieCategorySchema,
    })
    .optional(),
  confidence: z.number().min(0).max(1),
});

export const ExtractionShortGameShotSchema = z.object({
  start_distance_m: z.number().int().min(0).max(100),
  lie: LieCategorySchema,
  club: z.string().max(20).optional(),
  end_distance_m: z.number().int().min(0).max(50).optional(),
  confidence: z.number().min(0).max(1),
});

export const ExtractionPuttingDataSchema = z.object({
  first_putt_m: z.number().min(0).max(50),
  putts: z.number().int().min(0).max(10),
  confidence: z.number().min(0).max(1),
});

export const ExtractionHoleDataSchema = z.object({
  hole_number: z.number().int().min(1).max(18),
  hole_length_m: z.number().int().min(50).max(700).optional(),
  hole_par: z.number().int().min(3).max(6).optional(),
  hole_score: z.number().int().min(1).max(15).optional(),
  tee: ExtractionTeeShotSchema.optional(),
  approach: ExtractionApproachShotSchema.optional(),
  short_game: ExtractionShortGameShotSchema.optional(),
  putting: ExtractionPuttingDataSchema.optional(),
  notes: z.string().max(500).optional(),
  overall_confidence: z.number().min(0).max(1),
  requires_review: z.boolean(),
  review_fields: z.array(z.string()),
});

export const AIExtractionOutputSchema = z.object({
  round_date: z.string().optional(),
  course: z.string().max(255).optional(),
  holes: z.array(ExtractionHoleDataSchema),
  notes: z.string().max(1000).optional(),
  overall_confidence: z.number().min(0).max(1),
  extraction_timestamp: z.string(),
  model_version: z.string().max(50),
  prompt_version: z.string().max(50),
});

// ============================================================================
// API REQUEST SCHEMAS
// ============================================================================

export const CreateRoundRequestSchema = z.object({
  playerId: z.string().uuid(),
  roundDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  courseName: z.string().max(255).optional(),
  courseId: z.string().uuid().optional(),
  teeBox: z.string().max(50).optional(),
  totalPar: z.number().int().min(54).max(90).optional(),
  holesPlayed: z.number().int().min(1).max(18).optional().default(18),
});

export const ManualTeeShotSchema = z.object({
  club: z.string().max(20),
  distanceM: z.number().int().min(0).max(400),
  distanceType: DistanceTypeSchema.optional().default('TOTAL'),
});

export const ManualApproachShotSchema = z.object({
  startDistanceM: z.number().int().min(0).max(300),
  lie: LieCategorySchema,
  club: z.string().max(20).optional(),
  endDistanceM: z.number().int().min(0).max(100).optional(),
  endLie: LieCategorySchema.optional(),
});

export const ManualShortGameShotSchema = z.object({
  startDistanceM: z.number().int().min(0).max(100),
  lie: LieCategorySchema,
  club: z.string().max(20).optional(),
  endDistanceM: z.number().int().min(0).max(50).optional(),
});

export const ManualPuttingDataSchema = z.object({
  firstPuttM: z.number().min(0).max(50),
  puttsCount: z.number().int().min(0).max(10),
});

export const ManualHoleEntrySchema = z.object({
  holeNumber: z.number().int().min(1).max(18),
  holeLengthM: z.number().int().min(50).max(700).optional(),
  holePar: z.number().int().min(3).max(6).optional(),
  holeScore: z.number().int().min(1).max(15).optional(),
  tee: ManualTeeShotSchema.optional(),
  approach: ManualApproachShotSchema.optional(),
  shortGame: ManualShortGameShotSchema.optional(),
  putting: ManualPuttingDataSchema.optional(),
});

export const ManualHolesEntrySchema = z.object({
  holes: z.array(ManualHoleEntrySchema).min(1).max(18),
});

export const UserCorrectionRequestSchema = z.object({
  holeNumber: z.number().int().min(1).max(18),
  field: z.string().max(50),
  value: z.unknown(),
  reason: z.string().max(255).optional(),
});

export const BatchUserCorrectionsSchema = z.object({
  corrections: z.array(UserCorrectionRequestSchema).min(1).max(200),
});

export const FinalizeRoundRequestSchema = z.object({
  confirmPartialData: z.boolean().optional().default(false),
  baselineVersion: z.string().max(20).optional(),
});

// ============================================================================
// QUERY PARAMETER SCHEMAS
// ============================================================================

export const GetRoundsQuerySchema = z.object({
  playerId: z.string().uuid().optional(),
  status: RoundStatusSchema.optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const GetPlayerTrendsQuerySchema = z.object({
  period: z.enum(['30d', '90d', '180d', '1y', 'all']).optional().default('90d'),
  minCoverage: z.coerce.number().min(0).max(100).optional().default(50),
});

export const GetClubStatsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  clubs: z.string().optional(), // Comma-separated list
});

// ============================================================================
// IMAGE UPLOAD SCHEMAS
// ============================================================================

export const InitiateUploadRequestSchema = z.object({
  roundId: z.string().uuid(),
  fileName: z.string().max(255),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/heic', 'image/heif']),
  fileSizeBytes: z.number().int().min(1).max(50 * 1024 * 1024), // Max 50MB
  holesOnImage: z.array(z.number().int().min(1).max(18)).optional(),
});

export const CompleteUploadRequestSchema = z.object({
  imageId: z.string().uuid(),
  startExtraction: z.boolean().optional().default(true),
});

// ============================================================================
// SG BASELINE SCHEMA
// ============================================================================

export const SGBaselineEntrySchema = z.object({
  lieCategory: LieCategorySchema,
  distanceBucketMin: z.number().int().min(0),
  distanceBucketMax: z.number().int().min(1),
  expectedStrokes: z.number().min(0).max(10),
  sampleSize: z.number().int().optional(),
  source: z.string().max(100).optional(),
});

export const SGBaselineImportSchema = z.object({
  version: z.string().max(20),
  description: z.string().max(255).optional(),
  entries: z.array(SGBaselineEntrySchema).min(1),
  setActive: z.boolean().optional().default(false),
});

// ============================================================================
// EXPORT TYPE INFERENCE
// ============================================================================

export type CreateRoundRequest = z.infer<typeof CreateRoundRequestSchema>;
export type ManualHoleEntry = z.infer<typeof ManualHoleEntrySchema>;
export type ManualHolesEntry = z.infer<typeof ManualHolesEntrySchema>;
export type UserCorrectionRequest = z.infer<typeof UserCorrectionRequestSchema>;
export type BatchUserCorrections = z.infer<typeof BatchUserCorrectionsSchema>;
export type FinalizeRoundRequest = z.infer<typeof FinalizeRoundRequestSchema>;
export type AIExtractionOutput = z.infer<typeof AIExtractionOutputSchema>;
export type ExtractionHoleData = z.infer<typeof ExtractionHoleDataSchema>;
export type InitiateUploadRequest = z.infer<typeof InitiateUploadRequestSchema>;
export type CompleteUploadRequest = z.infer<typeof CompleteUploadRequestSchema>;
export type SGBaselineImport = z.infer<typeof SGBaselineImportSchema>;
