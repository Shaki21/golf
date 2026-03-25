/**
 * YearView Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionTitle } from '../../../components/typography';

const YearView = ({
  currentYear,
  sessionsByMonth = {},
  onMonthClick,
  onNavigate,
  periods = []
}) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
  const weekDays = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYearToday = today.getFullYear();

  // Period colors using semantic tokens
  const getPeriodColor = (month) => {
    const period = periods.find(p => p.months?.includes(month));
    if (period) {
      const periodColors = {
        evaluering: 'var(--text-tertiary)',
        grunnperiode: 'rgb(var(--tier-gold))',
        spesialisering: 'rgb(var(--tier-navy))',
        turnering: 'rgb(var(--status-warning))',
      };
      return periodColors[period.type] || null;
    }
    return null;
  };

  const renderMiniMonth = (monthIndex) => {
    const firstDay = new Date(currentYear, monthIndex, 1);
    const lastDay = new Date(currentYear, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-4 h-4" />);
    }
    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = currentYear === currentYearToday &&
                      monthIndex === currentMonth &&
                      d === today.getDate();
      const hasSessions = sessionsByMonth[monthIndex]?.[d]?.length > 0;

      days.push(
        <div
          key={d}
          className={`w-4 h-4 flex items-center justify-center text-[9px] rounded-sm ${
            isToday ? 'bg-tier-navy text-white font-bold' :
            hasSessions ? 'bg-tier-navy/20 text-tier-navy' :
            'text-tier-navy'
          }`}
        >
          {d}
        </div>
      );
    }

    const periodColor = getPeriodColor(monthIndex);
    const isCurrentMonth = currentYear === currentYearToday && monthIndex === currentMonth;
    const monthSessions = Object.values(sessionsByMonth[monthIndex] || {}).flat();
    const totalSessions = monthSessions.length;
    const completedSessions = monthSessions.filter(s => s.status === 'completed').length;

    return (
      <div
        key={monthIndex}
        className={`p-3 rounded-xl cursor-pointer transition-all hover:shadow-md ${
          isCurrentMonth ? 'ring-2 ring-tier-navy' : 'border border-tier-border-default'
        }`}
        style={{
          backgroundColor: periodColor ? `${periodColor}08` : 'var(--surface-card)'
        }}
        onClick={() => onMonthClick?.(monthIndex)}
      >
        {/* Month Header */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-semibold ${
            isCurrentMonth ? 'text-tier-navy' : 'text-tier-navy'
          }`}>
            {monthNames[monthIndex]}
          </span>
          {totalSessions > 0 && (
            <span className="text-[10px] text-tier-text-secondary">
              {completedSessions}/{totalSessions}
            </span>
          )}
        </div>

        {/* Period Indicator */}
        {periodColor && (
          <div
            className="h-1 rounded-full mb-2"
            style={{ backgroundColor: periodColor }}
          />
        )}

        {/* Mini Week Header */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekDays.map((day, i) => (
            <div key={i} className="w-4 h-3 flex items-center justify-center text-[8px] text-tier-text-tertiary">
              {day}
            </div>
          ))}
        </div>

        {/* Mini Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-tier-white rounded-xl border border-tier-border-default overflow-hidden">
      {/* Year Header */}
      <div className="flex items-center justify-between p-4 border-b border-tier-border-default">
        <button
          onClick={() => onNavigate?.(-1)}
          className="p-2 hover:bg-tier-surface-base rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-tier-text-secondary" />
        </button>
        <SectionTitle className="text-xl font-bold text-tier-navy">{currentYear}</SectionTitle>
        <button
          onClick={() => onNavigate?.(1)}
          className="p-2 hover:bg-tier-surface-base rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="text-tier-text-secondary" />
        </button>
      </div>

      {/* Period Legend */}
      {periods.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-2 border-b border-tier-border-default bg-tier-surface-base/50">
          <span className="text-xs text-tier-text-secondary">Perioder:</span>
          {[
            { type: 'evaluering', label: 'Evaluering', color: 'var(--text-tertiary)' },
            { type: 'grunnperiode', label: 'Grunnperiode', color: 'rgb(var(--tier-gold))' },
            { type: 'spesialisering', label: 'Spesialisering', color: 'rgb(var(--tier-navy))' },
            { type: 'turnering', label: 'Turnering', color: 'rgb(var(--status-warning))' },
          ].map(p => (
            <div key={p.type} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: p.color }} />
              <span className="text-xs text-tier-navy">{p.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Months Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, i) => renderMiniMonth(i))}
      </div>

      {/* Year Stats */}
      <div className="border-t border-tier-border-default p-4 bg-tier-surface-base/30">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-tier-navy">
              {Object.values(sessionsByMonth).reduce((acc, month) =>
                acc + Object.values(month).flat().length, 0
              )}
            </div>
            <div className="text-xs text-tier-text-secondary">Totalt økter</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-tier-success">
              {Object.values(sessionsByMonth).reduce((acc, month) =>
                acc + Object.values(month).flat().filter(s => s.status === 'completed').length, 0
              )}
            </div>
            <div className="text-xs text-tier-text-secondary">Fullført</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-tier-warning">
              {Object.values(sessionsByMonth).reduce((acc, month) =>
                acc + Object.values(month).flat().reduce((sum, s) => sum + (s.duration || 0), 0), 0
              ) / 60}t
            </div>
            <div className="text-xs text-tier-text-secondary">Timer trent</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-tier-navy">
              {periods.length || 4}
            </div>
            <div className="text-xs text-tier-text-secondary">Perioder</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearView;
