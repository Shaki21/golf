/**
 * TrackMan CSV Parser
 * Parses TrackMan CSV exports with flexible column name mapping
 */

import { parse } from 'csv-parse/sync';
import * as crypto from 'crypto';

export interface TrackmanShotData {
  shotNumber: number;
  club?: string;
  ballSpeed?: number;
  launchAngle?: number;
  spinRate?: number;
  clubSpeed?: number;
  attackAngle?: number;
  clubPath?: number;
  faceAngle?: number;
  faceToPath?: number;
  swingDirection?: number;
  dynamicLoft?: number;
  carryDistance?: number;
  totalDistance?: number;
  smashFactor?: number;
}

export interface ParseResult {
  shots: TrackmanShotData[];
  fileHash: string;
  totalRows: number;
  validRows: number;
}

// Column name mappings - TrackMan exports can have various column names
const COLUMN_MAPPINGS: Record<string, string[]> = {
  // Ball data
  ballSpeed: ['Ball Speed', 'ball_speed', 'ballspeed', 'Ball Spd'],
  launchAngle: ['Launch Angle', 'launch_angle', 'launchangle', 'LA'],
  spinRate: ['Spin Rate', 'spin_rate', 'spinrate', 'Total Spin'],

  // Club data
  club: ['Club', 'club', 'Club Type', 'club_type'],
  clubSpeed: ['Club Speed', 'club_speed', 'clubspeed', 'Club Spd'],
  attackAngle: ['Attack Angle', 'attack_angle', 'attackangle', 'AoA'],
  clubPath: ['Club Path', 'club_path', 'clubpath', 'Path'],
  faceAngle: ['Face Angle', 'face_angle', 'faceangle', 'Face'],
  faceToPath: ['Face to Path', 'face_to_path', 'facetopath', 'FTP'],
  swingDirection: ['Swing Direction', 'swing_direction', 'swingdirection', 'Swing Dir'],
  dynamicLoft: ['Dynamic Loft', 'dynamic_loft', 'dynamicloft', 'Dyn Loft'],
  smashFactor: ['Smash Factor', 'smash_factor', 'smashfactor', 'Smash'],

  // Distance data
  carryDistance: ['Carry', 'carry', 'Carry Distance', 'carry_distance', 'Carry Dist'],
  totalDistance: ['Total', 'total', 'Total Distance', 'total_distance', 'Total Dist'],
};

/**
 * Find the actual column name in the CSV headers
 */
function findColumn(headers: string[], targetField: string): string | null {
  const mappings = COLUMN_MAPPINGS[targetField] || [];
  const lowercaseHeaders = headers.map(h => h.toLowerCase().trim());

  for (const mapping of mappings) {
    const index = lowercaseHeaders.indexOf(mapping.toLowerCase());
    if (index !== -1) {
      return headers[index];
    }
  }
  return null;
}

/**
 * Parse a numeric value from CSV, handling various formats
 */
function parseNumeric(value: string | undefined | null): number | undefined {
  if (!value || value.trim() === '' || value === '-') {
    return undefined;
  }
  // Remove any units (e.g., "mph", "deg", "yds")
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
}

// Type for CSV row
type CSVRow = Record<string, string>;

/**
 * Parse TrackMan CSV content
 */
export function parseTrackmanCSV(csvContent: string): ParseResult {
  // Calculate file hash for deduplication
  const fileHash = crypto.createHash('md5').update(csvContent).digest('hex');

  // Parse CSV
  const records: CSVRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  if (records.length === 0) {
    return {
      shots: [],
      fileHash,
      totalRows: 0,
      validRows: 0,
    };
  }

  // Get headers from first record
  const headers = Object.keys(records[0] as CSVRow);

  // Build column mapping
  const columnMap: Record<string, string | null> = {};
  for (const field of Object.keys(COLUMN_MAPPINGS)) {
    columnMap[field] = findColumn(headers, field);
  }

  // Parse shots
  const shots: TrackmanShotData[] = [];
  let validRows = 0;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];

    // Extract values using column mapping
    const shot: TrackmanShotData = {
      shotNumber: i + 1,
      club: columnMap.club ? row[columnMap.club] : undefined,
      ballSpeed: columnMap.ballSpeed ? parseNumeric(row[columnMap.ballSpeed]) : undefined,
      launchAngle: columnMap.launchAngle ? parseNumeric(row[columnMap.launchAngle]) : undefined,
      spinRate: columnMap.spinRate ? parseNumeric(row[columnMap.spinRate]) : undefined,
      clubSpeed: columnMap.clubSpeed ? parseNumeric(row[columnMap.clubSpeed]) : undefined,
      attackAngle: columnMap.attackAngle ? parseNumeric(row[columnMap.attackAngle]) : undefined,
      clubPath: columnMap.clubPath ? parseNumeric(row[columnMap.clubPath]) : undefined,
      faceAngle: columnMap.faceAngle ? parseNumeric(row[columnMap.faceAngle]) : undefined,
      faceToPath: columnMap.faceToPath ? parseNumeric(row[columnMap.faceToPath]) : undefined,
      swingDirection: columnMap.swingDirection ? parseNumeric(row[columnMap.swingDirection]) : undefined,
      dynamicLoft: columnMap.dynamicLoft ? parseNumeric(row[columnMap.dynamicLoft]) : undefined,
      carryDistance: columnMap.carryDistance ? parseNumeric(row[columnMap.carryDistance]) : undefined,
      totalDistance: columnMap.totalDistance ? parseNumeric(row[columnMap.totalDistance]) : undefined,
      smashFactor: columnMap.smashFactor ? parseNumeric(row[columnMap.smashFactor]) : undefined,
    };

    // Check if shot has at least some technique data
    const hasData = shot.clubPath !== undefined ||
                    shot.attackAngle !== undefined ||
                    shot.swingDirection !== undefined ||
                    shot.faceToPath !== undefined ||
                    shot.dynamicLoft !== undefined;

    if (hasData) {
      shots.push(shot);
      validRows++;
    }
  }

  return {
    shots,
    fileHash,
    totalRows: records.length,
    validRows,
  };
}
