/**
 * TIER Golf - Coach Videos Dashboard
 * Design System v3.0 - Premium Light
 *
 * Main dashboard for coaches to review and manage player videos
 *
 * Features:
 * - Overview of all player videos
 * - Pending review queue
 * - Filter by player, date, status
 * - Batch actions (mark reviewed, request videos)
 * - Video request modal
 * - Quick stats
 *
 * DEV TEST INSTRUCTIONS:
 * 1. Upload video as player → Should appear in player feed
 * 2. Switch to coach → Should appear in pending queue
 * 3. Click video → Should load playback URL
 * 4. Mark as reviewed → Status should update
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles
 * Note: Select dropdown arrows use inline backgroundImage (data URI SVG)
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PlayerVideoFeed, REVIEW_STATUS } from './PlayerVideoFeed';
import { PendingReviewQueue } from './PendingReviewQueue';
import { useVideos } from '../../hooks/useVideos';
import * as videoApi from '../../services/videoApi';
import { coachesAPI } from '../../services/api';
import { track } from '../../analytics/track';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

// Tailwind classes
const tw = {
  container: 'flex flex-col gap-4 p-4',
  header: 'flex flex-wrap justify-between items-start gap-4',
  headerLeft: 'flex flex-col gap-1',
  title: 'm-0 text-2xl font-bold text-[var(--text-primary,white)]',
  subtitle: 'm-0 text-sm text-[var(--text-secondary,rgba(255,255,255,0.7))]',
  headerActions: 'flex gap-2',
  requestButton: 'flex items-center gap-2 py-2.5 px-5 bg-primary text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-colors duration-200',
  statsRow: 'grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3',
  statCard: 'flex flex-col gap-1 p-4 bg-surface rounded-xl border border-border',
  statValue: 'text-[28px] font-bold text-[var(--text-primary,white)]',
  statLabel: 'text-xs text-[var(--text-secondary,rgba(255,255,255,0.7))] uppercase tracking-wide',
  filtersRow: 'flex flex-wrap gap-3 p-4 bg-surface rounded-xl border border-border',
  filterGroup: 'flex flex-col gap-1',
  filterLabel: 'text-[11px] font-semibold text-[var(--text-tertiary,rgba(255,255,255,0.5))] uppercase tracking-wide',
  filterSelect: "py-2 pl-3 pr-8 bg-[rgb(var(--tier-navy-dark))] border border-border rounded-lg text-[var(--text-primary,white)] text-[13px] cursor-pointer appearance-none bg-no-repeat bg-[right_8px_center] min-w-[140px]",
  searchInput: 'py-2 px-3 bg-[rgb(var(--tier-navy-dark))] border border-border rounded-lg text-[var(--text-primary,white)] text-[13px] min-w-[200px]',
  bulkActionsBar: 'flex items-center gap-4 py-3 px-4 bg-primary rounded-xl text-white',
  bulkCount: 'text-sm font-semibold',
  bulkActions: 'flex gap-2 ml-auto',
  bulkButton: 'flex items-center gap-1 py-1.5 px-3 bg-white/20 text-white border-none rounded-lg text-[13px] font-medium cursor-pointer transition-colors duration-200',
  cancelButton: 'py-1.5 px-3 bg-transparent text-white border border-white/30 rounded-lg text-[13px] cursor-pointer',
  section: 'flex flex-col gap-3',
  sectionHeader: 'flex items-center justify-between',
  sectionTitle: 'm-0 text-base font-semibold text-[var(--text-primary,white)]',
  errorBar: 'p-4 bg-tier-error/10 rounded-xl border border-tier-error flex items-center justify-between',
  errorText: 'text-[var(--text-primary,white)] text-sm',
  retryButton: 'py-2 px-4 bg-tier-error border-none rounded-lg text-white text-[13px] font-medium cursor-pointer',
  // Request Modal
  modalOverlay: 'fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4',
  modal: 'w-full max-w-[480px] bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden',
  modalHeader: 'flex items-center justify-between p-4 border-b border-border',
  modalTitle: 'm-0 text-lg font-semibold text-[var(--text-primary,white)]',
  modalClose: 'p-2 bg-transparent border-none rounded-lg text-[var(--text-tertiary,rgba(255,255,255,0.4))] cursor-pointer',
  modalContent: 'p-4 flex flex-col gap-4',
  formGroup: 'flex flex-col gap-2',
  formLabel: 'text-[13px] font-medium text-[var(--text-secondary,rgba(255,255,255,0.7))]',
  formInput: 'py-2.5 px-3 bg-[rgb(var(--tier-navy-dark))] border border-border rounded-lg text-[var(--text-primary,white)] text-sm',
  formTextarea: 'py-2.5 px-3 bg-[rgb(var(--tier-navy-dark))] border border-border rounded-lg text-[var(--text-primary,white)] text-sm min-h-[100px] resize-y',
  modalFooter: 'flex justify-end gap-2 p-4 border-t border-border',
  modalCancelButton: 'py-2.5 px-5 bg-transparent border border-border rounded-lg text-[var(--text-secondary,rgba(255,255,255,0.7))] text-sm font-medium cursor-pointer',
  modalSubmitButton: 'py-2.5 px-5 bg-primary border-none rounded-lg text-white text-sm font-semibold cursor-pointer',
};

// Select dropdown arrow SVG as background
const selectBgImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

// Icons
const VideoRequestIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    <line x1="12" y1="9" x2="12" y2="15" />
    <line x1="9" y1="12" x2="15" y2="12" />
  </svg>
);

const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Demo data fallbacks
const DEMO_PLAYERS = [
  { id: '1', name: 'Magnus Olsen' },
  { id: '2', name: 'Emma Hansen' },
  { id: '3', name: 'Lars Berg' },
  { id: '4', name: 'Sofie Nilsen' },
];

/**
 * Map API status to REVIEW_STATUS
 */
function mapStatus(apiStatus) {
  switch (apiStatus) {
    case 'reviewed':
      return REVIEW_STATUS.REVIEWED;
    case 'needs_followup':
      return REVIEW_STATUS.NEEDS_FOLLOWUP;
    case 'in_progress':
      return REVIEW_STATUS.IN_PROGRESS;
    default:
      return REVIEW_STATUS.PENDING;
  }
}

/**
 * CoachVideosDashboard Component
 */
export function CoachVideosDashboard({
  style,
  className,
}) {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Analytics: Track screen view on mount
  useEffect(() => {
    track('screen_view', {
      screen: 'CoachVideosDashboard',
      source: 'navigation',
      type: 'page_view',
    });
  }, [location.pathname]);

  // State
  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [filters, setFilters] = useState({
    playerId: '',
    status: '',
    category: '',
    search: '',
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    playerId: '',
    drillType: '',
    instructions: '',
  });
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // Fetch players/athletes on mount
  useEffect(() => {
    async function fetchPlayers() {
      try {
        setPlayersLoading(true);
        const response = await coachesAPI.getAthletes();
        const athleteData = response.data?.data || response.data || [];
        // Map to consistent format
        const mappedPlayers = athleteData.map(p => ({
          id: p.id || p.playerId,
          name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Ukjent spiller',
        }));
        setPlayers(mappedPlayers.length > 0 ? mappedPlayers : DEMO_PLAYERS);
      } catch (err) {
        console.error('Failed to fetch players:', err);
        // Fall back to demo data
        setPlayers(DEMO_PLAYERS);
      } finally {
        setPlayersLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  // Use videos hook with filters
  const {
    videos: apiVideos,
    loading,
    error,
    refresh: refetchVideos,
    updateVideoInList,
    removeVideoFromList,
  } = useVideos({
    playerId: filters.playerId || undefined,
    category: filters.category || undefined,
    status: filters.status || undefined,
    autoFetch: true,
  });

  // Map API videos to expected format
  const videos = useMemo(() => {
    return apiVideos.map(v => ({
      id: v.id,
      title: v.title,
      playerId: v.playerId,
      playerName: v.player?.name || players.find(p => p.id === v.playerId)?.name || 'Spiller',
      category: v.category,
      duration: v.duration,
      reviewStatus: mapStatus(v.reviewStatus || v.status),
      annotationCount: v.annotationCount || v._count?.annotations || 0,
      thumbnailUrl: v.thumbnailUrl,
      createdAt: v.createdAt,
    }));
  }, [apiVideos, players]);

  // Stats
  const stats = useMemo(() => {
    const pending = videos.filter((v) => v.reviewStatus === REVIEW_STATUS.PENDING).length;
    const reviewed = videos.filter((v) => v.reviewStatus === REVIEW_STATUS.REVIEWED).length;
    const needsFollowup = videos.filter((v) => v.reviewStatus === REVIEW_STATUS.NEEDS_FOLLOWUP).length;
    return { total: videos.length, pending, reviewed, needsFollowup };
  }, [videos]);

  // Filtered videos
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      if (filters.playerId && video.playerId !== filters.playerId) return false;
      if (filters.status && video.reviewStatus !== filters.status) return false;
      if (filters.category && video.category !== filters.category) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!video.title.toLowerCase().includes(search) &&
            !video.playerName.toLowerCase().includes(search)) {
          return false;
        }
      }
      return true;
    });
  }, [videos, filters]);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Handle video selection
  const handleVideoSelect = useCallback((video, selected) => {
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

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedVideos(new Set());
  }, []);

  // Handle batch mark reviewed
  const handleBatchMarkReviewed = useCallback(async () => {
    try {
      // Update all selected videos via API
      await Promise.all(
        Array.from(selectedVideos).map(id =>
          videoApi.updateVideo(id, { status: 'reviewed' })
        )
      );
      // Refresh list
      refetchVideos();
      setSelectedVideos(new Set());
    } catch (err) {
      console.error('Failed to mark videos as reviewed:', err);
    }
  }, [selectedVideos, refetchVideos]);

  // Handle single mark reviewed
  const handleMarkReviewed = useCallback(async (video) => {
    try {
      // Update via API
      await videoApi.updateVideo(video.id, { status: 'reviewed' });
      // Update local state for immediate feedback
      updateVideoInList(video.id, { reviewStatus: REVIEW_STATUS.REVIEWED });
      // Analytics: Track video marked as reviewed
      track('feedback_received', {
        screen: 'CoachVideosDashboard',
        source: 'coach_videos',
        id: video.id,
        action: 'reviewed',
      });
    } catch (err) {
      console.error('Failed to mark video as reviewed:', err);
    }
  }, [updateVideoInList]);

  // Handle video click - navigate to video analyzer
  const handleVideoClick = useCallback((video) => {
    // Analytics: Track video open for review
    track('screen_view', {
      screen: 'CoachVideoReview',
      source: 'coach_videos',
      id: video.id,
      action: 'open',
    });
    // Navigate to video analysis view
    navigate(`/coach/videos/${video.id}/analyze`);
  }, [navigate]);

  // Handle annotate - navigate to video analyzer in annotation mode
  const handleAnnotate = useCallback((video) => {
    track('screen_view', {
      screen: 'CoachVideoAnalyzer',
      source: 'coach_videos',
      id: video.id,
      action: 'annotate',
    });
    navigate(`/coach/videos/${video.id}/analyze?mode=annotate`);
  }, [navigate]);

  // Handle comment - navigate to video with comments panel
  const handleComment = useCallback((video) => {
    track('screen_view', {
      screen: 'CoachVideoAnalyzer',
      source: 'coach_videos',
      id: video.id,
      action: 'comment',
    });
    navigate(`/coach/videos/${video.id}/analyze?mode=comment`);
  }, [navigate]);

  // Handle request form change
  const handleRequestFormChange = useCallback((key, value) => {
    setRequestForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Handle submit request
  const handleSubmitRequest = useCallback(async () => {
    if (!requestForm.playerId || requestSubmitting) return;

    setRequestSubmitting(true);
    try {
      // Create video request via API
      await videoApi.createVideoRequest({
        playerId: requestForm.playerId,
        drillType: requestForm.drillType || undefined,
        instructions: requestForm.instructions || undefined,
      });

      // Analytics: Track video request
      track('feedback_received', {
        screen: 'CoachVideosDashboard',
        source: 'video_request',
        playerId: requestForm.playerId,
        drillType: requestForm.drillType,
        action: 'request_sent',
      });

      setShowRequestModal(false);
      setRequestForm({ playerId: '', drillType: '', instructions: '' });
    } catch (err) {
      console.error('Failed to send video request:', err);
    } finally {
      setRequestSubmitting(false);
    }
  }, [requestForm, requestSubmitting]);

  return (
    <div className={`${tw.container} ${className || ''}`} style={style}>
      {/* Header */}
      <PageHeader
        title="Spillervideoer"
        subtitle="Gjennomgå og annotér videoer fra dine spillere"
        helpText="Alfabetisk oversikt over videoer lastet opp av dine spillere. Se ventende videoer som trenger gjennomgang, legg til kommentarer og gi tekniske tilbakemeldinger. Be om spesifikke videoer fra spillere."
        actions={
          <Button
            variant="primary"
            onClick={() => setShowRequestModal(true)}
            leftIcon={<VideoRequestIcon />}
          >
            Be om video
          </Button>
        }
        divider={false}
      />

      {/* Stats */}
      <div className={tw.statsRow}>
        <div className={tw.statCard}>
          <span className={tw.statValue}>{stats.total}</span>
          <span className={tw.statLabel}>Totalt</span>
        </div>
        <div className={tw.statCard}>
          <span className={`${tw.statValue} text-tier-warning`}>
            {stats.pending}
          </span>
          <span className={tw.statLabel}>Venter</span>
        </div>
        <div className={tw.statCard}>
          <span className={`${tw.statValue} text-tier-success`}>
            {stats.reviewed}
          </span>
          <span className={tw.statLabel}>Gjennomgått</span>
        </div>
        <div className={tw.statCard}>
          <span className={`${tw.statValue} text-tier-error`}>
            {stats.needsFollowup}
          </span>
          <span className={tw.statLabel}>Oppfølging</span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className={tw.errorBar}>
          <span className={tw.errorText}>{error}</span>
          <Button variant="primary" size="sm" onClick={refetchVideos}>
            Prøv igjen
          </Button>
        </div>
      )}

      {/* Pending Review Queue */}
      <PendingReviewQueue
        videos={videos}
        onVideoClick={handleVideoClick}
        onViewAll={() => handleFilterChange('status', REVIEW_STATUS.PENDING)}
      />

      {/* Filters */}
      <div className={tw.filtersRow}>
        <div className={tw.filterGroup}>
          <label className={tw.filterLabel}>Spiller</label>
          <select
            value={filters.playerId}
            onChange={(e) => handleFilterChange('playerId', e.target.value)}
            className={tw.filterSelect}
            style={{ backgroundImage: selectBgImage }}
          >
            <option value="">Alle spillere</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>

        <div className={tw.filterGroup}>
          <label className={tw.filterLabel}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={tw.filterSelect}
            style={{ backgroundImage: selectBgImage }}
          >
            <option value="">Alle statuser</option>
            <option value={REVIEW_STATUS.PENDING}>Venter</option>
            <option value={REVIEW_STATUS.IN_PROGRESS}>Under arbeid</option>
            <option value={REVIEW_STATUS.REVIEWED}>Gjennomgått</option>
            <option value={REVIEW_STATUS.NEEDS_FOLLOWUP}>Oppfølging</option>
          </select>
        </div>

        <div className={tw.filterGroup}>
          <label className={tw.filterLabel}>Kategori</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={tw.filterSelect}
            style={{ backgroundImage: selectBgImage }}
          >
            <option value="">Alle kategorier</option>
            <option value="swing">Full Swing</option>
            <option value="putting">Putting</option>
            <option value="short_game">Short Game</option>
            <option value="other">Annet</option>
          </select>
        </div>

        <div className={`${tw.filterGroup} flex-1`}>
          <label className={tw.filterLabel}>Søk</label>
          <input
            type="text"
            placeholder="Søk etter tittel eller spiller..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={tw.searchInput}
          />
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedVideos.size > 0 && (
        <div className={tw.bulkActionsBar}>
          <span className={tw.bulkCount}>
            {selectedVideos.size} valgt
          </span>
          <div className={tw.bulkActions}>
            <button
              className={tw.bulkButton}
              onClick={handleBatchMarkReviewed}
            >
              <CheckIcon />
              Merk gjennomgått
            </button>
            <button
              className={tw.cancelButton}
              onClick={handleClearSelection}
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* Video feed */}
      <div className={tw.section}>
        <div className={tw.sectionHeader}>
          <SectionTitle className={tw.sectionTitle}>
            Alle videoer ({filteredVideos.length})
          </SectionTitle>
        </div>
        <PlayerVideoFeed
          videos={filteredVideos}
          loading={loading}
          selectedVideos={selectedVideos}
          onVideoSelect={handleVideoSelect}
          onVideoClick={handleVideoClick}
          onAnnotate={handleAnnotate}
          onComment={handleComment}
          onMarkReviewed={handleMarkReviewed}
          selectable
        />
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div
          className={tw.modalOverlay}
          onClick={(e) => e.target === e.currentTarget && setShowRequestModal(false)}
        >
          <div className={tw.modal}>
            <div className={tw.modalHeader}>
              <SubSectionTitle className={tw.modalTitle}>Be om video</SubSectionTitle>
              <button
                className={tw.modalClose}
                onClick={() => setShowRequestModal(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className={tw.modalContent}>
              <div className={tw.formGroup}>
                <label className={tw.formLabel}>Spiller</label>
                <select
                  value={requestForm.playerId}
                  onChange={(e) => handleRequestFormChange('playerId', e.target.value)}
                  className={tw.formInput}
                >
                  <option value="">Velg spiller...</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={tw.formGroup}>
                <label className={tw.formLabel}>Type øvelse</label>
                <select
                  value={requestForm.drillType}
                  onChange={(e) => handleRequestFormChange('drillType', e.target.value)}
                  className={tw.formInput}
                >
                  <option value="">Velg type...</option>
                  <option value="driver">Driver</option>
                  <option value="iron">Jern</option>
                  <option value="wedge">Wedge</option>
                  <option value="putting">Putting</option>
                  <option value="chipping">Chipping</option>
                  <option value="bunker">Bunker</option>
                  <option value="other">Annet</option>
                </select>
              </div>

              <div className={tw.formGroup}>
                <label className={tw.formLabel}>Instruksjoner</label>
                <textarea
                  value={requestForm.instructions}
                  onChange={(e) => handleRequestFormChange('instructions', e.target.value)}
                  className={tw.formTextarea}
                  placeholder="Beskriv hva du ønsker at spilleren skal filme..."
                />
              </div>
            </div>

            <div className={tw.modalFooter}>
              <Button
                variant="ghost"
                onClick={() => setShowRequestModal(false)}
              >
                Avbryt
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitRequest}
                disabled={!requestForm.playerId || requestSubmitting}
                loading={requestSubmitting}
              >
                {requestSubmitting ? 'Sender...' : 'Send forespørsel'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoachVideosDashboard;
