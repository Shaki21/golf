import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';
import prisma from '../core/db/prisma';
import { wsManager } from '../plugins/websocket';
import { EmailService } from '../domain/notifications/email.service';

/**
 * Redis connection for BullMQ
 */
const connection = new Redis(config.redis?.url || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Email service instance
const emailService = new EmailService();

/**
 * Job types for the reminder queue
 */
export const JobTypes = {
  SESSION_REMINDER: 'session:reminder',
  WEEKLY_SUMMARY: 'weekly:summary',
  GOAL_CHECK: 'goal:check',
  ACHIEVEMENT_CHECK: 'achievement:check',
  COACH_DIGEST: 'coach:digest',
  INACTIVITY_ALERT: 'inactivity:alert',
} as const;

type JobType = typeof JobTypes[keyof typeof JobTypes];

/**
 * Job data interfaces
 */
interface SessionReminderData {
  sessionId: string;
  playerId: string;
  sessionTitle: string;
  scheduledAt: Date;
}

interface WeeklySummaryData {
  playerId: string;
  weekNumber: number;
  year: number;
}

interface GoalCheckData {
  playerId: string;
  goalId: string;
}

interface AchievementCheckData {
  playerId: string;
  achievementType: string;
}

interface CoachDigestData {
  coachId: string;
  periodStart: Date;
  periodEnd: Date;
}

interface InactivityAlertData {
  playerId: string;
  lastActivityAt: Date;
  daysInactive: number;
}

/**
 * Create the reminder queue
 */
export const reminderQueue = new Queue('reminders', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      count: 50, // Keep last 50 failed jobs
    },
  },
});

/**
 * Queue events for monitoring
 */
export const queueEvents = new QueueEvents('reminders', { connection });

queueEvents.on('completed', ({ jobId }) => {
  logger.debug({ jobId }, 'Job completed');
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'Job failed');
});

/**
 * Job processors
 */
const processors: Record<JobType, (job: Job) => Promise<void>> = {
  /**
   * Send session reminder notification
   */
  [JobTypes.SESSION_REMINDER]: async (job: Job<SessionReminderData>) => {
    const { sessionId, playerId, sessionTitle, scheduledAt } = job.data;

    logger.info({ sessionId, playerId }, 'Processing session reminder');

    // Get player details
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { user: true },
    });

    if (!player) {
      logger.warn({ playerId }, 'Player not found for reminder');
      return;
    }

    // Create in-app notification
    await prisma.notification.create({
      data: {
        recipientType: 'player',
        recipientId: playerId,
        notificationType: 'SESSION_REMINDER',
        title: 'Treningsøkt om 30 minutter',
        message: `Husk at "${sessionTitle}" starter snart`,
        metadata: { sessionId, scheduledAt },
        priority: 'normal',
        status: 'pending',
      },
    });

    // Send real-time notification via WebSocket
    wsManager.sendToUser(playerId, 'notification', {
      type: 'SESSION_REMINDER',
      title: 'Treningsøkt om 30 minutter',
      message: `Husk at "${sessionTitle}" starter snart`,
      sessionId,
    });

    // Get player's notification preferences
    const playerWithUser = await prisma.player.findUnique({
      where: { id: playerId },
      include: { user: true },
    });

    // Send email if player has email notifications enabled
    if (playerWithUser?.user?.email) {
      try {
        await emailService.send({
          to: playerWithUser.user.email,
          subject: `Påminnelse: ${sessionTitle}`,
          html: `
            <h2>Treningsøkt om 30 minutter</h2>
            <p>Hei ${playerWithUser.firstName}!</p>
            <p>Husk at treningsøkten "${sessionTitle}" starter snart.</p>
            <p>Lykke til med treningen!</p>
            <p>Hilsen AK Golf Academy</p>
          `,
        });
        logger.info({ playerId, sessionId }, 'Session reminder email sent');
      } catch (emailError) {
        logger.warn({ playerId, error: emailError }, 'Failed to send session reminder email');
      }
    }
  },

  /**
   * Generate weekly training summary
   */
  [JobTypes.WEEKLY_SUMMARY]: async (job: Job<WeeklySummaryData>) => {
    const { playerId, weekNumber, year } = job.data;

    logger.info({ playerId, weekNumber, year }, 'Processing weekly summary');

    // Get player's sessions for the week
    const startDate = getWeekStartDate(year, weekNumber);
    const endDate = getWeekEndDate(year, weekNumber);

    const sessions = await prisma.trainingSession.findMany({
      where: {
        playerId,
        sessionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const completed = sessions.filter((s) => s.completionStatus === 'completed').length;
    const total = sessions.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Create summary notification
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (player) {
      await prisma.notification.create({
        data: {
          recipientType: 'player',
          recipientId: playerId,
          notificationType: 'WEEKLY_SUMMARY',
          title: `Ukesoppsummering - Uke ${weekNumber}`,
          message: `Du fullførte ${completed} av ${total} økter (${completionRate}%)`,
          metadata: { weekNumber, year, completed, total, completionRate },
          priority: 'normal',
          status: 'pending',
        },
      });
    }
  },

  /**
   * Check goal progress and send reminders
   */
  [JobTypes.GOAL_CHECK]: async (job: Job<GoalCheckData>) => {
    const { playerId, goalId } = job.data;

    logger.info({ playerId, goalId }, 'Processing goal check');

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      logger.warn({ goalId }, 'Goal not found');
      return;
    }

    // Check if goal is approaching deadline
    const daysUntilDeadline = Math.ceil(
      (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
      // Get user to find player association
      const user = await prisma.user.findUnique({
        where: { id: goal.userId },
        include: { player: true },
      });

      if (user?.player) {
        await prisma.notification.create({
          data: {
            recipientType: 'player',
            recipientId: user.player.id,
            notificationType: 'GOAL_DEADLINE',
            title: 'Målsetting nærmer seg frist',
            message: `"${goal.title}" forfaller om ${daysUntilDeadline} dager`,
            metadata: { goalId, daysUntilDeadline },
            priority: 'normal',
            status: 'pending',
          },
        });
      }
    }
  },

  /**
   * Check and award achievements
   */
  [JobTypes.ACHIEVEMENT_CHECK]: async (job: Job<AchievementCheckData>) => {
    const { playerId, achievementType } = job.data;

    logger.info({ playerId, achievementType }, 'Processing achievement check');

    // Achievement checking logic would go here
    // This would check various criteria and award achievements
  },

  /**
   * Send daily/weekly digest to coach
   */
  [JobTypes.COACH_DIGEST]: async (job: Job<CoachDigestData>) => {
    const { coachId, periodStart, periodEnd } = job.data;

    logger.info({ coachId, periodStart, periodEnd }, 'Processing coach digest');

    // Get coach's athletes activity summary
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: {
        players: {
          include: {
            trainingSessions: {
              where: {
                sessionDate: {
                  gte: periodStart,
                  lte: periodEnd,
                },
              },
            },
          },
        },
      },
    });

    if (!coach) {
      logger.warn({ coachId }, 'Coach not found');
      return;
    }

    // Generate summary stats
    const athleteStats = coach.players.map((player) => ({
      playerId: player.id,
      name: `${player.firstName} ${player.lastName}`,
      sessionsCompleted: player.trainingSessions.filter((s) => s.completionStatus === 'completed').length,
      totalSessions: player.trainingSessions.length,
    }));

    // Create digest notification
    await prisma.notification.create({
      data: {
        recipientType: 'coach',
        recipientId: coachId,
        notificationType: 'COACH_DIGEST',
        title: 'Daglig oppsummering',
        message: `${coach.players.length} utøvere aktive i perioden`,
        metadata: { periodStart, periodEnd, athleteStats },
        priority: 'normal',
        status: 'pending',
      },
    });
  },

  /**
   * Send inactivity alert
   */
  [JobTypes.INACTIVITY_ALERT]: async (job: Job<InactivityAlertData>) => {
    const { playerId, lastActivityAt, daysInactive } = job.data;

    logger.info({ playerId, daysInactive }, 'Processing inactivity alert');

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { coach: true },
    });

    if (!player) return;

    // Notify player's coach if assigned
    if (player.coach) {
      await prisma.notification.create({
        data: {
          recipientType: 'coach',
          recipientId: player.coach.id,
          notificationType: 'INACTIVITY_ALERT',
          title: 'Inaktiv utøver',
          message: `${player.firstName} ${player.lastName} har vært inaktiv i ${daysInactive} dager`,
          metadata: { playerId, lastActivityAt, daysInactive },
          priority: 'normal',
          status: 'pending',
        },
      });
    }
  },
};

/**
 * Create the worker to process jobs
 */
export const reminderWorker = new Worker(
  'reminders',
  async (job: Job) => {
    const processor = processors[job.name as JobType];
    if (processor) {
      await processor(job);
    } else {
      logger.warn({ jobName: job.name }, 'Unknown job type');
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

reminderWorker.on('completed', (job) => {
  logger.info({ jobId: job.id, jobName: job.name }, 'Job completed successfully');
});

reminderWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, jobName: job?.name, error: err }, 'Job failed');
});

/**
 * Schedule helper functions
 */
export async function scheduleSessionReminder(
  sessionId: string,
  playerId: string,
  sessionTitle: string,
  scheduledAt: Date
): Promise<void> {
  // Schedule reminder before session (configurable minutes)
  const reminderTime = new Date(scheduledAt.getTime() - config.session.reminderMinutes * 60 * 1000);
  const delay = reminderTime.getTime() - Date.now();

  if (delay > 0) {
    await reminderQueue.add(
      JobTypes.SESSION_REMINDER,
      { sessionId, playerId, sessionTitle, scheduledAt },
      { delay }
    );
    logger.info({ sessionId, reminderTime }, 'Session reminder scheduled');
  }
}

export async function scheduleWeeklySummary(
  playerId: string,
  weekNumber: number,
  year: number
): Promise<void> {
  await reminderQueue.add(
    JobTypes.WEEKLY_SUMMARY,
    { playerId, weekNumber, year },
    {
      jobId: `weekly-summary-${playerId}-${year}-${weekNumber}`,
    }
  );
}

export async function scheduleGoalCheck(
  playerId: string,
  goalId: string
): Promise<void> {
  await reminderQueue.add(JobTypes.GOAL_CHECK, { playerId, goalId });
}

export async function scheduleAchievementCheck(
  playerId: string,
  achievementType: string
): Promise<void> {
  await reminderQueue.add(JobTypes.ACHIEVEMENT_CHECK, { playerId, achievementType });
}

export async function scheduleCoachDigest(
  coachId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<void> {
  await reminderQueue.add(JobTypes.COACH_DIGEST, { coachId, periodStart, periodEnd });
}

export async function scheduleInactivityAlert(
  playerId: string,
  lastActivityAt: Date,
  daysInactive: number
): Promise<void> {
  await reminderQueue.add(JobTypes.INACTIVITY_ALERT, {
    playerId,
    lastActivityAt,
    daysInactive,
  });
}

/**
 * Utility functions
 */
function getWeekStartDate(year: number, week: number): Date {
  const date = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = date.getDay();
  date.setDate(date.getDate() - dayOfWeek + 1);
  return date;
}

function getWeekEndDate(year: number, week: number): Date {
  const start = getWeekStartDate(year, week);
  return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
}

/**
 * Shutdown gracefully
 */
export async function shutdownQueue(): Promise<void> {
  await reminderWorker.close();
  await reminderQueue.close();
  await queueEvents.close();
  await connection.quit();
  logger.info('Queue service shutdown');
}

export default {
  reminderQueue,
  reminderWorker,
  scheduleSessionReminder,
  scheduleWeeklySummary,
  scheduleGoalCheck,
  scheduleAchievementCheck,
  scheduleCoachDigest,
  scheduleInactivityAlert,
  shutdownQueue,
};
