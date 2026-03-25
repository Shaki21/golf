/**
 * TIER Golf - Player Video Feed
 * Design System v3.0 - Premium Light
 *
 * Feed of all player videos for coach review
 *
 * Features:
 * - List of videos from all players
 * - Filter by player, date, category, review status
 * - Player avatar and name display
 * - Review status indicators
 * - Quick actions (review, annotate, comment)
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles
 * Note: Status badge colors use inline styles for dynamic color values
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { track } from '../../analytics/track';
import Button from '../../ui/primitives/Button';
import { CardTitle } from '../../components/typography';

// Review status options
export const REVIEW_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  REVIEWED: 'reviewed',
  NEEDS_FOLLOWUP: 'needs_followup',
};

// Status labels
const STATUS_LABELS = {
  [REVIEW_STATUS.PENDING]: 'Venter på gjennomgang',
  [REVIEW_STATUS.IN_PROGRESS]: 'Under arbeid',
  [REVIEW_STATUS.REVIEWED]: 'Gjennomgått',
  [REVIEW_STATUS.NEEDS_FOLLOWUP]: 'Trenger oppfølging',
};

// Status colors
const STATUS_COLORS = {
  [REVIEW_STATUS.PENDING]: 'var(--status-warning)',
  [REVIEW_STATUS.IN_PROGRESS]: 'var(--accent)',
  [REVIEW_STATUS.REVIEWED]: 'var(--status-success)',
  [REVIEW_STATUS.NEEDS_FOLLOWUP]: 'var(--status-error)',
};

// Tailwind classes
const tw = {
  container: 'flex flex-col gap-3',
  feedItem: 'flex gap-4 p-4 bg-surface rounded-xl border border-border cursor-pointer transition-all duration-150',
  feedItemHover: 'hover:border-primary hover:-translate-y-0.5',
  feedItemSelected: 'border-primary bg-primary/10',
  checkbox: 'w-5 h-5 mt-1 cursor-pointer accent-primary',
  thumbnailContainer: 'relative w-40 h-[90px] rounded-lg overflow-hidden shrink-0 bg-[rgb(var(--tier-navy-dark))]',
  thumbnail: 'w-full h-full object-cover',
  thumbnailPlaceholder: 'w-full h-full flex items-center justify-center text-[var(--text-tertiary,rgba(255,255,255,0.3))]',
  duration: 'absolute bottom-1 right-1 py-0.5 px-1.5 bg-black/80 rounded-md text-[11px] font-mono text-white',
  statusBadge: 'absolute top-1 left-1 py-0.5 px-1.5 rounded-md text-[10px] font-semibold uppercase tracking-wide',
  content: 'flex-1 flex flex-col gap-2 min-w-0',
  header: 'flex items-start justify-between gap-3',
  titleSection: 'flex-1 min-w-0',
  title: 'm-0 text-[15px] font-semibold text-[var(--text-primary,white)] overflow-hidden text-ellipsis whitespace-nowrap',
  meta: 'flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary,rgba(255,255,255,0.7))]',
  metaDot: 'w-[3px] h-[3px] rounded-full bg-[var(--text-tertiary,rgba(255,255,255,0.3))]',
  playerInfo: 'flex items-center gap-2 no-underline cursor-pointer',
  avatar: 'w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[11px] font-semibold text-white shrink-0',
  playerName: 'text-[13px] font-medium text-[var(--text-primary,white)]',
  annotations: 'flex items-center gap-1 text-xs text-[var(--text-tertiary,rgba(255,255,255,0.5))]',
  actions: 'flex gap-2',
  actionButton: 'py-1.5 px-3 bg-[rgb(var(--tier-navy-dark))] border border-border rounded-lg text-[var(--text-secondary,rgba(255,255,255,0.7))] text-xs font-medium cursor-pointer flex items-center gap-1 transition-all duration-150',
  primaryAction: 'bg-primary border-primary text-white',
  emptyState: 'flex flex-col items-center justify-center p-8 text-center text-[var(--text-tertiary,rgba(255,255,255,0.4))]',
  emptyIcon: 'w-12 h-12 mb-3 opacity-50',
  emptyText: 'text-sm m-0',
  loadingSpinner: 'flex items-center justify-center p-6',
  spinner: 'w-8 h-8 border-[3px] border-border border-t-primary rounded-full animate-spin',
};

// Icons
const VideoIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);

const AnnotateIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const CommentIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlayIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

/**
 * Format duration as MM:SS
 */
function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format relative date
 */
function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} min siden`;
  if (diffHours < 24) return `${diffHours} timer siden`;
  if (diffDays === 1) return 'I går';
  if (diffDays < 7) return `${diffDays} dager siden`;

  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Get player initials
 */
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * PlayerVideoFeed Component
 */
export function PlayerVideoFeed({
  videos = [],
  loading = false,
  selectedVideos = new Set(),
  onVideoSelect,
  onVideoClick,
  onAnnotate,
  onComment,
  onMarkReviewed,
  selectable = false,
  isCoach = true, // Default to coach view for role-safe paths
  style,
  className,
}) {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  // Handle checkbox change
  const handleCheckboxChange = useCallback((e, video) => {
    e.stopPropagation();
    const isSelected = selectedVideos.has(video.id);
    onVideoSelect?.(video, !isSelected);
  }, [selectedVideos, onVideoSelect]);

  // Handle video click
  const handleVideoClick = useCallback((video) => {
    onVideoClick?.(video);
  }, [onVideoClick]);

  // Handle annotate - navigate to video analysis page
  const handleAnnotate = useCallback((e, video) => {
    e.stopPropagation();
    const path = isCoach
      ? `/coach/videos/${video.id}/analyze`
      : `/videos/${video.id}/analyze`;
    track('screen_view', {
      screen: 'VideoAnalysisPage',
      source: 'player_video_feed',
      id: video.id,
      action: 'open_analyzer',
    });
    navigate(path);
  }, [isCoach, navigate]);

  // Handle comment
  const handleComment = useCallback((e, video) => {
    e.stopPropagation();
    onComment?.(video);
  }, [onComment]);

  // Handle mark reviewed
  const handleMarkReviewed = useCallback((e, video) => {
    e.stopPropagation();
    onMarkReviewed?.(video);
  }, [onMarkReviewed]);

  // Loading state
  if (loading) {
    return (
      <div className={tw.loadingSpinner}>
        <div className={tw.spinner} />
      </div>
    );
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className={tw.emptyState}>
        <VideoIcon size={48} />
        <p className={tw.emptyText}>Ingen videoer å vise</p>
      </div>
    );
  }

  return (
    <div className={`${tw.container} ${className || ''}`} style={style}>
      {videos.map((video) => {
        const isSelected = selectedVideos.has(video.id);
        const statusColor = STATUS_COLORS[video.reviewStatus] || STATUS_COLORS[REVIEW_STATUS.PENDING];

        return (
          <div
            key={video.id}
            className={`${tw.feedItem} ${tw.feedItemHover} ${isSelected ? tw.feedItemSelected : ''}`}
            onClick={() => handleVideoClick(video)}
            onMouseEnter={() => setHoveredId(video.id)}
            onMouseLeave={() => setHoveredId(null)}
            role="button"
            tabIndex={0}
          >
            {/* Selection checkbox */}
            {selectable && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleCheckboxChange(e, video)}
                onClick={(e) => e.stopPropagation()}
                className={tw.checkbox}
                aria-label={`Velg ${video.title}`}
              />
            )}

            {/* Thumbnail */}
            <div className={tw.thumbnailContainer}>
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className={tw.thumbnail}
                  loading="lazy"
                />
              ) : (
                <div className={tw.thumbnailPlaceholder}>
                  <VideoIcon size={32} />
                </div>
              )}

              {/* Duration */}
              {video.duration && (
                <span className={tw.duration}>
                  {formatDuration(video.duration)}
                </span>
              )}

              {/* Status badge */}
              {video.reviewStatus && (
                <span
                  className={tw.statusBadge}
                  style={{
                    backgroundColor: video.reviewStatus === REVIEW_STATUS.REVIEWED
                      ? 'rgba(34, 197, 94, 0.9)'
                      : statusColor,
                    color: 'white',
                  }}
                >
                  {video.reviewStatus === REVIEW_STATUS.PENDING ? 'Ny' :
                   video.reviewStatus === REVIEW_STATUS.NEEDS_FOLLOWUP ? '!' :
                   video.reviewStatus === REVIEW_STATUS.REVIEWED ? '✓' : ''}
                </span>
              )}
            </div>

            {/* Content */}
            <div className={tw.content}>
              <div className={tw.header}>
                <div className={tw.titleSection}>
                  <CardTitle className={tw.title}>{video.title}</CardTitle>
                  <div className={tw.meta}>
                    <span>{video.category || 'Ukategorisert'}</span>
                    <span className={tw.metaDot} />
                    <span>{formatRelativeDate(video.createdAt)}</span>
                    {video.annotationCount > 0 && (
                      <>
                        <span className={tw.metaDot} />
                        <span className={tw.annotations}>
                          <AnnotateIcon size={12} />
                          {video.annotationCount}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Player info - clickable link to player profile */}
                <Link
                  to={`/coach/players/${video.playerId}`}
                  className={tw.playerInfo}
                  onClick={(e) => {
                    e.stopPropagation();
                    track('screen_view', {
                      screen: 'CoachPlayerPage',
                      source: 'coach_videos',
                      id: video.playerId,
                      action: 'open',
                    });
                  }}
                >
                  <div className={tw.avatar}>
                    {getInitials(video.playerName)}
                  </div>
                  <span className={tw.playerName}>{video.playerName}</span>
                </Link>
              </div>

              {/* Actions */}
              <div className={tw.actions}>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<PlayIcon />}
                  onClick={(e) => handleAnnotate(e, video)}
                >
                  Analyser
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<CommentIcon />}
                  onClick={(e) => handleComment(e, video)}
                >
                  Kommenter
                </Button>
                {video.reviewStatus !== REVIEW_STATUS.REVIEWED && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<CheckIcon />}
                    onClick={(e) => handleMarkReviewed(e, video)}
                  >
                    Merk gjennomgått
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PlayerVideoFeed;
