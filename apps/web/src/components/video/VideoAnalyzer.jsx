/**
 * TIER GOLF — VIDEO ANALYSIS SYSTEM
 * VideoAnalyzer Component
 *
 * Integrated video player with annotation canvas for swing analysis:
 * - Video playback with frame-by-frame navigation
 * - Annotation mode toggle for drawing on video
 * - Drawing tools (line, circle, arrow, angle, freehand, text)
 * - Per-frame annotation support
 * - Save/load annotations via API
 * - Voice-over audio recording support
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { useAnnotationCanvas } from '../../hooks/useAnnotationCanvas';
import { useVideo } from '../../hooks/useVideos';
import { useVideoAnnotations, useAnnotationAudio } from '../../hooks/useVideoAnnotations';
import VideoControls from './VideoControls';
import ToolPalette from './ToolPalette';
import { AnnotationTimeline } from './AnnotationTimeline';

// Icons
const PenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const LargePlayIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--accent)">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
);

// Styles
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
    backgroundColor: 'var(--background-inverse)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    aspectRatio: '16 / 9',
  },
  containerFullscreen: {
    borderRadius: 0,
    aspectRatio: 'unset',
    width: '100vw',
    height: '100vh',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    backgroundColor: 'var(--background-inverse)',
  },
  canvasOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  canvasOverlayActive: {
    pointerEvents: 'auto',
  },
  canvas: {
    width: '100%',
    height: '100%',
    cursor: 'crosshair',
  },
  controlsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 'var(--spacing-2)',
    background: 'var(--video-gradient-bottom)',
    transition: 'opacity 0.3s ease',
    zIndex: 20,
  },
  controlsHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    background: 'var(--video-gradient-top)',
    zIndex: 15,
  },
  modeToggle: {
    display: 'flex',
    gap: 'var(--spacing-2)',
  },
  modeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    backgroundColor: 'var(--video-bg-light)',
    border: '2px solid transparent',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-inverse)',
    fontSize: 'var(--font-size-footnote)',
    fontFamily: 'var(--font-family)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modeButtonActive: {
    backgroundColor: 'var(--accent)',
    borderColor: 'var(--achievement)',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    backgroundColor: 'var(--success)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-inverse)',
    fontSize: 'var(--font-size-footnote)',
    fontFamily: 'var(--font-family)',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  saveButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  toolPaletteWrapper: {
    position: 'absolute',
    top: '60px',
    left: 'var(--spacing-3)',
    zIndex: 25,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--video-bg-light)',
    cursor: 'pointer',
    zIndex: 5,
  },
  playOverlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    backgroundColor: 'var(--overlay-glass)',
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--video-shadow-lg)',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '4px solid var(--video-progress-bg)',
    borderTopColor: 'var(--achievement)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-6)',
    color: 'var(--text-inverse)',
    textAlign: 'center',
  },
  errorIcon: {
    width: '48px',
    height: '48px',
    color: 'var(--error)',
  },
  errorText: {
    fontSize: 'var(--font-size-body)',
    fontFamily: 'var(--font-family)',
  },
  retryButton: {
    padding: 'var(--spacing-2) var(--spacing-4)',
    backgroundColor: 'var(--accent)',
    color: 'var(--text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-body)',
    fontFamily: 'var(--font-family)',
    cursor: 'pointer',
  },
  annotationModeIndicator: {
    position: 'absolute',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    backgroundColor: 'var(--video-bg)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--achievement)',
    fontSize: 'var(--font-size-footnote)',
    fontFamily: 'var(--font-family)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    zIndex: 20,
  },
  timestampBadge: {
    padding: 'var(--spacing-1) var(--spacing-2)',
    backgroundColor: 'var(--video-control-hover)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-caption1)',
  },
  timelineWrapper: {
    marginTop: 'var(--spacing-3)',
  },
  outerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    width: '100%',
    maxWidth: '100%',
  },
};

// CSS keyframes
const spinnerKeyframes = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

/**
 * VideoAnalyzer Component
 *
 * @param {Object} props
 * @param {string} props.videoId - Video ID (preferred - fetches video data from API)
 * @param {string} props.src - Video source URL (fallback if videoId not provided)
 * @param {string} props.poster - Poster image URL
 * @param {boolean} props.autoPlay - Auto-play on load
 * @param {boolean} props.loop - Loop video playback
 * @param {Array} props.initialAnnotations - Initial annotations (fallback if not using API)
 * @param {Function} props.onAnnotationSave - Custom save callback (overrides API save)
 * @param {Function} props.onTimeUpdate - Callback on time update
 * @param {Function} props.onEnded - Callback when video ends
 * @param {Function} props.onError - Callback on error
 * @param {boolean} props.readOnly - Disable annotation editing
 * @param {boolean} props.useApi - Whether to use API for annotations (default: true if videoId provided)
 * @param {Object} props.style - Additional container styles
 * @param {string} props.className - Additional CSS class
 */
export function VideoAnalyzer({
  videoId,
  src: propsSrc,
  poster: propsPoster,
  autoPlay = false,
  loop = false,
  initialAnnotations = [],
  onAnnotationSave,
  onTimeUpdate,
  onEnded,
  onError,
  readOnly = false,
  useApi = true,
  style,
  className,
}) {
  // Mode state
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(autoPlay);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);

  // Canvas dimensions ref
  const canvasRef = useRef(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1920, height: 1080 });

  // Fetch video data from API if videoId is provided
  const shouldUseApi = useApi && videoId;
  const {
    video,
    playbackUrl,
    loading: videoLoading,
    error: videoError,
  } = useVideo(shouldUseApi ? videoId : null, { autoFetch: shouldUseApi });

  // Use API URL or props URL
  const src = playbackUrl || propsSrc;
  const poster = video?.thumbnailUrl || propsPoster;

  // Fetch annotations from API if using API mode
  const {
    annotations: apiAnnotations,
    loading: annotationsLoading,
    saving: apiSaving,
    error: annotationsError,
    createAnnotation,
    bulkCreateAnnotations,
    updateAnnotation,
    deleteAnnotation,
    getAnnotationsAtTime,
    refresh: refreshAnnotations,
  } = useVideoAnnotations(shouldUseApi ? videoId : null, {
    autoFetch: shouldUseApi,
  });

  // Audio hook for voice-overs
  const {
    audioUrl,
    uploading: audioUploading,
    uploadProgress: audioUploadProgress,
    uploadAudio,
    fetchAudioUrl,
  } = useAnnotationAudio(selectedAnnotationId);

  // Determine which annotations to use
  const effectiveAnnotations = useMemo(() => {
    if (shouldUseApi && apiAnnotations.length > 0) {
      // Transform API annotations to drawing format
      return apiAnnotations.map((a) => ({
        id: a.id,
        timestamp: parseFloat(a.timestamp),
        duration: a.duration ? parseFloat(a.duration) : null,
        type: a.type,
        ...a.drawingData,
        color: a.color,
        strokeWidth: a.strokeWidth,
        note: a.note,
        hasAudio: !!a.audioKey,
      }));
    }
    return initialAnnotations;
  }, [shouldUseApi, apiAnnotations, initialAnnotations]);

  // Combined loading/saving state
  const isSaving = apiSaving || audioUploading;
  const isLoadingData = videoLoading || annotationsLoading;

  // Video player hook
  const player = useVideoPlayer({
    src,
    autoPlay,
    loop,
    onTimeUpdate,
    onEnded,
    onError,
  });

  const {
    videoRef,
    containerRef,
    isPlaying,
    currentTime,
    duration,
    progress,
    bufferedProgress,
    playbackSpeed,
    volume,
    isMuted,
    isFullscreen,
    isLoading,
    error,
    showControls,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    nextFrame,
    previousFrame,
    changePlaybackSpeed,
    cyclePlaybackSpeed,
    changeVolume,
    toggleMute,
    toggleFullscreen,
    showControlsTemporarily,
    handleKeyDown: handleVideoKeyDown,
    formatTime,
    videoProps,
    pause,
  } = player;

  // Annotation canvas hook
  const annotation = useAnnotationCanvas({
    width: canvasDimensions.width,
    height: canvasDimensions.height,
    initialAnnotations: effectiveAnnotations,
    onAnnotationChange: () => setHasUnsavedChanges(true),
  });

  const {
    canvasRef: annotationCanvasRef,
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
    handleKeyDown: handleAnnotationKeyDown,
  } = annotation;

  // Inject spinner keyframes
  useEffect(() => {
    const styleId = 'video-analyzer-keyframes';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = spinnerKeyframes;
      document.head.appendChild(styleEl);
    }
  }, []);

  // Update canvas dimensions when container resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasDimensions({
          width: rect.width * window.devicePixelRatio,
          height: rect.height * window.devicePixelRatio,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [containerRef]);

  /**
   * Toggle annotation mode
   */
  const toggleAnnotationMode = useCallback(() => {
    if (readOnly) return;

    setIsAnnotationMode((prev) => {
      if (!prev) {
        // Entering annotation mode - pause video
        pause();
      }
      return !prev;
    });
  }, [readOnly, pause]);

  /**
   * Handle save annotations
   */
  const handleSave = useCallback(async () => {
    if (isSaving) return;

    try {
      const drawingData = serializeAnnotations();

      // If custom callback is provided, use it
      if (onAnnotationSave) {
        await onAnnotationSave({
          videoId,
          timestamp: currentTime,
          annotations,
          drawingData,
        });
      } else if (shouldUseApi && videoId) {
        // Use API to save annotations
        // Build annotation data from current canvas state
        const annotationData = {
          timestamp: currentTime,
          type: currentTool,
          drawingData,
          color: strokeColor,
          strokeWidth,
        };

        await createAnnotation(annotationData);
      }

      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to save annotations:', err);
    }
  }, [
    isSaving,
    shouldUseApi,
    videoId,
    currentTime,
    annotations,
    serializeAnnotations,
    onAnnotationSave,
    createAnnotation,
    currentTool,
    strokeColor,
    strokeWidth,
  ]);

  /**
   * Handle annotation click from timeline
   */
  const handleAnnotationClick = useCallback((annotation) => {
    seek(annotation.timestamp);
    setSelectedAnnotationId(annotation.id);
  }, [seek]);

  /**
   * Handle annotation edit
   */
  const handleAnnotationEdit = useCallback((annotation) => {
    seek(annotation.timestamp);
    setSelectedAnnotationId(annotation.id);
    setIsAnnotationMode(true);
    pause();
  }, [seek, pause]);

  /**
   * Handle annotation delete
   */
  const handleAnnotationDelete = useCallback(async (annotation) => {
    if (!shouldUseApi || !deleteAnnotation) return;
    try {
      await deleteAnnotation(annotation.id);
      setSelectedAnnotationId(null);
    } catch (err) {
      console.error('Failed to delete annotation:', err);
    }
  }, [shouldUseApi, deleteAnnotation]);

  /**
   * Handle initial play overlay click
   */
  const handleOverlayClick = useCallback(() => {
    setHasInteracted(true);
    togglePlay();
  }, [togglePlay]);

  /**
   * Handle container click
   */
  const handleContainerClick = useCallback((e) => {
    if (isAnnotationMode) return; // Don't toggle play in annotation mode
    if (e.target.closest('[data-controls]')) return;
    if (e.target.closest('[data-toolbar]')) return;

    togglePlay();
    showControlsTemporarily();
  }, [isAnnotationMode, togglePlay, showControlsTemporarily]);

  /**
   * Handle mouse movement
   */
  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  /**
   * Navigate to next annotation
   */
  const goToNextAnnotation = useCallback(() => {
    if (effectiveAnnotations.length === 0) return;

    const sorted = [...effectiveAnnotations].sort((a, b) => a.timestamp - b.timestamp);
    const nextAnnotation = sorted.find((a) => a.timestamp > currentTime + 0.1);

    if (nextAnnotation) {
      seek(nextAnnotation.timestamp);
      setSelectedAnnotationId(nextAnnotation.id);
    } else {
      // Wrap to first annotation
      seek(sorted[0].timestamp);
      setSelectedAnnotationId(sorted[0].id);
    }
  }, [effectiveAnnotations, currentTime, seek]);

  /**
   * Navigate to previous annotation
   */
  const goToPreviousAnnotation = useCallback(() => {
    if (effectiveAnnotations.length === 0) return;

    const sorted = [...effectiveAnnotations].sort((a, b) => a.timestamp - b.timestamp);
    const prevAnnotation = sorted.reverse().find((a) => a.timestamp < currentTime - 0.1);

    if (prevAnnotation) {
      seek(prevAnnotation.timestamp);
      setSelectedAnnotationId(prevAnnotation.id);
    } else {
      // Wrap to last annotation
      const last = sorted[0]; // reversed, so first is actually last
      seek(last.timestamp);
      setSelectedAnnotationId(last.id);
    }
  }, [effectiveAnnotations, currentTime, seek]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((e) => {
    // Toggle annotation mode with 'E' key
    if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      toggleAnnotationMode();
      return;
    }

    // Save with Ctrl/Cmd + S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
      return;
    }

    // Navigate to next annotation with 'N' key
    if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      goToNextAnnotation();
      return;
    }

    // Navigate to previous annotation with 'P' key
    if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      goToPreviousAnnotation();
      return;
    }

    // Route to appropriate handler
    if (isAnnotationMode) {
      handleAnnotationKeyDown(e);
    } else {
      handleVideoKeyDown(e);
    }
  }, [isAnnotationMode, toggleAnnotationMode, handleSave, goToNextAnnotation, goToPreviousAnnotation, handleAnnotationKeyDown, handleVideoKeyDown]);

  // Attach keyboard handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, handleKeyDown]);

  // Canvas event handlers
  const handleCanvasMouseDown = useCallback((e) => {
    if (!isAnnotationMode) return;
    e.preventDefault();
    e.stopPropagation();
    startDrawing(e);
  }, [isAnnotationMode, startDrawing]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!isAnnotationMode) return;
    draw(e);
  }, [isAnnotationMode, draw]);

  const handleCanvasMouseUp = useCallback((e) => {
    if (!isAnnotationMode) return;
    endDrawing(e);
  }, [isAnnotationMode, endDrawing]);

  // Combine errors
  const displayError = error || videoError || annotationsError;

  // Render error state
  if (displayError) {
    return (
      <div
        ref={containerRef}
        style={{ ...styles.container, ...style }}
        className={className}
      >
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>
            <ErrorIcon />
          </div>
          <p style={styles.errorText}>{displayError}</p>
          <button
            style={styles.retryButton}
            onClick={() => {
              if (shouldUseApi) {
                refreshAnnotations();
              } else {
                window.location.reload();
              }
            }}
          >
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        ...styles.container,
        ...(isFullscreen ? styles.containerFullscreen : {}),
        ...style,
      }}
      className={className}
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
      tabIndex={0}
      role="application"
      aria-label="Video analyzer"
    >
      {/* Video Element */}
      <video
        {...videoProps}
        poster={poster}
        style={styles.video}
        playsInline
        preload="metadata"
      />

      {/* Annotation Canvas Overlay */}
      <div
        style={{
          ...styles.canvasOverlay,
          ...(isAnnotationMode ? styles.canvasOverlayActive : {}),
        }}
      >
        <canvas
          ref={annotationCanvasRef}
          style={{
            ...styles.canvas,
            cursor: isAnnotationMode ? 'crosshair' : 'default',
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onTouchStart={handleCanvasMouseDown}
          onTouchMove={handleCanvasMouseMove}
          onTouchEnd={handleCanvasMouseUp}
        />
      </div>

      {/* Top Bar with Mode Toggle */}
      <div style={styles.topBar} data-toolbar="true">
        <div style={styles.modeToggle}>
          {/* Play Mode Button */}
          <button
            style={{
              ...styles.modeButton,
              ...(!isAnnotationMode ? styles.modeButtonActive : {}),
            }}
            onClick={() => setIsAnnotationMode(false)}
            title="Avspillingsmodus (E)"
          >
            <PlayIcon />
            <span>Avspilling</span>
          </button>

          {/* Annotation Mode Button */}
          {!readOnly && (
            <button
              style={{
                ...styles.modeButton,
                ...(isAnnotationMode ? styles.modeButtonActive : {}),
              }}
              onClick={toggleAnnotationMode}
              title="Tegnemodus (E)"
            >
              <PenIcon />
              <span>Tegn</span>
            </button>
          )}
        </div>

        {/* Save Button */}
        {!readOnly && (onAnnotationSave || shouldUseApi) && (
          <button
            style={{
              ...styles.saveButton,
              ...(!hasUnsavedChanges || isSaving ? styles.saveButtonDisabled : {}),
            }}
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            title="Lagre (Ctrl+S)"
          >
            <SaveIcon />
            <span>{isSaving ? 'Lagrer...' : 'Lagre'}</span>
          </button>
        )}
      </div>

      {/* Tool Palette (shown in annotation mode) */}
      {isAnnotationMode && !readOnly && (
        <div style={styles.toolPaletteWrapper} data-toolbar="true">
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
          />
        </div>
      )}

      {/* Annotation Mode Indicator */}
      {isAnnotationMode && (
        <div style={styles.annotationModeIndicator}>
          <PenIcon />
          <span>Tegnemodus aktiv</span>
          <span style={styles.timestampBadge}>
            {formatTime(currentTime)}
          </span>
        </div>
      )}

      {/* Loading Spinner */}
      {(isLoading || isLoadingData) && hasInteracted && (
        <div style={styles.overlay}>
          <div style={styles.loadingSpinner} />
        </div>
      )}

      {/* Initial Play Overlay */}
      {!hasInteracted && !isPlaying && !isLoading && (
        <div style={styles.overlay} onClick={handleOverlayClick}>
          <div style={styles.playOverlay}>
            <LargePlayIcon />
          </div>
        </div>
      )}

      {/* Video Controls */}
      <div
        style={{
          ...styles.controlsWrapper,
          ...(!showControls && hasInteracted && !isAnnotationMode ? styles.controlsHidden : {}),
        }}
        data-controls="true"
      >
        <VideoControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          progress={progress}
          bufferedProgress={bufferedProgress}
          playbackSpeed={playbackSpeed}
          volume={volume}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          togglePlay={togglePlay}
          seek={seek}
          skipForward={skipForward}
          skipBackward={skipBackward}
          nextFrame={nextFrame}
          previousFrame={previousFrame}
          changePlaybackSpeed={changePlaybackSpeed}
          cyclePlaybackSpeed={cyclePlaybackSpeed}
          changeVolume={changeVolume}
          toggleMute={toggleMute}
          toggleFullscreen={toggleFullscreen}
          formatTime={formatTime}
          showFrameControls={true}
        />
      </div>

      {/* Annotation Timeline (outside video container) */}
      {effectiveAnnotations.length > 0 && (
        <div style={styles.timelineWrapper}>
          <AnnotationTimeline
            annotations={effectiveAnnotations}
            duration={duration}
            currentTime={currentTime}
            selectedAnnotationId={selectedAnnotationId}
            onAnnotationClick={handleAnnotationClick}
            onAnnotationEdit={!readOnly ? handleAnnotationEdit : undefined}
            onAnnotationDelete={!readOnly && shouldUseApi ? handleAnnotationDelete : undefined}
            onSeek={seek}
            showList={true}
          />
        </div>
      )}
    </div>
  );
}

export default VideoAnalyzer;
