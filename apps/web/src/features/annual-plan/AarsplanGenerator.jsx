import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Target, Clock, Trophy, ChevronRight, ChevronLeft,
  Check, Plus, X, Loader2, Sparkles, CheckCircle, ArrowRight
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography/Headings';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import { toast } from 'sonner';

// ============================================================================
// STEP INDICATOR
// ============================================================================

const StepIndicator = ({ currentStep, totalSteps, steps }) => (
  <div className="flex justify-center gap-2 mb-8">
    {steps.map((step, index) => {
      const isActive = index === currentStep;
      const isCompleted = index < currentStep;
      const isHighlighted = isCompleted || isActive;

      return (
        <div key={index} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              isHighlighted ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary'
            }`}
          >
            {isCompleted ? <Check size={16} /> : index + 1}
          </div>
          <span
            className={`text-sm ${isActive ? 'font-semibold text-text-primary' : 'font-normal text-text-secondary'}`}
          >
            {step.label}
          </span>
          {index < totalSteps - 1 && (
            <div
              className={`w-10 h-0.5 ml-2 ${isCompleted ? 'bg-accent' : 'bg-border-default'}`}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ============================================================================
// FORM CARD
// ============================================================================

const FormCard = ({ children, title, subtitle, icon: Icon }) => (
  <div className="rounded-2xl p-6 shadow-sm bg-bg-primary border border-default">
    {title && (
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          {Icon && <Icon size={24} color="var(--accent)" />}
          <SubSectionTitle style={{ marginBottom: 0 }}>
            {title}
          </SubSectionTitle>
        </div>
        {subtitle && (
          <p className={`text-sm m-0 text-text-secondary ${Icon ? 'ml-9' : ''}`}>
            {subtitle}
          </p>
        )}
      </div>
    )}
    {children}
  </div>
);

// ============================================================================
// INPUT COMPONENTS
// ============================================================================

const InputField = ({ label, type = 'text', value, onChange, placeholder, min, max, step, required }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1.5 text-text-primary">
      {label} {required && <span className="text-danger">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      required={required}
      className="w-full py-3 px-3.5 rounded-lg text-base outline-none transition-colors border border-default bg-bg-primary text-text-primary"
    />
  </div>
);

const DaySelector = ({ selectedDays, onChange }) => {
  const days = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' },
  ];

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter(d => d !== day));
    } else {
      onChange([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {days.map(day => {
        const isSelected = selectedDays.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            onClick={() => toggleDay(day.value)}
            className={`py-3 px-4 rounded-lg text-sm cursor-pointer transition-all min-w-[52px] ${
              isSelected
                ? 'border-2 border-accent bg-accent-muted text-accent font-semibold'
                : 'border border-default bg-bg-primary text-text-primary font-normal'
            }`}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// TOURNAMENT LIST
// ============================================================================

const TournamentList = ({ tournaments, onAdd, onRemove }) => {
  const [showForm, setShowForm] = useState(false);
  const [newTournament, setNewTournament] = useState({
    name: '',
    startDate: '',
    endDate: '',
    importance: 'B',
  });

  const handleAdd = () => {
    if (newTournament.name && newTournament.startDate) {
      onAdd({
        ...newTournament,
        endDate: newTournament.endDate || newTournament.startDate,
      });
      setNewTournament({ name: '', startDate: '', endDate: '', importance: 'B' });
      setShowForm(false);
    }
  };

  // Map importance to semantic class strings
  const importanceStyles = {
    A: { classes: 'bg-danger-muted text-danger', iconColor: 'var(--status-error)', label: 'A - Main Goal' },
    B: { classes: 'bg-warning-muted text-warning', iconColor: 'var(--status-warning)', label: 'B - Important' },
    C: { classes: 'bg-success-muted text-success', iconColor: 'var(--status-success)', label: 'C - Preparation' },
  };

  return (
    <div>
      {/* Existing tournaments */}
      {tournaments.length > 0 && (
        <div className="flex flex-col gap-2.5 mb-4">
          {tournaments.map((t, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 px-4 rounded-lg bg-bg-secondary border border-default"
            >
              <div className="flex items-center gap-3">
                <Trophy size={18} color={importanceStyles[t.importance].iconColor} />
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    {t.name}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {new Date(t.startDate).toLocaleDateString('en-US')}
                    {t.endDate !== t.startDate && ` - ${new Date(t.endDate).toLocaleDateString('en-US')}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`py-1 px-2 rounded-md text-xs font-semibold ${importanceStyles[t.importance].classes}`}
                >
                  {t.importance}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="p-1.5 rounded-md border-none bg-transparent cursor-pointer text-text-secondary"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add tournament form */}
      {showForm ? (
        <div className="p-4 rounded-xl bg-bg-secondary border border-default">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <InputField
              label="Tournament name"
              value={newTournament.name}
              onChange={(v) => setNewTournament({ ...newTournament, name: v })}
              placeholder="e.g. National Championship"
              required
            />
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Importance
              </label>
              <select
                value={newTournament.importance}
                onChange={(e) => setNewTournament({ ...newTournament, importance: e.target.value })}
                className="w-full py-3 px-3.5 rounded-lg text-base border border-default bg-bg-primary"
              >
                <option value="A">A - Main Goal</option>
                <option value="B">B - Important</option>
                <option value="C">C - Preparation</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <InputField
              label="Start date"
              type="date"
              value={newTournament.startDate}
              onChange={(v) => setNewTournament({ ...newTournament, startDate: v })}
              required
            />
            <InputField
              label="End date"
              type="date"
              value={newTournament.endDate}
              onChange={(v) => setNewTournament({ ...newTournament, endDate: v })}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newTournament.name || !newTournament.startDate}
              className="flex-1 py-2.5 px-4 rounded-lg border-none text-sm font-medium cursor-pointer text-white bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="py-2.5 px-4 rounded-lg text-sm cursor-pointer border border-default bg-bg-primary text-text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-transparent text-sm cursor-pointer transition-all border-2 border-dashed border-default text-text-secondary"
        >
          <Plus size={18} />
          Add tournament
        </button>
      )}
    </div>
  );
};

// ============================================================================
// STEP CONTENT COMPONENTS
// ============================================================================

const Step1Basics = ({ formData, setFormData }) => (
  <div className="grid gap-6">
    <FormCard
      title="Basic information"
      subtitle="Start by specifying when the plan should start and your current level"
      icon={Calendar}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <InputField
          label="Plan start date"
          type="date"
          value={formData.startDate}
          onChange={(v) => setFormData({ ...formData, startDate: v })}
          required
        />
        <InputField
          label="Plan name (optional)"
          value={formData.planName}
          onChange={(v) => setFormData({ ...formData, planName: v })}
          placeholder="e.g. Season 2025"
        />
      </div>
    </FormCard>

    <FormCard
      title="Current level"
      subtitle="We use this to customize the plan for you"
      icon={Target}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <InputField
          label="Average score"
          type="number"
          value={formData.baselineAverageScore}
          onChange={(v) => setFormData({ ...formData, baselineAverageScore: parseFloat(v) || '' })}
          placeholder="e.g. 85"
          min={50}
          max={150}
          required
        />
        <InputField
          label="Handicap"
          type="number"
          value={formData.baselineHandicap}
          onChange={(v) => setFormData({ ...formData, baselineHandicap: parseFloat(v) || '' })}
          placeholder="e.g. 12.5"
          min={-10}
          max={54}
          step={0.1}
        />
        <InputField
          label="Driver speed (mph)"
          type="number"
          value={formData.baselineDriverSpeed}
          onChange={(v) => setFormData({ ...formData, baselineDriverSpeed: parseFloat(v) || '' })}
          placeholder="e.g. 105"
          min={40}
          max={150}
        />
      </div>
    </FormCard>
  </div>
);

const Step2Schedule = ({ formData, setFormData }) => (
  <div className="grid gap-6">
    <FormCard
      title="Training hours per week"
      subtitle="How much time can you dedicate to golf per week?"
      icon={Clock}
    >
      <div className="max-w-xs">
        <InputField
          label="Hours per week"
          type="number"
          value={formData.weeklyHoursTarget}
          onChange={(v) => setFormData({ ...formData, weeklyHoursTarget: parseInt(v) || '' })}
          placeholder="e.g. 12"
          min={5}
          max={30}
        />
        <p className="text-sm mt-2 text-text-secondary">
          Recommended: 10-15 hours for serious players
        </p>
      </div>
    </FormCard>

    <FormCard
      title="Preferred training days"
      subtitle="Select which days you usually can train"
      icon={Calendar}
    >
      <DaySelector
        selectedDays={formData.preferredTrainingDays}
        onChange={(days) => setFormData({ ...formData, preferredTrainingDays: days })}
      />
      <p className="text-sm mt-3 text-text-secondary">
        Selected: {formData.preferredTrainingDays.length} days per week
      </p>
    </FormCard>
  </div>
);

const Step3Tournaments = ({ formData, setFormData }) => (
  <div className="grid gap-6">
    <FormCard
      title="Tournaments"
      subtitle="Add tournaments you plan to play. The plan will be periodized around these."
      icon={Trophy}
    >
      <TournamentList
        tournaments={formData.tournaments}
        onAdd={(t) => setFormData({ ...formData, tournaments: [...formData.tournaments, t] })}
        onRemove={(index) => setFormData({
          ...formData,
          tournaments: formData.tournaments.filter((_, i) => i !== index)
        })}
      />
    </FormCard>

    <div className="p-4 rounded-xl bg-accent-muted border border-accent">
      <div className="flex items-start gap-3">
        <Sparkles size={20} color="var(--accent)" className="shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium mb-1 m-0 text-text-primary">
            Tip: A, B, C prioritization
          </p>
          <p className="text-sm m-0 text-text-secondary">
            <strong>A-tournaments</strong> are main goals (1-2 per year). The plan will build up to these with optimal periodization.
            <strong> B-tournaments</strong> are important competitions. <strong>C-tournaments</strong> are for preparation and experience.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Step4Review = ({ formData }) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid gap-6">
      <FormCard title="Summary" icon={Check}>
        <div className="grid gap-5">
          {/* Basics */}
          <div>
            <CardTitle style={{ marginBottom: '0.5rem' }} className="text-sm text-text-secondary">
              BASICS
            </CardTitle>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
              <div className="p-3 rounded-lg bg-bg-secondary">
                <div className="text-xs text-text-secondary">Start date</div>
                <div className="text-base font-medium">
                  {formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-US') : '-'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-bg-secondary">
                <div className="text-xs text-text-secondary">Score</div>
                <div className="text-base font-medium">{formData.baselineAverageScore || '-'}</div>
              </div>
              <div className="p-3 rounded-lg bg-bg-secondary">
                <div className="text-xs text-text-secondary">Handicap</div>
                <div className="text-base font-medium">{formData.baselineHandicap || '-'}</div>
              </div>
              <div className="p-3 rounded-lg bg-bg-secondary">
                <div className="text-xs text-text-secondary">Driver speed</div>
                <div className="text-base font-medium">
                  {formData.baselineDriverSpeed ? `${formData.baselineDriverSpeed} mph` : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <CardTitle style={{ marginBottom: '0.5rem' }} className="text-sm text-text-secondary">
              TRAINING PLAN
            </CardTitle>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
              <div className="p-3 rounded-lg bg-bg-secondary">
                <div className="text-xs text-text-secondary">Hours/week</div>
                <div className="text-base font-medium">{formData.weeklyHoursTarget || 12} hours</div>
              </div>
              <div className="p-3 rounded-lg bg-bg-secondary">
                <div className="text-xs text-text-secondary">Training days</div>
                <div className="text-base font-medium">
                  {formData.preferredTrainingDays.map(d => dayNames[d]).join(', ') || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Tournaments */}
          <div>
            <CardTitle style={{ marginBottom: '0.5rem' }} className="text-sm text-text-secondary">
              TOURNAMENTS ({formData.tournaments.length})
            </CardTitle>
            {formData.tournaments.length > 0 ? (
              <div className="flex flex-col gap-2">
                {formData.tournaments.map((t, i) => (
                  <div
                    key={i}
                    className="flex justify-between py-2.5 px-3 rounded-lg bg-bg-secondary"
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="text-sm text-text-secondary">
                      {new Date(t.startDate).toLocaleDateString('en-US')} ({t.importance})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                No tournaments added
              </p>
            )}
          </div>
        </div>
      </FormCard>

      <div className="p-5 rounded-xl text-center bg-success-muted border border-success-muted">
        <Sparkles size={32} color="var(--status-success)" className="mb-3" />
        <SubSectionTitle style={{ marginBottom: '0.5rem' }}>
          Ready to generate!
        </SubSectionTitle>
        <p className="text-sm m-0 text-text-secondary">
          Click "Generate annual plan" to create your personal 12-month training plan
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// SUCCESS SCREEN
// ============================================================================

const SuccessScreen = ({ result, planId, onViewPlan, onViewCalendar, onSyncToSessions }) => {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncResult, setSyncResult] = React.useState(null);

  const handleSync = async () => {
    if (!planId || isSyncing) return;
    setIsSyncing(true);
    try {
      const synced = await onSyncToSessions(planId);
      setSyncResult(synced);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
  <div className="text-center py-10 px-5">
    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-success-muted">
      <CheckCircle size={40} color="var(--status-success)" />
    </div>

    <SectionTitle style={{ marginBottom: '0.5rem' }}>
      Annual plan created!
    </SectionTitle>
    <p className="text-base mb-8 m-0 text-text-secondary">
      Your 12-month training plan is ready
    </p>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
      <div className="p-5 rounded-xl bg-bg-primary border border-default">
        <div className="text-3xl font-bold text-accent">
          {result?.dailyAssignments?.created || 365}
        </div>
        <div className="text-sm mt-1 text-text-secondary">
          Training sessions
        </div>
      </div>
      <div className="p-5 rounded-xl bg-bg-primary border border-default">
        <div className="text-3xl font-bold text-accent">
          52
        </div>
        <div className="text-sm mt-1 text-text-secondary">
          Weeks planned
        </div>
      </div>
      <div className="p-5 rounded-xl bg-bg-primary border border-default">
        <div className="text-3xl font-bold text-accent">
          {result?.tournaments?.scheduled || 0}
        </div>
        <div className="text-sm mt-1 text-text-secondary">
          Tournaments
        </div>
      </div>
    </div>

    {/* Info box */}
    <div
      className={`py-4 px-5 rounded-xl max-w-lg mx-auto mb-8 text-left ${
        syncResult ? 'bg-success-muted border border-success-muted' : 'bg-accent-muted border border-accent'
      }`}
    >
      <div className="flex gap-3 items-start">
        <Calendar size={20} color={syncResult ? 'var(--status-success)' : 'var(--accent)'} className="shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium mb-1 m-0 text-text-primary">
            {syncResult ? `${syncResult.syncedCount} sessions synced!` : 'Ready to sync'}
          </p>
          <p className="text-sm m-0 text-text-secondary">
            {syncResult
              ? 'All planned training sessions have been added to the session overview. You can view them under "All sessions".'
              : 'Press "Sync" to add the next 4 weeks of sessions to the session overview.'
            }
          </p>
        </div>
      </div>
    </div>

    {/* Sync button */}
    {!syncResult && (
      <div className="mb-6">
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-lg border-none text-base font-medium mx-auto text-white bg-accent disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSyncing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Sync to sessions
            </>
          )}
        </button>
      </div>
    )}

    {/* Action buttons */}
    <div className="flex gap-3 justify-center">
      <button
        onClick={onViewCalendar}
        className="flex items-center gap-2 py-3.5 px-6 rounded-lg text-base font-medium cursor-pointer border border-default bg-bg-primary text-text-primary"
      >
        <Calendar size={18} />
        View calendar
      </button>
      <button
        onClick={onViewPlan}
        className="flex items-center gap-2 py-3.5 px-6 rounded-lg border-none text-base font-medium cursor-pointer text-white bg-accent"
      >
        View annual plan
        <ArrowRight size={18} />
      </button>
    </div>
  </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AarsplanGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generationResult, setGenerationResult] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPlanId, setCreatedPlanId] = useState(null);

  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    planName: '',
    baselineAverageScore: '',
    baselineHandicap: '',
    baselineDriverSpeed: '',
    weeklyHoursTarget: 12,
    preferredTrainingDays: [1, 3, 5, 6], // Man, Ons, Fre, Lør
    tournaments: [],
  });

  const steps = [
    { label: 'Basics', component: Step1Basics },
    { label: 'Schedule', component: Step2Schedule },
    { label: 'Tournaments', component: Step3Tournaments },
    { label: 'Confirm', component: Step4Review },
  ];

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0:
        return formData.startDate && formData.baselineAverageScore;
      case 1:
        return formData.preferredTrainingDays.length > 0;
      case 2:
        return true; // Tournaments are optional
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const payload = {
        playerId: user?.playerId || user?.id,
        startDate: formData.startDate,
        baselineAverageScore: formData.baselineAverageScore,
        baselineHandicap: formData.baselineHandicap || undefined,
        baselineDriverSpeed: formData.baselineDriverSpeed || undefined,
        planName: formData.planName || `Annual Plan ${new Date().getFullYear()}`,
        weeklyHoursTarget: formData.weeklyHoursTarget,
        tournaments: formData.tournaments.length > 0 ? formData.tournaments : undefined,
        preferredTrainingDays: formData.preferredTrainingDays,
      };

      const response = await apiClient.post('/training-plan/generate', payload);

      // Store the plan ID for syncing
      const planId = response.data?.plan?.id || response.data?.id;
      setCreatedPlanId(planId);

      // Store the result and show success screen
      setGenerationResult({
        dailyAssignments: { created: response.data?.dailyAssignments?.length || 365 },
        tournaments: { scheduled: formData.tournaments.length },
      });
      setShowSuccess(true);

      // Show toast notification
      toast.success('Annual plan created!', {
        description: `${response.data?.dailyAssignments?.length || 365} training sessions added to calendar`,
      });
    } catch (err) {
      console.error('Error generating plan:', err);
      setError(err.response?.data?.message || 'Could not generate annual plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Sync plan to sessions
  const handleSyncToSessions = useCallback(async (planId) => {
    try {
      const response = await apiClient.post(`/training-plan/${planId}/sync-to-sessions`);
      const { syncedCount, skippedCount } = response.data || {};

      toast.success(`${syncedCount} sessions synced!`, {
        description: skippedCount > 0 ? `${skippedCount} sessions were already synced` : undefined,
      });

      return response.data;
    } catch (err) {
      console.error('Error syncing plan:', err);
      toast.error('Could not sync sessions', {
        description: err.response?.data?.message || 'Please try again later',
      });
      throw err;
    }
  }, []);

  const StepComponent = steps[currentStep].component;

  // Show success screen after generation
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-bg-secondary">
        <PageHeader
          title="Annual plan created"
          subtitle="Your training plan is ready"
        />
        <div className="max-w-xl mx-auto p-6">
          <div className="rounded-2xl shadow-sm bg-bg-primary border border-default">
            <SuccessScreen
              result={generationResult}
              planId={createdPlanId}
              onViewPlan={() => navigate('/aarsplan')}
              onViewCalendar={() => navigate('/kalender')}
              onSyncToSessions={handleSyncToSessions}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <PageHeader
        title="Annual Plan Generator"
        subtitle="Create your personal 12-month training plan"
        helpText="Generate a complete annual plan based on your goals, availability and training level. The system creates a periodized plan with recommended focus for each month."
      />

      <div className="max-w-3xl mx-auto p-6">
        {/* Step indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={steps.length}
          steps={steps}
        />

        {/* Step content */}
        <StepComponent formData={formData} setFormData={setFormData} />

        {/* Error message */}
        {error && (
          <div className="mt-5 py-3.5 px-4 rounded-lg text-sm bg-danger-muted border border-danger-muted text-danger">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-default">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 py-3 px-5 rounded-lg text-base font-medium border border-default bg-bg-primary text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className={`flex items-center gap-2 py-3 px-6 rounded-lg border-none text-base font-medium ${
                canProceed()
                  ? 'bg-accent text-white cursor-pointer'
                  : 'bg-bg-secondary text-text-secondary cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !canProceed()}
              className="flex items-center gap-2 py-3 px-7 rounded-lg border-none text-base font-semibold text-white bg-success disabled:opacity-80 disabled:cursor-wait"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate annual plan
                </>
              )}
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default AarsplanGenerator;
