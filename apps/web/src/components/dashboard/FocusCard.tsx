/**
 * ============================================================
 * FocusCard - Personalisert fokuskort for dashboard
 * TIER Golf Design System v3.1
 * ============================================================
 *
 * Viser spillerens nåværende fokusområde og mål.
 * Gir visuell motivasjon og rask tilgang til relevante handlinger.
 *
 * Varianter:
 * - goal: Viser aktivt mål med fremgang
 * - focus: Viser ukens fokusområde
 * - streak: Viser treningsstreak
 * - achievement: Viser neste oppnåelse
 *
 * ============================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { SubSectionTitle } from '../typography/Headings';
import {
  Target,
  Flame,
  Trophy,
  TrendingUp,
  ChevronRight,
  Calendar,
  Zap,
} from 'lucide-react';
import { Button } from '../shadcn/button';
import { StreakFlame } from '../gamification/StreakFlame';

type FocusVariant = 'goal' | 'focus' | 'streak' | 'achievement';

interface FocusCardProps {
  variant: FocusVariant;
  title: string;
  subtitle?: string;
  progress?: number; // 0-100
  progressLabel?: string;
  metric?: string | number;
  metricLabel?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  accentColor?: 'gold' | 'green' | 'blue' | 'purple';
}

// Variant konfigurasjon
const variantConfig: Record<
  FocusVariant,
  {
    icon: React.ElementType;
    defaultAccent: FocusCardProps['accentColor'];
    bgGradient: string;
  }
> = {
  goal: {
    icon: Target,
    defaultAccent: 'gold',
    bgGradient: 'from-tier-gold/10 to-tier-gold/5',
  },
  focus: {
    icon: Zap,
    defaultAccent: 'blue',
    bgGradient: 'from-status-info/10 to-status-info/5',
  },
  streak: {
    icon: Flame,
    defaultAccent: 'green',
    bgGradient: 'from-status-success/10 to-status-success/5',
  },
  achievement: {
    icon: Trophy,
    defaultAccent: 'purple',
    bgGradient: 'from-category-j/10 to-category-j/5',
  },
};

const accentColors = {
  gold: {
    icon: 'text-tier-gold',
    iconBg: 'bg-tier-gold/20',
    progress: 'bg-tier-gold',
    metric: 'text-tier-gold',
    border: 'border-tier-gold/30',
  },
  green: {
    icon: 'text-status-success',
    iconBg: 'bg-status-success/20',
    progress: 'bg-status-success',
    metric: 'text-status-success',
    border: 'border-status-success/30',
  },
  blue: {
    icon: 'text-status-info',
    iconBg: 'bg-status-info/20',
    progress: 'bg-status-info',
    metric: 'text-status-info',
    border: 'border-status-info/30',
  },
  purple: {
    icon: 'text-category-j',
    iconBg: 'bg-category-j/20',
    progress: 'bg-category-j',
    metric: 'text-category-j',
    border: 'border-category-j/30',
  },
};

export function FocusCard({
  variant,
  title,
  subtitle,
  progress,
  progressLabel,
  metric,
  metricLabel,
  actionLabel,
  actionHref,
  onAction,
  className,
  accentColor,
}: FocusCardProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const accent = accentColor || config.defaultAccent || 'gold';
  const colors = accentColors[accent];

  const ActionWrapper = actionHref ? Link : 'button';
  const actionProps = actionHref
    ? { to: actionHref }
    : { onClick: onAction, type: 'button' as const };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border',
        'bg-gradient-to-br',
        config.bgGradient,
        colors.border,
        'p-5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              colors.iconBg
            )}
          >
            <Icon size={20} className={colors.icon} />
          </div>
          <div>
            <SubSectionTitle className="font-semibold text-tier-navy" style={{ marginBottom: 0 }}>{title}</SubSectionTitle>
            {subtitle && (
              <p className="text-sm text-tier-text-secondary">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Metric Badge */}
        {metric !== undefined && (
          <div className="text-right">
            <div className={cn('text-2xl font-bold', colors.metric)}>
              {metric}
            </div>
            {metricLabel && (
              <div className="text-xs text-tier-text-tertiary">{metricLabel}</div>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-tier-text-secondary">Progress</span>
            <span className={cn('font-medium', colors.metric)}>
              {progressLabel || `${progress}%`}
            </span>
          </div>
          <div className="h-2 bg-tier-surface-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                colors.progress
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      {(actionLabel && (actionHref || onAction)) && (
        <ActionWrapper
          {...(actionProps as any)}
          className={cn(
            'flex items-center justify-between w-full px-4 py-3 rounded-xl',
            'bg-tier-white/80 hover:bg-tier-white',
            'text-sm font-medium text-tier-navy',
            'transition-all duration-200',
            'group'
          )}
        >
          <span>{actionLabel}</span>
          <ChevronRight
            size={16}
            className="text-tier-text-tertiary group-hover:text-tier-navy transition-colors"
          />
        </ActionWrapper>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PRE-DEFINED FOCUS CARDS
// ═══════════════════════════════════════════════════════════

interface WeeklyGoalCardProps {
  goalName: string;
  current: number;
  target: number;
  unit: string;
  href?: string;
  showAction?: boolean;
}

export function WeeklyGoalCard({
  goalName,
  current,
  target,
  unit,
  href = '/plan/maal',
  showAction = false,
}: WeeklyGoalCardProps) {
  const progress = Math.round((current / target) * 100);

  return (
    <FocusCard
      variant="goal"
      title={goalName}
      subtitle="Weekly goal"
      progress={progress}
      progressLabel={`${current} / ${target} ${unit}`}
      actionLabel={showAction ? 'View all goals' : undefined}
      actionHref={showAction ? href : undefined}
    />
  );
}

interface StreakCardProps {
  days: number;
  longestStreak?: number;
  href?: string;
}

export function StreakCard({
  days,
  longestStreak,
  href = '/trening/dagbok',
}: StreakCardProps) {
  const target = longestStreak || days;
  const progress = target > 0 ? Math.round((days / target) * 100) : 0;
  const isActive = days > 0;

  return (
    <div className="relative">
      {/* Animated Flame */}
      <div className="absolute -top-2 -right-2 z-10">
        <StreakFlame isActive={isActive} size={32} />
      </div>

      <FocusCard
        variant="streak"
        title="Training Streak"
        subtitle={longestStreak ? `Record: ${longestStreak} days` : 'Days in a row'}
        progress={progress}
        progressLabel={`${days} / ${target} days`}
        actionLabel="View training history"
        actionHref={href}
      />
    </div>
  );
}

interface NextBadgeCardProps {
  badgeName: string;
  progress: number;
  requirement: string;
  href?: string;
}

export function NextBadgeCard({
  badgeName,
  progress,
  requirement,
  href = '/utvikling/badges',
}: NextBadgeCardProps) {
  return (
    <FocusCard
      variant="achievement"
      title={badgeName}
      subtitle="Next badge"
      progress={progress}
      progressLabel={requirement}
      actionLabel="View all badges"
      actionHref={href}
    />
  );
}

interface FocusAreaCardProps {
  area: string;
  description?: string;
  exercisesCompleted?: number;
  totalExercises?: number;
  href?: string;
}

export function FocusAreaCard({
  area,
  description,
  exercisesCompleted,
  totalExercises,
  href = '/trening',
}: FocusAreaCardProps) {
  const progress =
    exercisesCompleted !== undefined && totalExercises
      ? Math.round((exercisesCompleted / totalExercises) * 100)
      : undefined;

  return (
    <FocusCard
      variant="focus"
      title={area}
      subtitle={description || 'Weekly focus area'}
      progress={progress}
      progressLabel={
        exercisesCompleted !== undefined
          ? `${exercisesCompleted} / ${totalExercises} exercises`
          : undefined
      }
      actionLabel="Start training"
      actionHref={href}
    />
  );
}

// ═══════════════════════════════════════════════════════════
// FOCUS CARDS GRID
// ═══════════════════════════════════════════════════════════

interface FocusCardsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function FocusCardsGrid({ children, className }: FocusCardsGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

export default FocusCard;
