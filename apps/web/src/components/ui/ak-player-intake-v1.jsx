/**
 * Player Intake Form V1
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState } from 'react';
import { ClipboardList, Calendar, Target, TrendingUp, Clock, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft, Save, MessageSquare, BarChart3, Dumbbell, Brain, Flag, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../typography';

// Week 43 Test Results (would come from benchmark system)
const sampleTestResults = {
  driver: { ballSpeed: 158, clubSpeed: 110, carry: 265, rating: 'Good' },
  iron: { dispersion: 12, distanceControl: 78, rating: 'Needs Work' },
  shortGame: { proximity: 8.5, upAndDown: 62, rating: 'Good' },
  putting: { makeRate3to6: 72, makeRate6to10: 45, rating: 'Excellent' },
  physical: { mobility: 7, strength: 6, endurance: 8, rating: 'Good' },
  mental: { focus: 75, pressureResponse: 68, rating: 'Developing' }
};

// Form sections for Week 44 Intake
const intakeSections = [
  { id: 'season-review', title: 'Sesongoppsummering', icon: BarChart3 },
  { id: 'training-hours', title: 'Treningstimer 2025', icon: Clock },
  { id: 'test-reflection', title: 'Uke 43 Testresultater', icon: Target },
  { id: 'goals', title: 'Mål for 2026', icon: Flag },
  { id: 'planning', title: 'Grunnperiode Plan', icon: Calendar },
];

const InputField = ({ label, type = 'text', value, onChange, placeholder, unit, helpText }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ak-primary focus:border-ak-primary transition-all"
      />
      {unit && <span className="absolute right-3 top-2.5 text-gray-400 text-sm">{unit}</span>}
    </div>
    {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ak-primary focus:border-ak-primary transition-all resize-none"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ak-primary focus:border-ak-primary transition-all bg-white"
    >
      <option value="">Velg...</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const RatingBadge = ({ rating }) => {
  const colors = {
    'Excellent': 'bg-ak-primary/10 text-ak-primary',
    'Good': 'bg-ak-primary/10 text-ak-primary',
    'Developing': 'bg-amber-100 text-amber-700',
    'Needs Work': 'bg-red-100 text-red-700'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[rating] || 'bg-gray-100 text-gray-700'}`}>
      {rating}
    </span>
  );
};

const ProgressBar = ({ current, target, label }) => {
  const percentage = Math.min((current / target) * 100, 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{current} / {target} timer</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${percentage >= 100 ? 'bg-ak-primary/50' : percentage >= 75 ? 'bg-ak-primary/50' : 'bg-ak-status-warning'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Week 44 Intake Form Component
const IntakeForm = ({ onComplete, isSubmitting = false }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({
    // Season Review
    tournamentsPlayed: '',
    bestResult: '',
    avgScore: '',
    handicapStart: '',
    handicapEnd: '',
    seasonHighlight: '',
    biggestChallenge: '',
    
    // Training Hours
    totalHours: '',
    technicalHours: '',
    shortGameHours: '',
    puttingHours: '',
    physicalHours: '',
    mentalHours: '',
    onCourseHours: '',
    simulatorHours: '',
    
    // Test Reflection
    testStrengths: '',
    testWeaknesses: '',
    surprisingResult: '',
    focusArea: '',
    
    // Goals
    handicapGoal: '',
    scoringGoal: '',
    tournamentGoals: '',
    skillGoals: '',
    physicalGoals: '',
    mentalGoals: '',
    
    // Planning
    weeklyHoursTarget: '',
    priorityArea1: '',
    priorityArea2: '',
    priorityArea3: '',
    coachMeetingFrequency: '',
    additionalSupport: '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Season Review
        return (
          <div>
            <SubSectionTitle className="text-lg font-semibold text-gray-900 mb-4">Sesongoppsummering 2025</SubSectionTitle>
            <p className="text-gray-600 mb-6">La oss gjennomgå sesongen som var. Denne informasjonen hjelper oss å planlegge neste sesong.</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <InputField 
                label="Antall turneringer spilt" 
                type="number"
                value={formData.tournamentsPlayed}
                onChange={(v) => updateField('tournamentsPlayed', v)}
                placeholder="f.eks. 12"
              />
              <InputField 
                label="Beste turnering/plassering" 
                value={formData.bestResult}
                onChange={(v) => updateField('bestResult', v)}
                placeholder="f.eks. 3. plass NM U18"
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <InputField 
                label="Gjennomsnittsscore" 
                type="number"
                step="0.1"
                value={formData.avgScore}
                onChange={(v) => updateField('avgScore', v)}
                placeholder="f.eks. 74.5"
              />
              <InputField 
                label="Handicap start sesong" 
                type="number"
                step="0.1"
                value={formData.handicapStart}
                onChange={(v) => updateField('handicapStart', v)}
                placeholder="f.eks. 4.2"
              />
              <InputField 
                label="Handicap slutt sesong" 
                type="number"
                step="0.1"
                value={formData.handicapEnd}
                onChange={(v) => updateField('handicapEnd', v)}
                placeholder="f.eks. 2.8"
              />
            </div>

            <TextArea 
              label="Høydepunktet i sesongen" 
              value={formData.seasonHighlight}
              onChange={(v) => updateField('seasonHighlight', v)}
              placeholder="Beskriv ditt beste øyeblikk eller prestasjon denne sesongen..."
            />
            
            <TextArea 
              label="Største utfordring" 
              value={formData.biggestChallenge}
              onChange={(v) => updateField('biggestChallenge', v)}
              placeholder="Hva var vanskeligst å håndtere denne sesongen?"
            />
          </div>
        );

      case 1: // Training Hours
        return (
          <div>
            <SubSectionTitle className="text-lg font-semibold text-gray-900 mb-4">Treningstimer Sesong 2025</SubSectionTitle>
            <p className="text-gray-600 mb-6">Loggfør dine treningstimer fra sesongen. Vær så nøyaktig som mulig.</p>
            
            <div className="bg-ak-primary/5 rounded-xl p-4 mb-6">
              <InputField 
                label="Totalt antall treningstimer" 
                type="number"
                value={formData.totalHours}
                onChange={(v) => updateField('totalHours', v)}
                placeholder="f.eks. 450"
                unit="timer"
                helpText="Sum av alle treningsaktiviteter gjennom sesongen"
              />
            </div>

            <CardTitle className="font-medium text-gray-800 mb-3">Fordeling per kategori</CardTitle>
            <div className="grid md:grid-cols-2 gap-4">
              <InputField 
                label="Teknisk trening (full swing)" 
                type="number"
                value={formData.technicalHours}
                onChange={(v) => updateField('technicalHours', v)}
                placeholder="0"
                unit="timer"
              />
              <InputField 
                label="Kortspill (chipping, pitching, bunker)" 
                type="number"
                value={formData.shortGameHours}
                onChange={(v) => updateField('shortGameHours', v)}
                placeholder="0"
                unit="timer"
              />
              <InputField 
                label="Putting" 
                type="number"
                value={formData.puttingHours}
                onChange={(v) => updateField('puttingHours', v)}
                placeholder="0"
                unit="timer"
              />
              <InputField 
                label="Fysisk trening" 
                type="number"
                value={formData.physicalHours}
                onChange={(v) => updateField('physicalHours', v)}
                placeholder="0"
                unit="timer"
              />
              <InputField 
                label="Mental trening" 
                type="number"
                value={formData.mentalHours}
                onChange={(v) => updateField('mentalHours', v)}
                placeholder="0"
                unit="timer"
              />
              <InputField 
                label="Spill på bane" 
                type="number"
                value={formData.onCourseHours}
                onChange={(v) => updateField('onCourseHours', v)}
                placeholder="0"
                unit="timer"
              />
              <InputField 
                label="Simulator/Trackman økter" 
                type="number"
                value={formData.simulatorHours}
                onChange={(v) => updateField('simulatorHours', v)}
                placeholder="0"
                unit="timer"
              />
            </div>
          </div>
        );

      case 2: // Test Reflection
        return (
          <div>
            <SubSectionTitle className="text-lg font-semibold text-gray-900 mb-4">Uke 43 Testresultater - Refleksjon</SubSectionTitle>
            <p className="text-gray-600 mb-6">Dine testresultater fra Team Norway protokollen. La oss reflektere over hva de forteller oss.</p>
            
            {/* Display test results */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <CardTitle className="font-medium text-gray-800 mb-3">Dine resultater</CardTitle>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Driver</span>
                    <RatingBadge rating={sampleTestResults.driver.rating} />
                  </div>
                  <div className="text-sm text-gray-600">
                    {sampleTestResults.driver.ballSpeed} mph • {sampleTestResults.driver.carry} yards
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Jern</span>
                    <RatingBadge rating={sampleTestResults.iron.rating} />
                  </div>
                  <div className="text-sm text-gray-600">
                    Spredning: {sampleTestResults.iron.dispersion}y • Kontroll: {sampleTestResults.iron.distanceControl}%
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Kortspill</span>
                    <RatingBadge rating={sampleTestResults.shortGame.rating} />
                  </div>
                  <div className="text-sm text-gray-600">
                    Proximity: {sampleTestResults.shortGame.proximity}ft • U&D: {sampleTestResults.shortGame.upAndDown}%
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Putting</span>
                    <RatingBadge rating={sampleTestResults.putting.rating} />
                  </div>
                  <div className="text-sm text-gray-600">
                    3-6ft: {sampleTestResults.putting.makeRate3to6}% • 6-10ft: {sampleTestResults.putting.makeRate6to10}%
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Fysisk</span>
                    <RatingBadge rating={sampleTestResults.physical.rating} />
                  </div>
                  <div className="text-sm text-gray-600">
                    Mobilitet: {sampleTestResults.physical.mobility}/10 • Styrke: {sampleTestResults.physical.strength}/10
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Mentalt</span>
                    <RatingBadge rating={sampleTestResults.mental.rating} />
                  </div>
                  <div className="text-sm text-gray-600">
                    Fokus: {sampleTestResults.mental.focus}% •Press: {sampleTestResults.mental.pressureResponse}%
                  </div>
                </div>
              </div>
            </div>

            <TextArea 
              label="Hva ser du som dine styrker basert på testene?" 
              value={formData.testStrengths}
              onChange={(v) => updateField('testStrengths', v)}
              placeholder="Beskriv områdene du presterte best på..."
              rows={3}
            />
            
            <TextArea 
              label="Hvilke områder trenger mest arbeid?" 
              value={formData.testWeaknesses}
              onChange={(v) => updateField('testWeaknesses', v)}
              placeholder="Beskriv områdene med størst forbedringspotensial..."
              rows={3}
            />

            <TextArea 
              label="Var det noe som overrasket deg i resultatene?" 
              value={formData.surprisingResult}
              onChange={(v) => updateField('surprisingResult', v)}
              placeholder="Noe du ikke forventet, positivt eller negativt?"
              rows={2}
            />

            <SelectField 
              label="Hvilket område vil du prioritere først i grunnperioden?"
              value={formData.focusArea}
              onChange={(v) => updateField('focusArea', v)}
              options={[
                { value: 'driver', label: 'Driver / Langspill' },
                { value: 'iron', label: 'Jernspill' },
                { value: 'shortGame', label: 'Kortspill' },
                { value: 'putting', label: 'Putting' },
                { value: 'physical', label: 'Fysisk trening' },
                { value: 'mental', label: 'Mental trening' },
              ]}
            />
          </div>
        );

      case 3: // Goals
        return (
          <div>
            <SubSectionTitle className="text-lg font-semibold text-gray-900 mb-4">Mål for Sesong 2026</SubSectionTitle>
            <p className="text-gray-600 mb-6">Sett konkrete og målbare mål for neste sesong.</p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Tips:</strong> Gode mål er SMART - Spesifikke, Målbare, Ambisiøse men realistiske, Relevante og Tidsbundne.
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <InputField 
                label="Handicap-mål" 
                type="number"
                step="0.1"
                value={formData.handicapGoal}
                onChange={(v) => updateField('handicapGoal', v)}
                placeholder="f.eks. 1.5"
                helpText="Hvor vil du ha handicapet ved slutten av 2026?"
              />
              <InputField 
                label="Scoring-mål (gjennomsnitt)" 
                type="number"
                step="0.1"
                value={formData.scoringGoal}
                onChange={(v) => updateField('scoringGoal', v)}
                placeholder="f.eks. 72.0"
                helpText="Ønsket turneringsscore"
              />
            </div>

            <TextArea 
              label="Turneringsmål" 
              value={formData.tournamentGoals}
              onChange={(v) => updateField('tournamentGoals', v)}
              placeholder="Hvilke turneringer vil du spille? Plasseringsmål?"
              rows={3}
            />

            <TextArea 
              label="Tekniske/ferdighets-mål" 
              value={formData.skillGoals}
              onChange={(v) => updateField('skillGoals', v)}
              placeholder="Spesifikke forbedringer du ønsker å oppnå (f.eks. driving distance, GIR%, putt per runde...)"
              rows={3}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <TextArea 
                label="Fysiske mål" 
                value={formData.physicalGoals}
                onChange={(v) => updateField('physicalGoals', v)}
                placeholder="Styrke, mobilitet, utholdenhet..."
                rows={2}
              />
              <TextArea 
                label="Mentale mål" 
                value={formData.mentalGoals}
                onChange={(v) => updateField('mentalGoals', v)}
                placeholder="Fokus, rutiner, press-håndtering..."
                rows={2}
              />
            </div>
          </div>
        );

      case 4: // Planning
        return (
          <div>
            <SubSectionTitle className="text-lg font-semibold text-gray-900 mb-4">Grunnperiode Plan (Uke 45+)</SubSectionTitle>
            <p className="text-gray-600 mb-6">Planlegg strukturen for grunnperioden. Dette blir fundamentet for sesongen.</p>
            
            <div className="bg-ak-primary/5 rounded-xl p-4 mb-6">
              <CardTitle className="font-medium text-ak-primary mb-2">Grunnperioden starter uke 45</CardTitle>
              <p className="text-sm text-ak-primary">
                Fokus i grunnperioden er å bygge et solid fundament gjennom teknisk arbeid, fysisk trening og mental forberedelse. 
                Konkurransespill er nedprioritert.
              </p>
            </div>

            <InputField 
              label="Ukentlig treningsmål (timer)" 
              type="number"
              value={formData.weeklyHoursTarget}
              onChange={(v) => updateField('weeklyHoursTarget', v)}
              placeholder="f.eks. 15"
              unit="timer/uke"
              helpText="Realistisk timetall gitt skole/jobb og andre forpliktelser"
            />

            <CardTitle className="font-medium text-gray-800 mb-3 mt-6">Prioriterte fokusområder</CardTitle>
            <p className="text-sm text-gray-500 mb-3">Basert på dine testresultater og mål, velg tre hovedfokus for grunnperioden:</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <SelectField 
                label="Prioritet 1 (høyest)"
                value={formData.priorityArea1}
                onChange={(v) => updateField('priorityArea1', v)}
                options={[
                  { value: 'driver-distance', label: 'Driver - Distanse' },
                  { value: 'driver-accuracy', label: 'Driver - Presisjon' },
                  { value: 'iron-distance', label: 'Jern - Avstandskontroll' },
                  { value: 'iron-accuracy', label: 'Jern - Presisjon' },
                  { value: 'wedge-control', label: 'Wedge - Kontroll' },
                  { value: 'chipping', label: 'Chipping' },
                  { value: 'bunker', label: 'Bunkerspill' },
                  { value: 'putting-short', label: 'Putting - Korte' },
                  { value: 'putting-lag', label: 'Putting - Lag' },
                  { value: 'physical-strength', label: 'Fysisk - Styrke' },
                  { value: 'physical-mobility', label: 'Fysisk - Mobilitet' },
                  { value: 'mental-focus', label: 'Mental - Fokus' },
                  { value: 'mental-pressure', label: 'Mental - Press' },
                ]}
              />
              <SelectField 
                label="Prioritet 2"
                value={formData.priorityArea2}
                onChange={(v) => updateField('priorityArea2', v)}
                options={[
                  { value: 'driver-distance', label: 'Driver - Distanse' },
                  { value: 'driver-accuracy', label: 'Driver - Presisjon' },
                  { value: 'iron-distance', label: 'Jern - Avstandskontroll' },
                  { value: 'iron-accuracy', label: 'Jern - Presisjon' },
                  { value: 'wedge-control', label: 'Wedge - Kontroll' },
                  { value: 'chipping', label: 'Chipping' },
                  { value: 'bunker', label: 'Bunkerspill' },
                  { value: 'putting-short', label: 'Putting - Korte' },
                  { value: 'putting-lag', label: 'Putting - Lag' },
                  { value: 'physical-strength', label: 'Fysisk - Styrke' },
                  { value: 'physical-mobility', label: 'Fysisk - Mobilitet' },
                  { value: 'mental-focus', label: 'Mental - Fokus' },
                  { value: 'mental-pressure', label: 'Mental - Press' },
                ]}
              />
              <SelectField 
                label="Prioritet 3"
                value={formData.priorityArea3}
                onChange={(v) => updateField('priorityArea3', v)}
                options={[
                  { value: 'driver-distance', label: 'Driver - Distanse' },
                  { value: 'driver-accuracy', label: 'Driver - Presisjon' },
                  { value: 'iron-distance', label: 'Jern - Avstandskontroll' },
                  { value: 'iron-accuracy', label: 'Jern - Presisjon' },
                  { value: 'wedge-control', label: 'Wedge - Kontroll' },
                  { value: 'chipping', label: 'Chipping' },
                  { value: 'bunker', label: 'Bunkerspill' },
                  { value: 'putting-short', label: 'Putting - Korte' },
                  { value: 'putting-lag', label: 'Putting - Lag' },
                  { value: 'physical-strength', label: 'Fysisk - Styrke' },
                  { value: 'physical-mobility', label: 'Fysisk - Mobilitet' },
                  { value: 'mental-focus', label: 'Mental - Fokus' },
                  { value: 'mental-pressure', label: 'Mental - Press' },
                ]}
              />
            </div>

            <SelectField 
              label="Hvor ofte ønsker du trenermøter?"
              value={formData.coachMeetingFrequency}
              onChange={(v) => updateField('coachMeetingFrequency', v)}
              options={[
                { value: 'weekly', label: 'Ukentlig' },
                { value: 'biweekly', label: 'Annenhver uke' },
                { value: 'monthly', label: 'Månedlig' },
                { value: 'asneeded', label: 'Ved behov' },
              ]}
            />

            <TextArea 
              label="Er det noe annet du trenger støtte med?" 
              value={formData.additionalSupport}
              onChange={(v) => updateField('additionalSupport', v)}
              placeholder="Utstyr, logistikk, skole-tilpasninger, annet..."
              rows={2}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Progress header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle className="font-semibold text-gray-900">Uke 44 - Sesongplanlegging</SectionTitle>
          <span className="text-sm text-gray-500">Steg {currentSection + 1} av {intakeSections.length}</span>
        </div>
        <div className="flex gap-1">
          {intakeSections.map((section, idx) => (
            <div 
              key={section.id}
              className={`flex-1 h-2 rounded-full transition-all ${
                idx < currentSection ? 'bg-ak-primary/50' : 
                idx === currentSection ? 'bg-ak-primary-light' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {intakeSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setCurrentSection(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                  idx === currentSection 
                    ? 'bg-ak-primary/10 text-ak-primary font-medium' 
                    : idx < currentSection 
                      ? 'bg-ak-primary/5 text-ak-primary' 
                      : 'bg-white text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form content */}
      <div className="p-6">
        {renderSection()}
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
        <button
          onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
          disabled={currentSection === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            currentSection === 0 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Tilbake
        </button>
        
        {currentSection < intakeSections.length - 1 ? (
          <button
            onClick={() => setCurrentSection(prev => prev + 1)}
            className="flex items-center gap-2 px-6 py-2 bg-ak-primary text-white rounded-lg font-medium hover:bg-ak-primary-dark transition-all"
          >
            Neste
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onComplete(formData)}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              isSubmitting
                ? 'bg-ak-primary-light text-white cursor-not-allowed'
                : 'bg-ak-primary text-white hover:bg-ak-primary-dark'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sender inn...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Fullfør og lagre
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Follow-up Check-in Component
const FollowUpCheckIn = ({ playerData, weekNumber }) => {
  const [responses, setResponses] = useState({
    hoursCompleted: '',
    sessionsCompleted: 'all',
    missedSessions: '',
    substituteActivities: '',
    focusAreaProgress: '',
    challenges: '',
    wins: '',
    needsSupport: '',
    energyLevel: 5,
    motivationLevel: 5,
  });

  const updateResponse = (field, value) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  // Questions based on test results (iron needs work)
  const testBasedQuestions = [
    {
      area: 'Jernspill',
      rating: 'Needs Work',
      question: 'Du hadde "Needs Work" på jernspill i testene. Har du jobbet spesifikt med jernpresisjon denne uken?',
    },
    {
      area: 'Mental',
      rating: 'Developing', 
      question: 'Mental trening var et utviklingsområde. Har du gjennomført noen mentale øvelser (fokusøvelser, visualisering)?',
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-forest-600 to-forest-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <SectionTitle className="font-semibold text-white">Ukentlig Oppfølging</SectionTitle>
            <p className="text-ak-primary-light text-sm">Uke {weekNumber} • Grunnperioden</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Training Hours Check */}
        <div className="bg-ak-primary/5 rounded-xl p-4">
          <SubSectionTitle className="font-medium text-ak-primary mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Treningstimer denne uken
          </SubSectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ak-primary mb-1">
                Planlagt: 15 timer
              </label>
              <InputField 
                label="Faktisk gjennomført"
                type="number"
                value={responses.hoursCompleted}
                onChange={(v) => updateResponse('hoursCompleted', v)}
                placeholder="0"
                unit="timer"
              />
            </div>
            {responses.hoursCompleted && (
              <div className="flex items-center">
                <ProgressBar 
                  current={parseInt(responses.hoursCompleted) || 0} 
                  target={15} 
                  label="Måloppnåelse"
                />
              </div>
            )}
          </div>
        </div>

        {/* Session Completion */}
        <div>
          <SubSectionTitle className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-ak-primary" />
            Gjennomforte du de planlagte oktene?
          </SubSectionTitle>
          <div className="flex gap-3 mb-3">
            {['Ja, alle', 'De fleste', 'Noen', 'Nei'].map(option => (
              <button
                key={option}
                onClick={() => updateResponse('sessionsCompleted', option)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  responses.sessionsCompleted === option
                    ? 'border-ak-primary bg-ak-primary/5 text-ak-primary'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          
          {responses.sessionsCompleted !== 'Ja, alle' && (
            <>
              <TextArea 
                label="Hvilke økter ble ikke gjennomført?"
                value={responses.missedSessions}
                onChange={(v) => updateResponse('missedSessions', v)}
                placeholder="Beskriv hva som ble droppet og hvorfor..."
                rows={2}
              />
              <TextArea 
                label="Gjorde du noe annet i stedet?"
                value={responses.substituteActivities}
                onChange={(v) => updateResponse('substituteActivities', v)}
                placeholder="Andre aktiviteter eller trening du gjorde..."
                rows={2}
              />
            </>
          )}
        </div>

        {/* Test-based questions */}
        <div className="bg-amber-50 rounded-xl p-4">
          <SubSectionTitle className="font-medium text-amber-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Basert pa dine testresultater
          </SubSectionTitle>
          <div className="space-y-4">
            {testBasedQuestions.map((q, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-amber-200">
                <div className="flex items-start gap-2 mb-2">
                  <RatingBadge rating={q.rating} />
                  <span className="text-sm font-medium text-gray-700">{q.area}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{q.question}</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm rounded-lg bg-ak-primary/10 text-ak-primary hover:bg-ak-primary/20 transition-all">
                    Ja, fokusert på dette
                  </button>
                  <button className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                    Delvis
                  </button>
                  <button className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
                    Nei
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress on focus area */}
        <TextArea 
          label="Hvordan går det med ditt hovedfokusområde (Jernspill - Presisjon)?"
          value={responses.focusAreaProgress}
          onChange={(v) => updateResponse('focusAreaProgress', v)}
          placeholder="Beskriv fremgang, utfordringer, observasjoner..."
          rows={3}
        />

        {/* Energy and Motivation */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Energinivå denne uken (1-10)
            </label>
            <div className="flex gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => updateResponse('energyLevel', n)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    responses.energyLevel === n
                      ? 'bg-ak-primary text-white'
                      : n <= responses.energyLevel
                        ? 'bg-ak-primary/10 text-ak-primary'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivasjonsnivå (1-10)
            </label>
            <div className="flex gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => updateResponse('motivationLevel', n)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    responses.motivationLevel === n
                      ? 'bg-ak-primary text-white'
                      : n <= responses.motivationLevel
                        ? 'bg-ak-primary/10 text-ak-primary'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wins and Challenges */}
        <div className="grid md:grid-cols-2 gap-4">
          <TextArea
            label="Ukens seier (noe du er fornoyd med)"
            value={responses.wins}
            onChange={(v) => updateResponse('wins', v)}
            placeholder="Hva gikk bra denne uken?"
            rows={2}
          />
          <TextArea
            label="Ukens utfordring"
            value={responses.challenges}
            onChange={(v) => updateResponse('challenges', v)}
            placeholder="Hva var vanskelig?"
            rows={2}
          />
        </div>

        <TextArea 
          label="Trenger du noe fra treneren denne uken?"
          value={responses.needsSupport}
          onChange={(v) => updateResponse('needsSupport', v)}
          placeholder="Ekstra økt, videoanalyse, samtale, annet..."
          rows={2}
        />

        <button className="w-full py-3 bg-ak-primary text-white rounded-xl font-medium hover:bg-ak-primary-dark transition-all flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          Send inn ukerapport
        </button>
      </div>
    </div>
  );
};

/**
 * Transform frontend form data to backend API format
 */
const transformFormDataToAPI = (formData, playerId) => {
  // Map form data to backend schema
  return {
    playerId,
    background: {
      yearsPlaying: parseInt(formData.tournamentsPlayed) || 0, // Approximate from tournaments
      currentHandicap: parseFloat(formData.handicapEnd) || 20,
      averageScore: parseFloat(formData.avgScore) || 80,
      roundsPerYear: parseInt(formData.tournamentsPlayed) * 4 || 20, // Estimate rounds from tournaments
      trainingHistory: formData.totalHours > 300 ? 'systematic' : formData.totalHours > 150 ? 'regular' : 'sporadic',
    },
    availability: {
      hoursPerWeek: parseFloat(formData.weeklyHoursTarget) || 10,
      preferredDays: [1, 2, 3, 4, 5], // Default weekdays
      canTravelToFacility: true,
      hasHomeEquipment: formData.simulatorHours > 0,
    },
    goals: {
      primaryGoal: formData.tournamentGoals ? 'compete_tournaments' : 'lower_handicap',
      targetHandicap: parseFloat(formData.handicapGoal) || undefined,
      targetScore: parseFloat(formData.scoringGoal) || undefined,
      timeframe: '12_months',
      specificFocus: [formData.priorityArea1, formData.priorityArea2, formData.priorityArea3].filter(Boolean),
    },
    weaknesses: {
      biggestFrustration: formData.biggestChallenge || 'Not specified',
      problemAreas: [formData.focusArea, formData.testWeaknesses].filter(Boolean),
      mentalChallenges: formData.mentalGoals ? [formData.mentalGoals] : [],
    },
    health: {
      currentInjuries: [],
      injuryHistory: [],
      ageGroup: '25-35', // Default - would need to add age field to form
    },
    lifestyle: {
      workSchedule: 'flexible',
      stressLevel: 3,
      sleepQuality: 4,
      nutritionFocus: false,
      physicalActivity: formData.physicalHours > 50 ? 'active' : 'moderate',
    },
    equipment: {
      hasDriverSpeedMeasurement: formData.simulatorHours > 0,
      recentClubFitting: false,
      accessToTrackMan: formData.simulatorHours > 0,
      accessToGym: formData.physicalHours > 0,
      willingToInvest: 'moderate',
    },
    learning: {
      preferredStyle: 'visual',
      wantsDetailedExplanations: true,
      prefersStructure: true,
      motivationType: formData.tournamentGoals ? 'competition' : 'personal_growth',
    },
  };
};

// Main App Component
export default function PlayerIntakeSystem() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('intake');
  const [intakeComplete, setIntakeComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [intakeId, setIntakeId] = useState(null);

  const handleIntakeComplete = async (formData) => {
    if (!user?.playerId) {
      setSubmitError('Kunne ikke finne spillerprofil. Vennligst logg inn på nytt.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Transform and submit intake data
      const apiData = transformFormDataToAPI(formData, user.playerId);
      const response = await apiClient.post('/intake', apiData);

      if (response.data.success) {
        setIntakeId(response.data.data.id);
        setIntakeComplete(true);
        setActiveView('followup');
      } else {
        setSubmitError(response.data.error?.message || 'Noe gikk galt ved innsending');
      }
    } catch (error) {
      setSubmitError(
        error.response?.data?.error?.message ||
        'Kunne ikke sende inn skjemaet. Prøv igjen senere.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-forest-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-ak-primary rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <PageTitle className="text-2xl font-bold text-gray-900">TIER Golf</PageTitle>
              <p className="text-gray-500">Player Intake & Follow-up System</p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveView('intake')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'intake'
                ? 'bg-ak-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Uke 44 Intake
          </button>
          <button
            onClick={() => setActiveView('followup')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeView === 'followup'
                ? 'bg-ak-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Ukentlig Oppfølging
          </button>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <SubSectionTitle className="font-medium text-red-800">Feil ved innsending</SubSectionTitle>
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {activeView === 'intake' ? (
          intakeComplete ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-ak-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-ak-primary" />
              </div>
              <SectionTitle className="text-xl font-semibold text-gray-900 mb-2">Intake fullført!</SectionTitle>
              <p className="text-gray-600 mb-4">
                Takk for at du fylte ut sesongplanleggingen. Din trener vil gjennomgå svarene og ta kontakt.
              </p>
              <button
                onClick={() => { setIntakeComplete(false); setSubmitError(null); }}
                className="text-ak-primary hover:underline"
              >
                Se gjennom svarene
              </button>
            </div>
          ) : (
            <IntakeForm onComplete={handleIntakeComplete} isSubmitting={isSubmitting} />
          )
        ) : (
          <FollowUpCheckIn weekNumber={46} />
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          TIER Golf Group AS • Fredrikstad • Team Norway Protocol
        </div>
      </div>
    </div>
  );
}
