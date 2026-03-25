/**
 * TIER Golf - Fra Trener Container
 * Design System v3.0 - Premium Light
 *
 * Coach messages and feedback for players.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState } from 'react';
import {
  User, ChevronRight, Calendar, Target, Video, FileText,
  MessageSquare, Star, Clock, CheckCircle
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SubSectionTitle } from '../../components/typography';
import StateCard from '../../ui/composites/StateCard';

// ============================================================================
// MOCK DATA
// ============================================================================

const COACH_MESSAGES = [
  {
    id: 'cm1',
    coach: {
      name: 'Anders Kristiansen',
      role: 'Hovedtrener',
    },
    type: 'feedback',
    title: 'Feedback pa treningsokt',
    content: 'Bra jobba pa okten i dag! Tempoet ditt er mye bedre enn for noen uker siden. Jeg la merke til at overgangen fra toppen er mye jevnere na. Fortsett a fokusere pa a fole tyngden i klubben pa toppen for du starter nedsvingen.',
    date: '2025-01-18',
    read: false,
    attachments: ['Video: Sving analyse'],
    relatedTo: 'Teknikk-trening',
  },
  {
    id: 'cm2',
    coach: {
      name: 'Maria Hansen',
      role: 'Kortspill-trener',
    },
    type: 'plan_update',
    title: 'Oppdatert treningsplan',
    content: 'Jeg har lagt til noen nye bunkerovelser i planen din for neste uke. Fokuser spesielt pa a apne bladet mer ved impact. Se vedlagt video for referanse.',
    date: '2025-01-17',
    read: true,
    attachments: ['Video: Bunker teknikk'],
    relatedTo: 'Ukeplan',
  },
  {
    id: 'cm3',
    coach: {
      name: 'Anders Kristiansen',
      role: 'Hovedtrener',
    },
    type: 'goal_review',
    title: 'Malevaluering - Januar',
    content: 'Flott fremgang denne maneden! Du har oppnadd 3 av 5 mal. Spesielt imponert over forbedringen i driving-avstand. La oss diskutere justeringer for februar pa neste mote.',
    date: '2025-01-15',
    read: true,
    attachments: [],
    relatedTo: 'Malevaluering',
  },
  {
    id: 'cm4',
    coach: {
      name: 'Erik Olsen',
      role: 'Fysisk trener',
    },
    type: 'achievement',
    title: 'Ny PR registrert!',
    content: 'Gratulerer med ny PR i squat - 100 kg! Dette kommer til a hjelpe rotasjonskraften din. Fortsett det gode arbeidet!',
    date: '2025-01-12',
    read: true,
    attachments: [],
    relatedTo: 'Styrketrening',
  },
  {
    id: 'cm5',
    coach: {
      name: 'Anders Kristiansen',
      role: 'Hovedtrener',
    },
    type: 'breaking_point',
    title: 'Breaking Point oppdatert',
    content: 'Jeg har oppdatert breaking point "Sving tempo" med nye ovelser. Vi er na pa 65% fremgang. Med litt mer fokus kan vi lose dette helt innen februar.',
    date: '2025-01-10',
    read: true,
    attachments: ['Ovelser: Tempo drills'],
    relatedTo: 'Breaking Points',
  },
];

// ============================================================================
// HELPERS
// ============================================================================

const getTypeConfig = (type) => {
  switch (type) {
    case 'feedback':
      return { label: 'Feedback', colorClasses: { bg: 'bg-tier-navy/15', text: 'text-tier-navy' }, icon: MessageSquare };
    case 'plan_update':
      return { label: 'Planoppdatering', colorClasses: { bg: 'bg-tier-success/15', text: 'text-tier-success' }, icon: Calendar };
    case 'goal_review':
      return { label: 'Malevaluering', colorClasses: { bg: 'bg-amber-500/15', text: 'text-amber-600' }, icon: Target };
    case 'achievement':
      return { label: 'Prestasjon', colorClasses: { bg: 'bg-tier-success/15', text: 'text-tier-success' }, icon: Star };
    case 'breaking_point':
      return { label: 'Breaking Point', colorClasses: { bg: 'bg-tier-error/15', text: 'text-tier-error' }, icon: Target };
    default:
      return { label: type, colorClasses: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary' }, icon: FileText };
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'I dag';
  if (date.toDateString() === yesterday.toDateString()) return 'I gar';
  return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
};

// ============================================================================
// MESSAGE CARD
// ============================================================================

const CoachMessageCard = ({ message, onClick }) => {
  const typeConfig = getTypeConfig(message.type);
  const TypeIcon = typeConfig.icon;

  return (
    <div
      onClick={() => onClick(message)}
      className={`bg-tier-white rounded-[14px] p-4 cursor-pointer transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md ${
        message.read ? '' : 'border-l-[3px] border-l-tier-navy'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Coach Avatar */}
        <div className="w-11 h-11 rounded-full bg-tier-navy flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {message.coach.name.split(' ').map((n) => n[0]).join('')}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-tier-navy">
                {message.coach.name}
              </span>
              <span className="text-[11px] text-tier-text-secondary">
                {message.coach.role}
              </span>
            </div>
            <span className="text-[11px] text-tier-text-secondary">
              {formatDate(message.date)}
            </span>
          </div>

          {/* Type Badge and Title */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-medium py-0.5 px-2 rounded ${typeConfig.colorClasses.bg} ${typeConfig.colorClasses.text} flex items-center gap-1`}>
              <TypeIcon size={10} />
              {typeConfig.label}
            </span>
            <SubSectionTitle className={`text-[15px] ${message.read ? 'font-medium' : 'font-semibold'} text-tier-navy m-0`}>
              {message.title}
            </SubSectionTitle>
          </div>

          {/* Content Preview */}
          <p className="text-[13px] text-tier-text-secondary m-0 mb-2.5 leading-snug line-clamp-2">
            {message.content}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {message.attachments.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-tier-navy">
                  <Video size={12} />
                  {message.attachments.length} vedlegg
                </div>
              )}
              {message.relatedTo && (
                <div className="text-[11px] text-tier-text-secondary">
                  Relatert til: {message.relatedTo}
                </div>
              )}
            </div>
            {!message.read && (
              <div className="w-2 h-2 rounded-full bg-tier-navy" />
            )}
          </div>
        </div>

        <ChevronRight size={18} className="text-tier-text-secondary flex-shrink-0" />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FraTrenerContainer = () => {
  const [filter, setFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);

  const filters = [
    { key: 'all', label: 'Alle' },
    { key: 'feedback', label: 'Feedback' },
    { key: 'plan_update', label: 'Planer' },
    { key: 'goal_review', label: 'Mal' },
  ];

  const filteredMessages = COACH_MESSAGES.filter(
    (m) => filter === 'all' || m.type === filter
  );

  const unreadCount = COACH_MESSAGES.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Fra trener"
        subtitle={`${unreadCount} uleste meldinger`}
        helpText="Meldinger og beskjeder fra din trener. Se viktige oppdateringer, tilbakemeldinger på treninger og planlagte aktiviteter."
      />

      <div className="p-4 px-6 pb-6 w-full">
        {/* Stats */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2.5 mb-6">
          <div className="bg-tier-white rounded-xl p-3.5 text-center">
            <div className="text-[22px] font-bold text-tier-navy">
              {COACH_MESSAGES.length}
            </div>
            <div className="text-[11px] text-tier-text-secondary">Totalt</div>
          </div>
          <div className="bg-tier-white rounded-xl p-3.5 text-center">
            <div className="text-[22px] font-bold text-tier-error">
              {unreadCount}
            </div>
            <div className="text-[11px] text-tier-text-secondary">Uleste</div>
          </div>
          <div className="bg-tier-white rounded-xl p-3.5 text-center">
            <div className="text-[22px] font-bold text-tier-success">
              {COACH_MESSAGES.filter((m) => m.type === 'feedback').length}
            </div>
            <div className="text-[11px] text-tier-text-secondary">Feedbacks</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`py-2 px-3.5 rounded-lg border-none text-[13px] font-medium cursor-pointer whitespace-nowrap transition-colors ${
                filter === f.key
                  ? 'bg-tier-navy text-white'
                  : 'bg-tier-white text-tier-navy hover:bg-tier-surface-base'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex flex-col gap-2.5">
          {filteredMessages.map((message) => (
            <CoachMessageCard
              key={message.id}
              message={message}
              onClick={setSelectedMessage}
            />
          ))}

          {filteredMessages.length === 0 && (
            <StateCard
              variant="empty"
              icon={User}
              title="Ingen meldinger funnet"
              description="Prøv å justere filteret for å se flere meldinger."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FraTrenerContainer;
