/**
 * TrackManImporter
 * Import TrackMan CSV/data files
 *
 * Features:
 * - File upload interface
 * - CSV file parsing
 * - Preview data before import
 * - Map columns to fields
 * - Bulk import shots to session
 * - Error handling and validation
 */

import React, { useState, useCallback } from 'react';
import { useTrackMan } from '../../hooks/useTrackMan';
import Button from '../../ui/primitives/Button';
import { track } from '../../analytics/track';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-6',
  header: 'flex items-center justify-between',
  title: 'text-xl font-semibold text-[var(--text-inverse)] m-0',
  uploadSection: 'p-8 bg-surface rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer text-center',
  uploadIcon: 'text-5xl mb-3',
  uploadTitle: 'text-base font-semibold text-[var(--text-inverse)] mb-2',
  uploadDescription: 'text-sm text-[var(--video-text-secondary)]',
  fileInput: 'hidden',
  fileInfo: 'p-4 bg-surface-elevated rounded-lg flex items-center justify-between',
  fileName: 'text-sm font-medium text-[var(--text-inverse)]',
  fileSize: 'text-xs text-[var(--video-text-secondary)]',
  removeButton: 'py-1 px-3 bg-tier-error/20 border border-tier-error rounded-md text-tier-error text-xs font-medium cursor-pointer hover:bg-tier-error/30 transition-colors',
  previewSection: 'flex flex-col gap-3',
  previewTitle: 'text-sm font-semibold text-[var(--text-inverse)]',
  previewTable: 'w-full border border-border rounded-xl overflow-hidden',
  thead: 'bg-surface-elevated',
  th: 'py-2 px-3 text-left text-xs font-semibold text-[var(--video-text-secondary)] uppercase tracking-wider border-b border-border',
  tbody: 'bg-surface divide-y divide-border',
  tr: 'hover:bg-surface-elevated transition-colors',
  td: 'py-2 px-3 text-xs text-[var(--text-inverse)]',
  actions: 'flex gap-3 justify-end pt-4 border-t border-border',
  errorMessage: 'py-2 px-3 bg-tier-error/20 border border-tier-error rounded-lg text-tier-error text-sm',
  successMessage: 'py-2 px-3 bg-tier-success/20 border border-tier-success rounded-lg text-tier-success text-sm',
  infoCard: 'p-4 bg-blue-500/10 rounded-xl border border-blue-500',
  infoTitle: 'text-sm font-semibold text-[var(--text-inverse)] mb-2',
  infoText: 'text-xs text-[var(--video-text-secondary)]',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function TrackManImporter({
  className = '',
  sessionId,
  onImportComplete,
  onCancel,
}) {
  const {
    importTrackManData,
    saving,
  } = useTrackMan();

  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Kun CSV-filer er støttet');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);

    // Parse CSV for preview (simplified)
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const lines = text.split('\n').filter(line => line.trim());

        // Take first 5 rows for preview
        const previewRows = lines.slice(0, Math.min(6, lines.length));

        setPreviewData({
          headers: previewRows[0]?.split(',') || [],
          rows: previewRows.slice(1).map(line => line.split(',')),
          totalRows: lines.length - 1,
        });
      } catch (err) {
        console.error('Failed to parse CSV:', err);
        setError('Kunne ikke lese CSV-fil');
      }
    };
    reader.readAsText(selectedFile);
  }, []);

  // Handle file removal
  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setPreviewData(null);
    setError(null);
    setSuccess(false);
  }, []);

  // Handle import
  const handleImport = useCallback(async () => {
    if (!file || !sessionId) {
      setError('Mangler fil eller økt-ID');
      return;
    }

    setError(null);
    setSuccess(false);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      await importTrackManData(sessionId, formData);

      setSuccess(true);

      track('trackman_data_imported', {
        screen: 'TrackManImporter',
        sessionId,
        fileName: file.name,
      });

      // Call completion callback after short delay
      setTimeout(() => {
        if (onImportComplete) {
          onImportComplete();
        }
      }, 1500);
    } catch (err) {
      console.error('Failed to import data:', err);
      setError('Kunne ikke importere data');
    }
  }, [file, sessionId, importTrackManData, onImportComplete]);

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <SectionTitle style={{ marginBottom: 0 }}>Importer TrackMan Data</SectionTitle>
      </div>

      {/* Info Card */}
      <div className={tw.infoCard}>
        <SubSectionTitle style={{ marginBottom: '8px' }}>Stottede filformater</SubSectionTitle>
        <p className={tw.infoText}>
          Last opp en CSV-fil eksportert fra TrackMan. Filen bør inneholde kolonner for:
          Club, Carry Distance, Total Distance, Ball Speed, Club Speed, Launch Angle, Spin Rate.
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className={tw.errorMessage}>{error}</div>
      )}
      {success && (
        <div className={tw.successMessage}>
          ✓ Data importert! Oppdaterer økt...
        </div>
      )}

      {/* File Upload */}
      {!file ? (
        <label className={tw.uploadSection}>
          <div className={tw.uploadIcon}>📁</div>
          <SubSectionTitle style={{ marginBottom: '8px' }}>Klikk for å velge fil</SubSectionTitle>
          <p className={tw.uploadDescription}>
            Eller dra og slipp CSV-fil her
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className={tw.fileInput}
          />
        </label>
      ) : (
        <>
          {/* File Info */}
          <div className={tw.fileInfo}>
            <div>
              <div className={tw.fileName}>📄 {file.name}</div>
              <div className={tw.fileSize}>
                {(file.size / 1024).toFixed(2)} KB
              </div>
            </div>
            <button onClick={handleRemoveFile} className={tw.removeButton}>
              Fjern
            </button>
          </div>

          {/* Preview */}
          {previewData && (
            <div className={tw.previewSection}>
              <SubSectionTitle style={{ marginBottom: '12px' }}>
                Forhåndsvisning ({previewData.rows.length} av {previewData.totalRows} rader)
              </SubSectionTitle>
              <table className={tw.previewTable}>
                <thead className={tw.thead}>
                  <tr>
                    {previewData.headers.map((header, i) => (
                      <th key={i} className={tw.th}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={tw.tbody}>
                  {previewData.rows.map((row, i) => (
                    <tr key={i} className={tw.tr}>
                      {row.map((cell, j) => (
                        <td key={j} className={tw.td}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className={tw.actions}>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Avbryt
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleImport}
          disabled={!file || saving || success}
        >
          {saving ? 'Importerer...' : success ? '✓ Importert' : '📥 Importer Data'}
        </Button>
      </div>
    </div>
  );
}

export default TrackManImporter;
