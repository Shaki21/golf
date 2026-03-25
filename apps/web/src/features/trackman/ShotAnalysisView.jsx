/**
 * ShotAnalysisView
 * Detailed analysis of a single shot
 *
 * Features:
 * - All shot metrics displayed
 * - Visual indicators for good/bad values
 * - Comparison to player averages
 * - Shot trajectory visualization (placeholder)
 * - Notes and tags
 */

import React from 'react';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6',
  header: 'flex items-center justify-between',
  title: 'text-xl font-semibold text-[var(--text-inverse)] m-0',
  shotNumber: 'text-sm text-[var(--video-text-secondary)]',
  mainCard: 'p-6 bg-surface rounded-xl border border-border',
  clubInfo: 'flex items-center justify-between mb-6 pb-6 border-b border-border',
  clubName: 'text-2xl font-bold text-[var(--text-inverse)]',
  shotType: 'py-1 px-3 bg-primary/20 border border-primary rounded-md text-primary text-sm font-medium',
  metricsGrid: 'grid grid-cols-2 md:grid-cols-3 gap-4 mb-6',
  metricCard: 'p-4 bg-surface-elevated rounded-lg',
  metricLabel: 'text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider mb-2',
  metricValue: 'text-2xl font-bold text-[var(--text-inverse)]',
  metricUnit: 'text-sm text-[var(--video-text-secondary)] ml-1',
  metricComparison: 'text-xs text-[var(--video-text-secondary)] mt-1',
  trajectorySection: 'mb-6',
  sectionTitle: 'text-sm font-semibold text-[var(--text-inverse)] mb-3',
  trajectoryPlaceholder: 'h-48 bg-surface-elevated rounded-lg flex items-center justify-center text-[var(--video-text-tertiary)] text-sm',
  notesSection: 'flex flex-col gap-2',
  notesText: 'text-sm text-[var(--video-text-secondary)] italic',
  emptyNotes: 'text-sm text-[var(--video-text-tertiary)] italic',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function ShotAnalysisView({ className = '', shot, playerAverages = null, onClose }) {
  if (!shot) {
    return (
      <div className={`${tw.container} ${className}`}>
        <p className="text-center text-[var(--video-text-secondary)]">
          Ingen slag valgt
        </p>
      </div>
    );
  }

  // Calculate comparison to averages
  const getComparison = (value, avgValue) => {
    if (!avgValue || !value) return null;
    const diff = value - avgValue;
    const percentage = ((diff / avgValue) * 100).toFixed(1);
    if (Math.abs(diff) < 1) return 'På snittet';
    return diff > 0
      ? `+${percentage}% over snitt`
      : `${percentage}% under snitt`;
  };

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <div>
          <SectionTitle style={{ marginBottom: 0 }}>Slag Analyse</SectionTitle>
          <p className={tw.shotNumber}>
            Slag #{shot.shotNumber || 'N/A'}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="py-2 px-4 bg-surface-elevated border border-border rounded-lg text-[var(--text-inverse)] text-sm font-medium cursor-pointer hover:bg-surface-elevated-hover transition-colors"
          >
            ✕ Lukk
          </button>
        )}
      </div>

      {/* Main Card */}
      <div className={tw.mainCard}>
        {/* Club Info */}
        <div className={tw.clubInfo}>
          <SubSectionTitle style={{ marginBottom: 0, fontSize: '1.5rem', fontWeight: 700 }}>{shot.club || 'Ukjent kølle'}</SubSectionTitle>
          <span className={tw.shotType}>{shot.shotType || 'Standard'}</span>
        </div>

        {/* Metrics Grid */}
        <div className={tw.metricsGrid}>
          {/* Carry Distance */}
          <div className={tw.metricCard}>
            <div className={tw.metricLabel}>Carry Distance</div>
            <div className={tw.metricValue}>
              {shot.carryDistance ? Math.round(shot.carryDistance) : '-'}
              <span className={tw.metricUnit}>m</span>
            </div>
            {playerAverages?.avgCarryDistance && (
              <div className={tw.metricComparison}>
                {getComparison(shot.carryDistance, playerAverages.avgCarryDistance)}
              </div>
            )}
          </div>

          {/* Total Distance */}
          <div className={tw.metricCard}>
            <div className={tw.metricLabel}>Total Distance</div>
            <div className={tw.metricValue}>
              {shot.totalDistance ? Math.round(shot.totalDistance) : '-'}
              <span className={tw.metricUnit}>m</span>
            </div>
          </div>

          {/* Ball Speed */}
          <div className={tw.metricCard}>
            <div className={tw.metricLabel}>Ball Speed</div>
            <div className={tw.metricValue}>
              {shot.ballSpeed ? Math.round(shot.ballSpeed) : '-'}
              <span className={tw.metricUnit}>mph</span>
            </div>
            {playerAverages?.avgBallSpeed && (
              <div className={tw.metricComparison}>
                {getComparison(shot.ballSpeed, playerAverages.avgBallSpeed)}
              </div>
            )}
          </div>

          {/* Club Speed */}
          <div className={tw.metricCard}>
            <div className={tw.metricLabel}>Club Speed</div>
            <div className={tw.metricValue}>
              {shot.clubSpeed ? Math.round(shot.clubSpeed) : '-'}
              <span className={tw.metricUnit}>mph</span>
            </div>
          </div>

          {/* Launch Angle */}
          <div className={tw.metricCard}>
            <div className={tw.metricLabel}>Launch Angle</div>
            <div className={tw.metricValue}>
              {shot.launchAngle ? shot.launchAngle.toFixed(1) : '-'}
              <span className={tw.metricUnit}>°</span>
            </div>
          </div>

          {/* Spin Rate */}
          <div className={tw.metricCard}>
            <div className={tw.metricLabel}>Spin Rate</div>
            <div className={tw.metricValue}>
              {shot.spinRate ? Math.round(shot.spinRate).toLocaleString() : '-'}
              <span className={tw.metricUnit}>rpm</span>
            </div>
          </div>

          {/* Side Spin */}
          {shot.sideSpin !== undefined && (
            <div className={tw.metricCard}>
              <div className={tw.metricLabel}>Side Spin</div>
              <div className={tw.metricValue}>
                {Math.round(shot.sideSpin)}
                <span className={tw.metricUnit}>rpm</span>
              </div>
            </div>
          )}

          {/* Attack Angle */}
          {shot.attackAngle !== undefined && (
            <div className={tw.metricCard}>
              <div className={tw.metricLabel}>Attack Angle</div>
              <div className={tw.metricValue}>
                {shot.attackAngle.toFixed(1)}
                <span className={tw.metricUnit}>°</span>
              </div>
            </div>
          )}

          {/* Smash Factor */}
          {shot.smashFactor !== undefined && (
            <div className={tw.metricCard}>
              <div className={tw.metricLabel}>Smash Factor</div>
              <div className={tw.metricValue}>
                {shot.smashFactor.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Trajectory Visualization (Placeholder) */}
        <div className={tw.trajectorySection}>
          <SubSectionTitle style={{ marginBottom: '12px' }}>Bane Visualisering</SubSectionTitle>
          <div className={tw.trajectoryPlaceholder}>
            Stats Bane-diagram kommer snart
          </div>
        </div>

        {/* Notes */}
        {shot.notes && (
          <div className={tw.notesSection}>
            <SubSectionTitle style={{ marginBottom: '12px' }}>Notater</SubSectionTitle>
            <p className={tw.notesText}>{shot.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShotAnalysisView;
