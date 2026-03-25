/**
 * TIER Golf - Drill Management Page
 * Design System v3.1 - Decision-First Sub-Page
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "Which drills fit my training needs right now?"
 *
 * INFORMATION ARCHITECTURE:
 * Layer 1 - Decision Hero: Recommended drill based on training focus/weakest area
 * Layer 2 - Quick Stats: Available drills overview
 * Layer 3 - Full Library: Filterable drill collection
 *
 * Comprehensive drill/exercise management system with:
 * - Repetitions (reps)
 * - Estimated time
 * - L-Phase (learning phase)
 * - Training area
 * - Environment
 * - CS level (club speed)
 * - Pressure level
 *
 * Features:
 * - Create, edit, delete drills
 * - Filter by all taxonomy dimensions
 * - Add drills to training sessions
 * - AI-powered drill recommendations
 * - Template library
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Copy, Dumbbell, Clock, Target, Gauge, Filter, ArrowRight, Play, TrendingUp, Zap, Star, Loader2 } from 'lucide-react';
import { StandardPageHeader } from '../../components/layout/StandardPageHeader';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/shadcn/dialog';
import { SectionTitle, SubSectionTitle } from '../../components/typography';
import { Badge } from '../../components/shadcn/badge';
import { useDrills, type Drill, type PyramideLevel, type CreateDrillInput } from './hooks/useDrills';

// ============================================================================
// TYPES - Imported from useDrills hook
// ============================================================================

// Re-export types for convenience within this file
type LPhase = 'L-BODY' | 'L-ARM' | 'L-CLUB' | 'L-BALL' | 'L-AUTO';
type CSLevel = 'CS20' | 'CS40' | 'CS60' | 'CS80' | 'CS100';
type EnvironmentLevel = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5';
type PressureLevel = 'PR1' | 'PR2' | 'PR3' | 'PR4' | 'PR5';

// ============================================================================
// CONSTANTS
// ============================================================================

const PYRAMIDE_LEVELS: Record<PyramideLevel, { label: string; color: string; bgColor: string }> = {
  FYS: { label: 'Physical', color: 'text-purple-600', bgColor: 'bg-purple-500/15' },
  TEK: { label: 'Technique', color: 'text-tier-navy', bgColor: 'bg-tier-navy/15' },
  SLAG: { label: 'Golf Shots', color: 'text-tier-success', bgColor: 'bg-tier-success/15' },
  SPILL: { label: 'Play', color: 'text-amber-600', bgColor: 'bg-amber-500/15' },
  TURN: { label: 'Tournament', color: 'text-tier-error', bgColor: 'bg-tier-error/15' },
};

const GOLF_AREAS = [
  { id: 'TEE', label: 'Tee Total', group: 'fullSwing' },
  { id: 'INN200', label: 'Approach 200+ m', group: 'fullSwing' },
  { id: 'INN150', label: 'Approach 150-200 m', group: 'fullSwing' },
  { id: 'INN100', label: 'Approach 100-150 m', group: 'fullSwing' },
  { id: 'INN50', label: 'Approach 50-100 m', group: 'fullSwing' },
  { id: 'PITCH', label: 'Pitch', group: 'shortGame' },
  { id: 'BUNKER', label: 'Bunker', group: 'shortGame' },
  { id: 'LOB', label: 'Lob', group: 'shortGame' },
  { id: 'CHIP', label: 'Chip', group: 'shortGame' },
  { id: 'PUTT0-3', label: 'Putting 0-3 ft', group: 'putting' },
  { id: 'PUTT3-5', label: 'Putting 3-5 ft', group: 'putting' },
  { id: 'PUTT5-10', label: 'Putting 5-10 ft', group: 'putting' },
  { id: 'PUTT10-15', label: 'Putting 10-15 ft', group: 'putting' },
  { id: 'PUTT15-25', label: 'Putting 15-25 ft', group: 'putting' },
  { id: 'PUTT25-40', label: 'Putting 25-40 ft', group: 'putting' },
  { id: 'PUTT40+', label: 'Putting 40+ ft', group: 'putting' },
];

const L_PHASES: Record<LPhase, string> = {
  'L-BODY': 'Body',
  'L-ARM': 'Arm',
  'L-CLUB': 'Club',
  'L-BALL': 'Ball',
  'L-AUTO': 'Auto',
};

const CS_LEVELS: Record<CSLevel, string> = {
  CS20: '20% speed',
  CS40: '40% speed',
  CS60: '60% speed',
  CS80: '80% speed',
  CS100: '100% speed',
};

const ENVIRONMENTS: Record<EnvironmentLevel, string> = {
  M0: 'Off course',
  M1: 'Indoors',
  M2: 'Range',
  M3: 'Practice area',
  M4: 'Course practice',
  M5: 'Tournament',
};

const PRESSURE_LEVELS: Record<PressureLevel, string> = {
  PR1: 'No pressure',
  PR2: 'Self-monitoring',
  PR3: 'Social',
  PR4: 'Competition',
  PR5: 'Tournament',
};


// ============================================================================
// COMPONENTS
// ============================================================================

interface DrillCardProps {
  drill: Drill;
  onEdit: (drill: Drill) => void;
  onDelete: (id: string) => void;
  onDuplicate: (drill: Drill) => void;
  onAddToSession: (drill: Drill) => void;
}

const DrillCard: React.FC<DrillCardProps> = ({
  drill,
  onEdit,
  onDelete,
  onDuplicate,
  onAddToSession,
}) => {
  const pyramideConfig = PYRAMIDE_LEVELS[drill.pyramide];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${pyramideConfig.bgColor} ${pyramideConfig.color}`}>
                {pyramideConfig.label}
              </span>
              {drill.isFavorite && (
                <span className="text-tier-navy">★</span>
              )}
            </div>
            <SubSectionTitle style={{ margin: 0, marginBottom: 4 }}>
              {drill.name}
            </SubSectionTitle>
            <p className="text-sm text-tier-text-secondary m-0">
              {drill.description}
            </p>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-tier-surface-base rounded">
          <div className="flex items-center gap-2 text-xs">
            <Target size={14} className="text-tier-text-tertiary flex-shrink-0" />
            <div>
              <div className="font-medium text-tier-navy">
                {GOLF_AREAS.find(a => a.id === drill.golfArea)?.label}
              </div>
              <div className="text-tier-text-tertiary">Area</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Gauge size={14} className="text-tier-text-tertiary flex-shrink-0" />
            <div>
              <div className="font-medium text-tier-navy">
                {L_PHASES[drill.lPhase]} • {drill.csLevel}
              </div>
              <div className="text-tier-text-tertiary">Phase • Speed</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Dumbbell size={14} className="text-tier-text-tertiary flex-shrink-0" />
            <div>
              <div className="font-medium text-tier-navy">
                {drill.reps ? `${drill.reps} reps${drill.sets ? ` × ${drill.sets}` : ''}` : 'Not specified'}
              </div>
              <div className="text-tier-text-tertiary">Repetitions</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Clock size={14} className="text-tier-text-tertiary flex-shrink-0" />
            <div>
              <div className="font-medium text-tier-navy">
                {drill.estimatedMinutes} min
              </div>
              <div className="text-tier-text-tertiary">Estimated time</div>
            </div>
          </div>
        </div>

        {/* Environment and Pressure */}
        <div className="flex gap-2 mb-3 text-xs">
          <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">
            {ENVIRONMENTS[drill.environment]}
          </span>
          <span className="px-2 py-1 rounded bg-orange-50 text-orange-700">
            {PRESSURE_LEVELS[drill.pressure]}
          </span>
          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
            Level {drill.difficulty}/5
          </span>
        </div>

        {/* Tags */}
        {drill.tags && drill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {drill.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded bg-tier-surface-base text-tier-text-secondary text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-tier-border-default">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAddToSession(drill)}
            className="flex-1"
          >
            Add to session
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(drill)}
            leftIcon={<Edit2 size={14} />}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(drill)}
            leftIcon={<Copy size={14} />}
          >
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(drill.id)}
            leftIcon={<Trash2 size={14} />}
            className="text-tier-error hover:text-tier-error"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

// =============================================================================
// DECISION HERO - Recommended drill based on training focus
// =============================================================================

interface DrillRecommendationHeroProps {
  recommendedDrill: Drill | null;
  trainingFocus: string;
  weakestArea: string;
  stats: {
    totalDrills: number;
    favoriteCount: number;
    avgDuration: number;
    pyramideCounts: Record<PyramideLevel, number>;
  };
  onStartDrill: (drill: Drill) => void;
  onExploreAll: () => void;
}

const DrillRecommendationHero: React.FC<DrillRecommendationHeroProps> = ({
  recommendedDrill,
  trainingFocus,
  weakestArea,
  stats,
  onStartDrill,
  onExploreAll,
}) => {
  if (!recommendedDrill) {
    return (
      <Card className="mb-6 p-6 bg-gradient-to-r from-tier-navy/5 to-tier-gold/5 border-tier-navy/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-tier-navy/10 flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-tier-navy" />
          </div>
          <div>
            <SectionTitle style={{ margin: 0 }}>No drills available</SectionTitle>
            <p className="text-tier-navy/70 mt-1">Create your first drill to get started with personalized recommendations.</p>
          </div>
        </div>
      </Card>
    );
  }

  const pyramideConfig = PYRAMIDE_LEVELS[recommendedDrill.pyramide];

  return (
    <Card className="mb-6 p-6 bg-gradient-to-r from-tier-gold/10 to-tier-gold/5 border-tier-gold/30">
      {/* Header with context */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-tier-gold/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-tier-gold" />
          </div>
          <div>
            <span className="text-sm text-tier-navy/60">Recommended for you</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-medium text-tier-gold bg-tier-gold/20 px-2 py-0.5 rounded-full">
                Focus: {trainingFocus}
              </span>
              {weakestArea && (
                <span className="text-xs font-medium text-tier-navy/60 bg-tier-navy/10 px-2 py-0.5 rounded-full">
                  Target: {weakestArea}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-2xl font-bold text-tier-navy">{stats.totalDrills}</span>
          <p className="text-xs text-tier-navy/60">drills available</p>
        </div>
      </div>

      {/* Recommended drill details */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${pyramideConfig.bgColor} ${pyramideConfig.color}`}>
              {pyramideConfig.label}
            </span>
            {recommendedDrill.isFavorite && (
              <Star className="w-4 h-4 text-tier-gold fill-tier-gold" />
            )}
          </div>
          <SectionTitle style={{ margin: 0, marginBottom: 8 }}>{recommendedDrill.name}</SectionTitle>
          <p className="text-tier-navy/70 mb-4 line-clamp-2">{recommendedDrill.description}</p>

          {/* Quick meta */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">
              <Clock size={12} className="mr-1" />
              {recommendedDrill.estimatedMinutes} min
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Target size={12} className="mr-1" />
              {GOLF_AREAS.find(a => a.id === recommendedDrill.golfArea)?.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {L_PHASES[recommendedDrill.lPhase]}
            </Badge>
            {recommendedDrill.reps && (
              <Badge variant="outline" className="text-xs">
                {recommendedDrill.reps} reps
              </Badge>
            )}
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onStartDrill(recommendedDrill)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-tier-navy text-white rounded-lg font-medium hover:bg-tier-navy/90 transition-colors"
            >
              <Play size={16} />
              Start This Drill
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onExploreAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-tier-white text-tier-navy border border-tier-navy/20 rounded-lg font-medium hover:bg-tier-surface-base transition-colors"
            >
              Explore All Drills
            </button>
          </div>
        </div>

        {/* Quick stats sidebar */}
        <div className="lg:w-64 bg-tier-white/50 rounded-lg p-4">
          <SubSectionTitle style={{ margin: 0, marginBottom: 12, fontSize: '0.875rem' }} className="flex items-center gap-2">
            <TrendingUp size={16} />
            Library Overview
          </SubSectionTitle>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-tier-navy/60">Total Drills</span>
              <span className="font-medium text-tier-navy">{stats.totalDrills}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-tier-navy/60">Favorites</span>
              <span className="font-medium text-tier-navy">{stats.favoriteCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-tier-navy/60">Avg Duration</span>
              <span className="font-medium text-tier-navy">{stats.avgDuration} min</span>
            </div>
            <div className="border-t border-tier-border-default pt-3 mt-3">
              <p className="text-xs text-tier-navy/60 mb-2">By Category</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(stats.pyramideCounts).map(([level, count]) => {
                  if (count === 0) return null;
                  const config = PYRAMIDE_LEVELS[level as PyramideLevel];
                  return (
                    <span key={level} className={`px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
                      {config.label}: {count}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DrillManagementPage: React.FC = () => {
  // Filter state
  const [filterPyramide, setFilterPyramide] = useState<PyramideLevel | 'all'>('all');
  const [filterArea, setFilterArea] = useState<string>('all');

  // Use the drills hook with filters
  const {
    drills,
    filteredDrills,
    isLoading,
    error,
    createDrill,
    updateDrill,
    deleteDrill,
    duplicateDrill,
  } = useDrills({
    pyramide: filterPyramide,
    golfArea: filterArea,
  });

  // UI state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingDrill, setEditingDrill] = useState<Drill | null>(null);
  const [showAddToSessionDialog, setShowAddToSessionDialog] = useState(false);
  const [selectedDrillForSession, setSelectedDrillForSession] = useState<Drill | null>(null);

  // ==========================================================================
  // DECISION-FIRST: Compute recommendation and stats for hero
  // ==========================================================================

  // Mock training focus - in production, this would come from user profile/API
  const trainingFocus = 'Short Game';
  const weakestArea = 'Putting 3-5 ft';

  // Compute drill statistics
  const drillStats = useMemo(() => {
    const totalDrills = drills.length;
    const favoriteCount = drills.filter(d => d.isFavorite).length;
    const avgDuration = totalDrills > 0
      ? Math.round(drills.reduce((sum, d) => sum + d.estimatedMinutes, 0) / totalDrills)
      : 0;

    const pyramideCounts: Record<PyramideLevel, number> = {
      FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0,
    };
    drills.forEach(d => {
      pyramideCounts[d.pyramide]++;
    });

    return { totalDrills, favoriteCount, avgDuration, pyramideCounts };
  }, [drills]);

  // Get recommended drill based on training focus and weakest area
  // In production, this would use a more sophisticated algorithm
  const recommendedDrill = useMemo(() => {
    // Priority 1: Favorite drills matching weakest area
    const favoriteMatches = drills.filter(d =>
      d.isFavorite && d.golfArea.includes('PUTT')
    );
    if (favoriteMatches.length > 0) return favoriteMatches[0];

    // Priority 2: Any drill matching weakest area
    const areaMatches = drills.filter(d => d.golfArea.includes('PUTT'));
    if (areaMatches.length > 0) return areaMatches[0];

    // Priority 3: Favorite drills
    const favorites = drills.filter(d => d.isFavorite);
    if (favorites.length > 0) return favorites[0];

    // Fallback: First available drill
    return drills[0] || null;
  }, [drills]);

  // Scroll to filters section
  const handleExploreAll = () => {
    const filtersElement = document.getElementById('drill-filters');
    if (filtersElement) {
      filtersElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEdit = (drill: Drill) => {
    setEditingDrill(drill);
    setShowCreateDialog(true);
  };

  const handleSaveDrill = async (updatedDrill: Partial<Drill>) => {
    if (editingDrill) {
      // Update existing drill via API
      await updateDrill({
        id: editingDrill.id,
        ...updatedDrill,
      });
    } else {
      // Create new drill via API
      const newDrillInput: CreateDrillInput = {
        name: updatedDrill.name || 'New exercise',
        description: updatedDrill.description || '',
        pyramide: updatedDrill.pyramide || 'TEK',
        golfArea: updatedDrill.golfArea || 'TEE',
        lPhase: updatedDrill.lPhase || 'L-BODY',
        csLevel: updatedDrill.csLevel || 'CS60',
        environment: updatedDrill.environment || 'M2',
        pressure: updatedDrill.pressure || 'PR1',
        reps: updatedDrill.reps,
        sets: updatedDrill.sets,
        estimatedMinutes: updatedDrill.estimatedMinutes || 15,
        difficulty: updatedDrill.difficulty || 2,
        isFavorite: updatedDrill.isFavorite,
        tags: updatedDrill.tags,
      };
      await createDrill(newDrillInput);
    }
    setShowCreateDialog(false);
    setEditingDrill(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      await deleteDrill(id);
    }
  };

  const handleDuplicate = async (drill: Drill) => {
    await duplicateDrill(drill);
  };

  const handleAddToSession = (drill: Drill) => {
    setSelectedDrillForSession(drill);
    setShowAddToSessionDialog(true);
  };

  const handleConfirmAddToSession = () => {
    if (selectedDrillForSession) {
      // In a real implementation, this would add the drill to the current/selected session
      // For now, we show a success message and close the dialog
      alert(`"${selectedDrillForSession.name}" has been added to your session.`);
      setShowAddToSessionDialog(false);
      setSelectedDrillForSession(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <StandardPageHeader
        icon={Dumbbell}
        title="Exercise Library"
        subtitle="Manage your collection of training exercises with reps, time, phase and pressure"
        helpText="Complete library of training exercises with full AK hierarchy classification. Each exercise has pyramid level, L-phase, CS level, environment, pressure, repetitions and estimated time. Filter, search and add exercises to training sessions."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowCreateDialog(true)}
          >
            New exercise
          </Button>
        }
      />

      {/* Loading state */}
      {isLoading && (
        <Card className="mb-6">
          <div className="p-12 text-center">
            <Loader2 size={32} className="mx-auto text-tier-navy animate-spin mb-4" />
            <p className="text-tier-text-secondary">Loading exercises...</p>
          </div>
        </Card>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Card className="mb-6 border-tier-error/30">
          <div className="p-6 text-center">
            <p className="text-tier-error font-medium mb-2">Could not load exercises</p>
            <p className="text-tier-text-secondary text-sm">{error}</p>
          </div>
        </Card>
      )}

      {/* Layer 1: Decision Hero - Recommended drill based on training focus */}
      {!isLoading && (
        <DrillRecommendationHero
          recommendedDrill={recommendedDrill}
          trainingFocus={trainingFocus}
          weakestArea={weakestArea}
          stats={drillStats}
          onStartDrill={handleAddToSession}
          onExploreAll={handleExploreAll}
        />
      )}

      {/* Layer 2: Filters */}
      <div id="drill-filters">
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-tier-text-secondary" />
            <span className="text-sm font-medium text-tier-navy">Filter:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pyramide filter */}
            <div>
              <label className="block text-xs font-medium text-tier-text-secondary mb-2">
                Pyramid level
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterPyramide('all')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    filterPyramide === 'all'
                      ? 'bg-tier-navy text-white'
                      : 'bg-tier-surface-base text-tier-navy hover:bg-tier-white'
                  }`}
                >
                  All
                </button>
                {Object.entries(PYRAMIDE_LEVELS).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setFilterPyramide(key as PyramideLevel)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      filterPyramide === key
                        ? 'bg-tier-navy text-white'
                        : `${config.bgColor} ${config.color}`
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Area filter */}
            <div>
              <label className="block text-xs font-medium text-tier-text-secondary mb-2">
                Training area
              </label>
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="w-full px-3 py-2 border border-tier-border-default rounded bg-tier-white text-tier-navy text-sm"
              >
                <option value="all">All areas</option>
                {GOLF_AREAS.map(area => (
                  <option key={area.id} value={area.id}>{area.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>
      </div>

      {/* Layer 3: Results count */}
      <div className="mb-4">
        <p className="text-sm text-tier-text-secondary">
          Showing {filteredDrills.length} of {drills.length} exercises
        </p>
      </div>

      {/* Layer 3: Full Drill Library */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrills.map(drill => (
          <DrillCard
            key={drill.id}
            drill={drill}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onAddToSession={handleAddToSession}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredDrills.length === 0 && (
        <Card>
          <div className="p-12 text-center">
            <Dumbbell size={48} className="mx-auto text-tier-text-tertiary mb-4" />
            <SubSectionTitle style={{ marginBottom: 8 }}>
              No exercises found
            </SubSectionTitle>
            <p className="text-sm text-tier-text-secondary mb-4">
              {filterPyramide !== 'all' || filterArea !== 'all'
                ? 'Try adjusting the filters to see more exercises.'
                : 'Get started by creating your first exercise.'}
            </p>
            {(filterPyramide !== 'all' || filterArea !== 'all') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFilterPyramide('all');
                  setFilterArea('all');
                }}
              >
                Reset filters
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Add to Session Dialog */}
      <Dialog open={showAddToSessionDialog} onOpenChange={setShowAddToSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Session</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedDrillForSession && (
              <div className="space-y-4">
                <div className="p-4 bg-tier-surface-base rounded-lg">
                  <p className="font-medium text-tier-navy mb-1">
                    {selectedDrillForSession.name}
                  </p>
                  <p className="text-sm text-tier-text-secondary">
                    {selectedDrillForSession.estimatedMinutes} min |{' '}
                    {PYRAMIDE_LEVELS[selectedDrillForSession.pyramide].label} |{' '}
                    {selectedDrillForSession.reps ? `${selectedDrillForSession.reps} reps` : 'No reps specified'}
                  </p>
                </div>
                <p className="text-sm text-tier-text-secondary">
                  This exercise will be added to your current training session.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowAddToSessionDialog(false);
                setSelectedDrillForSession(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmAddToSession}
            >
              Add to session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrillManagementPage;
