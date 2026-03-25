/**
 * ShareSessionModal - Del økt med andre spillere
 * Design System v3.0 - Premium Light
 *
 * Based on: APP_FUNCTIONALITY.md Section 12
 *
 * Features:
 * - Friend search/selection
 * - Optional message to recipients
 * - Share as template option (editable by recipient)
 * - Share results option (include your training data)
 * - Multi-recipient support
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useMemo } from 'react';
import Button from '../../ui/primitives/Button';
import { SectionTitle } from '../../components/typography';

// Helper for category color classes
const getCategoryClasses = (category) => {
  const classes = {
    A: 'text-amber-500',
    B: 'text-tier-navy/70',
    C: 'text-tier-success',
    Junior: 'text-tier-warning',
  };
  return classes[category] || 'text-tier-text-secondary';
};

// ============================================================================
// Friend/Player Card Component
// ============================================================================
const FriendCard = ({ friend, selected, onToggle }) => {
  return (
    <button
      onClick={() => onToggle(friend.id)}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer w-full text-left transition-all duration-150 border ${
        selected
          ? 'bg-tier-navy/10 border-tier-navy'
          : 'bg-tier-white border-tier-border-default'
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
          selected
            ? 'border-tier-navy bg-tier-navy'
            : 'border-tier-text-secondary bg-transparent'
        }`}
      >
        {selected && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-tier-surface-base flex items-center justify-center shrink-0">
        <span className="text-base">👤</span>
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="text-[15px] font-semibold text-tier-navy leading-5">
          {friend.name}
        </div>
        <div className="text-[13px] text-tier-text-secondary leading-[18px] flex items-center gap-1.5">
          <span className={`font-medium ${getCategoryClasses(friend.category)}`}>
            {friend.category}-kategori
          </span>
          <span>•</span>
          <span>{friend.club}</span>
        </div>
      </div>
    </button>
  );
};

// ============================================================================
// Session Preview Component
// ============================================================================
const SessionPreview = ({ session }) => {
  return (
    <div className="p-4 bg-tier-surface-base rounded-lg mb-5">
      <div className="text-[17px] font-semibold text-tier-navy mb-1">
        {session.title}
      </div>
      <div className="text-sm text-tier-text-secondary flex items-center gap-2">
        <span>{session.date}</span>
        <span>•</span>
        <span>{session.duration} min</span>
        <span>•</span>
        <span>{session.blockCount} blokker</span>
      </div>
    </div>
  );
};

// ============================================================================
// Checkbox Option Component
// ============================================================================
const CheckboxOption = ({ checked, onChange, label, description }) => {
  return (
    <label className="flex items-start gap-3 cursor-pointer py-2">
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
          checked
            ? 'border-tier-navy bg-tier-navy'
            : 'border-tier-text-secondary bg-transparent'
        }`}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <div>
        <div className="text-[15px] font-medium text-tier-navy leading-5">
          {label}
        </div>
        {description && (
          <div className="text-[13px] text-tier-text-secondary leading-[18px]">
            {description}
          </div>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
};

// ============================================================================
// Main ShareSessionModal Component
// ============================================================================
const ShareSessionModal = ({
  isOpen,
  onClose,
  onShare,
  session = null,
}) => {
  // State
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [shareAsTemplate, setShareAsTemplate] = useState(true);
  const [includeResults, setIncludeResults] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Demo data - replace with API call
  const friends = [
    { id: '1', name: 'Ole Hansen', category: 'B', club: 'Samme klubb' },
    { id: '2', name: 'Kari Nordmann', category: 'B', club: 'Annen klubb' },
    { id: '3', name: 'Erik Svendsen', category: 'C', club: 'Samme klubb' },
    { id: '4', name: 'Lisa Pettersen', category: 'A', club: 'Annen klubb' },
    { id: '5', name: 'Magnus Carlsen', category: 'A', club: 'Samme klubb' },
    { id: '6', name: 'Ingrid Olsen', category: 'Junior', club: 'Annen klubb' },
  ];

  // Demo session data
  const demoSession = session || {
    id: 'session-1',
    title: 'Langspill fokus',
    date: 'Mandag 16. desember',
    duration: 120,
    blockCount: 4,
    blocks: [
      { name: 'Pyramiden', duration: 30 },
      { name: 'Scattered', duration: 30 },
      { name: '9-holes putting', duration: 30 },
      { name: 'Fysisk mobilitet', duration: 30 },
    ],
  };

  // Filter friends by search
  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const query = searchQuery.toLowerCase();
    return friends.filter(
      friend =>
        friend.name.toLowerCase().includes(query) ||
        friend.club.toLowerCase().includes(query) ||
        friend.category.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  // Toggle friend selection
  const toggleFriend = (friendId) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Handle share
  const handleShare = async () => {
    if (selectedFriends.length === 0) return;

    setIsSharing(true);

    const shareData = {
      sessionId: demoSession.id,
      recipientIds: selectedFriends,
      message: message.trim(),
      shareAsTemplate,
      includeResults,
      sharedAt: new Date().toISOString(),
    };

    try {
      if (onShare) {
        await onShare(shareData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to share session:', error);
    } finally {
      setIsSharing(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-[1000]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-tier-white rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-hidden flex flex-col shadow-lg">
        {/* Header */}
        <div className="p-5 border-b border-tier-border-default flex items-center justify-between">
          <SectionTitle>
            Del økt
          </SectionTitle>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-none bg-tier-surface-base cursor-pointer flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-tier-text-secondary" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Session Preview */}
          <SessionPreview session={demoSession} />

          {/* Search */}
          <div className="mb-4">
            <label className="block text-[13px] font-semibold text-tier-text-secondary uppercase tracking-wide mb-2">
              Velg mottakere
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søk etter spiller..."
                className="w-full h-11 pl-10 pr-3 border border-tier-border-default rounded-lg text-[15px] text-tier-navy bg-tier-white outline-none box-border"
              />
            </div>
          </div>

          {/* Friends List */}
          <div className="mb-5">
            <div className="text-xs font-semibold text-tier-text-secondary uppercase tracking-wide mb-3">
              Mine venner
            </div>
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
              {filteredFriends.map(friend => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  selected={selectedFriends.includes(friend.id)}
                  onToggle={toggleFriend}
                />
              ))}
              {filteredFriends.length === 0 && (
                <div className="p-5 text-center text-tier-text-secondary text-sm">
                  Ingen venner funnet
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-tier-text-secondary uppercase tracking-wide mb-2">
              Beskrivelse (valgfritt)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Skriv en melding til mottakerne..."
              rows={3}
              className="w-full p-3 border border-tier-border-default rounded-lg text-[15px] text-tier-navy bg-tier-white outline-none resize-y min-h-[80px] font-sans box-border"
            />
          </div>

          {/* Share Options */}
          <div className="p-4 bg-tier-surface-base rounded-lg">
            <div className="text-[13px] font-semibold text-tier-text-secondary uppercase tracking-wide mb-3">
              Delingsalternativer
            </div>
            <CheckboxOption
              checked={shareAsTemplate}
              onChange={(e) => setShareAsTemplate(e.target.checked)}
              label="Del som mal"
              description="Mottaker kan redigere økten"
            />
            <CheckboxOption
              checked={includeResults}
              onChange={(e) => setIncludeResults(e.target.checked)}
              label="Del resultat"
              description="Inkluder dine data fra økten"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-tier-border-default bg-tier-white">
          <Button
            variant="primary"
            onClick={handleShare}
            disabled={selectedFriends.length === 0 || isSharing}
            loading={isSharing}
            className="w-full h-12 text-[17px] font-semibold"
          >
            {isSharing
              ? 'Deler...'
              : selectedFriends.length === 0
              ? 'Velg mottakere'
              : `Del med ${selectedFriends.length} spiller${selectedFriends.length > 1 ? 'e' : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ReceivedSessionModal - For displaying received shared sessions
// ============================================================================
export const ReceivedSessionModal = ({
  isOpen,
  onClose,
  onAccept,
  onDecline,
  sharedSession = null,
}) => {
  // Demo data
  const demoSharedSession = sharedSession || {
    id: 'shared-1',
    sender: {
      name: 'Per Olsen',
      avatar: null,
    },
    sharedAt: '16. desember 2025, 14:32',
    message: 'Hei! Her er økten jeg brukte i dag. Fungerte veldig bra for innspill. Anbefaler å starte med pyramiden for å varme opp teknikken.',
    session: {
      title: 'Langspill fokus',
      duration: 120,
      blockCount: 4,
      blocks: [
        { name: 'Pyramiden', duration: 30 },
        { name: 'Scattered', duration: 30 },
        { name: '9-holes putting', duration: 30 },
        { name: 'Fysisk mobilitet', duration: 30 },
      ],
    },
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-5 z-[1000]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-tier-white rounded-2xl w-full max-w-[420px] overflow-hidden shadow-lg">
        {/* Header */}
        <div className="p-5 border-b border-tier-border-default">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📩</span>
            <SectionTitle>
              Ny delt økt
            </SectionTitle>
          </div>
          <div className="text-sm text-tier-text-secondary">
            Fra: <span className="font-medium text-tier-navy">{demoSharedSession.sender.name}</span>
          </div>
          <div className="text-[13px] text-tier-text-secondary">
            Delt: {demoSharedSession.sharedAt}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Session Info */}
          <div className="p-4 bg-tier-surface-base rounded-lg mb-4">
            <div className="text-[17px] font-semibold text-tier-navy mb-1">
              {demoSharedSession.session.title}
            </div>
            <div className="text-sm text-tier-text-secondary mb-3">
              {demoSharedSession.session.duration} min • {demoSharedSession.session.blockCount} blokker
            </div>
            <div className="flex flex-col gap-1">
              {demoSharedSession.session.blocks.map((block, index) => (
                <div
                  key={index}
                  className="text-sm text-tier-navy flex items-center gap-2"
                >
                  <span className="text-tier-text-secondary">•</span>
                  <span>Blokk {index + 1}: {block.name} ({block.duration} min)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          {demoSharedSession.message && (
            <div className="mb-5">
              <div className="text-[13px] font-semibold text-tier-text-secondary mb-2">
                Melding fra {demoSharedSession.sender.name}:
              </div>
              <div className="p-3 bg-tier-surface-base rounded-lg text-sm text-tier-navy leading-5 italic">
                "{demoSharedSession.message}"
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => onAccept && onAccept(demoSharedSession)}
              className="w-full h-12 text-[17px] font-semibold"
            >
              Legg til i mine økter
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full h-11 text-[15px] font-semibold"
            >
              Se detaljer
            </Button>
            <Button
              variant="ghost"
              onClick={() => onDecline && onDecline(demoSharedSession)}
              className="w-full h-10 text-sm text-tier-text-secondary"
            >
              Avvis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareSessionModal;
