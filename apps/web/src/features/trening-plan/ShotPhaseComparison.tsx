/**
 * ShotPhaseComparison
 *
 * Compare performance across:
 * - Golf shot types (TEE, INN200, INN150, CHIP, PITCH, PUTT)
 * - L-Phases (BODY → ARM → CLUB → BALL → AUTO)
 * - Approach categories (Full Swing, Short Game, Putting)
 *
 * Shows distribution of training hours, repetitions and focus score
 */

import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, Flame, Target, Filter } from 'lucide-react';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import { StandardPageHeader } from '../../components/layout/StandardPageHeader';

// ============================================================================
// TYPES
// ============================================================================

type ShotCategory = 'TEE' | 'INN200' | 'INN150' | 'INN100' | 'INN50' | 'CHIP' | 'PITCH' | 'LOB' | 'BUNKER' | 'PUTT';
type LPhase = 'L-BODY' | 'L-ARM' | 'L-CLUB' | 'L-BALL' | 'L-AUTO';
type CategoryGroup = 'fullSwing' | 'shortGame' | 'putting';

interface ComparisonData {
  shotCategory: ShotCategory;
  phase: LPhase;
  categoryGroup: CategoryGroup;
  hours: number;
  reps: number;
  sessions: number;
  avgFocus: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SHOT_CATEGORIES: Record<ShotCategory, { label: string; group: CategoryGroup }> = {
  TEE: { label: 'Tee Total', group: 'fullSwing' },
  INN200: { label: 'Approach 200+', group: 'fullSwing' },
  INN150: { label: 'Approach 150-200', group: 'fullSwing' },
  INN100: { label: 'Approach 100-150', group: 'fullSwing' },
  INN50: { label: 'Approach 50-100', group: 'fullSwing' },
  CHIP: { label: 'Chip', group: 'shortGame' },
  PITCH: { label: 'Pitch', group: 'shortGame' },
  LOB: { label: 'Lob', group: 'shortGame' },
  BUNKER: { label: 'Bunker', group: 'shortGame' },
  PUTT: { label: 'Putting', group: 'putting' },
};

const L_PHASES: Record<LPhase, { label: string; color: string }> = {
  'L-BODY': { label: 'Body', color: 'rgb(var(--text-tertiary))' },
  'L-ARM': { label: 'Arm', color: 'rgb(var(--text-secondary))' },
  'L-CLUB': { label: 'Club', color: 'rgb(var(--tier-navy))' },
  'L-BALL': { label: 'Ball', color: 'rgb(var(--tier-navy-dark))' },
  'L-AUTO': { label: 'Auto', color: 'rgb(var(--tier-navy))' },
};

const CATEGORY_GROUPS: Record<CategoryGroup, { label: string; color: string }> = {
  fullSwing: { label: 'Full Swing', color: 'rgb(var(--status-info))' },
  shortGame: { label: 'Short Game', color: 'rgb(var(--status-success))' },
  putting: { label: 'Putting', color: 'rgb(var(--tier-gold))' },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const generateMockData = (): ComparisonData[] => {
  const data: ComparisonData[] = [];
  const shots: ShotCategory[] = ['TEE', 'INN150', 'INN100', 'CHIP', 'PITCH', 'PUTT'];
  const phases: LPhase[] = ['L-BODY', 'L-ARM', 'L-CLUB', 'L-BALL', 'L-AUTO'];

  shots.forEach((shot) => {
    phases.forEach((phase) => {
      const group = SHOT_CATEGORIES[shot].group;
      data.push({
        shotCategory: shot,
        phase,
        categoryGroup: group,
        hours: Math.random() * 10,
        reps: Math.floor(Math.random() * 500),
        sessions: Math.floor(Math.random() * 20),
        avgFocus: Math.random() * 4 + 6, // 6-10
      });
    });
  });

  return data;
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface ComparisonTableProps {
  data: ComparisonData[];
  groupBy: 'shot' | 'phase' | 'category';
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data, groupBy }) => {
  const aggregatedData = useMemo(() => {
    if (groupBy === 'shot') {
      // Group by shot category
      const grouped: Record<string, { hours: number; reps: number; sessions: number; avgFocus: number }> = {};
      data.forEach((item) => {
        if (!grouped[item.shotCategory]) {
          grouped[item.shotCategory] = { hours: 0, reps: 0, sessions: 0, avgFocus: 0 };
        }
        grouped[item.shotCategory].hours += item.hours;
        grouped[item.shotCategory].reps += item.reps;
        grouped[item.shotCategory].sessions += item.sessions;
        grouped[item.shotCategory].avgFocus += item.avgFocus;
      });

      // Calculate averages
      Object.keys(grouped).forEach((key) => {
        const count = data.filter((item) => item.shotCategory === key).length;
        grouped[key].avgFocus /= count;
      });

      return Object.entries(grouped).map(([key, value]) => ({
        label: SHOT_CATEGORIES[key as ShotCategory].label,
        color: undefined,
        ...value,
      }));
    } else if (groupBy === 'phase') {
      // Group by L-Phase
      const grouped: Record<string, { hours: number; reps: number; sessions: number; avgFocus: number }> = {};
      data.forEach((item) => {
        if (!grouped[item.phase]) {
          grouped[item.phase] = { hours: 0, reps: 0, sessions: 0, avgFocus: 0 };
        }
        grouped[item.phase].hours += item.hours;
        grouped[item.phase].reps += item.reps;
        grouped[item.phase].sessions += item.sessions;
        grouped[item.phase].avgFocus += item.avgFocus;
      });

      // Calculate averages
      Object.keys(grouped).forEach((key) => {
        const count = data.filter((item) => item.phase === key).length;
        grouped[key].avgFocus /= count;
      });

      return Object.entries(grouped).map(([key, value]) => ({
        label: L_PHASES[key as LPhase].label,
        color: L_PHASES[key as LPhase].color,
        ...value,
      }));
    } else {
      // Group by category group
      const grouped: Record<string, { hours: number; reps: number; sessions: number; avgFocus: number }> = {};
      data.forEach((item) => {
        if (!grouped[item.categoryGroup]) {
          grouped[item.categoryGroup] = { hours: 0, reps: 0, sessions: 0, avgFocus: 0 };
        }
        grouped[item.categoryGroup].hours += item.hours;
        grouped[item.categoryGroup].reps += item.reps;
        grouped[item.categoryGroup].sessions += item.sessions;
        grouped[item.categoryGroup].avgFocus += item.avgFocus;
      });

      // Calculate averages
      Object.keys(grouped).forEach((key) => {
        const count = data.filter((item) => item.categoryGroup === key).length;
        grouped[key].avgFocus /= count;
      });

      return Object.entries(grouped).map(([key, value]) => ({
        label: CATEGORY_GROUPS[key as CategoryGroup].label,
        color: CATEGORY_GROUPS[key as CategoryGroup].color,
        ...value,
      }));
    }
  }, [data, groupBy]);

  // Sort by hours descending
  const sortedData = aggregatedData.sort((a, b) => b.hours - a.hours);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-tier-border-default">
            <th className="text-left py-3 px-4 text-xs font-semibold text-tier-text-secondary uppercase tracking-wide">
              {groupBy === 'shot' ? 'Shot Type' : groupBy === 'phase' ? 'L-Phase' : 'Category'}
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-tier-text-secondary uppercase tracking-wide">
              Hours
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-tier-text-secondary uppercase tracking-wide">
              Reps
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-tier-text-secondary uppercase tracking-wide">
              Sessions
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-tier-text-secondary uppercase tracking-wide">
              Avg Focus
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index} className="border-b border-tier-border-default last:border-b-0 hover:bg-tier-surface-base transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  {row.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                  )}
                  <span className="text-sm font-medium text-tier-navy">{row.label}</span>
                </div>
              </td>
              <td className="text-right py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  <Clock size={14} className="text-tier-text-tertiary" />
                  <span className="text-sm font-semibold text-tier-navy">
                    {row.hours.toFixed(1)}t
                  </span>
                </div>
              </td>
              <td className="text-right py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  <Flame size={14} className="text-tier-text-tertiary" />
                  <span className="text-sm font-semibold text-tier-navy">
                    {row.reps.toFixed(0)}
                  </span>
                </div>
              </td>
              <td className="text-right py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp size={14} className="text-tier-text-tertiary" />
                  <span className="text-sm font-semibold text-tier-navy">
                    {row.sessions}
                  </span>
                </div>
              </td>
              <td className="text-right py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  <Target size={14} className="text-tier-text-tertiary" />
                  <span className="text-sm font-semibold text-tier-navy">
                    {row.avgFocus.toFixed(1)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ShotPhaseComparison: React.FC = () => {
  const [groupBy, setGroupBy] = useState<'shot' | 'phase' | 'category'>('category');
  const [mockData] = useState(() => generateMockData());

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <StandardPageHeader
        icon={BarChart3}
        title="Training Comparison"
        subtitle="Compare your training distribution across shot types, phases and categories"
        helpText="Analyze your training distribution across shot types (TEE, Approach, Chip, Pitch, Putting), L-phases (Body→Arm→Club→Ball→Auto) and categories (Full Swing, Short Game, Putting). View hours, repetitions and focus score."
      />

      {/* Filter Controls */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-tier-text-secondary" />
          <span className="text-sm font-medium text-tier-navy">Group by:</span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={groupBy === 'category' ? 'primary' : 'ghost'}
            onClick={() => setGroupBy('category')}
          >
            Category
          </Button>
          <Button
            size="sm"
            variant={groupBy === 'shot' ? 'primary' : 'ghost'}
            onClick={() => setGroupBy('shot')}
          >
            Shot Type
          </Button>
          <Button
            size="sm"
            variant={groupBy === 'phase' ? 'primary' : 'ghost'}
            onClick={() => setGroupBy('phase')}
          >
            L-Phase
          </Button>
        </div>
      </Card>

      {/* Comparison Table */}
      <Card>
        <ComparisonTable data={mockData} groupBy={groupBy} />
      </Card>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-tier-surface-base rounded-lg border border-tier-border-default">
        <p className="text-xs text-tier-text-secondary m-0">
          <strong>Tip:</strong> This comparison shows how your training time is distributed.
          Ideal distribution depends on your level and goals, but generally you should have a balanced
          approach across categories and phases.
        </p>
      </div>
    </div>
  );
};

export default ShotPhaseComparison;
