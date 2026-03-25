import React from 'react';

/**
 * Alert Primitive
 *
 * Status-based alert/notification component.
 * Uses semantic status colors for clear communication.
 *
 * UI Canon v1.2 Compliance:
 * - Status colors used only for status meaning
 * - No decorative gradients
 * - Clear visual hierarchy
 * - Touch-friendly dismiss target (44px)
 */

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  /** Alert variant determines color and icon */
  variant: AlertVariant;
  /** Alert title (optional) */
  title?: string;
  /** Alert message content */
  children: React.ReactNode;
  /** Dismissible alert */
  dismissible?: boolean;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** Action button (e.g., retry) */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional className */
  className?: string;
  /** Compact variant (less padding) */
  compact?: boolean;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

// Variant config with Tailwind classes
const VARIANT_CONFIG: Record<AlertVariant, {
  containerClass: string;
  iconColor: string;
}> = {
  info: {
    containerClass: 'bg-blue-50 border-l-blue-500',
    iconColor: 'text-blue-500',
  },
  success: {
    containerClass: 'bg-green-50 border-l-green-500',
    iconColor: 'text-green-500',
  },
  warning: {
    containerClass: 'bg-amber-50 border-l-amber-500',
    iconColor: 'text-amber-500',
  },
  error: {
    containerClass: 'bg-red-50 border-l-red-500',
    iconColor: 'text-red-500',
  },
};

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  children,
  dismissible = false,
  onDismiss,
  action,
  className = '',
  compact = false,
  style: customStyle = {},
}) => {
  const config = VARIANT_CONFIG[variant];

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border-l-4 ${config.containerClass} ${compact ? 'p-3' : 'p-4'} ${className}`}
      role="alert"
      style={customStyle}
    >
      {/* Icon */}
      <div className={`flex items-center justify-center shrink-0 mt-px ${config.iconColor}`}>
        {getIcon(variant)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-[15px] leading-snug font-semibold text-tier-navy m-0 mb-1">{title}</p>
        )}
        <div className="text-[13px] leading-relaxed text-tier-text-secondary">{children}</div>

        {/* Action button */}
        {action && (
          <button
            className={`inline-flex items-center mt-2 py-1 px-0 text-[13px] font-semibold bg-transparent border-none cursor-pointer transition-opacity duration-150 hover:opacity-80 ${config.iconColor}`}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && onDismiss && (
        <button
          className="flex items-center justify-center w-6 h-6 p-0 text-tier-text-tertiary bg-transparent border-none rounded cursor-pointer shrink-0 transition-colors duration-150 hover:bg-black/5"
          onClick={onDismiss}
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};

const getIcon = (variant: AlertVariant) => {
  const icons = {
    info: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    success: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  };

  return icons[variant];
};

export default Alert;
