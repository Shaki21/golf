/**
 * LoadAndReadinessCard (Layer 2b)
 *
 * Shows:
 * - Planned vs completed sessions (week)
 * - Tournament within 14 days callout
 * - Risk flags (missing log, plan not confirmed)
 *
 * KPI Rule: Numbers answer "Is this good/bad?" and "What do I do now?"
 */

import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import type { LoadStats, Tournament, AttentionItem } from '../types';
import { STATUS_LABELS, ACTION_LABELS, TIME_LABELS } from '../../../constants/ui-labels';

interface LoadAndReadinessCardProps {
  loadStats: LoadStats;
  tournament: Tournament | null;
  attentionItems: AttentionItem[];
  missingLogs: number;
}

export const LoadAndReadinessCard = memo(function LoadAndReadinessCard({
  loadStats,
  tournament,
  attentionItems,
  missingLogs,
}: LoadAndReadinessCardProps) {
  const completionRate = loadStats.planned > 0
    ? Math.round((loadStats.completed / loadStats.planned) * 100)
    : 0;
  const isOnTrack = completionRate >= 60;
  const warningItems = attentionItems.filter(i => i.severity === 'warning' || i.severity === 'error');

  return (
    <div className="bg-tier-white rounded-2xl border border-tier-border-default p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Calendar className="text-status-warning" size={20} />
        <h3 className="text-lg font-bold text-tier-navy">
          Load & Status
        </h3>
      </div>

      {/* Load stats */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Sessions progress */}
        <div className="bg-tier-surface-subtle rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-tier-text-secondary">Sessions this week</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isOnTrack
                ? 'bg-status-success/10 text-status-success'
                : 'bg-status-warning/10 text-status-warning'
            }`}>
              {isOnTrack ? STATUS_LABELS.onTrack : STATUS_LABELS.behind}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-tier-navy">
              {loadStats.completed}
            </span>
            <span className="text-tier-text-secondary">
              / {loadStats.planned} planned
            </span>
          </div>
          <div className="h-2 bg-tier-surface-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOnTrack ? 'bg-status-success' : 'bg-status-warning'
              }`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Missing purpose indicator */}
        <div className={`rounded-xl p-4 ${
          loadStats.missingPurpose > 0
            ? 'bg-status-warning/5 border border-status-warning/20'
            : 'bg-tier-surface-subtle'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList size={16} className={
              loadStats.missingPurpose > 0 ? 'text-status-warning' : 'text-tier-text-tertiary'
            } />
            <span className="text-sm text-tier-text-secondary">Session details</span>
          </div>
          {loadStats.missingPurpose > 0 ? (
            <>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold text-status-warning">
                  {loadStats.missingPurpose}
                </span>
                <span className="text-sm text-tier-text-secondary">
                  missing purpose
                </span>
              </div>
              <Link
                to="/plan/kalender"
                className="text-xs font-medium text-status-warning hover:text-status-warning-dark flex items-center gap-1"
              >
                Fix now
                <ArrowRight size={12} />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-status-success" />
              <span className="text-sm text-tier-navy font-medium">All sessions complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Tournament callout */}
      {tournament && tournament.daysUntil <= 14 && (
        <div className={`rounded-xl p-4 mb-5 ${
          tournament.hasPlan
            ? 'bg-status-info/5 border border-status-info/20'
            : 'bg-status-warning/5 border border-status-warning/20'
        }`}>
          <div className="flex items-start gap-3">
            <Trophy size={20} className={tournament.hasPlan ? 'text-status-info' : 'text-status-warning'} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-tier-navy text-sm">
                  {tournament.name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  tournament.daysUntil <= 7
                    ? 'bg-status-error/10 text-status-error'
                    : 'bg-status-warning/10 text-status-warning'
                }`}>
                  In {tournament.daysUntil} {tournament.daysUntil === 1 ? TIME_LABELS.day : TIME_LABELS.days}
                </span>
              </div>
              <p className="text-xs text-tier-text-secondary mt-1">
                {tournament.location}
              </p>
              {!tournament.hasPlan && (
                <Link
                  to={`/plan/turneringer/${tournament.id}`}
                  className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-status-warning hover:text-status-warning-dark"
                >
                  Create preparation plan
                  <ArrowRight size={12} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Risk flags */}
      {warningItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-tier-text-secondary uppercase tracking-wide mb-2">
            Needs attention
          </p>
          {warningItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-status-warning/5 rounded-lg border border-status-warning/20"
            >
              <AlertTriangle size={16} className="text-status-warning shrink-0" />
              <span className="text-sm text-tier-navy flex-1">
                {item.message}
              </span>
              {item.type === 'missing_log' && (
                <Link
                  to="/trening/logg"
                  className="text-xs font-medium text-status-warning hover:text-status-warning-dark"
                >
                  Log
                </Link>
              )}
              {item.type === 'plan_not_confirmed' && (
                <Link
                  to="/plan/kalender"
                  className="text-xs font-medium text-status-warning hover:text-status-warning-dark"
                >
                  Confirm
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All clear state */}
      {warningItems.length === 0 && loadStats.missingPurpose === 0 && isOnTrack && (
        <div className="flex items-center gap-3 p-4 bg-status-success/5 rounded-xl border border-status-success/20">
          <CheckCircle size={24} className="text-status-success" />
          <div>
            <p className="font-medium text-tier-navy text-sm">All clear</p>
            <p className="text-xs text-tier-text-secondary">
              No alerts or issues this week
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default LoadAndReadinessCard;
