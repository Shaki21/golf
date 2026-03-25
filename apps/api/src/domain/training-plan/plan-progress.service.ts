/**
 * Training Plan Progress Tracking Service
 * Tracks player progress through their 12-month training plan
 *
 * KEY PRINCIPLE (V2): Completion affects effort, NOT progress.
 * Progress only changes when benchmark test shows improvement.
 */

import { getPrismaClient } from '../../core/db/prisma';
import { createBpEvidenceService } from '../performance/bp-evidence';

const prisma = getPrismaClient();

export interface PlanProgressSummary {
  planId: string;
  playerId: string;
  overall: {
    totalWeeks: number;
    weeksCompleted: number;
    weeksCurrent: number;
    weeksRemaining: number;
    progressPercent: number;
  };
  currentPeriod: {
    phase: string;
    weekNumber: number;
    weekInPeriod: number;
    period: string;
  };
  assignments: {
    total: number;
    completed: number;
    skipped: number;
    planned: number;
    completionRate: number;
  };
  training: {
    totalMinutesPlanned: number;
    totalMinutesCompleted: number;
    averageMinutesPerWeek: number;
    targetHoursPerWeek: number;
  };
  breakingPoints: {
    total: number;
    inProgress: number;
    completed: number;
    avgProgress: number;
  };
}

export interface WeeklyProgressReport {
  weekNumber: number;
  weekStartDate: Date;
  weekEndDate: Date;
  period: string;
  periodPhase: string;
  targetHours: number;
  actualMinutes: number;
  actualHours: number;
  completionRate: number;
  sessionsByType: Record<string, { completed: number; total: number }>;
  notes?: string;
}

export class PlanProgressService {
  /**
   * Get overall progress summary for a training plan
   */
  static async getProgressSummary(planId: string): Promise<PlanProgressSummary> {
    const plan = await prisma.annualTrainingPlan.findUnique({
      where: { id: planId },
      include: {
        dailyAssignments: {
          include: {
            completedSession: {
              select: {
                duration: true,
              },
            },
          },
        },
        periodizations: {
          orderBy: { weekNumber: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new Error('Training plan not found');
    }

    // Calculate overall progress
    const totalWeeks = plan.basePeriodWeeks + plan.specializationWeeks + plan.tournamentWeeks;
    const today = new Date();
    const daysSinceStart = Math.floor(
      (today.getTime() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weeksCurrent = Math.max(0, Math.ceil(daysSinceStart / 7));
    const weeksCompleted = Math.max(0, weeksCurrent - 1);
    const weeksRemaining = Math.max(0, totalWeeks - weeksCurrent);
    const progressPercent = Math.min(100, (weeksCurrent / totalWeeks) * 100);

    // Find current period
    const currentWeek = plan.periodizations.find((p) => p.weekNumber === weeksCurrent);
    const currentPeriod = {
      phase: currentWeek?.periodPhase || 'not_started',
      weekNumber: weeksCurrent,
      weekInPeriod: currentWeek?.weekInPeriod || 0,
      period: currentWeek?.period || 'E',
    };

    // Calculate assignment statistics
    const assignments = plan.dailyAssignments;
    const completed = assignments.filter((a) => a.status === 'completed').length;
    const skipped = assignments.filter((a) => a.status === 'skipped').length;
    const planned = assignments.filter((a) => a.status === 'planned').length;
    const completionRate = assignments.length > 0 ? (completed / assignments.length) * 100 : 0;

    // Calculate training minutes
    const totalMinutesPlanned = assignments.reduce((sum, a) => sum + a.estimatedDuration, 0);
    const completedAssignments = assignments.filter((a) => a.status === 'completed');
    const totalMinutesCompleted = completedAssignments.reduce((sum, a) => {
      return sum + (a.completedSession?.duration || a.estimatedDuration);
    }, 0);

    const averageMinutesPerWeek = weeksCurrent > 0 ? totalMinutesCompleted / weeksCurrent : 0;

    // Get breaking points progress
    const breakingPoints = await prisma.breakingPoint.findMany({
      where: { playerId: plan.playerId },
    });

    const avgProgress =
      breakingPoints.length > 0
        ? breakingPoints.reduce((sum, bp) => sum + (bp.progressPercent || 0), 0) /
          breakingPoints.length
        : 0;

    return {
      planId: plan.id,
      playerId: plan.playerId,
      overall: {
        totalWeeks,
        weeksCompleted,
        weeksCurrent,
        weeksRemaining,
        progressPercent,
      },
      currentPeriod,
      assignments: {
        total: assignments.length,
        completed,
        skipped,
        planned,
        completionRate,
      },
      training: {
        totalMinutesPlanned,
        totalMinutesCompleted,
        averageMinutesPerWeek,
        targetHoursPerWeek: plan.weeklyHoursTarget,
      },
      breakingPoints: {
        total: breakingPoints.length,
        inProgress: breakingPoints.filter((bp) => bp.status === 'in_progress').length,
        completed: breakingPoints.filter((bp) => bp.status === 'resolved').length,
        avgProgress,
      },
    };
  }

  /**
   * Get weekly progress report for a specific week
   */
  static async getWeeklyReport(
    planId: string,
    weekNumber: number
  ): Promise<WeeklyProgressReport> {
    const plan = await prisma.annualTrainingPlan.findUnique({
      where: { id: planId },
      include: {
        periodizations: {
          where: { weekNumber },
        },
        dailyAssignments: {
          where: { weekNumber },
          include: {
            completedSession: {
              select: {
                duration: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new Error('Training plan not found');
    }

    const periodization = plan.periodizations[0];
    if (!periodization) {
      throw new Error(`Week ${weekNumber} not found in plan`);
    }

    // Calculate week dates
    const weekStartDate = new Date(plan.startDate);
    weekStartDate.setDate(weekStartDate.getDate() + (weekNumber - 1) * 7);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Calculate actual minutes for the week
    const completedAssignments = plan.dailyAssignments.filter((a) => a.status === 'completed');
    const actualMinutes = completedAssignments.reduce((sum, a) => {
      return sum + (a.completedSession?.duration || a.estimatedDuration);
    }, 0);

    // Calculate completion rate
    const totalAssignments = plan.dailyAssignments.filter((a) => !a.isRestDay).length;
    const completionRate =
      totalAssignments > 0 ? (completedAssignments.length / totalAssignments) * 100 : 0;

    // Group sessions by type
    const sessionsByType: Record<string, { completed: number; total: number }> = {};
    plan.dailyAssignments.forEach((assignment) => {
      const type = assignment.sessionType;
      if (!sessionsByType[type]) {
        sessionsByType[type] = { completed: 0, total: 0 };
      }
      sessionsByType[type].total++;
      if (assignment.status === 'completed') {
        sessionsByType[type].completed++;
      }
    });

    return {
      weekNumber,
      weekStartDate,
      weekEndDate,
      period: periodization.period,
      periodPhase: periodization.periodPhase || 'base',
      targetHours: periodization.plannedHours || plan.weeklyHoursTarget,
      actualMinutes,
      actualHours: actualMinutes / 60,
      completionRate,
      sessionsByType,
      notes: periodization.notes || undefined,
    };
  }

  /**
   * Get progress reports for a range of weeks
   */
  static async getWeeklyReports(
    planId: string,
    startWeek: number,
    endWeek: number
  ): Promise<WeeklyProgressReport[]> {
    const reports: WeeklyProgressReport[] = [];

    for (let week = startWeek; week <= endWeek; week++) {
      try {
        const report = await this.getWeeklyReport(planId, week);
        reports.push(report);
      } catch (error) {
        // Skip weeks that don't exist
        continue;
      }
    }

    return reports;
  }

  /**
   * Get upcoming sessions for a player
   */
  static async getUpcomingSessions(playerId: string, days: number = 7) {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    const assignments = await prisma.dailyTrainingAssignment.findMany({
      where: {
        playerId,
        assignedDate: {
          gte: today,
          lte: futureDate,
        },
        status: 'planned',
      },
      include: {
        sessionTemplate: {
          select: {
            id: true,
            name: true,
            description: true,
            sessionType: true,
            duration: true,
            learningPhase: true,
            setting: true,
          },
        },
      },
      orderBy: {
        assignedDate: 'asc',
      },
    });

    return assignments;
  }

  /**
   * Update breaking point EFFORT based on session completion
   * NOTE: This only updates effort, NOT progress. Progress only changes
   * when a benchmark test shows improvement.
   */
  static async updateBreakingPointEffort(
    playerId: string,
    completedSessionId: string
  ): Promise<void> {
    // Get the completed session
    const session = await prisma.trainingSession.findUnique({
      where: { id: completedSessionId },
    });

    if (!session) return;

    // Use BP Evidence Service to update effort for each relevant breaking point
    const bpEvidenceService = createBpEvidenceService(prisma);

    // Find active breaking points for this player
    const activeBreakingPoints = await prisma.breakingPoint.findMany({
      where: {
        playerId,
        status: { in: ['identified', 'in_progress', 'awaiting_proof'] },
      },
    });

    // Update effort for each active breaking point
    for (const bp of activeBreakingPoints) {
      await bpEvidenceService.recordTrainingEffort({
        breakingPointId: bp.id,
        sessionId: completedSessionId,
        sessionDate: session.sessionDate,
      });
    }
  }

  /**
   * Update breaking point PROGRESS based on benchmark test result
   * This is the ONLY way progress should change - via actual test evidence.
   */
  static async updateBreakingPointProgress(
    playerId: string,
    testResultId: string,
    testNumber: number,
    testValue: number,
    testDate: Date
  ): Promise<void> {
    const { mapTestNumberToDomain, getPrimaryProofMetric } = await import('../performance/domain-mapping');

    // Find the domain for this test
    const domainCode = mapTestNumberToDomain(testNumber);
    if (!domainCode) return;

    // Find active breaking points for this domain
    const breakingPoints = await prisma.breakingPoint.findMany({
      where: {
        playerId,
        testDomainCode: domainCode,
        status: { in: ['identified', 'in_progress', 'awaiting_proof'] },
      },
    });

    if (breakingPoints.length === 0) return;

    // Get proof metric for domain
    const proofMetric = getPrimaryProofMetric(domainCode);

    // Use BP Evidence Service to evaluate and update progress
    const bpEvidenceService = createBpEvidenceService(prisma);

    for (const bp of breakingPoints) {
      if (!bp.successRule) continue;

      await bpEvidenceService.evaluateBenchmark({
        breakingPointId: bp.id,
        testResultId,
        domainCode,
        proofMetric,
        testValue,
        testDate,
        successRule: bp.successRule,
      });
    }
  }

  /**
   * @deprecated Use updateBreakingPointEffort for session completion
   * and updateBreakingPointProgress for test results
   */
  static async updateBreakingPointProgressLegacy(
    playerId: string,
    completedSessionId: string
  ): Promise<void> {
    // Legacy behavior - kept for backwards compatibility during migration
    // This will be removed in a future version
    await this.updateBreakingPointEffort(playerId, completedSessionId);
  }

  /**
   * Generate monthly summary statistics
   */
  static async getMonthlySummary(planId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const plan = await prisma.annualTrainingPlan.findUnique({
      where: { id: planId },
      include: {
        dailyAssignments: {
          where: {
            assignedDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            completedSession: {
              select: {
                duration: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new Error('Training plan not found');
    }

    const assignments = plan.dailyAssignments;
    const completed = assignments.filter((a) => a.status === 'completed');
    const totalMinutes = completed.reduce((sum, a) => {
      return sum + (a.completedSession?.duration || a.estimatedDuration);
    }, 0);

    const sessionsByType: Record<string, number> = {};
    completed.forEach((a) => {
      sessionsByType[a.sessionType] = (sessionsByType[a.sessionType] || 0) + 1;
    });

    return {
      month,
      year,
      totalAssignments: assignments.length,
      completedAssignments: completed.length,
      completionRate: assignments.length > 0 ? (completed.length / assignments.length) * 100 : 0,
      totalHours: totalMinutes / 60,
      averageHoursPerWeek: totalMinutes / 60 / 4, // Approximate 4 weeks per month
      sessionsByType,
    };
  }
}
