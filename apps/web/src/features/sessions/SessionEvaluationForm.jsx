/**
 * TIER Golf - Session Evaluation Form
 * Design System v3.0 - Premium Light
 *
 * Samler evalueringsdata etter fullført økt.
 * Inkluderer: fokus, teknisk, energi, mental, pre-shot rutine, tekniske cues
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState, useEffect } from 'react';
import { Check, X, ChevronLeft, Clock, Target, Zap, Brain } from 'lucide-react';
import Button from '../../ui/primitives/Button';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Rating scale component (1-10)
 */
function RatingScale({ label, description, value, onChange, icon: Icon, lowLabel, highLabel }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={18} className="text-tier-navy" />}
        <span className="text-[17px] font-semibold text-tier-navy">
          {label}
        </span>
      </div>
      {description && (
        <span className="block text-xs text-tier-text-secondary mb-2">
          {description}
        </span>
      )}
      <div className="flex gap-1 bg-tier-surface-base rounded-lg p-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(rating)}
            className={`flex-1 py-2 border-none rounded cursor-pointer text-xs transition-all duration-150 ${
              value === rating
                ? 'bg-tier-navy text-white font-semibold'
                : 'bg-transparent text-tier-navy font-medium'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-tier-text-secondary">
          {lowLabel || '1'}
        </span>
        <span className="text-xs text-tier-text-secondary">
          {highLabel || '10'}
        </span>
      </div>
    </div>
  );
}

/**
 * Pre-shot routine selector (yes/partial/no)
 */
function PreShotRoutineSelector({ value, onChange, shotCount, totalShots, onShotCountChange, onTotalShotsChange }) {
  const getOptionClasses = (optionValue) => {
    const isSelected = value === optionValue;
    const baseClasses = 'flex-1 p-4 border-none rounded-lg cursor-pointer text-xs transition-all duration-150';

    if (!isSelected) {
      return `${baseClasses} bg-tier-surface-base text-tier-navy font-medium`;
    }

    switch (optionValue) {
      case 'yes': return `${baseClasses} bg-tier-success text-white font-semibold`;
      case 'partial': return `${baseClasses} bg-tier-warning text-tier-navy font-semibold`;
      case 'no': return `${baseClasses} bg-tier-error text-white font-semibold`;
      default: return `${baseClasses} bg-tier-surface-base text-tier-navy font-medium`;
    }
  };

  return (
    <div className="mb-6">
      <span className="block text-[17px] font-semibold text-tier-navy mb-1">
        Konsistent pre-shot rutine?
      </span>
      <span className="block text-xs text-tier-text-secondary mb-2">
        Fulgte du pre-shot rutinen din konsekvent?
      </span>

      <div className="flex gap-2 mb-4">
        <button onClick={() => onChange('yes')} className={getOptionClasses('yes')}>
          Ja
        </button>
        <button onClick={() => onChange('partial')} className={getOptionClasses('partial')}>
          Delvis
        </button>
        <button onClick={() => onChange('no')} className={getOptionClasses('no')}>
          Nei
        </button>
      </div>

      {/* Shot count inputs */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs text-tier-text-secondary mb-1">
            Slag med rutine
          </label>
          <input
            type="number"
            min="0"
            value={shotCount || ''}
            onChange={(e) => onShotCountChange(parseInt(e.target.value) || 0)}
            placeholder="0"
            className="w-full p-2 bg-tier-surface-base border-none rounded text-[15px] text-tier-navy"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-tier-text-secondary mb-1">
            Totalt slag
          </label>
          <input
            type="number"
            min="0"
            value={totalShots || ''}
            onChange={(e) => onTotalShotsChange(parseInt(e.target.value) || 0)}
            placeholder="0"
            className="w-full p-2 bg-tier-surface-base border-none rounded text-[15px] text-tier-navy"
          />
        </div>
      </div>

      {/* Percentage display */}
      {totalShots > 0 && shotCount >= 0 && (
        <div className="mt-2 text-center">
          <span className="text-[17px] font-semibold text-tier-navy">
            {Math.round((shotCount / totalShots) * 100)}%
          </span>
          <span className="text-xs text-tier-text-secondary ml-1">
            konsistens
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Technical cues selector (multi-select chips)
 */
function TechnicalCuesSelector({ cues, selectedCues, onToggle, customCue, onCustomCueChange }) {
  return (
    <div className="mb-6">
      <span className="block text-[17px] font-semibold text-tier-navy mb-1">
        Tekniske cues brukt
      </span>
      <span className="block text-xs text-tier-text-secondary mb-2">
        Velg cues du fokuserte på i dag
      </span>

      <div className="flex flex-wrap gap-2 mb-4">
        {cues.map((cue) => {
          const isSelected = selectedCues.includes(cue);
          return (
            <button
              key={cue}
              onClick={() => onToggle(cue)}
              className={`py-1 px-4 border-none rounded-full cursor-pointer text-xs font-medium flex items-center gap-1 transition-all duration-150 ${
                isSelected
                  ? 'bg-tier-navy text-white'
                  : 'bg-tier-surface-base text-tier-navy'
              }`}
            >
              {isSelected && <Check size={14} />}
              {cue}
            </button>
          );
        })}
      </div>

      {/* Custom cue input */}
      <input
        type="text"
        value={customCue || ''}
        onChange={(e) => onCustomCueChange(e.target.value)}
        placeholder="Egen cue..."
        className="w-full p-2 bg-tier-surface-base border-none rounded text-[15px] text-tier-navy"
      />
    </div>
  );
}

/**
 * Text area field
 */
function TextAreaField({ label, description, value, onChange, placeholder }) {
  return (
    <div className="mb-6">
      <span className="block text-[17px] font-semibold text-tier-navy mb-1">
        {label}
      </span>
      {description && (
        <span className="block text-xs text-tier-text-secondary mb-2">
          {description}
        </span>
      )}
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[80px] p-4 bg-tier-surface-base border-none rounded-lg resize-y text-[15px] text-tier-navy"
      />
    </div>
  );
}

/**
 * Section divider
 */
function SectionDivider({ title }) {
  return (
    <div className="mt-8 mb-6">
      <div className={`h-px bg-tier-border-default ${title ? 'mb-4' : ''}`} />
      {title && (
        <span className="text-xs font-medium text-tier-text-secondary uppercase tracking-wide">
          {title}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SessionEvaluationForm({
  session,
  technicalCues = [],
  initialValues = {},
  onSave,
  onComplete,
  onCancel,
  isLoading = false,
  autoSaveEnabled = true,
}) {
  // Evaluation ratings (1-10)
  const [evaluationFocus, setEvaluationFocus] = useState(initialValues.evaluationFocus || 0);
  const [evaluationTechnical, setEvaluationTechnical] = useState(initialValues.evaluationTechnical || 0);
  const [evaluationEnergy, setEvaluationEnergy] = useState(initialValues.evaluationEnergy || 0);
  const [evaluationMental, setEvaluationMental] = useState(initialValues.evaluationMental || 0);

  // Pre-shot routine
  const [preShotConsistency, setPreShotConsistency] = useState(initialValues.preShotConsistency || '');
  const [preShotCount, setPreShotCount] = useState(initialValues.preShotCount || 0);
  const [totalShots, setTotalShots] = useState(initialValues.totalShots || 0);

  // Technical cues
  const [selectedCues, setSelectedCues] = useState(initialValues.technicalCues || []);
  const [customCue, setCustomCue] = useState(initialValues.customCue || '');

  // Notes
  const [whatWentWell, setWhatWentWell] = useState(initialValues.whatWentWell || '');
  const [nextSessionFocus, setNextSessionFocus] = useState(initialValues.nextSessionFocus || '');
  const [notes, setNotes] = useState(initialValues.notes || '');

  // Toggle technical cue selection
  const handleToggleCue = (cue) => {
    setSelectedCues((prev) =>
      prev.includes(cue) ? prev.filter((c) => c !== cue) : [...prev, cue]
    );
  };

  // Build evaluation data object
  const getEvaluationData = () => ({
    evaluationFocus: evaluationFocus || null,
    evaluationTechnical: evaluationTechnical || null,
    evaluationEnergy: evaluationEnergy || null,
    evaluationMental: evaluationMental || null,
    preShotConsistency: preShotConsistency || null,
    preShotCount: preShotCount || null,
    totalShots: totalShots || null,
    technicalCues: selectedCues,
    customCue: customCue || null,
    whatWentWell: whatWentWell || null,
    nextSessionFocus: nextSessionFocus || null,
    notes: notes || null,
  });

  // Auto-save on changes
  useEffect(() => {
    if (!autoSaveEnabled || !onSave) return;

    const timer = setTimeout(() => {
      const data = getEvaluationData();
      // Only save if we have at least one rating
      if (data.evaluationFocus || data.evaluationTechnical || data.evaluationEnergy || data.evaluationMental) {
        onSave(data);
      }
    }, 2000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationFocus, evaluationTechnical, evaluationEnergy, evaluationMental, preShotConsistency, preShotCount, totalShots, selectedCues, customCue, whatWentWell, nextSessionFocus, notes]);

  // Handle complete
  const handleComplete = () => {
    const data = {
      ...getEvaluationData(),
      completionStatus: 'completed',
    };
    onComplete(data);
  };

  // Handle abandon
  const handleAbandon = () => {
    const data = {
      ...getEvaluationData(),
      completionStatus: 'abandoned',
    };
    onComplete(data);
  };

  // Check if form has minimum required data
  const hasMinimumData = evaluationFocus > 0 || evaluationTechnical > 0 || evaluationEnergy > 0 || evaluationMental > 0;

  return (
    <div className="bg-tier-white min-h-screen font-sans">
      {/* Header */}
      <div className="bg-tier-navy text-white p-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onCancel} className="text-white p-1">
            <ChevronLeft size={24} />
          </Button>
          <span className="text-[22px] font-bold">
            Evaluer Okt
          </span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Session info */}
        {session && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg">
            <div className="text-[17px] font-semibold">
              {session.focusArea || session.sessionType}
            </div>
            <div className="text-xs opacity-80 mt-1">
              {session.duration} min | {session.learningPhase} | {session.period}
            </div>
          </div>
        )}
      </div>

      {/* Form content */}
      <div className="p-6">
        {/* Ratings Section */}
        <SectionDivider title="Vurdering" />

        <RatingScale
          label="Fokus"
          description="Hvor godt klarte du a holde fokus gjennom okten?"
          value={evaluationFocus}
          onChange={setEvaluationFocus}
          icon={Target}
          lowLabel="Distrahert"
          highLabel="Laserfokus"
        />

        <RatingScale
          label="Teknisk utforelse"
          description="Hvordan var den tekniske kvaliteten pa slagene?"
          value={evaluationTechnical}
          onChange={setEvaluationTechnical}
          icon={Zap}
          lowLabel="Mye feil"
          highLabel="Svaert bra"
        />

        <RatingScale
          label="Energiniva"
          description="Hvordan var energien din under okten?"
          value={evaluationEnergy}
          onChange={setEvaluationEnergy}
          icon={Clock}
          lowLabel="Sliten"
          highLabel="Full energi"
        />

        <RatingScale
          label="Mental tilstand"
          description="Hvordan var din mentale tilstand?"
          value={evaluationMental}
          onChange={setEvaluationMental}
          icon={Brain}
          lowLabel="Stresset"
          highLabel="Rolig og fokusert"
        />

        {/* Pre-shot Routine Section */}
        <SectionDivider title="Pre-shot rutine" />

        <PreShotRoutineSelector
          value={preShotConsistency}
          onChange={setPreShotConsistency}
          shotCount={preShotCount}
          totalShots={totalShots}
          onShotCountChange={setPreShotCount}
          onTotalShotsChange={setTotalShots}
        />

        {/* Technical Cues Section */}
        <SectionDivider title="Tekniske cues" />

        <TechnicalCuesSelector
          cues={technicalCues}
          selectedCues={selectedCues}
          onToggle={handleToggleCue}
          customCue={customCue}
          onCustomCueChange={setCustomCue}
        />

        {/* Notes Section */}
        <SectionDivider title="Refleksjon" />

        <TextAreaField
          label="Hva gikk bra?"
          description="Skriv ned positive opplevelser fra okten"
          value={whatWentWell}
          onChange={setWhatWentWell}
          placeholder="F.eks: God rytme pa putting, traff mange fairways..."
        />

        <TextAreaField
          label="Fokus neste okt"
          description="Hva vil du jobbe med neste gang?"
          value={nextSessionFocus}
          onChange={setNextSessionFocus}
          placeholder="F.eks: Fokusere mer pa alignment..."
        />

        <TextAreaField
          label="Andre notater"
          value={notes}
          onChange={setNotes}
          placeholder="Frivillige notater..."
        />

        {/* Action buttons */}
        <div className="mt-8">
          <Button
            variant="primary"
            onClick={handleComplete}
            disabled={isLoading}
            loading={isLoading}
            leftIcon={<Check size={20} />}
            className="w-full p-4 mb-4 text-[17px] font-semibold"
          >
            Fullfør økt
          </Button>

          <Button
            variant="secondary"
            onClick={handleAbandon}
            disabled={isLoading}
            leftIcon={<X size={16} />}
            className="w-full text-tier-error border-tier-error"
          >
            Avbryt okt
          </Button>
        </div>

        {/* Auto-save indicator */}
        {autoSaveEnabled && hasMinimumData && (
          <div className="mt-6 text-center text-xs text-tier-text-secondary">
            Lagres automatisk
          </div>
        )}

        {/* Info box */}
        <div className="bg-tier-surface-base rounded-lg p-4 mt-8">
          <span className="text-xs text-tier-text-secondary">
            Evalueringen hjelper deg og treneren din med a folge utviklingen over tid.
            Okten auto-fullføres etter 15 minutter uten aktivitet.
          </span>
        </div>
      </div>
    </div>
  );
}
