/**
 * AnnualPlanGeneratorWithDnD.tsx
 * Design System v3.0 - Premium Light
 *
 * Årsplangenerator med full drag-and-drop funksjonalitet
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft, Save, Download, Calendar, Plus, Layout,
  Layers, Clock, CheckCircle, AlertCircle, GripVertical,
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import { PageTitle, SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import { useToast } from '../../components/shadcn/use-toast';
import TemplateSelectorModal, { type PlanTemplate } from './components/TemplateSelectorModal';
import PeriodDetailPanel, { type Period } from './components/PeriodDetailPanel';
import SessionLibrary, { type SessionTemplate } from './components/SessionLibrary';
import * as annualPlanApi from '../../services/annualPlanApi';
import { exportAnnualPlanToPDF } from '../../services/pdfExport';

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

interface PlannedSession {
  id: string;
  periodId: string;
  templateId: string;
  name: string;
  category: string;
  duration: number;
  week: number;
  notes?: string;
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
// SORTABLE PERIOD BLOCK
// ============================================================================

interface SortablePeriodBlockProps {
  period: Period;
  onClick: () => void;
  isDragging?: boolean;
}

const SortablePeriodBlock: React.FC<SortablePeriodBlockProps> = ({
  period,
  onClick,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: period.id });

  const config = PERIOD_CONFIG[period.type];
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${config.bgColor} rounded-xl p-4 border-2 border-transparent hover:border-current transition-all group cursor-move ${
        isDragging || isSortableDragging ? 'shadow-lg z-50' : ''
      }`}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = config.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={18} className="text-tier-text-tertiary" />
        </div>

        {/* Content */}
        <div className="flex-1" onClick={onClick}>
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
      </div>
    </div>
  );
};

// ============================================================================
// DRAGGABLE SESSION TEMPLATE
// ============================================================================

interface DraggableSessionProps {
  session: SessionTemplate;
}

const DraggableSession: React.FC<DraggableSessionProps> = ({ session }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
  } = useSortable({ id: session.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="p-3 rounded-lg bg-tier-white border border-tier-border-default hover:border-tier-navy/50 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-tier-navy">
              {session.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-tier-text-tertiary">
            <Clock size={12} />
            <span>{session.duration} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AnnualPlanGeneratorWithDnD: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [mode, setMode] = useState<CreationMode>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [showPeriodPanel, setShowPeriodPanel] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const [plan, setPlan] = useState<AnnualPlan>({
    playerId: playerId || '',
    playerName: 'Emma Hansen',
    name: 'Annual Plan 2026',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    periods: [],
  });

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;

    // Reorder periods
    setPlan((prevPlan) => {
      const oldIndex = prevPlan.periods.findIndex((p) => p.id === active.id);
      const newIndex = prevPlan.periods.findIndex((p) => p.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        return {
          ...prevPlan,
          periods: arrayMove(prevPlan.periods, oldIndex, newIndex),
        };
      }

      return prevPlan;
    });
  };

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
        id: `period-${index}-${Date.now()}`,
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
      if (plan.id) {
        // Update existing plan
        await annualPlanApi.updateAnnualPlan(plan.id, {
          name: plan.name,
          startDate: plan.startDate,
          endDate: plan.endDate,
          periods: plan.periods,
        });
      } else {
        // Create new plan
        const created = await annualPlanApi.createAnnualPlan({
          playerId: plan.playerId,
          name: plan.name,
          startDate: plan.startDate,
          endDate: plan.endDate,
          periods: plan.periods,
        });
        setPlan({ ...plan, id: created.id });
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: any) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Export to PDF
  const handleExport = async () => {
    try {
      await exportAnnualPlanToPDF({
        playerName: plan.playerName,
        name: plan.name,
        startDate: plan.startDate,
        endDate: plan.endDate,
        periods: plan.periods,
      });
      toast({
        title: 'PDF eksportert',
        description: 'The annual plan has been exported to PDF',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Eksport feilet',
        description: 'Could not export to PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => navigate(-1);

  // Get active period for drag overlay
  const activePeriod = activeDragId
    ? plan.periods.find(p => p.id === activeDragId)
    : null;

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
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
              onClick={handleExport}
              leftIcon={<Download size={18} />}
            >
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              leftIcon={<Save size={18} />}
              loading={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save plan'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Timeline Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {plan.periods.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-tier-surface-base flex items-center justify-center">
                    <Calendar size={32} className="text-tier-text-tertiary" />
                  </div>
                  <SubSectionTitle className="mb-2">No periods added yet</SubSectionTitle>
                  <p className="text-sm text-tier-text-secondary mb-6">
                    Add periods from the sidebar to build the annual plan
                  </p>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  <SubSectionTitle className="mb-4">
                    Periods ({plan.periods.length})
                  </SubSectionTitle>
                  <div className="space-y-3">
                    <SortableContext
                      items={plan.periods.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {plan.periods.map((period) => (
                        <SortablePeriodBlock
                          key={period.id}
                          period={period}
                          onClick={() => {
                            setSelectedPeriod(period);
                            setShowPeriodPanel(true);
                          }}
                        />
                      ))}
                    </SortableContext>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-tier-white border-l border-tier-border-default flex flex-col">
            {/* Period Library */}
            <div className="p-4 border-b border-tier-border-default">
              <SubSectionTitle className="mb-3">Add period</SubSectionTitle>
              <div className="space-y-2">
                {(Object.keys(PERIOD_CONFIG) as PeriodType[]).map((type) => {
                  const config = PERIOD_CONFIG[type];
                  return (
                    <button
                      key={type}
                      onClick={() => handleAddPeriod(type)}
                      className={`w-full p-3 rounded-lg border border-tier-border-default bg-tier-white hover:border-tier-navy/50 hover:shadow-sm transition-all text-left`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                          <span className={`text-xs font-bold ${config.textColor}`}>
                            {type}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-tier-navy">
                            {config.label}
                          </div>
                          <div className="text-xs text-tier-text-tertiary">
                            {config.defaultWeeks} weeks
                          </div>
                        </div>
                        <Plus size={16} className="text-tier-text-tertiary" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session Library */}
            <div className="flex-1 overflow-hidden">
              <div className="p-4 border-b border-tier-border-default">
                <SubSectionTitle className="mb-1">Session Library</SubSectionTitle>
                <p className="text-xs text-tier-text-secondary">
                  Drag sessions to periods (coming soon)
                </p>
              </div>
              <SessionLibrary />
            </div>
          </div>
        </div>

        {/* Modals and Panels */}
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

        {/* Drag Overlay */}
        <DragOverlay>
          {activePeriod ? (
            <SortablePeriodBlock
              period={activePeriod}
              onClick={() => {}}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default AnnualPlanGeneratorWithDnD;
