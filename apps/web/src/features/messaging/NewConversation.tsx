/**
 * TIER Golf - New Conversation
 * Design System v3.0 - Premium Light
 *
 * Component for starting a new conversation.
 * Allows the player to choose recipient and write first message.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * (except dynamic avatar background colors which require runtime values)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Search,
  X,
} from 'lucide-react';
import Button from '../../ui/primitives/Button';
import { SectionTitle } from '../../components/typography/Headings';

// ============================================================================
// TYPES
// ============================================================================

interface Contact {
  id: string;
  name: string;
  role: 'coach' | 'player' | 'parent';
  avatarInitials: string;
  avatarColor: string;
}

interface NewConversationProps {
  userId?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'coach':
      return 'Coach';
    case 'player':
      return 'Player';
    case 'parent':
      return 'Parent';
    default:
      return '';
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NewConversation({ userId }: NewConversationProps) {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch available contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/v1/messages/contacts');
        if (response.ok) {
          const data = await response.json();
          setContacts(data.contacts || []);
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
        // Mock data for development
        setContacts([
          {
            id: '1',
            name: 'Anders Kristiansen',
            role: 'coach',
            avatarInitials: 'AK',
            avatarColor: 'rgb(var(--status-warning))',
          },
          {
            id: '2',
            name: 'Erik Hansen',
            role: 'coach',
            avatarInitials: 'EH',
            avatarColor: 'var(--tier-navy)',
          },
          {
            id: '3',
            name: 'Lars Olsen',
            role: 'player',
            avatarInitials: 'LO',
            avatarColor: 'rgb(var(--status-success))',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Filter contacts by search
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Send message
  const handleSend = async () => {
    if (!selectedContact || !message.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/v1/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedContact.id,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/meldinger/${data.conversationId}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // For development, navigate to messages
      navigate('/meldinger');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/meldinger')}
          className="flex items-center justify-center w-10 h-10 bg-tier-white border border-tier-border-default rounded-lg cursor-pointer hover:bg-tier-surface-base transition-colors"
        >
          <ArrowLeft size={20} className="text-tier-navy" />
        </button>
        <SectionTitle className="text-[22px] leading-7 font-bold text-tier-navy m-0">
          New message
        </SectionTitle>
      </div>

      {/* Contact selection or message composer */}
      {!selectedContact ? (
        <div className="bg-tier-white rounded-xl border border-tier-border-default overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-tier-surface-base">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-secondary"
              />
              <input
                type="text"
                placeholder="Search for contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 pr-3 pl-10 bg-tier-surface-base border-none rounded-lg text-sm text-tier-navy outline-none focus:ring-2 focus:ring-tier-navy/30"
              />
            </div>
          </div>

          {/* Contact list */}
          {loading ? (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-[3px] border-tier-border-default border-t-tier-navy rounded-full mx-auto animate-spin" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[15px] leading-5 text-tier-text-secondary m-0">
                {searchQuery
                  ? 'No contacts found'
                  : 'No available contacts'}
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className="flex items-center gap-3 w-full py-3.5 px-4 bg-transparent border-none border-b border-tier-surface-base cursor-pointer text-left hover:bg-tier-surface-base transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: contact.avatarColor }}
                >
                  {contact.avatarInitials}
                </div>
                <div className="flex-1">
                  <p className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0 mb-0.5">
                    {contact.name}
                  </p>
                  <p className="text-[13px] leading-[18px] text-tier-text-secondary m-0">
                    {getRoleLabel(contact.role)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="bg-tier-white rounded-xl border border-tier-border-default overflow-hidden">
          {/* Selected contact header */}
          <div className="flex items-center gap-3 p-4 border-b border-tier-surface-base">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: selectedContact.avatarColor }}
            >
              {selectedContact.avatarInitials}
            </div>
            <div className="flex-1">
              <p className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0 mb-0.5">
                {selectedContact.name}
              </p>
              <p className="text-[13px] leading-[18px] text-tier-text-secondary m-0">
                {getRoleLabel(selectedContact.role)}
              </p>
            </div>
            <button
              onClick={() => setSelectedContact(null)}
              className="flex items-center justify-center w-8 h-8 bg-tier-surface-base border-none rounded cursor-pointer hover:bg-tier-border-default transition-colors"
            >
              <X size={16} className="text-tier-text-secondary" />
            </button>
          </div>

          {/* Message composer */}
          <div className="p-4">
            <textarea
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full min-h-[120px] p-3 bg-tier-surface-base border-none rounded-lg text-sm leading-relaxed resize-y outline-none font-[inherit] text-tier-navy focus:ring-2 focus:ring-tier-navy/30"
            />
          </div>

          {/* Send button */}
          <div className="p-4 border-t border-tier-surface-base flex justify-end">
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!message.trim() || sending}
              loading={sending}
              leftIcon={<Send size={16} />}
            >
              {sending ? 'Sending...' : 'Send message'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
