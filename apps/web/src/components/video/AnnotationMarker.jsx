/**
 * AnnotationMarker Component
 * Individual marker on the annotation timeline
 *
 * Features:
 * - Visual indicator for annotation position
 * - Color-coded by annotation type
 * - Hover preview with annotation details
 * - Click to jump to timestamp
 * - Edit/delete actions on hover
 */

import React, { useState, useCallback, useRef } from 'react';
import ConfirmDialog from '../ui/ConfirmDialog';
import { CardTitle } from '../typography';

// Annotation type icons and colors using semantic tokens
export const ANNOTATION_TYPE_CONFIG = {
  line: {
    label: 'Linje',
    color: 'var(--accent)', // Forest green
    icon: 'line',
  },
  circle: {
    label: 'Sirkel',
    color: 'var(--success)', // Green
    icon: 'circle',
  },
  arrow: {
    label: 'Pil',
    color: 'var(--warning)', // Amber
    icon: 'arrow',
  },
  angle: {
    label: 'Vinkel',
    color: 'var(--tier-tier-platinum)', // Purple
    icon: 'angle',
  },
  freehand: {
    label: 'Frihånd',
    color: 'var(--tier-tier-platinum)', // Purple
    icon: 'freehand',
  },
  text: {
    label: 'Tekst',
    color: 'var(--info)', // Cyan
    icon: 'text',
  },
  voiceover: {
    label: 'Stemme',
    color: 'var(--error)', // Red
    icon: 'mic',
  },
};

// Styles
const styles = {
  container: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    zIndex: 10,
    cursor: 'pointer',
  },
  marker: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: 'var(--video-shadow-sm)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  markerHovered: {
    transform: 'scale(1.3)',
    boxShadow: 'var(--video-shadow-md)',
  },
  markerSelected: {
    transform: 'scale(1.4)',
    boxShadow: '0 0 0 3px var(--video-focus-ring)',
  },
  stem: {
    position: 'absolute',
    left: '50%',
    top: '100%',
    width: '2px',
    height: '8px',
    backgroundColor: 'white',
    transform: 'translateX(-50%)',
    boxShadow: 'var(--video-shadow-sm)',
  },
  tooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 16px)',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: 'var(--spacing-3, 12px)',
    backgroundColor: 'var(--tier-toast-bg)',
    borderRadius: 'var(--radius-md, 8px)',
    border: '1px solid var(--tier-surface-dark-border)',
    boxShadow: 'var(--video-shadow-lg)',
    minWidth: '180px',
    maxWidth: '280px',
    zIndex: 100,
    pointerEvents: 'auto',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: '-6px',
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
    width: '12px',
    height: '12px',
    backgroundColor: 'var(--tier-toast-bg)',
    border: '1px solid var(--tier-surface-dark-border)',
    borderTop: 'none',
    borderLeft: 'none',
  },
  tooltipHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2, 8px)',
    marginBottom: 'var(--spacing-2, 8px)',
  },
  tooltipIcon: {
    width: '24px',
    height: '24px',
    borderRadius: 'var(--radius-sm, 4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  tooltipTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary, white)',
  },
  tooltipTimestamp: {
    fontSize: '11px',
    color: 'var(--video-text-tertiary)',
    fontFamily: 'var(--font-mono, monospace)',
  },
  tooltipPreview: {
    width: '100%',
    height: '80px',
    backgroundColor: 'var(--tier-surface-dark-elevated)',
    borderRadius: 'var(--radius-sm, 4px)',
    marginBottom: 'var(--spacing-2, 8px)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipNote: {
    fontSize: '12px',
    color: 'var(--video-text-secondary)',
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  tooltipActions: {
    display: 'flex',
    gap: 'var(--spacing-2, 8px)',
    marginTop: 'var(--spacing-3, 12px)',
    paddingTop: 'var(--spacing-2, 8px)',
    borderTop: '1px solid var(--video-border)',
  },
  actionButton: {
    flex: 1,
    padding: '6px 10px',
    backgroundColor: 'transparent',
    border: '1px solid var(--video-border-strong)',
    borderRadius: 'var(--radius-sm, 4px)',
    color: 'var(--video-text-secondary)',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    transition: 'all 0.15s ease',
  },
  deleteButton: {
    color: 'var(--error)',
    borderColor: 'var(--bg-error-subtle)',
  },
  voiceIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: 'var(--video-text-tertiary)',
    marginTop: 'var(--spacing-1, 4px)',
  },
};

// Icons
const LineIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="19" x2="19" y2="5" />
  </svg>
);

const CircleIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="8" />
  </svg>
);

const ArrowIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const AngleIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 19 L5 5 L19 19" />
  </svg>
);

const FreehandIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 17c3-3 6-8 9-8s6 5 9 8" />
  </svg>
);

const TextIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const MicIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
  </svg>
);

const EditIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// Get icon component for annotation type
function getTypeIcon(type, size = 14) {
  switch (type) {
    case 'line': return <LineIcon size={size} />;
    case 'circle': return <CircleIcon size={size} />;
    case 'arrow': return <ArrowIcon size={size} />;
    case 'angle': return <AngleIcon size={size} />;
    case 'freehand': return <FreehandIcon size={size} />;
    case 'text': return <TextIcon size={size} />;
    case 'voiceover': return <MicIcon size={size} />;
    default: return <CircleIcon size={size} />;
  }
}

/**
 * Format timestamp as MM:SS.ms
 */
function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
}

/**
 * AnnotationMarker Component
 */
export function AnnotationMarker({
  annotation,
  position,
  selected = false,
  showTooltip = true,
  onClick,
  onEdit,
  onDelete,
  style,
  className,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const tooltipTimeoutRef = useRef(null);

  const config = ANNOTATION_TYPE_CONFIG[annotation.type] || ANNOTATION_TYPE_CONFIG.circle;

  // Handle mouse enter with delay
  const handleMouseEnter = useCallback(() => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 200);
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setIsHovered(false);
  }, []);

  // Handle click
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onClick?.(annotation);
  }, [annotation, onClick]);

  // Handle edit
  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    onEdit?.(annotation);
  }, [annotation, onEdit]);

  // Handle delete - show confirmation modal
  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  }, []);

  // Confirm delete
  const handleConfirmDelete = useCallback(() => {
    onDelete?.(annotation);
    setShowDeleteConfirm(false);
  }, [annotation, onDelete]);

  return (
    <div
      className={className}
      style={{
        ...styles.container,
        left: `${position}%`,
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`${config.label} ved ${formatTimestamp(annotation.timestamp)}`}
    >
      {/* Stem */}
      <div style={styles.stem} />

      {/* Marker dot */}
      <div
        style={{
          ...styles.marker,
          backgroundColor: annotation.color || config.color,
          ...(isHovered ? styles.markerHovered : {}),
          ...(selected ? styles.markerSelected : {}),
        }}
      />

      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div style={styles.tooltip}>
          <div style={styles.tooltipArrow} />

          {/* Header */}
          <div style={styles.tooltipHeader}>
            <div
              style={{
                ...styles.tooltipIcon,
                backgroundColor: annotation.color || config.color,
              }}
            >
              {getTypeIcon(annotation.type)}
            </div>
            <div>
              <CardTitle style={styles.tooltipTitle}>{config.label}</CardTitle>
              <span style={styles.tooltipTimestamp}>
                {formatTimestamp(annotation.timestamp)}
              </span>
            </div>
          </div>

          {/* Preview (for drawing annotations) */}
          {annotation.drawingData && (
            <div style={styles.tooltipPreview}>
              {/* Could render a mini canvas preview here */}
              <svg width="60" height="40" viewBox="0 0 60 40">
                {getTypeIcon(annotation.type, 24)}
              </svg>
            </div>
          )}

          {/* Note text */}
          {annotation.note && (
            <p style={styles.tooltipNote}>{annotation.note}</p>
          )}

          {/* Voice duration indicator */}
          {annotation.type === 'voiceover' && annotation.audioDuration && (
            <div style={styles.voiceIndicator}>
              <MicIcon size={12} />
              <span>{Math.round(annotation.audioDuration)}s</span>
            </div>
          )}

          {/* Actions */}
          {(onEdit || onDelete) && (
            <div style={styles.tooltipActions}>
              {onEdit && (
                <button
                  style={styles.actionButton}
                  onClick={handleEdit}
                >
                  <EditIcon />
                  Rediger
                </button>
              )}
              {onDelete && (
                <button
                  style={{ ...styles.actionButton, ...styles.deleteButton }}
                  onClick={handleDelete}
                >
                  <DeleteIcon />
                  Slett
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Slett annotasjon"
        message="Er du sikker på at du vil slette denne annotasjonen?"
        confirmLabel="Slett"
        cancelLabel="Avbryt"
        variant="danger"
      />
    </div>
  );
}

export default AnnotationMarker;
