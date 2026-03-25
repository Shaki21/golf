/**
 * StatusIndicator - Standardized Status Display Component
 *
 * Consolidates all status indicator patterns into a single, consistent component.
 * Used for goal status, session status, and any other status displays.
 */

import React from 'react';
import { AlertTriangle, Clock, CheckCircle, Info, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { STATUS_LABELS } from '../../constants/ui-labels';

// =============================================================================
// TYPES
// =============================================================================

export type StatusType = 'critical' | 'warning' | 'success' | 'neutral' | 'info';

export interface StatusIndicatorProps {
  /** The status type to display */
  status: StatusType;
  /** Custom label (overrides default) */
  label?: string;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Display variant */
  variant?: 'badge' | 'dot' | 'text' | 'pill';
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// STATUS CONFIGURATION
// =============================================================================

const statusConfig: Record<StatusType, {
  icon: React.ElementType;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
}> = {
  critical: {
    icon: AlertTriangle,
    label: STATUS_LABELS.atRisk,
    bgColor: 'bg-status-error/10',
    textColor: 'text-status-error',
    borderColor: 'border-status-error/30',
    dotColor: 'bg-status-error',
  },
  warning: {
    icon: Clock,
    label: 'At risk',
    bgColor: 'bg-status-warning/10',
    textColor: 'text-status-warning',
    borderColor: 'border-status-warning/30',
    dotColor: 'bg-status-warning',
  },
  success: {
    icon: CheckCircle,
    label: STATUS_LABELS.onTrack,
    bgColor: 'bg-status-success/10',
    textColor: 'text-status-success',
    borderColor: 'border-status-success/30',
    dotColor: 'bg-status-success',
  },
  neutral: {
    icon: Info,
    label: 'No data',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    dotColor: 'bg-gray-400',
  },
  info: {
    icon: Info,
    label: 'Info',
    bgColor: 'bg-status-info/10',
    textColor: 'text-status-info',
    borderColor: 'border-status-info/30',
    dotColor: 'bg-status-info',
  },
};

const sizeConfig = {
  sm: {
    text: 'text-xs',
    icon: 12,
    padding: 'px-2 py-0.5',
    dot: 'w-1.5 h-1.5',
    gap: 'gap-1',
  },
  md: {
    text: 'text-sm',
    icon: 14,
    padding: 'px-2.5 py-1',
    dot: 'w-2 h-2',
    gap: 'gap-1.5',
  },
  lg: {
    text: 'text-base',
    icon: 16,
    padding: 'px-3 py-1.5',
    dot: 'w-2.5 h-2.5',
    gap: 'gap-2',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function StatusIndicator({
  status,
  label,
  showIcon = true,
  size = 'md',
  variant = 'badge',
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const displayLabel = label || config.label;
  const Icon = config.icon;

  // Dot variant - just a colored dot
  if (variant === 'dot') {
    return (
      <span
        className={cn(
          'inline-block rounded-full',
          sizeStyles.dot,
          config.dotColor,
          className
        )}
        title={displayLabel}
        aria-label={displayLabel}
      />
    );
  }

  // Text variant - just colored text with optional icon
  if (variant === 'text') {
    return (
      <span
        className={cn(
          'inline-flex items-center font-medium',
          sizeStyles.text,
          sizeStyles.gap,
          config.textColor,
          className
        )}
      >
        {showIcon && <Icon size={sizeStyles.icon} />}
        <span>{displayLabel}</span>
      </span>
    );
  }

  // Pill variant - rounded pill with background
  if (variant === 'pill') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full font-medium',
          sizeStyles.text,
          sizeStyles.padding,
          sizeStyles.gap,
          config.bgColor,
          config.textColor,
          className
        )}
      >
        {showIcon && <Icon size={sizeStyles.icon} />}
        <span>{displayLabel}</span>
      </span>
    );
  }

  // Badge variant (default) - rectangular badge with border
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium border',
        sizeStyles.text,
        sizeStyles.padding,
        sizeStyles.gap,
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {showIcon && <Icon size={sizeStyles.icon} />}
      <span>{displayLabel}</span>
    </span>
  );
}

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

/**
 * Get status type from goal progress percentage
 */
export function getStatusFromProgress(
  current: number,
  target: number,
  isCompleted?: boolean
): StatusType {
  if (isCompleted || current >= target) return 'success';

  const percentage = (current / target) * 100;
  if (percentage >= 70) return 'success';
  if (percentage >= 40) return 'warning';
  return 'critical';
}

/**
 * Get status type from sessions behind schedule
 */
export function getStatusFromDeficit(sessionsBehind: number): StatusType {
  if (sessionsBehind <= 0) return 'success';
  if (sessionsBehind <= 1) return 'warning';
  return 'critical';
}

export default StatusIndicator;
