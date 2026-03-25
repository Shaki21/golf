/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DagbokSessionList
 *
 * Virtualized list of training sessions using react-window.
 * Falls back to regular list if react-window not available.
 *
 * Migrated to Tailwind CSS
 */

import React, { useCallback, useRef, useMemo } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';

import type { DagbokSession, DagbokSessionListProps } from '../types';
import { DagbokSessionRow } from './DagbokSessionRow';
import { SESSION_ROW_HEIGHT, OVERSCAN_COUNT } from '../constants';
import { SubSectionTitle } from '../../../../ui/primitives/typography';

// Virtualization disabled - react-window not installed
// When/if react-window is added, uncomment the import below:
// import { FixedSizeList } from 'react-window';
const FixedSizeList: any = null;

// =============================================================================
// SKELETON COMPONENT
// =============================================================================

const SkeletonRow: React.FC = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-tier-border-subtle">
    <div className="w-10 h-10 rounded bg-tier-surface-subtle animate-pulse" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="w-3/5 h-3.5 rounded-sm bg-tier-surface-subtle animate-pulse" />
      <div className="w-2/5 h-3 rounded-sm bg-tier-surface-subtle animate-pulse" />
    </div>
  </div>
);

// =============================================================================
// GROUP SESSIONS BY DATE
// =============================================================================

interface SessionGroup {
  date: string;
  dateLabel: string;
  sessions: DagbokSession[];
}

function groupSessionsByDate(sessions: DagbokSession[]): SessionGroup[] {
  const groups: Map<string, DagbokSession[]> = new Map();

  // Sort sessions by date (newest first) then by time
  const sorted = [...sessions].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return (b.startTime || '').localeCompare(a.startTime || '');
  });

  // Group by date
  for (const session of sorted) {
    const existing = groups.get(session.date) || [];
    existing.push(session);
    groups.set(session.date, existing);
  }

  // Convert to array with labels
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return Array.from(groups.entries()).map(([date, sessions]) => {
    const d = new Date(date);
    let dateLabel: string;

    if (d.toDateString() === today.toDateString()) {
      dateLabel = 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      dateLabel = 'Yesterday';
    } else {
      dateLabel = d.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }

    return { date, dateLabel, sessions };
  });
}

// =============================================================================
// VIRTUALIZED ROW COMPONENT
// =============================================================================

interface VirtualizedRowData {
  sessions: DagbokSession[];
  onSessionClick?: (session: DagbokSession) => void;
}

const VirtualizedRow: React.FC<{
  index: number;
  style: React.CSSProperties;
  data: VirtualizedRowData;
}> = ({ index, style, data }) => {
  const session = data.sessions[index];

  return (
    <div style={style}>
      <DagbokSessionRow
        session={session}
        onClick={data.onSessionClick}
      />
    </div>
  );
};

// =============================================================================
// COMPONENT
// =============================================================================

export const DagbokSessionList: React.FC<DagbokSessionListProps> = ({
  sessions,
  isLoading = false,
  onSessionClick,
  emptyMessage = 'No training sessions found for selected period',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Group sessions by date
  const groupedSessions = useMemo(() => groupSessionsByDate(sessions), [sessions]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex-1 flex flex-col overflow-hidden ${className}`}>
        <div className="flex-1 overflow-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <div className={`flex-1 flex flex-col overflow-hidden ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <BookOpen className="w-12 h-12 text-tier-text-tertiary mb-4" />
          <SubSectionTitle style={{ marginBottom: 0 }}>No sessions</SubSectionTitle>
          <p className="text-xs text-tier-text-tertiary m-0 mt-2 mb-4 max-w-xs">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Use virtualization if available and many sessions
  if (FixedSizeList && sessions.length > 50) {
    const itemData: VirtualizedRowData = {
      sessions,
      onSessionClick,
    };

    return (
      <div className={`flex-1 flex flex-col overflow-hidden ${className}`} ref={containerRef}>
        <FixedSizeList
          height={600}
          width="100%"
          itemCount={sessions.length}
          itemSize={SESSION_ROW_HEIGHT}
          itemData={itemData}
          overscanCount={OVERSCAN_COUNT}
        >
          {VirtualizedRow}
        </FixedSizeList>
      </div>
    );
  }

  // Regular list with date headers
  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${className}`}>
      <div className="flex-1 overflow-auto">
        {groupedSessions.map((group) => (
          <div key={group.date}>
            <div className="px-4 py-2 text-xs font-semibold text-tier-text-secondary bg-tier-surface-subtle border-b border-tier-border-subtle sticky top-0 z-[1]">
              {group.dateLabel}
            </div>
            {group.sessions.map((session) => (
              <DagbokSessionRow
                key={session.id}
                session={session}
                onClick={onSessionClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DagbokSessionList;
