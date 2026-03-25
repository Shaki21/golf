/**
 * TIER Golf - Progress Dashboard
 * Design System v3.0 - Premium Light
 *
 * Redesigned progress tracking with modern visualizations,
 * engaging stats, and motivational elements.
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Flame,
  CheckCircle,
  Clock,
  Calendar,
  ChevronRight,
  Target,
  Award,
  Zap,
  BarChart3,
  ArrowUp,
  ArrowDown,
  HelpCircle,
} from 'lucide-react';
import StateCard from '../../ui/composites/StateCard';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROGRESS RING COMPONENT
// ============================================================================

function ProgressRing({ progress, size = 120, strokeWidth = 10, color = 'var(--tier-navy)', textColor = 'text-tier-navy' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--border-color))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${textColor}`}>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({ icon: Icon, title, value, subtitle, trend, color = 'primary' }) {
  const colorClasses = {
    primary: { icon: 'text-tier-navy', bg: 'bg-tier-navy/10' },
    success: { icon: 'text-emerald-500', bg: 'bg-emerald-50' },
    warning: { icon: 'text-amber-500', bg: 'bg-amber-50' },
    gold: { icon: 'text-amber-600', bg: 'bg-amber-100' },
  };

  const colors = colorClasses[color] || colorClasses.primary;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-tier-border-default hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon size={22} className={colors.icon} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-tier-navy mb-1">{value}</div>
      <div className="text-sm text-tier-text-secondary">{title}</div>
      {subtitle && <div className="text-xs text-tier-text-tertiary mt-1">{subtitle}</div>}
    </div>
  );
}

// ============================================================================
// WEEK BAR COMPONENT
// ============================================================================

function WeekBar({ week, hours, maxHours, isCurrentWeek }) {
  const percentage = (hours / maxHours) * 100;

  return (
    <div className={`flex items-center gap-4 py-2 ${isCurrentWeek ? 'bg-tier-navy/5 -mx-4 px-4 rounded-lg' : ''}`}>
      <span className={`text-sm w-14 flex-shrink-0 ${isCurrentWeek ? 'font-semibold text-tier-navy' : 'text-tier-text-secondary'}`}>
        Week {week}
      </span>
      <div className="flex-1 h-8 bg-tier-surface-base rounded-lg overflow-hidden relative">
        <div
          className={`h-full rounded-lg transition-all duration-500 flex items-center ${
            isCurrentWeek ? 'bg-gradient-to-r from-tier-navy to-tier-navy/70' : 'bg-emerald-500/80'
          }`}
          style={{ width: `${Math.max(percentage, 5)}%` }}
        >
          {percentage > 20 && (
            <span className="ml-auto mr-3 text-white text-xs font-semibold">
              {hours}t
            </span>
          )}
        </div>
        {percentage <= 20 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tier-text-secondary">
            {hours}t
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PERIOD CARD COMPONENT
// ============================================================================

function PeriodCard({ name, progress, sessions, hours, color, isActive }) {
  return (
    <div className={`relative rounded-2xl p-5 border-2 transition-all ${
      isActive
        ? `border-${color}-400 bg-${color}-50/50 shadow-md`
        : 'border-transparent bg-white shadow-sm hover:shadow-md'
    }`}>
      {isActive && (
        <div className={`absolute -top-2 left-4 px-2 py-0.5 bg-${color}-500 text-white text-[10px] font-semibold rounded-full`}>
          ACTIVE PERIOD
        </div>
      )}
      <div className="mb-4">
        <span className="font-semibold text-tier-navy">{name}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-tier-text-secondary">Progress</span>
          <span className="font-semibold text-tier-navy">{progress}%</span>
        </div>
        <div className="h-2.5 bg-tier-surface-base rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress >= 80 ? 'bg-emerald-500' : progress >= 50 ? 'bg-amber-500' : 'bg-tier-navy'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-sm">
        <div>
          <span className="text-tier-text-tertiary">Sessions</span>
          <p className="font-semibold text-tier-navy">{sessions}</p>
        </div>
        <div className="text-right">
          <span className="text-tier-text-tertiary">Hours</span>
          <p className="font-semibold text-tier-navy">{hours}h</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SESSION ITEM COMPONENT
// ============================================================================

function SessionItem({ session, isNext }) {
  const date = new Date(session.date);
  const dayName = date.toLocaleDateString('nb-NO', { weekday: 'short' });
  const dayNum = date.getDate();
  const month = date.toLocaleDateString('nb-NO', { month: 'short' });

  const periodColors = {
    E: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Tee Total' },
    G: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Innspill' },
    S: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Naerspill' },
    T: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Putting' },
  };

  const periodStyle = periodColors[session.period] || periodColors.G;

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
      isNext ? 'bg-tier-navy/5 border-2 border-tier-navy/20' : 'bg-white hover:bg-tier-surface-base'
    }`}>
      {/* Date block */}
      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
        isNext ? 'bg-tier-navy text-white' : 'bg-tier-surface-base text-tier-navy'
      }`}>
        <span className="text-[10px] uppercase font-medium opacity-80">{dayName}</span>
        <span className="text-xl font-bold leading-none">{dayNum}</span>
        <span className="text-[10px] opacity-80">{month}</span>
      </div>

      {/* Session info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-tier-navy truncate">{session.type}</h4>
          {isNext && (
            <span className="px-2 py-0.5 bg-tier-navy text-white text-[10px] font-semibold rounded-full">
              NEXT
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${periodStyle.bg} ${periodStyle.text}`}>
            {periodStyle.label}
          </span>
        </div>
      </div>

      {/* Duration */}
      <div className="text-right flex-shrink-0">
        <div className="text-lg font-bold text-tier-navy">{session.duration}</div>
        <div className="text-xs text-tier-text-tertiary">minutes</div>
      </div>

      <ChevronRight size={20} className="text-tier-text-tertiary flex-shrink-0" />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProgressDashboard({ data }) {
  const [selectedWeekView, setSelectedWeekView] = useState('4w');

  if (!data) return <StateCard variant="loading" title="Loading activity data..." />;

  const { overview, weeklyTrend, periodBreakdown, upcomingSessions } = data;

  // Calculate max hours for scaling
  const maxHours = Math.max(...weeklyTrend.map(w => w.totalHours), 1);

  // Get current week number
  const currentWeekNum = Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));

  // Golf skill area names (no emojis for cleaner UI)
  const periodNames = { E: 'Tee Total', G: 'Innspill', S: 'Naerspill', T: 'Putting' };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Progress Ring */}
        <div className="lg:col-span-1 bg-gradient-to-br from-tier-navy to-tier-navy/80 rounded-3xl p-6 text-white">
          <div className="flex flex-col items-center text-center">
            <SectionTitle style={{ marginBottom: 0 }}>Completion rate</SectionTitle>
            <div className="relative mb-4">
              <ProgressRing
                progress={overview.completionRate}
                size={140}
                strokeWidth={12}
                color="white"
                textColor="text-white"
              />
            </div>
            <p className="text-sm opacity-80">
              You are {overview.completionRate >= 80 ? 'ahead of' : overview.completionRate >= 50 ? 'on' : 'behind'} schedule
            </p>
            <div className="mt-4 pt-4 border-t border-white/20 w-full flex justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold">{overview.totalSessionsCompleted}</div>
                <div className="text-xs opacity-80">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{overview.totalSessionsPlanned - overview.totalSessionsCompleted}</div>
                <div className="text-xs opacity-80">Remaining</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard
            icon={Flame}
            title="Daily streak"
            value={`${overview.currentStreak} days`}
            subtitle={overview.currentStreak > 0 ? "Keep it going!" : "Start your streak today!"}
            color="warning"
          />
          <StatCard
            icon={CheckCircle}
            title="Sessions completed"
            value={`${overview.totalSessionsCompleted}/${overview.totalSessionsPlanned}`}
            subtitle="this month"
            trend={12}
            color="success"
          />
          <StatCard
            icon={Clock}
            title="Total training time"
            value={`${overview.totalHoursCompleted}h`}
            subtitle="last 30 days"
            trend={8}
            color="gold"
          />
          <StatCard
            icon={Target}
            title="Weekly goal"
            value={`${Math.round(overview.totalHoursCompleted / 4)}h/week`}
            subtitle="average"
            color="primary"
          />
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white rounded-3xl shadow-sm border border-tier-border-default p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tier-navy/10 flex items-center justify-center">
              <BarChart3 size={20} className="text-tier-navy" />
            </div>
            <div>
              <SubSectionTitle style={{ marginBottom: 0 }}>12-week activity</SubSectionTitle>
              <p className="text-sm text-tier-text-secondary">Your training history</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['all', '4w'].map((view) => (
              <button
                key={view}
                onClick={() => setSelectedWeekView(view)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedWeekView === view
                    ? 'bg-tier-navy text-white'
                    : 'text-tier-text-secondary hover:bg-tier-surface-base'
                }`}
              >
                {view === 'all' ? '12 weeks' : '4 weeks'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {weeklyTrend
            .slice(selectedWeekView === '4w' ? -4 : 0)
            .map((week, i) => {
              const weekNum = 12 - (selectedWeekView === '4w' ? 3 - i : 11 - i);
              return (
                <WeekBar
                  key={i}
                  week={weekNum}
                  hours={week.totalHours}
                  maxHours={maxHours}
                  isCurrentWeek={weekNum === currentWeekNum % 12 || weekNum === 12}
                />
              );
            })}
        </div>

        {/* Summary stats */}
        <div className="mt-6 pt-6 border-t border-tier-border-default grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-tier-navy">
              {weeklyTrend.reduce((sum, w) => sum + w.totalHours, 0)}h
            </div>
            <div className="text-sm text-tier-text-secondary">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {Math.round(weeklyTrend.reduce((sum, w) => sum + w.completionRate, 0) / weeklyTrend.length)}%
            </div>
            <div className="text-sm text-tier-text-secondary">Avg completion</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-tier-navy">
              {Math.round(weeklyTrend.reduce((sum, w) => sum + w.totalHours, 0) / weeklyTrend.length)}h
            </div>
            <div className="text-sm text-tier-text-secondary">Per week</div>
          </div>
        </div>
      </div>

      {/* Period Breakdown */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Zap size={20} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <SubSectionTitle style={{ marginBottom: 0 }}>Training focus</SubSectionTitle>
              <Tooltip text="Shows distribution of training time across the four main areas in golf">
                <HelpCircle size={16} className="text-tier-text-tertiary hover:text-tier-navy transition-colors" />
              </Tooltip>
            </div>
            <p className="text-sm text-tier-text-secondary">Distribution of training per skill area</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(periodBreakdown).map(([period, stats], index) => (
            <PeriodCard
              key={period}
              name={periodNames[period]}
              progress={Math.round(stats.completionRate)}
              sessions={`${stats.completed}/${stats.planned}`}
              hours={stats.totalHours}
              color={period === 'G' ? 'blue' : period === 'S' ? 'emerald' : period === 'T' ? 'amber' : 'purple'}
              isActive={index === 1} // G is typically active
            />
          ))}
        </div>
      </div>

      {/* Motivation Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Award size={28} />
          </div>
          <div className="flex-1">
            <SubSectionTitle style={{ marginBottom: 0 }}>
              {overview.completionRate >= 80
                ? 'Fantastic effort!'
                : overview.completionRate >= 50
                ? 'You are on track!'
                : 'Time to take action!'}
            </SubSectionTitle>
            <p className="text-sm opacity-90 mt-1">
              {overview.completionRate >= 80
                ? `You have completed ${overview.totalSessionsCompleted} sessions this month. Keep it up!`
                : overview.completionRate >= 50
                ? `Only ${overview.totalSessionsPlanned - overview.totalSessionsCompleted} sessions left to reach your goal.`
                : `Start with one session today and build momentum from there.`}
            </p>
          </div>
          <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
            {overview.completionRate >= 80 ? 'View achievements' : 'Start session'}
          </button>
        </div>
      </div>
    </div>
  );
}
