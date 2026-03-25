/**
 * useVideoComparison Hook
 * Custom hook for synchronized video comparison playback
 *
 * Provides:
 * - Dual video player management
 * - Synchronized playback with sync points
 * - Independent or linked controls
 * - Overlay/ghost mode support
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// View modes for comparison
export const VIEW_MODES = {
  SIDE_BY_SIDE: 'side-by-side',
  OVERLAY: 'overlay',
  SPLIT: 'split',
};

// Playback sync modes
export const SYNC_MODES = {
  LINKED: 'linked',
  INDEPENDENT: 'independent',
};

/**
 * Custom hook for video comparison functionality
 *
 * @param {Object} options - Hook options
 * @param {string} options.primarySrc - Primary video source URL
 * @param {string} options.secondarySrc - Secondary video source URL
 * @param {number} options.syncPoint1 - Sync point in primary video (seconds)
 * @param {number} options.syncPoint2 - Sync point in secondary video (seconds)
 * @param {Function} options.onSyncPointChange - Callback when sync points change
 * @returns {Object} Comparison state and controls
 */
export function useVideoComparison(options = {}) {
  const {
    primarySrc,
    secondarySrc,
    syncPoint1: initialSyncPoint1 = 0,
    syncPoint2: initialSyncPoint2 = 0,
    onSyncPointChange,
  } = options;

  // Video refs
  const primaryVideoRef = useRef(null);
  const secondaryVideoRef = useRef(null);
  const containerRef = useRef(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [primaryTime, setPrimaryTime] = useState(0);
  const [secondaryTime, setSecondaryTime] = useState(0);
  const [primaryDuration, setPrimaryDuration] = useState(0);
  const [secondaryDuration, setSecondaryDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true); // Muted by default for comparison
  const [activeVideo, setActiveVideo] = useState('primary'); // Which video has audio
  const [viewMode, setViewMode] = useState(VIEW_MODES.SIDE_BY_SIDE);
  const [syncMode, setSyncMode] = useState(SYNC_MODES.LINKED);
  const [syncPoint1, setSyncPoint1] = useState(initialSyncPoint1);
  const [syncPoint2, setSyncPoint2] = useState(initialSyncPoint2);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [splitPosition, setSplitPosition] = useState(50); // Percentage
  const [isSettingSyncPoint, setIsSettingSyncPoint] = useState(null); // 'primary' | 'secondary' | null
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState({ primary: true, secondary: true });
  const [error, setError] = useState({ primary: null, secondary: null });

  /**
   * Calculate time offset based on sync points
   */
  const getTimeOffset = useCallback(() => {
    return syncPoint2 - syncPoint1;
  }, [syncPoint1, syncPoint2]);

  /**
   * Play both videos
   */
  const play = useCallback(() => {
    const primary = primaryVideoRef.current;
    const secondary = secondaryVideoRef.current;

    if (primary && secondary) {
      Promise.all([
        primary.play().catch(() => {}),
        secondary.play().catch(() => {}),
      ]).then(() => {
        setIsPlaying(true);
      });
    }
  }, []);

  /**
   * Pause both videos
   */
  const pause = useCallback(() => {
    const primary = primaryVideoRef.current;
    const secondary = secondaryVideoRef.current;

    if (primary) primary.pause();
    if (secondary) secondary.pause();
    setIsPlaying(false);
  }, []);

  /**
   * Toggle play/pause
   */
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  /**
   * Seek both videos (maintains sync)
   */
  const seek = useCallback((time) => {
    const primary = primaryVideoRef.current;
    const secondary = secondaryVideoRef.current;
    const offset = getTimeOffset();

    if (primary) {
      const primaryTime = Math.max(0, Math.min(time, primary.duration || 0));
      primary.currentTime = primaryTime;
      setPrimaryTime(primaryTime);
    }

    if (secondary && syncMode === SYNC_MODES.LINKED) {
      const secondaryTime = Math.max(0, Math.min(time + offset, secondary.duration || 0));
      secondary.currentTime = secondaryTime;
      setSecondaryTime(secondaryTime);
    }
  }, [getTimeOffset, syncMode]);

  /**
   * Seek primary video only
   */
  const seekPrimary = useCallback((time) => {
    const primary = primaryVideoRef.current;
    if (primary) {
      const clampedTime = Math.max(0, Math.min(time, primary.duration || 0));
      primary.currentTime = clampedTime;
      setPrimaryTime(clampedTime);
    }
  }, []);

  /**
   * Seek secondary video only
   */
  const seekSecondary = useCallback((time) => {
    const secondary = secondaryVideoRef.current;
    if (secondary) {
      const clampedTime = Math.max(0, Math.min(time, secondary.duration || 0));
      secondary.currentTime = clampedTime;
      setSecondaryTime(clampedTime);
    }
  }, []);

  /**
   * Skip forward
   */
  const skipForward = useCallback((seconds = 5) => {
    seek(primaryTime + seconds);
  }, [seek, primaryTime]);

  /**
   * Skip backward
   */
  const skipBackward = useCallback((seconds = 5) => {
    seek(primaryTime - seconds);
  }, [seek, primaryTime]);

  /**
   * Go to next frame (assuming 30fps)
   */
  const nextFrame = useCallback(() => {
    pause();
    seek(primaryTime + (1 / 30));
  }, [pause, seek, primaryTime]);

  /**
   * Go to previous frame
   */
  const previousFrame = useCallback(() => {
    pause();
    seek(primaryTime - (1 / 30));
  }, [pause, seek, primaryTime]);

  /**
   * Change playback speed for both videos
   */
  const changePlaybackSpeed = useCallback((speed) => {
    const primary = primaryVideoRef.current;
    const secondary = secondaryVideoRef.current;

    if (primary) primary.playbackRate = speed;
    if (secondary) secondary.playbackRate = speed;
    setPlaybackSpeed(speed);
  }, []);

  /**
   * Set sync point for primary video
   */
  const setSyncPointPrimary = useCallback((time) => {
    setSyncPoint1(time);
    onSyncPointChange?.({ syncPoint1: time, syncPoint2 });
  }, [syncPoint2, onSyncPointChange]);

  /**
   * Set sync point for secondary video
   */
  const setSyncPointSecondary = useCallback((time) => {
    setSyncPoint2(time);
    onSyncPointChange?.({ syncPoint1, syncPoint2: time });
  }, [syncPoint1, onSyncPointChange]);

  /**
   * Set current frame as sync point
   */
  const setCurrentAsSyncPoint = useCallback((video) => {
    if (video === 'primary') {
      setSyncPointPrimary(primaryTime);
    } else {
      setSyncPointSecondary(secondaryTime);
    }
    setIsSettingSyncPoint(null);
  }, [primaryTime, secondaryTime, setSyncPointPrimary, setSyncPointSecondary]);

  /**
   * Sync secondary video to primary based on sync points
   */
  const syncVideos = useCallback(() => {
    const secondary = secondaryVideoRef.current;
    const offset = getTimeOffset();

    if (secondary) {
      const newTime = primaryTime + offset;
      const clampedTime = Math.max(0, Math.min(newTime, secondary.duration || 0));
      secondary.currentTime = clampedTime;
      setSecondaryTime(clampedTime);
    }
  }, [primaryTime, getTimeOffset]);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  /**
   * Change volume
   */
  const changeVolume = useCallback((vol) => {
    const clampedVol = Math.max(0, Math.min(1, vol));
    setVolume(clampedVol);
  }, []);

  /**
   * Switch active audio source
   */
  const switchActiveVideo = useCallback((video) => {
    setActiveVideo(video);
  }, []);

  /**
   * Toggle fullscreen
   */
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(console.error);
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key) {
      case ' ':
      case 'k':
        event.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (event.shiftKey) {
          previousFrame();
        } else {
          skipBackward(5);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (event.shiftKey) {
          nextFrame();
        } else {
          skipForward(5);
        }
        break;
      case 'm':
        event.preventDefault();
        toggleMute();
        break;
      case 'f':
        event.preventDefault();
        toggleFullscreen();
        break;
      case '1':
        event.preventDefault();
        setCurrentAsSyncPoint('primary');
        break;
      case '2':
        event.preventDefault();
        setCurrentAsSyncPoint('secondary');
        break;
      case 's':
        event.preventDefault();
        syncVideos();
        break;
      case 'v':
        event.preventDefault();
        setViewMode((prev) => {
          const modes = Object.values(VIEW_MODES);
          const currentIndex = modes.indexOf(prev);
          return modes[(currentIndex + 1) % modes.length];
        });
        break;
      default:
        break;
    }
  }, [
    togglePlay, previousFrame, nextFrame, skipBackward, skipForward,
    toggleMute, toggleFullscreen, setCurrentAsSyncPoint, syncVideos,
  ]);

  /**
   * Format time helper
   */
  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }, []);

  // Video event handlers
  const handlePrimaryTimeUpdate = useCallback(() => {
    const primary = primaryVideoRef.current;
    if (primary) {
      setPrimaryTime(primary.currentTime);

      // Sync secondary if in linked mode
      if (syncMode === SYNC_MODES.LINKED && isPlaying) {
        const secondary = secondaryVideoRef.current;
        const offset = getTimeOffset();
        if (secondary) {
          const expectedTime = primary.currentTime + offset;
          const diff = Math.abs(secondary.currentTime - expectedTime);
          // Re-sync if drift exceeds 0.1 seconds
          if (diff > 0.1) {
            secondary.currentTime = expectedTime;
          }
        }
      }
    }
  }, [syncMode, isPlaying, getTimeOffset]);

  const handleSecondaryTimeUpdate = useCallback(() => {
    const secondary = secondaryVideoRef.current;
    if (secondary) {
      setSecondaryTime(secondary.currentTime);
    }
  }, []);

  const handlePrimaryLoadedMetadata = useCallback(() => {
    const primary = primaryVideoRef.current;
    if (primary) {
      setPrimaryDuration(primary.duration);
      setIsLoading((prev) => ({ ...prev, primary: false }));
    }
  }, []);

  const handleSecondaryLoadedMetadata = useCallback(() => {
    const secondary = secondaryVideoRef.current;
    if (secondary) {
      setSecondaryDuration(secondary.duration);
      setIsLoading((prev) => ({ ...prev, secondary: false }));
    }
  }, []);

  const handlePrimaryError = useCallback(() => {
    setError((prev) => ({ ...prev, primary: 'Failed to load primary video' }));
    setIsLoading((prev) => ({ ...prev, primary: false }));
  }, []);

  const handleSecondaryError = useCallback(() => {
    setError((prev) => ({ ...prev, secondary: 'Failed to load secondary video' }));
    setIsLoading((prev) => ({ ...prev, secondary: false }));
  }, []);

  // Apply volume to active video
  useEffect(() => {
    const primary = primaryVideoRef.current;
    const secondary = secondaryVideoRef.current;

    if (primary) {
      primary.volume = activeVideo === 'primary' ? volume : 0;
      primary.muted = isMuted || activeVideo !== 'primary';
    }

    if (secondary) {
      secondary.volume = activeVideo === 'secondary' ? volume : 0;
      secondary.muted = isMuted || activeVideo !== 'secondary';
    }
  }, [volume, isMuted, activeVideo]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Calculate progress percentages
  const primaryProgress = primaryDuration > 0 ? (primaryTime / primaryDuration) * 100 : 0;
  const secondaryProgress = secondaryDuration > 0 ? (secondaryTime / secondaryDuration) * 100 : 0;

  return {
    // Refs
    primaryVideoRef,
    secondaryVideoRef,
    containerRef,

    // State
    isPlaying,
    primaryTime,
    secondaryTime,
    primaryDuration,
    secondaryDuration,
    primaryProgress,
    secondaryProgress,
    playbackSpeed,
    volume,
    isMuted,
    activeVideo,
    viewMode,
    syncMode,
    syncPoint1,
    syncPoint2,
    overlayOpacity,
    splitPosition,
    isSettingSyncPoint,
    isFullscreen,
    isLoading,
    error,

    // Playback controls
    play,
    pause,
    togglePlay,
    seek,
    seekPrimary,
    seekSecondary,
    skipForward,
    skipBackward,
    nextFrame,
    previousFrame,
    changePlaybackSpeed,

    // Sync controls
    setSyncPointPrimary,
    setSyncPointSecondary,
    setCurrentAsSyncPoint,
    syncVideos,
    setSyncMode,

    // View controls
    setViewMode,
    setOverlayOpacity,
    setSplitPosition,
    setIsSettingSyncPoint,

    // Audio controls
    toggleMute,
    changeVolume,
    switchActiveVideo,

    // Fullscreen
    toggleFullscreen,

    // Keyboard handler
    handleKeyDown,

    // Helpers
    formatTime,
    getTimeOffset,

    // Event handlers for video elements
    primaryVideoProps: {
      ref: primaryVideoRef,
      src: primarySrc,
      onTimeUpdate: handlePrimaryTimeUpdate,
      onLoadedMetadata: handlePrimaryLoadedMetadata,
      onError: handlePrimaryError,
      playsInline: true,
      preload: 'metadata',
    },
    secondaryVideoProps: {
      ref: secondaryVideoRef,
      src: secondarySrc,
      onTimeUpdate: handleSecondaryTimeUpdate,
      onLoadedMetadata: handleSecondaryLoadedMetadata,
      onError: handleSecondaryError,
      playsInline: true,
      preload: 'metadata',
    },
  };
}

export default useVideoComparison;
