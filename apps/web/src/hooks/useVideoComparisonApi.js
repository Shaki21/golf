/**
 * useVideoComparisonApi Hook
 * Hook for managing video comparisons via API
 *
 * Features:
 * - Fetch comparison by ID (includes video playback URLs)
 * - Create new comparisons
 * - Update comparison sync points
 * - List comparisons for a video
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as videoApi from '../services/videoApi';

/**
 * Hook for fetching a single comparison with playback URLs
 *
 * @param {string} comparisonId - Comparison ID
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.autoFetch=true] - Auto-fetch on mount
 * @returns {Object} Comparison state and controls
 */
export function useComparisonData(comparisonId, options = {}) {
  const { autoFetch = true } = options;

  // State
  const [comparison, setComparison] = useState(null);
  const [primaryPlaybackUrl, setPrimaryPlaybackUrl] = useState(null);
  const [secondaryPlaybackUrl, setSecondaryPlaybackUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs
  const isMountedRef = useRef(true);
  const refreshTimeoutRef = useRef(null);

  /**
   * Fetch comparison data from API
   */
  const fetchComparison = useCallback(async () => {
    if (!comparisonId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await videoApi.getComparison(comparisonId);

      if (!isMountedRef.current) return;

      setComparison(data);

      // Extract playback URLs if included
      if (data.primaryPlaybackUrl) {
        setPrimaryPlaybackUrl(data.primaryPlaybackUrl);
      }
      if (data.secondaryPlaybackUrl) {
        setSecondaryPlaybackUrl(data.secondaryPlaybackUrl);
      }

      // Schedule URL refresh before expiry (if expiry info provided)
      if (data.expiresAt) {
        const expiryTime = new Date(data.expiresAt).getTime();
        const now = Date.now();
        const refreshIn = expiryTime - now - 30000; // 30 seconds before expiry

        if (refreshIn > 0) {
          refreshTimeoutRef.current = setTimeout(fetchComparison, refreshIn);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke hente sammenligning');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [comparisonId]);

  /**
   * Update comparison sync points
   */
  const updateSyncPoints = useCallback(async (syncPoint1, syncPoint2) => {
    if (!comparisonId) return;

    try {
      await videoApi.updateComparison(comparisonId, {
        syncPoint1,
        syncPoint2,
      });

      if (isMountedRef.current) {
        setComparison((prev) => ({
          ...prev,
          syncPoint1,
          syncPoint2,
        }));
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke oppdatere synkpunkter');
      }
      throw err;
    }
  }, [comparisonId]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && comparisonId) {
      fetchComparison();
    }
  }, [comparisonId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    comparison,
    primaryPlaybackUrl,
    secondaryPlaybackUrl,
    loading,
    error,
    refresh: fetchComparison,
    updateSyncPoints,
  };
}

/**
 * Hook for fetching two videos for comparison (when not using saved comparison)
 *
 * @param {string} primaryVideoId - Primary video ID
 * @param {string} secondaryVideoId - Secondary video ID
 * @param {Object} [options] - Hook options
 * @returns {Object} Video data and playback URLs
 */
export function useComparisonVideos(primaryVideoId, secondaryVideoId, options = {}) {
  const { autoFetch = true } = options;

  // State
  const [primaryVideo, setPrimaryVideo] = useState(null);
  const [secondaryVideo, setSecondaryVideo] = useState(null);
  const [primaryPlaybackUrl, setPrimaryPlaybackUrl] = useState(null);
  const [secondaryPlaybackUrl, setSecondaryPlaybackUrl] = useState(null);
  const [loading, setLoading] = useState({ primary: false, secondary: false });
  const [error, setError] = useState({ primary: null, secondary: null });

  // Refs
  const isMountedRef = useRef(true);
  const primaryRefreshRef = useRef(null);
  const secondaryRefreshRef = useRef(null);

  /**
   * Fetch primary video
   */
  const fetchPrimaryVideo = useCallback(async () => {
    if (!primaryVideoId) return;

    setLoading((prev) => ({ ...prev, primary: true }));
    setError((prev) => ({ ...prev, primary: null }));

    try {
      // Fetch video data
      const video = await videoApi.getVideo(primaryVideoId);
      if (!isMountedRef.current) return;
      setPrimaryVideo(video);

      // Get playback URL
      const playback = await videoApi.getPlaybackUrl(primaryVideoId);
      if (!isMountedRef.current) return;
      setPrimaryPlaybackUrl(playback.url);

      // Schedule refresh
      if (playback.expiresAt) {
        const expiryTime = new Date(playback.expiresAt).getTime();
        const now = Date.now();
        const refreshIn = expiryTime - now - 30000;

        if (refreshIn > 0) {
          primaryRefreshRef.current = setTimeout(fetchPrimaryVideo, refreshIn);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError((prev) => ({ ...prev, primary: err.message || 'Kunne ikke laste video' }));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading((prev) => ({ ...prev, primary: false }));
      }
    }
  }, [primaryVideoId]);

  /**
   * Fetch secondary video
   */
  const fetchSecondaryVideo = useCallback(async () => {
    if (!secondaryVideoId) return;

    setLoading((prev) => ({ ...prev, secondary: true }));
    setError((prev) => ({ ...prev, secondary: null }));

    try {
      // Fetch video data
      const video = await videoApi.getVideo(secondaryVideoId);
      if (!isMountedRef.current) return;
      setSecondaryVideo(video);

      // Get playback URL
      const playback = await videoApi.getPlaybackUrl(secondaryVideoId);
      if (!isMountedRef.current) return;
      setSecondaryPlaybackUrl(playback.url);

      // Schedule refresh
      if (playback.expiresAt) {
        const expiryTime = new Date(playback.expiresAt).getTime();
        const now = Date.now();
        const refreshIn = expiryTime - now - 30000;

        if (refreshIn > 0) {
          secondaryRefreshRef.current = setTimeout(fetchSecondaryVideo, refreshIn);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError((prev) => ({ ...prev, secondary: err.message || 'Kunne ikke laste video' }));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading((prev) => ({ ...prev, secondary: false }));
      }
    }
  }, [secondaryVideoId]);

  /**
   * Create a new comparison
   */
  const createComparison = useCallback(async (data) => {
    if (!primaryVideoId || !secondaryVideoId) return null;

    try {
      const comparison = await videoApi.createComparison({
        primaryVideoId,
        comparisonVideoId: secondaryVideoId,
        ...data,
      });
      return comparison;
    } catch (err) {
      throw err;
    }
  }, [primaryVideoId, secondaryVideoId]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      if (primaryVideoId) fetchPrimaryVideo();
      if (secondaryVideoId) fetchSecondaryVideo();
    }
  }, [primaryVideoId, secondaryVideoId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (primaryRefreshRef.current) clearTimeout(primaryRefreshRef.current);
      if (secondaryRefreshRef.current) clearTimeout(secondaryRefreshRef.current);
    };
  }, []);

  return {
    primaryVideo,
    secondaryVideo,
    primaryPlaybackUrl,
    secondaryPlaybackUrl,
    loading,
    error,
    refreshPrimary: fetchPrimaryVideo,
    refreshSecondary: fetchSecondaryVideo,
    createComparison,
  };
}

/**
 * Hook for listing comparisons
 *
 * @param {Object} [options] - Hook options
 * @param {string} [options.videoId] - Filter by video ID
 * @param {boolean} [options.autoFetch=true] - Auto-fetch on mount
 * @returns {Object} Comparisons list and controls
 */
export function useComparisonsList(options = {}) {
  const { videoId, autoFetch = true } = options;

  // State
  const [comparisons, setComparisons] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs
  const isMountedRef = useRef(true);

  /**
   * Fetch comparisons
   */
  const fetchComparisons = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (videoId) {
        result = await videoApi.getVideoComparisons(videoId);
      } else {
        result = await videoApi.listComparisons();
      }

      if (!isMountedRef.current) return;

      setComparisons(result.comparisons || []);
      setTotal(result.total || result.comparisons?.length || 0);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke hente sammenligninger');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [videoId]);

  /**
   * Delete a comparison
   */
  const deleteComparison = useCallback(async (comparisonId) => {
    try {
      await videoApi.deleteComparison(comparisonId);
      if (isMountedRef.current) {
        setComparisons((prev) => prev.filter((c) => c.id !== comparisonId));
        setTotal((prev) => prev - 1);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke slette sammenligning');
      }
      throw err;
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchComparisons();
    }
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    comparisons,
    total,
    loading,
    error,
    refresh: fetchComparisons,
    deleteComparison,
  };
}

export default useComparisonData;
