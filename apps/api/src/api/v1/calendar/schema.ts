import { z } from 'zod';

/**
 * Calendar events query schema
 */
export const calendarEventsQuerySchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format for startDate',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format for endDate',
  }),
  eventTypes: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : undefined)),
  coachId: z.string().uuid().optional(),
  playerId: z.string().uuid().optional(),
  status: z
    .enum(['scheduled', 'confirmed', 'completed', 'cancelled'])
    .optional(),
});

export type CalendarEventsQuery = z.infer<typeof calendarEventsQuerySchema>;

/**
 * Month view parameters schema
 */
export const monthViewParamsSchema = z.object({
  year: z
    .string()
    .refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 2020, {
      message: 'Invalid year',
    })
    .transform((val) => parseInt(val, 10)),
  month: z
    .string()
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 1 && num <= 12;
      },
      { message: 'Invalid month (1-12)' }
    )
    .transform((val) => parseInt(val, 10)),
});

export type MonthViewParams = z.infer<typeof monthViewParamsSchema>;

/**
 * Week view parameters schema
 */
export const weekViewParamsSchema = z.object({
  year: z
    .string()
    .refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 2020, {
      message: 'Invalid year',
    })
    .transform((val) => parseInt(val, 10)),
  week: z
    .string()
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 1 && num <= 53;
      },
      { message: 'Invalid week (1-53)' }
    )
    .transform((val) => parseInt(val, 10)),
});

export type WeekViewParams = z.infer<typeof weekViewParamsSchema>;

/**
 * Day view parameters schema
 */
export const dayViewParamsSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
});

export type DayViewParams = z.infer<typeof dayViewParamsSchema>;
