/**
 * TIER GOLF - ExportButton Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 *
 * Exports a target element to PDF using html2canvas and jspdf.
 * Supports both button and icon-only modes.
 */

import React, { useState, useCallback } from 'react';
import { Download, FileDown, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * ExportButton - Export content to PDF
 *
 * @param {Object} props
 * @param {string} props.targetId - ID of the element to export
 * @param {string} props.filename - Output filename (without .pdf extension)
 * @param {string} props.title - Optional title for the PDF
 * @param {'button' | 'icon'} props.variant - Display variant
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {string} props.label - Button label (for button variant)
 * @param {Function} props.onExportStart - Callback when export starts
 * @param {Function} props.onExportComplete - Callback when export completes
 * @param {Function} props.onExportError - Callback on error
 * @param {Object} props.style - Additional styles
 */
export default function ExportButton({
  targetId,
  filename = 'export',
  title,
  variant = 'button',
  size = 'md',
  label = 'Eksporter PDF',
  onExportStart,
  onExportComplete,
  onExportError,
  style,
  disabled = false,
  ...props
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (isExporting || disabled) return;

    const element = document.getElementById(targetId);
    if (!element) {
      console.error(`ExportButton: Element with id "${targetId}" not found`);
      onExportError?.({ message: `Element "${targetId}" not found` });
      return;
    }

    try {
      setIsExporting(true);
      onExportStart?.();

      // Prepare element for capture
      const originalStyle = element.style.cssText;
      element.style.backgroundColor = 'white';

      // Capture the element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'rgb(var(--tier-white))',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Restore original style
      element.style.cssText = originalStyle;

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add title if provided
      if (title) {
        pdf.setFontSize(16);
        pdf.setTextColor(51, 51, 51);
        pdf.text(title, 14, 15);
        position = 25;
      }

      // Add date
      const dateStr = new Date().toLocaleDateString('nb-NO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(dateStr, 14, title ? 22 : 10);
      if (!title) position = 15;

      // Add image
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - position);

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);
        pdf.text(
          `TIER Golf - Side ${i} av ${pageCount}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      pdf.save(`${filename}.pdf`);

      onExportComplete?.({ filename: `${filename}.pdf`, pageCount });
    } catch (error) {
      console.error('ExportButton: Export failed', error);
      onExportError?.(error);
    } finally {
      setIsExporting(false);
    }
  }, [targetId, filename, title, isExporting, disabled, onExportStart, onExportComplete, onExportError]);

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '13px', iconSize: 16 },
    md: { padding: '8px 16px', fontSize: '14px', iconSize: 18 },
    lg: { padding: '12px 20px', fontSize: '15px', iconSize: 20 },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  if (variant === 'icon') {
    return (
      <button
        onClick={handleExport}
        disabled={isExporting || disabled}
        title={label}
        aria-label={label}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: currentSize.iconSize + 16,
          height: currentSize.iconSize + 16,
          padding: '8px',
          backgroundColor: 'var(--background-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          cursor: isExporting || disabled ? 'not-allowed' : 'pointer',
          opacity: isExporting || disabled ? 0.6 : 1,
          color: 'var(--text-secondary)',
          transition: 'all 0.15s ease',
          ...style,
        }}
        {...props}
      >
        {isExporting ? (
          <Loader2 size={currentSize.iconSize} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <Download size={currentSize.iconSize} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        fontWeight: 500,
        backgroundColor: 'var(--background-surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        cursor: isExporting || disabled ? 'not-allowed' : 'pointer',
        opacity: isExporting || disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        ...style,
      }}
      {...props}
    >
      {isExporting ? (
        <>
          <Loader2 size={currentSize.iconSize} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Eksporterer...</span>
        </>
      ) : (
        <>
          <FileDown size={currentSize.iconSize} />
          <span>{label}</span>
        </>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

/**
 * Hook for programmatic PDF export
 */
export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = useCallback(async ({
    elementId,
    filename = 'export',
    title,
  }) => {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    setIsExporting(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'rgb(var(--tier-white))',
        logging: false,
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');

      if (title) {
        pdf.setFontSize(16);
        pdf.text(title, 14, 15);
      }

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, title ? 25 : 10, imgWidth, imgHeight);

      pdf.save(`${filename}.pdf`);

      return { success: true, filename: `${filename}.pdf` };
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportToPdf, isExporting };
}
