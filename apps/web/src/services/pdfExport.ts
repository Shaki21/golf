/**
 * PDF Export Service
 * Generates PDF documents from annual training plans
 */

import jsPDF from 'jspdf';
import type { Period } from '../features/coach-annual-plan/components/PeriodDetailPanel';

interface AnnualPlanPDFData {
  playerName: string;
  name: string;
  startDate: string;
  endDate: string;
  periods: Period[];
}

const PERIOD_COLORS = {
  E: { color: '#8B6E9D', label: 'Evaluering' },
  G: { color: '#D97644', label: 'Grunnperiode' },
  S: { color: '#4A8C7C', label: 'Spesialisering' },
  T: { color: 'rgb(var(--tier-gold))', label: 'Turnering' },
};

/**
 * Export annual plan to PDF
 */
export async function exportAnnualPlanToPDF(data: AnnualPlanPDFData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Årsplan', margin, yPosition);
  yPosition += 12;

  // Plan name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(data.name, margin, yPosition);
  yPosition += 10;

  // Player name
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Spiller: ${data.playerName}`, margin, yPosition);
  yPosition += 6;

  // Date range
  const startDate = new Date(data.startDate).toLocaleDateString('nb-NO');
  const endDate = new Date(data.endDate).toLocaleDateString('nb-NO');
  doc.text(`Periode: ${startDate} - ${endDate}`, margin, yPosition);
  yPosition += 15;

  // Overview section
  checkNewPage(30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Oversikt', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Totalt antall perioder: ${data.periods.length}`, margin, yPosition);
  yPosition += 6;

  const totalWeeks = data.periods.reduce((sum, period) => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return sum + Math.ceil(days / 7);
  }, 0);

  doc.text(`Totalt antall uker: ${totalWeeks}`, margin, yPosition);
  yPosition += 6;

  const avgFrequency =
    data.periods.length > 0
      ? Math.round(
          data.periods.reduce((sum, p) => sum + p.weeklyFrequency, 0) / data.periods.length
        )
      : 0;

  doc.text(`Gjennomsnittlig økter per uke: ${avgFrequency}`, margin, yPosition);
  yPosition += 15;

  // Periods section
  checkNewPage(20);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Perioder', margin, yPosition);
  yPosition += 10;

  // Period list
  data.periods.forEach((period, index) => {
    const requiredSpace = 45 + (period.goals.length > 0 ? period.goals.length * 5 + 5 : 0);
    checkNewPage(requiredSpace);

    const config = PERIOD_COLORS[period.type];
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(duration / 7);

    // Period box
    const boxHeight = 40 + (period.goals.length > 0 ? period.goals.length * 5 : 0);

    // Draw colored header
    const rgb = hexToRgb(config.color);
    doc.setFillColor(rgb.r, rgb.g, rgb.b, 0.15);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');

    // Period type and label
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text(`${period.type} - ${config.label}`, margin + 2, yPosition + 5);
    yPosition += 10;

    // Period name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(period.name, margin + 2, yPosition);
    yPosition += 6;

    // Description
    if (period.description) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const descLines = doc.splitTextToSize(period.description, pageWidth - 2 * margin - 4);
      doc.text(descLines, margin + 2, yPosition);
      yPosition += descLines.length * 4;
    }

    // Details
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    yPosition += 2;
    doc.text(`Varighet: ${duration} dager (${weeks} uker)`, margin + 2, yPosition);
    yPosition += 5;
    doc.text(`Periode: ${start.toLocaleDateString('nb-NO')} - ${end.toLocaleDateString('nb-NO')}`, margin + 2, yPosition);
    yPosition += 5;
    doc.text(`Frekvens: ${period.weeklyFrequency} økter per uke`, margin + 2, yPosition);
    yPosition += 5;

    // Goals
    if (period.goals.length > 0) {
      yPosition += 2;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Mål:', margin + 2, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      period.goals.forEach((goal) => {
        doc.text(`• ${goal}`, margin + 4, yPosition);
        yPosition += 5;
      });
    }

    // Border around period
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPosition - boxHeight, pageWidth - 2 * margin, boxHeight);

    yPosition += 8;
  });

  // Footer on last page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Side ${i} av ${totalPages} - Generert ${new Date().toLocaleDateString('nb-NO')}`,
      margin,
      pageHeight - 10
    );
    doc.text('TIER Golf - IUP System', pageWidth - margin - 40, pageHeight - 10);
  }

  // Save PDF
  const filename = `arsplan-${data.playerName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}
