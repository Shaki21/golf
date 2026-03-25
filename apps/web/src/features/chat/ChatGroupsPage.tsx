/**
 * Chat Groups Page
 * Displays list of chat groups and conversation view
 */

import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Send, Plus } from 'lucide-react';
import { Page } from '../../ui/components/Page';
import { Button, Input } from '../../ui/primitives';
import { SubSectionTitle } from '../../ui/primitives/typography';
import chatAPI from '../../services/chatAPI';
import { useAuth } from '../../contexts/AuthContext';

interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  groupType: string;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount?: number;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderName: string;
  senderType: string;
  senderId: string;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
}

export const ChatGroupsPage: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadMessages(selectedGroup.id);
    }
  }, [selectedGroup]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getGroups();
      const typedResponse = response as unknown as APIResponse<ChatGroup[]>;
      setGroups(Array.isArray(typedResponse.data) ? typedResponse.data : []);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (groupId: string) => {
    try {
      const response = await chatAPI.getMessages(groupId, { limit: 50 });
      const typedResponse = response as unknown as APIResponse<Message[]>;
      setMessages(Array.isArray(typedResponse.data) ? typedResponse.data : []);
      // Mark as read
      await chatAPI.markAsRead(groupId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup || sending) return;

    try {
      setSending(true);
      await chatAPI.sendMessage(selectedGroup.id, {
        content: newMessage.trim(),
        messageType: 'text',
      });
      setNewMessage('');
      // Reload messages
      await loadMessages(selectedGroup.id);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Kunne ikke sende melding. Prøv igjen.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return formatTime(dateString);
    }
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  };

  return (
    <Page state={loading ? 'loading' : 'idle'}>
      <Page.Header
        title="Meldinger"
        subtitle="Gruppesamtaler og direktemeldinger"
        helpText="Kommuniser med trenere, lagkamerater og grupper. Se alle gruppesamtaler, send meldinger, del filer og bilder. Få varsler om nye meldinger og se uleste samtaler. Hold kontakten med hele teamet."
      />

      <Page.Content>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: 24,
            height: '600px',
          }}
        >
          {/* Groups List */}
          <div
            style={{
              backgroundColor: 'rgb(var(--tier-white))',
              borderRadius: 12,
              border: '1px solid rgb(var(--border-color))',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: 16,
                borderBottom: '1px solid rgb(var(--border-color))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <SubSectionTitle style={{ fontSize: 16, fontWeight: 600, marginBottom: 0 }}>Grupper</SubSectionTitle>
              <Button variant="outline" size="sm" leftIcon={<Plus size={16} />}>
                Ny
              </Button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {groups.length === 0 ? (
                <div
                  style={{
                    padding: 32,
                    textAlign: 'center',
                    color: 'rgb(var(--text-secondary))',
                  }}
                >
                  <MessageCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ fontSize: 14 }}>Ingen grupper ennå</p>
                </div>
              ) : (
                groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    style={{
                      width: '100%',
                      padding: 16,
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      border: 'none',
                      borderBottom: '1px solid rgb(var(--border-color))',
                      backgroundColor:
                        selectedGroup?.id === group.id
                          ? 'rgb(var(--surface-secondary))'
                          : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'var(--tier-gold)',
                        color: 'rgb(var(--tier-white))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {group.groupType === 'direct' ? '👤' : '👥'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'rgb(var(--tier-navy))',
                          marginBottom: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {group.name}
                      </div>
                      {group.lastMessage && (
                        <div
                          style={{
                            fontSize: 12,
                            color: 'rgb(var(--text-secondary))',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {group.lastMessage.content}
                        </div>
                      )}
                    </div>
                    {group.unreadCount && group.unreadCount > 0 && (
                      <div
                        style={{
                          minWidth: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: 'var(--tier-gold)',
                          color: 'rgb(var(--tier-white))',
                          fontSize: 11,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 6px',
                        }}
                      >
                        {group.unreadCount}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Conversation View */}
          <div
            style={{
              backgroundColor: 'rgb(var(--tier-white))',
              borderRadius: 12,
              border: '1px solid rgb(var(--border-color))',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {selectedGroup ? (
              <>
                {/* Group Header */}
                <div
                  style={{
                    padding: 16,
                    borderBottom: '1px solid rgb(var(--border-color))',
                  }}
                >
                  <SubSectionTitle style={{ fontSize: 16, fontWeight: 600, marginBottom: 0 }}>
                    {selectedGroup.name}
                  </SubSectionTitle>
                  {selectedGroup.description && (
                    <p
                      style={{
                        fontSize: 13,
                        color: 'rgb(var(--text-secondary))',
                        margin: '4px 0 0',
                      }}
                    >
                      {selectedGroup.description}
                    </p>
                  )}
                </div>

                {/* Messages */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {messages.length === 0 ? (
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgb(var(--text-secondary))',
                      }}
                    >
                      <p style={{ fontSize: 14 }}>Ingen meldinger ennå</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.senderId === user?.playerId || message.senderId === user?.coachId;
                      return (
                        <div
                          key={message.id}
                          style={{
                            display: 'flex',
                            flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '70%',
                              padding: 12,
                              borderRadius: 12,
                              backgroundColor: isOwnMessage
                                ? 'rgb(var(--tier-gold))'
                                : 'rgb(var(--tier-white))',
                              color: isOwnMessage ? 'rgb(var(--tier-white))' : 'rgb(var(--tier-navy))',
                            }}
                          >
                            {!isOwnMessage && (
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  marginBottom: 4,
                                  opacity: 0.9,
                                }}
                              >
                                {message.senderName}
                              </div>
                            )}
                            <div style={{ fontSize: 14, lineHeight: 1.4 }}>{message.content}</div>
                            <div
                              style={{
                                fontSize: 11,
                                marginTop: 4,
                                opacity: 0.7,
                              }}
                            >
                              {formatTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  style={{
                    padding: 16,
                    borderTop: '1px solid rgb(var(--border-color))',
                    display: 'flex',
                    gap: 8,
                  }}
                >
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Skriv en melding..."
                    disabled={sending}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    leftIcon={<Send size={16} />}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? 'Sender...' : 'Send'}
                  </Button>
                </form>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgb(var(--text-secondary))',
                }}
              >
                <Users size={64} style={{ marginBottom: 16, opacity: 0.3 }} />
                <p style={{ fontSize: 16 }}>Velg en gruppe for å starte</p>
              </div>
            )}
          </div>
        </div>
      </Page.Content>
    </Page>
  );
};

export default ChatGroupsPage;
