/**
 * Stripe Service
 *
 * Wrapper for Stripe SDK with error handling, webhook processing,
 * and subscription management for TIER Golf subscriptions.
 *
 * Features:
 * - Payment method management
 * - Subscription creation and management
 * - Invoice generation and payment
 * - Webhook event processing
 * - Apple Pay / Google Pay support
 */

import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../core/errors';
import { emailService } from './email.service';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

if (!STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured - Stripe features disabled');
}

// Initialize Stripe with API version
const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null;

/**
 * Subscription Plan Pricing (in NOK cents/øre)
 * Match with your subscription tiers
 */
export const SUBSCRIPTION_PRICES = {
  // Player tiers
  PLAYER_PREMIUM_MONTHLY: 14900, // 149 NOK
  PLAYER_PREMIUM_YEARLY: 149900, // 1499 NOK (save ~15%)
  PLAYER_ELITE_MONTHLY: 29900, // 299 NOK
  PLAYER_ELITE_YEARLY: 299900, // 2999 NOK (save ~15%)

  // Coach tiers
  COACH_BASE_MONTHLY: 19900, // 199 NOK
  COACH_BASE_YEARLY: 199900, // 1999 NOK
  COACH_PRO_MONTHLY: 49900, // 499 NOK
  COACH_PRO_YEARLY: 499900, // 4999 NOK
  COACH_TEAM_MONTHLY: 99900, // 999 NOK
  COACH_TEAM_YEARLY: 999900, // 9999 NOK
};

export class StripeService {
  constructor(private prisma: PrismaClient) {
    if (!stripe) {
      console.warn('StripeService initialized without Stripe API key');
    }
  }

  /**
   * Check if Stripe is configured
   */
  private ensureStripeConfigured(): Stripe {
    if (!stripe) {
      throw new AppError('Stripe is not configured', 500);
    }
    return stripe;
  }

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  /**
   * Create a Setup Intent for adding payment method
   * This allows collecting card details without charging
   */
  async createSetupIntent(customerId?: string): Promise<Stripe.SetupIntent> {
    const stripe = this.ensureStripeConfigured();

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card', 'apple_pay', 'google_pay'],
      usage: 'off_session', // Allow charging without customer present
    });

    return setupIntent;
  }

  /**
   * Attach a payment method to a customer
   */
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    const stripe = this.ensureStripeConfigured();

    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    return paymentMethod;
  }

  /**
   * Set a payment method as default for a customer
   */
  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.Customer> {
    const stripe = this.ensureStripeConfigured();

    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return customer;
  }

  /**
   * Detach (remove) a payment method
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    const stripe = this.ensureStripeConfigured();

    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    return paymentMethod;
  }

  /**
   * List all payment methods for a customer
   */
  async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const stripe = this.ensureStripeConfigured();

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  }

  // ============================================================================
  // CUSTOMERS
  // ============================================================================

  /**
   * Create a Stripe customer
   */
  async createCustomer(params: {
    email: string;
    name: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Customer> {
    const stripe = this.ensureStripeConfigured();

    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata || {},
    });

    return customer;
  }

  /**
   * Get or create a Stripe customer for a user
   */
  async getOrCreateCustomer(userId: string, email: string, name: string): Promise<string> {
    // Check if user already has a Stripe customer ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (user?.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await this.createCustomer({
      email,
      name,
      metadata: { userId },
    });

    // Store Stripe customer ID in database
    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================

  /**
   * Create a subscription
   */
  async createSubscription(params: {
    customerId: string;
    priceId: string;
    paymentMethodId?: string;
    trialPeriodDays?: number;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripeConfigured();

    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: params.customerId,
      items: [{ price: params.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: params.metadata || {},
    };

    if (params.paymentMethodId) {
      subscriptionParams.default_payment_method = params.paymentMethodId;
    }

    if (params.trialPeriodDays) {
      subscriptionParams.trial_period_days = params.trialPeriodDays;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);
    return subscription;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripeConfigured();

    if (cancelAtPeriodEnd) {
      // Cancel at end of billing period
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return subscription;
    } else {
      // Cancel immediately
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    }
  }

  /**
   * Resume a subscription that's set to cancel
   */
  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripeConfigured();

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return subscription;
  }

  /**
   * Update subscription (change plan, etc.)
   */
  async updateSubscription(
    subscriptionId: string,
    params: {
      priceId?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<Stripe.Subscription> {
    const stripe = this.ensureStripeConfigured();

    const updateParams: Stripe.SubscriptionUpdateParams = {
      metadata: params.metadata,
    };

    if (params.priceId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      updateParams.items = [
        {
          id: subscription.items.data[0].id,
          price: params.priceId,
        },
      ];
    }

    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      updateParams
    );

    return updatedSubscription;
  }

  // ============================================================================
  // INVOICES
  // ============================================================================

  /**
   * Create an invoice
   */
  async createInvoice(params: {
    customerId: string;
    amount: number;
    currency: string;
    description: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Invoice> {
    const stripe = this.ensureStripeConfigured();

    // Create an invoice item
    await stripe.invoiceItems.create({
      customer: params.customerId,
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      description: params.description,
      metadata: params.metadata || {},
    });

    // Create and finalize invoice
    const invoice = await stripe.invoices.create({
      customer: params.customerId,
      auto_advance: true, // Auto-finalize
      collection_method: 'charge_automatically',
      metadata: params.metadata || {},
    });

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    return finalizedInvoice;
  }

  /**
   * Pay an invoice
   */
  async payInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    const stripe = this.ensureStripeConfigured();

    const invoice = await stripe.invoices.pay(invoiceId);
    return invoice;
  }

  // ============================================================================
  // PAYMENT INTENTS
  // ============================================================================

  /**
   * Create a one-time payment
   */
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId?: string;
    paymentMethodId?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    const stripe = this.ensureStripeConfigured();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      customer: params.customerId,
      payment_method: params.paymentMethodId,
      description: params.description,
      metadata: params.metadata || {},
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    return paymentIntent;
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    const stripe = this.ensureStripeConfigured();

    const params: Stripe.PaymentIntentConfirmParams = {};
    if (paymentMethodId) {
      params.payment_method = paymentMethodId;
    }

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, params);
    return paymentIntent;
  }

  // ============================================================================
  // WEBHOOKS
  // ============================================================================

  /**
   * Verify and construct webhook event
   */
  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const stripe = this.ensureStripeConfigured();

    if (!STRIPE_WEBHOOK_SECRET) {
      throw new AppError('Stripe webhook secret not configured', 500);
    }

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (err: any) {
      throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
    }
  }

  /**
   * Process webhook events
   */
  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    console.log(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  // ============================================================================
  // WEBHOOK HANDLERS (Private)
  // ============================================================================

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    // Update subscription in database
    const customerId = subscription.customer as string;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.warn(`User not found for Stripe customer: ${customerId}`);
      return;
    }

    // TODO: Update subscription in database
    console.log(`Subscription updated for user: ${user.id}`, subscription.id);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    // Mark subscription as cancelled in database
    const customerId = subscription.customer as string;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      include: { profile: true },
    });

    if (!user) {
      console.warn(`User not found for Stripe customer: ${customerId}`);
      return;
    }

    // TODO: Cancel subscription in database
    console.log(`Subscription cancelled for user: ${user.id}`, subscription.id);

    // Send subscription canceled email
    try {
      const accessEndDate = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : new Date();

      await emailService.sendSubscriptionCanceledEmail(user.email, {
        userName: user.profile?.fullName || user.email,
        planType: subscription.items.data[0]?.price.nickname || 'Subscription',
        accessEndDate,
      });
    } catch (error) {
      console.error('Failed to send subscription canceled email:', error);
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    // Mark invoice as paid in database
    console.log(`Invoice paid:`, invoice.id);

    // Get user from customer ID
    const customerId = invoice.customer as string;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      include: { profile: true },
    });

    if (!user) {
      console.warn(`User not found for Stripe customer: ${customerId}`);
      return;
    }

    // Send payment successful email
    try {
      await emailService.sendPaymentSuccessfulEmail(user.email, {
        userName: user.profile?.fullName || user.email,
        amount: invoice.amount_paid,
        currency: invoice.currency.toUpperCase(),
        planType: invoice.lines.data[0]?.description || 'Subscription',
        invoiceUrl: invoice.invoice_pdf || undefined,
      });
    } catch (error) {
      console.error('Failed to send payment successful email:', error);
    }
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // Handle failed payment (send email, etc.)
    console.log(`Invoice payment failed:`, invoice.id);

    // Get user from customer ID
    const customerId = invoice.customer as string;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      include: { profile: true },
    });

    if (!user) {
      console.warn(`User not found for Stripe customer: ${customerId}`);
      return;
    }

    // Send payment failed email
    try {
      await emailService.sendPaymentFailedEmail(user.email, {
        userName: user.profile?.fullName || user.email,
        amount: invoice.amount_due,
        currency: invoice.currency.toUpperCase(),
        failureReason: invoice.last_finalization_error?.message || 'Payment declined',
        retryDate: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : undefined,
      });
    } catch (error) {
      console.error('Failed to send payment failed email:', error);
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // Handle successful one-time payment
    console.log(`Payment succeeded:`, paymentIntent.id);
    // TODO: Update payment record in database
  }
}

export default StripeService;
