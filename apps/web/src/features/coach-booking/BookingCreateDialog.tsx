/**
 * Booking Create Dialog
 * Dialog for creating a new booking when clicking on available time slot
 */

import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle } from "../../ui/components/typography";

interface BookingCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BookingFormData) => void;
  date: string;
  startTime: string;
  endTime: string;
}

export interface BookingFormData {
  playerId: string;
  playerName: string;
  sessionType: string;
  duration: number;
  notes: string;
}

// Mock athletes data
const MOCK_ATHLETES = [
  { id: '1', name: 'Anders Hansen' },
  { id: '2', name: 'Sofie Andersen' },
  { id: '3', name: 'Erik Johansen' },
  { id: '4', name: 'Lars Olsen' },
  { id: '5', name: 'Emma Berg' },
];

const SESSION_TYPES = [
  'Individual Session',
  'Video Analysis',
  'On Course',
  'Putting',
  'Short Game',
  'Long Game',
];

export default function BookingCreateDialog({
  isOpen,
  onClose,
  onSave,
  date,
  startTime,
  endTime,
}: BookingCreateDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string } | null>(null);
  const [sessionType, setSessionType] = useState('Individual Session');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const filteredAthletes = MOCK_ATHLETES.filter((athlete) =>
    athlete.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    onSave({
      playerId: selectedPlayer.id,
      playerName: selectedPlayer.name,
      sessionType,
      duration,
      notes,
    });

    // Reset form
    setSelectedPlayer(null);
    setSearchTerm('');
    setSessionType('Individual Session');
    setDuration(60);
    setNotes('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-tier-white rounded-2xl p-6 w-[500px] max-w-[90vw] z-[101] shadow-xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <SubSectionTitle className="m-0">New Booking</SubSectionTitle>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-tier-surface-base border-none flex items-center justify-center cursor-pointer hover:bg-tier-border-default transition-colors"
            >
              <X size={18} className="text-tier-text-secondary" />
            </button>
          </div>

          {/* Date and time display */}
          <div className="mb-5 p-4 bg-tier-navy/5 rounded-xl border border-tier-navy/20">
            <p className="text-sm text-tier-text-secondary m-0 mb-2">Selected Time</p>
            <p className="text-lg font-semibold text-tier-navy m-0">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            <p className="text-sm text-tier-text-secondary mt-1 m-0">
              {startTime} - {endTime}
            </p>
          </div>

          {/* Player selection */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-tier-navy mb-2">
              Select Player *
            </label>

            {selectedPlayer ? (
              <div className="flex items-center justify-between p-3 bg-tier-navy/10 rounded-xl border border-tier-navy/30">
                <span className="text-sm font-medium text-tier-navy">
                  {selectedPlayer.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPlayer(null)}
                  className="text-xs text-tier-navy hover:underline bg-transparent border-none cursor-pointer"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-tier-white rounded-lg border border-tier-border-default mb-2">
                  <Search size={18} className="text-tier-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search for player..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-tier-navy placeholder:text-tier-text-tertiary"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border border-tier-border-default rounded-lg">
                  {filteredAthletes.map((athlete) => (
                    <button
                      key={athlete.id}
                      type="button"
                      onClick={() => setSelectedPlayer(athlete)}
                      className="w-full text-left px-3 py-2 text-sm text-tier-navy hover:bg-tier-surface-base cursor-pointer border-none bg-transparent transition-colors"
                    >
                      {athlete.name}
                    </button>
                  ))}
                  {filteredAthletes.length === 0 && (
                    <p className="px-3 py-4 text-sm text-tier-text-secondary text-center m-0">
                      No players found
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Session type */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-tier-navy mb-2">
              Session Type *
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3 py-2 bg-tier-white border border-tier-border-default rounded-lg text-sm text-tier-navy outline-none focus:border-tier-navy transition-colors"
              required
            >
              {SESSION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-tier-navy mb-2">
              Duration (minutes) *
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-tier-white border border-tier-border-default rounded-lg text-sm text-tier-navy outline-none focus:border-tier-navy transition-colors"
              required
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-tier-navy mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about the session..."
              rows={3}
              className="w-full px-3 py-2 bg-tier-white border border-tier-border-default rounded-lg text-sm text-tier-navy placeholder:text-tier-text-tertiary outline-none focus:border-tier-navy transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedPlayer}
              className="flex-1"
            >
              Save Booking
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
