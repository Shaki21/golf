/**
 * ReferenceVideoCard Component
 * Card for displaying reference/demo videos in the library
 *
 * Features:
 * - Thumbnail with play overlay
 * - Category and type badges
 * - Share with players action
 * - Edit/delete options for owners
 * - View count and usage stats
 */

import React, { useState, useCallback } from 'react';
import { CardTitle } from '../../components/typography';

// Reference video types
export const REFERENCE_TYPES = {
  COACH_DEMO: 'coach_demo',
  PRO_REFERENCE: 'pro_reference',
  DRILL_INSTRUCTION: 'drill_instruction',
  TECHNIQUE_BREAKDOWN: 'technique_breakdown',
};

// Type labels
const TYPE_LABELS = {
  [REFERENCE_TYPES.COACH_DEMO]: 'Coach Demo',
  [REFERENCE_TYPES.PRO_REFERENCE]: 'Pro Referanse',
  [REFERENCE_TYPES.DRILL_INSTRUCTION]: 'Øvelse',
  [REFERENCE_TYPES.TECHNIQUE_BREAKDOWN]: 'Teknikk',
};

// Type colors
const TYPE_COLORS = {
  [REFERENCE_TYPES.COACH_DEMO]: 'var(--accent)',
  [REFERENCE_TYPES.PRO_REFERENCE]: 'var(--status-warning)',
  [REFERENCE_TYPES.DRILL_INSTRUCTION]: 'var(--status-success)',
  [REFERENCE_TYPES.TECHNIQUE_BREAKDOWN]: 'var(--info)',
};

// Tailwind classes
const tw = {
  card: 'relative flex flex-col bg-surface rounded-xl border border-border overflow-hidden cursor-pointer transition-all duration-200',
  cardHover: 'hover:-translate-y-0.5 hover:border-primary hover:shadow-lg',
  thumbnailContainer: 'relative aspect-video bg-[rgb(var(--tier-navy-dark))] overflow-hidden',
  thumbnail: 'w-full h-full object-cover',
  thumbnailPlaceholder: 'w-full h-full flex items-center justify-center text-[var(--text-tertiary,rgba(255,255,255,0.3))]',
  playOverlay: 'absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200',
  playOverlayVisible: 'opacity-100',
  playButton: 'w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg',
  playIcon: 'w-6 h-6 text-white ml-1',
  typeBadge: 'absolute top-2 left-2 py-1 px-2 rounded-md text-[10px] font-bold uppercase tracking-wide text-white',
  duration: 'absolute bottom-2 right-2 py-0.5 px-1.5 bg-black/80 rounded-md text-[11px] font-mono text-white',
  menuButton: 'absolute top-2 right-2 w-7 h-7 rounded-md bg-black/60 border-none text-white cursor-pointer flex items-center justify-center opacity-0 transition-opacity duration-200',
  menuButtonVisible: 'opacity-100',
  content: 'p-3 flex flex-col gap-2',
  title: 'm-0 text-sm font-semibold text-[var(--text-primary,white)] overflow-hidden text-ellipsis whitespace-nowrap',
  description: 'm-0 text-xs text-[var(--text-secondary,rgba(255,255,255,0.7))] overflow-hidden text-ellipsis line-clamp-2 leading-snug',
  meta: 'flex items-center justify-between mt-auto',
  category: 'text-[11px] text-[var(--text-tertiary,rgba(255,255,255,0.5))] uppercase tracking-wide',
  stats: 'flex items-center gap-2 text-[11px] text-[var(--text-tertiary,rgba(255,255,255,0.5))]',
  statItem: 'flex items-center gap-1',
  actions: 'flex gap-2 pt-2 border-t border-border',
  actionButton: 'flex-1 py-2 px-3 bg-[rgb(var(--tier-navy-dark))] border border-border rounded-lg text-[var(--text-secondary,rgba(255,255,255,0.7))] text-xs font-medium cursor-pointer flex items-center justify-center gap-1 transition-all duration-150',
  shareButton: 'bg-primary border-primary text-white',
  dropdown: 'absolute top-10 right-2 min-w-[140px] bg-surface rounded-lg border border-border shadow-xl z-[100] overflow-hidden',
  dropdownItem: 'flex items-center gap-2 w-full py-2.5 px-3 bg-transparent border-none text-[var(--text-secondary,rgba(255,255,255,0.7))] text-[13px] cursor-pointer text-left transition-colors duration-150 hover:bg-[rgb(var(--tier-navy-dark))]',
  dropdownItemDanger: 'text-tier-error',
};

// Icons
const VideoIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);

const PlayIcon = () => (
  <svg className={tw.playIcon} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const MoreIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

const ShareIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const EyeIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const UsersIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const EditIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CompareIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="8" height="16" rx="1" />
    <rect x="14" y="4" width="8" height="16" rx="1" />
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
 * ReferenceVideoCard Component
 */
export function ReferenceVideoCard({
  video,
  isOwner = false,
  showActions = true,
  onPlay,
  onShare,
  onCompare,
  onEdit,
  onDelete,
  style,
  className,
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const typeColor = TYPE_COLORS[video.type] || TYPE_COLORS[REFERENCE_TYPES.COACH_DEMO];
  const typeLabel = TYPE_LABELS[video.type] || 'Video';

  // Handle card click
  const handleClick = useCallback(() => {
    onPlay?.(video);
  }, [video, onPlay]);

  // Handle share click
  const handleShare = useCallback((e) => {
    e.stopPropagation();
    onShare?.(video);
  }, [video, onShare]);

  // Handle compare click
  const handleCompare = useCallback((e) => {
    e.stopPropagation();
    onCompare?.(video);
  }, [video, onCompare]);

  // Handle menu toggle
  const handleMenuToggle = useCallback((e) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  }, []);

  // Handle edit
  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(video);
  }, [video, onEdit]);

  // Handle delete - parent component handles confirmation
  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(video);
  }, [video, onDelete]);

  return (
    <div
      className={`${tw.card} ${tw.cardHover} ${className || ''}`}
      style={style}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
      role="button"
      tabIndex={0}
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

        {/* Play overlay */}
        <div className={`${tw.playOverlay} ${isHovered ? tw.playOverlayVisible : ''}`}>
          <div className={tw.playButton}>
            <PlayIcon />
          </div>
        </div>

        {/* Type badge */}
        <div className={tw.typeBadge} style={{ backgroundColor: typeColor }}>
          {typeLabel}
        </div>

        {/* Duration */}
        {video.duration && (
          <span className={tw.duration}>
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Menu button (owner only) */}
        {isOwner && (
          <button
            className={`${tw.menuButton} ${isHovered ? tw.menuButtonVisible : ''}`}
            onClick={handleMenuToggle}
            aria-label="Meny"
          >
            <MoreIcon />
          </button>
        )}

        {/* Dropdown menu */}
        {showMenu && (
          <div className={tw.dropdown}>
            <button className={tw.dropdownItem} onClick={handleEdit}>
              <EditIcon />
              Rediger
            </button>
            <button
              className={`${tw.dropdownItem} ${tw.dropdownItemDanger}`}
              onClick={handleDelete}
            >
              <TrashIcon />
              Slett
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={tw.content}>
        <CardTitle className={tw.title}>{video.title}</CardTitle>

        {video.description && (
          <p className={tw.description}>{video.description}</p>
        )}

        <div className={tw.meta}>
          <span className={tw.category}>{video.category}</span>
          <div className={tw.stats}>
            {video.viewCount !== undefined && (
              <span className={tw.statItem}>
                <EyeIcon />
                {video.viewCount}
              </span>
            )}
            {video.sharedWith !== undefined && (
              <span className={tw.statItem}>
                <UsersIcon />
                {video.sharedWith}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className={tw.actions}>
            <button
              className={`${tw.actionButton} ${tw.shareButton}`}
              onClick={handleShare}
            >
              <ShareIcon />
              Del
            </button>
            <button className={tw.actionButton} onClick={handleCompare}>
              <CompareIcon />
              Sammenlign
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReferenceVideoCard;
