/**
 * KeyframeGallery
 * Display grid of extracted video keyframes
 *
 * Features:
 * - Grid layout of keyframes with thumbnails
 * - Jump to timestamp when clicking keyframe
 * - Edit label/notes
 * - Delete keyframes
 * - Show timestamp for each frame
 * - Empty state when no keyframes exist
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useKeyframes } from '../../hooks/useKeyframes';
import Button from '../../ui/primitives/Button';
import { track } from '../../analytics/track';
import { SubSectionTitle } from '../typography/Headings';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-3',
  header: 'flex items-center justify-between',
  title: 'text-sm font-semibold text-[var(--text-inverse)] m-0',
  count: 'text-xs text-[var(--video-text-secondary)] ml-2',
  grid: 'grid grid-cols-2 gap-3',
  keyframeCard: 'relative group flex flex-col gap-2 p-2 bg-surface-elevated rounded-ak-lg border border-border hover:border-primary transition-all cursor-pointer',
  keyframeCardActive: 'relative group flex flex-col gap-2 p-2 bg-surface-elevated rounded-ak-lg border-2 border-primary transition-all cursor-pointer',
  thumbnail: 'w-full aspect-video bg-[var(--tier-surface-dark-base)] rounded-ak-md overflow-hidden',
  thumbnailImage: 'w-full h-full object-cover',
  thumbnailPlaceholder: 'w-full h-full flex items-center justify-center text-[var(--video-text-tertiary)] text-xs',
  overlay: 'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2',
  overlayButton: 'py-1.5 px-3 bg-white/90 border-none rounded-ak-sm text-black text-xs font-medium cursor-pointer hover:bg-white transition-colors',
  overlayDeleteButton: 'py-1.5 px-3 bg-ak-status-error/90 border-none rounded-ak-sm text-white text-xs font-medium cursor-pointer hover:bg-ak-status-error transition-colors',
  info: 'flex flex-col gap-1',
  timestamp: 'text-xs text-primary font-mono font-semibold',
  label: 'text-xs text-[var(--text-inverse)] font-medium line-clamp-1',
  notes: 'text-[11px] text-[var(--video-text-secondary)] line-clamp-2',
  emptyState: 'flex flex-col items-center justify-center gap-3 py-12 text-center',
  emptyIcon: 'text-5xl opacity-30',
  emptyTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  emptyDescription: 'text-sm text-[var(--video-text-secondary)] m-0 max-w-xs',
  loading: 'flex items-center justify-center py-12 text-[var(--video-text-secondary)] text-sm',
  error: 'p-3 bg-ak-status-error/10 border border-ak-status-error rounded-ak-md text-ak-status-error text-sm',
  editModal: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4',
  editCard: 'w-full max-w-md bg-surface rounded-ak-lg border border-border p-4 flex flex-col gap-3',
  editTitle: 'text-base font-semibold text-[var(--text-inverse)] m-0',
  input: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-ak-md text-[var(--text-inverse)] text-sm',
  textarea: 'w-full py-2 px-3 bg-surface-elevated border border-border rounded-ak-md text-[var(--text-inverse)] text-sm resize-none min-h-[80px]',
  editActions: 'flex gap-2 justify-end',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function KeyframeGallery({
  videoId,
  onJumpToTimestamp,
  className = '',
}) {
  const {
    keyframes,
    loading,
    error,
    updateKeyframe,
    deleteKeyframe,
    refresh,
    getKeyframeImageUrl,
  } = useKeyframes(videoId);

  const [keyframeUrls, setKeyframeUrls] = useState({});
  const [editingKeyframe, setEditingKeyframe] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [activeKeyframeId, setActiveKeyframeId] = useState(null);

  // Load keyframe image URLs
  useEffect(() => {
    const loadUrls = async () => {
      const urls = {};
      for (const kf of keyframes) {
        try {
          const url = await getKeyframeImageUrl(kf.id);
          urls[kf.id] = url;
        } catch (err) {
          console.error(`Failed to load URL for keyframe ${kf.id}:`, err);
        }
      }
      setKeyframeUrls(urls);
    };

    if (keyframes.length > 0) {
      loadUrls();
    }
  }, [keyframes, getKeyframeImageUrl]);

  // Handle keyframe click - jump to timestamp
  const handleKeyframeClick = useCallback((keyframe) => {
    if (onJumpToTimestamp) {
      onJumpToTimestamp(keyframe.timestamp);
      setActiveKeyframeId(keyframe.id);

      track('keyframe_clicked', {
        screen: 'KeyframeGallery',
        videoId,
        keyframeId: keyframe.id,
        timestamp: keyframe.timestamp,
      });
    }
  }, [videoId, onJumpToTimestamp]);

  // Open edit modal
  const handleEdit = useCallback((keyframe, e) => {
    e.stopPropagation();
    setEditingKeyframe(keyframe);
    setEditLabel(keyframe.label || '');
    setEditNotes(keyframe.notes || '');

    track('keyframe_edit_opened', {
      screen: 'KeyframeGallery',
      videoId,
      keyframeId: keyframe.id,
    });
  }, [videoId]);

  // Save edited keyframe
  const handleSaveEdit = useCallback(async () => {
    if (!editingKeyframe) return;

    try {
      await updateKeyframe(editingKeyframe.id, {
        label: editLabel.trim() || null,
        notes: editNotes.trim() || null,
      });

      setEditingKeyframe(null);
      setEditLabel('');
      setEditNotes('');

      track('keyframe_edited', {
        screen: 'KeyframeGallery',
        videoId,
        keyframeId: editingKeyframe.id,
      });
    } catch (err) {
      console.error('Failed to update keyframe:', err);
    }
  }, [editingKeyframe, editLabel, editNotes, updateKeyframe, videoId]);

  // Cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingKeyframe(null);
    setEditLabel('');
    setEditNotes('');
  }, []);

  // Delete keyframe
  const handleDelete = useCallback(async (keyframe, e) => {
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this keyframe?')) {
      return;
    }

    try {
      await deleteKeyframe(keyframe.id);

      track('keyframe_deleted', {
        screen: 'KeyframeGallery',
        videoId,
        keyframeId: keyframe.id,
      });
    } catch (err) {
      console.error('Failed to delete keyframe:', err);
    }
  }, [deleteKeyframe, videoId]);

  // Format timestamp for display
  const formatTimestamp = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${tw.container} ${className}`}>
        <div className={tw.loading}>
          Loading keyframes...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${tw.container} ${className}`}>
        <div className={tw.error}>
          {error}
          <Button size="sm" variant="ghost" onClick={refresh} className="ml-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (keyframes.length === 0) {
    return (
      <div className={`${tw.container} ${className}`}>
        <div className={tw.emptyState}>
          <div className={tw.emptyIcon}>📸</div>
          <SubSectionTitle className={tw.emptyTitle} style={{ marginBottom: 0 }}>No Keyframes Yet</SubSectionTitle>
          <p className={tw.emptyDescription}>
            Capture important moments from the video by extracting keyframes at specific timestamps.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${tw.container} ${className}`}>
        {/* Header */}
        <div className={tw.header}>
          <SubSectionTitle className={tw.title} style={{ marginBottom: 0 }}>
            Keyframes
            <span className={tw.count}>({keyframes.length})</span>
          </SubSectionTitle>
        </div>

        {/* Keyframe Grid */}
        <div className={tw.grid}>
          {keyframes.map((keyframe) => (
            <div
              key={keyframe.id}
              onClick={() => handleKeyframeClick(keyframe)}
              className={keyframe.id === activeKeyframeId ? tw.keyframeCardActive : tw.keyframeCard}
            >
              {/* Thumbnail */}
              <div className={tw.thumbnail}>
                {keyframeUrls[keyframe.id] ? (
                  <img
                    src={keyframeUrls[keyframe.id]}
                    alt={keyframe.label || `Keyframe at ${formatTimestamp(keyframe.timestamp)}`}
                    className={tw.thumbnailImage}
                  />
                ) : (
                  <div className={tw.thumbnailPlaceholder}>
                    Loading...
                  </div>
                )}

                {/* Hover Overlay */}
                <div className={tw.overlay}>
                  <button
                    onClick={(e) => handleEdit(keyframe, e)}
                    className={tw.overlayButton}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => handleDelete(keyframe, e)}
                    className={tw.overlayDeleteButton}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className={tw.info}>
                <div className={tw.timestamp}>
                  ⏱️ {formatTimestamp(keyframe.timestamp)}
                </div>
                {keyframe.label && (
                  <div className={tw.label}>{keyframe.label}</div>
                )}
                {keyframe.notes && (
                  <div className={tw.notes}>{keyframe.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingKeyframe && (
        <div className={tw.editModal} onClick={handleCancelEdit}>
          <div className={tw.editCard} onClick={(e) => e.stopPropagation()}>
            <SubSectionTitle className={tw.editTitle} style={{ marginBottom: 0 }}>Edit Keyframe</SubSectionTitle>
            <input
              type="text"
              placeholder="Label"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className={tw.input}
              maxLength={255}
            />
            <textarea
              placeholder="Notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className={tw.textarea}
              maxLength={1000}
            />
            <div className={tw.editActions}>
              <Button variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default KeyframeGallery;
