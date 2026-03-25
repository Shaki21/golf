/**
 * Session Filter Utility
 * Provides consistent session filtering across the gamification domain
 */

import { DateRangeCalculator } from './date-range';

/**
 * Minimal session interface for filtering
 * Accepts any object with a sessionDate field
 */
export interface FilterableSession {
  sessionDate: Date | string;
  duration?: number | null;
  intensity?: number | null;
  sessionType?: string | null;
}

export class SessionFilter<T extends FilterableSession> {
  private sessions: T[];

  constructor(sessions: T[]) {
    this.sessions = sessions;
  }

  /**
   * Create a new SessionFilter from an array of sessions
   */
  static from<T extends FilterableSession>(sessions: T[]): SessionFilter<T> {
    return new SessionFilter(sessions);
  }

  /**
   * Get the underlying array
   */
  toArray(): T[] {
    return this.sessions;
  }

  /**
   * Get count of filtered sessions
   */
  count(): number {
    return this.sessions.length;
  }

  /**
   * Filter sessions from a specific date onwards
   */
  fromDate(date: Date): SessionFilter<T> {
    return new SessionFilter(
      this.sessions.filter((s) => new Date(s.sessionDate) >= date)
    );
  }

  /**
   * Filter sessions up to a specific date
   */
  toDate(date: Date): SessionFilter<T> {
    return new SessionFilter(
      this.sessions.filter((s) => new Date(s.sessionDate) <= date)
    );
  }

  /**
   * Filter sessions within a date range
   */
  inRange(startDate: Date, endDate: Date): SessionFilter<T> {
    return new SessionFilter(
      this.sessions.filter((s) => {
        const sessionDate = new Date(s.sessionDate);
        return sessionDate >= startDate && sessionDate <= endDate;
      })
    );
  }

  /**
   * Filter sessions from this week (starting Monday)
   */
  thisWeek(): SessionFilter<T> {
    const startOfWeek = DateRangeCalculator.getStartOfWeek();
    return this.fromDate(startOfWeek);
  }

  /**
   * Filter sessions from this month
   */
  thisMonth(): SessionFilter<T> {
    const startOfMonth = DateRangeCalculator.getStartOfMonth();
    return this.fromDate(startOfMonth);
  }

  /**
   * Filter sessions from this year
   */
  thisYear(): SessionFilter<T> {
    const startOfYear = DateRangeCalculator.getStartOfYear();
    return this.fromDate(startOfYear);
  }

  /**
   * Filter sessions by day of week (0 = Sunday, 6 = Saturday)
   */
  byDayOfWeek(...days: number[]): SessionFilter<T> {
    return new SessionFilter(
      this.sessions.filter((s) => days.includes(new Date(s.sessionDate).getDay()))
    );
  }

  /**
   * Filter weekend sessions (Saturday and Sunday)
   */
  weekends(): SessionFilter<T> {
    return this.byDayOfWeek(0, 6);
  }

  /**
   * Filter weekday sessions (Monday through Friday)
   */
  weekdays(): SessionFilter<T> {
    return this.byDayOfWeek(1, 2, 3, 4, 5);
  }

  /**
   * Filter sessions by hour of day
   */
  byHourRange(startHour: number, endHour: number): SessionFilter<T> {
    return new SessionFilter(
      this.sessions.filter((s) => {
        const hour = new Date(s.sessionDate).getHours();
        return hour >= startHour && hour < endHour;
      })
    );
  }

  /**
   * Filter early morning sessions (before 9am)
   */
  earlyMorning(): SessionFilter<T> {
    return this.byHourRange(0, 9);
  }

  /**
   * Filter evening sessions (7pm and later)
   */
  evening(): SessionFilter<T> {
    return this.byHourRange(19, 24);
  }

  /**
   * Filter by session type
   */
  byType(sessionType: string): SessionFilter<T> {
    return new SessionFilter(
      this.sessions.filter(
        (s) => s.sessionType?.toLowerCase() === sessionType.toLowerCase()
      )
    );
  }

  /**
   * Filter by multiple session types
   */
  byTypes(...sessionTypes: string[]): SessionFilter<T> {
    const lowerTypes = sessionTypes.map((t) => t.toLowerCase());
    return new SessionFilter(
      this.sessions.filter((s) =>
        lowerTypes.includes(s.sessionType?.toLowerCase() || '')
      )
    );
  }

  /**
   * Sum a numeric field across all sessions
   */
  sum(field: keyof T): number {
    return this.sessions.reduce((sum, s) => {
      const value = s[field];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  }

  /**
   * Sum duration in minutes
   */
  sumDuration(): number {
    return this.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  }

  /**
   * Sum duration in hours
   */
  sumHours(): number {
    return this.sumDuration() / 60;
  }

  /**
   * Average a numeric field
   */
  average(field: keyof T): number {
    if (this.sessions.length === 0) return 0;
    return this.sum(field) / this.sessions.length;
  }

  /**
   * Average intensity
   */
  averageIntensity(): number {
    const sessionsWithIntensity = this.sessions.filter(
      (s) => typeof s.intensity === 'number'
    );
    if (sessionsWithIntensity.length === 0) return 0;
    return (
      sessionsWithIntensity.reduce((sum, s) => sum + (s.intensity || 0), 0) /
      sessionsWithIntensity.length
    );
  }

  /**
   * Get unique dates (as YYYY-MM-DD strings)
   */
  uniqueDates(): Set<string> {
    const dates = new Set<string>();
    this.sessions.forEach((s) => {
      dates.add(DateRangeCalculator.toDateString(new Date(s.sessionDate)));
    });
    return dates;
  }

  /**
   * Get unique dates count
   */
  uniqueDatesCount(): number {
    return this.uniqueDates().size;
  }

  /**
   * Group sessions by week
   * Returns a Map of week key -> sessions
   */
  groupByWeek(): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    this.sessions.forEach((s) => {
      const weekKey = DateRangeCalculator.getWeekKey(new Date(s.sessionDate));
      const existing = groups.get(weekKey) || [];
      existing.push(s);
      groups.set(weekKey, existing);
    });

    return groups;
  }

  /**
   * Calculate hours by session type
   */
  hoursByType(): Record<string, number> {
    const result: Record<string, number> = {};

    this.sessions.forEach((s) => {
      const type = s.sessionType?.toLowerCase() || 'other';
      result[type] = (result[type] || 0) + (s.duration || 0) / 60;
    });

    return result;
  }

  /**
   * Sort sessions by date (ascending)
   */
  sortByDateAsc(): SessionFilter<T> {
    return new SessionFilter(
      [...this.sessions].sort(
        (a, b) =>
          new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
      )
    );
  }

  /**
   * Sort sessions by date (descending)
   */
  sortByDateDesc(): SessionFilter<T> {
    return new SessionFilter(
      [...this.sessions].sort(
        (a, b) =>
          new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
      )
    );
  }

  /**
   * Get the most recent N sessions
   */
  latest(n: number): SessionFilter<T> {
    return new SessionFilter(this.sortByDateDesc().toArray().slice(0, n));
  }

  /**
   * Get the oldest N sessions
   */
  oldest(n: number): SessionFilter<T> {
    return new SessionFilter(this.sortByDateAsc().toArray().slice(0, n));
  }

  /**
   * Get first session (by date)
   */
  first(): T | undefined {
    return this.sortByDateAsc().toArray()[0];
  }

  /**
   * Get last session (by date)
   */
  last(): T | undefined {
    return this.sortByDateDesc().toArray()[0];
  }
}
