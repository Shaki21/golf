/* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
/**
 * useAudioRecording Hook
 * Custom hook for audio recording with waveform visualization
 *
 * Provides:
 * - Microphone access and permission handling
 * - Audio recording with MediaRecorder API
 * - Real-time waveform data for visualization
 * - Playback of recorded audio
 * - Trim functionality
 * - Export to Blob/File
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// Recording states
export const RECORDING_STATES = {
  IDLE: 'idle',
  REQUESTING_PERMISSION: 'requesting_permission',
  READY: 'ready',
  RECORDING: 'recording',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  PLAYING: 'playing',
  ERROR: 'error',
};

// Audio settings
export const AUDIO_SETTINGS = {
  sampleRate: 44100,
  channelCount: 1,
  mimeType: 'audio/webm;codecs=opus',
  fallbackMimeType: 'audio/webm',
  audioBitsPerSecond: 128000,
};

/**
 * Get supported MIME type for recording
 */
function getSupportedMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return '';
}

/**
 * Custom hook for audio recording
 *
 * @param {Object} options - Hook options
 * @param {Function} options.onRecordingComplete - Callback when recording stops
 * @param {Function} options.onError - Callback on error
 * @param {number} options.maxDuration - Maximum recording duration in seconds
 * @returns {Object} Recording state and controls
 */
export function useAudioRecording(options = {}) {
  const {
    onRecordingComplete,
    onError,
    maxDuration = 300, // 5 minutes default
  } = options;

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioChunksRef = useRef([]);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const audioElementRef = useRef(null);

  // State
  const [recordingState, setRecordingState] = useState(RECORDING_STATES.IDLE);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [waveformData, setWaveformData] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);

  /**
   * Request microphone permission
   */
  const requestPermission = useCallback(async () => {
    setRecordingState(RECORDING_STATES.REQUESTING_PERMISSION);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: AUDIO_SETTINGS.sampleRate,
          channelCount: AUDIO_SETTINGS.channelCount,
        },
      });

      audioStreamRef.current = stream;
      setPermissionGranted(true);
      setRecordingState(RECORDING_STATES.READY);

      // Set up audio context for visualization
      setupAudioContext(stream);

      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setError('Microphone access was denied. Please grant permission in browser settings.');
      setRecordingState(RECORDING_STATES.ERROR);
      onError?.(err);
      return false;
    }
  }, [onError]);

  /**
   * Set up audio context for waveform visualization
   */
  const setupAudioContext = useCallback((stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
    } catch (err) {
      console.error('Failed to set up audio context:', err);
    }
  }, []);

  /**
   * Update waveform visualization
   */
  const updateWaveform = useCallback(() => {
    if (!analyserRef.current || recordingState !== RECORDING_STATES.RECORDING) {
      return;
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average level for input meter
    const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
    setInputLevel(average / 255);

    // Add to waveform data (sample every few frames)
    setWaveformData((prev) => {
      const newData = [...prev, average / 255];
      // Keep last 1000 samples for visualization
      if (newData.length > 1000) {
        return newData.slice(-1000);
      }
      return newData;
    });

    // Update duration
    if (startTimeRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setDuration(elapsed);

      // Check max duration
      if (elapsed >= maxDuration) {
        stopRecording();
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, [recordingState, maxDuration]);

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    // Request permission if not granted
    if (!permissionGranted || !audioStreamRef.current) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    // Resume audio context if suspended
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setError('Your browser does not support audio recording.');
      setRecordingState(RECORDING_STATES.ERROR);
      return;
    }

    try {
      audioChunksRef.current = [];
      setWaveformData([]);
      setDuration(0);
      setAudioBlob(null);
      setAudioUrl(null);

      const mediaRecorder = new MediaRecorder(audioStreamRef.current, {
        mimeType,
        audioBitsPerSecond: AUDIO_SETTINGS.audioBitsPerSecond,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);
        setRecordingState(RECORDING_STATES.STOPPED);
        onRecordingComplete?.(blob, url);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError('Recording failed. Please try again.');
        setRecordingState(RECORDING_STATES.ERROR);
        onError?.(event.error);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms

      startTimeRef.current = Date.now();
      setRecordingState(RECORDING_STATES.RECORDING);

      // Start waveform updates
      animationFrameRef.current = requestAnimationFrame(updateWaveform);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Could not start recording.');
      setRecordingState(RECORDING_STATES.ERROR);
      onError?.(err);
    }
  }, [permissionGranted, requestPermission, updateWaveform, onRecordingComplete, onError]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setInputLevel(0);
  }, []);

  /**
   * Pause recording
   */
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState(RECORDING_STATES.PAUSED);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, []);

  /**
   * Resume recording
   */
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState(RECORDING_STATES.RECORDING);
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    }
  }, [updateWaveform]);

  /**
   * Play recorded audio
   */
  const playAudio = useCallback(() => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
      audioElementRef.current.onended = () => {
        setRecordingState(RECORDING_STATES.STOPPED);
        setCurrentTime(0);
      };
      audioElementRef.current.ontimeupdate = () => {
        setCurrentTime(audioElementRef.current.currentTime);
      };
    }

    audioElementRef.current.src = audioUrl;
    audioElementRef.current.play();
    setRecordingState(RECORDING_STATES.PLAYING);
  }, [audioUrl]);

  /**
   * Pause audio playback
   */
  const pauseAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setRecordingState(RECORDING_STATES.STOPPED);
    }
  }, []);

  /**
   * Seek to position
   */
  const seekTo = useCallback((time) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    stopRecording();
    pauseAudio();

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    audioChunksRef.current = [];
    setRecordingState(permissionGranted ? RECORDING_STATES.READY : RECORDING_STATES.IDLE);
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setWaveformData([]);
    setCurrentTime(0);
    setError(null);
    setInputLevel(0);
  }, [audioUrl, permissionGranted, stopRecording, pauseAudio]);

  /**
   * Get audio as File object
   */
  const getAudioFile = useCallback((filename = 'recording.webm') => {
    if (!audioBlob) return null;
    return new File([audioBlob], filename, { type: audioBlob.type });
  }, [audioBlob]);

  /**
   * Format duration as MM:SS
   */
  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  return {
    // State
    recordingState,
    duration,
    audioBlob,
    audioUrl,
    waveformData,
    currentTime,
    error,
    permissionGranted,
    inputLevel,

    // Recording controls
    requestPermission,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,

    // Playback controls
    playAudio,
    pauseAudio,
    seekTo,

    // Utilities
    reset,
    getAudioFile,
    formatDuration,

    // Constants
    maxDuration,
    RECORDING_STATES,
  };
}

export default useAudioRecording;
