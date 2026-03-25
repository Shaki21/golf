/**
 * SessionReflectionForm - Refleksjon etter fullført økt
 * Design System v3.0 - Premium Light
 *
 * Samler data for treningsanalyse og utvikling.
 * Basert på: APP_FUNCTIONALITY.md Section 8
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState } from 'react';
import Button from '../../ui/primitives/Button';

// Format time as HH:MM:SS
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Rating scale component with custom icons and labels
function RatingScale({ label, description, value, onChange, icons, labels }) {
  return (
    <div className="mb-6">
      <span className="block text-[15px] font-medium text-tier-navy mb-1">
        {label}
      </span>
      {description && (
        <span className="block text-xs text-tier-text-secondary mb-2">
          {description}
        </span>
      )}
      <div className="flex justify-between bg-tier-surface-base rounded-lg p-4">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={`flex flex-col items-center p-2 border-none rounded cursor-pointer min-w-[48px] ${
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

// Sleep duration selector
function SleepDurationSelector({ value, onChange }) {
  const options = ['< 5t', '5-6t', '6-7t', '7-8t', '> 8t'];

  return (
    <div className="mb-6">
      <span className="block text-[15px] font-medium text-tier-navy mb-2">
        Søvn siste natt
      </span>
      <div className="flex gap-2 flex-wrap">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`py-2 px-4 border-none rounded-lg cursor-pointer text-[15px] font-medium ${
              value === option
                ? 'bg-tier-navy text-white'
                : 'bg-tier-surface-base text-tier-navy'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

// Text area field
function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-6">
      <span className="block text-[15px] font-medium text-tier-navy mb-2">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[80px] p-4 bg-tier-surface-base border-none rounded-lg resize-y text-base text-tier-navy"
      />
    </div>
  );
}

// Section divider
function SectionDivider() {
  return <div className="h-px bg-tier-border-default my-6" />;
}

// Main SessionReflectionForm component
export default function SessionReflectionForm({ session, totalDuration, blocksCompleted, onSave, onSkip }) {
  // Mental state
  const [fokus, setFokus] = useState(0);
  const [motivasjon, setMotivasjon] = useState(0);
  const [mentalTilstand, setMentalTilstand] = useState(0);

  // Physical state
  const [energiniva, setEnerginia] = useState(0);
  const [fysiskTilstand, setFysiskTilstand] = useState(0);
  const [tekniskUtforelse, setTekniskUtforelse] = useState(0);

  // Rest & recovery
  const [sovnTimer, setSovnTimer] = useState('');
  const [sovnKvalitet, setSovnKvalitet] = useState(0);

  // Free text reflections
  const [hvaBra, setHvaBra] = useState('');
  const [hvaForbedres, setHvaForbedres] = useState('');
  const [malNesteOkt, setMalNesteOkt] = useState('');

  const handleSubmit = () => {
    const reflection = {
      // Mental
      fokus,
      motivasjon,
      mentalTilstand,
      // Physical
      energiniva,
      fysiskTilstand,
      tekniskUtforelse,
      // Recovery
      sovnTimer,
      sovnKvalitet,
      // Text
      hvaBra,
      hvaForbedres,
      malNesteOkt,
      // Meta
      completedAt: new Date().toISOString(),
    };

    onSave(reflection);
  };

  const isComplete = fokus > 0 && energiniva > 0 && motivasjon > 0;

  return (
    <div className="bg-tier-surface-base min-h-screen font-sans">
      {/* Header */}
      <div className="bg-tier-white p-6 border-b border-tier-border-default">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-tier-success text-[28px]">✓</span>
          <span className="text-[28px] font-bold text-tier-navy">
            Økt fullført!
          </span>
        </div>
        <div className="h-0.5 bg-tier-navy mb-4" />
        <div className="text-base text-tier-text-secondary">
          {session?.date} • {formatTime(totalDuration)}
        </div>
        <div className="text-xs text-tier-text-secondary">
          {blocksCompleted} av {session?.blocks?.length || 0} blokker fullført
        </div>
      </div>

      {/* Form content */}
      <div className="p-6">
        <div className="text-[22px] font-bold text-tier-navy mb-6">
          REFLEKSJON
        </div>

        {/* Focus */}
        <RatingScale
          label="Fokus"
          description="Hvor godt klarte du å holde fokus gjennom økten?"
          value={fokus}
          onChange={setFokus}
          icons={['😟', 'meh', '🙂', 'smile', '🤩']}
          labels={['Svært lav', 'Svært høy']}
        />

        {/* Energy level */}
        <RatingScale
          label="Energinivå"
          description="Hvordan var energinivået ditt under økten?"
          value={energiniva}
          onChange={setEnerginia}
          icons={['😴', '🥱', 'meh', '💪', 'zap']}
          labels={['Svært sliten', 'Topp form']}
        />

        {/* Motivation */}
        <RatingScale
          label="Motivasjon"
          description="Hvor motivert var du under økten?"
          value={motivasjon}
          onChange={setMotivasjon}
          icons={['😞', '😕', 'meh', '🙂', '🔥']}
          labels={['Svært lav', 'Svært høy']}
        />

        {/* Technical execution */}
        <RatingScale
          label="Teknisk utførelse"
          description="Hvordan opplevde du den tekniske utførelsen?"
          value={tekniskUtforelse}
          onChange={setTekniskUtforelse}
          icons={['😟', 'meh', '🙂', 'smile', '🤩']}
          labels={['Mye feil', 'Svært bra']}
        />

        {/* Mental state */}
        <RatingScale
          label="Mental tilstand"
          description="Hvordan var din mentale tilstand?"
          value={mentalTilstand}
          onChange={setMentalTilstand}
          icons={['😰', '😟', 'meh', '😌', '🧘']}
          labels={['Stresset', 'Fokusert']}
        />

        {/* Physical state */}
        <RatingScale
          label="Fysisk tilstand"
          description="Hvordan føltes kroppen under økten?"
          value={fysiskTilstand}
          onChange={setFysiskTilstand}
          icons={['🤕', '😣', 'meh', '💪', '🏃']}
          labels={['Vondt', 'Optimal']}
        />

        <SectionDivider />

        {/* Sleep */}
        <SleepDurationSelector value={sovnTimer} onChange={setSovnTimer} />

        <RatingScale
          label="Søvnkvalitet"
          value={sovnKvalitet}
          onChange={setSovnKvalitet}
          icons={['😫', '😴', 'meh', 'smile', '🌟']}
          labels={['Dårlig', 'Utmerket']}
        />

        <SectionDivider />

        {/* Free text reflections */}
        <TextAreaField
          label="Hva gikk bra?"
          value={hvaBra}
          onChange={setHvaBra}
          placeholder="Skriv her..."
        />

        <TextAreaField
          label="Hva kan forbedres?"
          value={hvaForbedres}
          onChange={setHvaForbedres}
          placeholder="Skriv her..."
        />

        <TextAreaField
          label="Mål for neste økt"
          value={malNesteOkt}
          onChange={setMalNesteOkt}
          placeholder="Skriv her..."
        />

        <SectionDivider />

        {/* Submit button */}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isComplete}
          className="w-full mb-4"
        >
          Lagre refleksjon
        </Button>

        <Button
          variant="ghost"
          onClick={onSkip}
          className="w-full"
        >
          Hopp over
        </Button>

        {/* Sports science info */}
        <div className="bg-tier-surface-base rounded-lg p-4 mt-8">
          <span className="text-xs text-tier-text-secondary">
            💡 Refleksjonene hjelper deg og treneren din med å forstå hvordan kropp og sinn responderer på trening,
            og justere treningsbelastningen for optimal utvikling.
          </span>
        </div>
      </div>
    </div>
  );
}
