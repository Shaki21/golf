/**
 * Payment & Billing Validation Schemas
 */

import { z } from 'zod';

// Payment Methods
export const addPaymentMethodSchema = z.object({
  type: z.enum(['stripe', 'vipps', 'invoice']),
  stripePaymentMethodId: z.string().optional(),
  vippsPhoneNumber: z.string().optional(),
  last4: z.string().optional(),
  brand: z.string().optional(),
  expiryMonth: z.number().int().min(1).max(12).optional(),
  expiryYear: z.number().int().optional(),
  isDefault: z.boolean().default(false),
});

export const listPaymentMethodsSchema = z.object({
  playerId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  coachId: z.string().uuid().optional(),
});

export const deletePaymentMethodSchema = z.object({
  id: z.string().uuid(),
});

// Invoices
export const createInvoiceSchema = z.object({
  playerId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  coachId: z.string().uuid().optional(),
  invoiceNumber: z.string().optional(), // Auto-generated if not provided
  amount: z.number().positive(),
  currency: z.string().default('NOK'),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number(),
    amount: z.number(),
  })),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const listInvoicesSchema = z.object({
  playerId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  coachId: z.string().uuid().optional(),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const payInvoiceSchema = z.object({
  id: z.string().uuid(),
  paymentMethodId: z.string().uuid(),
});

// Stripe Setup Intent
export const createSetupIntentSchema = z.object({
  // No input required, creates setup intent for current user
});

// Subscriptions
export const createSubscriptionSchema = z.object({
  playerId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  coachId: z.string().uuid().optional(),
  planType: z.enum(['basic', 'premium', 'elite']).optional(),
  billingInterval: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  // New fields for Stripe checkout flow
  planId: z.string().optional(), // 'premium', 'elite', 'base', 'pro', 'team'
  interval: z.enum(['monthly', 'yearly']).optional(),
  paymentMethodId: z.string().optional(), // Can be UUID or Stripe payment method ID
  startDate: z.string().datetime().optional(),
});

export const listSubscriptionsSchema = z.object({
  playerId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  status: z.enum(['active', 'cancelled', 'past_due', 'paused']).optional(),
});

export const cancelSubscriptionSchema = z.object({
  id: z.string().uuid(),
  cancelAtPeriodEnd: z.boolean().default(true),
  reason: z.string().optional(),
});

// Session Packages
export const createSessionPackageSchema = z.object({
  playerId: z.string().uuid(),
  coachId: z.string().uuid(),
  packageType: z.enum(['5-pack', '10-pack', '20-pack', 'custom']),
  totalSessions: z.number().int().positive(),
  price: z.number().positive(),
  validityDays: z.number().int().positive().default(90),
  paymentMethodId: z.string().uuid().optional(),
});

export const useSessionSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type AddPaymentMethodInput = z.infer<typeof addPaymentMethodSchema>;
export type ListPaymentMethodsInput = z.infer<typeof listPaymentMethodsSchema>;
export type DeletePaymentMethodInput = z.infer<typeof deletePaymentMethodSchema>;

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type ListInvoicesInput = z.infer<typeof listInvoicesSchema>;
export type PayInvoiceInput = z.infer<typeof payInvoiceSchema>;

export type CreateSetupIntentInput = z.infer<typeof createSetupIntentSchema>;

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type ListSubscriptionsInput = z.infer<typeof listSubscriptionsSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;

export type CreateSessionPackageInput = z.infer<typeof createSessionPackageSchema>;
export type UseSessionInput = z.infer<typeof useSessionSchema>;
