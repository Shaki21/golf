import React, { useState, useMemo } from 'react';
import {
  Dumbbell,
  Search,
  Clock,
  Target,
  Star,
  Plus,
  BookOpen,
  Video,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { SubSectionTitle } from "../../ui/components/typography";

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: 'putting' | 'driving' | 'iron' | 'wedge' | 'bunker' | 'mental' | 'fitness';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  equipment: string[];
  hasVideo: boolean;
  hasGuide: boolean;
  isFavorite: boolean;
  usageCount: number;
  rating: number;
  createdBy: 'system' | 'coach';
}

const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Gate Putting Drill',
    description: 'Practice precision with gates set up around the hole. Focus on line control.',
    category: 'putting',
    difficulty: 'beginner',
    duration: 15,
    equipment: ['Putter', 'Tees', 'Balls'],
    hasVideo: true,
    hasGuide: true,
    isFavorite: true,
    usageCount: 45,
    rating: 4.8,
    createdBy: 'system'
  },
  {
    id: '2',
    name: 'Ladder Drill',
    description: 'Set up markers at increasing distances. Practice distance control on the green.',
    category: 'putting',
    difficulty: 'intermediate',
    duration: 20,
    equipment: ['Putter', 'Markers', 'Balls'],
    hasVideo: true,
    hasGuide: true,
    isFavorite: false,
    usageCount: 32,
    rating: 4.5,
    createdBy: 'system'
  },
  {
    id: '3',
    name: 'Alignment Stick Driver Drill',
    description: 'Use alignment sticks to improve swing path and clubhead position.',
    category: 'driving',
    difficulty: 'intermediate',
    duration: 25,
    equipment: ['Driver', 'Alignment sticks', 'Balls'],
    hasVideo: true,
    hasGuide: true,
    isFavorite: true,
    usageCount: 28,
    rating: 4.7,
    createdBy: 'system'
  },
  {
    id: '4',
    name: 'Stock Shot Practice',
    description: 'Focus on hitting the same distance consistently with different irons.',
    category: 'iron',
    difficulty: 'intermediate',
    duration: 30,
    equipment: ['Iron 7-9', 'Balls', 'Range finder'],
    hasVideo: false,
    hasGuide: true,
    isFavorite: false,
    usageCount: 22,
    rating: 4.3,
    createdBy: 'system'
  },
  {
    id: '5',
    name: 'Wedge Clock System',
    description: 'Learn to control distance with different backswing positions.',
    category: 'wedge',
    difficulty: 'advanced',
    duration: 35,
    equipment: ['Wedges', 'Balls', 'Markers'],
    hasVideo: true,
    hasGuide: true,
    isFavorite: true,
    usageCount: 38,
    rating: 4.9,
    createdBy: 'system'
  },
  {
    id: '6',
    name: 'Bunker Splash Drill',
    description: 'Practice basic bunker shots focusing on sand contact.',
    category: 'bunker',
    difficulty: 'beginner',
    duration: 20,
    equipment: ['Sand wedge', 'Balls'],
    hasVideo: true,
    hasGuide: true,
    isFavorite: false,
    usageCount: 18,
    rating: 4.4,
    createdBy: 'system'
  },
  {
    id: '7',
    name: 'Pre-Shot Routine',
    description: 'Build a consistent pre-shot routine for better focus and consistency.',
    category: 'mental',
    difficulty: 'beginner',
    duration: 15,
    equipment: ['Any club', 'Balls'],
    hasVideo: true,
    hasGuide: true,
    isFavorite: false,
    usageCount: 25,
    rating: 4.6,
    createdBy: 'coach'
  },
  {
    id: '8',
    name: 'Core Stability for Golf',
    description: 'Strength exercises for better rotation and stability in the swing.',
    category: 'fitness',
    difficulty: 'intermediate',
    duration: 30,
    equipment: ['Mat', 'Kettlebell'],
    hasVideo: true,
    hasGuide: true,
    isFavorite: false,
    usageCount: 15,
    rating: 4.2,
    createdBy: 'coach'
  }
];

export const CoachExerciseLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const filteredExercises = useMemo(() => {
    let exercises = [...mockExercises];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      exercises = exercises.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      exercises = exercises.filter(e => e.category === categoryFilter);
    }

    if (difficultyFilter !== 'all') {
      exercises = exercises.filter(e => e.difficulty === difficultyFilter);
    }

    return exercises;
  }, [searchQuery, categoryFilter, difficultyFilter]);

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      putting: 'Putting',
      driving: 'Driver',
      iron: 'Iron Play',
      wedge: 'Wedge',
      bunker: 'Bunker',
      mental: 'Mental',
      fitness: 'Fitness'
    };
    return labels[cat] || cat;
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      putting: { bg: 'rgba(34, 197, 94, 0.1)', text: 'var(--status-success)' },
      driving: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--info)' },
      iron: { bg: 'rgba(99, 102, 241, 0.1)', text: 'var(--accent)' },
      wedge: { bg: 'rgba(var(--category-j), 0.1)', text: 'rgb(var(--category-j))' },
      bunker: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--status-warning)' },
      mental: { bg: 'rgba(var(--category-j), 0.1)', text: 'rgb(var(--category-j))' },
      fitness: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--status-error)' }
    };
    return colors[cat] || { bg: 'var(--card)', text: 'var(--text-tertiary)' };
  };

  const getDifficultyLabel = (diff: string) => {
    const labels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced'
    };
    return labels[diff] || diff;
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'var(--status-success)';
      case 'intermediate': return 'var(--status-warning)';
      case 'advanced': return 'var(--status-error)';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Header - using PageHeader from design system */}
      <PageHeader
        title="Exercise Library"
        subtitle={`${mockExercises.length} exercises available`}
        helpText="The exercise library contains all available exercises. You can create new exercises, use existing templates, or favorite exercises you use often."
        actions={
          <Button variant="primary" onClick={() => navigate('/coach/exercises/create')} leftIcon={<Plus size={18} />}>
            New Exercise
          </Button>
        }
      />

      {/* Quick Links */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => navigate('/coach/exercises/mine')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            border: `1px solid ${'var(--border-default)'}`,
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          <Star size={16} />
          My Exercises
        </button>
        <button
          onClick={() => navigate('/coach/exercises/templates')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            border: `1px solid ${'var(--border-default)'}`,
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          <BookOpen size={16} />
          Training Plans
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)'
            }}
          />
          <input
            type="text"
            placeholder="Search for exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              borderRadius: '10px',
              border: `1px solid ${'var(--border-default)'}`,
              backgroundColor: 'var(--bg-primary)',
              fontSize: '14px',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            border: `1px solid ${'var(--border-default)'}`,
            backgroundColor: 'var(--bg-primary)',
            fontSize: '14px',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <option value="all">All categories</option>
          <option value="putting">Putting</option>
          <option value="driving">Driver</option>
          <option value="iron">Iron Play</option>
          <option value="wedge">Wedge</option>
          <option value="bunker">Bunker</option>
          <option value="mental">Mental</option>
          <option value="fitness">Fitness</option>
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            border: `1px solid ${'var(--border-default)'}`,
            backgroundColor: 'var(--bg-primary)',
            fontSize: '14px',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <option value="all">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Exercise Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {filteredExercises.map((exercise) => {
          const catColor = getCategoryColor(exercise.category);
          return (
            <div
              key={exercise.id}
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '16px',
                padding: '20px',
                border: `1px solid ${'var(--border-default)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: catColor.bg,
                    color: catColor.text
                  }}>
                    {getCategoryLabel(exercise.category)}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: getDifficultyColor(exercise.difficulty)
                  }}>
                    {getDifficultyLabel(exercise.difficulty)}
                  </span>
                </div>
                {exercise.isFavorite && (
                  <Star size={18} color="var(--status-warning)" fill="var(--status-warning)" />
                )}
              </div>

              {/* Title */}
              <SubSectionTitle style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: '0 0 8px 0'
              }}>
                {exercise.name}
              </SubSectionTitle>

              {/* Description */}
              <p style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                margin: '0 0 16px 0',
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {exercise.description}
              </p>

              {/* Meta */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} color={'var(--text-tertiary)'} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {exercise.duration} min
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Target size={14} color={'var(--text-tertiary)'} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {exercise.usageCount}x used
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={14} color="var(--status-warning)" fill="var(--status-warning)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {exercise.rating}
                  </span>
                </div>
              </div>

              {/* Resources */}
              <div style={{
                display: 'flex',
                gap: '8px',
                paddingTop: '12px',
                borderTop: `1px solid ${'var(--border-default)'}`
              }}>
                {exercise.hasVideo && (
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--status-error)',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    <Video size={14} />
                    Video
                  </button>
                )}
                {exercise.hasGuide && (
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--info)',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    <FileText size={14} />
                    Guide
                  </button>
                )}
                <button style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  <Plus size={14} />
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '16px',
          border: `1px solid ${'var(--border-default)'}`
        }}>
          <Dumbbell size={48} color={'var(--text-tertiary)'} style={{ marginBottom: '16px' }} />
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            margin: 0
          }}>
            No exercises found with selected filters
          </p>
        </div>
      )}
    </div>
  );
};

export default CoachExerciseLibrary;
