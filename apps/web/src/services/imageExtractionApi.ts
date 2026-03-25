/**
 * Image Extraction API Service
 *
 * Handles scorecard image uploads and AI extraction flow.
 */

import apiClient from './apiClient';
import manualStatsApi from './manualStatsApi';

// ============================================================================
// TYPES
// ============================================================================

export interface UploadedImage {
  imageId: string;
  filename: string;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

export interface ExtractionProgress {
  roundId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REQUIRES_REVIEW';
  progress: number;
  currentStep?: string;
  fieldsExtracted?: number;
  fieldsRequiringReview?: number;
  overallConfidence?: number;
}

export interface UploadResult {
  roundId: string;
  images: UploadedImage[];
}

// ============================================================================
// API METHODS
// ============================================================================

/**
 * Upload scorecard images and initiate extraction
 */
export async function uploadScorecardImages(
  playerId: string,
  roundDate: string,
  courseName: string | undefined,
  files: File[]
): Promise<UploadResult> {
  // 1. Create a new round in PENDING_EXTRACTION status
  const round = await manualStatsApi.createRound({
    playerId,
    roundDate,
    courseName,
  });

  // 2. Get pre-signed upload URLs
  const fileMetadata = files.map((f) => ({
    filename: f.name,
    mimeType: f.type || 'image/jpeg',
    fileSize: f.size,
  }));

  const uploadUrls = await manualStatsApi.initiateImageUpload(round.id, fileMetadata);

  // 3. Upload files to pre-signed URLs
  const uploadedImages: UploadedImage[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const { uploadUrl, imageId } = uploadUrls[i];

    try {
      // Upload to pre-signed URL
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'image/jpeg',
        },
      });

      uploadedImages.push({
        imageId,
        filename: file.name,
        status: 'uploaded',
      });
    } catch (error) {
      uploadedImages.push({
        imageId,
        filename: file.name,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
  }

  return {
    roundId: round.id,
    images: uploadedImages,
  };
}

/**
 * Poll extraction status
 */
export async function getExtractionProgress(roundId: string): Promise<ExtractionProgress> {
  const extraction = await manualStatsApi.getExtractionStatus(roundId);

  if (!extraction) {
    return {
      roundId,
      status: 'PENDING',
      progress: 0,
    };
  }

  // Calculate progress based on status
  let progress = 0;
  let currentStep = '';

  switch (extraction.status) {
    case 'PENDING':
      progress = 10;
      currentStep = 'Queued for processing...';
      break;
    case 'PROCESSING':
      progress = 50;
      currentStep = 'Analyzing scorecard...';
      break;
    case 'COMPLETED':
    case 'REQUIRES_REVIEW':
      progress = 100;
      currentStep = 'Extraction complete';
      break;
    case 'FAILED':
      progress = 0;
      currentStep = 'Extraction failed';
      break;
  }

  return {
    roundId,
    status: extraction.status,
    progress,
    currentStep,
    fieldsExtracted: extraction.holeData?.length ?? 0,
    fieldsRequiringReview: extraction.fieldsRequiringReview,
    overallConfidence: extraction.overallConfidence,
  };
}

/**
 * Simulate extraction for demo purposes
 * In production, this would be handled by the backend
 */
export async function simulateExtraction(roundId: string): Promise<void> {
  // This is a placeholder for demo purposes
  // The actual extraction happens on the backend
  console.log('Extraction started for round:', roundId);
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const imageExtractionApi = {
  uploadScorecardImages,
  getExtractionProgress,
  simulateExtraction,
};

export default imageExtractionApi;
