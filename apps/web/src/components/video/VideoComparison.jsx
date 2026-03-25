/**
 * TIER GOLF — VIDEO ANALYSIS SYSTEM
 * VideoComparison Component
 *
 * Side-by-side video comparison for swing analysis:
 * - Split-screen view (adjustable)
 * - Synchronized playback with sync points
 * - Overlay/ghost mode for direct comparison
 * - Frame-by-frame navigation
 * - Independent or linked controls
 * - API integration for saved comparisons
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useVideoComparison, VIEW_MODES, SYNC_MODES } from '../../hooks/useVideoComparison';
import { useComparisonData, useComparisonVideos } from '../../hooks/useVideoComparisonApi';

// Icons
const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const SkipBackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
  </svg>
);

const SkipForwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
  </svg>
);

const FrameBackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
  </svg>
);

const FrameForwardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 6v12h2V6h-2zM6 18l8.5-6L6 6v12z" />
  </svg>
);

const SyncIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
  </svg>
);

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
  </svg>
);

const UnlinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 2.98l1.46 1.46C20.88 15.61 22 13.95 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16v-2zM2 4.27l3.11 3.11C3.29 8.12 2 9.91 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l4.01 4L20 19.74 3.27 3 2 4.27z" />
  </svg>
);

const FullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
);

const SideBySideIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 5v14h8V5H3zm10 0v14h8V5h-8z" />
  </svg>
);

const OverlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
  </svg>
);

const MarkerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

// Styles
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'var(--background-inverse)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16 / 9',
    display: 'flex',
  },
  videoWrapper: {
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    backgroundColor: 'var(--background-inverse)',
  },
  videoLabel: {
    position: 'absolute',
    top: 'var(--spacing-2)',
    left: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    backgroundColor: 'var(--video-bg-light)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-inverse)',
    fontSize: 'var(--font-size-caption1)',
    fontFamily: 'var(--font-family)',
    zIndex: 5,
  },
  syncBadge: {
    position: 'absolute',
    bottom: 'var(--spacing-2)',
    left: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    backgroundColor: 'var(--achievement)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--background-inverse)',
    fontSize: 'var(--font-size-caption2)',
    fontFamily: 'var(--font-family)',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    zIndex: 5,
  },
  divider: {
    width: '2px',
    backgroundColor: 'var(--achievement)',
    zIndex: 10,
  },
  overlayVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  controlsWrapper: {
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--video-bg-heavy)',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    marginBottom: 'var(--spacing-3)',
  },
  progressBar: {
    flex: 1,
    height: '6px',
    backgroundColor: 'var(--video-control-hover)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    position: 'relative',
  },
  progressFilled: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 'var(--radius-full)',
  },
  progressPrimary: {
    backgroundColor: 'var(--accent)',
  },
  progressSecondary: {
    backgroundColor: 'var(--achievement)',
    opacity: 0.7,
  },
  syncMarker: {
    position: 'absolute',
    top: '-4px',
    width: '14px',
    height: '14px',
    backgroundColor: 'var(--achievement)',
    borderRadius: 'var(--radius-full)',
    border: '2px solid var(--text-inverse)',
    transform: 'translateX(-50%)',
    cursor: 'pointer',
    zIndex: 5,
  },
  timeDisplay: {
    color: 'var(--text-inverse)',
    fontSize: 'var(--font-size-caption1)',
    fontFamily: 'var(--font-family)',
    minWidth: '90px',
    textAlign: 'center',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-3)',
  },
  controlsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-inverse)',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonSmall: {
    width: '32px',
    height: '32px',
  },
  buttonActive: {
    backgroundColor: 'var(--accent)',
  },
  speedButton: {
    minWidth: '48px',
    height: '32px',
    backgroundColor: 'var(--video-control-bg)',
    border: '1px solid var(--video-border-strong)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-inverse)',
    fontSize: 'var(--font-size-caption1)',
    fontFamily: 'var(--font-family)',
    cursor: 'pointer',
    padding: '0 var(--spacing-2)',
  },
  modeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    backgroundColor: 'var(--video-control-bg)',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-inverse)',
    fontSize: 'var(--font-size-caption2)',
    fontFamily: 'var(--font-family)',
    cursor: 'pointer',
  },
  modeButtonActive: {
    backgroundColor: 'var(--accent)',
    borderColor: 'var(--achievement)',
  },
  syncControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
    backgroundColor: 'var(--video-border-light)',
    borderRadius: 'var(--radius-sm)',
  },
  syncLabel: {
    color: 'var(--text-tertiary)',
    fontSize: 'var(--font-size-caption2)',
    fontFamily: 'var(--font-family)',
  },
  syncValue: {
    color: 'var(--achievement)',
    fontSize: 'var(--font-size-caption1)',
    fontFamily: 'var(--font-family)',
    fontWeight: 600,
  },
  opacitySlider: {
    width: '80px',
    height: '4px',
    appearance: 'none',
    backgroundColor: 'var(--video-progress-bg)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--video-overlay)',
    zIndex: 10,
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid var(--video-progress-bg)',
    borderTopColor: 'var(--achievement)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Playback speeds
const PLAYBACK_SPEEDS = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2];

/**
 * VideoComparison Component
 *
 * @param {Object} props
 * @param {string} props.comparisonId - Comparison ID (loads saved comparison from API)
 * @param {string} props.primaryVideoId - Primary video ID (alternative to comparisonId)
 * @param {string} props.secondaryVideoId - Secondary video ID (alternative to comparisonId)
 * @param {string} props.primarySrc - Primary video URL (fallback)
 * @param {string} props.secondarySrc - Secondary/comparison video URL (fallback)
 * @param {string} props.primaryLabel - Label for primary video
 * @param {string} props.secondaryLabel - Label for secondary video
 * @param {string} props.primaryPoster - Primary video poster
 * @param {string} props.secondaryPoster - Secondary video poster
 * @param {number} props.initialSyncPoint1 - Initial sync point for primary
 * @param {number} props.initialSyncPoint2 - Initial sync point for secondary
 * @param {Function} props.onSyncPointChange - Callback when sync points change
 * @param {Function} props.onSave - Callback when comparison is saved
 * @param {boolean} props.useApi - Whether to use API (default: true if IDs provided)
 * @param {Object} props.style - Additional container styles
 * @param {string} props.className - Additional CSS class
 */
export function VideoComparison({
  comparisonId,
  primaryVideoId,
  secondaryVideoId,
  primarySrc: propsPrimarySrc,
  secondarySrc: propsSecondarySrc,
  primaryLabel: propsLabel1 = 'Video 1',
  secondaryLabel: propsLabel2 = 'Video 2',
  primaryPoster: propsPrimaryPoster,
  secondaryPoster: propsSecondaryPoster,
  initialSyncPoint1 = 0,
  initialSyncPoint2 = 0,
  onSyncPointChange,
  onSave,
  useApi = true,
  style,
  className,
}) {
  // Determine if we should use API
  const shouldUseComparisonApi = useApi && comparisonId;
  const shouldUseVideoApi = useApi && !comparisonId && (primaryVideoId || secondaryVideoId);

  // Fetch saved comparison data if comparisonId provided
  const {
    comparison: savedComparison,
    primaryPlaybackUrl: comparisonPrimaryUrl,
    secondaryPlaybackUrl: comparisonSecondaryUrl,
    loading: comparisonLoading,
    error: comparisonError,
    updateSyncPoints,
  } = useComparisonData(shouldUseComparisonApi ? comparisonId : null, {
    autoFetch: shouldUseComparisonApi,
  });

  // Fetch individual videos if video IDs provided (without saved comparison)
  const {
    primaryVideo,
    secondaryVideo,
    primaryPlaybackUrl: videoPrimaryUrl,
    secondaryPlaybackUrl: videoSecondaryUrl,
    loading: videosLoading,
    error: videosError,
    createComparison,
  } = useComparisonVideos(
    shouldUseVideoApi ? primaryVideoId : null,
    shouldUseVideoApi ? secondaryVideoId : null,
    { autoFetch: shouldUseVideoApi }
  );

  // Determine effective URLs (API or props)
  const primarySrc = useMemo(() => {
    if (comparisonPrimaryUrl) return comparisonPrimaryUrl;
    if (videoPrimaryUrl) return videoPrimaryUrl;
    return propsPrimarySrc;
  }, [comparisonPrimaryUrl, videoPrimaryUrl, propsPrimarySrc]);

  const secondarySrc = useMemo(() => {
    if (comparisonSecondaryUrl) return comparisonSecondaryUrl;
    if (videoSecondaryUrl) return videoSecondaryUrl;
    return propsSecondarySrc;
  }, [comparisonSecondaryUrl, videoSecondaryUrl, propsSecondarySrc]);

  // Determine effective labels
  const primaryLabel = useMemo(() => {
    if (savedComparison?.primaryVideo?.title) return savedComparison.primaryVideo.title;
    if (primaryVideo?.title) return primaryVideo.title;
    return propsLabel1;
  }, [savedComparison, primaryVideo, propsLabel1]);

  const secondaryLabel = useMemo(() => {
    if (savedComparison?.comparisonVideo?.title) return savedComparison.comparisonVideo.title;
    if (secondaryVideo?.title) return secondaryVideo.title;
    return propsLabel2;
  }, [savedComparison, secondaryVideo, propsLabel2]);

  // Determine effective posters
  const primaryPoster = useMemo(() => {
    if (savedComparison?.primaryVideo?.thumbnailUrl) return savedComparison.primaryVideo.thumbnailUrl;
    if (primaryVideo?.thumbnailUrl) return primaryVideo.thumbnailUrl;
    return propsPrimaryPoster;
  }, [savedComparison, primaryVideo, propsPrimaryPoster]);

  const secondaryPoster = useMemo(() => {
    if (savedComparison?.comparisonVideo?.thumbnailUrl) return savedComparison.comparisonVideo.thumbnailUrl;
    if (secondaryVideo?.thumbnailUrl) return secondaryVideo.thumbnailUrl;
    return propsSecondaryPoster;
  }, [savedComparison, secondaryVideo, propsSecondaryPoster]);

  // Determine effective sync points
  const effectiveSyncPoint1 = savedComparison?.syncPoint1
    ? parseFloat(savedComparison.syncPoint1)
    : initialSyncPoint1;
  const effectiveSyncPoint2 = savedComparison?.syncPoint2
    ? parseFloat(savedComparison.syncPoint2)
    : initialSyncPoint2;

  // Combined loading state
  const isLoadingData = comparisonLoading || videosLoading.primary || videosLoading.secondary;

  // Combined error
  const apiError = comparisonError || videosError.primary || videosError.secondary;

  // Handle sync point changes with API save
  const handleSyncPointChange = useCallback(async (syncPoints) => {
    // Call original callback
    onSyncPointChange?.(syncPoints);

    // Save to API if using saved comparison
    if (shouldUseComparisonApi && updateSyncPoints) {
      try {
        await updateSyncPoints(syncPoints.syncPoint1, syncPoints.syncPoint2);
      } catch (err) {
        console.error('Failed to save sync points:', err);
      }
    }
  }, [onSyncPointChange, shouldUseComparisonApi, updateSyncPoints]);

  // Handle save comparison
  const handleSaveComparison = useCallback(async (syncPoint1, syncPoint2) => {
    if (!shouldUseVideoApi || !createComparison) return null;

    try {
      const newComparison = await createComparison({
        syncPoint1,
        syncPoint2,
      });
      onSave?.(newComparison);
      return newComparison;
    } catch (err) {
      console.error('Failed to save comparison:', err);
      throw err;
    }
  }, [shouldUseVideoApi, createComparison, onSave]);

  const comparison = useVideoComparison({
    primarySrc,
    secondarySrc,
    syncPoint1: effectiveSyncPoint1,
    syncPoint2: effectiveSyncPoint2,
    onSyncPointChange: handleSyncPointChange,
  });

  const {
    primaryVideoRef,
    secondaryVideoRef,
    containerRef,
    isPlaying,
    primaryTime,
    secondaryTime,
    primaryDuration,
    secondaryDuration,
    primaryProgress,
    secondaryProgress,
    playbackSpeed,
    viewMode,
    syncMode,
    syncPoint1,
    syncPoint2,
    overlayOpacity,
    isFullscreen,
    isLoading,
    togglePlay,
    seek,
    skipForward,
    skipBackward,
    nextFrame,
    previousFrame,
    changePlaybackSpeed,
    setCurrentAsSyncPoint,
    syncVideos,
    setSyncMode,
    setViewMode,
    setOverlayOpacity,
    toggleFullscreen,
    handleKeyDown,
    formatTime,
    primaryVideoProps,
    secondaryVideoProps,
  } = comparison;

  const [speedIndex, setSpeedIndex] = useState(PLAYBACK_SPEEDS.indexOf(1));

  // Inject keyframes
  useEffect(() => {
    const styleId = 'video-comparison-keyframes';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(styleEl);
    }
  }, []);

  // Attach keyboard handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, handleKeyDown]);

  /**
   * Handle progress bar click
   */
  const handleProgressClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * primaryDuration;
    seek(newTime);
  }, [primaryDuration, seek]);

  /**
   * Cycle playback speed
   */
  const cycleSpeed = useCallback(() => {
    const nextIndex = (speedIndex + 1) % PLAYBACK_SPEEDS.length;
    setSpeedIndex(nextIndex);
    changePlaybackSpeed(PLAYBACK_SPEEDS[nextIndex]);
  }, [speedIndex, changePlaybackSpeed]);

  /**
   * Render side-by-side view
   */
  const renderSideBySide = () => (
    <div style={styles.videoContainer}>
      {/* Primary Video */}
      <div style={styles.videoWrapper}>
        <video
          {...primaryVideoProps}
          poster={primaryPoster}
          style={styles.video}
        />
        <div style={styles.videoLabel}>{primaryLabel}</div>
        {syncPoint1 > 0 && (
          <div style={styles.syncBadge}>
            <MarkerIcon />
            {formatTime(syncPoint1)}
          </div>
        )}
        {(isLoading.primary || isLoadingData) && (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner} />
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Secondary Video */}
      <div style={styles.videoWrapper}>
        <video
          {...secondaryVideoProps}
          poster={secondaryPoster}
          style={styles.video}
        />
        <div style={styles.videoLabel}>{secondaryLabel}</div>
        {syncPoint2 > 0 && (
          <div style={styles.syncBadge}>
            <MarkerIcon />
            {formatTime(syncPoint2)}
          </div>
        )}
        {(isLoading.secondary || isLoadingData) && (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner} />
          </div>
        )}
      </div>
    </div>
  );

  /**
   * Render overlay view
   */
  const renderOverlay = () => (
    <div style={{ ...styles.videoContainer, position: 'relative' }}>
      {/* Primary Video (base) */}
      <div style={{ ...styles.videoWrapper, position: 'relative' }}>
        <video
          {...primaryVideoProps}
          poster={primaryPoster}
          style={styles.video}
        />
        <div style={styles.videoLabel}>{primaryLabel}</div>

        {/* Secondary Video (overlay) */}
        <video
          {...secondaryVideoProps}
          poster={secondaryPoster}
          style={{
            ...styles.overlayVideo,
            opacity: overlayOpacity,
            mixBlendMode: 'difference',
          }}
        />

        {(isLoading.primary || isLoading.secondary || isLoadingData) && (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner} />
          </div>
        )}
      </div>
    </div>
  );

  // Render error state
  if (apiError) {
    return (
      <div
        ref={containerRef}
        style={{
          ...styles.container,
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
        }}
        className={className}
      >
        <div style={{ textAlign: 'center', color: 'var(--text-inverse)' }}>
          <p style={{ marginBottom: 'var(--spacing-3)' }}>{apiError}</p>
          <button
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              backgroundColor: 'var(--accent)',
              color: 'var(--text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
            onClick={() => window.location.reload()}
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
        ...style,
      }}
      className={className}
      tabIndex={0}
      role="application"
      aria-label="Video comparison"
    >
      {/* Video Display */}
      {viewMode === VIEW_MODES.OVERLAY ? renderOverlay() : renderSideBySide()}

      {/* Controls */}
      <div style={styles.controlsWrapper}>
        {/* Progress Bars */}
        <div style={styles.progressContainer}>
          <span style={styles.timeDisplay}>
            {formatTime(primaryTime)}
          </span>

          <div style={styles.progressBar} onClick={handleProgressClick}>
            {/* Primary progress */}
            <div
              style={{
                ...styles.progressFilled,
                ...styles.progressPrimary,
                width: `${primaryProgress}%`,
              }}
            />
            {/* Secondary progress (behind) */}
            <div
              style={{
                ...styles.progressFilled,
                ...styles.progressSecondary,
                width: `${secondaryProgress}%`,
              }}
            />
            {/* Sync point markers */}
            {syncPoint1 > 0 && primaryDuration > 0 && (
              <div
                style={{
                  ...styles.syncMarker,
                  left: `${(syncPoint1 / primaryDuration) * 100}%`,
                  backgroundColor: 'var(--accent)',
                }}
                title={`Sync 1: ${formatTime(syncPoint1)}`}
              />
            )}
            {syncPoint2 > 0 && secondaryDuration > 0 && (
              <div
                style={{
                  ...styles.syncMarker,
                  left: `${(syncPoint2 / secondaryDuration) * 100}%`,
                  backgroundColor: 'var(--achievement)',
                }}
                title={`Sync 2: ${formatTime(syncPoint2)}`}
              />
            )}
          </div>

          <span style={styles.timeDisplay}>
            {formatTime(primaryDuration)}
          </span>
        </div>

        {/* Control Buttons */}
        <div style={styles.controlsRow}>
          {/* Playback Controls */}
          <div style={styles.controlsGroup}>
            <button
              style={{ ...styles.button, ...styles.buttonSmall }}
              onClick={() => skipBackward(10)}
              title="Tilbake 10s"
            >
              <SkipBackIcon />
            </button>

            <button
              style={{ ...styles.button, ...styles.buttonSmall }}
              onClick={previousFrame}
              title="Forrige bilde (Shift+←)"
            >
              <FrameBackIcon />
            </button>

            <button
              style={styles.button}
              onClick={togglePlay}
              title={isPlaying ? 'Pause (Space)' : 'Spill (Space)'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button
              style={{ ...styles.button, ...styles.buttonSmall }}
              onClick={nextFrame}
              title="Neste bilde (Shift+→)"
            >
              <FrameForwardIcon />
            </button>

            <button
              style={{ ...styles.button, ...styles.buttonSmall }}
              onClick={() => skipForward(10)}
              title="Frem 10s"
            >
              <SkipForwardIcon />
            </button>

            <button
              style={styles.speedButton}
              onClick={cycleSpeed}
              title="Endre hastighet"
            >
              {playbackSpeed}x
            </button>
          </div>

          {/* Sync Controls */}
          <div style={styles.syncControls}>
            <button
              style={{
                ...styles.modeButton,
                ...(syncMode === SYNC_MODES.LINKED ? styles.modeButtonActive : {}),
              }}
              onClick={() => setSyncMode(
                syncMode === SYNC_MODES.LINKED ? SYNC_MODES.INDEPENDENT : SYNC_MODES.LINKED
              )}
              title={syncMode === SYNC_MODES.LINKED ? 'Koble fra' : 'Koble sammen'}
            >
              {syncMode === SYNC_MODES.LINKED ? <LinkIcon /> : <UnlinkIcon />}
              <span>{syncMode === SYNC_MODES.LINKED ? 'Synk' : 'Usynk'}</span>
            </button>

            <button
              style={styles.modeButton}
              onClick={() => setCurrentAsSyncPoint('primary')}
              title="Sett synkpunkt video 1 (1)"
            >
              <MarkerIcon />
              <span>1</span>
            </button>

            <button
              style={styles.modeButton}
              onClick={() => setCurrentAsSyncPoint('secondary')}
              title="Sett synkpunkt video 2 (2)"
            >
              <MarkerIcon />
              <span>2</span>
            </button>

            <button
              style={styles.modeButton}
              onClick={syncVideos}
              title="Synkroniser nå (S)"
            >
              <SyncIcon />
            </button>
          </div>

          {/* View Controls */}
          <div style={styles.controlsGroup}>
            <button
              style={{
                ...styles.modeButton,
                ...(viewMode === VIEW_MODES.SIDE_BY_SIDE ? styles.modeButtonActive : {}),
              }}
              onClick={() => setViewMode(VIEW_MODES.SIDE_BY_SIDE)}
              title="Side om side"
            >
              <SideBySideIcon />
            </button>

            <button
              style={{
                ...styles.modeButton,
                ...(viewMode === VIEW_MODES.OVERLAY ? styles.modeButtonActive : {}),
              }}
              onClick={() => setViewMode(VIEW_MODES.OVERLAY)}
              title="Overlegg"
            >
              <OverlayIcon />
            </button>

            {viewMode === VIEW_MODES.OVERLAY && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                style={styles.opacitySlider}
                title={`Gjennomsiktighet: ${Math.round(overlayOpacity * 100)}%`}
              />
            )}

            <button
              style={{ ...styles.button, ...styles.buttonSmall }}
              onClick={toggleFullscreen}
              title="Fullskjerm (F)"
            >
              <FullscreenIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoComparison;
