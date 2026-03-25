/**
 * VideoProgressView Component
 * Main view for tracking video progress over time
 *
 * Features:
 * - Timeline with video thumbnails
 * - Filter by category
 * - Before/after comparison
 * - Trend visualization
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Video, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useVideos } from '../../hooks/useVideos';
import { SwingTimeline } from './SwingTimeline';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import Button from '../../ui/primitives/Button';

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

interface VideoProgressViewProps {
  playerId?: string;
  style?: React.CSSProperties;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Category configuration
const CATEGORIES = [
  { id: 'all', label: 'Alle' },
  { id: 'swing', label: 'Full sving' },
  { id: 'putting', label: 'Putting' },
  { id: 'short_game', label: 'Naerspill' },
  { id: 'other', label: 'Annet' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function VideoProgressView({
  playerId: propsPlayerId,
  style,
  className,
}: VideoProgressViewProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Determine player ID
  const playerId = propsPlayerId || user?.playerId || user?.id;

  // State
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') || 'all'
  );

  // Fetch videos
  const {
    videos,
    loading,
  } = useVideos({
    playerId,
    category: activeCategory === 'all' ? undefined : activeCategory,
    sortBy: 'createdAt',
    sortOrder: 'asc',
    autoFetch: true,
  });

  // Update URL params when category changes
  useEffect(() => {
    if (activeCategory === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', activeCategory);
    }
    setSearchParams(searchParams, { replace: true });
  }, [activeCategory, searchParams, setSearchParams]);

  // Group videos by category
  const videosByCategory = useMemo(() => {
    const grouped: Record<string, VideoItem[]> = {};
    videos.forEach((video: VideoItem) => {
      const cat = video.category || 'other';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(video);
    });
    return grouped;
  }, [videos]);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: videos.length,
      thisWeek: videos.filter((v: VideoItem) => new Date(v.createdAt) >= oneWeekAgo).length,
      thisMonth: videos.filter((v: VideoItem) => new Date(v.createdAt) >= oneMonthAgo).length,
      categories: Object.keys(videosByCategory).length,
    };
  }, [videos, videosByCategory]);

  // Handle category filter
  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

  // Handle compare
  const handleCompare = useCallback((video1: VideoItem, video2: VideoItem) => {
    navigate(`/videos/compare?left=${video1.id}&right=${video2.id}`);
  }, [navigate]);

  // Render loading state
  if (loading) {
    return (
      <div className={`flex flex-col gap-4 p-4 ${className || ''}`} style={style}>
        <div className="flex items-center justify-center py-8 text-tier-text-tertiary">
          Laster videoer...
        </div>
      </div>
    );
  }

  // Render empty state
  if (videos.length === 0 && !loading) {
    return (
      <div className={`flex flex-col gap-4 p-4 ${className || ''}`} style={style}>
        <PageHeader
          title="Videofremgang"
          subtitle="Spor din utvikling over tid"
          helpText="Se utviklingen din gjennom videoer over tid. Sammenlign videoer fra ulike tidspunkter for å identifisere fremgang og forbedringsområder i din svingteknikk."
          divider={false}
        />

        <div className="flex flex-col items-center justify-center py-8 text-tier-text-tertiary text-center bg-tier-white rounded-xl border border-tier-border-default">
          <div className="mb-3 opacity-50">
            <Video size={32} />
          </div>
          <p className="text-sm m-0">
            Du har ikke lastet opp noen videoer ennå.
            <br />
            Last opp din første video for å begynne å spore fremgangen.
          </p>
          <Button
            variant="primary"
            className="mt-3"
            onClick={() => navigate('/videos')}
          >
            Gå til videobibliotek
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 p-4 ${className || ''}`} style={style}>
      {/* Header */}
      <PageHeader
        title="Videofremgang"
        subtitle="Spor din utvikling over tid og sammenlign videoer"
        helpText="Se utviklingen din gjennom videoer over tid. Sammenlign videoer fra ulike tidspunkter for å identifisere fremgang og forbedringsområder i din svingteknikk."
        divider={false}
      />

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all border ${
              activeCategory === cat.id
                ? 'bg-tier-navy border-tier-navy text-white'
                : 'bg-tier-white border-tier-border-default text-tier-text-secondary hover:border-tier-navy'
            }`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1 p-3 bg-tier-white rounded-xl border border-tier-border-default text-center">
          <span className="text-2xl font-bold text-tier-navy">{stats.total}</span>
          <span className="text-[11px] text-tier-text-secondary uppercase tracking-wide">Totalt</span>
        </div>
        <div className="flex flex-col gap-1 p-3 bg-tier-white rounded-xl border border-tier-border-default text-center">
          <span className="text-2xl font-bold text-tier-navy">{stats.thisWeek}</span>
          <span className="text-[11px] text-tier-text-secondary uppercase tracking-wide">Denne uken</span>
        </div>
        <div className="flex flex-col gap-1 p-3 bg-tier-white rounded-xl border border-tier-border-default text-center">
          <span className="text-2xl font-bold text-tier-navy">{stats.thisMonth}</span>
          <span className="text-[11px] text-tier-text-secondary uppercase tracking-wide">Denne måneden</span>
        </div>
        <div className="flex flex-col gap-1 p-3 bg-tier-white rounded-xl border border-tier-border-default text-center">
          <span className="text-2xl font-bold text-tier-navy">{stats.categories}</span>
          <span className="text-[11px] text-tier-text-secondary uppercase tracking-wide">Kategorier</span>
        </div>
      </div>

      {/* Timelines by category */}
      <div className="flex flex-col gap-4">
        {activeCategory === 'all' ? (
          // Show all categories
          Object.entries(videosByCategory).map(([category, categoryVideos]) => (
            <div key={category}>
              <SwingTimeline
                videos={categoryVideos}
                title={CATEGORIES.find((c) => c.id === category)?.label || category}
                onCompare={handleCompare}
                selectable
              />
            </div>
          ))
        ) : (
          // Show single category
          <SwingTimeline
            videos={videos}
            title={CATEGORIES.find((c) => c.id === activeCategory)?.label || 'Videoer'}
            onCompare={handleCompare}
            selectable
          />
        )}
      </div>
    </div>
  );
}

export default VideoProgressView;
