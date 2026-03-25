import React from 'react';
import { ChevronRight } from 'lucide-react';
import { SubSectionTitle } from '../../components/typography';

/**
 * WidgetHeader
 * Unified header for dashboard widgets with optional action button
 */

interface WidgetHeaderProps {
  /** Widget title */
  title: string;
  /** Optional icon component */
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  /** Optional action handler */
  action?: () => void;
  /** Action button label */
  actionLabel?: string;
}

const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  icon: Icon,
  action,
  actionLabel = 'Se alle',
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-tier-gold" />}
        <SubSectionTitle className="text-sm font-semibold text-tier-navy m-0">
          {title}
        </SubSectionTitle>
      </div>
      {action && (
        <button
          onClick={action}
          className="text-[10px] text-tier-gold font-medium bg-transparent border-none cursor-pointer flex items-center gap-1 p-0"
        >
          {actionLabel} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

export default WidgetHeader;
