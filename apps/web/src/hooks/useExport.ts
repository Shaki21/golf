/**
 * useExport Hook
 * Handles PDF and Excel exports for player reports, test results, training sessions, etc.
 */

import { useState, useCallback } from 'react';
import { exportAPI } from '../services/api';

interface ExportState {
  loading: boolean;
  error: string | null;
}

interface UseExportReturn extends ExportState {
  exportPlayerReport: (playerId: string, playerName?: string) => Promise<void>;
  exportTestResults: (params?: { playerId?: string; startDate?: string; endDate?: string; testId?: string }) => Promise<void>;
  exportTrainingSessions: (params?: { playerId?: string; startDate?: string; endDate?: string }) => Promise<void>;
  exportStatistics: () => Promise<void>;
  exportTrainingPlan: (playerId: string, playerName?: string) => Promise<void>;
}

/**
 * Downloads a blob as a file
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Gets file extension from content type
 */
function getExtension(contentType: string): string {
  if (contentType.includes('pdf')) return '.pdf';
  if (contentType.includes('spreadsheet') || contentType.includes('excel')) return '.xlsx';
  return '';
}

export function useExport(): UseExportReturn {
  const [state, setState] = useState<ExportState>({
    loading: false,
    error: null,
  });

  const exportPlayerReport = useCallback(async (playerId: string, playerName?: string) => {
    setState({ loading: true, error: null });
    try {
      const response = await exportAPI.playerReport(playerId);
      const filename = playerName
        ? `${playerName.replace(/\s+/g, '_')}_rapport.pdf`
        : `spiller_rapport_${playerId.slice(0, 8)}.pdf`;
      downloadBlob(response.data, filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke eksportere rapport';
      setState({ loading: false, error: message });
      throw err;
    }
    setState({ loading: false, error: null });
  }, []);

  const exportTestResults = useCallback(async (params: { playerId?: string; startDate?: string; endDate?: string; testId?: string } = {}) => {
    setState({ loading: true, error: null });
    try {
      const response = await exportAPI.testResults(params);
      const filename = `testresultater_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadBlob(response.data, filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke eksportere testresultater';
      setState({ loading: false, error: message });
      throw err;
    }
    setState({ loading: false, error: null });
  }, []);

  const exportTrainingSessions = useCallback(async (params: { playerId?: string; startDate?: string; endDate?: string } = {}) => {
    setState({ loading: true, error: null });
    try {
      const response = await exportAPI.trainingSessions(params);
      const filename = `treningsoekter_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadBlob(response.data, filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke eksportere treningsøkter';
      setState({ loading: false, error: message });
      throw err;
    }
    setState({ loading: false, error: null });
  }, []);

  const exportStatistics = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const response = await exportAPI.statistics();
      const filename = `akademi_statistikk_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadBlob(response.data, filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke eksportere statistikk';
      setState({ loading: false, error: message });
      throw err;
    }
    setState({ loading: false, error: null });
  }, []);

  const exportTrainingPlan = useCallback(async (playerId: string, playerName?: string) => {
    setState({ loading: true, error: null });
    try {
      const response = await exportAPI.trainingPlan(playerId);
      const filename = playerName
        ? `${playerName.replace(/\s+/g, '_')}_treningsplan.pdf`
        : `treningsplan_${playerId.slice(0, 8)}.pdf`;
      downloadBlob(response.data, filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke eksportere treningsplan';
      setState({ loading: false, error: message });
      throw err;
    }
    setState({ loading: false, error: null });
  }, []);

  return {
    ...state,
    exportPlayerReport,
    exportTestResults,
    exportTrainingSessions,
    exportStatistics,
    exportTrainingPlan,
  };
}

export default useExport;
