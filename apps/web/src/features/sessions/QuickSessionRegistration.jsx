/**
 * QuickSessionRegistration.jsx
 * Design System v3.0 - Premium Light
 *
 * FASE 6.4: Hurtigregistrering av uplanlagte treningsøkter
 *
 * Features:
 * - Simplified registration without L-fase, categories
 * - Teknisk oppgave dropdown (from P-system)
 * - Quick pyramid selection
 * - Duration and notes
 * - List of unregistered sessions
 */

import React, { useState } from 'react';
import { Clock, Save, AlertCircle, CheckCircle, Target, X } from 'lucide-react';
import { TrainingPyramidSelector } from './components/TrainingPyramidSelector';
import { DurationSlider } from './components/DurationSlider';
import Button from '../../ui/primitives/Button';
import { PageTitle, SubSectionTitle } from '../../components/typography';

// ============================================================================
// MOCK DATA - Will be replaced with API data
// ============================================================================

const MOCK_UNREGISTERED_SESSIONS = [
  {
    id: 'u1',
    sessionDate: '2025-01-10T14:00:00',
    location: 'Miklagard Golf',
    pyramidCategory: 'SLAG',
    estimatedDuration: 60,
  },
  {
    id: 'u2',
    sessionDate: '2025-01-09T16:00:00',
    location: 'Range',
    pyramidCategory: 'TEK',
    estimatedDuration: 45,
  },
  {
    id: 'u3',
    sessionDate: '2025-01-08T10:00:00',
    location: 'Gym',
    pyramidCategory: 'FYS',
    estimatedDuration: 90,
  },
];

const MOCK_TECHNICAL_TASKS = [
  { id: 'p1', level: 'P1.0', description: 'Posture & setup' },
  { id: 'p2', level: 'P2.0', description: 'Backswing plane' },
  { id: 'p3', level: 'P3.0', description: 'Top position' },
  { id: 'p4', level: 'P4.0', description: 'Transition' },
  { id: 'p5', level: 'P5.0', description: 'Impact position' },
];

// ============================================================================
// PYRAMID CONFIG
// ============================================================================

const PYRAMID_CONFIG = {
  FYS: { label: 'Fysisk', color: 'rgb(255, 87, 34)', bgColor: 'rgba(255, 87, 34, 0.1)' },
  TEK: { label: 'Teknikk', color: 'rgb(156, 39, 176)', bgColor: 'rgba(156, 39, 176, 0.1)' },
  SLAG: { label: 'Golfslag', color: 'rgb(76, 175, 80)', bgColor: 'rgba(76, 175, 80, 0.1)' },
  SPILL: { label: 'Spill', color: 'rgb(33, 150, 243)', bgColor: 'rgba(33, 150, 243, 0.1)' },
  TURN: { label: 'Turnering', color: 'rgb(255, 193, 7)', bgColor: 'rgba(255, 193, 7, 0.1)' },
};

// ============================================================================
// UNREGISTERED SESSION CARD
// ============================================================================

const UnregisteredSessionCard = ({ session, onRegister }) => {
  const config = PYRAMID_CONFIG[session.pyramidCategory];
  const sessionDate = new Date(session.sessionDate);
  const daysAgo = Math.floor((Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-tier-white rounded-xl p-4 border-2 border-tier-border-default hover:border-tier-navy/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: config.bgColor }}
          >
            <span className="text-sm font-bold" style={{ color: config.color }}>
              {session.pyramidCategory}
            </span>
          </div>
          <div>
            <div className="text-sm font-semibold text-tier-navy">
              {config.label} økt
            </div>
            <div className="text-xs text-tier-text-secondary">
              {sessionDate.toLocaleDateString('nb-NO', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
        <span className="text-xs text-tier-error bg-tier-error/10 py-1 px-2 rounded">
          {daysAgo} dag{daysAgo !== 1 ? 'er' : ''} siden
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-tier-text-secondary mb-3">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {session.estimatedDuration} min
        </span>
        <span>{session.location}</span>
      </div>

      <Button
        variant="primary"
        onClick={() => onRegister(session)}
        className="w-full text-sm"
      >
        <CheckCircle size={14} className="mr-1" />
        Registrer økt
      </Button>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const QuickSessionRegistration = ({ onClose, onSave }) => {
  const [step, setStep] = useState(1); // 1: Type, 2: Details
  const [formData, setFormData] = useState({
    pyramidCategory: '',
    sessionDate: new Date().toISOString().split('T')[0],
    sessionTime: new Date().toTimeString().slice(0, 5),
    duration: 30,
    location: '',
    technicalTask: '',
    notes: '',
    evaluationEnergy: 5,
    evaluationFocus: 5,
  });
  const [showUnregistered, setShowUnregistered] = useState(true);
  const [unregisteredSessions] = useState(MOCK_UNREGISTERED_SESSIONS);
  const [isSaving, setIsSaving] = useState(false);

  const handlePyramidSelect = (category) => {
    setFormData({ ...formData, pyramidCategory: category });
    setStep(2);
  };

  const handleRegisterUnregistered = (session) => {
    setFormData({
      ...formData,
      pyramidCategory: session.pyramidCategory,
      sessionDate: session.sessionDate.split('T')[0],
      sessionTime: new Date(session.sessionDate).toTimeString().slice(0, 5),
      duration: session.estimatedDuration,
      location: session.location,
    });
    setShowUnregistered(false);
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsSaving(true);

    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (onSave) {
      onSave(formData);
    }

    setIsSaving(false);
  };

  const selectedConfig = formData.pyramidCategory ? PYRAMID_CONFIG[formData.pyramidCategory] : null;

  return (
    <div className="min-h-screen bg-tier-surface-base pb-20">
      {/* Header */}
      <div className="bg-tier-white border-b border-tier-border-default sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <PageTitle style={{ marginBottom: 0 }}>Hurtigregistrering av økt</PageTitle>
            <p className="text-sm text-tier-text-secondary">
              Rask registrering av uplanlagt treningsøkt
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-tier-surface-base transition-colors"
            >
              <X size={20} className="text-tier-text-secondary" />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Unregistered Sessions List */}
        {showUnregistered && unregisteredSessions.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={20} className="text-amber-600" />
              <SubSectionTitle className="text-base font-semibold text-amber-900 m-0">
                Uregistrerte økter ({unregisteredSessions.length})
              </SubSectionTitle>
            </div>
            <p className="text-sm text-amber-800 mb-4">
              Du har {unregisteredSessions.length} økt{unregisteredSessions.length !== 1 ? 'er' : ''} som ikke er registrert.
              Registrer disse for å holde treningsdagboken oppdatert.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unregisteredSessions.map((session) => (
                <UnregisteredSessionCard
                  key={session.id}
                  session={session}
                  onRegister={handleRegisterUnregistered}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Pyramid Selection */}
        {step === 1 && (
          <div className="bg-tier-white rounded-2xl p-6">
            <SubSectionTitle className="text-base font-semibold text-tier-navy mb-1">
              VELG TYPE ØKT
            </SubSectionTitle>
            <p className="text-sm text-tier-text-secondary mb-6">
              Velg treningskategori fra pyramiden
            </p>

            <TrainingPyramidSelector
              selected={formData.pyramidCategory}
              onSelect={handlePyramidSelect}
            />
          </div>
        )}

        {/* Step 2: Quick Details */}
        {step === 2 && selectedConfig && (
          <>
            {/* Selected Category Header */}
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ backgroundColor: selectedConfig.bgColor }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: selectedConfig.color }}
              >
                <span className="text-lg font-bold text-white">
                  {formData.pyramidCategory}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-base font-bold" style={{ color: selectedConfig.color }}>
                  {selectedConfig.label}
                </div>
                <div className="text-sm opacity-80" style={{ color: selectedConfig.color }}>
                  Hurtigregistrering
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-sm underline"
                style={{ color: selectedConfig.color }}
              >
                Endre
              </button>
            </div>

            {/* Date & Time */}
            <div className="bg-tier-white rounded-2xl p-6">
              <SubSectionTitle className="text-base font-semibold text-tier-navy mb-4">
                DATO & TID
              </SubSectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-tier-text-secondary mb-2 block">
                    Dato
                  </label>
                  <input
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-tier-border-default focus:border-tier-navy outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-tier-text-secondary mb-2 block">
                    Tid
                  </label>
                  <input
                    type="time"
                    value={formData.sessionTime}
                    onChange={(e) => setFormData({ ...formData, sessionTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-tier-border-default focus:border-tier-navy outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-tier-white rounded-2xl p-6">
              <SubSectionTitle className="text-base font-semibold text-tier-navy mb-4">
                VARIGHET
              </SubSectionTitle>
              <DurationSlider
                value={formData.duration}
                onChange={(value) => setFormData({ ...formData, duration: value })}
              />
            </div>

            {/* Location */}
            <div className="bg-tier-white rounded-2xl p-6">
              <SubSectionTitle className="text-base font-semibold text-tier-navy mb-4">
                LOKASJON
              </SubSectionTitle>
              <input
                type="text"
                placeholder="F.eks. Range, Bane, Gym..."
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-tier-border-default focus:border-tier-navy outline-none"
              />
            </div>

            {/* Technical Task (P-system) */}
            <div className="bg-tier-white rounded-2xl p-6">
              <SubSectionTitle className="text-base font-semibold text-tier-navy mb-1">
                TEKNISK OPPGAVE (VALGFRITT)
              </SubSectionTitle>
              <p className="text-xs text-tier-text-secondary mb-4">
                Velg teknisk oppgave fra din tekniske plan
              </p>
              <select
                value={formData.technicalTask}
                onChange={(e) => setFormData({ ...formData, technicalTask: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-tier-border-default focus:border-tier-navy outline-none appearance-none bg-white"
              >
                <option value="">Ingen teknisk oppgave</option>
                {MOCK_TECHNICAL_TASKS.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.level} - {task.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="bg-tier-white rounded-2xl p-6">
              <SubSectionTitle className="text-base font-semibold text-tier-navy mb-4">
                NOTATER (VALGFRITT)
              </SubSectionTitle>
              <textarea
                placeholder="Beskriv økten, fokusområder, følelser..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-tier-border-default focus:border-tier-navy outline-none resize-none"
              />
            </div>

            {/* Evaluation */}
            <div className="bg-tier-white rounded-2xl p-6">
              <SubSectionTitle className="text-base font-semibold text-tier-navy mb-4">
                EVALUERING
              </SubSectionTitle>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-tier-text-secondary mb-2 block">
                    Energinivå: {formData.evaluationEnergy}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.evaluationEnergy}
                    onChange={(e) => setFormData({ ...formData, evaluationEnergy: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-tier-text-secondary mb-2 block">
                    Fokus: {formData.evaluationFocus}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.evaluationFocus}
                    onChange={(e) => setFormData({ ...formData, evaluationFocus: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-tier-navy/5 rounded-xl p-4 border border-tier-navy/10">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-tier-navy mt-0.5 flex-shrink-0" />
                <div className="text-xs text-tier-text-secondary">
                  <strong className="text-tier-navy">Hurtigregistrering:</strong> Dette er en forenklet
                  registrering. For detaljert logging med L-fase, miljø og belastning, bruk
                  "Planlegg ny økt" funksjonen.
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      {step === 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-tier-white border-t border-tier-border-default p-4">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <Button
              variant="secondary"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Tilbake
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSaving || !formData.pyramidCategory}
              className="flex-1"
            >
              {isSaving ? (
                <>Lagrer...</>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Lagre økt
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickSessionRegistration;
