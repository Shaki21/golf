import React from 'react';
import { TrendingUp, TrendingDown, Target, Minus, Info } from 'lucide-react';
import Badge from '../../ui/primitives/Badge.primitive';

/**
 * Strokes Gained Widget for Player Dashboard
 *
 * Card Shell Contract applied:
 * - Consistent surface, borders, shadows (rounded-2xl)
 * - Unified header row pattern
 * - Standard KPI typography (tabular-nums)
 * - Single vertical rhythm
 * - Semantic tokens only
 */

// Card Shell base styles
const cardShell = {
  base: {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
    border: '1px solid var(--border-subtle)',
    overflow: 'hidden',
  },
};

const SG_CATEGORIES = [
  { id: 'approach', label: 'Approach', icon: 'Target' },
  { id: 'around_green', label: 'Short Game', icon: 'Flag' },
  { id: 'putting', label: 'Putting', icon: 'Golfer' },
];

const SGCategoryBar = ({ category, value, tourAvg = 0, pgaElite = 0.8 }) => {
  // Normalize value to a 0-100 scale for display
  const normalizedValue = Math.max(0, Math.min(100, ((value + 1.5) / 3) * 100));
  const tourMarker = ((tourAvg + 1.5) / 3) * 100;
  const eliteMarker = ((pgaElite + 1.5) / 3) * 100;

  const getValueColor = () => {
    if (value >= 0.3) return 'var(--tier-success)';
    if (value >= 0) return 'var(--text-brand)';
    if (value >= -0.3) return 'var(--tier-warning)';
    return 'var(--tier-error)';
  };

  return (
    <div style={styles.categoryItem}>
      <div style={styles.categoryHeader}>
        <span style={styles.categoryLabel}>
          <span>{category.icon}</span>
          {category.label}
        </span>
        <span style={{ ...styles.categoryValue, color: getValueColor() }}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}
        </span>
      </div>

      {/* Progress bar with markers */}
      <div style={styles.progressTrack}>
        {/* Tour average marker */}
        <div style={{ ...styles.marker, left: `${tourMarker}%`, backgroundColor: 'var(--text-secondary)' }} title="PGA Tour Average" />
        {/* Elite marker */}
        <div style={{ ...styles.marker, left: `${eliteMarker}%`, backgroundColor: 'var(--tier-success)' }} title="PGA Elite" />
        {/* Value bar */}
        <div style={{ ...styles.progressFill, width: `${normalizedValue}%`, backgroundColor: getValueColor() }} />
      </div>

      {/* Labels */}
      <div style={styles.progressLabels}>
        <span>-1.5</span>
        <span>Tour avg</span>
        <span>+1.5</span>
      </div>
    </div>
  );
};

const SGSummaryCard = ({ total, trend, percentile }) => {
  const getTrendIcon = () => {
    if (trend > 0.05) return <TrendingUp size={16} style={{ color: 'var(--tier-success)' }} />;
    if (trend < -0.05) return <TrendingDown size={16} style={{ color: 'var(--tier-error)' }} />;
    return <Minus size={16} style={{ color: 'var(--text-secondary)' }} />;
  };

  const getTrendColor = () => {
    if (trend > 0.05) return 'var(--text-secondary)';
    if (trend < -0.05) return 'var(--text-secondary)';
    return 'var(--text-secondary)';
  };

  const getPercentileLabel = () => {
    if (percentile >= 90) return 'Elite';
    if (percentile >= 75) return 'Strong';
    if (percentile >= 50) return 'Average';
    if (percentile >= 25) return 'Below Average';
    return 'Needs Focus';
  };

  const getPercentileVariant = () => {
    if (percentile >= 75) return 'success';
    if (percentile >= 50) return 'accent';
    if (percentile >= 25) return 'warning';
    return 'error';
  };

  return (
    <div style={styles.summaryCard}>
      <div>
        <p style={styles.summaryLabel}>Total Strokes Gained</p>
        <div style={styles.summaryValueRow}>
          <span style={{
            ...styles.summaryValue,
            color: total >= 0 ? 'var(--tier-success)' : 'var(--tier-error)',
          }}>
            {total >= 0 ? '+' : ''}{total.toFixed(2)}
          </span>
          <div style={{ ...styles.summaryTrend, color: getTrendColor() }}>
            {getTrendIcon()}
            <span>{trend >= 0 ? '+' : ''}{trend.toFixed(2)} this week</span>
          </div>
        </div>
      </div>

      <div style={styles.summaryRight}>
        <Badge variant={getPercentileVariant()} size="md">
          {getPercentileLabel()}
        </Badge>
        <p style={styles.percentileLabel}>
          Top {100 - percentile}% vs tour
        </p>
      </div>
    </div>
  );
};

const StrokesGainedWidget = ({ data, loading, error, onViewDetails }) => {
  // Loading state
  if (loading) {
    return (
      <div style={cardShell.base}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Target size={18} style={{ color: 'var(--text-secondary)' }} />
            <span style={styles.title}>Strokes Gained</span>
          </div>
        </div>
        <div style={styles.content}>
          <div style={styles.skeletonContent}>
            {[1, 2, 3].map(i => (
              <div key={i} style={styles.skeletonLine} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={cardShell.base}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Target size={18} style={{ color: 'var(--text-secondary)' }} />
            <span style={styles.title}>Strokes Gained</span>
          </div>
        </div>
        <div style={styles.content}>
          <div style={styles.errorState}>
            <span style={styles.errorText}>Could not load SG data</span>
            <span style={styles.errorMeta}>Try again later</span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data) {
    return (
      <div style={cardShell.base}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Target size={18} style={{ color: 'var(--text-secondary)' }} />
            <span style={styles.title}>Strokes Gained</span>
          </div>
        </div>
        <div style={styles.content}>
          <div style={styles.emptyState}>
            <span style={styles.emptyText}>Loading SG data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={cardShell.base}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Target size={18} style={{ color: 'var(--text-secondary)' }} />
          <span style={styles.title}>Strokes Gained</span>
        </div>
        {onViewDetails && (
          <button onClick={onViewDetails} style={styles.actionButton}>
            Details
          </button>
        )}
      </div>

      <div style={styles.content}>
        {/* Demo data indicator */}
        {data.isDemo && (
          <div style={styles.demoIndicator}>
            <Info size={16} color="var(--info)" />
            <span>Showing demo data. Complete tests to see your results.</span>
          </div>
        )}

        {/* Summary Card */}
        <SGSummaryCard
          total={data.total}
          trend={data.trend}
          percentile={data.percentile}
        />

        {/* Category Breakdown */}
        <div style={styles.categoriesList}>
          {SG_CATEGORIES.map(category => {
            const categoryData = data.byCategory?.[category.id] || { value: 0, tourAvg: 0 };
            return (
              <SGCategoryBar
                key={category.id}
                category={category}
                value={categoryData.value}
                tourAvg={categoryData.tourAvg}
                pgaElite={categoryData.pgaElite || 0.8}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: 'var(--text-secondary)' }} />
            Tour avg
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: 'var(--tier-success)' }} />
            PGA Elite
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 16px 24px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  actionButton: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
  },

  // Content
  content: {
    padding: '20px 24px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  // Loading skeleton
  skeletonContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '20px 0',
  },
  skeletonLine: {
    height: '48px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '8px',
  },

  // Error state
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '24px 16px',
    textAlign: 'center',
  },
  errorText: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  errorMeta: {
    fontSize: '13px',
    color: 'var(--text-tertiary)',
  },

  // Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--text-tertiary)',
  },

  // Demo indicator
  demoIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    backgroundColor: 'var(--info-muted)',
    border: '1px solid rgba(2, 132, 199, 0.2)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--spacing-4)',
    fontSize: 'var(--font-size-footnote)',
    color: 'var(--text-secondary)',
  },

  // Summary Card
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '12px',
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    margin: 0,
  },
  summaryValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
    marginTop: '4px',
  },
  summaryValue: {
    fontSize: '30px',
    fontWeight: 600,
    fontFeatureSettings: '"tnum"',
    lineHeight: 1,
  },
  summaryTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
  },
  summaryRight: {
    textAlign: 'right',
  },
  percentileLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: '6px 0 0 0',
  },

  // Category Items
  categoriesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  categoryItem: {
    marginBottom: '0',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  categoryLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  categoryValue: {
    fontSize: '14px',
    fontWeight: 600,
    fontFeatureSettings: '"tnum"',
  },

  // Progress bar
  progressTrack: {
    position: 'relative',
    height: '8px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '4px',
    overflow: 'visible',
  },
  marker: {
    position: 'absolute',
    top: '-2px',
    width: '2px',
    height: '12px',
    borderRadius: '1px',
    zIndex: 2,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease-out',
  },
  progressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
    fontSize: '10px',
    color: 'var(--text-tertiary)',
  },

  // Legend
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '4px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-subtle)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '2px',
  },
};

export default StrokesGainedWidget;
