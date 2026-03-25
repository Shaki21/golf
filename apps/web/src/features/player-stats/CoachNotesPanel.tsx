/**
 * CoachNotesPanel - Coach notes integration for test results
 * Design System v3.1 - Tailwind CSS
 *
 * Features:
 * - View all coach notes across tests
 * - Add new notes (coach view)
 * - Filter by note type
 * - Timeline view
 */

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Lightbulb,
  Award,
  Target,
  Eye,
  Send,
  Calendar,
  User,
  ChevronRight,
  Plus,
  X,
  Search,
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import Badge from '../../ui/primitives/Badge.primitive';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import useTestResults, { CoachNote, TestResult } from '../../hooks/useTestResults';

// ============================================================================
// TYPES
// ============================================================================

type NoteType = CoachNote['type'] | 'all';

interface NoteWithTest extends CoachNote {
  test: TestResult;
}

const NOTE_TYPE_CONFIG: Record<CoachNote['type'], {
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}> = {
  observation: {
    label: 'Observasjon',
    icon: <Eye size={14} />,
    colorClass: 'text-tier-text-secondary',
    bgClass: 'bg-tier-surface-subtle',
  },
  recommendation: {
    label: 'Anbefaling',
    icon: <Lightbulb size={14} />,
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-50',
  },
  praise: {
    label: 'Ros',
    icon: <Award size={14} />,
    colorClass: 'text-green-600',
    bgClass: 'bg-green-50',
  },
  focus: {
    label: 'Fokusområde',
    icon: <Target size={14} />,
    colorClass: 'text-tier-gold',
    bgClass: 'bg-indigo-50',
  },
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface NoteTypeFilterProps {
  selected: NoteType;
  onChange: (type: NoteType) => void;
  counts: Record<NoteType, number>;
}

const NoteTypeFilter: React.FC<NoteTypeFilterProps> = ({ selected, onChange, counts }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onChange('all')}
        className={`flex items-center gap-1 px-2 py-1 rounded-md border-none text-xs cursor-pointer whitespace-nowrap transition-colors ${
          selected === 'all'
            ? 'bg-tier-gold text-white'
            : 'bg-transparent text-tier-text-secondary hover:bg-tier-surface-subtle'
        }`}
      >
        Alle ({counts.all})
      </button>
      {(Object.keys(NOTE_TYPE_CONFIG) as CoachNote['type'][]).map(type => {
        const config = NOTE_TYPE_CONFIG[type];
        const isSelected = selected === type;
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md border-none text-xs cursor-pointer whitespace-nowrap transition-colors ${
              isSelected
                ? `${config.bgClass} ${config.colorClass}`
                : 'bg-transparent text-tier-text-secondary hover:bg-tier-surface-subtle'
            }`}
          >
            {config.icon}
            {config.label} ({counts[type] || 0})
          </button>
        );
      })}
    </div>
  );
};

interface NoteCardProps {
  note: NoteWithTest;
  onViewTest?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onViewTest }) => {
  const config = NOTE_TYPE_CONFIG[note.type];

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'I dag';
    if (diffDays === 1) return 'I går';
    if (diffDays < 7) return `${diffDays} dager siden`;

    return date.toLocaleDateString('no-NO', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <Card padding="md" className={`flex flex-col gap-3 ${config.bgClass}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={config.colorClass}>{config.icon}</span>
          <Badge variant="accent" size="sm" className={`${config.bgClass} ${config.colorClass}`}>
            {config.label}
          </Badge>
        </div>
        <span className="text-xs text-tier-text-tertiary">{formatDate(note.createdAt)}</span>
      </div>

      {/* Content */}
      <p className="text-base text-tier-navy leading-relaxed m-0">{note.content}</p>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-tier-text-secondary">
          <div className="w-6 h-6 rounded-full bg-tier-gold text-white flex items-center justify-center">
            <User size={12} />
          </div>
          <span>{note.coachName}</span>
        </div>

        <button
          onClick={onViewTest}
          className="flex items-center gap-1 px-2 py-1 rounded-md border-none bg-white text-xs text-tier-text-secondary cursor-pointer hover:bg-tier-surface-subtle transition-colors"
        >
          <span>{note.test.icon}</span>
          <span>{note.test.name}</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </Card>
  );
};

interface AddNoteFormProps {
  tests: TestResult[];
  onSubmit: (testId: string, note: { content: string; type: CoachNote['type'] }) => void;
  onCancel: () => void;
}

const AddNoteForm: React.FC<AddNoteFormProps> = ({ tests, onSubmit, onCancel }) => {
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<CoachNote['type']>('observation');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTests = useMemo(() => {
    if (!searchQuery) return tests;
    return tests.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tests, searchQuery]);

  const handleSubmit = () => {
    if (!selectedTestId || !content.trim()) return;
    onSubmit(selectedTestId, { content: content.trim(), type });
    setContent('');
    setSelectedTestId('');
  };

  const selectedTest = tests.find(t => t.id === selectedTestId);

  return (
    <Card padding="md" className="flex flex-col gap-4 border-2 border-tier-gold">
      <div className="flex justify-between items-center">
        <SubSectionTitle className="m-0">Ny trenernotat</SubSectionTitle>
        <button
          onClick={onCancel}
          className="flex items-center justify-center w-7 h-7 rounded-full border-none bg-tier-surface-subtle text-tier-text-tertiary cursor-pointer hover:bg-tier-surface-subtle/80 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Test Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-tier-text-secondary">Velg test</label>
        {selectedTest ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg text-base">
            <span>{selectedTest.icon}</span>
            <span>{selectedTest.name}</span>
            <button
              onClick={() => setSelectedTestId('')}
              className="flex items-center justify-center w-5 h-5 rounded-full border-none bg-white text-tier-text-tertiary cursor-pointer ml-auto hover:bg-tier-surface-subtle transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-tier-surface-subtle rounded-lg border border-tier-border-subtle">
            <Search size={14} className="text-tier-text-tertiary" />
            <input
              type="text"
              placeholder="Søk etter test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none bg-transparent text-base outline-none"
            />
          </div>
        )}

        {!selectedTestId && searchQuery && (
          <div className="flex flex-col bg-white border border-tier-border-subtle rounded-lg shadow-md overflow-hidden">
            {filteredTests.slice(0, 5).map(test => (
              <button
                key={test.id}
                onClick={() => {
                  setSelectedTestId(test.id);
                  setSearchQuery('');
                }}
                className="flex items-center gap-2 px-3 py-2 border-none bg-transparent text-left text-sm cursor-pointer hover:bg-tier-surface-subtle transition-colors"
              >
                <span>{test.icon}</span>
                <span>{test.name}</span>
                <Badge variant="accent" size="sm">{test.category}</Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Note Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-tier-text-secondary">Type</label>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(NOTE_TYPE_CONFIG) as CoachNote['type'][]).map(noteType => {
            const config = NOTE_TYPE_CONFIG[noteType];
            const isSelected = type === noteType;
            return (
              <button
                key={noteType}
                onClick={() => setType(noteType)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? `${config.bgClass} ${config.colorClass} border-current`
                    : 'bg-transparent text-tier-text-secondary border-tier-border-subtle hover:bg-tier-surface-subtle'
                }`}
              >
                {config.icon}
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-tier-text-secondary">Notat</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Skriv din kommentar til spilleren..."
          className="p-3 rounded-lg border border-tier-border-subtle text-base resize-y font-inherit min-h-[80px] focus:outline-none focus:ring-2 focus:ring-tier-gold/50"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Avbryt
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!selectedTestId || !content.trim()}
        >
          <Send size={14} />
          Send notat
        </Button>
      </div>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface CoachNotesPanelProps {
  isCoachView?: boolean;
  onViewTestDetails?: (testId: string) => void;
}

const CoachNotesPanel: React.FC<CoachNotesPanelProps> = ({
  isCoachView = false,
  onViewTestDetails,
}) => {
  const { tests, loading, addCoachNote } = useTestResults();
  const [typeFilter, setTypeFilter] = useState<NoteType>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Collect all notes with their test info
  const allNotes: NoteWithTest[] = useMemo(() => {
    return tests
      .flatMap(test =>
        test.coachNotes.map(note => ({
          ...note,
          test,
        }))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tests]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    if (typeFilter === 'all') return allNotes;
    return allNotes.filter(n => n.type === typeFilter);
  }, [allNotes, typeFilter]);

  // Count by type
  const counts = useMemo(() => {
    const result: Record<NoteType, number> = {
      all: allNotes.length,
      observation: 0,
      recommendation: 0,
      praise: 0,
      focus: 0,
    };

    allNotes.forEach(note => {
      result[note.type]++;
    });

    return result;
  }, [allNotes]);

  const handleAddNote = async (testId: string, note: { content: string; type: CoachNote['type'] }) => {
    try {
      await addCoachNote(testId, {
        testResultId: testId,
        coachId: 'current-coach', // Would come from auth context
        coachName: 'Erik Hansen', // Would come from auth context
        content: note.content,
        type: note.type,
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  if (loading) {
    return (
      <Card padding="spacious">
        <div className="flex items-center justify-center p-8 text-tier-text-tertiary">
          Laster trenernotater...
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-tier-gold" />
          <SectionTitle className="m-0">Trenernotater</SectionTitle>
          <Badge variant="accent" size="sm">{allNotes.length}</Badge>
        </div>

        {isCoachView && !showAddForm && (
          <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus size={14} />
            Ny notat
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      {showAddForm && (
        <AddNoteForm
          tests={tests}
          onSubmit={handleAddNote}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Filters */}
      <NoteTypeFilter
        selected={typeFilter}
        onChange={setTypeFilter}
        counts={counts}
      />

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onViewTest={() => onViewTestDetails?.(note.test.id)}
            />
          ))}
        </div>
      ) : (
        <Card padding="spacious">
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-tier-text-tertiary text-center">
            <MessageSquare size={32} className="text-tier-text-tertiary" />
            <p>Ingen notater{typeFilter !== 'all' ? ` av type "${NOTE_TYPE_CONFIG[typeFilter as CoachNote['type']].label}"` : ''}</p>
            {isCoachView && (
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(true)}>
                <Plus size={14} />
                Legg til første notat
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      {allNotes.length > 0 && (
        <Card padding="md" className="bg-tier-surface-subtle">
          <SubSectionTitle className="m-0 mb-3">Oppsummering</SubSectionTitle>
          <div className="grid grid-cols-4 gap-3">
            {(Object.keys(NOTE_TYPE_CONFIG) as CoachNote['type'][]).map(type => {
              const config = NOTE_TYPE_CONFIG[type];
              return (
                <div key={type} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bgClass} ${config.colorClass}`}>
                    {config.icon}
                  </div>
                  <span className="text-lg font-bold text-tier-navy">{counts[type]}</span>
                  <span className="text-[10px] text-tier-text-tertiary text-center">{config.label}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CoachNotesPanel;
