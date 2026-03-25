/**
 * useKeyframes Hook
 * Hook for managing video keyframes
 *
 * Features:
 * - Fetch keyframes for a video
 * - Create, update, delete keyframes
 * - Get signed URLs for keyframe images
 * - Optimistic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as videoApi from '../services/videoApi';

/**
 * Hook for managing video keyframes
 *
 * @param {string} videoId - Video ID
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.autoFetch=true] - Auto-fetch on mount
 * @returns {Object} Keyframes state and controls
 */
export function useKeyframes(videoId, options = {}) {
  const { autoFetch = true } = options;

  // State
  const [keyframes, setKeyframes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Refs
  const isMountedRef = useRef(true);

  /**
   * Fetch keyframes from API
   */
  const fetchKeyframes = useCallback(async () => {
    if (!videoId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await videoApi.listKeyframes(videoId);

      if (!isMountedRef.current) return;

      setKeyframes(result);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke hente keyframes');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [videoId]);

  /**
   * Create a new keyframe
   */
  const createKeyframe = useCallback(async (keyframeData) => {
    if (!videoId) return null;

    setSaving(true);
    setError(null);

    try {
      const keyframe = await videoApi.extractKeyframe({
        videoId,
        ...keyframeData,
      });

      if (isMountedRef.current) {
        setKeyframes((prev) => [...prev, keyframe].sort((a, b) => a.timestamp - b.timestamp));
      }

      return keyframe;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke opprette keyframe');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, [videoId]);

  /**
   * Update a keyframe
   */
  const updateKeyframe = useCallback(async (keyframeId, updates) => {
    if (!keyframeId) return null;

    setSaving(true);
    setError(null);

    try {
      await videoApi.updateKeyframe(keyframeId, updates);

      if (isMountedRef.current) {
        setKeyframes((prev) =>
          prev.map((kf) =>
            kf.id === keyframeId
              ? { ...kf, ...updates }
              : kf
          )
        );
      }

      return true;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke oppdatere keyframe');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Delete a keyframe
   */
  const deleteKeyframe = useCallback(async (keyframeId) => {
    if (!keyframeId) return null;

    setSaving(true);
    setError(null);

    try {
      await videoApi.deleteKeyframe(keyframeId);

      if (isMountedRef.current) {
        setKeyframes((prev) => prev.filter((kf) => kf.id !== keyframeId));
      }

      return true;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke slette keyframe');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  /**
   * Get signed URL for keyframe image
   */
  const getKeyframeImageUrl = useCallback(async (keyframeId, expiresIn = 3600) => {
    if (!keyframeId) return null;

    try {
      const result = await videoApi.getKeyframeUrl(keyframeId, expiresIn);
      return result.url;
    } catch (err) {
      console.error('Failed to get keyframe URL:', err);
      throw err;
    }
  }, []);

  /**
   * Refresh keyframes from API
   */
  const refresh = useCallback(() => {
    return fetchKeyframes();
  }, [fetchKeyframes]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchKeyframes();
    }
  }, [autoFetch, fetchKeyframes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    keyframes,
    loading,
    error,
    saving,
    createKeyframe,
    updateKeyframe,
    deleteKeyframe,
    getKeyframeImageUrl,
    refresh,
  };
}

export default useKeyframes;
