/**
 * TaskCard Component
 * Displays a single technique task with status and actions
 */

import React, { useState } from 'react';
import { TECHNICAL_AREAS, PRIORITY_LABELS, STATUS_LABELS } from '../types';
import { SubSectionTitle } from '../../../components/typography';

const priorityColors = {
  high: 'var(--color-error)',
  medium: 'var(--color-warning)',
  low: 'var(--color-text-muted)',
};

const statusColors = {
  pending: 'var(--color-text-muted)',
  in_progress: 'var(--color-primary)',
  completed: 'var(--color-success)',
};

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const handleStatusChange = (newStatus) => {
    onUpdate(task.id, { status: newStatus });
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: priorityColors[task.priority] || priorityColors.medium,
              }}
            />
            <SubSectionTitle style={{ margin: 0 }}>{task.title}</SubSectionTitle>
            {task.videoUrl && (
              <span style={{ fontSize: '12px', color: 'var(--color-primary)' }}>Video</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            <span>{TECHNICAL_AREAS[task.technicalArea] || task.technicalArea}</span>
            <span style={{ color: statusColors[task.status] }}>
              {STATUS_LABELS[task.status] || task.status}
            </span>
            {task.dueDate && (
              <span>Frist: {new Date(task.dueDate).toLocaleDateString('nb-NO')}</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: 'var(--color-text-secondary)',
          }}
        >
          {expanded ? '\u25B2' : '\u25BC'}
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <p style={{ margin: '0 0 12px 0', color: 'var(--color-text-secondary)' }}>
            {task.description}
          </p>

          {task.instructions && (
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ fontSize: '13px' }}>Instruksjoner:</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                {task.instructions}
              </p>
            </div>
          )}

          {task.videoUrl && (
            <a
              href={task.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginBottom: '12px',
                color: 'var(--color-primary)',
                textDecoration: 'underline',
              }}
            >
              Se video
            </a>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {task.status === 'pending' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Start
              </button>
            )}
            {task.status === 'in_progress' && (
              <button
                onClick={() => handleStatusChange('completed')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'var(--color-success)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Merk som fullfort
              </button>
            )}
            <button
              onClick={() => onDelete(task.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Slett
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
