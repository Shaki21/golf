/**
 * TIER Golf - Session Detail View
 * Design System v3.0 - Premium Light
 *
 * Viser full økt med AK-formel hierarki og alle blokker.
 * Integrert med AK_GOLF_KATEGORI_HIERARKI_v2.0
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Dumbbell,
  Target,
  Flag,
  Gamepad2,
  Trophy
} from 'lucide-react';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { Button } from '../../ui/primitives';
import { SubSectionTitle } from '../../components/typography';

// =============================================================================
// AK HIERARCHY CONSTANTS (from useAKFormula)
// =============================================================================

const PYRAMIDS = {
  FYS: { label: 'Fysisk', Icon: Dumbbell, description: 'Styrke, power, mobilitet' },
  TEK: { label: 'Teknikk', Icon: Target, description: 'Bevegelsesmønster, posisjoner' },
  SLAG: { label: 'Golfslag', Icon: Flag, description: 'Slagkvalitet, nøyaktighet' },
  SPILL: { label: 'Spill', Icon: Gamepad2, description: 'Strategi, banehåndtering' },
  TURN: { label: 'Turnering', Icon: Trophy, description: 'Mental prestasjon' },
};

const L_PHASES = {
  'L-BODY': { label: 'Body only', short: 'Body' },
  'L-ARM': { label: 'With arms', short: 'Arm' },
  'L-CLUB': { label: 'With club', short: 'Club' },
  'L-BALL': { label: 'With ball', short: 'Ball' },
  'L-AUTO': { label: 'Automated', short: 'Auto' },
};

const ENVIRONMENTS = {
  M0: { label: 'Off-course', short: 'Gym' },
  M1: { label: 'Simulator', short: 'Sim' },
  M2: { label: 'Range', short: 'Range' },
  M3: { label: 'Øvingsfelt', short: 'Øving' },
  M4: { label: 'Bane (trening)', short: 'Bane' },
  M5: { label: 'Bane (turnering)', short: 'Turn' },
};

const PRESSURE_LEVELS = {
  PR1: { label: 'Ingen press', short: 'Lav' },
  PR2: { label: 'Selvmonitorering', short: 'Moderat' },
  PR3: { label: 'Sosial', short: 'Sosial' },
  PR4: { label: 'Konkurranse', short: 'Konk' },
  PR5: { label: 'Turnering', short: 'Høy' },
};

// =============================================================================
// STYLING HELPERS
// =============================================================================

const getPyramidClasses = (pyramid) => {
  const classes = {
    FYS: 'bg-red-500/15 text-red-600 border-red-500/30',
    TEK: 'bg-tier-navy/15 text-tier-navy border-tier-navy/30',
    SLAG: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    SPILL: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    TURN: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
  };
  return classes[pyramid] || classes.TEK;
};

const getLPhaseClasses = (phase) => {
  const intensity = {
    'L-BODY': 'bg-tier-surface-base text-tier-text-secondary',
    'L-ARM': 'bg-tier-navy/10 text-tier-navy',
    'L-CLUB': 'bg-tier-navy/20 text-tier-navy',
    'L-BALL': 'bg-tier-navy/30 text-tier-navy',
    'L-AUTO': 'bg-tier-navy text-white',
  };
  return intensity[phase] || intensity['L-BALL'];
};

const getCsLevelClasses = (level) => {
  if (level <= 30) return 'bg-tier-surface-base text-tier-text-secondary';
  if (level <= 50) return 'bg-emerald-500/15 text-emerald-600';
  if (level <= 70) return 'bg-emerald-500/25 text-emerald-600';
  if (level <= 90) return 'bg-emerald-500/40 text-emerald-700';
  return 'bg-emerald-500 text-white';
};

const getEnvironmentClasses = (env) => {
  const classes = {
    M0: 'bg-gray-100 text-gray-600',
    M1: 'bg-blue-500/15 text-blue-600',
    M2: 'bg-green-500/15 text-green-600',
    M3: 'bg-emerald-500/20 text-emerald-600',
    M4: 'bg-emerald-500/30 text-emerald-700',
    M5: 'bg-emerald-500 text-white',
  };
  return classes[env] || classes.M2;
};

const getPressureClasses = (pressure) => {
  const classes = {
    PR1: 'bg-gray-100 text-gray-500',
    PR2: 'bg-amber-500/15 text-amber-600',
    PR3: 'bg-amber-500/25 text-amber-600',
    PR4: 'bg-amber-500/40 text-amber-700',
    PR5: 'bg-amber-500 text-tier-navy',
  };
  return classes[pressure] || classes.PR2;
};

const getStatusClasses = (status) => {
  const classes = {
    Planlagt: 'bg-tier-surface-base text-tier-text-secondary',
    Pågår: 'bg-tier-warning text-tier-navy',
    Fullført: 'bg-tier-success text-white',
  };
  return classes[status] || classes.Planlagt;
};

// =============================================================================
// COMPONENTS
// =============================================================================

// Tag component for parameters
function Tag({ label, colorClasses, tooltip }) {
  return (
    <span
      className={`inline-flex items-center py-1 px-2.5 rounded-md text-xs font-medium ${colorClasses}`}
      title={tooltip}
    >
      {label}
    </span>
  );
}

// AK Formula Card - Shows the complete formula breakdown
function FormulaCard({ session }) {
  const pyramid = session.pyramid || 'TEK';
  const pyramidInfo = PYRAMIDS[pyramid] || PYRAMIDS.TEK;

  return (
    <div className="bg-tier-white rounded-xl p-4 mb-4 border border-tier-border-default">
      {/* Formula header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-tier-text-tertiary uppercase tracking-wide">
          AK-Formel
        </span>
        {session.formula && (
          <code className="text-xs bg-tier-surface-base px-2 py-1 rounded font-mono text-tier-text-secondary">
            {session.formula}
          </code>
        )}
      </div>

      {/* Pyramid badge */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getPyramidClasses(pyramid)}`}>
          <pyramidInfo.Icon size={20} />
          <div>
            <div className="font-semibold text-sm">{pyramidInfo.label}</div>
            <div className="text-xs opacity-75">{pyramidInfo.description}</div>
          </div>
        </div>
      </div>

      {/* Parameters grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* L-Phase */}
        {session.lPhase && (
          <div className="bg-tier-surface-base rounded-lg p-3">
            <span className="text-xs text-tier-text-tertiary block mb-1">L-Fase</span>
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getLPhaseClasses(session.lPhase)}`}>
              {L_PHASES[session.lPhase]?.label || session.lPhase}
            </span>
          </div>
        )}

        {/* CS Level */}
        {session.csLevel !== undefined && (
          <div className="bg-tier-surface-base rounded-lg p-3">
            <span className="text-xs text-tier-text-tertiary block mb-1">Clubspeed</span>
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getCsLevelClasses(session.csLevel)}`}>
              CS{session.csLevel}%
            </span>
          </div>
        )}

        {/* Environment */}
        {session.environment && (
          <div className="bg-tier-surface-base rounded-lg p-3">
            <span className="text-xs text-tier-text-tertiary block mb-1">Miljø</span>
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEnvironmentClasses(session.environment)}`}>
              {session.environment} – {ENVIRONMENTS[session.environment]?.label || ''}
            </span>
          </div>
        )}

        {/* Pressure */}
        {session.pressure && (
          <div className="bg-tier-surface-base rounded-lg p-3">
            <span className="text-xs text-tier-text-tertiary block mb-1">Press</span>
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPressureClasses(session.pressure)}`}>
              {session.pressure} – {PRESSURE_LEVELS[session.pressure]?.label || ''}
            </span>
          </div>
        )}

        {/* P-Positions */}
        {session.positionStart && (
          <div className="bg-tier-surface-base rounded-lg p-3 col-span-2">
            <span className="text-xs text-tier-text-tertiary block mb-1">P-Posisjon (MORAD)</span>
            <span className="text-sm font-medium text-tier-navy">
              {session.positionStart}
              {session.positionEnd && session.positionEnd !== session.positionStart && (
                <> → {session.positionEnd}</>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Single block component
function SessionBlock({ block, index, total, expanded, onToggle, onComplete }) {
  const pyramid = block.pyramid || 'TEK';
  const pyramidInfo = PYRAMIDS[pyramid] || PYRAMIDS.TEK;

  return (
    <div className="bg-tier-white rounded-xl shadow-sm mb-3 overflow-hidden border border-tier-border-default">
      {/* Block header */}
      <div
        onClick={() => onToggle(index)}
        className={`flex justify-between items-center p-4 cursor-pointer hover:bg-tier-surface-base/50 transition-colors ${
          expanded ? 'border-b border-tier-border-default' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Pyramid badge mini */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPyramidClasses(pyramid)}`}>
            <pyramidInfo.Icon size={20} />
          </div>
          <div>
            <div className="font-semibold text-tier-navy text-[15px]">
              {block.exercise}
            </div>
            <div className="text-xs text-tier-text-secondary">
              Blokk {index + 1} av {total} • {block.duration} min
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {block.completed && (
            <CheckCircle2 size={20} className="text-tier-success" />
          )}
          {expanded ? (
            <ChevronUp size={20} className="text-tier-text-tertiary" />
          ) : (
            <ChevronDown size={20} className="text-tier-text-tertiary" />
          )}
        </div>
      </div>

      {/* Block content (expanded) */}
      {expanded && (
        <div className="p-4">
          {/* Focus and area */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-tier-text-tertiary block mb-1">Fokus</span>
              <span className="text-sm font-medium text-tier-navy">{block.focus}</span>
            </div>
            <div>
              <span className="text-xs text-tier-text-tertiary block mb-1">Treningsområde</span>
              <span className="text-sm font-medium text-tier-navy">{block.trainingArea}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="mb-4">
            <span className="text-xs text-tier-text-tertiary block mb-1">Volum</span>
            <span className="text-sm font-medium text-tier-navy">
              {block.reps} repetisjoner
            </span>
          </div>

          {/* Tags - Hierarchy parameters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {block.lPhase && (
              <Tag
                label={L_PHASES[block.lPhase]?.short || block.lPhase}
                colorClasses={getLPhaseClasses(block.lPhase)}
                tooltip={L_PHASES[block.lPhase]?.label}
              />
            )}
            {block.csLevel !== undefined && (
              <Tag
                label={`CS${block.csLevel}%`}
                colorClasses={getCsLevelClasses(block.csLevel)}
                tooltip={`Clubspeed ${block.csLevel}%`}
              />
            )}
            {block.environment && (
              <Tag
                label={block.environment}
                colorClasses={getEnvironmentClasses(block.environment)}
                tooltip={ENVIRONMENTS[block.environment]?.label}
              />
            )}
            {block.pressure && (
              <Tag
                label={block.pressure}
                colorClasses={getPressureClasses(block.pressure)}
                tooltip={PRESSURE_LEVELS[block.pressure]?.label}
              />
            )}
            {block.position && (
              <Tag
                label={block.position}
                colorClasses="bg-purple-500/15 text-purple-600"
                tooltip={`P-posisjon: ${block.position}`}
              />
            )}
          </div>

          {/* Instructions */}
          {block.instructions && (
            <div className="bg-tier-surface-base rounded-lg p-3 mb-4">
              <span className="text-xs font-medium text-tier-navy block mb-1">
                Instruksjoner
              </span>
              <span className="text-sm text-tier-navy">
                {block.instructions}
              </span>
            </div>
          )}

          {/* Complete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(index);
            }}
            className={`flex items-center justify-center gap-2 w-full p-3 rounded-lg cursor-pointer text-sm font-medium transition-colors ${
              block.completed
                ? 'bg-tier-success text-white'
                : 'bg-tier-surface-base text-tier-navy hover:bg-tier-border-default'
            }`}
          >
            {block.completed ? (
              <>
                <CheckCircle2 size={18} />
                Fullført
              </>
            ) : (
              <>
                <Circle size={18} />
                Marker som fullført
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SessionDetailView({ session, onBack, onStartSession }) {
  const navigate = useNavigate();
  const [expandedBlocks, setExpandedBlocks] = useState({ 0: true }); // First block expanded by default
  const [blocks, setBlocks] = useState(session?.blocks || []);

  const handleEvaluate = () => {
    navigate(`/session/${session.id}/evaluate`);
  };

  const toggleBlock = (index) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const completeBlock = (index) => {
    setBlocks(prev => prev.map((block, i) =>
      i === index ? { ...block, completed: !block.completed } : block
    ));
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-[15px] text-tier-text-secondary">
          Ingen økt valgt
        </span>
      </div>
    );
  }

  const completedCount = blocks.filter(b => b.completed).length;
  const totalDuration = blocks.reduce((sum, b) => sum + (b.duration || 0), 0);

  return (
    <div className="bg-tier-white min-h-screen">
      {/* Header */}
      <PageHeader
        title={session.title || 'Treningsøkt'}
        subtitle={session.date}
        helpText="Detaljert oversikt over treningsøkten med alle blokker, øvelser og metadata. Se AK-formel hierarki (Pyramide, L-fase, CS-nivå), miljø og press for hver blokk."
        onBack={onBack}
        actions={
          <Button variant="ghost" size="sm">
            ⋮
          </Button>
        }
      />

      <div className="p-4 max-w-2xl mx-auto">
        {/* AK Formula Card */}
        <FormulaCard session={session} />

        {/* Session meta info - Required field order */}
        <div className="bg-tier-white rounded-xl p-4 mb-4 border border-tier-border-default">
          <div className="space-y-3">
            {/* 1. Beskrivelse */}
            {session.description && (
              <div>
                <span className="text-xs text-tier-text-tertiary block mb-1">Beskrivelse</span>
                <span className="text-sm text-tier-navy">{session.description}</span>
              </div>
            )}

            {/* 2. Dato */}
            <div>
              <span className="text-xs text-tier-text-tertiary block mb-1">Dato</span>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-tier-text-tertiary" />
                <span className="text-sm text-tier-navy">{session.date}</span>
              </div>
            </div>

            {/* 3. Varighet */}
            <div>
              <span className="text-xs text-tier-text-tertiary block mb-1">Varighet</span>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-tier-text-tertiary" />
                <span className="text-sm text-tier-navy">
                  {session.startTime} – {session.endTime} ({session.duration || totalDuration} min)
                </span>
              </div>
            </div>

            {/* 4. Lokasjon */}
            <div>
              <span className="text-xs text-tier-text-tertiary block mb-1">Lokasjon</span>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-tier-text-tertiary" />
                <span className="text-sm text-tier-navy">{session.location}</span>
              </div>
            </div>

            {/* 5. Status */}
            <div>
              <span className="text-xs text-tier-text-tertiary block mb-1">Status</span>
              <span className={`inline-flex items-center py-1 px-2.5 rounded-full text-xs font-semibold ${getStatusClasses(session.status)}`}>
                {session.status}
              </span>
            </div>

            {/* 6. Øvelser/drill (count from blocks) */}
            <div>
              <span className="text-xs text-tier-text-tertiary block mb-1">Øvelser/drill</span>
              <span className="text-sm text-tier-navy">{blocks.length} øvelser</span>
            </div>

            {/* 7. Reps (total from blocks) */}
            <div>
              <span className="text-xs text-tier-text-tertiary block mb-1">Reps</span>
              <span className="text-sm text-tier-navy">
                {blocks.reduce((sum, b) => sum + (b.reps || 0), 0)} totalt
              </span>
            </div>

            {/* 8. L fase */}
            {session.lPhase && (
              <div>
                <span className="text-xs text-tier-text-tertiary block mb-1">L fase</span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getLPhaseClasses(session.lPhase)}`}>
                  {L_PHASES[session.lPhase]?.label || session.lPhase}
                </span>
              </div>
            )}

            {/* 9. Treningsområde (from pyramid) */}
            {session.pyramid && (
              <div>
                <span className="text-xs text-tier-text-tertiary block mb-1">Treningsområde</span>
                <span className="text-sm text-tier-navy">{PYRAMIDS[session.pyramid]?.label || session.pyramid}</span>
              </div>
            )}

            {/* 10. Club speed */}
            {session.csLevel !== undefined && (
              <div>
                <span className="text-xs text-tier-text-tertiary block mb-1">Club speed</span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getCsLevelClasses(session.csLevel)}`}>
                  CS{session.csLevel}%
                </span>
              </div>
            )}

            {/* 11. Miljø */}
            {session.environment && (
              <div>
                <span className="text-xs text-tier-text-tertiary block mb-1">Miljø</span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEnvironmentClasses(session.environment)}`}>
                  {session.environment} – {ENVIRONMENTS[session.environment]?.label || ''}
                </span>
              </div>
            )}

            {/* 12. Belastning (pressure) */}
            {session.pressure && (
              <div>
                <span className="text-xs text-tier-text-tertiary block mb-1">Belastning</span>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPressureClasses(session.pressure)}`}>
                  {session.pressure} – {PRESSURE_LEVELS[session.pressure]?.label || ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="bg-tier-white rounded-xl p-4 mb-4 border border-tier-border-default">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-tier-navy">
              Fremgang
            </span>
            <span className="text-sm text-tier-text-secondary">
              {completedCount} av {blocks.length} blokker
            </span>
          </div>
          <div className="h-2 bg-tier-surface-base rounded-full overflow-hidden">
            <div
              className="h-full bg-tier-success rounded-full transition-all duration-300"
              style={{ width: `${blocks.length > 0 ? (completedCount / blocks.length) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-tier-text-tertiary">
            <span>{totalDuration} min totalt</span>
            <span>{blocks.length} blokker</span>
          </div>
        </div>

        {/* Blocks section */}
        <div className="mb-4">
          <SubSectionTitle className="text-sm mb-3 flex items-center gap-2">
            <Target size={16} />
            Treningsblokker
          </SubSectionTitle>

          {blocks.map((block, index) => (
            <SessionBlock
              key={index}
              block={block}
              index={index}
              total={blocks.length}
              expanded={expandedBlocks[index]}
              onToggle={toggleBlock}
              onComplete={completeBlock}
            />
          ))}
        </div>

        {/* Notes */}
        <div className="bg-tier-white rounded-xl p-4 mb-4 border border-tier-border-default">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-tier-navy">
              Notater
            </span>
          </div>
          <textarea
            placeholder="Legg til notater fra økten..."
            className="w-full min-h-[80px] p-3 bg-tier-surface-base border border-tier-border-default rounded-lg resize-y text-sm text-tier-navy focus:outline-none focus:ring-2 focus:ring-tier-navy/30"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 pb-6">
          {session.status === 'Planlagt' && (
            <Button
              variant="primary"
              onClick={onStartSession}
              className="w-full"
            >
              Start økt
            </Button>
          )}

          {(session.status === 'Pågår' || session.completionStatus === 'in_progress') && (
            <Button
              variant="primary"
              onClick={handleEvaluate}
              className="w-full bg-tier-success hover:bg-tier-success/90"
            >
              Evaluer økt
            </Button>
          )}

          {session.status === 'Pågår' && onStartSession && (
            <Button
              variant="secondary"
              onClick={onStartSession}
              className="w-full"
            >
              Fortsett økt
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// DEMO DATA (with full hierarchy)
// =============================================================================

export const demoSession = {
  id: '1',
  title: 'Teknikk – Innspill',
  formula: 'TEK_INN100_L-BALL_CS80_M3_PR2_P4.0-P7.0',
  pyramid: 'TEK',
  lPhase: 'L-BALL',
  csLevel: 80,
  environment: 'M3',
  pressure: 'PR2',
  positionStart: 'P4.0',
  positionEnd: 'P7.0',
  date: 'Mandag 16. desember 2025',
  startTime: '09:00',
  endTime: '11:00',
  duration: 120,
  location: 'Driving Range, Miklagard',
  status: 'Planlagt',
  blocks: [
    {
      exercise: 'Pyramiden',
      focus: 'Teknikk innspill',
      trainingArea: 'INN100 (100-150m)',
      pyramid: 'TEK',
      lPhase: 'L-BALL',
      csLevel: 80,
      environment: 'M3',
      pressure: 'PR2',
      position: 'P4.0-P7.0',
      reps: 300,
      duration: 30,
      instructions: 'Start med 1 slag, øk til 10, deretter ned igjen. Fokuser på konsistens.',
      completed: false,
    },
    {
      exercise: 'Scattered Targets',
      focus: 'Variasjon og transfer',
      trainingArea: 'INN50 (50-100m)',
      pyramid: 'SLAG',
      lPhase: 'L-AUTO',
      csLevel: 90,
      environment: 'M4',
      pressure: 'PR3',
      reps: 200,
      duration: 30,
      instructions: 'Bytt mål og klubb for hvert slag. Full pre-shot rutine.',
      completed: false,
    },
    {
      exercise: '9-holes Putting',
      focus: 'Spill under press',
      trainingArea: 'PUTT5-10',
      pyramid: 'SPILL',
      lPhase: 'L-AUTO',
      environment: 'M5',
      pressure: 'PR4',
      reps: 50,
      duration: 30,
      instructions: 'Simuler 9 hull. Spill mot par.',
      completed: false,
    },
    {
      exercise: 'Kjernetrening',
      focus: 'Stabilitet og mobilitet',
      trainingArea: 'Fysisk',
      pyramid: 'FYS',
      environment: 'M0',
      pressure: 'PR1',
      reps: 36,
      duration: 30,
      instructions: 'Fokus på hoftemobilitet og kjerneaktivering.',
      completed: false,
    },
  ],
};
