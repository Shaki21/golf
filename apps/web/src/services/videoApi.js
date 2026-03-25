/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars, no-loop-func, import/no-anonymous-default-export */
/**
 * Video API Client
 * API functions for video upload, management, annotations, and comparisons
 */

import apiClient from './apiClient';

// ============================================================================
// VIDEOS
// ============================================================================

/**
 * Initiate multipart upload
 * @param {Object} params - Upload parameters
 * @param {string} params.clientUploadId - Client-generated UUID for idempotency
 * @param {string} params.title - Video title
 * @param {string} params.playerId - Player ID
 * @param {string} params.fileName - Original file name
 * @param {number} params.fileSize - File size in bytes
 * @param {string} params.mimeType - Video MIME type
 * @param {string} [params.category] - Video category
 * @param {string} [params.clubType] - Club type
 * @param {string} [params.viewAngle] - Camera view angle
 * @param {string} [params.description] - Video description
 * @returns {Promise<{videoId: string, uploadId: string, key: string, signedUrls: string[]}>}
 */
export async function initiateUpload(params) {
  const response = await apiClient.post('/videos/upload/init', params);
  return response.data.data;
}

/**
 * Complete multipart upload
 * @param {Object} params - Completion parameters
 * @param {string} params.videoId - Video ID from initiate
 * @param {string} params.uploadId - Upload ID from initiate
 * @param {Array<{etag: string, partNumber: number}>} params.parts - Uploaded parts
 * @param {number} params.duration - Video duration in seconds
 * @param {number} [params.width] - Video width
 * @param {number} [params.height] - Video height
 * @param {number} [params.fps] - Frames per second
 * @returns {Promise<{video: Object}>}
 */
export async function completeUpload(params) {
  const response = await apiClient.post('/videos/upload/complete', params);
  return response.data.data;
}

/**
 * List videos with filters
 * @param {Object} params - Query parameters
 * @param {string} [params.playerId] - Filter by player
 * @param {string} [params.category] - Filter by category
 * @param {string} [params.status] - Filter by status
 * @param {number} [params.limit=20] - Results per page
 * @param {number} [params.offset=0] - Pagination offset
 * @param {string} [params.sortBy='createdAt'] - Sort field
 * @param {string} [params.sortOrder='desc'] - Sort direction
 * @returns {Promise<{videos: Array, total: number, limit: number, offset: number}>}
 */
export async function listVideos(params = {}) {
  const response = await apiClient.get('/videos', { params });
  return response.data.data;
}

/**
 * Get video by ID
 * @param {string} videoId - Video ID
 * @returns {Promise<Object>}
 */
export async function getVideo(videoId) {
  const response = await apiClient.get(`/videos/${videoId}`);
  return response.data.data;
}

/**
 * Get signed playback URL
 * @param {string} videoId - Video ID
 * @param {number} [expiresIn=300] - URL expiration in seconds
 * @returns {Promise<{url: string, expiresAt: string}>}
 */
export async function getPlaybackUrl(videoId, expiresIn = 300) {
  const response = await apiClient.get(`/videos/${videoId}/playback`, {
    params: { expiresIn },
  });
  return response.data.data;
}

/**
 * Update video metadata
 * @param {string} videoId - Video ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateVideo(videoId, updates) {
  await apiClient.patch(`/videos/${videoId}`, updates);
}

/**
 * Delete video
 * @param {string} videoId - Video ID
 * @param {boolean} [hardDelete=false] - Permanently delete
 * @returns {Promise<void>}
 */
export async function deleteVideo(videoId, hardDelete = false) {
  await apiClient.delete(`/videos/${videoId}`, {
    params: { hardDelete },
  });
}

/**
 * Share video with players
 * @param {string} videoId - Video ID
 * @param {string[]} playerIds - Array of player IDs to share with
 * @returns {Promise<{shared: number, alreadyShared: number}>}
 */
export async function shareVideo(videoId, playerIds) {
  const response = await apiClient.post(`/videos/${videoId}/share`, {
    playerIds,
  });
  return response.data.data;
}

/**
 * Get shares for a video
 * @param {string} videoId - Video ID
 * @returns {Promise<{shares: Array}>}
 */
export async function getVideoShares(videoId) {
  const response = await apiClient.get(`/videos/${videoId}/shares`);
  return response.data.data;
}

/**
 * Remove a share from a video
 * @param {string} videoId - Video ID
 * @param {string} playerId - Player ID to remove share from
 * @returns {Promise<void>}
 */
export async function removeVideoShare(videoId, playerId) {
  await apiClient.delete(`/videos/${videoId}/shares/${playerId}`);
}

// ============================================================================
// THUMBNAILS
// ============================================================================

/**
 * Get thumbnail URL for a video
 * @param {string} videoId - Video ID
 * @param {number} [expiresIn=3600] - URL expiration in seconds
 * @returns {Promise<{url: string|null, expiresAt: string|null}>}
 */
export async function getThumbnailUrl(videoId, expiresIn = 3600) {
  const response = await apiClient.get(`/videos/${videoId}/thumbnail`, {
    params: { expiresIn },
  });
  return response.data.data;
}

/**
 * Upload thumbnail for a video
 * @param {string} videoId - Video ID
 * @param {string} imageBase64 - Base64 encoded image data
 * @param {string} [mimeType='image/jpeg'] - Image MIME type
 * @returns {Promise<{thumbnailKey: string, thumbnailUrl: string}>}
 */
export async function uploadThumbnail(videoId, imageBase64, mimeType = 'image/jpeg') {
  const response = await apiClient.post(`/videos/${videoId}/thumbnail`, {
    image: imageBase64,
    mimeType,
  });
  return response.data.data;
}

/**
 * Extract thumbnail from video file using canvas
 * @param {File} videoFile - Video file
 * @param {number} [time=1] - Time in seconds to capture frame
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
export async function extractVideoThumbnail(videoFile, time = 1) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.onloadedmetadata = () => {
      // Seek to specified time, clamped to video duration
      video.currentTime = Math.min(time, video.duration || 1);
    };

    video.onseeked = () => {
      // Set canvas size to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1];

      // Cleanup
      URL.revokeObjectURL(video.src);

      resolve({
        base64,
        mimeType: 'image/jpeg',
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video for thumbnail extraction'));
    };

    // Load video file
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
}

// ============================================================================
// VIDEO REQUESTS
// ============================================================================

/**
 * Create a video request (coach requests player to upload)
 * @param {Object} params - Request parameters
 * @param {string} params.playerId - Player ID to request video from
 * @param {string} [params.drillType] - Type of drill
 * @param {string} [params.category] - Video category
 * @param {string} [params.viewAngle] - Requested view angle
 * @param {string} [params.instructions] - Instructions for the player
 * @param {string} [params.dueDate] - Due date ISO string
 * @returns {Promise<{id: string, playerId: string, status: string, createdAt: string}>}
 */
export async function createVideoRequest(params) {
  const response = await apiClient.post('/videos/requests', params);
  return response.data.data;
}

/**
 * List video requests
 * @param {Object} [params] - Query parameters
 * @param {string} [params.playerId] - Filter by player ID
 * @param {string} [params.status] - Filter by status
 * @param {number} [params.limit] - Results per page
 * @param {number} [params.offset] - Pagination offset
 * @returns {Promise<{requests: Array, total: number}>}
 */
export async function listVideoRequests(params = {}) {
  const response = await apiClient.get('/videos/requests', { params });
  return response.data.data;
}

/**
 * Update video request status
 * @param {string} requestId - Request ID
 * @param {Object} updates - Fields to update
 * @param {string} updates.status - New status
 * @param {string} [updates.fulfilledVideoId] - Video ID if fulfilled
 * @returns {Promise<void>}
 */
export async function updateVideoRequest(requestId, updates) {
  await apiClient.patch(`/videos/requests/${requestId}`, updates);
}

// ============================================================================
// ANNOTATIONS
// ============================================================================

/**
 * Create annotation
 * @param {Object} params - Annotation data
 * @returns {Promise<Object>}
 */
export async function createAnnotation(params) {
  const response = await apiClient.post('/annotations', params);
  return response.data.data;
}

/**
 * Create multiple annotations at once
 * @param {string} videoId - Video ID
 * @param {Array} annotations - Annotation data array
 * @returns {Promise<{created: number}>}
 */
export async function bulkCreateAnnotations(videoId, annotations) {
  const response = await apiClient.post('/annotations/bulk', {
    videoId,
    annotations,
  });
  return response.data.data;
}

/**
 * List annotations for a video
 * @param {string} videoId - Video ID
 * @param {Object} [params] - Query parameters
 * @returns {Promise<{annotations: Array, total: number}>}
 */
export async function listAnnotations(videoId, params = {}) {
  const response = await apiClient.get(`/annotations/video/${videoId}`, { params });
  return response.data.data;
}

/**
 * Get annotation by ID
 * @param {string} annotationId - Annotation ID
 * @returns {Promise<Object>}
 */
export async function getAnnotation(annotationId) {
  const response = await apiClient.get(`/annotations/${annotationId}`);
  return response.data.data;
}

/**
 * Update annotation
 * @param {string} annotationId - Annotation ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateAnnotation(annotationId, updates) {
  await apiClient.patch(`/annotations/${annotationId}`, updates);
}

/**
 * Delete annotation
 * @param {string} annotationId - Annotation ID
 * @returns {Promise<void>}
 */
export async function deleteAnnotation(annotationId) {
  await apiClient.delete(`/annotations/${annotationId}`);
}

/**
 * Get signed URL for audio upload
 * @param {string} annotationId - Annotation ID
 * @param {string} mimeType - Audio MIME type
 * @param {number} duration - Audio duration in seconds
 * @returns {Promise<{uploadUrl: string, audioKey: string, expiresAt: string}>}
 */
export async function getAudioUploadUrl(annotationId, mimeType, duration) {
  const response = await apiClient.post(`/annotations/${annotationId}/audio/upload-url`, {
    mimeType,
    duration,
  });
  return response.data.data;
}

/**
 * Confirm audio upload
 * @param {string} annotationId - Annotation ID
 * @param {number} audioDuration - Audio duration in seconds
 * @returns {Promise<void>}
 */
export async function confirmAudioUpload(annotationId, audioDuration) {
  await apiClient.post(`/annotations/${annotationId}/audio/confirm`, {
    audioDuration,
  });
}

/**
 * Get signed URL for audio playback
 * @param {string} annotationId - Annotation ID
 * @param {number} [expiresIn=300] - URL expiration in seconds
 * @returns {Promise<{url: string, expiresAt: string}>}
 */
export async function getAudioPlaybackUrl(annotationId, expiresIn = 300) {
  const response = await apiClient.get(`/annotations/${annotationId}/audio/playback`, {
    params: { expiresIn },
  });
  return response.data.data;
}

// ============================================================================
// COMMENTS
// ============================================================================

/**
 * Create comment
 * @param {Object} params - Comment data
 * @returns {Promise<Object>}
 */
export async function createComment(params) {
  const response = await apiClient.post('/comments', params);
  return response.data.data;
}

/**
 * List comments for a video
 * @param {string} videoId - Video ID
 * @param {Object} [params] - Query parameters
 * @returns {Promise<{comments: Array, total: number}>}
 */
export async function listComments(videoId, params = {}) {
  const response = await apiClient.get(`/comments/video/${videoId}`, { params });
  return response.data.data;
}

/**
 * Get comment count for a video
 * @param {string} videoId - Video ID
 * @returns {Promise<{count: number}>}
 */
export async function getCommentCount(videoId) {
  const response = await apiClient.get(`/comments/video/${videoId}/count`);
  return response.data.data;
}

/**
 * Get comment by ID
 * @param {string} commentId - Comment ID
 * @returns {Promise<Object>}
 */
export async function getComment(commentId) {
  const response = await apiClient.get(`/comments/${commentId}`);
  return response.data.data;
}

/**
 * Get replies to a comment
 * @param {string} commentId - Parent comment ID
 * @param {Object} [params] - Query parameters
 * @returns {Promise<{replies: Array, total: number}>}
 */
export async function getCommentReplies(commentId, params = {}) {
  const response = await apiClient.get(`/comments/${commentId}/replies`, { params });
  return response.data.data;
}

/**
 * Update comment
 * @param {string} commentId - Comment ID
 * @param {string} body - New comment body
 * @returns {Promise<void>}
 */
export async function updateComment(commentId, body) {
  await apiClient.patch(`/comments/${commentId}`, { body });
}

/**
 * Delete comment
 * @param {string} commentId - Comment ID
 * @returns {Promise<void>}
 */
export async function deleteComment(commentId) {
  await apiClient.delete(`/comments/${commentId}`);
}

// ============================================================================
// COMPARISONS
// ============================================================================

/**
 * Create comparison
 * @param {Object} params - Comparison data
 * @returns {Promise<Object>}
 */
export async function createComparison(params) {
  const response = await apiClient.post('/comparisons', params);
  return response.data.data;
}

/**
 * List comparisons
 * @param {Object} [params] - Query parameters
 * @returns {Promise<{comparisons: Array, total: number}>}
 */
export async function listComparisons(params = {}) {
  const response = await apiClient.get('/comparisons', { params });
  return response.data.data;
}

/**
 * Get comparisons for a specific video
 * @param {string} videoId - Video ID
 * @returns {Promise<{comparisons: Array}>}
 */
export async function getVideoComparisons(videoId) {
  const response = await apiClient.get(`/comparisons/video/${videoId}`);
  return response.data.data;
}

/**
 * Get comparison by ID (includes playback URLs)
 * @param {string} comparisonId - Comparison ID
 * @returns {Promise<Object>}
 */
export async function getComparison(comparisonId) {
  const response = await apiClient.get(`/comparisons/${comparisonId}`);
  return response.data.data;
}

/**
 * Update comparison
 * @param {string} comparisonId - Comparison ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateComparison(comparisonId, updates) {
  await apiClient.patch(`/comparisons/${comparisonId}`, updates);
}

/**
 * Delete comparison
 * @param {string} comparisonId - Comparison ID
 * @returns {Promise<void>}
 */
export async function deleteComparison(comparisonId) {
  await apiClient.delete(`/comparisons/${comparisonId}`);
}

// ============================================================================
// KEYFRAMES
// ============================================================================

/**
 * Extract keyframe from video at specific timestamp
 * @param {Object} params - Keyframe parameters
 * @param {string} params.videoId - Video ID
 * @param {number} params.timestamp - Timestamp in seconds
 * @param {string} [params.label] - Optional label for keyframe
 * @param {string} [params.notes] - Optional notes
 * @returns {Promise<Object>} Created keyframe
 */
export async function extractKeyframe(params) {
  const response = await apiClient.post('/video-keyframes', params);
  return response.data.data;
}

/**
 * List keyframes for a video
 * @param {string} videoId - Video ID
 * @returns {Promise<Array>} List of keyframes
 */
export async function listKeyframes(videoId) {
  const response = await apiClient.get(`/video-keyframes/video/${videoId}`);
  return response.data.data;
}

/**
 * Get keyframe by ID
 * @param {string} keyframeId - Keyframe ID
 * @returns {Promise<Object>} Keyframe data
 */
export async function getKeyframe(keyframeId) {
  const response = await apiClient.get(`/video-keyframes/${keyframeId}`);
  return response.data.data;
}

/**
 * Get signed URL for keyframe image
 * @param {string} keyframeId - Keyframe ID
 * @param {number} [expiresIn=3600] - URL expiration in seconds
 * @returns {Promise<{url: string, expiresAt: string}>}
 */
export async function getKeyframeUrl(keyframeId, expiresIn = 3600) {
  const response = await apiClient.get(`/video-keyframes/${keyframeId}/url`, {
    params: { expiresIn },
  });
  return response.data.data;
}

/**
 * Update keyframe metadata
 * @param {string} keyframeId - Keyframe ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export async function updateKeyframe(keyframeId, updates) {
  await apiClient.patch(`/video-keyframes/${keyframeId}`, updates);
}

/**
 * Delete keyframe
 * @param {string} keyframeId - Keyframe ID
 * @returns {Promise<void>}
 */
export async function deleteKeyframe(keyframeId) {
  await apiClient.delete(`/video-keyframes/${keyframeId}`);
}

// ============================================================================
// UPLOAD HELPERS
// ============================================================================

/**
 * Upload a single part to S3 using signed URL
 * @param {string} signedUrl - Pre-signed URL
 * @param {Blob} chunk - File chunk to upload
 * @param {Function} [onProgress] - Progress callback (0-100)
 * @returns {Promise<string>} ETag from response
 */
export async function uploadPart(signedUrl, chunk, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Get ETag from response headers
        const etag = xhr.getResponseHeader('ETag');
        resolve(etag ? etag.replace(/"/g, '') : '');
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.onabort = () => reject(new Error('Upload cancelled'));

    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.send(chunk);
  });
}

/**
 * Upload video using multipart upload
 * @param {Object} params - Upload parameters
 * @param {File} params.file - Video file
 * @param {string} params.playerId - Player ID
 * @param {string} params.title - Video title
 * @param {Object} [params.metadata] - Additional metadata
 * @param {Function} [params.onProgress] - Progress callback (0-100)
 * @param {AbortSignal} [params.signal] - Abort signal for cancellation
 * @param {boolean} [params.autoThumbnail=true] - Auto-generate and upload thumbnail
 * @returns {Promise<Object>} Uploaded video data
 */
export async function uploadVideo({
  file,
  playerId,
  title,
  metadata = {},
  onProgress,
  signal,
  autoThumbnail = true,
}) {
  // Generate client upload ID for idempotency
  const clientUploadId = crypto.randomUUID();

  // Step 1: Initiate multipart upload
  const initResult = await initiateUpload({
    clientUploadId,
    title,
    playerId,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    category: metadata.category,
    clubType: metadata.clubType,
    viewAngle: metadata.viewAngle,
    description: metadata.description,
  });

  const { videoId, uploadId, key, signedUrls } = initResult;

  // Check for cancellation
  if (signal?.aborted) {
    throw new Error('Upload cancelled');
  }

  // Step 2: Upload parts
  const partSize = Math.ceil(file.size / signedUrls.length);
  const uploadedParts = [];
  let totalProgress = 0;

  for (let i = 0; i < signedUrls.length; i++) {
    if (signal?.aborted) {
      throw new Error('Upload cancelled');
    }

    const start = i * partSize;
    const end = Math.min(start + partSize, file.size);
    const chunk = file.slice(start, end);

    const etag = await uploadPart(signedUrls[i], chunk, (partProgress) => {
      // Calculate overall progress
      const completedParts = i;
      const partContribution = partProgress / signedUrls.length;
      const overallProgress = Math.round(
        (completedParts / signedUrls.length) * 100 + partContribution
      );
      if (onProgress && overallProgress !== totalProgress) {
        totalProgress = overallProgress;
        onProgress(overallProgress);
      }
    });

    uploadedParts.push({
      etag,
      partNumber: i + 1,
    });
  }

  // Step 3: Complete multipart upload
  const completeResult = await completeUpload({
    videoId,
    uploadId,
    parts: uploadedParts,
    duration: metadata.duration || 0,
    width: metadata.width,
    height: metadata.height,
    fps: metadata.fps,
  });

  // Step 4: Auto-generate and upload thumbnail
  if (autoThumbnail) {
    try {
      const thumbnailTime = Math.min(1, (metadata.duration || 1) * 0.1);
      const { base64, mimeType } = await extractVideoThumbnail(file, thumbnailTime);
      await uploadThumbnail(videoId, base64, mimeType);
    } catch (thumbnailError) {
      // Log but don't fail upload if thumbnail generation fails
      console.warn('Failed to generate thumbnail:', thumbnailError);
    }
  }

  return completeResult.video;
}

// Default export
export default {
  // Videos
  initiateUpload,
  completeUpload,
  listVideos,
  getVideo,
  getPlaybackUrl,
  updateVideo,
  deleteVideo,
  uploadVideo,
  uploadPart,
  // Sharing
  shareVideo,
  getVideoShares,
  removeVideoShare,
  // Thumbnails
  getThumbnailUrl,
  uploadThumbnail,
  extractVideoThumbnail,
  // Video Requests
  createVideoRequest,
  listVideoRequests,
  updateVideoRequest,
  // Annotations
  createAnnotation,
  bulkCreateAnnotations,
  listAnnotations,
  getAnnotation,
  updateAnnotation,
  deleteAnnotation,
  getAudioUploadUrl,
  confirmAudioUpload,
  getAudioPlaybackUrl,
  // Comments
  createComment,
  listComments,
  getCommentCount,
  getComment,
  getCommentReplies,
  updateComment,
  deleteComment,
  // Comparisons
  createComparison,
  listComparisons,
  getVideoComparisons,
  getComparison,
  updateComparison,
  deleteComparison,
  // Keyframes
  extractKeyframe,
  listKeyframes,
  getKeyframe,
  getKeyframeUrl,
  updateKeyframe,
  deleteKeyframe,
};
