/**
 * Hook for managing PROOF screen data
 *
 * Handles:
 * - Uploading proof videos/images
 * - Getting upload progress
 */

import { useState, useCallback } from 'react';
import api from '../services/api';

interface ProofUpload {
  uri: string;
  type: 'photo' | 'video';
  filename?: string;
}

interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
}

export function useProofData() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle',
  });
  const [error, setError] = useState<Error | null>(null);

  // Upload proof
  const uploadProof = useCallback(async (
    proof: ProofUpload,
    breakingPointId: string
  ) => {
    try {
      setUploading(true);
      setError(null);
      setProgress({ progress: 0, status: 'uploading' });

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: proof.uri,
        type: proof.type === 'video' ? 'video/mp4' : 'image/jpeg',
        name: proof.filename || `proof.${proof.type === 'video' ? 'mp4' : 'jpg'}`,
      } as any);
      formData.append('breakingPointId', breakingPointId);

      // Upload
      setProgress({ progress: 30, status: 'uploading', message: 'Laster opp...' });

      const uploadResult = await api.videos.upload(formData);

      setProgress({ progress: 70, status: 'processing', message: 'Behandler...' });

      // Confirm upload
      if (uploadResult.videoId) {
        await api.videos.confirmUpload(uploadResult.videoId);
      }

      // Submit proof to breaking point
      await api.breakingPoints.submitProof(breakingPointId, {
        videoId: uploadResult.videoId,
        videoUrl: uploadResult.url,
        uploadedAt: new Date().toISOString(),
      });

      setProgress({ progress: 100, status: 'complete', message: 'Ferdig!' });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to upload proof'));
      setProgress({ progress: 0, status: 'error', message: 'Opplasting feilet' });
      return false;
    } finally {
      setUploading(false);
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setUploading(false);
    setProgress({ progress: 0, status: 'idle' });
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadProof,
    reset,
  };
}

export default useProofData;
