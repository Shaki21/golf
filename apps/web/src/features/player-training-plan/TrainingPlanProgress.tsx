/**
 * TrainingPlanProgress - Detailed analytics and progress tracking
 * Shows completion rates, trends, category distribution, and insights
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Target, Calendar, Award, BarChart3, Clock, ArrowLeft } from 'lucide-react';
import { Card } from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import { Badge } from '../../components/shadcn/badge';
import { Progress } from '../../components/shadcn/progress';

// Mock data - would come from API
interface TrainingPlanProgressData {
  planName: string;
  currentWeek: number;
  totalWeeks: number;
  sessions: {
    id: string;
    name: string;
    weekNumber: number;
    durationMinutes: number;
    categories: string[];
    completed: boolean;
    completedAt?: string;
  }[];
}

const MOCK_DATA: TrainingPlanProgressData = {
  planName: '8-Week Full Swing Development',
  currentWeek: 2,
  totalWeeks: 8,
  sessions: [
    {
      id: '1',
      name: 'Setup Fundamentals',
      weekNumber: 1,
      durationMinutes: 60,
      categories: ['TEE'],
      completed: true,
      completedAt: '2026-01-06',
    },
    {
      id: '2',
      name: 'Backswing Foundation',
      weekNumber: 1,
      durationMinutes: 60,
      categories: ['TEE'],
      completed: true,
      completedAt: '2026-01-08',
    },
    {
      id: '3',
      name: 'Transition & Downswing',
      weekNumber: 2,
      durationMinutes: 90,
      categories: ['TEE'],
      completed: false,
    },
    {
      id: '4',
      name: 'Impact Position',
      weekNumber: 2,
      durationMinutes: 60,
      categories: ['TEE'],
      completed: false,
    },
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  TEE: 'bg-tier-gold',
  APP: 'bg-tier-navy',
  SGR: 'bg-tier-success',
  PGR: 'bg-tier-accent',
  GBR: 'bg-tier-warning',
};

export function TrainingPlanProgress() {
  const navigate = useNavigate();
  const data = MOCK_DATA;

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSessions = data.sessions.length;
    const completedSessions = data.sessions.filter(s => s.completed).length;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    const totalMinutes = data.sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    const completedMinutes = data.sessions
      .filter(s => s.completed)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    const trainingTimeRate = totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0;

    // Category distribution
    const categoryCount: Record<string, number> = {};
    const categoryCompleted: Record<string, number> = {};
    data.sessions.forEach(session => {
      session.categories.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        if (session.completed) {
          categoryCompleted[cat] = (categoryCompleted[cat] || 0) + 1;
        }
      });
    });

    // Week-by-week progress
    const weekProgress: Record<number, { total: number; completed: number }> = {};
    data.sessions.forEach(session => {
      if (!weekProgress[session.weekNumber]) {
        weekProgress[session.weekNumber] = { total: 0, completed: 0 };
      }
      weekProgress[session.weekNumber].total++;
      if (session.completed) {
        weekProgress[session.weekNumber].completed++;
      }
    });

    // Current week stats
    const currentWeekSessions = data.sessions.filter(s => s.weekNumber === data.currentWeek);
    const currentWeekCompleted = currentWeekSessions.filter(s => s.completed).length;
    const currentWeekRate =
      currentWeekSessions.length > 0
        ? (currentWeekCompleted / currentWeekSessions.length) * 100
        : 0;

    // Average sessions per week
    const avgSessionsPerWeek = totalSessions / data.totalWeeks;

    return {
      totalSessions,
      completedSessions,
      completionRate,
      totalMinutes,
      completedMinutes,
      trainingTimeRate,
      categoryCount,
      categoryCompleted,
      weekProgress,
      currentWeekRate,
      avgSessionsPerWeek,
    };
  }, [data]);

  // Generate insights
  const insights = useMemo(() => {
    const messages: string[] = [];

    if (stats.completionRate >= 80) {
      messages.push('Excellent progress! You\'re staying on track with your training.');
    } else if (stats.completionRate >= 50) {
      messages.push('Good progress. Try to complete a few more sessions to stay on schedule.');
    } else {
      messages.push('Consider catching up on missed sessions to maximize your development.');
    }

    if (stats.currentWeekRate === 100 && data.currentWeek > 1) {
      messages.push('Great work completing all sessions this week!');
    }

    // Check category balance
    const categories = Object.keys(stats.categoryCount);
    if (categories.length === 1) {
      messages.push('This plan focuses exclusively on one category. Consider adding variety.');
    }

    return messages;
  }, [stats, data.currentWeek]);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/trening/plan')}
        className="flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Plan
      </Button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-tier-navy/10 rounded-lg">
          <BarChart3 className="text-tier-navy" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-tier-navy">Training Progress</h1>
          <p className="text-sm text-tier-navy/60 mt-0.5">{data.planName}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-tier-navy/60 mb-1">Sessions Complete</p>
              <p className="text-2xl font-bold text-tier-navy">
                {stats.completedSessions}/{stats.totalSessions}
              </p>
            </div>
            <div className="p-2 bg-tier-gold/10 rounded-lg">
              <Target className="text-tier-gold" size={20} />
            </div>
          </div>
          <Progress value={stats.completionRate} className="mt-3" />
          <p className="text-xs text-tier-navy/60 mt-2">{Math.round(stats.completionRate)}% complete</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-tier-navy/60 mb-1">Training Time</p>
              <p className="text-2xl font-bold text-tier-navy">
                {stats.completedMinutes} min
              </p>
            </div>
            <div className="p-2 bg-tier-navy/10 rounded-lg">
              <Clock className="text-tier-navy" size={20} />
            </div>
          </div>
          <Progress value={stats.trainingTimeRate} className="mt-3" />
          <p className="text-xs text-tier-navy/60 mt-2">
            of {stats.totalMinutes} min planned
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-tier-navy/60 mb-1">Current Week</p>
              <p className="text-2xl font-bold text-tier-navy">
                Week {data.currentWeek}/{data.totalWeeks}
              </p>
            </div>
            <div className="p-2 bg-tier-accent/10 rounded-lg">
              <Calendar className="text-tier-accent" size={20} />
            </div>
          </div>
          <Progress value={stats.currentWeekRate} className="mt-3" />
          <p className="text-xs text-tier-navy/60 mt-2">
            {Math.round(stats.currentWeekRate)}% complete this week
          </p>
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="p-4 bg-tier-gold/5 border-tier-gold/20">
          <div className="flex items-start gap-3">
            <Award className="text-tier-gold flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-tier-navy mb-2">Insights</h3>
              <ul className="space-y-1">
                {insights.map((insight, i) => (
                  <li key={i} className="text-sm text-tier-navy/70">
                    • {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Week-by-Week Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-tier-navy mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Week-by-Week Progress
        </h3>
        <div className="space-y-3">
          {Array.from({ length: data.totalWeeks }, (_, i) => i + 1).map(weekNum => {
            const weekData = stats.weekProgress[weekNum] || { total: 0, completed: 0 };
            const weekRate = weekData.total > 0 ? (weekData.completed / weekData.total) * 100 : 0;
            const isPast = weekNum < data.currentWeek;
            const isCurrent = weekNum === data.currentWeek;
            const isFuture = weekNum > data.currentWeek;

            return (
              <div key={weekNum} className="flex items-center gap-4">
                <div className="w-16 flex-shrink-0">
                  <Badge variant={isCurrent ? 'default' : 'secondary'}>
                    Week {weekNum}
                  </Badge>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-tier-navy/70">
                      {weekData.completed} / {weekData.total} sessions
                    </span>
                    <span className="text-sm font-medium text-tier-navy">
                      {Math.round(weekRate)}%
                    </span>
                  </div>
                  <Progress
                    value={weekRate}
                    className={
                      isFuture ? 'opacity-40' : isPast && weekRate === 100 ? '' : ''
                    }
                  />
                </div>
                {isPast && weekRate === 100 && (
                  <div className="text-tier-success">
                    <Award size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Category Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-tier-navy mb-4">Category Focus</h3>
        <div className="space-y-4">
          {Object.entries(stats.categoryCount).map(([category, total]) => {
            const completed = stats.categoryCompleted[category] || 0;
            const rate = total > 0 ? (completed / total) * 100 : 0;
            const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.APP;

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                    <span className="font-medium text-tier-navy">{category}</span>
                  </div>
                  <span className="text-sm text-tier-navy/70">
                    {completed}/{total} sessions
                  </span>
                </div>
                <Progress value={rate} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Statistics Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-tier-navy mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-tier-navy/60 mb-1">Total Weeks</p>
            <p className="text-xl font-bold text-tier-navy">{data.totalWeeks}</p>
          </div>
          <div>
            <p className="text-sm text-tier-navy/60 mb-1">Total Sessions</p>
            <p className="text-xl font-bold text-tier-navy">{stats.totalSessions}</p>
          </div>
          <div>
            <p className="text-sm text-tier-navy/60 mb-1">Avg per Week</p>
            <p className="text-xl font-bold text-tier-navy">
              {stats.avgSessionsPerWeek.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-tier-navy/60 mb-1">Total Hours</p>
            <p className="text-xl font-bold text-tier-navy">
              {(stats.totalMinutes / 60).toFixed(1)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default TrainingPlanProgress;
