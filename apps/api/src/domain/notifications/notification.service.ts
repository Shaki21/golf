/**
 * Notification Service
 * Handles sending notifications via email, push, and in-app
 */

import { Prisma } from '@prisma/client';
import { getPrismaClient } from '../../core/db/prisma';
import { EmailService } from './email.service';
import { logger } from '../../utils/logger';

export interface NotificationContext {
  userId: string;
  tenantId: string;
  userEmail: string;
  userName: string;
}

export interface ModificationRequestNotification {
  planId: string;
  planName: string;
  playerName: string;
  playerEmail: string;
  concerns: string[];
  notes?: string;
  urgency: 'low' | 'medium' | 'high';
  requestId: string;
}

export interface PlanRejectionNotification {
  planId: string;
  planName: string;
  playerName: string;
  playerEmail: string;
  reason: string;
  willCreateNewIntake: boolean;
}

export class NotificationService {
  private static emailService = new EmailService();
  private static prisma = getPrismaClient();

  /**
   * Notify coach when player requests plan modifications
   */
  static async notifyCoachOfModificationRequest(
    data: ModificationRequestNotification,
    coachUserId: string
  ): Promise<void> {
    try {
      // Get coach details
      const coach = await this.prisma.user.findUnique({
        where: { id: coachUserId },
      });

      if (!coach || !coach.email) {
        logger.warn({ coachId: coachUserId }, 'Coach not found or has no email');
        return;
      }

      // Prepare email
      const urgencyEmoji = {
        low: '📋',
        medium: '⚠️',
        high: '🚨',
      }[data.urgency];

      const subject = `${urgencyEmoji} Plan Modification Request from ${data.playerName}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5530;">Plan Modification Request</h2>

          <p>Hi ${coach.firstName},</p>

          <p>${data.playerName} has requested modifications to their training plan:</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Plan Details</h3>
            <p><strong>Plan:</strong> ${data.planName}</p>
            <p><strong>Player:</strong> ${data.playerName} (${data.playerEmail})</p>
            <p><strong>Urgency:</strong> <span style="color: ${
              data.urgency === 'high' ? '#dc2626' : data.urgency === 'medium' ? '#ea580c' : '#6b7280'
            }; font-weight: bold;">${data.urgency.toUpperCase()}</span></p>
          </div>

          <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #b45309;">Concerns</h3>
            <ul style="margin: 10px 0;">
              ${data.concerns.map(concern => `<li>${concern}</li>`).join('')}
            </ul>

            ${data.notes ? `
              <h4 style="margin-top: 15px;">Additional Notes</h4>
              <p style="margin: 5px 0;">${data.notes}</p>
            ` : ''}
          </div>

          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/training-plans/${data.planId}/modification-requests/${data.requestId}"
               style="display: inline-block; background: #2c5530; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Review Request
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;" />

          <p style="color: #6b7280; font-size: 14px;">
            This is an automated notification from AK Golf IUP.<br>
            Please respond to your player within 24-48 hours.
          </p>
        </div>
      `;

      // Send email
      await this.emailService.send({
        to: coach.email,
        subject,
        html,
      });

      logger.info({ email: coach.email }, 'Modification request notification sent to coach');

      // Create in-app notification
      await this.createInAppNotification({
        recipientId: coachUserId,
        recipientType: 'coach',
        type: 'modification_request',
        title: `Plan Modification Request from ${data.playerName}`,
        message: `${data.playerName} has requested changes to ${data.planName}`,
        metadata: { planId: data.planId, requestId: data.requestId, urgency: data.urgency },
      });

    } catch (error) {
      logger.error({ error }, 'Failed to send modification request notification');
      // Don't throw - notification failures shouldn't break the request
    }
  }

  /**
   * Notify coach when player rejects plan
   */
  static async notifyCoachOfPlanRejection(
    data: PlanRejectionNotification,
    coachUserId: string
  ): Promise<void> {
    try {
      // Get coach details
      const coach = await this.prisma.user.findUnique({
        where: { id: coachUserId },
      });

      if (!coach || !coach.email) {
        logger.warn({ coachId: coachUserId }, 'Coach not found or has no email');
        return;
      }

      // Prepare email
      const subject = `❌ ${data.playerName} rejected their training plan`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Plan Rejection</h2>

          <p>Hi ${coach.firstName},</p>

          <p>${data.playerName} has rejected their training plan.</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Plan Details</h3>
            <p><strong>Plan:</strong> ${data.planName}</p>
            <p><strong>Player:</strong> ${data.playerName} (${data.playerEmail})</p>
          </div>

          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #991b1b;">Reason for Rejection</h3>
            <p style="margin: 10px 0; white-space: pre-wrap;">${data.reason}</p>

            ${data.willCreateNewIntake ? `
              <p style="margin-top: 15px;">
                ℹ️ The player indicated they will create a new intake form.
              </p>
            ` : ''}
          </div>

          <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #166534;">Next Steps</h3>
            <ul style="margin: 10px 0;">
              <li>Review the rejection reason</li>
              <li>Contact the player to discuss their concerns</li>
              ${data.willCreateNewIntake ? '<li>Guide them through creating a new intake form</li>' : ''}
              <li>Adjust your planning approach for future plans</li>
            </ul>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;" />

          <p style="color: #6b7280; font-size: 14px;">
            This is an automated notification from AK Golf IUP.<br>
            Please reach out to your player to understand their concerns.
          </p>
        </div>
      `;

      // Send email
      await this.emailService.send({
        to: coach.email,
        subject,
        html,
      });

      logger.info({ email: coach.email }, 'Plan rejection notification sent to coach');

      // Create in-app notification
      await this.createInAppNotification({
        recipientId: coachUserId,
        recipientType: 'coach',
        type: 'plan_rejected',
        title: `${data.playerName} rejected their training plan`,
        message: data.reason,
        metadata: { planId: data.planId },
      });

    } catch (error) {
      logger.error({ error }, 'Failed to send plan rejection notification');
      // Don't throw - notification failures shouldn't break the request
    }
  }

  /**
   * Notify player when coach responds to modification request
   */
  static async notifyPlayerOfModificationResponse(
    playerId: string,
    _requestId: string,
    coachResponse: string,
    status: 'resolved' | 'rejected'
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: playerId },
      });

      if (!user || !user.email) {
        logger.warn({ playerId }, 'Player not found or has no email');
        return;
      }

      const statusEmoji = status === 'resolved' ? '✅' : '❌';
      const subject = `${statusEmoji} Coach responded to your plan modification request`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${status === 'resolved' ? '#16a34a' : '#dc2626'};">
            Modification Request ${status === 'resolved' ? 'Resolved' : 'Rejected'}
          </h2>

          <p>Hi ${user.firstName},</p>

          <p>Your coach has responded to your training plan modification request:</p>

          <div style="background: ${status === 'resolved' ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${status === 'resolved' ? '#16a34a' : '#dc2626'}; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Coach's Response</h3>
            <p style="margin: 10px 0; white-space: pre-wrap;">${coachResponse}</p>
          </div>

          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard"
               style="display: inline-block; background: #2c5530; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Updated Plan
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;" />

          <p style="color: #6b7280; font-size: 14px;">
            This is an automated notification from AK Golf IUP.
          </p>
        </div>
      `;

      await this.emailService.send({
        to: user.email,
        subject,
        html,
      });

      logger.info({ email: user.email }, 'Modification response notification sent to player');

      // Create in-app notification
      await this.createInAppNotification({
        recipientId: playerId,
        recipientType: 'player',
        type: 'modification_response',
        title: `Coach responded to your modification request`,
        message: coachResponse,
        metadata: { status },
      });

    } catch (error) {
      logger.error({ error }, 'Failed to send modification response notification');
    }
  }

  /**
   * Create in-app notification
   */
  private static async createInAppNotification(data: {
    recipientId: string;
    recipientType: 'player' | 'coach';
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          recipientType: data.recipientType,
          recipientId: data.recipientId,
          notificationType: data.type,
          title: data.title,
          message: data.message,
          metadata: (data.metadata || {}) as Prisma.InputJsonValue,
          priority: 'normal',
          status: 'pending',
        },
      });
    } catch (error) {
      logger.warn({ error }, 'Could not create in-app notification');
    }
  }
}
