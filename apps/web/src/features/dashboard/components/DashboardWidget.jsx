import React from 'react';
import { SubSectionTitle } from '../../../components/typography';

/**
 * DashboardWidget - Card Shell
 *
 * Unified card shell for all dashboard modules following the Card Shell Contract:
 *
 * 1) Outer container:
 *    - rounded-2xl (16px)
 *    - subtle border
 *    - card background surface
 *    - soft shadow (base)
 *    - consistent padding (p-6 desktop, p-5 small)
 *
 * 2) Card header row:
 *    - left: title (text-sm font-semibold)
 *    - right: action link/button (muted styling)
 *
 * 3) Content spacing:
 *    - single vertical rhythm: space-y-3 or space-y-4
 *
 * 4) KPI typography:
 *    - value: text-3xl font-semibold tabular-nums
 *    - meta: text-xs muted
 *    - deltas: text-xs muted (no loud colors)
 *
 * 5) Icons:
 *    - consistent sizing (16–20px)
 *    - semantic text/icon tokens only
 */

const DashboardWidget = ({
  title,
  subtitle,
  action,
  actionLabel = 'Se alle',
  icon: Icon,
  children,
  loading = false,
  error = null,
  onRetry,
  empty = false,
  emptyMessage = 'Ingen data tilgjengelig',
  emptyAction,
  emptyActionLabel,
  compact = false,
  noPadding = false,
  className = '',
  style = {},
  interactive = false,
  onClick,
}) => {
  // Loading state - skeleton
  if (loading) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        {title && (
          <div style={styles.header}>
            <div style={styles.skeletonTitle} />
          </div>
        )}
        <div style={noPadding ? {} : styles.content}>
          <div style={styles.skeletonContent}>
            <div style={styles.skeletonLine} />
            <div style={{ ...styles.skeletonLine, width: '70%' }} />
            <div style={{ ...styles.skeletonLine, width: '50%' }} />
          </div>
        </div>
      </div>
    );
  }

  // Error state - compact inline
  if (error) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        {title && (
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              {Icon && <Icon size={18} style={{ color: 'var(--text-secondary)' }} />}
              <SubSectionTitle style={styles.title}>{title}</SubSectionTitle>
            </div>
          </div>
        )}
        <div style={styles.content}>
          <div style={styles.errorState}>
            <span style={styles.errorIcon}>!</span>
            <span style={styles.errorText}>{typeof error === 'string' ? error : 'Kunne ikke laste data'}</span>
            {onRetry && (
              <button style={styles.retryButton} onClick={onRetry}>
                Prøv igjen
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Empty state - compact
  if (empty) {
    return (
      <div style={{ ...styles.container, ...style }} className={className}>
        {title && (
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              {Icon && <Icon size={18} style={{ color: 'var(--text-secondary)' }} />}
              <div>
                <SubSectionTitle style={styles.title}>{title}</SubSectionTitle>
                {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
              </div>
            </div>
          </div>
        )}
        <div style={styles.content}>
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>{emptyMessage}</p>
            {emptyAction && (
              <button style={styles.emptyAction} onClick={emptyAction}>
                {emptyActionLabel || 'Legg til'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Normal state
  const containerStyle = {
    ...styles.container,
    ...(interactive && styles.containerInteractive),
    ...style,
  };

  return (
    <div
      style={containerStyle}
      className={className}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {title && (
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {Icon && <Icon size={18} style={{ color: 'var(--text-secondary)' }} />}
            <div>
              <SubSectionTitle style={styles.title}>{title}</SubSectionTitle>
              {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
          {action && (
            <button style={styles.actionButton} onClick={action}>
              {actionLabel}
            </button>
          )}
        </div>
      )}
      <div style={noPadding ? {} : (compact ? styles.contentCompact : styles.content)}>
        {children}
      </div>
    </div>
  );
};

// Card Shell styles following the contract
const styles = {
  // 1) Outer container
  container: {
    backgroundColor: 'var(--card)',
    borderRadius: '16px', // rounded-2xl
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)', // soft shadow
    border: '1px solid var(--border-subtle)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  },
  containerInteractive: {
    cursor: 'pointer',
  },

  // 2) Card header row
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '20px 24px 16px 24px', // p-6 with bottom reduced
    borderBottom: '1px solid var(--border-subtle)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  title: {
    fontSize: '14px', // text-sm
    fontWeight: 600, // font-semibold
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.4,
  },
  subtitle: {
    fontSize: '12px', // text-xs
    color: 'var(--text-tertiary)', // muted
    margin: '2px 0 0 0',
  },
  actionButton: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)', // muted styling
    backgroundColor: 'transparent',
    border: 'none',
    padding: '4px 8px',
    marginTop: '-2px',
    marginRight: '-8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'color 0.15s ease, background-color 0.15s ease',
  },

  // 3) Content spacing
  content: {
    padding: '20px 24px 24px 24px', // p-6
  },
  contentCompact: {
    padding: '16px 20px 20px 20px', // p-5
  },

  // Skeleton styles
  skeletonTitle: {
    width: '120px',
    height: '16px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '4px',
  },
  skeletonContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px', // space-y-3
  },
  skeletonLine: {
    width: '100%',
    height: '14px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '4px',
  },

  // Error state - compact inline
  errorState: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'var(--error-muted)',
    borderRadius: '8px',
  },
  errorIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'rgb(var(--status-error))',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    flexShrink: 0,
  },
  errorText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    flex: 1,
  },
  retryButton: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '4px 8px',
    cursor: 'pointer',
    flexShrink: 0,
    textDecoration: 'underline',
  },

  // Empty state - compact
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--text-tertiary)',
    margin: 0,
  },
  emptyAction: {
    marginTop: '12px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-brand)',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '6px 12px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

// KPI helper components for consistent typography
export const KPIValue = ({ children, style = {} }) => (
  <span style={{
    fontSize: '30px', // text-3xl
    fontWeight: 600, // font-semibold
    fontFeatureSettings: '"tnum"', // tabular-nums
    color: 'var(--text-primary)',
    lineHeight: 1,
    ...style,
  }}>
    {children}
  </span>
);

export const KPIMeta = ({ children, style = {} }) => (
  <span style={{
    fontSize: '12px', // text-xs
    color: 'var(--text-tertiary)', // muted
    ...style,
  }}>
    {children}
  </span>
);

export const KPIDelta = ({ children, positive, style = {} }) => (
  <span style={{
    fontSize: '12px', // text-xs
    color: 'var(--text-secondary)', // muted (no loud colors)
    ...style,
  }}>
    {children}
  </span>
);

export default DashboardWidget;
