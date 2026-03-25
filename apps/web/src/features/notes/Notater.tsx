/**
 * Notater
 *
 * Archetype: A - List/Index Page
 * Purpose: Training diary and reflections
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * (except dynamic tag colors which require runtime values)
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Tag,
  Edit,
  Trash2,
  Pin,
  Star,
  X,
  Check,
  MoreVertical,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import {
  MoodIcon1,
  MoodIcon2,
  MoodIcon3,
  MoodIcon4,
  MoodIcon5,
  NotesIcon,
  ProfileIcon,
  TeamIcon,
} from '../../components/icons';
import Modal from '../../ui/composites/Modal.composite';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

// ============================================================================
// TYPES
// ============================================================================

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood: number;
  date: string;
  pinned: boolean;
  sharedWithCoach: boolean;
}

interface TagConfig {
  id: string;
  label: string;
  color: string;
}

interface NoteFormState {
  title: string;
  content: string;
  tags: string[];
  mood: number;
}

interface NotaterProps {
  notes?: Note[];
  onCreateNote?: (note: Omit<Note, 'id' | 'date' | 'pinned' | 'sharedWithCoach'>) => Promise<Note>;
  onUpdateNote?: (id: string, note: Note) => Promise<Note>;
  onDeleteNote?: (id: string) => Promise<void>;
  onTogglePin?: (id: string) => Promise<void>;
  onToggleShare?: (id: string) => Promise<void>;
}

// ============================================================================
// ICONS WRAPPER
// ============================================================================

const Icons = {
  Plus: () => <Plus size={16} />,
  Search: () => <Search size={16} />,
  Calendar: () => <Calendar size={14} />,
  Tag: () => <Tag size={14} />,
  MoreVertical: () => <MoreVertical size={16} />,
  Edit: () => <Edit size={14} />,
  Trash: () => <Trash2 size={14} />,
  Pin: () => <Pin size={14} />,
  Star: () => <Star size={14} fill="currentColor" />,
  X: () => <X size={20} />,
  Check: () => <Check size={16} strokeWidth={3} />,
};

// ============================================================================
// UI COMPONENTS
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', padding = true, onClick }) => (
  <div
    className={`bg-tier-white border border-tier-border-default rounded-xl shadow-sm ${padding ? 'p-4' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'mental';
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'sm' }) => {
  const variants: Record<string, string> = {
    neutral: 'bg-gray-100 text-gray-600',
    accent: 'bg-blue-50 text-blue-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700',
    mental: 'bg-gray-200 text-gray-600',
  };

  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-[12px]',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

// ============================================================================
// CONSTANTS
// ============================================================================

const TAGS: TagConfig[] = [
  { id: 'all', label: 'All', color: 'var(--text-secondary)' },
  { id: 'trening', label: 'Training', color: 'var(--status-success)' },
  { id: 'turnering', label: 'Tournament', color: 'var(--achievement)' },
  { id: 'mental', label: 'Mental', color: 'var(--text-secondary)' },
  { id: 'teknikk', label: 'Technical', color: 'var(--accent-light)' },
  { id: 'mål', label: 'Goals', color: 'var(--status-warning)' },
  { id: 'refleksjon', label: 'Reflection', color: 'var(--accent)' },
];

const MOOD_ICONS: Record<number, React.FC<{ size?: number; className?: string; color?: string }>> = {
  1: MoodIcon1,
  2: MoodIcon2,
  3: MoodIcon3,
  4: MoodIcon4,
  5: MoodIcon5,
};

// ============================================================================
// HELPERS
// ============================================================================

const renderMoodIcon = (mood: number, size = 24) => {
  const MoodComponent = MOOD_ICONS[mood];
  return MoodComponent ? <MoodComponent size={size} /> : null;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Notater: React.FC<NotaterProps> = ({
  notes: apiNotes = [],
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
  onToggleShare,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [noteForm, setNoteForm] = useState<NoteFormState>({
    title: '',
    content: '',
    tags: [],
    mood: 4,
  });

  // Auto-save note draft
  useEffect(() => {
    const savedDraft = localStorage.getItem('tier_golf_note_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setNoteForm(parsed);
      } catch (e) {
        console.error('Failed to load note draft:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (noteForm.title || noteForm.content) {
      localStorage.setItem('tier_golf_note_draft', JSON.stringify(noteForm));
    }
  }, [noteForm]);

  const notes = apiNotes;

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Sort: pinned first, then by date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const togglePin = async (id: string) => {
    if (onTogglePin) {
      try {
        await onTogglePin(id);
      } catch (err) {
        console.error('Error toggling pin:', err);
      }
    }
  };

  const deleteNote = async (id: string) => {
    if (onDeleteNote) {
      try {
        await onDeleteNote(id);
        if (selectedNote?.id === id) setSelectedNote(null);
      } catch (err) {
        console.error('Error deleting note:', err);
      }
    }
  };

  const toggleShareWithCoach = async (id: string) => {
    if (onToggleShare) {
      try {
        await onToggleShare(id);
        if (selectedNote?.id === id) {
          setSelectedNote({ ...selectedNote, sharedWithCoach: !selectedNote.sharedWithCoach });
        }
      } catch (err) {
        console.error('Error toggling share:', err);
      }
    }
  };

  const saveNewNote = async () => {
    if (!noteForm.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (onCreateNote) {
      setIsSaving(true);
      try {
        await onCreateNote({
          title: noteForm.title,
          content: noteForm.content,
          tags: noteForm.tags,
          mood: noteForm.mood,
        });
        setNoteForm({ title: '', content: '', tags: [], mood: 4 });
        localStorage.removeItem('tier_golf_note_draft');
        setShowNewNote(false);
      } catch (err) {
        console.error('Error creating note:', err);
        alert('Could not save note. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const saveEditNote = async () => {
    if (!noteForm.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (onUpdateNote && selectedNote) {
      setIsSaving(true);
      try {
        const updated = await onUpdateNote(selectedNote.id, {
          ...selectedNote,
          title: noteForm.title,
          content: noteForm.content,
          tags: noteForm.tags,
          mood: noteForm.mood,
        });
        setSelectedNote(updated);
        localStorage.removeItem('tier_golf_note_draft');
        setIsEditing(false);
      } catch (err) {
        console.error('Error updating note:', err);
        alert('Could not update note. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const startEditNote = (note: Note) => {
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags,
      mood: note.mood,
    });
    setIsEditing(true);
  };

  const toggleTag = (tagId: string) => {
    setNoteForm({
      ...noteForm,
      tags: noteForm.tags.includes(tagId)
        ? noteForm.tags.filter((t) => t !== tagId)
        : [...noteForm.tags, tagId],
    });
  };

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Notes"
        subtitle="Training diary and reflections"
        helpText="Write down reflections, experiences and thoughts from training and tournaments. Tag notes, set mood and share with coach for follow-up."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowNewNote(true)}
          >
            New note
          </Button>
        }
      />

      <div className="p-6 w-full">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-56 flex-shrink-0 space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-secondary">
                <Icons.Search />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-tier-white border border-tier-border-default rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-tier-navy/20"
              />
            </div>

            {/* Tags */}
            <Card padding={false}>
              <div className="p-4 border-b border-tier-border-default">
                <SubSectionTitle className="text-[13px] font-semibold text-tier-navy">
                  Tags
                </SubSectionTitle>
              </div>
              <div className="py-2">
                {TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.id)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${
                      selectedTag === tag.id
                        ? 'bg-tier-navy/5 text-tier-navy'
                        : 'text-tier-navy hover:bg-tier-surface-base'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-[13px]">{tag.label}</span>
                    <span className="ml-auto text-[11px] text-tier-text-secondary">
                      {tag.id === 'all'
                        ? notes.length
                        : notes.filter((n) => n.tags.includes(tag.id)).length}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card>
              <SubSectionTitle className="text-[13px] font-semibold text-tier-navy mb-3">
                Statistics
              </SubSectionTitle>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-tier-text-secondary">Total notes</span>
                  <span className="text-[14px] font-semibold text-tier-navy">
                    {notes.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-tier-text-secondary">This week</span>
                  <span className="text-[14px] font-semibold text-tier-success">
                    {
                      notes.filter((n) => {
                        const noteDate = new Date(n.date);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return noteDate > weekAgo;
                      }).length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-tier-text-secondary">Pinned</span>
                  <span className="text-[14px] font-semibold text-tier-warning">
                    {notes.filter((n) => n.pinned).length}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Notes List */}
          <div className="flex-1">
            {/* Mobile Search */}
            <div className="lg:hidden mb-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-secondary">
                  <Icons.Search />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-tier-white border border-tier-border-default rounded-xl text-[13px] focus:outline-none"
                />
              </div>
            </div>

            {/* Mobile Tags */}
            <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-2">
              {TAGS.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    selectedTag === tag.id
                      ? 'bg-tier-navy text-white'
                      : 'bg-tier-white text-tier-navy border border-tier-border-default'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>

            {/* Notes Count */}
            <p className="text-[13px] text-tier-text-secondary mb-4">{sortedNotes.length} notes</p>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`cursor-pointer hover:shadow-lg transition-all ${
                    note.pinned ? 'ring-2 ring-tier-warning/30' : ''
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {note.pinned && (
                        <span className="text-tier-warning">
                          <Icons.Star />
                        </span>
                      )}
                      {note.sharedWithCoach && (
                        <span className="text-tier-navy" title="Shared with coach">
                          <TeamIcon size={14} />
                        </span>
                      )}
                      <SubSectionTitle className="text-[14px] font-semibold text-tier-navy line-clamp-1">
                        {note.title}
                      </SubSectionTitle>
                    </div>
                    <span className="text-tier-warning">{renderMoodIcon(note.mood, 20)}</span>
                  </div>

                  <p className="text-[12px] text-tier-text-secondary line-clamp-3 mb-3 whitespace-pre-line">
                    {note.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-tier-text-secondary">
                      <Icons.Calendar />
                      <span>{formatDate(note.date)}</span>
                    </div>
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map((tagId) => {
                        const tag = TAGS.find((t) => t.id === tagId);
                        return tag ? (
                          <span
                            key={tagId}
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                            style={{
                              backgroundColor: `${tag.color}15`,
                              color: tag.color,
                            }}
                          >
                            {tag.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {sortedNotes.length === 0 && (
              <div className="text-center py-12">
                <span className="mb-4 block text-tier-text-secondary">
                  <NotesIcon size={48} />
                </span>
                <p className="text-[15px] font-medium text-tier-navy">No notes</p>
                <p className="text-[13px] text-tier-text-secondary">
                  {searchQuery || selectedTag !== 'all'
                    ? 'Try another search or filter'
                    : 'Create your first note'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" padding={false}>
            {/* Modal Header */}
            <div className=" bg-tier-white border-b border-tier-border-default p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-tier-warning">
                  {renderMoodIcon(selectedNote.mood, 28)}
                </span>
                <div>
                  <SectionTitle className="text-[17px] font-bold text-tier-navy">
                    {selectedNote.title}
                  </SectionTitle>
                  <div className="flex items-center gap-2 text-[12px] text-tier-text-secondary">
                    <Icons.Calendar />
                    <span>{formatDate(selectedNote.date)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleShareWithCoach(selectedNote.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedNote.sharedWithCoach
                      ? 'bg-tier-navy/10 text-tier-navy'
                      : 'hover:bg-tier-surface-base text-tier-text-secondary'
                  }`}
                  title={selectedNote.sharedWithCoach ? 'Shared with coach' : 'Share with coach'}
                >
                  {selectedNote.sharedWithCoach ? (
                    <TeamIcon size={16} />
                  ) : (
                    <ProfileIcon size={16} />
                  )}
                </button>
                <button
                  onClick={() => togglePin(selectedNote.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedNote.pinned
                      ? 'bg-tier-warning/10 text-tier-warning'
                      : 'hover:bg-tier-surface-base text-tier-text-secondary'
                  }`}
                >
                  <Icons.Pin />
                </button>
                <button
                  onClick={() => startEditNote(selectedNote)}
                  className="p-2 rounded-lg hover:bg-tier-surface-base text-tier-text-secondary"
                >
                  <Icons.Edit />
                </button>
                <button
                  onClick={() => setNoteToDelete(selectedNote)}
                  className="p-2 rounded-lg hover:bg-tier-error/10 text-tier-error"
                >
                  <Icons.Trash />
                </button>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="p-2 rounded-lg hover:bg-tier-surface-base text-tier-text-secondary"
                >
                  <Icons.X />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Tags */}
              <div className="flex gap-2 mb-4">
                {selectedNote.tags.map((tagId) => {
                  const tag = TAGS.find((t) => t.id === tagId);
                  return tag ? (
                    <Badge key={tagId} variant="neutral" size="md">
                      <span className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.label}
                      </span>
                    </Badge>
                  ) : null;
                })}
              </div>

              {/* Note Content */}
              <div className="prose prose-sm max-w-none">
                <p className="text-[14px] text-tier-navy whitespace-pre-line leading-relaxed">
                  {selectedNote.content}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Note Modal */}
      {isEditing && selectedNote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl" padding={false}>
            <div className="p-4 border-b border-tier-border-default flex items-center justify-between">
              <SectionTitle className="text-[17px] font-bold text-tier-navy">
                Edit note
              </SectionTitle>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-lg hover:bg-tier-surface-base text-tier-text-secondary"
              >
                <Icons.X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[12px] text-tier-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Enter a title..."
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-tier-surface-base border border-tier-border-default rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-tier-navy/20"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-[12px] text-tier-text-secondary mb-1">Content</label>
                <textarea
                  placeholder="Write your thoughts, reflections or notes..."
                  rows={8}
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full px-4 py-3 bg-tier-surface-base border border-tier-border-default rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-tier-navy/20 resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[12px] text-tier-text-secondary mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.filter((t) => t.id !== 'all').map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                        noteForm.tags.includes(tag.id)
                          ? 'bg-tier-navy text-white border-tier-navy'
                          : 'border-tier-border-default hover:bg-tier-surface-base'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: noteForm.tags.includes(tag.id) ? 'white' : tag.color,
                          }}
                        />
                        {tag.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-[12px] text-tier-text-secondary mb-2">Mood</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setNoteForm({ ...noteForm, mood })}
                      className={`hover:scale-110 transition-transform ${
                        noteForm.mood === mood
                          ? 'scale-125 text-tier-warning'
                          : 'opacity-50 text-tier-text-secondary'
                      }`}
                    >
                      {renderMoodIcon(mood, 28)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  leftIcon={<Icons.Check />}
                  onClick={saveEditNote}
                  className="flex-1 justify-center py-3"
                >
                  Save changes
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)} className="px-6 py-3">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* New Note Modal */}
      {showNewNote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl" padding={false}>
            <div className="p-4 border-b border-tier-border-default flex items-center justify-between">
              <SectionTitle className="text-[17px] font-bold text-tier-navy">
                New note
              </SectionTitle>
              <button
                onClick={() => setShowNewNote(false)}
                className="p-2 rounded-lg hover:bg-tier-surface-base text-tier-text-secondary"
              >
                <Icons.X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[12px] text-tier-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Enter a title..."
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-tier-surface-base border border-tier-border-default rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-tier-navy/20"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-[12px] text-tier-text-secondary mb-1">Content</label>
                <textarea
                  placeholder="Write your thoughts, reflections or notes..."
                  rows={8}
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full px-4 py-3 bg-tier-surface-base border border-tier-border-default rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-tier-navy/20 resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[12px] text-tier-text-secondary mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.filter((t) => t.id !== 'all').map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                        noteForm.tags.includes(tag.id)
                          ? 'bg-tier-navy text-white border-tier-navy'
                          : 'border-tier-border-default hover:bg-tier-surface-base'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: noteForm.tags.includes(tag.id) ? 'white' : tag.color,
                          }}
                        />
                        {tag.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-[12px] text-tier-text-secondary mb-2">Mood</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setNoteForm({ ...noteForm, mood })}
                      className={`hover:scale-110 transition-transform ${
                        noteForm.mood === mood
                          ? 'scale-125 text-tier-warning'
                          : 'opacity-50 text-tier-text-secondary'
                      }`}
                    >
                      {renderMoodIcon(mood, 28)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  leftIcon={<Icons.Check />}
                  onClick={saveNewNote}
                  className="flex-1 justify-center py-3"
                >
                  Save note
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowNewNote(false)}
                  className="px-6 py-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Note Confirmation Modal */}
      <Modal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        title="Delete note"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setNoteToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (noteToDelete) {
                  deleteNote(noteToDelete.id);
                  setNoteToDelete(null);
                }
              }}
              className="bg-tier-error hover:bg-tier-error/90"
            >
              Delete note
            </Button>
          </div>
        }
      >
        <p className="text-tier-text-secondary m-0 leading-relaxed">
          Are you sure you want to delete{' '}
          <strong className="text-tier-navy">{noteToDelete?.title}</strong>? This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Notater;
