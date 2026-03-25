/**
 * TIER GOLF — VIDEO ANALYSIS SYSTEM
 * VideoControls Component
 *
 * Provides playback controls for video player:
 * - Play/pause button
 * - Progress bar with seek functionality
 * - Time display (current/duration)
 * - Playback speed selector
 * - Volume control
 * - Frame navigation buttons
 * - Fullscreen toggle
 */

import React, { useCallback } from 'react';
import { PLAYBACK_SPEEDS } from '../../hooks/useVideoPlayer';

// Icon components (inline SVGs for simplicity)
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

const VolumeHighIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

const FullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
  </svg>
);

// Styles using CSS variables
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--video-bg-light)',
    borderRadius: 'var(--radius-md)',
    backdropFilter: 'blur(8px)',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  progressBar: {
    flex: 1,
    height: '6px',
    backgroundColor: 'var(--video-progress-bg)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  progressBuffered: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'var(--video-progress-buffer)',
    borderRadius: 'var(--radius-full)',
  },
  progressFilled: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'var(--achievement)',
    borderRadius: 'var(--radius-full)',
  },
  timeDisplay: {
    color: 'var(--text-inverse)',
    fontSize: 'var(--font-size-caption1)',
    fontFamily: 'var(--font-family)',
    minWidth: '80px',
    textAlign: 'center',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
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
  buttonLarge: {
    width: '48px',
    height: '48px',
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
  volumeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
  },
  volumeSlider: {
    width: '80px',
    height: '4px',
    appearance: 'none',
    backgroundColor: 'var(--video-progress-bg)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    backgroundColor: 'var(--video-bg-heavy)',
    color: 'var(--text-inverse)',
    fontSize: 'var(--font-size-caption2)',
    borderRadius: 'var(--radius-sm)',
    whiteSpace: 'nowrap',
    marginBottom: 'var(--spacing-1)',
    pointerEvents: 'none',
  },
};

/**
 * VideoControls Component
 *
 * @param {Object} props
 * @param {boolean} props.isPlaying - Current playing state
 * @param {number} props.currentTime - Current playback time in seconds
 * @param {number} props.duration - Total video duration in seconds
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {number} props.bufferedProgress - Buffered percentage (0-100)
 * @param {number} props.playbackSpeed - Current playback speed
 * @param {number} props.volume - Current volume (0-1)
 * @param {boolean} props.isMuted - Current mute state
 * @param {boolean} props.isFullscreen - Current fullscreen state
 * @param {Function} props.togglePlay - Toggle play/pause
 * @param {Function} props.seek - Seek to time
 * @param {Function} props.skipForward - Skip forward
 * @param {Function} props.skipBackward - Skip backward
 * @param {Function} props.nextFrame - Go to next frame
 * @param {Function} props.previousFrame - Go to previous frame
 * @param {Function} props.changePlaybackSpeed - Change playback speed
 * @param {Function} props.cyclePlaybackSpeed - Cycle through speeds
 * @param {Function} props.changeVolume - Change volume
 * @param {Function} props.toggleMute - Toggle mute
 * @param {Function} props.toggleFullscreen - Toggle fullscreen
 * @param {Function} props.formatTime - Format time helper
 * @param {boolean} props.showFrameControls - Show frame navigation buttons
 * @param {boolean} props.compact - Use compact layout
 */
export function VideoControls({
  isPlaying,
  currentTime,
  duration,
  progress,
  bufferedProgress,
  playbackSpeed,
  volume,
  isMuted,
  isFullscreen,
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
  formatTime,
  showFrameControls = true,
  compact = false,
}) {
  /**
   * Handle progress bar click to seek
   */
  const handleProgressClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    seek(newTime);
  }, [duration, seek]);

  /**
   * Handle volume slider change
   */
  const handleVolumeChange = useCallback((e) => {
    changeVolume(parseFloat(e.target.value));
  }, [changeVolume]);

  /**
   * Handle speed button click
   */
  const handleSpeedClick = useCallback(() => {
    cyclePlaybackSpeed();
  }, [cyclePlaybackSpeed]);

  return (
    <div style={styles.container}>
      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <span style={styles.timeDisplay}>
          {formatTime(currentTime)}
        </span>

        <div
          style={styles.progressBar}
          onClick={handleProgressClick}
          role="slider"
          aria-label="Video progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          tabIndex={0}
        >
          <div
            style={{
              ...styles.progressBuffered,
              width: `${bufferedProgress}%`,
            }}
          />
          <div
            style={{
              ...styles.progressFilled,
              width: `${progress}%`,
            }}
          />
        </div>

        <span style={styles.timeDisplay}>
          {formatTime(duration)}
        </span>
      </div>

      {/* Control Buttons */}
      <div style={styles.controlsRow}>
        {/* Left Group: Playback Controls */}
        <div style={styles.controlsGroup}>
          {/* Skip Backward */}
          <button
            style={{ ...styles.button, ...styles.buttonSmall }}
            onClick={() => skipBackward(10)}
            aria-label="Skip backward 10 seconds"
            title="Skip backward 10 seconds (J)"
          >
            <SkipBackIcon />
          </button>

          {/* Previous Frame */}
          {showFrameControls && (
            <button
              style={{ ...styles.button, ...styles.buttonSmall }}
              onClick={previousFrame}
              aria-label="Previous frame"
              title="Previous frame (,)"
            >
              <FrameBackIcon />
            </button>
          )}

          {/* Play/Pause */}
          <button
            style={{ ...styles.button, ...styles.buttonLarge }}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause (Space/K)' : 'Play (Space/K)'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          {/* Next Frame */}
          {showFrameControls && (
            <button
              style={{ ...styles.button, ...styles.buttonSmall }}
              onClick={nextFrame}
              aria-label="Next frame"
              title="Next frame (.)"
            >
              <FrameForwardIcon />
            </button>
          )}

          {/* Skip Forward */}
          <button
            style={{ ...styles.button, ...styles.buttonSmall }}
            onClick={() => skipForward(10)}
            aria-label="Skip forward 10 seconds"
            title="Skip forward 10 seconds (L)"
          >
            <SkipForwardIcon />
          </button>
        </div>

        {/* Center Group: Speed */}
        <div style={styles.controlsGroup}>
          <button
            style={styles.speedButton}
            onClick={handleSpeedClick}
            aria-label={`Playback speed: ${playbackSpeed}x`}
            title="Change playback speed (>)"
          >
            {playbackSpeed}x
          </button>
        </div>

        {/* Right Group: Volume & Fullscreen */}
        <div style={styles.controlsGroup}>
          {/* Volume */}
          {!compact && (
            <div style={styles.volumeContainer}>
              <button
                style={{ ...styles.button, ...styles.buttonSmall }}
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeHighIcon />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={styles.volumeSlider}
                aria-label="Volume"
              />
            </div>
          )}

          {/* Fullscreen */}
          <button
            style={{ ...styles.button, ...styles.buttonSmall }}
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoControls;
