/**
 * KeyframeExtractor
 * Extract and save keyframes from video at specific timestamps
 *
 * Features:
 * - Capture current video frame
 * - Add label and notes to keyframe
 * - Preview captured frame
 * - Save to backend via API
 * - Display extraction progress
 */

import React, { useState, useCallback } from 'react';
import { extractKeyframe } from '../../services/videoApi';
import Button from '../../ui/primitives/Button';
import { track } from '../../analytics/track';
import { SubSectionTitle } from '../typography/Headings';

// ═══════════════════════════════════════════
// TAILWIND CLASSES
// ═══════════════════════════════════════════

const tw = {
  container: 'flex flex-col gap-3 p-4 bg-surface rounded-ak-lg border border-border',
  header: 'flex items-center justify-between',
  title: 'text-sm font-semibold text-[var(--text-inverse)] m-0',
  captureButton: 'flex items-center gap-2 py-2 px-4 bg-primary border-none rounded-ak-md text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity',
  captureButtonDisabled: 'flex items-center gap-2 py-2 px-4 bg-surface-elevated border border-border rounded-ak-md text-[var(--video-text-tertiary)] text-sm font-medium cursor-not-allowed opacity-50',
  previewSection: 'flex flex-col gap-2',
  preview: 'w-full aspect-video bg-[var(--tier-surface-dark-elevated)] rounded-ak-md overflow-hidden border border-border',
  previewImage: 'w-full h-full object-contain',
  noPreview: 'w-full h-full flex items-center justify-center text-[var(--video-text-tertiary)] text-sm',
  timestamp: 'text-xs text-[var(--video-text-secondary)] font-mono',
  form: 'flex flex-col gap-2',
  input: 'w-full py-2 px-3 bg-[var(--tier-surface-dark-elevated)] border border-border rounded-ak-md text-[var(--text-inverse)] text-sm placeholder-[var(--video-text-tertiary)]',
  textarea: 'w-full py-2 px-3 bg-[var(--tier-surface-dark-elevated)] border border-border rounded-ak-md text-[var(--text-inverse)] text-sm placeholder-[var(--video-text-tertiary)] resize-none min-h-[60px]',
  actions: 'flex gap-2 justify-end',
  saveButton: 'py-2 px-4 bg-ak-status-success border-none rounded-ak-md text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity',
  cancelButton: 'py-2 px-4 bg-surface-elevated border border-border rounded-ak-md text-[var(--text-inverse)] text-sm font-medium cursor-pointer hover:bg-surface-elevated-hover transition-colors',
  error: 'p-3 bg-ak-status-error/10 border border-ak-status-error rounded-ak-md text-ak-status-error text-sm',
  success: 'p-3 bg-ak-status-success/10 border border-ak-status-success rounded-ak-md text-ak-status-success text-sm',
};

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function KeyframeExtractor({
  videoId,
  videoElement,
  currentTime = 0,
  onKeyframeCreated,
  className = '',
}) {
  const [capturedFrame, setCapturedFrame] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [label, setLabel] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Capture current frame from video element
  const handleCaptureFrame = useCallback(() => {
    if (!videoElement) {
      setError('Video element not available');
      return;
    }

    try {
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');

      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      setCapturedFrame(dataUrl);
      setTimestamp(currentTime);
      setError(null);
      setSuccess(false);

      track('keyframe_captured', {
        screen: 'KeyframeExtractor',
        videoId,
        timestamp: currentTime,
      });
    } catch (err) {
      console.error('Failed to capture frame:', err);
      setError('Failed to capture frame. Please try again.');
    }
  }, [videoElement, currentTime, videoId]);

  // Save keyframe to backend
  const handleSave = useCallback(async () => {
    if (!capturedFrame || timestamp === null) {
      setError('No frame captured');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await extractKeyframe({
        videoId,
        timestamp,
        label: label.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      setError(null);

      // Reset form after brief delay
      setTimeout(() => {
        setCapturedFrame(null);
        setTimestamp(null);
        setLabel('');
        setNotes('');
        setSuccess(false);
      }, 2000);

      // Notify parent component
      if (onKeyframeCreated) {
        onKeyframeCreated();
      }

      track('keyframe_saved', {
        screen: 'KeyframeExtractor',
        videoId,
        timestamp,
        hasLabel: !!label.trim(),
        hasNotes: !!notes.trim(),
      });
    } catch (err) {
      console.error('Failed to save keyframe:', err);
      setError(err.response?.data?.message || 'Failed to save keyframe. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [videoId, timestamp, capturedFrame, label, notes, onKeyframeCreated]);

  // Cancel and clear form
  const handleCancel = useCallback(() => {
    setCapturedFrame(null);
    setTimestamp(null);
    setLabel('');
    setNotes('');
    setError(null);
    setSuccess(false);
  }, []);

  // Format timestamp for display
  const formatTimestamp = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  return (
    <div className={`${tw.container} ${className}`}>
      {/* Header */}
      <div className={tw.header}>
        <SubSectionTitle className={tw.title} style={{ marginBottom: 0 }}>📸 Keyframe Extraction</SubSectionTitle>
        <button
          onClick={handleCaptureFrame}
          disabled={!videoElement || saving}
          className={videoElement && !saving ? tw.captureButton : tw.captureButtonDisabled}
          title="Capture current frame"
        >
          <span>📷</span>
          <span>Capture Frame</span>
        </button>
      </div>

      {/* Error Message */}
      {error && <div className={tw.error}>{error}</div>}

      {/* Success Message */}
      {success && <div className={tw.success}>✓ Keyframe saved successfully!</div>}

      {/* Preview Section */}
      {capturedFrame && (
        <div className={tw.previewSection}>
          <div className={tw.preview}>
            <img src={capturedFrame} alt="Captured frame" className={tw.previewImage} />
          </div>
          <div className={tw.timestamp}>
            Timestamp: {formatTimestamp(timestamp)}
          </div>
        </div>
      )}

      {/* Form (shown when frame is captured) */}
      {capturedFrame && (
        <div className={tw.form}>
          <input
            type="text"
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={tw.input}
            maxLength={255}
            disabled={saving}
          />
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={tw.textarea}
            maxLength={1000}
            disabled={saving}
          />

          <div className={tw.actions}>
            <button
              onClick={handleCancel}
              disabled={saving}
              className={tw.cancelButton}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={tw.saveButton}
            >
              {saving ? 'Saving...' : '💾 Save Keyframe'}
            </button>
          </div>
        </div>
      )}

      {/* No Preview State */}
      {!capturedFrame && !error && (
        <div className={tw.preview}>
          <div className={tw.noPreview}>
            Click "Capture Frame" to extract the current video frame
          </div>
        </div>
      )}
    </div>
  );
}

export default KeyframeExtractor;
