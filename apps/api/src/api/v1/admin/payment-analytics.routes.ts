/**
 * Admin Payment Analytics Routes
 *
 * Protected admin endpoints for payment and subscription analytics
 *
 * Routes:
 * - GET /admin/payment-stats - Dashboard statistics
 * - GET /admin/recent-transactions - Recent transaction list
 * - GET /admin/webhook-events - Webhook event log
 * - GET /admin/failed-payments - Failed payment tracking
 */

import { FastifyInstance, FastifyRequest } from 'fastify';
import { AdminPaymentAnalyticsService } from '../../../services/admin-payment-analytics.service';
import { authenticateUser } from '../../../middleware/auth';
import { getPrismaClient } from '../../../core/db/prisma';
import Stripe from 'stripe';

const prisma = getPrismaClient();

// Only initialize Stripe if API key is configured
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null;

const adminAnalyticsService = stripe
  ? new AdminPaymentAnalyticsService(prisma, stripe)
  : null;

/**
 * Middleware to verify admin access
 */
async function requireAdmin(request: FastifyRequest, reply: any) {
  const user = (request as any).user;

  if (!user) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized',
    });
  }

  // Check if user has admin role
  const userRecord = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true },
  });

  if (!userRecord || userRecord.role?.name !== 'admin') {
    return reply.status(403).send({
      success: false,
      error: 'Forbidden: Admin access required',
    });
  }
}

export async function registerAdminPaymentAnalyticsRoutes(app: FastifyInstance) {
  // Skip route registration if Stripe is not configured
  if (!adminAnalyticsService) {
    app.log.warn(
      'Skipping admin payment analytics routes - STRIPE_SECRET_KEY not configured'
    );
    return;
  }

  /**
   * GET /admin/payment-stats
   * Get comprehensive payment dashboard statistics
   */
  app.get(
    '/admin/payment-stats',
    {
      preHandler: [authenticateUser, requireAdmin],
    },
    async (request, reply) => {
      try {
        const stats = await adminAnalyticsService.getPaymentStats();

        return reply.status(200).send({
          success: true,
          data: stats,
        });
      } catch (error: any) {
        request.log.error('Failed to fetch payment stats:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch payment statistics',
        });
      }
    }
  );

  /**
   * GET /admin/recent-transactions
   * Get recent transaction list
   */
  app.get<{
    Querystring: { limit?: string };
  }>(
    '/admin/recent-transactions',
    {
      preHandler: [authenticateUser, requireAdmin],
    },
    async (request, reply) => {
      try {
        const limit = request.query.limit ? parseInt(request.query.limit) : 10;
        const transactions = await adminAnalyticsService.getRecentTransactions(limit);

        return reply.status(200).send({
          success: true,
          data: transactions,
        });
      } catch (error: any) {
        request.log.error('Failed to fetch recent transactions:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch transactions',
        });
      }
    }
  );

  /**
   * GET /admin/webhook-events
   * Get webhook event log
   */
  app.get<{
    Querystring: { limit?: string };
  }>(
    '/admin/webhook-events',
    {
      preHandler: [authenticateUser, requireAdmin],
    },
    async (request, reply) => {
      try {
        const limit = request.query.limit ? parseInt(request.query.limit) : 20;
        const events = await adminAnalyticsService.getWebhookEvents(limit);

        return reply.status(200).send({
          success: true,
          data: events,
        });
      } catch (error: any) {
        request.log.error('Failed to fetch webhook events:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch webhook events',
        });
      }
    }
  );

  /**
   * GET /admin/failed-payments
   * Get failed payment tracking
   */
  app.get<{
    Querystring: { limit?: string };
  }>(
    '/admin/failed-payments',
    {
      preHandler: [authenticateUser, requireAdmin],
    },
    async (request, reply) => {
      try {
        const limit = request.query.limit ? parseInt(request.query.limit) : 10;
        const failedPayments = await adminAnalyticsService.getFailedPayments(limit);

        return reply.status(200).send({
          success: true,
          data: failedPayments,
        });
      } catch (error: any) {
        request.log.error('Failed to fetch failed payments:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch failed payments',
        });
      }
    }
  );

  /**
   * GET /admin/subscription-analytics
   * Get detailed subscription analytics and trends
   */
  app.get<{
    Querystring: { range?: string };
  }>(
    '/admin/subscription-analytics',
    {
      preHandler: [authenticateUser, requireAdmin],
    },
    async (request, reply) => {
      try {
        const range = request.query.range || '30d';
        const analytics = await adminAnalyticsService.getSubscriptionAnalytics(range);

        return reply.status(200).send({
          success: true,
          data: analytics,
        });
      } catch (error: any) {
        request.log.error('Failed to fetch subscription analytics:', error);
        return reply.status(500).send({
          success: false,
          error: 'Failed to fetch subscription analytics',
        });
      }
    }
  );
}
