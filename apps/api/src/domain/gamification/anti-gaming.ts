/**
 * AK Golf Academy - Anti-Gaming Validation
 * Prevents abuse of the gamification system through rate limiting and anomaly detection
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const ANTI_GAMING_CONFIG = {
  // Rate limiting
  MIN_HOURS_BETWEEN_SESSIONS: 0.5, // 30 minutes minimum between sessions
  MAX_SESSIONS_PER_DAY: 6, // Maximum 6 sessions per day
  MAX_HOURS_PER_DAY: 8, // Maximum 8 hours training per day
  MAX_HOURS_PER_WEEK: 40, // Maximum 40 hours per week

  // Streak validation
  STREAK_MIN_HOURS_BETWEEN_DAYS: 20, // At least 20 hours must pass for new streak day
  STREAK_MAX_HOURS_GAP: 36, // Maximum 36 hours between sessions for streak

  // Anomaly thresholds
  ANOMALY_SUDDEN_HOURS_INCREASE: 3, // Flag if daily hours suddenly increases by 3x
  ANOMALY_WEEKEND_ONLY_FLAG_DAYS: 14, // Flag if only training on weekends for 2 weeks

  // Session validation
  MIN_SESSION_DURATION_MINUTES: 10, // Minimum 10 minutes per session
  MAX_SESSION_DURATION_MINUTES: 300, // Maximum 5 hours per session
};

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ValidationResult {
  valid: boolean;
  code?: string;
  message?: string;
  suggestions?: string[];
}

export interface AnomalyFlag {
  playerId: string;
  type: 'rate_limit' | 'daily_limit' | 'pattern_anomaly' | 'streak_gaming';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: Date;
  metadata?: Record<string, any>;
}

export interface SessionValidationInput {
  playerId: string;
  sessionDate: Date;
  duration: number; // minutes
  sessionType: string;
}

// ═══════════════════════════════════════════════════════════════
// ANTI-GAMING SERVICE
// ═══════════════════════════════════════════════════════════════

export class AntiGamingService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Validate a new session before creation
   */
  async validateSession(input: SessionValidationInput): Promise<ValidationResult> {
    const { playerId, sessionDate, duration } = input;

    // 1. Validate duration
    const durationCheck = this.validateDuration(duration);
    if (!durationCheck.valid) return durationCheck;

    // 2. Check rate limiting (min time between sessions)
    const rateCheck = await this.checkRateLimit(playerId, sessionDate);
    if (!rateCheck.valid) return rateCheck;

    // 3. Check daily limits
    const dailyCheck = await this.checkDailyLimits(playerId, sessionDate, duration);
    if (!dailyCheck.valid) return dailyCheck;

    // 4. Check weekly limits
    const weeklyCheck = await this.checkWeeklyLimits(playerId, sessionDate, duration);
    if (!weeklyCheck.valid) return weeklyCheck;

    return { valid: true };
  }

  /**
   * Validate session duration
   */
  private validateDuration(durationMinutes: number): ValidationResult {
    if (durationMinutes < ANTI_GAMING_CONFIG.MIN_SESSION_DURATION_MINUTES) {
      return {
        valid: false,
        code: 'SESSION_TOO_SHORT',
        message: `Økten må være minst ${ANTI_GAMING_CONFIG.MIN_SESSION_DURATION_MINUTES} minutter`,
        suggestions: ['Registrer økter som varer minst 10 minutter for å telle mot badges'],
      };
    }

    if (durationMinutes > ANTI_GAMING_CONFIG.MAX_SESSION_DURATION_MINUTES) {
      return {
        valid: false,
        code: 'SESSION_TOO_LONG',
        message: `Økten kan ikke være lenger enn ${ANTI_GAMING_CONFIG.MAX_SESSION_DURATION_MINUTES / 60} timer`,
        suggestions: ['Del opp lange økter i separate registreringer'],
      };
    }

    return { valid: true };
  }

  /**
   * Check rate limiting - minimum time between sessions
   */
  private async checkRateLimit(playerId: string, sessionDate: Date): Promise<ValidationResult> {
    const minHoursBetween = ANTI_GAMING_CONFIG.MIN_HOURS_BETWEEN_SESSIONS;
    const cutoffTime = new Date(sessionDate.getTime() - minHoursBetween * 60 * 60 * 1000);

    const recentSession = await this.prisma.trainingSession.findFirst({
      where: {
        playerId,
        sessionDate: {
          gte: cutoffTime,
          lte: sessionDate,
        },
      },
      orderBy: { sessionDate: 'desc' },
    });

    if (recentSession) {
      const timeSinceLastMs = sessionDate.getTime() - new Date(recentSession.sessionDate).getTime();
      const timeSinceLastMinutes = Math.round(timeSinceLastMs / (1000 * 60));

      return {
        valid: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Du må vente minst ${minHoursBetween * 60} minutter mellom økter`,
        suggestions: [
          `Siste økt ble registrert for ${timeSinceLastMinutes} minutter siden`,
          'Dette er for å sikre at streaks og badges reflekterer reell innsats',
        ],
      };
    }

    return { valid: true };
  }

  /**
   * Check daily limits - sessions and hours per day
   */
  private async checkDailyLimits(
    playerId: string,
    sessionDate: Date,
    newDurationMinutes: number
  ): Promise<ValidationResult> {
    const startOfDay = new Date(sessionDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    const todaysSessions = await this.prisma.trainingSession.findMany({
      where: {
        playerId,
        sessionDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        duration: true,
      },
    });

    // Check session count
    if (todaysSessions.length >= ANTI_GAMING_CONFIG.MAX_SESSIONS_PER_DAY) {
      return {
        valid: false,
        code: 'DAILY_SESSION_LIMIT',
        message: `Du har nådd maksimalt antall økter per dag (${ANTI_GAMING_CONFIG.MAX_SESSIONS_PER_DAY})`,
        suggestions: ['Fokuser på kvalitet fremfor kvantitet', 'Resten er viktig for utvikling'],
      };
    }

    // Check hours
    const totalMinutesToday = todaysSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalHoursWithNew = (totalMinutesToday + newDurationMinutes) / 60;

    if (totalHoursWithNew > ANTI_GAMING_CONFIG.MAX_HOURS_PER_DAY) {
      const remainingMinutes = Math.max(
        0,
        ANTI_GAMING_CONFIG.MAX_HOURS_PER_DAY * 60 - totalMinutesToday
      );

      return {
        valid: false,
        code: 'DAILY_HOURS_LIMIT',
        message: `Du har nådd maksimalt antall timer per dag (${ANTI_GAMING_CONFIG.MAX_HOURS_PER_DAY} timer)`,
        suggestions: [
          remainingMinutes > 0
            ? `Du kan registrere ${remainingMinutes} minutter til i dag`
            : 'Hvil deg og tren igjen i morgen',
        ],
      };
    }

    return { valid: true };
  }

  /**
   * Check weekly limits
   */
  private async checkWeeklyLimits(
    playerId: string,
    sessionDate: Date,
    newDurationMinutes: number
  ): Promise<ValidationResult> {
    // Get start of week (Monday)
    const startOfWeek = new Date(sessionDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weeksSessions = await this.prisma.trainingSession.findMany({
      where: {
        playerId,
        sessionDate: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      select: {
        duration: true,
      },
    });

    const totalMinutesThisWeek = weeksSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalHoursWithNew = (totalMinutesThisWeek + newDurationMinutes) / 60;

    if (totalHoursWithNew > ANTI_GAMING_CONFIG.MAX_HOURS_PER_WEEK) {
      return {
        valid: false,
        code: 'WEEKLY_HOURS_LIMIT',
        message: `Du har nådd maksimalt antall timer denne uken (${ANTI_GAMING_CONFIG.MAX_HOURS_PER_WEEK} timer)`,
        suggestions: [
          'Fantastisk dedikasjon! Men kroppen trenger hvile.',
          'Prøv igjen neste uke',
        ],
      };
    }

    return { valid: true };
  }

  /**
   * Validate streak eligibility for a new session
   * Returns whether this session should count towards streak
   */
  async validateStreakEligibility(
    playerId: string,
    sessionDate: Date
  ): Promise<{ countsForStreak: boolean; reason?: string }> {
    // Get most recent session before this one
    const lastSession = await this.prisma.trainingSession.findFirst({
      where: {
        playerId,
        sessionDate: {
          lt: sessionDate,
        },
        completionStatus: { in: ['completed', 'auto_completed'] },
      },
      orderBy: { sessionDate: 'desc' },
      select: { sessionDate: true },
    });

    if (!lastSession) {
      // First session ever - counts for streak
      return { countsForStreak: true };
    }

    const hoursSinceLast =
      (sessionDate.getTime() - new Date(lastSession.sessionDate).getTime()) / (1000 * 60 * 60);

    // Must be at least 20 hours since last session for a new streak day
    if (hoursSinceLast < ANTI_GAMING_CONFIG.STREAK_MIN_HOURS_BETWEEN_DAYS) {
      return {
        countsForStreak: false,
        reason: 'Denne økten teller som samme dag som forrige økt for streak-beregning',
      };
    }

    // Can't be more than 36 hours (streak broken)
    if (hoursSinceLast > ANTI_GAMING_CONFIG.STREAK_MAX_HOURS_GAP) {
      return {
        countsForStreak: true, // Starts new streak
        reason: 'Streaken er brutt. Denne økten starter en ny streak.',
      };
    }

    return { countsForStreak: true };
  }

  /**
   * Detect anomalies in training patterns
   */
  async detectAnomalies(playerId: string): Promise<AnomalyFlag[]> {
    const flags: AnomalyFlag[] = [];
    const now = new Date();

    // Get last 30 days of sessions
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        playerId,
        sessionDate: { gte: thirtyDaysAgo },
        completionStatus: { in: ['completed', 'auto_completed'] },
      },
      orderBy: { sessionDate: 'asc' },
    });

    if (sessions.length < 5) {
      // Not enough data to detect anomalies
      return flags;
    }

    // Check for sudden increase in daily hours
    const dailyHours: Record<string, number> = {};
    sessions.forEach((s) => {
      const dateKey = new Date(s.sessionDate).toISOString().split('T')[0];
      dailyHours[dateKey] = (dailyHours[dateKey] || 0) + (s.duration || 0) / 60;
    });

    const hoursArray = Object.values(dailyHours);
    if (hoursArray.length >= 7) {
      const avgFirst = hoursArray.slice(0, -3).reduce((a, b) => a + b, 0) / (hoursArray.length - 3);
      const avgLast = hoursArray.slice(-3).reduce((a, b) => a + b, 0) / 3;

      if (avgFirst > 0 && avgLast / avgFirst > ANTI_GAMING_CONFIG.ANOMALY_SUDDEN_HOURS_INCREASE) {
        flags.push({
          playerId,
          type: 'pattern_anomaly',
          severity: 'medium',
          description: `Plutselig økning i treningstimer: fra ~${avgFirst.toFixed(1)}t/dag til ~${avgLast.toFixed(1)}t/dag`,
          detectedAt: now,
          metadata: { avgBefore: avgFirst, avgAfter: avgLast },
        });
      }
    }

    // Check for weekend-only training pattern
    const weekendSessions = sessions.filter((s) => {
      const day = new Date(s.sessionDate).getDay();
      return day === 0 || day === 6;
    });

    const weekdaySessions = sessions.filter((s) => {
      const day = new Date(s.sessionDate).getDay();
      return day >= 1 && day <= 5;
    });

    if (weekendSessions.length >= 4 && weekdaySessions.length === 0) {
      flags.push({
        playerId,
        type: 'pattern_anomaly',
        severity: 'low',
        description: 'Kun helgetrening registrert de siste 2 ukene',
        detectedAt: now,
        metadata: { weekendSessions: weekendSessions.length, weekdaySessions: weekdaySessions.length },
      });
    }

    return flags;
  }

  /**
   * Log an anomaly flag to database
   */
  async logAnomalyFlag(flag: AnomalyFlag): Promise<void> {
    // This could be stored in a separate table for admin review
    // For now, just log with structured logging
    logger.warn({ flag }, '[ANTI-GAMING] Anomaly detected');
  }

  /**
   * Get player's training pattern summary (for coach review)
   */
  async getPatternSummary(playerId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const sessions = await this.prisma.trainingSession.findMany({
      where: {
        playerId,
        sessionDate: { gte: thirtyDaysAgo },
        completionStatus: { in: ['completed', 'auto_completed'] },
      },
      select: {
        sessionDate: true,
        duration: true,
        sessionType: true,
      },
      orderBy: { sessionDate: 'asc' },
    });

    // Calculate patterns
    const totalSessions = sessions.length;
    const totalHours = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
    const avgSessionDuration = totalSessions > 0 ? totalHours / totalSessions : 0;

    // Sessions by day of week
    const byDayOfWeek = [0, 0, 0, 0, 0, 0, 0];
    sessions.forEach((s) => {
      const day = new Date(s.sessionDate).getDay();
      byDayOfWeek[day]++;
    });

    // Sessions by type
    const byType: Record<string, number> = {};
    sessions.forEach((s) => {
      byType[s.sessionType] = (byType[s.sessionType] || 0) + 1;
    });

    return {
      period: '30 dager',
      totalSessions,
      totalHours: Math.round(totalHours * 10) / 10,
      avgSessionDurationMinutes: Math.round(avgSessionDuration * 60),
      sessionsByDayOfWeek: {
        søndag: byDayOfWeek[0],
        mandag: byDayOfWeek[1],
        tirsdag: byDayOfWeek[2],
        onsdag: byDayOfWeek[3],
        torsdag: byDayOfWeek[4],
        fredag: byDayOfWeek[5],
        lørdag: byDayOfWeek[6],
      },
      sessionsByType: byType,
    };
  }
}

/**
 * Factory function to create AntiGamingService
 */
export function createAntiGamingService(prisma: PrismaClient): AntiGamingService {
  return new AntiGamingService(prisma);
}
