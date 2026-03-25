/**
 * TIER Golf - Skoleoppgaver Container
 * Design System v3.0 - Premium Light
 *
 * School assignments tracking with subject filtering.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState } from 'react';
import {
  BookOpen, Calendar, Clock, CheckCircle, Circle,
  AlertCircle, FileText
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import Button from '../../ui/primitives/Button';
import { CardTitle } from '../../components/typography';
import StateCard from '../../ui/composites/StateCard';

// ============================================================================
// MOCK DATA
// ============================================================================

const ASSIGNMENTS = [
  {
    id: 'a1',
    title: 'Matematikk - Kapittel 5',
    subject: 'Matematikk',
    type: 'innlevering',
    dueDate: '2025-01-22',
    status: 'pending',
    priority: 'high',
    description: 'Oppgaver fra side 120-125. Husk a vise utregning.',
    attachments: 1,
  },
  {
    id: 'a2',
    title: 'Norsk - Bokrapport',
    subject: 'Norsk',
    type: 'innlevering',
    dueDate: '2025-01-25',
    status: 'in_progress',
    priority: 'medium',
    description: 'Skriv en analyse av boken "Doppler". 1000-1500 ord.',
    attachments: 0,
  },
  {
    id: 'a3',
    title: 'Engelsk - Vocabulary test',
    subject: 'Engelsk',
    type: 'prove',
    dueDate: '2025-01-23',
    status: 'pending',
    priority: 'medium',
    description: 'Prove pa ordforrad fra kapittel 4.',
    attachments: 0,
  },
  {
    id: 'a4',
    title: 'Naturfag - Lab-rapport',
    subject: 'Naturfag',
    type: 'innlevering',
    dueDate: '2025-01-20',
    status: 'pending',
    priority: 'high',
    description: 'Skriv rapport fra forsoket om fotosyntese.',
    attachments: 2,
  },
  {
    id: 'a5',
    title: 'Samfunnsfag - Presentasjon',
    subject: 'Samfunnsfag',
    type: 'presentasjon',
    dueDate: '2025-01-28',
    status: 'pending',
    priority: 'low',
    description: 'Forbered en 10-minutters presentasjon om klimaendringer.',
    attachments: 0,
  },
  {
    id: 'a6',
    title: 'Matematikk - Kapittel 4',
    subject: 'Matematikk',
    type: 'innlevering',
    dueDate: '2025-01-15',
    status: 'completed',
    priority: 'medium',
    description: 'Oppgaver fra side 100-110.',
    attachments: 1,
    grade: '5+',
  },
];

const SUBJECTS = ['Alle', 'Matematikk', 'Norsk', 'Engelsk', 'Naturfag', 'Samfunnsfag'];

// ============================================================================
// HELPERS
// ============================================================================

const getSubjectConfig = (subject) => {
  switch (subject) {
    case 'Matematikk':
      return { colorClasses: { bg: 'bg-tier-navy/15', text: 'text-tier-navy', border: 'border-tier-navy' } };
    case 'Norsk':
      return { colorClasses: { bg: 'bg-tier-error/15', text: 'text-tier-error', border: 'border-tier-error' } };
    case 'Engelsk':
      return { colorClasses: { bg: 'bg-tier-success/15', text: 'text-tier-success', border: 'border-tier-success' } };
    case 'Naturfag':
      return { colorClasses: { bg: 'bg-tier-warning/15', text: 'text-tier-warning', border: 'border-tier-warning' } };
    case 'Samfunnsfag':
      return { colorClasses: { bg: 'bg-amber-500/15', text: 'text-amber-600', border: 'border-amber-500' } };
    default:
      return { colorClasses: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary', border: 'border-tier-border-default' } };
  }
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'completed':
      return { label: 'Fullfort', colorClasses: { text: 'text-tier-success' }, icon: CheckCircle };
    case 'in_progress':
      return { label: 'Pagar', colorClasses: { text: 'text-tier-warning' }, icon: Clock };
    case 'pending':
      return { label: 'Ikke startet', colorClasses: { text: 'text-tier-text-secondary' }, icon: Circle };
    default:
      return { label: status, colorClasses: { text: 'text-tier-text-secondary' }, icon: Circle };
  }
};

const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  return diff;
};

const formatDueDate = (dateStr) => {
  const days = getDaysUntil(dateStr);
  if (days < 0) return 'Forfalt';
  if (days === 0) return 'I dag';
  if (days === 1) return 'I morgen';
  if (days <= 7) return `${days} dager`;
  return new Date(dateStr).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
};

// ============================================================================
// ASSIGNMENT CARD
// ============================================================================

const AssignmentCard = ({ assignment, onClick }) => {
  const subjectConfig = getSubjectConfig(assignment.subject);
  const statusConfig = getStatusConfig(assignment.status);
  const StatusIcon = statusConfig.icon;
  const daysUntil = getDaysUntil(assignment.dueDate);
  const isOverdue = daysUntil < 0 && assignment.status !== 'completed';
  const isUrgent = daysUntil <= 2 && daysUntil >= 0 && assignment.status !== 'completed';

  return (
    <div
      onClick={() => onClick(assignment)}
      className={`bg-tier-white rounded-xl py-3.5 px-4 cursor-pointer transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md border-l-4 ${subjectConfig.colorClasses.border} ${
        assignment.status === 'completed' ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-medium py-0.5 px-1.5 rounded ${subjectConfig.colorClasses.bg} ${subjectConfig.colorClasses.text}`}>
              {assignment.subject}
            </span>
            <span className="text-[10px] font-medium py-0.5 px-1.5 rounded bg-tier-surface-base text-tier-text-secondary">
              {assignment.type}
            </span>
          </div>
          <CardTitle className={`m-0 ${assignment.status === 'completed' ? 'line-through' : ''}`}>
            {assignment.title}
          </CardTitle>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className={`flex items-center gap-1 text-xs font-normal ${
            isOverdue ? 'text-tier-error font-medium' :
            isUrgent ? 'text-tier-warning font-medium' : 'text-tier-text-secondary'
          }`}>
            {isOverdue && <AlertCircle size={12} />}
            <Calendar size={12} />
            {formatDueDate(assignment.dueDate)}
          </div>
          {assignment.grade && (
            <span className="text-xs font-semibold text-tier-success">
              {assignment.grade}
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-tier-text-secondary m-0 mb-2 leading-snug">
        {assignment.description}
      </p>

      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 text-[11px] ${statusConfig.colorClasses.text}`}>
          <StatusIcon size={12} />
          {statusConfig.label}
        </div>
        {assignment.attachments > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-tier-text-secondary">
            <FileText size={12} />
            {assignment.attachments} vedlegg
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SkoleoppgaverContainer = () => {
  const [subjectFilter, setSubjectFilter] = useState('Alle');
  const [statusFilter, setStatusFilter] = useState('active');
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(selectedAssignment?.id === assignment.id ? null : assignment);
  };

  const statusFilters = [
    { key: 'active', label: 'Aktive' },
    { key: 'completed', label: 'Fullforte' },
    { key: 'all', label: 'Alle' },
  ];

  const filteredAssignments = ASSIGNMENTS.filter((a) => {
    const matchesSubject = subjectFilter === 'Alle' || a.subject === subjectFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && a.status !== 'completed') ||
      (statusFilter === 'completed' && a.status === 'completed');
    return matchesSubject && matchesStatus;
  }).sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const stats = {
    total: ASSIGNMENTS.filter((a) => a.status !== 'completed').length,
    urgent: ASSIGNMENTS.filter((a) => {
      const days = getDaysUntil(a.dueDate);
      return days <= 2 && days >= 0 && a.status !== 'completed';
    }).length,
    completed: ASSIGNMENTS.filter((a) => a.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Skoleoppgaver"
        subtitle="Hold oversikt over lekser og innleveringer"
        helpText="Oversikt over alle skoleoppgaver med tidsfrister og status. Filtrer på fag, se prioriterte oppgaver og marker som fullført. Administrer lekser, innleveringer og prøver på ett sted."
      />

      <div className="py-4 px-6 pb-6 max-w-[800px] mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="bg-tier-white rounded-xl p-3.5 text-center">
            <div className="text-2xl font-bold text-tier-navy">
              {stats.total}
            </div>
            <div className="text-[11px] text-tier-text-secondary">Aktive</div>
          </div>
          <div className="bg-tier-white rounded-xl p-3.5 text-center">
            <div className="text-2xl font-bold text-tier-error">
              {stats.urgent}
            </div>
            <div className="text-[11px] text-tier-text-secondary">Haster</div>
          </div>
          <div className="bg-tier-white rounded-xl p-3.5 text-center">
            <div className="text-2xl font-bold text-tier-success">
              {stats.completed}
            </div>
            <div className="text-[11px] text-tier-text-secondary">Fullfort</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1.5">
              {statusFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`py-2 px-3.5 rounded-lg border-none text-[13px] font-medium cursor-pointer transition-colors ${
                    statusFilter === f.key
                      ? 'bg-tier-navy text-white'
                      : 'bg-tier-white text-tier-navy hover:bg-tier-surface-base'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto">
            {SUBJECTS.map((subject) => {
              const subjectConfig = getSubjectConfig(subject);
              const isSelected = subjectFilter === subject;
              return (
                <button
                  key={subject}
                  onClick={() => setSubjectFilter(subject)}
                  className={`py-1.5 px-3 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap transition-colors ${
                    isSelected
                      ? `border-2 ${subjectConfig.colorClasses.border} ${subjectConfig.colorClasses.bg} ${subjectConfig.colorClasses.text}`
                      : 'border border-tier-border-default bg-tier-white text-tier-navy hover:bg-tier-surface-base'
                  }`}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </div>

        {/* Assignments List */}
        <div className="flex flex-col gap-2.5">
          {filteredAssignments.map((assignment) => (
            <React.Fragment key={assignment.id}>
              <AssignmentCard
                assignment={assignment}
                onClick={() => handleAssignmentClick(assignment)}
              />
              {selectedAssignment?.id === assignment.id && (
                <div className={`bg-tier-white rounded-[14px] p-5 -mt-1.5 border-t-[3px] ${getSubjectConfig(assignment.subject).colorClasses.border}`}>
                  <CardTitle className="mb-3">
                    {assignment.title}
                  </CardTitle>
                  <p className="text-sm text-tier-text-secondary mb-4">
                    {assignment.description}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="primary">
                      {assignment.status === 'completed' ? 'Se detaljer' : 'Start oppgave'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedAssignment(null)}
                    >
                      Lukk
                    </Button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          {filteredAssignments.length === 0 && (
            <StateCard
              variant="empty"
              icon={BookOpen}
              title="Ingen oppgaver funnet"
              description="Prøv å justere filteret for å se flere oppgaver."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SkoleoppgaverContainer;
