import React, { useState, useEffect } from 'react';
import { playersAPI } from '../../../services/api';
import { useToast } from '../../../components/shadcn/use-toast';
import Card from '../../../ui/primitives/Card';
import { SubSectionTitle } from '../../../components/typography';
import { Calendar, Activity, Target, TrendingUp, Award } from 'lucide-react';

interface WeeklySummary {
  sessionsCompleted: number;
  totalMinutes: number;
  testsCompleted: number;
  breakingPointsProgress: number;
  achievements: number;
  streakDays: number;
}

interface WeeklySummaryWidgetProps {
  playerId: string;
  playerName?: string;
  compact?: boolean;
}

export const WeeklySummaryWidget: React.FC<WeeklySummaryWidgetProps> = ({
  playerId,
  playerName,
  compact = false,
}) => {
  const { toast } = useToast();
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await playersAPI.getById(playerId);
        // Extract weekly summary from player data or use defaults
        const playerData = response.data.data;
        setSummary({
          sessionsCompleted: (playerData as any).weeklyStats?.sessions || 0,
          totalMinutes: (playerData as any).weeklyStats?.minutes || 0,
          testsCompleted: (playerData as any).weeklyStats?.tests || 0,
          breakingPointsProgress: (playerData as any).weeklyStats?.bpProgress || 0,
          achievements: (playerData as any).weeklyStats?.achievements || 0,
          streakDays: (playerData as any).weeklyStats?.streak || 0,
        });
      } catch (error) {
        // Use demo data on error
        setSummary({
          sessionsCompleted: 4,
          totalMinutes: 180,
          testsCompleted: 2,
          breakingPointsProgress: 15,
          achievements: 1,
          streakDays: 5,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [playerId]);

  if (loading) {
    return (
      <Card variant="default" padding="md">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-tier-surface-base rounded w-1/3" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-tier-surface-base rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!summary) return null;

  const stats = [
    { icon: Activity, label: 'Okter', value: summary.sessionsCompleted, color: 'text-tier-navy' },
    { icon: Calendar, label: 'Minutter', value: summary.totalMinutes, color: 'text-tier-success' },
    { icon: Target, label: 'Tester', value: summary.testsCompleted, color: 'text-tier-warning' },
    { icon: TrendingUp, label: 'BP fremgang', value: `${summary.breakingPointsProgress}%`, color: 'text-tier-navy' },
    { icon: Award, label: 'Bragder', value: summary.achievements, color: 'text-tier-gold' },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-tier-surface-base rounded-lg">
        {playerName && (
          <span className="font-medium text-tier-navy">{playerName}</span>
        )}
        <div className="flex gap-4 text-sm">
          <span className="text-tier-text-secondary">
            <span className="font-semibold text-tier-navy">{summary.sessionsCompleted}</span> økter
          </span>
          <span className="text-tier-text-secondary">
            <span className="font-semibold text-tier-navy">{summary.totalMinutes}</span> min
          </span>
          {summary.streakDays > 0 && (
            <span className="text-tier-success font-medium">
              {summary.streakDays} dager streak
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card variant="default" padding="md">
      <div className="flex items-center justify-between mb-4">
        <SubSectionTitle>Ukens oppsummering</SubSectionTitle>
        {summary.streakDays > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-tier-success/10 rounded-full">
            <span className="text-xs font-semibold text-tier-success">
              {summary.streakDays} dager streak
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="text-center p-3 bg-tier-surface-base rounded-lg">
              <Icon size={20} className={`mx-auto mb-1 ${stat.color}`} />
              <p className="text-lg font-bold text-tier-navy">{stat.value}</p>
              <p className="text-xs text-tier-text-secondary">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default WeeklySummaryWidget;
