/**
 * VideoLibrary Component
 * Main video library page with grid/list view, filtering, and bulk actions
 *
 * Features:
 * - Grid and list view modes
 * - Filter by category, player, search
 * - Sort by date, title, duration
 * - Bulk selection for comparison/deletion
 * - Empty state and loading states
 * - Pagination/infinite scroll
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * (except dynamic border color which requires runtime value)
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { VideoCard } from './VideoCard';
import { VideoFilters, VIEW_MODES, SORT_OPTIONS } from './VideoFilters';
import { useVideos } from '../../hooks/useVideos';
import * as videoApi from '../../services/videoApi';
import StateCard from '../../ui/composites/StateCard';
import Modal from '../../ui/composites/Modal.composite';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { Upload, RefreshCw, Video, BarChart2, Trash2 } from 'lucide-react';
import { SubSectionTitle } from "../../ui/components/typography";

// ============================================================================
// TYPES
// ============================================================================

interface VideoItem {
  id: string;
  title: string;
  category?: string;
  viewAngle?: string;
  duration?: number;
  status?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

interface VideoLibraryProps {
  playerId?: string;
  showPlayerFilter?: boolean;
  players?: Array<{ id: string; name: string }>;
  onVideoClick?: (video: VideoItem) => void;
  onUploadClick?: () => void;
  onCompareClick?: (video1: VideoItem, video2: VideoItem) => void;
  style?: React.CSSProperties;
  className?: string;
}

// ============================================================================
// DEMO DATA
// ============================================================================

const DEMO_VIDEOS: VideoItem[] = [
  {
    id: '1',
    title: 'Driver Swing - September',
    category: 'swing',
    viewAngle: 'face_on',
    duration: 45,
    status: 'ready',
    thumbnailUrl: undefined,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Putting Drill',
    category: 'putting',
    viewAngle: 'down_the_line',
    duration: 120,
    status: 'ready',
    thumbnailUrl: undefined,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: '7-iron approach',
    category: 'swing',
    viewAngle: 'face_on',
    duration: 30,
    status: 'processing',
    thumbnailUrl: undefined,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Bunker Shot Teknikk',
    category: 'short_game',
    viewAngle: 'side',
    duration: 90,
    status: 'ready',
    thumbnailUrl: undefined,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Chip and Run',
    category: 'short_game',
    viewAngle: 'down_the_line',
    duration: 60,
    status: 'ready',
    thumbnailUrl: undefined,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VideoLibrary({
  playerId,
  showPlayerFilter = false,
  players = [],
  onVideoClick,
  onUploadClick,
  onCompareClick,
  style,
  className,
}: VideoLibraryProps) {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Filter state
  const [filters, setFilters] = useState<{
    sortBy: string;
    sortOrder: string;
    playerId?: string;
    category?: string;
    status?: string;
  }>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [loadingMore, setLoadingMore] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if user is coach
  const isCoach = user?.role === 'coach' || user?.role === 'admin';

  // Use the videos hook
  const {
    videos,
    total,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    removeVideoFromList,
  } = useVideos({
    playerId: filters.playerId || playerId,
    category: filters.category,
    status: filters.status || '',
    sortBy: filters.sortBy || 'createdAt',
    sortOrder: filters.sortOrder || 'desc',
  });

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setSelectedVideos(new Set());
  }, []);

  // Handle video selection
  const handleVideoSelect = useCallback((video: VideoItem, selected: boolean) => {
    setSelectedVideos((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(video.id);
      } else {
        next.delete(video.id);
      }
      return next;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos.map((v: VideoItem) => v.id)));
    }
  }, [videos, selectedVideos.size]);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedVideos(new Set());
  }, []);

  // Handle compare selected
  const handleCompareSelected = useCallback(() => {
    const selectedArray = videos.filter((v: VideoItem) => selectedVideos.has(v.id));
    if (selectedArray.length >= 2) {
      onCompareClick?.(selectedArray[0], selectedArray[1]);
    }
  }, [videos, selectedVideos, onCompareClick]);

  // Handle delete selected
  const handleDeleteSelected = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  // Confirm and execute deletion
  const handleConfirmDelete = useCallback(async () => {
    setShowDeleteConfirm(false);
    try {
      for (const videoId of selectedVideos) {
        await videoApi.deleteVideo(videoId);
        removeVideoFromList(videoId);
      }
      setSelectedVideos(new Set());
      showNotification('Videos deleted', 'success');
    } catch (err) {
      console.error('Failed to delete videos:', err);
      showNotification('Could not delete videos', 'error');
    }
  }, [selectedVideos, removeVideoFromList, showNotification]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      loadMore().finally(() => setLoadingMore(false));
    }
  }, [loadingMore, hasMore, loadMore]);

  // Memoize selection state
  const selectionEnabled = selectedVideos.size > 0 || viewMode === VIEW_MODES.GRID;

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {videos.map((video: VideoItem) => (
        <VideoCard
          key={video.id}
          video={video}
          selected={selectedVideos.has(video.id)}
          selectable={selectionEnabled}
          onSelect={handleVideoSelect}
          onClick={onVideoClick}
        />
      ))}
    </div>
  );

  // Render list view
  const renderListView = () => (
    <div className="flex flex-col gap-3">
      {videos.map((video: VideoItem) => (
        <div
          key={video.id}
          className={`flex gap-4 p-3 bg-tier-white rounded-xl cursor-pointer transition-colors border ${
            selectedVideos.has(video.id)
              ? 'border-tier-navy'
              : 'border-tier-border-default hover:border-tier-navy/50'
          }`}
          onClick={() => onVideoClick?.(video)}
          role="button"
          tabIndex={0}
        >
          {/* Thumbnail */}
          <div className="w-[160px] h-[90px] rounded-lg overflow-hidden flex-shrink-0 bg-tier-surface-base">
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-tier-text-tertiary">
                <Video size={32} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <SubSectionTitle className="m-0 text-base font-semibold text-tier-navy overflow-hidden text-ellipsis whitespace-nowrap">
              {video.title}
            </SubSectionTitle>
            <div className="flex flex-wrap gap-3 mt-1 text-[13px] text-tier-text-secondary">
              {video.category && <span>{video.category}</span>}
              {video.viewAngle && <span>{video.viewAngle}</span>}
              {video.duration && (
                <span>
                  {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                </span>
              )}
              <span>
                {new Date(video.createdAt).toLocaleDateString('nb-NO', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedVideos.has(video.id)}
              onChange={(e) => {
                e.stopPropagation();
                handleVideoSelect(video, e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${video.title}`}
              className="w-5 h-5 accent-ak-primary"
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`flex flex-col gap-4 p-4 ${className || ''}`} style={style}>
      {/* Header */}
      <PageHeader
        title="Video Library"
        subtitle="View and analyze your swing videos"
        helpText="Collection of all your uploaded training videos. Organize, search and analyze videos to see your progress over time."
        actions={
          <Button onClick={onUploadClick} leftIcon={<Upload size={18} />}>
            Upload video
          </Button>
        }
        divider={false}
      />

      {/* Filters */}
      <VideoFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        players={players as unknown as never[]}
        showPlayerFilter={showPlayerFilter && isCoach}
        resultCount={loading ? undefined : videos.length}
        style={undefined}
        className={undefined}
      />

      {/* Bulk actions bar */}
      {selectedVideos.size > 0 && (
        <div className="flex items-center gap-4 px-4 py-3 bg-tier-navy rounded-xl text-white">
          <span className="text-sm font-semibold">
            {selectedVideos.size} selected
          </span>
          <div className="flex gap-2 ml-auto">
            {selectedVideos.size >= 2 && onCompareClick && (
              <button
                className="flex items-center gap-1 px-3 py-1.5 bg-white/20 text-white border-none rounded-lg text-[13px] font-medium cursor-pointer hover:bg-white/30"
                onClick={handleCompareSelected}
              >
                <BarChart2 size={16} />
                Compare
              </button>
            )}
            <button
              className="flex items-center gap-1 px-3 py-1.5 bg-tier-error/80 text-white border-none rounded-lg text-[13px] font-medium cursor-pointer hover:bg-tier-error"
              onClick={handleDeleteSelected}
            >
              <Trash2 size={16} />
              Delete
            </button>
            <button
              className="px-3 py-1.5 bg-transparent text-white border border-white/30 rounded-lg text-[13px] cursor-pointer hover:bg-white/10"
              onClick={handleClearSelection}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-10 h-10 border-[3px] border-tier-border-default border-t-tier-navy rounded-full animate-spin" />
        </div>
      ) : error ? (
        <StateCard
          variant="error"
          title="Could not load videos"
          description="Check your network connection and try again."
          action={
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={refresh}
            >
              Try again
            </Button>
          }
        />
      ) : videos.length === 0 ? (
        <StateCard
          variant="empty"
          title="No videos yet"
          description="Upload your first video to start analyzing your swing."
          action={
            <Button leftIcon={<Upload size={16} />} onClick={onUploadClick}>
              Upload video
            </Button>
          }
        />
      ) : (
        <>
          {viewMode === VIEW_MODES.GRID ? renderGridView() : renderListView()}

          {/* Load more */}
          {hasMore && (
            <Button
              variant="secondary"
              fullWidth
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading...' : 'Load more videos'}
            </Button>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete videos"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete {selectedVideos.size} {selectedVideos.size === 1 ? 'video' : 'videos'}
            </Button>
          </>
        }
      >
        <p className="m-0 text-tier-text-secondary">
          Are you sure you want to delete {selectedVideos.size} {selectedVideos.size === 1 ? 'video' : 'videos'}?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default VideoLibrary;
