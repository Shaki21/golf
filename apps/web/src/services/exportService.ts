/**
 * Export Service - TIER Golf
 *
 * Handles export and sharing of round data, strokes gained reports,
 * and statistics in various formats (PDF, CSV, JSON, image).
 */

// ============================================================================
// TYPES
// ============================================================================

export type ExportFormat = 'pdf' | 'csv' | 'json' | 'image';

export interface ExportOptions {
  format: ExportFormat;
  includeCharts?: boolean;
  includeHoleByHole?: boolean;
  includeBenchmarks?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ShareOptions {
  method: 'email' | 'link' | 'copy';
  recipients?: string[];
  message?: string;
  expiresIn?: number; // hours
}

// Export-specific types (simplified for export purposes)
export interface ExportRound {
  id: string;
  courseName?: string;
  roundDate: string;
  totalScore?: number;
  status: string;
}

export interface ExportHole {
  holeNumber: number;
  par: number;
  score?: number;
  putts?: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
  penalties?: number;
}

export interface RoundExportData {
  round: ExportRound;
  holes: ExportHole[];
  sgData?: {
    total: number;
    tee: number;
    approach: number;
    shortGame: number;
    putting: number;
  };
}

export interface StatsExportData {
  period: string;
  roundCount: number;
  averageScore: number;
  sgTotal: number;
  sgTee: number;
  sgApproach: number;
  sgShortGame: number;
  sgPutting: number;
  trends: {
    date: string;
    sgTotal: number;
  }[];
}

// ============================================================================
// CSV EXPORT
// ============================================================================

/**
 * Convert round data to CSV format
 */
export function roundToCSV(data: RoundExportData): string {
  const lines: string[] = [];

  // Header info
  lines.push('TIER Golf Round Export');
  lines.push(`Course,${data.round.courseName || 'Unknown'}`);
  lines.push(`Date,${new Date(data.round.roundDate).toLocaleDateString()}`);
  lines.push(`Total Score,${data.round.totalScore || 'N/A'}`);
  lines.push('');

  // Strokes Gained summary
  if (data.sgData) {
    lines.push('Strokes Gained Summary');
    lines.push(`Total,${data.sgData.total.toFixed(2)}`);
    lines.push(`Off the Tee,${data.sgData.tee.toFixed(2)}`);
    lines.push(`Approach,${data.sgData.approach.toFixed(2)}`);
    lines.push(`Short Game,${data.sgData.shortGame.toFixed(2)}`);
    lines.push(`Putting,${data.sgData.putting.toFixed(2)}`);
    lines.push('');
  }

  // Hole-by-hole data
  lines.push('Hole,Par,Score,Putts,Fairway,GIR,Penalties');
  data.holes.forEach((hole) => {
    lines.push(
      [
        hole.holeNumber,
        hole.par,
        hole.score ?? '',
        hole.putts ?? '',
        hole.fairwayHit ? 'Yes' : hole.fairwayHit === false ? 'No' : '',
        hole.greenInRegulation ? 'Yes' : hole.greenInRegulation === false ? 'No' : '',
        hole.penalties ?? 0,
      ].join(',')
    );
  });

  return lines.join('\n');
}

/**
 * Convert stats data to CSV format
 */
export function statsToCSV(data: StatsExportData): string {
  const lines: string[] = [];

  // Header info
  lines.push('TIER Golf Statistics Export');
  lines.push(`Period,${data.period}`);
  lines.push(`Rounds,${data.roundCount}`);
  lines.push(`Average Score,${data.averageScore.toFixed(1)}`);
  lines.push('');

  // Strokes Gained summary
  lines.push('Strokes Gained Averages');
  lines.push(`Total,${data.sgTotal.toFixed(2)}`);
  lines.push(`Off the Tee,${data.sgTee.toFixed(2)}`);
  lines.push(`Approach,${data.sgApproach.toFixed(2)}`);
  lines.push(`Short Game,${data.sgShortGame.toFixed(2)}`);
  lines.push(`Putting,${data.sgPutting.toFixed(2)}`);
  lines.push('');

  // Trend data
  lines.push('Date,SG Total');
  data.trends.forEach((trend) => {
    lines.push(`${trend.date},${trend.sgTotal.toFixed(2)}`);
  });

  return lines.join('\n');
}

// ============================================================================
// JSON EXPORT
// ============================================================================

/**
 * Export round data as JSON
 */
export function roundToJSON(data: RoundExportData): string {
  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      exportType: 'round',
      version: '1.0',
      data: {
        round: {
          id: data.round.id,
          courseName: data.round.courseName,
          date: data.round.roundDate,
          totalScore: data.round.totalScore,
          status: data.round.status,
        },
        strokesGained: data.sgData,
        holes: data.holes.map((h) => ({
          holeNumber: h.holeNumber,
          par: h.par,
          score: h.score,
          putts: h.putts,
          fairwayHit: h.fairwayHit,
          greenInRegulation: h.greenInRegulation,
          penalties: h.penalties,
        })),
      },
    },
    null,
    2
  );
}

/**
 * Export stats data as JSON
 */
export function statsToJSON(data: StatsExportData): string {
  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      exportType: 'statistics',
      version: '1.0',
      data: {
        period: data.period,
        roundCount: data.roundCount,
        averageScore: data.averageScore,
        strokesGained: {
          total: data.sgTotal,
          tee: data.sgTee,
          approach: data.sgApproach,
          shortGame: data.sgShortGame,
          putting: data.sgPutting,
        },
        trends: data.trends,
      },
    },
    null,
    2
  );
}

// ============================================================================
// PDF EXPORT (HTML-based for client-side generation)
// ============================================================================

/**
 * Generate HTML for PDF export
 */
export function roundToHTML(data: RoundExportData): string {
  const sgSection = data.sgData
    ? `
    <div class="section">
      <h2>Strokes Gained</h2>
      <table>
        <tr><td>Total</td><td class="${data.sgData.total >= 0 ? 'positive' : 'negative'}">${data.sgData.total >= 0 ? '+' : ''}${data.sgData.total.toFixed(2)}</td></tr>
        <tr><td>Off the Tee</td><td class="${data.sgData.tee >= 0 ? 'positive' : 'negative'}">${data.sgData.tee >= 0 ? '+' : ''}${data.sgData.tee.toFixed(2)}</td></tr>
        <tr><td>Approach</td><td class="${data.sgData.approach >= 0 ? 'positive' : 'negative'}">${data.sgData.approach >= 0 ? '+' : ''}${data.sgData.approach.toFixed(2)}</td></tr>
        <tr><td>Short Game</td><td class="${data.sgData.shortGame >= 0 ? 'positive' : 'negative'}">${data.sgData.shortGame >= 0 ? '+' : ''}${data.sgData.shortGame.toFixed(2)}</td></tr>
        <tr><td>Putting</td><td class="${data.sgData.putting >= 0 ? 'positive' : 'negative'}">${data.sgData.putting >= 0 ? '+' : ''}${data.sgData.putting.toFixed(2)}</td></tr>
      </table>
    </div>
  `
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Round Report - ${data.round.courseName}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #0A2540; }
        h1 { color: #0A2540; border-bottom: 2px solid #C9A227; padding-bottom: 10px; }
        h2 { color: #0A2540; margin-top: 30px; }
        .header { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 24px; font-weight: bold; color: #C9A227; }
        .section { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f5f5f0; font-weight: 600; }
        .positive { color: #10B981; font-weight: 600; }
        .negative { color: #EF4444; font-weight: 600; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .stat-box { background: #f5f5f0; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 28px; font-weight: bold; color: #0A2540; }
        .stat-label { font-size: 12px; color: #6B7280; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6B7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>${data.round.courseName || 'Golf Round'}</h1>
          <p>${new Date(data.round.roundDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div class="logo">TIER</div>
      </div>

      <div class="summary">
        <div class="stat-box">
          <div class="stat-value">${data.round.totalScore || '-'}</div>
          <div class="stat-label">Total Score</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.holes.reduce((sum, h) => sum + (h.putts || 0), 0)}</div>
          <div class="stat-label">Total Putts</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${Math.round((data.holes.filter(h => h.greenInRegulation).length / data.holes.length) * 100)}%</div>
          <div class="stat-label">GIR</div>
        </div>
      </div>

      ${sgSection}

      <div class="section">
        <h2>Hole by Hole</h2>
        <table>
          <thead>
            <tr>
              <th>Hole</th>
              <th>Par</th>
              <th>Score</th>
              <th>Putts</th>
              <th>FW</th>
              <th>GIR</th>
            </tr>
          </thead>
          <tbody>
            ${data.holes
              .map(
                (h) => `
              <tr>
                <td>${h.holeNumber}</td>
                <td>${h.par}</td>
                <td class="${(h.score || 0) < h.par ? 'positive' : (h.score || 0) > h.par ? 'negative' : ''}">${h.score || '-'}</td>
                <td>${h.putts || '-'}</td>
                <td>${h.fairwayHit ? '✓' : h.fairwayHit === false ? '✗' : '-'}</td>
                <td>${h.greenInRegulation ? '✓' : h.greenInRegulation === false ? '✗' : '-'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>Generated by TIER Golf • ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// DOWNLOAD HELPERS
// ============================================================================

/**
 * Download a file with the given content
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
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

/**
 * Export round data in the specified format
 */
export function exportRound(
  data: RoundExportData,
  options: ExportOptions
): void {
  const courseName = (data.round.courseName || 'round').replace(/\s+/g, '_');
  const date = new Date(data.round.roundDate).toISOString().split('T')[0];
  const baseFilename = `TIER_${courseName}_${date}`;

  switch (options.format) {
    case 'csv':
      downloadFile(roundToCSV(data), `${baseFilename}.csv`, 'text/csv');
      break;
    case 'json':
      downloadFile(roundToJSON(data), `${baseFilename}.json`, 'application/json');
      break;
    case 'pdf':
      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(roundToHTML(data));
        printWindow.document.close();
        printWindow.print();
      }
      break;
    case 'image':
      // Would require html2canvas or similar library
      console.log('Image export requires additional setup');
      break;
  }
}

/**
 * Export statistics in the specified format
 */
export function exportStats(
  data: StatsExportData,
  options: ExportOptions
): void {
  const baseFilename = `TIER_Stats_${data.period.replace(/\s+/g, '_')}`;

  switch (options.format) {
    case 'csv':
      downloadFile(statsToCSV(data), `${baseFilename}.csv`, 'text/csv');
      break;
    case 'json':
      downloadFile(statsToJSON(data), `${baseFilename}.json`, 'application/json');
      break;
    default:
      console.log('Format not supported for stats export');
  }
}

// ============================================================================
// SHARE FUNCTIONALITY
// ============================================================================

/**
 * Generate a shareable link for a round
 * In production, this would create a server-side share token
 */
export async function generateShareLink(
  roundId: string,
  options: ShareOptions
): Promise<string> {
  // Mock implementation - would call API in production
  const shareToken = btoa(`${roundId}:${Date.now()}`);
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/shared/round/${shareToken}`;

  if (options.method === 'copy') {
    await navigator.clipboard.writeText(shareUrl);
  }

  return shareUrl;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const exportService = {
  roundToCSV,
  statsToCSV,
  roundToJSON,
  statsToJSON,
  roundToHTML,
  downloadFile,
  exportRound,
  exportStats,
  generateShareLink,
  copyToClipboard,
};

export default exportService;
