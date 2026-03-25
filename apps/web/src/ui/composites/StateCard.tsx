import React from 'react';
import Card from '../primitives/Card';
import { LucideIcon } from 'lucide-react';
import { SubSectionTitle } from '../../components/typography';

/**
 * StateCard
 * Reusable component for displaying loading, error, and empty states
 *
 * UI Canon:
 * - Uses Card primitive as base
 * - Consistent use of semantic tokens
 * - Three variants: info, error, empty
 */

interface StateCardProps {
  /** Main title/message */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action button/element */
  action?: React.ReactNode;
  /** Visual variant */
  variant?: 'info' | 'error' | 'empty' | 'loading';
  /** Compact mode (less padding) */
  compact?: boolean;
  /** Optional custom icon (Lucide icon component) */
  icon?: LucideIcon;
}

// Variant config with Tailwind classes
const VARIANT_CONFIG: Record<string, { iconColor: string }> = {
  info: { iconColor: 'text-tier-text-tertiary' },
  error: { iconColor: 'text-red-500' },
  empty: { iconColor: 'text-tier-text-tertiary' },
  loading: { iconColor: 'text-tier-text-tertiary' },
};

const StateCard: React.FC<StateCardProps> = ({
  title,
  description,
  action,
  variant = 'info',
  compact = false,
  icon: IconComponent,
}) => {
  const config = VARIANT_CONFIG[variant];

  const renderIcon = () => {
    if (IconComponent) {
      return <IconComponent size={48} />;
    }
    if (variant === 'loading') {
      return (
        <span className="w-6 h-6 border-2 border-tier-border-default border-t-tier-gold rounded-full animate-spin" />
      );
    }
    return null;
  };

  return (
    <Card padding={compact ? 'compact' : 'default'}>
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        {renderIcon() && (
          <div className={`w-12 h-12 flex items-center justify-center mb-4 ${config.iconColor}`}>
            {renderIcon()}
          </div>
        )}
        <SubSectionTitle className="text-lg font-semibold m-0 mb-2 text-tier-navy">{title}</SubSectionTitle>
        {description && (
          <p className="text-[13px] text-tier-text-tertiary m-0 mb-4 max-w-[320px] leading-relaxed">
            {description}
          </p>
        )}
        {action && <div className="mt-0">{action}</div>}
      </div>
    </Card>
  );
};

export default StateCard;
