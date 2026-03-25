/**
 * TIER Golf - AI Plan Suggestions Component
 * Design System v3.0 - Premium Light
 *
 * Provides AI-generated training plan suggestions for coaches.
 * Uses the AI service to analyze player data and generate recommendations.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useCallback } from 'react';
import { Sparkles, Target, Calendar, TrendingUp, Loader2, AlertCircle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { getPlanSuggestions, PlanSuggestionResponse } from '../../services/aiService';
import { SubSectionTitle } from '../../components/typography/Headings';

interface Props {
  playerId: string;
  playerName?: string;
  onApplySuggestion?: (suggestion: SuggestionToApply) => void;
}

export interface SuggestionToApply {
  type: 'session';
  name: string;
  description: string;
  durationMinutes: number;
}

const getPriorityClasses = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return { bg: 'bg-tier-error/10', text: 'text-tier-error', border: 'border-tier-error' };
    case 'medium':
      return { bg: 'bg-tier-warning/10', text: 'text-tier-warning', border: 'border-tier-warning' };
    case 'low':
      return { bg: 'bg-tier-success/10', text: 'text-tier-success', border: 'border-tier-success' };
  }
};

export default function AIPlanSuggestions({ playerId, playerName = 'Spiller', onApplySuggestion }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<PlanSuggestionResponse | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    focus: true,
    structure: true,
    periodization: false,
  });

  // Form state
  const [weeklyHours, setWeeklyHours] = useState('');
  const [goalDescription, setGoalDescription] = useState('');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getPlanSuggestions({
        playerId,
        weeklyHoursTarget: weeklyHours ? parseFloat(weeklyHours) : undefined,
        goalDescription: goalDescription.trim() || undefined,
      });
      setSuggestions(response);
    } catch (err) {
      console.error('Failed to get AI suggestions:', err);
      setError('Kunne ikke hente AI-forslag. Prøv igjen senere.');
    } finally {
      setIsLoading(false);
    }
  }, [playerId, weeklyHours, goalDescription]);

  const handleApplySession = (session: { type: string; frequency: string; duration: string }) => {
    if (!onApplySuggestion) return;

    const durationMatch = session.duration.match(/(\d+)/);
    const durationMinutes = durationMatch ? parseInt(durationMatch[1], 10) : 60;

    onApplySuggestion({
      type: 'session',
      name: session.type,
      description: `${session.frequency}. AI-anbefalt økt.`,
      durationMinutes,
    });
  };

  return (
    <div className="bg-tier-white rounded-2xl shadow-tier-white overflow-hidden border border-tier-navy/20">
      {/* Header */}
      <div className="p-5 border-b border-tier-border-default bg-gradient-to-br from-tier-navy/5 to-tier-navy/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-tier-navy/10 flex items-center justify-center">
            <Sparkles size={20} className="text-tier-navy" />
          </div>
          <div>
            <SubSectionTitle style={{ marginBottom: 0 }}>
              AI Treningsassistent
            </SubSectionTitle>
            <p className="m-0 mt-0.5 text-[13px] text-tier-text-secondary">
              Få personlige anbefalinger for {playerName}
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="p-5 border-b border-tier-border-default">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-tier-text-secondary block mb-2">
              Timer per uke (valgfritt)
            </label>
            <input
              type="number"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(e.target.value)}
              placeholder="F.eks. 10"
              min="1"
              max="40"
              className="w-full py-2.5 px-3 rounded-lg border border-tier-border-default text-sm text-tier-navy bg-tier-white box-border outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-tier-text-secondary block mb-2">
              Mål (valgfritt)
            </label>
            <input
              type="text"
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="F.eks. Forbedre putting"
              className="w-full py-2.5 px-3 rounded-lg border border-tier-border-default text-sm text-tier-navy bg-tier-white box-border outline-none"
            />
          </div>
        </div>

        <button
          onClick={fetchSuggestions}
          disabled={isLoading}
          className={`mt-4 w-full py-3 rounded-lg border-none text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            isLoading
              ? 'bg-tier-border-default text-tier-text-secondary cursor-not-allowed'
              : 'bg-tier-navy text-tier-white cursor-pointer'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyserer spillerdata...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generer AI-forslag
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 my-4 py-3 px-4 rounded-lg bg-tier-error/10 border border-tier-error flex items-center gap-2">
          <AlertCircle size={16} className="text-tier-error" />
          <span className="text-sm text-tier-error">{error}</span>
        </div>
      )}

      {/* Results */}
      {suggestions && (
        <div className="px-5 pb-5">
          {/* Summary */}
          <div className="p-4 mt-4 rounded-lg bg-tier-surface-base border border-tier-border-default">
            <p className="m-0 text-sm leading-relaxed text-tier-navy">
              {suggestions.summary}
            </p>
          </div>

          {/* Focus Areas */}
          <div className="mt-5">
            <button
              onClick={() => toggleSection('focus')}
              className="w-full flex items-center justify-between py-3 bg-transparent border-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Target size={18} className="text-tier-navy" />
                <span className="text-[15px] font-semibold text-tier-navy">
                  Fokusområder ({suggestions.suggestedFocus.length})
                </span>
              </div>
              {expandedSections.focus ? (
                <ChevronUp size={18} className="text-tier-text-secondary" />
              ) : (
                <ChevronDown size={18} className="text-tier-text-secondary" />
              )}
            </button>

            {expandedSections.focus && (
              <div className="flex flex-col gap-3">
                {suggestions.suggestedFocus.map((focus, index) => {
                  const classes = getPriorityClasses(focus.priority);
                  return (
                    <div
                      key={index}
                      className={`py-3.5 px-4 rounded-lg ${classes.bg} border-l-[3px] ${classes.border}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-tier-navy">
                          {focus.area}
                        </span>
                        <span className={`text-[11px] font-semibold uppercase ${classes.text}`}>
                          {focus.priority === 'high' ? 'Høy' : focus.priority === 'medium' ? 'Medium' : 'Lav'} prioritet
                        </span>
                      </div>
                      <p className="m-0 mt-2 text-[13px] text-tier-text-secondary leading-relaxed">
                        {focus.reason}
                      </p>
                      <div className="mt-2 text-xs text-tier-text-secondary">
                        Anbefalt: {focus.suggestedHoursPerWeek} timer/uke
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly Structure */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('structure')}
              className="w-full flex items-center justify-between py-3 bg-transparent border-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-tier-navy" />
                <span className="text-[15px] font-semibold text-tier-navy">
                  Ukestruktur ({suggestions.weeklyStructure.recommendedDays} dager/uke)
                </span>
              </div>
              {expandedSections.structure ? (
                <ChevronUp size={18} className="text-tier-text-secondary" />
              ) : (
                <ChevronDown size={18} className="text-tier-text-secondary" />
              )}
            </button>

            {expandedSections.structure && (
              <div className="flex flex-col gap-2.5">
                {suggestions.weeklyStructure.sessionTypes.map((session, index) => (
                  <div
                    key={index}
                    className="py-3 px-4 rounded-lg bg-tier-surface-base border border-tier-border-default flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-tier-navy">
                        {session.type}
                      </div>
                      <div className="text-xs text-tier-text-secondary mt-0.5">
                        {session.frequency} • {session.duration}
                      </div>
                    </div>
                    {onApplySuggestion && (
                      <button
                        onClick={() => handleApplySession(session)}
                        className="py-1.5 px-3 rounded border border-tier-navy bg-transparent text-tier-navy text-xs font-medium cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} />
                        Legg til
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Periodization */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('periodization')}
              className="w-full flex items-center justify-between py-3 bg-transparent border-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-tier-navy" />
                <span className="text-[15px] font-semibold text-tier-navy">
                  Periodisering
                </span>
              </div>
              {expandedSections.periodization ? (
                <ChevronUp size={18} className="text-tier-text-secondary" />
              ) : (
                <ChevronDown size={18} className="text-tier-text-secondary" />
              )}
            </button>

            {expandedSections.periodization && (
              <div className="p-4 rounded-lg bg-tier-surface-base border border-tier-border-default">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-tier-navy">
                      {suggestions.periodization.baseWeeks}
                    </div>
                    <div className="text-xs text-tier-text-secondary">Base uker</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-tier-warning">
                      {suggestions.periodization.buildWeeks}
                    </div>
                    <div className="text-xs text-tier-text-secondary">Build uker</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-tier-success">
                      {suggestions.periodization.peakWeeks}
                    </div>
                    <div className="text-xs text-tier-text-secondary">Peak uker</div>
                  </div>
                </div>
                <p className="m-0 text-[13px] leading-relaxed text-tier-text-secondary">
                  {suggestions.periodization.rationale}
                </p>
              </div>
            )}
          </div>

          {/* Tools Used */}
          {suggestions.toolsUsed.length > 0 && (
            <div className="mt-5 py-3 px-4 rounded-lg bg-tier-navy/5 text-xs text-tier-text-secondary">
              <strong>Data brukt:</strong> {suggestions.toolsUsed.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
