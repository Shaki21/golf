/**
 * Export Button Component
 * Provides dropdown menu for various export options
 */

import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { Button } from '../../ui/primitives';
import exportAPI from '../../services/exportAPI';

interface ExportOption {
  label: string;
  type: 'pdf' | 'excel';
  action: () => Promise<void>;
  icon?: React.ReactNode;
}

interface ExportButtonProps {
  options: ExportOption[];
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  options,
  variant = 'outline',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExport = async (option: ExportOption) => {
    setLoading(true);
    setIsOpen(false);
    try {
      await option.action();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Eksport feilet. Vennligst prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        variant={variant}
        size={size}
        leftIcon={<Download size={16} />}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        {loading ? 'Eksporterer...' : 'Eksporter'}
      </Button>

      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              minWidth: 200,
              backgroundColor: 'rgb(var(--tier-white))',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid var(--tier-border-default, #E5E7EB)',
              zIndex: 1000,
              overflow: 'hidden',
            }}
          >
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleExport(option)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: 'var(--tier-text-primary, #111827)',
                  textAlign: 'left',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--tier-surface-hover, #F9FAFB)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {option.icon || (
                  option.type === 'pdf' ? <FileText size={16} /> : <Table size={16} />
                )}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Pre-configured export buttons for common scenarios
 */

interface PlayerExportButtonProps {
  playerId: string;
}

export const PlayerExportButton: React.FC<PlayerExportButtonProps> = ({ playerId }) => {
  const options: ExportOption[] = [
    {
      label: 'Spillerrapport (PDF)',
      type: 'pdf',
      action: () => exportAPI.exportPlayerReportPDF(playerId),
    },
    {
      label: 'Testresultater (Excel)',
      type: 'excel',
      action: () => exportAPI.exportTestResultsExcel({ playerId }),
    },
    {
      label: 'Treningsøkter (Excel)',
      type: 'excel',
      action: () => exportAPI.exportTrainingSessionsExcel({ playerId }),
    },
    {
      label: 'Treningsplan (PDF)',
      type: 'pdf',
      action: () => exportAPI.exportTrainingPlanPDF(playerId),
    },
  ];

  return <ExportButton options={options} />;
};

interface TestResultsExportButtonProps {
  playerId?: string;
  startDate?: string;
  endDate?: string;
  testId?: string;
}

export const TestResultsExportButton: React.FC<TestResultsExportButtonProps> = (filters) => {
  const options: ExportOption[] = [
    {
      label: 'Eksporter testresultater (Excel)',
      type: 'excel',
      action: () => exportAPI.exportTestResultsExcel(filters),
    },
  ];

  return <ExportButton options={options} variant="outline" size="sm" />;
};

interface CoachExportButtonProps {
  playerId?: string;
}

export const CoachExportButton: React.FC<CoachExportButtonProps> = ({ playerId }) => {
  const options: ExportOption[] = [
    {
      label: 'Akademistatistikk (Excel)',
      type: 'excel',
      action: () => exportAPI.exportStatisticsExcel(),
    },
  ];

  if (playerId) {
    options.unshift({
      label: 'Spillerrapport (PDF)',
      type: 'pdf',
      action: () => exportAPI.exportPlayerReportPDF(playerId),
    });
  }

  return <ExportButton options={options} />;
};

export default ExportButton;
