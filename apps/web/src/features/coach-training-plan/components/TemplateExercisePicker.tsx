/**
 * TemplateExercisePicker Component
 * Browse and select exercises for template sessions
 */

import React, { useState, useMemo } from 'react';
import { Search, Plus, X, Dumbbell, Clock, TrendingUp } from 'lucide-react';
import { Card } from '../../../ui/primitives/Card';
import { Badge } from '../../../components/shadcn/badge';
import Button from '../../../ui/primitives/Button';
import { Input } from '../../../components/shadcn/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/shadcn/select';
import Modal from '../../../ui/composites/Modal.composite';
import { TemplateExercise } from '../types/template.types';
import {
  Exercise,
  EXERCISE_LIBRARY,
  EXERCISE_CATEGORIES,
  DIFFICULTY_LEVELS,
  filterExercises,
} from '../data/exercises';

interface TemplateExercisePickerProps {
  selectedExercises: TemplateExercise[];
  onAdd: (exercise: TemplateExercise) => void;
  onRemove: (exerciseId: string) => void;
  maxExercises?: number;
}

export function TemplateExercisePicker({
  selectedExercises,
  onAdd,
  onRemove,
  maxExercises = 10,
}: TemplateExercisePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return filterExercises(
      EXERCISE_LIBRARY,
      categoryFilter,
      searchTerm,
      difficultyFilter
    );
  }, [categoryFilter, searchTerm, difficultyFilter]);

  // Get selected exercise IDs for quick lookup
  const selectedIds = useMemo(
    () => new Set(selectedExercises.map(ex => ex.id)),
    [selectedExercises]
  );

  // Handle add exercise
  const handleAddExercise = (exercise: Exercise) => {
    if (selectedIds.has(exercise.id)) {
      return; // Already selected
    }

    if (selectedExercises.length >= maxExercises) {
      alert(`Maximum ${maxExercises} exercises per session`);
      return;
    }

    const templateExercise: TemplateExercise = {
      id: exercise.id,
      name: exercise.name,
      durationMinutes: exercise.duration.min,
      notes: exercise.description,
      category: exercise.category,
    };

    onAdd(templateExercise);
  };

  // Difficulty badge color
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-emerald-100 text-emerald-700';
    if (difficulty === 3) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  // Difficulty label
  const getDifficultyLabel = (difficulty: number) => {
    const labels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Elite'];
    return labels[difficulty] || 'Unknown';
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={20} className="text-tier-navy" />
          <h4 className="text-sm font-semibold text-tier-navy">Exercises</h4>
          <Badge variant="secondary">
            {selectedExercises.length}/{maxExercises}
          </Badge>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsOpen(true)}
          disabled={selectedExercises.length >= maxExercises}
        >
          <Plus size={16} className="mr-1" />
          Add Exercise
        </Button>
      </div>

      {/* Selected Exercises List */}
      {selectedExercises.length > 0 ? (
        <div className="space-y-2">
          {selectedExercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className="flex items-start gap-2 p-3 bg-tier-navy/5 rounded-lg border border-tier-navy/10"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-tier-navy/60">
                    #{index + 1}
                  </span>
                  <h5 className="text-sm font-medium text-tier-navy">
                    {exercise.name}
                  </h5>
                </div>
                {exercise.notes && (
                  <p className="text-xs text-tier-navy/60 line-clamp-1">
                    {exercise.notes}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  {exercise.durationMinutes && (
                    <span className="inline-flex items-center gap-1 text-xs text-tier-navy/60">
                      <Clock size={12} />
                      {exercise.durationMinutes} min
                    </span>
                  )}
                  {exercise.sets && exercise.reps && (
                    <span className="text-xs text-tier-navy/60">
                      {exercise.sets} × {exercise.reps}
                    </span>
                  )}
                  {exercise.category && (
                    <Badge variant="outline" className="text-xs">
                      {exercise.category}
                    </Badge>
                  )}
                </div>
              </div>
              <button
                onClick={() => onRemove(exercise.id)}
                className="flex-shrink-0 p-1 text-tier-navy/40 hover:text-tier-error transition-colors"
                aria-label="Remove exercise"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center bg-tier-navy/5 rounded-lg border border-dashed border-tier-navy/20">
          <Dumbbell size={32} className="mx-auto mb-2 text-tier-navy/30" />
          <p className="text-sm text-tier-navy/60">No exercises added yet</p>
          <p className="text-xs text-tier-navy/40 mt-1">
            Click "Add Exercise" to browse the library
          </p>
        </div>
      )}

      {/* Exercise Picker Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Exercise Library"
        size="lg"
      >
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-navy/40"
                />
                <Input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {EXERCISE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-tier-navy/60">
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
          </div>

          {/* Exercise Grid */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredExercises.length > 0 ? (
              filteredExercises.map(exercise => {
                const isSelected = selectedIds.has(exercise.id);
                return (
                  <Card
                    key={exercise.id}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-tier-navy/10 border-tier-navy'
                        : 'hover:bg-tier-navy/5 hover:border-tier-navy/30'
                    }`}
                    onClick={() => !isSelected && handleAddExercise(exercise)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-sm font-semibold text-tier-navy">
                            {exercise.name}
                          </h5>
                          {isSelected && (
                            <Badge variant="default" className="text-xs">
                              Added
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-tier-navy/70 mb-2">
                          {exercise.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {exercise.category}
                          </Badge>
                          <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(exercise.difficulty)}`}>
                            {getDifficultyLabel(exercise.difficulty)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-tier-navy/60">
                            <Clock size={12} />
                            {exercise.duration.min}-{exercise.duration.max} min
                          </span>
                        </div>
                      </div>
                      {!isSelected && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddExercise(exercise);
                          }}
                        >
                          <Plus size={16} />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <Search size={48} className="mx-auto mb-3 text-tier-navy/20" />
                <p className="text-sm text-tier-navy/60">No exercises match your filters</p>
                <p className="text-xs text-tier-navy/40 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TemplateExercisePicker;
