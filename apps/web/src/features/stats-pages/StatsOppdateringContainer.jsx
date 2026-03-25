/**
 * StatsOppdateringContainer.jsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState } from 'react';
import {
  Target, Flag, ChevronRight, Save, X, BarChart2
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import apiClient from '../../services/apiClient';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

// Color class mapping for categories
const COLOR_CLASSES = {
  brand: { text: 'text-tier-navy', bg: 'bg-tier-navy/15' },
  success: { text: 'text-tier-success', bg: 'bg-tier-success/15' },
  warning: { text: 'text-tier-warning', bg: 'bg-tier-warning/15' },
  error: { text: 'text-tier-error', bg: 'bg-tier-error/15' },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const STAT_CATEGORIES = [
  {
    id: 'driving',
    name: 'Driving',
    icon: Target,
    colorKey: 'brand',
    fields: [
      { id: 'fairways_hit', label: 'Fairways truffet', type: 'fraction', max: 14 },
      { id: 'avg_drive_distance', label: 'Gj.sn. drivelengde', type: 'number', unit: 'm' },
    ],
  },
  {
    id: 'approach',
    name: 'Approach',
    icon: Flag,
    colorKey: 'success',
    fields: [
      { id: 'gir', label: 'GIR (Green in Regulation)', type: 'fraction', max: 18 },
      { id: 'proximity', label: 'Gj.sn. avstand til hull', type: 'number', unit: 'm' },
    ],
  },
  {
    id: 'short_game',
    name: 'Kortspill',
    icon: Flag,
    colorKey: 'warning',
    fields: [
      { id: 'sand_saves', label: 'Sand saves', type: 'fraction', max: null },
      { id: 'up_and_downs', label: 'Up & Downs', type: 'fraction', max: null },
      { id: 'scrambling', label: 'Scrambling %', type: 'percentage' },
    ],
  },
  {
    id: 'putting',
    name: 'Putting',
    icon: Target,
    colorKey: 'error',
    fields: [
      { id: 'total_putts', label: 'Totalt antall putter', type: 'number' },
      { id: 'putts_per_gir', label: 'Putter per GIR', type: 'decimal' },
      { id: 'one_putts', label: 'En-putter', type: 'number' },
      { id: 'three_putts', label: 'Tre-putter', type: 'number' },
    ],
  },
];

const RECENT_ENTRIES = [
  { id: 'e1', date: '2025-01-14', type: 'Treningsrunde', course: 'Miklagard Golf', score: 74 },
  { id: 'e2', date: '2025-01-12', type: 'Simulator', course: 'Indoor', score: null },
  { id: 'e3', date: '2025-01-10', type: 'Turnering', course: 'Holtsmark GK', score: 71 },
];

// ============================================================================
// CATEGORY CARD COMPONENT
// ============================================================================

const CategoryCard = ({ category, values, onChange, isExpanded, onToggle }) => {
  const Icon = category.icon;
  const colors = COLOR_CLASSES[category.colorKey] || COLOR_CLASSES.brand;

  return (
    <div className="bg-tier-white rounded-2xl overflow-hidden shadow-sm">
      <div
        onClick={onToggle}
        className="py-4 px-5 cursor-pointer flex items-center gap-3"
      >
        <div className={`w-10 h-10 rounded-[10px] ${colors.bg} flex items-center justify-center`}>
          <Icon size={20} className={colors.text} />
        </div>
        <div className="flex-1">
          <SubSectionTitle className="text-[15px] m-0">
            {category.name}
          </SubSectionTitle>
          <div className="text-xs text-tier-text-secondary">
            {category.fields.length} felt
          </div>
        </div>
        <div className={`w-7 h-7 rounded-lg bg-tier-surface-base flex items-center justify-center transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
          <ChevronRight size={16} className="text-tier-text-secondary" />
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-tier-border-default">
          <div className="flex flex-col gap-3 mt-4">
            {category.fields.map((field) => (
              <div key={field.id}>
                <label className="text-[13px] text-tier-navy mb-1.5 block">
                  {field.label}
                </label>
                {field.type === 'fraction' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={field.max || 99}
                      value={values[field.id]?.numerator || ''}
                      onChange={(e) => onChange(field.id, {
                        ...values[field.id],
                        numerator: e.target.value,
                      })}
                      placeholder="0"
                      className="w-[60px] py-2.5 px-3 rounded-lg border border-tier-border-default text-sm text-center"
                    />
                    <span className="text-tier-text-secondary">/</span>
                    <input
                      type="number"
                      min="1"
                      max={field.max || 99}
                      value={values[field.id]?.denominator || (field.max || '')}
                      onChange={(e) => onChange(field.id, {
                        ...values[field.id],
                        denominator: e.target.value,
                      })}
                      placeholder={field.max?.toString() || ''}
                      className="w-[60px] py-2.5 px-3 rounded-lg border border-tier-border-default text-sm text-center"
                    />
                    {values[field.id]?.numerator && values[field.id]?.denominator && (
                      <span className="text-[13px] text-tier-navy ml-2">
                        = {Math.round((values[field.id].numerator / values[field.id].denominator) * 100)}%
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step={field.type === 'decimal' ? '0.01' : '1'}
                      value={values[field.id] || ''}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      placeholder="0"
                      className="w-[100px] py-2.5 px-3 rounded-lg border border-tier-border-default text-sm"
                    />
                    {field.unit && (
                      <span className="text-[13px] text-tier-text-secondary">
                        {field.unit}
                      </span>
                    )}
                    {field.type === 'percentage' && (
                      <span className="text-[13px] text-tier-text-secondary">%</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const StatsOppdateringContainer = () => {
  const [expandedCategory, setExpandedCategory] = useState('driving');
  const [sessionType, setSessionType] = useState('');
  const [course, setCourse] = useState('');
  const [score, setScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [values, setValues] = useState({});

  const handleValueChange = (fieldId, value) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
  };

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [isSaving, setIsSaving] = useState(false);
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [saveSuccess, setSaveSuccess] = useState(false);
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const [saveError, setSaveError] = useState(null);

  const handleSave = async () => {
    const data = {
      sessionType,
      course,
      score: score ? parseInt(score) : null,
      date,
      stats: values,
    };

    setIsSaving(true);
    setSaveError(null);

    try {
      await apiClient.post('/stats', data);
      setSaveSuccess(true);
      // Reset form after successful save
      setValues({});
      setSessionType('');
      setCourse('');
      setScore('');
    } catch (err) {
      console.error('Failed to save stats:', err);
      setSaveError(err.message || 'Kunne ikke lagre statistikk');
    } finally {
      setIsSaving(false);
    }
  };

  const sessionTypes = [
    { value: 'round', label: 'Treningsrunde' },
    { value: 'tournament', label: 'Turnering' },
    { value: 'simulator', label: 'Simulator' },
    { value: 'practice', label: 'Treningsøkt' },
  ];

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Ny statistikk"
        subtitle="Registrer nye prestasjonsdata"
        helpText="Registrer nye prestasjonsdata og statistikk fra treningsøkter eller runder. Hold statistikken din oppdatert for best mulig analyse av utviklingen."
      />

      <div className="p-6 w-full">
        {/* Session Info */}
        <div className="bg-tier-white rounded-2xl p-5 mb-5 shadow-sm">
          <SectionTitle className="text-base m-0 mb-4">
            Okt-informasjon
          </SectionTitle>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <div>
              <label className="text-[13px] text-tier-navy mb-1.5 block">
                Type okt
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full py-2.5 px-3 rounded-lg border border-tier-border-default text-sm bg-tier-white"
              >
                <option value="">Velg type...</option>
                {sessionTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[13px] text-tier-navy mb-1.5 block">
                Bane / Sted
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="F.eks. Miklagard Golf"
                className="w-full py-2.5 px-3 rounded-lg border border-tier-border-default text-sm"
              />
            </div>

            <div>
              <label className="text-[13px] text-tier-navy mb-1.5 block">
                Dato
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-lg border border-tier-border-default text-sm"
              />
            </div>

            <div>
              <label className="text-[13px] text-tier-navy mb-1.5 block">
                Score (valgfritt)
              </label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="F.eks. 72"
                className="w-full py-2.5 px-3 rounded-lg border border-tier-border-default text-sm"
              />
            </div>
          </div>
        </div>

        {/* Stat Categories */}
        <SectionTitle className="text-base m-0 mb-4">
          Statistikk
        </SectionTitle>

        <div className="flex flex-col gap-3 mb-6">
          {STAT_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              values={values}
              onChange={handleValueChange}
              isExpanded={expandedCategory === category.id}
              onToggle={() => setExpandedCategory(
                expandedCategory === category.id ? null : category.id
              )}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button className="py-3 px-6 rounded-[10px] border border-tier-border-default bg-tier-white text-tier-navy text-sm font-medium cursor-pointer flex items-center gap-2">
            <X size={16} />
            Avbryt
          </button>
          <button
            onClick={handleSave}
            className="py-3 px-6 rounded-[10px] border-none bg-tier-navy text-white text-sm font-semibold cursor-pointer flex items-center gap-2"
          >
            <Save size={16} />
            Lagre statistikk
          </button>
        </div>

        {/* Recent Entries */}
        <div className="mt-8">
          <SectionTitle className="text-base m-0 mb-4">
            Siste registreringer
          </SectionTitle>

          <div className="flex flex-col gap-2">
            {RECENT_ENTRIES.map((entry) => (
              <div
                key={entry.id}
                className="bg-tier-white rounded-xl py-3.5 px-4 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-tier-surface-base flex items-center justify-center">
                  <BarChart2 size={18} className="text-tier-navy" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-tier-navy">
                    {entry.type} - {entry.course}
                  </div>
                  <div className="text-xs text-tier-text-secondary">
                    {entry.date}
                  </div>
                </div>
                {entry.score && (
                  <div className="text-base font-semibold text-tier-navy">
                    {entry.score}
                  </div>
                )}
                <ChevronRight size={16} className="text-tier-text-secondary" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOppdateringContainer;
