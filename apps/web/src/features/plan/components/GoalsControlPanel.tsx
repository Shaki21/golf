/**
 * GoalsControlPanel (Layer 2a)
 *
 * Shows max 3 goals with:
 * - Outcome (long-term target)
 * - Leading indicator (this week's measurable driver)
 * - Status (On track / At risk) + why
 * - Inline micro-CTA with contextual deep links
 *
 * At-risk goals are surfaced first.
 */

import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Zap,
  CheckCircle2,
  Play,
} from 'lucide-react';
import type { PlanGoal, GoalStatus } from '../types';
import { STATUS_LABELS, ACTION_LABELS } from '../../../constants/ui-labels';

interface GoalsControlPanelProps {
  goals: PlanGoal[];
  showAddGoal?: boolean;
}

const STATUS_CONFIG: Record<GoalStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  icon: React.ElementType;
}> = {
  at_risk: {
    label: STATUS_LABELS.atRisk,
    bgColor: 'bg-status-warning/10',
    textColor: 'text-status-warning',
    icon: AlertTriangle,
  },
  on_track: {
    label: STATUS_LABELS.onTrack,
    bgColor: 'bg-status-success/10',
    textColor: 'text-status-success',
    icon: CheckCircle2,
  },
  ahead: {
    label: STATUS_LABELS.ahead,
    bgColor: 'bg-status-info/10',
    textColor: 'text-status-info',
    icon: TrendingUp,
  },
};

export const GoalsControlPanel = memo(function GoalsControlPanel({
  goals,
  showAddGoal = true,
}: GoalsControlPanelProps) {
  if (goals.length === 0) {
    return (
      <div className="bg-tier-white rounded-2xl border border-tier-border-default p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="text-status-warning" size={20} />
            <h3 className="text-lg font-bold text-tier-navy">
              My Goals
            </h3>
          </div>
        </div>
        <div className="text-center py-8">
          <Target className="mx-auto text-tier-text-tertiary mb-3" size={40} />
          <p className="text-tier-text-secondary mb-4">
            You don't have any active goals yet
          </p>
          <Link
            to="/plan/maal/ny"
            className="inline-flex items-center gap-2 px-4 py-2 bg-tier-navy text-white rounded-lg font-medium hover:bg-tier-navy-dark transition-colors"
          >
            {ACTION_LABELS.setGoal}
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-tier-white rounded-2xl border border-tier-border-default p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Target className="text-status-warning" size={20} />
          <h3 className="text-lg font-bold text-tier-navy">
            My Goals
          </h3>
        </div>
        {showAddGoal && (
          <Link
            to="/plan/maal"
            className="text-sm text-tier-navy hover:text-tier-navy-dark font-medium flex items-center gap-1 transition-colors"
          >
            {ACTION_LABELS.viewAll}
            <ChevronRight size={14} />
          </Link>
        )}
      </div>

      {/* Goals list */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  );
});

interface GoalCardProps {
  goal: PlanGoal;
}

function GoalCard({ goal }: GoalCardProps) {
  const config = STATUS_CONFIG[goal.status];
  const StatusIcon = config.icon;
  const progress = goal.leadingIndicator.target > 0
    ? Math.min((goal.leadingIndicator.current / goal.leadingIndicator.target) * 100, 100)
    : 0;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        goal.status === 'at_risk'
          ? 'border-status-warning/30 bg-status-warning/5'
          : 'border-tier-border-subtle bg-tier-surface-subtle'
      }`}
    >
      {/* Goal header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-tier-navy text-sm mb-1 truncate">
            {goal.title}
          </h4>
          <p className="text-xs text-tier-text-secondary line-clamp-1">
            {goal.outcome}
          </p>
        </div>
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
          <StatusIcon size={12} />
          {config.label}
        </span>
      </div>

      {/* Leading indicator */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-tier-text-secondary flex items-center gap-1">
            <Zap size={12} className="text-status-warning" />
            {goal.leadingIndicator.label}
          </span>
          <span className="font-semibold text-tier-navy">
            {goal.leadingIndicator.current} / {goal.leadingIndicator.target} {goal.leadingIndicator.unit}
          </span>
        </div>
        <div className="h-2 bg-tier-surface-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              goal.status === 'at_risk' ? 'bg-status-warning' : 'bg-status-success'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status reason */}
      <p className="text-xs text-tier-text-secondary mb-3">
        {goal.statusReason}
      </p>

      {/* Micro CTA - Contextual deep links */}
      <div className="flex items-center gap-3">
        {/* Primary action: Start recommended exercise (contextual deep link) */}
        {goal.drillHref && (
          <Link
            to={goal.drillHref}
            className={`text-xs font-medium flex items-center gap-1 transition-colors ${
              goal.status === 'at_risk'
                ? 'text-status-warning hover:text-status-warning-dark'
                : 'text-tier-navy hover:text-tier-navy-dark'
            }`}
          >
            <Play size={12} />
            {goal.drillName || ACTION_LABELS.startTraining}
            <ChevronRight size={12} />
          </Link>
        )}
        {/* Secondary action: Adjust goal */}
        <Link
          to={`/plan/maal/${goal.id}`}
          className="text-xs font-medium text-tier-text-secondary hover:text-tier-navy flex items-center gap-1 transition-colors ml-auto"
        >
          {ACTION_LABELS.adjustGoal}
          <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export default GoalsControlPanel;
