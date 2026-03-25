/**
 * RecurrenceSelector.jsx
 * Design System v3.0 - Premium Light
 *
 * FASE 5: Recurrence selector for repeating training sessions
 *
 * Supports:
 * - No recurrence (one-time session)
 * - Daily recurrence
 * - Weekly recurrence (with day selection)
 * - Monthly recurrence
 * - Custom end date or count
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Repeat, X } from 'lucide-react';

const RECURRENCE_TYPES = [
  { value: 'none', label: 'Ingen repetisjon', description: 'Engangsøkt' },
  { value: 'daily', label: 'Daglig', description: 'Hver dag' },
  { value: 'weekly', label: 'Ukentlig', description: 'Hver uke' },
  { value: 'monthly', label: 'Månedlig', description: 'Hver måned' },
];

const WEEKDAYS = [
  { value: 'MO', label: 'Man', fullLabel: 'Mandag' },
  { value: 'TU', label: 'Tir', fullLabel: 'Tirsdag' },
  { value: 'WE', label: 'Ons', fullLabel: 'Onsdag' },
  { value: 'TH', label: 'Tor', fullLabel: 'Torsdag' },
  { value: 'FR', label: 'Fre', fullLabel: 'Fredag' },
  { value: 'SA', label: 'Lør', fullLabel: 'Lørdag' },
  { value: 'SU', label: 'Søn', fullLabel: 'Søndag' },
];

export const RecurrenceSelector = ({ value, onChange }) => {
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [endType, setEndType] = useState('count'); // 'count' or 'date'
  const [count, setCount] = useState(5);
  const [endDate, setEndDate] = useState('');
  const [selectedDays, setSelectedDays] = useState(['MO', 'WE', 'FR']); // Default for weekly
  const [interval, setInterval] = useState(1); // Every N days/weeks/months

  useEffect(() => {
    if (value && value.rule) {
      // Parse existing RRULE
      parseRRule(value.rule);
    }
  }, [value]);

  useEffect(() => {
    // Generate RRULE and notify parent
    if (recurrenceType === 'none') {
      onChange({ rule: null, endDate: null, count: null });
      return;
    }

    const rrule = generateRRule();
    onChange({
      rule: rrule,
      endDate: endType === 'date' ? endDate : null,
      count: endType === 'count' ? count : null,
    });
  }, [recurrenceType, endType, count, endDate, selectedDays, interval]);

  const parseRRule = (rrule) => {
    // Basic RRULE parser
    if (rrule.includes('FREQ=DAILY')) {
      setRecurrenceType('daily');
    } else if (rrule.includes('FREQ=WEEKLY')) {
      setRecurrenceType('weekly');
      const byDayMatch = rrule.match(/BYDAY=([A-Z,]+)/);
      if (byDayMatch) {
        setSelectedDays(byDayMatch[1].split(','));
      }
    } else if (rrule.includes('FREQ=MONTHLY')) {
      setRecurrenceType('monthly');
    }

    const countMatch = rrule.match(/COUNT=(\d+)/);
    if (countMatch) {
      setEndType('count');
      setCount(parseInt(countMatch[1]));
    }

    const untilMatch = rrule.match(/UNTIL=(\d{8})/);
    if (untilMatch) {
      setEndType('date');
      // Convert YYYYMMDD to YYYY-MM-DD
      const dateStr = untilMatch[1];
      setEndDate(`${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`);
    }
  };

  const generateRRule = () => {
    let rrule = '';

    // Frequency
    if (recurrenceType === 'daily') {
      rrule = `FREQ=DAILY`;
    } else if (recurrenceType === 'weekly') {
      rrule = `FREQ=WEEKLY;BYDAY=${selectedDays.join(',')}`;
    } else if (recurrenceType === 'monthly') {
      rrule = `FREQ=MONTHLY`;
    }

    // Interval
    if (interval > 1) {
      rrule += `;INTERVAL=${interval}`;
    }

    // End condition
    if (endType === 'count') {
      rrule += `;COUNT=${count}`;
    } else if (endType === 'date' && endDate) {
      // Convert YYYY-MM-DD to YYYYMMDD
      const dateStr = endDate.replace(/-/g, '');
      rrule += `;UNTIL=${dateStr}`;
    }

    return rrule;
  };

  const toggleWeekday = (day) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Recurrence Type */}
      <div>
        <label className="block mb-2 text-xs font-medium text-tier-text-secondary">
          <Repeat size={14} className="inline mr-1" />
          Repetisjon
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RECURRENCE_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setRecurrenceType(type.value)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                recurrenceType === type.value
                  ? 'bg-tier-navy/10 border-tier-navy'
                  : 'bg-tier-surface-base border-transparent hover:border-tier-border-default'
              }`}
            >
              <div className="font-medium text-sm text-tier-navy">{type.label}</div>
              <div className="text-xs text-tier-text-tertiary">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly: Day Selection */}
      {recurrenceType === 'weekly' && (
        <div>
          <label className="block mb-2 text-xs font-medium text-tier-text-secondary">
            Velg dager
          </label>
          <div className="flex gap-2 flex-wrap">
            {WEEKDAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleWeekday(day.value)}
                className={`w-12 h-12 rounded-lg border-2 transition-all font-medium text-sm ${
                  selectedDays.includes(day.value)
                    ? 'bg-tier-navy text-white border-tier-navy'
                    : 'bg-tier-surface-base text-tier-text-secondary border-tier-border-default hover:border-tier-navy'
                }`}
                title={day.fullLabel}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interval (Every N days/weeks/months) */}
      {recurrenceType !== 'none' && (
        <div>
          <label className="block mb-2 text-xs font-medium text-tier-text-secondary">
            Hver {interval}. {recurrenceType === 'daily' ? 'dag' : recurrenceType === 'weekly' ? 'uke' : 'måned'}
          </label>
          <input
            type="range"
            min="1"
            max="4"
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-tier-text-tertiary mt-1">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
          </div>
        </div>
      )}

      {/* End Condition */}
      {recurrenceType !== 'none' && (
        <div>
          <label className="block mb-2 text-xs font-medium text-tier-text-secondary">
            Avslutt etter
          </label>
          <div className="space-y-3">
            {/* Count */}
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="end-count"
                checked={endType === 'count'}
                onChange={() => setEndType('count')}
                className="w-4 h-4"
              />
              <label htmlFor="end-count" className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={count}
                  onChange={(e) => {
                    setCount(parseInt(e.target.value) || 1);
                    setEndType('count');
                  }}
                  className="w-20 p-2 bg-tier-surface-base border border-tier-border-default rounded"
                />
                <span className="text-sm text-tier-text-secondary">økter</span>
              </label>
            </div>

            {/* Date */}
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="end-date"
                checked={endType === 'date'}
                onChange={() => setEndType('date')}
                className="w-4 h-4"
              />
              <label htmlFor="end-date" className="flex-1 flex items-center gap-2">
                <Calendar size={16} className="text-tier-text-tertiary" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setEndType('date');
                  }}
                  className="flex-1 p-2 bg-tier-surface-base border border-tier-border-default rounded"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {recurrenceType !== 'none' && (
        <div className="p-3 bg-tier-surface-base rounded-lg border border-tier-border-default">
          <div className="text-xs font-medium text-tier-text-secondary mb-1">RRULE Preview:</div>
          <div className="font-mono text-xs text-tier-navy break-all">{generateRRule()}</div>
        </div>
      )}
    </div>
  );
};

export default RecurrenceSelector;
