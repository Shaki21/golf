/**
 * PendingReviewQueue Component
 * Compact queue of videos awaiting coach review
 *
 * Features:
 * - Horizontal scrollable queue
 * - Quick preview thumbnails
 * - Player name and upload time
 * - Priority indicators
 * - Quick action to start review
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * (except dynamic priority colors which require runtime values)
 */

import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Play, CheckCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { REVIEW_STATUS } from './PlayerVideoFeed';
import { track } from '../../analytics/track';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle } from "../../ui/components/typography";

// ============================================================================
// TYPES
// ============================================================================

interface VideoItem {
  id: string;
  title?: string;
  thumbnailUrl?: string;
  duration?: number;
  createdAt?: string;
  playerName?: string;
  reviewStatus?: string;
}

interface PendingReviewQueueProps {
  videos?: VideoItem[];
  onVideoClick?: (video: VideoItem) => void;
  onViewAll?: () => void;
  maxVisible?: number;
  style?: React.CSSProperties;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format duration as MM:SS
 */
function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}t`;
  return `${Math.floor(diffHours / 24)}d`;
}

/**
 * Get priority color based on wait time
 */
function getPriorityColor(dateString?: string): string {
  if (!dateString) return 'var(--status-success)';
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffHours > 48) return 'var(--status-error)'; // Red - urgent
  if (diffHours > 24) return 'var(--status-warning)'; // Yellow - attention
  return 'var(--status-success)'; // Green - ok
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PendingReviewQueue({
  videos = [],
  onVideoClick,
  onViewAll,
  maxVisible = 8,
  style,
  className,
}: PendingReviewQueueProps) {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter to only pending videos
  const pendingVideos = videos.filter(
    (v) => v.reviewStatus === REVIEW_STATUS.PENDING || v.reviewStatus === REVIEW_STATUS.NEEDS_FOLLOWUP
  );

  // Limit visible items
  const visibleVideos = pendingVideos.slice(0, maxVisible);

  // Handle scroll
  const handleScroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 160;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  // Handle video click - navigate to analyzer
  const handleVideoClick = useCallback((video: VideoItem) => {
    track('screen_view', {
      screen: 'VideoAnalysisPage',
      source: 'pending_review_queue',
      id: video.id,
      action: 'open_analyzer',
    });
    navigate(`/coach/videos/${video.id}/analyze`);
    onVideoClick?.(video);
  }, [navigate, onVideoClick]);

  // Empty state
  if (pendingVideos.length === 0) {
    return (
      <div className={`flex flex-col gap-3 p-4 bg-tier-white rounded-xl border border-tier-border-default ${className || ''}`} style={style}>
        <div className="flex items-center justify-between gap-3">
          <SubSectionTitle className="m-0 text-base font-semibold text-tier-navy flex items-center gap-2">
            <Clock size={16} />
            Venter på gjennomgang
          </SubSectionTitle>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <CheckCircle size={40} className="text-tier-success mb-2" />
          <p className="text-[13px] text-tier-text-secondary m-0">
            Alle videoer er gjennomgått!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 p-4 bg-tier-white rounded-xl border border-tier-border-default ${className || ''}`} style={style}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <SubSectionTitle className="m-0 text-base font-semibold text-tier-navy flex items-center gap-2">
          <Clock size={16} />
          Venter på gjennomgang
          <span className="px-2 py-0.5 bg-tier-warning rounded-full text-xs font-bold text-tier-navy">
            {pendingVideos.length}
          </span>
        </SubSectionTitle>
        {pendingVideos.length > maxVisible && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            Se alle
          </Button>
        )}
      </div>

      {/* Scroll wrapper */}
      <div className="relative">
        {/* Scroll buttons */}
        {visibleVideos.length > 4 && (
          <>
            <button
              className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 rounded-full bg-tier-white border border-tier-border-default text-tier-navy cursor-pointer flex items-center justify-center z-10 shadow-lg"
              onClick={() => handleScroll('left')}
              aria-label="Scroll venstre"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 rounded-full bg-tier-white border border-tier-border-default text-tier-navy cursor-pointer flex items-center justify-center z-10 shadow-lg"
              onClick={() => handleScroll('right')}
              aria-label="Scroll høyre"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Queue items */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-tier-border-default"
        >
          {visibleVideos.map((video) => {
            const isHovered = hoveredId === video.id;
            const priorityColor = getPriorityColor(video.createdAt);

            return (
              <div
                key={video.id}
                className={`flex-none w-[140px] flex flex-col gap-2 cursor-pointer transition-transform ${isHovered ? '-translate-y-0.5' : ''}`}
                onClick={() => handleVideoClick(video)}
                onMouseEnter={() => setHoveredId(video.id)}
                onMouseLeave={() => setHoveredId(null)}
                role="button"
                tabIndex={0}
              >
                {/* Thumbnail */}
                <div className="relative w-[140px] h-20 rounded-lg overflow-hidden bg-tier-surface-base">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-tier-text-tertiary">
                      <Video size={24} />
                    </div>
                  )}

                  {/* Play overlay */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-tier-navy flex items-center justify-center text-white">
                      <Play size={16} />
                    </div>
                  </div>

                  {/* Duration */}
                  {video.duration && (
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 rounded text-[10px] font-mono text-white">
                      {formatDuration(video.duration)}
                    </span>
                  )}

                  {/* Priority indicator */}
                  <div
                    className="absolute top-1 left-1 w-2 h-2 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: priorityColor }}
                    title={`Ventet: ${formatRelativeTime(video.createdAt)}`}
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-tier-navy truncate">
                    {video.playerName}
                  </span>
                  <span className="text-[11px] text-tier-text-tertiary">
                    {formatRelativeTime(video.createdAt)} siden
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PendingReviewQueue;
