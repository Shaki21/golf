/**
 * SessionSummary.jsx
 * Design System v3.0 - Premium Light
 *
 * FASE 5: Session summary with auto-calculated totals
 *
 * Features:
 * - Auto-calculate total duration from exercises
 * - Auto-calculate total repetitions from exercises
 * - Display session overview
 * - Visual progress indicators
 */

import React, { useMemo } from 'react';
import { Clock, Repeat, CheckCircle, Target } from 'lucide-react';

export const SessionSummary = ({ exercises = [], sessionData = {} }) => {
  const totals = useMemo(() => {
    const totalDuration = exercises.reduce(
      (sum, ex) => sum + (ex.estimatedDuration || 0),
      0
    );
    const totalRepetitions = exercises.reduce(
      (sum, ex) => sum + (ex.estimatedRepetitions || 0),
      0
    );

    return {
      duration: totalDuration,
      repetitions: totalRepetitions,
      exerciseCount: exercises.length,
    };
  }, [exercises]);

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} time${hours > 1 ? 'r' : ''}`;
    }
    return `${hours}t ${mins}m`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('no-NO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Duration */}
        <div className="p-4 bg-gradient-to-br from-tier-navy/5 to-tier-navy/10 rounded-lg border border-tier-navy/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-tier-navy" />
            <span className="text-xs font-medium text-tier-text-secondary">Total varighet</span>
          </div>
          <div className="text-2xl font-bold text-tier-navy">
            {formatDuration(totals.duration)}
          </div>
          {exercises.length > 0 && (
            <div className="text-xs text-tier-text-tertiary mt-1">
              Fra {totals.exerciseCount} øvelse{totals.exerciseCount !== 1 ? 'r' : ''}
            </div>
          )}
        </div>

        {/* Total Repetitions */}
        <div className="p-4 bg-gradient-to-br from-tier-success/5 to-tier-success/10 rounded-lg border border-tier-success/20">
          <div className="flex items-center gap-2 mb-2">
            <Repeat size={16} className="text-tier-success" />
            <span className="text-xs font-medium text-tier-text-secondary">Total repetisjoner</span>
          </div>
          <div className="text-2xl font-bold text-tier-success">
            {totals.repetitions}
          </div>
          {totals.repetitions > 0 && (
            <div className="text-xs text-tier-text-tertiary mt-1">
              Totalt antall slag/reps
            </div>
          )}
        </div>
      </div>

      {/* Session Details */}
      {sessionData && Object.keys(sessionData).length > 0 && (
        <div className="p-4 bg-tier-white border border-tier-border-default rounded-lg">
          <div className="text-sm font-semibold text-tier-navy mb-3">Øktdetaljer</div>
          <div className="space-y-2">
            {sessionData.sessionDate && (
              <div className="flex justify-between text-xs">
                <span className="text-tier-text-secondary">Dato & tid:</span>
                <span className="font-medium text-tier-navy">{formatDate(sessionData.sessionDate)}</span>
              </div>
            )}
            {sessionData.location && (
              <div className="flex justify-between text-xs">
                <span className="text-tier-text-secondary">Lokasjon:</span>
                <span className="font-medium text-tier-navy">{sessionData.location}</span>
              </div>
            )}
            {sessionData.pyramidCategory && (
              <div className="flex justify-between text-xs">
                <span className="text-tier-text-secondary">Kategori:</span>
                <span className="font-medium text-tier-navy">{sessionData.pyramidCategory}</span>
              </div>
            )}
            {sessionData.lPhase && (
              <div className="flex justify-between text-xs">
                <span className="text-tier-text-secondary">L-Fase:</span>
                <span className="font-medium text-tier-navy">{sessionData.lPhase}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exercise Breakdown */}
      {exercises.length > 0 && (
        <div className="p-4 bg-tier-surface-base rounded-lg border border-tier-border-default">
          <div className="text-sm font-semibold text-tier-navy mb-3">Øvelser ({exercises.length})</div>
          <div className="space-y-2">
            {exercises.map((exercise, index) => (
              <div
                key={`${exercise.id}-${index}`}
                className="flex items-center justify-between p-2 bg-tier-white rounded border border-tier-border-default"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-tier-navy/10 text-tier-navy text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium text-tier-navy truncate">
                    {exercise.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-tier-text-secondary">
                  <span className="whitespace-nowrap">
                    <Clock size={12} className="inline" /> {exercise.estimatedDuration}m
                  </span>
                  <span className="whitespace-nowrap">
                    <Repeat size={12} className="inline" /> {exercise.estimatedRepetitions}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No exercises placeholder */}
      {exercises.length === 0 && (
        <div className="p-6 bg-tier-surface-base rounded-lg border-2 border-dashed border-tier-border-default text-center">
          <Target size={32} className="mx-auto text-tier-text-tertiary mb-2" />
          <div className="text-sm text-tier-text-secondary mb-1">Ingen øvelser lagt til</div>
          <div className="text-xs text-tier-text-tertiary">
            Legg til øvelser for å se oppsummering
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-3 bg-tier-navy/5 rounded-lg border border-tier-navy/10">
        <div className="flex items-start gap-2">
          <CheckCircle size={14} className="text-tier-navy mt-0.5 flex-shrink-0" />
          <div className="text-xs text-tier-text-secondary">
            <strong className="text-tier-navy">Automatisk beregning:</strong> Total varighet og
            repetisjoner kalkuleres automatisk basert på øvelsene du har lagt til.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;
