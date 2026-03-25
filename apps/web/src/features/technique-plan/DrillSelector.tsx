/**
 * DrillSelector Component
 *
 * Allows users to search and select exercises/drills from the exercise library
 * and add them to a technique task.
 */

import React, { useState, useEffect } from 'react';
import { exercisesAPI, techniquePlanAPI, Exercise } from '../../services/api';
import { Search, Plus, X, Loader } from 'lucide-react';

interface DrillSelectorProps {
  taskId: string;
  existingDrills: Array<{
    id: string;
    exerciseId: string;
    exercise?: {
      id: string;
      name: string;
      description?: string;
    };
  }>;
  onDrillAdded: () => void;
  onDrillRemoved: () => void;
}

export default function DrillSelector({
  taskId,
  existingDrills,
  onDrillAdded,
  onDrillRemoved
}: DrillSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const [addingDrill, setAddingDrill] = useState<string | null>(null);
  const [removingDrill, setRemovingDrill] = useState<string | null>(null);

  // Fetch exercises when selector is opened
  useEffect(() => {
    if (showSelector) {
      fetchExercises();
    }
  }, [showSelector]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await exercisesAPI.list({ search: searchQuery });
      // Ensure exercises is always an array
      const data = response.data?.data || response.data || [];
      setExercises(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExercises();
  };

  const handleAddDrill = async (exerciseId: string) => {
    setAddingDrill(exerciseId);
    try {
      await techniquePlanAPI.addDrill(taskId, {
        exerciseId,
        orderIndex: (existingDrills || []).length,
        notes: '',
      });
      onDrillAdded();
      setShowSelector(false);
    } catch (error) {
      console.error('Failed to add drill:', error);
      alert('Could not add exercise. Please try again.');
    } finally {
      setAddingDrill(null);
    }
  };

  const handleRemoveDrill = async (drillId: string) => {
    if (!confirm('Are you sure you want to remove this exercise?')) return;

    setRemovingDrill(drillId);
    try {
      await techniquePlanAPI.removeDrill(taskId, drillId);
      onDrillRemoved();
    } catch (error) {
      console.error('Failed to remove drill:', error);
      alert('Could not remove exercise. Please try again.');
    } finally {
      setRemovingDrill(null);
    }
  };

  const existingExerciseIds = (existingDrills || []).map(d => d.exerciseId);
  const availableExercises = (exercises || []).filter(ex => !existingExerciseIds.includes(ex.id));

  return (
    <div className="space-y-3">
      {/* Existing Drills */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Associated exercises</h4>
        {(!existingDrills || existingDrills.length === 0) ? (
          <p className="text-sm text-gray-500 italic">No exercises associated yet</p>
        ) : (
          <div className="space-y-2">
            {existingDrills.map((drill) => (
              <div
                key={drill.id}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {drill.exercise?.name || 'Exercise'}
                  </p>
                  {drill.exercise?.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                      {drill.exercise.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveDrill(drill.id)}
                  disabled={removingDrill === drill.id}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                  title="Remove exercise"
                >
                  {removingDrill === drill.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Drill Button */}
      {!showSelector && (
        <button
          onClick={() => setShowSelector(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add exercise
        </button>
      )}

      {/* Exercise Selector */}
      {showSelector && (
        <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Select exercise from library</h4>
            <button
              onClick={() => setShowSelector(false)}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for exercise..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Exercise List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : availableExercises.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {searchQuery ? 'No exercises found' : 'No available exercises'}
              </p>
            ) : (
              availableExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{exercise.name}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {exercise.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {exercise.exerciseType && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                          {exercise.exerciseType}
                        </span>
                      )}
                      {exercise.difficulty && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {exercise.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddDrill(exercise.id)}
                    disabled={addingDrill === exercise.id}
                    className="ml-3 p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                    title="Add exercise"
                  >
                    {addingDrill === exercise.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
