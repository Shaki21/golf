import React from 'react';
import { SubSectionTitle } from '../../components/typography';

/**
 * CardHeader Raw Block
 * Header section for cards with title, subtitle, and action buttons
 */

interface CardHeaderProps {
  /** Main title */
  title: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Icon or avatar on the left */
  icon?: React.ReactNode;
  /** Action buttons on the right */
  actions?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Border bottom */
  divider?: boolean;
}

// Size configuration
const SIZE_CONFIG = {
  sm: {
    padding: 'p-2',
    titleClass: 'text-sm',
    subtitleClass: 'text-[10px]',
  },
  md: {
    padding: 'p-3',
    titleClass: 'text-base',
    subtitleClass: 'text-[11px]',
  },
  lg: {
    padding: 'p-5',
    titleClass: 'text-lg',
    subtitleClass: 'text-sm',
  },
};

const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  size = 'md',
  divider = false,
}) => {
  const config = SIZE_CONFIG[size];

  return (
    <div
      className={`flex items-center justify-between gap-3 ${config.padding} ${
        divider ? 'border-b border-tier-border-subtle' : ''
      }`}
    >
      {/* Left Side: Icon + Text */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <div className="shrink-0 flex items-center justify-center">
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <SubSectionTitle
            className={`m-0 font-semibold text-tier-navy leading-tight truncate ${config.titleClass}`}
          >
            {title}
          </SubSectionTitle>
          {subtitle && (
            <p className={`mt-0.5 mb-0 text-tier-text-secondary leading-snug truncate ${config.subtitleClass}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Side: Actions */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default CardHeader;
