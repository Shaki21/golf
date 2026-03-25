/**
 * ExportButton Component
 * Reusable export button with loading state and error handling
 */

import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useExport } from '../../hooks/useExport';

type ExportType = 'playerReport' | 'testResults' | 'trainingSessions' | 'statistics' | 'trainingPlan';

interface ExportButtonProps {
  type: ExportType;
  playerId?: string;
  playerName?: string;
  params?: {
    startDate?: string;
    endDate?: string;
    testId?: string;
  };
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const typeConfig: Record<ExportType, { label: string; icon: typeof FileText; format: 'pdf' | 'xlsx' }> = {
  playerReport: { label: 'Eksporter rapport', icon: FileText, format: 'pdf' },
  testResults: { label: 'Eksporter testresultater', icon: FileSpreadsheet, format: 'xlsx' },
  trainingSessions: { label: 'Eksporter treningsøkter', icon: FileSpreadsheet, format: 'xlsx' },
  statistics: { label: 'Eksporter statistikk', icon: FileSpreadsheet, format: 'xlsx' },
  trainingPlan: { label: 'Eksporter treningsplan', icon: FileText, format: 'pdf' },
};

const variantStyles: Record<string, string> = {
  primary: 'bg-ak-primary text-white hover:bg-ak-primary/90',
  secondary: 'bg-ak-surface-elevated text-ak-text-primary border border-ak-border-default hover:bg-ak-surface-card',
  ghost: 'text-ak-text-secondary hover:text-ak-text-primary hover:bg-ak-surface-elevated',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-2 text-sm gap-2',
  lg: 'px-4 py-2.5 text-base gap-2',
};

export function ExportButton({
  type,
  playerId,
  playerName,
  params,
  variant = 'secondary',
  size = 'md',
  label,
  className = '',
}: ExportButtonProps) {
  const {
    loading,
    error,
    exportPlayerReport,
    exportTestResults,
    exportTrainingSessions,
    exportStatistics,
    exportTrainingPlan,
  } = useExport();

  const [localError, setLocalError] = useState<string | null>(null);

  const config = typeConfig[type];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  const handleClick = async () => {
    setLocalError(null);
    try {
      switch (type) {
        case 'playerReport':
          if (!playerId) throw new Error('playerId er påkrevd');
          await exportPlayerReport(playerId, playerName);
          break;
        case 'testResults':
          await exportTestResults({ playerId, ...params });
          break;
        case 'trainingSessions':
          await exportTrainingSessions({ playerId, ...params });
          break;
        case 'statistics':
          await exportStatistics();
          break;
        case 'trainingPlan':
          if (!playerId) throw new Error('playerId er påkrevd');
          await exportTrainingPlan(playerId, playerName);
          break;
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Eksport feilet');
    }
  };

  return (
    <div className="inline-flex flex-col">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          inline-flex items-center justify-center rounded-md font-medium
          transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        title={`${displayLabel} (${config.format.toUpperCase()})`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        <span>{loading ? 'Eksporterer...' : displayLabel}</span>
      </button>
      {(localError || error) && (
        <span className="text-xs text-red-500 mt-1">{localError || error}</span>
      )}
    </div>
  );
}

export default ExportButton;
