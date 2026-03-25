/**
 * PEIBaneTestForm.jsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState, useMemo } from 'react';
import { Save, RotateCcw, Target } from 'lucide-react';
import { SectionTitle } from '../../components/typography';
import Button from '../../ui/primitives/Button';
import apiClient from '../../services/apiClient';

// ============================================================================
// CLASS MAPPINGS
// ============================================================================

const SLAG_TYPE_CLASSES = {
  f: {
    text: 'text-tier-success',
    bg: 'bg-tier-success/15',
    border: 'border-tier-success',
    label: 'Fairway',
    short: 'F',
  },
  r: {
    text: 'text-tier-warning',
    bg: 'bg-tier-warning/15',
    border: 'border-tier-warning',
    label: 'Rough',
    short: 'R',
  },
  t: {
    text: 'text-tier-navy',
    bg: 'bg-tier-navy/15',
    border: 'border-tier-navy',
    label: 'Tee',
    short: 'T',
  },
  b: {
    text: 'text-tier-error',
    bg: 'bg-tier-error/15',
    border: 'border-tier-error',
    label: 'Bunker',
    short: 'B',
  },
};

const SLAG_TYPER = Object.entries(SLAG_TYPE_CLASSES).map(([id, config]) => ({
  id,
  label: config.label,
  short: config.short,
}));

const INITIAL_SHOTS = Array.from({ length: 18 }, (_, i) => ({
  nr: i + 1,
  hull: '',
  slagType: '',
  lengde: '',
  tillHull: '',
}));

// ============================================================================
// PEI CALCULATION
// ============================================================================

/**
 * Beregner PEI (Precision Error Index) for et slag
 * PEI = (Avstand til hull) / (Slaglengde) * 100
 * Lavere PEI = bedre presisjon
 */
const calculatePEI = (lengde, tillHull) => {
  const l = parseFloat(lengde);
  const t = parseFloat(tillHull);
  if (!l || !t || l <= 0) return null;
  return (t / l) * 100;
};

const getPEIColorClass = (pei) => {
  if (pei === null) return 'text-tier-border-default';
  if (pei <= 5) return 'text-tier-success';
  if (pei <= 10) return 'text-tier-warning';
  return 'text-tier-error';
};

// ============================================================================
// SHOT ROW COMPONENT
// ============================================================================

const ShotRow = ({ shot, onChange, isEven }) => {
  const pei = calculatePEI(shot.lengde, shot.tillHull);

  return (
    <tr className={isEven ? 'bg-tier-surface-base' : 'bg-tier-white'}>
      {/* Nr */}
      <td className="py-2 px-3 text-center font-semibold text-tier-navy text-sm">
        {shot.nr}
      </td>

      {/* Hull */}
      <td className="py-1.5 px-2">
        <input
          type="number"
          min="1"
          max="18"
          value={shot.hull}
          onChange={(e) => onChange('hull', e.target.value)}
          placeholder="-"
          className="w-full py-2 px-2.5 border border-tier-border-default rounded-md text-sm text-center outline-none focus:border-tier-navy"
        />
      </td>

      {/* Slag type (f/r/t/b) */}
      <td className="py-1.5 px-2">
        <div className="flex gap-1 justify-center">
          {SLAG_TYPER.map((type) => {
            const classes = SLAG_TYPE_CLASSES[type.id];
            const isSelected = shot.slagType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => onChange('slagType', type.id)}
                title={type.label}
                className={`w-7 h-7 rounded-md text-[11px] font-semibold cursor-pointer transition-all ${
                  isSelected
                    ? `border-2 ${classes.border} ${classes.bg} ${classes.text}`
                    : 'border border-tier-border-default bg-tier-white text-tier-text-secondary'
                }`}
              >
                {type.short}
              </button>
            );
          })}
        </div>
      </td>

      {/* Lengde (avstand til mål) */}
      <td className="py-1.5 px-2">
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            step="1"
            value={shot.lengde}
            onChange={(e) => onChange('lengde', e.target.value)}
            placeholder="0"
            className="w-full py-2 px-2.5 border border-tier-border-default rounded-md text-sm text-right outline-none focus:border-tier-navy"
          />
          <span className="text-xs text-tier-text-secondary min-w-[16px]">m</span>
        </div>
      </td>

      {/* Till hull (avstand etter slag) */}
      <td className="py-1.5 px-2">
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            step="0.1"
            value={shot.tillHull}
            onChange={(e) => onChange('tillHull', e.target.value)}
            placeholder="0"
            className="w-full py-2 px-2.5 border border-tier-border-default rounded-md text-sm text-right outline-none focus:border-tier-navy"
          />
          <span className="text-xs text-tier-text-secondary min-w-[16px]">m</span>
        </div>
      </td>

      {/* PEI (auto-calculated) */}
      <td className={`py-2 px-3 text-center font-semibold text-sm ${getPEIColorClass(pei)}`}>
        {pei !== null ? pei.toFixed(1) + '%' : '-'}
      </td>
    </tr>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PEIBaneTestForm = ({ onSubmit, onClose }) => {
  const [shots, setShots] = useState(INITIAL_SHOTS);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleShotChange = (index, field, value) => {
    const newShots = [...shots];
    newShots[index] = { ...newShots[index], [field]: value };
    setShots(newShots);
  };

  const handleReset = () => {
    setShots(INITIAL_SHOTS);
    setNotes('');
    setSubmitError(null);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const validShots = shots.filter(s => s.lengde && s.tillHull);
    if (validShots.length === 0) return null;

    const peiValues = validShots.map(s => calculatePEI(s.lengde, s.tillHull)).filter(p => p !== null);
    const avgPEI = peiValues.reduce((a, b) => a + b, 0) / peiValues.length;
    const avgTillHull = validShots.reduce((sum, s) => sum + parseFloat(s.tillHull), 0) / validShots.length;
    const totalLengde = validShots.reduce((sum, s) => sum + parseFloat(s.lengde), 0);

    // Count by slag type
    const slagTypeCounts = SLAG_TYPER.reduce((acc, type) => {
      acc[type.id] = validShots.filter(s => s.slagType === type.id).length;
      return acc;
    }, {});

    return {
      antallSlag: validShots.length,
      avgPEI,
      avgTillHull,
      totalLengde,
      slagTypeCounts,
    };
  }, [shots]);

  const handleSubmit = async () => {
    if (!stats || stats.antallSlag === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const testData = {
      testId: 'pei_bane',
      value: stats.avgPEI,
      results: {
        shots: shots.filter(s => s.lengde && s.tillHull),
        avgTillHull: stats.avgTillHull,
        totalLengde: stats.totalLengde,
        antallSlag: stats.antallSlag,
        notes,
      },
      testDate: new Date().toISOString(),
      passed: stats.avgPEI <= 10,
    };

    try {
      if (onSubmit) {
        await onSubmit(testData);
      } else {
        await apiClient.post('/tests/results', testData);
      }
      handleReset();
      if (onClose) onClose();
    } catch (err) {
      console.error('Failed to submit PEI test:', err);
      setSubmitError(err.message || 'Kunne ikke lagre testresultatet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-tier-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="py-5 px-6 border-b border-tier-border-default flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-tier-navy/15 flex items-center justify-center">
            <Target size={24} className="text-tier-navy" />
          </div>
          <div>
            <SectionTitle className="m-0 text-lg font-semibold">
              PEI Test - Bane
            </SectionTitle>
            <p className="m-0 text-[13px] text-tier-text-secondary">
              Slag test med 18 slag fra ulike posisjoner
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          leftIcon={<RotateCcw size={16} />}
        >
          Nullstill
        </Button>
      </div>

      {/* Instructions */}
      <div className="py-4 px-6 bg-tier-navy/5 border-b border-tier-border-default">
        <p className="m-0 text-[13px] text-tier-navy leading-relaxed">
          <strong>Instruksjoner:</strong> Registrer 18 slag fra ulike posisjoner på banen.
          For hvert slag, noter hull-nummer, underlag (F=Fairway, R=Rough, T=Tee, B=Bunker),
          avstand til mål, og avstand til hull etter slaget. PEI beregnes automatisk.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-tier-surface-base border-b-2 border-tier-border-default">
              <th className="p-3 text-xs font-semibold text-tier-text-secondary text-center w-[50px]">Nr</th>
              <th className="p-3 text-xs font-semibold text-tier-text-secondary text-center w-[70px]">Hull</th>
              <th className="p-3 text-xs font-semibold text-tier-text-secondary text-center w-[140px]">Slag (F/R/T/B)</th>
              <th className="p-3 text-xs font-semibold text-tier-text-secondary text-center w-[100px]">Lengde</th>
              <th className="p-3 text-xs font-semibold text-tier-text-secondary text-center w-[100px]">Til hull</th>
              <th className="p-3 text-xs font-semibold text-tier-text-secondary text-center w-[80px]">PEI</th>
            </tr>
          </thead>
          <tbody>
            {shots.map((shot, index) => (
              <ShotRow
                key={shot.nr}
                shot={shot}
                onChange={(field, value) => handleShotChange(index, field, value)}
                isEven={index % 2 === 0}
              />
            ))}
          </tbody>

          {/* Total row */}
          {stats && (
            <tfoot>
              <tr className="bg-tier-navy text-white">
                <td colSpan={3} className="py-3.5 px-4 text-sm font-semibold">
                  Total ({stats.antallSlag} slag)
                </td>
                <td className="py-3.5 px-3 text-sm font-semibold text-center">
                  {stats.totalLengde.toFixed(0)}m
                </td>
                <td className="py-3.5 px-3 text-sm font-semibold text-center">
                  Ø {stats.avgTillHull.toFixed(1)}m
                </td>
                <td className={`py-3.5 px-3 text-base font-bold text-center ${
                  stats.avgPEI <= 5 ? 'text-green-400' : stats.avgPEI <= 10 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {stats.avgPEI.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="py-4 px-6 bg-tier-surface-base border-t border-tier-border-default flex gap-6 flex-wrap">
          <div>
            <p className="m-0 text-[11px] text-tier-text-secondary mb-1">
              Slag fordeling
            </p>
            <div className="flex gap-2">
              {SLAG_TYPER.map((type) => {
                const classes = SLAG_TYPE_CLASSES[type.id];
                return (
                  <span
                    key={type.id}
                    className={`py-1 px-2 rounded-md ${classes.bg} ${classes.text} text-xs font-semibold`}
                  >
                    {type.short}: {stats.slagTypeCounts[type.id]}
                  </span>
                );
              })}
            </div>
          </div>
          <div>
            <p className="m-0 text-[11px] text-tier-text-secondary mb-1">
              Gjennomsnitt til hull
            </p>
            <p className="m-0 text-lg font-bold text-tier-navy">
              {stats.avgTillHull.toFixed(1)} m
            </p>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="py-4 px-6 border-t border-tier-border-default">
        <label className="block text-[13px] font-semibold text-tier-navy mb-2">
          Notater (valgfritt)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="F.eks. værforhold, baneforhold, utstyr brukt..."
          rows={2}
          className="w-full py-2.5 px-3.5 rounded-lg border border-tier-border-default text-sm outline-none resize-y font-inherit focus:border-tier-navy"
        />
      </div>

      {/* Error message */}
      {submitError && (
        <div className="py-3 px-6 bg-tier-error/10 border-t border-tier-error/30">
          <p className="m-0 text-[13px] text-tier-error">
            {submitError}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="py-4 px-6 border-t border-tier-border-default flex gap-3 justify-end">
        {onClose && (
          <Button variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!stats || stats.antallSlag === 0 || isSubmitting}
          loading={isSubmitting}
          leftIcon={<Save size={18} />}
        >
          {isSubmitting ? 'Lagrer...' : 'Lagre testresultat'}
        </Button>
      </div>
    </div>
  );
};

export default PEIBaneTestForm;
