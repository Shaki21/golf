/**
 * TIER GOLF — VIDEO ANALYSIS SYSTEM
 * ToolPalette Component
 *
 * Provides drawing tool selection for video annotation:
 * - Tool buttons (select, line, circle, arrow, angle, freehand, text)
 * - Color picker
 * - Stroke width selector
 * - Undo/redo buttons
 * - Clear canvas button
 */

import React, { useCallback } from 'react';
import { TOOL_TYPES, ANNOTATION_COLORS, STROKE_WIDTHS } from '../../hooks/useAnnotationCanvas';

// Tool icons as inline SVGs
const icons = {
  select: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2 1-3.2-7.4L7 18.5V2z" />
    </svg>
  ),
  line: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="20" x2="20" y2="4" />
    </svg>
  ),
  circle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
    </svg>
  ),
  arrow: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="20" x2="20" y2="4" />
      <polyline points="14 4 20 4 20 10" />
    </svg>
  ),
  angle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20L4 8L16 20" />
      <path d="M4 14 A 6 6 0 0 0 10 20" />
    </svg>
  ),
  freehand: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17c3-3 6-8 10-8s4 5 8 5" />
    </svg>
  ),
  text: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 4v3h5.5v12h3V7H19V4H5z" />
    </svg>
  ),
  undo: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
    </svg>
  ),
  redo: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
    </svg>
  ),
  clear: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  ),
};

// Tool labels for accessibility
const toolLabels = {
  [TOOL_TYPES.SELECT]: 'Velg (V)',
  [TOOL_TYPES.LINE]: 'Linje (L)',
  [TOOL_TYPES.CIRCLE]: 'Sirkel (C)',
  [TOOL_TYPES.ARROW]: 'Pil (A)',
  [TOOL_TYPES.ANGLE]: 'Vinkel (G)',
  [TOOL_TYPES.FREEHAND]: 'Frihånd (P)',
  [TOOL_TYPES.TEXT]: 'Tekst (T)',
};

// Styles using CSS variables
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--video-bg)',
    borderRadius: 'var(--radius-md)',
    backdropFilter: 'blur(8px)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  sectionLabel: {
    fontSize: 'var(--font-size-caption2)',
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-family)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  toolsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1)',
  },
  toolButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: 'var(--video-control-bg)',
    border: '2px solid transparent',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-inverse)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toolButtonActive: {
    backgroundColor: 'var(--accent)',
    borderColor: 'var(--achievement)',
  },
  toolButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  colorRow: {
    display: 'flex',
    gap: 'var(--spacing-1)',
  },
  colorButton: {
    width: '28px',
    height: '28px',
    borderRadius: 'var(--radius-full)',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  colorButtonActive: {
    borderColor: 'var(--text-inverse)',
    transform: 'scale(1.1)',
  },
  strokeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  strokeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'var(--video-control-bg)',
    border: '2px solid transparent',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  strokeButtonActive: {
    borderColor: 'var(--achievement)',
  },
  strokePreview: {
    backgroundColor: 'var(--text-inverse)',
    borderRadius: 'var(--radius-full)',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--video-control-hover)',
    margin: 'var(--spacing-1) 0',
  },
  actionRow: {
    display: 'flex',
    gap: 'var(--spacing-1)',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
};

/**
 * ToolPalette Component
 *
 * @param {Object} props
 * @param {string} props.currentTool - Currently selected tool
 * @param {string} props.strokeColor - Current stroke color
 * @param {number} props.strokeWidth - Current stroke width
 * @param {boolean} props.canUndo - Whether undo is available
 * @param {boolean} props.canRedo - Whether redo is available
 * @param {Function} props.setCurrentTool - Set active tool
 * @param {Function} props.setStrokeColor - Set stroke color
 * @param {Function} props.setStrokeWidth - Set stroke width
 * @param {Function} props.undo - Undo last action
 * @param {Function} props.redo - Redo last action
 * @param {Function} props.clearAnnotations - Clear all annotations
 * @param {boolean} props.horizontal - Use horizontal layout
 * @param {boolean} props.compact - Use compact layout
 * @param {Object} props.style - Additional container styles
 */
export function ToolPalette({
  currentTool,
  strokeColor,
  strokeWidth,
  canUndo,
  canRedo,
  setCurrentTool,
  setStrokeColor,
  setStrokeWidth,
  undo,
  redo,
  clearAnnotations,
  horizontal = false,
  compact = false,
  style,
}) {
  /**
   * Handle tool button click
   */
  const handleToolClick = useCallback((tool) => {
    setCurrentTool(tool);
  }, [setCurrentTool]);

  /**
   * Handle color button click
   */
  const handleColorClick = useCallback((color) => {
    setStrokeColor(color);
  }, [setStrokeColor]);

  /**
   * Handle stroke width button click
   */
  const handleStrokeClick = useCallback((width) => {
    setStrokeWidth(width);
  }, [setStrokeWidth]);

  /**
   * Render a tool button
   */
  const renderToolButton = (tool, icon) => (
    <button
      key={tool}
      style={{
        ...styles.toolButton,
        ...(currentTool === tool ? styles.toolButtonActive : {}),
      }}
      onClick={() => handleToolClick(tool)}
      aria-label={toolLabels[tool]}
      title={toolLabels[tool]}
    >
      {icon}
    </button>
  );

  /**
   * Render a color button
   */
  const renderColorButton = (color) => (
    <button
      key={color}
      style={{
        ...styles.colorButton,
        backgroundColor: color,
        ...(strokeColor === color ? styles.colorButtonActive : {}),
      }}
      onClick={() => handleColorClick(color)}
      aria-label={`Farge: ${color}`}
      title={color}
    />
  );

  /**
   * Render a stroke width button
   */
  const renderStrokeButton = (width) => (
    <button
      key={width}
      style={{
        ...styles.strokeButton,
        ...(strokeWidth === width ? styles.strokeButtonActive : {}),
      }}
      onClick={() => handleStrokeClick(width)}
      aria-label={`Strekbredde: ${width}px`}
      title={`${width}px`}
    >
      <div
        style={{
          ...styles.strokePreview,
          width: `${width * 2}px`,
          height: `${width * 2}px`,
        }}
      />
    </button>
  );

  /**
   * Render an action button
   */
  const renderActionButton = (icon, label, onClick, disabled = false) => (
    <button
      style={{
        ...styles.toolButton,
        ...(disabled ? styles.toolButtonDisabled : {}),
      }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );

  return (
    <div
      style={{
        ...styles.container,
        ...(horizontal ? styles.horizontalContainer : {}),
        ...style,
      }}
    >
      {/* Drawing Tools */}
      <div style={{ ...styles.section, ...(horizontal ? styles.horizontalSection : {}) }}>
        {!compact && <span style={styles.sectionLabel}>Verktøy</span>}
        <div style={styles.toolsRow}>
          {renderToolButton(TOOL_TYPES.SELECT, icons.select)}
          {renderToolButton(TOOL_TYPES.LINE, icons.line)}
          {renderToolButton(TOOL_TYPES.CIRCLE, icons.circle)}
          {renderToolButton(TOOL_TYPES.ARROW, icons.arrow)}
          {renderToolButton(TOOL_TYPES.ANGLE, icons.angle)}
          {renderToolButton(TOOL_TYPES.FREEHAND, icons.freehand)}
          {renderToolButton(TOOL_TYPES.TEXT, icons.text)}
        </div>
      </div>

      {!horizontal && <div style={styles.divider} />}

      {/* Color Picker */}
      <div style={{ ...styles.section, ...(horizontal ? styles.horizontalSection : {}) }}>
        {!compact && <span style={styles.sectionLabel}>Farge</span>}
        <div style={styles.colorRow}>
          {ANNOTATION_COLORS.map(renderColorButton)}
        </div>
      </div>

      {!horizontal && <div style={styles.divider} />}

      {/* Stroke Width */}
      <div style={{ ...styles.section, ...(horizontal ? styles.horizontalSection : {}) }}>
        {!compact && <span style={styles.sectionLabel}>Strekbredde</span>}
        <div style={styles.strokeRow}>
          {STROKE_WIDTHS.map(renderStrokeButton)}
        </div>
      </div>

      {!horizontal && <div style={styles.divider} />}

      {/* Actions */}
      <div style={{ ...styles.section, ...(horizontal ? styles.horizontalSection : {}) }}>
        {!compact && <span style={styles.sectionLabel}>Handlinger</span>}
        <div style={styles.actionRow}>
          {renderActionButton(icons.undo, 'Angre (Ctrl+Z)', undo, !canUndo)}
          {renderActionButton(icons.redo, 'Gjør om (Ctrl+Y)', redo, !canRedo)}
          {renderActionButton(icons.clear, 'Tøm alt', clearAnnotations)}
        </div>
      </div>
    </div>
  );
}

export default ToolPalette;
