/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * TIER Golf - Coach Athlete Status
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Real-time overview of player status including:
 * - Training activity, sleep, energy, stress, injuries
 * - Weekly training progress
 * - Alert notifications
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Zap,
  Moon,
  Heart,
  Thermometer,
  Search,
  ChevronRight,
  Bell,
  MessageCircle,
  Utensils,
  Battery,
  Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { coachesAPI } from '../../services/api';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';
import { PageTitle, SubSectionTitle } from '../../components/typography/Headings';

// ============================================================================
// CLASS MAPPINGS
// ============================================================================

const STATUS_CLASSES = {
  green: {
    bg: 'bg-tier-success/10',
    text: 'text-tier-success',
    border: 'border-tier-success',
  },
  yellow: {
    bg: 'bg-tier-warning/10',
    text: 'text-tier-warning',
    border: 'border-tier-warning',
  },
  red: {
    bg: 'bg-tier-error/10',
    text: 'text-tier-error',
    border: 'border-tier-error',
  },
  good: {
    bg: 'bg-tier-success/10',
    text: 'text-tier-success',
    border: 'border-tier-success',
  },
  warning: {
    bg: 'bg-tier-warning/10',
    text: 'text-tier-warning',
    border: 'border-tier-warning',
  },
  critical: {
    bg: 'bg-tier-error/10',
    text: 'text-tier-error',
    border: 'border-tier-error',
  },
};

const CATEGORY_CLASSES = {
  A: { bg: 'bg-tier-success/15', text: 'text-tier-success' },
  B: { bg: 'bg-tier-navy/15', text: 'text-tier-navy' },
  C: { bg: 'bg-tier-warning/15', text: 'text-tier-warning' },
};

const PROGRESS_BAR_COLORS = {
  high: 'bg-tier-success',
  medium: 'bg-tier-warning',
  low: 'bg-tier-error',
};

interface PlayerStatus {
  id: string;
  name: string;
  category: 'A' | 'B' | 'C';
  hcp: number;
  lastActive: string;
  overallStatus: 'green' | 'yellow' | 'red';
  metrics: {
    training: { value: number; status: 'good' | 'warning' | 'critical'; label: string };
    sleep: { value: number; status: 'good' | 'warning' | 'critical'; label: string };
    energy: { value: number; status: 'good' | 'warning' | 'critical'; label: string };
    stress: { value: number; status: 'good' | 'warning' | 'critical'; label: string };
    injury: { value: boolean; status: 'good' | 'warning' | 'critical'; label: string };
  };
  alerts: {
    type: 'warning' | 'info' | 'critical';
    metric: 'training' | 'sleep' | 'energy' | 'stress' | 'injury';
    message: string;
  }[];
  upcomingSession?: string;
  weeklyTrainingMinutes: number;
  weeklyGoal: number;
}

const mockPlayerStatuses: PlayerStatus[] = [
  {
    id: '1',
    name: 'Emma Larsen',
    category: 'A',
    hcp: 4.2,
    lastActive: '2025-01-19T10:30:00',
    overallStatus: 'green',
    metrics: {
      training: { value: 85, status: 'good', label: '8.5t denne uka' },
      sleep: { value: 90, status: 'good', label: '7.5t snitt' },
      energy: { value: 80, status: 'good', label: 'Hoy' },
      stress: { value: 25, status: 'good', label: 'Lav' },
      injury: { value: false, status: 'good', label: 'Ingen skader' }
    },
    alerts: [],
    upcomingSession: '2025-01-20T09:00:00',
    weeklyTrainingMinutes: 510,
    weeklyGoal: 600
  },
  {
    id: '2',
    name: 'Jonas Pedersen',
    category: 'B',
    hcp: 16.8,
    lastActive: '2024-12-22T14:00:00',
    overallStatus: 'red',
    metrics: {
      training: { value: 20, status: 'critical', label: '1t denne uka' },
      sleep: { value: 50, status: 'warning', label: '5.5t snitt' },
      energy: { value: 40, status: 'warning', label: 'Lav' },
      stress: { value: 70, status: 'warning', label: 'Hoy' },
      injury: { value: false, status: 'good', label: 'Ingen skader' }
    },
    alerts: [
      { type: 'critical', metric: 'training', message: '28 dager siden sist aktivitet' },
      { type: 'warning', metric: 'stress', message: 'Rapportert hoyt stressniva' }
    ],
    weeklyTrainingMinutes: 60,
    weeklyGoal: 300
  },
  {
    id: '3',
    name: 'Sofie Andersen',
    category: 'A',
    hcp: 2.8,
    lastActive: '2025-01-19T08:00:00',
    overallStatus: 'green',
    metrics: {
      training: { value: 95, status: 'good', label: '10t denne uka' },
      sleep: { value: 85, status: 'good', label: '7t snitt' },
      energy: { value: 90, status: 'good', label: 'Veldig hoy' },
      stress: { value: 20, status: 'good', label: 'Lav' },
      injury: { value: false, status: 'good', label: 'Ingen skader' }
    },
    alerts: [],
    upcomingSession: '2025-01-21T10:00:00',
    weeklyTrainingMinutes: 600,
    weeklyGoal: 600
  },
  {
    id: '4',
    name: 'Thomas Berg',
    category: 'B',
    hcp: 12.4,
    lastActive: '2025-01-18T16:00:00',
    overallStatus: 'yellow',
    metrics: {
      training: { value: 65, status: 'warning', label: '4t denne uka' },
      sleep: { value: 60, status: 'warning', label: '6t snitt' },
      energy: { value: 55, status: 'warning', label: 'Middels' },
      stress: { value: 50, status: 'warning', label: 'Middels' },
      injury: { value: false, status: 'good', label: 'Ingen skader' }
    },
    alerts: [
      { type: 'warning', metric: 'training', message: 'Lavere treningsvolum enn normalt' }
    ],
    upcomingSession: '2025-01-22T14:00:00',
    weeklyTrainingMinutes: 240,
    weeklyGoal: 360
  },
  {
    id: '5',
    name: 'Kristine Olsen',
    category: 'A',
    hcp: 7.5,
    lastActive: '2025-01-17T12:00:00',
    overallStatus: 'yellow',
    metrics: {
      training: { value: 50, status: 'warning', label: '3t denne uka' },
      sleep: { value: 45, status: 'warning', label: '5t snitt' },
      energy: { value: 40, status: 'warning', label: 'Lav' },
      stress: { value: 65, status: 'warning', label: 'Forhoyet' },
      injury: { value: true, status: 'critical', label: 'Handledd' }
    },
    alerts: [
      { type: 'critical', metric: 'injury', message: 'Rapportert skade: Handledd' },
      { type: 'warning', metric: 'sleep', message: 'Lite sovn siste uke' }
    ],
    weeklyTrainingMinutes: 180,
    weeklyGoal: 480
  },
  {
    id: '6',
    name: 'Erik Hansen',
    category: 'A',
    hcp: 5.5,
    lastActive: '2025-01-18T09:00:00',
    overallStatus: 'green',
    metrics: {
      training: { value: 75, status: 'good', label: '6t denne uka' },
      sleep: { value: 80, status: 'good', label: '7t snitt' },
      energy: { value: 75, status: 'good', label: 'Hoy' },
      stress: { value: 30, status: 'good', label: 'Lav' },
      injury: { value: false, status: 'good', label: 'Ingen skader' }
    },
    alerts: [],
    upcomingSession: '2025-01-20T11:00:00',
    weeklyTrainingMinutes: 360,
    weeklyGoal: 420
  }
];

export const CoachAthleteStatus: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [playerStatuses, setPlayerStatuses] = useState<PlayerStatus[]>(mockPlayerStatuses);

  // Fetch player data from API
  const fetchPlayerStatuses = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch athletes and alerts in parallel
      const [athletesRes, alertsRes] = await Promise.all([
        coachesAPI.getAthletes().catch(() => ({ data: null })),
        coachesAPI.getAlerts(false).catch(() => ({ data: null })),
      ]);

      const athletesData = athletesRes.data?.data || athletesRes.data || [];
      const alertsData: any[] = Array.isArray(alertsRes.data?.data) ? alertsRes.data.data : (Array.isArray(alertsRes.data) ? alertsRes.data : []);

      if (Array.isArray(athletesData) && athletesData.length > 0) {
        // Transform API data to PlayerStatus format
        const transformed: PlayerStatus[] = athletesData.map((athlete: any) => {
          // Find alerts for this player
          const playerAlerts = alertsData.filter(
            (a: any) => a.playerId === athlete.id || a.player?.id === athlete.id
          ).map((a: any) => ({
            type: a.severity === 'critical' || a.priority === 'high' ? 'critical' as const : 'warning' as const,
            metric: (a.metric || a.category || 'training') as 'training' | 'sleep' | 'energy' | 'stress' | 'injury',
            message: a.message || a.description || 'Ukjent varsel',
          }));

          // Determine overall status from metrics or alerts
          let overallStatus: 'green' | 'yellow' | 'red' = 'green';
          if (playerAlerts.some((a: any) => a.type === 'critical') || athlete.status === 'critical') {
            overallStatus = 'red';
          } else if (playerAlerts.length > 0 || athlete.status === 'warning') {
            overallStatus = 'yellow';
          }

          return {
            id: athlete.id,
            name: `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim() || athlete.name || 'Spiller',
            category: athlete.category || 'C',
            hcp: athlete.handicap || athlete.hcp || 54,
            lastActive: athlete.lastActivity || athlete.updatedAt || new Date().toISOString(),
            overallStatus,
            metrics: {
              training: {
                value: athlete.trainingProgress || 50,
                status: (athlete.trainingProgress || 50) >= 70 ? 'good' : (athlete.trainingProgress || 50) >= 40 ? 'warning' : 'critical',
                label: `${Math.round((athlete.weeklyTrainingMinutes || 0) / 60)}t denne uka`,
              },
              sleep: {
                value: athlete.sleepScore || 70,
                status: (athlete.sleepScore || 70) >= 70 ? 'good' : (athlete.sleepScore || 70) >= 50 ? 'warning' : 'critical',
                label: `${athlete.avgSleep || 7}t snitt`,
              },
              energy: {
                value: athlete.energyLevel || 70,
                status: (athlete.energyLevel || 70) >= 70 ? 'good' : (athlete.energyLevel || 70) >= 40 ? 'warning' : 'critical',
                label: (athlete.energyLevel || 70) >= 70 ? 'Høy' : (athlete.energyLevel || 70) >= 40 ? 'Middels' : 'Lav',
              },
              stress: {
                value: athlete.stressLevel || 30,
                status: (athlete.stressLevel || 30) <= 30 ? 'good' : (athlete.stressLevel || 30) <= 60 ? 'warning' : 'critical',
                label: (athlete.stressLevel || 30) <= 30 ? 'Lav' : (athlete.stressLevel || 30) <= 60 ? 'Middels' : 'Høy',
              },
              injury: {
                value: athlete.hasInjury || false,
                status: athlete.hasInjury ? 'critical' : 'good',
                label: athlete.hasInjury ? (athlete.injuryDescription || 'Skade') : 'Ingen skader',
              },
            },
            alerts: playerAlerts,
            upcomingSession: athlete.nextSession || undefined,
            weeklyTrainingMinutes: athlete.weeklyTrainingMinutes || 0,
            weeklyGoal: athlete.weeklyGoal || 300,
          };
        });

        setPlayerStatuses(transformed);
      }
    } catch (error) {
      console.error('Failed to fetch player statuses:', error);
      // Keep mock data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayerStatuses();
  }, [fetchPlayerStatuses]);

  const filteredPlayers = useMemo(() => {
    let players = [...playerStatuses];

    if (searchQuery) {
      players = players.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      players = players.filter(p => p.overallStatus === statusFilter);
    }

    // Sort by status (red first, then yellow, then green)
    players.sort((a, b) => {
      const order = { red: 0, yellow: 1, green: 2 };
      return order[a.overallStatus] - order[b.overallStatus];
    });

    return players;
  }, [searchQuery, statusFilter, playerStatuses]);

  const stats = useMemo(() => ({
    total: playerStatuses.length,
    green: playerStatuses.filter(p => p.overallStatus === 'green').length,
    yellow: playerStatuses.filter(p => p.overallStatus === 'yellow').length,
    red: playerStatuses.filter(p => p.overallStatus === 'red').length,
    totalAlerts: playerStatuses.reduce((acc, p) => acc + p.alerts.length, 0)
  }), [playerStatuses]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-tier-surface-base min-h-screen flex items-center justify-center">
        <StateCard variant="loading" title="Laster spillerstatus..." />
      </div>
    );
  }

  const getStatusClasses = (status: string) => {
    return STATUS_CLASSES[status as keyof typeof STATUS_CLASSES] || {
      bg: 'bg-tier-surface-base',
      text: 'text-tier-text-secondary',
      border: 'border-tier-border-default',
    };
  };

  const getCategoryClasses = (category: string) => {
    return CATEGORY_CLASSES[category as keyof typeof CATEGORY_CLASSES] || {
      bg: 'bg-tier-surface-base',
      text: 'text-tier-navy',
    };
  };

  const getProgressBarColor = (ratio: number) => {
    if (ratio >= 0.8) return PROGRESS_BAR_COLORS.high;
    if (ratio >= 0.5) return PROGRESS_BAR_COLORS.medium;
    return PROGRESS_BAR_COLORS.low;
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Akkurat na';
    if (diffHours < 24) return `${diffHours}t siden`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'I gar';
    return `${diffDays} dager siden`;
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'training': return Zap;
      case 'sleep': return Moon;
      case 'energy': return Heart;
      case 'stress': return Activity;
      case 'injury': return Thermometer;
      default: return Activity;
    }
  };

  return (
    <div className="p-6 bg-tier-surface-base min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-tier-navy flex items-center justify-center">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <PageTitle className="text-[28px] font-bold text-tier-navy m-0">
              Spillerstatus
            </PageTitle>
            <p className="text-sm text-tier-text-secondary m-0">
              Sanntidsoversikt over spillernes tilstand og varsler
            </p>
          </div>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <Card variant="default" padding="none">
          <div className="p-4">
            <p className="text-xs text-tier-text-secondary m-0 mb-1">
              Totalt
            </p>
            <p className="text-[28px] font-bold text-tier-navy m-0">
              {stats.total}
            </p>
          </div>
        </Card>
        <Card variant="default" padding="none">
          <div className="p-4 bg-tier-success/5 rounded-xl border border-tier-success/20">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle size={14} className="text-tier-success" />
              <p className="text-xs text-tier-success m-0">Alt OK</p>
            </div>
            <p className="text-[28px] font-bold text-tier-success m-0">
              {stats.green}
            </p>
          </div>
        </Card>
        <Card variant="default" padding="none">
          <div className="p-4 bg-tier-warning/5 rounded-xl border border-tier-warning/20">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={14} className="text-tier-warning" />
              <p className="text-xs text-tier-warning m-0">Følg opp</p>
            </div>
            <p className="text-[28px] font-bold text-tier-warning m-0">
              {stats.yellow}
            </p>
          </div>
        </Card>
        <Card variant="default" padding="none">
          <div className="p-4 bg-tier-error/5 rounded-xl border border-tier-error/20">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={14} className="text-tier-error" />
              <p className="text-xs text-tier-error m-0">Kritisk</p>
            </div>
            <p className="text-[28px] font-bold text-tier-error m-0">
              {stats.red}
            </p>
          </div>
        </Card>
        <Card variant="default" padding="none">
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Bell size={14} className="text-tier-text-secondary" />
              <p className="text-xs text-tier-text-secondary m-0">Varsler</p>
            </div>
            <p className="text-[28px] font-bold text-tier-navy m-0">
              {stats.totalAlerts}
            </p>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[400px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-secondary"
          />
          <input
            type="text"
            placeholder="Søk etter spiller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-10 pr-3 rounded-lg border border-tier-border-default bg-tier-white text-sm text-tier-navy outline-none focus:border-tier-navy"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Alle' },
            { key: 'red', label: 'Kritisk' },
            { key: 'yellow', label: 'Følg opp' },
            { key: 'green', label: 'OK' }
          ].map(filter => (
            <Button
              key={filter.key}
              variant={statusFilter === filter.key ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(filter.key as typeof statusFilter)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Player List */}
      <div className="flex flex-col gap-3">
        {filteredPlayers.map((player) => {
          const statusClasses = getStatusClasses(player.overallStatus);
          const catClasses = getCategoryClasses(player.category);
          const progressRatio = player.weeklyTrainingMinutes / player.weeklyGoal;

          return (
            <Card key={player.id} variant="default" padding="none">
              <div className={`p-5 border-l-4 ${statusClasses.border} rounded-xl`}>
                {/* Header Row */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className={`w-12 h-12 rounded-full ${statusClasses.bg} border-2 ${statusClasses.border} flex items-center justify-center text-lg font-semibold ${statusClasses.text}`}>
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <SubSectionTitle className="text-[16px] font-semibold text-tier-navy m-0">
                          {player.name}
                        </SubSectionTitle>
                        <span className={`text-[10px] font-semibold py-0.5 px-2 rounded ${catClasses.bg} ${catClasses.text}`}>
                          Kat. {player.category}
                        </span>
                        <span className="text-[11px] text-tier-text-secondary">
                          HCP {player.hcp}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-tier-text-secondary">
                          Sist aktiv: {formatLastActive(player.lastActive)}
                        </span>
                        {player.upcomingSession && (
                          <span className="text-xs text-tier-navy flex items-center gap-1">
                            <Calendar size={12} />
                            Neste økt: {new Date(player.upcomingSession).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/coach/messages/compose?to=${player.id}`)}
                      leftIcon={<MessageCircle size={14} />}
                    >
                      Melding
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/coach/athletes/${player.id}`)}
                    >
                      Se profil
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className={`grid grid-cols-5 gap-3 ${player.alerts.length > 0 ? 'mb-4' : ''}`}>
                  {Object.entries(player.metrics).map(([key, metric]) => {
                    const Icon = getMetricIcon(key);
                    const typedMetric = metric as { value: number | boolean; status: 'good' | 'warning' | 'critical'; label: string };
                    const metricClasses = getStatusClasses(typedMetric.status);
                    return (
                      <div key={key} className={`p-3 ${metricClasses.bg} rounded-lg text-center`}>
                        <Icon size={18} className={`${metricClasses.text} mb-1.5 mx-auto`} />
                        <p className={`text-[11px] ${metricClasses.text} font-medium m-0`}>
                          {typedMetric.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Weekly Training Progress */}
                <div className="mt-3 p-3 bg-tier-surface-base rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-tier-text-secondary">
                      Ukentlig trening
                    </span>
                    <span className="text-xs font-semibold text-tier-navy">
                      {Math.round(player.weeklyTrainingMinutes / 60)}t / {Math.round(player.weeklyGoal / 60)}t
                    </span>
                  </div>
                  <div className="h-2 bg-tier-border-default rounded overflow-hidden">
                    <div
                      className={`h-full ${getProgressBarColor(progressRatio)} rounded transition-all duration-300`}
                      style={{ width: `${Math.min(progressRatio * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Alerts */}
                {player.alerts.length > 0 && (
                  <div className="mt-3 p-3 bg-tier-error/5 rounded-lg border border-tier-error/20">
                    {player.alerts.map((alert, idx) => {
                      const MetricIcon = getMetricIcon(alert.metric);
                      return (
                        <div key={idx} className={`flex items-center gap-2 ${idx < player.alerts.length - 1 ? 'mb-2' : ''}`}>
                          <MetricIcon
                            size={14}
                            className={alert.type === 'critical' ? 'text-tier-error' : 'text-tier-warning'}
                          />
                          <span className={`text-[13px] font-medium ${alert.type === 'critical' ? 'text-tier-error' : 'text-tier-warning'}`}>
                            {alert.message}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredPlayers.length === 0 && (
        <StateCard
          variant="empty"
          title="Ingen spillere funnet"
          description="Prøv å justere filteret for å se flere spillere."
        />
      )}
    </div>
  );
};

export default CoachAthleteStatus;
