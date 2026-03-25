/**
 * TableDataForm Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save, RotateCcw, Target, Calculator, Check } from 'lucide-react';
import { SectionTitle, SubSectionTitle } from '../../../components/typography';
import Button from '../../../ui/primitives/Button';
import { TestDefinition, ColumnDef, getScoreLevel } from '../config/testDefinitions';

// ============================================================================
// TYPES
// ============================================================================

interface TableDataFormProps {
  test: TestDefinition;
  player?: {
    id: string;
    name: string;
    category: string;
  };
  onSubmit?: (data: TableData) => Promise<void>;
  onClose: () => void;
}

interface TableData {
  testId: string;
  playerId?: string;
  rows: Record<string, any>[];
  result: number;
  calculationType: string;
  timestamp: string;
}

type RowData = Record<string, any>;

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

const calculateResult = (
  rows: RowData[],
  calculationType: string,
  columns: ColumnDef[]
): number | null => {
  const validRows = rows.filter(row => {
    const requiredCols = columns.filter(c => c.required);
    return requiredCols.every(col => row[col.key] !== undefined && row[col.key] !== '' && row[col.key] !== null);
  });

  if (validRows.length === 0) return null;

  switch (calculationType) {
    case 'pei': {
      // PEI = average of (toHole / distance) * 100
      const peiValues = validRows
        .filter(row => row.distance > 0)
        .map(row => (row.toHole / row.distance) * 100);
      if (peiValues.length === 0) return null;
      return peiValues.reduce((sum, v) => sum + v, 0) / peiValues.length;
    }
    case 'percentage': {
      // Percentage of rows where hit === true
      const hitCount = validRows.filter(row => row.hit === true).length;
      return (hitCount / validRows.length) * 100;
    }
    case 'average': {
      // Average of toHole values
      const toHoleValues = validRows.map(row => row.toHole).filter(v => v !== undefined && v !== null);
      if (toHoleValues.length === 0) return null;
      return toHoleValues.reduce((sum, v) => sum + v, 0) / toHoleValues.length;
    }
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
  rowIndex: number;
}

const CellInput: React.FC<CellInputProps> = ({ column, value, onChange, rowIndex }) => {
  if (column.type === 'boolean') {
    return (
      <button
        onClick={() => onChange(!value)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          border: `2px solid ${value ? 'rgb(var(--status-success))' : 'rgb(var(--border-color))'}`,
          backgroundColor: value ? 'rgb(var(--status-success))' : 'var(--surface-card)',
          color: value ? 'var(--surface-card)' : 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
        }}
      >
        {value && <Check size={18} />}
      </button>
    );
  }

  if (column.type === 'select' && column.options) {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '8px 12px',
          fontSize: '14px',
          border: `1px solid rgb(var(--border-color))`,
          borderRadius: '8px',
          backgroundColor: 'var(--surface-card)',
          width: '100%',
          minWidth: '80px',
        }}
      >
        <option value="">Velg...</option>
        {column.options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </select>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || '')}
        placeholder="0"
        style={{
          width: '100%',
          minWidth: '70px',
          padding: '8px 12px',
          paddingRight: column.unit ? '35px' : '12px',
          fontSize: '14px',
          fontWeight: 500,
          border: `1px solid ${value ? 'var(--tier-navy)' : 'rgb(var(--border-color))'}`,
          borderRadius: '8px',
          backgroundColor: value ? `rgba(26, 61, 46, 0.03)` : 'var(--surface-card)',
          outline: 'none',
        }}
      />
      {column.unit && (
        <span style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
        }}>
          {column.unit}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TableDataForm: React.FC<TableDataFormProps> = ({
  test,
  player,
  onSubmit,
  onClose,
}) => {
  const columns = test.formConfig?.columns || [];
  const prefilledDistances = test.formConfig?.distances;

  // Initialize rows
  const [rows, setRows] = useState<RowData[]>(() => {
    return Array(test.attempts).fill(null).map((_, index) => {
      const row: RowData = { id: index + 1 };
      // Prefill distance if provided
      if (prefilledDistances && prefilledDistances[index] !== undefined) {
        row.distance = prefilledDistances[index];
      }
      return row;
    });
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate result
  const result = useMemo(() => {
    return calculateResult(rows, test.calculationType, columns);
  }, [rows, test.calculationType, columns]);

  // Get score level
  const scoreLevel = useMemo(() => {
    if (result === null) return null;
    return getScoreLevel(result, test.scoring, test.lowerIsBetter);
  }, [result, test.scoring, test.lowerIsBetter]);

  const handleCellChange = (rowIndex: number, columnKey: string, value: any) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [columnKey]: value };
    setRows(newRows);
  };

  const handleReset = () => {
    setRows(Array(test.attempts).fill(null).map((_, index) => {
      const row: RowData = { id: index + 1 };
      if (prefilledDistances && prefilledDistances[index] !== undefined) {
        row.distance = prefilledDistances[index];
      }
      return row;
    }));
  };

  const handleSubmit = async () => {
    if (result === null) return;

    setIsSubmitting(true);
    try {
      const data: TableData = {
        testId: test.id,
        playerId: player?.id,
        rows,
        result,
        calculationType: test.calculationType,
        timestamp: new Date().toISOString(),
      };

      if (onSubmit) {
        await onSubmit(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Count completed rows
  const completedRows = rows.filter(row => {
    const requiredCols = columns.filter(c => c.required);
    return requiredCols.every(col => row[col.key] !== undefined && row[col.key] !== '' && row[col.key] !== null);
  }).length;

  const canSubmit = completedRows > 0 && result !== null;

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
            {player?.name || 'Registrer data'}
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
        <span style={{ fontSize: '14px', color: 'var(--tier-navy)' }}>
          Fremgang
        </span>
        <span style={{
          fontSize: '14px',
          fontWeight: 600,
          color: completedRows === test.attempts ? 'rgb(var(--status-success))' : 'var(--tier-navy)',
        }}>
          {completedRows} / {test.attempts} rader
        </span>
      </div>

      {/* Data Table */}
      <div style={{
        backgroundColor: 'var(--surface-card)',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `40px ${columns.map(() => '1fr').join(' ')}`,
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: 'rgb(var(--gray-100))',
          borderBottom: `1px solid rgb(var(--border-color))`,
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            #
          </div>
          {columns.map(col => (
            <div key={col.key} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {col.label}
              {col.required && <span style={{ color: 'rgb(var(--status-error))' }}> *</span>}
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: 'grid',
                gridTemplateColumns: `40px ${columns.map(() => '1fr').join(' ')}`,
                gap: '8px',
                padding: '10px 16px',
                borderBottom: rowIndex < rows.length - 1 ? `1px solid rgb(var(--gray-100))` : 'none',
                alignItems: 'center',
              }}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textAlign: 'center',
              }}>
                {rowIndex + 1}
              </div>
              {columns.map(col => (
                <CellInput
                  key={col.key}
                  column={col}
                  value={row[col.key]}
                  onChange={(value) => handleCellChange(rowIndex, col.key, value)}
                  rowIndex={rowIndex}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Result Card */}
      <div style={{
        backgroundColor: scoreLevel ? `${scoreLevel.color}15` : 'rgb(var(--gray-100))',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: scoreLevel ? `2px solid ${scoreLevel.color}40` : `1px solid rgb(var(--border-color))`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: scoreLevel ? `${scoreLevel.color}20` : 'var(--surface-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {test.calculationType === 'pei' ? (
              <Target size={20} color={scoreLevel?.color || 'var(--text-secondary)'} />
            ) : (
              <Calculator size={20} color={scoreLevel?.color || 'var(--text-secondary)'} />
            )}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              {test.calculationType === 'pei' && 'PEI (Precision Error Index)'}
              {test.calculationType === 'percentage' && 'Treffprosent'}
              {test.calculationType === 'average' && 'Gjennomsnitt'}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{
                fontSize: '32px',
                fontWeight: 700,
                color: scoreLevel?.color || 'var(--tier-navy)',
              }}>
                {result !== null ? result.toFixed(1) : '—'}
              </span>
              <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                {test.unit}
              </span>
            </div>
          </div>
        </div>

        {scoreLevel && (
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            backgroundColor: `${scoreLevel.color}20`,
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 600,
            color: scoreLevel.color,
          }}>
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

export default TableDataForm;
