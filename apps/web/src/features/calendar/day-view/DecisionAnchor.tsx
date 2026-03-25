/**
 * DecisionAnchor.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * ALWAYS VISIBLE - This is the anchor to the already-made decision.
 * Must never scroll out of view.
 *
 * Purpose: Reduce decision friction to near zero.
 * One clear priority. One primary action. Secondary info after action.
 */

import React, { useState } from 'react';
import { Play, Check, Clock, Pause, X, ChevronDown, AlertTriangle, Zap } from 'lucide-react';
import { DecisionAnchorProps, RescheduleOption } from './types';

// Format elapsed time as MM:SS or HH:MM:SS
const formatElapsedTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format duration in Norwegian
const formatDuration = (minutes: number): string => {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}t ${mins}min` : `${hrs}t`;
  }
  return `${minutes} min`;
};

// Translate category to Norwegian
const translateCategory = (category: string): string => {
  const translations: Record<string, string> = {
    teknikk: 'Teknikk',
    golfslag: 'Golfslag',
    spill: 'Spill',
    konkurranse: 'Konkurranse',
    fysisk: 'Fysisk',
    mental: 'Mental',
  };
  return translations[category] || category;
};

export const DecisionAnchor: React.FC<DecisionAnchorProps> = ({
  data,
  onStartWorkout,
  onReschedule,
  onComplete,
  onPause,
  onCancel,
  onSelectWorkout,
  onOpenTimePicker,
}) => {
  const [showRescheduleOptions, setShowRescheduleOptions] = useState(false);
  const { weeklyFocus, recommendedWorkout, state, collision, elapsedTime } = data;

  const rescheduleOptions: { label: string; option: RescheduleOption }[] = [
    { label: '15 minutter', option: { type: 'delay', minutes: 15 } },
    { label: '30 minutter', option: { type: 'delay', minutes: 30 } },
    { label: '60 minutter', option: { type: 'delay', minutes: 60 } },
  ];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!showRescheduleOptions) return;

    const handleClickOutside = () => setShowRescheduleOptions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showRescheduleOptions]);

  // Render based on state
  const renderContent = () => {
    switch (state) {
      case 'S5_IN_PROGRESS':
        return (
          <>
            <div className="text-xs text-tier-text-tertiary mb-1 font-medium">Pågår</div>
            <div className="text-base text-tier-navy font-semibold mb-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-tier-success/10 text-tier-success">
                <Play size={12} />
                Pågår
              </span>
              <span>{recommendedWorkout?.name}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className="flex items-center gap-2 text-xl font-semibold tabular-nums text-tier-navy"
                role="timer"
                aria-live="polite"
                aria-label={`Treningstid: ${formatElapsedTime(elapsedTime || 0)}`}
              >
                <Clock size={20} className="text-tier-text-tertiary" aria-hidden="true" />
                {formatElapsedTime(elapsedTime || 0)}
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-tier-navy text-white rounded-lg text-base font-semibold cursor-pointer transition-all min-h-[44px] hover:bg-tier-navy/90"
                onClick={onComplete}
                aria-label="Fullfør trening"
              >
                <Check size={18} aria-hidden="true" />
                Fullfør
              </button>
              {onPause && (
                <button className="inline-flex items-center gap-1 p-2 text-tier-text-tertiary rounded cursor-pointer hover:bg-tier-surface-base" onClick={onPause} aria-label="Pause trening">
                  <Pause size={16} aria-hidden="true" />
                  Pause
                </button>
              )}
              {onCancel && (
                <button className="inline-flex items-center gap-1 p-2 text-tier-text-tertiary rounded cursor-pointer hover:bg-tier-surface-base" onClick={onCancel} aria-label="Avbryt trening">
                  <X size={16} aria-hidden="true" />
                  Avbryt
                </button>
              )}
            </div>
          </>
        );

      case 'S6_COMPLETED':
        return (
          <>
            <div className="text-xs text-tier-text-tertiary mb-1 font-medium">I dag: {weeklyFocus}</div>
            <div className="text-base text-tier-navy font-semibold mb-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-tier-success/10 text-tier-success">
                <Check size={12} />
                Fullført
              </span>
              <span>{recommendedWorkout?.name}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button className="inline-flex items-center justify-center gap-2 py-2 px-3 border border-tier-border-default rounded-lg text-sm font-medium cursor-pointer transition-all min-h-[36px] text-tier-text-secondary hover:bg-tier-surface-base" onClick={onSelectWorkout}>
                Loggfør notat
              </button>
            </div>
          </>
        );

      case 'S4_COLLISION':
        return (
          <>
            <div className="text-xs text-tier-text-tertiary mb-1 font-medium">I dag: {weeklyFocus}</div>
            <div className="flex items-center gap-2 py-2 px-3 bg-tier-warning/10 rounded mb-3 text-sm text-tier-navy">
              <AlertTriangle size={16} className="text-tier-warning" />
              <span>
                Konflikt med {collision?.conflictingEvent.title}
              </span>
            </div>
            <div className="text-base text-tier-navy font-semibold mb-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-tier-warning/10 text-tier-warning">
                <AlertTriangle size={12} />
                Konflikt
              </span>
              <span>
                {recommendedWorkout?.name} · {formatDuration(recommendedWorkout?.duration || 0)} ·{' '}
                {translateCategory(recommendedWorkout?.category || '')}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-tier-navy text-white rounded-lg text-base font-semibold cursor-pointer transition-all min-h-[44px] hover:bg-tier-navy/90"
                onClick={() => onReschedule({ type: 'delay', minutes: 30 })}
              >
                Flytt 30 min
              </button>
              <button className="inline-flex items-center justify-center gap-2 py-2 px-3 border border-tier-border-default rounded-lg text-sm font-medium cursor-pointer transition-all min-h-[36px] text-tier-text-secondary hover:bg-tier-surface-base" onClick={onStartWorkout}>
                Start likevel
              </button>
            </div>
          </>
        );

      case 'S3_NO_RECOMMENDATION':
        return (
          <>
            <div className="text-xs text-tier-text-tertiary mb-1 font-medium">I dag: {weeklyFocus}</div>
            <div className="text-base text-tier-text-secondary font-semibold mb-3 flex items-center gap-2 flex-wrap">
              Ingen anbefalt økt i dag
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-tier-navy text-white rounded-lg text-base font-semibold cursor-pointer transition-all min-h-[44px] hover:bg-tier-navy/90"
                onClick={onStartWorkout}
                aria-label="Start en rask 15 minutters terskeløkt"
              >
                <Zap size={18} aria-hidden="true" />
                Start 15 min terskeløkt
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 py-2 px-3 border border-tier-border-default rounded-lg text-sm font-medium cursor-pointer transition-all min-h-[36px] text-tier-text-secondary hover:bg-tier-surface-base"
                onClick={onSelectWorkout}
                aria-label="Velg en økt fra biblioteket"
              >
                Velg økt
              </button>
            </div>
          </>
        );

      case 'S2_UNSCHEDULED':
        return (
          <>
            <div className="text-xs text-tier-text-tertiary mb-1 font-medium">I dag: {weeklyFocus}</div>
            <div className="text-base text-tier-navy font-semibold mb-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-tier-navy/10 text-tier-navy">Anbefalt</span>
              <span>
                {recommendedWorkout?.name} · {formatDuration(recommendedWorkout?.duration || 0)} ·{' '}
                {translateCategory(recommendedWorkout?.category || '')}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-tier-navy text-white rounded-lg text-base font-semibold cursor-pointer transition-all min-h-[44px] hover:bg-tier-navy/90"
                onClick={onStartWorkout}
                aria-label={`Start ${recommendedWorkout?.name} nå`}
              >
                <Play size={18} aria-hidden="true" />
                Start nå
              </button>
              <div className="relative">
                <button
                  className="inline-flex items-center justify-center gap-2 py-2 px-3 border border-tier-border-default rounded-lg text-sm font-medium cursor-pointer transition-all min-h-[36px] text-tier-text-secondary hover:bg-tier-surface-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRescheduleOptions(!showRescheduleOptions);
                  }}
                  aria-expanded={showRescheduleOptions}
                  aria-haspopup="menu"
                  aria-label="Planlegg tidspunkt"
                >
                  Planlegg
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
                {showRescheduleOptions && (
                  <div className="absolute top-full left-0 mt-1 bg-tier-white border border-tier-border-default rounded-lg shadow-lg overflow-hidden min-w-[160px] z-[60]" role="menu" aria-label="Planlegg tidspunkt">
                    {rescheduleOptions.map(({ label, option }) => (
                      <button
                        key={label}
                        className="block w-full py-3 px-4 text-left text-sm text-tier-navy cursor-pointer transition-colors hover:bg-tier-surface-base"
                        onClick={() => {
                          onReschedule(option);
                          setShowRescheduleOptions(false);
                        }}
                        role="menuitem"
                      >
                        Om {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'S1_SCHEDULED':
      case 'S0_DEFAULT':
      default:
        return (
          <>
            <div className="text-xs text-tier-text-tertiary mb-1 font-medium">I dag: {weeklyFocus}</div>
            <div className="text-base text-tier-navy font-semibold mb-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-tier-navy/10 text-tier-navy">Anbefalt</span>
              <span>
                {recommendedWorkout?.name} · {formatDuration(recommendedWorkout?.duration || 0)} ·{' '}
                {translateCategory(recommendedWorkout?.category || '')}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-tier-navy text-white rounded-lg text-base font-semibold cursor-pointer transition-all min-h-[44px] hover:bg-tier-navy/90"
                onClick={onStartWorkout}
                aria-label={`Start ${recommendedWorkout?.name} nå`}
              >
                <Play size={18} aria-hidden="true" />
                Start nå
              </button>
              <div className="relative">
                <button
                  className="inline-flex items-center justify-center gap-2 py-2 px-3 border border-tier-border-default rounded-lg text-sm font-medium cursor-pointer transition-all min-h-[36px] text-tier-text-secondary hover:bg-tier-surface-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRescheduleOptions(!showRescheduleOptions);
                  }}
                  aria-expanded={showRescheduleOptions}
                  aria-haspopup="menu"
                  aria-label="Utsett trening"
                >
                  Utsett
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
                {showRescheduleOptions && (
                  <div className="absolute top-full left-0 mt-1 bg-tier-white border border-tier-border-default rounded-lg shadow-lg overflow-hidden min-w-[160px] z-[60]" role="menu" aria-label="Utsett trening">
                    {rescheduleOptions.map(({ label, option }) => (
                      <button
                        key={label}
                        className="block w-full py-3 px-4 text-left text-sm text-tier-navy cursor-pointer transition-colors hover:bg-tier-surface-base"
                        onClick={() => {
                          onReschedule(option);
                          setShowRescheduleOptions(false);
                        }}
                        role="menuitem"
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      className="block w-full py-3 px-4 text-left text-sm text-tier-navy cursor-pointer transition-colors border-t border-tier-border-default hover:bg-tier-surface-base"
                      onClick={() => {
                        setShowRescheduleOptions(false);
                        onOpenTimePicker?.();
                      }}
                      role="menuitem"
                    >
                      Velg tidspunkt...
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div
      className=" bg-tier-white border-b border-tier-border-default p-4"
      role="region"
      aria-label="Dagens beslutning"
    >
      <div className="max-w-[800px] mx-auto">{renderContent()}</div>
    </div>
  );
};

export default DecisionAnchor;
