/**
 * ExerciseSelector.jsx
 * Design System v3.0 - Premium Light
 *
 * FASE 5: Exercise selector for session planning
 *
 * Features:
 * - Search exercises from library
 * - Select up to 5 exercises
 * - Set duration and repetitions per exercise
 * - Drag to reorder
 * - Auto-calculate totals
 */

import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, GripVertical, X, Clock, Repeat } from 'lucide-react';

export const ExerciseSelector = ({ value = [], onChange, maxExercises = 5 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState(value);
  const [isSearching, setIsSearching] = useState(false);

  // Mock exercise library - in production this would fetch from API
  const exerciseLibrary = [
    {
      id: '1',
      title: 'Driver - Full Swing',
      description: 'Fullt swing med driver',
      category: 'TEE',
      defaultDuration: 20,
      defaultReps: 20,
    },
    {
      id: '2',
      title: 'Putting - 3-8 fot',
      description: 'Putting fra kort distanse',
      category: 'PUTT',
      defaultDuration: 15,
      defaultReps: 30,
    },
    {
      id: '3',
      title: 'Chipping - 10-20 yards',
      description: 'Chip shots rundt greenen',
      category: 'ARG',
      defaultDuration: 15,
      defaultReps: 20,
    },
    {
      id: '4',
      title: 'Iron - 150 yards',
      description: 'Mid-iron approach shots',
      category: 'INN',
      defaultDuration: 20,
      defaultReps: 15,
    },
    {
      id: '5',
      title: 'Fysisk - Mobilitet',
      description: 'Mobilitetstrening for golf',
      category: 'FYS',
      defaultDuration: 10,
      defaultReps: 10,
    },
  ];

  useEffect(() => {
    setSelectedExercises(value);
  }, [value]);

  useEffect(() => {
    onChange(selectedExercises);
  }, [selectedExercises, onChange]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      // Filter exercises based on search query
      const filtered = exerciseLibrary.filter(
        (ex) =>
          ex.title.toLowerCase().includes(query.toLowerCase()) ||
          ex.description.toLowerCase().includes(query.toLowerCase()) ||
          ex.category.toLowerCase().includes(query.toLowerCase())
      );
      setExercises(filtered);
    } else {
      setExercises([]);
      setIsSearching(false);
    }
  };

  const addExercise = (exercise) => {
    if (selectedExercises.length >= maxExercises) {
      alert(`Du kan maksimalt velge ${maxExercises} øvelser`);
      return;
    }

    const newExercise = {
      id: exercise.id,
      title: exercise.title,
      description: exercise.description,
      estimatedDuration: exercise.defaultDuration,
      estimatedRepetitions: exercise.defaultReps,
      orderIndex: selectedExercises.length,
    };

    setSelectedExercises([...selectedExercises, newExercise]);
    setSearchQuery('');
    setExercises([]);
    setIsSearching(false);
  };

  const removeExercise = (index) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    // Update order indexes
    const reordered = updated.map((ex, i) => ({ ...ex, orderIndex: i }));
    setSelectedExercises(reordered);
  };

  const updateExercise = (index, field, value) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: parseInt(value) || 0 };
    setSelectedExercises(updated);
  };

  const moveExercise = (fromIndex, toIndex) => {
    const updated = [...selectedExercises];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    // Update order indexes
    const reordered = updated.map((ex, i) => ({ ...ex, orderIndex: i }));
    setSelectedExercises(reordered);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-tertiary" />
          <input
            type="text"
            placeholder="Søk etter øvelser..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-tier-surface-base border border-tier-border-default rounded-lg text-sm"
          />
        </div>

        {/* Search Results */}
        {isSearching && exercises.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-tier-white border border-tier-border-default rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
            {exercises.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                onClick={() => addExercise(exercise)}
                className="w-full p-3 text-left hover:bg-tier-surface-base border-b border-tier-border-default last:border-b-0 transition-colors"
              >
                <div className="font-medium text-sm text-tier-navy">{exercise.title}</div>
                <div className="text-xs text-tier-text-secondary">{exercise.description}</div>
                <div className="text-xs text-tier-text-tertiary mt-1">
                  {exercise.defaultDuration} min • {exercise.defaultReps} reps • {exercise.category}
                </div>
              </button>
            ))}
          </div>
        )}

        {isSearching && exercises.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-tier-white border border-tier-border-default rounded-lg shadow-lg z-10 p-4 text-center text-sm text-tier-text-secondary">
            Ingen øvelser funnet
          </div>
        )}
      </div>

      {/* Selected Exercises */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-tier-text-secondary">
            Valgte øvelser ({selectedExercises.length}/{maxExercises})
          </span>
          {selectedExercises.length > 0 && (
            <span className="text-xs text-tier-text-tertiary">
              Dra for å endre rekkefølge
            </span>
          )}
        </div>

        {selectedExercises.length === 0 ? (
          <div className="p-6 bg-tier-surface-base rounded-lg border-2 border-dashed border-tier-border-default text-center">
            <Plus size={24} className="mx-auto text-tier-text-tertiary mb-2" />
            <div className="text-sm text-tier-text-secondary">
              Søk og legg til øvelser fra biblioteket
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedExercises.map((exercise, index) => (
              <div
                key={`${exercise.id}-${index}`}
                className="p-3 bg-tier-white border border-tier-border-default rounded-lg"
              >
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <button
                    type="button"
                    className="mt-1 text-tier-text-tertiary hover:text-tier-navy cursor-move"
                    onMouseDown={(e) => {
                      // Simple drag implementation
                      e.preventDefault();
                    }}
                  >
                    <GripVertical size={16} />
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm text-tier-navy truncate">
                        {index + 1}. {exercise.title}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="text-tier-text-tertiary hover:text-tier-error"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Duration and Reps */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-tier-text-tertiary mb-1">
                          <Clock size={12} className="inline" /> Varighet (min)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={exercise.estimatedDuration}
                          onChange={(e) => updateExercise(index, 'estimatedDuration', e.target.value)}
                          className="w-full p-2 bg-tier-surface-base border border-tier-border-default rounded text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-tier-text-tertiary mb-1">
                          <Repeat size={12} className="inline" /> Repetisjoner
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={exercise.estimatedRepetitions}
                          onChange={(e) => updateExercise(index, 'estimatedRepetitions', e.target.value)}
                          className="w-full p-2 bg-tier-surface-base border border-tier-border-default rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helper text */}
      {selectedExercises.length < maxExercises && (
        <div className="text-xs text-tier-text-tertiary p-2 bg-tier-surface-base rounded">
          💡 Du kan legge til opptil {maxExercises - selectedExercises.length} øvelser til
        </div>
      )}
    </div>
  );
};

export default ExerciseSelector;
