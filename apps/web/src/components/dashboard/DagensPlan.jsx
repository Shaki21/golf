import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Button from '../../ui/primitives/Button';

/**
 * DagensPlan - Today's Schedule Widget
 *
 * Card Shell Contract applied:
 * - Consistent surface, borders, shadows (rounded-2xl)
 * - Unified header row pattern
 * - Standard KPI typography
 * - Single vertical rhythm
 * - Semantic tokens only
 */

// Card Shell base styles
const cardShell = {
  base: {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
    border: '1px solid var(--border-subtle)',
    overflow: 'hidden',
  },
};

export default function DagensPlan({ events: propEvents }) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const hours = Array.from({ length: 14 }, (_, i) => i + 6);

  // Helper to check if sessionId is a valid UUID
  const isValidUUID = (id) => {
    if (!id) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Default demo events if none provided (non-clickable since they use mock IDs)
  const defaultEvents = [
    { id: '1', title: 'Putting Drills', startTime: '08:00', endTime: '09:30', location: 'Indoor Range', type: 'training' },
    { id: '2', title: 'Trenermeeting', startTime: '10:00', endTime: '10:30', location: 'Klubbhus', type: 'meeting' },
    { id: '3', title: 'Langspill - Driver', startTime: '13:00', endTime: '15:00', location: 'Driving Range', type: 'training' },
    { id: '4', title: 'Shortgame Practice', startTime: '16:00', endTime: '17:30', location: 'Pitch & Putt', type: 'training' },
  ];

  const events = propEvents || defaultEvents;

  const formatDate = (date) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('nb-NO', options);
  };

  const goToPrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  return (
    <div style={cardShell.base}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <Calendar size={18} style={{ color: 'var(--text-secondary)' }} />
          <div>
            <span style={styles.title}>Dagens plan</span>
            <span style={styles.subtitle}>{formatDate(selectedDate)}</span>
          </div>
        </div>
        <div style={styles.headerActions}>
          <Button variant="ghost" size="sm" onClick={goToPrevDay}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToNextDay}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </header>

      {/* Content - Fixed height with overflow protection */}
      <div style={styles.contentContainer}>
        <div style={styles.scrollArea}>
          <div style={styles.gridLayout}>
            {/* Hour labels column */}
            <div style={styles.hoursColumn}>
              {hours.map((h) => (
                <div key={h} style={styles.hourLabel}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Events column */}
            <div style={styles.eventsColumn}>
              {events.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyText}>Ingen aktiviteter planlagt</span>
                </div>
              ) : (
                events.map((e) => {
                  const hasValidSession = isValidUUID(e.sessionId);
                  return (
                    <div
                      key={e.id}
                      style={{
                        ...styles.eventCard,
                        cursor: hasValidSession ? 'pointer' : 'default',
                      }}
                      onClick={() => hasValidSession && navigate(`/session/${e.sessionId}`)}
                      onMouseEnter={(evt) => {
                        if (hasValidSession) {
                          evt.currentTarget.style.opacity = '0.9';
                        }
                      }}
                      onMouseLeave={(evt) => {
                        evt.currentTarget.style.opacity = '1';
                      }}
                    >
                      <div style={styles.eventTitle}>{e.title}</div>
                      <div style={styles.eventMeta}>
                        {e.startTime} - {e.endTime} • {e.location}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  // Header
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '20px 24px 16px 24px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  title: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  subtitle: {
    display: 'block',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    marginTop: '2px',
  },
  headerActions: {
    display: 'flex',
    gap: '4px',
  },

  // Content
  contentContainer: {
    position: 'relative',
    height: '480px',
    overflow: 'hidden',
  },
  scrollArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'auto',
  },
  gridLayout: {
    padding: '20px 24px',
    display: 'grid',
    gridTemplateColumns: '56px 1fr',
    gap: '16px',
  },

  // Hours column
  hoursColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  hourLabel: {
    fontSize: '12px',
    fontFeatureSettings: '"tnum"',
    color: 'var(--text-tertiary)',
    lineHeight: 1,
  },

  // Events column
  eventsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  eventCard: {
    borderRadius: '12px',
    backgroundColor: 'var(--tier-primary)',
    color: 'white',
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  eventTitle: {
    fontWeight: 600,
    fontSize: '14px',
  },
  eventMeta: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: '4px',
  },

  // Empty state
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 16px',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--text-tertiary)',
  },
};
