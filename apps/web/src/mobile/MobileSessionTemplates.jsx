/**
 * MobileSessionTemplates Component
 * Design System v3.0 - TIER Golf
 *
 * Replaces quick-log with standard session templates based on AK formula.
 * Users can select from pre-configured training sessions.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle, SubSectionTitle } from '../components/typography';
import { Dumbbell, Target, Flag, Gamepad2, Trophy } from 'lucide-react';

const PYRAMID_CONFIGS = {
  FYS: {
    icon: Dumbbell,
    label: 'Fysisk',
    description: 'Styrke, power, mobilitet',
    color: 'var(--error)',
    bgColor: 'color-mix(in srgb, var(--error) 10%, transparent)',
  },
  TEK: {
    icon: Target,
    label: 'Teknikk',
    description: 'Bevegelsesmønster, posisjoner',
    color: 'var(--accent)',
    bgColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
  },
  SLAG: {
    icon: Flag,
    label: 'Golfslag',
    description: 'Slagkvalitet, nøyaktighet',
    color: 'var(--success)',
    bgColor: 'color-mix(in srgb, var(--success) 10%, transparent)',
  },
  SPILL: {
    icon: Gamepad2,
    label: 'Spill',
    description: 'Strategi, banehåndtering',
    color: 'var(--warning)',
    bgColor: 'color-mix(in srgb, var(--warning) 10%, transparent)',
  },
  TURN: {
    icon: Trophy,
    label: 'Turnering',
    description: 'Mental prestasjon',
    color: 'var(--text-primary)',
    bgColor: 'color-mix(in srgb, var(--text-primary) 10%, transparent)',
  },
};

// Standard session templates
const SESSION_TEMPLATES = [
  {
    id: 'fys-styrke-60',
    pyramid: 'FYS',
    title: 'Fysisk Trening - Styrke',
    duration: 60,
    description: 'Styrketrening for golffunksjonelle bevegelser',
    formula: 'FYS-STYRKE-60',
  },
  {
    id: 'tek-fullswing-90',
    pyramid: 'TEK',
    title: 'Teknikk - Full Swing',
    duration: 90,
    description: 'Teknikk trening på full swing bevegelse',
    formula: 'TEK-INN150-L-BALL-80',
  },
  {
    id: 'tek-putting-60',
    pyramid: 'TEK',
    title: 'Teknikk - Putting',
    duration: 60,
    description: 'Putting teknikk og presisjon',
    formula: 'TEK-PUTT5-10-L-AUTO-100',
  },
  {
    id: 'slag-fullswing-90',
    pyramid: 'SLAG',
    title: 'Golfslag - Full Swing',
    duration: 90,
    description: 'Slag kvalitet på fulle svinger',
    formula: 'SLAG-INN150-100-M2-PR2',
  },
  {
    id: 'slag-shortgame-75',
    pyramid: 'SLAG',
    title: 'Golfslag - Kortspill',
    duration: 75,
    description: 'Chip, pitch, og bunker øving',
    formula: 'SLAG-CHIP-100-M2-PR2',
  },
  {
    id: 'spill-bane-120',
    pyramid: 'SPILL',
    title: 'Spill - Baneøkt',
    duration: 120,
    description: 'Spill på bane med strategisk fokus',
    formula: 'SPILL-BANE-STRATEGI-M5-PR3',
  },
];

export default function MobileSessionTemplates() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleTemplateClick = (template) => {
    // Navigate to session planner with pre-filled template
    navigate('/calendar', {
      state: {
        openPlanner: true,
        template: template,
      },
    });
  };

  return (
    <div className="min-h-screen bg-ak-surface-base p-4">
      <PageTitle className="text-2xl font-bold text-ak-text-primary mb-6">
        Standard Økter
      </PageTitle>

      <p className="text-sm text-ak-text-secondary mb-6">
        Velg en standard treningsøkt basert på AK-formelen. Du kan tilpasse økten etter valg.
      </p>

      <div className="space-y-3">
        {SESSION_TEMPLATES.map((template) => {
          const config = PYRAMID_CONFIGS[template.pyramid];
          const Icon = config.icon;

          return (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="w-full p-4 rounded-lg border-2 border-ak-border-default bg-ak-surface-base hover:bg-ak-surface-subtle transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                {/* Pyramid badge */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: config.bgColor,
                    color: config.color,
                  }}
                >
                  <Icon size={24} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <SubSectionTitle className="text-base font-semibold text-ak-text-primary mb-1" style={{ marginBottom: 0 }}>
                    {template.title}
                  </SubSectionTitle>
                  <p className="text-xs text-ak-text-secondary mb-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-ak-text-tertiary">
                    <span>{template.duration} min</span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">{template.formula}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom session button */}
      <button
        onClick={() => navigate('/calendar', { state: { openPlanner: true } })}
        className="w-full mt-4 p-4 rounded-lg border-2 border-dashed border-ak-border-default bg-transparent hover:bg-ak-surface-subtle transition-colors text-center"
      >
        <p className="text-sm font-medium text-ak-text-secondary">
          + Opprett egendefinert økt
        </p>
      </button>
    </div>
  );
}
