/**
 * TIER Golf - Samling Detail
 * Detail view with tabs for info, participants, sessions, and calendar
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Info,
  CheckCircle,
  Send,
  MoreVertical,
  Plus,
  Trash2,
  UserPlus,
  Edit,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { PageTitle, SectionTitle, SubSectionTitle } from '../../components/typography';

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
  avatar?: string;
}

interface Participant {
  id: string;
  playerId: string;
  invitationStatus: string;
  addedVia: string;
  syncedToTrainingPlan: boolean;
  player: Player;
}

interface Session {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime?: string;
  duration: number;
  title: string;
  description?: string;
  sessionType: string;
  location?: string;
}

interface Samling {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  venue?: string;
  address?: string;
  accommodation?: string;
  meetingPoint?: string;
  transportInfo?: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  maxParticipants?: number;
  notes?: string;
  publishedAt?: string;
  coach: {
    id: string;
    firstName: string;
    lastName: string;
  };
  participants: Participant[];
  sessions: Session[];
  _count: {
    participants: number;
    sessions: number;
  };
}

const statusConfig = {
  draft: { label: 'Draft', color: 'var(--text-tertiary)', bg: 'var(--bg-tertiary)' },
  published: { label: 'Published', color: 'var(--accent)', bg: 'rgba(var(--accent-rgb), 0.15)' },
  in_progress: { label: 'In progress', color: 'var(--status-success)', bg: 'rgba(var(--success-rgb), 0.15)' },
  completed: { label: 'Completed', color: 'var(--achievement)', bg: 'rgba(var(--achievement-rgb), 0.15)' },
  cancelled: { label: 'Cancelled', color: 'var(--status-error)', bg: 'rgba(var(--error-rgb), 0.15)' },
};

const invitationStatusLabels: Record<string, { label: string; color: string }> = {
  invited: { label: 'Invited', color: 'var(--status-warning)' },
  confirmed: { label: 'Confirmed', color: 'var(--status-success)' },
  declined: { label: 'Declined', color: 'var(--status-error)' },
  tentative: { label: 'Tentative', color: 'var(--text-secondary)' },
};

const tabs = [
  { key: 'info', label: 'Information', icon: Info },
  { key: 'participants', label: 'Participants', icon: Users },
  { key: 'sessions', label: 'Sessions', icon: Clock },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
];

const SamlingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [samling, setSamling] = useState<Samling | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  // Session form state
  const [sessionForm, setSessionForm] = useState({
    title: '',
    sessionDate: '',
    startTime: '09:00',
    duration: 60,
    sessionType: 'teknikk',
    location: '',
    description: '',
  });
  const [creatingSession, setCreatingSession] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSamling();
    }
  }, [id]);

  const fetchSamling = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: Samling }>(`/samling/${id}`);
      if (response.data.success) {
        setSamling(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching samling:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlayers = async () => {
    try {
      const response = await api.get<{ success: boolean; data: { athletes: Player[] } }>('/coaches/athletes');
      if (response.data.success) {
        // Filter out players already in the samling
        const existingIds = samling?.participants.map(p => p.playerId) || [];
        setAvailablePlayers(
          response.data.data.athletes.filter(p => !existingIds.includes(p.id))
        );
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handlePublish = async () => {
    if (!samling) return;

    try {
      setPublishing(true);
      const response = await api.post<{ success: boolean }>(`/samling/${samling.id}/publish`);
      if (response.data.success) {
        fetchSamling();
      }
    } catch (error) {
      console.error('Error publishing samling:', error);
    } finally {
      setPublishing(false);
    }
  };

  const handleAddParticipants = async () => {
    if (selectedPlayerIds.length === 0) return;

    try {
      await api.post(`/samling/${id}/participants`, {
        type: 'individual',
        playerIds: selectedPlayerIds,
      });
      setShowAddParticipants(false);
      setSelectedPlayerIds([]);
      fetchSamling();
    } catch (error) {
      console.error('Error adding participants:', error);
    }
  };

  const handleRemoveParticipant = async (playerId: string) => {
    try {
      await api.delete(`/samling/${id}/participants/${playerId}`);
      fetchSamling();
    } catch (error) {
      console.error('Error removing participant:', error);
    }
  };

  const handleCreateSession = async () => {
    if (!sessionForm.title || !sessionForm.sessionDate || !sessionForm.startTime) return;

    try {
      setCreatingSession(true);
      await api.post(`/samling/${id}/sessions`, {
        title: sessionForm.title,
        sessionDate: sessionForm.sessionDate,
        startTime: sessionForm.startTime,
        duration: sessionForm.duration,
        sessionType: sessionForm.sessionType,
        location: sessionForm.location || undefined,
        description: sessionForm.description || undefined,
      });
      setShowAddSession(false);
      setSessionForm({
        title: '',
        sessionDate: '',
        startTime: '09:00',
        duration: 60,
        sessionType: 'teknikk',
        location: '',
        description: '',
      });
      fetchSamling();
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setCreatingSession(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading training camp...
      </div>
    );
  }

  if (!samling) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Training camp not found
      </div>
    );
  }

  const status = statusConfig[samling.status];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/coach/samlinger')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '16px',
          }}
        >
          <ArrowLeft size={18} />
          Back to training camps
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '24px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <PageTitle style={{ marginBottom: 0 }}>
                {samling.name}
              </PageTitle>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: status.color,
                  backgroundColor: status.bg,
                }}
              >
                {status.label}
              </span>
            </div>

            <div style={{
              display: 'flex',
              gap: '20px',
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                {formatDateRange(samling.startDate, samling.endDate)}
              </span>
              {samling.venue && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} />
                  {samling.venue}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={14} />
                {samling._count.participants} participants
              </span>
            </div>
          </div>

          {samling.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={publishing || samling._count.sessions === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: publishing ? 'var(--bg-tertiary)' : 'var(--accent)',
                color: publishing ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: publishing ? 'not-allowed' : 'pointer',
              }}
              title={samling._count.sessions === 0 ? 'Add at least one session to publish' : ''}
            >
              <Send size={18} />
              {publishing ? 'Publishing...' : 'Publish training camp'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid var(--border-secondary)',
        marginBottom: '24px',
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: isActive ? 500 : 400,
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Description */}
          {samling.description && (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <SubSectionTitle style={{ margin: '0 0 12px' }}>
                Description
              </SubSectionTitle>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                {samling.description}
              </p>
            </div>
          )}

          {/* Dates & Location */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
          }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <SubSectionTitle style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} />
                Dates
              </SubSectionTitle>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                <strong>Start:</strong> {formatDate(samling.startDate)}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                <strong>End:</strong> {formatDate(samling.endDate)}
              </p>
            </div>

            {(samling.venue || samling.address || samling.meetingPoint) && (
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '20px',
              }}>
                <SubSectionTitle style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} />
                  Location
                </SubSectionTitle>
                {samling.venue && (
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                    <strong>Venue:</strong> {samling.venue}
                  </p>
                )}
                {samling.address && (
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                    <strong>Address:</strong> {samling.address}
                  </p>
                )}
                {samling.meetingPoint && (
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                    <strong>Meeting point:</strong> {samling.meetingPoint}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Accommodation & Transport */}
          {(samling.accommodation || samling.transportInfo) && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
            }}>
              {samling.accommodation && (
                <div style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  padding: '20px',
                }}>
                  <SubSectionTitle style={{ margin: '0 0 12px' }}>
                    Accommodation
                  </SubSectionTitle>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {samling.accommodation}
                  </p>
                </div>
              )}
              {samling.transportInfo && (
                <div style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  padding: '20px',
                }}>
                  <SubSectionTitle style={{ margin: '0 0 12px' }}>
                    Transportation
                  </SubSectionTitle>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {samling.transportInfo}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {samling.notes && (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '20px',
            }}>
              <SubSectionTitle style={{ margin: '0 0 12px' }}>
                Notes
              </SubSectionTitle>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                {samling.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'participants' && (
        <div>
          {/* Add participants button */}
          {samling.status === 'draft' && (
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => {
                  setShowAddParticipants(true);
                  fetchAvailablePlayers();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <UserPlus size={18} />
                Add participants
              </button>
            </div>
          )}

          {/* Participants list */}
          {samling.participants.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
            }}>
              <Users size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }} />
              <SubSectionTitle style={{ marginBottom: '8px' }}>
                No participants yet
              </SubSectionTitle>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Add players to invite them to the training camp
              </p>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {samling.participants.map((participant, index) => {
                const invStatus = invitationStatusLabels[participant.invitationStatus] ||
                  { label: participant.invitationStatus, color: 'var(--text-secondary)' };

                return (
                  <div
                    key={participant.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderBottom: index < samling.participants.length - 1 ? '1px solid var(--border-secondary)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '14px',
                      }}>
                        {participant.player.firstName[0]}{participant.player.lastName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {participant.player.firstName} {participant.player.lastName}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          Category {participant.player.category}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: invStatus.color,
                        backgroundColor: `${invStatus.color}15`,
                      }}>
                        {invStatus.label}
                      </span>

                      {participant.syncedToTrainingPlan && (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--status-success)',
                          backgroundColor: 'rgba(var(--success-rgb), 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <CheckCircle size={12} />
                          Synced
                        </span>
                      )}

                      {samling.status === 'draft' && (
                        <button
                          onClick={() => handleRemoveParticipant(participant.playerId)}
                          style={{
                            padding: '6px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'var(--status-error)',
                            cursor: 'pointer',
                            borderRadius: '4px',
                          }}
                          title="Remove participant"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add participants modal */}
          {showAddParticipants && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}>
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '80vh',
                overflow: 'auto',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}>
                  <SectionTitle style={{ marginBottom: 0 }}>
                    Add participants
                  </SectionTitle>
                  <button
                    onClick={() => {
                      setShowAddParticipants(false);
                      setSelectedPlayerIds([]);
                    }}
                    style={{
                      padding: '4px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {availablePlayers.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '24px' }}>
                    No available players to add
                  </p>
                ) : (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      {availablePlayers.map((player) => (
                        <label
                          key={player.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: selectedPlayerIds.includes(player.id)
                              ? 'rgba(var(--accent-rgb), 0.1)'
                              : 'transparent',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPlayerIds.includes(player.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPlayerIds([...selectedPlayerIds, player.id]);
                              } else {
                                setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== player.id));
                              }
                            }}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '12px',
                          }}>
                            {player.firstName[0]}{player.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                              {player.firstName} {player.lastName}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              Category {player.category}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setShowAddParticipants(false);
                          setSelectedPlayerIds([]);
                        }}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddParticipants}
                        disabled={selectedPlayerIds.length === 0}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: selectedPlayerIds.length === 0 ? 'var(--bg-tertiary)' : 'var(--accent)',
                          color: selectedPlayerIds.length === 0 ? 'var(--text-secondary)' : 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: selectedPlayerIds.length === 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Add {selectedPlayerIds.length > 0 ? `(${selectedPlayerIds.length})` : ''}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div>
          {/* Add session button */}
          {samling.status === 'draft' && (
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => setShowAddSession(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <Plus size={18} />
                Add session
              </button>
            </div>
          )}

          {/* Sessions list */}
          {samling.sessions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
            }}>
              <Clock size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }} />
              <SubSectionTitle style={{ marginBottom: '8px' }}>
                No sessions yet
              </SubSectionTitle>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Add training sessions for the camp
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {samling.sessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-tertiary)',
                      marginBottom: '4px',
                    }}>
                      {new Date(session.sessionDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}>
                      {session.title}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {session.startTime} - {session.endTime || `${session.duration} min`}
                      </span>
                      <span style={{
                        padding: '2px 6px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        textTransform: 'capitalize',
                      }}>
                        {session.sessionType}
                      </span>
                      {session.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          {session.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add session modal */}
          {showAddSession && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}>
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '12px',
                padding: '24px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflow: 'auto',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}>
                  <SectionTitle style={{ marginBottom: 0 }}>
                    Add training session
                  </SectionTitle>
                  <button
                    onClick={() => {
                      setShowAddSession(false);
                      setSessionForm({
                        title: '',
                        sessionDate: '',
                        startTime: '09:00',
                        duration: 60,
                        sessionType: 'teknikk',
                        location: '',
                        description: '',
                      });
                    }}
                    style={{
                      padding: '4px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Title *
                    </label>
                    <input
                      type="text"
                      value={sessionForm.title}
                      onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                      placeholder="E.g. Putting practice"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-secondary)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Date *
                    </label>
                    <input
                      type="date"
                      value={sessionForm.sessionDate}
                      onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
                      min={samling.startDate.split('T')[0]}
                      max={samling.endDate.split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-secondary)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  {/* Time and Duration row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        Start time *
                      </label>
                      <input
                        type="time"
                        value={sessionForm.startTime}
                        onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-secondary)',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        value={sessionForm.duration}
                        onChange={(e) => setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) || 60 })}
                        min="15"
                        step="15"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-secondary)',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Session Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Session type
                    </label>
                    <select
                      value={sessionForm.sessionType}
                      onChange={(e) => setSessionForm({ ...sessionForm, sessionType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-secondary)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                    >
                      <option value="teknikk">Technique</option>
                      <option value="putting">Putting</option>
                      <option value="driving">Driving</option>
                      <option value="kort_spill">Short game</option>
                      <option value="banespill">Course play</option>
                      <option value="fysisk">Physical training</option>
                      <option value="mental">Mental training</option>
                      <option value="video">Video analysis</option>
                      <option value="annet">Other</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Location (optional)
                    </label>
                    <input
                      type="text"
                      value={sessionForm.location}
                      onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                      placeholder="E.g. Driving range"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-secondary)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Description (optional)
                    </label>
                    <textarea
                      value={sessionForm.description}
                      onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                      placeholder="Brief description of the session..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-secondary)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button
                    onClick={() => {
                      setShowAddSession(false);
                      setSessionForm({
                        title: '',
                        sessionDate: '',
                        startTime: '09:00',
                        duration: 60,
                        sessionType: 'teknikk',
                        location: '',
                        description: '',
                      });
                    }}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSession}
                    disabled={!sessionForm.title || !sessionForm.sessionDate || !sessionForm.startTime || creatingSession}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: (!sessionForm.title || !sessionForm.sessionDate || !sessionForm.startTime || creatingSession)
                        ? 'var(--bg-tertiary)'
                        : 'var(--accent)',
                      color: (!sessionForm.title || !sessionForm.sessionDate || !sessionForm.startTime || creatingSession)
                        ? 'var(--text-secondary)'
                        : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: (!sessionForm.title || !sessionForm.sessionDate || !sessionForm.startTime || creatingSession)
                        ? 'not-allowed'
                        : 'pointer',
                    }}
                  >
                    {creatingSession ? 'Creating...' : 'Add session'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
        }}>
          <Calendar size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }} />
          <SubSectionTitle style={{ marginBottom: '8px' }}>
            Calendar view
          </SubSectionTitle>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Calendar view coming soon
          </p>
        </div>
      )}
    </div>
  );
};

export default SamlingDetail;
