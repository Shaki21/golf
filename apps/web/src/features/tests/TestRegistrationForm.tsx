/**
 * TestRegistrationForm - Shot-by-shot test recording
 *
 * A modern, step-by-step test registration form that allows
 * recording individual shots with real-time feedback.
 *
 * Uses Norwegian UI types from domain/tests/types.ts
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Target,
  Activity,
  Ruler,
  Flag,
  Circle,
  Dumbbell,
  Brain,
  Play,
  RotateCcw,
  Save,
  AlertCircle,
} from 'lucide-react';
import { SectionTitle, SubSectionTitle } from '../../components/typography';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import type {
  TestShot,
  Test,
  TestResult,
  TestResultStatus,
  TestKategori,
} from '../../domain/tests/types';
import { KATEGORI_CONFIG } from '../../domain/tests/types';

// ============================================================================
// TYPES
// ============================================================================

interface TestRegistrationFormProps {
  /** Test definition to register results for */
  test: Test;
  /** Player ID (defaults to current user) */
  playerId?: string;
  /** Callback when test is submitted */
  onSubmit?: (result: TestResult) => void;
  /** Callback to close/cancel */
  onClose?: () => void;
  /** Category for requirement lookup */
  kategori?: TestKategori;
}

type FormStep = 'instructions' | 'recording' | 'review';

// ============================================================================
// ICON MAPPING
// ============================================================================

const KATEGORI_ICONS: Record<string, React.ElementType> = {
  hastighet: Activity,
  avstand: Ruler,
  presisjon: Target,
  naerspill: Flag,
  putting: Circle,
  fysisk: Dumbbell,
  scoring: Flag,
  mental: Brain,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate total points from shots
 */
function calculateTotalPoints(shots: TestShot[]): number {
  return shots.reduce((sum, shot) => sum + (shot.poeng || 0), 0);
}

/**
 * Calculate average result from shots
 */
function calculateAverage(shots: TestShot[]): number {
  const validShots = shots.filter((s) => s.resultatLengde !== null);
  if (validShots.length === 0) return 0;
  return validShots.reduce((sum, s) => sum + (s.resultatLengde || 0), 0) / validShots.length;
}

/**
 * Calculate best result from shots
 */
function calculateBest(shots: TestShot[], lowerBetter: boolean): number {
  const validShots = shots.filter((s) => s.resultatLengde !== null);
  if (validShots.length === 0) return 0;
  const values = validShots.map((s) => s.resultatLengde || 0);
  return lowerBetter ? Math.min(...values) : Math.max(...values);
}

// ============================================================================
// SHOT INPUT COMPONENT
// ============================================================================

interface ShotInputProps {
  shot: TestShot;
  isActive: boolean;
  onUpdate: (shot: TestShot) => void;
  unit: string;
}

function ShotInput({ shot, isActive, onUpdate, unit }: ShotInputProps) {
  const handleResultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? null : parseFloat(e.target.value);
    onUpdate({
      ...shot,
      resultatLengde: value,
    });
  };

  const isCompleted = shot.resultatLengde !== null;

  return (
    <div
      className={`
        flex items-center gap-4 p-4 rounded-xl border-2 transition-all
        ${isActive ? 'border-tier-navy bg-tier-navy/5 shadow-md' : ''}
        ${isCompleted && !isActive ? 'border-tier-success/30 bg-tier-success/5' : ''}
        ${!isCompleted && !isActive ? 'border-tier-border-default bg-tier-white' : ''}
      `}
    >
      {/* Shot number */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
          ${isCompleted ? 'bg-tier-success text-white' : 'bg-tier-surface-base text-tier-text-secondary'}
        `}
      >
        {isCompleted ? <Check size={18} /> : shot.nr}
      </div>

      {/* Shot info */}
      <div className="flex-1">
        <div className="text-sm font-medium text-tier-navy">
          {shot.slagType || `Slag ${shot.nr}`}
        </div>
        {shot.målLengde > 0 && (
          <div className="text-xs text-tier-text-secondary">
            Target: {shot.målLengde} {unit}
          </div>
        )}
      </div>

      {/* Result input */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.1"
          value={shot.resultatLengde ?? ''}
          onChange={handleResultChange}
          placeholder="—"
          className={`
            w-24 py-2 px-3 text-center text-lg font-semibold rounded-lg border
            focus:outline-none focus:ring-2 focus:ring-tier-navy/20 focus:border-tier-navy
            ${isActive ? 'border-tier-navy' : 'border-tier-border-default'}
          `}
        />
        <span className="text-sm text-tier-text-secondary min-w-[30px]">{unit}</span>
      </div>

      {/* Points (if applicable) */}
      {shot.poeng !== null && (
        <div className="text-right">
          <div className="text-lg font-bold text-tier-navy">{shot.poeng}</div>
          <div className="text-xs text-tier-text-secondary">points</div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

interface ProgressBarProps {
  current: number;
  total: number;
}

function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-tier-text-secondary">Progress</span>
        <span className="font-medium text-tier-navy">
          {current} of {total} shots
        </span>
      </div>
      <div className="h-2 bg-tier-surface-base rounded-full overflow-hidden">
        <div
          className="h-full bg-tier-navy rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TestRegistrationForm({
  test,
  playerId,
  onSubmit,
  onClose,
  kategori = 'presisjon',
}: TestRegistrationFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<FormStep>('instructions');
  const [shots, setShots] = useState<TestShot[]>(() =>
    test.slag.length > 0
      ? test.slag.map((s) => ({ ...s, resultatLengde: null, poeng: null }))
      : Array.from({ length: 10 }, (_, i) => ({
          nr: i + 1,
          slagType: '',
          målLengde: 0,
          resultatLengde: null,
          poeng: null,
        }))
  );
  const [activeShot, setActiveShot] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = KATEGORI_CONFIG[kategori];
  const KategoriIcon = KATEGORI_ICONS[kategori] || Target;

  // Calculate stats
  const completedShots = useMemo(
    () => shots.filter((s) => s.resultatLengde !== null).length,
    [shots]
  );
  const totalPoints = useMemo(() => calculateTotalPoints(shots), [shots]);
  const averageResult = useMemo(() => calculateAverage(shots), [shots]);

  // Update a shot
  const updateShot = useCallback((index: number, updatedShot: TestShot) => {
    setShots((prev) => prev.map((s, i) => (i === index ? updatedShot : s)));
  }, []);

  // Navigate to next shot
  const nextShot = useCallback(() => {
    if (activeShot < shots.length - 1) {
      setActiveShot((prev) => prev + 1);
    }
  }, [activeShot, shots.length]);

  // Navigate to previous shot
  const prevShot = useCallback(() => {
    if (activeShot > 0) {
      setActiveShot((prev) => prev - 1);
    }
  }, [activeShot]);

  // Reset all shots
  const resetShots = useCallback(() => {
    setShots((prev) =>
      prev.map((s) => ({ ...s, resultatLengde: null, poeng: null }))
    );
    setActiveShot(0);
  }, []);

  // Submit results
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const result: TestResult = {
      testId: test.id,
      spillerId: playerId || user?.playerId || '',
      trenerId: user?.coachId || '',
      dato: new Date(),
      slag: shots,
      totalPoeng: totalPoints,
      status: 'submitted' as TestResultStatus,
    };

    try {
      await api.post('/tests/results', {
        testId: test.id,
        playerId: result.spillerId,
        results: { shots: shots, notes },
        value: averageResult,
        testDate: new Date().toISOString(),
      });

      onSubmit?.(result);
      onClose?.();
    } catch (err) {
      console.error('Failed to submit test result:', err);
      setError('Could not save test result. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER INSTRUCTIONS STEP
  // ============================================================================

  const renderInstructions = () => (
    <div className="space-y-6">
      {/* Test info */}
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <KategoriIcon size={28} style={{ color: config.color }} />
        </div>
        <div className="flex-1">
          <SectionTitle style={{ marginBottom: 0 }}>{test.navn}</SectionTitle>
          <p className="text-sm text-tier-text-secondary mt-1">{test.beskrivelse}</p>
        </div>
      </div>

      {/* Test details */}
      <div className="bg-tier-surface-base rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-tier-text-tertiary uppercase tracking-wider">
              Measurement
            </div>
            <div className="text-sm font-medium text-tier-navy mt-1">
              {test.maling}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-tier-text-tertiary uppercase tracking-wider">
              Number of shots
            </div>
            <div className="text-sm font-medium text-tier-navy mt-1">
              {shots.length}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-tier-text-tertiary uppercase tracking-wider">
              Registration
            </div>
            <div className="text-sm font-medium text-tier-navy mt-1">
              {test.registrering}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-tier-text-tertiary uppercase tracking-wider">
              Category
            </div>
            <div className="text-sm font-medium text-tier-navy mt-1">
              {config.label}
            </div>
          </div>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={() => setStep('recording')}
        className="w-full py-4 bg-tier-navy text-white font-semibold rounded-xl text-lg hover:bg-tier-navy/90 transition-all flex items-center justify-center gap-2"
      >
        <Play size={20} />
        Start test
      </button>
    </div>
  );

  // ============================================================================
  // RENDER RECORDING STEP
  // ============================================================================

  const renderRecording = () => (
    <div className="space-y-6">
      {/* Progress */}
      <ProgressBar current={completedShots} total={shots.length} />

      {/* Current shot highlight */}
      <div className="bg-tier-surface-base rounded-xl p-4">
        <div className="text-sm text-tier-text-secondary mb-1">Active shot</div>
        <div className="text-2xl font-bold text-tier-navy">
          Shot {activeShot + 1} of {shots.length}
        </div>
      </div>

      {/* Shot list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {shots.map((shot, index) => (
          <div key={shot.nr} onClick={() => setActiveShot(index)} className="cursor-pointer">
            <ShotInput
              shot={shot}
              isActive={index === activeShot}
              onUpdate={(updated) => updateShot(index, updated)}
              unit={test.maling}
            />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={prevShot}
          disabled={activeShot === 0}
          className="flex-1 py-3 border border-tier-border-default rounded-xl font-medium text-tier-navy hover:bg-tier-surface-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ChevronLeft size={18} />
          Previous
        </button>
        {activeShot < shots.length - 1 ? (
          <button
            onClick={nextShot}
            className="flex-1 py-3 bg-tier-navy text-white rounded-xl font-medium hover:bg-tier-navy/90 transition-all flex items-center justify-center gap-2"
          >
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={() => setStep('review')}
            disabled={completedShots === 0}
            className="flex-1 py-3 bg-tier-success text-white rounded-xl font-medium hover:bg-tier-success/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            View result
            <Check size={18} />
          </button>
        )}
      </div>

      {/* Reset button */}
      <button
        onClick={resetShots}
        className="w-full py-2 text-tier-text-secondary hover:text-tier-error transition-all flex items-center justify-center gap-2 text-sm"
      >
        <RotateCcw size={16} />
        Reset all shots
      </button>
    </div>
  );

  // ============================================================================
  // RENDER REVIEW STEP
  // ============================================================================

  const renderReview = () => (
    <div className="space-y-6">
      {/* Results summary */}
      <div className="bg-tier-navy/5 border-2 border-tier-navy/20 rounded-xl p-6 text-center">
        <div className="text-sm text-tier-text-secondary mb-2">Your result</div>
        <div className="text-4xl font-bold text-tier-navy mb-2">
          {averageResult.toFixed(1)} {test.maling}
        </div>
        <div className="text-sm text-tier-text-secondary">
          Average of {completedShots} shots
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-tier-surface-base rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-tier-navy">{completedShots}</div>
          <div className="text-xs text-tier-text-secondary">Shots registered</div>
        </div>
        <div className="bg-tier-surface-base rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-tier-navy">
            {calculateBest(shots, test.maling === 'm').toFixed(1)}
          </div>
          <div className="text-xs text-tier-text-secondary">Best shot</div>
        </div>
        <div className="bg-tier-surface-base rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-tier-navy">{totalPoints}</div>
          <div className="text-xs text-tier-text-secondary">Total points</div>
        </div>
      </div>

      {/* All shots summary */}
      <div>
        <div className="text-sm font-medium text-tier-navy mb-3">All shots</div>
        <div className="flex flex-wrap gap-2">
          {shots.map((shot) => (
            <div
              key={shot.nr}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium
                ${shot.resultatLengde !== null
                  ? 'bg-tier-success/10 text-tier-success'
                  : 'bg-tier-surface-base text-tier-text-secondary'
                }
              `}
            >
              #{shot.nr}: {shot.resultatLengde !== null ? `${shot.resultatLengde}${test.maling}` : '—'}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add comments about the test..."
          rows={3}
          className="w-full py-3 px-4 rounded-xl border border-tier-border-default text-sm resize-none focus:outline-none focus:ring-2 focus:ring-tier-navy/20 focus:border-tier-navy"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-tier-error/10 text-tier-error rounded-xl">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setStep('recording')}
          className="flex-1 py-3 border border-tier-border-default rounded-xl font-medium text-tier-navy hover:bg-tier-surface-base transition-all flex items-center justify-center gap-2"
        >
          <ChevronLeft size={18} />
          Edit
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || completedShots === 0}
          className="flex-1 py-3 bg-tier-success text-white rounded-xl font-medium hover:bg-tier-success/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save result
            </>
          )}
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-tier-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-tier-border-default">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${config.color}15` }}
            >
              <KategoriIcon size={20} style={{ color: config.color }} />
            </div>
            <div>
              <SubSectionTitle style={{ marginBottom: 0 }}>{test.navn}</SubSectionTitle>
              <p className="text-xs text-tier-text-secondary">
                {step === 'instructions' && 'Instructions'}
                {step === 'recording' && `Recording shots (${completedShots}/${shots.length})`}
                {step === 'review' && 'Review'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-tier-surface-base rounded-lg transition-colors"
          >
            <X size={20} className="text-tier-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'instructions' && renderInstructions()}
          {step === 'recording' && renderRecording()}
          {step === 'review' && renderReview()}
        </div>
      </div>
    </div>
  );
}

export { TestRegistrationForm };
