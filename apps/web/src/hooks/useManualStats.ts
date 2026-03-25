/**
 * Manual Stats Hooks
 *
 * React hooks for round tracking, Strokes Gained calculation, and data management.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import manualStatsApi, {
  type GolfRound,
  type RoundStatus,
  type SGRoundResult,
  type PlayerTrends,
  type ExtractionResult,
  type CreateRoundRequest,
  type ManualHolesEntryRequest,
  type ManualHoleEntry,
  type UserCorrectionRequest,
} from '../services/manualStatsApi';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const manualStatsKeys = {
  all: ['manual-stats'] as const,
  rounds: () => [...manualStatsKeys.all, 'rounds'] as const,
  round: (id: string) => [...manualStatsKeys.rounds(), id] as const,
  playerRounds: (playerId: string) => [...manualStatsKeys.rounds(), 'player', playerId] as const,
  trends: (playerId: string) => [...manualStatsKeys.all, 'trends', playerId] as const,
  extraction: (roundId: string) => [...manualStatsKeys.all, 'extraction', roundId] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch player rounds
 */
export function usePlayerRounds(
  playerId: string | undefined,
  options?: {
    status?: RoundStatus;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: manualStatsKeys.playerRounds(playerId || ''),
    queryFn: () => manualStatsApi.getPlayerRounds(playerId!, options),
    enabled: !!playerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single round
 */
export function useRound(roundId: string | undefined) {
  return useQuery({
    queryKey: manualStatsKeys.round(roundId || ''),
    queryFn: () => manualStatsApi.getRound(roundId!),
    enabled: !!roundId,
  });
}

/**
 * Hook to fetch player SG trends
 */
export function usePlayerTrends(
  playerId: string | undefined,
  options?: {
    period?: '30d' | '90d' | '180d' | '1y' | 'all';
    minCoverage?: number;
  }
) {
  return useQuery({
    queryKey: [...manualStatsKeys.trends(playerId || ''), options],
    queryFn: () => manualStatsApi.getPlayerTrends(playerId!, options),
    enabled: !!playerId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch extraction status
 */
export function useExtractionStatus(roundId: string | undefined) {
  return useQuery({
    queryKey: manualStatsKeys.extraction(roundId || ''),
    queryFn: () => manualStatsApi.getExtractionStatus(roundId!),
    enabled: !!roundId,
    refetchInterval: (query) => {
      // Poll while processing
      const data = query.state.data;
      if (data?.status === 'PROCESSING' || data?.status === 'PENDING') {
        return 3000; // 3 seconds
      }
      return false;
    },
  });
}

/**
 * Hook to create a new round
 */
export function useCreateRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRoundRequest) => manualStatsApi.createRound(request),
    onSuccess: (data, variables) => {
      // Invalidate player rounds list
      queryClient.invalidateQueries({
        queryKey: manualStatsKeys.playerRounds(variables.playerId),
      });
    },
  });
}

/**
 * Hook to add manual hole entries
 */
export function useAddManualHoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roundId, holes }: { roundId: string; holes: ManualHoleEntry[] }) =>
      manualStatsApi.addManualHoles(roundId, { holes }),
    onSuccess: (_, variables) => {
      // Invalidate the specific round
      queryClient.invalidateQueries({
        queryKey: manualStatsKeys.round(variables.roundId),
      });
    },
  });
}

/**
 * Hook to finalize a round
 */
export function useFinalizeRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roundId, recalculateSG }: { roundId: string; recalculateSG?: boolean }) =>
      manualStatsApi.finalizeRound(roundId, { recalculateSG }),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: manualStatsKeys.round(data.round.id),
      });
      queryClient.invalidateQueries({
        queryKey: manualStatsKeys.playerRounds(data.round.playerId),
      });
      queryClient.invalidateQueries({
        queryKey: manualStatsKeys.trends(data.round.playerId),
      });
    },
  });
}

/**
 * Hook to apply corrections to extraction
 */
export function useApplyCorrections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roundId, corrections }: { roundId: string; corrections: UserCorrectionRequest['corrections'] }) =>
      manualStatsApi.applyCorrections(roundId, { corrections }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: manualStatsKeys.extraction(variables.roundId),
      });
      queryClient.invalidateQueries({
        queryKey: manualStatsKeys.round(variables.roundId),
      });
    },
  });
}

/**
 * Hook to delete a round
 */
export function useDeleteRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roundId: string) => manualStatsApi.deleteRound(roundId),
    onSuccess: () => {
      // Invalidate all rounds queries
      queryClient.invalidateQueries({
        queryKey: manualStatsKeys.rounds(),
      });
    },
  });
}

// ============================================================================
// COMPOSITE HOOKS
// ============================================================================

/**
 * Hook for managing round entry workflow
 */
export function useRoundEntry(playerId: string | undefined) {
  const { user } = useAuth();
  const effectivePlayerId = playerId || (user as { playerId?: string })?.playerId;

  const createRound = useCreateRound();
  const addHoles = useAddManualHoles();
  const finalizeRound = useFinalizeRound();

  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const [holes, setHoles] = useState<ManualHoleEntry[]>([]);

  // Fetch current round if we have an ID
  const { data: currentRound, isLoading: isLoadingRound } = useRound(currentRoundId || undefined);

  // Start a new round
  const startRound = useCallback(
    async (roundDate: string, courseName?: string) => {
      if (!effectivePlayerId) throw new Error('No player ID');

      const round = await createRound.mutateAsync({
        playerId: effectivePlayerId,
        roundDate,
        courseName,
      });

      setCurrentRoundId(round.id);
      setHoles([]);

      return round;
    },
    [effectivePlayerId, createRound]
  );

  // Add a hole entry
  const addHole = useCallback((hole: ManualHoleEntry) => {
    setHoles((prev) => {
      const existing = prev.findIndex((h) => h.holeNumber === hole.holeNumber);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = hole;
        return updated;
      }
      return [...prev, hole].sort((a, b) => a.holeNumber - b.holeNumber);
    });
  }, []);

  // Remove a hole entry
  const removeHole = useCallback((holeNumber: number) => {
    setHoles((prev) => prev.filter((h) => h.holeNumber !== holeNumber));
  }, []);

  // Save current holes to backend
  const saveHoles = useCallback(async () => {
    if (!currentRoundId || holes.length === 0) return null;

    const result = await addHoles.mutateAsync({
      roundId: currentRoundId,
      holes,
    });

    return result;
  }, [currentRoundId, holes, addHoles]);

  // Finalize the round
  const finalize = useCallback(async () => {
    if (!currentRoundId) throw new Error('No round in progress');

    // First save any unsaved holes
    if (holes.length > 0) {
      await saveHoles();
    }

    // Then finalize
    const result = await finalizeRound.mutateAsync({
      roundId: currentRoundId,
      recalculateSG: true,
    });

    // Clear state
    setCurrentRoundId(null);
    setHoles([]);

    return result;
  }, [currentRoundId, holes, saveHoles, finalizeRound]);

  // Reset state
  const reset = useCallback(() => {
    setCurrentRoundId(null);
    setHoles([]);
  }, []);

  return {
    // State
    currentRoundId,
    currentRound,
    holes,
    isLoading: createRound.isPending || addHoles.isPending || finalizeRound.isPending || isLoadingRound,
    error: createRound.error || addHoles.error || finalizeRound.error,

    // Actions
    startRound,
    addHole,
    removeHole,
    saveHoles,
    finalize,
    reset,

    // Setters for resuming
    setCurrentRoundId,
    setHoles,
  };
}

/**
 * Hook for Strokes Gained dashboard data
 */
export function useStrokesGainedDashboard(playerId: string | undefined) {
  const { user } = useAuth();
  const effectivePlayerId = playerId || (user as { playerId?: string })?.playerId;

  // Fetch trends for different periods
  const {
    data: trends30d,
    isLoading: isLoading30d,
  } = usePlayerTrends(effectivePlayerId, { period: '30d' });

  const {
    data: trends90d,
    isLoading: isLoading90d,
  } = usePlayerTrends(effectivePlayerId, { period: '90d' });

  // Fetch recent rounds
  const {
    data: recentRounds,
    isLoading: isLoadingRounds,
  } = usePlayerRounds(effectivePlayerId, { limit: 10 });

  // Compute summary data
  const summary = useMemo(() => {
    if (!trends30d) return null;

    return {
      sgTotal: trends30d.avgSGTotal,
      sgTee: trends30d.avgSGTee,
      sgApproach: trends30d.avgSGApproach,
      sgShortGame: trends30d.avgSGShortGame,
      sgPutting: trends30d.avgSGPutting,
      roundCount: trends30d.roundCount,
      trends: trends30d.trend,
    };
  }, [trends30d]);

  // Chart data for visualization
  const chartData = useMemo(() => {
    if (!trends90d?.weeklyData) return [];

    return trends90d.weeklyData.map((week) => ({
      name: `W${week.weekNumber}`,
      Total: week.sgTotal,
      Tee: week.sgTee,
      Approach: week.sgApproach,
      ShortGame: week.sgShortGame,
      Putting: week.sgPutting,
      rounds: week.roundCount,
    }));
  }, [trends90d]);

  return {
    summary,
    chartData,
    recentRounds,
    trends: {
      '30d': trends30d,
      '90d': trends90d,
    },
    isLoading: isLoading30d || isLoading90d || isLoadingRounds,
  };
}

/**
 * Hook for extraction review workflow
 */
export function useExtractionReview(roundId: string | undefined) {
  const { data: extraction, isLoading, refetch } = useExtractionStatus(roundId);
  const applyCorrections = useApplyCorrections();
  const finalizeRound = useFinalizeRound();

  const [corrections, setCorrections] = useState<UserCorrectionRequest['corrections']>([]);

  // Add a correction
  const addCorrection = useCallback(
    (holeNumber: number, field: string, value: string | number | boolean, reason?: string) => {
      setCorrections((prev) => {
        const existing = prev.findIndex(
          (c) => c.holeNumber === holeNumber && c.field === field
        );
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { holeNumber, field, value, reason };
          return updated;
        }
        return [...prev, { holeNumber, field, value, reason }];
      });
    },
    []
  );

  // Remove a correction
  const removeCorrection = useCallback((holeNumber: number, field: string) => {
    setCorrections((prev) =>
      prev.filter((c) => !(c.holeNumber === holeNumber && c.field === field))
    );
  }, []);

  // Apply all corrections
  const submitCorrections = useCallback(async () => {
    if (!roundId || corrections.length === 0) return;

    await applyCorrections.mutateAsync({ roundId, corrections });
    setCorrections([]);
    refetch();
  }, [roundId, corrections, applyCorrections, refetch]);

  // Approve and finalize
  const approveAndFinalize = useCallback(async () => {
    if (!roundId) throw new Error('No round ID');

    // Apply any pending corrections first
    if (corrections.length > 0) {
      await submitCorrections();
    }

    // Then finalize
    return finalizeRound.mutateAsync({ roundId, recalculateSG: true });
  }, [roundId, corrections, submitCorrections, finalizeRound]);

  return {
    extraction,
    corrections,
    isLoading,
    isPending: applyCorrections.isPending || finalizeRound.isPending,

    addCorrection,
    removeCorrection,
    submitCorrections,
    approveAndFinalize,
  };
}
