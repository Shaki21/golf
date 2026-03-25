/**
 * Image Extraction Hook
 *
 * React hook for managing scorecard image upload and AI extraction flow.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import imageExtractionApi, {
  type UploadedImage,
  type ExtractionProgress,
  type UploadResult,
} from '../services/imageExtractionApi';

// ============================================================================
// TYPES
// ============================================================================

export type ExtractionState =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'review_required'
  | 'completed'
  | 'error';

export interface UseImageExtractionOptions {
  onComplete?: (roundId: string) => void;
  onError?: (error: Error) => void;
  pollInterval?: number;
}

export interface UseImageExtractionReturn {
  // State
  state: ExtractionState;
  roundId: string | null;
  images: UploadedImage[];
  progress: ExtractionProgress | null;
  error: Error | null;

  // Actions
  uploadImages: (
    playerId: string,
    roundDate: string,
    courseName: string | undefined,
    files: File[]
  ) => Promise<void>;
  reset: () => void;

  // Computed
  isUploading: boolean;
  isProcessing: boolean;
  isComplete: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useImageExtraction(
  options: UseImageExtractionOptions = {}
): UseImageExtractionReturn {
  const { onComplete, onError, pollInterval = 3000 } = options;

  // State
  const [state, setState] = useState<ExtractionState>('idle');
  const [roundId, setRoundId] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Refs for polling
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({
      playerId,
      roundDate,
      courseName,
      files,
    }: {
      playerId: string;
      roundDate: string;
      courseName: string | undefined;
      files: File[];
    }) => {
      return imageExtractionApi.uploadScorecardImages(
        playerId,
        roundDate,
        courseName,
        files
      );
    },
    onSuccess: (result) => {
      setRoundId(result.roundId);
      setImages(result.images);
      setState('processing');
      startPolling(result.roundId);
    },
    onError: (err) => {
      setError(err as Error);
      setState('error');
      onError?.(err as Error);
    },
  });

  // Poll for extraction status
  const pollStatus = useCallback(async (rid: string) => {
    try {
      const extractionProgress = await imageExtractionApi.getExtractionProgress(rid);
      setProgress(extractionProgress);

      if (extractionProgress.status === 'COMPLETED') {
        setState('completed');
        stopPolling();
        onComplete?.(rid);
      } else if (extractionProgress.status === 'REQUIRES_REVIEW') {
        setState('review_required');
        stopPolling();
        onComplete?.(rid);
      } else if (extractionProgress.status === 'FAILED') {
        setState('error');
        setError(new Error('Extraction failed'));
        stopPolling();
        onError?.(new Error('Extraction failed'));
      }
    } catch (err) {
      console.error('Error polling extraction status:', err);
    }
  }, [onComplete, onError]);

  // Start polling
  const startPolling = useCallback((rid: string) => {
    stopPolling();
    pollIntervalRef.current = setInterval(() => {
      pollStatus(rid);
    }, pollInterval);

    // Also poll immediately
    pollStatus(rid);
  }, [pollInterval, pollStatus]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Upload images
  const uploadImages = useCallback(
    async (
      playerId: string,
      roundDate: string,
      courseName: string | undefined,
      files: File[]
    ) => {
      setError(null);
      setState('uploading');
      await uploadMutation.mutateAsync({ playerId, roundDate, courseName, files });
    },
    [uploadMutation]
  );

  // Reset state
  const reset = useCallback(() => {
    stopPolling();
    setState('idle');
    setRoundId(null);
    setImages([]);
    setProgress(null);
    setError(null);
  }, [stopPolling]);

  return {
    // State
    state,
    roundId,
    images,
    progress,
    error,

    // Actions
    uploadImages,
    reset,

    // Computed
    isUploading: state === 'uploading',
    isProcessing: state === 'processing',
    isComplete: state === 'completed' || state === 'review_required',
  };
}

export default useImageExtraction;
