import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { exercisesAPI } from '../../services/api';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Oevelser from './Oevelser';
import {
  GolfslagIcon,
  GolfTarget,
  GolfFlag,
  GolfPutter,
  FysiskIcon,
  MentalIcon,
  GolfBunker,
} from '../../components/icons';

/**
 * Map category to thumbnail icon component
 */
const getCategoryIcon = (category) => {
  const iconMap = {
    langspill: GolfslagIcon,
    driving: GolfslagIcon,
    innspill: GolfTarget,
    approach: GolfTarget,
    shortgame: GolfFlag,
    short_game: GolfFlag,
    putting: GolfPutter,
    bunker: GolfBunker,
    fysisk: FysiskIcon,
    physical: FysiskIcon,
    mental: MentalIcon,
  };
  return iconMap[category?.toLowerCase()] || GolfTarget;
};

/**
 * Normalize learning phase to L1-L5 format
 */
const normalizeLearningPhase = (phase) => {
  if (!phase) return 'L3';
  // Already in L1-L5 format
  if (/^L[1-5]$/i.test(phase)) return phase.toUpperCase();
  // Handle spelled out phases
  const phaseMap = {
    exposure: 'L1',
    fundamentals: 'L2',
    variation: 'L3',
    timing: 'L4',
    automaticity: 'L5',
  };
  return phaseMap[phase?.toLowerCase()] || 'L3';
};

/**
 * Transform API exercise data to component format
 */
const transformExercise = (exercise) => ({
  id: exercise.id,
  name: exercise.name || exercise.title,
  category: exercise.category || exercise.exerciseType || 'general',
  level: normalizeLearningPhase(exercise.learningPhase || exercise.level),
  duration: exercise.duration || exercise.estimatedDuration || 15,
  difficulty: exercise.difficulty || 3,
  description: exercise.description || '',
  instructions: exercise.instructions || exercise.steps || [],
  equipment: exercise.equipment || [],
  videoUrl: exercise.videoUrl || exercise.video || null,
  ThumbnailIcon: getCategoryIcon(exercise.category || exercise.exerciseType),
  // Preserve original data for detail views
  _original: exercise,
});

/**
 * OevelserContainer
 * Fetches exercises from API and passes to display component.
 * Handles data transformation and error states.
 */
const OevelserContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: null,
    learningPhase: null,
  });

  const fetchExercises = useCallback(async (params = {}) => {
    try {
      setState('loading');
      setError(null);

      // Build query params from filters
      const queryParams = {
        isActive: true,
        ...params,
      };

      // Remove empty values
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === null || queryParams[key] === '' || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await exercisesAPI.list(queryParams);

      // Handle different response formats
      let exerciseData = response.data;
      if (response.data?.data) {
        exerciseData = response.data.data;
      }
      if (response.data?.exercises) {
        exerciseData = response.data.exercises;
      }

      // Ensure array
      const exerciseArray = Array.isArray(exerciseData) ? exerciseData : [];

      // Transform exercises for component
      const transformed = exerciseArray.map(transformExercise);

      setExercises(transformed);
      setState(transformed.length === 0 ? 'empty' : 'idle');
    } catch (err) {
      console.error('Error fetching exercises:', err);
      setError(err);
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchExercises(filters);
    }
  }, [user, fetchExercises, filters]);

  /**
   * Handle filter changes from child component
   */
  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  if (state === 'loading') {
    return <LoadingState message="Loading exercises..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Could not load exercises'}
        onRetry={() => fetchExercises(filters)}
      />
    );
  }

  if (state === 'empty') {
    return (
      <EmptyState
        title="No exercises"
        message="No exercises match the search. Try changing the filters."
      />
    );
  }

  return (
    <Oevelser
      exercises={exercises}
      onFilterChange={handleFilterChange}
    />
  );
};

export default OevelserContainer;
