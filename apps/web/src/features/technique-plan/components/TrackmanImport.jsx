/**
 * TrackmanImport Component
 * CSV file upload with drag-and-drop support
 */

import React, { useState, useCallback } from 'react';
import { CardTitle } from '../../../components/typography';

export default function TrackmanImport({ playerId, onUpload, imports = [] }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];
      if (!file.name.endsWith('.csv')) {
        setError('Kun CSV-filer stettes');
        return;
      }

      await uploadFile(file);
    },
    [playerId, onUpload]
  );

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Kun CSV-filer stottes');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onUpload(file, playerId);
      setSuccess(`Importert ${result.shotsImported} slag fra ${file.name}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Import feilet');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          background: isDragging ? 'var(--color-primary-bg)' : 'var(--color-surface)',
          transition: 'all 0.2s ease',
          cursor: uploading ? 'wait' : 'pointer',
        }}
      >
        {uploading ? (
          <div>
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--color-border)',
                borderTopColor: 'var(--color-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px',
              }}
            />
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Importerer...</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>&#128193;</div>
            <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Dra og slipp TrackMan CSV-fil her</p>
            <p style={{ margin: '0 0 16px 0', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              eller klikk for a velge fil
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                background: 'var(--color-primary)',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Velg fil
            </label>
          </>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            background: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            background: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          {success}
        </div>
      )}

      {/* Import history */}
      {imports.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <CardTitle style={{ margin: '0 0 12px 0' }}>
            Tidligere importer
          </CardTitle>
          <div style={{ background: 'var(--color-surface)', borderRadius: '8px', overflow: 'hidden' }}>
            {imports.slice(0, 5).map((imp) => (
              <div
                key={imp.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: '14px',
                }}
              >
                <span>{imp.fileName}</span>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  <span>{imp.importedRows} slag</span>
                  <span style={{ marginLeft: '12px' }}>
                    {new Date(imp.importedAt).toLocaleDateString('nb-NO')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
