/**
 * WorkoutContentViewer
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Read-only view of workout exercises/content
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, Target, CheckCircle2, Circle, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';
import { Workout } from './types';
import { SectionTitle } from '../../../components/typography';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  sets?: number;
  reps?: number;
  duration?: number;
  isCompleted?: boolean;
}

interface WorkoutContentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout | null;
}

// Translate category
const translateCategory = (category: string): string => {
  const translations: Record<string, string> = {
    teknikk: 'Teknikk',
    golfslag: 'Golfslag',
    spill: 'Spill',
    konkurranse: 'Konkurranse',
    fysisk: 'Fysisk',
    mental: 'Mental',
  };
  return translations[category] || category;
};

// Sample exercises (would come from API)
const sampleExercises: Exercise[] = [
  {
    id: 'ex1',
    name: 'Oppvarming',
    description: 'Lett strekking og mobilisering. Fokus pa hofter og skuldre.',
    duration: 5,
    isCompleted: true,
  },
  {
    id: 'ex2',
    name: 'Korte putter (1m)',
    description: 'Putt 20 baller fra 1 meter. Fokuser pa rett linje og fast grep.',
    reps: 20,
    isCompleted: true,
  },
  {
    id: 'ex3',
    name: 'Middels putter (2m)',
    description: 'Putt 15 baller fra 2 meter. Hold oynene pa ballen gjennom hele slaget.',
    reps: 15,
    isCompleted: false,
  },
  {
    id: 'ex4',
    name: 'Lange putter (3m)',
    description: 'Putt 10 baller fra 3 meter. Fokuser pa distansekontroll.',
    reps: 10,
    isCompleted: false,
  },
  {
    id: 'ex5',
    name: 'Avsluttende ovelse',
    description: 'Putt rundt hullet fra forskjellige vinkler. 5 putter pa rad for a fullfare.',
    sets: 3,
    reps: 5,
    isCompleted: false,
  },
];

export const WorkoutContentViewer: React.FC<WorkoutContentViewerProps> = ({
  isOpen,
  onClose,
  workout,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>(sampleExercises);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setExpandedExercise(null);
      // In real app, fetch exercises for this workout
      setExercises(sampleExercises);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const toggleExpanded = (id: string) => {
    setExpandedExercise(expandedExercise === id ? null : id);
  };

  const completedCount = exercises.filter((ex) => ex.isCompleted).length;
  const totalCount = exercises.length;

  if (!isOpen || !workout) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-black/50 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[600px] max-h-[85vh] z-[101] flex flex-col rounded-xl shadow-lg transition-all duration-200 bg-tier-white ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-tier-border-default">
          <div className="flex-1">
            <SectionTitle className="text-lg font-semibold text-tier-navy">
              {workout.name}
            </SectionTitle>
            <div className="flex items-center gap-3 mt-1 text-xs text-tier-text-tertiary">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {workout.duration} min
              </span>
              <span className="flex items-center gap-1">
                <Target size={12} />
                {translateCategory(workout.category)}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} />
                {completedCount}/{totalCount} øvelser
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-colors text-tier-text-tertiary hover:bg-tier-surface-base"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Description */}
          {workout.description && (
            <p className="text-base leading-relaxed mb-4 p-3 rounded-lg text-tier-text-secondary bg-tier-surface-base">
              {workout.description}
            </p>
          )}

          {/* Exercises */}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide mb-3 text-tier-text-tertiary">
            <Dumbbell size={14} />
            Øvelser
          </div>

          {exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-tier-surface-base">
                <Dumbbell size={28} className="text-tier-text-tertiary" />
              </div>
              <p className="text-base text-tier-text-secondary">Ingen øvelser definert</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  onClick={() => toggleExpanded(exercise.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                    exercise.isCompleted
                      ? 'bg-tier-success/10 border-tier-success'
                      : 'bg-tier-white border-tier-border-default hover:border-tier-navy'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {exercise.isCompleted ? (
                      <CheckCircle2 size={20} className="text-tier-success" />
                    ) : (
                      <Circle size={20} className="text-tier-text-tertiary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-semibold mb-0.5 text-tier-navy">
                      {exercise.name}
                    </div>
                    <div className="flex gap-3 text-xs text-tier-text-tertiary">
                      {exercise.duration && <span>{exercise.duration} min</span>}
                      {exercise.sets && <span>{exercise.sets} sett</span>}
                      {exercise.reps && <span>{exercise.reps} rep</span>}
                    </div>
                    {expandedExercise === exercise.id && exercise.description && (
                      <div className="mt-2 p-2 rounded text-sm leading-relaxed text-tier-text-secondary bg-tier-surface-base">
                        {exercise.description}
                      </div>
                    )}
                  </div>
                  <div
                    className={`flex-shrink-0 transition-transform text-tier-text-tertiary ${
                      expandedExercise === exercise.id ? 'rotate-180' : ''
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-tier-border-default bg-tier-surface-base">
          <button
            onClick={onClose}
            className="w-full p-3 rounded-lg text-base font-semibold transition-colors bg-tier-navy text-white hover:bg-tier-navy/90"
          >
            Lukk
          </button>
        </div>
      </div>
    </>
  );
};

export default WorkoutContentViewer;
