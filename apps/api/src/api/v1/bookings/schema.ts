import { z } from 'zod';

/**
 * Create booking schema
 */
export const createBookingSchema = z.object({
  playerId: z.string().uuid('Invalid player ID'),
  coachId: z.string().uuid('Invalid coach ID'),
  availabilityId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(), // For booking existing events
  startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format for startTime',
  }),
  endTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format for endTime',
  }),
  sessionType: z.string().max(50),
  title: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  notes: z.string().optional(),
  paymentAmount: z.number().min(0).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/**
 * Update booking schema
 */
export const updateBookingSchema = z.object({
  startTime: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid date format for startTime',
    }),
  endTime: z
    .string()
    .optional()
    .refine((date) => !date || !isNaN(Date.parse(date)), {
      message: 'Invalid date format for endTime',
    }),
  location: z.string().max(255).optional(),
  notes: z.string().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'waived']).optional(),
  paymentAmount: z.number().min(0).optional(),
});

export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

/**
 * Cancel booking schema
 */
export const cancelBookingSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

/**
 * Check conflicts schema
 */
export const checkConflictsSchema = z.object({
  coachId: z.string().uuid('Invalid coach ID'),
  playerId: z.string().uuid('Invalid player ID'),
  startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format for startTime',
  }),
  endTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format for endTime',
  }),
  excludeBookingId: z.string().uuid().optional(), // For update scenarios
});

export type CheckConflictsInput = z.infer<typeof checkConflictsSchema>;

/**
 * List bookings query schema
 */
export const listBookingsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  playerId: z.string().uuid().optional(),
  coachId: z.string().uuid().optional(),
  status: z
    .enum(['pending', 'confirmed', 'completed', 'cancelled'])
    .optional(),
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
  sessionType: z.string().optional(),
  sortBy: z
    .enum(['bookedAt', 'startTime', 'status'])
    .default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;

/**
 * Booking ID parameter schema
 */
export const bookingIdParamSchema = z.object({
  id: z.string().uuid('Invalid booking ID'),
});

export type BookingIdParam = z.infer<typeof bookingIdParamSchema>;
