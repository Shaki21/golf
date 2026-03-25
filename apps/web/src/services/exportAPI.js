/**
 * Export API Service
 * Handles PDF and Excel exports for reports and data
 */

import api from './api';

/**
 * Download a file from a Blob
 * @param {Blob} blob - File blob
 * @param {string} filename - Suggested filename
 */
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Export player progress report as PDF
 * @param {string} playerId - Player UUID
 * @returns {Promise<void>}
 */
export const exportPlayerReportPDF = async (playerId) => {
  try {
    const response = await api.get(`/export/player/${playerId}/report`, {
      responseType: 'blob',
    });

    const filename = response.headers['content-disposition']
      ?.split('filename=')[1]
      ?.replace(/"/g, '') || `spiller_rapport_${playerId}.pdf`;

    downloadBlob(response.data, filename);
    return { success: true };
  } catch (error) {
    console.error('Failed to export player report:', error);
    throw error;
  }
};

/**
 * Export test results as Excel
 * @param {Object} filters - Query filters
 * @param {string} [filters.playerId] - Player UUID
 * @param {string} [filters.startDate] - Start date (ISO string)
 * @param {string} [filters.endDate] - End date (ISO string)
 * @param {string} [filters.testId] - Test UUID
 * @returns {Promise<void>}
 */
export const exportTestResultsExcel = async (filters = {}) => {
  try {
    const response = await api.get('/export/test-results', {
      params: filters,
      responseType: 'blob',
    });

    const filename = response.headers['content-disposition']
      ?.split('filename=')[1]
      ?.replace(/"/g, '') || 'testresultater.xlsx';

    downloadBlob(response.data, filename);
    return { success: true };
  } catch (error) {
    console.error('Failed to export test results:', error);
    throw error;
  }
};

/**
 * Export training sessions as Excel
 * @param {Object} filters - Query filters
 * @param {string} [filters.playerId] - Player UUID
 * @param {string} [filters.startDate] - Start date (ISO string)
 * @param {string} [filters.endDate] - End date (ISO string)
 * @returns {Promise<void>}
 */
export const exportTrainingSessionsExcel = async (filters = {}) => {
  try {
    const response = await api.get('/export/training-sessions', {
      params: filters,
      responseType: 'blob',
    });

    const filename = response.headers['content-disposition']
      ?.split('filename=')[1]
      ?.replace(/"/g, '') || 'treningsoekter.xlsx';

    downloadBlob(response.data, filename);
    return { success: true };
  } catch (error) {
    console.error('Failed to export training sessions:', error);
    throw error;
  }
};

/**
 * Export academy statistics as Excel (coaches/admins only)
 * @returns {Promise<void>}
 */
export const exportStatisticsExcel = async () => {
  try {
    const response = await api.get('/export/statistics', {
      responseType: 'blob',
    });

    const filename = response.headers['content-disposition']
      ?.split('filename=')[1]
      ?.replace(/"/g, '') || 'akademi_statistikk.xlsx';

    downloadBlob(response.data, filename);
    return { success: true };
  } catch (error) {
    console.error('Failed to export statistics:', error);
    throw error;
  }
};

/**
 * Export training plan as PDF
 * @param {string} playerId - Player UUID
 * @returns {Promise<void>}
 */
export const exportTrainingPlanPDF = async (playerId) => {
  try {
    const response = await api.get(`/export/training-plan/${playerId}`, {
      responseType: 'blob',
    });

    const filename = response.headers['content-disposition']
      ?.split('filename=')[1]
      ?.replace(/"/g, '') || `treningsplan_${playerId}.pdf`;

    downloadBlob(response.data, filename);
    return { success: true };
  } catch (error) {
    console.error('Failed to export training plan:', error);
    throw error;
  }
};

const exportAPI = {
  exportPlayerReportPDF,
  exportTestResultsExcel,
  exportTrainingSessionsExcel,
  exportStatisticsExcel,
  exportTrainingPlanPDF,
};

export default exportAPI;
