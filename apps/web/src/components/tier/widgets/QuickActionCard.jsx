import React from 'react';
import { cn } from '../../../lib/utils';

/**
 * TIER Golf Quick Action Card
 *
 * Interactive card for dashboard quick actions with optional notification badge.
 * Perfect for navigation shortcuts, feature access, and common actions.
 *
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.label - Action label text
 * @param {number} props.badge - Optional notification badge count
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * <QuickActionCard
 *   icon={Calendar}
 *   label="Kalender"
 *   onClick={() => navigate('/calendar')}
 * />
 *
 * @example
 * <QuickActionCard
 *   icon={MessageCircle}
 *   label="Meldinger"
 *   badge={3}
 *   onClick={() => navigate('/messages')}
 * />
 */

export function QuickActionCard({
  icon: Icon,
  label,
  badge,
  onClick,
  disabled = false,
  className,
  ...props
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex flex-col items-center gap-3 p-4',
        'bg-white rounded-xl border border-gray-200',
        'transition-all duration-200',
        !disabled && 'hover:shadow-md hover:border-tier-navy/20 active:scale-95',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {/* Notification Badge */}
      {badge && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 rounded-full bg-tier-gold text-tier-navy text-xs font-bold flex items-center justify-center shadow-sm">
            {badge > 99 ? '99+' : badge}
          </div>
        </div>
      )}

      {/* Icon Container */}
      <div className="w-12 h-12 rounded-lg bg-tier-navy/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-tier-navy" />
      </div>

      {/* Label */}
      <span className="text-sm font-medium text-tier-navy">{label}</span>
    </button>
  );
}

QuickActionCard.displayName = 'QuickActionCard';
