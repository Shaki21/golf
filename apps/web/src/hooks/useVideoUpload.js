/**
 * useVideoUpload Hook
 * Custom hook for video file upload with progress tracking
 *
 * Provides:
 * - File selection and validation
 * - Drag and drop support
 * - Upload progress tracking
 * - Cancel/retry functionality
 * - Video preview generation
 * - Chunked upload support for large files
 */

import { useState, useRef, useCallback } from 'react';
import * as videoApi from '../services/videoApi';

// Supported video formats
export const SUPPORTED_FORMATS = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/webm',
  'video/x-m4v',
];

// Max file size (5 minutes at ~20MB/min = 100MB, but we allow up to 500MB)
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

// Max video duration (5 minutes as per plan)
export const MAX_DURATION = 5 * 60; // 300 seconds

// Upload states
export const UPLOAD_STATES = {
  IDLE: 'idle',
  SELECTING: 'selecting',
  VALIDATING: 'validating',
  READY: 'ready',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  ERROR: 'error',
  CANCELLED: 'cancelled',
};

// Video categories for golf
export const VIDEO_CATEGORIES = [
  { value: 'full_swing', label: 'Full sving' },
  { value: 'driver', label: 'Driver' },
  { value: 'iron', label: 'Jern' },
  { value: 'wedge', label: 'Wedge' },
  { value: 'putting', label: 'Putting' },
  { value: 'chipping', label: 'Chipping' },
  { value: 'bunker', label: 'Bunker' },
  { value: 'other', label: 'Annet' },
];

// View angles
export const VIEW_ANGLES = [
  { value: 'face_on', label: 'Face On' },
  { value: 'down_the_line', label: 'Down the Line' },
  { value: 'behind', label: 'Bakfra' },
  { value: 'overhead', label: 'Ovenfra' },
  { value: 'other', label: 'Annet' },
];

/**
 * Custom hook for video upload functionality
 *
 * @param {Object} options - Hook options
 * @param {Function} options.onUploadComplete - Callback when upload completes
 * @param {Function} options.onError - Callback on error
 * @param {string} options.playerId - Player ID for the video
 * @returns {Object} Upload state and controls
 */
export function useVideoUpload(options = {}) {
  const {
    onUploadComplete,
    onError,
    playerId,
  } = options;

  // Refs
  const fileInputRef = useRef(null);
  const videoPreviewRef = useRef(null);
  const abortControllerRef = useRef(null);

  // State
  const [uploadState, setUploadState] = useState(UPLOAD_STATES.IDLE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoResolution, setVideoResolution] = useState({ width: 0, height: 0 });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  // Metadata state
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    category: '',
    viewAngle: '',
    clubType: '',
  });

  /**
   * Validate file type and size
   */
  const validateFile = useCallback((file) => {
    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return {
        valid: false,
        error: `Ugyldig filformat. Støttede formater: MP4, MOV, AVI, WebM`,
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Filen er for stor. Maks størrelse: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    return { valid: true };
  }, []);

  /**
   * Generate video preview and extract metadata
   */
  const generatePreview = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');

      video.onloadedmetadata = () => {
        // Check duration
        if (video.duration > MAX_DURATION) {
          URL.revokeObjectURL(url);
          reject(new Error(`Videoen er for lang. Maks lengde: ${MAX_DURATION / 60} minutter`));
          return;
        }

        setVideoDuration(video.duration);
        setVideoResolution({
          width: video.videoWidth,
          height: video.videoHeight,
        });
        setPreviewUrl(url);

        // Generate thumbnail at 1 second or 10% of duration
        const thumbnailTime = Math.min(1, video.duration * 0.1);
        video.currentTime = thumbnailTime;
      };

      video.onseeked = () => {
        // Create thumbnail canvas
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to data URL
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        setThumbnailUrl(thumbnail);

        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          thumbnail,
        });
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Kunne ikke lese videofilen'));
      };

      video.src = url;
      video.load();
    });
  }, []);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(async (file) => {
    setUploadState(UPLOAD_STATES.VALIDATING);
    setError(null);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      setUploadState(UPLOAD_STATES.ERROR);
      onError?.(validation.error);
      return;
    }

    try {
      // Generate preview
      await generatePreview(file);
      setSelectedFile(file);

      // Auto-fill title from filename
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      setMetadata((prev) => ({
        ...prev,
        title: prev.title || fileName,
      }));

      setUploadState(UPLOAD_STATES.READY);
    } catch (err) {
      setError(err.message);
      setUploadState(UPLOAD_STATES.ERROR);
      onError?.(err.message);
    }
  }, [validateFile, generatePreview, onError]);

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  /**
   * Handle drag and drop
   */
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  /**
   * Open file picker
   */
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Open camera (mobile)
   */
  const openCamera = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
      // Remove capture attribute after click to allow normal file selection next time
      setTimeout(() => {
        fileInputRef.current?.removeAttribute('capture');
      }, 100);
    }
  }, []);

  /**
   * Update metadata
   */
  const updateMetadata = useCallback((field, value) => {
    setMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  /**
   * Start upload using multipart upload
   */
  const startUpload = useCallback(async () => {
    if (!selectedFile || uploadState === UPLOAD_STATES.UPLOADING) {
      return;
    }

    setUploadState(UPLOAD_STATES.UPLOADING);
    setUploadProgress(0);
    setError(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Use the uploadVideo helper which handles multipart upload
      const video = await videoApi.uploadVideo({
        file: selectedFile,
        playerId,
        title: metadata.title,
        metadata: {
          description: metadata.description,
          category: metadata.category,
          viewAngle: metadata.viewAngle,
          clubType: metadata.clubType,
          duration: videoDuration,
          width: videoResolution.width,
          height: videoResolution.height,
        },
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
        signal: abortControllerRef.current.signal,
      });

      // Processing complete
      setUploadState(UPLOAD_STATES.PROCESSING);

      // Short delay to show processing state
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUploadedVideo(video);
      setUploadState(UPLOAD_STATES.COMPLETE);
      onUploadComplete?.(video);

    } catch (err) {
      if (err.message === 'Upload cancelled' || err.message === 'Opplasting avbrutt') {
        setUploadState(UPLOAD_STATES.CANCELLED);
      } else {
        setError(err.message || 'Opplasting feilet');
        setUploadState(UPLOAD_STATES.ERROR);
        onError?.(err.message);
      }
    }
  }, [
    selectedFile, uploadState, playerId, metadata, videoDuration,
    videoResolution, onUploadComplete, onError,
  ]);

  /**
   * Cancel upload
   */
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploadState(UPLOAD_STATES.CANCELLED);
  }, []);

  /**
   * Retry upload
   */
  const retryUpload = useCallback(() => {
    setError(null);
    startUpload();
  }, [startUpload]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    // Revoke preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setUploadState(UPLOAD_STATES.IDLE);
    setSelectedFile(null);
    setPreviewUrl(null);
    setThumbnailUrl(null);
    setVideoDuration(0);
    setVideoResolution({ width: 0, height: 0 });
    setUploadProgress(0);
    setError(null);
    setUploadedVideo(null);
    setMetadata({
      title: '',
      description: '',
      category: '',
      viewAngle: '',
      clubType: '',
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  /**
   * Format file size
   */
  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  /**
   * Format duration
   */
  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // Refs
    fileInputRef,
    videoPreviewRef,

    // State
    uploadState,
    selectedFile,
    previewUrl,
    thumbnailUrl,
    videoDuration,
    videoResolution,
    uploadProgress,
    error,
    uploadedVideo,
    metadata,

    // File handling
    handleInputChange,
    handleDrop,
    handleDragOver,
    openFilePicker,
    openCamera,

    // Metadata
    updateMetadata,

    // Upload controls
    startUpload,
    cancelUpload,
    retryUpload,
    reset,

    // Helpers
    formatFileSize,
    formatDuration,

    // Constants
    SUPPORTED_FORMATS,
    MAX_FILE_SIZE,
    MAX_DURATION,
    VIDEO_CATEGORIES,
    VIEW_ANGLES,

    // Input props
    inputProps: {
      ref: fileInputRef,
      type: 'file',
      accept: SUPPORTED_FORMATS.join(','),
      onChange: handleInputChange,
      style: { display: 'none' },
    },
  };
}

export default useVideoUpload;
