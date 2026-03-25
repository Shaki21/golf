/**
 * GoalProgressCard Component
 * Displays a technique goal with progress bar
 */

import React from 'react';
import { METRIC_LABELS, STATUS_LABELS } from '../types';
import { SubSectionTitle } from '../../../components/typography';

export default function GoalProgressCard({ goal, onUpdate }) {
  const progressColor =
    goal.status === 'achieved'
      ? 'var(--color-success)'
      : goal.progressPercent >= 75
      ? 'var(--color-primary)'
      : goal.progressPercent >= 50
      ? 'var(--color-warning)'
      : 'var(--color-text-muted)';

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        border: '1px solid var(--color-border)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <SubSectionTitle style={{ margin: '0 0 4px 0' }}>{goal.title}</SubSectionTitle>
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {METRIC_LABELS[goal.metricType] || goal.metricType}
          </span>
        </div>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            background: goal.status === 'achieved' ? 'var(--color-success-bg)' : 'var(--color-surface-alt)',
            color: goal.status === 'achieved' ? 'var(--color-success)' : 'var(--color-text-secondary)',
          }}
        >
          {STATUS_LABELS[goal.status] || goal.status}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: '8px',
          background: 'var(--color-surface-alt)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(goal.progressPercent, 100)}%`,
            background: progressColor,
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Values */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
        <div>
          <span style={{ color: 'var(--color-text-muted)' }}>Utgangspunkt: </span>
          <span>{goal.baselineValue != null ? `${goal.baselineValue.toFixed(1)}°` : '-'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--color-text-muted)' }}>Navarende: </span>
          <span style={{ fontWeight: 600, color: progressColor }}>
            {goal.currentValue != null ? `${goal.currentValue.toFixed(1)}°` : '-'}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--color-text-muted)' }}>Mal: </span>
          <span>{goal.targetValue.toFixed(1)}°</span>
        </div>
      </div>

      {/* Progress percentage */}
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <span style={{ fontSize: '24px', fontWeight: 700, color: progressColor }}>
          {goal.progressPercent}%
        </span>
      </div>

      {/* Actions */}
      {goal.status === 'active' && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onUpdate(goal.id, { status: 'paused' })}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Pause
          </button>
        </div>
      )}
    </div>
  );
}
