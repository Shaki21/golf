/**
 * SwingTimeline Component
 * Horizontal timeline showing video thumbnails over time
 *
 * Features:
 * - Horizontal timeline with dates
 * - Video thumbnails as points
 * - Click to open video
 * - Hover preview
 * - Compare button between two videos
 * - Mobile-responsive layout
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * (except dynamic positioning which requires runtime values)
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, BarChart3 } from 'lucide-react';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle } from "../../ui/components/typography";

// ============================================================================
// TYPES
// ============================================================================

interface VideoItem {
  id: string;
  title?: string;
  thumbnailUrl?: string;
  createdAt: string;
  category?: string;
}

interface VideoWithPosition extends VideoItem {
  position: number;
}

interface SwingTimelineProps {
  videos?: VideoItem[];
  title?: string;
  onVideoClick?: (video: VideoItem) => void;
  onCompare?: (video1: VideoItem, video2: VideoItem) => void;
  selectable?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format date as DD.MM
 */
function formatDate(date: string): string {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SwingTimeline({
  videos = [],
  title = 'Fremgang over tid',
  onVideoClick,
  onCompare,
  selectable = true,
  style,
  className,
}: SwingTimelineProps) {
  const navigate = useNavigate();
  const [selectedVideos, setSelectedVideos] = useState<VideoItem[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sort videos by date
  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [videos]);

  // Calculate positions for each video
  const videoPositions = useMemo((): VideoWithPosition[] => {
    if (sortedVideos.length === 0) return [];

    const minDate = new Date(sortedVideos[0].createdAt).getTime();
    const maxDate = new Date(sortedVideos[sortedVideos.length - 1].createdAt).getTime();
    const range = maxDate - minDate || 1;

    return sortedVideos.map((video) => {
      const date = new Date(video.createdAt).getTime();
      const position = ((date - minDate) / range) * 100;
      return {
        ...video,
        position: Math.max(2, Math.min(98, position)), // Keep within bounds
      };
    });
  }, [sortedVideos]);

  // Handle video click
  const handleVideoClick = useCallback((video: VideoItem, e: React.MouseEvent) => {
    if (selectable && (e.ctrlKey || e.metaKey || e.shiftKey)) {
      // Multi-select mode
      setSelectedVideos((prev) => {
        if (prev.some((v) => v.id === video.id)) {
          return prev.filter((v) => v.id !== video.id);
        }
        if (prev.length >= 2) {
          return [prev[1], video];
        }
        return [...prev, video];
      });
    } else if (selectable && selectedVideos.length > 0) {
      // Add to selection
      setSelectedVideos((prev) => {
        if (prev.some((v) => v.id === video.id)) {
          return prev.filter((v) => v.id !== video.id);
        }
        if (prev.length >= 2) {
          return [prev[1], video];
        }
        return [...prev, video];
      });
    } else {
      // Single click - open video
      if (onVideoClick) {
        onVideoClick(video);
      } else {
        navigate(`/videos/${video.id}/analyze`);
      }
    }
  }, [selectable, selectedVideos, onVideoClick, navigate]);

  // Handle compare
  const handleCompare = useCallback(() => {
    if (selectedVideos.length !== 2) return;

    if (onCompare) {
      onCompare(selectedVideos[0], selectedVideos[1]);
    } else {
      navigate(`/videos/compare?left=${selectedVideos[0].id}&right=${selectedVideos[1].id}`);
    }
  }, [selectedVideos, onCompare, navigate]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedVideos([]);
  }, []);

  // Is video selected
  const isSelected = useCallback((videoId: string) => {
    return selectedVideos.some((v) => v.id === videoId);
  }, [selectedVideos]);

  // Render empty state
  if (videos.length === 0) {
    return (
      <div className={`flex flex-col gap-3 p-4 bg-tier-white rounded-xl border border-tier-border-default ${className || ''}`} style={style}>
        <div className="flex justify-between items-center gap-3">
          <SubSectionTitle className="m-0 text-base font-semibold text-tier-navy">{title}</SubSectionTitle>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-tier-text-tertiary text-center">
          <Video size={32} className="mb-2" />
          <p className="text-sm m-0">
            Ingen videoer i denne kategorien ennå
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 p-4 bg-tier-white rounded-xl border border-tier-border-default ${className || ''}`} style={style}>
      {/* Header */}
      <div className="flex justify-between items-center gap-3">
        <SubSectionTitle className="m-0 text-base font-semibold text-tier-navy">{title}</SubSectionTitle>
        {selectable && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleCompare}
            disabled={selectedVideos.length !== 2}
            leftIcon={<BarChart3 size={16} />}
          >
            Sammenlign ({selectedVideos.length}/2)
          </Button>
        )}
      </div>

      {/* Selection info */}
      {selectedVideos.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-tier-navy/10 rounded-lg text-xs text-tier-text-secondary">
          <span>
            {selectedVideos.length === 1
              ? `1 video valgt - velg 1 til for å sammenligne`
              : `2 videoer valgt - klar til sammenligning`}
          </span>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            Nullstill
          </Button>
        </div>
      )}

      {/* Timeline */}
      <div className={`relative ${isMobile ? 'overflow-x-auto px-2' : 'px-4'}`}>
        {isMobile ? (
          /* Mobile: Horizontal scroll layout */
          <div className="flex gap-3 py-2 min-w-max">
            {sortedVideos.map((video) => (
              <div
                key={video.id}
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={(e) => handleVideoClick(video, e)}
              >
                <div
                  className={`w-20 h-[60px] bg-tier-surface-base rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected(video.id)
                      ? 'border-tier-navy shadow-[0_0_0_2px_rgba(99,102,241,0.3)]'
                      : 'border-transparent'
                  }`}
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-tier-text-tertiary">
                      <Video size={24} />
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-tier-text-secondary font-mono">
                  {formatDate(video.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop: Positioned timeline layout */
          <div className="relative h-[120px] flex items-end">
            <div className="absolute bottom-6 left-0 right-0 h-0.5 bg-tier-border-default" />
            {videoPositions.map((video) => (
              <div
                key={video.id}
                className={`absolute flex flex-col items-center -translate-x-1/2 cursor-pointer transition-transform ${
                  isSelected(video.id) ? 'scale-110' : ''
                }`}
                style={{ left: `${video.position}%` }}
                onClick={(e) => handleVideoClick(video, e)}
                title={`${video.title} - ${formatDate(video.createdAt)}`}
              >
                <div
                  className={`w-[60px] h-[45px] bg-tier-surface-base rounded overflow-hidden mb-2 border-2 transition-all ${
                    isSelected(video.id)
                      ? 'border-tier-navy shadow-[0_0_0_2px_rgba(99,102,241,0.3)]'
                      : 'border-transparent'
                  }`}
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-tier-text-tertiary">
                      <Video size={20} />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-tier-navy rounded-full border-2 border-tier-white" />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] text-tier-text-tertiary whitespace-nowrap font-mono">
                  {formatDate(video.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SwingTimeline;
