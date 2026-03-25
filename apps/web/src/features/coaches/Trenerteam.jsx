/**
 * TIER Golf - Trenerteam Screen
 * Design System v3.0 - Premium Light
 *
 * IUP App - Individuell Utviklingsplan
 * Shows the player's coaching team with contact info,
 * upcoming sessions, and messaging.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState } from 'react';
import { Calendar, BarChart3, Star } from 'lucide-react';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import Badge from '../../ui/primitives/Badge.primitive';

// =====================================================
// UI KOMPONENTER
// =====================================================

const Avatar = ({ name, size = 'md', role }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  const getRoleClasses = (roleType) => {
    switch (roleType) {
      case 'head_coach': return 'bg-tier-navy';
      case 'technical': return 'bg-tier-navy/80';
      case 'physical': return 'bg-tier-success';
      case 'mental': return 'bg-amber-500';
      case 'strategy': return 'bg-tier-warning';
      default: return 'bg-tier-navy';
    }
  };

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className={`${sizes[size]} ${getRoleClasses(role)} rounded-full flex items-center justify-center font-semibold text-white`}>
      {initials}
    </div>
  );
};

// =====================================================
// SPESIALISERTE KOMPONENTER
// =====================================================

const TrainerCard = ({ trainer, isSelected, onSelect }) => {
  const roleLabels = {
    head_coach: 'Head Coach',
    technical: 'Technical Coach',
    physical: 'Physical Coach',
    mental: 'Mental Coach',
    strategy: 'Strategy Advisor'
  };

  return (
    <Card
      className={`p-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-tier-navy border-tier-navy' : 'hover:shadow-md'}`}
      onClick={() => onSelect(trainer.id)}
    >
      <div className="flex items-start gap-4">
        <Avatar name={trainer.name} size="lg" role={trainer.role} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <SubSectionTitle className="font-semibold text-base text-tier-navy m-0">
                {trainer.name}
              </SubSectionTitle>
              <p className="text-sm text-tier-text-secondary m-0">
                {roleLabels[trainer.role]}
              </p>
            </div>

            {trainer.isPrimary && (
              <Badge variant="warning">Primary</Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {trainer.specializations.map((spec, idx) => (
              <Badge key={idx} variant="primary">{spec}</Badge>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-tier-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Since {trainer.startYear}</span>
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              <span>{trainer.sessionsTotal} sessions</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const TrainerDetail = ({ trainer, onClose, onMessage, onSchedule }) => {
  const roleLabels = {
    head_coach: 'Head Coach',
    technical: 'Technical Coach',
    physical: 'Physical Coach',
    mental: 'Mental Coach',
    strategy: 'Strategy Advisor'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="p-6 text-center border-b border-tier-border-default">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-2xl text-tier-text-secondary bg-transparent border-none cursor-pointer"
          >
            ×
          </button>

          <Avatar name={trainer.name} size="xl" role={trainer.role} />

          <SectionTitle className="font-bold text-xl mt-4 text-tier-navy m-0">
            {trainer.name}
          </SectionTitle>
          <p className="text-tier-text-secondary m-0">{roleLabels[trainer.role]}</p>

          {trainer.isPrimary && (
            <Badge variant="warning" className="mt-2">Primary contact</Badge>
          )}
        </div>

        {/* Info */}
        <div className="p-6 space-y-6">
          {/* Contact */}
          <div>
            <CardTitle className="font-medium text-sm mb-3 text-tier-navy m-0">
              Contact info
            </CardTitle>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span>📧</span>
                <a href={`mailto:${trainer.email}`} className="text-tier-navy">
                  {trainer.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span>📱</span>
                <a href={`tel:${trainer.phone}`} className="text-tier-navy">
                  {trainer.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div>
            <CardTitle className="font-medium text-sm mb-3 text-tier-navy m-0">
              Specializations
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {trainer.specializations.map((spec, idx) => (
                <Badge key={idx} variant="primary">{spec}</Badge>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <CardTitle className="font-medium text-sm mb-3 text-tier-navy m-0">
              Certifications
            </CardTitle>
            <div className="space-y-2">
              {trainer.certifications.map((cert, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-tier-text-secondary">
                  <span className="text-tier-success">✓</span>
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <CardTitle className="font-medium text-sm mb-3 text-tier-navy m-0">
              About the coach
            </CardTitle>
            <p className="text-sm leading-relaxed text-tier-text-secondary m-0">
              {trainer.bio}
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-tier-surface-base">
              <div className="font-bold text-lg text-tier-navy">
                {trainer.sessionsTotal}
              </div>
              <div className="text-xs text-tier-text-secondary">Total sessions</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-tier-surface-base">
              <div className="font-bold text-lg text-tier-navy">
                {trainer.sessionsMonth}
              </div>
              <div className="text-xs text-tier-text-secondary">This month</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-tier-surface-base">
              <div className="font-bold text-lg text-tier-navy">
                {trainer.startYear}
              </div>
              <div className="text-xs text-tier-text-secondary">Since year</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="primary" onClick={onMessage} className="flex-1">
              <span>💬</span> Send message
            </Button>
            <Button variant="secondary" onClick={onSchedule} className="flex-1">
              <span>📅</span> Book session
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const UpcomingSession = ({ session }) => {
  const getTypeClasses = (type) => {
    switch (type) {
      case 'technical': return 'bg-tier-navy/80';
      case 'physical': return 'bg-tier-success';
      case 'mental': return 'bg-amber-500';
      case 'strategy': return 'bg-tier-warning';
      case 'evaluation': return 'bg-tier-navy';
      default: return 'bg-tier-navy';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-tier-surface-base">
      <div className={`w-1 h-12 rounded-full ${getTypeClasses(session.type)}`} />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <CardTitle className="font-medium text-sm text-tier-navy m-0">
            {session.title}
          </CardTitle>
          <span className="text-xs text-tier-text-secondary">
            {session.duration} min
          </span>
        </div>
        <p className="text-xs mt-1 text-tier-text-secondary m-0">
          with {session.trainer}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-tier-navy">
            {session.date} • {session.time}
          </span>
        </div>
      </div>

      <Button variant="ghost" size="sm">→</Button>
    </div>
  );
};

const MessagePreview = ({ message, onView }) => (
  <div
    className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-tier-surface-base transition-all"
    onClick={onView}
  >
    <Avatar name={message.from} size="sm" role={message.role} />

    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <CardTitle className="font-medium text-sm truncate text-tier-navy m-0">
          {message.from}
        </CardTitle>
        <span className="text-xs text-tier-text-secondary">
          {message.time}
        </span>
      </div>
      <p className={`text-xs truncate mt-0.5 m-0 ${message.unread ? 'text-tier-navy' : 'text-tier-text-secondary'}`}>
        {message.preview}
      </p>
    </div>

    {message.unread && (
      <div className="w-2 h-2 rounded-full mt-2 bg-tier-navy" />
    )}
  </div>
);

// =====================================================
// HOVEDKOMPONENT
// =====================================================

const Trenerteam = ({ trainers: apiTrainers = null, sessions: apiSessions = null, messages: apiMessages = null }) => {
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('team');

  // Default trainers data (fallback if no API data)
  const defaultTrainers = [
    {
      id: 1,
      name: 'Magnus Andersen',
      role: 'head_coach',
      isPrimary: true,
      email: 'magnus@akgolf.no',
      phone: '+47 900 12 345',
      specializations: ['Langspill', 'Strategi', 'Turnering'],
      certifications: ['PGA Coach Level 3', 'Team Norway Sertifisert', 'TPI Level 2'],
      startYear: 2022,
      sessionsTotal: 156,
      sessionsMonth: 8,
      bio: 'Magnus har vært profesjonell golftrener i over 15 år og har trent flere spillere til Team Norway. Spesialisert på langspill og turneringsforberedelse.'
    },
    {
      id: 2,
      name: 'Line Eriksen',
      role: 'technical',
      isPrimary: false,
      email: 'line@akgolf.no',
      phone: '+47 900 23 456',
      specializations: ['Shortgame', 'Putting', 'Innspill'],
      certifications: ['PGA Coach Level 2', 'Trackman Certified', 'SAM PuttLab'],
      startYear: 2023,
      sessionsTotal: 67,
      sessionsMonth: 6,
      bio: 'Line er ekspert på shortgame og putting-analyse. Bruker Trackman og SAM PuttLab for detaljert analyse og forbedring.'
    },
    {
      id: 3,
      name: 'Erik Haugen',
      role: 'physical',
      isPrimary: false,
      email: 'erik@akgolf.no',
      phone: '+47 900 34 567',
      specializations: ['Styrke', 'Mobilitet', 'Rotasjonskraft'],
      certifications: ['TPI Level 3', 'NSCA-CSCS', 'Fysioterapeut'],
      startYear: 2023,
      sessionsTotal: 45,
      sessionsMonth: 4,
      bio: 'Erik kombinerer fysioterapi-bakgrunn med golfspesifikk trening. Fokus på å bygge en sterk og mobil kropp for optimal sving.'
    },
    {
      id: 4,
      name: 'Kristin Berg',
      role: 'mental',
      isPrimary: false,
      email: 'kristin@akgolf.no',
      phone: '+47 900 45 678',
      specializations: ['Mental styrke', 'Fokus', 'Turneringspress'],
      certifications: ['Idrettspsykolog', 'Mental Trener NGF', 'Mindfulness Instructor'],
      startYear: 2024,
      sessionsTotal: 23,
      sessionsMonth: 3,
      bio: 'Kristin er utdannet idrettspsykolog og jobber med mental forberedelse, fokusteknikker og håndtering av konkurransepress.'
    }
  ];

  const trainers = apiTrainers || defaultTrainers;

  const defaultSessions = [
    { id: 1, title: 'Driving Range - Langspill', trainer: 'Magnus Andersen', type: 'teknisk', date: 'Mandag 16. des', time: '14:00', duration: 60 },
    { id: 2, title: 'Putting Lab', trainer: 'Line Eriksen', type: 'teknisk', date: 'Onsdag 18. des', time: '10:00', duration: 45 },
    { id: 3, title: 'Styrketrening', trainer: 'Erik Haugen', type: 'fysisk', date: 'Torsdag 19. des', time: '08:00', duration: 60 },
    { id: 4, title: 'Mental forberedelse - Turnering', trainer: 'Kristin Berg', type: 'mental', date: 'Fredag 20. des', time: '16:00', duration: 30 }
  ];

  const upcomingSessions = apiSessions || defaultSessions;

  const defaultMessages = [
    { id: 1, from: 'Magnus Andersen', role: 'head_coach', preview: 'Flott økt i dag! Husk å jobbe med...', time: 'I dag', unread: true },
    { id: 2, from: 'Line Eriksen', role: 'technical', preview: 'Analyse fra putting-økten er klar', time: 'I går', unread: true },
    { id: 3, from: 'Erik Haugen', role: 'physical', preview: 'Nytt treningsprogram lagt til i appen', time: 'Tir', unread: false }
  ];

  const messages = apiMessages || defaultMessages;
  const selectedTrainerData = trainers.find(t => t.id === selectedTrainer);

  const handleSelectTrainer = (id) => {
    setSelectedTrainer(id);
    setShowDetail(true);
  };

  const tabs = [
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'schedule', label: 'Sessions', icon: '📅' },
    { id: 'messages', label: 'Messages', icon: '💬' }
  ];

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex gap-2 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border-none cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'bg-tier-navy text-white'
                  : 'bg-tier-white text-tier-navy'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'messages' && messages.filter(m => m.unread).length > 0 && (
                <span className="w-5 h-5 rounded-full text-[11px] flex items-center justify-center text-white bg-tier-error">
                  {messages.filter(m => m.unread).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        <div className="flex flex-col gap-4">
          {/* Team Tab */}
          {activeTab === 'team' && (
            <>
              {/* Primary coach highlight */}
              <Card className="p-4 bg-amber-500/[0.06] border-amber-500">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-5 h-5 text-tier-gold fill-tier-gold" />
                  <span className="font-medium text-sm text-tier-navy">
                    Your primary contact
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar name={trainers[0].name} size="lg" role={trainers[0].role} />
                  <div className="flex-1">
                    <SubSectionTitle className="font-semibold text-tier-navy m-0">
                      {trainers[0].name}
                    </SubSectionTitle>
                    <p className="text-sm text-tier-text-secondary m-0">
                      Head Coach • {trainers[0].sessionsTotal} sessions together
                    </p>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => handleSelectTrainer(trainers[0].id)}>
                    Contact
                  </Button>
                </div>
              </Card>

              {/* All coaches */}
              <div>
                <SubSectionTitle className="font-semibold text-sm mb-3 px-1 text-tier-navy m-0">
                  Full team
                </SubSectionTitle>
                <div className="space-y-3">
                  {trainers.map(trainer => (
                    <TrainerCard
                      key={trainer.id}
                      trainer={trainer}
                      isSelected={selectedTrainer === trainer.id}
                      onSelect={handleSelectTrainer}
                    />
                  ))}
                </div>
              </div>

              {/* Team statistics */}
              <Card className="p-4">
                <SubSectionTitle className="font-semibold text-sm mb-4 text-tier-navy m-0">
                  Team statistics
                </SubSectionTitle>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-tier-navy">
                      {trainers.reduce((sum, t) => sum + t.sessionsTotal, 0)}
                    </div>
                    <div className="text-xs mt-1 text-tier-text-secondary">Total sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-tier-navy">
                      {trainers.reduce((sum, t) => sum + t.sessionsMonth, 0)}
                    </div>
                    <div className="text-xs mt-1 text-tier-text-secondary">This month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-tier-navy">
                      {trainers.length}
                    </div>
                    <div className="text-xs mt-1 text-tier-text-secondary">Specialists</div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <SubSectionTitle className="font-semibold text-sm text-tier-navy m-0">
                  Upcoming sessions with coaches
                </SubSectionTitle>
                <Button variant="ghost" size="sm">See all</Button>
              </div>

              <div className="space-y-3">
                {upcomingSessions.map(session => (
                  <UpcomingSession key={session.id} session={session} />
                ))}
              </div>

              {/* Book new session */}
              <Card className="p-4 mt-4">
                <SubSectionTitle className="font-semibold text-sm mb-3 text-tier-navy m-0">
                  Book new session
                </SubSectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  {trainers.map(trainer => (
                    <button
                      key={trainer.id}
                      className="flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:shadow-md bg-tier-surface-base border-none cursor-pointer"
                    >
                      <Avatar name={trainer.name} size="sm" role={trainer.role} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate text-tier-navy">
                          {trainer.name.split(' ')[0]}
                        </div>
                        <div className="text-xs capitalize text-tier-text-secondary">
                          {trainer.role}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <SubSectionTitle className="font-semibold text-sm text-tier-navy m-0">
                  Messages
                </SubSectionTitle>
                <Button variant="primary" size="sm">
                  ✏️ New message
                </Button>
              </div>

              <Card className="divide-y divide-tier-border-default">
                {messages.map(message => (
                  <MessagePreview
                    key={message.id}
                    message={message}
                    onView={() => {}}
                  />
                ))}
              </Card>

              {messages.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-4xl">💬</span>
                  <p className="mt-4 text-sm text-tier-text-secondary">
                    No messages yet
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Trainer Detail Modal */}
      {showDetail && selectedTrainerData && (
        <TrainerDetail
          trainer={selectedTrainerData}
          onClose={() => setShowDetail(false)}
          onMessage={() => {
            setShowDetail(false);
            setActiveTab('messages');
          }}
          onSchedule={() => {
            setShowDetail(false);
            setActiveTab('schedule');
          }}
        />
      )}
    </div>
  );
};

export default Trenerteam;
