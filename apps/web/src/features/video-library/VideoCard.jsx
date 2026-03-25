/**
 * VideoCard Component
 * Displays a video thumbnail with metadata overlay for the video library
 *
 * Features:
 * - Thumbnail preview with duration overlay
 * - Hover state with play icon
 * - Video metadata display (title, category, date)
 * - Selection checkbox for bulk actions
 * - Click to open video player
 */

import React, { useState, useCallback } from 'react';
import { CardTitle } from '../../components/typography';

// Video categories with labels
const CATEGORY_LABELS = {
  swing: 'Full Swing',
  putting: 'Putting',
  short_game: 'Short Game',
  other: 'Annet',
};

// View angle labels
const VIEW_ANGLE_LABELS = {
  face_on: 'Face On',
  down_the_line: 'Down the Line',
  overhead: 'Ovenfra',
  side: 'Side',
};

// Tailwind class compositions
const tw = {
  card: 'relative rounded-xl overflow-hidden bg-surface border border-border cursor-pointer transition-all duration-200',
  cardHover: 'hover:-translate-y-0.5 hover:shadow-tier-white hover:border-primary',
  cardSelected: 'border-primary ring-2 ring-primary',
  thumbnailContainer: 'relative aspect-video bg-[rgb(var(--tier-navy-dark))] overflow-hidden',
  thumbnail: 'w-full h-full object-cover',
  thumbnailPlaceholder: 'w-full h-full flex items-center justify-center bg-[rgb(var(--tier-navy-dark))] text-[var(--video-text-muted)]',
  playOverlay: 'absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200',
  playButton: 'w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[var(--video-shadow-md)]',
  playIcon: 'w-6 h-6 text-white ml-1',
  durationBadge: 'absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 text-white text-xs font-medium font-mono',
  categoryBadge: 'absolute top-2 left-2 px-2 py-1 rounded-md bg-primary text-white text-[11px] font-semibold uppercase tracking-wide',
  checkbox: 'absolute top-2 right-2 w-6 h-6 rounded-md bg-black/60 border-2 border-white/40 flex items-center justify-center cursor-pointer transition-all duration-200 z-10',
  checkboxSelected: 'bg-primary border-primary',
  checkIcon: 'w-3.5 h-3.5 text-white',
  content: 'p-3',
  title: 'm-0 text-sm font-semibold text-[var(--text-inverse)] overflow-hidden text-ellipsis whitespace-nowrap',
  meta: 'flex items-center gap-2 mt-1 text-xs text-[var(--video-text-secondary)]',
  metaDot: 'w-[3px] h-[3px] rounded-full bg-[var(--video-text-muted)]',
  statusBadge: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-black/80 text-white text-xs font-medium flex items-center gap-2',
  processingSpinner: 'w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin',
  reviewedBadge: 'absolute top-2 right-2 px-2 py-1 rounded-md bg-tier-success text-white text-[10px] font-semibold uppercase tracking-wide flex items-center gap-1 z-[5]',
};

// Play icon SVG
const PlayIcon = () => (
  <svg className={tw.playIcon} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

// Check icon SVG
const CheckIcon = () => (
  <svg className={tw.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Video icon SVG (placeholder)
const VideoIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);

/**
 * Format duration in seconds to MM:SS
 */
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'I dag';
  if (diffDays === 1) return 'I går';
  if (diffDays < 7) return `${diffDays} dager siden`;

  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * VideoCard Component
 */
export function VideoCard({
  video,
  selected = false,
  selectable = false,
  onSelect,
  onClick,
  style = {},
  className = '',
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback((e) => {
    // If clicking checkbox area, don't trigger card click
    if (e.target.closest('[data-checkbox]')) return;
    onClick?.(video);
  }, [video, onClick]);

  const handleCheckboxClick = useCallback((e) => {
    e.stopPropagation();
    onSelect?.(video, !selected);
  }, [video, selected, onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(video);
    }
  }, [video, onClick]);

  const isProcessing = video.status === 'processing';
  const isFailed = video.status === 'failed';
  const isReviewed = video.status === 'reviewed';

  // Build card classes
  const cardClasses = [
    tw.card,
    tw.cardHover,
    selected && tw.cardSelected,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`Åpne video: ${video.title}`}
    >
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
            <VideoIcon />
          </div>
        )}

        {/* Play overlay on hover */}
        {!isProcessing && !isFailed && (
          <div className={`${tw.playOverlay} ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className={tw.playButton}>
              <PlayIcon />
            </div>
          </div>
        )}

        {/* Processing status */}
        {isProcessing && (
          <div className={tw.statusBadge}>
            <div className={tw.processingSpinner} />
            <span>Behandler...</span>
          </div>
        )}

        {/* Failed status */}
        {isFailed && (
          <div className={`${tw.statusBadge} bg-red-500/90`}>
            <span>Feilet</span>
          </div>
        )}

        {/* Category badge */}
        {video.category && !isProcessing && !isFailed && (
          <div className={tw.categoryBadge}>
            {CATEGORY_LABELS[video.category] || video.category}
          </div>
        )}

        {/* Duration badge */}
        {video.duration && !isProcessing && !isFailed && (
          <div className={tw.durationBadge}>
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Reviewed badge */}
        {isReviewed && !selectable && (
          <div className={tw.reviewedBadge}>
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Gjennomgått
          </div>
        )}

        {/* Selection checkbox */}
        {selectable && (
          <div
            data-checkbox
            className={`${tw.checkbox} ${selected ? tw.checkboxSelected : ''}`}
            onClick={handleCheckboxClick}
            role="checkbox"
            aria-checked={selected}
            aria-label={`Velg video: ${video.title}`}
          >
            {selected && <CheckIcon />}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={tw.content}>
        <CardTitle className={tw.title} title={video.title}>
          {video.title}
        </CardTitle>
        <div className={tw.meta}>
          {video.viewAngle && (
            <>
              <span>{VIEW_ANGLE_LABELS[video.viewAngle] || video.viewAngle}</span>
              <span className={tw.metaDot} />
            </>
          )}
          <span>{formatDate(video.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
