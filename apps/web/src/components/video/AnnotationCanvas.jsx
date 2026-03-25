/**
 * TIER GOLF — VIDEO ANALYSIS SYSTEM
 * AnnotationCanvas Component
 *
 * Canvas overlay for drawing annotations on video frames:
 * - Transparent overlay that sits on top of video
 * - Drawing tools for swing analysis (line, circle, arrow, angle, freehand, text)
 * - Touch support for mobile devices
 * - Undo/redo functionality
 * - Annotation serialization for saving to API
 */

import React, { useEffect, useCallback } from 'react';
import { useAnnotationCanvas, TOOL_TYPES } from '../../hooks/useAnnotationCanvas';
import ToolPalette from './ToolPalette';

// Styles using CSS variables
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  canvasWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'auto',
  },
  canvas: {
    width: '100%',
    height: '100%',
    cursor: 'crosshair',
  },
  cursorSelect: {
    cursor: 'default',
  },
  cursorText: {
    cursor: 'text',
  },
  paletteWrapper: {
    position: 'absolute',
    top: 'var(--spacing-3)',
    left: 'var(--spacing-3)',
    zIndex: 10,
  },
  paletteHorizontal: {
    top: 'auto',
    bottom: 'var(--spacing-16)',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  modeIndicator: {
    position: 'absolute',
    top: 'var(--spacing-3)',
    right: 'var(--spacing-3)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    backgroundColor: 'var(--video-bg-light)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-inverse)',
    fontSize: 'var(--font-size-caption1)',
    fontFamily: 'var(--font-family)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  modeIndicatorDot: {
    width: '8px',
    height: '8px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--achievement)',
  },
  instructionText: {
    position: 'absolute',
    bottom: 'var(--spacing-16)',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    backgroundColor: 'var(--video-bg)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-inverse)',
    fontSize: 'var(--font-size-footnote)',
    fontFamily: 'var(--font-family)',
    textAlign: 'center',
    pointerEvents: 'none',
  },
};

// Tool instructions for user guidance
const toolInstructions = {
  [TOOL_TYPES.SELECT]: 'Klikk for å velge annotering',
  [TOOL_TYPES.LINE]: 'Dra for å tegne en linje',
  [TOOL_TYPES.CIRCLE]: 'Dra fra sentrum for å tegne en sirkel',
  [TOOL_TYPES.ARROW]: 'Dra for å tegne en pil',
  [TOOL_TYPES.ANGLE]: 'Klikk tre punkter for å måle vinkel',
  [TOOL_TYPES.FREEHAND]: 'Tegn fritt med pennen',
  [TOOL_TYPES.TEXT]: 'Klikk for å legge til tekst',
};

// Tool labels in Norwegian
const toolLabels = {
  [TOOL_TYPES.SELECT]: 'Velg',
  [TOOL_TYPES.LINE]: 'Linje',
  [TOOL_TYPES.CIRCLE]: 'Sirkel',
  [TOOL_TYPES.ARROW]: 'Pil',
  [TOOL_TYPES.ANGLE]: 'Vinkel',
  [TOOL_TYPES.FREEHAND]: 'Frihånd',
  [TOOL_TYPES.TEXT]: 'Tekst',
};

/**
 * AnnotationCanvas Component
 *
 * @param {Object} props
 * @param {number} props.width - Canvas width (default 1920)
 * @param {number} props.height - Canvas height (default 1080)
 * @param {Array} props.initialAnnotations - Initial annotations to load
 * @param {Function} props.onAnnotationChange - Callback when annotations change
 * @param {Function} props.onSave - Callback to save annotations
 * @param {boolean} props.showPalette - Show tool palette (default true)
 * @param {boolean} props.showInstructions - Show tool instructions (default true)
 * @param {boolean} props.showModeIndicator - Show current mode indicator (default true)
 * @param {string} props.palettePosition - Palette position: 'left' | 'bottom' (default 'left')
 * @param {boolean} props.disabled - Disable drawing
 * @param {Object} props.style - Additional container styles
 * @param {string} props.className - Additional CSS class
 */
export function AnnotationCanvas({
  width = 1920,
  height = 1080,
  initialAnnotations = [],
  onAnnotationChange,
  onSave,
  showPalette = true,
  showInstructions = true,
  showModeIndicator = true,
  palettePosition = 'left',
  disabled = false,
  style,
  className,
}) {
  const {
    canvasRef,
    isDrawing,
    currentTool,
    strokeColor,
    strokeWidth,
    annotations,
    canUndo,
    canRedo,
    setCurrentTool,
    setStrokeColor,
    setStrokeWidth,
    startDrawing,
    draw,
    endDrawing,
    undo,
    redo,
    clearAnnotations,
    serializeAnnotations,
    loadAnnotations,
    handleKeyDown,
  } = useAnnotationCanvas({
    width,
    height,
    initialAnnotations,
    onAnnotationChange,
  });

  /**
   * Get cursor style based on current tool
   */
  const getCursorStyle = useCallback(() => {
    switch (currentTool) {
      case TOOL_TYPES.SELECT:
        return styles.cursorSelect;
      case TOOL_TYPES.TEXT:
        return styles.cursorText;
      default:
        return {};
    }
  }, [currentTool]);

  /**
   * Handle mouse down
   */
  const handleMouseDown = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    startDrawing(e);
  }, [disabled, startDrawing]);

  /**
   * Handle mouse move
   */
  const handleMouseMove = useCallback((e) => {
    if (disabled) return;
    draw(e);
  }, [disabled, draw]);

  /**
   * Handle mouse up
   */
  const handleMouseUp = useCallback((e) => {
    if (disabled) return;
    endDrawing(e);
  }, [disabled, endDrawing]);

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    startDrawing(e);
  }, [disabled, startDrawing]);

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    draw(e);
  }, [disabled, draw]);

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback((e) => {
    if (disabled) return;
    endDrawing(e);
  }, [disabled, endDrawing]);

  /**
   * Handle save button click
   */
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(annotations, serializeAnnotations());
    }
  }, [onSave, annotations, serializeAnnotations]);

  // Attach keyboard handler
  useEffect(() => {
    const handleKey = (e) => {
      if (disabled) return;
      handleKeyDown(e);
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [disabled, handleKeyDown]);

  // Load initial annotations when they change
  useEffect(() => {
    if (initialAnnotations && initialAnnotations.length > 0) {
      loadAnnotations(initialAnnotations);
    }
  }, [initialAnnotations, loadAnnotations]);

  return (
    <div
      style={{
        ...styles.container,
        ...style,
      }}
      className={className}
    >
      {/* Canvas */}
      <div style={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          style={{
            ...styles.canvas,
            ...getCursorStyle(),
            ...(disabled ? { pointerEvents: 'none' } : {}),
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Tool Palette */}
      {showPalette && !disabled && (
        <div
          style={{
            ...styles.paletteWrapper,
            ...(palettePosition === 'bottom' ? styles.paletteHorizontal : {}),
          }}
        >
          <ToolPalette
            currentTool={currentTool}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            canUndo={canUndo}
            canRedo={canRedo}
            setCurrentTool={setCurrentTool}
            setStrokeColor={setStrokeColor}
            setStrokeWidth={setStrokeWidth}
            undo={undo}
            redo={redo}
            clearAnnotations={clearAnnotations}
            horizontal={palettePosition === 'bottom'}
          />
        </div>
      )}

      {/* Mode Indicator */}
      {showModeIndicator && !disabled && (
        <div style={styles.modeIndicator}>
          <div style={styles.modeIndicatorDot} />
          <span>{toolLabels[currentTool]}</span>
        </div>
      )}

      {/* Tool Instructions */}
      {showInstructions && !disabled && !isDrawing && (
        <div style={styles.instructionText}>
          {toolInstructions[currentTool]}
        </div>
      )}
    </div>
  );
}

export default AnnotationCanvas;
