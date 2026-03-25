/**
 * Club Speed Calibration API Service
 *
 * Ready-to-use API service functions for frontend integration.
 * Copy this file to your frontend project (e.g., src/services/calibration.ts)
 */

import type {
  CalibrationRequest,
  CalibrationUpdateRequest,
  ApiSuccessResponse,
  ApiErrorResponse,
  CreateCalibrationResponse,
  GetCalibrationResponse,
} from './calibration-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

/**
 * Get auth token from storage (customize based on your auth system)
 */
function getAuthToken(): string | null {
  // Example: from localStorage
  return localStorage.getItem('accessToken');

  // Example: from cookie
  // return document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || null;

  // Example: from context/state
  // return useAuth().token;
}

// ============================================================================
// HTTP CLIENT
// ============================================================================

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiSuccessResponse<T>> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError('UNAUTHORIZED', 'No authentication token found');
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiErrorResponse;
    throw new ApiError(error.error.code, error.error.message, error.error.details);
  }

  return data as ApiSuccessResponse<T>;
}

// ============================================================================
// CALIBRATION API FUNCTIONS
// ============================================================================

/**
 * Submit a new club speed calibration
 *
 * @param calibrationData - The calibration data including all club speeds
 * @returns Promise with calibration result including analysis
 *
 * @throws ApiError if validation fails or calibration already exists
 *
 * @example
 * ```typescript
 * try {
 *   const result = await submitCalibration({
 *     playerId: 'uuid',
 *     calibrationDate: new Date().toISOString(),
 *     clubs: [
 *       { clubType: 'driver', shot1Speed: 115, shot2Speed: 114, shot3Speed: 116 }
 *     ]
 *   });
 *   console.log('Driver speed:', result.data.driverSpeed);
 *   console.log('Recommendations:', result.data.recommendations);
 * } catch (error) {
 *   if (error instanceof ApiError && error.code === 'CALIBRATION_EXISTS') {
 *     // Handle duplicate calibration
 *   }
 * }
 * ```
 */
export async function submitCalibration(
  calibrationData: CalibrationRequest
): Promise<ApiSuccessResponse<CreateCalibrationResponse>> {
  return apiRequest<CreateCalibrationResponse>('/calibration', {
    method: 'POST',
    body: JSON.stringify(calibrationData),
  });
}

/**
 * Get a player's club speed calibration
 *
 * @param playerId - The player's UUID
 * @returns Promise with the player's calibration data
 *
 * @throws ApiError if calibration not found
 *
 * @example
 * ```typescript
 * try {
 *   const result = await getCalibration('player-uuid');
 *   const calibration = result.data;
 *   console.log('Calibration date:', calibration.calibrationDate);
 *   console.log('Clubs tested:', calibration.clubs.length);
 * } catch (error) {
 *   if (error instanceof ApiError && error.code === 'CALIBRATION_NOT_FOUND') {
 *     // Calibration doesn't exist yet - show onboarding
 *   }
 * }
 * ```
 */
export async function getCalibration(
  playerId: string
): Promise<ApiSuccessResponse<GetCalibrationResponse>> {
  return apiRequest<GetCalibrationResponse>(`/calibration/player/${playerId}`, {
    method: 'GET',
  });
}

/**
 * Update a player's calibration
 *
 * @param playerId - The player's UUID
 * @param calibrationData - The updated calibration data
 * @returns Promise with updated calibration result
 *
 * @example
 * ```typescript
 * const result = await updateCalibration('player-uuid', {
 *   calibrationDate: new Date().toISOString(),
 *   clubs: [
 *     { clubType: 'driver', shot1Speed: 118, shot2Speed: 117, shot3Speed: 119 }
 *   ],
 *   notes: 'Re-calibration after equipment change'
 * });
 * ```
 */
export async function updateCalibration(
  playerId: string,
  calibrationData: CalibrationUpdateRequest
): Promise<ApiSuccessResponse<CreateCalibrationResponse>> {
  return apiRequest<CreateCalibrationResponse>(`/calibration/player/${playerId}`, {
    method: 'PUT',
    body: JSON.stringify(calibrationData),
  });
}

/**
 * Delete a player's calibration
 *
 * @param playerId - The player's UUID
 * @returns Promise with success message
 *
 * @example
 * ```typescript
 * await deleteCalibration('player-uuid');
 * console.log('Calibration deleted');
 * ```
 */
export async function deleteCalibration(
  playerId: string
): Promise<ApiSuccessResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(`/calibration/player/${playerId}`, {
    method: 'DELETE',
  });
}

/**
 * Check if a player has completed calibration
 *
 * @param playerId - The player's UUID
 * @returns Promise<boolean> - true if calibration exists
 *
 * @example
 * ```typescript
 * const hasCalibration = await checkCalibrationExists('player-uuid');
 * if (!hasCalibration) {
 *   // Redirect to calibration onboarding
 * }
 * ```
 */
export async function checkCalibrationExists(playerId: string): Promise<boolean> {
  try {
    await getCalibration(playerId);
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.code === 'CALIBRATION_NOT_FOUND') {
      return false;
    }
    throw error;
  }
}

// ============================================================================
// REACT HOOKS (Optional - for React projects)
// ============================================================================

/**
 * React hook for managing calibration state
 *
 * @example
 * ```typescript
 * function CalibrationForm() {
 *   const {
 *     submit,
 *     isLoading,
 *     error,
 *     result
 *   } = useCalibration();
 *
 *   const handleSubmit = async (data: CalibrationRequest) => {
 *     await submit(data);
 *   };
 *
 *   if (result) {
 *     return <CalibrationResults data={result} />;
 *   }
 *
 *   return <CalibrationForm onSubmit={handleSubmit} isLoading={isLoading} />;
 * }
 * ```
 */
/*
import { useState, useCallback } from 'react';

export function useCalibration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateCalibrationResponse | null>(null);

  const submit = useCallback(async (data: CalibrationRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await submitCalibration(data);
      setResult(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to submit calibration';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { submit, isLoading, error, result };
}

export function usePlayerCalibration(playerId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calibration, setCalibration] = useState<GetCalibrationResponse | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCalibration(playerId);
      setCalibration(response.data);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'CALIBRATION_NOT_FOUND') {
        setCalibration(null);
      } else {
        const errorMessage = err instanceof ApiError ? err.message : 'Failed to load calibration';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  const update = useCallback(async (data: CalibrationUpdateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await updateCalibration(playerId, data);
      setCalibration(response.data as any);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update calibration';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  React.useEffect(() => {
    fetch();
  }, [fetch]);

  return { calibration, isLoading, error, refetch: fetch, update };
}
*/

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example 1: Submit calibration from form
 *
 * ```typescript
 * async function handleCalibrationSubmit(formData: any) {
 *   try {
 *     const result = await submitCalibration({
 *       playerId: currentPlayer.id,
 *       calibrationDate: new Date().toISOString(),
 *       clubs: formData.clubs,
 *       notes: formData.notes
 *     });
 *
 *     // Show success message
 *     toast.success('Calibration saved!');
 *
 *     // Show results
 *     navigate('/calibration/results', { state: { result: result.data } });
 *   } catch (error) {
 *     if (error instanceof ApiError) {
 *       if (error.code === 'CALIBRATION_EXISTS') {
 *         // Ask if user wants to update
 *         const shouldUpdate = await confirm('Update existing calibration?');
 *         if (shouldUpdate) {
 *           await updateCalibration(currentPlayer.id, formData);
 *         }
 *       } else if (error.code === 'VALIDATION_ERROR') {
 *         // Show validation errors
 *         setErrors(error.details?.errors || []);
 *       }
 *     }
 *   }
 * }
 * ```
 */

/**
 * Example 2: Check calibration status in onboarding
 *
 * ```typescript
 * async function checkOnboardingStatus(playerId: string) {
 *   const hasCalibration = await checkCalibrationExists(playerId);
 *
 *   if (!hasCalibration) {
 *     // Redirect to calibration
 *     navigate('/onboarding/calibration');
 *   } else {
 *     // Proceed to training plan
 *     navigate('/training-plan');
 *   }
 * }
 * ```
 */

/**
 * Example 3: Load and display existing calibration
 *
 * ```typescript
 * async function loadCalibrationData(playerId: string) {
 *   try {
 *     const result = await getCalibration(playerId);
 *     const { driverSpeed, clubs, speedProfile } = result.data;
 *
 *     // Display in UI
 *     setChartData(clubs.map(c => ({
 *       club: c.clubType,
 *       speed: c.averageSpeed,
 *       percent: c.percentOfDriver
 *     })));
 *
 *     setRecommendations(speedProfile.recommendations);
 *   } catch (error) {
 *     if (error instanceof ApiError && error.code === 'CALIBRATION_NOT_FOUND') {
 *       // Show "No calibration yet" message
 *     }
 *   }
 * }
 * ```
 */

// Export the ApiError class for error handling
export { ApiError };
