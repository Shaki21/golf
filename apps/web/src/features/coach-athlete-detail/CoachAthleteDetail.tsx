/**
 * TIER Golf - Coach Athlete Detail
 * Design System v3.0 - Semantic CSS Variables
 *
 * Purpose:
 * - Provide neutral navigation hub for a single athlete
 * - Bind together approved coach views WITHOUT interpretation
 *
 * Contract references:
 * - COACH_ADMIN_IMPLEMENTATION_CONTRACT.md
 * - COACH_ADMIN_SCREEN_CONTRACT.md
 *
 * NON-NEGOTIABLE:
 * - No summaries or performance indicators
 * - No prioritization or default focus
 * - Order of items remains static and neutral
 */

//////////////////////////////
// 1. IMPORTS
//////////////////////////////

import React from "react";
import { FileText, TrendingUp, ClipboardList, StickyNote, ChevronRight } from "lucide-react";
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { CoachExportButton } from '../../components/export';
import { SectionTitle } from '../../ui/primitives/typography';

//////////////////////////////
// 2. TYPES
//////////////////////////////

type Props = {
  athleteId: string;
  athleteName?: string;
  onBack?: () => void;
  onViewProof?: (athleteId: string) => void;
  onViewTrajectory?: (athleteId: string) => void;
  onEditTrainingPlan?: (athleteId: string) => void;
  onViewNotes?: (athleteId: string) => void;
};

//////////////////////////////
// 3. NAVIGATION ITEMS
//////////////////////////////

// Static order - no reordering based on importance
const navigationItems = [
  { id: 'proof', label: 'Se dokumentasjon', description: 'Video og bilder fra økter', icon: FileText },
  { id: 'trajectory', label: 'Se utvikling', description: 'Oversikt over fremgang', icon: TrendingUp },
  { id: 'plan', label: 'Treningsplan', description: 'Rediger og planlegg økter', icon: ClipboardList },
  { id: 'notes', label: 'Notater', description: 'Dine notater om spilleren', icon: StickyNote },
];

//////////////////////////////
// 4. AVATAR COMPONENT
//////////////////////////////

const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 64 }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};

//////////////////////////////
// 5. MAIN COMPONENT
//////////////////////////////

export default function CoachAthleteDetail({
  athleteId,
  athleteName = "Spiller",
  onBack,
  onViewProof,
  onViewTrajectory,
  onEditTrainingPlan,
  onViewNotes,
}: Props) {
  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'proof':
        onViewProof?.(athleteId);
        break;
      case 'trajectory':
        onViewTrajectory?.(athleteId);
        break;
      case 'plan':
        onEditTrainingPlan?.(athleteId);
        break;
      case 'notes':
        onViewNotes?.(athleteId);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* TIER-compliant PageHeader */}
      <PageHeader
        title={athleteName}
        subtitle="Velg handling nedenfor"
        helpText="Spilleroversikt med tilgang til dokumentasjon, utvikling, treningsplan og notater. Velg en handling for å se detaljert informasjon om spilleren."
        onBack={onBack}
        actions={<CoachExportButton playerId={athleteId} />}
      />

      <PageContainer paddingY="md" background="base">
        {/* Avatar Section */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={athleteName} size={64} />
          <div className="flex-1">
            <SectionTitle className="text-2xl font-bold text-tier-navy" style={{ marginBottom: 0 }}>{athleteName}</SectionTitle>
            <p className="text-tier-body text-tier-text-secondary mt-1">Velg handling nedenfor</p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div>
        <nav aria-label="Athlete views">
          <Card variant="default" padding="none">
            <div className="overflow-hidden">
              {navigationItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAction(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 bg-transparent border-none cursor-pointer text-left transition-colors hover:bg-tier-surface-subtle ${
                    index < navigationItems.length - 1 ? 'border-b border-tier-border-default' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-tier-navy/10 flex items-center justify-center shrink-0">
                    <item.icon size={24} className="text-tier-navy" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-[15px] leading-5 font-semibold text-tier-navy">
                      {item.label}
                    </span>
                    <span className="block text-[13px] leading-[18px] text-tier-text-secondary mt-0.5">
                      {item.description}
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-tier-text-secondary" />
                </button>
              ))}
            </div>
          </Card>
        </nav>
        </div>
      </PageContainer>
    </div>
  );
}

//////////////////////////////
// 6. NOTES
//////////////////////////////

/*
- Do NOT show athlete stats, tests, sessions, or summaries.
- Do NOT show last activity, trends, or deltas.
- Do NOT preselect or highlight any action.
- Do NOT add counts or ordering based on importance.
- Order of items remains static and neutral.
- This screen is navigation only - neutral gateway to coach tools.
*/
