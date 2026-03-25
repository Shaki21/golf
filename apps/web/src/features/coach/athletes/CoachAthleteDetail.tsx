/**
 * CoachAthleteDetail - Athlete Detail Hub Page
 *
 * Purpose: Neutral navigation hub for an athlete.
 *
 * CRITICAL UX RULES:
 * - 4 main actions as tiles/buttons (Se Bevis, Se Utvikling, Treningsplan, Notater)
 * - NO performance indicators
 * - Neutral presentation
 */

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Video, TrendingUp, ClipboardList, FileText, ChevronRight, Target } from 'lucide-react';
import { PageTitle, SectionTitle, SubSectionTitle } from '../../../components/typography';
import { getAthleteById, type Athlete } from '../../../lib/coachMockData';
import { athleteDetailActions, athleteStatusOptions } from '../../../config/coach-navigation';

// Icon map
const iconMap = {
  VideoIcon: Video,
  StatsIcon: TrendingUp,
  LessonsIcon: ClipboardList,
  ScorecardIcon: FileText,
  TargetIcon: Target,
};

// Avatar component
const AVATAR_COLORS = ['bg-tier-navy', 'bg-tier-success', 'bg-tier-warning', 'bg-tier-info'];

function Avatar({ name, size = 72 }: { name: string; size?: number }) {
  const initials = name.split(',')[0]?.substring(0, 2).toUpperCase() || 'XX';

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const bgColorClass = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];

  return (
    <div
      className={`rounded-2xl ${bgColorClass} text-white flex items-center justify-center font-bold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

// Status chip
function StatusChip({ status }: { status: Athlete['injuryStatus'] }) {
  const statusConfig = athleteStatusOptions.find(s => s.id === status);
  const colorClasses = {
    ready: 'bg-green-100 text-green-800',
    limited: 'bg-yellow-100 text-yellow-800',
    injured: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClasses[status]}`}>
      {statusConfig?.labelNO || status}
    </span>
  );
}

// Action tile component
function ActionTile({
  id,
  label,
  description,
  icon,
  href,
}: {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
}) {
  const Icon = iconMap[icon as keyof typeof iconMap] || FileText;

  return (
    <Link
      to={href}
      className="flex flex-col items-center gap-3 p-6 bg-tier-white rounded-xl border border-tier-border-default hover:border-tier-navy hover:shadow-md transition-all group"
    >
      <div className="w-14 h-14 rounded-xl bg-tier-navy/10 flex items-center justify-center group-hover:bg-tier-navy/20 transition-colors">
        <Icon size={28} className="text-tier-navy" />
      </div>
      <div className="text-center">
        <div className="font-semibold text-tier-navy mb-1">{label}</div>
        <div className="text-sm text-tier-text-secondary">{description}</div>
      </div>
    </Link>
  );
}

// Not found state
function AthleteNotFound() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="w-20 h-20 rounded-full bg-tier-surface-base flex items-center justify-center mx-auto mb-4">
        <FileText size={40} className="text-tier-text-tertiary" />
      </div>
      <SectionTitle style={{ marginBottom: 8 }}>Spiller ikke funnet</SectionTitle>
      <p className="text-tier-text-secondary mb-6">
        Denne spilleren finnes ikke eller du har ikke tilgang.
      </p>
      <button
        onClick={() => navigate('/coach/athletes')}
        className="px-6 py-3 bg-tier-navy text-white rounded-lg font-medium hover:bg-tier-navy/90 transition-colors"
      >
        Tilbake til spillerlisten
      </button>
    </div>
  );
}

export default function CoachAthleteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Get athlete from mock data
  const athlete = id ? getAthleteById(id) : undefined;

  if (!athlete) {
    return <AthleteNotFound />;
  }

  // Format last activity
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nb-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/coach/athletes')}
        className="flex items-center gap-2 text-tier-text-secondary hover:text-tier-navy transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        <span>Tilbake til utøvere</span>
      </button>

      {/* Athlete header - neutral presentation */}
      <div className="bg-tier-white rounded-xl border border-tier-border-default p-6 mb-6">
        <div className="flex items-start gap-5">
          <Avatar name={athlete.displayName} />

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <PageTitle className="!mb-0">{athlete.displayName}</PageTitle>
              <StatusChip status={athlete.injuryStatus} />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-tier-text-secondary">
              <span>Kategori {athlete.category}</span>
              <span>•</span>
              <span>HCP {athlete.hcp.toFixed(1)}</span>
              <span>•</span>
              <span>Sist aktiv {formatDate(athlete.lastActivityAt)}</span>
            </div>

            {athlete.hasPlan ? (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                <ClipboardList size={14} />
                <span>Aktiv treningsplan</span>
              </div>
            ) : (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">
                <ClipboardList size={14} />
                <span>Ingen treningsplan</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action tiles - 5 main actions */}
      <div className="mb-6">
        <SectionTitle className="mb-4">Handlinger</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {athleteDetailActions.map(action => (
            <ActionTile
              key={action.id}
              id={action.id}
              label={action.label}
              description={action.description}
              icon={action.icon}
              href={action.href(athlete.id)}
            />
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-tier-white rounded-xl border border-tier-border-default overflow-hidden">
        <SectionTitle className="p-4 pb-0">Hurtiglenker</SectionTitle>

        <div className="divide-y divide-tier-border-default">
          <Link
            to={`/coach/messages/compose?to=${athlete.id}`}
            className="flex items-center justify-between p-4 hover:bg-tier-surface-base transition-colors"
          >
            <span className="text-tier-navy">Send melding</span>
            <ChevronRight size={18} className="text-tier-text-tertiary" />
          </Link>

          <Link
            to={`/coach/booking?athlete=${athlete.id}`}
            className="flex items-center justify-between p-4 hover:bg-tier-surface-base transition-colors"
          >
            <span className="text-tier-navy">Book økt</span>
            <ChevronRight size={18} className="text-tier-text-tertiary" />
          </Link>

          <Link
            to={`/coach/athletes/${athlete.id}/plan/edit`}
            className="flex items-center justify-between p-4 hover:bg-tier-surface-base transition-colors"
          >
            <span className="text-tier-navy">Rediger treningsplan</span>
            <ChevronRight size={18} className="text-tier-text-tertiary" />
          </Link>
        </div>
      </div>
    </div>
  );
}
