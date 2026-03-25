/**
 * AI Conversations History Page
 * View and manage past AI coach conversations
 */

import React, { useState } from 'react';
import { MessageCircle, Calendar, Trash2, Archive, Edit2, CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import {
  useAIConversations,
  useAIConversation,
  useAIConversationStats,
  useUpdateConversationTitle,
  useArchiveConversation,
  useDeleteAIConversation,
} from '../../hooks/useAIConversations';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import { PageHeader } from '../../ui/raw-blocks';

interface ConversationStats {
  totalConversations: number;
  totalMessages: number;
  totalTokensUsed?: number;
  lastConversationDate?: string;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages?: ConversationMessage[];
  totalTokens?: number;
}

const AIConversationsHistoryPage: React.FC = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    refetch,
  } = useAIConversations({ isActive: !showArchived });

  const { conversation, loading: conversationLoading } = useAIConversation(selectedConversationId || '') as { conversation: Conversation | null; loading: boolean; error: any };
  const { stats, loading: statsLoading } = useAIConversationStats() as { stats: ConversationStats | null; loading: boolean; error: any; refetch: () => void };
  const { updateTitle } = useUpdateConversationTitle();
  const { archiveConversation } = useArchiveConversation();
  const { deleteConversation } = useDeleteAIConversation();

  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const handleArchive = async (conversationId: string) => {
    if (!confirm('Arkivere denne samtalen?')) return;
    try {
      await archiveConversation(conversationId);
      refetch();
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
    } catch (err) {
      console.error('Error archiving conversation:', err);
    }
  };

  const handleDelete = async (conversationId: string) => {
    if (!confirm('Slette denne samtalen permanent? Dette kan ikke angres.')) return;
    try {
      await deleteConversation(conversationId);
      refetch();
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const handleUpdateTitle = async (conversationId: string) => {
    if (!editTitle.trim()) {
      setEditingTitleId(null);
      return;
    }
    try {
      await updateTitle(conversationId, editTitle);
      refetch();
      setEditingTitleId(null);
    } catch (err) {
      console.error('Error updating title:', err);
    }
  };

  const toggleMessageExpand = (messageId: string) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="AI Treningshistorikk"
          subtitle="Dine tidligere samtaler med AI-treneren"
          helpText="Oversikt over alle samtaler med AI-treneren. Se statistikk over samtaler, meldinger og token-forbruk. Bla gjennom aktive og arkiverte samtaler, rediger titler, vis meldingsinnhold med detaljer (input/output tokens, verktøybruk). Arkiver eller slett samtaler. Klikk på en samtale for å se hele historikken."
          actions={null}
        />

        {/* Stats */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="p-4">
                <p className="text-xs text-tier-text-secondary mb-1">Totalt samtaler</p>
                <p className="text-2xl font-bold text-tier-navy">{stats.totalConversations}</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-xs text-tier-text-secondary mb-1">Totalt meldinger</p>
                <p className="text-2xl font-bold text-tier-navy">{stats.totalMessages}</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-xs text-tier-text-secondary mb-1">Token brukt</p>
                <p className="text-2xl font-bold text-tier-navy">{stats.totalTokensUsed?.toLocaleString() || 0}</p>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <p className="text-xs text-tier-text-secondary mb-1">Siste samtale</p>
                <p className="text-sm font-semibold text-tier-navy">
                  {stats.lastConversationDate
                    ? new Date(stats.lastConversationDate).toLocaleDateString('no-NO')
                    : 'N/A'}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Toggle Archived */}
        <div className="flex gap-2 mb-6">
          <Button variant={!showArchived ? 'primary' : 'secondary'} size="sm" onClick={() => setShowArchived(false)}>
            Aktive
          </Button>
          <Button variant={showArchived ? 'primary' : 'secondary'} size="sm" onClick={() => setShowArchived(true)}>
            Arkiverte
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-4">
                <SectionTitle style={{ marginBottom: '1rem' }}>Samtaler</SectionTitle>
                {conversationsLoading ? (
                  <p className="text-center text-tier-text-secondary py-8">Laster...</p>
                ) : conversationsError ? (
                  <p className="text-center text-tier-error py-8">{conversationsError}</p>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle size={48} className="mx-auto text-tier-text-tertiary mb-4" />
                    <p className="text-sm text-tier-text-secondary">
                      {showArchived ? 'Ingen arkiverte samtaler' : 'Ingen samtaler ennå'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv: any) => (
                      <div
                        key={conv.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedConversationId === conv.id
                            ? 'border-tier-navy bg-tier-navy-light'
                            : 'border-tier-border-default hover:border-tier-navy hover:bg-tier-surface-base'
                        }`}
                        onClick={() => setSelectedConversationId(conv.id)}
                      >
                        {editingTitleId === conv.id ? (
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 px-2 py-1 border border-tier-border-default rounded text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => handleUpdateTitle(conv.id)}
                              className="p-1 hover:bg-tier-success-light rounded"
                            >
                              <CheckCircle size={16} className="text-tier-success" />
                            </button>
                            <button
                              onClick={() => setEditingTitleId(null)}
                              className="p-1 hover:bg-tier-error-light rounded"
                            >
                              <X size={16} className="text-tier-error" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="font-medium text-tier-navy text-sm line-clamp-2">{conv.title}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTitleId(conv.id);
                                  setEditTitle(conv.title);
                                }}
                                className="p-1 hover:bg-tier-surface-base rounded"
                              >
                                <Edit2 size={14} className="text-tier-text-secondary" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-xs text-tier-text-secondary">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>{new Date(conv.createdAt).toLocaleDateString('no-NO')}</span>
                              </div>
                              <span>{conv._count?.messages || 0} meldinger</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              {!showArchived && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchive(conv.id);
                                  }}
                                  className="text-xs text-tier-text-secondary hover:text-tier-navy flex items-center gap-1"
                                >
                                  <Archive size={12} />
                                  Arkiver
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(conv.id);
                                }}
                                className="text-xs text-tier-error hover:text-tier-error flex items-center gap-1"
                              >
                                <Trash2 size={12} />
                                Slett
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Conversation Detail */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-4">
                {!selectedConversationId ? (
                  <div className="text-center py-12">
                    <MessageCircle size={64} className="mx-auto text-tier-text-tertiary mb-4" />
                    <SubSectionTitle style={{ marginBottom: '0.5rem' }}>Velg en samtale</SubSectionTitle>
                    <p className="text-sm text-tier-text-secondary">Velg en samtale fra listen for å se innholdet</p>
                  </div>
                ) : conversationLoading ? (
                  <div className="text-center py-12">
                    <p className="text-tier-text-secondary">Laster samtale...</p>
                  </div>
                ) : conversation ? (
                  <div>
                    <div className="mb-6 pb-4 border-b border-tier-border-default">
                      <SectionTitle style={{ marginBottom: '0.5rem' }}>{conversation.title}</SectionTitle>
                      <div className="flex items-center gap-4 text-sm text-tier-text-secondary">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(conversation.createdAt).toLocaleString('no-NO')}
                        </div>
                        <span>{conversation.messages?.length || 0} meldinger</span>
                        {conversation.totalTokens && (
                          <span>{conversation.totalTokens.toLocaleString()} tokens</span>
                        )}
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="space-y-4">
                      {conversation.messages && conversation.messages.length > 0 ? (
                        conversation.messages.map((message: any) => (
                          <div
                            key={message.id}
                            className={`p-4 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-tier-navy-light border border-tier-navy'
                                : message.role === 'assistant'
                                ? 'bg-tier-surface-base border border-tier-border-default'
                                : 'bg-tier-warning-light border border-tier-warning'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded ${
                                    message.role === 'user'
                                      ? 'bg-tier-navy text-white'
                                      : message.role === 'assistant'
                                      ? 'bg-tier-info text-white'
                                      : 'bg-tier-warning text-tier-navy'
                                  }`}
                                >
                                  {message.role === 'user'
                                    ? 'Deg'
                                    : message.role === 'assistant'
                                    ? 'AI Trener'
                                    : 'System'}
                                </span>
                                <span className="text-xs text-tier-text-secondary">
                                  {new Date(message.createdAt).toLocaleTimeString('no-NO')}
                                </span>
                              </div>
                              <button
                                onClick={() => toggleMessageExpand(message.id)}
                                className="p-1 hover:bg-tier-surface-base rounded transition-colors"
                              >
                                {expandedMessages.has(message.id) ? (
                                  <ChevronUp size={16} className="text-tier-text-secondary" />
                                ) : (
                                  <ChevronDown size={16} className="text-tier-text-secondary" />
                                )}
                              </button>
                            </div>

                            {expandedMessages.has(message.id) ? (
                              <>
                                <div className="prose prose-sm max-w-none">
                                  <p className="text-sm text-tier-navy whitespace-pre-wrap">{message.content}</p>
                                </div>
                                {(message.inputTokens || message.outputTokens || message.toolsUsed) && (
                                  <div className="mt-3 pt-3 border-t border-tier-border-default text-xs text-tier-text-secondary">
                                    {message.inputTokens && <span>Input: {message.inputTokens} tokens</span>}
                                    {message.outputTokens && (
                                      <span className="ml-3">Output: {message.outputTokens} tokens</span>
                                    )}
                                    {message.toolsUsed && message.toolsUsed.length > 0 && (
                                      <div className="mt-1">
                                        Tools: {message.toolsUsed.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-tier-navy line-clamp-2">{message.content}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-tier-text-secondary">Ingen meldinger i denne samtalen</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-tier-error">Kunne ikke laste samtale</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConversationsHistoryPage;
