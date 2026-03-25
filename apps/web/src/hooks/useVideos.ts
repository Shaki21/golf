/**
 * useVideos Hook
 * Manages video library - listing, uploading, sharing, and playback
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { videosAPI, Video, VideoRequest } from '../services/api';

interface VideoFilters {
  playerId?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  offset?: number;
}

interface UseVideosOptions extends VideoFilters {
  autoFetch?: boolean;
}

interface UseVideosReturn {
  videos: Video[];
  total: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchVideos: (filters?: VideoFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  removeVideoFromList: (id: string) => void;
  getVideo: (id: string) => Promise<Video | null>;
  getPlaybackUrl: (id: string) => Promise<string | null>;
  deleteVideo: (id: string) => Promise<boolean>;
  shareVideo: (id: string, playerIds: string[]) => Promise<boolean>;
  // Video requests
  videoRequests: VideoRequest[];
  fetchRequests: (filters?: { playerId?: string; status?: string }) => Promise<void>;
  createRequest: (data: { playerId: string; drillType?: string; category?: string; instructions?: string }) => Promise<VideoRequest | null>;
}

export function useVideos(options: UseVideosOptions = {}): UseVideosReturn {
  const [videos, setVideos] = useState<Video[]>([]);
  const [total, setTotal] = useState(0);
  const [videoRequests, setVideoRequests] = useState<VideoRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const filtersRef = useRef<VideoFilters>(options);
  const limit = options.limit || 20;

  const hasMore = videos.length < total;

  const fetchVideos = useCallback(async (filters: VideoFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const mergedFilters = { ...filtersRef.current, ...filters, offset: 0 };
      filtersRef.current = mergedFilters;
      const response = await videosAPI.list(mergedFilters);
      if (response.data?.data) {
        setVideos(response.data.data.videos || []);
        setTotal(response.data.data.total || 0);
        setOffset(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente videoer');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newOffset = offset + limit;
      const response = await videosAPI.list({ ...filtersRef.current, offset: newOffset, limit });
      if (response.data?.data) {
        setVideos(prev => [...prev, ...(response.data.data.videos || [])]);
        setOffset(newOffset);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke laste flere videoer');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset, limit]);

  const refresh = useCallback(async () => {
    await fetchVideos(filtersRef.current);
  }, [fetchVideos]);

  const removeVideoFromList = useCallback((id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    setTotal(prev => Math.max(0, prev - 1));
  }, []);

  const getVideo = useCallback(async (id: string): Promise<Video | null> => {
    try {
      const response = await videosAPI.getById(id);
      if (response.data?.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente video');
      return null;
    }
  }, []);

  const getPlaybackUrl = useCallback(async (id: string): Promise<string | null> => {
    try {
      const response = await videosAPI.getPlaybackUrl(id);
      if (response.data?.data) {
        return response.data.data.url;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente avspillings-URL');
      return null;
    }
  }, []);

  const deleteVideo = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await videosAPI.delete(id);
      if (response.data?.data) {
        removeVideoFromList(id);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke slette video');
      return false;
    }
  }, [removeVideoFromList]);

  const shareVideo = useCallback(async (id: string, playerIds: string[]): Promise<boolean> => {
    try {
      const response = await videosAPI.share(id, playerIds);
      return !!response.data?.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke dele video');
      return false;
    }
  }, []);

  const fetchRequests = useCallback(async (filters: { playerId?: string; status?: string } = {}) => {
    try {
      const response = await videosAPI.listRequests(filters);
      if (response.data?.data) {
        setVideoRequests(response.data.data.requests || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke hente videoforespørsler');
    }
  }, []);

  const createRequest = useCallback(async (data: { playerId: string; drillType?: string; category?: string; instructions?: string }): Promise<VideoRequest | null> => {
    try {
      const response = await videosAPI.createRequest(data);
      if (response.data?.data) {
        const newRequest = response.data.data;
        setVideoRequests(prev => [newRequest, ...prev]);
        return newRequest;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke opprette videoforespørsel');
      return null;
    }
  }, []);

  // Auto-fetch on mount if autoFetch is true or if filters are provided
  useEffect(() => {
    if (options.autoFetch !== false && (options.playerId || options.category)) {
      fetchVideos(options);
    }
  }, [options.playerId, options.category, options.status, options.sortBy, options.sortOrder]);

  return {
    videos,
    total,
    loading,
    error,
    hasMore,
    fetchVideos,
    loadMore,
    refresh,
    removeVideoFromList,
    getVideo,
    getPlaybackUrl,
    deleteVideo,
    shareVideo,
    videoRequests,
    fetchRequests,
    createRequest,
  };
}

export default useVideos;
