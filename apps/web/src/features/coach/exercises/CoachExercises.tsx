/**
 * CoachExercises - Exercises Library Hub Page
 *
 * Purpose: Coaching library with 7 categories.
 *
 * Features:
 * - Exercise library with categories (Putting, Driving, Iron, Wedge, Bunker, Mental, Fitness)
 * - Difficulty filter (Beginner/Intermediate/Advanced)
 * - Search, favorites, usage count
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Play, Filter, Plus, Dumbbell } from 'lucide-react';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../../../components/typography';
import { exercises, getExercisesByCategory, getFavoriteExercises, type Exercise } from '../../../lib/coachMockData';
import { exerciseCategories, difficultyLevels } from '../../../config/coach-navigation';

type CategoryFilter = 'all' | Exercise['category'];
type DifficultyFilter = 'all' | Exercise['difficulty'];

// Difficulty badge
function DifficultyBadge({ difficulty }: { difficulty: Exercise['difficulty'] }) {
  const config = difficultyLevels.find(d => d.id === difficulty);
  const colorClasses = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClasses[difficulty]}`}>
      {config?.labelNO || difficulty}
    </span>
  );
}

// Exercise card
function ExerciseCard({
  exercise,
  onClick,
}: {
  exercise: Exercise;
  onClick: () => void;
}) {
  const categoryConfig = exerciseCategories.find(c => c.id === exercise.category);

  return (
    <div
      onClick={onClick}
      className="p-4 bg-tier-white rounded-xl border border-tier-border-default cursor-pointer hover:border-tier-navy transition-colors"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex items-start gap-4">
        {/* Category icon */}
        <div className="w-12 h-12 rounded-xl bg-tier-navy/10 flex items-center justify-center text-2xl shrink-0">
          {categoryConfig?.icon || ''}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <CardTitle style={{ marginBottom: 0 }}>{exercise.name}</CardTitle>
            {exercise.isFavorite && (
              <Star size={16} className="text-yellow-500 fill-yellow-500 shrink-0" />
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-tier-text-secondary mb-2 line-clamp-2">
            {exercise.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap">
            <DifficultyBadge difficulty={exercise.difficulty} />
            <span className="text-xs text-tier-text-tertiary">{exercise.duration} min</span>
            {exercise.hasMedia && (
              <span className="flex items-center gap-1 text-xs text-tier-text-tertiary">
                <Play size={12} />
                Video
              </span>
            )}
            <span className="text-xs text-tier-text-tertiary">
              Brukt {exercise.usageCount} ganger
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category filter chip
function CategoryChip({
  category,
  active,
  onClick,
}: {
  category: typeof exerciseCategories[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
        active
          ? 'bg-tier-navy text-white'
          : 'bg-tier-surface-base text-tier-text-secondary hover:bg-tier-border-default'
      }`}
    >
      <span>{category.icon}</span>
      <span>{category.labelNO}</span>
    </button>
  );
}

export default function CoachExercises() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [showFavorites, setShowFavorites] = useState(false);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    let result = [...exercises];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        e =>
          e.name.toLowerCase().includes(search) ||
          e.description.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(e => e.category === categoryFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter(e => e.difficulty === difficultyFilter);
    }

    // Favorites filter
    if (showFavorites) {
      result = result.filter(e => e.isFavorite);
    }

    // Sort by usage count (most used first)
    return result.sort((a, b) => b.usageCount - a.usageCount);
  }, [searchTerm, categoryFilter, difficultyFilter, showFavorites]);

  const handleExerciseClick = (exercise: Exercise) => {
    navigate(`/coach/exercises/${exercise.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <PageTitle>Øvelsesbibliotek</PageTitle>
          <p className="text-tier-text-secondary mt-1">
            {exercises.length} øvelser i biblioteket
          </p>
        </div>

        <button
          onClick={() => navigate('/coach/exercises/create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-tier-navy text-white rounded-lg font-medium hover:bg-tier-navy/90 transition-colors"
        >
          <Plus size={18} />
          Ny øvelse
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="flex items-center gap-3 px-4 py-3 bg-tier-white rounded-xl border border-tier-border-default">
          <Search size={20} className="text-tier-text-secondary" />
          <input
            type="text"
            placeholder="Søk i øvelser..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-tier-navy placeholder:text-tier-text-tertiary"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            categoryFilter === 'all'
              ? 'bg-tier-navy text-white'
              : 'bg-tier-surface-base text-tier-text-secondary hover:bg-tier-border-default'
          }`}
        >
          Alle
        </button>
        {exerciseCategories.map(cat => (
          <CategoryChip
            key={cat.id}
            category={cat}
            active={categoryFilter === cat.id}
            onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
          />
        ))}
      </div>

      {/* Additional filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {difficultyLevels.map(level => (
          <button
            key={level.id}
            onClick={() =>
              setDifficultyFilter(difficultyFilter === level.id ? 'all' : level.id as DifficultyFilter)
            }
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              difficultyFilter === level.id
                ? 'bg-tier-navy text-white'
                : 'bg-tier-surface-base text-tier-text-secondary hover:bg-tier-border-default'
            }`}
          >
            {level.labelNO}
          </button>
        ))}
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors flex items-center gap-1.5 ${
            showFavorites
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-tier-surface-base text-tier-text-secondary hover:bg-tier-border-default'
          }`}
        >
          <Star size={14} className={showFavorites ? 'fill-yellow-500' : ''} />
          Favoritter
        </button>
      </div>

      {/* Exercises list */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-16 bg-tier-white rounded-xl border border-tier-border-default">
          <Dumbbell size={48} className="mx-auto text-tier-text-tertiary mb-4" />
          <SubSectionTitle style={{ marginBottom: 8 }}>
            Ingen øvelser funnet
          </SubSectionTitle>
          <p className="text-tier-text-secondary">
            Prøv å endre søk eller filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => handleExerciseClick(exercise)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
