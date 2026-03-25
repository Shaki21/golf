/**
 * Date Range Calculator Utility
 * Provides consistent date boundary calculations across the gamification domain
 */

export interface DateBoundaries {
  start: Date;
  end: Date;
}

export class DateRangeCalculator {
  /**
   * Get start of the current week (Monday 00:00:00)
   */
  static getStartOfWeek(date: Date = new Date()): Date {
    const result = new Date(date);
    const day = result.getDay();
    // Adjust to Monday (day 1), handling Sunday (day 0) as end of week
    const diff = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of the current week (Sunday 23:59:59)
   */
  static getEndOfWeek(date: Date = new Date()): Date {
    const startOfWeek = this.getStartOfWeek(date);
    const result = new Date(startOfWeek);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get start of the current month (1st day 00:00:00)
   */
  static getStartOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  }

  /**
   * Get end of the current month (last day 23:59:59)
   */
  static getEndOfMonth(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  /**
   * Get start of the current year (Jan 1 00:00:00)
   */
  static getStartOfYear(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
  }

  /**
   * Get end of the current year (Dec 31 23:59:59)
   */
  static getEndOfYear(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  }

  /**
   * Get start date of a specific week number in a year (Monday 00:00:00)
   */
  static getWeekStartDate(year: number, weekNumber: number): Date {
    // Get first day of the year
    const jan1 = new Date(year, 0, 1);
    // Get day of week (0=Sun, 1=Mon, ...)
    const jan1Day = jan1.getDay();
    // Calculate first Monday of the year
    const daysToFirstMonday = jan1Day === 0 ? 1 : (jan1Day === 1 ? 0 : 8 - jan1Day);
    const firstMonday = new Date(year, 0, 1 + daysToFirstMonday);
    // Calculate the Monday of the requested week
    const result = new Date(firstMonday);
    result.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end date of a specific week number in a year (Sunday 23:59:59)
   */
  static getWeekEndDate(year: number, weekNumber: number): Date {
    const weekStart = this.getWeekStartDate(year, weekNumber);
    const result = new Date(weekStart);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get start of a specific day (00:00:00)
   */
  static getStartOfDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of a specific day (23:59:59)
   */
  static getEndOfDay(date: Date = new Date()): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get week boundaries
   */
  static getWeekBoundaries(date: Date = new Date()): DateBoundaries {
    return {
      start: this.getStartOfWeek(date),
      end: this.getEndOfWeek(date),
    };
  }

  /**
   * Get month boundaries
   */
  static getMonthBoundaries(date: Date = new Date()): DateBoundaries {
    return {
      start: this.getStartOfMonth(date),
      end: this.getEndOfMonth(date),
    };
  }

  /**
   * Get year boundaries
   */
  static getYearBoundaries(date: Date = new Date()): DateBoundaries {
    return {
      start: this.getStartOfYear(date),
      end: this.getEndOfYear(date),
    };
  }

  /**
   * Get day boundaries
   */
  static getDayBoundaries(date: Date = new Date()): DateBoundaries {
    return {
      start: this.getStartOfDay(date),
      end: this.getEndOfDay(date),
    };
  }

  /**
   * Get ISO week number (1-52/53)
   */
  static getWeekNumber(date: Date = new Date()): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Get a unique week key for grouping (e.g., "2025-W01")
   */
  static getWeekKey(date: Date = new Date()): string {
    const weekStart = this.getStartOfWeek(date);
    return weekStart.toISOString().split('T')[0];
  }

  /**
   * Get date string in YYYY-MM-DD format
   */
  static toDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Calculate difference in days between two dates
   */
  static diffInDays(date1: Date, date2: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs(date2.getTime() - date1.getTime()) / msPerDay);
  }

  /**
   * Calculate difference in weeks between two dates
   */
  static diffInWeeks(date1: Date, date2: Date): number {
    return Math.round(this.diffInDays(date1, date2) / 7);
  }

  /**
   * Check if two dates are on the same day
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return this.toDateString(date1) === this.toDateString(date2);
  }

  /**
   * Check if a date is today
   */
  static isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  /**
   * Check if a date is yesterday
   */
  static isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.isSameDay(date, yesterday);
  }

  /**
   * Get yesterday's date
   */
  static getYesterday(): Date {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }

  /**
   * Check if date is on a weekend (Saturday or Sunday)
   */
  static isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  /**
   * Get date N days ago
   */
  static getDaysAgo(days: number, from: Date = new Date()): Date {
    const result = new Date(from);
    result.setDate(result.getDate() - days);
    return result;
  }
}
