/**
 * RoundScoringForm Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save, RotateCcw, Flag, TrendingUp, Check, Target } from 'lucide-react';
import { SectionTitle, SubSectionTitle } from '../../../components/typography';
import Button from '../../../ui/primitives/Button';
import { TestDefinition, ColumnDef, getScoreLevel } from '../config/testDefinitions';

// ============================================================================
// TYPES
// ============================================================================

interface RoundScoringFormProps {
  test: TestDefinition;
  player?: {
    id: string;
    name: string;
    category: string;
  };
  onSubmit?: (data: RoundData) => Promise<void>;
  onClose: () => void;
}

interface RoundData {
  testId: string;
  playerId?: string;
  holes: HoleData[];
  totalScore: number;
  result: number;
  stats: RoundStats;
  timestamp: string;
}

interface HoleData {
  hole: number;
  par?: number;
  score?: number;
  fir?: boolean;
  gir?: boolean;
  putts?: number;
  upDown?: boolean;
  focusRating?: number;
  [key: string]: any;
}

interface RoundStats {
  totalPar?: number;
  vsPar?: number;
  firPercentage?: number;
  girPercentage?: number;
  avgPutts?: number;
  upDownPercentage?: number;
  avgFocusRating?: number;
}

// ============================================================================
// DEFAULT PAR VALUES
// ============================================================================

const defaultPars: Record<number, number[]> = {
  9: [4, 4, 3, 5, 4, 4, 3, 4, 5], // Standard 9-hole par distribution
  18: [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5],
};

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

const calculateStats = (holes: HoleData[], test: TestDefinition): RoundStats => {
  const completedHoles = holes.filter(h => h.score !== undefined);
  if (completedHoles.length === 0) return {};

  const stats: RoundStats = {};

  // Total par and vs par
  const totalPar = completedHoles.reduce((sum, h) => sum + (h.par || 0), 0);
  const totalScore = completedHoles.reduce((sum, h) => sum + (h.score || 0), 0);
  stats.totalPar = totalPar;
  stats.vsPar = totalScore - totalPar;

  // FIR percentage
  const firHoles = completedHoles.filter(h => h.fir !== undefined);
  if (firHoles.length > 0) {
    stats.firPercentage = (firHoles.filter(h => h.fir).length / firHoles.length) * 100;
  }

  // GIR percentage
  const girHoles = completedHoles.filter(h => h.gir !== undefined);
  if (girHoles.length > 0) {
    stats.girPercentage = (girHoles.filter(h => h.gir).length / girHoles.length) * 100;
  }

  // Average putts
  const puttHoles = completedHoles.filter(h => h.putts !== undefined);
  if (puttHoles.length > 0) {
    stats.avgPutts = puttHoles.reduce((sum, h) => sum + (h.putts || 0), 0) / puttHoles.length;
  }

  // Up & Down percentage
  const upDownHoles = holes.filter(h => h.upDown !== undefined);
  if (upDownHoles.length > 0) {
    stats.upDownPercentage = (upDownHoles.filter(h => h.upDown).length / upDownHoles.length) * 100;
  }

  // Average focus rating
  const focusHoles = holes.filter(h => h.focusRating !== undefined && h.focusRating > 0);
  if (focusHoles.length > 0) {
    stats.avgFocusRating = focusHoles.reduce((sum, h) => sum + (h.focusRating || 0), 0) / focusHoles.length;
  }

  return stats;
};

const getResult = (holes: HoleData[], test: TestDefinition, stats: RoundStats): number | null => {
  const completedHoles = holes.filter(h => {
    const columns = test.formConfig?.columns || [];
    const requiredCols = columns.filter(c => c.required);
    return requiredCols.every(col => h[col.key] !== undefined && h[col.key] !== null && h[col.key] !== '');
  });

  if (completedHoles.length === 0) return null;

  switch (test.calculationType) {
    case 'direct':
      return completedHoles.reduce((sum, h) => sum + (h.score || 0), 0);
    case 'percentage':
      if (stats.upDownPercentage !== undefined) return stats.upDownPercentage;
      if (stats.girPercentage !== undefined) return stats.girPercentage;
      return null;
    case 'average':
      if (stats.avgFocusRating !== undefined) return stats.avgFocusRating;
      return null;
    default:
      return null;
  }
};

// ============================================================================
// CELL INPUT COMPONENT
// ============================================================================

interface CellInputProps {
  column: ColumnDef;
  value: any;
  onChange: (value: any) => void;
  compact?: boolean;
}

const CellInput: React.FC<CellInputProps> = ({ column, value, onChange, compact }) => {
  if (column.type === 'boolean') {
    return (
      <button
        onClick={() => onChange(!value)}
        style={{
          width: compact ? '36px' : '40px',
          height: compact ? '36px' : '40px',
          borderRadius: '8px',
          border: `2px solid ${value ? 'rgb(var(--status-success))' : 'rgb(var(--border-color))'}`,
          backgroundColor: value ? 'rgb(var(--status-success))' : 'var(--surface-card)',
          color: value ? 'var(--surface-card)' : 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
          fontSize: '12px',
        }}
      >
        {value && <Check size={16} />}
      </button>
    );
  }

  if (column.type === 'select' && column.options) {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '8px',
          fontSize: '13px',
          border: `1px solid rgb(var(--border-color))`,
          borderRadius: '6px',
          backgroundColor: 'var(--surface-card)',
          width: '100%',
          minWidth: '70px',
        }}
      >
        <option value="">-</option>
        {column.options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || '')}
      placeholder="-"
      style={{
        width: '100%',
        minWidth: compact ? '50px' : '60px',
        padding: compact ? '6px 8px' : '8px 10px',
        fontSize: compact ? '14px' : '15px',
        fontWeight: 500,
        border: `1px solid ${value !== undefined && value !== '' ? 'var(--tier-navy)' : 'rgb(var(--border-color))'}`,
        borderRadius: '6px',
        backgroundColor: value !== undefined && value !== '' ? `rgba(26, 61, 46, 0.03)` : 'var(--surface-card)',
        outline: 'none',
        textAlign: 'center',
      }}
    />
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RoundScoringForm: React.FC<RoundScoringFormProps> = ({
  test,
  player,
  onSubmit,
  onClose,
}) => {
  const numHoles = test.formConfig?.holes || test.attempts;
  const columns = test.formConfig?.columns || [];
  const hasParColumn = columns.some(c => c.key === 'par');
  const hasScoreColumn = columns.some(c => c.key === 'score');

  // Initialize holes with default pars if applicable
  const [holes, setHoles] = useState<HoleData[]>(() => {
    return Array(numHoles).fill(null).map((_, index) => {
      const hole: HoleData = {
        hole: index + 1,
      };
      if (hasParColumn && defaultPars[numHoles]) {
        hole.par = defaultPars[numHoles][index];
      }
      return hole;
    });
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate stats and result
  const stats = useMemo(() => calculateStats(holes, test), [holes, test]);
  const result = useMemo(() => getResult(holes, test, stats), [holes, test, stats]);

  // Get score level
  const scoreLevel = useMemo(() => {
    if (result === null) return null;
    return getScoreLevel(result, test.scoring, test.lowerIsBetter);
  }, [result, test.scoring, test.lowerIsBetter]);

  const handleCellChange = (holeIndex: number, columnKey: string, value: any) => {
    const newHoles = [...holes];
    newHoles[holeIndex] = { ...newHoles[holeIndex], [columnKey]: value };
    setHoles(newHoles);
  };

  const handleReset = () => {
    setHoles(Array(numHoles).fill(null).map((_, index) => {
      const hole: HoleData = { hole: index + 1 };
      if (hasParColumn && defaultPars[numHoles]) {
        hole.par = defaultPars[numHoles][index];
      }
      return hole;
    }));
  };

  const handleSubmit = async () => {
    if (result === null) return;

    setIsSubmitting(true);
    try {
      const totalScore = holes.reduce((sum, h) => sum + (h.score || 0), 0);
      const data: RoundData = {
        testId: test.id,
        playerId: player?.id,
        holes,
        totalScore,
        result,
        stats,
        timestamp: new Date().toISOString(),
      };

      if (onSubmit) {
        await onSubmit(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Count completed holes
  const completedHoles = holes.filter(h => {
    const requiredCols = columns.filter(c => c.required);
    return requiredCols.every(col => h[col.key] !== undefined && h[col.key] !== null && h[col.key] !== '');
  }).length;

  const canSubmit = completedHoles > 0 && result !== null;

  // Filter visible columns (exclude hole number which we handle separately)
  const visibleColumns = columns.filter(c => c.key !== 'hole' && c.key !== 'round' && c.key !== 'position');

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'rgb(var(--gray-100))',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} color="var(--tier-navy)" />
        </button>
        <div>
          <SectionTitle style={{ margin: 0, fontSize: '20px' }}>
            {test.name}
          </SectionTitle>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            {player?.name || 'Registrer runde'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div style={{
        backgroundColor: 'rgb(var(--gray-100))',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flag size={16} color="var(--tier-navy)" />
          <span style={{ fontSize: '14px', color: 'var(--tier-navy)' }}>
            Fremgang
          </span>
        </div>
        <span style={{
          fontSize: '14px',
          fontWeight: 600,
          color: completedHoles === numHoles ? 'rgb(var(--status-success))' : 'var(--tier-navy)',
        }}>
          {completedHoles} / {numHoles}
        </span>
      </div>

      {/* Scorecard */}
      <div style={{
        backgroundColor: 'var(--surface-card)',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        {/* Header Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `50px ${visibleColumns.map(() => '1fr').join(' ')}`,
          gap: '4px',
          padding: '10px 12px',
          backgroundColor: 'rgb(var(--gray-100))',
          borderBottom: `1px solid rgb(var(--border-color))`,
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
          }}>
            #
          </div>
          {visibleColumns.map(col => (
            <div key={col.key} style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}>
              {col.label}
              {col.required && <span style={{ color: 'rgb(var(--status-error))' }}> *</span>}
            </div>
          ))}
        </div>

        {/* Hole Rows */}
        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {holes.map((hole, index) => (
            <div
              key={index}
              style={{
                display: 'grid',
                gridTemplateColumns: `50px ${visibleColumns.map(() => '1fr').join(' ')}`,
                gap: '4px',
                padding: '8px 12px',
                borderBottom: index < holes.length - 1 ? `1px solid rgb(var(--gray-100))` : 'none',
                alignItems: 'center',
                backgroundColor: index % 2 === 0 ? 'var(--surface-card)' : `rgba(245, 247, 249, 0.5)`,
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--tier-navy)',
                color: 'var(--surface-card)',
                fontSize: '14px',
                fontWeight: 700,
              }}>
                {index + 1}
              </div>
              {visibleColumns.map(col => (
                <div key={col.key} style={{ display: 'flex', justifyContent: 'center' }}>
                  <CellInput
                    column={col}
                    value={hole[col.key]}
                    onChange={(value) => handleCellChange(index, col.key, value)}
                    compact
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Totals Row */}
        {hasScoreColumn && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `50px ${visibleColumns.map(() => '1fr').join(' ')}`,
            gap: '4px',
            padding: '12px',
            backgroundColor: 'var(--tier-navy)',
            color: 'var(--surface-card)',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600 }}>TOT</div>
            {visibleColumns.map(col => (
              <div key={col.key} style={{ textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>
                {col.key === 'par' && stats.totalPar}
                {col.key === 'score' && holes.reduce((sum, h) => sum + (h.score || 0), 0)}
                {col.key === 'putts' && holes.filter(h => h.putts).reduce((sum, h) => sum + (h.putts || 0), 0)}
                {col.type === 'boolean' && (
                  `${holes.filter(h => h[col.key] === true).length}/${holes.filter(h => h[col.key] !== undefined).length}`
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {Object.keys(stats).length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '8px',
          marginBottom: '16px',
        }}>
          {stats.vsPar !== undefined && (
            <div style={{
              padding: '12px',
              backgroundColor: stats.vsPar <= 0 ? `rgba(34, 197, 94, 0.09)` : `rgba(239, 68, 68, 0.09)`,
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>vs Par</p>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '20px',
                fontWeight: 700,
                color: stats.vsPar <= 0 ? 'rgb(var(--status-success))' : 'rgb(var(--status-error))',
              }}>
                {stats.vsPar > 0 ? '+' : ''}{stats.vsPar}
              </p>
            </div>
          )}
          {stats.firPercentage !== undefined && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgb(var(--gray-100))',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>FIR</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 700, color: 'var(--tier-navy)' }}>
                {stats.firPercentage.toFixed(0)}%
              </p>
            </div>
          )}
          {stats.girPercentage !== undefined && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgb(var(--gray-100))',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>GIR</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 700, color: 'var(--tier-navy)' }}>
                {stats.girPercentage.toFixed(0)}%
              </p>
            </div>
          )}
          {stats.avgPutts !== undefined && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgb(var(--gray-100))',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Putt/hull</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 700, color: 'var(--tier-navy)' }}>
                {stats.avgPutts.toFixed(1)}
              </p>
            </div>
          )}
          {stats.upDownPercentage !== undefined && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgb(var(--gray-100))',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Up&Down</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 700, color: 'var(--tier-navy)' }}>
                {stats.upDownPercentage.toFixed(0)}%
              </p>
            </div>
          )}
          {stats.avgFocusRating !== undefined && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgb(var(--gray-100))',
              borderRadius: '10px',
              textAlign: 'center',
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Fokus</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 700, color: 'var(--tier-navy)' }}>
                {stats.avgFocusRating.toFixed(1)}/10
              </p>
            </div>
          )}
        </div>
      )}

      {/* Result Card */}
      <div style={{
        backgroundColor: scoreLevel ? `${scoreLevel.color}15` : 'rgb(var(--gray-100))',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        border: scoreLevel ? `2px solid ${scoreLevel.color}40` : `1px solid rgb(var(--border-color))`,
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <Target size={20} color={scoreLevel?.color || 'var(--text-secondary)'} />
          <span style={{
            fontSize: '28px',
            fontWeight: 700,
            color: scoreLevel?.color || 'var(--tier-navy)',
          }}>
            {result !== null ? (test.calculationType === 'direct' ? result : result.toFixed(1)) : '—'}
          </span>
          <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
            {test.unit}
          </span>
        </div>

        {scoreLevel && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            backgroundColor: `${scoreLevel.color}20`,
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 600,
            color: scoreLevel.color,
          }}>
            <TrendingUp size={14} />
            {scoreLevel.label}
          </span>
        )}

        {result === null && (
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Fyll inn data for å se resultat
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button
          variant="secondary"
          onClick={handleReset}
          leftIcon={<RotateCcw size={18} />}
          style={{ flex: 1 }}
        >
          Nullstill
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          leftIcon={<Save size={18} />}
          style={{ flex: 2 }}
        >
          {isSubmitting ? 'Lagrer...' : 'Lagre resultat'}
        </Button>
      </div>
    </div>
  );
};

export default RoundScoringForm;
