/**
 * VoiceRecorder Component
 * Audio recording component for video voice-over annotations
 *
 * Features:
 * - Record audio with microphone
 * - Real-time waveform visualization
 * - Input level meter
 * - Playback with seek controls
 * - Timer display
 * - Re-record and save functionality
 */

import React, { useCallback, useMemo } from 'react';
import { useAudioRecording, RECORDING_STATES } from '../../hooks/useAudioRecording';
import { SubSectionTitle } from '../typography';

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3, 12px)',
    padding: 'var(--spacing-4, 16px)',
    backgroundColor: 'var(--tier-toast-bg)',
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid var(--video-border)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--spacing-3, 12px)',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary, white)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2, 8px)',
  },
  timer: {
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: 'var(--font-mono, monospace)',
    color: 'var(--text-primary, white)',
    minWidth: '80px',
    textAlign: 'center',
  },
  timerRecording: {
    color: 'var(--error)',
  },
  waveformContainer: {
    position: 'relative',
    height: '80px',
    backgroundColor: 'var(--tier-surface-dark-elevated)',
    borderRadius: 'var(--radius-md, 8px)',
    overflow: 'hidden',
  },
  waveform: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    padding: '0 var(--spacing-2, 8px)',
    gap: '2px',
  },
  waveformBar: {
    width: '3px',
    backgroundColor: 'var(--accent)',
    borderRadius: '2px',
    transition: 'height 0.05s ease',
  },
  waveformBarRecording: {
    backgroundColor: 'var(--error)',
  },
  inputLevelContainer: {
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '60px',
    backgroundColor: 'var(--video-control-bg)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  inputLevel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--success)',
    borderRadius: '2px',
    transition: 'height 0.05s ease',
  },
  inputLevelHigh: {
    backgroundColor: 'var(--warning)',
  },
  inputLevelClipping: {
    backgroundColor: 'var(--error)',
  },
  playbackContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2, 8px)',
  },
  progressBar: {
    position: 'relative',
    height: '8px',
    backgroundColor: 'var(--tier-surface-dark-elevated)',
    borderRadius: '4px',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '4px',
    transition: 'width 0.1s ease',
  },
  timeDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    fontFamily: 'var(--font-mono, monospace)',
    color: 'var(--text-secondary, rgba(255, 255, 255, 0.7))',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-3, 12px)',
  },
  recordButton: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '3px solid var(--error)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  recordButtonInner: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--error)',
    transition: 'all 0.2s ease',
  },
  recordButtonRecording: {
    borderRadius: 'var(--radius-sm, 4px)',
    width: '24px',
    height: '24px',
  },
  controlButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'var(--tier-surface-dark-elevated)',
    color: 'var(--text-primary, white)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  controlButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  primaryButton: {
    backgroundColor: 'var(--accent)',
  },
  actions: {
    display: 'flex',
    gap: 'var(--spacing-2, 8px)',
    marginTop: 'var(--spacing-2, 8px)',
  },
  actionButton: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: 'var(--radius-md, 8px)',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2, 8px)',
    transition: 'all 0.2s ease',
  },
  saveButton: {
    backgroundColor: 'var(--accent)',
    color: 'white',
  },
  discardButton: {
    backgroundColor: 'transparent',
    color: 'var(--video-text-secondary)',
    border: '1px solid var(--video-border-strong)',
  },
  permissionPrompt: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-6, 24px)',
    textAlign: 'center',
  },
  permissionIcon: {
    width: '48px',
    height: '48px',
    color: 'var(--video-text-tertiary)',
    marginBottom: 'var(--spacing-3, 12px)',
  },
  permissionText: {
    fontSize: '14px',
    color: 'var(--video-text-secondary)',
    marginBottom: 'var(--spacing-4, 16px)',
    maxWidth: '280px',
  },
  permissionButton: {
    padding: '10px 24px',
    backgroundColor: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md, 8px)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  errorMessage: {
    padding: 'var(--spacing-3, 12px)',
    backgroundColor: 'var(--error-muted)',
    borderRadius: 'var(--radius-md, 8px)',
    color: 'var(--error)',
    fontSize: '13px',
    textAlign: 'center',
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--error)',
    animation: 'pulse 1s ease-in-out infinite',
  },
};

// Icons
const MicIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const PlayIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const TrashIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const SaveIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

/**
 * VoiceRecorder Component
 */
export function VoiceRecorder({
  onSave,
  onDiscard,
  maxDuration = 300,
  syncWithVideo = false,
  videoCurrentTime = 0,
  style,
  className,
}) {
  const {
    recordingState,
    duration,
    audioBlob,
    audioUrl,
    waveformData,
    currentTime,
    error,
    permissionGranted,
    inputLevel,
    requestPermission,
    startRecording,
    stopRecording,
    playAudio,
    pauseAudio,
    seekTo,
    reset,
    getAudioFile,
    formatDuration,
  } = useAudioRecording({
    maxDuration,
    onRecordingComplete: onSave,
  });

  // Handle record button click
  const handleRecordClick = useCallback(() => {
    if (recordingState === RECORDING_STATES.RECORDING) {
      stopRecording();
    } else if (recordingState === RECORDING_STATES.READY || recordingState === RECORDING_STATES.STOPPED) {
      reset();
      startRecording();
    } else {
      startRecording();
    }
  }, [recordingState, startRecording, stopRecording, reset]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (recordingState === RECORDING_STATES.PLAYING) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [recordingState, playAudio, pauseAudio]);

  // Handle progress bar click
  const handleProgressClick = useCallback((e) => {
    if (!audioUrl) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(percent * duration);
  }, [audioUrl, duration, seekTo]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!audioBlob) return;

    const file = getAudioFile(`voice-over-${Date.now()}.webm`);
    onSave?.({
      blob: audioBlob,
      url: audioUrl,
      file,
      duration,
      timestamp: syncWithVideo ? videoCurrentTime : 0,
    });
  }, [audioBlob, audioUrl, duration, getAudioFile, onSave, syncWithVideo, videoCurrentTime]);

  // Handle discard
  const handleDiscard = useCallback(() => {
    reset();
    onDiscard?.();
  }, [reset, onDiscard]);

  // Get input level color
  const getInputLevelStyle = useMemo(() => {
    if (inputLevel > 0.9) return styles.inputLevelClipping;
    if (inputLevel > 0.7) return styles.inputLevelHigh;
    return {};
  }, [inputLevel]);

  // Render waveform bars
  const renderWaveform = () => {
    const isRecording = recordingState === RECORDING_STATES.RECORDING;
    const barsToShow = Math.min(waveformData.length, 100);
    const startIndex = Math.max(0, waveformData.length - barsToShow);

    return (
      <div style={styles.waveform}>
        {waveformData.slice(startIndex).map((value, index) => (
          <div
            key={index}
            style={{
              ...styles.waveformBar,
              ...(isRecording ? styles.waveformBarRecording : {}),
              height: `${Math.max(4, value * 60)}px`,
            }}
          />
        ))}
      </div>
    );
  };

  // Render permission prompt
  if (!permissionGranted && recordingState !== RECORDING_STATES.REQUESTING_PERMISSION) {
    return (
      <div className={className} style={{ ...styles.container, ...style }}>
        <div style={styles.permissionPrompt}>
          <MicIcon size={48} />
          <p style={styles.permissionText}>
            For å ta opp stemmekommentarer trenger vi tilgang til mikrofonen din.
          </p>
          <button
            style={styles.permissionButton}
            onClick={requestPermission}
          >
            Gi mikrofontilgang
          </button>
        </div>
      </div>
    );
  }

  const isRecording = recordingState === RECORDING_STATES.RECORDING;
  const hasRecording = audioBlob !== null;
  const isPlaying = recordingState === RECORDING_STATES.PLAYING;

  return (
    <div className={className} style={{ ...styles.container, ...style }}>
      {/* Header */}
      <div style={styles.header}>
        <SubSectionTitle style={styles.title}>
          <MicIcon size={18} />
          Stemmekommentar
          {isRecording && <span style={styles.statusIndicator} />}
        </SubSectionTitle>
        <div
          style={{
            ...styles.timer,
            ...(isRecording ? styles.timerRecording : {}),
          }}
        >
          {formatDuration(isRecording || !hasRecording ? duration : currentTime)}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Waveform / Playback */}
      <div style={styles.waveformContainer}>
        {/* Input level meter */}
        {isRecording && (
          <div style={styles.inputLevelContainer}>
            <div
              style={{
                ...styles.inputLevel,
                ...getInputLevelStyle,
                height: `${inputLevel * 100}%`,
              }}
            />
          </div>
        )}

        {/* Waveform visualization */}
        {renderWaveform()}
      </div>

      {/* Playback controls (when recording exists) */}
      {hasRecording && !isRecording && (
        <div style={styles.playbackContainer}>
          <div
            style={styles.progressBar}
            onClick={handleProgressClick}
            role="slider"
            aria-label="Avspillingsposisjon"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
          >
            <div
              style={{
                ...styles.progressFill,
                width: `${(currentTime / duration) * 100}%`,
              }}
            />
          </div>
          <div style={styles.timeDisplay}>
            <span>{formatDuration(currentTime)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={styles.controls}>
        {/* Play/Pause button (when recording exists) */}
        {hasRecording && !isRecording && (
          <button
            style={{
              ...styles.controlButton,
              ...styles.primaryButton,
            }}
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Spill av'}
          >
            {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </button>
        )}

        {/* Record button */}
        <button
          style={styles.recordButton}
          onClick={handleRecordClick}
          aria-label={isRecording ? 'Stopp opptak' : 'Start opptak'}
        >
          <div
            style={{
              ...styles.recordButtonInner,
              ...(isRecording ? styles.recordButtonRecording : {}),
            }}
          />
        </button>

        {/* Re-record button (when recording exists) */}
        {hasRecording && !isRecording && (
          <button
            style={styles.controlButton}
            onClick={() => {
              reset();
              startRecording();
            }}
            aria-label="Ta opp på nytt"
          >
            <MicIcon size={20} />
          </button>
        )}
      </div>

      {/* Action buttons (when recording exists) */}
      {hasRecording && !isRecording && (
        <div style={styles.actions}>
          <button
            style={{ ...styles.actionButton, ...styles.discardButton }}
            onClick={handleDiscard}
          >
            <TrashIcon />
            Forkast
          </button>
          <button
            style={{ ...styles.actionButton, ...styles.saveButton }}
            onClick={handleSave}
          >
            <SaveIcon />
            Lagre
          </button>
        </div>
      )}

      {/* Max duration warning */}
      {isRecording && duration > maxDuration - 30 && (
        <div style={{ ...styles.errorMessage, backgroundColor: 'var(--warning-muted)', color: 'var(--warning)' }}>
          {Math.ceil(maxDuration - duration)} sekunder igjen
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default VoiceRecorder;
