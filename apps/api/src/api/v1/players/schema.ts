import { z } from 'zod';

/**
 * Create player request schema
 */
export const createPlayerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Gender must be male, female, or other' }),
  }),
  category: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'], {
    errorMap: () => ({ message: 'Category must be A-K' }),
  }),
  averageScore: z.number().min(0).max(200).optional(),
  handicap: z.number().min(-10).max(54).optional(),
  wagrRank: z.number().int().min(1).optional(),
  club: z.string().max(200).optional(),
  coachId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  currentPeriod: z.enum(['E', 'G', 'S', 'T']).default('G'),
  weeklyTrainingHours: z.number().int().min(0).max(168).default(10),
  seasonStartDate: z.string().optional().refine(
    (date) => !date || !isNaN(Date.parse(date)),
    { message: 'Invalid date format' }
  ),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  profileImageUrl: z.string().url().max(500).optional(),
  emergencyContact: z
    .object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string(),
      email: z.string().email().optional(),
    })
    .optional(),
  medicalNotes: z.string().optional(),
  goals: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    targetDate: z.string().optional(),
    completed: z.boolean().default(false),
  })).default([]),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;

/**
 * Update player request schema
 */
export const updatePlayerSchema = createPlayerSchema.partial();

export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;

/**
 * List players query schema
 */
export const listPlayersQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  search: z.string().optional(),
  category: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  coachId: z.string().uuid().optional(),
  currentPeriod: z.enum(['E', 'G', 'S', 'T']).optional(),
  sortBy: z.enum(['firstName', 'lastName', 'category', 'handicap', 'createdAt']).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ListPlayersQuery = z.infer<typeof listPlayersQuerySchema>;

/**
 * Player ID parameter schema
 */
export const playerIdParamSchema = z.object({
  id: z.string().uuid('Invalid player ID'),
});

export type PlayerIdParam = z.infer<typeof playerIdParamSchema>;

/**
 * Weekly summary query schema
 */
export const weeklySummaryQuerySchema = z.object({
  weekStart: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format for weekStart',
  }).optional(),
});

export type WeeklySummaryQuery = z.infer<typeof weeklySummaryQuerySchema>;

/**
 * Player onboarding schema - for new player registration
 */
export const playerOnboardingSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Gender must be male, female, or other' }),
  }),
  phone: z.string().min(1, 'Phone number is required').max(20),
  handicap: z.number().min(-10).max(54).nullable(),
  category: z.enum(['A', 'B', 'C', 'D', '']).default('D'),
  club: z.string().max(200).optional(),
  goals: z.array(z.string()).default([]),
  coachId: z.string().uuid().nullable(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
});

export type PlayerOnboardingInput = z.infer<typeof playerOnboardingSchema>;
