import { z } from 'zod';

/**
 * Working hours schema for coaches
 */
const workingHoursSchema = z.object({
  monday: z.object({ start: z.string(), end: z.string() }).optional(),
  tuesday: z.object({ start: z.string(), end: z.string() }).optional(),
  wednesday: z.object({ start: z.string(), end: z.string() }).optional(),
  thursday: z.object({ start: z.string(), end: z.string() }).optional(),
  friday: z.object({ start: z.string(), end: z.string() }).optional(),
  saturday: z.object({ start: z.string(), end: z.string() }).optional(),
  sunday: z.object({ start: z.string(), end: z.string() }).optional(),
});

/**
 * Create coach request schema
 */
export const createCoachSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  phone: z.string().max(20).optional(),
  specializations: z.array(z.string()).default([]),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().optional(),
    issuedDate: z.string().optional(),
    expiryDate: z.string().optional(),
  })).default([]),
  workingHours: workingHoursSchema.default({}),
  maxPlayersPerSession: z.number().int().min(1).max(20).default(4),
  hourlyRate: z.number().min(0).max(10000).optional(),
  role: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color').default('#1E4B33'),
  status: z.enum(['active', 'inactive', 'on_leave']).default('active'),
  profileImageUrl: z.string().url().max(500).optional(),
});

export type CreateCoachInput = z.infer<typeof createCoachSchema>;

/**
 * Update coach request schema
 */
export const updateCoachSchema = createCoachSchema.partial();

export type UpdateCoachInput = z.infer<typeof updateCoachSchema>;

/**
 * List coaches query schema
 */
export const listCoachesQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']).optional(),
  specialization: z.string().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt']).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ListCoachesQuery = z.infer<typeof listCoachesQuerySchema>;

/**
 * Coach ID parameter schema
 */
export const coachIdParamSchema = z.object({
  id: z.string().uuid('Invalid coach ID'),
});

export type CoachIdParam = z.infer<typeof coachIdParamSchema>;

/**
 * Availability query schema
 */
export const availabilityQuerySchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date format',
  }),
});

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
