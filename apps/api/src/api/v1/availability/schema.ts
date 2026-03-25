import { z } from 'zod';

/**
 * Create availability slot schema
 */
export const createAvailabilitySchema = z.object({
  coachId: z.string().uuid('Invalid coach ID'),
  dayOfWeek: z
    .number()
    .int()
    .min(0, 'Day of week must be 0-6')
    .max(6, 'Day of week must be 0-6'),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format'),
  slotDuration: z.number().int().min(15).max(240).default(60),
  maxBookings: z.number().int().min(1).max(10).default(1),
  sessionType: z.string().max(50).optional(),
  validFrom: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format for validFrom',
  }),
  validUntil: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid date format for validUntil',
    }),
});

export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;

/**
 * Update availability slot schema
 */
export const updateAvailabilitySchema = createAvailabilitySchema.partial().omit({
  coachId: true,
});

export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;

/**
 * List availability query schema
 */
export const listAvailabilityQuerySchema = z.object({
  coachId: z.string().uuid().optional(),
  dayOfWeek: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  startDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid date format for startDate',
    }),
  endDate: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid date format for endDate',
    }),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
});

export type ListAvailabilityQuery = z.infer<typeof listAvailabilityQuerySchema>;

/**
 * Availability ID parameter schema
 */
export const availabilityIdParamSchema = z.object({
  id: z.string().uuid('Invalid availability ID'),
});

export type AvailabilityIdParam = z.infer<typeof availabilityIdParamSchema>;

/**
 * Get available slots query schema
 */
export const getAvailableSlotsQuerySchema = z.object({
  coachId: z.string().uuid('Coach ID is required'),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format for startDate',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format for endDate',
  }),
  sessionType: z.string().optional(),
});

export type GetAvailableSlotsQuery = z.infer<typeof getAvailableSlotsQuerySchema>;
