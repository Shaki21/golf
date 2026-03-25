/**
 * TIER Golf - Coach Notes
 * Design System v3.0 - Premium Light
 *
 * Purpose:
 * - Enable coach to create and view observations
 * - Enforce strict separation from system data
 *
 * Contract references:
 * - COACH_ADMIN_IMPLEMENTATION_CONTRACT.md
 * - COACH_ADMIN_SCREEN_CONTRACT.md
 *
 * NON-NEGOTIABLE:
 * - Notes are SEPARATE from PROOF/TRAJECTORY
 * - Notes are clearly labeled as "Coach Note"
 * - No performance data inline
 * - No read tracking
 * - No engagement metrics
 * - Delivered notes are immutable
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState } from "react";
import { ArrowLeft, StickyNote, Send, CheckCircle } from "lucide-react";
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import { PageTitle, SectionTitle } from '../../components/typography/Headings';

//////////////////////////////
// 1. TYPES
//////////////////////////////

type CoachNote = {
  id: string;
  content: string;
  createdAt: string; // ISO datetime
  delivered: boolean;
};

type Props = {
  athleteId: string;
  athleteName?: string;
  notes?: CoachNote[];
  onAddNote?: (athleteId: string, content: string) => void;
  onBack?: () => void;
};

//////////////////////////////
// 2. MOCK DATA
//////////////////////////////

const MOCK_NOTES: CoachNote[] = [
  {
    id: "n1",
    content: "Focus on keeping your elbow closer to your body in the downswing. This will give you better control.",
    createdAt: "2025-12-18T14:30:00Z",
    delivered: true,
  },
  {
    id: "n2",
    content: "Good progress on putting this week. Continue with the drill we discussed.",
    createdAt: "2025-12-15T10:00:00Z",
    delivered: true,
  },
];

//////////////////////////////
// 3. HELPERS
//////////////////////////////

const sortByDateDesc = (notes: CoachNote[]): CoachNote[] =>
  [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

//////////////////////////////
// 4. COMPONENT
//////////////////////////////

export default function CoachNotes({
  athleteId,
  athleteName = "Player",
  notes: apiNotes,
  onAddNote,
  onBack,
}: Props) {
  const [newNote, setNewNote] = useState("");

  const notes = apiNotes || MOCK_NOTES;
  const sortedNotes = sortByDateDesc(notes);

  const handleSubmit = () => {
    if (!newNote.trim()) return;
    onAddNote?.(athleteId, newNote.trim());
    setNewNote("");
  };

  return (
    <section
      aria-label="Coach notes"
      className="min-h-screen bg-tier-surface-base font-[Inter,-apple-system,BlinkMacSystemFont,system-ui,sans-serif]"
    >
      {/* Header */}
      <div className="bg-tier-white border-b border-tier-border-default py-4 px-6">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => onBack?.()} leftIcon={<ArrowLeft size={18} />}>
            Back
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-tier-navy/10 flex items-center justify-center">
            <StickyNote size={24} className="text-tier-navy" />
          </div>
          <div>
            <PageTitle className="m-0">
              Notes
            </PageTitle>
            <p className="text-[13px] leading-[18px] text-tier-text-secondary m-0 mt-1">
              {athleteName} • {sortedNotes.length} notes
            </p>
          </div>
        </div>
      </div>

      {/* New Note Input */}
      <div className="p-6">
        <Card variant="default" padding="lg" className="mb-6">
          <SectionTitle className="m-0 mb-4">
            New Note
          </SectionTitle>

          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write your observation or feedback..."
            rows={4}
            className="w-full p-3.5 rounded-lg border border-tier-border-default bg-tier-surface-base text-[15px] leading-[22px] text-tier-navy resize-y outline-none box-border focus:border-tier-navy"
          />

          <div className="flex justify-between items-center mt-4">
            <p className="text-[13px] leading-[18px] text-tier-text-secondary m-0">
              The note will appear in the player's "From Your Coach" section
            </p>

            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={!newNote.trim()}
              leftIcon={<Send size={18} />}
            >
              Add Note
            </Button>
          </div>
        </Card>

        {/* Note History */}
        <Card variant="default" padding="none">
          <div className="p-5 border-b border-tier-border-default">
            <SectionTitle className="m-0">
              Previous Notes
            </SectionTitle>
          </div>

          {sortedNotes.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <StickyNote size={40} className="text-tier-text-tertiary mb-3" />
              <p className="text-[15px] leading-[22px] text-tier-text-secondary">
                No notes yet
              </p>
            </div>
          ) : (
            <div>
              {sortedNotes.map((note, index) => (
                <article
                  key={note.id}
                  aria-label="Coach note"
                  className={`p-5 ${index < sortedNotes.length - 1 ? 'border-b border-tier-border-default' : ''}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded bg-tier-navy/10">
                      <StickyNote size={14} className="text-tier-navy" />
                      <span className="text-[13px] leading-[18px] font-semibold text-tier-navy">
                        Coach Note
                      </span>
                    </div>

                    <time
                      dateTime={note.createdAt}
                      className="text-[13px] leading-[18px] text-tier-text-secondary"
                    >
                      {formatDate(note.createdAt)}
                    </time>
                  </div>

                  <p className="text-[15px] leading-relaxed text-tier-navy m-0">
                    {note.content}
                  </p>

                  {note.delivered && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <CheckCircle size={14} className="text-tier-success" />
                      <span className="text-[13px] leading-[18px] text-tier-success">
                        Delivered to player
                      </span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}

//////////////////////////////
// 5. STRICT NOTES
//////////////////////////////

/*
- Do NOT show performance data inline with notes.
- Do NOT show PROOF or TRAJECTORY data here.
- Do NOT allow editing delivered notes.
- Do NOT allow deleting notes from athlete view.
- Do NOT track whether athlete read the note.
- Do NOT show engagement metrics.
- Do NOT attach notes to specific PROOF records.
- Do NOT style notes as system content.
- Notes ALWAYS show "Coach Note" label.
- Notes appear in athlete's "From Your Coach" section ONLY.
*/
