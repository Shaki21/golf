/**
 * TIER Golf - Conversation View
 * Design System v3.0 - Premium Light
 *
 * Chat view for a single conversation.
 * Supports text, images and replies to messages.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * (except dynamic avatar color which requires runtime value)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Reply,
  X,
  Users,
  User,
  Info,
} from 'lucide-react';
import { SectionTitle } from '../../components/typography/Headings';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'player' | 'coach' | 'parent' | 'system';
  content: string;
  messageType: 'text' | 'image' | 'system';
  metadata?: {
    imageUrl?: string;
  };
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  isRead: boolean;
  readBy?: Array<{
    userId: string;
    userName: string;
    readAt: string;
  }>;
  createdAt: string;
  isOwn: boolean;
}

interface ConversationInfo {
  id: string;
  name: string;
  groupType: 'direct' | 'team' | 'coach_player';
  avatarInitials: string;
  avatarColor: string;
  members: Array<{
    id: string;
    name: string;
    type: string;
    isOnline?: boolean;
  }>;
}

export default function ConversationView() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Fetch conversation and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch conversation info
        const convResponse = await fetch(`/api/v1/messages/conversations/${conversationId}`);
        if (convResponse.ok) {
          const convData = await convResponse.json();
          setConversation(convData.conversation);
        }

        // Fetch messages
        const msgResponse = await fetch(`/api/v1/messages/conversations/${conversationId}/messages`);
        if (msgResponse.ok) {
          const msgData = await msgResponse.json();
          setMessages(msgData.messages || []);
        }
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
        // Mock data for development
        setConversation({
          id: conversationId || '1',
          name: 'Anders Kristiansen (Coach)',
          groupType: 'coach_player',
          avatarInitials: 'AK',
          avatarColor: 'rgb(var(--status-warning))',
          members: [
            { id: '1', name: 'Anders Kristiansen', type: 'coach', isOnline: true },
          ],
        });
        setMessages([
          {
            id: '1',
            senderId: 'coach1',
            senderName: 'Anders Kristiansen',
            senderType: 'coach',
            content: 'Hi! How did the training session go yesterday?',
            messageType: 'text',
            isRead: true,
            createdAt: '2025-12-20T14:30:00Z',
            isOwn: false,
          },
          {
            id: '2',
            senderId: 'player1',
            senderName: 'You',
            senderType: 'player',
            content: 'Hi! It went well, focused a lot on putting as you suggested. Noticed improvement!',
            messageType: 'text',
            isRead: true,
            createdAt: '2025-12-20T15:15:00Z',
            isOwn: true,
          },
          {
            id: '3',
            senderId: 'coach1',
            senderName: 'Anders Kristiansen',
            senderType: 'coach',
            content: 'Great! Remember to continue with the short putts (1-2m). That is where most strokes are saved.',
            messageType: 'text',
            replyTo: {
              id: '2',
              content: 'Hi! It went well, focused a lot on putting...',
              senderName: 'You',
            },
            isRead: true,
            createdAt: '2025-12-20T15:45:00Z',
            isOwn: false,
          },
          {
            id: '4',
            senderId: 'coach1',
            senderName: 'Anders Kristiansen',
            senderType: 'coach',
            content: 'Remember to focus on putting today! Test 5 (lag putt) is important for reaching category B.',
            messageType: 'text',
            isRead: false,
            createdAt: '2025-12-21T09:30:00Z',
            isOwn: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (messages.length > 0) {
      fetch(`/api/v1/messages/conversations/${conversationId}/read`, {
        method: 'PUT',
      }).catch((err) => console.warn('Failed to mark messages as read:', err));
    }
  }, [conversationId, messages.length]);

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Format date header
  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const response = await fetch(`/api/v1/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          replyToId: replyingTo?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
      } else {
        // Optimistic update for demo
        const newMsg: Message = {
          id: Date.now().toString(),
          senderId: 'player1',
          senderName: 'You',
          senderType: 'player',
          content: messageContent,
          messageType: 'text',
          replyTo: replyingTo
            ? {
                id: replyingTo.id,
                content: replyingTo.content.substring(0, 50) + '...',
                senderName: replyingTo.senderName,
              }
            : undefined,
          isRead: false,
          createdAt: new Date().toISOString(),
          isOwn: true,
        };
        setMessages([...messages, newMsg]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
      setReplyingTo(null);
      inputRef.current?.focus();
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-10 h-10 border-[3px] border-tier-border-default border-t-tier-navy rounded-full mx-auto mb-4 animate-spin" />
        <p className="text-tier-text-secondary">Loading conversation...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-6 text-center">
        <p className="text-tier-error">Conversation not found</p>
        <Link
          to="/meldinger"
          className="text-tier-navy mt-4 block"
        >
          Back to messages
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] max-w-[800px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-tier-white border-b border-tier-border-default rounded-t-xl">
        <button
          onClick={() => navigate('/meldinger')}
          className="flex items-center justify-center w-9 h-9 bg-transparent border-none rounded cursor-pointer text-tier-navy hover:bg-tier-surface-base"
        >
          <ArrowLeft size={20} />
        </button>

        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: conversation.avatarColor }}
        >
          {conversation.avatarInitials}
        </div>

        <div className="flex-1">
          <SectionTitle className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
            {conversation.name}
          </SectionTitle>
          <div className="flex items-center gap-1.5">
            {conversation.groupType === 'team' ? (
              <Users size={12} className="text-tier-text-secondary" />
            ) : (
              <User size={12} className="text-tier-text-secondary" />
            )}
            <span className="text-[13px] leading-[18px] text-tier-text-secondary">
              {conversation.members.length}{' '}
              {conversation.members.length === 1 ? 'member' : 'members'}
            </span>
            {conversation.members.some((m) => m.isOnline) && (
              <>
                <span className="text-tier-border-default">•</span>
                <span className="text-[13px] leading-[18px] text-tier-success">
                  Active now
                </span>
              </>
            )}
          </div>
        </div>

        <button className="flex items-center justify-center w-9 h-9 bg-transparent border-none rounded cursor-pointer text-tier-text-secondary hover:bg-tier-surface-base">
          <Info size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-tier-surface-base">
        {Object.entries(groupedMessages).map(([date, dateMessages]: [string, Message[]]) => (
          <div key={date}>
            {/* Date header */}
            <div className="text-center my-4">
              <span className="text-[13px] leading-[18px] text-tier-text-secondary bg-tier-white py-1 px-3 rounded-full border border-tier-border-default">
                {formatDateHeader(dateMessages[0].createdAt)}
              </span>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-3 ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[75%]">
                  {/* Reply preview */}
                  {message.replyTo && (
                    <div
                      className={`py-2 px-3 rounded-t-lg -mb-1 border-l-[3px] ${
                        message.isOwn
                          ? 'bg-tier-navy/20 border-l-tier-navy'
                          : 'bg-tier-white border-l-tier-warning'
                      }`}
                    >
                      <p className="text-xs leading-4 text-tier-navy font-semibold m-0 mb-0.5">
                        {message.replyTo.senderName}
                      </p>
                      <p className="text-[13px] leading-[18px] text-tier-text-secondary m-0">
                        {message.replyTo.content}
                      </p>
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`py-2.5 px-3.5 ${
                      message.isOwn
                        ? 'bg-tier-navy text-white'
                        : 'bg-tier-white text-tier-navy shadow-sm'
                    } ${message.replyTo ? 'rounded-b-lg' : 'rounded-lg'}`}
                  >
                    {!message.isOwn && conversation.groupType === 'team' && (
                      <p className="text-xs leading-4 text-tier-warning font-semibold m-0 mb-1">
                        {message.senderName}
                      </p>
                    )}
                    <p className="text-[15px] leading-5 m-0 whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span
                        className={`text-xs leading-4 ${
                          message.isOwn ? 'text-white/70' : 'text-tier-text-secondary'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </span>
                      {message.isOwn && (
                        <div
                          className="relative group"
                          title={
                            message.readBy && message.readBy.length > 0
                              ? `Read by ${message.readBy.map(r => r.userName).join(', ')}`
                              : message.isRead
                              ? 'Read'
                              : 'Sent'
                          }
                        >
                          {message.isRead ? (
                            <CheckCheck size={14} className="text-tier-success" />
                          ) : (
                            <Check size={14} className="text-white/70" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick reply button */}
                  {!message.isOwn && (
                    <button
                      onClick={() => setReplyingTo(message)}
                      className="flex items-center gap-1 mt-1 py-1 px-2 bg-transparent border-none rounded text-tier-text-secondary text-xs cursor-pointer hover:bg-tier-white"
                    >
                      <Reply size={12} />
                      Reply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center gap-3 py-2.5 px-4 bg-tier-white border-t border-tier-border-default">
          <Reply size={16} className="text-tier-navy" />
          <div className="flex-1">
            <p className="text-xs leading-4 text-tier-navy font-semibold m-0">
              Replying to {replyingTo.senderName}
            </p>
            <p className="text-[13px] leading-[18px] text-tier-text-secondary m-0 overflow-hidden text-ellipsis whitespace-nowrap">
              {replyingTo.content}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="flex items-center justify-center w-7 h-7 bg-transparent border-none rounded cursor-pointer text-tier-text-secondary hover:bg-tier-surface-base"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2.5 py-3 px-4 bg-tier-white border-t border-tier-border-default rounded-b-xl">
        <button className="flex items-center justify-center w-10 h-10 bg-transparent border-none rounded cursor-pointer text-tier-text-secondary hover:bg-tier-surface-base">
          <Paperclip size={20} />
        </button>

        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Write a message..."
            rows={1}
            className="w-full py-2.5 px-3.5 bg-tier-white border border-tier-border-default rounded-lg text-[15px] resize-none outline-none font-[inherit] focus:border-tier-navy"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className={`flex items-center justify-center w-10 h-10 border-none rounded-lg text-white transition-colors ${
            newMessage.trim()
              ? 'bg-tier-navy cursor-pointer hover:bg-tier-navy/90'
              : 'bg-tier-border-default cursor-not-allowed'
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
