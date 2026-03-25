/**
 * Training Plan Review and Approval Service
 * Handles coach review and approval workflow for training plans
 */

import { getPrismaClient } from '../../core/db/prisma';
import { logger } from '../../utils/logger';

const prisma = getPrismaClient();

export interface PlanReview {
  id: string;
  planId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  reviewDate: Date;
  comments?: string;
  suggestedChanges?: SuggestedChange[];
}

export interface SuggestedChange {
  type: 'period_adjustment' | 'session_change' | 'tournament_timing' | 'volume_change' | 'other';
  weekNumber?: number;
  date?: Date;
  currentValue: string;
  suggestedValue: string;
  reason: string;
}

export interface ReviewSubmission {
  planId: string;
  reviewerId: string;
  status: 'approved' | 'rejected' | 'needs_revision';
  comments?: string;
  suggestedChanges?: SuggestedChange[];
}

export class PlanReviewService {
  /**
   * Submit a plan for review
   */
  static async submitForReview(planId: string, submittedBy: string): Promise<void> {
    const plan = await prisma.annualTrainingPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Training plan not found');
    }

    // Update plan status to pending_review
    await prisma.annualTrainingPlan.update({
      where: { id: planId },
      data: {
        status: 'pending_review',
        lastModifiedAt: new Date(),
      },
    });

    // Create notifications for coaches (batched)
    const coaches = await prisma.coach.findMany({
      where: { tenantId: plan.tenantId },
      select: { id: true },
    });

    if (coaches.length > 0) {
      await prisma.notification.createMany({
        data: coaches.map((coach) => ({
          recipientType: 'coach',
          recipientId: coach.id,
          notificationType: 'plan_review_requested',
          title: 'Training Plan Review Requested',
          message: `A new training plan for player ${plan.playerId} is ready for review`,
          metadata: { planId, submittedBy },
          priority: 'normal',
          status: 'pending',
        })),
      });
    }
  }

  /**
   * Submit review for a training plan
   */
  static async submitReview(review: ReviewSubmission): Promise<PlanReview> {
    const plan = await prisma.annualTrainingPlan.findUnique({
      where: { id: review.planId },
      include: { player: true },
    });

    if (!plan) {
      throw new Error('Training plan not found');
    }

    const reviewer = await prisma.user.findUnique({
      where: { id: review.reviewerId },
    });

    if (!reviewer) {
      throw new Error('Reviewer not found');
    }

    // Update plan status
    let newStatus = 'active';
    if (review.status === 'rejected') {
      newStatus = 'rejected';
    } else if (review.status === 'needs_revision') {
      newStatus = 'needs_revision';
    } else if (review.status === 'approved') {
      newStatus = 'active';
    }

    await prisma.annualTrainingPlan.update({
      where: { id: review.planId },
      data: {
        status: newStatus,
        generatedBy: review.reviewerId, // Track who approved it
        lastModifiedAt: new Date(),
      },
    });

    // Create notification for player/submitter
    const reviewerName = `${reviewer.firstName} ${reviewer.lastName}`;
    await prisma.notification.create({
      data: {
        recipientType: 'player',
        recipientId: plan.playerId,
        notificationType: 'plan_review_completed',
        title: `Training Plan ${review.status}`,
        message: `Your training plan has been ${review.status} by ${reviewerName}`,
        metadata: { planId: review.planId, status: review.status, comments: review.comments },
        priority: 'normal',
        status: 'pending',
      },
    });

    return {
      id: crypto.randomUUID(),
      planId: review.planId,
      reviewerId: review.reviewerId,
      reviewerName: reviewerName,
      reviewerRole: reviewer.role,
      status: review.status,
      reviewDate: new Date(),
      comments: review.comments,
      suggestedChanges: review.suggestedChanges,
    };
  }

  /**
   * Get all plans pending review for a coach
   */
  static async getPendingReviews(coachId: string) {
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      throw new Error('Coach not found');
    }

    const plans = await prisma.annualTrainingPlan.findMany({
      where: {
        tenantId: coach.tenantId,
        status: 'pending_review',
      },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            handicap: true,
          },
        },
        _count: {
          select: {
            dailyAssignments: true,
            scheduledTournaments: true,
          },
        },
      },
      orderBy: {
        generatedAt: 'desc',
      },
    });

    return plans;
  }

  /**
   * Apply suggested changes to a plan
   */
  static async applySuggestedChanges(
    planId: string,
    changes: SuggestedChange[],
    _appliedBy: string
  ): Promise<void> {
    const plan = await prisma.annualTrainingPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Training plan not found');
    }

    for (const change of changes) {
      switch (change.type) {
        case 'period_adjustment':
          if (change.weekNumber) {
            await this.adjustPeriodForWeek(planId, change.weekNumber, change.suggestedValue);
          }
          break;

        case 'session_change':
          if (change.date) {
            await this.changeSessionForDate(planId, change.date, change.suggestedValue);
          }
          break;

        case 'volume_change':
          if (change.weekNumber) {
            await this.adjustVolumeForWeek(planId, change.weekNumber, parseInt(change.suggestedValue));
          }
          break;

        default:
          // Log other changes for manual review
          logger.debug({ change }, 'Change requires manual review');
      }
    }

    // Update plan status
    await prisma.annualTrainingPlan.update({
      where: { id: planId },
      data: {
        status: 'pending_review', // Back to review after changes
        lastModifiedAt: new Date(),
      },
    });
  }

  /**
   * Adjust period for a specific week
   */
  private static async adjustPeriodForWeek(
    planId: string,
    weekNumber: number,
    newPeriod: string
  ): Promise<void> {
    await prisma.periodization.updateMany({
      where: {
        annualPlanId: planId,
        weekNumber,
      },
      data: {
        period: newPeriod,
      },
    });

    // Update daily assignments for that week
    await prisma.dailyTrainingAssignment.updateMany({
      where: {
        annualPlanId: planId,
        weekNumber,
      },
      data: {
        period: newPeriod,
      },
    });
  }

  /**
   * Change session for a specific date
   */
  private static async changeSessionForDate(
    planId: string,
    date: Date,
    newSessionTemplateId: string
  ): Promise<void> {
    const template = await prisma.sessionTemplate.findUnique({
      where: { id: newSessionTemplateId },
    });

    if (!template) {
      throw new Error('Session template not found');
    }

    await prisma.dailyTrainingAssignment.updateMany({
      where: {
        annualPlanId: planId,
        assignedDate: date,
      },
      data: {
        sessionTemplateId: newSessionTemplateId,
        sessionType: template.sessionType,
        estimatedDuration: template.duration,
        learningPhase: template.learningPhase,
      },
    });
  }

  /**
   * Adjust training volume for a specific week
   */
  private static async adjustVolumeForWeek(
    planId: string,
    weekNumber: number,
    newHours: number
  ): Promise<void> {
    await prisma.periodization.updateMany({
      where: {
        annualPlanId: planId,
        weekNumber,
      },
      data: {
        plannedHours: newHours,
      },
    });
  }

  /**
   * Get review history for a plan
   */
  static async getReviewHistory(planId: string) {
    const notifications = await prisma.notification.findMany({
      where: {
        metadata: {
          path: ['planId'],
          equals: planId,
        },
        notificationType: {
          in: ['plan_review_requested', 'plan_review_completed'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications.map((n) => ({
      id: n.id,
      type: n.notificationType,
      title: n.title,
      message: n.message,
      metadata: n.metadata,
      createdAt: n.createdAt,
    }));
  }

  /**
   * Validate a plan before submission
   */
  static async validatePlan(planId: string): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    const plan = await prisma.annualTrainingPlan.findUnique({
      where: { id: planId },
      include: {
        dailyAssignments: true,
        scheduledTournaments: true,
        periodizations: true,
      },
    });

    if (!plan) {
      return { valid: false, issues: ['Plan not found'] };
    }

    // Check if all weeks have periodization
    const expectedWeeks = plan.basePeriodWeeks + plan.specializationWeeks + plan.tournamentWeeks;
    if (plan.periodizations.length !== expectedWeeks) {
      issues.push(`Missing periodizations: expected ${expectedWeeks}, found ${plan.periodizations.length}`);
    }

    // Check if daily assignments cover the full year
    if (plan.dailyAssignments.length < 300) {
      issues.push(`Insufficient daily assignments: found ${plan.dailyAssignments.length}, expected ~365`);
    }

    // Check for gaps in assignments
    const dates = plan.dailyAssignments.map((a) => a.assignedDate.getTime()).sort();
    for (let i = 1; i < dates.length; i++) {
      const dayDiff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
      if (dayDiff > 1) {
        issues.push(`Gap detected in daily assignments: ${Math.floor(dayDiff)} days`);
        break;
      }
    }

    // Check if player has breaking points linked
    const breakingPoints = await prisma.breakingPoint.count({
      where: { playerId: plan.playerId },
    });

    if (breakingPoints === 0) {
      issues.push('No breaking points linked to this player');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
