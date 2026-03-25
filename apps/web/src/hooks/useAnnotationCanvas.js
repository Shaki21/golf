/* eslint-disable react-hooks/exhaustive-deps */
/**
 * useAnnotationCanvas Hook
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 *
 * Custom hook for canvas-based video annotation
 * Provides:
 * - Drawing tool management (line, circle, arrow, angle, freehand, text)
 * - Canvas state management
 * - Undo/redo stack
 * - Annotation serialization/deserialization
 * - Touch support for mobile
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// Drawing tool types
export const TOOL_TYPES = {
  SELECT: 'select',
  LINE: 'line',
  CIRCLE: 'circle',
  ARROW: 'arrow',
  ANGLE: 'angle',
  FREEHAND: 'freehand',
  TEXT: 'text',
};

// Default colors for annotations - using direct hex values for canvas drawing
// Note: Canvas requires actual color values, not CSS variables
export const ANNOTATION_COLORS = [
  '#C45B4E', // Red (error)
  '#4A7C59', // Green (success)
  '#2C5F7F', // Blue (info)
  '#E5D49B', // Yellow (warningLight)
  '#E5B5B0', // Magenta/Pink (errorLight)
  '#B5CCD6', // Cyan (infoLight)
  'rgb(var(--tier-white))', // White
  '#D4A84B', // Orange (warning)
];

// Default stroke widths
export const STROKE_WIDTHS = [2, 3, 4, 6, 8];

/**
 * Custom hook for annotation canvas functionality
 *
 * @param {Object} options - Hook options
 * @param {number} options.width - Canvas width
 * @param {number} options.height - Canvas height
 * @param {Function} options.onAnnotationChange - Callback when annotations change
 * @param {Array} options.initialAnnotations - Initial annotations to load
 * @returns {Object} Canvas state and controls
 */
export function useAnnotationCanvas(options = {}) {
  const {
    width = 1920,
    height = 1080,
    onAnnotationChange,
    initialAnnotations = [],
  } = options;

  // Refs
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState(TOOL_TYPES.LINE);
  const [strokeColor, setStrokeColor] = useState(ANNOTATION_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [annotations, setAnnotations] = useState(initialAnnotations);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);

  // Drawing state for current stroke
  const startPointRef = useRef(null);
  const currentPointRef = useRef(null);
  const freehandPointsRef = useRef([]);
  const anglePointsRef = useRef([]);

  /**
   * Initialize canvas context
   */
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    // Redraw existing annotations
    redrawCanvas();
  }, [width, height]);

  /**
   * Clear the canvas
   */
  const clearCanvas = useCallback(() => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  /**
   * Redraw all annotations on canvas
   */
  const redrawCanvas = useCallback(() => {
    clearCanvas();
    annotations.forEach((annotation) => {
      drawAnnotation(annotation);
    });
    if (currentAnnotation) {
      drawAnnotation(currentAnnotation);
    }
  }, [annotations, currentAnnotation, clearCanvas]);

  /**
   * Draw a single annotation
   */
  const drawAnnotation = useCallback((annotation) => {
    const context = contextRef.current;
    if (!context) return;

    context.strokeStyle = annotation.color;
    context.lineWidth = annotation.strokeWidth;
    context.fillStyle = annotation.color;

    switch (annotation.type) {
      case TOOL_TYPES.LINE:
        drawLine(context, annotation);
        break;
      case TOOL_TYPES.CIRCLE:
        drawCircle(context, annotation);
        break;
      case TOOL_TYPES.ARROW:
        drawArrow(context, annotation);
        break;
      case TOOL_TYPES.ANGLE:
        drawAngle(context, annotation);
        break;
      case TOOL_TYPES.FREEHAND:
        drawFreehand(context, annotation);
        break;
      case TOOL_TYPES.TEXT:
        drawText(context, annotation);
        break;
      default:
        break;
    }
  }, []);

  /**
   * Draw a line
   */
  const drawLine = (context, { startX, startY, endX, endY }) => {
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
  };

  /**
   * Draw a circle
   */
  const drawCircle = (context, { startX, startY, endX, endY }) => {
    const radius = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );
    context.beginPath();
    context.arc(startX, startY, radius, 0, 2 * Math.PI);
    context.stroke();
  };

  /**
   * Draw an arrow
   */
  const drawArrow = (context, { startX, startY, endX, endY, strokeWidth }) => {
    const headLength = strokeWidth * 4;
    const angle = Math.atan2(endY - startY, endX - startX);

    // Draw line
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();

    // Draw arrowhead
    context.beginPath();
    context.moveTo(endX, endY);
    context.lineTo(
      endX - headLength * Math.cos(angle - Math.PI / 6),
      endY - headLength * Math.sin(angle - Math.PI / 6)
    );
    context.moveTo(endX, endY);
    context.lineTo(
      endX - headLength * Math.cos(angle + Math.PI / 6),
      endY - headLength * Math.sin(angle + Math.PI / 6)
    );
    context.stroke();
  };

  /**
   * Draw an angle measurement
   */
  const drawAngle = (context, { points, strokeWidth }) => {
    if (!points || points.length < 3) return;

    const [p1, vertex, p2] = points;

    // Draw lines from vertex to points
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(vertex.x, vertex.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();

    // Calculate angle
    const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
    let angleDiff = (angle2 - angle1) * (180 / Math.PI);
    if (angleDiff < 0) angleDiff += 360;
    if (angleDiff > 180) angleDiff = 360 - angleDiff;

    // Draw arc
    const arcRadius = strokeWidth * 8;
    context.beginPath();
    context.arc(vertex.x, vertex.y, arcRadius, angle1, angle2);
    context.stroke();

    // Draw angle text
    const textX = vertex.x + arcRadius * 1.5 * Math.cos((angle1 + angle2) / 2);
    const textY = vertex.y + arcRadius * 1.5 * Math.sin((angle1 + angle2) / 2);
    context.font = `${strokeWidth * 5}px Inter, sans-serif`;
    context.fillText(`${Math.round(angleDiff)}°`, textX, textY);
  };

  /**
   * Draw freehand path
   */
  const drawFreehand = (context, { points }) => {
    if (!points || points.length < 2) return;

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      context.lineTo(points[i].x, points[i].y);
    }
    context.stroke();
  };

  /**
   * Draw text annotation
   */
  const drawText = (context, { x, y, text, strokeWidth, color }) => {
    context.font = `${strokeWidth * 6}px Inter, sans-serif`;
    context.fillStyle = color;
    context.fillText(text, x, y);
  };

  /**
   * Get coordinates from event (supports both mouse and touch)
   */
  const getCoordinates = useCallback((event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event.changedTouches && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  /**
   * Start drawing
   */
  const startDrawing = useCallback((event) => {
    if (currentTool === TOOL_TYPES.SELECT) return;

    const coords = getCoordinates(event);
    setIsDrawing(true);
    startPointRef.current = coords;
    currentPointRef.current = coords;

    if (currentTool === TOOL_TYPES.FREEHAND) {
      freehandPointsRef.current = [coords];
    } else if (currentTool === TOOL_TYPES.ANGLE) {
      anglePointsRef.current = [...anglePointsRef.current, coords];
      if (anglePointsRef.current.length === 3) {
        // Complete angle annotation
        const annotation = {
          id: Date.now().toString(),
          type: TOOL_TYPES.ANGLE,
          points: anglePointsRef.current,
          color: strokeColor,
          strokeWidth,
          timestamp: Date.now(),
        };
        addAnnotation(annotation);
        anglePointsRef.current = [];
        setIsDrawing(false);
      }
      return;
    }

    if (currentTool === TOOL_TYPES.TEXT) {
      const text = prompt('Enter text:');
      if (text) {
        const annotation = {
          id: Date.now().toString(),
          type: TOOL_TYPES.TEXT,
          x: coords.x,
          y: coords.y,
          text,
          color: strokeColor,
          strokeWidth,
          timestamp: Date.now(),
        };
        addAnnotation(annotation);
      }
      setIsDrawing(false);
    }
  }, [currentTool, strokeColor, strokeWidth, getCoordinates]);

  /**
   * Continue drawing
   */
  const draw = useCallback((event) => {
    if (!isDrawing) return;
    if (currentTool === TOOL_TYPES.SELECT || currentTool === TOOL_TYPES.TEXT) return;
    if (currentTool === TOOL_TYPES.ANGLE) return;

    const coords = getCoordinates(event);
    currentPointRef.current = coords;

    if (currentTool === TOOL_TYPES.FREEHAND) {
      freehandPointsRef.current.push(coords);
    }

    // Create temporary annotation for preview
    const tempAnnotation = createTempAnnotation(coords);
    setCurrentAnnotation(tempAnnotation);
    redrawCanvas();
  }, [isDrawing, currentTool, strokeColor, strokeWidth, getCoordinates, redrawCanvas]);

  /**
   * Create temporary annotation for preview
   */
  const createTempAnnotation = useCallback((endCoords) => {
    const start = startPointRef.current;
    if (!start) return null;

    const baseAnnotation = {
      id: 'temp',
      type: currentTool,
      color: strokeColor,
      strokeWidth,
      timestamp: Date.now(),
    };

    switch (currentTool) {
      case TOOL_TYPES.LINE:
      case TOOL_TYPES.ARROW:
        return {
          ...baseAnnotation,
          startX: start.x,
          startY: start.y,
          endX: endCoords.x,
          endY: endCoords.y,
        };
      case TOOL_TYPES.CIRCLE:
        return {
          ...baseAnnotation,
          startX: start.x,
          startY: start.y,
          endX: endCoords.x,
          endY: endCoords.y,
        };
      case TOOL_TYPES.FREEHAND:
        return {
          ...baseAnnotation,
          points: [...freehandPointsRef.current],
        };
      default:
        return null;
    }
  }, [currentTool, strokeColor, strokeWidth]);

  /**
   * End drawing
   */
  const endDrawing = useCallback((event) => {
    if (!isDrawing) return;
    if (currentTool === TOOL_TYPES.SELECT || currentTool === TOOL_TYPES.TEXT) return;
    if (currentTool === TOOL_TYPES.ANGLE) return;

    const coords = getCoordinates(event);
    const start = startPointRef.current;

    if (!start) {
      setIsDrawing(false);
      return;
    }

    // Create final annotation
    let annotation = null;

    switch (currentTool) {
      case TOOL_TYPES.LINE:
        annotation = {
          id: Date.now().toString(),
          type: TOOL_TYPES.LINE,
          startX: start.x,
          startY: start.y,
          endX: coords.x,
          endY: coords.y,
          color: strokeColor,
          strokeWidth,
          timestamp: Date.now(),
        };
        break;
      case TOOL_TYPES.CIRCLE:
        annotation = {
          id: Date.now().toString(),
          type: TOOL_TYPES.CIRCLE,
          startX: start.x,
          startY: start.y,
          endX: coords.x,
          endY: coords.y,
          color: strokeColor,
          strokeWidth,
          timestamp: Date.now(),
        };
        break;
      case TOOL_TYPES.ARROW:
        annotation = {
          id: Date.now().toString(),
          type: TOOL_TYPES.ARROW,
          startX: start.x,
          startY: start.y,
          endX: coords.x,
          endY: coords.y,
          color: strokeColor,
          strokeWidth,
          timestamp: Date.now(),
        };
        break;
      case TOOL_TYPES.FREEHAND:
        if (freehandPointsRef.current.length > 1) {
          annotation = {
            id: Date.now().toString(),
            type: TOOL_TYPES.FREEHAND,
            points: [...freehandPointsRef.current],
            color: strokeColor,
            strokeWidth,
            timestamp: Date.now(),
          };
        }
        freehandPointsRef.current = [];
        break;
      default:
        break;
    }

    if (annotation) {
      addAnnotation(annotation);
    }

    setIsDrawing(false);
    setCurrentAnnotation(null);
    startPointRef.current = null;
    currentPointRef.current = null;
  }, [isDrawing, currentTool, strokeColor, strokeWidth, getCoordinates]);

  /**
   * Add annotation to list
   */
  const addAnnotation = useCallback((annotation) => {
    setAnnotations((prev) => {
      const newAnnotations = [...prev, annotation];
      onAnnotationChange?.(newAnnotations);
      return newAnnotations;
    });
    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack([]);
  }, [annotations, onAnnotationChange]);

  /**
   * Remove annotation by ID
   */
  const removeAnnotation = useCallback((id) => {
    setAnnotations((prev) => {
      const newAnnotations = prev.filter((a) => a.id !== id);
      onAnnotationChange?.(newAnnotations);
      return newAnnotations;
    });
    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack([]);
    setSelectedAnnotation(null);
  }, [annotations, onAnnotationChange]);

  /**
   * Undo last action
   */
  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const previousState = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, annotations]);
    setUndoStack((prev) => prev.slice(0, -1));
    setAnnotations(previousState);
    onAnnotationChange?.(previousState);
  }, [undoStack, annotations, onAnnotationChange]);

  /**
   * Redo last undone action
   */
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack((prev) => prev.slice(0, -1));
    setAnnotations(nextState);
    onAnnotationChange?.(nextState);
  }, [redoStack, annotations, onAnnotationChange]);

  /**
   * Clear all annotations
   */
  const clearAnnotations = useCallback(() => {
    if (annotations.length === 0) return;

    setUndoStack((prev) => [...prev, annotations]);
    setRedoStack([]);
    setAnnotations([]);
    onAnnotationChange?.([]);
    clearCanvas();
  }, [annotations, onAnnotationChange, clearCanvas]);

  /**
   * Serialize annotations to JSON
   */
  const serializeAnnotations = useCallback(() => {
    return JSON.stringify(annotations);
  }, [annotations]);

  /**
   * Load annotations from JSON
   */
  const loadAnnotations = useCallback((json) => {
    try {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      setAnnotations(parsed);
      onAnnotationChange?.(parsed);
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  }, [onAnnotationChange]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((event) => {
    // Ctrl/Cmd + Z = Undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      undo();
    }
    // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y = Redo
    if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
      event.preventDefault();
      redo();
    }
    // Escape = Deselect / Cancel
    if (event.key === 'Escape') {
      setSelectedAnnotation(null);
      setCurrentTool(TOOL_TYPES.SELECT);
      anglePointsRef.current = [];
    }
    // Delete/Backspace = Remove selected
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedAnnotation) {
      event.preventDefault();
      removeAnnotation(selectedAnnotation);
    }
    // Tool shortcuts
    if (!event.ctrlKey && !event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'v':
          setCurrentTool(TOOL_TYPES.SELECT);
          break;
        case 'l':
          setCurrentTool(TOOL_TYPES.LINE);
          break;
        case 'c':
          setCurrentTool(TOOL_TYPES.CIRCLE);
          break;
        case 'a':
          setCurrentTool(TOOL_TYPES.ARROW);
          break;
        case 'g':
          setCurrentTool(TOOL_TYPES.ANGLE);
          break;
        case 'p':
          setCurrentTool(TOOL_TYPES.FREEHAND);
          break;
        case 't':
          setCurrentTool(TOOL_TYPES.TEXT);
          break;
        default:
          break;
      }
    }
  }, [undo, redo, selectedAnnotation, removeAnnotation]);

  // Initialize canvas when ref is set
  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  // Redraw when annotations change
  useEffect(() => {
    redrawCanvas();
  }, [annotations, redrawCanvas]);

  return {
    // Refs
    canvasRef,

    // State
    isDrawing,
    currentTool,
    strokeColor,
    strokeWidth,
    annotations,
    selectedAnnotation,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,

    // Tool controls
    setCurrentTool,
    setStrokeColor,
    setStrokeWidth,

    // Drawing handlers
    startDrawing,
    draw,
    endDrawing,

    // Annotation management
    addAnnotation,
    removeAnnotation,
    clearAnnotations,
    undo,
    redo,

    // Serialization
    serializeAnnotations,
    loadAnnotations,

    // Keyboard handler
    handleKeyDown,

    // Canvas initialization
    initializeCanvas,
    redrawCanvas,
  };
}

export default useAnnotationCanvas;
