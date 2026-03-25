/**
 * VideoComparisonPage
 * Page wrapper for side-by-side video comparison
 *
 * Features:
 * - Load two videos for comparison
 * - Video selection from library
 * - Synchronized playback
 * - Sync point configuration
 * - Save comparison for later
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { VideoComparison } from '../../components/video/VideoComparison';
import { useVideo, useVideos } from '../../hooks/useVideos';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import * as videoApi from '../../services/videoApi';
import { track } from '../../analytics/track';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { SubSectionTitle } from '../../components/typography';

// Tailwind classes
const tw = {
  container: 'flex flex-col h-full bg-[var(--tier-navy)]',
  header: 'flex items-center gap-3 py-3 px-4 border-b border-border',
  backButton: 'flex items-center gap-1 py-2 px-3 bg-surface border border-border rounded-lg text-[var(--video-text-secondary)] text-[13px] cursor-pointer',
  title: 'm-0 text-lg font-semibold text-[var(--text-inverse)] flex-1',
  saveButton: 'py-2 px-4 bg-primary border-none rounded-lg text-white text-[13px] font-medium cursor-pointer',
  main: 'flex-1 flex flex-col overflow-hidden',
  comparisonWrapper: 'flex-1 p-4 overflow-hidden',
  selectionContainer: 'flex-1 flex items-center justify-center gap-6 p-6',
  videoSlot: 'flex-1 max-w-[400px] bg-surface rounded-xl border-2 border-dashed border-border p-6 text-center cursor-pointer transition-all duration-200',
  videoSlotActive: 'border-primary bg-primary/10',
  videoSlotFilled: 'border-solid border-tier-success',
  slotLabel: 'block text-xs font-semibold text-[var(--video-text-tertiary)] uppercase tracking-wide mb-3',
  slotIcon: 'w-12 h-12 mx-auto mb-3 text-[var(--video-text-tertiary)]',
  slotText: 'text-sm text-[var(--video-text-secondary)] m-0',
  slotVideoTitle: 'text-base font-semibold text-[var(--text-inverse)] mb-2',
  slotVideoMeta: 'text-[13px] text-[var(--video-text-secondary)] m-0',
  vsLabel: 'text-2xl font-bold text-[var(--video-text-muted)]',
  startButton: 'mt-4 py-3 px-6 bg-primary border-none rounded-lg text-white text-sm font-semibold cursor-pointer',
  modal: 'fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4',
  modalContent: 'bg-surface rounded-2xl border border-border max-w-[600px] w-full max-h-[80vh] overflow-hidden flex flex-col',
  modalHeader: 'flex items-center justify-between p-4 border-b border-border',
  modalTitle: 'm-0 text-base font-semibold text-[var(--text-inverse)]',
  closeButton: 'w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-lg text-[var(--video-text-secondary)] cursor-pointer text-xl',
  modalBody: 'flex-1 overflow-y-auto p-4',
  videoGrid: 'grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3',
  videoOption: 'bg-[rgb(var(--tier-navy-dark))] rounded-lg border-2 border-transparent overflow-hidden cursor-pointer transition-all duration-200',
  videoOptionSelected: 'border-primary',
  videoThumbnail: 'w-full aspect-video bg-surface flex items-center justify-center text-[var(--video-text-tertiary)]',
  videoOptionTitle: 'p-2 text-xs font-medium text-[var(--text-inverse)] overflow-hidden text-ellipsis whitespace-nowrap',
  loadingContainer: 'flex-1 flex items-center justify-center flex-col gap-4 text-[var(--video-text-secondary)]',
  spinner: 'w-10 h-10 border-[3px] border-border border-t-primary rounded-full animate-spin',
};

// Icons
const VideoIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const VideoSmallIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
);

/**
 * Format duration in mm:ss
 */
function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * VideoComparisonPage Component
 */
export function VideoComparisonPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Get video IDs from URL params
  // Supports: ?v1=xxx&v2=yyy OR ?reference=xxx (pre-selects slot 1)
  const video1Id = searchParams.get('v1') || searchParams.get('reference');
  const video2Id = searchParams.get('v2');

  // State
  const [selectedSlot, setSelectedSlot] = useState(null); // 1 or 2
  const [video1, setVideo1] = useState(null);
  const [video2, setVideo2] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [comparingMode, setComparingMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch videos from library for selection
  const { videos, loading: videosLoading } = useVideos({
    playerId: user?.playerId || user?.id,
    limit: 50,
  });

  // Fetch initial videos if IDs provided
  useEffect(() => {
    async function loadInitialVideos() {
      if (video1Id) {
        try {
          const v1 = await videoApi.getVideo(video1Id);
          setVideo1(v1);
        } catch (err) {
          console.error('Failed to load video 1:', err);
        }
      }
      if (video2Id) {
        try {
          const v2 = await videoApi.getVideo(video2Id);
          setVideo2(v2);
        } catch (err) {
          console.error('Failed to load video 2:', err);
        }
      }
      if (video1Id && video2Id) {
        setComparingMode(true);
      }
    }
    loadInitialVideos();
  }, [video1Id, video2Id]);

  // Track page view
  useEffect(() => {
    track('screen_view', {
      screen: 'VideoComparisonPage',
      source: 'navigation',
    });
  }, []);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle slot click
  const handleSlotClick = useCallback((slot) => {
    setSelectedSlot(slot);
    setShowSelector(true);
  }, []);

  // Handle video selection
  const handleVideoSelect = useCallback((video) => {
    if (selectedSlot === 1) {
      setVideo1(video);
    } else {
      setVideo2(video);
    }
    setShowSelector(false);
    setSelectedSlot(null);

    // Update URL
    const newParams = new URLSearchParams(searchParams);
    newParams.set(selectedSlot === 1 ? 'v1' : 'v2', video.id);
    navigate(`/videos/compare?${newParams.toString()}`, { replace: true });
  }, [selectedSlot, searchParams, navigate]);

  // Handle start comparison
  const handleStartComparison = useCallback(() => {
    if (video1 && video2) {
      setComparingMode(true);
      track('comparison_started', {
        screen: 'VideoComparisonPage',
        video1Id: video1.id,
        video2Id: video2.id,
      });
    }
  }, [video1, video2]);

  // Handle save comparison
  const handleSaveComparison = useCallback(async () => {
    if (!video1 || !video2 || saving) return;

    setSaving(true);
    try {
      await videoApi.createComparison({
        primaryVideoId: video1.id,
        comparisonVideoId: video2.id,
        title: `${video1.title} vs ${video2.title}`,
        syncPoint1: 0,
        syncPoint2: 0,
      });
      track('comparison_saved', {
        screen: 'VideoComparisonPage',
        video1Id: video1.id,
        video2Id: video2.id,
      });
      showNotification('Sammenligning lagret!', 'success');
    } catch (err) {
      console.error('Failed to save comparison:', err);
      showNotification('Kunne ikke lagre sammenligning.', 'error');
    } finally {
      setSaving(false);
    }
  }, [video1, video2, saving, showNotification]);

  // Render video slot
  const renderVideoSlot = (slot, video) => (
    <div
      className={`${tw.videoSlot} ${video ? tw.videoSlotFilled : ''}`}
      onClick={() => handleSlotClick(slot)}
    >
      <span className={tw.slotLabel}>Video {slot}</span>
      {video ? (
        <>
          <p className={tw.slotVideoTitle}>{video.title}</p>
          <p className={tw.slotVideoMeta}>
            {video.category} {video.duration ? `- ${formatDuration(video.duration)}` : ''}
          </p>
        </>
      ) : (
        <>
          <div className={tw.slotIcon}>
            <VideoIcon />
          </div>
          <p className={tw.slotText}>Klikk for å velge video</p>
        </>
      )}
    </div>
  );

  // Render video selector modal
  // UI Canon: Modal backdrop dismiss pattern
  // - Outer div (backdrop) closes modal on click
  // - Inner div uses stopPropagation() to prevent dismiss when clicking content
  const renderVideoSelector = () => (
    <div className={tw.modal} onClick={() => setShowSelector(false)}>
      <div className={tw.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={tw.modalHeader}>
          <SubSectionTitle className={tw.modalTitle}>Velg video {selectedSlot}</SubSectionTitle>
          <button className={tw.closeButton} onClick={() => setShowSelector(false)}>
            &times;
          </button>
        </div>
        <div className={tw.modalBody}>
          {videosLoading ? (
            <StateCard variant="loading" title="Laster videoer..." />
          ) : (
            <div className={tw.videoGrid}>
              {videos.map((v) => (
                <div
                  key={v.id}
                  className={`${tw.videoOption} ${(selectedSlot === 1 ? video1?.id : video2?.id) === v.id ? tw.videoOptionSelected : ''}`}
                  onClick={() => handleVideoSelect(v)}
                >
                  <div className={tw.videoThumbnail}>
                    {v.thumbnailUrl ? (
                      <img
                        src={v.thumbnailUrl}
                        alt={v.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <VideoSmallIcon />
                    )}
                  </div>
                  <div className={tw.videoOptionTitle}>{v.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={tw.container}>
      {/* Header */}
      <PageHeader
        title="Sammenlign videoer"
        helpText="Sammenlign to videoer side ved side med synkronisert avspilling. Velg videoer fra biblioteket ditt, juster synkroniseringspunkter og analyser forskjeller i teknikk og utførelse."
        onBack={handleBack}
        actions={comparingMode ? (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveComparison}
            disabled={saving}
            loading={saving}
          >
            {saving ? 'Lagrer...' : 'Lagre sammenligning'}
          </Button>
        ) : null}
      />

      {/* Main Content */}
      <div className={tw.main}>
        {comparingMode && video1 && video2 ? (
          <div className={tw.comparisonWrapper}>
            <VideoComparison
              video1={{ ...video1, url: video1.playbackUrl }}
              video2={{ ...video2, url: video2.playbackUrl }}
            />
          </div>
        ) : (
          <div className={tw.selectionContainer}>
            {renderVideoSlot(1, video1)}
            <span className={tw.vsLabel}>VS</span>
            {renderVideoSlot(2, video2)}
          </div>
        )}

        {!comparingMode && video1 && video2 && (
          <div className="text-center pb-6">
            <Button variant="primary" onClick={handleStartComparison}>
              Start sammenligning
            </Button>
          </div>
        )}
      </div>

      {/* Video Selector Modal */}
      {showSelector && renderVideoSelector()}
    </div>
  );
}

export default VideoComparisonPage;
