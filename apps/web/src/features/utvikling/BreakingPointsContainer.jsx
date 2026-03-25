import React, { useState } from 'react';
import {
  Target, ChevronRight, Plus, CheckCircle, Clock,
  AlertTriangle, Calendar, Video, Loader
} from 'lucide-react';
import { SubSectionTitle } from '../../components/typography';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import { useBreakingPoints } from '../../hooks/useBreakingPoints';

// ============================================================================
// HELPERS
// ============================================================================

const getStatusConfig = (status) => {
  switch (status) {
    case 'working':
      return { label: 'Working on', color: 'var(--accent)', icon: Clock };
    case 'identified':
      return { label: 'Identified', color: 'var(--status-warning)', icon: AlertTriangle };
    case 'resolved':
      return { label: 'Resolved', color: 'var(--status-success)', icon: CheckCircle };
    default:
      return { label: status, color: 'var(--text-secondary)', icon: Target };
  }
};

const getPriorityConfig = (priority) => {
  switch (priority) {
    case 'high':
      return { label: 'High', color: 'var(--status-error)' };
    case 'medium':
      return { label: 'Medium', color: 'var(--status-warning)' };
    case 'low':
      return { label: 'Low', color: 'var(--text-secondary)' };
    default:
      return { label: priority, color: 'var(--text-secondary)' };
  }
};

// ============================================================================
// BREAKING POINT CARD
// ============================================================================

const BreakingPointCard = ({ point, onClick }) => {
  const statusConfig = getStatusConfig(point.status);
  const priorityConfig = getPriorityConfig(point.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <Card variant="default" padding="none">
      <div
        onClick={() => onClick(point)}
        style={{
          padding: 'var(--spacing-4)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          borderLeft: `4px solid ${priorityConfig.color}`,
          borderRadius: 'var(--radius-lg)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-3)',
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              marginBottom: 'var(--spacing-1)',
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(var(--accent-rgb), 0.1)',
                color: 'var(--accent)',
              }}>
                {point.area}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: statusConfig.color === 'var(--accent)' ? 'rgba(var(--accent-rgb), 0.1)' :
                               statusConfig.color === 'var(--status-warning)' ? 'rgba(var(--warning-rgb), 0.1)' :
                               statusConfig.color === 'var(--status-success)' ? 'rgba(var(--success-rgb), 0.1)' :
                               'var(--bg-tertiary)',
                color: statusConfig.color,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-1)',
              }}>
                <StatusIcon size={10} />
                {statusConfig.label}
              </span>
            </div>
            <SubSectionTitle>
              {point.title}
            </SubSectionTitle>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
        </div>

        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          margin: '0 0 var(--spacing-3) 0',
          lineHeight: 1.4,
        }}>
          {point.description}
        </p>

        {/* Progress Bar */}
        <div style={{ marginBottom: 'var(--spacing-3)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--spacing-1)',
          }}>
            <span>Progress</span>
            <span>{point.progress}%</span>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${point.progress}%`,
              backgroundColor: point.progress >= 80 ? 'var(--status-success)' :
                             point.progress >= 50 ? 'var(--accent)' : 'var(--status-warning)',
              borderRadius: '3px',
            }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-4)',
          paddingTop: 'var(--spacing-3)',
          borderTop: '1px solid var(--border-default)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-1)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}>
            <Calendar size={12} />
            {point.sessions} sessions
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-1)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}>
            <Video size={12} />
            {point.videos} videos
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-1)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}>
            <Target size={12} />
            {(point.drills || []).length} exercises
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// RESOLVED CARD
// ============================================================================

const ResolvedCard = ({ point }) => (
  <Card variant="default" padding="none">
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-3)',
      padding: 'var(--spacing-3) var(--spacing-3)',
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(var(--success-rgb), 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CheckCircle size={16} style={{ color: 'var(--status-success)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
          {point.title}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {point.area} - Resolved in {point.duration}
        </div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
        {new Date(point.resolvedDate).toLocaleDateString('en-US')}
      </div>
    </div>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BreakingPointsContainer = () => {
  const [filter, setFilter] = useState('all');
  const { data, loading, error } = useBreakingPoints(filter);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'working', label: 'Working on' },
    { key: 'identified', label: 'Identified' },
  ];

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        color: 'var(--text-secondary)',
      }}>
        <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: 'var(--spacing-2)' }}>Loading breaking points...</span>
      </div>
    );
  }

  // Error state - log but still show UI
  if (error) {
    console.warn('BreakingPoints error:', error);
  }

  const { breakingPoints, resolvedPoints, stats } = data;

  return (
    <div style={{ width: '100%' }}>
        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--spacing-2)',
          marginBottom: 'var(--spacing-6)',
        }}>
          <Card variant="default" padding="none">
            <div style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent)' }}>
                {stats.active}
              </div>
              <div style={{ fontSize: 'var(--font-size-footnote)', color: 'var(--text-secondary)' }}>Active</div>
            </div>
          </Card>
          <Card variant="default" padding="none">
            <div style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--status-error)' }}>
                {stats.highPriority}
              </div>
              <div style={{ fontSize: 'var(--font-size-footnote)', color: 'var(--text-secondary)' }}>High priority</div>
            </div>
          </Card>
          <Card variant="default" padding="none">
            <div style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--status-success)' }}>
                {stats.resolved}
              </div>
              <div style={{ fontSize: 'var(--font-size-footnote)', color: 'var(--text-secondary)' }}>Resolved</div>
            </div>
          </Card>
        </div>

        {/* Filters and Add Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-4)',
        }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-1)' }}>
            {filters.map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
          >
            Add
          </Button>
        </div>

        {/* Breaking Points List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-8)' }}>
          {breakingPoints.length > 0 ? (
            breakingPoints.map((point) => (
              <BreakingPointCard
                key={point.id}
                point={point}
                onClick={() => {/* View point details */}}
              />
            ))
          ) : (
            <div style={{
              padding: 'var(--spacing-6)',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}>
              <Target size={32} style={{ marginBottom: 'var(--spacing-2)', opacity: 0.5 }} />
              <div>No breaking points found</div>
              <div style={{ fontSize: '13px', marginTop: 'var(--spacing-1)' }}>
                Add your first focus area
              </div>
            </div>
          )}
        </div>

        {/* Resolved Section */}
        {resolvedPoints.length > 0 && (
          <div>
            <SubSectionTitle style={{ marginBottom: 'var(--spacing-3)' }}>
              Resolved Breaking Points
            </SubSectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {resolvedPoints.map((point) => (
                <ResolvedCard key={point.id} point={point} />
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default BreakingPointsContainer;
