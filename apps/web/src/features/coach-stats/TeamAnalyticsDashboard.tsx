import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/shadcn/use-toast';
import Card from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';
import StatsGridTemplate from '../../ui/templates/StatsGridTemplate';
import { PageTitle, SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import { Users, TrendingUp, Target, Award, BarChart3, Activity } from 'lucide-react';

interface TeamAnalytics {
  summary: {
    totalPlayers: number;
    activePlayers: number;
    averageCategory: string;
    averageHandicap: number;
    sessionsThisMonth: number;
    testsThisMonth: number;
  };
  categoryDistribution: Record<string, number>;
  progressMetrics: {
    improvedPlayers: number;
    stalledPlayers: number;
    newBreakingPoints: number;
    resolvedBreakingPoints: number;
  };
  topPerformers: Array<{
    id: string;
    name: string;
    category: string;
    improvement: number;
  }>;
  needsAttention: Array<{
    id: string;
    name: string;
    reason: string;
    daysInactive: number;
  }>;
}

export const TeamAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id) return;

      try {
        const response = await analyticsAPI.getTeamAnalytics(user.id);
        setAnalytics(response.data.data as unknown as TeamAnalytics);
      } catch (error) {
        toast({ title: 'Error', description: 'Could not fetch team analytics', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-6">
        <StateCard variant="loading" title="Loading team analytics..." />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <StateCard variant="empty" title="No data available" description="Could not load team analytics" />
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    A: 'bg-tier-success',
    B: 'bg-tier-navy',
    C: 'bg-tier-warning',
    D: 'bg-tier-text-secondary',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <PageTitle>Team Analytics</PageTitle>
        <p className="text-tier-text-secondary mt-1">Overview of team performance and progress</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tier-navy/10 flex items-center justify-center">
              <Users size={20} className="text-tier-navy" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tier-navy">{analytics.summary.totalPlayers}</p>
              <p className="text-xs text-tier-text-secondary">Total players</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tier-success/10 flex items-center justify-center">
              <Activity size={20} className="text-tier-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tier-navy">{analytics.summary.activePlayers}</p>
              <p className="text-xs text-tier-text-secondary">Active</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tier-warning/10 flex items-center justify-center">
              <Target size={20} className="text-tier-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tier-navy">{analytics.summary.averageHandicap?.toFixed(1) || '-'}</p>
              <p className="text-xs text-tier-text-secondary">Avg HCP</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tier-navy/10 flex items-center justify-center">
              <BarChart3 size={20} className="text-tier-navy" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tier-navy">{analytics.summary.sessionsThisMonth}</p>
              <p className="text-xs text-tier-text-secondary">Sessions/mo</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tier-success/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-tier-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tier-navy">{analytics.progressMetrics.improvedPlayers}</p>
              <p className="text-xs text-tier-text-secondary">Improved</p>
            </div>
          </div>
        </Card>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tier-error/10 flex items-center justify-center">
              <Award size={20} className="text-tier-error" />
            </div>
            <div>
              <p className="text-2xl font-bold text-tier-navy">{analytics.progressMetrics.stalledPlayers}</p>
              <p className="text-xs text-tier-text-secondary">Stalled</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card variant="default" padding="lg">
          <SectionTitle className="mb-4">Category Distribution</SectionTitle>
          <div className="space-y-3">
            {Object.entries(analytics.categoryDistribution || {}).map(([category, count]) => {
              const total = Object.values(analytics.categoryDistribution || {}).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-tier-navy">Category {category}</span>
                    <span className="text-tier-text-secondary">{count} players ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-3 bg-tier-surface-base rounded-full overflow-hidden">
                    <div
                      className={`h-full ${categoryColors[category] || 'bg-tier-navy'} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Breaking Points Progress */}
        <Card variant="default" padding="lg">
          <SectionTitle className="mb-4">Breaking Points</SectionTitle>
          <StatsGridTemplate
            items={[
              { id: 'new', label: 'New identified', value: analytics.progressMetrics.newBreakingPoints.toString() },
              { id: 'resolved', label: 'Resolved', value: analytics.progressMetrics.resolvedBreakingPoints.toString() },
              { id: 'improved', label: 'Players improved', value: analytics.progressMetrics.improvedPlayers.toString() },
              { id: 'stalled', label: 'Needs follow-up', value: analytics.progressMetrics.stalledPlayers.toString() },
            ]}
            columns={2}
          />
        </Card>

        {/* Top Performers */}
        <Card variant="default" padding="lg">
          <SectionTitle className="mb-4">Top Performers</SectionTitle>
          {analytics.topPerformers?.length > 0 ? (
            <div className="space-y-3">
              {analytics.topPerformers.slice(0, 5).map((player, index) => (
                <div key={player.id} className="flex items-center gap-3 p-3 bg-tier-surface-base rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-tier-success text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-tier-navy">{player.name}</p>
                    <p className="text-xs text-tier-text-secondary">Kat. {player.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-tier-success">+{player.improvement.toFixed(1)}%</p>
                    <p className="text-xs text-tier-text-secondary">improvement</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-tier-text-secondary text-center py-4">No data yet</p>
          )}
        </Card>

        {/* Needs Attention */}
        <Card variant="default" padding="lg">
          <SectionTitle className="mb-4">Needs Follow-up</SectionTitle>
          {analytics.needsAttention?.length > 0 ? (
            <div className="space-y-3">
              {analytics.needsAttention.slice(0, 5).map(player => (
                <div key={player.id} className="flex items-center gap-3 p-3 bg-tier-error/5 rounded-lg border-l-3 border-tier-error">
                  <div className="flex-1">
                    <p className="font-medium text-tier-navy">{player.name}</p>
                    <p className="text-xs text-tier-text-secondary">{player.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-tier-error">{player.daysInactive} days</p>
                    <p className="text-xs text-tier-text-secondary">inactive</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-tier-text-secondary text-center py-4">All players are active</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TeamAnalyticsDashboard;
