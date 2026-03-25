/**
 * useVideos Hook
 * Hook for fetching and managing video lists
 *
 * Features:
 * - Fetch videos with filters and pagination
 * - Get single video with playback URL
 * - Update and delete videos
 * - Automatic refetching
 * - Loading and error states
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as videoApi from '../services/videoApi';

/**
 * Hook for listing videos with filters
 *
 * @param {Object} options - Hook options
 * @param {string} [options.playerId] - Filter by player ID
 * @param {string} [options.category] - Filter by category
 * @param {string} [options.status] - Filter by status
 * @param {number} [options.limit=20] - Results per page
 * @param {string} [options.sortBy='createdAt'] - Sort field
 * @param {string} [options.sortOrder='desc'] - Sort direction
 * @param {boolean} [options.autoFetch=true] - Auto-fetch on mount
 * @returns {Object} Videos state and controls
 */
export function useVideos(options = {}) {
  const {
    playerId,
    category,
    status, // Empty string or undefined means all statuses
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    autoFetch = true,
  } = options;

  // State
  const [videos, setVideos] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Refs
  const isMountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  /**
   * Fetch videos from API
   */
  const fetchVideos = useCallback(async (reset = false) => {
    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    const currentOffset = reset ? 0 : offset;

    try {
      const result = await videoApi.listVideos({
        playerId,
        category,
        status: status || undefined, // Don't send empty string, let API return all
        limit,
        offset: currentOffset,
        sortBy,
        sortOrder,
      });

      // Check if this is still the current fetch
      if (fetchId !== fetchIdRef.current || !isMountedRef.current) {
        return;
      }

      if (reset) {
        setVideos(result.videos);
        setOffset(limit);
      } else {
        setVideos((prev) => [...prev, ...result.videos]);
        setOffset(currentOffset + limit);
      }

      setTotal(result.total);
      setHasMore(result.videos.length === limit);
    } catch (err) {
      if (fetchId === fetchIdRef.current && isMountedRef.current) {
        setError(err.message || 'Kunne ikke hente videoer');
      }
    } finally {
      if (fetchId === fetchIdRef.current && isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [playerId, category, status, limit, offset, sortBy, sortOrder]);

  /**
   * Load more videos (pagination)
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchVideos(false);
    }
  }, [loading, hasMore, fetchVideos]);

  /**
   * Refresh video list
   */
  const refresh = useCallback(() => {
    setOffset(0);
    fetchVideos(true);
  }, [fetchVideos]);

  /**
   * Update a video in the list
   */
  const updateVideoInList = useCallback((videoId, updates) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, ...updates } : v))
    );
  }, []);

  /**
   * Remove a video from the list
   */
  const removeVideoFromList = useCallback((videoId) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    setTotal((prev) => prev - 1);
  }, []);

  /**
   * Add a video to the beginning of the list
   */
  const addVideoToList = useCallback((video) => {
    setVideos((prev) => [video, ...prev]);
    setTotal((prev) => prev + 1);
  }, []);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      setOffset(0);
      fetchVideos(true);
    }
  }, [playerId, category, status, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    videos,
    total,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    updateVideoInList,
    removeVideoFromList,
    addVideoToList,
  };
}

/**
 * Hook for fetching a single video with playback URL
 *
 * @param {string} videoId - Video ID
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.autoFetch=true] - Auto-fetch on mount
 * @param {boolean} [options.includePlaybackUrl=true] - Include playback URL
 * @returns {Object} Video state and controls
 */
export function useVideo(videoId, options = {}) {
  const {
    autoFetch = true,
    includePlaybackUrl = true,
  } = options;

  // State
  const [video, setVideo] = useState(null);
  const [playbackUrl, setPlaybackUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs
  const isMountedRef = useRef(true);

  /**
   * Fetch video from API
   */
  const fetchVideo = useCallback(async () => {
    if (!videoId) return;

    setLoading(true);
    setError(null);

    try {
      const [videoData, playbackData] = await Promise.all([
        videoApi.getVideo(videoId),
        includePlaybackUrl ? videoApi.getPlaybackUrl(videoId) : null,
      ]);

      if (!isMountedRef.current) return;

      setVideo(videoData);
      if (playbackData) {
        setPlaybackUrl(playbackData.url);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke hente video');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [videoId, includePlaybackUrl]);

  /**
   * Refresh playback URL (for when it expires)
   */
  const refreshPlaybackUrl = useCallback(async () => {
    if (!videoId) return;

    try {
      const playbackData = await videoApi.getPlaybackUrl(videoId);
      if (isMountedRef.current) {
        setPlaybackUrl(playbackData.url);
      }
      return playbackData.url;
    } catch (err) {
      console.error('Failed to refresh playback URL:', err);
      return null;
    }
  }, [videoId]);

  /**
   * Update video metadata
   */
  const updateVideo = useCallback(async (updates) => {
    if (!videoId) return;

    try {
      await videoApi.updateVideo(videoId, updates);
      if (isMountedRef.current) {
        setVideo((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } catch (err) {
      throw new Error(err.message || 'Kunne ikke oppdatere video');
    }
  }, [videoId]);

  /**
   * Delete video
   */
  const deleteVideo = useCallback(async (hardDelete = false) => {
    if (!videoId) return;

    try {
      await videoApi.deleteVideo(videoId, hardDelete);
      if (isMountedRef.current) {
        setVideo(null);
      }
    } catch (err) {
      throw new Error(err.message || 'Kunne ikke slette video');
    }
  }, [videoId]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && videoId) {
      fetchVideo();
    }
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    video,
    playbackUrl,
    loading,
    error,
    refresh: fetchVideo,
    refreshPlaybackUrl,
    updateVideo,
    deleteVideo,
  };
}

/**
 * Hook for video playback URL management
 * Handles automatic refresh when URL expires
 *
 * @param {string} videoId - Video ID
 * @param {number} [refreshBuffer=30] - Seconds before expiry to refresh
 * @returns {Object} Playback URL state
 */
export function useVideoPlayback(videoId, refreshBuffer = 30) {
  const [url, setUrl] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * Fetch playback URL
   */
  const fetchUrl = useCallback(async () => {
    if (!videoId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await videoApi.getPlaybackUrl(videoId, 300); // 5 minutes

      if (!isMountedRef.current) return;

      setUrl(data.url);
      setExpiresAt(new Date(data.expiresAt));

      // Schedule refresh before expiry
      const expiryTime = new Date(data.expiresAt).getTime();
      const now = Date.now();
      const refreshIn = expiryTime - now - (refreshBuffer * 1000);

      if (refreshIn > 0) {
        refreshTimeoutRef.current = setTimeout(() => {
          fetchUrl();
        }, refreshIn);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'Kunne ikke hente avspillings-URL');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [videoId, refreshBuffer]);

  // Fetch on mount and when videoId changes
  useEffect(() => {
    if (videoId) {
      fetchUrl();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    url,
    expiresAt,
    loading,
    error,
    refresh: fetchUrl,
  };
}

export default useVideos;
