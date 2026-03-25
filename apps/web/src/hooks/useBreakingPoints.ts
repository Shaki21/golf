/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useBreakingPoints Hook
 * Fetches breaking points with BP-Evidence data (effort vs progress separation)
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export type BpStatus = 'not_started' | 'identified' | 'in_progress' | 'awaiting_proof' | 'resolved' | 'regressed';
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface BreakingPoint {
  id: string;
  playerId: string;
  processCategory: string;
  specificArea: string;
  description: string;
  severity: Severity;
  status: BpStatus;
  progressPercent: number;
  effortPercent: number;
  baselineMeasurement?: string;
  targetMeasurement?: string;
  currentMeasurement?: string;
  testDomainCode?: string;
  proofMetricId?: string;
  successRule?: string;
  identifiedDate: string;
  resolvedDate?: string;
  lastBenchmarkDate?: string;
  nextBenchmarkDue?: string;
  notes?: string;
}

export interface BreakingPointsData {
  breakingPoints: BreakingPoint[];
  summary: {
    total: number;
    resolved: number;
    inProgress: number;
    awaitingProof: number;
    averageEffort: number;
    averageProgress: number;
  };
}

export interface BreakingPointsHookResult {
  data: BreakingPointsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ═══════════════════════════════════════════
// FALLBACK DATA
// ═══════════════════════════════════════════

function getFallbackData(): BreakingPointsData {
  return {
    breakingPoints: [
      {
        id: 'demo-1',
        playerId: 'demo',
        processCategory: 'TEE',
        specificArea: 'Driver konsistens',
        description: 'Varierende spredning på drives, mål er under 15m lateral spredning',
        severity: 'high',
        status: 'in_progress',
        progressPercent: 45,
        effortPercent: 85,
        baselineMeasurement: '25m spredning',
        targetMeasurement: '<15m spredning',
        currentMeasurement: '18m spredning',
        testDomainCode: 'TEE',
        proofMetricId: 'DRIVER_DISPERSION',
        successRule: 'DRIVER_DISPERSION:<=:15',
        identifiedDate: '2025-11-15',
        nextBenchmarkDue: '2026-01-03',
      },
      {
        id: 'demo-2',
        playerId: 'demo',
        processCategory: 'PUTT',
        specificArea: 'Putting 3-6m',
        description: 'Holing rate på mellomputts må opp',
        severity: 'medium',
        status: 'in_progress',
        progressPercent: 60,
        effortPercent: 60,
        baselineMeasurement: '55% holing',
        targetMeasurement: '>70% holing',
        currentMeasurement: '63% holing',
        testDomainCode: 'PUTT',
        proofMetricId: 'PUTT_HOLING_3_6M',
        successRule: 'PUTT_HOLING_3_6M:>=:70',
        identifiedDate: '2025-10-20',
      },
      {
        id: 'demo-3',
        playerId: 'demo',
        processCategory: 'ARG',
        specificArea: 'Bunkerslag',
        description: 'Sand save prosent må forbedres',
        severity: 'low',
        status: 'awaiting_proof',
        progressPercent: 90,
        effortPercent: 100,
        baselineMeasurement: '28% sand save',
        targetMeasurement: '>40% sand save',
        currentMeasurement: '42% sand save',
        testDomainCode: 'ARG',
        proofMetricId: 'SAND_SAVE_PCT',
        successRule: 'SAND_SAVE_PCT:>=:40',
        identifiedDate: '2025-09-01',
        lastBenchmarkDate: '2025-12-28',
      },
    ],
    summary: {
      total: 3,
      resolved: 0,
      inProgress: 2,
      awaitingProof: 1,
      averageEffort: 82,
      averageProgress: 65,
    },
  };
}

// ═══════════════════════════════════════════
// MAPPER
// ═══════════════════════════════════════════

function mapApiResponse(response: any): BreakingPointsData {
  const breakingPoints: BreakingPoint[] = (response.items || response.breakingPoints || []).map((bp: any) => ({
    id: bp.id,
    playerId: bp.playerId,
    processCategory: bp.processCategory,
    specificArea: bp.specificArea,
    description: bp.description,
    severity: bp.severity || 'medium',
    status: mapStatus(bp.status),
    progressPercent: bp.progressPercent || 0,
    effortPercent: bp.effortPercent || 0,
    baselineMeasurement: bp.baselineMeasurement,
    targetMeasurement: bp.targetMeasurement,
    currentMeasurement: bp.currentMeasurement,
    testDomainCode: bp.testDomainCode,
    proofMetricId: bp.proofMetricId,
    successRule: bp.successRule,
    identifiedDate: bp.identifiedDate,
    resolvedDate: bp.resolvedDate,
    lastBenchmarkDate: bp.lastBenchmarkDate,
    nextBenchmarkDue: bp.nextBenchmarkDue,
    notes: bp.notes,
  }));

  const resolved = breakingPoints.filter(bp => bp.status === 'resolved').length;
  const inProgress = breakingPoints.filter(bp => bp.status === 'in_progress').length;
  const awaitingProof = breakingPoints.filter(bp => bp.status === 'awaiting_proof').length;
  const avgEffort = breakingPoints.length > 0
    ? Math.round(breakingPoints.reduce((sum, bp) => sum + bp.effortPercent, 0) / breakingPoints.length)
    : 0;
  const avgProgress = breakingPoints.length > 0
    ? Math.round(breakingPoints.reduce((sum, bp) => sum + bp.progressPercent, 0) / breakingPoints.length)
    : 0;

  return {
    breakingPoints,
    summary: {
      total: breakingPoints.length,
      resolved,
      inProgress,
      awaitingProof,
      averageEffort: avgEffort,
      averageProgress: avgProgress,
    },
  };
}

function mapStatus(status: string): BpStatus {
  const normalized = status?.toLowerCase().replace(/_/g, '-');
  switch (normalized) {
    case 'not-started':
    case 'not_started':
      return 'not_started';
    case 'identified':
      return 'identified';
    case 'in-progress':
    case 'in_progress':
    case 'working':
      return 'in_progress';
    case 'awaiting-proof':
    case 'awaiting_proof':
      return 'awaiting_proof';
    case 'resolved':
    case 'completed':
      return 'resolved';
    case 'regressed':
      return 'regressed';
    default:
      return 'in_progress';
  }
}

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function useBreakingPoints(playerId?: string): BreakingPointsHookResult {
  const [data, setData] = useState<BreakingPointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (playerId) params.playerId = playerId;

      const response = await apiClient.get('/breaking-points', { params });

      if (response.data?.success) {
        const mapped = mapApiResponse(response.data.data);
        setData(mapped);
      } else {
        // Use fallback if no data
        setData(getFallbackData());
      }
    } catch (err: any) {
      const message = err?.message || 'Kunne ikke laste breaking points';
      setError(message);
      // Use fallback on error
      setData(getFallbackData());
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useBreakingPoints;
