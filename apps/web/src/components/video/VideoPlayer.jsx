/**
 * TIER GOLF — VIDEO ANALYSIS SYSTEM
 * VideoPlayer Component
 *
 * Custom video player with:
 * - Frame-by-frame navigation for swing analysis
 * - Slow-motion playback (0.1x to 2x speed)
 * - Keyboard shortcuts (Space, Arrow keys, J/K/L)
 * - Touch-friendly controls for mobile
 * - Fullscreen support
 * - Timestamp markers for annotations
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import VideoControls from './VideoControls';

// Styles using CSS variables
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
  controlsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 'var(--spacing-2)',
    background: 'var(--video-gradient-bottom)',
    transition: 'opacity 0.3s ease',
  },
  controlsHidden: {
    opacity: 0,
    pointerEvents: 'none',
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
  timestampMarker: {
    position: 'absolute',
    bottom: '60px',
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'flex-end',
    height: '20px',
    padding: '0 var(--spacing-2)',
    pointerEvents: 'none',
  },
  marker: {
    position: 'absolute',
    bottom: 0,
    width: '2px',
    backgroundColor: 'var(--achievement)',
    borderRadius: '1px',
  },
};

// CSS keyframes for spinner (injected once)
const spinnerKeyframes = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Large play icon for overlay
const LargePlayIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--accent)">
    <path d="M8 5v14l11-7z" />
  </svg>
);

// Error icon
const ErrorIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

/**
 * VideoPlayer Component
 *
 * @param {Object} props
 * @param {string} props.src - Video source URL
 * @param {string} props.poster - Poster image URL
 * @param {boolean} props.autoPlay - Auto-play on load
 * @param {boolean} props.loop - Loop video playback
 * @param {Array<{time: number, label: string}>} props.markers - Timestamp markers
 * @param {Function} props.onTimeUpdate - Callback on time update
 * @param {Function} props.onEnded - Callback when video ends
 * @param {Function} props.onError - Callback on error
 * @param {Function} props.onMarkerClick - Callback when marker is clicked
 * @param {boolean} props.showFrameControls - Show frame navigation (default true)
 * @param {boolean} props.showMarkers - Show timestamp markers (default true)
 * @param {Object} props.style - Additional container styles
 * @param {string} props.className - Additional CSS class
 */
export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  loop = false,
  markers = [],
  onTimeUpdate,
  onEnded,
  onError,
  onMarkerClick,
  showFrameControls = true,
  showMarkers = true,
  style,
  className,
}) {
  const [hasInteracted, setHasInteracted] = useState(autoPlay);

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
    handleKeyDown,
    formatTime,
    videoProps,
  } = player;

  // Inject spinner keyframes
  useEffect(() => {
    const styleId = 'video-player-keyframes';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = spinnerKeyframes;
      document.head.appendChild(styleEl);
    }
  }, []);

  // Handle initial play overlay click
  const handleOverlayClick = useCallback(() => {
    setHasInteracted(true);
    togglePlay();
  }, [togglePlay]);

  // Handle container click (for play/pause)
  const handleContainerClick = useCallback((e) => {
    // Don't toggle if clicking on controls
    if (e.target.closest('[data-controls]')) return;
    togglePlay();
    showControlsTemporarily();
  }, [togglePlay, showControlsTemporarily]);

  // Handle mouse movement to show controls
  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Handle touch for mobile
  const handleTouchStart = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Attach keyboard handler to container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, handleKeyDown]);

  // Render error state
  if (error) {
    return (
      <div
        ref={containerRef}
        style={{
          ...styles.container,
          ...style,
        }}
        className={className}
      >
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>
            <ErrorIcon />
          </div>
          <p style={styles.errorText}>{error}</p>
          <button
            style={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Last inn på nytt
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
      onTouchStart={handleTouchStart}
      tabIndex={0}
      role="application"
      aria-label="Video player"
    >
      {/* Video Element */}
      <video
        {...videoProps}
        poster={poster}
        style={styles.video}
        playsInline
        preload="metadata"
      />

      {/* Loading Spinner */}
      {isLoading && hasInteracted && (
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

      {/* Timestamp Markers */}
      {showMarkers && markers.length > 0 && duration > 0 && (
        <div style={styles.timestampMarker}>
          {markers.map((marker, index) => {
            const position = (marker.time / duration) * 100;
            return (
              <div
                key={index}
                style={{
                  ...styles.marker,
                  left: `${position}%`,
                  height: '12px',
                }}
                title={marker.label || formatTime(marker.time)}
                onClick={(e) => {
                  e.stopPropagation();
                  seek(marker.time);
                  onMarkerClick?.(marker);
                }}
              />
            );
          })}
        </div>
      )}

      {/* Video Controls */}
      <div
        style={{
          ...styles.controlsWrapper,
          ...(!showControls && hasInteracted ? styles.controlsHidden : {}),
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
          showFrameControls={showFrameControls}
        />
      </div>
    </div>
  );
}

export default VideoPlayer;
