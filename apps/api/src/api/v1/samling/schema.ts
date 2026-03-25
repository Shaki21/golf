import { z } from 'zod';

// ============================================================================
// SAMLING SCHEMAS
// ============================================================================

/**
 * Create samling request schema
 */
export const createSamlingSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  venue: z.string().max(255).optional(),
  golfCourseId: z.string().uuid().optional().nullable(),
  address: z.string().optional(),
  locationDetails: z.record(z.any()).optional(),
  accommodation: z.string().optional(),
  meetingPoint: z.string().optional(),
  transportInfo: z.string().optional(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  notes: z.string().optional(),
});

export type CreateSamlingInput = z.infer<typeof createSamlingSchema>;

/**
 * Update samling request schema
 */
export const updateSamlingSchema = createSamlingSchema.partial();

export type UpdateSamlingInput = z.infer<typeof updateSamlingSchema>;

/**
 * List samlinger query schema
 */
export const listSamlingerQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  status: z.enum(['draft', 'published', 'in_progress', 'completed', 'cancelled']).optional(),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
});

export type ListSamlingerQuery = z.infer<typeof listSamlingerQuerySchema>;

/**
 * Samling ID parameter schema
 */
export const samlingIdParamSchema = z.object({
  id: z.string().uuid('Invalid samling ID'),
});

export type SamlingIdParam = z.infer<typeof samlingIdParamSchema>;

// ============================================================================
// PARTICIPANT SCHEMAS
// ============================================================================

/**
 * Add participants request schema
 */
export const addParticipantsSchema = z.object({
  type: z.enum(['group', 'individual']),
  groupIds: z.array(z.string().uuid()).optional(),
  playerIds: z.array(z.string().uuid()).optional(),
  message: z.string().optional(),
}).refine(
  (data) => (data.type === 'group' && data.groupIds?.length) ||
            (data.type === 'individual' && data.playerIds?.length),
  { message: 'Must provide groupIds for group type or playerIds for individual type' }
);

export type AddParticipantsInput = z.infer<typeof addParticipantsSchema>;

/**
 * Update participant status schema
 */
export const updateParticipantStatusSchema = z.object({
  status: z.enum(['confirmed', 'declined', 'tentative']),
  declineReason: z.string().optional(),
});

export type UpdateParticipantStatusInput = z.infer<typeof updateParticipantStatusSchema>;

/**
 * Player ID parameter schema
 */
export const playerIdParamSchema = z.object({
  playerId: z.string().uuid('Invalid player ID'),
});

export type PlayerIdParam = z.infer<typeof playerIdParamSchema>;

// ============================================================================
// SESSION SCHEMAS
// ============================================================================

/**
 * Exercise in session schema
 */
export const sessionExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional(),
  duration: z.number().optional(),
  description: z.string().optional(),
  order: z.number(),
});

/**
 * Create session request schema
 */
export const createSessionSchema = z.object({
  sessionDate: z.coerce.date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
  duration: z.number().int().positive(),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  sessionType: z.string().max(50),
  location: z.string().max(255).optional(),
  exercises: z.array(sessionExerciseSchema).optional().default([]),
  objectives: z.array(z.string()).optional().default([]),
  equipment: z.array(z.string()).optional().default([]),
  period: z.string().length(1).optional(),
  learningPhase: z.string().max(10).optional(),
  intensity: z.number().int().min(1).max(10).optional(),
  sessionTemplateId: z.string().uuid().optional().nullable(),
  orderInDay: z.number().int().optional().default(0),
  notes: z.string().optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

/**
 * Update session request schema
 */
export const updateSessionSchema = createSessionSchema.partial();

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

/**
 * Session ID parameter schema
 */
export const sessionIdParamSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

export type SessionIdParam = z.infer<typeof sessionIdParamSchema>;

// ============================================================================
// ATTENDANCE SCHEMAS
// ============================================================================

/**
 * Record attendance schema
 */
export const recordAttendanceSchema = z.object({
  attendance: z.array(z.object({
    participantId: z.string().uuid(),
    attended: z.boolean(),
    performance: z.record(z.any()).optional(),
    coachNotes: z.string().optional(),
  })),
});

export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;
