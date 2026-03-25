/**
 * Plan Export Utilities
 * Export annual plan to PDF and iCal formats
 */

import type { Period } from '../hooks/usePlayerAnnualPlan';
import { PERIOD_LABELS } from './periodDefaults';

/**
 * Export plan to iCal format
 */
export function exportToICal(
  planName: string,
  periods: Period[],
  startDate: string,
  endDate: string
): void {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TIER Golf//Annual Plan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${planName}`,
    'X-WR-TIMEZONE:Europe/Oslo',
  ];

  periods.forEach((period) => {
    const uid = `${period.id}@tiergolf.no`;
    const dtstart = formatICalDate(period.startDate);
    const dtend = formatICalDate(period.endDate);
    const summary = `${PERIOD_LABELS[period.type]}: ${period.name}`;
    const description = [
      `Treningsfrekvens: ${period.weeklyFrequency} økter/uke`,
      period.description ? `\\n${period.description}` : '',
      period.goals.length > 0 ? `\\n\\nMål:\\n${period.goals.join('\\n')}` : '',
    ]
      .filter(Boolean)
      .join('');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatICalDate(new Date().toISOString())}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `CATEGORIES:${PERIOD_LABELS[period.type]}`,
      `COLOR:${period.color}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');

  const icalContent = lines.join('\r\n');
  downloadFile(
    icalContent,
    `${planName.replace(/\s+/g, '_')}.ics`,
    'text/calendar'
  );
}

/**
 * Export plan to PDF (simplified version using browser print)
 */
export function exportToPDF(
  planName: string,
  periods: Period[],
  startDate: string,
  endDate: string
): void {
  // Create a printable HTML document
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Vennligst tillat popup-vinduer for å eksportere til PDF');
    return;
  }

  const html = generatePrintHTML(planName, periods, startDate, endDate);
  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.print();
  };
}

/**
 * Generate HTML for printing/PDF
 */
function generatePrintHTML(
  planName: string,
  periods: Period[],
  startDate: string,
  endDate: string
): string {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const totalSessions = periods.reduce((sum, period) => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const weeks = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );
    return sum + weeks * period.weeklyFrequency;
  }, 0);

  const avgFrequency =
    periods.reduce((sum, p) => sum + p.weeklyFrequency, 0) / periods.length;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${planName}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20mm; }
      .no-print { display: none; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 210mm;
      margin: 0 auto;
      color: #1e3a8a;
    }
    h1 { color: #0f172a; font-size: 28px; margin-bottom: 8px; }
    h2 { color: #0f172a; font-size: 20px; margin-top: 24px; }
    .header { border-bottom: 3px solid #d4af37; padding-bottom: 16px; margin-bottom: 24px; }
    .subtitle { color: #64748b; font-size: 14px; }
    .stats { display: flex; gap: 24px; margin: 24px 0; }
    .stat { flex: 1; text-align: center; padding: 16px; background: #f8fafc; border-radius: 8px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #1e3a8a; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
    .period { margin: 16px 0; padding: 16px; border-left: 4px solid; border-radius: 4px; background: #f8fafc; }
    .period-header { font-weight: bold; font-size: 16px; margin-bottom: 8px; }
    .period-meta { font-size: 14px; color: #64748b; margin-bottom: 8px; }
    .goals { margin-top: 12px; }
    .goals-title { font-size: 12px; font-weight: bold; margin-bottom: 4px; }
    .goal-item { font-size: 12px; color: #64748b; margin-left: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${planName}</h1>
    <p class="subtitle">${formatDate(startDate)} - ${formatDate(endDate)}</p>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-value">${periods.length}</div>
      <div class="stat-label">Perioder</div>
    </div>
    <div class="stat">
      <div class="stat-value">${avgFrequency.toFixed(1)}</div>
      <div class="stat-label">Gj.snitt økter/uke</div>
    </div>
    <div class="stat">
      <div class="stat-value">${totalSessions}</div>
      <div class="stat-label">Totalt økter</div>
    </div>
  </div>

  <h2>Perioder</h2>
  ${periods
    .map((period, index) => {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      const weeks = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );

      return `
    <div class="period" style="border-left-color: ${period.color};">
      <div class="period-header">
        ${index + 1}. ${period.name} (${PERIOD_LABELS[period.type]})
      </div>
      <div class="period-meta">
        ${formatDate(period.startDate)} - ${formatDate(period.endDate)} (${weeks} uker)
      </div>
      <div class="period-meta">
        ${period.weeklyFrequency} økter/uke • ~${weeks * period.weeklyFrequency} totale økter
      </div>
      ${
        period.description
          ? `<div class="period-meta">${period.description}</div>`
          : ''
      }
      ${
        period.goals.length > 0
          ? `
        <div class="goals">
          <div class="goals-title">Mål:</div>
          ${period.goals.map((goal) => `<div class="goal-item">• ${goal}</div>`).join('')}
        </div>
      `
          : ''
      }
    </div>
  `;
    })
    .join('')}

  <div style="margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
    <p>Generert av TIER Golf</p>
    <p>${new Date().toLocaleDateString('nb-NO')}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Helper: Format date for iCal (YYYYMMDD)
 */
function formatICalDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Helper: Download file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
