/**
 * Club Speed Calibration Hooks
 * TypeScript version with proper types
 * API integration for club speed calibration (3 shots per club)
 */

import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/apiClient';

// =============================================================================
// Types
// =============================================================================

export type ClubType =
  | 'driver'
  | '3wood'
  | '5wood'
  | '4hybrid'
  | '5hybrid'
  | '4iron'
  | '5iron'
  | '6iron'
  | '7iron'
  | '8iron'
  | '9iron'
  | 'pw'
  | 'gw'
  | 'sw'
  | 'lw';

export interface ClubCalibrationData {
  clubType: ClubType | string;
  shot1Speed: number;
  shot2Speed: number;
  shot3Speed: number;
  samples?: number[];
  averageSpeed?: number;
  estimatedCarry?: number;
}

export interface Calibration {
  id: string;
  playerId: string;
  clubs: ClubCalibrationData[];
  calibratedAt: string;
  updatedAt?: string;
  deviceInfo?: string;
  notes?: string;
}

export interface CalibrationSample {
  clubType: ClubType;
  speed: number;
  timestamp?: string;
}

export interface CalibrationSession {
  sessionId: string;
  playerId: string;
  startedAt: string;
  status: 'in_progress' | 'completed' | 'cancelled';
}

export interface CalibrationResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}

export interface CreateCalibrationData {
  playerId: string;
  calibrationDate?: string;
  clubs: ClubCalibrationData[];
  deviceInfo?: string;
  notes?: string;
}

export interface UpdateCalibrationData {
  playerId?: string;
  calibrationDate?: string;
  clubs: ClubCalibrationData[];
  deviceInfo?: string;
  notes?: string;
}

export interface SubmitSamplesData {
  sessionId: string;
  samples: CalibrationSample[];
}

// Hook options
export interface UsePlayerCalibrationOptions {
  autoLoad?: boolean;
}

// Return types for hooks
export interface UsePlayerCalibrationReturn {
  calibration: Calibration | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseCreateCalibrationReturn {
  createCalibration: (data: CreateCalibrationData) => Promise<Calibration>;
  loading: boolean;
  error: string | null;
}

export interface UseUpdateCalibrationReturn {
  updateCalibration: (playerId: string, data: UpdateCalibrationData) => Promise<Calibration>;
  loading: boolean;
  error: string | null;
}

export interface UseDeleteCalibrationReturn {
  deleteCalibration: (playerId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface UseStartCalibrationSessionReturn {
  startSession: () => Promise<CalibrationSession>;
  loading: boolean;
  error: string | null;
}

export interface UseSubmitCalibrationSamplesReturn {
  submitSamples: (sessionId: string, samples: CalibrationSample[]) => Promise<Calibration>;
  loading: boolean;
  error: string | null;
}

// =============================================================================
// Hook Implementations
// =============================================================================

/**
 * Hook for fetching player calibration data
 */
export function usePlayerCalibration(
  playerId: string | null | undefined,
  options: UsePlayerCalibrationOptions = {}
): UsePlayerCalibrationReturn {
  const [data, setData] = useState<Calibration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalibration = useCallback(async () => {
    if (!playerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<CalibrationResponse<Calibration>>(
        `/calibration/player/${playerId}`
      );
      setData(response.data.data);
    } catch (err) {
      // Check for 404 (no calibration yet) - this is okay
      if (
        err &&
        typeof err === 'object' &&
        'status' in err &&
        (err as { status: number }).status === 404
      ) {
        setData(null);
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load calibration';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchCalibration();
    }
  }, [fetchCalibration, options.autoLoad]);

  return { calibration: data, loading, error, refetch: fetchCalibration };
}

/**
 * Hook for creating a new calibration
 */
export function useCreateCalibration(): UseCreateCalibrationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCalibration = useCallback(async (data: CreateCalibrationData): Promise<Calibration> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post<CalibrationResponse<Calibration>>('/calibration', data);
      return response.data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create calibration';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createCalibration, loading, error };
}

/**
 * Hook for updating an existing calibration
 */
export function useUpdateCalibration(): UseUpdateCalibrationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCalibration = useCallback(
    async (playerId: string, data: UpdateCalibrationData): Promise<Calibration> => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.put<CalibrationResponse<Calibration>>(
          `/calibration/player/${playerId}`,
          data
        );
        return response.data.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update calibration';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateCalibration, loading, error };
}

/**
 * Hook for deleting a calibration
 */
export function useDeleteCalibration(): UseDeleteCalibrationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCalibration = useCallback(async (playerId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.delete(`/calibration/player/${playerId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete calibration';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteCalibration, loading, error };
}

/**
 * Hook for starting a mobile calibration session
 */
export function useStartCalibrationSession(): UseStartCalibrationSessionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async (): Promise<CalibrationSession> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post<CalibrationSession>('/calibration/start');
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start calibration session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { startSession, loading, error };
}

/**
 * Hook for submitting calibration samples
 */
export function useSubmitCalibrationSamples(): UseSubmitCalibrationSamplesReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitSamples = useCallback(
    async (sessionId: string, samples: CalibrationSample[]): Promise<Calibration> => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.post<CalibrationResponse<Calibration>>(
          '/calibration/submit',
          { sessionId, samples }
        );
        return response.data.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to submit calibration samples';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { submitSamples, loading, error };
}
