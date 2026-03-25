import React from 'react';

/**
 * DashboardCard
 * Unified card wrapper for dashboard widgets with consistent styling
 * Extends CardSimple with optional click handler and footer actions
 * Migrated to Tailwind CSS
 */

type PaddingSize = 'none' | 'sm' | 'md' | 'lg';

interface DashboardCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Optional click handler (makes card clickable) */
  onClick?: () => void;
  /** Additional className */
  className?: string;
  /** Optional footer content (typically action buttons) */
  footer?: React.ReactNode;
  /** Padding size */
  padding?: PaddingSize;
}

const PADDING_CLASSES: Record<PaddingSize, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  onClick,
  className = '',
  footer,
  padding = 'lg',
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-tier-border-subtle shadow-sm ${onClick ? 'cursor-pointer transition-all duration-200 hover:border-tier-gold hover:shadow-md' : ''} ${className}`}
      onClick={onClick}
    >
      <div className={`w-full ${PADDING_CLASSES[padding]}`}>{children}</div>
      {footer && (
        <div className="border-t border-tier-border-subtle px-5 py-4 flex items-center justify-end gap-3">
          {footer}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
