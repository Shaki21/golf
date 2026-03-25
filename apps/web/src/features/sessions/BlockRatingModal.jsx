/**
 * TIER Golf - Block Rating Modal
 * Design System v3.0 - Premium Light
 *
 * Quality rating after completing a training block.
 * Based on: APP_FUNCTIONALITY.md Section 7.5
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState } from 'react';
import Button from '../../ui/primitives/Button';

// Format time as MM:SS
function formatTimeShort(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Rating scale component
function RatingScale({ label, value, onChange, icons, labels }) {
  return (
    <div className="mb-6">
      <span className="text-[15px] font-medium text-tier-navy block mb-2">
        {label}
      </span>
      <div className="flex justify-between bg-tier-surface-base rounded-lg p-4">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={`flex flex-col items-center p-2 border-none rounded cursor-pointer min-w-12 ${
              value === rating ? 'bg-tier-navy' : 'bg-transparent'
            }`}
          >
            <span className="text-2xl">{icons[rating - 1]}</span>
            <span
              className={`text-xs mt-1 ${
                value === rating ? 'text-white' : 'text-tier-text-secondary'
              }`}
            >
              {rating}
            </span>
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-tier-text-secondary">
          {labels[0]}
        </span>
        <span className="text-xs text-tier-text-secondary">
          {labels[1]}
        </span>
      </div>
    </div>
  );
}

// Main BlockRatingModal component
export default function BlockRatingModal({ block, duration, reps, onComplete, onSkip }) {
  const [quality, setQuality] = useState(0);
  const [focus, setFocus] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    onComplete({
      quality,
      focus,
      intensity,
      note,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-tier-white rounded-xl p-6 w-full max-w-[400px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-tier-success text-2xl">✓</span>
            <span className="text-[22px] font-bold text-tier-navy">
              Blokk fullført
            </span>
          </div>
          <div className="h-0.5 bg-tier-border-default mb-4" />
        </div>

        {/* Block summary */}
        <div className="bg-tier-surface-base rounded-lg p-4 mb-6">
          <div className="text-[15px] font-medium text-tier-navy">
            {block.exercise}: {block.focus}
          </div>
          <div className="text-base text-tier-text-secondary">
            {block.trainingArea} • {reps} reps • {formatTimeShort(duration)}
          </div>
        </div>

        {/* Question */}
        <div className="text-xl font-semibold text-tier-navy mb-6 text-center">
          Hvordan gikk det?
        </div>

        {/* Rating scales */}
        <RatingScale
          label="Kvalitet"
          value={quality}
          onChange={setQuality}
          icons={['1', '2', '3', '4', '5']}
          labels={['Dårlig', 'Utmerket']}
        />

        <RatingScale
          label="Fokus"
          value={focus}
          onChange={setFocus}
          icons={['1', '2', '3', '4', '5']}
          labels={['Distrahert', 'Laserfokusert']}
        />

        <RatingScale
          label="Intensitet"
          value={intensity}
          onChange={setIntensity}
          icons={['1', '2', '3', '4', '5']}
          labels={['Lav', 'Høy']}
        />

        {/* Note */}
        <div className="mb-6">
          <span className="text-[15px] font-medium text-tier-navy block mb-2">
            Notat (valgfritt)
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Følte god kontakt på de siste 100 slagene..."
            className="w-full min-h-[80px] p-4 bg-tier-surface-base border-none rounded-lg resize-y text-base text-tier-navy outline-none focus:ring-1 focus:ring-tier-navy"
          />
        </div>

        {/* Buttons */}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={quality === 0 || focus === 0 || intensity === 0}
          className="w-full mb-4"
        >
          Lagre og fortsett →
        </Button>

        <Button
          variant="ghost"
          onClick={onSkip}
          className="w-full"
        >
          Hopp over
        </Button>
      </div>
    </div>
  );
}
