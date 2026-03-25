/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TIER Golf - Coach Booking Requests
 * Design System v3.0 - Blue Palette 01
 *
 * List of all booking requests for coach.
 * Ability to approve, decline and view history.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Check,
  X,
  User,
  Calendar,
  MessageSquare,
  Search,
  CheckCircle2,
  XCircle,
  Save,
} from 'lucide-react';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import { PageTitle, SubSectionTitle } from '../../components/typography/Headings';

interface BookingRequest {
  id: string;
  playerId: string;
  playerName: string;
  playerInitials: string;
  playerCategory: string;
  sessionType: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  respondedAt?: string;
}

export default function CoachBookingRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'created'>('created');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Generate mock requests
  const generateMockRequests = useCallback((): BookingRequest[] => {
    const players = [
      { name: 'Anders Hansen', initials: 'AH', category: 'A' },
      { name: 'Sofie Andersen', initials: 'SA', category: 'B' },
      { name: 'Erik Johansen', initials: 'EJ', category: 'A' },
      { name: 'Maria Berg', initials: 'MB', category: 'C' },
      { name: 'Lars Olsen', initials: 'LO', category: 'B' },
    ];

    const sessionTypes = ['Individual Session', 'Video Analysis', 'On Course', 'Putting Special', 'Short Game'];
    const notes = [
      'Want to focus on driving',
      'Want to work on putting technique',
      'Preparation for tournament',
      undefined,
      'Struggling with slice, need help',
    ];

    const requests: BookingRequest[] = [];
    const today = new Date();

    for (let i = 0; i < 8; i++) {
      const player = players[i % players.length];
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + Math.floor(Math.random() * 14) + 1);

      const createdDate = new Date(today);
      createdDate.setHours(today.getHours() - Math.floor(Math.random() * 72));

      let status: BookingRequest['status'] = 'pending';
      if (filter === 'approved' || (filter === 'all' && i % 4 === 1)) status = 'approved';
      if (filter === 'declined' || (filter === 'all' && i % 4 === 3)) status = 'declined';

      requests.push({
        id: `req-${i + 1}`,
        playerId: `player-${i}`,
        playerName: player.name,
        playerInitials: player.initials,
        playerCategory: player.category,
        sessionType: sessionTypes[i % sessionTypes.length],
        date: futureDate.toISOString().split('T')[0],
        time: ['09:00', '10:00', '11:00', '14:00', '15:00'][i % 5],
        duration: [60, 90, 120][i % 3],
        notes: notes[i % notes.length],
        status,
        createdAt: createdDate.toISOString(),
        respondedAt: status !== 'pending' ? new Date().toISOString() : undefined,
      });
    }

    return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filter]);

  // Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`/api/v1/coach/bookings/requests?status=${filter}`);
        if (response.ok) {
          const data = await response.json();
          setRequests(data.requests || []);
        }
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        // Mock data for development
        setRequests(generateMockRequests());
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [filter, generateMockRequests]);

  // Handle approve/decline
  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await fetch(`/api/v1/coach/bookings/${requestId}/approve`, { method: 'PUT' });
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: 'approved' as const, respondedAt: new Date().toISOString() }
            : req
        )
      );
    } catch (error) {
      console.error('Failed to approve:', error);
      // Update locally for demo
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: 'approved' as const, respondedAt: new Date().toISOString() }
            : req
        )
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await fetch(`/api/v1/coach/bookings/${requestId}/decline`, { method: 'PUT' });
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: 'declined' as const, respondedAt: new Date().toISOString() }
            : req
        )
      );
    } catch (error) {
      console.error('Failed to decline:', error);
      // Update locally for demo
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: 'declined' as const, respondedAt: new Date().toISOString() }
            : req
        )
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleSave = async () => {
    // Save current filter and sort preferences
    try {
      await fetch('/api/v1/coach/bookings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter, sortBy }),
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  // Filter and sort requests
  const filteredRequests = requests
    .filter((req) => {
      if (filter !== 'all' && req.status !== filter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          req.playerName.toLowerCase().includes(query) ||
          req.sessionType.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Stats
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  // Get time since created
  const getTimeSince = (dateStr: string) => {
    const now = new Date();
    const created = new Date(dateStr);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          bg: 'rgba(var(--success-rgb), 0.15)',
          color: 'var(--status-success)',
          text: 'Approved',
          icon: CheckCircle2,
        };
      case 'declined':
        return {
          bg: 'rgba(var(--error-rgb), 0.15)',
          color: 'var(--status-error)',
          text: 'Declined',
          icon: XCircle,
        };
      default:
        return {
          bg: 'rgba(var(--warning-rgb), 0.15)',
          color: 'var(--status-pending)',
          text: 'Pending',
          icon: Clock,
        };
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: `4px solid ${'var(--border-default)'}`,
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderBottom: `1px solid ${'var(--border-default)'}`,
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <button
            onClick={() => navigate('/coach/booking')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} color={'var(--text-primary)'} />
          </button>
          <div style={{ flex: 1 }}>
            <PageTitle style={{ margin: 0 }}>
              Booking Requests
            </PageTitle>
            <p
              style={{
                fontSize: '15px', lineHeight: '20px',
                color: 'var(--text-secondary)',
                margin: '4px 0 0',
              }}
            >
              {pendingCount > 0
                ? `${pendingCount} request${pendingCount > 1 ? 's' : ''} awaiting response`
                : 'No pending requests'}
            </p>
          </div>
          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: 'var(--tier-primary, var(--accent))',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Save size={18} />
            Save
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              flex: 1,
              maxWidth: '300px',
            }}
          >
            <Search size={18} color={'var(--text-secondary)'} />
            <input
              type="text"
              placeholder="Search for player or session type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {(['pending', 'approved', 'declined', 'all'] as const).map((statusFilter) => (
              <button
                key={statusFilter}
                onClick={() => setFilter(statusFilter)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: filter === statusFilter ? 'var(--accent)' : 'var(--bg-primary)',
                  color: filter === statusFilter ? 'var(--bg-primary)' : 'var(--text-primary)',
                  border: `1px solid ${filter === statusFilter ? 'var(--accent)' : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {statusFilter === 'pending' && 'Pending'}
                {statusFilter === 'approved' && 'Approved'}
                {statusFilter === 'declined' && 'Declined'}
                {statusFilter === 'all' && 'All'}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'created')}
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--bg-primary)',
              border: `1px solid ${'var(--border-default)'}`,
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <option value="created">Newest first</option>
            <option value="date">By session date</option>
          </select>
        </div>
      </div>

      {/* Request list */}
      <div style={{ padding: '24px' }}>
        {filteredRequests.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '48px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Calendar size={28} color={'var(--text-secondary)'} />
            </div>
            <SubSectionTitle style={{ margin: '0 0 8px' }}>
              No Requests
            </SubSectionTitle>
            <p
              style={{
                fontSize: '15px', lineHeight: '20px',
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              {filter === 'pending'
                ? 'You have no pending booking requests'
                : 'No requests match the filter'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredRequests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              const StatusIcon = statusBadge.icon;
              const isProcessing = processingId === request.id;

              return (
                <div
                  key={request.id}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    overflow: 'hidden',
                    border:
                      request.status === 'pending'
                        ? `2px solid ${'var(--status-warning)'}`
                        : `1px solid ${'var(--border-default)'}`,
                  }}
                >
                  <div style={{ padding: '16px 20px' }}>
                    {/* Header row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent)',
                            color: 'var(--bg-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 600,
                          }}
                        >
                          {request.playerInitials}
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: '17px', lineHeight: '22px', fontWeight: 600,
                              color: 'var(--text-primary)',
                              margin: 0,
                            }}
                          >
                            {request.playerName}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                backgroundColor: 'var(--bg-tertiary)',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                              }}
                            >
                              Category {request.playerCategory}
                            </span>
                            <span
                              style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {getTimeSince(request.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: statusBadge.bg,
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        <StatusIcon size={14} color={statusBadge.color} />
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: statusBadge.color,
                          }}
                        >
                          {statusBadge.text}
                        </span>
                      </div>
                    </div>

                    {/* Booking details */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '12px',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                          SESSION TYPE
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                          {request.sessionType}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                          DATE
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                          {new Date(request.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                          TIME
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                          {request.time} ({request.duration} min)
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {request.notes && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '10px 12px',
                          backgroundColor: `${'var(--accent)'}08`,
                          borderRadius: 'var(--radius-md)',
                          borderLeft: `3px solid ${'var(--accent)'}`,
                          marginBottom: '12px',
                        }}
                      >
                        <MessageSquare size={16} color={'var(--accent)'} style={{ marginTop: '2px' }} />
                        <p
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                            margin: 0,
                            lineHeight: '1.4',
                          }}
                        >
                          {request.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleDecline(request.id)}
                          disabled={isProcessing}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--status-error)',
                            border: `1px solid ${'var(--status-error)'}`,
                            borderRadius: 'var(--radius-md)',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            opacity: isProcessing ? 0.5 : 1,
                          }}
                        >
                          <X size={18} />
                          Decline
                        </button>
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={isProcessing}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px',
                            backgroundColor: 'var(--status-success)',
                            color: 'var(--bg-primary)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            opacity: isProcessing ? 0.5 : 1,
                          }}
                        >
                          <Check size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => navigate(`/coach/athletes/${request.playerId}`)}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <User size={18} color={'var(--text-primary)'} />
                        </button>
                      </div>
                    )}

                    {request.status !== 'pending' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => navigate(`/coach/athletes/${request.playerId}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 14px',
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          <User size={16} />
                          View Player Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
