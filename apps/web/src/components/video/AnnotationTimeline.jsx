/**
 * AnnotationTimeline Component
 * Visual timeline showing all annotations for a video
 *
 * Features:
 * - Visual markers on timeline at annotation timestamps
 * - Click markers to jump to that point in video
 * - Hover preview of annotation content
 * - Filter by annotation type
 * - Color-coded by type
 * - Current time indicator
 * - Zoom and scroll for long videos
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { AnnotationMarker, ANNOTATION_TYPE_CONFIG } from './AnnotationMarker';
import { SubSectionTitle } from '../typography';

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2, 8px)',
    padding: 'var(--spacing-3, 12px)',
    backgroundColor: 'var(--tier-toast-bg)',
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid var(--tier-surface-dark-border)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-3, 12px)',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary, white)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2, 8px)',
  },
  count: {
    padding: '2px 8px',
    backgroundColor: 'var(--bg-accent-subtle)',
    color: 'var(--accent)',
    borderRadius: 'var(--radius-full, 9999px)',
    fontSize: '12px',
    fontWeight: '600',
  },
  filters: {
    display: 'flex',
    gap: 'var(--spacing-1, 4px)',
  },
  filterButton: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: '1px solid var(--video-border)',
    borderRadius: 'var(--radius-sm, 4px)',
    color: 'var(--video-text-secondary)',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.15s ease',
  },
  filterButtonActive: {
    backgroundColor: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: 'white',
  },
  timelineContainer: {
    position: 'relative',
    height: '48px',
    marginTop: 'var(--spacing-2, 8px)',
  },
  timeline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '20px',
    height: '8px',
    backgroundColor: 'var(--tier-surface-dark-elevated)',
    borderRadius: '4px',
    cursor: 'pointer',
    overflow: 'visible',
  },
  timelineProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: 'var(--bg-accent-subtle)',
    borderRadius: '4px',
    pointerEvents: 'none',
  },
  currentTimeIndicator: {
    position: 'absolute',
    top: '-4px',
    width: '2px',
    height: '16px',
    backgroundColor: 'var(--accent)',
    borderRadius: '1px',
    transform: 'translateX(-50%)',
    zIndex: 20,
    pointerEvents: 'none',
  },
  currentTimeHandle: {
    position: 'absolute',
    top: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '12px',
    height: '12px',
    backgroundColor: 'var(--accent)',
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: 'var(--video-shadow-sm)',
  },
  markersContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '20px',
  },
  timeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
    fontSize: '10px',
    fontFamily: 'var(--font-mono, monospace)',
    color: 'var(--video-text-tertiary)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-4, 16px)',
    color: 'var(--video-text-tertiary)',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '32px',
    height: '32px',
    marginBottom: 'var(--spacing-2, 8px)',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: '13px',
    margin: 0,
  },
  annotationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1, 4px)',
    marginTop: 'var(--spacing-2, 8px)',
    maxHeight: '150px',
    overflowY: 'auto',
  },
  annotationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2, 8px)',
    padding: 'var(--spacing-2, 8px)',
    backgroundColor: 'var(--tier-surface-dark-elevated)',
    borderRadius: 'var(--radius-sm, 4px)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  annotationItemActive: {
    backgroundColor: 'var(--bg-accent-subtle)',
  },
  annotationIcon: {
    width: '24px',
    height: '24px',
    borderRadius: 'var(--radius-sm, 4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    flexShrink: 0,
  },
  annotationInfo: {
    flex: 1,
    minWidth: 0,
  },
  annotationType: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-primary, white)',
  },
  annotationTimestamp: {
    fontSize: '11px',
    color: 'var(--video-text-tertiary)',
    fontFamily: 'var(--font-mono, monospace)',
  },
  annotationNote: {
    fontSize: '11px',
    color: 'var(--video-text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

// Icons
const AnnotationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const EmptyIcon = () => (
  <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

// Get icon for annotation type
function getTypeIcon(type, size = 12) {
  const icons = {
    line: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="19" x2="19" y2="5" />
      </svg>
    ),
    circle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
    arrow: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    angle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 19 L5 5 L19 19" />
      </svg>
    ),
    freehand: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 17c3-3 6-8 9-8s6 5 9 8" />
      </svg>
    ),
    text: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    ),
    voiceover: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      </svg>
    ),
  };
  return icons[type] || icons.circle;
}

/**
 * Format timestamp as MM:SS
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * AnnotationTimeline Component
 */
export function AnnotationTimeline({
  annotations = [],
  duration = 0,
  currentTime = 0,
  selectedAnnotationId = null,
  onAnnotationClick,
  onAnnotationEdit,
  onAnnotationDelete,
  onSeek,
  showList = true,
  style,
  className,
}) {
  const [activeFilter, setActiveFilter] = useState(null);
  const timelineRef = useRef(null);

  // Filter annotations
  const filteredAnnotations = useMemo(() => {
    if (!activeFilter) return annotations;
    return annotations.filter((a) => a.type === activeFilter);
  }, [annotations, activeFilter]);

  // Sort annotations by timestamp
  const sortedAnnotations = useMemo(() => {
    return [...filteredAnnotations].sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredAnnotations]);

  // Get unique annotation types for filters
  const annotationTypes = useMemo(() => {
    const types = new Set(annotations.map((a) => a.type));
    return Array.from(types);
  }, [annotations]);

  // Handle timeline click
  const handleTimelineClick = useCallback((e) => {
    if (!timelineRef.current || duration <= 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(duration, percent * duration));
    onSeek?.(time);
  }, [duration, onSeek]);

  // Handle filter click
  const handleFilterClick = useCallback((type) => {
    setActiveFilter((prev) => (prev === type ? null : type));
  }, []);

  // Calculate marker position
  const getMarkerPosition = useCallback((timestamp) => {
    if (duration <= 0) return 0;
    return (timestamp / duration) * 100;
  }, [duration]);

  // Calculate current time position
  const currentTimePosition = useMemo(() => {
    if (duration <= 0) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  // Render empty state
  if (annotations.length === 0) {
    return (
      <div className={className} style={{ ...styles.container, ...style }}>
        <div style={styles.header}>
          <SubSectionTitle style={styles.title}>
            <AnnotationIcon />
            Annotasjoner
          </SubSectionTitle>
        </div>
        <div style={styles.emptyState}>
          <EmptyIcon />
          <p style={styles.emptyText}>
            Ingen annotasjoner ennå. Bruk tegneverktøyene for å legge til.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ ...styles.container, ...style }}>
      {/* Header */}
      <div style={styles.header}>
        <SubSectionTitle style={styles.title}>
          <AnnotationIcon />
          Annotasjoner
          <span style={styles.count}>{filteredAnnotations.length}</span>
        </SubSectionTitle>

        {/* Type filters */}
        {annotationTypes.length > 1 && (
          <div style={styles.filters}>
            {annotationTypes.map((type) => {
              const config = ANNOTATION_TYPE_CONFIG[type];
              return (
                <button
                  key={type}
                  style={{
                    ...styles.filterButton,
                    ...(activeFilter === type ? styles.filterButtonActive : {}),
                  }}
                  onClick={() => handleFilterClick(type)}
                  title={config?.label || type}
                >
                  {getTypeIcon(type, 10)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div style={styles.timelineContainer}>
        {/* Markers container */}
        <div style={styles.markersContainer}>
          {sortedAnnotations.map((annotation) => (
            <AnnotationMarker
              key={annotation.id}
              annotation={annotation}
              position={getMarkerPosition(annotation.timestamp)}
              selected={annotation.id === selectedAnnotationId}
              onClick={onAnnotationClick}
              onEdit={onAnnotationEdit}
              onDelete={onAnnotationDelete}
            />
          ))}
        </div>

        {/* Timeline bar */}
        <div
          ref={timelineRef}
          style={styles.timeline}
          onClick={handleTimelineClick}
          role="slider"
          aria-label="Video tidslinje"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
        >
          {/* Progress fill */}
          <div
            style={{
              ...styles.timelineProgress,
              width: `${currentTimePosition}%`,
            }}
          />

          {/* Current time indicator */}
          <div
            style={{
              ...styles.currentTimeIndicator,
              left: `${currentTimePosition}%`,
            }}
          >
            <div style={styles.currentTimeHandle} />
          </div>
        </div>

        {/* Time labels */}
        <div style={styles.timeLabels}>
          <span>0:00</span>
          <span>{formatTime(duration / 4)}</span>
          <span>{formatTime(duration / 2)}</span>
          <span>{formatTime((duration * 3) / 4)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Annotation list */}
      {showList && sortedAnnotations.length > 0 && (
        <div style={styles.annotationList}>
          {sortedAnnotations.map((annotation) => {
            const config = ANNOTATION_TYPE_CONFIG[annotation.type] || {};
            const isActive = annotation.id === selectedAnnotationId;

            return (
              <div
                key={annotation.id}
                style={{
                  ...styles.annotationItem,
                  ...(isActive ? styles.annotationItemActive : {}),
                }}
                onClick={() => onAnnotationClick?.(annotation)}
                role="button"
                tabIndex={0}
              >
                <div
                  style={{
                    ...styles.annotationIcon,
                    backgroundColor: annotation.color || config.color || 'var(--accent)',
                  }}
                >
                  {getTypeIcon(annotation.type)}
                </div>
                <div style={styles.annotationInfo}>
                  <div style={styles.annotationType}>
                    {config.label || annotation.type}
                    <span style={styles.annotationTimestamp}>
                      {' '}• {formatTime(annotation.timestamp)}
                    </span>
                  </div>
                  {annotation.note && (
                    <div style={styles.annotationNote}>{annotation.note}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AnnotationTimeline;
