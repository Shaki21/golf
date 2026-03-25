/**
 * ================================================================
 * Date & Time Utility Functions
 * ================================================================
 *
 * Reusable date/time helper functions used across the application.
 * All functions are pure and side-effect free.
 */

/**
 * Calculate ISO week number for a given date
 *
 * @param date - The date to calculate week number for
 * @returns ISO week number (1-53)
 *
 * @remarks
 * Uses ISO 8601 week date system:
 * - Week 1 is the week with the first Thursday of the year
 * - Week starts on Monday
 * - Can result in week 53 for some years
 *
 * @example
 * ```typescript
 * getWeekNumber(new Date('2025-01-01')); // Returns 1
 * getWeekNumber(new Date('2025-12-29')); // Returns 1 (of next year)
 * ```
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Sunday = 7, Monday = 1
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Move to Thursday of the week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get the start of the week (Monday 00:00:00) for a given date
 *
 * @param date - The date to find week start for
 * @returns Date object set to Monday 00:00:00 of the week
 *
 * @example
 * ```typescript
 * getWeekStart(new Date('2025-12-25')); // Returns Monday of that week at 00:00
 * ```
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Calculate difference to Monday (day 1)
  // If Sunday (day 0), go back 6 days
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the week (Sunday 23:59:59) for a given date
 *
 * @param date - The date to find week end for
 * @returns Date object set to Sunday 23:59:59 of the week
 *
 * @example
 * ```typescript
 * getWeekEnd(new Date('2025-12-25')); // Returns Sunday of that week at 23:59:59
 * ```
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Format deadline date as "Mmm YYYY" (e.g., "Jan 2025")
 *
 * @param date - The deadline date to format
 * @returns Formatted date string in Norwegian
 *
 * @example
 * ```typescript
 * formatDeadline(new Date('2025-06-15')); // Returns "Jun 2025"
 * ```
 */
export function formatDeadline(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format message time relative to now
 *
 * @param date - The message timestamp
 * @returns Formatted time string:
 *   - "HH:MM" if within last 24 hours
 *   - "I går" if yesterday
 *   - "DD Mmm" if older than yesterday
 *
 * @example
 * ```typescript
 * // If now is 2025-12-25 14:00
 * formatMessageTime(new Date('2025-12-25 10:30')); // Returns "10:30"
 * formatMessageTime(new Date('2025-12-24 10:30')); // Returns "I går"
 * formatMessageTime(new Date('2025-12-23 10:30')); // Returns "23 Des"
 * ```
 */
export function formatMessageTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = diff / (1000 * 60 * 60);

  if (hours < 24) {
    return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
  } else if (hours < 48) {
    return 'I går';
  } else {
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  }
}

/**
 * Calculate days between two dates
 *
 * @param from - Start date
 * @param to - End date
 * @returns Number of days between dates (can be negative if from > to)
 *
 * @example
 * ```typescript
 * daysBetween(new Date('2025-01-01'), new Date('2025-01-15')); // Returns 14
 * ```
 */
export function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

/**
 * Check if a date is today
 *
 * @param date - Date to check
 * @returns True if the date is today
 *
 * @example
 * ```typescript
 * isToday(new Date()); // Returns true
 * isToday(new Date('2024-01-01')); // Returns false (unless today is that date)
 * ```
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 *
 * @param date - Date to check
 * @returns True if the date is before now
 *
 * @example
 * ```typescript
 * isPast(new Date('2024-01-01')); // Returns true
 * isPast(new Date('2026-01-01')); // Returns false
 * ```
 */
export function isPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Add days to a date
 *
 * @param date - Starting date
 * @param days - Number of days to add (can be negative to subtract)
 * @returns New date with days added
 *
 * @example
 * ```typescript
 * addDays(new Date('2025-01-01'), 7); // Returns 2025-01-08
 * addDays(new Date('2025-01-15'), -5); // Returns 2025-01-10
 * ```
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format duration in minutes to human-readable string
 *
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "1t 30min", "45min")
 *
 * @example
 * ```typescript
 * formatDuration(90); // Returns "1t 30min"
 * formatDuration(45); // Returns "45min"
 * formatDuration(120); // Returns "2t"
 * ```
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}t ${mins}min` : `${hours}t`;
}
