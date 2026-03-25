/**
 * useVideoAnnotations Hook
 * Hook for managing video annotations and voice-overs
 *
 * Features:
 * - Fetch annotations for a video
 * - Create, update, delete annotations
 * - Bulk create annotations
 * - Voice-over audio upload and playback
 * - Optimistic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as videoApi from '../services/videoApi';

/**
 * Hook for managing video annotations
 *
 * @param {string} videoId - Video ID
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.autoFetch=true] - Auto-fetch on mount
 * @returns {Object} Annotations state and controls
 */
export function useVideoAnnotations(videoId, options = {}) {
  const { autoFetch = true } = options;

  // State
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Refs
  const isMountedRef = useRef(true);

  /**
   * Fetch annotations from API
   */
  const fetchAnnotations = useCallback(async () => {
    if (!videoId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await videoApi.listAnnotations(videoId);

      if (!isMountedRef.current) return;

      setAnnotations(result.annotations);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke hente annoteringer');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [videoId]);

  /**
   * Create a new annotation
   */
  const createAnnotation = useCallback(async (annotationData) => {
    if (!videoId) return null;

    setSaving(true);
    setError(null);

    try {
      const annotation = await videoApi.createAnnotation({
        videoId,
        ...annotationData,
      });

      if (isMountedRef.current) {
        setAnnotations((prev) => [...prev, annotation].sort((a, b) => a.timestamp - b.timestamp));
      }

      return annotation;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke opprette annotering');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [videoId]);

  /**
   * Create multiple annotations at once
   */
  const bulkCreateAnnotations = useCallback(async (annotationsData) => {
    if (!videoId) return null;

    setSaving(true);
    setError(null);

    try {
      const result = await videoApi.bulkCreateAnnotations(videoId, annotationsData);

      // Refetch to get the created annotations
      if (isMountedRef.current) {
        await fetchAnnotations();
      }

      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke opprette annoteringer');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [videoId, fetchAnnotations]);

  /**
   * Update an annotation
   */
  const updateAnnotation = useCallback(async (annotationId, updates) => {
    setSaving(true);
    setError(null);

    // Optimistic update
    const previousAnnotations = annotations;
    setAnnotations((prev) =>
      prev.map((a) => (a.id === annotationId ? { ...a, ...updates } : a))
    );

    try {
      await videoApi.updateAnnotation(annotationId, updates);
    } catch (err) {
      // Rollback on error
      if (isMountedRef.current) {
        setAnnotations(previousAnnotations);
        setError(err.message || 'Kunne ikke oppdatere annotering');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [annotations]);

  /**
   * Delete an annotation
   */
  const deleteAnnotation = useCallback(async (annotationId) => {
    setSaving(true);
    setError(null);

    // Optimistic update
    const previousAnnotations = annotations;
    setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));

    try {
      await videoApi.deleteAnnotation(annotationId);
    } catch (err) {
      // Rollback on error
      if (isMountedRef.current) {
        setAnnotations(previousAnnotations);
        setError(err.message || 'Kunne ikke slette annotering');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [annotations]);

  /**
   * Get annotations at a specific timestamp
   */
  const getAnnotationsAtTime = useCallback((timestamp, tolerance = 0.1) => {
    return annotations.filter((a) => {
      const start = a.timestamp;
      const end = a.duration ? start + a.duration : start;
      return timestamp >= start - tolerance && timestamp <= end + tolerance;
    });
  }, [annotations]);

  /**
   * Get annotations by type
   */
  const getAnnotationsByType = useCallback((type) => {
    return annotations.filter((a) => a.type === type);
  }, [annotations]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && videoId) {
      fetchAnnotations();
    }
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    annotations,
    loading,
    error,
    saving,
    refresh: fetchAnnotations,
    createAnnotation,
    bulkCreateAnnotations,
    updateAnnotation,
    deleteAnnotation,
    getAnnotationsAtTime,
    getAnnotationsByType,
  };
}

/**
 * Hook for managing voice-over audio on an annotation
 *
 * @param {string} annotationId - Annotation ID
 * @param {Object} [options] - Hook options
 * @returns {Object} Audio state and controls
 */
export function useAnnotationAudio(annotationId, options = {}) {
  // State
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // Refs
  const isMountedRef = useRef(true);
  const refreshTimeoutRef = useRef(null);

  /**
   * Fetch audio playback URL
   */
  const fetchAudioUrl = useCallback(async () => {
    if (!annotationId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await videoApi.getAudioPlaybackUrl(annotationId);

      if (!isMountedRef.current) return;

      setAudioUrl(data.url);

      // Schedule refresh before expiry
      const expiryTime = new Date(data.expiresAt).getTime();
      const now = Date.now();
      const refreshIn = expiryTime - now - 30000; // 30 seconds before expiry

      if (refreshIn > 0) {
        refreshTimeoutRef.current = setTimeout(fetchAudioUrl, refreshIn);
      }
    } catch (err) {
      // Audio may not exist yet, which is ok
      if (err.status !== 404 && isMountedRef.current) {
        setError(err.message || 'Kunne ikke hente lyd-URL');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [annotationId]);

  /**
   * Upload audio recording
   */
  const uploadAudio = useCallback(async (audioBlob, duration) => {
    if (!annotationId) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Get upload URL
      const uploadData = await videoApi.getAudioUploadUrl(
        annotationId,
        audioBlob.type,
        duration
      );

      // Upload to S3
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Opplasting feilet'));
          }
        };

        xhr.onerror = () => reject(new Error('Nettverksfeil'));
        xhr.open('PUT', uploadData.uploadUrl);
        xhr.setRequestHeader('Content-Type', audioBlob.type);
        xhr.send(audioBlob);
      });

      // Confirm upload
      await videoApi.confirmAudioUpload(annotationId, duration);

      // Fetch the playback URL
      if (isMountedRef.current) {
        await fetchAudioUrl();
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke laste opp lyd');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setUploading(false);
        setUploadProgress(0);
      }
    }
  }, [annotationId, fetchAudioUrl]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    audioUrl,
    loading,
    uploading,
    uploadProgress,
    error,
    fetchAudioUrl,
    uploadAudio,
  };
}

/**
 * Hook for managing video comments
 *
 * @param {string} videoId - Video ID
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.autoFetch=true] - Auto-fetch on mount
 * @returns {Object} Comments state and controls
 */
export function useVideoComments(videoId, options = {}) {
  const { autoFetch = true } = options;

  // State
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Refs
  const isMountedRef = useRef(true);

  /**
   * Fetch comments from API
   */
  const fetchComments = useCallback(async () => {
    if (!videoId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await videoApi.listComments(videoId);

      if (!isMountedRef.current) return;

      setComments(result.comments);
      setTotal(result.total);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke hente kommentarer');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [videoId]);

  /**
   * Create a new comment
   */
  const createComment = useCallback(async (body, parentId = null) => {
    if (!videoId) return null;

    setSaving(true);
    setError(null);

    try {
      const comment = await videoApi.createComment({
        videoId,
        body,
        parentId,
      });

      if (isMountedRef.current) {
        if (parentId) {
          // Add reply to parent
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? { ...c, replies: [...(c.replies || []), comment] }
                : c
            )
          );
        } else {
          // Add top-level comment
          setComments((prev) => [comment, ...prev]);
        }
        setTotal((prev) => prev + 1);
      }

      return comment;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke opprette kommentar');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [videoId]);

  /**
   * Update a comment
   */
  const updateComment = useCallback(async (commentId, body) => {
    setSaving(true);
    setError(null);

    try {
      await videoApi.updateComment(commentId, body);

      if (isMountedRef.current) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, body } : c))
        );
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke oppdatere kommentar');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(async (commentId) => {
    setSaving(true);
    setError(null);

    try {
      await videoApi.deleteComment(commentId);

      if (isMountedRef.current) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setTotal((prev) => prev - 1);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke slette kommentar');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && videoId) {
      fetchComments();
    }
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    comments,
    total,
    loading,
    error,
    saving,
    refresh: fetchComments,
    createComment,
    updateComment,
    deleteComment,
  };
}

export default useVideoAnnotations;
