/**
 * Technique Plan Types
 */

export interface TechniqueTask {
  id: string;
  playerId: string;
  createdById: string;
  creatorType: 'coach' | 'player';
  title: string;
  description: string;
  instructions?: string;
  videoUrl?: string;
  technicalArea: string;
  targetMetrics?: Record<string, number>;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  player?: {
    firstName: string;
    lastName: string;
  };
}

export interface TechniqueGoal {
  id: string;
  playerId: string;
  title: string;
  metricType: 'clubPath' | 'attackAngle' | 'swingDirection' | 'faceToPath' | 'dynamicLoft';
  baselineValue?: number;
  targetValue: number;
  currentValue?: number;
  progressPercent: number;
  status: 'active' | 'achieved' | 'paused';
  createdAt: string;
  player?: {
    firstName: string;
    lastName: string;
  };
}

export interface TrackmanImport {
  id: string;
  playerId: string;
  uploadedById: string;
  fileName: string;
  fileHash: string;
  importedAt: string;
  totalRows: number;
  importedRows: number;
  sessionId?: string;
  player?: {
    firstName: string;
    lastName: string;
  };
}

export interface TechniqueStats {
  stats: Record<string, {
    avg: number;
    min: number;
    max: number;
    count: number;
    trend: number[];
  }>;
  totalShots: number;
  goals: Array<{
    id: string;
    metricType: string;
    targetValue: number;
    currentValue?: number;
    progressPercent: number;
  }>;
}

export const METRIC_LABELS: Record<string, string> = {
  clubPath: 'Club Path',
  attackAngle: 'Attack Angle',
  swingDirection: 'Swing Direction',
  faceToPath: 'Face to Path',
  dynamicLoft: 'Dynamic Loft',
};

export const TECHNICAL_AREAS: Record<string, string> = {
  swing: 'Sving',
  putting: 'Putting',
  chipping: 'Chipping',
  pitching: 'Pitching',
  bunker: 'Bunker',
  driving: 'Driver',
  irons: 'Jern',
  wedges: 'Wedger',
  mental: 'Mentalt',
  other: 'Annet',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Lav',
  medium: 'Medium',
  high: 'Hoy',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Venter',
  in_progress: 'Pagar',
  completed: 'Fullfort',
  active: 'Aktiv',
  achieved: 'Oppnadd',
  paused: 'Pauset',
};
