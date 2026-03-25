/**
 * Manual Training Plan Adjustment Service
 * Allows coaches to manually adjust daily assignments and plan structure
 */

import { getPrismaClient } from '../../core/db/prisma';
import { logger } from '../../utils/logger';

const prisma = getPrismaClient();

export interface DailyAssignmentUpdate {
  sessionTemplateId?: string;
  sessionType?: string;
  estimatedDuration?: number;
  isRestDay?: boolean;
  coachNotes?: string;
  intensity?: number;
}

export interface BulkAssignmentUpdate {
  weekNumber?: number;
  startDate?: Date;
  endDate?: Date;
  updates: DailyAssignmentUpdate;
  reason: string;
}

export interface SwapSessionsRequest {
  planId: string;
  date1: Date;
  date2: Date;
  reason?: string;
}

export class ManualAdjustmentService {
  /**
   * Update a single daily assignment
   */
  static async updateDailyAssignment(
    planId: string,
    date: Date,
    updates: DailyAssignmentUpdate,
    updatedBy: string
  ): Promise<void> {
    const assignment = await prisma.dailyTrainingAssignment.findFirst({
      where: {
        annualPlanId: planId,
        assignedDate: date,
      },
    });

    if (!assignment) {
      throw new Error('Assignment not found for this date');
    }

    // If changing session template, get new template details
    let templateUpdates = {};
    if (updates.sessionTemplateId) {
      const template = await prisma.sessionTemplate.findUnique({
        where: { id: updates.sessionTemplateId },
      });

      if (template) {
        templateUpdates = {
          sessionType: template.sessionType,
          estimatedDuration: template.duration,
          learningPhase: template.learningPhase,
        };
      }
    }

    // Update the assignment
    await prisma.dailyTrainingAssignment.update({
      where: { id: assignment.id },
      data: {
        ...templateUpdates,
        ...updates,
        canBeSubstituted: false, // Manual changes shouldn't be auto-substituted
      },
    });

    // Log the change
    await this.logChange(planId, updatedBy, 'daily_assignment_update', {
      date: date.toISOString(),
      updates,
    });
  }

  /**
   * Bulk update assignments for a week or date range
   */
  static async bulkUpdateAssignments(
    planId: string,
    bulk: BulkAssignmentUpdate,
    updatedBy: string
  ): Promise<number> {
    const where: { annualPlanId: string; weekNumber?: number; assignedDate?: { gte: Date; lte: Date } } = { annualPlanId: planId };

    if (bulk.weekNumber) {
      where.weekNumber = bulk.weekNumber;
    } else if (bulk.startDate && bulk.endDate) {
      where.assignedDate = {
        gte: bulk.startDate,
        lte: bulk.endDate,
      };
    } else {
      throw new Error('Must specify either weekNumber or date range');
    }

    const result = await prisma.dailyTrainingAssignment.updateMany({
      where,
      data: bulk.updates,
    });

    // Log the bulk change
    await this.logChange(planId, updatedBy, 'bulk_assignment_update', {
      criteria: { weekNumber: bulk.weekNumber, startDate: bulk.startDate, endDate: bulk.endDate },
      updates: bulk.updates,
      reason: bulk.reason,
      affectedCount: result.count,
    });

    return result.count;
  }

  /**
   * Swap sessions between two dates
   */
  static async swapSessions(request: SwapSessionsRequest, swappedBy: string): Promise<void> {
    const [assignment1, assignment2] = await Promise.all([
      prisma.dailyTrainingAssignment.findFirst({
        where: { annualPlanId: request.planId, assignedDate: request.date1 },
      }),
      prisma.dailyTrainingAssignment.findFirst({
        where: { annualPlanId: request.planId, assignedDate: request.date2 },
      }),
    ]);

    if (!assignment1 || !assignment2) {
      throw new Error('One or both assignments not found');
    }

    // Swap the sessions
    const temp = {
      sessionTemplateId: assignment1.sessionTemplateId,
      sessionType: assignment1.sessionType,
      estimatedDuration: assignment1.estimatedDuration,
      learningPhase: assignment1.learningPhase,
      intensity: assignment1.intensity,
    };

    await prisma.$transaction([
      prisma.dailyTrainingAssignment.update({
        where: { id: assignment1.id },
        data: {
          sessionTemplateId: assignment2.sessionTemplateId,
          sessionType: assignment2.sessionType,
          estimatedDuration: assignment2.estimatedDuration,
          learningPhase: assignment2.learningPhase,
          intensity: assignment2.intensity,
        },
      }),
      prisma.dailyTrainingAssignment.update({
        where: { id: assignment2.id },
        data: temp,
      }),
    ]);

    await this.logChange(request.planId, swappedBy, 'sessions_swapped', {
      date1: request.date1.toISOString(),
      date2: request.date2.toISOString(),
      reason: request.reason,
    });
  }

  /**
   * Insert a new rest day
   */
  static async insertRestDay(
    planId: string,
    date: Date,
    reason: string,
    insertedBy: string
  ): Promise<void> {
    // Check if assignment already exists for this date
    const existing = await prisma.dailyTrainingAssignment.findFirst({
      where: {
        annualPlanId: planId,
        assignedDate: date,
      },
    });

    if (existing) {
      // Update existing to rest day
      await prisma.dailyTrainingAssignment.update({
        where: { id: existing.id },
        data: {
          isRestDay: true,
          sessionType: 'rest',
          estimatedDuration: 0,
          sessionTemplateId: null,
          coachNotes: reason,
        },
      });
    } else {
      // Get plan details
      const plan = await prisma.annualTrainingPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new Error('Plan not found');
      }

      // Calculate week number
      const daysSinceStart = Math.floor(
        (date.getTime() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const weekNumber = Math.floor(daysSinceStart / 7) + 1;

      // Create new rest day assignment
      await prisma.dailyTrainingAssignment.create({
        data: {
          annualPlanId: planId,
          playerId: plan.playerId,
          assignedDate: date,
          weekNumber,
          dayOfWeek: date.getDay(),
          sessionType: 'rest',
          estimatedDuration: 0,
          period: 'E',
          isRestDay: true,
          status: 'planned',
          coachNotes: reason,
        },
      });
    }

    await this.logChange(planId, insertedBy, 'rest_day_inserted', {
      date: date.toISOString(),
      reason,
    });
  }

  /**
   * Remove a rest day (convert to training day)
   */
  static async removeRestDay(
    planId: string,
    date: Date,
    replacementSessionId: string,
    removedBy: string
  ): Promise<void> {
    const assignment = await prisma.dailyTrainingAssignment.findFirst({
      where: {
        annualPlanId: planId,
        assignedDate: date,
        isRestDay: true,
      },
    });

    if (!assignment) {
      throw new Error('No rest day found for this date');
    }

    const template = await prisma.sessionTemplate.findUnique({
      where: { id: replacementSessionId },
    });

    if (!template) {
      throw new Error('Replacement session template not found');
    }

    await prisma.dailyTrainingAssignment.update({
      where: { id: assignment.id },
      data: {
        isRestDay: false,
        sessionTemplateId: replacementSessionId,
        sessionType: template.sessionType,
        estimatedDuration: template.duration,
        learningPhase: template.learningPhase,
      },
    });

    await this.logChange(planId, removedBy, 'rest_day_removed', {
      date: date.toISOString(),
      replacementSessionId,
    });
  }

  /**
   * Adjust weekly volume/intensity
   */
  static async adjustWeeklyVolume(
    planId: string,
    weekNumber: number,
    newTargetHours: number,
    adjustedBy: string
  ): Promise<void> {
    // Update periodization
    await prisma.periodization.updateMany({
      where: {
        annualPlanId: planId,
        weekNumber,
      },
      data: {
        plannedHours: newTargetHours,
      },
    });

    // Recalculate session durations to fit new volume
    const assignments = await prisma.dailyTrainingAssignment.findMany({
      where: {
        annualPlanId: planId,
        weekNumber,
        isRestDay: false,
      },
    });

    const totalMinutesAvailable = newTargetHours * 60;
    const avgMinutesPerSession = Math.floor(totalMinutesAvailable / assignments.length);

    // Update each assignment proportionally
    for (const assignment of assignments) {
      await prisma.dailyTrainingAssignment.update({
        where: { id: assignment.id },
        data: {
          estimatedDuration: avgMinutesPerSession,
        },
      });
    }

    await this.logChange(planId, adjustedBy, 'weekly_volume_adjusted', {
      weekNumber,
      newTargetHours,
      sessionsAdjusted: assignments.length,
    });
  }

  /**
   * Change period type for a week
   */
  static async changePeriodType(
    planId: string,
    weekNumber: number,
    newPeriod: 'E' | 'G' | 'S' | 'T',
    changedBy: string
  ): Promise<void> {
    // Update periodization
    await prisma.periodization.updateMany({
      where: {
        annualPlanId: planId,
        weekNumber,
      },
      data: {
        period: newPeriod,
      },
    });

    // Update all assignments for that week
    await prisma.dailyTrainingAssignment.updateMany({
      where: {
        annualPlanId: planId,
        weekNumber,
      },
      data: {
        period: newPeriod,
      },
    });

    await this.logChange(planId, changedBy, 'period_type_changed', {
      weekNumber,
      newPeriod,
    });
  }

  /**
   * Reschedule a tournament
   */
  static async rescheduleTournament(
    tournamentId: string,
    newStartDate: Date,
    newEndDate: Date,
    rescheduledBy: string
  ): Promise<void> {
    const tournament = await prisma.scheduledTournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Calculate new week number
    const plan = await prisma.annualTrainingPlan.findUnique({
      where: { id: tournament.annualPlanId },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    const daysSinceStart = Math.floor(
      (newStartDate.getTime() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const newWeekNumber = Math.ceil(daysSinceStart / 7);

    // Calculate new tapering date
    const taperingStartDate = new Date(newStartDate);
    taperingStartDate.setDate(taperingStartDate.getDate() - tournament.taperingDurationDays);

    await prisma.scheduledTournament.update({
      where: { id: tournamentId },
      data: {
        startDate: newStartDate,
        endDate: newEndDate,
        weekNumber: newWeekNumber,
        taperingStartDate,
      },
    });

    await this.logChange(tournament.annualPlanId, rescheduledBy, 'tournament_rescheduled', {
      tournamentId,
      oldStart: tournament.startDate.toISOString(),
      newStart: newStartDate.toISOString(),
    });
  }

  /**
   * Log a change to the plan
   */
  private static async logChange(
    planId: string,
    userId: string,
    changeType: string,
    details: Record<string, unknown>
  ): Promise<void> {
    // For now, just log to logger
    // In production, you'd want to store these in a separate audit log table
    logger.debug({
      timestamp: new Date().toISOString(),
      planId,
      userId,
      changeType,
      details,
    }, 'Training plan manual adjustment logged');

    // Update plan's lastModifiedAt
    await prisma.annualTrainingPlan.update({
      where: { id: planId },
      data: {
        lastModifiedAt: new Date(),
      },
    });
  }

  /**
   * Get change history for a plan
   */
  static async getChangeHistory(planId: string, _limit: number = 50) {
    // This would query an audit log table in production
    // For now, return from plan metadata
    return {
      planId,
      changes: [],
      message: 'Change history logging not yet implemented - add AuditLog table for full history',
    };
  }

  /**
   * Preview impact of a change before applying
   */
  static async previewChange(planId: string, changeType: string, params: Record<string, unknown>) {
    const impact = {
      changeType,
      affectedWeeks: [] as number[],
      affectedDays: 0,
      estimatedImpact: '',
    };

    switch (changeType) {
      case 'bulk_volume_change': {
        const assignments = await prisma.dailyTrainingAssignment.count({
          where: {
            annualPlanId: planId,
            weekNumber: params.weekNumber,
          },
        });
        impact.affectedWeeks = [params.weekNumber];
        impact.affectedDays = assignments;
        impact.estimatedImpact = `Will adjust ${assignments} daily sessions to fit ${params.newHours} hours`;
        break;
      }

      case 'period_change': {
        const weekAssignments = await prisma.dailyTrainingAssignment.count({
          where: {
            annualPlanId: planId,
            weekNumber: params.weekNumber,
          },
        });
        impact.affectedWeeks = [params.weekNumber];
        impact.affectedDays = weekAssignments;
        impact.estimatedImpact = `Will change period type for ${weekAssignments} sessions to ${params.newPeriod}`;
        break;
      }

      default:
        impact.estimatedImpact = 'Impact analysis not available for this change type';
    }

    return impact;
  }
}
