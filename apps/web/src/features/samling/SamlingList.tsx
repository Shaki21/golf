/**
 * TIER Golf - Samling List
 * Display all samlinger for the coach
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  ChevronRight,
  Clock,
  Search,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../ui/raw-blocks';
import { SubSectionTitle } from '../../components/typography';

interface Samling {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  venue?: string;
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';
  _count: {
    participants: number;
    sessions: number;
  };
}

interface SamlingListResponse {
  samlinger: Samling[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const statusConfig = {
  draft: { label: 'Draft', color: 'var(--text-tertiary)', bg: 'var(--bg-tertiary)' },
  published: { label: 'Published', color: 'var(--accent)', bg: 'rgba(var(--accent-rgb), 0.15)' },
  in_progress: { label: 'In progress', color: 'var(--status-success)', bg: 'rgba(var(--success-rgb), 0.15)' },
  completed: { label: 'Completed', color: 'var(--achievement)', bg: 'rgba(var(--achievement-rgb), 0.15)' },
  cancelled: { label: 'Cancelled', color: 'var(--status-error)', bg: 'rgba(var(--error-rgb), 0.15)' },
};

const SamlingList: React.FC = () => {
  const navigate = useNavigate();
  const [samlinger, setSamlinger] = useState<Samling[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchSamlinger();
  }, [statusFilter]);

  const fetchSamlinger = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get<{ success: boolean; data: SamlingListResponse }>(
        `/samling?${params.toString()}`
      );

      if (response.data.success) {
        setSamlinger(response.data.data.samlinger);
      }
    } catch (error) {
      console.error('Error fetching samlinger:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

    if (startDate.getFullYear() !== endDate.getFullYear()) {
      return `${startDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
    }

    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
  };

  const filteredSamlinger = samlinger.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.venue?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Training Camps"
        subtitle="Plan and manage training camps"
        helpText="Overview of all training camps. See status (draft, published, in progress, completed, cancelled), date, location, participant and session count. Create new camps, filter by status and search by name. Click on a camp for details."
        actions={
          <button
            onClick={() => navigate('/coach/samlinger/ny')}
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
            New training camp
          </button>
        }
      />

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          position: 'relative',
          flex: '1',
          minWidth: '200px',
          maxWidth: '300px'
        }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)'
            }}
          />
          <input
            type="text"
            placeholder="Search for training camp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid var(--border-secondary)',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid var(--border-secondary)',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            minWidth: '150px',
          }}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: 'var(--text-secondary)'
        }}>
          Loading training camps...
        </div>
      ) : filteredSamlinger.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
        }}>
          <Calendar size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }} />
          <SubSectionTitle style={{ marginBottom: '8px' }}>
            No training camps yet
          </SubSectionTitle>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px' }}>
            Create your first training camp to get started
          </p>
          <button
            onClick={() => navigate('/coach/samlinger/ny')}
            style={{
              display: 'inline-flex',
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
            Create training camp
          </button>
        </div>
      ) : (
        /* Samling cards */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '16px'
        }}>
          {filteredSamlinger.map((samling) => {
            const status = statusConfig[samling.status];

            return (
              <div
                key={samling.id}
                onClick={() => navigate(`/coach/samlinger/${samling.id}`)}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-secondary)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-secondary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Status badge */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: status.color,
                      backgroundColor: status.bg,
                    }}
                  >
                    {status.label}
                  </span>
                  <ChevronRight size={20} style={{ color: 'var(--text-tertiary)' }} />
                </div>

                {/* Title */}
                <SubSectionTitle style={{ marginBottom: '8px' }}>
                  {samling.name}
                </SubSectionTitle>

                {/* Description */}
                {samling.description && (
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    margin: '0 0 16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {samling.description}
                  </p>
                )}

                {/* Meta info */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)'
                  }}>
                    <Calendar size={14} />
                    {formatDateRange(samling.startDate, samling.endDate)}
                  </div>

                  {samling.venue && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)'
                    }}>
                      <MapPin size={14} />
                      {samling.venue}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginTop: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-secondary)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)'
                    }}>
                      <Users size={14} />
                      {samling._count.participants} participants
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: 'var(--text-secondary)'
                    }}>
                      <Clock size={14} />
                      {samling._count.sessions} sessions
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SamlingList;
