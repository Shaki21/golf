/**
 * TIER GOLF — VIDEO ANALYSIS SYSTEM
 * VideoUploader Component
 *
 * Video upload interface with:
 * - Drag and drop zone
 * - File browser and camera access
 * - Video preview before upload
 * - Metadata form (title, category, view angle)
 * - Upload progress with cancel option
 * - Mobile-friendly design
 */

import React, { useState, useCallback } from 'react';
import {
  useVideoUpload,
  UPLOAD_STATES,
  VIDEO_CATEGORIES,
  VIEW_ANGLES,
} from '../../hooks/useVideoUpload';
import { SubSectionTitle } from '../typography';

// Icons
const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z" />
  </svg>
);

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);

const FolderIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const PlayIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

// Styles
const styles = {
  container: {
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
  },
  dropZone: {
    border: '2px dashed var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-8)',
    textAlign: 'center',
    backgroundColor: 'var(--background-surface)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dropZoneActive: {
    borderColor: 'var(--accent)',
    backgroundColor: 'var(--accent-muted)',
  },
  dropZoneDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  uploadIcon: {
    color: 'var(--accent)',
    marginBottom: 'var(--spacing-3)',
  },
  dropZoneTitle: {
    fontSize: 'var(--font-size-headline)',
    fontWeight: 600,
    color: 'var(--background-inverse)',
    marginBottom: 'var(--spacing-2)',
    fontFamily: 'var(--font-family)',
  },
  dropZoneText: {
    fontSize: 'var(--font-size-body)',
    color: 'var(--text-secondary)',
    marginBottom: 'var(--spacing-4)',
    fontFamily: 'var(--font-family)',
  },
  buttonRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    backgroundColor: 'var(--accent)',
    color: 'var(--text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-body)',
    fontFamily: 'var(--font-family)',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  buttonSecondary: {
    backgroundColor: 'var(--background-surface)',
    color: 'var(--accent)',
    border: '1px solid var(--border-default)',
  },
  buttonDanger: {
    backgroundColor: 'var(--error)',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  previewContainer: {
    marginTop: 'var(--spacing-4)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    backgroundColor: 'var(--background-inverse)',
    position: 'relative',
  },
  previewVideo: {
    width: '100%',
    aspectRatio: '16 / 9',
    objectFit: 'contain',
  },
  previewOverlay: {
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
  previewPlayButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    backgroundColor: 'var(--overlay-glass)',
    borderRadius: 'var(--radius-full)',
    color: 'var(--accent)',
  },
  fileInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--background-surface)',
    borderRadius: 'var(--radius-sm)',
    marginTop: 'var(--spacing-3)',
  },
  fileInfoText: {
    fontSize: 'var(--font-size-footnote)',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-family)',
  },
  form: {
    marginTop: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  label: {
    fontSize: 'var(--font-size-footnote)',
    fontWeight: 600,
    color: 'var(--background-inverse)',
    fontFamily: 'var(--font-family)',
  },
  input: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-body)',
    fontFamily: 'var(--font-family)',
    backgroundColor: 'var(--text-inverse)',
  },
  textarea: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-body)',
    fontFamily: 'var(--font-family)',
    backgroundColor: 'var(--text-inverse)',
    minHeight: '80px',
    resize: 'vertical',
  },
  select: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-body)',
    fontFamily: 'var(--font-family)',
    backgroundColor: 'var(--text-inverse)',
    cursor: 'pointer',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-3)',
  },
  progressContainer: {
    marginTop: 'var(--spacing-4)',
    padding: 'var(--spacing-4)',
    backgroundColor: 'var(--background-surface)',
    borderRadius: 'var(--radius-md)',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-2)',
  },
  progressTitle: {
    fontSize: 'var(--font-size-body)',
    fontWeight: 600,
    color: 'var(--background-inverse)',
    fontFamily: 'var(--font-family)',
  },
  progressPercent: {
    fontSize: 'var(--font-size-headline)',
    fontWeight: 700,
    color: 'var(--accent)',
    fontFamily: 'var(--font-family)',
  },
  progressBar: {
    height: '8px',
    backgroundColor: 'var(--border-default)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: 'var(--radius-full)',
    transition: 'width 0.3s ease',
  },
  progressText: {
    marginTop: 'var(--spacing-2)',
    fontSize: 'var(--font-size-footnote)',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-family)',
    textAlign: 'center',
  },
  statusContainer: {
    textAlign: 'center',
    padding: 'var(--spacing-6)',
  },
  statusIcon: {
    marginBottom: 'var(--spacing-3)',
  },
  statusIconSuccess: {
    color: 'var(--success)',
  },
  statusIconError: {
    color: 'var(--error)',
  },
  statusTitle: {
    fontSize: 'var(--font-size-title3)',
    fontWeight: 600,
    color: 'var(--background-inverse)',
    marginBottom: 'var(--spacing-2)',
    fontFamily: 'var(--font-family)',
  },
  statusText: {
    fontSize: 'var(--font-size-body)',
    color: 'var(--text-secondary)',
    marginBottom: 'var(--spacing-4)',
    fontFamily: 'var(--font-family)',
  },
  errorText: {
    color: 'var(--error)',
    fontSize: 'var(--font-size-footnote)',
    marginTop: 'var(--spacing-2)',
    fontFamily: 'var(--font-family)',
  },
  actionButtons: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    justifyContent: 'center',
    marginTop: 'var(--spacing-4)',
  },
};

/**
 * VideoUploader Component
 *
 * @param {Object} props
 * @param {string} props.playerId - Player ID for the upload
 * @param {Function} props.onUploadComplete - Callback when upload completes
 * @param {Function} props.onCancel - Callback when user cancels
 * @param {Object} props.style - Additional container styles
 * @param {string} props.className - Additional CSS class
 */
export function VideoUploader({
  playerId,
  onUploadComplete,
  onCancel,
  style,
  className,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const upload = useVideoUpload({
    playerId,
    onUploadComplete,
    onError: (err) => console.error('Upload error:', err),
  });

  const {
    uploadState,
    selectedFile,
    previewUrl,
    videoDuration,
    videoResolution,
    uploadProgress,
    error,
    metadata,
    handleDrop,
    handleDragOver,
    openFilePicker,
    openCamera,
    updateMetadata,
    startUpload,
    cancelUpload,
    retryUpload,
    reset,
    formatFileSize,
    formatDuration,
    inputProps,
  } = upload;

  /**
   * Handle drag enter
   */
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  /**
   * Handle drop wrapper
   */
  const handleDropWrapper = useCallback((e) => {
    setIsDragging(false);
    handleDrop(e);
  }, [handleDrop]);

  /**
   * Handle preview click
   */
  const handlePreviewClick = useCallback(() => {
    const video = document.querySelector('#preview-video');
    if (video) {
      if (video.paused) {
        video.play();
        setIsPreviewPlaying(true);
      } else {
        video.pause();
        setIsPreviewPlaying(false);
      }
    }
  }, []);

  /**
   * Render drop zone
   */
  const renderDropZone = () => (
    <div
      style={{
        ...styles.dropZone,
        ...(isDragging ? styles.dropZoneActive : {}),
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDropWrapper}
      onClick={openFilePicker}
    >
      <div style={styles.uploadIcon}>
        <UploadIcon />
      </div>
      <SubSectionTitle style={styles.dropZoneTitle}>
        Dra og slipp video her
      </SubSectionTitle>
      <p style={styles.dropZoneText}>
        eller velg fra enhet
      </p>
      <div style={styles.buttonRow}>
        <button
          style={styles.button}
          onClick={(e) => {
            e.stopPropagation();
            openFilePicker();
          }}
        >
          <FolderIcon />
          Velg fil
        </button>
        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={(e) => {
            e.stopPropagation();
            openCamera();
          }}
        >
          <CameraIcon />
          Ta opp
        </button>
      </div>
      <p style={{ ...styles.dropZoneText, marginTop: 'var(--spacing-4)', marginBottom: 0 }}>
        MP4, MOV, AVI, WebM • Maks 5 min • Maks 500MB
      </p>
    </div>
  );

  /**
   * Render preview and form
   */
  const renderPreviewAndForm = () => (
    <>
      {/* Video Preview */}
      <div style={styles.previewContainer}>
        <video
          id="preview-video"
          src={previewUrl}
          style={styles.previewVideo}
          onClick={handlePreviewClick}
          onEnded={() => setIsPreviewPlaying(false)}
        />
        {!isPreviewPlaying && (
          <div style={styles.previewOverlay} onClick={handlePreviewClick}>
            <div style={styles.previewPlayButton}>
              <PlayIcon />
            </div>
          </div>
        )}
      </div>

      {/* File Info */}
      <div style={styles.fileInfo}>
        <span style={styles.fileInfoText}>
          {selectedFile?.name}
        </span>
        <span style={styles.fileInfoText}>
          {formatFileSize(selectedFile?.size)} • {formatDuration(videoDuration)} • {videoResolution.width}x{videoResolution.height}
        </span>
      </div>

      {/* Metadata Form */}
      <div style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Tittel *</label>
          <input
            type="text"
            style={styles.input}
            value={metadata.title}
            onChange={(e) => updateMetadata('title', e.target.value)}
            placeholder="Gi videoen et navn"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Beskrivelse</label>
          <textarea
            style={styles.textarea}
            value={metadata.description}
            onChange={(e) => updateMetadata('description', e.target.value)}
            placeholder="Legg til en beskrivelse (valgfritt)"
          />
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Kategori</label>
            <select
              style={styles.select}
              value={metadata.category}
              onChange={(e) => updateMetadata('category', e.target.value)}
            >
              <option value="">Velg kategori</option>
              {VIDEO_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Vinkel</label>
            <select
              style={styles.select}
              value={metadata.viewAngle}
              onChange={(e) => updateMetadata('viewAngle', e.target.value)}
            >
              <option value="">Velg vinkel</option>
              {VIEW_ANGLES.map((angle) => (
                <option key={angle.value} value={angle.value}>
                  {angle.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p style={styles.errorText}>{error}</p>
      )}

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={reset}
        >
          Avbryt
        </button>
        <button
          style={{
            ...styles.button,
            ...(!metadata.title ? styles.buttonDisabled : {}),
          }}
          onClick={startUpload}
          disabled={!metadata.title}
        >
          Last opp video
        </button>
      </div>
    </>
  );

  /**
   * Render uploading state
   */
  const renderUploading = () => (
    <div style={styles.progressContainer}>
      <div style={styles.progressHeader}>
        <span style={styles.progressTitle}>
          {uploadState === UPLOAD_STATES.PROCESSING ? 'Behandler...' : 'Laster opp...'}
        </span>
        <span style={styles.progressPercent}>{uploadProgress}%</span>
      </div>
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${uploadProgress}%`,
          }}
        />
      </div>
      <p style={styles.progressText}>
        {uploadState === UPLOAD_STATES.PROCESSING
          ? 'Genererer forhåndsvisning...'
          : `${formatFileSize(selectedFile?.size * uploadProgress / 100)} av ${formatFileSize(selectedFile?.size)}`
        }
      </p>
      {uploadState === UPLOAD_STATES.UPLOADING && (
        <div style={styles.actionButtons}>
          <button
            style={{ ...styles.button, ...styles.buttonDanger }}
            onClick={cancelUpload}
          >
            Avbryt
          </button>
        </div>
      )}
    </div>
  );

  /**
   * Render complete state
   */
  const renderComplete = () => (
    <div style={styles.statusContainer}>
      <div style={{ ...styles.statusIcon, ...styles.statusIconSuccess }}>
        <CheckIcon />
      </div>
      <SubSectionTitle style={styles.statusTitle}>Opplasting fullført!</SubSectionTitle>
      <p style={styles.statusText}>
        Videoen er klar for analyse.
      </p>
      <div style={styles.actionButtons}>
        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={reset}
        >
          Last opp ny
        </button>
        <button
          style={styles.button}
          onClick={() => onUploadComplete?.(upload.uploadedVideo)}
        >
          Gå til video
        </button>
      </div>
    </div>
  );

  /**
   * Render error state
   */
  const renderError = () => (
    <div style={styles.statusContainer}>
      <div style={{ ...styles.statusIcon, ...styles.statusIconError }}>
        <ErrorIcon />
      </div>
      <SubSectionTitle style={styles.statusTitle}>Opplasting feilet</SubSectionTitle>
      <p style={styles.statusText}>{error}</p>
      <div style={styles.actionButtons}>
        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={reset}
        >
          Prøv på nytt
        </button>
        <button
          style={styles.button}
          onClick={retryUpload}
        >
          Prøv igjen
        </button>
      </div>
    </div>
  );

  /**
   * Render based on state
   */
  const renderContent = () => {
    switch (uploadState) {
      case UPLOAD_STATES.IDLE:
      case UPLOAD_STATES.SELECTING:
      case UPLOAD_STATES.VALIDATING:
        return renderDropZone();

      case UPLOAD_STATES.READY:
        return renderPreviewAndForm();

      case UPLOAD_STATES.UPLOADING:
      case UPLOAD_STATES.PROCESSING:
        return renderUploading();

      case UPLOAD_STATES.COMPLETE:
        return renderComplete();

      case UPLOAD_STATES.ERROR:
      case UPLOAD_STATES.CANCELLED:
        return renderError();

      default:
        return renderDropZone();
    }
  };

  return (
    <div style={{ ...styles.container, ...style }} className={className}>
      <input {...inputProps} />
      {renderContent()}
    </div>
  );
}

export default VideoUploader;
