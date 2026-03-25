/**
 * Round Entry Form - TIER Golf
 *
 * Manual entry form for golf round data with hole-by-hole input.
 * Mobile-first responsive design using TIER design system.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Flag,
  Target,
  CircleDot,
  Activity,
  AlertCircle,
} from 'lucide-react';

// Hooks
import { useAuth } from '../../contexts/AuthContext';
import { useRoundEntry } from '../../hooks/useManualStats';
import type { ManualHoleEntry } from '../../services/manualStatsApi';

// UI Components
import Button from '../../ui/primitives/Button';
import { Card } from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';
import { Badge } from '../../components/shadcn/badge';

// ============================================================================
// TYPES
// ============================================================================

type LieType = 'TEE' | 'FAIRWAY' | 'ROUGH' | 'BUNKER' | 'RECOVERY' | 'GREEN';

interface HoleFormState {
  holeNumber: number;
  holePar: number;
  holeLengthM: number;
  holeScore: number;
  teeClub?: string;
  teeDistanceM?: number;
  approachStartM?: number;
  approachLie?: LieType;
  approachEndM?: number;
  shortGameStartM?: number;
  shortGameLie?: LieType;
  firstPuttM?: number;
  puttsCount?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CLUBS = [
  'Driver', '3W', '5W', '7W',
  '3i', '4i', '5i', '6i', '7i', '8i', '9i',
  'PW', 'GW', '52°', '56°', '60°',
  'Putter',
];

const LIE_OPTIONS: { value: LieType; label: string }[] = [
  { value: 'FAIRWAY', label: 'Fairway' },
  { value: 'ROUGH', label: 'Rough' },
  { value: 'BUNKER', label: 'Bunker' },
  { value: 'RECOVERY', label: 'Recovery' },
  { value: 'GREEN', label: 'Green' },
];

const DEFAULT_HOLE: HoleFormState = {
  holeNumber: 1,
  holePar: 4,
  holeLengthM: 350,
  holeScore: 4,
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Round Info Header
 */
const RoundInfoHeader: React.FC<{
  courseName: string;
  roundDate: string;
  currentHole: number;
  totalHoles: number;
  onBack: () => void;
}> = ({ courseName, roundDate, currentHole, totalHoles, onBack }) => (
  <div className="flex items-center justify-between p-4 border-b border-tier-navy/10">
    <button onClick={onBack} className="p-2 -ml-2 hover:bg-tier-navy/5 rounded-lg">
      <ChevronLeft size={24} className="text-tier-navy" />
    </button>
    <div className="text-center">
      <span className="text-sm font-semibold text-tier-navy">{courseName}</span>
      <span className="block text-xs text-tier-navy/60">{roundDate}</span>
    </div>
    <Badge variant="secondary">
      Hole {currentHole}/{totalHoles}
    </Badge>
  </div>
);

/**
 * Hole Navigation Bar
 */
const HoleNavigator: React.FC<{
  currentHole: number;
  totalHoles: number;
  completedHoles: number[];
  onHoleSelect: (hole: number) => void;
}> = ({ currentHole, totalHoles, completedHoles, onHoleSelect }) => (
  <div className="flex overflow-x-auto gap-2 p-3 bg-tier-navy/5 no-scrollbar">
    {Array.from({ length: totalHoles }, (_, i) => i + 1).map((hole) => {
      const isCompleted = completedHoles.includes(hole);
      const isCurrent = hole === currentHole;

      return (
        <button
          key={hole}
          onClick={() => onHoleSelect(hole)}
          className={`
            flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
            text-sm font-semibold transition-all
            ${isCurrent
              ? 'bg-tier-navy text-white'
              : isCompleted
                ? 'bg-tier-success/20 text-tier-success'
                : 'bg-white text-tier-navy/60 hover:bg-tier-navy/10'
            }
          `}
        >
          {isCompleted && !isCurrent ? (
            <Check size={16} />
          ) : (
            hole
          )}
        </button>
      );
    })}
  </div>
);

/**
 * Numeric Input with +/- buttons
 */
const NumericInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}> = ({ label, value, onChange, min = 0, max = 999, step = 1, unit }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-medium text-tier-navy/60">{label}</label>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-10 h-10 rounded-lg bg-tier-navy/5 flex items-center justify-center hover:bg-tier-navy/10"
      >
        <span className="text-tier-navy text-xl">−</span>
      </button>
      <div className="flex-1 text-center">
        <span className="text-2xl font-bold text-tier-navy">{value}</span>
        {unit && <span className="text-xs text-tier-navy/60 ml-1">{unit}</span>}
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + step))}
        className="w-10 h-10 rounded-lg bg-tier-navy/5 flex items-center justify-center hover:bg-tier-navy/10"
      >
        <span className="text-tier-navy text-xl">+</span>
      </button>
    </div>
  </div>
);

/**
 * Club Selector
 */
const ClubSelector: React.FC<{
  label: string;
  value?: string;
  onChange: (club: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-medium text-tier-navy/60">{label}</label>
    <div className="flex flex-wrap gap-1">
      {CLUBS.slice(0, 8).map((club) => (
        <button
          key={club}
          onClick={() => onChange(club)}
          className={`
            px-2 py-1 text-xs font-medium rounded transition-all
            ${value === club
              ? 'bg-tier-navy text-white'
              : 'bg-tier-navy/5 text-tier-navy/60 hover:bg-tier-navy/10'
            }
          `}
        >
          {club}
        </button>
      ))}
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 text-xs bg-tier-navy/5 rounded border-0 text-tier-navy"
      >
        <option value="">More...</option>
        {CLUBS.slice(8).map((club) => (
          <option key={club} value={club}>{club}</option>
        ))}
      </select>
    </div>
  </div>
);

/**
 * Lie Selector
 */
const LieSelector: React.FC<{
  label: string;
  value?: LieType;
  onChange: (lie: LieType) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-medium text-tier-navy/60">{label}</label>
    <div className="flex flex-wrap gap-1">
      {LIE_OPTIONS.map((lie) => (
        <button
          key={lie.value}
          onClick={() => onChange(lie.value)}
          className={`
            px-3 py-1.5 text-xs font-medium rounded-lg transition-all
            ${value === lie.value
              ? 'bg-tier-navy text-white'
              : 'bg-tier-navy/5 text-tier-navy/60 hover:bg-tier-navy/10'
            }
          `}
        >
          {lie.label}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Hole Basic Info Section
 */
const HoleBasicsSection: React.FC<{
  hole: HoleFormState;
  onChange: (updates: Partial<HoleFormState>) => void;
}> = ({ hole, onChange }) => (
  <Card>
    <div className="p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <Flag size={18} className="text-tier-gold" />
        <h3 className="text-base font-semibold text-tier-navy">Hole {hole.holeNumber}</h3>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4 p-4">
      <NumericInput
        label="Par"
        value={hole.holePar}
        onChange={(v) => onChange({ holePar: v })}
        min={3}
        max={5}
      />
      <NumericInput
        label="Length"
        value={hole.holeLengthM}
        onChange={(v) => onChange({ holeLengthM: v })}
        min={50}
        max={650}
        step={5}
        unit="m"
      />
      <NumericInput
        label="Score"
        value={hole.holeScore}
        onChange={(v) => onChange({ holeScore: v })}
        min={1}
        max={15}
      />
    </div>
  </Card>
);

/**
 * Tee Shot Section
 */
const TeeShotSection: React.FC<{
  hole: HoleFormState;
  onChange: (updates: Partial<HoleFormState>) => void;
}> = ({ hole, onChange }) => (
  <Card>
    <div className="p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <Activity size={18} className="text-tier-navy" />
        <h3 className="text-base font-semibold text-tier-navy">Tee Shot</h3>
      </div>
    </div>
    <div className="p-4 flex flex-col gap-4">
      <ClubSelector
        label="Club"
        value={hole.teeClub}
        onChange={(v) => onChange({ teeClub: v })}
      />
      <NumericInput
        label="Carry Distance"
        value={hole.teeDistanceM || 0}
        onChange={(v) => onChange({ teeDistanceM: v })}
        min={0}
        max={350}
        step={5}
        unit="m"
      />
    </div>
  </Card>
);

/**
 * Approach Shot Section
 */
const ApproachShotSection: React.FC<{
  hole: HoleFormState;
  onChange: (updates: Partial<HoleFormState>) => void;
}> = ({ hole, onChange }) => (
  <Card>
    <div className="p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <Target size={18} className="text-tier-success" />
        <h3 className="text-base font-semibold text-tier-navy">Approach</h3>
      </div>
    </div>
    <div className="p-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <NumericInput
          label="Start Distance"
          value={hole.approachStartM || 0}
          onChange={(v) => onChange({ approachStartM: v })}
          min={0}
          max={300}
          step={5}
          unit="m"
        />
        <NumericInput
          label="Ended at"
          value={hole.approachEndM || 0}
          onChange={(v) => onChange({ approachEndM: v })}
          min={0}
          max={100}
          step={1}
          unit="m"
        />
      </div>
      <LieSelector
        label="Lie Before Shot"
        value={hole.approachLie}
        onChange={(v) => onChange({ approachLie: v })}
      />
    </div>
  </Card>
);

/**
 * Short Game Section
 */
const ShortGameSection: React.FC<{
  hole: HoleFormState;
  onChange: (updates: Partial<HoleFormState>) => void;
  show: boolean;
}> = ({ hole, onChange, show }) => {
  if (!show) return null;

  return (
    <Card>
      <div className="p-4 border-b border-tier-navy/10">
        <div className="flex items-center gap-2">
          <Flag size={18} className="text-tier-gold" />
          <h3 className="text-base font-semibold text-tier-navy">Short Game</h3>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <NumericInput
          label="Start Distance"
          value={hole.shortGameStartM || 0}
          onChange={(v) => onChange({ shortGameStartM: v })}
          min={0}
          max={100}
          step={1}
          unit="m"
        />
        <LieSelector
          label="Lie Before Shot"
          value={hole.shortGameLie}
          onChange={(v) => onChange({ shortGameLie: v })}
        />
      </div>
    </Card>
  );
};

/**
 * Putting Section
 */
const PuttingSection: React.FC<{
  hole: HoleFormState;
  onChange: (updates: Partial<HoleFormState>) => void;
}> = ({ hole, onChange }) => (
  <Card>
    <div className="p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        <CircleDot size={18} className="text-purple-600" />
        <h3 className="text-base font-semibold text-tier-navy">Putting</h3>
      </div>
    </div>
    <div className="p-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <NumericInput
          label="First Putt Distance"
          value={hole.firstPuttM || 0}
          onChange={(v) => onChange({ firstPuttM: v })}
          min={0}
          max={30}
          step={0.5}
          unit="m"
        />
        <NumericInput
          label="Putts"
          value={hole.puttsCount || 2}
          onChange={(v) => onChange({ puttsCount: v })}
          min={1}
          max={6}
        />
      </div>
    </div>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface RoundEntryFormProps {
  mode?: 'new' | 'edit';
  roundId?: string;
}

export default function RoundEntryForm({ mode = 'new' }: RoundEntryFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const playerId = (user as { playerId?: string })?.playerId;

  // Use the round entry hook
  const {
    currentRoundId,
    holes: savedHoles,
    isLoading,
    error,
    startRound,
    addHole,
    finalize,
  } = useRoundEntry(playerId);

  // Local state
  const [courseName, setCourseName] = useState('');
  const [roundDate, setRoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalHoles, setTotalHoles] = useState(18);
  const [currentHoleNum, setCurrentHoleNum] = useState(1);
  const [holeData, setHoleData] = useState<HoleFormState>({ ...DEFAULT_HOLE });
  const [isStarting, setIsStarting] = useState(mode === 'new' && !currentRoundId);

  // Track which holes are completed
  const completedHoleNums = useMemo(() => {
    return savedHoles.map(h => h.holeNumber);
  }, [savedHoles]);

  // Handle hole data updates
  const updateHoleData = useCallback((updates: Partial<HoleFormState>) => {
    setHoleData(prev => ({ ...prev, ...updates }));
  }, []);

  // Start a new round
  const handleStartRound = async () => {
    if (!courseName.trim()) return;

    try {
      await startRound(roundDate, courseName);
      setIsStarting(false);
    } catch (err) {
      console.error('Failed to start round:', err);
    }
  };

  // Save current hole
  const handleSaveHole = useCallback(() => {
    const entry: ManualHoleEntry = {
      holeNumber: holeData.holeNumber,
      holePar: holeData.holePar,
      holeLengthM: holeData.holeLengthM,
      holeScore: holeData.holeScore,
    };

    // Add tee data if present
    if (holeData.teeClub || holeData.teeDistanceM) {
      entry.tee = {
        club: holeData.teeClub,
        distanceM: holeData.teeDistanceM,
        distanceType: 'CARRY',
      };
    }

    // Add approach data if present
    if (holeData.approachStartM) {
      entry.approach = {
        startDistanceM: holeData.approachStartM,
        lie: holeData.approachLie,
        endDistanceM: holeData.approachEndM,
        endLie: holeData.approachEndM && holeData.approachEndM > 0 ? undefined : 'GREEN',
      };
    }

    // Add short game data if present
    if (holeData.shortGameStartM && holeData.shortGameStartM > 0) {
      entry.shortGame = {
        startDistanceM: holeData.shortGameStartM,
        lie: holeData.shortGameLie,
      };
    }

    // Add putting data
    if (holeData.firstPuttM || holeData.puttsCount) {
      entry.putting = {
        firstPuttM: holeData.firstPuttM,
        puttsCount: holeData.puttsCount,
      };
    }

    addHole(entry);

    // Move to next hole if not on last
    if (currentHoleNum < totalHoles) {
      const nextHole = currentHoleNum + 1;
      setCurrentHoleNum(nextHole);
      setHoleData({ ...DEFAULT_HOLE, holeNumber: nextHole });
    }
  }, [holeData, currentHoleNum, totalHoles, addHole]);

  // Navigate to a specific hole
  const handleHoleSelect = useCallback((hole: number) => {
    // Save current hole first if it has data
    if (holeData.holeScore) {
      handleSaveHole();
    }

    setCurrentHoleNum(hole);

    // Load existing data if available
    const existingHole = savedHoles.find(h => h.holeNumber === hole);
    if (existingHole) {
      setHoleData({
        holeNumber: hole,
        holePar: existingHole.holePar || 4,
        holeLengthM: existingHole.holeLengthM || 350,
        holeScore: existingHole.holeScore || 4,
        teeClub: existingHole.tee?.club,
        teeDistanceM: existingHole.tee?.distanceM,
        approachStartM: existingHole.approach?.startDistanceM,
        approachLie: existingHole.approach?.lie as LieType,
        approachEndM: existingHole.approach?.endDistanceM,
        shortGameStartM: existingHole.shortGame?.startDistanceM,
        shortGameLie: existingHole.shortGame?.lie as LieType,
        firstPuttM: existingHole.putting?.firstPuttM,
        puttsCount: existingHole.putting?.puttsCount,
      });
    } else {
      setHoleData({ ...DEFAULT_HOLE, holeNumber: hole });
    }
  }, [savedHoles, holeData, handleSaveHole]);

  // Finalize round
  const handleFinalize = async () => {
    try {
      // Save current hole first
      handleSaveHole();

      // Finalize the round
      await finalize();

      // Navigate to round detail
      navigate(`/rounds/${currentRoundId}`);
    } catch (err) {
      console.error('Failed to finalize round:', err);
    }
  };

  // Show start round form
  if (isStarting) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-tier-navy/5 rounded-lg"
          >
            <ChevronLeft size={24} className="text-tier-navy" />
          </button>
          <h1 className="text-xl font-bold text-tier-navy">New Round</h1>
        </div>

        <Card className="p-4">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-tier-navy/60 mb-1 block">
                Course Name
              </label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Enter course name"
                className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg text-tier-navy focus:outline-none focus:ring-2 focus:ring-tier-gold/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-tier-navy/60 mb-1 block">
                Date
              </label>
              <input
                type="date"
                value={roundDate}
                onChange={(e) => setRoundDate(e.target.value)}
                className="w-full px-3 py-2 border border-tier-navy/20 rounded-lg text-tier-navy focus:outline-none focus:ring-2 focus:ring-tier-gold/50"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-tier-navy/60 mb-1 block">
                Holes
              </label>
              <div className="flex gap-2">
                {[9, 18].map((holes) => (
                  <button
                    key={holes}
                    onClick={() => setTotalHoles(holes)}
                    className={`
                      flex-1 px-4 py-2 rounded-lg font-medium transition-all
                      ${totalHoles === holes
                        ? 'bg-tier-navy text-white'
                        : 'bg-tier-navy/5 text-tier-navy/60 hover:bg-tier-navy/10'
                      }
                    `}
                  >
                    {holes} holes
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleStartRound}
              disabled={!courseName.trim() || isLoading}
              className="w-full mt-2"
            >
              Start Round
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard variant="loading" title="Loading round data..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard
          variant="error"
          title="Error"
          description={error.message}
          action={
            <Button variant="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  // Determine if we should show short game section
  const showShortGame = holeData.holePar >= 4 && (holeData.approachEndM || 0) > 5;

  return (
    <div className="flex flex-col min-h-screen bg-tier-background">
      {/* Header */}
      <RoundInfoHeader
        courseName={courseName || 'New Round'}
        roundDate={new Date(roundDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        currentHole={currentHoleNum}
        totalHoles={totalHoles}
        onBack={() => navigate(-1)}
      />

      {/* Hole Navigator */}
      <HoleNavigator
        currentHole={currentHoleNum}
        totalHoles={totalHoles}
        completedHoles={completedHoleNums}
        onHoleSelect={handleHoleSelect}
      />

      {/* Form Sections */}
      <div className="flex flex-col gap-4 p-4 pb-24">
        <HoleBasicsSection hole={holeData} onChange={updateHoleData} />

        {holeData.holePar >= 4 && (
          <TeeShotSection hole={holeData} onChange={updateHoleData} />
        )}

        <ApproachShotSection hole={holeData} onChange={updateHoleData} />

        <ShortGameSection
          hole={holeData}
          onChange={updateHoleData}
          show={showShortGame}
        />

        <PuttingSection hole={holeData} onChange={updateHoleData} />
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-tier-navy/10 p-4 safe-area-pb">
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleSaveHole}
            leftIcon={<Save size={16} />}
            className="flex-1"
          >
            Save Hole
          </Button>

          {completedHoleNums.length >= 9 && (
            <Button
              variant="primary"
              onClick={handleFinalize}
              leftIcon={<Check size={16} />}
              className="flex-1"
            >
              Finish Round
            </Button>
          )}
        </div>

        {completedHoleNums.length > 0 && (
          <p className="text-xs text-tier-navy/60 text-center mt-2">
            {completedHoleNums.length} of {totalHoles} holes saved
          </p>
        )}
      </div>
    </div>
  );
}
