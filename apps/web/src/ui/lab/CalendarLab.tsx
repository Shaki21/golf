import React, { useState } from 'react';
import AppShellTemplate from '../templates/AppShellTemplate';
import CalendarTemplate, { CalendarSession } from '../templates/CalendarTemplate';
import WeekView from '../../features/calendar/views/WeekView';
import { SubSectionTitle } from '../../components/typography';

/**
 * CalendarLab - Demo page for CalendarTemplate
 * Shows a week view with example sessions inside AppShellTemplate
 */
// WeekView session format (keyed by day number)
interface WeekViewSession {
  id: number;
  time: string;
  name: string;
  type: string;
  duration: number;
  level: string;
  status: string;
  location?: string;
}

const CalendarLab: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'template' | 'weekview'>('template');

  // Generate WeekView-format sessions (keyed by day number)
  const getWeekViewSessions = (): Record<number, WeekViewSession[]> => {
    const today = new Date();
    const sessions: Record<number, WeekViewSession[]> = {};

    // Today's sessions
    sessions[today.getDate()] = [
      { id: 1, time: '09:00', name: 'Putting practice', type: 'technique', duration: 90, level: 'L3', status: 'upcoming', location: 'Indoor Range' },
      { id: 2, time: '14:00', name: 'Video analysis with coach', type: 'golf shots', duration: 60, level: 'L4', status: 'upcoming', location: 'Training center' },
    ];

    // Tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    sessions[tomorrow.getDate()] = [
      { id: 3, time: '10:00', name: 'Driving range', type: 'golf shots', duration: 90, level: 'L3', status: 'upcoming', location: 'Range' },
    ];

    // Day after tomorrow
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    sessions[dayAfter.getDate()] = [
      { id: 4, time: '08:00', name: 'Club tournament', type: 'competition', duration: 480, level: 'L5', status: 'upcoming', location: 'Holtsmark GK' },
    ];

    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    sessions[yesterday.getDate()] = [
      { id: 5, time: '11:00', name: 'Technique test', type: 'technique', duration: 60, level: 'L3', status: 'completed' },
    ];

    // Two days ago - multiple sessions
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    sessions[twoDaysAgo.getDate()] = [
      { id: 6, time: '07:00', name: 'Morning training', type: 'physical', duration: 60, level: 'L2', status: 'completed', location: 'Gym' },
      { id: 7, time: '10:00', name: 'Short game', type: 'game', duration: 60, level: 'L3', status: 'completed' },
      { id: 8, time: '14:00', name: 'Putting drill', type: 'technique', duration: 60, level: 'L4', status: 'completed' },
      { id: 9, time: '18:00', name: 'Evening round', type: 'game', duration: 120, level: 'L3', status: 'completed' },
    ];

    return sessions;
  };

  // Generate example sessions for the current week
  const getExampleSessions = (): CalendarSession[] => {
    const today = new Date();
    const sessions: CalendarSession[] = [];

    // Helper to format date as YYYY-MM-DD
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    // Today's sessions
    sessions.push({
      id: '1',
      title: 'Putting practice',
      start: '09:00',
      end: '10:30',
      date: formatDate(today),
      meta: 'training',
    });
    sessions.push({
      id: '2',
      title: 'Video analysis with coach',
      start: '14:00',
      end: '15:00',
      date: formatDate(today),
      meta: 'session',
    });

    // Tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    sessions.push({
      id: '3',
      title: 'Driving range',
      start: '10:00',
      end: '11:30',
      date: formatDate(tomorrow),
      meta: 'training',
    });

    // Day after tomorrow
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    sessions.push({
      id: '4',
      title: 'Club tournament',
      start: '08:00',
      end: '16:00',
      date: formatDate(dayAfter),
      meta: 'tournament',
    });

    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    sessions.push({
      id: '5',
      title: 'Technique test',
      start: '11:00',
      end: '12:00',
      date: formatDate(yesterday),
      meta: 'test',
    });

    // Two days ago - multiple sessions
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    sessions.push({
      id: '6',
      title: 'Morning training',
      start: '07:00',
      end: '08:00',
      date: formatDate(twoDaysAgo),
      meta: 'training',
    });
    sessions.push({
      id: '7',
      title: 'Short game',
      start: '10:00',
      end: '11:00',
      date: formatDate(twoDaysAgo),
      meta: 'training',
    });
    sessions.push({
      id: '8',
      title: 'Putting drill',
      start: '14:00',
      end: '15:00',
      date: formatDate(twoDaysAgo),
      meta: 'session',
    });
    sessions.push({
      id: '9',
      title: 'Evening round',
      start: '18:00',
      end: '20:00',
      date: formatDate(twoDaysAgo),
      meta: 'training',
    });

    return sessions;
  };

  const sessions = getExampleSessions();
  const weekViewSessions = getWeekViewSessions();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSessionSelect = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      alert(`Selected session: ${session.title}\n${session.start} - ${session.end}`);
    }
  };

  const handleWeekViewSessionClick = (session: WeekViewSession, date: Date) => {
    alert(`WeekView Session: ${session.name}\nTime: ${session.time}\nType: ${session.type}\nDate: ${date.toLocaleDateString('en-US')}`);
  };

  const handleNavigate = (direction: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + direction * 7);
    setSelectedDate(newDate);
  };

  // Bottom navigation for demo
  const bottomNavContent = (
    <div className="flex justify-around py-2">
      <button className="flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer p-1">
        <span className="text-xl">Home</span>
        <span className="text-[9px] text-tier-text-secondary">Home</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer p-1 text-tier-gold">
        <span className="text-xl">Cal</span>
        <span className="text-[9px] text-tier-text-secondary">Calendar</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer p-1">
        <span className="text-xl">Stats</span>
        <span className="text-[9px] text-tier-text-secondary">Statistics</span>
      </button>
      <button className="flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer p-1">
        <span className="text-xl">Cog</span>
        <span className="text-[9px] text-tier-text-secondary">Settings</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* View Toggle */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          className={`py-2 px-4 rounded-lg border cursor-pointer text-[11px] transition-all ${
            activeView === 'template'
              ? 'bg-tier-gold text-white border-tier-gold'
              : 'bg-transparent text-white/60 border-white/20'
          }`}
          onClick={() => setActiveView('template')}
        >
          CalendarTemplate
        </button>
        <button
          className={`py-2 px-4 rounded-lg border cursor-pointer text-[11px] transition-all ${
            activeView === 'weekview'
              ? 'bg-tier-gold text-white border-tier-gold'
              : 'bg-transparent text-white/60 border-white/20'
          }`}
          onClick={() => setActiveView('weekview')}
        >
          WeekView (ny)
        </button>
      </div>

      {/* Demo Frame */}
      <div className={`mx-auto rounded-xl overflow-hidden shadow-2xl h-[700px] relative ${
        activeView === 'weekview' ? 'max-w-[1536px] bg-white' : 'max-w-[480px]'
      }`}>
        {activeView === 'template' ? (
          <AppShellTemplate
            title="Calendar"
            subtitle="Your training week"
            bottomNav={bottomNavContent}
          >
            <CalendarTemplate
              selectedDate={selectedDate}
              sessions={sessions}
              onSelectDate={handleDateSelect}
              onSelectSession={handleSessionSelect}
            />
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 p-3 bg-tier-surface-subtle rounded-lg">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-tier-gold" />
                <span className="text-[10px] text-tier-text-secondary">Training</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[10px] text-tier-text-secondary">Tournament</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] text-tier-text-secondary">Test</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] text-tier-text-secondary">Session</span>
              </div>
            </div>
          </AppShellTemplate>
        ) : (
          <WeekView
            currentDate={selectedDate}
            sessions={weekViewSessions}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onSessionClick={handleWeekViewSessionClick}
            onNavigate={handleNavigate}
            onAddEvent={() => alert('Add new event')}
          />
        )}
      </div>

      {/* Info Panel */}
      <div className="max-w-[480px] mx-auto mt-6 p-4 bg-white/5 rounded-lg text-white/80">
        <SubSectionTitle className="text-lg font-semibold mb-3 text-white">
          CalendarTemplate Props
        </SubSectionTitle>
        <ul className="list-none p-0 m-0 text-[11px] leading-loose">
          <li>
            <code>selectedDate: Date</code> - Selected date
          </li>
          <li>
            <code>sessions: CalendarSession[]</code> - List of sessions
          </li>
          <li>
            <code>onSelectDate?: (date: Date) =&gt; void</code> - Callback on day click
          </li>
          <li>
            <code>onSelectSession?: (id: string) =&gt; void</code> - Callback on session click
          </li>
          <li>
            <code>className?: string</code> - Extra CSS class
          </li>
        </ul>

        <SubSectionTitle className="text-lg font-semibold mb-3 text-white mt-4">
          CalendarSession Interface
        </SubSectionTitle>
        <pre className="bg-black/30 p-3 rounded text-[10px] font-mono overflow-auto">
{`{
  id: string
  title: string
  start: string   // "08:00"
  end: string     // "09:00"
  date: string    // "YYYY-MM-DD"
  meta?: string   // session type
}`}
        </pre>
      </div>
    </div>
  );
};

export default CalendarLab;
