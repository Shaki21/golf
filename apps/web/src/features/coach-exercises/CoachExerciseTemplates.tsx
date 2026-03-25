/**
 * CoachExerciseTemplates.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Clock,
  Target,
  Users,
  Dumbbell,
  ChevronRight,
  Copy,
  Edit2,
  Trash2,
  MoreVertical,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../ui/primitives/Button';
import { PageTitle, SubSectionTitle, CardTitle } from '../../components/typography/Headings';

// ============================================================================
// CLASS MAPPINGS
// ============================================================================

const CATEGORY_CLASSES = {
  putting: { bg: 'bg-blue-500/15', text: 'text-blue-600' },        // Blue for Putting
  fullspill: { bg: 'bg-blue-500/15', text: 'text-blue-600' },      // Blue for Full game
  kortspill: { bg: 'bg-orange-500/15', text: 'text-orange-600' },  // Orange for Short game
  fysisk: { bg: 'bg-red-500/15', text: 'text-red-600' },           // Red for Fitness
  mental: { bg: 'bg-purple-600/15', text: 'text-purple-700' },     // Purple for Mental
  blandet: { bg: 'bg-green-500/15', text: 'text-green-600' },      // Green for Mixed
};

interface TrainingTemplate {
  id: string;
  name: string;
  description: string;
  category: 'putting' | 'fullspill' | 'kortspill' | 'fysisk' | 'mental' | 'blandet';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  exerciseCount: number;
  targetGroup?: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  isOwn: boolean;
  exercises: {
    name: string;
    duration: number;
  }[];
}

const mockTemplates: TrainingTemplate[] = [
  {
    id: '1',
    name: 'Putting Mastery - Beginner',
    description: 'Complete training session to build fundamental putting skills.',
    category: 'putting',
    difficulty: 'beginner',
    duration: 45,
    exerciseCount: 4,
    targetGroup: 'Category C',
    createdAt: '2024-11-01',
    lastUsed: '2025-01-18',
    usageCount: 28,
    isOwn: true,
    exercises: [
      { name: 'Gate Putting Drill', duration: 10 },
      { name: 'Ladder Drill', duration: 15 },
      { name: 'Circle Challenge', duration: 10 },
      { name: 'Pressure Putts', duration: 10 }
    ]
  },
  {
    id: '2',
    name: 'WANG Training Session',
    description: 'Standard training session for WANG Elite Sports group focusing on all aspects.',
    category: 'blandet',
    difficulty: 'intermediate',
    duration: 90,
    exerciseCount: 6,
    targetGroup: 'WANG Toppidrett',
    createdAt: '2024-10-15',
    lastUsed: '2025-01-19',
    usageCount: 45,
    isOwn: true,
    exercises: [
      { name: 'Warm-up Routine', duration: 10 },
      { name: 'Iron Precision', duration: 20 },
      { name: 'Wedge Clock System', duration: 20 },
      { name: 'Putting Challenge', duration: 20 },
      { name: 'Bunker Basics', duration: 10 },
      { name: 'Cool-down', duration: 10 }
    ]
  },
  {
    id: '3',
    name: 'Short Game Intensive',
    description: 'Focused session on wedges, chipping and pitching for better scoring.',
    category: 'kortspill',
    difficulty: 'intermediate',
    duration: 60,
    exerciseCount: 5,
    createdAt: '2024-09-20',
    lastUsed: '2025-01-16',
    usageCount: 32,
    isOwn: true,
    exercises: [
      { name: 'Wedge Distance Control', duration: 15 },
      { name: 'Chip and Run', duration: 10 },
      { name: 'Flop Shot Practice', duration: 10 },
      { name: 'Up and Down Challenge', duration: 15 },
      { name: 'Scoring Zone Test', duration: 10 }
    ]
  },
  {
    id: '4',
    name: 'Tournament Preparation',
    description: 'Mental and physical preparation before important tournaments.',
    category: 'mental',
    difficulty: 'advanced',
    duration: 75,
    exerciseCount: 5,
    targetGroup: 'Tournament Players',
    createdAt: '2024-08-10',
    lastUsed: '2025-01-12',
    usageCount: 18,
    isOwn: true,
    exercises: [
      { name: 'Pre-Shot Routine', duration: 15 },
      { name: 'Pressure Simulation', duration: 20 },
      { name: 'Course Visualization', duration: 15 },
      { name: 'Focus Training', duration: 15 },
      { name: 'Recovery Breathing', duration: 10 }
    ]
  },
  {
    id: '5',
    name: 'Strength Training for Golf',
    description: 'Physical training program for better power and stability in the swing.',
    category: 'fysisk',
    difficulty: 'intermediate',
    duration: 45,
    exerciseCount: 6,
    createdAt: '2024-12-01',
    lastUsed: '2025-01-17',
    usageCount: 22,
    isOwn: false,
    exercises: [
      { name: 'Dynamic Warm-up', duration: 5 },
      { name: 'Core Stability', duration: 10 },
      { name: 'Rotational Power', duration: 10 },
      { name: 'Lower Body Strength', duration: 10 },
      { name: 'Flexibility Work', duration: 5 },
      { name: 'Cool-down Stretches', duration: 5 }
    ]
  }
];

export const CoachExerciseTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    let templates = [...mockTemplates];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      templates = templates.filter(t => t.category === categoryFilter);
    }

    return templates;
  }, [searchQuery, categoryFilter]);

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      putting: 'Putting',
      fullspill: 'Full Game',
      kortspill: 'Short Game',
      fysisk: 'Fitness',
      mental: 'Mental',
      blandet: 'Mixed'
    };
    return labels[cat] || cat;
  };

  const getCategoryClasses = (cat: string) => {
    return CATEGORY_CLASSES[cat as keyof typeof CATEGORY_CLASSES] || {
      bg: 'bg-tier-surface-base',
      text: 'text-tier-text-secondary'
    };
  };

  const getDifficultyLabel = (diff: string) => {
    const labels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced'
    };
    return labels[diff] || diff;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never used';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="p-6 bg-tier-surface-base min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <PageTitle className="text-[28px] font-bold text-tier-navy m-0">
                Training Plans
              </PageTitle>
              <p className="text-sm text-tier-text-secondary m-0">
                {mockTemplates.length} templates available
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/coach/exercises/templates/create')}
          className="flex items-center gap-2 py-3 px-5 rounded-[10px] border-none bg-tier-navy text-white text-sm font-semibold cursor-pointer"
        >
          <Plus size={18} />
          New Training Plan
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[400px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-secondary"
          />
          <input
            type="text"
            placeholder="Search training plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-10 pr-3 rounded-[10px] border border-tier-border-default bg-tier-white text-sm text-tier-navy outline-none"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'putting', label: 'Putting' },
            { key: 'kortspill', label: 'Short Game' },
            { key: 'blandet', label: 'Mixed' },
            { key: 'fysisk', label: 'Fitness' }
          ].map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`py-2.5 px-4 rounded-[10px] border-none text-[13px] font-medium cursor-pointer ${
                categoryFilter === cat.key
                  ? 'bg-tier-navy text-white'
                  : 'bg-tier-white text-tier-text-secondary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template List */}
      <div className="flex flex-col gap-4">
        {filteredTemplates.map((template) => {
          const catClasses = getCategoryClasses(template.category);
          const isExpanded = expandedTemplate === template.id;

          return (
            <div
              key={template.id}
              className="bg-tier-white rounded-2xl border border-tier-border-default overflow-hidden"
            >
              {/* Main Content */}
              <div className="p-5 flex items-start gap-4">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${catClasses.bg}`}>
                  <BookOpen size={24} className={catClasses.text} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <SubSectionTitle className="text-[17px] font-semibold text-tier-navy m-0">
                      {template.name}
                    </SubSectionTitle>
                    <span className={`text-[10px] font-semibold py-0.5 px-2 rounded ${catClasses.bg} ${catClasses.text}`}>
                      {getCategoryLabel(template.category)}
                    </span>
                    <span className="text-[10px] font-medium py-0.5 px-2 rounded bg-tier-surface-base text-tier-text-secondary">
                      {getDifficultyLabel(template.difficulty)}
                    </span>
                    {template.isOwn && (
                      <span className="text-[10px] font-medium py-0.5 px-2 rounded bg-tier-success/15 text-tier-success">
                        Custom
                      </span>
                    )}
                  </div>

                  <p className="text-[13px] text-tier-text-secondary m-0 mb-3 leading-relaxed">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-tier-text-secondary" />
                      <span className="text-xs text-tier-text-secondary">
                        {template.duration} min
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Dumbbell size={14} className="text-tier-text-secondary" />
                      <span className="text-xs text-tier-text-secondary">
                        {template.exerciseCount} exercises
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Target size={14} className="text-tier-text-secondary" />
                      <span className="text-xs text-tier-text-secondary">
                        {template.usageCount}x used
                      </span>
                    </div>
                    {template.targetGroup && (
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-tier-text-secondary" />
                        <span className="text-xs text-tier-text-secondary">
                          {template.targetGroup}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-tier-text-secondary">
                      Last used: {formatDate(template.lastUsed)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                    className="py-2.5 px-4 rounded-lg border border-tier-border-default bg-transparent text-tier-text-secondary text-[13px] font-medium cursor-pointer flex items-center gap-1.5"
                  >
                    {isExpanded ? 'Hide' : 'Show exercises'}
                    <ChevronRight
                      size={14}
                      className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                  <button className="py-2.5 px-4 rounded-lg border-none bg-tier-navy text-white text-[13px] font-medium cursor-pointer flex items-center gap-1.5">
                    <Play size={14} />
                    Use
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === template.id ? null : template.id)}
                      className="w-9 h-9 rounded-lg border border-tier-border-default bg-transparent flex items-center justify-center cursor-pointer"
                    >
                      <MoreVertical size={16} className="text-tier-text-secondary" />
                    </button>
                    {activeMenu === template.id && (
                      <div className="absolute top-full right-0 mt-1 bg-tier-white rounded-[10px] border border-tier-border-default shadow-lg z-[100] min-w-[160px] overflow-hidden">
                        <button
                          onClick={() => setActiveMenu(null)}
                          className="w-full py-2.5 px-3.5 border-none bg-transparent flex items-center gap-2.5 cursor-pointer text-[13px] text-tier-navy hover:bg-tier-surface-base"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => setActiveMenu(null)}
                          className="w-full py-2.5 px-3.5 border-none bg-transparent flex items-center gap-2.5 cursor-pointer text-[13px] text-tier-navy hover:bg-tier-surface-base"
                        >
                          <Copy size={14} />
                          Duplicate
                        </button>
                        <button
                          onClick={() => setActiveMenu(null)}
                          className="w-full py-2.5 px-3.5 border-none bg-transparent flex items-center gap-2.5 cursor-pointer text-[13px] text-tier-error hover:bg-tier-surface-base"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Exercise List */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-4 border-t border-tier-border-default -mt-1">
                  <CardTitle className="text-[13px] font-semibold text-tier-text-secondary m-0 mb-3 uppercase tracking-wide">
                    Exercises in this plan
                  </CardTitle>
                  <div className="flex flex-col gap-2">
                    {template.exercises.map((exercise, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 py-2.5 px-3.5 bg-tier-surface-base rounded-lg"
                      >
                        <span className="w-6 h-6 rounded-full bg-tier-navy/15 text-tier-navy flex items-center justify-center text-xs font-semibold">
                          {idx + 1}
                        </span>
                        <span className="flex-1 text-sm text-tier-navy">
                          {exercise.name}
                        </span>
                        <span className="text-xs text-tier-text-secondary">
                          {exercise.duration} min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16 px-5 bg-tier-white rounded-2xl border border-tier-border-default">
          <BookOpen size={48} className="text-tier-text-secondary mb-4 mx-auto" />
          <p className="text-base text-tier-text-secondary m-0 mb-4">
            {searchQuery ? 'No training plans found' : 'No training plans created yet'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate('/coach/exercises/templates/create')}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-[10px] border-none bg-tier-navy text-white text-sm font-medium cursor-pointer"
            >
              <Plus size={16} />
              Create first training plan
            </button>
          )}
        </div>
      )}

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          onClick={() => setActiveMenu(null)}
          className="fixed inset-0 z-50"
        />
      )}
    </div>
  );
};

export default CoachExerciseTemplates;
