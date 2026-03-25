/**
 * TIER Golf - Reference Library
 * Design System v3.0 - Premium Light
 *
 * Library for coach demo videos, pro references, and drill instructions
 *
 * Features:
 * - Grid display of reference videos
 * - Upload new reference videos
 * - Category and type filtering
 * - Search functionality
 * - Share videos with players
 * - Compare with player videos
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReferenceVideoCard, REFERENCE_TYPES } from './ReferenceVideoCard';
import { useVideos } from '../../hooks/useVideos';
import { useVideoUpload, UPLOAD_STATES } from '../../hooks/useVideoUpload';
import * as videoApi from '../../services/videoApi';
import { coachesAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { track } from '../../analytics/track';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography';
import { Plus, Search, X, Upload, Video, Check, FileVideo } from 'lucide-react';

// Video categories for golf
const VIDEO_CATEGORIES = [
  { value: '', label: 'Alle kategorier' },
  { value: 'full_swing', label: 'Full sving' },
  { value: 'putting', label: 'Putting' },
  { value: 'chipping', label: 'Chipping' },
  { value: 'pitching', label: 'Pitching' },
  { value: 'bunker', label: 'Bunker' },
  { value: 'driver', label: 'Driver' },
  { value: 'iron', label: 'Jern' },
  { value: 'mental', label: 'Mental' },
  { value: 'warmup', label: 'Oppvarming' },
];

// Reference type options
const TYPE_OPTIONS = [
  { value: '', label: 'Alle typer' },
  { value: REFERENCE_TYPES.COACH_DEMO, label: 'Coach Demo' },
  { value: REFERENCE_TYPES.PRO_REFERENCE, label: 'Pro Referanse' },
  { value: REFERENCE_TYPES.DRILL_INSTRUCTION, label: 'Øvelse' },
  { value: REFERENCE_TYPES.TECHNIQUE_BREAKDOWN, label: 'Teknikk' },
];

// Select dropdown arrow SVG
const selectBgImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Demo videos for development
 */
const DEMO_VIDEOS = [
  {
    id: '1',
    title: 'Full Swing Grunnlag',
    description: 'Grunnleggende teknikk for full swing med fokus på grip og stance.',
    type: REFERENCE_TYPES.COACH_DEMO,
    category: 'full_swing',
    duration: 185,
    thumbnailUrl: null,
    viewCount: 47,
    sharedWith: 12,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Tiger Woods - Impact Position',
    description: 'Analyse av Tigers impact position og hvordan oppnå lignende.',
    type: REFERENCE_TYPES.PRO_REFERENCE,
    category: 'full_swing',
    duration: 124,
    thumbnailUrl: null,
    viewCount: 89,
    sharedWith: 18,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Putting Grønnlesing',
    description: 'Hvordan lese greenen og velge riktig linje.',
    type: REFERENCE_TYPES.DRILL_INSTRUCTION,
    category: 'putting',
    duration: 210,
    thumbnailUrl: null,
    viewCount: 34,
    sharedWith: 8,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Chip & Run Teknikk',
    description: 'Steg-for-steg gjennomgang av chip and run shot.',
    type: REFERENCE_TYPES.TECHNIQUE_BREAKDOWN,
    category: 'chipping',
    duration: 156,
    thumbnailUrl: null,
    viewCount: 56,
    sharedWith: 15,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    title: 'Bunker Shot Øvelse',
    description: '3 øvelser for å forbedre bunker-spillet ditt.',
    type: REFERENCE_TYPES.DRILL_INSTRUCTION,
    category: 'bunker',
    duration: 278,
    thumbnailUrl: null,
    viewCount: 23,
    sharedWith: 6,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Demo players for development
 */
const DEMO_PLAYERS = [
  { id: '1', name: 'Emma Hansen', level: 'Grønn', initials: 'EH' },
  { id: '2', name: 'Oliver Berg', level: 'Blå', initials: 'OB' },
  { id: '3', name: 'Nora Olsen', level: 'Rød', initials: 'NO' },
  { id: '4', name: 'Henrik Nilsen', level: 'Hvit', initials: 'HN' },
  { id: '5', name: 'Maja Andersen', level: 'Grønn', initials: 'MA' },
];

/**
 * ReferenceLibrary Component
 */
export function ReferenceLibrary({
  videos: propVideos,
  players: propPlayers,
  onUpload,
  onShare,
  onCompare,
  onEdit,
  onDelete,
  onPlay,
  className,
}) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const currentUserId = user?.id;

  // Fetch videos from API - filter for reference/coach videos
  const {
    videos: apiVideos,
    loading,
    error,
    refresh: refetchVideos,
    removeVideoFromList,
    addVideoToList,
  } = useVideos({
    status: 'ready',
    visibility: 'reference',
    autoFetch: true,
  });

  // Video upload hook
  const upload = useVideoUpload({
    onUploadComplete: (video) => {
      // Add to list and close modal
      addVideoToList(video);
      setShowUploadModal(false);
      resetUploadForm();
    },
    onError: (err) => {
      console.error('Upload failed:', err);
    },
  });

  // Players state
  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(true);

  // Fetch players/athletes on mount
  useEffect(() => {
    async function fetchPlayers() {
      if (propPlayers) {
        setPlayers(propPlayers);
        setPlayersLoading(false);
        return;
      }

      try {
        setPlayersLoading(true);
        const response = await coachesAPI.getAthletes();
        const athleteData = response.data?.data || response.data || [];
        const mappedPlayers = athleteData.map(p => ({
          id: p.id || p.playerId,
          name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Ukjent spiller',
          level: p.level || p.tier || '',
          initials: getInitials(p.name || `${p.firstName || ''} ${p.lastName || ''}`),
        }));
        setPlayers(mappedPlayers.length > 0 ? mappedPlayers : DEMO_PLAYERS);
      } catch (err) {
        console.error('Failed to fetch players:', err);
        setPlayers(DEMO_PLAYERS);
      } finally {
        setPlayersLoading(false);
      }
    }
    fetchPlayers();
  }, [propPlayers]);

  // Map API videos to expected format
  const videos = useMemo(() => {
    if (propVideos) return propVideos;
    if (apiVideos.length > 0) {
      return apiVideos.map(v => ({
        id: v.id,
        title: v.title,
        description: v.description,
        type: v.referenceType || v.type || REFERENCE_TYPES.COACH_DEMO,
        category: v.category || 'full_swing',
        duration: v.duration,
        thumbnailUrl: v.thumbnailUrl,
        viewCount: v.viewCount || 0,
        sharedWith: v.sharedWithCount || v.sharedWith || 0,
        createdAt: v.createdAt,
        uploadedById: v.uploadedById || v.playerId,
      }));
    }
    return DEMO_VIDEOS;
  }, [propVideos, apiVideos]);

  // Get initials helper
  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: REFERENCE_TYPES.COACH_DEMO,
    category: 'full_swing',
    file: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

  // Reset upload form
  const resetUploadForm = useCallback(() => {
    setUploadForm({
      title: '',
      description: '',
      type: REFERENCE_TYPES.COACH_DEMO,
      category: 'full_swing',
      file: null,
    });
    upload.reset();
  }, [upload]);

  // Filter videos
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = video.title.toLowerCase().includes(query);
        const matchesDescription = video.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Category filter
      if (categoryFilter && video.category !== categoryFilter) return false;

      // Type filter
      if (typeFilter && video.type !== typeFilter) return false;

      return true;
    });
  }, [videos, searchQuery, categoryFilter, typeFilter]);

  // Handle video play - navigate to video player
  const handlePlay = useCallback((video) => {
    if (onPlay) {
      onPlay(video);
    } else {
      navigate(`/coach/videos/${video.id}/view`);
    }
  }, [onPlay, navigate]);

  // Handle share click
  const handleShareClick = useCallback((video) => {
    setSelectedVideo(video);
    setSelectedPlayers(new Set());
    setShowShareModal(true);
  }, []);

  // Handle share confirm - call API
  const handleShareConfirm = useCallback(async () => {
    if (!selectedVideo || selectedPlayers.size === 0 || isSharing) return;

    setIsSharing(true);
    try {
      // Call share callback or API
      if (onShare) {
        await onShare(selectedVideo, Array.from(selectedPlayers));
      } else {
        // Call video share API
        await videoApi.shareVideo(selectedVideo.id, Array.from(selectedPlayers));
      }

      // Track analytics
      track('video_shared', {
        videoId: selectedVideo.id,
        count: selectedPlayers.size,
        source: 'reference_library',
      });

      // Success feedback
      showNotification(
        `Video delt med ${selectedPlayers.size} ${selectedPlayers.size === 1 ? 'spiller' : 'spillere'}!`,
        'success'
      );

      setShowShareModal(false);
      setSelectedVideo(null);
      setSelectedPlayers(new Set());
    } catch (err) {
      console.error('Failed to share video:', err);
      showNotification('Kunne ikke dele video. Prøv igjen.', 'error');
    } finally {
      setIsSharing(false);
    }
  }, [selectedVideo, selectedPlayers, isSharing, onShare, showNotification]);

  // Handle player toggle
  const handlePlayerToggle = useCallback((playerId) => {
    setSelectedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  }, []);

  // Handle compare - navigate to comparison view
  const handleCompare = useCallback((video) => {
    if (onCompare) {
      onCompare(video);
    } else {
      navigate(`/coach/videos/compare?reference=${video.id}`);
    }
  }, [onCompare, navigate]);

  // Handle edit - navigate to edit view
  const handleEdit = useCallback((video) => {
    if (onEdit) {
      onEdit(video);
    } else {
      navigate(`/coach/videos/${video.id}/edit`);
    }
  }, [onEdit, navigate]);

  // Handle delete - show confirmation modal
  const handleDelete = useCallback((video) => {
    if (isDeleting) return;
    setVideoToDelete(video);
  }, [isDeleting]);

  // Confirm and execute deletion
  const handleConfirmDelete = useCallback(async () => {
    if (!videoToDelete) return;

    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(videoToDelete);
      } else {
        await videoApi.deleteVideo(videoToDelete.id);
      }
      // Remove from local list
      removeVideoFromList(videoToDelete.id);
      showNotification('Video slettet', 'success');
    } catch (err) {
      console.error('Failed to delete video:', err);
      showNotification('Kunne ikke slette video. Prøv igjen.', 'error');
    } finally {
      setIsDeleting(false);
      setVideoToDelete(null);
    }
  }, [videoToDelete, onDelete, removeVideoFromList, showNotification]);

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setUploadForm((prev) => ({ ...prev, file }));
    }
  }, []);

  // Handle file select
  const handleFileSelect = useCallback((e) => {
    const file = e.target?.files?.[0];
    if (file) {
      setUploadForm((prev) => ({ ...prev, file }));
    }
  }, []);

  // Handle upload submit - use upload hook or callback
  const handleUploadSubmit = useCallback(async () => {
    if (!uploadForm.title || !uploadForm.file) return;

    if (onUpload) {
      // Use callback if provided
      await onUpload(uploadForm);
      setShowUploadModal(false);
      resetUploadForm();
    } else {
      // Use the upload hook - set file and metadata, then start upload
      upload.handleFileSelect({ target: { files: [uploadForm.file] } });
      upload.updateMetadata('title', uploadForm.title);
      upload.updateMetadata('description', uploadForm.description);
      upload.updateMetadata('category', uploadForm.category);

      // Wait for file to be validated, then start upload
      setTimeout(() => {
        if (upload.uploadState === UPLOAD_STATES.READY) {
          upload.startUpload();
        }
      }, 100);
    }
  }, [uploadForm, onUpload, upload, resetUploadForm]);

  // Check if current user is owner
  const isOwner = useCallback((video) => {
    return video.uploadedById === currentUserId || !video.uploadedById;
  }, [currentUserId]);

  // Loading state
  if (loading && videos.length === 0) {
    return (
      <div className={`flex flex-col gap-4 p-4 ${className || ''}`}>
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-[3px] border-tier-border-default border-t-tier-navy rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 p-4 ${className || ''}`}>
      {/* Error state */}
      {error && (
        <div className="p-4 bg-tier-error/10 rounded-xl border border-tier-error flex items-center justify-between mb-4">
          <span className="text-tier-navy text-sm">{error}</span>
          <Button variant="primary" size="sm" onClick={refetchVideos}>
            Prøv igjen
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <SectionTitle className="m-0 text-xl font-bold text-tier-navy">
            Referansebibliotek
          </SectionTitle>
          <span className="py-1 px-2.5 bg-tier-surface-base rounded-full text-xs font-semibold text-tier-text-secondary">
            {videos.length} videoer
          </span>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setShowUploadModal(true)}
        >
          Last opp video
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap p-3 bg-tier-surface-base rounded-xl border border-tier-border-default">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Søk i videoer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2.5 pl-9 pr-3 bg-tier-white border border-tier-border-default rounded-lg text-tier-navy text-sm outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="py-2.5 pl-3 pr-8 bg-tier-white border border-tier-border-default rounded-lg text-tier-navy text-sm cursor-pointer outline-none appearance-none bg-no-repeat bg-[right_10px_center]"
          style={{ backgroundImage: selectBgImage }}
        >
          {VIDEO_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="py-2.5 pl-3 pr-8 bg-tier-white border border-tier-border-default rounded-lg text-tier-navy text-sm cursor-pointer outline-none appearance-none bg-no-repeat bg-[right_10px_center]"
          style={{ backgroundImage: selectBgImage }}
        >
          {TYPE_OPTIONS.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Video grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {filteredVideos.map((video) => (
            <ReferenceVideoCard
              key={video.id}
              video={video}
              isOwner={isOwner(video)}
              onPlay={handlePlay}
              onShare={handleShareClick}
              onCompare={handleCompare}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <FileVideo size={64} className="text-tier-text-tertiary mb-4 opacity-50" />
          <SubSectionTitle className="m-0 mb-2 text-lg font-semibold text-tier-navy">
            Ingen videoer funnet
          </SubSectionTitle>
          <p className="m-0 mb-4 text-sm text-tier-text-secondary max-w-[300px]">
            {searchQuery || categoryFilter || typeFilter
              ? 'Prøv å justere søket eller filtrene dine.'
              : 'Last opp din første referansevideo for å komme i gang.'}
          </p>
          {!searchQuery && !categoryFilter && !typeFilter && (
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={() => setShowUploadModal(true)}
            >
              Last opp video
            </Button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="w-full max-w-[500px] bg-tier-white rounded-2xl border border-tier-border-default shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-tier-border-default">
              <SubSectionTitle className="m-0 text-lg font-semibold text-tier-navy">
                Last opp referansevideo
              </SubSectionTitle>
              <button
                className="w-8 h-8 rounded-lg bg-transparent border-none text-tier-text-secondary cursor-pointer flex items-center justify-center"
                onClick={() => setShowUploadModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {/* File upload */}
              {!uploadForm.file ? (
                <div
                  className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    isDragging
                      ? 'border-tier-navy bg-tier-navy/10'
                      : 'border-tier-border-default'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <Upload size={48} className="text-tier-text-tertiary" />
                  <span className="text-sm text-tier-text-secondary text-center">
                    Dra og slipp video her, eller klikk for å velge
                  </span>
                  <span className="text-xs text-tier-text-tertiary">
                    MP4, MOV, WebM (maks 5 min)
                  </span>
                  <input
                    id="file-input"
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-tier-surface-base rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-tier-navy flex items-center justify-center text-white">
                    <Video size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-tier-navy overflow-hidden text-ellipsis whitespace-nowrap">
                      {uploadForm.file.name}
                    </div>
                    <div className="text-xs text-tier-text-tertiary">
                      {formatFileSize(uploadForm.file.size)}
                    </div>
                  </div>
                  <button
                    className="w-7 h-7 rounded bg-transparent border-none text-tier-text-tertiary cursor-pointer flex items-center justify-center"
                    onClick={() => setUploadForm((prev) => ({ ...prev, file: null }))}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-tier-text-secondary">
                  Tittel *
                </label>
                <input
                  type="text"
                  placeholder="F.eks. Full Swing Grunnlag"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="py-2.5 px-3 bg-tier-surface-base border border-tier-border-default rounded-lg text-tier-navy text-sm outline-none"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-tier-text-secondary">
                  Beskrivelse
                </label>
                <textarea
                  placeholder="Beskriv hva videoen viser..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="py-2.5 px-3 bg-tier-surface-base border border-tier-border-default rounded-lg text-tier-navy text-sm outline-none resize-y min-h-[80px]"
                />
              </div>

              {/* Type */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-tier-text-secondary">
                  Type
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="py-2.5 pl-3 pr-8 bg-tier-surface-base border border-tier-border-default rounded-lg text-tier-navy text-sm cursor-pointer outline-none appearance-none bg-no-repeat bg-[right_10px_center]"
                  style={{ backgroundImage: selectBgImage }}
                >
                  {TYPE_OPTIONS.slice(1).map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-tier-text-secondary">
                  Kategori
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="py-2.5 pl-3 pr-8 bg-tier-surface-base border border-tier-border-default rounded-lg text-tier-navy text-sm cursor-pointer outline-none appearance-none bg-no-repeat bg-[right_10px_center]"
                  style={{ backgroundImage: selectBgImage }}
                >
                  {VIDEO_CATEGORIES.slice(1).map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-tier-border-default">
              <Button
                variant="secondary"
                onClick={() => setShowUploadModal(false)}
              >
                Avbryt
              </Button>
              <Button
                variant="primary"
                onClick={handleUploadSubmit}
                disabled={!uploadForm.title || !uploadForm.file}
              >
                Last opp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedVideo && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-[400px] bg-tier-white rounded-2xl border border-tier-border-default shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-tier-border-default">
              <SubSectionTitle className="m-0 text-lg font-semibold text-tier-navy">
                Del med spillere
              </SubSectionTitle>
              <button
                className="w-8 h-8 rounded-lg bg-transparent border-none text-tier-text-secondary cursor-pointer flex items-center justify-center"
                onClick={() => setShowShareModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <p className="m-0 text-sm text-tier-text-secondary">
                Velg spillere som skal få tilgang til "{selectedVideo.title}"
              </p>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                {players.map((player) => {
                  const isSelected = selectedPlayers.has(player.id);
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-tier-navy/20 outline outline-1 outline-tier-navy'
                          : 'bg-tier-surface-base'
                      }`}
                      onClick={() => handlePlayerToggle(player.id)}
                    >
                      <div className="w-9 h-9 rounded-full bg-tier-navy flex items-center justify-center text-sm font-semibold text-white">
                        {player.initials}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-tier-navy">
                          {player.name}
                        </div>
                        <div className="text-xs text-tier-text-tertiary">
                          {player.level}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-tier-navy border-tier-navy'
                            : 'bg-transparent border-tier-border-default'
                        }`}
                      >
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-tier-border-default">
              <Button
                variant="secondary"
                onClick={() => setShowShareModal(false)}
              >
                Avbryt
              </Button>
              <Button
                variant="primary"
                onClick={handleShareConfirm}
                disabled={selectedPlayers.size === 0}
              >
                Del med {selectedPlayers.size} {selectedPlayers.size === 1 ? 'spiller' : 'spillere'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {videoToDelete && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4"
          onClick={() => setVideoToDelete(null)}
        >
          <div
            className="w-full max-w-[400px] bg-tier-white rounded-2xl border border-tier-border-default shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-tier-border-default">
              <SubSectionTitle className="m-0 text-lg font-semibold text-tier-navy">
                Slett video
              </SubSectionTitle>
              <button
                className="w-8 h-8 rounded-lg bg-transparent border-none text-tier-text-secondary cursor-pointer flex items-center justify-center"
                onClick={() => setVideoToDelete(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <p className="m-0 text-tier-text-secondary">
                Er du sikker på at du vil slette "{videoToDelete.title}"?
                Denne handlingen kan ikke angres.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-tier-border-default">
              <Button
                variant="secondary"
                onClick={() => setVideoToDelete(null)}
              >
                Avbryt
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                loading={isDeleting}
                className="bg-tier-error hover:bg-tier-error/90"
              >
                {isDeleting ? 'Sletter...' : 'Slett video'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReferenceLibrary;
