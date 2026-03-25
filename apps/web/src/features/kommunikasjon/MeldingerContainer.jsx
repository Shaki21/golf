/**
 * TIER Golf - Meldinger Container
 * Design System v3.0 - Premium Light
 *
 * Messaging system with conversations and chat view.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  MessageSquare, Search, Plus, ChevronRight, Check,
  CheckCheck, Clock, Send, Paperclip, User, Loader2
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SubSectionTitle, CardTitle } from '../../components/typography';
import { conversationsAPI } from '../../services/api';

// ============================================================================
// MOCK DATA
// ============================================================================

const CONVERSATIONS = [
  {
    id: 'c1',
    contact: {
      name: 'Anders Kristiansen',
      role: 'Hovedtrener',
      avatar: null,
    },
    lastMessage: 'Bra jobba pa treningen i dag! Husk a fokusere pa tempoet til neste gang.',
    timestamp: '2025-01-18T14:30:00',
    unread: 2,
    isOnline: true,
  },
  {
    id: 'c2',
    contact: {
      name: 'Maria Hansen',
      role: 'Kortspill-trener',
      avatar: null,
    },
    lastMessage: 'Kan vi flytte treningstimen pa onsdag til 14:00?',
    timestamp: '2025-01-17T10:15:00',
    unread: 0,
    isOnline: false,
  },
  {
    id: 'c3',
    contact: {
      name: 'Erik Olsen',
      role: 'Fysisk trener',
      avatar: null,
    },
    lastMessage: 'Ny PR i squat! 100 kg!',
    timestamp: '2025-01-15T16:45:00',
    unread: 0,
    isOnline: true,
  },
  {
    id: 'c4',
    contact: {
      name: 'NGF Junior',
      role: 'Administrasjon',
      avatar: null,
    },
    lastMessage: 'Pakmelding til Junior Masters er bekreftet.',
    timestamp: '2025-01-12T09:00:00',
    unread: 0,
    isOnline: false,
  },
];

const MESSAGES = {
  'c1': [
    {
      id: 'm1',
      sender: 'coach',
      text: 'Hei! Hvordan gikk treningen i dag?',
      timestamp: '2025-01-18T13:00:00',
      read: true,
    },
    {
      id: 'm2',
      sender: 'player',
      text: 'Det gikk veldig bra! Tempoet begynner virkelig a sitte na.',
      timestamp: '2025-01-18T13:15:00',
      read: true,
    },
    {
      id: 'm3',
      sender: 'coach',
      text: 'Bra jobba pa treningen i dag! Husk a fokusere pa tempoet til neste gang.',
      timestamp: '2025-01-18T14:30:00',
      read: false,
    },
    {
      id: 'm4',
      sender: 'coach',
      text: 'Jeg har lagt ut noen nye ovelser i treningsplanen din. Ta en titt nar du har tid.',
      timestamp: '2025-01-18T14:32:00',
      read: false,
    },
  ],
};

// ============================================================================
// CONVERSATION CARD
// ============================================================================

const ConversationCard = ({ conversation, selected, onClick }) => {
  const { contact, lastMessage, timestamp, unread, isOnline } = conversation;
  const time = new Date(timestamp);
  const isToday = time.toDateString() === new Date().toDateString();
  const timeStr = isToday
    ? time.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
    : time.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });

  return (
    <div
      onClick={() => onClick(conversation)}
      className={`flex items-center gap-3 py-3 px-3.5 rounded-xl cursor-pointer transition-all ${
        selected
          ? 'bg-tier-navy/10 border-l-[3px] border-l-tier-navy'
          : 'bg-tier-white border-l-[3px] border-l-transparent hover:bg-tier-surface-base'
      }`}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-tier-navy flex items-center justify-center text-white text-base font-semibold">
          {contact.name.split(' ').map((n) => n[0]).join('')}
        </div>
        {isOnline && (
          <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-tier-success border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <CardTitle className="text-sm font-semibold text-tier-navy m-0">
            {contact.name}
          </CardTitle>
          <span className="text-[11px] text-tier-text-secondary">
            {timeStr}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-[13px] m-0 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] ${
            unread > 0 ? 'text-tier-navy font-medium' : 'text-tier-text-secondary font-normal'
          }`}>
            {lastMessage}
          </p>
          {unread > 0 && (
            <div className="min-w-[20px] h-5 rounded-[10px] bg-tier-navy text-white text-[11px] font-semibold flex items-center justify-center px-1.5">
              {unread}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MESSAGE BUBBLE
// ============================================================================

const MessageBubble = ({ message, isOwn }) => {
  const time = new Date(message.timestamp);

  return (
    <div className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] py-2.5 px-3.5 shadow-sm ${
        isOwn
          ? 'bg-tier-navy text-white rounded-[16px_16px_4px_16px]'
          : 'bg-tier-white text-tier-navy rounded-[16px_16px_16px_4px]'
      }`}>
        <p className="text-sm m-0 leading-snug">
          {message.text}
        </p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={`text-[10px] ${isOwn ? 'text-white/70' : 'text-tier-text-secondary'}`}>
            {time.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isOwn && (
            message.read ? (
              <CheckCheck size={12} className="text-white/70" />
            ) : (
              <Check size={12} className="text-white/70" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CHAT VIEW
// ============================================================================

const ChatView = ({ conversation, messages, onMessageSent, isLoading }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation) return;

    setIsSending(true);
    try {
      await conversationsAPI.sendMessage(conversation.id, newMessage.trim());
      setNewMessage('');
      toast.success('Melding sendt!');
      if (onMessageSent) onMessageSent();
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Kunne ikke sende melding. Prøv igjen.');
    } finally {
      setIsSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-tier-surface-base rounded-[14px]">
        <MessageSquare size={48} className="text-tier-text-secondary mb-3" />
        <p className="text-sm text-tier-text-secondary">
          Velg en samtale for a starte
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-tier-surface-base rounded-[14px] overflow-hidden">
      {/* Header */}
      <div className="py-3.5 px-4 bg-tier-white border-b border-tier-border-default flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-tier-navy flex items-center justify-center text-white text-sm font-semibold">
          {conversation.contact.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div>
          <SubSectionTitle className="text-[15px] font-semibold text-tier-navy m-0">
            {conversation.contact.name}
          </SubSectionTitle>
          <p className={`text-xs m-0 ${conversation.isOnline ? 'text-tier-success' : 'text-tier-text-secondary'}`}>
            {conversation.isOnline ? 'Online' : conversation.contact.role}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center p-5">
            <Loader2 size={24} className="text-tier-navy animate-spin" />
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender === 'player'}
            />
          ))
        )}
      </div>

      {/* Input */}
      <div className="py-3 px-4 bg-tier-white border-t border-tier-border-default flex items-center gap-2.5">
        <button className="p-2 rounded-lg border-none bg-transparent cursor-pointer">
          <Paperclip size={20} className="text-tier-text-secondary" />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Skriv en melding..."
          className="flex-1 py-2.5 px-3.5 rounded-[20px] border border-tier-border-default text-sm outline-none bg-tier-white text-tier-navy focus:border-tier-navy"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          className={`p-2.5 rounded-full border-none cursor-pointer transition-opacity ${
            newMessage.trim() && !isSending
              ? 'bg-tier-navy'
              : 'bg-tier-border-default cursor-not-allowed'
          } ${isSending ? 'opacity-70' : 'opacity-100'}`}
        >
          <Send size={18} className={newMessage.trim() && !isSending ? 'text-white' : 'text-tier-text-secondary'} />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const MeldingerContainer = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const response = await conversationsAPI.getAll();
        if (response?.data?.conversations && Array.isArray(response.data.conversations)) {
          // Transform API data to match component format
          const apiConversations = response.data.conversations.map(conv => ({
            id: conv.id,
            contact: {
              id: conv.participants.find(p => p.id !== localStorage.getItem('userId'))?.id,
              name: conv.name || 'Unknown',
              role: conv.participants[0]?.role || 'coach',
              avatar: conv.participants[0]?.avatar,
            },
            lastMessage: conv.lastMessage?.content || '',
            timestamp: conv.lastMessage?.sentAt || conv.updatedAt,
            unread: conv.unreadCount || 0,
            isOnline: false, // WebSocket status would update this
          }));
          setConversations(apiConversations.length > 0 ? apiConversations : CONVERSATIONS);
        } else {
          setConversations(CONVERSATIONS);
        }
      } catch (err) {
        console.warn('Failed to fetch conversations, using mock data:', err);
        toast.error('Kunne ikke laste samtaler. Viser testdata.');
        setConversations(CONVERSATIONS);
        setMessages(MESSAGES);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      // Check if we already have messages for this conversation
      if (messages[selectedConversation.id]) return;

      setLoadingMessages(true);
      try {
        const response = await conversationsAPI.getById(selectedConversation.id);
        if (response?.data?.messages && Array.isArray(response.data.messages)) {
          const userId = localStorage.getItem('userId');
          const apiMessages = response.data.messages.map(msg => ({
            id: msg.id,
            sender: msg.senderId === userId ? 'player' : 'coach',
            text: msg.content,
            timestamp: msg.createdAt,
            read: msg.readBy?.some(r => r.userId !== msg.senderId),
          }));
          setMessages(prev => ({
            ...prev,
            [selectedConversation.id]: apiMessages,
          }));
        } else if (!messages[selectedConversation.id]) {
          // Use mock data as fallback
          setMessages(prev => ({
            ...prev,
            [selectedConversation.id]: MESSAGES[selectedConversation.id] || [],
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch messages, using mock data:', err);
        toast.error('Kunne ikke laste meldinger. Viser testdata.');
        if (!messages[selectedConversation.id]) {
          setMessages(prev => ({
            ...prev,
            [selectedConversation.id]: MESSAGES[selectedConversation.id] || [],
          }));
        }
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConversation, messages]);

  const filteredConversations = conversations.filter((c) =>
    c.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = selectedConversation
    ? messages[selectedConversation.id] || []
    : [];

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Meldinger"
        subtitle="Kommuniser med trenere og administrasjon"
        helpText="Send og motta meldinger fra trenere og administrasjon. Hold kontakten med trenerteamet og få svar på spørsmål om treningsopplegg og aktiviteter."
      />

      <div className="p-6 max-w-7xl mx-auto grid grid-cols-[280px_1fr] gap-5 h-[calc(100vh-140px)]">
        {/* Conversations List */}
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="flex items-center gap-2.5 bg-tier-white rounded-[10px] py-2.5 px-3.5">
            <Search size={18} className="text-tier-text-secondary" />
            <input
              type="text"
              placeholder="Søk i samtaler..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none outline-none text-sm text-tier-navy bg-transparent"
            />
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
            {filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                selected={selectedConversation?.id === conversation.id}
                onClick={setSelectedConversation}
              />
            ))}
          </div>
        </div>

        {/* Chat View */}
        <ChatView
          conversation={selectedConversation}
          messages={currentMessages}
          isLoading={loadingMessages}
          onMessageSent={() => {
            // Refresh messages after sending
            setMessages(prev => ({ ...prev }));
          }}
        />
      </div>

      {/* Loading overlay for initial load */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100]">
          <div className="bg-tier-white py-6 px-8 rounded-xl flex items-center gap-3">
            <Loader2 size={24} className="text-tier-navy animate-spin" />
            <span className="text-tier-navy">Laster samtaler...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeldingerContainer;
