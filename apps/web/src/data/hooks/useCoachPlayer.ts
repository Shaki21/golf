/**
 * useCoachPlayer Hook
 * Fetches player data for coach view: info, stats, videos, sessions, goals
 * Maps to CoachPlayerPage component
 */

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../apiClient';
import type { HookResult, DashboardStatsItem, Goal } from '../types';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface PlayerInfo {
  id: string;
  name: string;
  email?: string;
  tier?: string;
  joinedAt?: string;
}

export interface PlayerVideo {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'reviewed' | 'needs_followup';
  category?: string;
}

export interface PlayerSession {
  id: string;
  title: string;
  date: string;
  duration: number;
  type: string;
}

export interface CoachPlayerData {
  player: PlayerInfo;
  stats: DashboardStatsItem[];
  videos: PlayerVideo[];
  sessions: PlayerSession[];
  goals: Goal[];
}

// ═══════════════════════════════════════════
// FALLBACK DATA
// ═══════════════════════════════════════════

const createFallbackData = (playerId: string): CoachPlayerData => ({
  player: {
    id: playerId,
    name: 'Spiller',
    tier: 'B-nivå',
  },
  stats: [
    { id: '1', label: 'Økter siste uke', value: '5', sublabel: 'av 6 planlagt' },
    { id: '2', label: 'Treningsminutter', value: '320', sublabel: 'Denne måneden', change: { value: '8%', direction: 'up' } },
    { id: '3', label: 'Videoer til review', value: '3', sublabel: 'Venter på tilbakemelding' },
    { id: '4', label: 'Mål-progresjon', value: '72%', sublabel: 'Gjennomsnitt', change: { value: '5%', direction: 'up' } },
  ],
  videos: [
    { id: 'v1', title: 'Driver Swing', date: new Date().toISOString(), status: 'pending', category: 'swing' },
    { id: 'v2', title: 'Putting Drill', date: new Date(Date.now() - 86400000).toISOString(), status: 'reviewed', category: 'putting' },
  ],
  sessions: [
    { id: 's1', title: 'Putting-trening', date: new Date().toISOString(), duration: 60, type: 'training' },
    { id: 's2', title: 'Driving range', date: new Date(Date.now() - 86400000).toISOString(), duration: 90, type: 'training' },
    { id: 's3', title: 'Kort spill', date: new Date(Date.now() - 172800000).toISOString(), duration: 45, type: 'training' },
  ],
  goals: [
    { id: 'g1', title: 'Forbedre putting', description: 'Maks 32 putts per runde', current: 34, target: 32, unit: 'putts', status: 'active', type: 'short' },
    { id: 'g2', title: 'Handicap under 10', description: 'Årsmål', current: 12.5, target: 10, unit: 'hcp', status: 'active', type: 'long' },
  ],
});

// ═══════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════

interface ApiPlayerResponse {
  player?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    tier?: string;
    createdAt?: string;
  };
  stats?: Array<{
    id: string;
    label: string;
    value: string | number;
    sublabel?: string;
    change?: { value: string; direction: 'up' | 'down' | 'neutral' };
  }>;
  videos?: Array<{
    id: string;
    title: string;
    createdAt: string;
    reviewStatus: string;
    category?: string;
  }>;
  sessions?: Array<{
    id: string;
    title: string;
    date: string;
    duration: number;
    type?: string;
  }>;
  goals?: Array<{
    id: string;
    title: string;
    description?: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    status: string;
    type: string;
  }>;
}

// ═══════════════════════════════════════════
// MAPPER
// ═══════════════════════════════════════════

function mapApiToPlayerData(api: ApiPlayerResponse, playerId: string): CoachPlayerData {
  const fallback = createFallbackData(playerId);

  // Map player info
  const player: PlayerInfo = api.player ? {
    id: api.player.id,
    name: [api.player.firstName, api.player.lastName].filter(Boolean).join(' ') || 'Spiller',
    email: api.player.email,
    tier: api.player.tier,
    joinedAt: api.player.createdAt,
  } : fallback.player;

  // Map stats
  const stats: DashboardStatsItem[] = api.stats?.length ? api.stats : fallback.stats;

  // Map videos
  const videos: PlayerVideo[] = api.videos?.length
    ? api.videos.slice(0, 5).map(v => ({
        id: v.id,
        title: v.title,
        date: v.createdAt,
        status: mapVideoStatus(v.reviewStatus),
        category: v.category,
      }))
    : fallback.videos;

  // Map sessions
  const sessions: PlayerSession[] = api.sessions?.length
    ? api.sessions.slice(0, 5).map(s => ({
        id: s.id,
        title: s.title,
        date: s.date,
        duration: s.duration,
        type: s.type || 'training',
      }))
    : fallback.sessions;

  // Map goals
  const goals: Goal[] = api.goals?.length
    ? api.goals.slice(0, 3).map(g => ({
        id: g.id,
        title: g.title,
        description: g.description,
        current: g.currentValue,
        target: g.targetValue,
        unit: g.unit,
        status: g.status as Goal['status'],
        type: g.type as Goal['type'],
      }))
    : fallback.goals;

  return { player, stats, videos, sessions, goals };
}

function mapVideoStatus(status: string): PlayerVideo['status'] {
  switch (status?.toLowerCase()) {
    case 'reviewed':
    case 'done':
      return 'reviewed';
    case 'needs_followup':
    case 'followup':
      return 'needs_followup';
    default:
      return 'pending';
  }
}

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export function useCoachPlayer(playerId: string): HookResult<CoachPlayerData> {
  const [data, setData] = useState<CoachPlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!playerId) {
      setError('Mangler spiller-ID');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use dashboard endpoint for coach view of player data
      const response = await apiGet<ApiPlayerResponse>(`/dashboard/${playerId}`);
      const mappedData = mapApiToPlayerData(response, playerId);
      setData(mappedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kunne ikke laste spillerdata';
      setError(message);
      // Use fallback data on error for demo purposes
      setData(createFallbackData(playerId));
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export default useCoachPlayer;
