/**
 * TIER Golf - Coach Training Plan (View Only)
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Purpose:
 * - Display training plan overview for a specific athlete
 * - Read-only view - use CoachTrainingPlanEditor for modifications
 *
 * Contract references:
 * - COACH_ADMIN_IMPLEMENTATION_CONTRACT.md
 * - COACH_ADMIN_SCREEN_CONTRACT.md
 *
 * NON-NEGOTIABLE:
 * - Past blocks are READ-ONLY
 * - No backdating
 * - No performance outcomes shown
 * - No "effective block" indicators
 */

import React from "react";
import { ArrowLeft, ClipboardList, Calendar, Clock, CheckCircle, Edit } from "lucide-react";
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';
import { PageTitle, SectionTitle } from '../../components/typography/Headings';
import { TrainingCategoryBadge, type TrainingCategory } from '../../components/shadcn/golf';

//////////////////////////////
// 1. TYPES
//////////////////////////////

type TrainingBlock = {
  id: string;
  name: string;
  description?: string;
  date: string; // ISO date
  durationMinutes?: number;
  completed: boolean;
  category?: TrainingCategory; // Training category from AK Formula (fysisk, teknikk, slag, spill, turnering)
  akFormula?: string; // Complete AK Formula string (optional)
};

type Props = {
  athleteId: string;
  athleteName?: string;
  blocks?: TrainingBlock[];
  onEdit?: () => void;
  onBack?: () => void;
};

//////////////////////////////
// 2. MOCK DATA
//////////////////////////////

const MOCK_BLOCKS: TrainingBlock[] = [
  { id: "b1", name: "Putting fokus", description: "Lag putts fra 1-3 meter", date: "2025-12-28", durationMinutes: 60, completed: false, category: "teknikk" },
  { id: "b2", name: "Driver trening", date: "2025-12-30", durationMinutes: 90, completed: false, category: "slag" },
  { id: "b3", name: "Kort spill", date: "2025-12-22", durationMinutes: 45, completed: false, category: "slag" },
  { id: "b4", name: "Banespill", date: "2025-12-15", durationMinutes: 180, completed: true, category: "spill" },
  { id: "b5", name: "Teknikktrening", date: "2025-12-10", durationMinutes: 60, completed: true, category: "teknikk" },
];

//////////////////////////////
// 3. HELPERS
//////////////////////////////

const getTodayISO = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const isInPast = (dateString: string): boolean => {
  return dateString < getTodayISO();
};

const sortByDate = (blocks: TrainingBlock[]): TrainingBlock[] =>
  [...blocks].sort((a, b) => a.date.localeCompare(b.date));

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("nb-NO", {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("nb-NO", {
    day: 'numeric',
    month: 'short',
  });
};

//////////////////////////////
// 4. COMPONENT
//////////////////////////////

export default function CoachTrainingPlan({
  athleteId,
  athleteName = "Spiller",
  blocks: apiBlocks,
  onEdit,
  onBack,
}: Props) {
  const blocks = apiBlocks || MOCK_BLOCKS;
  const sortedBlocks = sortByDate(blocks);

  const upcomingBlocks = sortedBlocks.filter(b => !isInPast(b.date) && !b.completed);
  const completedBlocks = sortedBlocks.filter(b => isInPast(b.date) || b.completed);

  // Get next session
  const nextSession = upcomingBlocks[0];

  return (
    <section
      aria-label="Training plan"
      className="min-h-screen bg-tier-white"
    >
      {/* Header */}
      <div className="bg-tier-surface-base border-b border-tier-border-default py-4 px-6">
        {onBack && (
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={onBack} leftIcon={<ArrowLeft size={18} />}>
              Tilbake
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-tier-navy/15 flex items-center justify-center">
              <ClipboardList size={24} className="text-tier-navy" />
            </div>
            <div>
              <PageTitle className="m-0">
                Treningsplan
              </PageTitle>
              <p className="text-[13px] text-tier-text-secondary m-0 mt-1">
                {athleteName}
              </p>
            </div>
          </div>

          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit} leftIcon={<Edit size={18} />}>
              Rediger plan
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Next Session Highlight */}
        {nextSession && (
          <Card variant="accent" padding="lg" className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={18} className="text-tier-navy" />
              <span className="text-[13px] text-tier-navy opacity-90">
                Neste økt
              </span>
              {nextSession.category && (
                <TrainingCategoryBadge category={nextSession.category} size="sm" />
              )}
            </div>
            <SectionTitle className="m-0 mb-2">
              {nextSession.name}
            </SectionTitle>
            <div className="flex items-center gap-4">
              <span className="text-[15px] text-tier-navy">
                {formatDate(nextSession.date)}
              </span>
              {nextSession.durationMinutes && (
                <div className="flex items-center gap-1 text-tier-text-secondary">
                  <Clock size={14} />
                  <span>{nextSession.durationMinutes} min</span>
                </div>
              )}
            </div>
            {nextSession.description && (
              <p className="text-[15px] text-tier-text-secondary m-0 mt-3">
                {nextSession.description}
              </p>
            )}
          </Card>
        )}

        {/* Upcoming Sessions */}
        <Card variant="default" padding="none" className="mb-6 overflow-hidden">
          <div className="p-5 border-b border-tier-border-default">
            <SectionTitle className="m-0">
              Kommende økter
            </SectionTitle>
            <p className="text-[13px] text-tier-text-secondary m-0 mt-1">
              {upcomingBlocks.length} planlagte
            </p>
          </div>

          {upcomingBlocks.length === 0 ? (
            <StateCard variant="empty" icon={Calendar} title="Ingen planlagte økter" />
          ) : (
            <div>
              {upcomingBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`flex items-center gap-4 py-4 px-5 ${
                    index < upcomingBlocks.length - 1 ? 'border-b border-tier-border-default' : ''
                  }`}
                >
                  <div className="w-14 p-2 rounded-lg bg-tier-navy/15 text-tier-navy text-center">
                    <div className="text-[13px] font-semibold">
                      {new Date(block.date).toLocaleDateString("nb-NO", { weekday: 'short' }).toUpperCase()}
                    </div>
                    <div className="text-xl font-bold">
                      {new Date(block.date).getDate()}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[15px] font-semibold text-tier-navy">
                        {block.name}
                      </span>
                      {block.category && (
                        <TrainingCategoryBadge category={block.category} size="sm" />
                      )}
                    </div>
                    {block.description && (
                      <p className="text-[13px] text-tier-text-secondary m-0 mt-1">
                        {block.description}
                      </p>
                    )}
                  </div>

                  {block.durationMinutes && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-tier-text-tertiary" />
                      <span className="text-[13px] text-tier-text-tertiary">
                        {block.durationMinutes} min
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Completed Sessions */}
        {completedBlocks.length > 0 && (
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="p-5 border-b border-tier-border-default">
              <SectionTitle className="m-0">
                Fullførte økter
              </SectionTitle>
              <p className="text-[13px] text-tier-text-secondary m-0 mt-1">
                {completedBlocks.length} gjennomført
              </p>
            </div>

            <div>
              {completedBlocks.slice(0, 5).map((block, index) => (
                <div
                  key={block.id}
                  className={`flex items-center gap-4 py-3.5 px-5 bg-tier-surface-base ${
                    index < Math.min(completedBlocks.length, 5) - 1 ? 'border-b border-tier-border-default' : ''
                  }`}
                >
                  <CheckCircle size={20} className="text-tier-success" />

                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[15px] text-tier-text-secondary">
                      {block.name}
                    </span>
                    {block.category && (
                      <TrainingCategoryBadge category={block.category} size="sm" />
                    )}
                  </div>

                  <span className="text-[13px] text-tier-text-tertiary">
                    {formatShortDate(block.date)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}

//////////////////////////////
// 5. STRICT NOTES
//////////////////////////////

/*
- This is a READ-ONLY view of the training plan.
- Do NOT allow editing from this component.
- Do NOT show performance outcomes of blocks.
- Do NOT show "effective" or "recommended" indicators.
- Do NOT show AI suggestions.
- Past blocks are displayed as completed history only.
*/
