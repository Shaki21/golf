/**
 * SimpleAttemptsForm Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save, RotateCcw, TrendingUp, Trophy, Calculator } from 'lucide-react';
import { SectionTitle, SubSectionTitle } from '../../../components/typography';
import Button from '../../../ui/primitives/Button';
import { TestDefinition, getScoreLevel } from '../config/testDefinitions';

// ============================================================================
// TYPES
// ============================================================================

interface SimpleAttemptsFormProps {
  test: TestDefinition;
  player?: {
    id: string;
    name: string;
    category: string;
  };
  onSubmit?: (data: SimpleAttemptsData) => Promise<void>;
  onClose: () => void;
}

interface SimpleAttemptsData {
  testId: string;
  playerId?: string;
  attempts: number[];
  result: number;
  calculationType: string;
  timestamp: string;
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

const calculateResult = (
  attempts: number[],
  calculationType: string
): number | null => {
  const validAttempts = attempts.filter(v => v > 0);
  if (validAttempts.length === 0) return null;

  switch (calculationType) {
    case 'best':
      return Math.max(...validAttempts);
    case 'averageBest3':
      const sorted = [...validAttempts].sort((a, b) => b - a);
      const top3 = sorted.slice(0, 3);
      return top3.reduce((sum, v) => sum + v, 0) / top3.length;
    case 'average':
      return validAttempts.reduce((sum, v) => sum + v, 0) / validAttempts.length;
    case 'stddev':
      const mean = validAttempts.reduce((sum, v) => sum + v, 0) / validAttempts.length;
      const squaredDiffs = validAttempts.map(v => Math.pow(v - mean, 2));
      const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / validAttempts.length;
      return Math.sqrt(variance);
    case 'direct':
      return validAttempts[0] || null;
    default:
      return validAttempts[0] || null;
  }
};

const getCalculationLabel = (calculationType: string): string => {
  switch (calculationType) {
    case 'best': return 'Beste forsøk';
    case 'averageBest3': return 'Snitt av beste 3';
    case 'average': return 'Gjennomsnitt';
    case 'stddev': return 'Standardavvik';
    case 'direct': return 'Direkte verdi';
    default: return 'Resultat';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SimpleAttemptsForm: React.FC<SimpleAttemptsFormProps> = ({
  test,
  player,
  onSubmit,
  onClose,
}) => {
  const [attempts, setAttempts] = useState<number[]>(
    Array(test.attempts).fill(0)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate result
  const result = useMemo(() => {
    return calculateResult(attempts, test.calculationType);
  }, [attempts, test.calculationType]);

  // Get score level for coloring
  const scoreLevel = useMemo(() => {
    if (result === null) return null;
    return getScoreLevel(result, test.scoring, test.lowerIsBetter);
  }, [result, test.scoring, test.lowerIsBetter]);

  const handleAttemptChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newAttempts = [...attempts];
    newAttempts[index] = numValue;
    setAttempts(newAttempts);
  };

  const handleReset = () => {
    setAttempts(Array(test.attempts).fill(0));
  };

  const handleSubmit = async () => {
    if (!result) return;

    setIsSubmitting(true);
    try {
      const data: SimpleAttemptsData = {
        testId: test.id,
        playerId: player?.id,
        attempts: attempts.filter(v => v > 0),
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

  const validAttemptCount = attempts.filter(v => v > 0).length;
  const canSubmit = validAttemptCount > 0 && result !== null;

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
            {player?.name || 'Registrer forsøk'}
          </p>
        </div>
      </div>

      {/* Attempts Input */}
      <div style={{
        backgroundColor: 'var(--surface-card)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <SubSectionTitle style={{ margin: '0 0 16px 0', fontSize: '15px' }}>
          Registrer forsøk ({test.attempts} {test.attempts === 1 ? 'forsøk' : 'forsøk'})
        </SubSectionTitle>

        <div style={{
          display: 'grid',
          gridTemplateColumns: test.attempts <= 3
            ? `repeat(${test.attempts}, 1fr)`
            : 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '12px',
        }}>
          {attempts.map((value, index) => (
            <div key={index}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}>
                Forsøk {index + 1}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={value || ''}
                  onChange={(e) => handleAttemptChange(index, e.target.value)}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 16px',
                    fontSize: '18px',
                    fontWeight: 600,
                    border: `2px solid ${value > 0 ? 'var(--tier-navy)' : 'rgb(var(--border-color))'}`,
                    borderRadius: '10px',
                    backgroundColor: value > 0 ? `rgba(26, 61, 46, 0.05)` : 'var(--surface-card)',
                    outline: 'none',
                    transition: 'all 0.2s',
                  }}
                />
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                }}>
                  {test.unit}
                </span>
              </div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: scoreLevel ? `${scoreLevel.color}20` : 'var(--surface-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {test.calculationType === 'best' ? (
              <Trophy size={20} color={scoreLevel?.color || 'var(--text-secondary)'} />
            ) : (
              <Calculator size={20} color={scoreLevel?.color || 'var(--text-secondary)'} />
            )}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              {getCalculationLabel(test.calculationType)}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
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
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: `${scoreLevel.color}20`,
            borderRadius: '20px',
          }}>
            <TrendingUp size={16} color={scoreLevel.color} />
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: scoreLevel.color,
            }}>
              {scoreLevel.label}
            </span>
          </div>
        )}

        {!result && (
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Registrer minst ett forsøk for å se resultat
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

export default SimpleAttemptsForm;
