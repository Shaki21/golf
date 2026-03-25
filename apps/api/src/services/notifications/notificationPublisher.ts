/**
 * Notification Publisher
 *
 * Helper to publish notifications via the notification bus after DB creation.
 * Use this after creating a notification in the database to push real-time updates.
 */

import { publish, NotificationPayload } from './notificationBus';
import { logger } from '../../utils/logger';
import { Prisma } from '@prisma/client';

interface NotificationDbRecord {
  id: string;
  recipientId: string;
  notificationType: string;
  title: string;
  message?: string | null;
  metadata?: Prisma.JsonValue | null;
  createdAt: Date;
}

/**
 * Publish a notification after it has been created in the database.
 * Call this after prisma.notification.create().
 *
 * @param notification - The notification record from the database
 */
export async function publishNotification(notification: NotificationDbRecord): Promise<void> {
  try {
    // Extract entityType and entityId from metadata if present
    const metadata = (notification.metadata as Record<string, unknown>) || {};
    let entityType: NotificationPayload['entityType'];
    let entityId: string | undefined;

    // Determine entity type from notification type
    if (notification.notificationType.includes('video')) {
      entityType = 'video';
      entityId = metadata.videoId as string;
    } else if (notification.notificationType.includes('comment')) {
      entityType = 'comment';
      entityId = metadata.commentId as string;
    } else if (notification.notificationType.includes('session')) {
      entityType = 'session';
      entityId = metadata.sessionId as string;
    } else if (notification.notificationType.includes('goal')) {
      entityType = 'goal';
      entityId = metadata.goalId as string;
    } else if (notification.notificationType.includes('achievement')) {
      entityType = 'achievement';
      entityId = metadata.achievementId as string;
    }

    const payload: NotificationPayload = {
      id: notification.id,
      type: notification.notificationType,
      title: notification.title,
      body: notification.message || undefined,
      entityType,
      entityId,
      createdAt: notification.createdAt.toISOString(),
      isRead: false,
    };

    await publish(notification.recipientId, payload);

    logger.debug(
      { userId: notification.recipientId, type: notification.notificationType },
      'Notification published to bus'
    );
  } catch (error) {
    // Log but don't throw - real-time push is best-effort
    logger.error({ error, notificationId: notification.id }, 'Failed to publish notification');
  }
}

/**
 * Convenience: Create notification payload without DB record
 * Use when you want to push an event without storing in DB
 */
export async function pushNotification(
  userId: string,
  type: string,
  title: string,
  options: {
    body?: string;
    entityType?: NotificationPayload['entityType'];
    entityId?: string;
  } = {}
): Promise<void> {
  const payload: NotificationPayload = {
    id: `temp-${Date.now()}`,
    type,
    title,
    body: options.body,
    entityType: options.entityType,
    entityId: options.entityId,
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  await publish(userId, payload);
}
