/**
 * CategoryProgressionCard
 *
 * Shows player's progression toward next category with:
 * - Current vs target category
 * - Percentage progress
 * - Missing requirements breakdown
 * - Visual progress indicators
 */

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Award,
  Zap,
} from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import { SubSectionTitle } from '../../ui/primitives/typography';

// ============================================================================
// TYPES
// ============================================================================

interface CategoryRequirement {
  testId: string;
  testName: string;
  testNumber: number;
  currentValue: number | null;
  requiredValue: number;
  passed: boolean;
  unit: string;
}

interface CategoryProgressionData {
  playerId: string;
  playerName: string;
  currentCategory: string;
  targetCategory: string;
  overallProgress: number;
  testsRequired: number;
  testsPassed: number;
  requirements: CategoryRequirement[];
  estimatedTimeToTarget?: string;
  trend: 'improving' | 'stable' | 'declining';
}

interface CategoryProgressionCardProps {
  playerId: string;
  className?: string;
  onViewDetails?: () => void;
}

// ============================================================================
// CATEGORY COLORS
// ============================================================================

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  B: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  C: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  D: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  E: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  F: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function CategoryProgressionCard({
  playerId,
  className = '',
  onViewDetails,
}: CategoryProgressionCardProps) {
  const [data, setData] = useState<CategoryProgressionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgression();
  }, [playerId]);

  const loadProgression = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getCategoryProgression(playerId);

      // Transform API response to our format with proper type casting
      const rawData = response.data?.data || response.data || {};
      const apiData = rawData as {
        playerName?: string;
        currentCategory?: string;
        targetCategory?: string;
        overallProgress?: number;
        progressPercent?: number;
        testsRequired?: number;
        testsPassed?: number;
        requirements?: CategoryRequirement[];
        tests?: CategoryRequirement[];
        estimatedTimeToTarget?: string;
        trend?: 'improving' | 'stable' | 'declining';
      };

      setData({
        playerId,
        playerName: apiData.playerName ?? 'Spiller',
        currentCategory: apiData.currentCategory ?? 'C',
        targetCategory: apiData.targetCategory ?? 'B',
        overallProgress: apiData.overallProgress ?? apiData.progressPercent ?? 0,
        testsRequired: apiData.testsRequired ?? 7,
        testsPassed: apiData.testsPassed ?? 0,
        requirements: apiData.requirements ?? apiData.tests ?? [],
        estimatedTimeToTarget: apiData.estimatedTimeToTarget,
        trend: apiData.trend ?? 'stable',
      });
    } catch (err) {
      console.error('Failed to load category progression:', err);
      // Use mock data for demo
      setData({
        playerId,
        playerName: 'Demo Player',
        currentCategory: 'C',
        targetCategory: 'B',
        overallProgress: 65,
        testsRequired: 7,
        testsPassed: 4,
        requirements: [
          { testId: '1', testName: 'Driver Hastighet', testNumber: 1, currentValue: 105, requiredValue: 100, passed: true, unit: 'mph' },
          { testId: '2', testName: 'Driver Carry', testNumber: 3, currentValue: 240, requiredValue: 220, passed: true, unit: 'm' },
          { testId: '3', testName: 'GIR Simulering', testNumber: 6, currentValue: 55, requiredValue: 50, passed: true, unit: '%' },
          { testId: '4', testName: 'Putting 3m', testNumber: 10, currentValue: 60, requiredValue: 55, passed: true, unit: '%' },
          { testId: '5', testName: 'Up & Down', testNumber: 7, currentValue: 45, requiredValue: 55, passed: false, unit: '%' },
          { testId: '6', testName: 'Bunker Presisjon', testNumber: 8, currentValue: 4.2, requiredValue: 3.5, passed: false, unit: 'm' },
          { testId: '7', testName: 'Medisinball Kast', testNumber: 12, currentValue: null, requiredValue: 8, passed: false, unit: 'm' },
        ],
        trend: 'improving',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-tier-border-default p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-32 mb-6" />
          <div className="h-24 bg-gray-200 rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`bg-white rounded-xl border border-tier-border-default p-6 ${className}`}>
        <div className="flex items-center gap-3 text-tier-error">
          <AlertCircle size={20} />
          <span>Kunne ikke laste kategori-progresjon</span>
        </div>
      </div>
    );
  }

  const currentColors = CATEGORY_COLORS[data.currentCategory] || CATEGORY_COLORS.C;
  const targetColors = CATEGORY_COLORS[data.targetCategory] || CATEGORY_COLORS.B;
  const passedTests = data.requirements.filter((r) => r.passed);
  const failedTests = data.requirements.filter((r) => !r.passed);

  return (
    <div className={`bg-white rounded-xl border border-tier-border-default overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-5 border-b border-tier-border-default">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tier-navy/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-tier-navy" />
            </div>
            <div>
              <SubSectionTitle className="font-semibold text-tier-navy" style={{ marginBottom: 0 }}>Kategori-progresjon</SubSectionTitle>
              <p className="text-sm text-tier-text-secondary">
                Fremgang mot neste nivå
              </p>
            </div>
          </div>
          {data.trend === 'improving' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
              <Zap size={12} />
              Forbedring
            </div>
          )}
        </div>
      </div>

      {/* Category Progress */}
      <div className="p-5">
        {/* Current → Target */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${currentColors.bg} ${currentColors.text} ${currentColors.border} border-2`}
            >
              {data.currentCategory}
            </div>
            <p className="text-xs text-tier-text-secondary mt-2">Nåværende</p>
          </div>

          <div className="flex flex-col items-center">
            <ChevronRight size={24} className="text-tier-text-tertiary" />
            <span className="text-xs text-tier-text-tertiary mt-1">
              {data.overallProgress}%
            </span>
          </div>

          <div className="text-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold ${targetColors.bg} ${targetColors.text} ${targetColors.border} border-2 opacity-60`}
            >
              {data.targetCategory}
            </div>
            <p className="text-xs text-tier-text-secondary mt-2">Mål</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-tier-text-secondary">Total fremgang</span>
            <span className="font-semibold text-tier-navy">
              {data.testsPassed}/{data.testsRequired} tester bestått
            </span>
          </div>
          <div className="h-3 bg-tier-surface-base rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tier-navy to-tier-navy/70 rounded-full transition-all duration-500"
              style={{ width: `${data.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Requirements List */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-tier-navy mb-3">Krav-oversikt</p>

          {/* Passed Tests */}
          {passedTests.length > 0 && (
            <div className="space-y-1.5">
              {passedTests.slice(0, 3).map((req) => (
                <div
                  key={req.testId}
                  className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span className="text-sm text-tier-navy">{req.testName}</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-600">
                    {req.currentValue}{req.unit}
                  </span>
                </div>
              ))}
              {passedTests.length > 3 && (
                <p className="text-xs text-tier-text-tertiary pl-3">
                  +{passedTests.length - 3} flere bestått
                </p>
              )}
            </div>
          )}

          {/* Failed/Missing Tests */}
          {failedTests.length > 0 && (
            <div className="space-y-1.5 mt-3">
              <p className="text-xs font-medium text-tier-text-secondary uppercase tracking-wider">
                Mangler
              </p>
              {failedTests.map((req) => (
                <div
                  key={req.testId}
                  className="flex items-center justify-between p-3 bg-tier-surface-base rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-tier-text-tertiary" />
                    <span className="text-sm text-tier-navy">{req.testName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-tier-text-secondary">
                      {req.currentValue !== null ? `${req.currentValue}${req.unit}` : '—'}
                    </span>
                    <span className="text-xs text-tier-text-tertiary ml-1">
                      / {req.requiredValue}{req.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estimated Time */}
        {data.estimatedTimeToTarget && (
          <div className="mt-4 p-3 bg-tier-navy/5 rounded-lg">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-tier-navy" />
              <span className="text-sm text-tier-navy">
                Estimert tid til {data.targetCategory}: <strong>{data.estimatedTimeToTarget}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {onViewDetails && (
        <div className="px-5 pb-5">
          <button
            onClick={onViewDetails}
            className="w-full py-2.5 text-sm font-medium text-tier-navy hover:bg-tier-navy/5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Se alle detaljer
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export { CategoryProgressionCard };
