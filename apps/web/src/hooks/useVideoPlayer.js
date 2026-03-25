/**
 * useVideoPlayer Hook
 * Custom hook for video player state and controls
 *
 * Provides:
 * - Playback controls (play, pause, seek)
 * - Frame-by-frame navigation
 * - Playback speed control
 * - Keyboard shortcut handling
 * - Touch gesture support
 * - HLS streaming support (Safari native, hls.js for others)
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// Frame rate constant for frame-by-frame navigation (assuming 30fps)
const FRAME_DURATION = 1 / 30;

// Playback speed presets
export const PLAYBACK_SPEEDS = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2];

/**
 * Custom hook for video player functionality
 *
 * @param {Object} options - Hook options
 * @param {string} options.src - Video source URL
 * @param {boolean} options.autoPlay - Auto-play on load
 * @param {boolean} options.loop - Loop video playback
 * @param {Function} options.onEnded - Callback when video ends
 * @param {Function} options.onTimeUpdate - Callback on time update
 * @param {Function} options.onError - Callback on error
 * @returns {Object} Video player state and controls
 */
export function useVideoPlayer(options = {}) {
  const {
    src,
    autoPlay = false,
    loop = false,
    onEnded,
    onTimeUpdate,
    onError,
  } = options;

  // Refs
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);

  // Control visibility timer
  const controlsTimeoutRef = useRef(null);

  /**
   * Play video
   */
  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error('Play failed:', err);
        setError('Failed to play video');
      });
    }
  }, []);

  /**
   * Pause video
   */
  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
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
   * Seek to specific time
   * @param {number} time - Time in seconds
   */
  const seek = useCallback((time) => {
    if (videoRef.current) {
      const clampedTime = Math.max(0, Math.min(time, videoRef.current.duration || 0));
      videoRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  }, []);

  /**
   * Skip forward by specified seconds
   * @param {number} seconds - Seconds to skip (default 10)
   */
  const skipForward = useCallback((seconds = 10) => {
    if (videoRef.current) {
      seek(videoRef.current.currentTime + seconds);
    }
  }, [seek]);

  /**
   * Skip backward by specified seconds
   * @param {number} seconds - Seconds to skip back (default 10)
   */
  const skipBackward = useCallback((seconds = 10) => {
    if (videoRef.current) {
      seek(videoRef.current.currentTime - seconds);
    }
  }, [seek]);

  /**
   * Go to next frame (frame-by-frame navigation)
   */
  const nextFrame = useCallback(() => {
    if (videoRef.current) {
      pause();
      seek(videoRef.current.currentTime + FRAME_DURATION);
    }
  }, [pause, seek]);

  /**
   * Go to previous frame (frame-by-frame navigation)
   */
  const previousFrame = useCallback(() => {
    if (videoRef.current) {
      pause();
      seek(videoRef.current.currentTime - FRAME_DURATION);
    }
  }, [pause, seek]);

  /**
   * Set playback speed
   * @param {number} speed - Playback speed multiplier
   */
  const changePlaybackSpeed = useCallback((speed) => {
    if (videoRef.current && PLAYBACK_SPEEDS.includes(speed)) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  }, []);

  /**
   * Cycle through playback speeds
   */
  const cyclePlaybackSpeed = useCallback(() => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    changePlaybackSpeed(PLAYBACK_SPEEDS[nextIndex]);
  }, [playbackSpeed, changePlaybackSpeed]);

  /**
   * Set volume
   * @param {number} vol - Volume level (0-1)
   */
  const changeVolume = useCallback((vol) => {
    if (videoRef.current) {
      const clampedVol = Math.max(0, Math.min(1, vol));
      videoRef.current.volume = clampedVol;
      setVolume(clampedVol);
      if (clampedVol > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  }, [isMuted]);

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  /**
   * Toggle fullscreen
   */
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Fullscreen failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  /**
   * Show controls temporarily
   */
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((event) => {
    // Don't handle if focus is on an input
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
      case 'ArrowUp':
        event.preventDefault();
        changeVolume(volume + 0.1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        changeVolume(volume - 0.1);
        break;
      case 'j':
        event.preventDefault();
        skipBackward(10);
        break;
      case 'l':
        event.preventDefault();
        skipForward(10);
        break;
      case 'm':
        event.preventDefault();
        toggleMute();
        break;
      case 'f':
        event.preventDefault();
        toggleFullscreen();
        break;
      case ',':
        event.preventDefault();
        previousFrame();
        break;
      case '.':
        event.preventDefault();
        nextFrame();
        break;
      case '>':
        event.preventDefault();
        cyclePlaybackSpeed();
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        event.preventDefault();
        seek((parseInt(event.key, 10) / 10) * duration);
        break;
      default:
        break;
    }

    showControlsTemporarily();
  }, [
    togglePlay, skipBackward, skipForward, previousFrame, nextFrame,
    changeVolume, volume, toggleMute, toggleFullscreen, cyclePlaybackSpeed,
    seek, duration, showControlsTemporarily,
  ]);

  // Video event handlers
  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      onTimeUpdate?.(videoRef.current.currentTime);
    }
  }, [onTimeUpdate]);
  const handleProgress = useCallback(() => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered(bufferedEnd);
    }
  }, []);
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);
  const handleError = useCallback((e) => {
    const errorMessage = e.target?.error?.message || 'Video failed to load';
    setError(errorMessage);
    setIsLoading(false);
    onError?.(errorMessage);
  }, [onError]);
  const handleWaiting = useCallback(() => setIsLoading(true), []);
  const handleCanPlay = useCallback(() => setIsLoading(false), []);

  // Attach event listeners to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [
    handlePlay, handlePause, handleLoadedMetadata, handleTimeUpdate,
    handleProgress, handleEnded, handleError, handleWaiting, handleCanPlay,
  ]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Cleanup controls timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Format time helper
  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  return {
    // Refs
    videoRef,
    containerRef,

    // State
    isPlaying,
    currentTime,
    duration,
    buffered,
    playbackSpeed,
    volume,
    isMuted,
    isFullscreen,
    isLoading,
    error,
    showControls,
    progress,
    bufferedProgress,

    // Playback controls
    play,
    pause,
    togglePlay,
    seek,
    skipForward,
    skipBackward,

    // Frame navigation
    nextFrame,
    previousFrame,

    // Speed control
    changePlaybackSpeed,
    cyclePlaybackSpeed,

    // Volume control
    changeVolume,
    toggleMute,

    // Fullscreen
    toggleFullscreen,

    // Controls visibility
    showControlsTemporarily,

    // Keyboard handler
    handleKeyDown,

    // Helpers
    formatTime,

    // Video props (spread onto <video> element)
    videoProps: {
      ref: videoRef,
      src,
      autoPlay,
      loop,
      playsInline: true,
    },
  };
}

export default useVideoPlayer;
