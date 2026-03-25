/**
 * Admin Payment Analytics Service
 *
 * Provides comprehensive analytics and monitoring for payment operations
 *
 * Features:
 * - Revenue metrics (MRR, ARR, total revenue)
 * - Subscription statistics and churn analysis
 * - Customer lifetime value calculation
 * - Payment method analytics
 * - Transaction monitoring
 * - Webhook event tracking
 * - Failed payment detection
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

export interface DashboardStats {
  revenue: {
    mrr: number;
    arr: number;
    totalRevenue: number;
    revenueGrowth: number;
  };
  subscriptions: {
    total: number;
    active: number;
    trialing: number;
    canceled: number;
    churnRate: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
    averageLifetimeValue: number;
  };
  paymentMethods: {
    total: number;
    byType: Record<string, number>;
  };
}

export interface RecentTransaction {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  planType: string;
  createdAt: string;
}

export interface WebhookEventSummary {
  id: string;
  eventType: string;
  processed: boolean;
  error?: string;
  createdAt: string;
}

export interface FailedPayment {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  failureReason: string;
  attemptedAt: string;
}

export class AdminPaymentAnalyticsService {
  constructor(
    private prisma: PrismaClient,
    private stripe: Stripe
  ) {}

  /**
   * Get comprehensive payment statistics
   */
  async getPaymentStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all active subscriptions
    const allSubscriptions = await this.prisma.subscription.findMany({
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = this.calculateMRR(allSubscriptions);

    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12;

    // Get total revenue
    const totalRevenue = await this.calculateTotalRevenue();

    // Calculate revenue growth
    const lastMonthRevenue = await this.calculateRevenueForPeriod(startOfLastMonth, endOfLastMonth);
    const currentMonthRevenue = await this.calculateRevenueForPeriod(startOfMonth, now);
    const revenueGrowth = lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    // Subscription statistics
    const activeSubscriptions = allSubscriptions.filter(
      (sub) => sub.status === 'active' && !sub.cancelAtPeriodEnd
    );
    const trialingSubscriptions = allSubscriptions.filter(
      (sub) => sub.status === 'trialing'
    );
    const canceledSubscriptions = allSubscriptions.filter(
      (sub) => sub.cancelAtPeriodEnd || sub.status === 'canceled'
    );

    // Calculate churn rate
    const churnRate = this.calculateChurnRate(allSubscriptions);

    // Customer statistics
    const totalCustomers = await this.prisma.user.count({
      where: {
        subscriptions: {
          some: {},
        },
      },
    });

    const newCustomersThisMonth = await this.prisma.user.count({
      where: {
        subscriptions: {
          some: {
            createdAt: {
              gte: startOfMonth,
            },
          },
        },
      },
    });

    // Calculate average lifetime value
    const averageLifetimeValue = totalCustomers > 0
      ? totalRevenue / totalCustomers
      : 0;

    // Payment method statistics
    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: {
        deletedAt: null,
      },
    });

    const paymentMethodsByType = paymentMethods.reduce((acc, pm) => {
      acc[pm.type] = (acc[pm.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      revenue: {
        mrr: Math.round(mrr),
        arr: Math.round(arr),
        totalRevenue: Math.round(totalRevenue),
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
      },
      subscriptions: {
        total: allSubscriptions.length,
        active: activeSubscriptions.length,
        trialing: trialingSubscriptions.length,
        canceled: canceledSubscriptions.length,
        churnRate: parseFloat(churnRate.toFixed(2)),
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
        averageLifetimeValue: Math.round(averageLifetimeValue),
      },
      paymentMethods: {
        total: paymentMethods.length,
        byType: paymentMethodsByType,
      },
    };
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 10): Promise<RecentTransaction[]> {
    const subscriptions = await this.prisma.subscription.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    return subscriptions.map((sub) => ({
      id: sub.id,
      customerName: sub.user.profile?.fullName || 'Unknown',
      customerEmail: sub.user.email,
      amount: this.getPlanAmount(sub.planType, sub.billingInterval),
      currency: 'nok',
      status: sub.status,
      planType: sub.planType,
      createdAt: sub.createdAt.toISOString(),
    }));
  }

  /**
   * Get webhook events
   */
  async getWebhookEvents(limit: number = 20): Promise<WebhookEventSummary[]> {
    const events = await this.prisma.webhookEvent.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      processed: event.processed,
      error: event.error || undefined,
      createdAt: event.createdAt.toISOString(),
    }));
  }

  /**
   * Get failed payments
   */
  async getFailedPayments(limit: number = 10): Promise<FailedPayment[]> {
    // Query failed payment attempts from webhook events
    const failedPaymentEvents = await this.prisma.webhookEvent.findMany({
      where: {
        eventType: {
          in: [
            'payment_intent.payment_failed',
            'invoice.payment_failed',
            'charge.failed',
          ],
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const failedPayments: FailedPayment[] = [];

    for (const event of failedPaymentEvents) {
      const eventData = event.eventData as any;

      // Extract customer information
      let customerId = '';
      if (eventData.customer) {
        customerId = eventData.customer;
      } else if (eventData.charge?.customer) {
        customerId = eventData.charge.customer;
      }

      // Find user by Stripe customer ID
      const user = await this.prisma.user.findFirst({
        where: {
          stripeCustomerId: customerId,
        },
        include: {
          profile: true,
        },
      });

      failedPayments.push({
        id: event.id,
        customerName: user?.profile?.fullName || 'Unknown',
        customerEmail: user?.email || 'Unknown',
        amount: eventData.amount_due || eventData.amount || 0,
        currency: eventData.currency || 'nok',
        failureReason: this.extractFailureReason(eventData),
        attemptedAt: event.createdAt.toISOString(),
      });
    }

    return failedPayments;
  }

  /**
   * Calculate MRR from subscriptions
   */
  private calculateMRR(subscriptions: any[]): number {
    let mrr = 0;

    for (const sub of subscriptions) {
      if (sub.status !== 'active' && sub.status !== 'trialing') {
        continue;
      }

      const amount = this.getPlanAmount(sub.planType, sub.billingInterval);

      // Convert to monthly amount
      if (sub.billingInterval === 'yearly') {
        mrr += amount / 12;
      } else {
        mrr += amount;
      }
    }

    return mrr;
  }

  /**
   * Calculate total revenue
   */
  private async calculateTotalRevenue(): Promise<number> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: {
          in: ['active', 'canceled'],
        },
      },
    });

    let total = 0;
    const now = new Date();

    for (const sub of subscriptions) {
      const amount = this.getPlanAmount(sub.planType, sub.billingInterval);
      const createdAt = new Date(sub.createdAt);
      const endDate = sub.canceledAt ? new Date(sub.canceledAt) : now;

      // Calculate months active
      const monthsActive = this.getMonthsDifference(createdAt, endDate);

      if (sub.billingInterval === 'yearly') {
        total += (amount / 12) * monthsActive;
      } else {
        total += amount * monthsActive;
      }
    }

    return total;
  }

  /**
   * Calculate revenue for a specific period
   */
  private async calculateRevenueForPeriod(start: Date, end: Date): Promise<number> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        OR: [
          {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
          {
            AND: [
              {
                createdAt: {
                  lt: start,
                },
              },
              {
                OR: [
                  {
                    canceledAt: null,
                  },
                  {
                    canceledAt: {
                      gte: start,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    let revenue = 0;

    for (const sub of subscriptions) {
      const amount = this.getPlanAmount(sub.planType, sub.billingInterval);
      const monthlyAmount = sub.billingInterval === 'yearly' ? amount / 12 : amount;

      // Calculate overlap with period
      const subStart = new Date(sub.createdAt) > start ? new Date(sub.createdAt) : start;
      const subEnd = sub.canceledAt && new Date(sub.canceledAt) < end
        ? new Date(sub.canceledAt)
        : end;

      const monthsInPeriod = this.getMonthsDifference(subStart, subEnd);
      revenue += monthlyAmount * monthsInPeriod;
    }

    return revenue;
  }

  /**
   * Calculate churn rate
   */
  private calculateChurnRate(subscriptions: any[]): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const activeAtStart = subscriptions.filter((sub) => {
      const createdAt = new Date(sub.createdAt);
      return createdAt < startOfMonth;
    }).length;

    const canceledThisMonth = subscriptions.filter((sub) => {
      if (!sub.canceledAt) return false;
      const canceledAt = new Date(sub.canceledAt);
      return canceledAt >= startOfMonth && canceledAt <= now;
    }).length;

    return activeAtStart > 0 ? (canceledThisMonth / activeAtStart) * 100 : 0;
  }

  /**
   * Get plan amount in minor units (øre for NOK)
   */
  private getPlanAmount(planType: string, interval: string): number {
    const prices: Record<string, { monthly: number; yearly: number }> = {
      premium: { monthly: 14900, yearly: 149900 },
      elite: { monthly: 29900, yearly: 299900 },
      base: { monthly: 19900, yearly: 199900 },
      pro: { monthly: 49900, yearly: 499900 },
      team: { monthly: 99900, yearly: 999900 },
    };

    const plan = prices[planType.toLowerCase()];
    if (!plan) return 0;

    return interval === 'yearly' ? plan.yearly : plan.monthly;
  }

  /**
   * Get months difference between two dates
   */
  private getMonthsDifference(start: Date, end: Date): number {
    const months = (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) +
      (end.getDate() >= start.getDate() ? 1 : 0);
    return Math.max(0, months);
  }

  /**
   * Extract failure reason from Stripe event data
   */
  private extractFailureReason(eventData: any): string {
    if (eventData.last_payment_error?.message) {
      return eventData.last_payment_error.message;
    }
    if (eventData.failure_message) {
      return eventData.failure_message;
    }
    if (eventData.outcome?.reason) {
      return eventData.outcome.reason;
    }
    return 'Payment failed';
  }

  /**
   * Get detailed subscription analytics
   */
  async getSubscriptionAnalytics(range: string = '30d'): Promise<any> {
    const now = new Date();
    let startDate: Date;

    // Calculate date range
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get all subscriptions
    const allSubscriptions = await this.prisma.subscription.findMany({
      include: {
        user: true,
      },
    });

    // Plan distribution
    const planCounts = allSubscriptions.reduce((acc, sub) => {
      if (sub.status === 'active' || sub.status === 'trialing') {
        acc[sub.planType] = (acc[sub.planType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalActive = Object.values(planCounts).reduce((sum, count) => sum + count, 0);

    const planDistribution = Object.entries(planCounts).map(([planType, count]) => {
      const mrr = this.getPlanAmount(planType, 'monthly') * count;
      return {
        planType,
        count,
        percentage: totalActive > 0 ? (count / totalActive) * 100 : 0,
        mrr,
      };
    });

    // Calculate trends
    const trends = await this.calculateTrends(startDate, now, range);

    // Calculate retention rates
    const retention = await this.calculateRetention();

    // Calculate conversions
    const trialSubscriptions = allSubscriptions.filter((sub) => sub.status === 'trialing');
    const convertedFromTrial = allSubscriptions.filter(
      (sub) => sub.status === 'active' && sub.createdAt >= startDate
    );
    const trialToActive =
      trialSubscriptions.length > 0
        ? (convertedFromTrial.length / trialSubscriptions.length) * 100
        : 0;

    // Count upgrades and downgrades in the period
    const upgrades = await this.countPlanChanges(startDate, now, 'upgrade');
    const downgrades = await this.countPlanChanges(startDate, now, 'downgrade');

    // Revenue by plan
    const revenueByPlan = planDistribution.map((plan) => {
      const totalRevenue = planDistribution.reduce((sum, p) => sum + p.mrr, 0);
      return {
        planType: plan.planType,
        revenue: plan.mrr,
        percentage: totalRevenue > 0 ? (plan.mrr / totalRevenue) * 100 : 0,
      };
    });

    return {
      planDistribution,
      trends,
      retention,
      conversions: {
        trialToActive,
        upgrades,
        downgrades,
      },
      revenueByPlan,
    };
  }

  /**
   * Calculate MRR and subscriber trends over time
   */
  private async calculateTrends(startDate: Date, endDate: Date, range: string): Promise<any[]> {
    const trends: any[] = [];
    const daysInRange = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const interval = range === '1y' ? 30 : range === '90d' ? 7 : 1;

    for (let i = 0; i <= daysInRange; i += interval) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);

      const subscriptions = await this.prisma.subscription.findMany({
        where: {
          createdAt: {
            lte: date,
          },
          OR: [
            {
              canceledAt: null,
            },
            {
              canceledAt: {
                gte: date,
              },
            },
          ],
        },
      });

      const mrr = this.calculateMRR(subscriptions);
      const subscriberCount = subscriptions.filter(
        (sub) => sub.status === 'active' || sub.status === 'trialing'
      ).length;

      // Simple churn rate calculation for the day
      const canceledCount = subscriptions.filter(
        (sub) => sub.canceledAt && new Date(sub.canceledAt).toDateString() === date.toDateString()
      ).length;
      const churnRate = subscriberCount > 0 ? (canceledCount / subscriberCount) * 100 : 0;

      trends.push({
        date: date.toISOString(),
        mrr: Math.round(mrr),
        subscriberCount,
        churnRate: parseFloat(churnRate.toFixed(2)),
      });
    }

    return trends;
  }

  /**
   * Calculate retention rates at different intervals
   */
  private async calculateRetention(): Promise<any> {
    const now = new Date();

    const calculateRetentionAtMonth = async (months: number): Promise<number> => {
      const startDate = new Date(now.getTime() - months * 30 * 24 * 60 * 60 * 1000);

      const subscriptionsAtStart = await this.prisma.subscription.findMany({
        where: {
          createdAt: {
            lte: startDate,
          },
        },
      });

      if (subscriptionsAtStart.length === 0) return 0;

      const stillActive = subscriptionsAtStart.filter((sub) => {
        if (!sub.canceledAt) return true;
        return new Date(sub.canceledAt) > now;
      }).length;

      return (stillActive / subscriptionsAtStart.length) * 100;
    };

    return {
      month1: await calculateRetentionAtMonth(1),
      month3: await calculateRetentionAtMonth(3),
      month6: await calculateRetentionAtMonth(6),
      month12: await calculateRetentionAtMonth(12),
    };
  }

  /**
   * Count plan upgrades or downgrades in a period
   */
  private async countPlanChanges(
    startDate: Date,
    endDate: Date,
    type: 'upgrade' | 'downgrade'
  ): Promise<number> {
    // This would ideally query a plan_changes table if you track that
    // For now, we'll return 0 as a placeholder
    // You would implement this based on your tracking mechanism
    return 0;
  }
}
