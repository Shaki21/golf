import React from 'react';
import Card from '../../../../ui/primitives/Card';
import Alert from '../../../../ui/primitives/Alert.primitive';
import { CardTitle } from '../../../../components/typography';

/**
 * AsyncBoundary
 *
 * Wrapper component for handling async data states uniformly.
 * Provides consistent loading, error, stale, and empty states.
 *
 * Design principles:
 * - All states are premium-designed (no raw text)
 * - Loading uses skeleton, not spinner (maintains layout)
 * - Error includes retry action
 * - Stale data is indicated but still displayed
 * - Empty state has clear CTA
 */

type AsyncState = 'loading' | 'error' | 'stale' | 'empty' | 'success';

interface AsyncBoundaryProps {
  /** Current async state */
  state: AsyncState;
  /** Content to render on success/stale */
  children: React.ReactNode;
  /** Loading skeleton component */
  skeleton?: React.ReactNode;
  /** Error message */
  errorMessage?: string;
  /** Retry action for error state */
  onRetry?: () => void;
  /** Stale data message */
  staleMessage?: string;
  /** Empty state configuration */
  emptyState?: {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  /** Compact mode (for smaller widgets) */
  compact?: boolean;
}

const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
  state,
  children,
  skeleton,
  errorMessage = 'Noe gikk galt ved lasting av data',
  onRetry,
  staleMessage = 'Viser tidligere data. Oppdaterer...',
  emptyState,
  compact = false,
}) => {
  // Loading state
  if (state === 'loading') {
    if (skeleton) {
      return <>{skeleton}</>;
    }
    return <DefaultLoadingSkeleton compact={compact} />;
  }

  // Error state
  if (state === 'error') {
    return (
      <ErrorPanel
        message={errorMessage}
        onRetry={onRetry}
        compact={compact}
      />
    );
  }

  // Empty state
  if (state === 'empty' && emptyState) {
    return (
      <EmptyPanel
        title={emptyState.title}
        description={emptyState.description}
        actionLabel={emptyState.actionLabel}
        onAction={emptyState.onAction}
        compact={compact}
      />
    );
  }

  // Stale state - show alert above content
  if (state === 'stale') {
    return (
      <div>
        <div style={{ marginBottom: 'var(--spacing-3)' }}>
          <Alert
            variant="info"
            compact
            dismissible={false}
          >
            {staleMessage}
          </Alert>
        </div>
        {children}
      </div>
    );
  }

  // Success state
  return <>{children}</>;
};

/**
 * Default loading skeleton for when none is provided
 */
const DefaultLoadingSkeleton: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const pulseStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-sm)',
    animation: 'skeletonPulse 1.5s ease-in-out infinite',
  };

  return (
    <Card variant="default" padding={compact ? 'md' : 'default'}>
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div style={{ ...pulseStyle, height: '16px', width: '40%', marginBottom: '12px' }} />
      <div style={{ ...pulseStyle, height: '24px', width: '80%', marginBottom: '8px' }} />
      <div style={{ ...pulseStyle, height: '12px', width: '60%' }} />
    </Card>
  );
};

/**
 * Error panel with premium design
 */
interface ErrorPanelProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

const ErrorPanel: React.FC<ErrorPanelProps> = ({ message, onRetry, compact }) => {
  return (
    <Card variant="outlined" padding={compact ? 'md' : 'default'}>
      <div style={errorStyles.container}>
        {/* Error icon */}
        <div style={errorStyles.iconWrapper}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Message */}
        <p style={errorStyles.message}>{message}</p>

        {/* Retry button */}
        {onRetry && (
          <button
            style={errorStyles.retryButton}
            onClick={onRetry}
            className="btn-interactive"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 4v6h6" />
              <path d="M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            Prøv igjen
          </button>
        )}
      </div>
    </Card>
  );
};

const errorStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: 'var(--spacing-4)',
  },
  iconWrapper: {
    color: 'rgb(var(--status-error))',
    marginBottom: 'var(--spacing-3)',
    opacity: 0.8,
  },
  message: {
    fontSize: 'var(--font-size-subheadline)',
    lineHeight: 'var(--line-height-subheadline)',
    color: 'var(--text-secondary)',
    margin: '0 0 var(--spacing-4) 0',
    maxWidth: '240px',
  },
  retryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    height: '40px',
    padding: '0 var(--spacing-4)',
    backgroundColor: 'var(--background-surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};

/**
 * Empty state panel with premium design
 */
interface EmptyPanelProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

const EmptyPanel: React.FC<EmptyPanelProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  compact,
}) => {
  return (
    <Card variant="default" padding={compact ? 'md' : 'spacious'}>
      <div style={emptyStyles.container}>
        {/* Empty state icon */}
        <div style={emptyStyles.iconWrapper}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </div>

        {/* Title */}
        <CardTitle style={emptyStyles.title}>{title}</CardTitle>

        {/* Description */}
        {description && (
          <p style={emptyStyles.description}>{description}</p>
        )}

        {/* Action button */}
        {actionLabel && onAction && (
          <button
            style={emptyStyles.actionButton}
            onClick={onAction}
            className="btn-interactive"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </Card>
  );
};

const emptyStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: 'var(--spacing-4)',
  },
  iconWrapper: {
    color: 'var(--text-tertiary)',
    marginBottom: 'var(--spacing-3)',
    opacity: 0.6,
  },
  title: {
    fontSize: 'var(--font-size-headline)',
    lineHeight: 'var(--line-height-headline)',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '0 0 var(--spacing-2) 0',
  },
  description: {
    fontSize: 'var(--font-size-subheadline)',
    lineHeight: 'var(--line-height-subheadline)',
    color: 'var(--text-secondary)',
    margin: '0 0 var(--spacing-4) 0',
    maxWidth: '280px',
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '44px',
    padding: '0 var(--spacing-5)',
    backgroundColor: 'var(--tier-navy)',
    color: 'var(--text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-subheadline)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
};

export default AsyncBoundary;

/**
 * Hook helper for determining async state
 */
export type AsyncStateResult<T> = {
  state: AsyncState;
  data: T | null;
};

export function useAsyncState<T>(
  isLoading: boolean,
  error: Error | null | unknown,
  data: T | null | undefined,
  isEmpty?: (data: T) => boolean,
  isStale?: boolean
): AsyncState {
  if (isLoading) return 'loading';
  if (error) return 'error';
  if (isStale) return 'stale';
  if (data === null || data === undefined || (isEmpty && isEmpty(data))) return 'empty';
  return 'success';
}
