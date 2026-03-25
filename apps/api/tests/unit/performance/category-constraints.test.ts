/**
 * Category Constraints Service Unit Tests
 * Tests for binding constraint computation
 */

import {
  calculateBindingConstraints,
  analyzePlayerConstraints,
  createCategoryConstraintsService,
  getNextCategory,
  type BindingConstraint,
  type PlayerDomainPerformance,
  type CategoryAK,
  type Gender,
} from '../../../src/domain/performance/category-constraints';

describe('CategoryConstraintsService', () => {
  describe('calculateBindingConstraints', () => {
    it('should identify binding constraints when player is below requirements', () => {
      const performances: PlayerDomainPerformance[] = [
        { domainCode: 'TEE', currentValue: 180, testCount: 1 }, // Below typical requirement
        { domainCode: 'INN150', currentValue: 45, testCount: 1 }, // Below requirement
        { domainCode: 'PUTT', currentValue: 75, testCount: 1 }, // Above typical requirement
      ];

      const result = calculateBindingConstraints({
        playerId: 'player-1',
        currentCategory: 'G',
        targetCategory: 'E',
        gender: 'M',
        performances,
      });

      expect(result.bindingConstraints.length).toBeGreaterThan(0);
      expect(result.bindingConstraints.some(c => c.isBinding)).toBe(true);
    });

    it('should return empty binding constraints when all requirements are met', () => {
      const performances: PlayerDomainPerformance[] = [
        { domainCode: 'TEE', currentValue: 250, testCount: 1 }, // Above requirement
        { domainCode: 'INN150', currentValue: 70, testCount: 1 }, // Above requirement
        { domainCode: 'PUTT', currentValue: 90, testCount: 1 }, // Above requirement
        { domainCode: 'ARG', currentValue: 2.0, testCount: 1 }, // Below requirement (lower is better)
      ];

      const result = calculateBindingConstraints({
        playerId: 'player-1',
        currentCategory: 'G',
        targetCategory: 'E',
        gender: 'M',
        performances,
      });

      // All binding constraints should have gap = 0
      const actuallyBinding = result.bindingConstraints.filter(c => c.gap > 0);
      expect(actuallyBinding.length).toBe(0);
    });

    it('should calculate gap correctly for higher-is-better metrics', () => {
      const performances: PlayerDomainPerformance[] = [
        { domainCode: 'TEE', currentValue: 160, testCount: 1 }, // 40 below 200 requirement
      ];

      const result = calculateBindingConstraints({
        playerId: 'player-1',
        currentCategory: 'G',
        targetCategory: 'E',
        gender: 'M',
        performances,
      });

      const teeConstraint = result.bindingConstraints.find(c => c.domainCode === 'TEE');
      expect(teeConstraint).toBeDefined();
      expect(teeConstraint?.gap).toBeGreaterThan(0);
      expect(teeConstraint?.gapPercent).toBeGreaterThan(0);
    });

    it('should calculate gap correctly for lower-is-better metrics (ARG)', () => {
      const performances: PlayerDomainPerformance[] = [
        { domainCode: 'ARG', currentValue: 8.0, testCount: 1 }, // 3m above 5.0 requirement (worse)
      ];

      const result = calculateBindingConstraints({
        playerId: 'player-1',
        currentCategory: 'G',
        targetCategory: 'E',
        gender: 'M',
        performances,
      });

      const argConstraint = result.bindingConstraints.find(c => c.domainCode === 'ARG');
      expect(argConstraint).toBeDefined();
      expect(argConstraint?.gap).toBeGreaterThan(0); // Gap positive when current > required
    });

    it('should limit binding constraints to top 3', () => {
      // Create performances below requirements for all domains
      const performances: PlayerDomainPerformance[] = [
        { domainCode: 'TEE', currentValue: 100, testCount: 1 },
        { domainCode: 'INN200', currentValue: 10, testCount: 1 },
        { domainCode: 'INN150', currentValue: 10, testCount: 1 },
        { domainCode: 'INN100', currentValue: 10, testCount: 1 },
        { domainCode: 'INN50', currentValue: 10, testCount: 1 },
        { domainCode: 'ARG', currentValue: 20, testCount: 1 },
        { domainCode: 'PUTT', currentValue: 10, testCount: 1 },
      ];

      const result = calculateBindingConstraints({
        playerId: 'player-1',
        currentCategory: 'G',
        targetCategory: 'E',
        gender: 'M',
        performances,
      });

      // Should limit to top 3 binding constraints
      expect(result.bindingConstraints.length).toBeLessThanOrEqual(3);
    });

    it('should sort binding constraints by gap percent descending', () => {
      const performances: PlayerDomainPerformance[] = [
        { domainCode: 'TEE', currentValue: 190, testCount: 1 }, // Small gap
        { domainCode: 'INN150', currentValue: 20, testCount: 1 }, // Large gap
      ];

      const result = calculateBindingConstraints({
        playerId: 'player-1',
        currentCategory: 'G',
        targetCategory: 'E',
        gender: 'M',
        performances,
      });

      if (result.bindingConstraints.length >= 2) {
        expect(result.bindingConstraints[0].gapPercent).toBeGreaterThanOrEqual(
          result.bindingConstraints[1].gapPercent
        );
      }
    });

    it('should include domainCode in all constraints', () => {
      const performances: PlayerDomainPerformance[] = [
        { domainCode: 'TEE', currentValue: 180, testCount: 1 },
        { domainCode: 'PUTT', currentValue: 60, testCount: 1 },
      ];

      const result = calculateBindingConstraints({
        playerId: 'player-1',
        currentCategory: 'G',
        targetCategory: 'E',
        gender: 'M',
        performances,
      });

      result.bindingConstraints.forEach(constraint => {
        expect(constraint.domainCode).toBeDefined();
        expect(['TEE', 'INN200', 'INN150', 'INN100', 'INN50', 'ARG', 'PUTT', 'PHYS']).toContain(
          constraint.domainCode
        );
      });
    });

    it('should calculate totalGap as sum of binding constraint gaps', () => {
      const performances: PlayerDomainPerformance[] = [
        { domainCode: 'TEE', currentValue: 180, testCount: 1 },
        { domainCode: 'INN150', currentValue: 40, testCount: 1 },
      ];

      const result = calculateBindingConstraints({
        playerId: 'player-1',
        currentCategory: 'G',
        targetCategory: 'E',
        gender: 'M',
        performances,
      });

      const expectedTotal = result.bindingConstraints.reduce((sum, c) => sum + c.gap, 0);
      expect(result.totalGap).toBe(expectedTotal);
    });
  });

  describe('analyzePlayerConstraints', () => {
    it('should return full analysis with current and target category', () => {
      const performances: PlayerDomainPerformance[] = [
        { domainCode: 'TEE', currentValue: 180, testCount: 1 },
      ];

      const result = analyzePlayerConstraints(
        'player-1',
        'G',
        'M',
        performances
      );

      expect(result.playerId).toBe('player-1');
      expect(result.currentCategory).toBe('G');
      expect(result.targetCategory).toBe('E'); // Next category from G
      expect(result.gender).toBe('M');
      expect(result.bindingConstraints).toBeDefined();
      expect(result.analysisDate).toBeInstanceOf(Date);
    });

    it('should return same category as target when already at highest', () => {
      const performances: PlayerDomainPerformance[] = [
        { domainCode: 'TEE', currentValue: 280, testCount: 1 },
      ];

      const result = analyzePlayerConstraints(
        'player-1',
        'A', // Highest category
        'M',
        performances
      );

      expect(result.targetCategory).toBe('A');
      expect(result.bindingConstraints).toHaveLength(0);
    });

    it('should include nonBindingGaps for constraints that are met', () => {
      const performances: PlayerDomainPerformance[] = [
        { domainCode: 'TEE', currentValue: 250, testCount: 1 }, // Above requirement
        { domainCode: 'PUTT', currentValue: 90, testCount: 1 }, // Above requirement
      ];

      const result = analyzePlayerConstraints(
        'player-1',
        'G',
        'M',
        performances
      );

      expect(result.nonBindingGaps).toBeDefined();
    });
  });

  describe('getNextCategory', () => {
    it('should return next category in sequence', () => {
      expect(getNextCategory('J')).toBe('I');
      expect(getNextCategory('I')).toBe('H');
      expect(getNextCategory('G')).toBe('E');
      expect(getNextCategory('B')).toBe('A');
    });

    it('should return null for highest category', () => {
      expect(getNextCategory('A')).toBeNull();
    });
  });

  describe('createCategoryConstraintsService', () => {
    it('should create a service with required methods', () => {
      const mockPrisma = {} as any;
      const service = createCategoryConstraintsService(mockPrisma);

      expect(service).toBeDefined();
      expect(typeof service.calculateBindingConstraints).toBe('function');
      expect(typeof service.analyzePlayerConstraints).toBe('function');
      expect(typeof service.getPlayerPerformances).toBe('function');
    });
  });
});
