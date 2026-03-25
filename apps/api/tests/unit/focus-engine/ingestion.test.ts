/**
 * Ingestion Service Unit Tests
 * Tests CSV parsing and data ingestion logic
 */

import { PrismaClient } from '@prisma/client';

// Mock logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

// Mock adm-zip
jest.mock('adm-zip', () => {
  return jest.fn().mockImplementation(() => ({
    getEntries: jest.fn().mockReturnValue([]),
  }));
});

import { IngestionService } from '../../../src/domain/focus-engine/ingestion.service';
import * as fs from 'fs';

// Mock Prisma Client
const createMockPrisma = () => ({
  dgPlayerSeason: {
    upsert: jest.fn(),
  },
  dgApproachSkillL24: {
    upsert: jest.fn(),
  },
} as unknown as PrismaClient);

describe('IngestionService', () => {
  let service: IngestionService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = createMockPrisma();
    service = new IngestionService(mockPrisma);
  });

  describe('parseDecimal', () => {
    it('should parse valid decimal strings', () => {
      const parseDecimal = (service as any).parseDecimal.bind(service);

      expect(parseDecimal('1.234')).toBe(1.234);
      expect(parseDecimal('0.5')).toBe(0.5);
      expect(parseDecimal('-0.3')).toBe(-0.3);
    });

    it('should return null for empty values', () => {
      const parseDecimal = (service as any).parseDecimal.bind(service);

      expect(parseDecimal('')).toBeNull();
      expect(parseDecimal(null)).toBeNull();
      expect(parseDecimal(undefined)).toBeNull();
    });

    it('should return null for non-numeric values', () => {
      const parseDecimal = (service as any).parseDecimal.bind(service);

      expect(parseDecimal('abc')).toBeNull();
      expect(parseDecimal('NaN')).toBeNull();
    });
  });

  describe('parseInt', () => {
    it('should parse valid integer strings', () => {
      const parseInt = (service as any).parseInt.bind(service);

      expect(parseInt('42')).toBe(42);
      expect(parseInt('0')).toBe(0);
      expect(parseInt('-10')).toBe(-10);
    });

    it('should return null for empty values', () => {
      const parseInt = (service as any).parseInt.bind(service);

      expect(parseInt('')).toBeNull();
      expect(parseInt(null)).toBeNull();
      expect(parseInt(undefined)).toBeNull();
    });
  });

  describe('ingest', () => {
    it('should throw error if zip file not found', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(service.ingest('/nonexistent/path.zip')).rejects.toThrow(
        'Zip file not found'
      );
    });

    it('should return success result for valid zip', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('test'));

      const AdmZip = require('adm-zip');
      AdmZip.mockImplementation(() => ({
        getEntries: () => [],
      }));

      const result = await service.ingest('/path/to/test.zip');

      expect(result.success).toBe(true);
      expect(result.sourceVersion).toBeDefined();
      expect(result.stats.filesProcessed).toEqual([]);
    });

    it('should process performance files correctly', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('test'));

      const csvContent = `player_name,events_played,wins,x_wins,rounds_played,putt_true,arg_true,app_true,ott_true,t2g_true,total_true
"Scheffler, Scottie",21,6,4.817,84,0.658,0.360,1.451,0.821,2.632,3.290`;

      const AdmZip = require('adm-zip');
      AdmZip.mockImplementation(() => ({
        getEntries: () => [
          {
            entryName: 'dg_performance_2025.csv',
            getData: () => Buffer.from(csvContent),
          },
        ],
      }));

      (mockPrisma.dgPlayerSeason.upsert as jest.Mock).mockResolvedValue({});

      const result = await service.ingest('/path/to/test.zip');

      expect(result.success).toBe(true);
      expect(result.stats.playerSeasons.upserted).toBe(1);
      expect(mockPrisma.dgPlayerSeason.upsert).toHaveBeenCalled();
    });

    it('should validate required columns', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('test'));

      // Missing required columns
      const csvContent = `player_name,wins
"Test Player",1`;

      const AdmZip = require('adm-zip');
      AdmZip.mockImplementation(() => ({
        getEntries: () => [
          {
            entryName: 'dg_performance_2025.csv',
            getData: () => Buffer.from(csvContent),
          },
        ],
      }));

      const result = await service.ingest('/path/to/test.zip');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Missing required columns');
    });

    it('should skip __MACOSX files', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('test'));

      const AdmZip = require('adm-zip');
      AdmZip.mockImplementation(() => ({
        getEntries: () => [
          {
            entryName: '__MACOSX/._dg_performance_2025.csv',
            getData: () => Buffer.from(''),
          },
        ],
      }));

      const result = await service.ingest('/path/to/test.zip');

      expect(result.stats.filesProcessed).toEqual([]);
    });
  });
});
