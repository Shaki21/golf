import { z } from 'zod';

// ============================================================================
// SESSION SCHEMAS
// ============================================================================

/**
 * Create training session schema
 */
// AK Golf Kategori Hierarki v2.0 enum values
const environmentValues = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'] as const;
const pressureValues = ['PR1', 'PR2', 'PR3', 'PR4', 'PR5'] as const;
const positionValues = ['P1.0', 'P2.0', 'P3.0', 'P4.0', 'P5.0', 'P6.0', 'P7.0', 'P8.0', 'P9.0', 'P10.0'] as const;
const puttingFocusValues = ['GREEN', 'SIKTE', 'TEKN', 'BALL', 'SPEED'] as const;
// L-faser med norske navn for API-kompatibilitet
const learningPhaseValues = ['L-KROPP', 'L-ARM', 'L-KØLLE', 'L-BALL', 'L-AUTO', 'L1', 'L2', 'L3', 'L4', 'L5'] as const;

export const createSessionSchema = z.object({
  sessionType: z.string().min(1).max(50),
  sessionDate: z.string().datetime(),
  duration: z.number().int().min(1),
  learningPhase: z.enum(learningPhaseValues).optional(),
  clubSpeed: z.string().max(10).optional(),
  setting: z.string().max(10).optional(),
  surface: z.string().max(50).optional(),
  focusArea: z.string().max(100).optional(),
  drillIds: z.array(z.string().uuid()).optional(),
  period: z.enum(['E', 'G', 'S', 'T']).optional(),
  intensity: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
  dailyAssignmentId: z.string().uuid().optional(),

  // AK Golf Kategori Hierarki v2.0 felter
  akFormula: z.string().max(500).optional(), // Komplett formel f.eks. TEK_TEE_L-BALL_CS50_M2_PR2_P6.0-P7.0
  environment: z.enum(environmentValues).optional(), // M0-M5 (Miljø)
  pressure: z.enum(pressureValues).optional(), // PR1-PR5 (Psykologisk belastning)
  positionStart: z.enum(positionValues).optional(), // P1.0-P10.0 (Svingposisjon start)
  positionEnd: z.enum(positionValues).optional(), // P1.0-P10.0 (Svingposisjon slutt)
  puttingFocus: z.enum(puttingFocusValues).optional(), // GREEN, SIKTE, TEKN, BALL, SPEED
  puttingPhases: z.string().max(10).optional(), // S, B, I, F eller kombinasjoner (S-F, B-I, etc)
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

/**
 * Update session schema
 */
export const updateSessionSchema = createSessionSchema.partial();

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

// ============================================================================
// EVALUATION SCHEMAS
// ============================================================================

/**
 * Session evaluation schema
 */
export const sessionEvaluationSchema = z.object({
  // Ratings (1-10)
  evaluationFocus: z.number().int().min(1).max(10).optional(),
  evaluationTechnical: z.number().int().min(1).max(10).optional(),
  evaluationEnergy: z.number().int().min(1).max(10).optional(),
  evaluationMental: z.number().int().min(1).max(10).optional(),

  // Pre-shot routine
  preShotConsistency: z.enum(['yes', 'partial', 'no']).optional(),
  preShotCount: z.number().int().min(0).optional(),
  totalShots: z.number().int().min(0).optional(),

  // Technical cues
  technicalCues: z.array(z.string().max(100)).optional(),
  customCue: z.string().max(255).optional(),

  // Notes
  whatWentWell: z.string().optional(),
  nextSessionFocus: z.string().optional(),
  mediaUrls: z.array(z.string().url().max(500)).optional(),

  // General notes (existing field)
  notes: z.string().optional(),
});

export type SessionEvaluationInput = z.infer<typeof sessionEvaluationSchema>;

/**
 * Complete session schema (includes evaluation)
 */
export const completeSessionSchema = sessionEvaluationSchema.extend({
  completionStatus: z.enum(['completed', 'abandoned']).default('completed'),
});

export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;

/**
 * Auto-complete session schema
 */
export const autoCompleteSessionSchema = z.object({
  reason: z.string().optional(),
});

export type AutoCompleteSessionInput = z.infer<typeof autoCompleteSessionSchema>;

// ============================================================================
// QUERY & PARAM SCHEMAS
// ============================================================================

/**
 * Session ID parameter schema
 */
export const sessionIdParamSchema = z.object({
  id: z.string().uuid('Invalid session ID'),
});

export type SessionIdParam = z.infer<typeof sessionIdParamSchema>;

/**
 * List sessions query schema
 */
export const listSessionsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  playerId: z.string().uuid().optional(),
  sessionType: z.string().optional(),
  period: z.enum(['E', 'G', 'S', 'T']).optional(),
  learningPhase: z.enum(learningPhaseValues).optional(),
  completionStatus: z.enum(['in_progress', 'completed', 'auto_completed', 'abandoned']).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  sortBy: z.enum(['sessionDate', 'createdAt', 'duration']).default('sessionDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  // AK Golf Kategori Hierarki v2.0 filter felter
  environment: z.enum(environmentValues).optional(),
  pressure: z.enum(pressureValues).optional(),
});

export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;

/**
 * Player sessions query schema (for player's own sessions)
 */
export const playerSessionsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  sessionType: z.string().optional(),
  period: z.enum(['E', 'G', 'S', 'T']).optional(),
  completionStatus: z.enum(['in_progress', 'completed', 'auto_completed', 'abandoned']).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type PlayerSessionsQuery = z.infer<typeof playerSessionsQuerySchema>;

// ============================================================================
// TECHNICAL CUES (predefined options)
// ============================================================================

export const PREDEFINED_TECHNICAL_CUES = [
  'Myke hender',
  'Tempo 3-1',
  'Se ballen',
  'Finish høy',
  'Vekt fremover',
  'Rolig takeaway',
  'Full rotasjon',
  'Stabil underkropp',
  'Avslappet grep',
  'Pust ut ved impact',
] as const;

export type PredefinedTechnicalCue = typeof PREDEFINED_TECHNICAL_CUES[number];

// ============================================================================
// AK GOLF KATEGORI HIERARKI v2.0 - Eksporter for frontend
// ============================================================================

export const ENVIRONMENT_VALUES = environmentValues;
export const PRESSURE_VALUES = pressureValues;
export const POSITION_VALUES = positionValues;
export const PUTTING_FOCUS_VALUES = puttingFocusValues;
export const LEARNING_PHASE_VALUES = learningPhaseValues;

export type Environment = typeof environmentValues[number];
export type Pressure = typeof pressureValues[number];
export type Position = typeof positionValues[number];
export type PuttingFocus = typeof puttingFocusValues[number];
export type LearningPhase = typeof learningPhaseValues[number];
