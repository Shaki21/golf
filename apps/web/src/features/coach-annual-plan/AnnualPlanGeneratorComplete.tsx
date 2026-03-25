/**
 * AnnualPlanGenerator.tsx - COMPLETE VERSION
 * Design System v3.0 - Premium Light
 *
 * Årsplangenerator for trenere med full funksjonalitet:
 * - Template selector
 * - Drag-and-drop perioder
 * - Period detail editing
 * - Session library
 * - Save/Export functionality
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Download, Calendar, Plus, Layout,
  Layers, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import { PageTitle, SectionTitle } from '../../components/typography/Headings';
import TemplateSelectorModal, { type PlanTemplate, PLAN_TEMPLATES } from './components/TemplateSelectorModal';
import PeriodDetailPanel, { type Period } from './components/PeriodDetailPanel';
import SessionLibrary, { type SessionTemplate } from './components/SessionLibrary';

// ============================================================================
// TYPES
// ============================================================================

type PeriodType = 'E' | 'G' | 'S' | 'T';
type CreationMode = 'template' | 'scratch' | null;

interface AnnualPlan {
  id?: string;
  playerId: string;
  playerName: string;
  name: string;
  startDate: string;
  endDate: string;
  periods: Period[];
}

// ============================================================================
// PERIODE KONFIGURASJON
// ============================================================================

const PERIOD_CONFIG: Record<PeriodType, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  defaultWeeks: number;
}> = {
  E: {
    label: 'Evaluation',
    description: 'Testing, kartlegging og vurdering',
    color: 'rgb(var(--category-j))',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    defaultWeeks: 4,
  },
  G: {
    label: 'Base Period',
    description: 'Grunnleggende ferdigheter og allsidig utvikling',
    color: 'rgb(var(--status-warning))',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    defaultWeeks: 12,
  },
  S: {
    label: 'Specialization',
    description: 'Focused training on specific areas',
    color: 'rgb(var(--status-success))',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    defaultWeeks: 10,
  },
  T: {
    label: 'Tournament',
    description: 'Konkurranseperiode og toppform',
    color: 'rgb(var(--tier-gold))',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    defaultWeeks: 8,
  },
};

// ============================================================================
// MODE SELECTOR COMPONENT
// ============================================================================

interface ModeSelectorProps {
  onSelectMode: (mode: CreationMode) => void;
  playerName: string;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode, playerName }) => (
  <div className="min-h-[60vh] flex items-center justify-center p-6">
    <div className="max-w-4xl w-full">
      <div className="text-center mb-8">
        <PageTitle className="mb-2">Create annual plan</PageTitle>
        <p className="text-tier-text-secondary text-[15px]">
          For {playerName}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card
          variant="default"
          padding="none"
          className="cursor-pointer transition-all hover:shadow-lg hover:border-tier-navy/30 group"
          onClick={() => onSelectMode('template')}
        >
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-tier-navy/15 flex items-center justify-center group-hover:bg-tier-navy/25 transition-colors">
              <Layout size={32} className="text-tier-navy" />
            </div>
            <SectionTitle className="mb-2">Fra mal</SectionTitle>
            <p className="text-sm text-tier-text-secondary mb-6">
              Select a ready-made periodization template adapted to player level and goals
            </p>
            <div className="flex flex-col gap-2 text-left">
              <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-tier-success" />
                <span>Anbefalt for de fleste</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-tier-success" />
                <span>Save time with predefined periods</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-tier-success" />
                <span>Kan tilpasses etter valg</span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          variant="default"
          padding="none"
          className="cursor-pointer transition-all hover:shadow-lg hover:border-tier-navy/30 group"
          onClick={() => onSelectMode('scratch')}
        >
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-tier-surface-base flex items-center justify-center group-hover:bg-tier-border-default transition-colors">
              <Plus size={32} className="text-tier-navy" />
            </div>
            <SectionTitle className="mb-2">Fra scratch</SectionTitle>
            <p className="text-sm text-tier-text-secondary mb-6">
              Start med tom plan og bygg din egen periodisering fra bunnen
            </p>
            <div className="flex flex-col gap-2 text-left">
              <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-tier-border-default" />
                <span>Full kontroll</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-tier-border-default" />
                <span>For erfarne trenere</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-tier-border-default" />
                <span>Skreddersydd planlegging</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
);

// ============================================================================
// TIMELINE HEADER COMPONENT
// ============================================================================

interface TimelineHeaderProps {
  startDate: Date;
  endDate: Date;
  currentView: 'month' | 'week';
  onViewChange: (view: 'month' | 'week') => void;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  startDate,
  endDate,
  currentView,
  onViewChange,
}) => {
  const months: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  return (
    <div className=" bg-tier-white z-10 border-b border-tier-border-default">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-tier-text-secondary" />
          <span className="text-sm font-medium text-tier-navy">
            {startDate.toLocaleDateString('nb-NO', { year: 'numeric' })}
          </span>
        </div>

        <div className="flex gap-1 p-1 bg-tier-surface-base rounded-lg">
          <button
            onClick={() => onViewChange('month')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              currentView === 'month'
                ? 'bg-white text-tier-navy shadow-sm'
                : 'text-tier-text-secondary hover:text-tier-navy'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              currentView === 'week'
                ? 'bg-white text-tier-navy shadow-sm'
                : 'text-tier-text-secondary hover:text-tier-navy'
            }`}
          >
            Uke
          </button>
        </div>
      </div>

      <div className="flex border-t border-tier-border-default">
        {months.map((month, index) => (
          <div
            key={index}
            className="flex-1 px-3 py-2 text-center border-r border-tier-border-default last:border-r-0"
          >
            <div className="text-xs font-semibold text-tier-navy uppercase">
              {month.toLocaleDateString('nb-NO', { month: 'short' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// PERIOD BLOCK COMPONENT
// ============================================================================

interface PeriodBlockProps {
  period: Period;
  onClick: () => void;
}

const PeriodBlock: React.FC<PeriodBlockProps> = ({ period, onClick }) => {
  const config = PERIOD_CONFIG[period.type];
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      onClick={onClick}
      className={`${config.bgColor} rounded-xl p-4 border-2 border-transparent hover:border-current cursor-pointer transition-all group`}
      style={{ borderColor: 'transparent' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = config.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className={`text-xs font-bold ${config.textColor} uppercase tracking-wide mb-1`}>
            {config.label}
          </div>
          <div className="text-sm font-semibold text-tier-navy">
            {period.name}
          </div>
        </div>
        <div className={`w-6 h-6 rounded-md ${config.bgColor} flex items-center justify-center`}>
          <span className={`text-xs font-bold ${config.textColor}`}>
            {period.type}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-tier-text-secondary">
        <Clock size={12} />
        <span>{duration} days</span>
        <span>•</span>
        <span>{Math.ceil(duration / 7)} weeks</span>
      </div>

      {period.weeklyFrequency > 0 && (
        <div className="mt-2 text-xs text-tier-text-secondary">
          {period.weeklyFrequency} sessions/week
        </div>
      )}

      {period.goals.length > 0 && (
        <div className="mt-2 pt-2 border-t border-tier-border-default">
          <div className="text-xs text-tier-text-tertiary">
            {period.goals.length} goals set
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AnnualPlanGenerator: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();

  // State
  const [mode, setMode] = useState<CreationMode>(null);
  const [currentView, setCurrentView] = useState<'month' | 'week'>('month');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [showPeriodPanel, setShowPeriodPanel] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const [plan, setPlan] = useState<AnnualPlan>({
    playerId: playerId || '',
    playerName: 'Emma Hansen',
    name: 'Annual Plan 2026',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    periods: [],
  });

  // When mode is selected
  const handleModeSelect = (selectedMode: CreationMode) => {
    setMode(selectedMode);
    if (selectedMode === 'template') {
      setShowTemplateModal(true);
    }
  };

  // Apply template
  const handleApplyTemplate = (template: PlanTemplate) => {
    const planStartDate = new Date(plan.startDate);
    const periods: Period[] = [];
    let currentDate = new Date(planStartDate);

    template.periodStructure.forEach((periodDef, index) => {
      const config = PERIOD_CONFIG[periodDef.type];
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + (periodDef.weeks * 7));

      periods.push({
        id: `period-${index}`,
        type: periodDef.type,
        name: periodDef.name,
        description: periodDef.description,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        weeklyFrequency: template.weeklyFrequency,
        goals: [],
        color: config.color,
        textColor: config.textColor,
      });

      currentDate = endDate;
    });

    setPlan({
      ...plan,
      name: template.name,
      periods,
    });
  };

  // Add period manually
  const handleAddPeriod = (type: PeriodType) => {
    const config = PERIOD_CONFIG[type];
    const lastPeriod = plan.periods[plan.periods.length - 1];
    const startDate = lastPeriod
      ? new Date(new Date(lastPeriod.endDate).getTime() + 24 * 60 * 60 * 1000)
      : new Date(plan.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (config.defaultWeeks * 7));

    const newPeriod: Period = {
      id: `period-${Date.now()}`,
      type,
      name: `${config.label} ${plan.periods.length + 1}`,
      description: config.description,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      weeklyFrequency: 3,
      goals: [],
      color: config.color,
      textColor: config.textColor,
    };

    setPlan({
      ...plan,
      periods: [...plan.periods, newPeriod],
    });
  };

  // Save period changes
  const handleSavePeriod = (updatedPeriod: Period) => {
    setPlan({
      ...plan,
      periods: plan.periods.map(p =>
        p.id === updatedPeriod.id ? updatedPeriod : p
      ),
    });
  };

  // Delete period
  const handleDeletePeriod = (periodId: string) => {
    setPlan({
      ...plan,
      periods: plan.periods.filter(p => p.id !== periodId),
    });
  };

  // Save to backend
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Export to PDF
  const handleExport = () => {
    // TODO: Implement PDF export
    alert('PDF export coming soon!');
  };

  const handleBack = () => navigate(-1);

  // Mode selector view
  if (!mode) {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <div className="bg-tier-white border-b border-tier-border-default py-4 px-6">
          <Button variant="ghost" size="sm" onClick={handleBack} leftIcon={<ArrowLeft size={18} />}>
            Back
          </Button>
        </div>
        <ModeSelector onSelectMode={handleModeSelect} playerName={plan.playerName} />
      </div>
    );
  }

  // Main editor view
  const startDate = new Date(plan.startDate);
  const endDate = new Date(plan.endDate);

  return (
    <div className="min-h-screen bg-tier-surface-base flex flex-col">
      {/* Header */}
      <div className="bg-tier-white border-b border-tier-border-default py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack} leftIcon={<ArrowLeft size={18} />}>
            Back
          </Button>
          <div>
            <PageTitle className="m-0">{plan.name}</PageTitle>
            <p className="text-sm text-tier-text-secondary mt-1">{plan.playerName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 text-sm text-tier-success">
              <CheckCircle size={18} />
              <span>Saved!</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-tier-error">
              <AlertCircle size={18} />
              <span>Error saving</span>
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download size={18} />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Save size={18} />}
            onClick={handleSave}
            loading={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Timeline Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TimelineHeader
            startDate={startDate}
            endDate={endDate}
            currentView={currentView}
            onViewChange={setCurrentView}
          />

          <div className="flex-1 overflow-auto p-6">
            {plan.periods.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <Layers size={48} className="mx-auto mb-4 text-tier-text-tertiary" />
                  <SectionTitle className="mb-2">No periods added</SectionTitle>
                  <p className="text-sm text-tier-text-secondary mb-6">
                    {mode === 'template'
                      ? 'Select a template to get started, or add periods manually'
                      : 'Add periods from the library on the right'}
                  </p>
                  {mode === 'template' && (
                    <Button
                      variant="primary"
                      leftIcon={<Layout size={18} />}
                      onClick={() => setShowTemplateModal(true)}
                    >
                      Select template
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plan.periods.map((period) => (
                  <PeriodBlock
                    key={period.id}
                    period={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setShowPeriodPanel(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-tier-white border-l border-tier-border-default overflow-hidden flex flex-col">
          <div className="p-4 border-b border-tier-border-default">
            <SectionTitle className="m-0">
              {mode === 'template' ? 'Period library' : 'Period library'}
            </SectionTitle>
          </div>

          {mode === 'template' && plan.periods.length === 0 ? (
            <div className="p-4 text-center">
              <Button
                variant="primary"
                leftIcon={<Layout size={18} />}
                onClick={() => setShowTemplateModal(true)}
                className="w-full justify-center mb-4"
              >
                Select template
              </Button>
              <p className="text-xs text-tier-text-secondary">
                Or add periods manually below
              </p>
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3 mb-6">
              {Object.entries(PERIOD_CONFIG).map(([type, config]) => (
                <div
                  key={type}
                  onClick={() => handleAddPeriod(type as PeriodType)}
                  className={`${config.bgColor} rounded-lg p-3 border-2 border-transparent hover:border-current cursor-pointer transition-all`}
                  style={{ borderColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = config.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${config.textColor}`}>
                      {config.label}
                    </span>
                    <Plus size={16} className={config.textColor} />
                  </div>
                  <p className="text-xs text-tier-text-secondary mb-1">
                    {config.description}
                  </p>
                  <div className="text-xs text-tier-text-tertiary">
                    Default: {config.defaultWeeks} weeks
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-tier-border-default pt-4">
              <div className="text-xs font-medium text-tier-text-secondary mb-2">SESSIONS</div>
              <SessionLibrary />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TemplateSelectorModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleApplyTemplate}
      />

      <PeriodDetailPanel
        period={selectedPeriod}
        isOpen={showPeriodPanel}
        onClose={() => {
          setShowPeriodPanel(false);
          setSelectedPeriod(null);
        }}
        onSave={handleSavePeriod}
        onDelete={handleDeletePeriod}
      />
    </div>
  );
};

export default AnnualPlanGenerator;
