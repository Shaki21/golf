/**
 * CoachPlayerPage
 * Coach-only player profile view
 * Shows player info, KPI stats, recent videos, sessions, and goals
 */

import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCoachPlayer } from '../../data/hooks/useCoachPlayer';
import { track } from '../../analytics/track';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import StatsGridTemplate from '../../ui/templates/StatsGridTemplate';
import StateCard from '../../ui/composites/StateCard';
import { SectionTitle } from '../../components/typography/Headings';
import { PageHeader } from '../../ui/raw-blocks';

// ═══════════════════════════════════════════
// STATUS CONFIG
// ═══════════════════════════════════════════

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  reviewed: {
    bg: 'bg-green-500/15',
    text: 'text-green-600',
    label: 'Gjennomgått',
  },
  needs_followup: {
    bg: 'bg-red-500/15',
    text: 'text-red-600',
    label: 'Oppfølging',
  },
  pending: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-600',
    label: 'Venter',
  },
};

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export function CoachPlayerPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const { data, isLoading, error, refetch } = useCoachPlayer(playerId || '');

  // Analytics: Track screen view
  useEffect(() => {
    if (playerId) {
      track('screen_view', {
        screen: 'CoachPlayerPage',
        source: 'navigation',
        id: playerId,
      });
    }
  }, [playerId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <StateCard
          title="Laster spillerdata..."
          description="Vennligst vent"
          variant="info"
        />
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="p-6">
        <StateCard
          title="Kunne ikke laste spillerdata"
          description={error}
          variant="error"
          action={
            <Button variant="secondary" onClick={refetch}>
              Prøv igjen
            </Button>
          }
        />
      </div>
    );
  }

  // No data
  if (!data) {
    return (
      <div className="p-6">
        <StateCard
          title="Ingen data tilgjengelig"
          description="Kunne ikke finne spillerdata"
          variant="empty"
        />
      </div>
    );
  }

  const { player, stats, videos, sessions, goals } = data;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={player.name}
        subtitle={player.tier || 'Spillerprofil'}
        helpText="Trenerens visning av spillerprofil med komplett oversikt. Se nøkkeltall (KPI stats), siste videoer med status (venter, gjennomgått, oppfølging), nylige treningsøkter med varighet, og aktive mål med fremgangsvisning. Klikk på videoer for å gå til videoanalyse. Bruk for å følge spillerens utvikling og planlegge neste trinn."
      />

      {/* KPI Stats */}
      <section className="flex flex-col gap-3">
        <SectionTitle className="m-0 text-[15px] font-semibold text-tier-navy">
          Nøkkeltall
        </SectionTitle>
        <StatsGridTemplate items={stats} columns={2} />
      </section>

      {/* Recent Videos */}
      <section className="flex flex-col gap-3">
        <SectionTitle className="m-0 text-[15px] font-semibold text-tier-navy">
          Siste videoer
        </SectionTitle>
        <Card>
          {videos.length === 0 ? (
            <StateCard variant="empty" title="Ingen videoer" compact />
          ) : (
            videos.map((video, index) => {
              const statusConfig = getStatusConfig(video.status);
              return (
                <Link
                  key={video.id}
                  to={`/coach/videos`}
                  className={`flex items-center justify-between p-3 no-underline text-inherit ${
                    index !== videos.length - 1 ? 'border-b border-tier-border-subtle' : ''
                  }`}
                  onClick={() => {
                    track('screen_view', {
                      screen: 'CoachVideoReview',
                      source: 'coach_player_page',
                      id: video.id,
                      action: 'open',
                    });
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-tier-navy">
                      {video.title}
                    </span>
                    <span className="text-xs text-tier-text-secondary">
                      {formatDate(video.date)} {video.category && `• ${video.category}`}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[11px] font-semibold uppercase ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {statusConfig.label}
                  </span>
                </Link>
              );
            })
          )}
        </Card>
      </section>

      {/* Recent Sessions */}
      <section className="flex flex-col gap-3">
        <SectionTitle className="m-0 text-[15px] font-semibold text-tier-navy">
          Siste økter
        </SectionTitle>
        <Card>
          {sessions.length === 0 ? (
            <StateCard variant="empty" title="Ingen økter" compact />
          ) : (
            sessions.map((session, index) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-3 ${
                  index !== sessions.length - 1 ? 'border-b border-tier-border-subtle' : ''
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-tier-navy">
                    {session.title}
                  </span>
                  <span className="text-xs text-tier-text-secondary">
                    {formatDate(session.date)} • {session.duration} min
                  </span>
                </div>
              </div>
            ))
          )}
        </Card>
      </section>

      {/* Goals Summary */}
      <section className="flex flex-col gap-3">
        <SectionTitle className="m-0 text-[15px] font-semibold text-tier-navy">
          Aktive mål
        </SectionTitle>
        <Card>
          {goals.length === 0 ? (
            <StateCard variant="empty" title="Ingen aktive mål" compact />
          ) : (
            goals.map((goal, index) => {
              const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
              return (
                <div
                  key={goal.id}
                  className={`flex flex-col items-stretch gap-2 p-3 ${
                    index !== goals.length - 1 ? 'border-b border-tier-border-subtle' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-tier-navy">
                      {goal.title}
                    </span>
                    <span className="text-xs text-tier-text-secondary">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-tier-border-default rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-tier-gold rounded-sm transition-[width] duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-tier-navy min-w-[40px] text-right">
                      {progress}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </section>
    </div>
  );
}

export default CoachPlayerPage;
