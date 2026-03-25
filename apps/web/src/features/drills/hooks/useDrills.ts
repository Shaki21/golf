/**
 * useDrills Hook
 * Fetches and manages drills/exercises from the API with filtering and CRUD operations
 *
 * Features:
 * - Fetch drills from /api/v1/exercises
 * - Filter by pyramide level, golf area, and search query
 * - CRUD operations: create, update, delete, duplicate
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../data/apiClient';

// =============================================================================
// Types
// =============================================================================

export type PyramideLevel = 'FYS' | 'TEK' | 'SLAG' | 'SPILL' | 'TURN';
export type LPhase = 'L-BODY' | 'L-ARM' | 'L-CLUB' | 'L-BALL' | 'L-AUTO';
export type CSLevel = 'CS20' | 'CS40' | 'CS60' | 'CS80' | 'CS100';
export type EnvironmentLevel = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5';
export type PressureLevel = 'PR1' | 'PR2' | 'PR3' | 'PR4' | 'PR5';

export interface Drill {
  id: string;
  name: string;
  description: string;
  pyramide: PyramideLevel;
  golfArea: string;
  lPhase: LPhase;
  csLevel: CSLevel;
  environment: EnvironmentLevel;
  pressure: PressureLevel;
  reps?: number;
  sets?: number;
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  isFavorite?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DrillFilters {
  pyramide?: PyramideLevel | 'all';
  golfArea?: string | 'all';
  search?: string;
}

export interface CreateDrillInput {
  name: string;
  description?: string;
  pyramide: PyramideLevel;
  golfArea: string;
  lPhase: LPhase;
  csLevel: CSLevel;
  environment: EnvironmentLevel;
  pressure: PressureLevel;
  reps?: number;
  sets?: number;
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  isFavorite?: boolean;
  tags?: string[];
}

export interface UpdateDrillInput extends Partial<CreateDrillInput> {
  id: string;
}

// API response types
interface ApiDrillsResponse {
  exercises: Drill[];
  total: number;
}

interface ApiDrillResponse {
  exercise: Drill;
}

// =============================================================================
// Hook Result Interface
// =============================================================================

export interface UseDrillsResult {
  drills: Drill[];
  filteredDrills: Drill[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createDrill: (input: CreateDrillInput) => Promise<Drill | null>;
  updateDrill: (input: UpdateDrillInput) => Promise<Drill | null>;
  deleteDrill: (id: string) => Promise<boolean>;
  duplicateDrill: (drill: Drill) => Promise<Drill | null>;
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Main hook for fetching and managing drills/exercises
 * @param filters - Optional filters for pyramide level, golf area, and search
 */
export function useDrills(filters?: DrillFilters): UseDrillsResult {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================================================================
  // Fetch Drills
  // =========================================================================

  const fetchDrills = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiGet<ApiDrillsResponse>('/exercises');
      setDrills(response.exercises || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load exercises';
      setError(message);
      setDrills([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDrills();
  }, [fetchDrills]);

  // =========================================================================
  // Filtered Drills (client-side filtering)
  // =========================================================================

  const filteredDrills = useMemo(() => {
    return drills.filter((drill) => {
      // Filter by pyramide level
      if (filters?.pyramide && filters.pyramide !== 'all') {
        if (drill.pyramide !== filters.pyramide) return false;
      }

      // Filter by golf area
      if (filters?.golfArea && filters.golfArea !== 'all') {
        if (drill.golfArea !== filters.golfArea) return false;
      }

      // Filter by search query
      if (filters?.search && filters.search.trim() !== '') {
        const searchLower = filters.search.toLowerCase();
        const matchesName = drill.name.toLowerCase().includes(searchLower);
        const matchesDescription = drill.description.toLowerCase().includes(searchLower);
        const matchesTags = drill.tags?.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );
        if (!matchesName && !matchesDescription && !matchesTags) return false;
      }

      return true;
    });
  }, [drills, filters?.pyramide, filters?.golfArea, filters?.search]);

  // =========================================================================
  // CRUD Operations
  // =========================================================================

  /**
   * Create a new drill
   */
  const createDrill = useCallback(async (input: CreateDrillInput): Promise<Drill | null> => {
    try {
      const response = await apiPost<ApiDrillResponse>('/exercises', input);
      const newDrill = response.exercise;

      // Optimistically update local state
      setDrills((prev) => [...prev, newDrill]);

      return newDrill;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create exercise';
      setError(message);
      return null;
    }
  }, []);

  /**
   * Update an existing drill
   */
  const updateDrill = useCallback(async (input: UpdateDrillInput): Promise<Drill | null> => {
    const { id, ...updateData } = input;

    try {
      const response = await apiPut<ApiDrillResponse>(`/exercises/${id}`, updateData);
      const updatedDrill = response.exercise;

      // Optimistically update local state
      setDrills((prev) =>
        prev.map((drill) => (drill.id === id ? updatedDrill : drill))
      );

      return updatedDrill;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not update exercise';
      setError(message);
      return null;
    }
  }, []);

  /**
   * Delete a drill
   */
  const deleteDrill = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiDelete(`/exercises/${id}`);

      // Optimistically update local state
      setDrills((prev) => prev.filter((drill) => drill.id !== id));

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not delete exercise';
      setError(message);
      return false;
    }
  }, []);

  /**
   * Duplicate a drill (creates a copy with modified name)
   */
  const duplicateDrill = useCallback(
    async (drill: Drill): Promise<Drill | null> => {
      const duplicateInput: CreateDrillInput = {
        name: `${drill.name} (copy)`,
        description: drill.description,
        pyramide: drill.pyramide,
        golfArea: drill.golfArea,
        lPhase: drill.lPhase,
        csLevel: drill.csLevel,
        environment: drill.environment,
        pressure: drill.pressure,
        reps: drill.reps,
        sets: drill.sets,
        estimatedMinutes: drill.estimatedMinutes,
        difficulty: drill.difficulty,
        isFavorite: false, // Duplicates start without favorite status
        tags: drill.tags ? [...drill.tags] : undefined,
      };

      return createDrill(duplicateInput);
    },
    [createDrill]
  );

  // =========================================================================
  // Return Hook Result
  // =========================================================================

  return {
    drills,
    filteredDrills,
    isLoading,
    error,
    refresh: fetchDrills,
    createDrill,
    updateDrill,
    deleteDrill,
    duplicateDrill,
  };
}

export default useDrills;
