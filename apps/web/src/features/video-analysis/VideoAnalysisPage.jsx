/**
 * VideoAnalysisPage
 * Container page that connects VideoAnalyzer to API endpoints
 *
 * Features:
 * - Fetches video metadata and signed playback URL
 * - Loads annotations from API and passes to VideoAnalyzer
 * - Saves/updates annotations via useVideoAnnotations hook
 * - Displays comments panel (if enabled)
 * - Handles loading, error, and empty states
 *
 * DEV TEST INSTRUCTIONS:
 * 1. Navigate to /video/:videoId
 * 2. Video should load with signed playback URL
 * 3. Existing annotations should render on the video
 * 4. Create new annotation -> should save to API
 * 5. Delete annotation -> should remove from API
 * 6. Comments should load and allow posting
 */

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoAnalyzer } from '../../components/video/VideoAnalyzer';
import { KeyframeExtractor } from '../../components/video/KeyframeExtractor';
import { KeyframeGallery } from '../../components/video/KeyframeGallery';
import { useVideo } from '../../hooks/useVideos';
import { useVideoAnnotations, useVideoComments } from '../../hooks/useVideoAnnotations';
import { useAuth } from '../../contexts/AuthContext';
import * as videoApi from '../../services/videoApi';
import { track } from '../../analytics/track';
import Button from '../../ui/primitives/Button';
import Badge from '../../ui/primitives/Badge.primitive';
import StateCard from '../../ui/composites/StateCard';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { SubSectionTitle } from '../../components/typography';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col h-full bg-[var(--tier-navy)]',
  main: 'flex-1 flex gap-4 p-4 overflow-hidden',
  videoSection: 'flex-1 flex flex-col gap-3 min-w-0',
  header: 'flex items-center gap-3',
  backButton: 'flex items-center gap-1 py-2 px-3 bg-surface border border-border rounded-lg text-[var(--video-text-secondary)] text-[13px] cursor-pointer',
  title: 'm-0 text-lg font-semibold text-[var(--text-inverse)] overflow-hidden text-ellipsis whitespace-nowrap flex-1',
  headerActions: 'flex gap-2 ml-auto',
  markReviewedButton: 'flex items-center gap-1 py-2 px-4 bg-tier-success border-none rounded-lg text-white text-[13px] font-medium cursor-pointer',
  reviewedBadge: 'flex items-center gap-1 py-1.5 px-3 bg-tier-success/20 border border-tier-success rounded-lg text-tier-success text-xs font-medium',
  analyzerWrapper: 'flex-1 rounded-xl overflow-hidden',
  sidebar: 'w-80 flex flex-col gap-3 bg-surface rounded-xl border border-border overflow-hidden',
  sidebarHeader: 'py-3 px-4 border-b border-border',
  sidebarTitle: 'm-0 text-sm font-semibold text-[var(--text-inverse)]',
  tabs: 'flex gap-1 p-1 bg-surface-elevated rounded-lg',
  tab: 'flex-1 py-2 px-3 text-sm font-medium text-[var(--video-text-secondary)] bg-transparent border-none rounded-md cursor-pointer transition-all hover:bg-surface-elevated-hover',
  tabActive: 'flex-1 py-2 px-3 text-sm font-medium text-[var(--text-inverse)] bg-surface border-none rounded-md cursor-pointer',
  commentsList: 'flex-1 overflow-y-auto p-3',
  commentItem: 'p-3 bg-[rgb(var(--tier-navy-dark))] rounded-lg mb-2',
  commentAuthor: 'text-xs font-semibold text-primary mb-1',
  commentBody: 'text-[13px] text-[var(--text-inverse)] leading-snug',
  commentTime: 'text-[11px] text-[var(--video-text-tertiary)] mt-1',
  commentInput: 'flex gap-2 p-3 border-t border-border',
  textarea: 'flex-1 py-2 px-3 bg-[rgb(var(--tier-navy-dark))] border border-border rounded-lg text-[var(--text-inverse)] text-[13px] resize-none min-h-[60px]',
  sendButton: 'py-2 px-4 bg-primary border-none rounded-lg text-white text-[13px] font-medium cursor-pointer self-end',
  loadingContainer: 'flex-1 flex items-center justify-center flex-col gap-4 text-[var(--video-text-secondary)]',
  spinner: 'w-10 h-10 border-[3px] border-border border-t-primary rounded-full animate-spin',
  errorContainer: 'flex-1 flex items-center justify-center flex-col gap-4 p-6 text-center',
  errorText: 'text-base text-[var(--text-inverse)] m-0',
  errorSubtext: 'text-[13px] text-[var(--video-text-secondary)] m-0',
  retryButton: 'py-2.5 px-5 bg-primary border-none rounded-lg text-white text-sm font-medium cursor-pointer',
  emptyComments: 'p-4 text-center text-[var(--video-text-tertiary)] text-[13px]',
};

// ═══════════════════════════════════════════
// ADAPTERS: Map between API and VideoAnalyzer formats
// ═══════════════════════════════════════════

/**
 * Map API annotation to VideoAnalyzer format
 */
function apiToAnalyzerAnnotation(apiAnnotation) {
  return {
    id: apiAnnotation.id,
    type: apiAnnotation.type || 'drawing',
    timestamp: apiAnnotation.timestamp || 0,
    duration: apiAnnotation.duration || 0,
    // Drawing data from API
    tool: apiAnnotation.drawingData?.tool || 'line',
    color: apiAnnotation.drawingData?.color || 'var(--status-error)',
    strokeWidth: apiAnnotation.drawingData?.strokeWidth || 3,
    points: apiAnnotation.drawingData?.points || [],
    // Text content if applicable
    text: apiAnnotation.notes || apiAnnotation.drawingData?.text || '',
    // Additional metadata
    createdAt: apiAnnotation.createdAt,
    updatedAt: apiAnnotation.updatedAt,
  };
}

/**
 * Map VideoAnalyzer save data to API payload
 */
function analyzerToApiPayload(saveData) {
  return {
    timestamp: saveData.timestamp,
    duration: 0,
    type: 'drawing',
    drawingData: saveData.drawingData,
    notes: '',
  };
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function VideoAnalysisPage({ showComments = true }) {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [markingReviewed, setMarkingReviewed] = useState(false);
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'keyframes'
  const videoElementRef = useRef(null);

  // Check if current user is coach
  const isCoach = user?.role === 'coach';

  // Analytics: Track page view
  useEffect(() => {
    if (videoId) {
      track('screen_view', {
        screen: 'VideoAnalysisPage',
        source: 'navigation',
        id: videoId,
      });
    }
  }, [videoId]);

  // Fetch video data with playback URL
  const {
    video,
    playbackUrl,
    loading: videoLoading,
    error: videoError,
    refresh: refreshVideo,
  } = useVideo(videoId, { includePlaybackUrl: true });

  // Fetch annotations
  const {
    annotations: apiAnnotations,
    loading: annotationsLoading,
    error: annotationsError,
    createAnnotation,
    bulkCreateAnnotations,
    deleteAnnotation,
    refresh: refreshAnnotations,
  } = useVideoAnnotations(videoId);

  // Fetch comments
  const {
    comments,
    loading: commentsLoading,
    saving: commentsSaving,
    createComment,
    refresh: refreshComments,
  } = useVideoComments(videoId, { autoFetch: showComments });

  // Map API annotations to VideoAnalyzer format
  const analyzerAnnotations = useMemo(() => {
    return apiAnnotations.map(apiToAnalyzerAnnotation);
  }, [apiAnnotations]);

  // Handle annotation save from VideoAnalyzer
  const handleAnnotationSave = useCallback(async (saveData) => {
    try {
      const payload = analyzerToApiPayload(saveData);

      // If there are multiple annotations from canvas, use bulk create
      if (saveData.annotations && saveData.annotations.length > 1) {
        await bulkCreateAnnotations(
          saveData.annotations.map((ann) => ({
            timestamp: saveData.timestamp,
            duration: 0,
            type: 'drawing',
            drawingData: ann,
            notes: '',
          }))
        );
      } else {
        await createAnnotation(payload);
      }

      track('annotation_created', {
        screen: 'VideoAnalysisPage',
        videoId,
        timestamp: saveData.timestamp,
      });
    } catch (err) {
      console.error('Failed to save annotation:', err);
      throw err;
    }
  }, [videoId, createAnnotation, bulkCreateAnnotations]);

  // Handle new comment submission
  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim()) return;

    try {
      await createComment(newComment.trim());
      setNewComment('');
      track('comment_created', {
        screen: 'VideoAnalysisPage',
        videoId,
      });
    } catch (err) {
      console.error('Failed to create comment:', err);
    }
  }, [videoId, newComment, createComment]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle mark as reviewed (coach only)
  const handleMarkReviewed = useCallback(async () => {
    if (!videoId || markingReviewed) return;

    setMarkingReviewed(true);
    try {
      await videoApi.updateVideo(videoId, { status: 'reviewed' });
      // Refresh video to get updated status
      refreshVideo();
      track('video_reviewed', {
        screen: 'VideoAnalysisPage',
        videoId,
      });
    } catch (err) {
      console.error('Failed to mark video as reviewed:', err);
    } finally {
      setMarkingReviewed(false);
    }
  }, [videoId, markingReviewed, refreshVideo]);

  // Check if video is already reviewed
  const isReviewed = video?.status === 'reviewed';

  // Loading state
  if (videoLoading) {
    return (
      <div className={tw.container}>
        <div className={tw.loadingContainer}>
          <StateCard variant="loading" title="Loading video..." />
        </div>
      </div>
    );
  }

  // Error state
  if (videoError || !video) {
    return (
      <div className={tw.container}>
        <div className={tw.errorContainer}>
          <StateCard
            variant="error"
            title="Could not load video"
            description={videoError || 'Video not found'}
            action={<Button variant="primary" onClick={refreshVideo}>Try again</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={tw.container}>
      <div className={tw.main}>
        {/* Video Section */}
        <div className={tw.videoSection}>
          {/* Header */}
          <PageHeader
            title={video.title || 'Video'}
            helpText="Analyze videos of your swing with comparison tools, draw on screen and slow motion playback. Compare with previous videos or professional swings."
            onBack={handleBack}
            divider={false}
            actions={isCoach ? (
              isReviewed ? (
                <Badge variant="success">✓ Reviewed</Badge>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMarkReviewed}
                  disabled={markingReviewed}
                  loading={markingReviewed}
                >
                  {markingReviewed ? 'Saving...' : '✓ Mark as reviewed'}
                </Button>
              )
            ) : null}
          />

          {/* Video Analyzer */}
          <div className={tw.analyzerWrapper}>
            <VideoAnalyzer
              ref={videoElementRef}
              src={playbackUrl}
              poster={video.thumbnailUrl}
              videoId={videoId}
              initialAnnotations={analyzerAnnotations}
              onAnnotationSave={handleAnnotationSave}
              onError={(err) => console.error('Video error:', err)}
            />
          </div>
        </div>

        {/* Sidebar with Tabs */}
        {showComments && (
          <div className={tw.sidebar}>
            <div className={tw.sidebarHeader}>
              {/* Tabs */}
              <div className={tw.tabs}>
                <button
                  className={activeTab === 'comments' ? tw.tabActive : tw.tab}
                  onClick={() => setActiveTab('comments')}
                >
                  💬 Comments ({comments.length})
                </button>
                <button
                  className={activeTab === 'keyframes' ? tw.tabActive : tw.tab}
                  onClick={() => setActiveTab('keyframes')}
                >
                  📸 Keyframes
                </button>
              </div>
            </div>

            {/* Comments Tab Content */}
            {activeTab === 'comments' && (
              <>
                <div className={tw.commentsList}>
              {commentsLoading ? (
                <div className={tw.emptyComments}>Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className={tw.emptyComments}>
                  No comments yet
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className={tw.commentItem}>
                    <div className={tw.commentAuthor}>
                      {comment.author?.name || 'User'}
                    </div>
                    <div className={tw.commentBody}>{comment.body}</div>
                    <div className={tw.commentTime}>
                      {formatRelativeTime(comment.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>

                <div className={tw.commentInput}>
                  <textarea
                    className={tw.textarea}
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={commentsSaving}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || commentsSaving}
                    loading={commentsSaving}
                  >
                    {commentsSaving ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </>
            )}

            {/* Keyframes Tab Content */}
            {activeTab === 'keyframes' && (
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
                <KeyframeExtractor
                  videoId={videoId}
                  videoElement={videoElementRef.current?.videoElement}
                  currentTime={videoElementRef.current?.currentTime || 0}
                  onKeyframeCreated={() => {
                    // Refresh keyframe gallery if needed
                    track('keyframe_created_from_extractor', {
                      screen: 'VideoAnalysisPage',
                      videoId,
                    });
                  }}
                />
                <KeyframeGallery
                  videoId={videoId}
                  onJumpToTimestamp={(timestamp) => {
                    if (videoElementRef.current?.seek) {
                      videoElementRef.current.seek(timestamp);
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoAnalysisPage;
