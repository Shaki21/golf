/**
 * Log Training Area Performance Form
 * Component for entering performance stats after training sessions
 * Migrated to Tailwind CSS
 */

import React, { useState } from 'react';
import { Button } from '../../ui/primitives';
import { SectionTitle } from '../../ui/primitives/typography';
import api from '../../services/api';

interface LogPerformanceFormProps {
  sessionId?: string;
  trainingArea?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TRAINING_AREAS = [
  { value: 'TEE', label: 'Driver/Tee' },
  { value: 'INN200', label: 'Innspel 200m+' },
  { value: 'INN150', label: 'Innspel 150m' },
  { value: 'INN100', label: 'Innspel 100m' },
  { value: 'INN50', label: 'Innspel 50m' },
  { value: 'CHIP', label: 'Chip' },
  { value: 'PITCH', label: 'Pitch' },
  { value: 'LOB', label: 'Lob' },
  { value: 'BUNKER', label: 'Bunker' },
  { value: 'PUTT0-3', label: 'Putt 0-3m' },
  { value: 'PUTT3-8', label: 'Putt 3-8m' },
  { value: 'PUTT8-15', label: 'Putt 8-15m' },
  { value: 'PUTT15-25', label: 'Putt 15-25m' },
  { value: 'PUTT25-40', label: 'Putt 25-40m' },
  { value: 'PUTT40+', label: 'Putt 40+m' },
  { value: 'SPILL', label: 'Spill/Bane' },
];

const LEARNING_PHASES = [
  { value: 'L-BODY', label: 'L-BODY (Body awareness)' },
  { value: 'L-ARM', label: 'L-ARM (Arm awareness)' },
  { value: 'L-CLUB', label: 'L-CLUB (Club control)' },
  { value: 'L-BALL', label: 'L-BALL (Ball focus)' },
  { value: 'L-AUTO', label: 'L-AUTO (Automated)' },
];

export const LogTrainingAreaPerformanceForm: React.FC<LogPerformanceFormProps> = ({
  sessionId,
  trainingArea: defaultArea,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    trainingArea: defaultArea || '',
    performanceDate: new Date().toISOString().split('T')[0],
    sessionId: sessionId || '',

    // Performance metrics
    repetitions: '',
    successfulReps: '',
    successRate: '',
    consistencyScore: '',

    // Distance/Putting metrics (conditional)
    distanceMeters: '',
    madePutts: '',
    totalPutts: '',
    upAndDownSuccess: '',
    upAndDownAttempts: '',

    // Context
    learningPhase: '',
    environment: '',
    pressure: '',

    // Ratings
    feelRating: '',
    technicalRating: '',
    mentalRating: '',

    // Notes
    notes: '',
    keyLearning: '',
    nextFocus: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare data - only send fields that have values
      const payload: any = {
        trainingArea: formData.trainingArea,
        performanceDate: formData.performanceDate,
      };

      if (formData.sessionId) payload.sessionId = formData.sessionId;
      if (formData.repetitions) payload.repetitions = parseInt(formData.repetitions);
      if (formData.successfulReps) payload.successfulReps = parseInt(formData.successfulReps);
      if (formData.successRate) payload.successRate = parseFloat(formData.successRate);
      if (formData.consistencyScore) payload.consistencyScore = parseInt(formData.consistencyScore);

      // Calculate success rate if not provided but we have reps
      if (!formData.successRate && formData.repetitions && formData.successfulReps) {
        const reps = parseInt(formData.repetitions);
        const success = parseInt(formData.successfulReps);
        payload.successRate = reps > 0 ? (success / reps) * 100 : 0;
      }

      // Area-specific metrics
      if (formData.distanceMeters) payload.distanceMeters = parseFloat(formData.distanceMeters);
      if (formData.madePutts) payload.madePutts = parseInt(formData.madePutts);
      if (formData.totalPutts) payload.totalPutts = parseInt(formData.totalPutts);
      if (formData.upAndDownSuccess) payload.upAndDownSuccess = parseInt(formData.upAndDownSuccess);
      if (formData.upAndDownAttempts) payload.upAndDownAttempts = parseInt(formData.upAndDownAttempts);

      // Context
      if (formData.learningPhase) payload.learningPhase = formData.learningPhase;
      if (formData.environment) payload.environment = formData.environment;
      if (formData.pressure) payload.pressure = formData.pressure;

      // Ratings
      if (formData.feelRating) payload.feelRating = parseInt(formData.feelRating);
      if (formData.technicalRating) payload.technicalRating = parseInt(formData.technicalRating);
      if (formData.mentalRating) payload.mentalRating = parseInt(formData.mentalRating);

      // Notes
      if (formData.notes) payload.notes = formData.notes;
      if (formData.keyLearning) payload.keyLearning = formData.keyLearning;
      if (formData.nextFocus) payload.nextFocus = formData.nextFocus;

      await api.post('/training-area-performance', payload);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error logging performance:', err);
      setError(err.response?.data?.error?.message || 'Kunne ikke lagre prestasjon');
    } finally {
      setLoading(false);
    }
  };

  const isPuttingArea = formData.trainingArea.startsWith('PUTT');
  const isShortGame = ['CHIP', 'PITCH', 'LOB', 'BUNKER'].includes(formData.trainingArea);
  const isDistanceArea = ['TEE', 'INN200', 'INN150', 'INN100', 'INN50'].includes(formData.trainingArea);

  const inputClasses = "w-full px-3 py-2.5 text-sm border border-tier-border-default rounded-lg bg-white text-tier-navy focus:outline-none focus:border-tier-gold";
  const labelClasses = "text-sm font-medium text-tier-text-secondary";

  return (
    <div className="max-w-[800px] mx-auto p-6">
      <SectionTitle className="mb-0">Logg treningsområde-prestasjon</SectionTitle>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-500 rounded-lg text-red-600 text-sm mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Training Area */}
        <div className="flex flex-col gap-2">
          <label className={labelClasses}>Treningsområde *</label>
          <select
            value={formData.trainingArea}
            onChange={(e) => setFormData({ ...formData, trainingArea: e.target.value })}
            required
            className={inputClasses}
          >
            <option value="">Velg område</option>
            {TRAINING_AREAS.map((area) => (
              <option key={area.value} value={area.value}>
                {area.label}
              </option>
            ))}
          </select>
        </div>

        {/* Performance Date */}
        <div className="flex flex-col gap-2">
          <label className={labelClasses}>Dato *</label>
          <input
            type="date"
            value={formData.performanceDate}
            onChange={(e) => setFormData({ ...formData, performanceDate: e.target.value })}
            required
            className={inputClasses}
          />
        </div>

        {/* Basic Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClasses}>Antall repetisjoner</label>
            <input
              type="number"
              min="0"
              value={formData.repetitions}
              onChange={(e) => setFormData({ ...formData, repetitions: e.target.value })}
              className={inputClasses}
              placeholder="f.eks. 20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClasses}>Vellykkede forsøk</label>
            <input
              type="number"
              min="0"
              value={formData.successfulReps}
              onChange={(e) => setFormData({ ...formData, successfulReps: e.target.value })}
              className={inputClasses}
              placeholder="f.eks. 15"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClasses}>Suksessrate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.successRate}
              onChange={(e) => setFormData({ ...formData, successRate: e.target.value })}
              className={inputClasses}
              placeholder="f.eks. 75"
            />
            <small className="text-xs text-tier-text-tertiary">Beregnes automatisk hvis ikke oppgitt</small>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClasses}>Konsistens (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.consistencyScore}
              onChange={(e) => setFormData({ ...formData, consistencyScore: e.target.value })}
              className={inputClasses}
              placeholder="1-10"
            />
          </div>
        </div>

        {/* Area-specific metrics */}
        {isDistanceArea && (
          <div className="flex flex-col gap-2">
            <label className={labelClasses}>Gjennomsnittsavstand (meter)</label>
            <input
              type="number"
              step="0.1"
              value={formData.distanceMeters}
              onChange={(e) => setFormData({ ...formData, distanceMeters: e.target.value })}
              className={inputClasses}
              placeholder="f.eks. 245"
            />
          </div>
        )}

        {isPuttingArea && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className={labelClasses}>Antall putts hullet</label>
              <input
                type="number"
                min="0"
                value={formData.madePutts}
                onChange={(e) => setFormData({ ...formData, madePutts: e.target.value })}
                className={inputClasses}
                placeholder="f.eks. 8"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClasses}>Totalt antall putts</label>
              <input
                type="number"
                min="0"
                value={formData.totalPutts}
                onChange={(e) => setFormData({ ...formData, totalPutts: e.target.value })}
                className={inputClasses}
                placeholder="f.eks. 10"
              />
            </div>
          </div>
        )}

        {isShortGame && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className={labelClasses}>Up & Down vellykket</label>
              <input
                type="number"
                min="0"
                value={formData.upAndDownSuccess}
                onChange={(e) => setFormData({ ...formData, upAndDownSuccess: e.target.value })}
                className={inputClasses}
                placeholder="f.eks. 6"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClasses}>Up & Down forsøk</label>
              <input
                type="number"
                min="0"
                value={formData.upAndDownAttempts}
                onChange={(e) => setFormData({ ...formData, upAndDownAttempts: e.target.value })}
                className={inputClasses}
                placeholder="f.eks. 10"
              />
            </div>
          </div>
        )}

        {/* Learning Phase & Context */}
        <div className="flex flex-col gap-2">
          <label className={labelClasses}>Læringsfase</label>
          <select
            value={formData.learningPhase}
            onChange={(e) => setFormData({ ...formData, learningPhase: e.target.value })}
            className={inputClasses}
          >
            <option value="">Velg fase</option>
            {LEARNING_PHASES.map((phase) => (
              <option key={phase.value} value={phase.value}>
                {phase.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ratings */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className={labelClasses}>Følelse (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.feelRating}
              onChange={(e) => setFormData({ ...formData, feelRating: e.target.value })}
              className={inputClasses}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClasses}>Teknikk (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.technicalRating}
              onChange={(e) => setFormData({ ...formData, technicalRating: e.target.value })}
              className={inputClasses}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClasses}>Mentalt (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.mentalRating}
              onChange={(e) => setFormData({ ...formData, mentalRating: e.target.value })}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <label className={labelClasses}>Nøkkellæring</label>
          <textarea
            value={formData.keyLearning}
            onChange={(e) => setFormData({ ...formData, keyLearning: e.target.value })}
            className={`${inputClasses} resize-y font-inherit`}
            rows={2}
            placeholder="Hva lærte du i denne økten?"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClasses}>Neste fokus</label>
          <textarea
            value={formData.nextFocus}
            onChange={(e) => setFormData({ ...formData, nextFocus: e.target.value })}
            className={`${inputClasses} resize-y font-inherit`}
            rows={2}
            placeholder="Hva skal du jobbe med neste gang?"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClasses}>Notater</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className={`${inputClasses} resize-y font-inherit`}
            rows={3}
            placeholder="Andre notater..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-5 border-t border-tier-border-subtle">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Avbryt
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={loading || !formData.trainingArea}>
            {loading ? 'Lagrer...' : 'Lagre prestasjon'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LogTrainingAreaPerformanceForm;
