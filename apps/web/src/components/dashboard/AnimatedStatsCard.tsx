/**
 * AnimatedStatsCard - Enhanced Statistics Card
 *
 * Statistics card with animations, sparklines, and tooltips.
 * Perfect for dashboard hero stats with engaging interactions.
 */

import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { Sparkline } from '../ui/Sparkline';

export interface StatDetail {
  label: string;
  value: string | number;
}

export interface AnimatedStatsCardProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Main label for the stat */
  label: string;
  /** The numeric value to display */
  value: number;
  /** Optional suffix (e.g., '%', ' dager', ' økter') */
  suffix?: string;
  /** Optional prefix (e.g., '+', '-') */
  prefix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Trend data for sparkline (last 7 days) */
  trendData?: number[];
  /** Detailed information shown in tooltip */
  details?: StatDetail[];
  /** Icon animation type */
  iconAnimation?: 'pulse' | 'shine' | 'none';
  /** Custom icon color */
  iconColor?: string;
  /** Custom background color for icon */
  iconBgColor?: string;
  /** Animation delay in ms */
  animationDelay?: number;
}

export function AnimatedStatsCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  trendData,
  details,
  iconAnimation = 'none',
  iconColor = 'var(--tier-gold)',
  iconBgColor = 'var(--tier-surface-secondary)',
  animationDelay = 0,
}: AnimatedStatsCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Icon animation classes
  const iconAnimationClass = {
    pulse: 'animate-stat-pulse',
    shine: 'animate-stat-shine',
    none: '',
  }[iconAnimation];

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Main Card */}
      <div
        className={cn(
          'flex items-center gap-3 p-4',
          'bg-white dark:bg-gray-800',
          'rounded-xl',
          'border border-gray-200 dark:border-gray-700',
          'transition-all duration-200',
          'hover:shadow-md hover:scale-[1.02]',
          'cursor-pointer'
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center',
            'w-10 h-10 rounded-lg',
            'transition-transform duration-200',
            iconAnimationClass
          )}
          style={{
            backgroundColor: iconBgColor,
            color: iconColor,
          }}
        >
          <Icon size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">
            <AnimatedCounter
              value={value}
              suffix={suffix}
              prefix={prefix}
              decimals={decimals}
              duration={1500}
              delay={animationDelay}
            />
          </div>
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </div>

          {/* Sparkline */}
          {trendData && trendData.length > 0 && (
            <div className="mt-2">
              <Sparkline
                data={trendData}
                width={60}
                height={20}
                color="success"
                strokeWidth={2}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && details && details.length > 0 && (
        <div
          className={cn(
            'absolute z-50 left-0 right-0 top-full mt-2',
            'p-3 rounded-lg',
            'bg-gray-900 dark:bg-gray-800',
            'border border-gray-700',
            'shadow-lg',
            'animate-fade-in'
          )}
        >
          {/* Arrow */}
          <div className="absolute -top-1 left-6 w-2 h-2 bg-gray-900 dark:bg-gray-800 border-l border-t border-gray-700 transform rotate-45" />

          {/* Tooltip Content */}
          <div className="space-y-2">
            {details.map((detail, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-400">{detail.label}:</span>
                <span className="text-white font-semibold ml-3">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnimatedStatsCard;
