/**
 * Export Service
 * Generates PDF and Excel exports for reports and data
 */

import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

// ============================================
// Types
// ============================================

export interface PlayerReport {
  player: {
    firstName: string;
    lastName: string;
    birthDate?: Date;
    handicap?: number;
    category?: string;
  };
  testResults: {
    date: Date;
    testName: string;
    score: number;
    maxScore: number;
    percentile?: number;
  }[];
  trainingStats: {
    totalSessions: number;
    totalHours: number;
    focusAreas: { area: string; percentage: number }[];
  };
  goals: {
    title: string;
    status: string;
    progress: number;
  }[];
  achievements: {
    name: string;
    unlockedAt: Date;
  }[];
}

export interface TestResultsExport {
  playerName: string;
  testDate: Date;
  testName: string;
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  percentile?: number;
  notes?: string;
}

export interface TrainingSessionExport {
  date: Date;
  playerName: string;
  duration: number;
  focusArea: string;
  exercises: string;
  coachNotes?: string;
  playerReflection?: string;
}

// ============================================
// PDF Generation
// ============================================

/**
 * Generate player progress report PDF
 */
export async function generatePlayerReportPDF(report: PlayerReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('AK Golf Academy', { align: 'center' });
      doc.fontSize(16).font('Helvetica').text('Spillerrapport', { align: 'center' });
      doc.moveDown();

      // Player info
      doc.fontSize(18).font('Helvetica-Bold')
        .text(`${report.player.firstName} ${report.player.lastName}`);
      doc.fontSize(12).font('Helvetica');
      if (report.player.category) {
        doc.text(`Kategori: ${report.player.category}`);
      }
      if (report.player.handicap !== undefined) {
        doc.text(`Handicap: ${report.player.handicap.toFixed(1)}`);
      }
      doc.moveDown();

      // Test Results Section
      doc.fontSize(14).font('Helvetica-Bold').text('Testresultater');
      doc.moveDown(0.5);

      if (report.testResults.length > 0) {
        const tableTop = doc.y;
        const tableHeaders = ['Dato', 'Test', 'Score', 'Maks', '%'];
        const colWidths = [80, 180, 60, 60, 60];

        // Draw headers
        doc.fontSize(10).font('Helvetica-Bold');
        let xPos = 50;
        tableHeaders.forEach((header, i) => {
          doc.text(header, xPos, tableTop, { width: colWidths[i] });
          xPos += colWidths[i];
        });

        // Draw rows
        doc.font('Helvetica');
        let yPos = tableTop + 20;

        report.testResults.slice(0, 10).forEach((result) => {
          xPos = 50;
          const date = new Date(result.date).toLocaleDateString('nb-NO');
          const percentage = Math.round((result.score / result.maxScore) * 100);

          doc.text(date, xPos, yPos, { width: colWidths[0] });
          xPos += colWidths[0];
          doc.text(result.testName, xPos, yPos, { width: colWidths[1] });
          xPos += colWidths[1];
          doc.text(result.score.toString(), xPos, yPos, { width: colWidths[2] });
          xPos += colWidths[2];
          doc.text(result.maxScore.toString(), xPos, yPos, { width: colWidths[3] });
          xPos += colWidths[3];
          doc.text(`${percentage}%`, xPos, yPos, { width: colWidths[4] });

          yPos += 18;
        });

        doc.y = yPos;
      } else {
        doc.fontSize(10).text('Ingen testresultater registrert');
      }

      doc.moveDown();

      // Training Stats
      doc.fontSize(14).font('Helvetica-Bold').text('Treningsstatistikk');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Totalt antall økter: ${report.trainingStats.totalSessions}`);
      doc.text(`Total treningstid: ${report.trainingStats.totalHours} timer`);

      if (report.trainingStats.focusAreas.length > 0) {
        doc.moveDown(0.5);
        doc.text('Fokusområder:');
        report.trainingStats.focusAreas.forEach((area) => {
          doc.text(`  • ${area.area}: ${area.percentage}%`);
        });
      }

      doc.moveDown();

      // Goals
      if (report.goals.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Mål');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');

        report.goals.forEach((goal) => {
          const statusIcon = goal.status === 'completed' ? '✓' : goal.status === 'in_progress' ? '→' : '○';
          doc.text(`${statusIcon} ${goal.title} (${goal.progress}%)`);
        });

        doc.moveDown();
      }

      // Achievements
      if (report.achievements.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Oppnåelser');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');

        report.achievements.slice(0, 10).forEach((achievement) => {
          const date = new Date(achievement.unlockedAt).toLocaleDateString('nb-NO');
          doc.text(`🏆 ${achievement.name} - ${date}`);
        });
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).fillColor('gray')
        .text(`Generert ${new Date().toLocaleDateString('nb-NO')} - AK Golf Academy`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate training plan PDF
 */
export async function generateTrainingPlanPDF(plan: {
  playerName: string;
  startDate: Date;
  endDate: Date;
  weeks: {
    weekNumber: number;
    focus: string;
    sessions: { day: string; type: string; duration: number; exercises: string[] }[];
  }[];
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('Treningsplan', { align: 'center' });
      doc.fontSize(14).font('Helvetica').text(plan.playerName, { align: 'center' });
      doc.fontSize(10).text(
        `${new Date(plan.startDate).toLocaleDateString('nb-NO')} - ${new Date(plan.endDate).toLocaleDateString('nb-NO')}`,
        { align: 'center' }
      );
      doc.moveDown(2);

      // Weeks
      plan.weeks.forEach((week, _index) => {
        if (doc.y > 700) {
          doc.addPage();
        }

        doc.fontSize(12).font('Helvetica-Bold')
          .text(`Uke ${week.weekNumber}: ${week.focus}`);
        doc.moveDown(0.3);

        week.sessions.forEach((session) => {
          doc.fontSize(10).font('Helvetica');
          doc.text(`${session.day} - ${session.type} (${session.duration} min)`);
          if (session.exercises.length > 0) {
            session.exercises.forEach((ex) => {
              doc.fontSize(9).text(`    • ${ex}`);
            });
          }
        });

        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================
// Excel Generation
// ============================================

/**
 * Generate test results Excel export
 */
export async function generateTestResultsExcel(results: TestResultsExport[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AK Golf Academy';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Testresultater');

  // Define columns
  sheet.columns = [
    { header: 'Spiller', key: 'playerName', width: 25 },
    { header: 'Dato', key: 'testDate', width: 12 },
    { header: 'Test', key: 'testName', width: 30 },
    { header: 'Kategori', key: 'category', width: 15 },
    { header: 'Score', key: 'score', width: 10 },
    { header: 'Maks', key: 'maxScore', width: 10 },
    { header: 'Prosent', key: 'percentage', width: 10 },
    { header: 'Persentil', key: 'percentile', width: 10 },
    { header: 'Notater', key: 'notes', width: 40 },
  ];

  // Style header row
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E7D32' },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add data
  results.forEach((result) => {
    sheet.addRow({
      playerName: result.playerName,
      testDate: new Date(result.testDate).toLocaleDateString('nb-NO'),
      testName: result.testName,
      category: result.category,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      percentile: result.percentile || '-',
      notes: result.notes || '',
    });
  });

  // Add conditional formatting for percentage column
  sheet.getColumn('percentage').eachCell((cell, rowNumber) => {
    if (rowNumber > 1 && typeof cell.value === 'number') {
      const value = cell.value as number;
      if (value >= 80) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF90EE90' }, // Light green
        };
      } else if (value >= 60) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF90' }, // Light yellow
        };
      } else {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCCB' }, // Light red
        };
      }
    }
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

/**
 * Generate training sessions Excel export
 */
export async function generateTrainingSessionsExcel(sessions: TrainingSessionExport[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AK Golf Academy';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Treningsøkter');

  sheet.columns = [
    { header: 'Dato', key: 'date', width: 12 },
    { header: 'Spiller', key: 'playerName', width: 25 },
    { header: 'Varighet (min)', key: 'duration', width: 15 },
    { header: 'Fokusområde', key: 'focusArea', width: 20 },
    { header: 'Øvelser', key: 'exercises', width: 40 },
    { header: 'Trenernotater', key: 'coachNotes', width: 30 },
    { header: 'Spillerrefleksjon', key: 'playerReflection', width: 30 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1565C0' },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  sessions.forEach((session) => {
    sheet.addRow({
      date: new Date(session.date).toLocaleDateString('nb-NO'),
      playerName: session.playerName,
      duration: session.duration,
      focusArea: session.focusArea,
      exercises: session.exercises,
      coachNotes: session.coachNotes || '',
      playerReflection: session.playerReflection || '',
    });
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

/**
 * Generate statistics summary Excel
 */
export async function generateStatisticsExcel(data: {
  players: { name: string; handicap: number; category: string; sessionsCount: number; testsCount: number }[];
  summary: {
    totalPlayers: number;
    totalSessions: number;
    totalTests: number;
    avgHandicap: number;
    categoryDistribution: { category: string; count: number }[];
  };
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AK Golf Academy';
  workbook.created = new Date();

  // Summary sheet
  const summarySheet = workbook.addWorksheet('Oppsummering');
  summarySheet.columns = [
    { header: 'Metrikk', key: 'metric', width: 30 },
    { header: 'Verdi', key: 'value', width: 20 },
  ];

  summarySheet.getRow(1).font = { bold: true };

  summarySheet.addRow({ metric: 'Totalt antall spillere', value: data.summary.totalPlayers });
  summarySheet.addRow({ metric: 'Totalt antall økter', value: data.summary.totalSessions });
  summarySheet.addRow({ metric: 'Totalt antall tester', value: data.summary.totalTests });
  summarySheet.addRow({ metric: 'Gjennomsnittlig handicap', value: data.summary.avgHandicap.toFixed(1) });

  summarySheet.addRow({ metric: '', value: '' });
  summarySheet.addRow({ metric: 'Kategorifordeling', value: '' });
  data.summary.categoryDistribution.forEach((cat) => {
    summarySheet.addRow({ metric: `  ${cat.category}`, value: cat.count });
  });

  // Players sheet
  const playersSheet = workbook.addWorksheet('Spillere');
  playersSheet.columns = [
    { header: 'Navn', key: 'name', width: 25 },
    { header: 'Handicap', key: 'handicap', width: 12 },
    { header: 'Kategori', key: 'category', width: 15 },
    { header: 'Antall økter', key: 'sessionsCount', width: 15 },
    { header: 'Antall tester', key: 'testsCount', width: 15 },
  ];

  playersSheet.getRow(1).font = { bold: true };
  playersSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E7D32' },
  };
  playersSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  data.players.forEach((player) => {
    playersSheet.addRow(player);
  });

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export default {
  generatePlayerReportPDF,
  generateTrainingPlanPDF,
  generateTestResultsExcel,
  generateTrainingSessionsExcel,
  generateStatisticsExcel,
};
