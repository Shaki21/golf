/**
 * TIER Golf - Exercise Library
 * Design System v3.0 - Premium Light
 *
 * Exercise library with structured training protocols.
 * Based on: APP_FUNCTIONALITY.md Section 10
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState } from 'react';
import { Heart, Plus, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import StateCard from '../../ui/composites/StateCard';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

// ============================================================
// AK GOLF KATEGORI HIERARKI v2.0 - Komplett filter-system
// ============================================================

// 1. PYRAMIDEN - 5 nivåer
const pyramideLevels = [
  { id: 'all', label: 'Alle' },
  { id: 'FYS', label: 'Fysisk' },
  { id: 'TEK', label: 'Teknikk' },
  { id: 'SLAG', label: 'Golfslag' },
  { id: 'SPILL', label: 'Spill' },
  { id: 'TURN', label: 'Turnering' },
];

// 2. TRENINGSOMRÅDER - 16 områder
const golfAreas = [
  { id: 'all', label: 'Alle' },
  // Full Swing (5)
  { id: 'TEE', label: 'Tee Total' },
  { id: 'INN200', label: 'Innspill 200+ m' },
  { id: 'INN150', label: 'Innspill 150-200 m' },
  { id: 'INN100', label: 'Innspill 100-150 m' },
  { id: 'INN50', label: 'Innspill 50-100 m' },
  // Naerspill (4)
  { id: 'PITCH', label: 'Pitch' },
  { id: 'BUNKER', label: 'Bunker' },
  { id: 'LOB', label: 'Lob' },
  { id: 'CHIP', label: 'Chip' },
  // Putting (7)
  { id: 'PUTT0-3', label: 'Putting 0-3 ft' },
  { id: 'PUTT3-5', label: 'Putting 3-5 ft' },
  { id: 'PUTT5-10', label: 'Putting 5-10 ft' },
  { id: 'PUTT10-15', label: 'Putting 10-15 ft' },
  { id: 'PUTT15-25', label: 'Putting 15-25 ft' },
  { id: 'PUTT25-40', label: 'Putting 25-40 ft' },
  { id: 'PUTT40+', label: 'Putting 40+ ft' },
];

// Grouped areas for compact filter display
const areaGroups = [
  { id: 'all', label: 'Alle' },
  { id: 'TEE', label: 'Tee' },
  { id: 'INN', label: 'Innspill' },
  { id: 'CHIP', label: 'Chip' },
  { id: 'PITCH', label: 'Pitch' },
  { id: 'LOB', label: 'Lob' },
  { id: 'BUNKER', label: 'Bunker' },
  { id: 'PUTT', label: 'Putting' },
];

// 3. L-FASER (Clubspeed) - 5 nivåer
const lFaser = [
  { id: 'all', label: 'Alle' },
  { id: 'CS20', label: 'CS 20%' },
  { id: 'CS40', label: 'CS 40%' },
  { id: 'CS60', label: 'CS 60%' },
  { id: 'CS80', label: 'CS 80%' },
  { id: 'CS100', label: 'CS 100%' },
];

// 4. MILJØ - 6 nivåer
const miljoLevels = [
  { id: 'all', label: 'Alle' },
  { id: 'M0', label: 'M0 Off course' },
  { id: 'M1', label: 'M1 Innendørs' },
  { id: 'M2', label: 'M2 Range' },
  { id: 'M3', label: 'M3 Treningsområde' },
  { id: 'M4', label: 'M4 Bane trening' },
  { id: 'M5', label: 'M5 Turnering' },
];

// 5. BELASTNING/PRESS - 5 nivåer
const pressLevels = [
  { id: 'all', label: 'Alle' },
  { id: 'PR1', label: 'PR1 Ingen' },
  { id: 'PR2', label: 'PR2 Selvmonitorering' },
  { id: 'PR3', label: 'PR3 Sosialt' },
  { id: 'PR4', label: 'PR4 Konkurranse' },
  { id: 'PR5', label: 'PR5 Turnering' },
];

// Demo exercises - Using full TIER Golf Kategori Hierarki v2.0
const exercises = [
  // FYSISK (FYS)
  {
    id: 'hip-rotation',
    name: 'Hofterotasjon',
    pyramide: 'FYS',
    golfArea: 'TEE',
    lFase: 'CS20',
    miljo: 'M0',
    press: 'PR1',
    duration: { min: 15, max: 20 },
    difficulty: 2,
    description: 'Mobilitet og styrke i hofterotasjon.',
  },
  {
    id: 'core-stability',
    name: 'Core Stabilitet',
    pyramide: 'FYS',
    golfArea: 'TEE',
    lFase: 'CS20',
    miljo: 'M0',
    press: 'PR1',
    duration: { min: 20, max: 30 },
    difficulty: 3,
    description: 'Styrk kjernemuskulatur for bedre rotasjon.',
  },
  // TEKNIKK (TEK)
  {
    id: 'driver-target',
    name: 'Driver Target',
    pyramide: 'TEK',
    golfArea: 'TEE',
    lFase: 'CS60',
    miljo: 'M2',
    press: 'PR2',
    duration: { min: 20, max: 30 },
    difficulty: 2,
    description: 'Driver-slag mot definert målområde.',
  },
  {
    id: 'pyramiden',
    name: 'Pyramiden',
    pyramide: 'TEK',
    golfArea: 'PUTT5-10',
    lFase: 'CS40',
    miljo: 'M3',
    press: 'PR1',
    duration: { min: 20, max: 30 },
    difficulty: 2,
    description: 'Bygg opp og ned i antall slag til samme mål.',
  },
  {
    id: 'gate-drill',
    name: 'Gate Drill',
    pyramide: 'TEK',
    golfArea: 'PUTT3-5',
    lFase: 'CS40',
    miljo: 'M3',
    press: 'PR1',
    duration: { min: 10, max: 20 },
    difficulty: 2,
    description: 'Porter med tees som ballen må gå gjennom.',
  },
  {
    id: 'bunker-basics',
    name: 'Bunker Basics',
    pyramide: 'TEK',
    golfArea: 'BUNKER',
    lFase: 'CS60',
    miljo: 'M3',
    press: 'PR2',
    duration: { min: 15, max: 25 },
    difficulty: 3,
    description: 'Grunnleggende bunkerslag fra greenside.',
  },
  // GOLFSLAG (SLAG)
  {
    id: 'scattered',
    name: 'Scattered',
    pyramide: 'SLAG',
    golfArea: 'CHIP',
    lFase: 'CS80',
    miljo: 'M3',
    press: 'PR2',
    duration: { min: 15, max: 30 },
    difficulty: 3,
    description: 'Bytt mål og/eller klubb for HVERT slag.',
  },
  {
    id: 'clock-drill',
    name: 'Clock Drill',
    pyramide: 'SLAG',
    golfArea: 'PUTT3-5',
    lFase: 'CS60',
    miljo: 'M3',
    press: 'PR3',
    duration: { min: 15, max: 30 },
    difficulty: 4,
    description: '12 baller rundt hullet som en klokke.',
  },
  {
    id: 'wedge-ladder',
    name: 'Wedge Ladder',
    pyramide: 'SLAG',
    golfArea: 'INN50',
    lFase: 'CS80',
    miljo: 'M2',
    press: 'PR2',
    duration: { min: 20, max: 30 },
    difficulty: 3,
    description: 'Øv avstander med wedge: 50m, 75m, 100m.',
  },
  {
    id: 'pitch-distance',
    name: 'Pitch Avstandskontroll',
    pyramide: 'SLAG',
    golfArea: 'PITCH',
    lFase: 'CS60',
    miljo: 'M3',
    press: 'PR2',
    duration: { min: 20, max: 30 },
    difficulty: 3,
    description: 'Kontroller avstander med pitch-slag.',
  },
  {
    id: 'iron-precision',
    name: 'Jern Presisjon',
    pyramide: 'SLAG',
    golfArea: 'INN100',
    lFase: 'CS80',
    miljo: 'M2',
    press: 'PR2',
    duration: { min: 25, max: 35 },
    difficulty: 3,
    description: 'Presisjonstrening med 7-9 jern.',
  },
  // SPILL
  {
    id: '9-holes-putting',
    name: '9-holes Putting',
    pyramide: 'SPILL',
    golfArea: 'PUTT5-10',
    lFase: 'CS60',
    miljo: 'M3',
    press: 'PR3',
    duration: { min: 15, max: 25 },
    difficulty: 3,
    description: 'Simuler 9 hull på puttinggreenen.',
  },
  {
    id: 'up-and-down',
    name: 'Up & Down Challenge',
    pyramide: 'SPILL',
    golfArea: 'CHIP',
    lFase: 'CS80',
    miljo: 'M3',
    press: 'PR4',
    duration: { min: 20, max: 30 },
    difficulty: 4,
    description: 'Chip + putt fra ulike posisjoner rundt green.',
  },
  // TURNERING (TURN)
  {
    id: 'pressure-putting',
    name: 'Pressure Putting',
    pyramide: 'TURN',
    golfArea: 'PUTT3-5',
    lFase: 'CS100',
    miljo: 'M5',
    press: 'PR5',
    duration: { min: 15, max: 25 },
    difficulty: 5,
    description: 'Putting under simulert turneringspress.',
  },
];

// ============================================================
// HELPER: Pyramide color classes
// ============================================================

const getPyramideClasses = (pyramide) => {
  switch (pyramide) {
    case 'FYS':
      return { bar: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-500/15' };
    case 'TEK':
      return { bar: 'bg-tier-navy', text: 'text-tier-navy', bg: 'bg-tier-navy/15' };
    case 'SLAG':
      return { bar: 'bg-tier-success', text: 'text-tier-success', bg: 'bg-tier-success/15' };
    case 'SPILL':
      return { bar: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-500/15' };
    case 'TURN':
      return { bar: 'bg-tier-error', text: 'text-tier-error', bg: 'bg-tier-error/15' };
    default:
      return { bar: 'bg-tier-navy', text: 'text-tier-navy', bg: 'bg-tier-navy/15' };
  }
};

// ============================================================
// Exercise card component - Minimalist design
// ============================================================

function ExerciseCard({ exercise, onSelect, onToggleFavorite, onAddToPlan, isFavorite }) {
  const difficultyDots = Array(5).fill(0).map((_, i) => i < exercise.difficulty);
  const pyramideLabel = pyramideLevels.find(p => p.id === exercise.pyramide)?.label || exercise.pyramide;
  const areaLabel = golfAreas.find(a => a.id === exercise.golfArea)?.label || exercise.golfArea;
  const pyramideClasses = getPyramideClasses(exercise.pyramide);

  return (
    <div
      onClick={() => onSelect(exercise)}
      className={`bg-tier-white rounded-xl overflow-hidden shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md relative ${
        isFavorite ? 'ring-2 ring-amber-300' : ''
      }`}
    >
      {/* "Min øvelse" badge for favorites */}
      {isFavorite && (
        <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 py-1 px-2 bg-amber-100 text-amber-700 text-[11px] font-semibold rounded">
          <Heart size={12} fill="currentColor" />
          Min øvelse
        </div>
      )}

      {/* Top color bar based on pyramide level */}
      <div className={`h-1 ${pyramideClasses.bar}`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex justify-between items-start mb-2">
          <SubSectionTitle className={`text-[15px] leading-tight ${isFavorite ? 'mt-6' : ''}`}>
            {exercise.name}
          </SubSectionTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(exercise.id); }}
            className={`p-1 ${isFavorite ? 'text-tier-error' : 'text-tier-border-default'}`}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </Button>
        </div>

        {/* Tags row */}
        <div className="flex gap-1.5 mb-2.5 flex-wrap">
          <span className={`text-[11px] py-0.5 px-2 rounded ${pyramideClasses.bg} ${pyramideClasses.text} font-medium`}>
            {pyramideLabel}
          </span>
          <span className="text-[11px] py-0.5 px-2 rounded bg-tier-border-default text-tier-navy font-medium">
            {areaLabel}
          </span>
        </div>

        {/* Description */}
        <p className="m-0 mb-3 text-[13px] text-tier-text-secondary leading-snug">
          {exercise.description}
        </p>

        {/* Footer row */}
        <div className="flex justify-between items-center pt-3 border-t border-tier-border-default">
          {/* Duration and difficulty */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-tier-text-secondary flex items-center gap-1">
              <Clock size={14} />
              {exercise.duration.min}-{exercise.duration.max} min
            </span>
            <div className="flex gap-0.5">
              {difficultyDots.map((filled, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${filled ? 'bg-amber-500' : 'bg-tier-border-default'}`}
                />
              ))}
            </div>
          </div>

          {/* Add to plan button */}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={(e) => { e.stopPropagation(); onAddToPlan(exercise); }}
          >
            Legg til
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Exercise detail modal
// ============================================================

function ExerciseDetailModal({ exercise, onClose, onAddToSession }) {
  if (!exercise) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[1000]">
      <div className="bg-tier-white rounded-t-xl p-6 w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-[22px] font-bold text-tier-navy">
            {exercise.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-2xl p-1"
          >
            ✕
          </Button>
        </div>

        {/* Meta info */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="bg-tier-surface-base py-2 px-4 rounded-lg">
            <span className="text-xs text-tier-text-secondary">Kategori</span>
            <div className="text-xs font-medium text-tier-navy">{exercise.category}</div>
          </div>
          <div className="bg-tier-surface-base py-2 px-4 rounded-lg">
            <span className="text-xs text-tier-text-secondary">Varighet</span>
            <div className="text-xs font-medium text-tier-navy">
              {exercise.duration.min}-{exercise.duration.max} min
            </div>
          </div>
          {exercise.reps && (
            <div className="bg-tier-surface-base py-2 px-4 rounded-lg">
              <span className="text-xs text-tier-text-secondary">Repetisjoner</span>
              <div className="text-xs font-medium text-tier-navy">{exercise.reps}</div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <span className="text-xs font-medium text-tier-navy block mb-2">
            Beskrivelse
          </span>
          <p className="text-[15px] text-tier-navy">
            {exercise.description}
          </p>
        </div>

        {/* Instructions */}
        {exercise.instructions && (
          <div className="mb-6">
            <span className="text-xs font-medium text-tier-navy block mb-2">
              Instruksjoner
            </span>
            <ul className="pl-6 m-0">
              {exercise.instructions.map((instruction, i) => (
                <li key={i} className="text-sm text-tier-navy mb-1">
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Variants */}
        {exercise.variants && (
          <div className="mb-6">
            <span className="text-xs font-medium text-tier-navy block mb-2">
              Varianter
            </span>
            <div className="flex flex-col gap-2">
              {exercise.variants.map((variant, i) => (
                <div key={i} className="bg-tier-surface-base p-2 rounded">
                  <span className="text-xs font-medium text-tier-navy">
                    {variant.name}
                  </span>
                  {variant.description && (
                    <span className="text-xs text-tier-text-secondary ml-2">
                      - {variant.description}
                    </span>
                  )}
                  {variant.reps && (
                    <span className="text-xs text-tier-text-secondary ml-2">
                      ({variant.reps} slag)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {exercise.equipment && (
          <div className="mb-6">
            <span className="text-xs font-medium text-tier-navy block mb-2">
              Utstyr
            </span>
            <div className="flex gap-2 flex-wrap">
              {exercise.equipment.map((item, i) => (
                <span
                  key={i}
                  className="text-xs py-1 px-2.5 bg-tier-border-default rounded text-tier-navy"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Training areas */}
        {exercise.trainingAreas && (
          <div className="mb-8">
            <span className="text-xs font-medium text-tier-navy block mb-2">
              Bruksområde
            </span>
            <div className="flex gap-2 flex-wrap">
              {exercise.trainingAreas.map((area, i) => (
                <span
                  key={i}
                  className="text-xs py-1 px-2.5 bg-tier-navy/10 rounded text-tier-navy capitalize"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add button */}
        <Button
          variant="primary"
          onClick={() => onAddToSession(exercise)}
          className="w-full py-4 text-xl font-semibold"
        >
          Legg til i økt
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Main ExerciseLibrary component
// ============================================================

export default function ExerciseLibrary({ onSelectExercise, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPyramide, setSelectedPyramide] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedLFase, setSelectedLFase] = useState('all');
  const [selectedMiljo, setSelectedMiljo] = useState('all');
  const [selectedPress, setSelectedPress] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('exerciseFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // NEW: Library filter tabs (Alle, Mine øvelser, Bibliotek)
  const [libraryFilter, setLibraryFilter] = useState('all'); // 'all' | 'mine' | 'library'
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);

  const handleToggleFavorite = (exerciseId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId];
      localStorage.setItem('exerciseFavorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const handleAddToPlan = (exercise) => {
    alert(`"${exercise.name}" lagt til i treningsplan!`);
    if (onSelectExercise) onSelectExercise(exercise);
  };

  const resetAllFilters = () => {
    setSelectedPyramide('all');
    setSelectedArea('all');
    setSelectedLFase('all');
    setSelectedMiljo('all');
    setSelectedPress('all');
    setShowOnlyFavorites(false);
  };

  const hasActiveAdvancedFilters = selectedLFase !== 'all' || selectedMiljo !== 'all' || selectedPress !== 'all';
  const hasActiveFilters = selectedPyramide !== 'all' || selectedArea !== 'all' ||
    hasActiveAdvancedFilters || showOnlyFavorites;

  // Filter exercises using all criteria
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPyramide = selectedPyramide === 'all' || ex.pyramide === selectedPyramide;
    const matchesArea = selectedArea === 'all' ||
      ex.golfArea === selectedArea ||
      ex.golfArea.startsWith(selectedArea);
    const matchesLFase = selectedLFase === 'all' || ex.lFase === selectedLFase;
    const matchesMiljo = selectedMiljo === 'all' || ex.miljo === selectedMiljo;
    const matchesPress = selectedPress === 'all' || ex.press === selectedPress;
    const matchesFavorites = !showOnlyFavorites || favorites.includes(ex.id);
    return matchesSearch && matchesPyramide && matchesArea && matchesLFase && matchesMiljo && matchesPress && matchesFavorites;
  });

  const handleAddToSession = (exercise) => {
    if (onSelectExercise) onSelectExercise(exercise);
    setSelectedExercise(null);
    if (onClose) onClose();
  };

  return (
    <div className="bg-tier-surface-base min-h-screen">
      {/* Library Filter Tabs + Add Button */}
      <div className="bg-tier-white py-4 px-6 border-b border-tier-border-default flex justify-between items-center">
        <div className="inline-flex gap-1 p-1 bg-tier-surface-base rounded-xl">
          <button
            onClick={() => { setLibraryFilter('all'); setShowOnlyFavorites(false); }}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              libraryFilter === 'all'
                ? 'bg-white text-tier-success shadow-sm'
                : 'bg-transparent text-tier-text-secondary hover:text-tier-navy'
            }`}
          >
            Alle øvelser
          </button>
          <button
            onClick={() => { setLibraryFilter('mine'); setShowOnlyFavorites(true); }}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              libraryFilter === 'mine'
                ? 'bg-white text-amber-600 shadow-sm'
                : 'bg-transparent text-tier-text-secondary hover:text-tier-navy'
            }`}
          >
            <Heart size={16} fill={libraryFilter === 'mine' ? 'currentColor' : 'none'} />
            Mine øvelser
            {favorites.length > 0 && (
              <span className={`rounded-full py-0.5 px-1.5 text-[11px] font-semibold ${
                libraryFilter === 'mine' ? 'bg-amber-500 text-white' : 'bg-tier-text-tertiary text-white'
              }`}>
                {favorites.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setLibraryFilter('library'); setShowOnlyFavorites(false); }}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              libraryFilter === 'library'
                ? 'bg-white text-tier-navy shadow-sm'
                : 'bg-transparent text-tier-text-secondary hover:text-tier-navy'
            }`}
          >
            Bibliotek
          </button>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => setShowAddExerciseModal(true)}
        >
          Legg til øvelse
        </Button>
      </div>

      {/* Compact filters */}
      <div className="bg-tier-white py-3 px-6 border-b border-tier-border-default">
        {/* Search and filters in one row */}
        <div className="flex gap-4 items-center flex-wrap">
          {/* Search */}
          <input
            type="text"
            placeholder="Søk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[200px] py-2 px-3 bg-tier-surface-base border-none rounded-lg text-[13px] text-tier-navy outline-none focus:ring-1 focus:ring-tier-navy"
          />

          {/* Pyramide level chips */}
          <div className="flex gap-1.5 flex-wrap">
            {pyramideLevels.map((level) => (
              <Button
                key={level.id}
                variant={selectedPyramide === level.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedPyramide(level.id)}
                className="rounded-full"
              >
                {level.label}
              </Button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-tier-border-default" />

          {/* Golf area chips */}
          <div className="flex gap-1.5 flex-wrap">
            {areaGroups.map((area) => (
              <Button
                key={area.id}
                variant={selectedArea === area.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedArea(area.id)}
                className="rounded-full"
              >
                {area.label}
              </Button>
            ))}
          </div>

          {/* Advanced filters toggle */}
          <Button
            variant={showAdvancedFilters || hasActiveAdvancedFilters ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            rightIcon={showAdvancedFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            className="rounded-full"
          >
            Avansert
            {hasActiveAdvancedFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-white ml-1" />
            )}
          </Button>

          {/* Favorites filter button */}
          <Button
            variant={showOnlyFavorites ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={<Heart size={16} fill={showOnlyFavorites ? 'currentColor' : 'none'} />}
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={showOnlyFavorites ? 'bg-tier-error hover:bg-tier-error/90' : ''}
          >
            Favoritter
            {favorites.length > 0 && (
              <span className={`rounded-[10px] py-0.5 px-1.5 text-[11px] ml-1 ${
                showOnlyFavorites ? 'bg-white/30 text-white' : 'bg-tier-text-secondary text-white'
              }`}>
                {favorites.length}
              </span>
            )}
          </Button>
        </div>

        {/* Advanced filters section */}
        {showAdvancedFilters && (
          <div className="mt-3 pt-3 border-t border-tier-border-default flex flex-col gap-2.5">
            {/* L-Faser (Clubspeed) */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-tier-text-secondary min-w-[80px] font-medium">
                L-Fase (CS)
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {lFaser.map((fase) => (
                  <Button
                    key={fase.id}
                    variant={selectedLFase === fase.id ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setSelectedLFase(fase.id)}
                    className="rounded-full"
                  >
                    {fase.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Miljø */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-tier-text-secondary min-w-[80px] font-medium">
                Miljø
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {miljoLevels.map((miljo) => (
                  <Button
                    key={miljo.id}
                    variant={selectedMiljo === miljo.id ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setSelectedMiljo(miljo.id)}
                    className="rounded-full"
                  >
                    {miljo.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Belastning/Press */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-tier-text-secondary min-w-[80px] font-medium">
                Belastning
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {pressLevels.map((press) => (
                  <Button
                    key={press.id}
                    variant={selectedPress === press.id ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setSelectedPress(press.id)}
                    className="rounded-full"
                  >
                    {press.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exercise list */}
      <div className="p-5 px-6">
        {/* Results count */}
        <div className="mb-4 flex justify-between items-center">
          <span className="text-[13px] text-tier-text-secondary">
            {filteredExercises.length} øvelser
          </span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetAllFilters}>
              Nullstill filter
            </Button>
          )}
        </div>

        {/* Exercise grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSelect={setSelectedExercise}
              onToggleFavorite={handleToggleFavorite}
              onAddToPlan={handleAddToPlan}
              isFavorite={favorites.includes(exercise.id)}
            />
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <StateCard
            variant="empty"
            title={showOnlyFavorites ? 'Ingen favoritter' : 'Ingen øvelser funnet'}
            description={showOnlyFavorites ? 'Marker øvelser som favoritter for å se dem her.' : 'Prøv å justere filtrene for å se flere øvelser.'}
          />
        )}
      </div>

      {/* Detail modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          onAddToSession={handleAddToSession}
        />
      )}

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
          onClick={() => setShowAddExerciseModal(false)}
        >
          <div
            className="bg-tier-white rounded-2xl p-6 w-[90%] max-w-[500px] max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <SectionTitle style={{ marginBottom: 0 }}>
                Legg til ny øvelse
              </SectionTitle>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="bg-transparent border-none text-2xl text-tier-text-secondary cursor-pointer hover:text-tier-navy"
              >
                &times;
              </button>
            </div>

            <p className="text-sm text-tier-text-secondary mb-5">
              Opprett en tilpasset øvelse som blir lagt til i &quot;Mine øvelser&quot;.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5 text-tier-navy">
                  Øvelsesnavn *
                </label>
                <input
                  type="text"
                  placeholder="F.eks. Min putting-drill"
                  className="w-full p-3 rounded-lg border border-tier-border-default text-sm focus:border-tier-navy outline-none"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium mb-1.5 text-tier-navy">
                  Beskrivelse
                </label>
                <textarea
                  placeholder="Beskriv øvelsen..."
                  rows={3}
                  className="w-full p-3 rounded-lg border border-tier-border-default text-sm resize-y focus:border-tier-navy outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5 text-tier-navy">
                    Kategori
                  </label>
                  <select className="w-full p-3 rounded-lg border border-tier-border-default text-sm">
                    <option value="TEK">Teknikk</option>
                    <option value="FYS">Fysisk</option>
                    <option value="SLAG">Golfslag</option>
                    <option value="SPILL">Spill</option>
                    <option value="TURN">Turnering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5 text-tier-navy">
                    Varighet (min)
                  </label>
                  <input
                    type="number"
                    placeholder="20"
                    className="w-full p-3 rounded-lg border border-tier-border-default text-sm focus:border-tier-navy outline-none"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => {
                  alert('Øvelse opprettet! (Demo)');
                  setShowAddExerciseModal(false);
                }}
                className="w-full py-3.5 mt-2 text-[15px] font-semibold"
              >
                Opprett øvelse
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
