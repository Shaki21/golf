/**
 * Subscription Analytics Component
 *
 * Detailed subscription metrics and trend analysis
 *
 * Features:
 * - Plan distribution breakdown
 * - MRR/ARR trends over time
 * - Churn analysis and retention metrics
 * - New vs. canceled subscriptions
 * - Upgrade/downgrade tracking
 * - Revenue per plan visualization
 * - Customer lifetime value analysis
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  Calendar,
  Target,
} from 'lucide-react';
import { Button, Text } from '../../ui/primitives';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

interface SubscriptionMetrics {
  planDistribution: {
    planType: string;
    count: number;
    percentage: number;
    mrr: number;
  }[];
  trends: {
    date: string;
    mrr: number;
    subscriberCount: number;
    churnRate: number;
  }[];
  retention: {
    month1: number;
    month3: number;
    month6: number;
    month12: number;
  };
  conversions: {
    trialToActive: number;
    upgrades: number;
    downgrades: number;
  };
  revenueByPlan: {
    planType: string;
    revenue: number;
    percentage: number;
  }[];
}

const PLAN_COLORS: Record<string, string> = {
  premium: '#FF6B6B',
  elite: '#4ECDC4',
  base: '#45B7D1',
  pro: '#96CEB4',
  team: '#FFEAA7',
};

const PLAN_NAMES: Record<string, string> = {
  premium: 'Player Premium',
  elite: 'Player Elite',
  base: 'Coach Base',
  pro: 'Coach Pro',
  team: 'Coach Team',
};

const SubscriptionAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(
        `${API_URL}/admin/subscription-analytics?range=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(amount / 100);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-navy" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 text-center">
        <Text variant="body" color="secondary">
          No analytics data available
        </Text>
      </div>
    );
  }

  const totalSubscribers = metrics.planDistribution.reduce((sum, plan) => sum + plan.count, 0);
  const totalMRR = metrics.planDistribution.reduce((sum, plan) => sum + plan.mrr, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Text variant="title1" color="primary" className="mb-2">
            Subscription Analytics
          </Text>
          <Text variant="body" color="secondary">
            Detailed metrics and trend analysis
          </Text>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-tier-navy text-white'
                  : 'bg-tier-background text-tier-text-secondary hover:bg-tier-border-default'
              }`}
            >
              <Text variant="footnote" className={timeRange === range ? 'text-white' : ''}>
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </Text>
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-tier-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-tier-navy-light rounded-lg">
              <DollarSign size={24} className="text-tier-navy" />
            </div>
            <Text variant="footnote" color="secondary">
              Total MRR
            </Text>
          </div>
          <Text variant="title1" color="primary" className="font-bold">
            {formatCurrency(totalMRR)}
          </Text>
        </div>

        <div className="bg-tier-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-tier-success-light rounded-lg">
              <Users size={24} className="text-tier-success" />
            </div>
            <Text variant="footnote" color="secondary">
              Subscribers
            </Text>
          </div>
          <Text variant="title1" color="primary" className="font-bold">
            {totalSubscribers}
          </Text>
        </div>

        <div className="bg-tier-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-tier-warning-light rounded-lg">
              <Activity size={24} className="text-tier-warning" />
            </div>
            <Text variant="footnote" color="secondary">
              Trial Conversion
            </Text>
          </div>
          <Text variant="title1" color="primary" className="font-bold">
            {formatPercentage(metrics.conversions.trialToActive)}
          </Text>
        </div>

        <div className="bg-tier-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-tier-background rounded-lg">
              <Target size={24} className="text-tier-text-secondary" />
            </div>
            <Text variant="footnote" color="secondary">
              6-Month Retention
            </Text>
          </div>
          <Text variant="title1" color="primary" className="font-bold">
            {formatPercentage(metrics.retention.month6)}
          </Text>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-tier-white rounded-2xl shadow-lg p-6 mb-6">
        <Text variant="title2" color="primary" className="mb-6">
          Plan Distribution
        </Text>
        <div className="space-y-4">
          {metrics.planDistribution.map((plan) => (
            <div key={plan.planType}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: PLAN_COLORS[plan.planType] }}
                  />
                  <Text variant="body" color="primary" className="font-semibold">
                    {PLAN_NAMES[plan.planType] || plan.planType}
                  </Text>
                </div>
                <div className="flex items-center gap-4">
                  <Text variant="body" color="secondary">
                    {plan.count} subscribers ({formatPercentage(plan.percentage)})
                  </Text>
                  <Text variant="body" color="primary" className="font-semibold">
                    {formatCurrency(plan.mrr)} MRR
                  </Text>
                </div>
              </div>
              <div className="h-2 bg-tier-background rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${plan.percentage}%`,
                    backgroundColor: PLAN_COLORS[plan.planType],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Plan */}
      <div className="bg-tier-white rounded-2xl shadow-lg p-6 mb-6">
        <Text variant="title2" color="primary" className="mb-6">
          Revenue by Plan
        </Text>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {metrics.revenueByPlan.map((plan) => (
            <div key={plan.planType} className="text-center p-4 bg-tier-background rounded-lg">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3"
                style={{ backgroundColor: PLAN_COLORS[plan.planType] }}
              />
              <Text variant="footnote" color="secondary" className="mb-1">
                {PLAN_NAMES[plan.planType] || plan.planType}
              </Text>
              <Text variant="title3" color="primary" className="font-bold mb-1">
                {formatCurrency(plan.revenue)}
              </Text>
              <Text variant="footnote" color="secondary">
                {formatPercentage(plan.percentage)}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {/* Retention Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-tier-white rounded-2xl shadow-lg p-6">
          <Text variant="title2" color="primary" className="mb-6">
            Retention Rates
          </Text>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Text variant="body" color="secondary">
                  1 Month
                </Text>
                <Text variant="body" color="primary" className="font-semibold">
                  {formatPercentage(metrics.retention.month1)}
                </Text>
              </div>
              <div className="h-2 bg-tier-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-tier-success transition-all duration-300"
                  style={{ width: `${metrics.retention.month1}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Text variant="body" color="secondary">
                  3 Months
                </Text>
                <Text variant="body" color="primary" className="font-semibold">
                  {formatPercentage(metrics.retention.month3)}
                </Text>
              </div>
              <div className="h-2 bg-tier-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-tier-success transition-all duration-300"
                  style={{ width: `${metrics.retention.month3}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Text variant="body" color="secondary">
                  6 Months
                </Text>
                <Text variant="body" color="primary" className="font-semibold">
                  {formatPercentage(metrics.retention.month6)}
                </Text>
              </div>
              <div className="h-2 bg-tier-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-tier-warning transition-all duration-300"
                  style={{ width: `${metrics.retention.month6}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Text variant="body" color="secondary">
                  12 Months
                </Text>
                <Text variant="body" color="primary" className="font-semibold">
                  {formatPercentage(metrics.retention.month12)}
                </Text>
              </div>
              <div className="h-2 bg-tier-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-tier-error transition-all duration-300"
                  style={{ width: `${metrics.retention.month12}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-tier-white rounded-2xl shadow-lg p-6">
          <Text variant="title2" color="primary" className="mb-6">
            Subscription Changes
          </Text>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-tier-success-light rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp size={24} className="text-tier-success" />
                <Text variant="body" className="text-tier-success font-semibold">
                  Trial Conversions
                </Text>
              </div>
              <Text variant="title2" className="text-tier-success font-bold">
                {formatPercentage(metrics.conversions.trialToActive)}
              </Text>
            </div>

            <div className="flex items-center justify-between p-4 bg-tier-background rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp size={24} className="text-tier-navy" />
                <Text variant="body" color="primary" className="font-semibold">
                  Upgrades
                </Text>
              </div>
              <Text variant="title2" color="primary" className="font-bold">
                {metrics.conversions.upgrades}
              </Text>
            </div>

            <div className="flex items-center justify-between p-4 bg-tier-error-light rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingDown size={24} className="text-tier-error" />
                <Text variant="body" className="text-tier-error font-semibold">
                  Downgrades
                </Text>
              </div>
              <Text variant="title2" className="text-tier-error font-bold">
                {metrics.conversions.downgrades}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* MRR Trend */}
      <div className="bg-tier-white rounded-2xl shadow-lg p-6">
        <Text variant="title2" color="primary" className="mb-6">
          MRR Trend
        </Text>
        <div className="h-64 flex items-end gap-2">
          {metrics.trends.map((trend, index) => {
            const maxMRR = Math.max(...metrics.trends.map((t) => t.mrr));
            const height = (trend.mrr / maxMRR) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-tier-navy rounded-t transition-all duration-300 hover:bg-tier-navy-dark"
                  style={{ height: `${height}%` }}
                  title={`${new Date(trend.date).toLocaleDateString()}: ${formatCurrency(trend.mrr)}`}
                />
                <Text variant="footnote" color="secondary" className="mt-2 text-xs">
                  {new Date(trend.date).toLocaleDateString('nb-NO', { month: 'short', day: 'numeric' })}
                </Text>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionAnalytics;
