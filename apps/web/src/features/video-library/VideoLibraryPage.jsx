/**
 * VideoLibraryPage
 * Player's video library page with video requests from coach
 *
 * Features:
 * - Show player's video library
 * - Display pending video requests from coach
 * - Upload new videos
 * - Navigate to video analysis
 * - Show shared videos from coach
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoLibrary } from './VideoLibrary';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useVideoRequests, REQUEST_STATUS } from '../../hooks/useVideoRequests';
import * as videoApi from '../../services/videoApi';
import { track } from '../../analytics/track';
import Button from '../../ui/primitives/Button';
import Input from '../../ui/primitives/Input';
import { SectionTitle, SubSectionTitle } from '../../components/typography';
import { PageHeader } from '../../ui/raw-blocks';

// Tailwind classes
const tw = {
  container: 'flex flex-col min-h-full',
  requestsBanner: 'flex items-center gap-3 py-3 px-4 mx-4 mt-4 bg-primary/15 border border-primary rounded-xl',
  requestIcon: 'shrink-0 w-10 h-10 flex items-center justify-center bg-primary rounded-lg text-white',
  requestContent: 'flex-1 min-w-0',
  requestTitle: 'm-0 text-sm font-semibold text-[var(--text-inverse)]',
  requestDescription: 'mt-1 text-[13px] text-[var(--video-text-secondary)]',
  requestActions: 'flex gap-2',
  requestButton: 'py-2 px-4 bg-primary border-none rounded-lg text-white text-[13px] font-medium cursor-pointer',
  dismissButton: 'py-2 px-3 bg-transparent border border-border rounded-lg text-[var(--video-text-secondary)] text-[13px] cursor-pointer',
  uploadModal: 'fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4',
  uploadContent: 'bg-surface rounded-2xl border border-border max-w-[500px] w-full max-h-[90vh] overflow-auto',
  uploadHeader: 'flex items-center justify-between p-4 border-b border-border',
  uploadTitle: 'm-0 text-lg font-semibold text-[var(--text-inverse)]',
  closeButton: 'w-8 h-8 flex items-center justify-center bg-transparent border-none rounded-lg text-[var(--video-text-secondary)] cursor-pointer text-xl',
  uploadBody: 'p-4',
  dropZone: 'flex flex-col items-center justify-center p-8 bg-[rgb(var(--tier-navy-dark))] border-2 border-dashed border-border rounded-xl cursor-pointer transition-all duration-200',
  dropZoneActive: 'border-primary bg-primary/10',
  dropText: 'm-0 text-sm text-[var(--video-text-secondary)] text-center',
  dropSubtext: 'mt-1 text-xs text-[var(--video-text-tertiary)]',
  formGroup: 'mt-4',
  label: 'block mb-1 text-[13px] font-medium text-[var(--video-text-secondary)]',
  input: 'w-full py-2.5 px-3 bg-[rgb(var(--tier-navy-dark))] border border-border rounded-lg text-[var(--text-inverse)] text-sm',
  select: 'w-full py-2.5 px-3 bg-[rgb(var(--tier-navy-dark))] border border-border rounded-lg text-[var(--text-inverse)] text-sm cursor-pointer',
  uploadActions: 'flex justify-end gap-2 p-4 border-t border-border',
  cancelButton: 'py-2.5 px-5 bg-transparent border border-border rounded-lg text-[var(--video-text-secondary)] text-sm cursor-pointer',
  submitButton: 'py-2.5 px-5 bg-primary border-none rounded-lg text-white text-sm font-medium cursor-pointer',
  progressContainer: 'mt-4',
  progressBar: 'h-2 bg-[rgb(var(--tier-navy-dark))] rounded overflow-hidden',
  progressFill: 'h-full bg-primary transition-[width] duration-300',
  progressText: 'mt-1 text-xs text-[var(--video-text-secondary)] text-center',
  fileInfo: 'flex items-center gap-3 p-3 bg-[rgb(var(--tier-navy-dark))] rounded-lg mb-4',
  fileIcon: 'w-10 h-10 flex items-center justify-center bg-primary/20 rounded-lg text-primary',
  fileName: 'flex-1 min-w-0 text-sm text-[var(--text-inverse)] overflow-hidden text-ellipsis whitespace-nowrap',
  fileSize: 'text-xs text-[var(--video-text-tertiary)]',
  removeFileButton: 'p-1 bg-transparent border-none text-[var(--video-text-tertiary)] cursor-pointer text-lg',
};

// Icons
const VideoRequestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const UploadCloudIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const VideoFileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * VideoLibraryPage Component
 */
export function VideoLibraryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Video requests with polling for real-time updates
  const {
    requests: videoRequests,
    loading: loadingRequests,
    cancelRequest,
  } = useVideoRequests({
    status: REQUEST_STATUS.PENDING,
    polling: true,
    pollInterval: 30000, // Poll every 30 seconds
  });

  // State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '',
    viewAngle: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // File input ref
  const fileInputRef = React.useRef(null);

  // Track page view
  useEffect(() => {
    track('screen_view', {
      screen: 'VideoLibraryPage',
      source: 'navigation',
    });
  }, []);

  // Handle video click - navigate to analysis
  const handleVideoClick = useCallback((video) => {
    navigate(`/videos/${video.id}/analyze`);
  }, [navigate]);

  // Handle upload button click
  const handleUploadClick = useCallback(() => {
    setShowUploadModal(true);
    track('upload_modal_opened', { screen: 'VideoLibraryPage' });
  }, []);

  // Handle close upload modal
  const handleCloseUpload = useCallback(() => {
    if (!uploading) {
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadForm({ title: '', category: '', viewAngle: '' });
      setUploadProgress(0);
    }
  }, [uploading]);

  // Handle file select
  const handleFileSelect = useCallback((file) => {
    if (file && file.type.startsWith('video/')) {
      setUploadFile(file);
      // Auto-fill title from filename
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setUploadForm((prev) => ({ ...prev, title }));
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // Handle upload submit
  const handleUploadSubmit = useCallback(async () => {
    if (!uploadFile || !uploadForm.title || uploading) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Extract thumbnail from video (happens quickly, before upload starts)
      let thumbnailData = null;
      try {
        thumbnailData = await videoApi.extractVideoThumbnail(uploadFile, 1); // Extract at 1 second
      } catch (thumbErr) {
        console.warn('Failed to extract thumbnail, continuing without:', thumbErr);
      }

      // Step 2: Upload video
      const uploadedVideo = await videoApi.uploadVideo({
        file: uploadFile,
        playerId: user?.playerId || user?.id,
        title: uploadForm.title,
        metadata: {
          category: uploadForm.category || undefined,
          viewAngle: uploadForm.viewAngle || undefined,
        },
        onProgress: setUploadProgress,
      });

      // Step 3: Upload thumbnail if extraction succeeded
      if (thumbnailData && uploadedVideo?.id) {
        try {
          await videoApi.uploadThumbnail(
            uploadedVideo.id,
            thumbnailData.base64,
            thumbnailData.mimeType
          );
        } catch (thumbUploadErr) {
          console.warn('Failed to upload thumbnail:', thumbUploadErr);
          // Don't fail the whole upload, just log the error
        }
      }

      track('video_uploaded', {
        screen: 'VideoLibraryPage',
        category: uploadForm.category,
        viewAngle: uploadForm.viewAngle,
        hasThumbnail: !!thumbnailData,
      });

      setShowUploadModal(false);
      setUploadFile(null);
      setUploadForm({ title: '', category: '', viewAngle: '' });
      setUploadProgress(0);

      showNotification('Video lastet opp!', 'success');

      // Reload page to show new video
      window.location.reload();
    } catch (err) {
      console.error('Failed to upload video:', err);
      showNotification('Kunne ikke laste opp video. Prøv igjen.', 'error');
    } finally {
      setUploading(false);
    }
  }, [uploadFile, uploadForm, uploading, user, showNotification]);

  // Handle compare videos
  const handleCompare = useCallback((video1, video2) => {
    navigate(`/videos/compare?v1=${video1.id}&v2=${video2.id}`);
  }, [navigate]);

  // Handle fulfill video request
  const handleFulfillRequest = useCallback((request) => {
    setShowUploadModal(true);
    setUploadForm((prev) => ({
      ...prev,
      category: request.category || '',
      viewAngle: request.viewAngle || '',
    }));
    track('fulfill_request_clicked', {
      screen: 'VideoLibraryPage',
      requestId: request.id,
    });
  }, []);

  // Handle dismiss request (cancels the request)
  const handleDismissRequest = useCallback((requestId) => {
    // For now, just cancel the request (removes from pending list)
    cancelRequest(requestId).catch((err) => {
      console.error('Failed to dismiss request:', err);
    });
  }, [cancelRequest]);

  return (
    <div className={tw.container}>
      <PageHeader
        title="Videobibliotek"
        subtitle="Dine golfvideoer for analyse og utvikling"
        helpText="Oversikt over alle dine videoopptak for golfsvinganalyse. Se ventende videoforespørsler fra trener, last opp nye videoer med kategori (full swing, putting, kortspill) og kameravinkel (face on, down the line, ovenfra, siden). Sammenlign videoer side-ved-side og naviger til videoanalyse. Støtter MP4, MOV, WebM (maks 5 min)."
        actions={
          <Button variant="primary" onClick={handleUploadClick}>
            Last opp video
          </Button>
        }
      />

      {/* Video Request Notifications */}
      {videoRequests.length > 0 && (
        <div className={tw.requestsBanner}>
          <div className={tw.requestIcon}>
            <VideoRequestIcon />
          </div>
          <div className={tw.requestContent}>
            <SubSectionTitle className={tw.requestTitle}>
              Treneren din har bedt om {videoRequests.length === 1 ? 'en video' : `${videoRequests.length} videoer`}
            </SubSectionTitle>
            <p className={tw.requestDescription}>
              {videoRequests[0]?.drillType
                ? `${videoRequests[0].drillType}${videoRequests[0].instructions ? ` - ${videoRequests[0].instructions}` : ''}`
                : videoRequests[0]?.instructions || 'Last opp en video for analyse'
              }
            </p>
          </div>
          <div className={tw.requestActions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismissRequest(videoRequests[0].id)}
            >
              Senere
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleFulfillRequest(videoRequests[0])}
            >
              Last opp nå
            </Button>
          </div>
        </div>
      )}

      {/* Video Library */}
      <VideoLibrary
        playerId={user?.playerId || user?.id}
        onVideoClick={handleVideoClick}
        onUploadClick={handleUploadClick}
        onCompareClick={handleCompare}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className={tw.uploadModal}
          onClick={handleCloseUpload}
        >
          <div
            className={tw.uploadContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={tw.uploadHeader}>
              <SectionTitle className={tw.uploadTitle}>Last opp video</SectionTitle>
              <button
                className={tw.closeButton}
                onClick={handleCloseUpload}
                disabled={uploading}
              >
                &times;
              </button>
            </div>

            <div className={tw.uploadBody}>
              {!uploadFile ? (
                <div
                  className={`${tw.dropZone} ${dragActive ? tw.dropZoneActive : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                >
                  <UploadCloudIcon />
                  <p className={tw.dropText}>
                    Dra og slipp video her, eller klikk for å velge
                  </p>
                  <p className={tw.dropSubtext}>
                    MP4, MOV, WebM (maks 5 min)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>
              ) : (
                <>
                  <div className={tw.fileInfo}>
                    <div className={tw.fileIcon}>
                      <VideoFileIcon />
                    </div>
                    <span className={tw.fileName}>{uploadFile.name}</span>
                    <span className={tw.fileSize}>{formatFileSize(uploadFile.size)}</span>
                    {!uploading && (
                      <button
                        className={tw.removeFileButton}
                        onClick={() => setUploadFile(null)}
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  {uploading && (
                    <div className={tw.progressContainer}>
                      <div className={tw.progressBar}>
                        <div
                          className={tw.progressFill}
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className={tw.progressText}>
                        Laster opp... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {!uploading && (
                    <>
                      <div className={tw.formGroup}>
                        <Input
                          label="Tittel *"
                          value={uploadForm.title}
                          onChange={(e) =>
                            setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                          }
                          placeholder="F.eks. Driver swing fra driving range"
                        />
                      </div>

                      <div className={tw.formGroup}>
                        <label className={tw.label}>Kategori</label>
                        <select
                          className={tw.select}
                          value={uploadForm.category}
                          onChange={(e) =>
                            setUploadForm((prev) => ({ ...prev, category: e.target.value }))
                          }
                        >
                          <option value="">Velg kategori</option>
                          <option value="swing">Full swing</option>
                          <option value="putting">Putting</option>
                          <option value="short_game">Kortspill</option>
                          <option value="other">Annet</option>
                        </select>
                      </div>

                      <div className={tw.formGroup}>
                        <label className={tw.label}>Kameravinkel</label>
                        <select
                          className={tw.select}
                          value={uploadForm.viewAngle}
                          onChange={(e) =>
                            setUploadForm((prev) => ({ ...prev, viewAngle: e.target.value }))
                          }
                        >
                          <option value="">Velg vinkel</option>
                          <option value="face_on">Face on (forfra)</option>
                          <option value="down_the_line">Down the line (bakfra)</option>
                          <option value="overhead">Ovenfra</option>
                          <option value="side">Siden</option>
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            <div className={tw.uploadActions}>
              <Button
                variant="ghost"
                onClick={handleCloseUpload}
                disabled={uploading}
              >
                Avbryt
              </Button>
              <Button
                variant="primary"
                onClick={handleUploadSubmit}
                disabled={!uploadFile || !uploadForm.title || uploading}
                loading={uploading}
              >
                {uploading ? 'Laster opp...' : 'Last opp'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoLibraryPage;
