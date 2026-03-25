import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Trophy, Target, CheckCircle2,
  Play, Bell, ChevronRight, Crosshair, Zap, Sparkles,
  Award, TrendingUp, Calendar
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useFocus } from '../../hooks/useFocus';
import { CalendarOversiktWidget } from '../calendar-oversikt';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography';

/**
 * TIERGolfDashboard V3.1 - UX Redesign
 *
 * Forbedringer basert på UX-analyse:
 * - P1: Redusert KPI-visning, oppgaver flyttet opp
 * - P2: Kontekstualisert CTA med spesifikk info
 * - P3: No 0-shaming, progress feedback
 * - P4: Lavterskel start, adaptiv feedback
 *
 * Ny struktur:
 * - Zone A: Welcome + FocusCard + Primary CTA
 * - Zone B: TasksList (flyttet opp!) + QuickStart
 * - Zone C: ProgressStrip (kompakt) + Notifications
 */

// ===== HELPER FUNCTIONS =====

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getDayOfWeek = () => new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

const getDaysUntil = (date) => {
  if (!date) return null;
  const targetDate = new Date(date);
  const today = new Date();
  const diffTime = targetDate - today;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

/**
 * Adaptiv motivasjonsmelding basert på progresjon og ukedag
 * P4: Psykologisk friksjonsreduksjon
 */
const getMotivationalMessage = (stats, dayOfWeek) => {
  const { sessionsCompleted, sessionsTotal, streak } = stats;
  const completionRate = sessionsTotal > 0 ? (sessionsCompleted / sessionsTotal) * 100 : 0;

  // Streak-based messages
  if (streak > 7) return 'Impressive streak! Keep the momentum.';
  if (streak > 3) return `${streak} days in a row – building great habits!`;

  // Progress-based messages
  if (completionRate >= 100) return 'Week completed! You are on fire.';
  if (completionRate >= 75) return 'Almost there – strong effort!';
  if (completionRate >= 50) return 'Halfway – well on track!';
  if (completionRate >= 25) return 'Good start to the week!';

  // Day-of-week messages (no sessions yet)
  if (sessionsCompleted === 0) {
    if (dayOfWeek === 1) return 'New week – set the standard early!';
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'Weekend training? Always great!';
    if (dayOfWeek <= 3) return 'Get started – the week has just begun.';
    return 'New opportunity today!';
  }

  return 'Every session counts.';
};

// ===== COMPONENT LABELS =====

const COMPONENT_LABELS = {
  OTT: 'Tee Shots',
  APP: 'Approach',
  ARG: 'Short Game',
  PUTT: 'Putting',
};

const COMPONENT_COLORS = {
  OTT: 'rgb(var(--status-info))',
  APP: 'rgb(var(--status-success))',
  ARG: 'rgb(var(--status-warning))',
  PUTT: 'rgb(var(--tier-gold))',
};

// ===== ZONE A COMPONENTS =====

/**
 * WelcomeSection - Med adaptiv motivasjonsmelding
 * P4: Personlig feedback basert på progresjon
 */
const WelcomeSection = ({ playerName, category, stats }) => {
  const dayOfWeek = getDayOfWeek();
  const motivationalMessage = getMotivationalMessage(stats, dayOfWeek);

  return (
    <div style={styles.welcomeSection}>
      <p style={styles.greetingText}>{getGreeting()}</p>
      <PageTitle style={styles.playerName}>{playerName?.split(' ')[0] || 'Player'}</PageTitle>
      <p style={styles.motivationalText}>{motivationalMessage}</p>
    </div>
  );
};

/**
 * FocusCard - Ukens fokus med integrert progress
 * P1: Én primær KPI
 */
const FocusCard = ({ focus, loading }) => {
  if (loading) {
    return (
      <div style={styles.focusCard}>
        <div style={styles.focusCardLoading}>
          <div style={styles.focusCardLoadingPulse} />
          <div style={{ ...styles.focusCardLoadingPulse, width: '60%' }} />
        </div>
      </div>
    );
  }

  if (!focus) {
    return (
      <div style={styles.focusCard}>
        <div style={styles.focusCardHeader}>
          <Crosshair size={16} style={{ color: 'var(--tier-navy)' }} />
          <span style={styles.focusCardLabel}>This Week's Focus</span>
        </div>
        <SubSectionTitle style={styles.focusCardTitle}>Start your first session</SubSectionTitle>
        <p style={styles.focusCardDescription}>
          Complete some tests to get personalized recommendations
        </p>
      </div>
    );
  }

  const focusColor = COMPONENT_COLORS[focus.focusComponent] || 'var(--tier-navy)';
  const focusLabel = COMPONENT_LABELS[focus.focusComponent] || focus.focusComponent;
  const sessionsCompleted = focus.sessionsCompleted || 0;
  const sessionsTarget = focus.sessionsTarget || 4;
  const progressPercent = Math.round((sessionsCompleted / sessionsTarget) * 100);

  return (
    <div style={{ ...styles.focusCard, borderLeftColor: focusColor }}>
      <div style={styles.focusCardHeader}>
        <div style={styles.focusCardHeaderLeft}>
          <Crosshair size={16} style={{ color: focusColor }} />
          <span style={styles.focusCardLabel}>This Week's Focus</span>
        </div>
        <span style={{
          ...styles.focusCardBadge,
          backgroundColor: `${focusColor}15`,
          color: focusColor,
        }}>
          {focusLabel}
        </span>
      </div>

      <SubSectionTitle style={styles.focusCardTitle}>
        {focus.approachWeakestBucket
          ? `${focusLabel}: ${focus.approachWeakestBucket.replace('_', '-')} yards`
          : focusLabel
        }
      </SubSectionTitle>

      {focus.reasonCodes?.length > 0 && (
        <p style={styles.focusCardDescription}>
          {focus.reasonCodes.includes(`weak_${focus.focusComponent.toLowerCase()}_test_cluster`)
            ? 'Your tests show improvement potential here'
            : focus.reasonCodes.includes(`high_weight_${focus.focusComponent.toLowerCase()}`)
            ? 'This area has a big impact on your score'
            : 'Recommended based on your player profile'
          }
        </p>
      )}

      {/* Progress indicator */}
      <div style={styles.focusProgressContainer}>
        <div style={styles.focusProgressTrack}>
          <div style={{
            ...styles.focusProgressFill,
            width: `${progressPercent}%`,
            backgroundColor: focusColor,
          }} />
        </div>
        <span style={styles.focusProgressLabel}>
          {sessionsCompleted} of {sessionsTarget} sessions
        </span>
      </div>

      {/* Confidence indicator */}
      {focus.confidence && (
        <div style={styles.focusConfidence}>
          <span style={{
            ...styles.focusConfidenceBadge,
            backgroundColor: focus.confidence === 'high' ? 'var(--status-success-muted)' :
                           focus.confidence === 'med' ? 'var(--tier-warning/20)' : 'rgb(var(--gray-100))',
            color: focus.confidence === 'high' ? 'rgb(var(--status-success))' :
                   focus.confidence === 'med' ? 'rgb(var(--status-warning))' : 'var(--text-tertiary)',
          }}>
            {focus.confidence === 'high' ? 'Confident recommendation' :
             focus.confidence === 'med' ? 'Moderate confidence' : 'Limited data'}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * ContextualCTA - Primær handlingsknapp med spesifikk kontekst
 * P2: "Start {title} ({duration} min)" i stedet for generisk
 */
const ContextualCTA = ({ focus, upcomingSession, onStart }) => {
  // Priority 1: Scheduled session from calendar - SPECIFIC
  if (upcomingSession) {
    const title = upcomingSession.title || 'Scheduled session';
    const duration = upcomingSession.duration || 45;

    return (
      <div style={styles.contextualCTA}>
        <button style={styles.ctaButton} onClick={() => onStart(upcomingSession)}>
          <div style={styles.ctaContent}>
            <Play size={20} style={{ flexShrink: 0 }} />
            <div style={styles.ctaTextContainer}>
              <span style={styles.ctaTitle}>Start {title}</span>
              <span style={styles.ctaSubtitle}>
                {duration} min · From your calendar
              </span>
            </div>
          </div>
          <ChevronRight size={20} style={styles.ctaArrow} />
        </button>
      </div>
    );
  }

  // Priority 2: Recommended session based on focus - SPECIFIC
  if (focus?.focusComponent) {
    const focusLabel = COMPONENT_LABELS[focus.focusComponent] || focus.focusComponent;
    const sessionDuration = focus.recommendedDuration || 30;

    return (
      <div style={styles.contextualCTA}>
        <button style={styles.ctaButton} onClick={() => onStart({ type: 'focus', focus })}>
          <div style={styles.ctaContent}>
            <Play size={20} style={{ flexShrink: 0 }} />
            <div style={styles.ctaTextContainer}>
              <span style={styles.ctaTitle}>Start {focusLabel} session</span>
              <span style={styles.ctaSubtitle}>
                {sessionDuration} min · Part of weekly goals
              </span>
            </div>
          </div>
          <ChevronRight size={20} style={styles.ctaArrow} />
        </button>
      </div>
    );
  }

  // Priority 3: Fallback - low-threshold session
  return (
    <div style={styles.contextualCTA}>
      <button style={styles.ctaButton} onClick={() => onStart({ type: 'quick' })}>
        <div style={styles.ctaContent}>
          <Play size={20} style={{ flexShrink: 0 }} />
          <div style={styles.ctaTextContainer}>
            <span style={styles.ctaTitle}>Get Started</span>
            <span style={styles.ctaSubtitle}>
              Choose a session that fits you today
            </span>
          </div>
        </div>
        <ChevronRight size={20} style={styles.ctaArrow} />
      </button>
    </div>
  );
};

/**
 * QuickStartCTA - Sekundær lavterskel-knapp
 * P4: Alltid synlig 15-min alternativ
 */
const QuickStartCTA = ({ onStart }) => (
  <button style={styles.quickStartButton} onClick={() => onStart({ type: 'quick', duration: 15 })}>
    <Zap size={16} style={{ color: 'var(--text-secondary)' }} />
    <span>Only 15 minutes? Start quick session</span>
    <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
  </button>
);

// ===== NEW MODULES: WEEKLY OVERVIEW =====

/**
 * WeekAtGlanceCard - "This week at a glance" module
 * Shows planned sessions, training hours, completed sessions with progress bars
 */
const WeekAtGlanceCard = ({ stats, loading }) => {
  if (loading) {
    return (
      <div style={weekStyles.card}>
        <div style={weekStyles.cardHeader}>
          <Calendar size={18} style={{ color: 'var(--accent)' }} />
          <span style={weekStyles.cardTitle}>This Week</span>
        </div>
        <div style={weekStyles.loadingGrid}>
          <div style={weekStyles.loadingPulse} />
          <div style={weekStyles.loadingPulse} />
          <div style={weekStyles.loadingPulse} />
        </div>
      </div>
    );
  }

  const sessionsPercent = stats.sessionsTotal > 0
    ? Math.min(Math.round((stats.sessionsCompleted / stats.sessionsTotal) * 100), 100)
    : 0;
  const hoursPercent = stats.hoursGoal > 0
    ? Math.min(Math.round((stats.hoursThisWeek / stats.hoursGoal) * 100), 100)
    : 0;

  return (
    <div style={weekStyles.card}>
      <div style={weekStyles.cardHeader}>
        <div style={weekStyles.cardHeaderLeft}>
          <Calendar size={18} style={{ color: 'var(--accent)' }} />
          <span style={weekStyles.cardTitle}>This Week</span>
        </div>
        {stats.streak > 0 && (
          <div style={weekStyles.streakBadge}>
            <span style={weekStyles.streakIcon}>🔥</span>
            <span style={weekStyles.streakValue}>{stats.streak} days</span>
          </div>
        )}
      </div>

      <div style={weekStyles.metricsGrid}>
        {/* Planned Sessions */}
        <div style={weekStyles.metricItem}>
          <div style={weekStyles.metricHeader}>
            <span style={weekStyles.metricLabel}>Planned Sessions</span>
            <span style={weekStyles.metricValue}>
              {stats.sessionsCompleted} of {stats.sessionsTotal}
            </span>
          </div>
          <div style={weekStyles.progressTrack}>
            <div
              style={{
                ...weekStyles.progressFill,
                width: `${sessionsPercent}%`,
                backgroundColor: sessionsPercent >= 100 ? 'var(--status-success)' : 'var(--accent)',
              }}
            />
          </div>
          <span style={weekStyles.metricSubtext}>
            {sessionsPercent >= 100 ? 'Goal reached!' : `${100 - sessionsPercent}% remaining`}
          </span>
        </div>

        {/* Training Hours */}
        <div style={weekStyles.metricItem}>
          <div style={weekStyles.metricHeader}>
            <span style={weekStyles.metricLabel}>Training Hours</span>
            <span style={weekStyles.metricValue}>
              {stats.hoursThisWeek}h of {stats.hoursGoal}h
            </span>
          </div>
          <div style={weekStyles.progressTrack}>
            <div
              style={{
                ...weekStyles.progressFill,
                width: `${hoursPercent}%`,
                backgroundColor: hoursPercent >= 100 ? 'var(--status-success)' : 'var(--accent)',
              }}
            />
          </div>
          <span style={weekStyles.metricSubtext}>
            {hoursPercent >= 100 ? 'Hours goal reached!' : `${stats.hoursGoal - stats.hoursThisWeek}h remaining`}
          </span>
        </div>

        {/* Completed Last 7 Days */}
        <div style={weekStyles.metricItem}>
          <div style={weekStyles.metricHeader}>
            <span style={weekStyles.metricLabel}>Completed last 7 days</span>
            <span style={weekStyles.metricValue}>{stats.sessionsCompleted} sessions</span>
          </div>
          <div style={weekStyles.completedIndicator}>
            <CheckCircle2
              size={16}
              style={{
                color: stats.sessionsCompleted > 0 ? 'var(--status-success)' : 'var(--text-tertiary)',
              }}
            />
            <span style={weekStyles.completedText}>
              {stats.sessionsCompleted > 0
                ? `${Math.round(stats.hoursThisWeek)} hours total`
                : 'No sessions yet'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * BadgesScoreCard - "Merker & Poeng" module
 * Shows rank, XP, level progress, and recent badges
 */
const BadgesScoreCard = ({ xp, totalXp, level, nextLevelXp, achievements, loading }) => {
  if (loading) {
    return (
      <div style={badgeStyles.card}>
        <div style={badgeStyles.cardHeader}>
          <Award size={18} style={{ color: 'var(--accent)' }} />
          <span style={badgeStyles.cardTitle}>Merker & Poeng</span>
        </div>
        <div style={badgeStyles.loadingContent}>
          <div style={weekStyles.loadingPulse} />
        </div>
      </div>
    );
  }

  // Determine rank based on level
  const getRankName = (lvl) => {
    if (lvl >= 20) return 'Master';
    if (lvl >= 15) return 'Expert';
    if (lvl >= 10) return 'Advanced';
    if (lvl >= 5) return 'Dedicated';
    if (lvl >= 2) return 'Active';
    return 'Beginner';
  };

  const rankName = getRankName(level || 1);
  const xpProgress = nextLevelXp > 0 ? Math.min(Math.round((xp / nextLevelXp) * 100), 100) : 0;
  const badgeCount = achievements?.length || 0;

  return (
    <div style={badgeStyles.card}>
      <div style={badgeStyles.cardHeader}>
        <Award size={18} style={{ color: 'var(--accent)' }} />
        <span style={badgeStyles.cardTitle}>Badges & Points</span>
      </div>

      <div style={badgeStyles.content}>
        {/* Rank Display */}
        <div style={badgeStyles.rankSection}>
          <div style={badgeStyles.rankBadge}>
            <Trophy size={20} style={{ color: 'var(--achievement, var(--accent))' }} />
          </div>
          <div style={badgeStyles.rankInfo}>
            <span style={badgeStyles.rankLabel}>Rank</span>
            <span style={badgeStyles.rankName}>{rankName}</span>
          </div>
        </div>

        {/* XP Progress */}
        <div style={badgeStyles.xpSection}>
          <div style={badgeStyles.xpHeader}>
            <span style={badgeStyles.xpLabel}>Level {level || 1}</span>
            <span style={badgeStyles.xpValue}>{totalXp || 0} XP</span>
          </div>
          <div style={badgeStyles.xpTrack}>
            <div
              style={{
                ...badgeStyles.xpFill,
                width: `${xpProgress}%`,
              }}
            />
          </div>
          <span style={badgeStyles.xpSubtext}>
            {xp || 0} / {nextLevelXp || 100} to next level
          </span>
        </div>

        {/* Badges Count */}
        <div style={badgeStyles.badgesSection}>
          <div style={badgeStyles.badgesStat}>
            <span style={badgeStyles.badgesCount}>{badgeCount}</span>
            <span style={badgeStyles.badgesLabel}>badges earned</span>
          </div>
          {badgeCount > 0 && achievements?.slice(0, 3).map((badge, idx) => (
            <span key={badge.id || idx} style={badgeStyles.badgeEmoji}>
              {badge.iconEmoji || '🏅'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Last7DaysVisualization - Compact 7-day strip chart
 * Shows planned vs completed for each day
 */
const Last7DaysVisualization = ({ calendarEvents, stats }) => {
  // Generate last 7 days labels (Mon-Sun)
  const dayLabels = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      result.push({
        label: days[date.getDay()],
        date: date.toISOString().split('T')[0],
        isToday: i === 0,
        dayOfWeek: date.getDay(),
      });
    }
    return result;
  }, []);

  // Simulate completion data (in real implementation, this would come from API)
  // For now, we'll show today as having events if calendarEvents exist
  const getDayStatus = (day, index) => {
    if (day.isToday && calendarEvents?.length > 0) {
      return 'has-events';
    }
    // Show completed status for past days based on streak
    if (!day.isToday && index < 6 && stats.streak > (6 - index)) {
      return 'completed';
    }
    // Weekend styling
    if (day.dayOfWeek === 0 || day.dayOfWeek === 6) {
      return 'weekend';
    }
    return 'empty';
  };

  return (
    <div style={last7Styles.container}>
      <div style={last7Styles.header}>
        <TrendingUp size={16} style={{ color: 'var(--text-secondary)' }} />
        <span style={last7Styles.title}>Last 7 days</span>
      </div>

      <div style={last7Styles.stripContainer}>
        {dayLabels.map((day, index) => {
          const status = getDayStatus(day, index);
          return (
            <div key={day.date} style={last7Styles.dayColumn}>
              <span style={{
                ...last7Styles.dayLabel,
                color: day.isToday ? 'var(--accent)' : 'var(--text-tertiary)',
                fontWeight: day.isToday ? 600 : 400,
              }}>
                {day.label}
              </span>
              <div style={{
                ...last7Styles.dayIndicator,
                backgroundColor:
                  status === 'completed' ? 'var(--status-success)' :
                  status === 'has-events' ? 'var(--accent)' :
                  status === 'weekend' ? 'var(--background-elevated)' :
                  'var(--background-surface)',
                border: day.isToday ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
              }}>
                {status === 'completed' && (
                  <CheckCircle2 size={12} style={{ color: 'var(--text-inverse)' }} />
                )}
                {status === 'has-events' && (
                  <span style={last7Styles.eventDot} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={last7Styles.legend}>
        <div style={last7Styles.legendItem}>
          <div style={{ ...last7Styles.legendDot, backgroundColor: 'var(--status-success)' }} />
          <span>Completed</span>
        </div>
        <div style={last7Styles.legendItem}>
          <div style={{ ...last7Styles.legendDot, backgroundColor: 'var(--accent)' }} />
          <span>Today</span>
        </div>
        <div style={last7Styles.legendItem}>
          <div style={{ ...last7Styles.legendDot, backgroundColor: 'var(--background-surface)', border: '1px solid var(--border-subtle)' }} />
          <span>No data</span>
        </div>
      </div>
    </div>
  );
};

// ===== ZONE B COMPONENTS =====

/**
 * TasksList - Oppgaver (FLYTTET OPP fra Zone C)
 * P1: Oppgaver høyere i hierarkiet
 * P2: Koble oppgaver til handling
 */
const TasksList = ({ tasks, onToggle, onViewAll, onStartTask }) => {
  const completedCount = tasks.filter(t => t.completed).length;
  const displayTasks = tasks.slice(0, 3);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardHeaderLeft}>
          <Target size={16} style={{ color: 'var(--text-secondary)' }} />
          <span style={styles.cardTitle}>Today's Tasks</span>
        </div>
        {tasks.length > 3 && (
          <button style={styles.cardAction} onClick={onViewAll}>
            +{tasks.length - 3} more <ChevronRight size={14} />
          </button>
        )}
      </div>
      {tasks.length === 0 ? (
        <div style={styles.emptyState}>
          <Sparkles size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 8 }} />
          <p>No tasks today - enjoy the freedom!</p>
        </div>
      ) : (
        <div style={styles.taskList}>
          {displayTasks.map(task => (
            <div
              key={task.id}
              style={{
                ...styles.taskItem,
                backgroundColor: task.completed ? 'var(--status-success-muted)' : 'transparent',
              }}
            >
              <div
                style={{
                  ...styles.taskCheckbox,
                  borderColor: task.completed ? 'rgb(var(--status-success))' : 'rgb(var(--border-color))',
                  backgroundColor: task.completed ? 'rgb(var(--status-success))' : 'transparent',
                }}
                onClick={() => onToggle?.(task.id)}
              >
                {task.completed && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span style={{
                ...styles.taskTitle,
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? 'var(--text-tertiary)' : 'var(--tier-navy)',
                flex: 1,
              }}>
                {task.title}
              </span>
              {!task.completed && onStartTask && (
                <button
                  style={styles.taskStartButton}
                  onClick={() => onStartTask(task)}
                >
                  Start
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {tasks.length > 0 && (
        <div style={styles.cardFooterMeta}>
          {completedCount === tasks.length ? (
            <span style={{ color: 'rgb(var(--status-success))' }}>All completed!</span>
          ) : (
            `${completedCount} of ${Math.min(tasks.length, 3)} completed`
          )}
        </div>
      )}
    </div>
  );
};

// ===== ZONE C COMPONENTS =====

/**
 * ProgressStrip - Kompakt progresjon med "no 0-shaming"
 * P3: Motiverende meldinger i stedet for 0-verdier
 */
const ProgressStrip = ({ sessions, hours, streak }) => {
  const dayOfWeek = getDayOfWeek();
  const sessionsPercent = sessions.total > 0
    ? Math.round((sessions.completed / sessions.total) * 100)
    : 0;
  const hoursPercent = hours.goal > 0
    ? Math.round((hours.current / hours.goal) * 100)
    : 0;

  // P3: "No 0-shaming" - positive messaging based on context
  const showEncouragement = sessions.completed === 0 && hours.current === 0;

  if (showEncouragement) {
    const messages = {
      1: 'New week starts now - make the first session a habit!',
      2: 'Tuesday is perfect for getting started.',
      3: 'Mid-week - time to build momentum.',
      4: 'Thursday session? Always a good idea.',
      5: 'Finish the week strong!',
      6: 'Weekend training = bonus points.',
      0: 'Sunday session? You deserve applause!',
    };

    return (
      <div style={styles.progressStrip}>
        <div style={styles.progressStripEncouragement}>
          <span style={styles.progressStripEncouragementText}>
            {messages[dayOfWeek] || 'Start the week with your first session'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.progressStrip}>
      {/* Sessions progress */}
      <div style={styles.progressStripItem}>
        <div style={styles.progressStripHeader}>
          <span style={styles.progressStripLabel}>Sessions</span>
          <span style={styles.progressStripValue}>
            {sessions.completed}/{sessions.total}
          </span>
        </div>
        <div style={styles.progressStripBar}>
          <div style={{
            ...styles.progressStripFill,
            width: `${sessionsPercent}%`,
            backgroundColor: sessionsPercent >= 100 ? 'rgb(var(--status-success))' : 'var(--tier-navy)',
          }} />
        </div>
      </div>

      {/* Hours progress */}
      <div style={styles.progressStripItem}>
        <div style={styles.progressStripHeader}>
          <span style={styles.progressStripLabel}>Hours</span>
          <span style={styles.progressStripValue}>
            {hours.current}/{hours.goal}h
          </span>
        </div>
        <div style={styles.progressStripBar}>
          <div style={{
            ...styles.progressStripFill,
            width: `${Math.min(hoursPercent, 100)}%`,
            backgroundColor: hoursPercent >= 100 ? 'rgb(var(--status-success))' : 'rgb(var(--status-info))',
          }} />
        </div>
      </div>

      {/* Streak - show with celebration when high */}
      {streak > 0 && (
        <div style={styles.progressStripStreak}>
          <span style={{
            ...styles.progressStripStreakValue,
            color: streak >= 7 ? 'rgb(var(--status-warning))' : 'var(--tier-navy)',
          }}>
            {streak >= 7 ? '🔥' : ''}{streak}
          </span>
          <span style={styles.progressStripStreakLabel}>
            {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * NotificationsList - Varslinger (lav prioritet)
 */
const NotificationsList = ({ notifications, onViewAll }) => {
  const displayNotifications = notifications.slice(0, 2);

  if (notifications.length === 0) {
    return null; // Don't show empty notifications section
  }

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.cardHeaderLeft}>
          <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
          <span style={styles.cardTitle}>Notifications</span>
          {notifications.length > 0 && (
            <span style={styles.notificationBadge}>{notifications.length}</span>
          )}
        </div>
        {notifications.length > 2 && (
          <button style={styles.cardAction} onClick={onViewAll}>
            View all <ChevronRight size={14} />
          </button>
        )}
      </div>
      <div style={styles.notificationList}>
        {displayNotifications.map((notif, idx) => (
          <div key={notif.id || idx} style={styles.notificationItem}>
            <div style={styles.notificationDot} />
            <div style={styles.notificationContent}>
              <p style={styles.notificationTitle}>{notif.title}</p>
              <p style={styles.notificationMessage}>{notif.message}</p>
            </div>
            <span style={styles.notificationTime}>{notif.time || 'Recently'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== MAIN DASHBOARD =====

const TIERGolfDashboardV3 = () => {
  const navigate = useNavigate();
  const { data: dashboardData, loading } = useDashboard();
  const { data: focusData, loading: focusLoading } = useFocus();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (dashboardData?.tasks) {
      setTasks(dashboardData.tasks);
    }
  }, [dashboardData]);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Extract data with fallbacks
  const player = dashboardData?.player || { name: 'Player', category: 'B' };
  const stats = dashboardData?.stats || {
    sessionsCompleted: 0,
    sessionsTotal: 12,
    hoursThisWeek: 0,
    hoursGoal: 20,
    streak: 0,
  };
  const notifications = dashboardData?.notifications || [];

  // Gamification data
  const xp = dashboardData?.xp || 0;
  const totalXp = dashboardData?.totalXp || 0;
  const level = dashboardData?.level || 1;
  const nextLevelXp = dashboardData?.nextLevelXp || 100;
  const achievements = dashboardData?.achievements || [];
  const calendarEvents = dashboardData?.calendarEvents || [];

  const handleStartSession = (session) => {
    if (session?.id) {
      navigate(`/session/${session.id}/active`);
    } else if (session?.type === 'focus') {
      navigate('/session/new', { state: { focus: session.focus } });
    } else {
      navigate('/session/new', { state: { quickStart: true, duration: session?.duration || 15 } });
    }
  };

  const handleStartTaskSession = (task) => {
    // Navigate to session creation with task context
    navigate('/session/new', { state: { taskId: task.id, taskTitle: task.title } });
  };

  if (loading) {
    return (
      <div style={styles.dashboard}>
        <div style={styles.loadingState}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      {/* Row 1: Welcome Header (single, no duplicate) */}
      <section style={styles.welcomeRow}>
        <WelcomeSection
          playerName={player.name}
          category={player.category}
          stats={stats}
        />
      </section>

      {/* Row 2: Week at a Glance (8-col) + Badges & Score (4-col) */}
      <section style={styles.topRow}>
        <div style={styles.weekAtGlanceCol}>
          <WeekAtGlanceCard stats={stats} loading={loading} />
        </div>
        <div style={styles.badgesCol}>
          <BadgesScoreCard
            xp={xp}
            totalXp={totalXp}
            level={level}
            nextLevelXp={nextLevelXp}
            achievements={achievements}
            loading={loading}
          />
        </div>
      </section>

      {/* Row 3: Calendar Oversikt Widget + Last 7 Days */}
      <section style={styles.calendarRow}>
        <div style={styles.calendarWidgetCol}>
          <CalendarOversiktWidget />
        </div>
        <div style={styles.last7Col}>
          <Last7DaysVisualization calendarEvents={calendarEvents} stats={stats} />
        </div>
      </section>

      {/* Row 4: Main content - Focus + Tasks side by side */}
      <section style={styles.mainContentRow}>
        {/* Left Column: Focus + CTA */}
        <div style={styles.leftColumn}>
          <FocusCard
            focus={focusData}
            loading={focusLoading}
          />

          <ContextualCTA
            focus={focusData}
            upcomingSession={dashboardData?.upcomingSessions?.[0]}
            onStart={handleStartSession}
          />

          {/* Quick start alternativ */}
          <QuickStartCTA onStart={handleStartSession} />
        </div>

        {/* Right Column: Tasks + Notifications */}
        <div style={styles.rightColumn}>
          <TasksList
            tasks={tasks}
            onToggle={toggleTask}
            onViewAll={() => navigate('/maalsetninger')}
            onStartTask={handleStartTaskSession}
          />

          <NotificationsList
            notifications={notifications}
            onViewAll={() => navigate('/varslinger')}
          />
        </div>
      </section>
    </div>
  );
};

// ===== STYLES =====

const styles = {
  dashboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
    maxWidth: '1536px', // 7xl equivalent - wider dashboard
    margin: '0 auto',
    padding: '24px 32px',
  },

  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    color: 'var(--text-tertiary)',
    fontSize: '15px',
    gridColumn: '1 / -1',
  },

  // Row 1: Welcome header
  welcomeRow: {
    width: '100%',
  },

  // Row 2: Week at a Glance + Badges (8-col + 4-col)
  topRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '20px',
    width: '100%',
  },

  weekAtGlanceCol: {
    gridColumn: 'span 8',
  },

  badgesCol: {
    gridColumn: 'span 4',
  },

  // Row 3: Calendar Row (Calendar Widget + Last 7 Days)
  calendarRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '20px',
    width: '100%',
  },

  calendarWidgetCol: {
    gridColumn: 'span 5',
  },

  last7Col: {
    gridColumn: 'span 7',
  },

  // Row 4: Main content row
  mainContentRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    width: '100%',
  },

  // Left Column: Control & Focus
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  // Right Column: Tasks & Notifications
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  welcomeSection: {
    marginBottom: '4px',
  },
  greetingText: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 4px 0',
  },
  playerName: {
    fontSize: '32px',
    fontWeight: 700,
    color: 'var(--tier-navy)',
    margin: '0 0 6px 0',
    letterSpacing: '-0.02em',
  },
  motivationalText: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    margin: 0,
    fontWeight: 500,
  },

  // FocusCard
  focusCard: {
    padding: '20px',
    backgroundColor: 'var(--surface-card)',
    borderRadius: '16px',
    border: '1px solid rgb(var(--border-muted))',
    borderLeft: '4px solid var(--tier-navy)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  focusCardLoading: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  focusCardLoadingPulse: {
    height: '16px',
    backgroundColor: 'rgb(var(--gray-100))',
    borderRadius: '4px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  focusCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  focusCardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  focusCardLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  focusCardBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: '12px',
  },
  focusCardTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--tier-navy)',
    margin: '0 0 8px 0',
    letterSpacing: '-0.01em',
  },
  focusCardDescription: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    margin: '0 0 16px 0',
    lineHeight: 1.5,
  },
  focusProgressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  focusProgressTrack: {
    flex: 1,
    height: '6px',
    backgroundColor: 'rgb(var(--gray-100))',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  focusProgressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  focusProgressLabel: {
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  focusConfidence: {
    marginTop: '12px',
  },
  focusConfidenceBadge: {
    fontSize: '11px',
    fontWeight: 500,
    padding: '4px 8px',
    borderRadius: '6px',
  },

  // ContextualCTA
  contextualCTA: {
    marginTop: '4px',
  },
  ctaButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '16px 20px',
    backgroundColor: 'rgb(var(--tier-navy))',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 2px 8px rgba(27, 77, 62, 0.25)',
  },
  ctaContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  ctaTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '2px',
  },
  ctaTitle: {
    fontSize: '16px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  ctaSubtitle: {
    fontSize: '13px',
    fontWeight: 400,
    opacity: 0.85,
  },
  ctaArrow: {
    opacity: 0.7,
    flexShrink: 0,
  },

  // QuickStartCTA
  quickStartButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px dashed rgb(var(--border-color))',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.15s ease',
  },


  // ProgressStrip
  progressStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '14px 18px',
    backgroundColor: 'var(--surface-card)',
    borderRadius: '12px',
    border: '1px solid rgb(var(--border-muted))',
  },
  progressStripItem: {
    flex: 1,
    minWidth: 0,
  },
  progressStripHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  progressStripLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-tertiary)',
  },
  progressStripValue: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    fontFeatureSettings: '"tnum"',
  },
  progressStripBar: {
    height: '4px',
    backgroundColor: 'rgb(var(--gray-100))',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressStripFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  progressStripStreak: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    paddingLeft: '16px',
    borderLeft: '1px solid rgb(var(--border-muted))',
  },
  progressStripStreakValue: {
    fontSize: '16px',
    fontWeight: 700,
    fontFeatureSettings: '"tnum"',
  },
  progressStripStreakLabel: {
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    whiteSpace: 'nowrap',
  },
  progressStripEncouragement: {
    flex: 1,
    textAlign: 'center',
    padding: '4px 0',
  },
  progressStripEncouragementText: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },

  // Generic card
  card: {
    backgroundColor: 'var(--surface-card)',
    borderRadius: '12px',
    border: '1px solid rgb(var(--border-muted))',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid rgb(var(--border-muted))',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--tier-navy)',
  },
  cardAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '4px 8px',
    marginRight: '-8px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'color 0.15s ease',
  },
  cardFooterMeta: {
    padding: '10px 16px',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    borderTop: '1px solid rgb(var(--border-muted))',
    backgroundColor: 'rgb(var(--gray-100))',
  },
  emptyState: {
    padding: '24px 16px',
    textAlign: 'center',
    color: 'var(--text-tertiary)',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  // Tasks
  taskList: {
    display: 'flex',
    flexDirection: 'column',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid rgb(var(--border-muted))',
    transition: 'background-color 0.15s ease',
  },
  taskCheckbox: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: 500,
    transition: 'color 0.15s ease',
  },
  taskStartButton: {
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--tier-navy)',
    backgroundColor: 'var(--tier-navy/20)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  // Notifications
  notificationBadge: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--tier-navy)',
    backgroundColor: 'var(--tier-navy/20)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  notificationList: {
    display: 'flex',
    flexDirection: 'column',
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid rgb(var(--border-muted))',
  },
  notificationDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--tier-navy)',
    marginTop: '6px',
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--tier-navy)',
    margin: 0,
  },
  notificationMessage: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: '2px 0 0 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  notificationTime: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    flexShrink: 0,
  },
};

// ===== WEEK AT GLANCE STYLES =====
const weekStyles = {
  card: {
    backgroundColor: 'var(--background-white, var(--surface-card))',
    borderRadius: '16px',
    border: '1px solid var(--border-subtle, rgb(var(--border-muted)))',
    padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary, var(--tier-navy))',
  },
  streakBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: 'var(--background-surface, rgb(var(--gray-100)))',
    borderRadius: '20px',
  },
  streakIcon: {
    fontSize: '14px',
  },
  streakValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary, var(--tier-navy))',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  metricLabel: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary, var(--text-secondary))',
  },
  metricValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary, var(--tier-navy))',
    fontFeatureSettings: '"tnum"',
  },
  progressTrack: {
    height: '8px',
    backgroundColor: 'var(--background-surface, rgb(var(--gray-100)))',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  metricSubtext: {
    fontSize: '12px',
    color: 'var(--text-tertiary, var(--text-tertiary))',
  },
  completedIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
  },
  completedText: {
    fontSize: '13px',
    color: 'var(--text-secondary, var(--text-secondary))',
  },
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  loadingPulse: {
    height: '60px',
    backgroundColor: 'var(--background-surface, rgb(var(--gray-100)))',
    borderRadius: '8px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};

// ===== BADGES & SCORE STYLES =====
const badgeStyles = {
  card: {
    backgroundColor: 'var(--background-white, var(--surface-card))',
    borderRadius: '16px',
    border: '1px solid var(--border-subtle, rgb(var(--border-muted)))',
    padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary, var(--tier-navy))',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
  },
  rankSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  rankBadge: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'var(--background-elevated, rgb(var(--gray-100)))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  rankLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--text-tertiary, var(--text-tertiary))',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  rankName: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary, var(--tier-navy))',
  },
  xpSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  xpHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  xpLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-primary, var(--tier-navy))',
  },
  xpValue: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary, var(--text-secondary))',
    fontFeatureSettings: '"tnum"',
  },
  xpTrack: {
    height: '6px',
    backgroundColor: 'var(--background-surface, rgb(var(--gray-100)))',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: 'var(--accent)',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  xpSubtext: {
    fontSize: '11px',
    color: 'var(--text-tertiary, var(--text-tertiary))',
  },
  badgesSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-subtle, rgb(var(--border-muted)))',
    marginTop: 'auto',
  },
  badgesStat: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  badgesCount: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-primary, var(--tier-navy))',
    fontFeatureSettings: '"tnum"',
  },
  badgesLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary, var(--text-secondary))',
  },
  badgeEmoji: {
    fontSize: '20px',
  },
  loadingContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// ===== LAST 7 DAYS STYLES =====
const last7Styles = {
  container: {
    backgroundColor: 'var(--background-white, var(--surface-card))',
    borderRadius: '16px',
    border: '1px solid var(--border-subtle, rgb(var(--border-muted)))',
    padding: '16px 24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary, var(--tier-navy))',
  },
  stripContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
  },
  dayColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  dayLabel: {
    fontSize: '12px',
    fontWeight: 400,
  },
  dayIndicator: {
    width: '100%',
    maxWidth: '48px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  eventDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--text-inverse)',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-subtle, rgb(var(--border-muted)))',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--text-tertiary, var(--text-tertiary))',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '4px',
  },
};

// ===== RESPONSIVE MEDIA QUERY (CSS-in-JS limitation - add via CSS file for production) =====
// Note: For full responsive support, consider adding these rules to a CSS file:
// @media (max-width: 1024px) {
//   .topRow { grid-template-columns: 1fr; }
//   .weekAtGlanceCol, .badgesCol { grid-column: span 12; }
//   .mainContentRow { grid-template-columns: 1fr; }
//   .metricsGrid { grid-template-columns: 1fr; }
// }

export default TIERGolfDashboardV3;
