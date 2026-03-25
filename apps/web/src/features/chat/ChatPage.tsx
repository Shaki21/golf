/**
 * Chat Page
 * Main messaging interface with conversation list and message view
 */

import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, RefreshCw, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  useConversations,
  useConversation,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useMarkAsRead,
} from '../../hooks/useConversations';
import ConversationList from './components/ConversationList';
import MessageList from './components/MessageList';
import MessageComposer from './components/MessageComposer';
import { PageHeader } from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle } from '../../ui/primitives/typography';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(
    null
  );

  // Fetch conversations
  const { conversations, loading: loadingConversations, error: conversationsError, refetch: refetchConversations } = useConversations();

  // Fetch selected conversation messages
  const {
    conversation,
    messages,
    participants,
    loading: loadingMessages,
    error: messagesError,
    refetch: refetchMessages,
  } = useConversation(selectedConversationId || '', { limit: 50 });

  // Mutation hooks
  const { sendMessage, loading: sending } = useSendMessage();
  const { editMessage } = useEditMessage();
  const { deleteMessage } = useDeleteMessage();
  const { markAsRead } = useMarkAsRead();

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Mark as read when conversation is opened
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, markAsRead]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    if (selectedConversationId) {
      const interval = setInterval(() => {
        refetchMessages();
        refetchConversations();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [selectedConversationId, refetchMessages, refetchConversations]);

  const handleSelectConversation = (conv: any) => {
    setSelectedConversationId(conv.id);
    setEditingMessage(null);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    if (editingMessage) {
      // Edit existing message
      await editMessage(editingMessage.id, content);
      setEditingMessage(null);
    } else {
      // Send new message
      await sendMessage(selectedConversationId, { content });
    }

    // Refetch messages and conversations
    await refetchMessages();
    await refetchConversations();
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessage({ id: messageId, content });
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
    await refetchMessages();
    await refetchConversations();
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const handleRefresh = () => {
    refetchConversations();
    if (selectedConversationId) {
      refetchMessages();
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  if (loadingConversations) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <LoadingSpinner />
          <p className="mt-4 text-tier-text-secondary">Laster samtaler...</p>
        </div>
      </div>
    );
  }

  if (conversationsError) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-tier-border-default p-8 text-center">
            <div className="text-tier-error text-4xl mb-4">⚠️</div>
            <SubSectionTitle className="text-lg font-semibold text-tier-navy mb-2">
              Kunne ikke laste samtaler
            </SubSectionTitle>
            <p className="text-tier-text-secondary mb-4">{conversationsError}</p>
            <Button variant="primary" onClick={refetchConversations}>
              Prøv igjen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-tier-surface-base flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-tier-border-default p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={24} className="text-tier-info" />
            <PageHeader title="Meldinger" subtitle="" helpText="" actions={null} className="mb-0" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={16} />}
              onClick={handleRefresh}
            >
              Oppdater
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={() => alert('Ny samtale-funksjon kommer snart')}
            >
              Ny samtale
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Conversation list */}
        <div className="w-80 bg-white border-r border-tier-border-default flex flex-col">
          <div className="p-4 border-b border-tier-border-default">
            <SubSectionTitle className="text-sm font-semibold text-tier-navy" style={{ marginBottom: 0 }}>
              Samtaler ({conversations.length})
            </SubSectionTitle>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversationId || undefined}
              onSelect={handleSelectConversation}
            />
          </div>
        </div>

        {/* Message view */}
        <div className="flex-1 bg-white flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation header */}
              <div className="p-4 border-b border-tier-border-default">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tier-surface-secondary flex items-center justify-center text-tier-navy">
                    {selectedConversation.participants[0]?.avatar ? (
                      <img
                        src={selectedConversation.participants[0].avatar}
                        alt={selectedConversation.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users size={20} />
                    )}
                  </div>
                  <div>
                    <SubSectionTitle className="font-semibold text-tier-navy" style={{ marginBottom: 0 }}>
                      {selectedConversation.name}
                    </SubSectionTitle>
                    <p className="text-xs text-tier-text-secondary">
                      {participants.length} deltakere
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <LoadingSpinner />
                  </div>
                ) : messagesError ? (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <div className="text-tier-error text-4xl mb-4">⚠️</div>
                    <p className="text-tier-text-secondary">{messagesError}</p>
                  </div>
                ) : (
                  <MessageList
                    messages={messages}
                    currentUserId={userId || ''}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                  />
                )}
              </div>

              {/* Message composer */}
              <MessageComposer
                onSend={handleSendMessage}
                disabled={sending}
                editingMessage={editingMessage}
                onCancelEdit={handleCancelEdit}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="bg-tier-surface-secondary rounded-full p-6 mb-4">
                <MessageCircle size={48} className="text-tier-text-tertiary" />
              </div>
              <SubSectionTitle className="text-lg font-semibold text-tier-navy mb-2">
                Velg en samtale
              </SubSectionTitle>
              <p className="text-sm text-tier-text-secondary text-center">
                Klikk på en samtale fra listen til venstre for å starte
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
