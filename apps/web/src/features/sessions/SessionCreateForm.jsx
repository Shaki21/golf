/**
 * TIER Golf - Session Create Form
 * Design System v3.0 - Premium Light
 *
 * Basert på AK-formelsystemet fra KATEGORI_HIERARKI v2.0
 * Format: [Pyramide]_[Område]_L-[fase]_CS[nivå]_M[miljø]_PR[press]_[P-posisjon]
 *
 * Struktur:
 * 1. Grunninfo (Dato, Tidspunkt, Varighet, Sted)
 * 2. Pyramide-kategori (FYS, TEK, SLAG, SPILL, TURN)
 * 3. Treningsområde (16 områder)
 * 4. L-Fase (Motorisk læring: KROPP → ARM → KØLLE → BALL → AUTO)
 * 5. CS-Nivå (Clubspeed 0-100%)
 * 6. M-Miljø (Off-course → Simulator → Range → Øvingsfelt → Bane)
 * 7. PR-Press (Ingen → Selvmon → Sosial → Konkurranse → Turnering)
 * 8. Øvelser/Driller med repetisjoner
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Target,
  Layers,
  GraduationCap,
  Gauge,
  Building,
  Flame,
  Dumbbell,
  Plus,
  Minus,
  FileText,
  ChevronDown,
  ChevronUp,
  Repeat,
  CheckCircle,
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import { CardTitle } from '../../components/typography';
import {
  useLegacyTrainingAreas,
  useLegacyPhases,
  useLegacyIntensityLevels,
  useLegacyEnvironments,
  useLegacyPressureLevels,
} from '../../hooks/useTrainingConfig';
import {
  TrainingPyramidSelector,
  RecurrenceSelector,
  DurationSlider,
  ExerciseSelector,
  SessionSummary,
} from './components';

// ============================================================================
// CONSTANTS - AK-formel Hierarki v2.0
// ============================================================================

// Pyramide-kategorier (rekkefølge fra fundament til topp)
const PYRAMID_CATEGORIES = [
  {
    code: 'FYS',
    label: 'Fysisk',
    description: 'Styrke, power, mobilitet, stabilitet, kondisjon',
    icon: 'Dumbbell',
    color: 'rgb(var(--status-warning))', // Orange
    usesCS: false,
    usesP: false,
  },
  {
    code: 'TEK',
    label: 'Teknikk',
    description: 'Bevegelsesmønster, posisjoner, sekvens',
    icon: 'Target',
    color: 'rgb(var(--category-j))', // Purple
    usesCS: true,
    usesP: true,
  },
  {
    code: 'SLAG',
    label: 'Golfslag',
    description: 'Slagkvalitet, avstand, nøyaktighet, konsistens',
    icon: 'Golf',
    color: 'rgb(var(--status-info))', // Teal
    usesCS: true,
    usesP: true,
  },
  {
    code: 'SPILL',
    label: 'Spill',
    description: 'Strategi, banehåndtering, scoring, beslutninger',
    icon: 'Flag',
    color: 'rgb(var(--status-success))', // Green
    usesCS: true,
    usesP: false,
  },
  {
    code: 'TURN',
    label: 'Turnering',
    description: 'Mental prestasjon, konkurransefokus',
    icon: 'Trophy',
    color: 'rgb(var(--tier-gold))', // Gold
    usesCS: false,
    usesP: false,
  },
];

// Treningsområder (16 områder fra hierarkiet)
const TRAINING_AREAS = {
  fullSwing: {
    label: 'Full Swing',
    areas: [
      { code: 'TEE', label: 'Tee Total', icon: 'Golf', description: 'Driver, 3-wood', usesCS: true },
      { code: 'INN200', label: 'Innspill 200+ m', icon: 'Target', description: '3-wood, hybrid, long iron', usesCS: true },
      { code: 'INN150', label: 'Innspill 150-200 m', icon: 'Target', description: '5-7 iron', usesCS: true },
      { code: 'INN100', label: 'Innspill 100-150 m', icon: 'Target', description: '8-PW', usesCS: true },
      { code: 'INN50', label: 'Innspill 50-100 m', icon: 'Target', description: 'Wedges (full swing)', usesCS: true },
    ],
  },
  shortGame: {
    label: 'Naerspill',
    areas: [
      { code: 'CHIP', label: 'Chip', icon: 'Ruler', description: 'Lav bue, mye rulle', usesCS: false },
      { code: 'PITCH', label: 'Pitch', icon: 'Ruler', description: 'Middels bue, middels rulle', usesCS: false },
      { code: 'LOB', label: 'Lob', icon: 'Ruler', description: 'Høy bue, lite rulle', usesCS: false },
      { code: 'BUNKER', label: 'Bunker', icon: 'Umbrella', description: 'Sand, greenside', usesCS: false },
    ],
  },
  putting: {
    label: 'Putting',
    areas: [
      { code: 'PUTT0-3', label: '0-3 ft', icon: 'Flag', description: 'Makk-putts', usesCS: false },
      { code: 'PUTT3-5', label: '3-5 ft', icon: 'Flag', description: 'Korte', usesCS: false },
      { code: 'PUTT5-10', label: '5-10 ft', icon: 'Flag', description: 'Mellom', usesCS: false },
      { code: 'PUTT10-15', label: '10-15 ft', icon: 'Flag', description: 'Mellom-lange', usesCS: false },
      { code: 'PUTT15-25', label: '15-25 ft', icon: 'Flag', description: 'Lange', usesCS: false },
      { code: 'PUTT25-40', label: '25-40 ft', icon: 'Flag', description: 'Lag putts', usesCS: false },
      { code: 'PUTT40+', label: '40+ ft', icon: 'Flag', description: 'Ekstra lange', usesCS: false },
    ],
  },
};

// L-Faser (Motorisk læring) - FASE 5 Updated
const L_PHASES = [
  { code: 'L1', label: 'L1 - Bevegelse kun med kropp', description: 'Kun kroppsbevegelse, ingen utstyr', icon: 'Body', csRange: null, showCS: false },
  { code: 'L2', label: 'L2 - Kropp + armer', description: 'Kropp + armer, ingen kølle/ball', icon: 'Arm', csRange: null, showCS: false },
  { code: 'L3', label: 'L3 - Med golfkølle u/golfball', description: 'Med golfkølle uten golfball', icon: 'Golf', csRange: '40-60%', showCS: true },
  { code: 'L4', label: 'L4 - Bevegelse med golfball', description: 'Bevegelse med golfball', icon: 'Circle', csRange: '50-70%', showCS: true },
  { code: 'L5', label: 'L5 - Automatisk bevegelse', description: 'Full hastighet, automatisert', icon: 'Zap', csRange: '80-100%', showCS: true },
];

// CS-Nivåer (Clubspeed) - FASE 5 Updated: Range 50% → 110%
const CS_LEVELS = [
  { code: 'CS50', value: 50, label: '50%', description: 'Moderat, komfortsone' },
  { code: 'CS55', value: 55, label: '55%', description: 'Lett økt tempo' },
  { code: 'CS60', value: 60, label: '60%', description: 'Økt hastighet' },
  { code: 'CS65', value: 65, label: '65%', description: 'Middels tempo' },
  { code: 'CS70', value: 70, label: '70%', description: 'Konkurranselignende' },
  { code: 'CS75', value: 75, label: '75%', description: 'Høy intensitet' },
  { code: 'CS80', value: 80, label: '80%', description: 'Veldig høy intensitet' },
  { code: 'CS85', value: 85, label: '85%', description: 'Nær maksimal' },
  { code: 'CS90', value: 90, label: '90%', description: 'Nær-maksimal' },
  { code: 'CS95', value: 95, label: '95%', description: 'Nesten full innsats' },
  { code: 'CS100', value: 100, label: '100%', description: 'Maksimal innsats' },
  { code: 'CS105', value: 105, label: '105%', description: 'Over maksimal (overspeed)' },
  { code: 'CS110', value: 110, label: '110%', description: 'Maksimal overspeed' },
];

// M-Miljø (Fysisk kontekst) - FASE 5 Updated
const M_ENVIRONMENTS = [
  { code: 'M0', label: 'Utenfor vanlig treningsarena', description: 'F.eks gym, hjemme, hagen', icon: 'Dumbbell' },
  { code: 'M1', label: 'Range', description: 'Driving range, matte eller gress', icon: 'Building' },
  { code: 'M2', label: 'Simulator', description: 'Innendørs simulator, Trackman', icon: 'Home' },
  { code: 'M3', label: 'Øvingsfelt', description: 'Chipping green, putting green', icon: 'Flag' },
  { code: 'M4', label: 'Bane (Trening)', description: 'Treningsrunde på bane', icon: 'Trees' },
  { code: 'M5', label: 'Bane (Spill)', description: 'Spillrunde, turnering', icon: 'Trophy' },
];

// PR-Press/Belastning (Fysisk & Mental) - FASE 5 Updated
const PR_LEVELS = [
  { code: 'PR1', label: 'Ingen press', description: 'Du trener alene', icon: 'Smile' },
  { code: 'PR2', label: 'Datadrevet', description: 'Feedback fra tester, måleutstyr', icon: 'BarChart' },
  { code: 'PR3', label: 'Sosial', description: 'Sammen med andre spillere eller trenere', icon: 'Users' },
  { code: 'PR4', label: 'Inter konkurranse', description: 'Konkurranse utenfor turnering', icon: 'Flame' },
  { code: 'PR5', label: 'Turnering', description: 'Resultat teller, ranking', icon: 'Trophy' },
];

// P-Posisjoner (for teknikk)
const P_POSITIONS = [
  { code: 'P1.0', label: 'Address', description: 'Statisk startposisjon' },
  { code: 'P2.0', label: 'Takeaway', description: 'Skaft parallelt med bakken (backswing)' },
  { code: 'P3.0', label: 'Mid-Backswing', description: 'Lead arm parallelt med bakken' },
  { code: 'P4.0', label: 'Topp', description: 'Maksimal rotasjon, svingens apex' },
  { code: 'P5.0', label: 'Transition', description: 'Lead arm parallelt (downswing start)' },
  { code: 'P6.0', label: 'Delivery', description: 'Skaft parallelt med bakken (downswing)' },
  { code: 'P7.0', label: 'Impact', description: 'Treff, moment of truth' },
  { code: 'P8.0', label: 'Release', description: 'Skaft parallelt post-impact' },
  { code: 'P9.0', label: 'Follow-through', description: 'Trail arm parallelt' },
  { code: 'P10.0', label: 'Finish', description: 'Fullført rotasjon, balanse' },
];

// Putting-fokus
const PUTTING_FOCUS = [
  { code: 'GREEN', label: 'Greenlesning', description: 'Fall, break, grain' },
  { code: 'SIKTE', label: 'Sikte', description: 'Alignment, aim point' },
  { code: 'TEKN', label: 'Teknikk', description: 'FWD press, loft, attack' },
  { code: 'BALL', label: 'Ballstart', description: 'Startlinje' },
  { code: 'SPEED', label: 'Speed', description: 'Lengdekontroll' },
];

// Putting-faser
const PUTTING_PHASES = [
  { code: 'S', label: 'Setup', description: 'Adressering, alignment' },
  { code: 'B', label: 'Backstroke', description: 'Tilbakeslag' },
  { code: 'I', label: 'Impact', description: 'Treff' },
  { code: 'F', label: 'Follow-through', description: 'Gjennomslag' },
];

// Turneringstyper
const TOURNAMENT_TYPES = [
  { code: 'RES', label: 'Resultat', description: 'Full prestasjonsmodus' },
  { code: 'UTV', label: 'Utvikling', description: 'Teste spesifikke ting under press' },
  { code: 'TRE', label: 'Trening', description: 'Teknisk trening på banen' },
];

// Fysisk-fokus
const PHYSICAL_FOCUS = [
  { code: 'STYRKE', label: 'Styrke', icon: 'Dumbbell' },
  { code: 'POWER', label: 'Power', icon: 'Zap' },
  { code: 'MOBILITET', label: 'Mobilitet', icon: 'StretchHorizontal' },
  { code: 'STABILITET', label: 'Stabilitet', icon: 'Scale' },
  { code: 'KONDISJON', label: 'Kondisjon', icon: 'Activity' },
];

// Steder
const LOCATIONS = [
  { id: 'holtsmark', label: 'Holtsmark GK' },
  { id: 'oslo_gk', label: 'Oslo GK' },
  { id: 'bogstad', label: 'Bogstad GK' },
  { id: 'losby', label: 'Losby GK' },
  { id: 'range', label: 'Driving Range' },
  { id: 'home', label: 'Hjemme' },
  { id: 'gym', label: 'Treningssenter' },
  { id: 'simulator', label: 'Simulator' },
  { id: 'other', label: 'Annet' },
];

// Varighet (minutter)
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 150, 180];

// ============================================================================
// SECTION COMPONENT
// ============================================================================

function FormSection({ title, icon: Icon, children, number, collapsed, onToggle, optional = false }) {
  return (
    <div className="mb-4 bg-tier-white rounded-xl border border-tier-border-default overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-tier-surface-base border-b border-tier-border-default"
      >
        <div className="flex items-center gap-3">
          {number && (
            <span className="w-6 h-6 rounded-full bg-tier-navy text-white text-xs font-bold flex items-center justify-center">
              {number}
            </span>
          )}
          {Icon && <Icon size={18} className="text-tier-text-secondary" />}
          <span className="text-sm font-semibold text-tier-navy">{title}</span>
          {optional && <span className="text-xs text-tier-text-tertiary">(valgfritt)</span>}
        </div>
        {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>
      {!collapsed && <div className="p-4">{children}</div>}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function PyramidCategorySelector({ selected, onChange }) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-tier-text-secondary mb-3 p-3 bg-tier-surface-base rounded-lg">
        <strong>Treningspyramiden:</strong> Bygg fundamentet først. FYS danner grunnlaget, deretter
        TEK → SLAG → SPILL → TURN.
      </div>
      {PYRAMID_CATEGORIES.map((cat, index) => {
        const isSelected = selected === cat.code;
        return (
          <button
            key={cat.code}
            type="button"
            onClick={() => onChange(cat.code)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
              isSelected
                ? 'bg-tier-navy/10 border-tier-navy'
                : 'bg-tier-surface-base border-transparent hover:border-tier-border-default'
            }`}
            style={isSelected ? { borderColor: cat.color } : {}}
          >
            <span className="text-2xl">{cat.icon}</span>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm" style={{ color: cat.color }}>
                  {cat.code}
                </span>
                <span className="font-medium text-tier-navy">{cat.label}</span>
              </div>
              <div className="text-xs text-tier-text-secondary">{cat.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-tier-text-tertiary">Nivå {index + 1}</span>
              {isSelected && <span className="text-lg" style={{ color: cat.color }}>✓</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TrainingAreaSelector({ selected, onChange, pyramidCategory }) {
  const isPutting = selected?.some((a) => a.startsWith('PUTT'));
  const isPhysical = pyramidCategory === 'FYS';
  const trainingAreas = useLegacyTrainingAreas();

  if (isPhysical) {
    return (
      <div>
        <p className="text-xs text-tier-text-secondary mb-3">
          For fysisk trening, velg fokusområde:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PHYSICAL_FOCUS.map((focus) => {
            const isSelected = selected?.includes(focus.code);
            return (
              <button
                key={focus.code}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onChange(selected.filter((id) => id !== focus.code));
                  } else {
                    onChange([...(selected || []), focus.code]);
                  }
                }}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-tier-navy/10 border-tier-navy'
                    : 'bg-tier-surface-base border-transparent hover:border-tier-border-default'
                }`}
              >
                <span className="text-xl">{focus.icon}</span>
                <span className="text-sm font-medium">{focus.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(trainingAreas).map(([groupKey, group]) => (
        <div key={groupKey}>
          <CardTitle className="text-xs font-semibold text-tier-text-secondary mb-2 uppercase tracking-wide">
            {group.label}
          </CardTitle>
          <div className="grid grid-cols-3 gap-2">
            {group.areas.map((area) => {
              const isSelected = selected?.includes(area.code);
              return (
                <button
                  key={area.code}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onChange(selected.filter((id) => id !== area.code));
                    } else {
                      onChange([...(selected || []), area.code]);
                    }
                  }}
                  className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-tier-navy/10 border-tier-navy'
                      : 'bg-tier-surface-base border-transparent hover:border-tier-border-default'
                  }`}
                >
                  <span className="text-lg mb-0.5">{area.icon}</span>
                  <span className="text-xs font-medium text-center">{area.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function LPhaseSelector({ selected, onChange }) {
  // FASE 5: Use local L_PHASES with updated definitions
  const phases = L_PHASES;
  return (
    <div className="space-y-2">
      <div className="text-xs text-tier-text-secondary mb-3 p-3 bg-tier-surface-base rounded-lg">
        <strong>L-Fase progresjon:</strong> L1 → L2 → L3 → L4 → L5
        <br />
        <span className="text-[10px]">CS (Clubspeed) vises kun for L3-L5</span>
      </div>
      {phases.map((phase) => {
        const isSelected = selected === phase.code;
        return (
          <button
            key={phase.code}
            type="button"
            onClick={() => onChange(isSelected ? null : phase.code)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
              isSelected
                ? 'bg-tier-navy/10 border-tier-navy'
                : 'bg-tier-surface-base border-transparent hover:border-tier-border-default'
            }`}
          >
            <span className="text-2xl">{phase.icon}</span>
            <div className="flex-1">
              <div className="font-medium text-sm text-tier-navy">{phase.label}</div>
              <div className="text-xs text-tier-text-secondary">{phase.description}</div>
            </div>
            {phase.showCS && phase.csRange && (
              <span className="text-xs text-tier-text-tertiary bg-tier-surface-base px-2 py-1 rounded">
                CS: {phase.csRange}
              </span>
            )}
            {isSelected && <span className="text-tier-navy text-lg">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

function CSLevelSelector({ selected, onChange, lPhase }) {
  const phases = useLegacyPhases();
  const intensityLevels = useLegacyIntensityLevels();

  // Suggest CS based on L-phase
  const suggestedCS = useMemo(() => {
    if (!lPhase) return null;
    const phase = phases.find((p) => p.code === lPhase);
    return phase?.csRange || null;
  }, [lPhase, phases]);

  return (
    <div>
      {suggestedCS && (
        <div className="text-xs text-tier-success mb-3 p-2 bg-tier-success/10 rounded-lg">
          💡 Anbefalt for {lPhase}: <strong>{suggestedCS}</strong>
        </div>
      )}
      <div className="grid grid-cols-5 gap-2">
        {intensityLevels.map((cs) => {
          const isSelected = selected === cs.code;
          return (
            <button
              key={cs.code}
              type="button"
              onClick={() => onChange(isSelected ? null : cs.code)}
              className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-tier-navy text-white border-tier-navy'
                  : 'bg-tier-surface-base border-transparent hover:border-tier-border-default'
              }`}
            >
              <span className="text-sm font-bold">{cs.label}</span>
              <span className="text-xs opacity-70">{cs.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MEnvironmentSelector({ selected, onChange }) {
  const environments = useLegacyEnvironments();
  return (
    <div className="space-y-2">
      {environments.map((env) => {
        const isSelected = selected === env.code;
        return (
          <button
            key={env.code}
            type="button"
            onClick={() => onChange(isSelected ? null : env.code)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isSelected
                ? 'bg-tier-navy/10 border-tier-navy'
                : 'bg-tier-surface-base border-transparent hover:border-tier-border-default'
            }`}
          >
            <span className="text-xl">{env.icon}</span>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-tier-navy">{env.code}</span>
                <span className="font-medium">{env.label}</span>
              </div>
              <div className="text-xs text-tier-text-secondary">{env.description}</div>
            </div>
            {isSelected && <span className="text-tier-navy text-lg">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

function PRPressSelector({ selected, onChange }) {
  const pressureLevels = useLegacyPressureLevels();
  return (
    <div className="grid grid-cols-1 gap-2">
      {pressureLevels.map((pr) => {
        const isSelected = selected === pr.code;
        return (
          <button
            key={pr.code}
            type="button"
            onClick={() => onChange(isSelected ? null : pr.code)}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isSelected
                ? 'bg-tier-navy/10 border-tier-navy'
                : 'bg-tier-surface-base border-transparent hover:border-tier-border-default'
            }`}
          >
            <span className="text-xl">{pr.icon}</span>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-tier-navy">{pr.code}</span>
                <span className="font-medium">{pr.label}</span>
              </div>
              <div className="text-xs text-tier-text-secondary">{pr.description}</div>
            </div>
            {isSelected && <span className="text-tier-navy text-lg">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

function PPositionSelector({ selectedStart, selectedEnd, onChangeStart, onChangeEnd }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-tier-text-secondary p-3 bg-tier-surface-base rounded-lg">
        <strong>Velg posisjonsfokus:</strong> Enkeltpunkt (f.eks. P7.0) eller range (f.eks. P5.0-P7.0)
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-tier-text-secondary mb-2 block">Fra posisjon</label>
          <select
            value={selectedStart || ''}
            onChange={(e) => onChangeStart(e.target.value || null)}
            className="w-full p-2 bg-tier-surface-base border border-tier-border-default rounded-lg text-sm"
          >
            <option value="">Velg...</option>
            {P_POSITIONS.map((p) => (
              <option key={p.code} value={p.code}>{p.code} - {p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-tier-text-secondary mb-2 block">Til posisjon (valgfritt)</label>
          <select
            value={selectedEnd || ''}
            onChange={(e) => onChangeEnd(e.target.value || null)}
            className="w-full p-2 bg-tier-surface-base border border-tier-border-default rounded-lg text-sm"
          >
            <option value="">Samme posisjon</option>
            {P_POSITIONS.map((p) => (
              <option key={p.code} value={p.code}>{p.code} - {p.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function TournamentTypeSelector({ selected, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {TOURNAMENT_TYPES.map((type) => {
        const isSelected = selected === type.code;
        return (
          <button
            key={type.code}
            type="button"
            onClick={() => onChange(isSelected ? null : type.code)}
            className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
              isSelected
                ? 'bg-tier-navy/10 border-tier-navy'
                : 'bg-tier-surface-base border-transparent hover:border-tier-border-default'
            }`}
          >
            <span className="font-mono font-bold text-sm text-tier-navy">{type.code}</span>
            <span className="text-sm font-medium">{type.label}</span>
            <span className="text-xs text-tier-text-secondary text-center">{type.description}</span>
          </button>
        );
      })}
    </div>
  );
}

function DrillsSection({ drills, onChange }) {
  const addDrill = () => {
    onChange([...drills, { name: '', reps: 10, sets: 1, notes: '' }]);
  };

  const updateDrill = (index, field, value) => {
    const updated = [...drills];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeDrill = (index) => {
    onChange(drills.filter((_, i) => i !== index));
  };

  const totalReps = drills.reduce((sum, drill) => sum + (drill.reps * drill.sets || 0), 0);

  return (
    <div>
      {drills.length > 0 && (
        <div className="mb-4 p-3 bg-tier-success/10 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-tier-success">
              {drills.length} øvelse{drills.length !== 1 ? 'r' : ''} lagt til
            </span>
            <span className="text-lg font-bold text-tier-success">
              Totalt: {totalReps} reps
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {drills.map((drill, index) => (
          <div key={index} className="p-3 bg-tier-surface-base rounded-lg border border-tier-border-default">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-tier-text-secondary">Øvelse {index + 1}</span>
              <button
                type="button"
                onClick={() => removeDrill(index)}
                className="text-tier-error hover:bg-tier-error/10 p-1 rounded"
              >
                <Minus size={16} />
              </button>
            </div>

            <input
              type="text"
              value={drill.name}
              onChange={(e) => updateDrill(index, 'name', e.target.value)}
              placeholder="Navn på øvelse/drill"
              className="w-full p-2 mb-2 bg-tier-white border border-tier-border-default rounded-lg text-sm"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-tier-text-secondary">Reps</label>
                <input
                  type="number"
                  value={drill.reps}
                  onChange={(e) => updateDrill(index, 'reps', parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-tier-white border border-tier-border-default rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-tier-text-secondary">Sett</label>
                <input
                  type="number"
                  value={drill.sets}
                  onChange={(e) => updateDrill(index, 'sets', parseInt(e.target.value) || 1)}
                  className="w-full p-2 bg-tier-white border border-tier-border-default rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addDrill}
        className="w-full mt-3 p-3 border-2 border-dashed border-tier-border-default rounded-lg text-tier-text-secondary hover:border-tier-navy hover:text-tier-navy transition-all flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        <span>Legg til øvelse/drill</span>
      </button>
    </div>
  );
}

// ============================================================================
// AK-FORMEL GENERATOR
// ============================================================================

function generateAKFormula(formData) {
  const parts = [];

  // Pyramide
  if (formData.pyramidCategory) {
    parts.push(formData.pyramidCategory);
  }

  // Område (første valgte)
  if (formData.trainingAreas?.length > 0) {
    parts.push(formData.trainingAreas[0]);
  }

  // L-Fase
  if (formData.lPhase) {
    parts.push(formData.lPhase);
  }

  // CS-Nivå
  if (formData.csLevel) {
    parts.push(formData.csLevel);
  }

  // M-Miljø
  if (formData.mEnvironment) {
    parts.push(formData.mEnvironment);
  }

  // PR-Press
  if (formData.prPress) {
    parts.push(formData.prPress);
  }

  // P-Posisjon
  if (formData.pPositionStart) {
    if (formData.pPositionEnd && formData.pPositionEnd !== formData.pPositionStart) {
      parts.push(`${formData.pPositionStart}-${formData.pPositionEnd}`);
    } else {
      parts.push(formData.pPositionStart);
    }
  }

  // Turneringstype
  if (formData.pyramidCategory === 'TURN' && formData.tournamentType) {
    parts.splice(1, 0, formData.tournamentType); // Insert after TURN
  }

  return parts.join('_') || 'Velg kategorier for å generere AK-formel';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SessionCreateForm({
  initialValues = {},
  onSubmit,
  onCancel,
  isLoading = false,
}) {
  const [collapsedSections, setCollapsedSections] = useState({
    grundinfo: false,
    pyramid: false,
    area: true,
    lphase: true,
    cs: true,
    environment: true,
    press: true,
    position: true,
    recurrence: true, // FASE 5
    exercises: true, // FASE 5
    summary: true, // FASE 5
    drills: true,
    notes: true,
  });

  const [formData, setFormData] = useState({
    // Grunninfo
    sessionDate: initialValues.sessionDate || new Date().toISOString().slice(0, 16),
    duration: initialValues.duration || 30,
    location: initialValues.location || '',

    // AK-formel komponenter
    pyramidCategory: initialValues.pyramidCategory || '',
    trainingAreas: initialValues.trainingAreas || [],
    lPhase: initialValues.lPhase || null,
    csLevel: initialValues.csLevel || null,
    mEnvironment: initialValues.mEnvironment || null,
    prPress: initialValues.prPress || null,
    pPositionStart: initialValues.pPositionStart || null,
    pPositionEnd: initialValues.pPositionEnd || null,

    // Turnering-spesifikt
    tournamentType: initialValues.tournamentType || null,

    // FASE 5: Recurrence
    recurrence: initialValues.recurrence || { rule: null, endDate: null, count: null },

    // FASE 5: Exercises
    exercises: initialValues.exercises || [],

    // Øvelser (legacy - keep for backward compatibility)
    drills: initialValues.drills || [],

    // Notater
    notes: initialValues.notes || '',
  });

  const [errors, setErrors] = useState({});

  // Sport-specific configuration (from SportContext)
  const trainingAreasFromConfig = useLegacyTrainingAreas();
  const phasesFromConfig = useLegacyPhases();
  const intensityLevelsFromConfig = useLegacyIntensityLevels();
  const environmentsFromConfig = useLegacyEnvironments();

  const toggleSection = useCallback((section) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  // Get current pyramid category config
  const currentPyramid = useMemo(
    () => PYRAMID_CATEGORIES.find((p) => p.code === formData.pyramidCategory),
    [formData.pyramidCategory]
  );

  // Show CS selector only for categories that use it
  const showCS = currentPyramid?.usesCS ?? false;

  // Show P-position selector only for TEK and SLAG
  const showPosition = currentPyramid?.usesP ?? false;

  // Show tournament type selector for TURN
  const showTournamentType = formData.pyramidCategory === 'TURN';

  // Generate AK-formel
  const akFormula = useMemo(() => generateAKFormula(formData), [formData]);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.sessionDate) newErrors.sessionDate = 'Velg dato og tid';
    if (!formData.pyramidCategory) newErrors.pyramidCategory = 'Velg pyramide-kategori';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!validate()) return;

    const totalReps = formData.drills.reduce((sum, d) => sum + (d.reps * d.sets || 0), 0);

    const submitData = {
      sessionDate: new Date(formData.sessionDate).toISOString(),
      duration: formData.duration,
      location: formData.location || undefined,
      sessionType: formData.pyramidCategory,
      // TIER Golf Kategori Hierarki v2.0 felter (mapped til API-schema)
      akFormula,
      learningPhase: formData.lPhase || undefined,
      clubSpeed: formData.csLevel || undefined,
      environment: formData.mEnvironment || undefined,
      pressure: formData.prPress || undefined,
      positionStart: formData.pPositionStart || undefined,
      positionEnd: formData.pPositionEnd || undefined,
      // Putting-spesifikke felter
      puttingFocus: formData.puttingFocus || undefined,
      puttingPhases: formData.puttingPhases || undefined,
      // FASE 5: Recurrence
      recurrenceRule: formData.recurrence?.rule || undefined,
      recurrenceEndDate: formData.recurrence?.endDate || undefined,
      recurrenceCount: formData.recurrence?.count || undefined,
      // FASE 5: Exercises
      exercises: formData.exercises?.length > 0 ? formData.exercises : undefined,
      // Andre felter
      focusArea: formData.trainingAreas?.join(',') || undefined,
      drillIds: formData.drills?.filter(d => d.id).map(d => d.id) || undefined,
      notes: formData.notes || undefined,
    };

    onSubmit(submitData);
  }, [formData, validate, onSubmit, akFormula]);

  return (
    <div className="bg-tier-surface-base min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-tier-white border-b border-tier-border-default">
        <Button variant="ghost" onClick={onCancel} leftIcon={<ChevronLeft size={20} />}>
          Avbryt
        </Button>
        <span className="text-lg font-semibold text-tier-navy">Ny treningsøkt</span>
        <div className="w-[60px]" />
      </div>

      {/* AK-Formel Preview */}
      <div className="mx-4 mt-4 p-3 bg-tier-white border border-tier-border-default rounded-xl">
        <div className="text-xs text-tier-text-secondary mb-1">AK-Formel:</div>
        <div className="font-mono text-sm font-bold text-tier-navy break-all">
          {akFormula}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto">

        {/* 1. Grunninfo */}
        <FormSection
          title="Grunninfo"
          icon={Calendar}
          number="1"
          collapsed={collapsedSections.grundinfo}
          onToggle={() => toggleSection('grundinfo')}
        >
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-medium text-tier-text-secondary">
                Dato og tidspunkt *
              </label>
              <input
                type="datetime-local"
                value={formData.sessionDate}
                onChange={(e) => updateField('sessionDate', e.target.value)}
                className="w-full p-3 bg-tier-surface-base border border-tier-border-default rounded-lg"
              />
            </div>

            {/* FASE 5: Duration Slider */}
            <DurationSlider
              value={formData.duration}
              onChange={(value) => updateField('duration', value)}
            />

            <div>
              <label className="block mb-1 text-xs font-medium text-tier-text-secondary">
                <MapPin size={14} className="inline mr-1" />
                Sted
              </label>
              <select
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                className="w-full p-3 bg-tier-surface-base border border-tier-border-default rounded-lg"
              >
                <option value="">Velg sted...</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.label}</option>
                ))}
              </select>
            </div>
          </div>
        </FormSection>

        {/* 2. Pyramide-kategori */}
        <FormSection
          title="Pyramide-kategori"
          icon={Layers}
          number="2"
          collapsed={collapsedSections.pyramid}
          onToggle={() => toggleSection('pyramid')}
        >
          <TrainingPyramidSelector
            selected={formData.pyramidCategory}
            onChange={(value) => {
              updateField('pyramidCategory', value);
              // Reset dependent fields when changing pyramid
              if (value === 'TURN') {
                updateField('mEnvironment', 'M5');
                updateField('prPress', 'PR5');
              }
              // Auto-expand next section after selection
              setCollapsedSections(prev => ({ ...prev, pyramid: true, area: false }));
            }}
            onBack={null} // No back button in form context
          />
          {errors.pyramidCategory && (
            <span className="text-tier-error text-xs mt-2 block">{errors.pyramidCategory}</span>
          )}
        </FormSection>

        {/* Tournament Type (for TURN) */}
        {showTournamentType && (
          <FormSection
            title="Turneringstype"
            icon={Target}
            number="2b"
            collapsed={collapsedSections.tournament}
            onToggle={() => toggleSection('tournament')}
          >
            <TournamentTypeSelector
              selected={formData.tournamentType}
              onChange={(value) => updateField('tournamentType', value)}
            />
          </FormSection>
        )}

        {/* 3. Treningsområde */}
        <FormSection
          title="Treningsområde"
          icon={Target}
          number="3"
          collapsed={collapsedSections.area}
          onToggle={() => toggleSection('area')}
          optional
        >
          <TrainingAreaSelector
            selected={formData.trainingAreas}
            onChange={(value) => updateField('trainingAreas', value)}
            pyramidCategory={formData.pyramidCategory}
          />
        </FormSection>

        {/* 4. L-Fase */}
        <FormSection
          title="L-Fase (Motorisk læring)"
          icon={GraduationCap}
          number="4"
          collapsed={collapsedSections.lphase}
          onToggle={() => toggleSection('lphase')}
          optional
        >
          <LPhaseSelector
            selected={formData.lPhase}
            onChange={(value) => updateField('lPhase', value)}
          />
        </FormSection>

        {/* 5. CS-Nivå (only for applicable categories) */}
        {showCS && (
          <FormSection
            title="CS-Nivå (Clubspeed)"
            icon={Gauge}
            number="5"
            collapsed={collapsedSections.cs}
            onToggle={() => toggleSection('cs')}
            optional
          >
            <CSLevelSelector
              selected={formData.csLevel}
              onChange={(value) => updateField('csLevel', value)}
              lPhase={formData.lPhase}
            />
          </FormSection>
        )}

        {/* 6. M-Miljø */}
        <FormSection
          title="M-Miljø (Fysisk kontekst)"
          icon={Building}
          number={showCS ? '6' : '5'}
          collapsed={collapsedSections.environment}
          onToggle={() => toggleSection('environment')}
          optional
        >
          <MEnvironmentSelector
            selected={formData.mEnvironment}
            onChange={(value) => updateField('mEnvironment', value)}
          />
        </FormSection>

        {/* 7. PR-Press */}
        <FormSection
          title="PR-Press (Belastningsnivå)"
          icon={Flame}
          number={showCS ? '7' : '6'}
          collapsed={collapsedSections.press}
          onToggle={() => toggleSection('press')}
          optional
        >
          <PRPressSelector
            selected={formData.prPress}
            onChange={(value) => updateField('prPress', value)}
          />
        </FormSection>

        {/* 8. P-Posisjon (only for TEK and SLAG) */}
        {showPosition && (
          <FormSection
            title="P-Posisjon (Svingfokus)"
            icon={Target}
            number={showCS ? '8' : '7'}
            collapsed={collapsedSections.position}
            onToggle={() => toggleSection('position')}
            optional
          >
            <PPositionSelector
              selectedStart={formData.pPositionStart}
              selectedEnd={formData.pPositionEnd}
              onChangeStart={(value) => updateField('pPositionStart', value)}
              onChangeEnd={(value) => updateField('pPositionEnd', value)}
            />
          </FormSection>
        )}

        {/* 9. Øvelser/Driller */}
        <FormSection
          title="Øvelser & Driller"
          icon={Dumbbell}
          number={showCS ? (showPosition ? '9' : '8') : (showPosition ? '8' : '7')}
          collapsed={collapsedSections.drills}
          onToggle={() => toggleSection('drills')}
          optional
        >
          <DrillsSection
            drills={formData.drills}
            onChange={(value) => updateField('drills', value)}
          />
        </FormSection>

        {/* FASE 5: Recurrence */}
        <FormSection
          title="Repetisjon"
          icon={Repeat}
          number="8"
          collapsed={collapsedSections.recurrence}
          onToggle={() => toggleSection('recurrence')}
          optional
        >
          <RecurrenceSelector
            value={formData.recurrence}
            onChange={(value) => updateField('recurrence', value)}
          />
        </FormSection>

        {/* FASE 5: Exercises */}
        <FormSection
          title="Øvelser"
          icon={Dumbbell}
          number="9"
          collapsed={collapsedSections.exercises}
          onToggle={() => toggleSection('exercises')}
          optional
        >
          <ExerciseSelector
            value={formData.exercises}
            onChange={(value) => updateField('exercises', value)}
            maxExercises={5}
          />
        </FormSection>

        {/* FASE 5: Session Summary */}
        <FormSection
          title="Oppsummering"
          icon={CheckCircle}
          number="10"
          collapsed={collapsedSections.summary}
          onToggle={() => toggleSection('summary')}
        >
          <SessionSummary
            exercises={formData.exercises}
            sessionData={formData}
          />
        </FormSection>

        {/* 11. Notater */}
        <FormSection
          title="Notater"
          icon={FileText}
          number="11"
          collapsed={collapsedSections.notes}
          onToggle={() => toggleSection('notes')}
          optional
        >
          <textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Andre notater eller instruksjoner..."
            rows={3}
            className="w-full p-3 bg-tier-surface-base border border-tier-border-default rounded-lg resize-y"
          />
        </FormSection>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          loading={isLoading}
          leftIcon={<Plus size={20} />}
          className="w-full p-4 mt-4 text-lg font-semibold"
        >
          {isLoading ? 'Oppretter...' : 'Opprett treningsøkt'}
        </Button>
      </form>
    </div>
  );
}
