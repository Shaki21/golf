/**
 * CalendarList - Sidebar calendar list with checkboxes
 *
 * Features:
 * - Grouped calendars (account sections)
 * - Color indicators
 * - Visibility toggles
 * - Expandable sections
 */

import React, { useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { CALENDAR_COLORS, type CalendarSource, type CalendarColorKey } from './types';

interface CalendarListProps {
  calendars: CalendarSource[];
  onToggle: (calendarId: string) => void;
  onAddCalendar?: () => void;
}

interface CalendarGroup {
  id: string;
  name: string;
  calendars: CalendarSource[];
  expanded: boolean;
}

const CalendarList: React.FC<CalendarListProps> = ({
  calendars,
  onToggle,
  onAddCalendar,
}) => {
  // Group calendars by account/category
  const groups: CalendarGroup[] = [
    {
      id: 'akgolfgroup',
      name: 'akgolfgroup@gmail.com',
      calendars: calendars.filter(c => c.id.startsWith('personal') || c.id.startsWith('work') || c.id.startsWith('life') || c.id === 'familie'),
      expanded: true,
    },
    {
      id: 'notion',
      name: "Anders Kristiansen's Notion",
      calendars: [
        { id: 'tasks', name: 'Tasks', color: 'blue' as CalendarColorKey, visible: true },
        { id: 'training-sessions', name: 'Training Sessions Calendar', color: 'green' as CalendarColorKey, visible: true },
        { id: 'tasks-mulligan', name: 'Tasks @ Mulligan Indoor G...', color: 'purple' as CalendarColorKey, visible: true },
        { id: 'arsplan-wang', name: 'Årsplan WANG Toppidrett ...', color: 'orange' as CalendarColorKey, visible: true },
        { id: 'emilieskarpmord', name: 'EmilieSkarpmord', color: 'pink' as CalendarColorKey, visible: true },
        { id: 'treningsplan-2025', name: 'Treningsplan 2025', color: 'teal' as CalendarColorKey, visible: true },
      ],
      expanded: true,
    },
  ];

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.map(g => g.id))
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <div className="py-2">
      {groups.map(group => (
        <div key={group.id} className="mb-2">
          {/* Group Header */}
          <button
            onClick={() => toggleGroup(group.id)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
          >
            <ChevronRight
              size={12}
              className={`transition-transform ${expandedGroups.has(group.id) ? 'rotate-90' : ''}`}
            />
            <span className="truncate">{group.name}</span>
          </button>

          {/* Calendar Items */}
          {expandedGroups.has(group.id) && (
            <div className="mt-1">
              {(group.id === 'akgolfgroup' ? calendars : group.calendars).map(calendar => (
                <CalendarItem
                  key={calendar.id}
                  calendar={calendar}
                  onToggle={() => onToggle(calendar.id)}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Add Notion database */}
      {onAddCalendar && (
        <button
          onClick={onAddCalendar}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-600"
        >
          <Plus size={14} />
          Add Notion database
        </button>
      )}
    </div>
  );
};

interface CalendarItemProps {
  calendar: CalendarSource;
  onToggle: () => void;
}

const CalendarItem: React.FC<CalendarItemProps> = ({ calendar, onToggle }) => {
  const color = CALENDAR_COLORS[calendar.color];

  return (
    <label className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 group">
      {/* Checkbox */}
      <div className="relative">
        <input
          type="checkbox"
          checked={calendar.visible}
          onChange={onToggle}
          className="sr-only"
        />
        <div
          className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors`}
          style={{
            backgroundColor: calendar.visible ? color.border : 'transparent',
            borderColor: color.border,
          }}
        >
          {calendar.visible && (
            <svg className="w-2 h-2 text-white" viewBox="0 0 12 12" fill="none">
              <path
                d="M10 3L4.5 8.5L2 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Calendar name */}
      <span className={`text-xs truncate ${calendar.visible ? 'text-gray-700' : 'text-gray-400'}`}>
        {calendar.name}
        {calendar.isDefault && (
          <span className="ml-1 text-gray-400">Default</span>
        )}
      </span>
    </label>
  );
};

export default CalendarList;
