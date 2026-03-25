/**
 * TrackMan PDF Parser
 * Parses TrackMan PDF exports and extracts shot data
 */

import * as pdfParse from 'pdf-parse';
import * as crypto from 'crypto';
import type { TrackmanShotData, ParseResult } from './csv-parser';

/**
 * Parse numeric value from text, handling various formats
 */
function parseNumeric(value: string | undefined | null): number | undefined {
  if (!value || value.trim() === '' || value === '-' || value === 'N/A') {
    return undefined;
  }
  // Remove any units (e.g., "mph", "deg", "yds", "°")
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Extract shot data from a line of text
 * TrackMan PDFs typically have structured data with labels and values
 */
function extractShotFromText(text: string, shotNumber: number): TrackmanShotData | null {
  const shot: TrackmanShotData = {
    shotNumber,
  };

  // Common TrackMan PDF patterns
  const patterns = {
    club: /Club(?:\s*Type)?[:\s]+([A-Za-z0-9\s]+?)(?:\n|$)/i,
    ballSpeed: /Ball\s*Speed[:\s]+([\d.]+)/i,
    launchAngle: /Launch\s*Angle[:\s]+([-\d.]+)/i,
    spinRate: /(?:Spin\s*Rate|Total\s*Spin)[:\s]+([\d.]+)/i,
    clubSpeed: /Club\s*Speed[:\s]+([\d.]+)/i,
    attackAngle: /Attack\s*Angle[:\s]+([-\d.]+)/i,
    clubPath: /Club\s*Path[:\s]+([-\d.]+)/i,
    faceAngle: /Face\s*Angle[:\s]+([-\d.]+)/i,
    faceToPath: /Face\s*to\s*Path[:\s]+([-\d.]+)/i,
    swingDirection: /Swing\s*Direction[:\s]+([-\d.]+)/i,
    dynamicLoft: /Dynamic\s*Loft[:\s]+([-\d.]+)/i,
    carryDistance: /Carry(?:\s*Distance)?[:\s]+([\d.]+)/i,
    totalDistance: /Total(?:\s*Distance)?[:\s]+([\d.]+)/i,
    smashFactor: /Smash\s*Factor[:\s]+([\d.]+)/i,
  };

  let hasData = false;

  // Extract each metric
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = key === 'club' ? match[1].trim() : parseNumeric(match[1]);
      if (value !== undefined) {
        (shot as any)[key] = value;
        if (key !== 'club') hasData = true;
      }
    }
  }

  // Check if we have at least some technique data
  const hasTechniqueData = shot.clubPath !== undefined ||
                           shot.attackAngle !== undefined ||
                           shot.swingDirection !== undefined ||
                           shot.faceToPath !== undefined ||
                           shot.dynamicLoft !== undefined;

  return hasTechniqueData ? shot : null;
}

/**
 * Try to extract table-based data from PDF text
 * Some TrackMan PDFs have data in table format
 */
function extractTableData(text: string): TrackmanShotData[] {
  const shots: TrackmanShotData[] = [];

  // Split into lines
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Look for header row that indicates a data table
  const headerPatterns = [
    /Club.*Speed.*Angle/i,
    /Shot.*Ball.*Launch/i,
    /#.*Club.*Ball\s*Speed/i,
  ];

  let headerIndex = -1;
  let headerLine = '';

  for (let i = 0; i < lines.length; i++) {
    for (const pattern of headerPatterns) {
      if (pattern.test(lines[i])) {
        headerIndex = i;
        headerLine = lines[i];
        break;
      }
    }
    if (headerIndex !== -1) break;
  }

  if (headerIndex === -1) return shots;

  // Parse header to find column positions
  const headers = headerLine.toLowerCase();
  const columnPositions = {
    club: headers.indexOf('club'),
    ballSpeed: headers.indexOf('ball'),
    clubSpeed: headers.indexOf('club speed') || headers.indexOf('clubspeed'),
    launchAngle: headers.indexOf('launch'),
    attackAngle: headers.indexOf('attack'),
    clubPath: headers.indexOf('path'),
    faceAngle: headers.indexOf('face angle') || headers.indexOf('faceangle'),
  };

  // Parse data rows (typically 2-3 lines after header)
  for (let i = headerIndex + 1; i < Math.min(headerIndex + 50, lines.length); i++) {
    const line = lines[i];

    // Skip empty or header-like lines
    if (line.length < 10 || /^(Club|Shot|#|\s*$)/i.test(line)) continue;

    // Try to extract numeric values from the line
    const numbers = line.match(/[-]?\d+\.?\d*/g);
    if (!numbers || numbers.length < 3) continue;

    const shot: TrackmanShotData = {
      shotNumber: shots.length + 1,
      club: line.match(/^([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)?)/)?.[1],
    };

    // Map numbers to fields based on typical order
    if (numbers.length >= 6) {
      shot.ballSpeed = parseNumeric(numbers[0]);
      shot.clubSpeed = parseNumeric(numbers[1]);
      shot.launchAngle = parseNumeric(numbers[2]);
      shot.attackAngle = parseNumeric(numbers[3]);
      shot.clubPath = parseNumeric(numbers[4]);
      shot.faceAngle = parseNumeric(numbers[5]);
    }

    const hasTechniqueData = shot.clubPath !== undefined ||
                             shot.attackAngle !== undefined ||
                             shot.faceAngle !== undefined;

    if (hasTechniqueData) {
      shots.push(shot);
    }
  }

  return shots;
}

/**
 * Parse TrackMan PDF content
 */
export async function parseTrackmanPDF(pdfBuffer: Buffer): Promise<ParseResult> {
  // Calculate file hash for deduplication
  const fileHash = crypto.createHash('md5').update(pdfBuffer).digest('hex');

  try {
    // Parse PDF
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    // Try table-based extraction first
    let shots = extractTableData(text);

    // If no table data found, try section-based extraction
    if (shots.length === 0) {
      // Split text into potential shot sections
      // TrackMan PDFs often have "Shot 1", "Shot 2" markers
      const shotSections = text.split(/Shot\s+\d+/i);

      for (let i = 1; i < shotSections.length; i++) {
        const shotData = extractShotFromText(shotSections[i], i);
        if (shotData) {
          shots.push(shotData);
        }
      }

      // If still no shots, try extracting from the entire text as one section
      if (shots.length === 0) {
        const shotData = extractShotFromText(text, 1);
        if (shotData) {
          shots = [shotData];
        }
      }
    }

    return {
      shots,
      fileHash,
      totalRows: shots.length,
      validRows: shots.length,
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
