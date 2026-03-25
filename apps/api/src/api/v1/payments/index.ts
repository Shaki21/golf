/**
 * Payment & Billing API Routes
 *
 * Comprehensive payment system with:
 * - Payment methods (Stripe, Vipps, Invoice)
 * - Invoices and billing
 * - Subscriptions
 * - Session packages
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PaymentService } from './service';
import { getPrismaClient } from '../../../core/db/prisma';
import {
  addPaymentMethodSchema,
  listPaymentMethodsSchema,
  deletePaymentMethodSchema,
  createInvoiceSchema,
  listInvoicesSchema,
  payInvoiceSchema,
  createSetupIntentSchema,
  createSubscriptionSchema,
  listSubscriptionsSchema,
  cancelSubscriptionSchema,
  createSessionPackageSchema,
  useSessionSchema,
  AddPaymentMethodInput,
  ListPaymentMethodsInput,
  CreateInvoiceInput,
  ListInvoicesInput,
  PayInvoiceInput,
  CreateSetupIntentInput,
  CreateSubscriptionInput,
  ListSubscriptionsInput,
  CancelSubscriptionInput,
  CreateSessionPackageInput,
  UseSessionInput,
} from './schema';
import { authenticateUser } from '../../../middleware/auth';
import { validate } from '../../../utils/validation';

export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const paymentService = new PaymentService(prisma);

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  /**
   * POST /payments/methods
   * Add a payment method
   */
  app.post<{ Body: AddPaymentMethodInput }>(
    '/methods',
    { preHandler: authenticateUser },
    async (request: FastifyRequest<{ Body: AddPaymentMethodInput }>, reply: FastifyReply) => {
      const input = validate(addPaymentMethodSchema, request.body);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await paymentService.addPaymentMethod(input, userId, tenantId);

      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /payments/methods
   * List payment methods
   */
  app.get<{ Querystring: ListPaymentMethodsInput }>(
    '/methods',
    { preHandler: authenticateUser },
    async (request: FastifyRequest<{ Querystring: ListPaymentMethodsInput }>, reply: FastifyReply) => {
      const input = validate(listPaymentMethodsSchema, request.query);
      const tenantId = request.user!.tenantId;

      const result = await paymentService.listPaymentMethods(input, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * DELETE /payments/methods/:id
   * Delete a payment method
   */
  app.delete<{ Params: { id: string } }>(
    '/methods/:id',
    { preHandler: authenticateUser },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const input = validate(deletePaymentMethodSchema, request.params);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await paymentService.deletePaymentMethod(input.id, userId, tenantId);

      return reply.status(200).send({
        success: true,
        message: 'Payment method deleted successfully',
      });
    }
  );

  // ============================================================================
  // INVOICES
  // ============================================================================

  /**
   * POST /payments/invoices
   * Create an invoice
   */
  app.post<{ Body: CreateInvoiceInput }>(
    '/invoices',
    { preHandler: authenticateUser },
    async (request: FastifyRequest<{ Body: CreateInvoiceInput }>, reply: FastifyReply) => {
      const input = validate(createInvoiceSchema, request.body);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await paymentService.createInvoice(input, userId, tenantId);

      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /payments/invoices
   * List invoices
   */
  app.get<{ Querystring: ListInvoicesInput }>(
    '/invoices',
    { preHandler: authenticateUser },
    async (request: FastifyRequest<{ Querystring: ListInvoicesInput }>, reply: FastifyReply) => {
      const input = validate(listInvoicesSchema, request.query);
      const tenantId = request.user!.tenantId;

      const result = await paymentService.listInvoices(input, tenantId);

      return reply.status(200).send({
        success: true,
        data: result.invoices,
        total: result.total,
      });
    }
  );

  /**
   * GET /payments/invoices/:id
   * Get invoice by ID
   */
  app.get<{ Params: { id: string } }>(
    '/invoices/:id',
    { preHandler: authenticateUser },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const tenantId = request.user!.tenantId;

      const result = await paymentService.getInvoice(request.params.id, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * POST /payments/invoices/:id/pay
   * Pay an invoice
   */
  app.post<{ Params: { id: string }; Body: Omit<PayInvoiceInput, 'id'> }>(
    '/invoices/:id/pay',
    { preHandler: authenticateUser },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: Omit<PayInvoiceInput, 'id'> }>,
      reply: FastifyReply
    ) => {
      const input = validate(payInvoiceSchema, {
        id: request.params.id,
        ...request.body,
      });
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await paymentService.payInvoice(input, userId, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
        message: 'Invoice paid successfully',
      });
    }
  );

  // ============================================================================
  // STRIPE SETUP INTENT
  // ============================================================================

  /**
   * POST /payments/setup-intent
   * Create a Stripe Setup Intent for adding payment method
   */
  app.post<{ Body: CreateSetupIntentInput }>(
    '/setup-intent',
    { preHandler: authenticateUser },
    async (request: FastifyRequest<{ Body: CreateSetupIntentInput }>, reply: FastifyReply) => {
      const userId = request.user!.id;

      const result = await paymentService.createSetupIntentForUser(userId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================

  /**
   * POST /payments/subscriptions
   * Create a subscription
   */
  app.post<{ Body: CreateSubscriptionInput }>(
    '/subscriptions',
    { preHandler: authenticateUser },
    async (request: FastifyRequest<{ Body: CreateSubscriptionInput }>, reply: FastifyReply) => {
      const input = validate(createSubscriptionSchema, request.body);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await paymentService.createSubscription(input, userId, tenantId);

      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * GET /payments/subscriptions
   * List subscriptions
   */
  app.get<{ Querystring: ListSubscriptionsInput }>(
    '/subscriptions',
    { preHandler: authenticateUser },
    async (request: FastifyRequest<{ Querystring: ListSubscriptionsInput }>, reply: FastifyReply) => {
      const input = validate(listSubscriptionsSchema, request.query);
      const tenantId = request.user!.tenantId;

      const result = await paymentService.listSubscriptions(input, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * POST /payments/subscriptions/:id/cancel
   * Cancel a subscription
   */
  app.post<{ Params: { id: string }; Body: Omit<CancelSubscriptionInput, 'id'> }>(
    '/subscriptions/:id/cancel',
    { preHandler: authenticateUser },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: Omit<CancelSubscriptionInput, 'id'> }>,
      reply: FastifyReply
    ) => {
      const input = validate(cancelSubscriptionSchema, {
        id: request.params.id,
        ...request.body,
      });
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await paymentService.cancelSubscription(input, userId, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
        message: 'Subscription cancelled successfully',
      });
    }
  );

  // ============================================================================
  // SESSION PACKAGES
  // ============================================================================

  /**
   * POST /payments/session-packages
   * Create a session package
   */
  app.post<{ Body: CreateSessionPackageInput }>(
    '/session-packages',
    { preHandler: authenticateUser },
    async (request: FastifyRequest<{ Body: CreateSessionPackageInput }>, reply: FastifyReply) => {
      const input = validate(createSessionPackageSchema, request.body);
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await paymentService.createSessionPackage(input, userId, tenantId);

      return reply.status(201).send({
        success: true,
        data: result,
      });
    }
  );

  /**
   * POST /payments/session-packages/:id/use
   * Use a session from package
   */
  app.post<{ Params: { id: string }; Body: Omit<UseSessionInput, 'id'> }>(
    '/session-packages/:id/use',
    { preHandler: authenticateUser },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: Omit<UseSessionInput, 'id'> }>,
      reply: FastifyReply
    ) => {
      const input = validate(useSessionSchema, {
        id: request.params.id,
        ...request.body,
      });
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;

      const result = await paymentService.useSession(input, userId, tenantId);

      return reply.status(200).send({
        success: true,
        data: result,
        message: `Session used. ${result.remainingSessions} sessions remaining.`,
      });
    }
  );
}
