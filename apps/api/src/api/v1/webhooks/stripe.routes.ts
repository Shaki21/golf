/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for subscription lifecycle, payments, and billing
 *
 * Events handled:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.paid
 * - invoice.payment_failed
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - customer.updated
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { StripeService } from '../../../services/stripe.service';
import { WebhookLoggerService } from '../../../services/webhook-logger.service';
import { getPrismaClient } from '../../../core/db/prisma';

export async function stripeWebhookRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const stripeService = new StripeService(prisma);
  const webhookLogger = new WebhookLoggerService(prisma);

  /**
   * POST /webhooks/stripe
   * Handle Stripe webhook events
   *
   * IMPORTANT: This endpoint requires raw body parsing for signature verification
   * The signature verification ensures the webhook came from Stripe
   */
  app.post(
    '/stripe',
    {
      config: {
        // Skip body parsing - we need raw body for signature verification
        rawBody: true,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const signature = request.headers['stripe-signature'];

        if (!signature || typeof signature !== 'string') {
          app.log.error('Missing Stripe signature header');
          return reply.status(400).send({
            success: false,
            error: 'Missing Stripe signature',
          });
        }

        // Get raw body for signature verification
        // @ts-ignore - rawBody is added by Fastify plugin
        const rawBody = request.rawBody || request.body;

        // Construct and verify webhook event
        let event: Stripe.Event;
        try {
          event = stripeService.constructWebhookEvent(rawBody, signature);
        } catch (err: any) {
          app.log.error({ error: err.message }, 'Webhook signature verification failed');
          return reply.status(400).send({
            success: false,
            error: `Webhook signature verification failed: ${err.message}`,
          });
        }

        // Log webhook event to database
        await webhookLogger.logEvent(event);

        // Log webhook event to console
        app.log.info(
          {
            eventId: event.id,
            eventType: event.type,
            created: event.created,
          },
          `Received Stripe webhook: ${event.type}`
        );

        // Process the webhook event
        try {
          await stripeService.processWebhookEvent(event);

          // Mark as processed
          await webhookLogger.markProcessed(event.id);

          app.log.info(
            {
              eventId: event.id,
              eventType: event.type,
            },
            `Successfully processed webhook: ${event.type}`
          );

          // Return success to Stripe
          return reply.status(200).send({
            success: true,
            received: true,
            eventId: event.id,
          });
        } catch (processingError: any) {
          // Mark as processed with error
          await webhookLogger.markProcessed(event.id, processingError.message);
          app.log.error(
            {
              error: processingError.message,
              stack: processingError.stack,
              eventId: event.id,
              eventType: event.type,
            },
            `Failed to process webhook: ${event.type}`
          );

          // Still return 200 to prevent Stripe from retrying
          // Log the error for manual investigation
          return reply.status(200).send({
            success: false,
            received: true,
            eventId: event.id,
            error: processingError.message,
          });
        }
      } catch (error: any) {
        app.log.error(
          {
            error: error.message,
            stack: error.stack,
          },
          'Unexpected error in webhook handler'
        );

        // Return 500 for unexpected errors
        return reply.status(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  /**
   * GET /webhooks/stripe/health
   * Health check endpoint for webhook
   */
  app.get('/stripe/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      success: true,
      service: 'stripe-webhook',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });
}
