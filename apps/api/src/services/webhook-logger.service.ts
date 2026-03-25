/**
 * Webhook Event Logger Service
 *
 * Logs all webhook events to database for debugging and audit trail
 * Provides utilities for querying webhook history
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

export interface WebhookEventLog {
  id: string;
  stripeEventId: string;
  eventType: string;
  eventData: any;
  processed: boolean;
  processedAt?: Date;
  error?: string;
  createdAt: Date;
}

export class WebhookLoggerService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Log incoming webhook event
   */
  async logEvent(event: Stripe.Event): Promise<void> {
    try {
      // Check if event already logged (idempotency)
      const existing = await this.prisma.webhookEvent.findUnique({
        where: { stripeEventId: event.id },
      });

      if (existing) {
        console.log(`Webhook event ${event.id} already logged, skipping`);
        return;
      }

      // Log the event
      await this.prisma.webhookEvent.create({
        data: {
          stripeEventId: event.id,
          eventType: event.type,
          eventData: event.data.object as any,
          processed: false,
          createdAt: new Date(event.created * 1000),
        },
      });

      console.log(`Logged webhook event: ${event.id} (${event.type})`);
    } catch (error) {
      console.error('Failed to log webhook event:', error);
      // Don't throw - logging failure shouldn't stop webhook processing
    }
  }

  /**
   * Mark event as processed
   */
  async markProcessed(eventId: string, error?: string): Promise<void> {
    try {
      await this.prisma.webhookEvent.update({
        where: { stripeEventId: eventId },
        data: {
          processed: true,
          processedAt: new Date(),
          error: error || null,
        },
      });

      if (error) {
        console.error(`Webhook ${eventId} processed with error: ${error}`);
      } else {
        console.log(`Webhook ${eventId} marked as processed`);
      }
    } catch (error) {
      console.error('Failed to mark webhook as processed:', error);
    }
  }

  /**
   * Get recent webhook events
   */
  async getRecentEvents(limit: number = 50): Promise<WebhookEventLog[]> {
    return this.prisma.webhookEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    }) as any;
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType: string, limit: number = 50): Promise<WebhookEventLog[]> {
    return this.prisma.webhookEvent.findMany({
      where: { eventType },
      take: limit,
      orderBy: { createdAt: 'desc' },
    }) as any;
  }

  /**
   * Get unprocessed events
   */
  async getUnprocessedEvents(): Promise<WebhookEventLog[]> {
    return this.prisma.webhookEvent.findMany({
      where: { processed: false },
      orderBy: { createdAt: 'asc' },
    }) as any;
  }

  /**
   * Get events with errors
   */
  async getFailedEvents(limit: number = 50): Promise<WebhookEventLog[]> {
    return this.prisma.webhookEvent.findMany({
      where: {
        processed: true,
        error: { not: null },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    }) as any;
  }

  /**
   * Cleanup old events (keep last 90 days)
   */
  async cleanupOldEvents(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.webhookEvent.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        processed: true,
      },
    });

    console.log(`Deleted ${result.count} old webhook events`);
    return result.count;
  }

  /**
   * Get event statistics
   */
  async getEventStats(): Promise<{
    total: number;
    processed: number;
    failed: number;
    unprocessed: number;
    byType: Record<string, number>;
  }> {
    const [total, processed, failed, unprocessed, byType] = await Promise.all([
      // Total events
      this.prisma.webhookEvent.count(),

      // Processed events
      this.prisma.webhookEvent.count({
        where: { processed: true, error: null },
      }),

      // Failed events
      this.prisma.webhookEvent.count({
        where: { processed: true, error: { not: null } },
      }),

      // Unprocessed events
      this.prisma.webhookEvent.count({
        where: { processed: false },
      }),

      // Events by type
      this.prisma.webhookEvent.groupBy({
        by: ['eventType'],
        _count: true,
      }),
    ]);

    const eventsByType: Record<string, number> = {};
    byType.forEach((item) => {
      eventsByType[item.eventType] = item._count;
    });

    return {
      total,
      processed,
      failed,
      unprocessed,
      byType: eventsByType,
    };
  }
}
