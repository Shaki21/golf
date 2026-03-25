/**
 * Payment & Billing Service
 *
 * Handles payment methods, invoices, subscriptions, and session packages
 *
 * UPDATED: Now with full Stripe integration for real payments
 */

import { PrismaClient } from '@prisma/client';
import {
  AddPaymentMethodInput,
  ListPaymentMethodsInput,
  CreateInvoiceInput,
  ListInvoicesInput,
  PayInvoiceInput,
  CreateSubscriptionInput,
  ListSubscriptionsInput,
  CancelSubscriptionInput,
  CreateSessionPackageInput,
  UseSessionInput,
} from './schema';
import { AppError } from '../../../core/errors';
import { StripeService } from '../../../services/stripe.service';

export class PaymentService {
  private stripeService: StripeService;

  constructor(private prisma: PrismaClient) {
    this.stripeService = new StripeService(prisma);
  }

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  /**
   * Add a new payment method
   * NOW WITH STRIPE INTEGRATION
   */
  async addPaymentMethod(input: AddPaymentMethodInput, userId: string, tenantId: string) {
    // Get user data for Stripe customer
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true, stripeCustomerId: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get or create Stripe customer
    const customerId = await this.stripeService.getOrCreateCustomer(
      userId,
      user.email,
      `${user.firstName} ${user.lastName}`
    );

    // Attach payment method to Stripe customer
    let stripePaymentMethod;
    if (input.stripePaymentMethodId) {
      stripePaymentMethod = await this.stripeService.attachPaymentMethod(
        input.stripePaymentMethodId,
        customerId
      );

      // Set as default if requested
      if (input.isDefault) {
        await this.stripeService.setDefaultPaymentMethod(
          customerId,
          input.stripePaymentMethodId
        );
      }
    }

    // Create payment method in database
    const paymentMethod = await this.prisma.paymentMethod.create({
      data: {
        tenantId,
        playerId: userId, // Assuming user is a player; adjust based on role
        type: input.type,
        stripePaymentMethodId: stripePaymentMethod?.id || input.stripePaymentMethodId,
        vippsPhoneNumber: input.vippsPhoneNumber,
        last4: stripePaymentMethod?.card?.last4 || input.last4,
        brand: stripePaymentMethod?.card?.brand || input.brand,
        expiryMonth: stripePaymentMethod?.card?.exp_month || input.expiryMonth,
        expiryYear: stripePaymentMethod?.card?.exp_year || input.expiryYear,
        isDefault: input.isDefault,
      },
    });

    // If this is set as default, unset other defaults in database
    if (input.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: {
          id: { not: paymentMethod.id },
          playerId: userId,
        },
        data: { isDefault: false },
      });
    }

    return paymentMethod;
  }

  /**
   * List payment methods
   */
  async listPaymentMethods(input: ListPaymentMethodsInput, tenantId: string) {
    const where: any = { tenantId };

    if (input.playerId) where.playerId = input.playerId;
    if (input.parentId) where.parentId = input.parentId;
    if (input.coachId) where.coachId = input.coachId;

    return this.prisma.paymentMethod.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Delete a payment method
   * NOW WITH STRIPE INTEGRATION
   */
  async deletePaymentMethod(id: string, userId: string, tenantId: string) {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id, tenantId },
    });

    if (!paymentMethod) {
      throw new AppError('Payment method not found', 404);
    }

    // Detach from Stripe
    if (paymentMethod.stripePaymentMethodId) {
      try {
        await this.stripeService.detachPaymentMethod(paymentMethod.stripePaymentMethodId);
      } catch (error) {
        console.error('Failed to detach Stripe payment method:', error);
        // Continue with database deletion even if Stripe fails
      }
    }

    // Delete from database
    await this.prisma.paymentMethod.delete({ where: { id } });

    return { success: true };
  }

  /**
   * Create a Stripe Setup Intent for adding payment method
   * Used in the checkout flow to collect payment details
   */
  async createSetupIntentForUser(userId: string) {
    // Get user data for Stripe customer
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true, stripeCustomerId: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get or create Stripe customer
    const customerId = await this.stripeService.getOrCreateCustomer(
      userId,
      user.email,
      `${user.firstName} ${user.lastName}`
    );

    // Create Setup Intent
    const setupIntent = await this.stripeService.createSetupIntent(customerId);

    return {
      clientSecret: setupIntent.client_secret,
      customerId,
    };
  }

  // ============================================================================
  // INVOICES
  // ============================================================================

  /**
   * Create an invoice
   */
  async createInvoice(input: CreateInvoiceInput, userId: string, tenantId: string) {
    // Generate invoice number if not provided
    const invoiceNumber =
      input.invoiceNumber || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate due date (default 30 days from now)
    const dueDate = input.dueDate
      ? new Date(input.dueDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        playerId: input.playerId,
        parentId: input.parentId,
        coachId: input.coachId || userId,
        invoiceNumber,
        amount: input.amount,
        currency: input.currency,
        items: input.items,
        dueDate,
        notes: input.notes,
        status: 'pending',
      },
    });

    // TODO: In production, create Stripe invoice
    // const stripeInvoice = await stripe.invoices.create({...});

    return invoice;
  }

  /**
   * List invoices
   */
  async listInvoices(input: ListInvoicesInput, tenantId: string) {
    const where: any = { tenantId };

    if (input.playerId) where.playerId = input.playerId;
    if (input.parentId) where.parentId = input.parentId;
    if (input.coachId) where.coachId = input.coachId;
    if (input.status) where.status = input.status;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
        include: {
          player: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          coach: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { invoices, total };
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(id: string, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    return invoice;
  }

  /**
   * Pay an invoice
   * NOW WITH STRIPE INTEGRATION
   */
  async payInvoice(input: PayInvoiceInput, userId: string, tenantId: string) {
    const invoice = await this.getInvoice(input.id, tenantId);

    if (invoice.status === 'paid') {
      throw new AppError('Invoice already paid', 400);
    }

    // Get payment method
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: {
        id: input.paymentMethodId,
        tenantId,
      },
    });

    if (!paymentMethod) {
      throw new AppError('Payment method not found', 404);
    }

    if (!paymentMethod.stripePaymentMethodId) {
      throw new AppError('Payment method not configured with Stripe', 400);
    }

    // Get user's Stripe customer ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new AppError('User not configured with Stripe', 400);
    }

    // Create payment intent with Stripe
    const paymentIntent = await this.stripeService.createPaymentIntent({
      amount: Math.round(invoice.amount * 100), // Convert to øre/cents
      currency: invoice.currency || 'NOK',
      customerId: user.stripeCustomerId,
      paymentMethodId: paymentMethod.stripePaymentMethodId,
      description: `Invoice ${invoice.invoiceNumber}`,
      metadata: {
        invoiceId: invoice.id,
        tenantId,
      },
    });

    // Confirm the payment
    const confirmedPayment = await this.stripeService.confirmPaymentIntent(
      paymentIntent.id,
      paymentMethod.stripePaymentMethodId
    );

    if (confirmedPayment.status !== 'succeeded') {
      throw new AppError('Payment failed', 400);
    }

    // Update invoice status
    const updated = await this.prisma.invoice.update({
      where: { id: input.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
        stripePaymentIntentId: confirmedPayment.id,
      },
    });

    return updated;
  }

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================

  /**
   * Create a subscription
   * NOW WITH STRIPE INTEGRATION + Apple Pay + Google Pay support
   */
  async createSubscription(input: CreateSubscriptionInput, userId: string, tenantId: string) {
    // Get user data
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true, stripeCustomerId: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get or create Stripe customer
    const customerId = await this.stripeService.getOrCreateCustomer(
      userId,
      user.email,
      `${user.firstName} ${user.lastName}`
    );

    // Determine Stripe payment method ID
    let stripePaymentMethodId: string;

    // Check if paymentMethodId is a Stripe payment method ID (starts with 'pm_') or a database UUID
    if (input.paymentMethodId && input.paymentMethodId.startsWith('pm_')) {
      // Direct Stripe payment method ID from checkout flow
      stripePaymentMethodId = input.paymentMethodId;

      // Attach payment method to customer
      await this.stripeService.attachPaymentMethod(stripePaymentMethodId, customerId);
      await this.stripeService.setDefaultPaymentMethod(customerId, stripePaymentMethodId);
    } else if (input.paymentMethodId) {
      // Database UUID - lookup payment method
      const paymentMethod = await this.prisma.paymentMethod.findFirst({
        where: {
          id: input.paymentMethodId,
          tenantId,
        },
      });

      if (!paymentMethod) {
        throw new AppError('Payment method not found', 404);
      }

      if (!paymentMethod.stripePaymentMethodId) {
        throw new AppError('Payment method not configured with Stripe', 400);
      }

      stripePaymentMethodId = paymentMethod.stripePaymentMethodId;
    } else {
      throw new AppError('Payment method ID is required', 400);
    }

    // Determine plan and interval (support both old and new formats)
    const planId = input.planId || input.planType; // New or old format
    const interval = input.interval || input.billingInterval; // New or old format

    if (!planId || !interval) {
      throw new AppError('Plan ID and interval are required', 400);
    }

    // Map plan IDs to Stripe price environment variable names
    const priceEnvVarMap: Record<string, string> = {
      // Player plans
      premium: 'STRIPE_PRICE_PREMIUM',
      elite: 'STRIPE_PRICE_ELITE',
      // Coach plans
      base: 'STRIPE_PRICE_BASE',
      pro: 'STRIPE_PRICE_PRO',
      team: 'STRIPE_PRICE_TEAM',
      // Legacy support
      basic: 'STRIPE_PRICE_BASIC',
    };

    const priceEnvVarName = priceEnvVarMap[planId];
    if (!priceEnvVarName) {
      throw new AppError(`Invalid plan ID: ${planId}`, 400);
    }

    // Get Stripe Price ID from environment variables
    const intervalSuffix = interval === 'monthly' ? 'MONTHLY' : interval === 'yearly' ? 'YEARLY' : interval.toUpperCase();
    const stripePriceId = process.env[`${priceEnvVarName}_${intervalSuffix}`];

    if (!stripePriceId) {
      throw new AppError(
        `Stripe price not configured for ${planId} ${interval}. Set ${priceEnvVarName}_${intervalSuffix} in .env`,
        500
      );
    }

    const startDate = input.startDate ? new Date(input.startDate) : new Date();

    // Create Stripe subscription with trial period
    const stripeSubscription = await this.stripeService.createSubscription({
      customerId,
      priceId: stripePriceId,
      paymentMethodId: stripePaymentMethodId,
      trialPeriodDays: 14, // 14-day free trial
      metadata: {
        userId,
        tenantId,
        playerId: input.playerId || userId,
        planId: planId,
        interval: interval,
      },
    });

    // Create subscription in database
    const subscription = await this.prisma.subscription.create({
      data: {
        tenantId,
        playerId: input.playerId,
        parentId: input.parentId,
        coachId: input.coachId,
        planType: input.planType,
        billingInterval: input.billingInterval,
        amount,
        currency: 'NOK',
        status: 'active',
        currentPeriodStart: startDate,
        currentPeriodEnd: this.calculatePeriodEnd(startDate, input.billingInterval),
        stripeSubscriptionId: stripeSubscription.id,
      },
    });

    return subscription;
  }

  /**
   * List subscriptions
   */
  async listSubscriptions(input: ListSubscriptionsInput, tenantId: string) {
    const where: any = { tenantId };

    if (input.playerId) where.playerId = input.playerId;
    if (input.parentId) where.parentId = input.parentId;
    if (input.status) where.status = input.status;

    return this.prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(input: CancelSubscriptionInput, userId: string, tenantId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id: input.id, tenantId },
    });

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    // TODO: Cancel in Stripe
    // await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    //   cancel_at_period_end: input.cancelAtPeriodEnd,
    // });

    const updated = await this.prisma.subscription.update({
      where: { id: input.id },
      data: {
        status: input.cancelAtPeriodEnd ? subscription.status : 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: input.reason,
      },
    });

    return updated;
  }

  // ============================================================================
  // SESSION PACKAGES
  // ============================================================================

  /**
   * Create a session package
   */
  async createSessionPackage(input: CreateSessionPackageInput, userId: string, tenantId: string) {
    const expiresAt = new Date(Date.now() + input.validityDays * 24 * 60 * 60 * 1000);

    const sessionPackage = await this.prisma.sessionPackage.create({
      data: {
        tenantId,
        playerId: input.playerId,
        coachId: input.coachId,
        packageType: input.packageType,
        totalSessions: input.totalSessions,
        remainingSessions: input.totalSessions,
        price: input.price,
        expiresAt,
        status: 'active',
      },
    });

    // If payment method provided, create and pay invoice
    if (input.paymentMethodId) {
      const invoice = await this.createInvoice(
        {
          playerId: input.playerId,
          coachId: input.coachId,
          amount: input.price,
          items: [
            {
              description: `Session package: ${input.packageType} (${input.totalSessions} sessions)`,
              quantity: 1,
              unitPrice: input.price,
              amount: input.price,
            },
          ],
        },
        userId,
        tenantId
      );

      await this.payInvoice(
        { id: invoice.id, paymentMethodId: input.paymentMethodId },
        userId,
        tenantId
      );
    }

    return sessionPackage;
  }

  /**
   * Use a session from package
   */
  async useSession(input: UseSessionInput, userId: string, tenantId: string) {
    const sessionPackage = await this.prisma.sessionPackage.findFirst({
      where: {
        id: input.id,
        tenantId,
        status: 'active',
      },
    });

    if (!sessionPackage) {
      throw new AppError('Session package not found or inactive', 404);
    }

    if (sessionPackage.remainingSessions <= 0) {
      throw new AppError('No sessions remaining in package', 400);
    }

    if (sessionPackage.expiresAt && sessionPackage.expiresAt < new Date()) {
      throw new AppError('Session package has expired', 400);
    }

    const updated = await this.prisma.sessionPackage.update({
      where: { id: input.id },
      data: {
        remainingSessions: sessionPackage.remainingSessions - 1,
        usedSessions: sessionPackage.usedSessions + 1,
        status: sessionPackage.remainingSessions - 1 === 0 ? 'depleted' : 'active',
      },
    });

    return updated;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private calculatePeriodEnd(startDate: Date, interval: string): Date {
    const end = new Date(startDate);
    if (interval === 'monthly') {
      end.setMonth(end.getMonth() + 1);
    } else if (interval === 'quarterly') {
      end.setMonth(end.getMonth() + 3);
    } else if (interval === 'yearly') {
      end.setFullYear(end.getFullYear() + 1);
    }
    return end;
  }
}
