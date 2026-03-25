/**
 * TIERGolfDashboard Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, MapPin, Trophy, Target, CheckCircle2, Zap, Lightbulb,
  Play, Bell, RefreshCw, Flame, Calendar, TrendingUp, ChevronRight,
  BarChart3, Award, MessageCircle, Plus, ClipboardList,
  Video, Circle, Apple, Dumbbell, Flag, BookOpen, ListChecks
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardWidget, KPIValue, KPIMeta } from './components';
import Button from '../../ui/primitives/Button';
import Badge from '../../ui/primitives/Badge.primitive';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography';
import ExportButton from '../../components/ui/ExportButton';
import { useAuth } from '../../contexts/AuthContext';
import PeerComparisonWidget from '../../components/widgets/PeerComparisonWidget';
import OnboardingChecklist from './OnboardingChecklist';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';

// Responsive layout styles
import './dashboard-responsive.css';

/**
 * TIERGolfDashboard - Premium Player Dashboard
 *
 * NEW HIERARCHY (2026):
 * 1. Personalized Greeting + Smart Insight (Hero Section)
 * 2. Today's Action Card (if scheduled sessions exist)
 * 3. Weekly Performance Summary (4 KPIs)
 * 4. Hurtigvalg (Quick Actions)
 * 5. Ukens Mål (Weekly Goals) - EXPANDED VIEW
 * 6. Dagens Økter (Today's Sessions)
 * 7. Neste Test (Next Test)
 * 8. Meldinger (Messages) - Prioritized
 * 9. Neste Turnering (Next Tournament) - Minimized if >30 days
 */

// ===== CARD SHELL STYLES =====

const cardShell = {
  base: {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
    border: '1px solid var(--border-subtle)',
    overflow: 'hidden',
  },
  padding: {
    default: '20px 24px',
    compact: '16px 20px',
  },
};

// ===== 1. HERO SECTION: Greeting + Smart Insight =====

const generateSmartInsight = (stats, nextTest, goals) => {
  const insights = [];

  // Check goal progress
  const remainingSessions = stats.sessionsTotal - stats.sessionsCompleted;
  if (remainingSessions > 0 && remainingSessions <= 3) {
    insights.push({
      priority: 'high',
      icon: '🎯',
      message: `You're on track! Only ${remainingSessions} sessions away from your weekly goal`,
    });
  }

  // Check upcoming test
  if (nextTest?.date) {
    const daysUntilTest = Math.ceil((new Date(nextTest.date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilTest <= 21 && daysUntilTest > 0) {
      insights.push({
        priority: 'warning',
        icon: 'alert-triangle️',
        message: `Category test in ${daysUntilTest} days - have you prepared?`,
      });
    }
  }

  // Check streak
  if (stats.streak >= 7) {
    insights.push({
      priority: 'success',
      icon: '🔥',
      message: `Impressive! ${stats.streak} days in a row of training`,
    });
  }

  // Goal almost complete
  if (stats.hoursThisWeek >= stats.hoursGoal * 0.9) {
    insights.push({
      priority: 'success',
      icon: '📈',
      message: 'Excellent! You are almost at your weekly training hours goal',
    });
  }

  return insights[0] || null;
};

const generateActionRecommendation = (stats, todaySessions) => {
  // Rest day recommendation
  if (stats.streak >= 6) {
    return {
      icon: '😴',
      message: 'Consider a rest day - you have trained 6+ days in a row',
    };
  }

  // Focus area recommendation
  if (stats.weakestArea) {
    return {
      icon: '🎯',
      message: `Recommended: Focus on ${stats.weakestArea} (below test requirement)`,
    };
  }

  // Start session recommendation
  if (todaySessions?.length > 0) {
    return {
      icon: '💪',
      message: `Ready for ${todaySessions[0].title}?`,
    };
  }

  return null;
};

/**
 * HeroSection - Memoized for performance
 */
const HeroSection = memo(({ player, greeting, stats, nextTest, todaySessions }) => {
  const insight = generateSmartInsight(stats, nextTest, []);
  const recommendation = generateActionRecommendation(stats, todaySessions);

  return (
    <div style={styles.heroSection}>
      <div style={styles.heroContent}>
        <p style={styles.greetingLabel}>{greeting}</p>
        <PageTitle style={styles.playerName}>{player.name?.split(' ')[0] || 'Player'}</PageTitle>

        {/* Smart Insight */}
        {insight && (
          <div style={{
            ...styles.smartInsight,
            backgroundColor: insight.priority === 'warning' ? 'var(--warning-muted)' :
                            insight.priority === 'success' ? 'var(--success-muted)' : 'var(--accent-muted)',
          }}>
            <span style={styles.insightIcon}>{insight.icon}</span>
            <span style={styles.insightMessage}>{insight.message}</span>
          </div>
        )}

        {/* Action Recommendation */}
        {recommendation && (
          <div style={styles.actionRecommendation}>
            <span>{recommendation.icon}</span>
            <span>{recommendation.message}</span>
          </div>
        )}
      </div>
    </div>
  );
});

HeroSection.displayName = 'HeroSection';

// ===== 2. TODAY'S ACTION CARD =====

/**
 * TodayActionCard - Memoized for performance
 */
const TodayActionCard = memo(({ sessions, onStartSession, onViewCalendar }) => {
  if (!sessions || sessions.length === 0) return null;

  const nextSession = sessions[0];
  const sessionTime = nextSession.time || '—';

  return (
    <div style={styles.actionCard} role="region" aria-label="Next scheduled session">
      <div style={styles.actionCardHeader}>
        <div style={styles.actionCardIcon} aria-hidden="true">
          <Zap size={20} />
        </div>
        <div style={styles.actionCardInfo}>
          <span style={styles.actionCardLabel}>Your next session</span>
          <span style={styles.actionCardTitle}>{nextSession.title}</span>
          <span style={styles.actionCardMeta}>
            <Clock size={12} aria-hidden="true" /> {sessionTime} • {nextSession.duration || 60} min
          </span>
        </div>
      </div>
      <div style={styles.actionCardButtons}>
        <Button
          variant="primary"
          size="md"
          onClick={() => onStartSession?.(nextSession)}
          leftIcon={<Play size={16} aria-hidden="true" />}
          aria-label={`Start ${nextSession.title} now`}
        >
          Start now
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={onViewCalendar}
          aria-label={sessions.length > 1 ? `View all ${sessions.length} sessions` : 'View session details'}
        >
          View {sessions.length > 1 ? `all ${sessions.length}` : 'details'}
        </Button>
      </div>
    </div>
  );
});

TodayActionCard.displayName = 'TodayActionCard';

// ===== 3. WEEKLY PERFORMANCE SUMMARY (4 KPIs) =====

// Status configuration - defined outside component to avoid recreation
const STATUS_CONFIG = {
  'on-track': { label: '✓ On track', color: 'rgb(var(--status-success))', bg: 'var(--success-muted)' },
  'behind': { label: 'alert-triangle Behind', color: 'rgb(var(--status-warning))', bg: 'var(--warning-muted)' },
  'ahead': { label: '🚀 Ahead of schedule', color: 'rgb(var(--status-info))', bg: 'var(--info-muted)' },
};

/**
 * KPICard - Memoized for performance
 * Only re-renders when props change
 */
const KPICard = memo(({
  icon: Icon,
  value,
  label,
  trend,
  trendLabel,
  context,
  iconColor,
  progress,      // { current, max, color }
  status,        // 'on-track' | 'behind' | 'ahead'
}) => {
  const progressPercent = progress ? Math.round((progress.current / progress.max) * 100) : null;
  const statusInfo = status ? STATUS_CONFIG[status] : null;

  return (
    <div style={styles.kpiCard}>
      <div style={styles.kpiIconRow}>
        <div style={{ ...styles.kpiIcon, backgroundColor: iconColor ? `${iconColor}15` : 'var(--accent-muted)' }}>
          <Icon size={18} style={{ color: iconColor || 'var(--text-brand)' }} />
        </div>
        {statusInfo && (
          <div style={{
            ...styles.statusBadge,
            color: statusInfo.color,
            backgroundColor: statusInfo.bg,
          }}>
            {statusInfo.label}
          </div>
        )}
      </div>
      <KPIValue style={styles.kpiValue}>{value}</KPIValue>
      <KPIMeta style={styles.kpiLabel}>{label}</KPIMeta>

      {/* Trend comparison */}
      {trend !== undefined && (
        <div style={{
          ...styles.trendRow,
          color: trend >= 0 ? 'rgb(var(--status-success))' : 'rgb(var(--status-error))',
        }}>
          <TrendingUp size={12} style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }} aria-hidden="true" />
          <span>{trend >= 0 ? '+' : ''}{trend} {trendLabel || ''}</span>
        </div>
      )}

      {/* Progress bar (thick 8px) */}
      {progress && (
        <div style={styles.kpiProgressWrapper}>
          <div style={styles.kpiProgressBar}>
            <div style={{
              ...styles.kpiProgressFill,
              width: `${Math.min(progressPercent, 100)}%`,
              backgroundColor: progress.color || 'rgb(var(--status-success))',
            }} />
          </div>
          <span style={styles.kpiProgressLabel}>
            {progressPercent}% of goal ({progress.max})
          </span>
        </div>
      )}

      {/* Context message */}
      {context && (
        <p style={styles.kpiContext}>{context}</p>
      )}
    </div>
  );
});

KPICard.displayName = 'KPICard';

const WeeklyPerformanceSummary = ({ stats, loading }) => {
  // Calculate statuses
  const sessionsPercent = stats.sessionsTotal > 0 ? (stats.sessionsCompleted / stats.sessionsTotal) : 0;
  const hoursPercent = stats.hoursGoal > 0 ? (stats.hoursThisWeek / stats.hoursGoal) : 0;

  const getSessionStatus = () => {
    if (sessionsPercent >= 1) return 'ahead';
    if (sessionsPercent >= 0.6) return 'on-track';
    return 'behind';
  };

  const getHoursStatus = () => {
    if (hoursPercent >= 1) return 'ahead';
    if (hoursPercent >= 0.6) return 'on-track';
    return 'behind';
  };

  const remainingSessions = Math.max(0, stats.sessionsTotal - stats.sessionsCompleted);
  const remainingHours = Math.max(0, stats.hoursGoal - stats.hoursThisWeek);

  return (
    <div className="dashboard-kpi-grid" style={styles.kpiGrid}>
      <KPICard
        icon={CheckCircle2}
        value={`${stats.sessionsCompleted}/${stats.sessionsTotal}`}
        label="Sessions this week"
        status={getSessionStatus()}
        progress={{ current: stats.sessionsCompleted, max: stats.sessionsTotal, color: 'rgb(var(--status-success))' }}
        context={remainingSessions > 0 ? `${remainingSessions} sessions left to goal` : null}
        iconColor="rgb(var(--status-success))"
      />
      <KPICard
        icon={Clock}
        value={`${stats.hoursThisWeek}h`}
        label="Hours this week"
        trend={stats.hoursTrend}
        trendLabel="vs. last week"
        status={getHoursStatus()}
        progress={{ current: stats.hoursThisWeek, max: stats.hoursGoal, color: 'var(--text-brand)' }}
        context={remainingHours > 0 ? `${remainingHours.toFixed(1)}h left to goal` : null}
        iconColor="var(--text-brand)"
      />
      <KPICard
        icon={Flame}
        value={stats.streak}
        label="Day streak"
        trend={stats.streakTrend}
        trendLabel="vs. last week"
        context={stats.streak >= 7 ? '🔥 Longest this month!' : stats.streak >= 3 ? '💪 Great job!' : null}
        iconColor="rgb(var(--status-warning))"
      />
      <KPICard
        icon={TrendingUp}
        value={stats.scoringAverage?.toFixed(1) || '—'}
        label="Scoring avg"
        trend={stats.scoringTrend}
        trendLabel="strokes"
        context={stats.scoringTrend < 0 ? '📉 Improvement!' : null}
        iconColor="rgb(var(--status-info))"
      />
    </div>
  );
};

// ===== 4. QUICK ACTIONS (Hurtigvalg) =====

/**
 * QuickActions - Memoized for performance
 */
const QuickActions = memo(({ onAction }) => {
  // Memoized keyboard handler factory
  const handleKeyDown = useCallback((action) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onAction(action);
    }
  }, [onAction]);

  return (
    <div style={styles.quickActionsSection}>
      <SectionTitle style={styles.sectionTitle}>Quick Actions</SectionTitle>
      <div className="dashboard-quick-actions" style={styles.quickActionsGrid} role="group" aria-label="Quick Actions">
        <button
          style={styles.quickActionBtn}
          onClick={() => onAction('session')}
          onKeyDown={handleKeyDown('session')}
          aria-label="Start new training session"
        >
          <Play size={20} aria-hidden="true" />
          <span>New session</span>
        </button>
        <button
          style={styles.quickActionBtn}
          onClick={() => onAction('goal')}
          onKeyDown={handleKeyDown('goal')}
          aria-label="Create new goal"
        >
          <Target size={20} aria-hidden="true" />
          <span>New goal</span>
        </button>
        <button
          style={styles.quickActionBtn}
          onClick={() => onAction('progress')}
          onKeyDown={handleKeyDown('progress')}
          aria-label="View your progress"
        >
          <BarChart3 size={20} aria-hidden="true" />
          <span>Progress</span>
        </button>
        <button
          style={styles.quickActionBtn}
          onClick={() => onAction('calendar')}
          onKeyDown={handleKeyDown('calendar')}
          aria-label="Open calendar"
        >
          <Calendar size={20} aria-hidden="true" />
          <span>Calendar</span>
        </button>
      </div>
    </div>
  );
});

QuickActions.displayName = 'QuickActions';

// ===== 5. WEEKLY GOALS (Ukens Mål) - EXPANDED =====

const goalTypeIcons = {
  video: Video,
  putting: Circle,
  nutrition: Apple,
  fitness: Dumbbell,
  default: Flag,
};

const getGoalStatus = (goal) => {
  if (goal.completed) return 'completed';
  if (!goal.progress && !goal.current) return 'not-started';

  // Calculate if at risk (less than 50% progress with less than 30% time remaining)
  const progressPercent = goal.max ? (goal.current || 0) / goal.max : goal.progress / 100;
  const daysRemaining = goal.daysRemaining ?? 7;

  if (daysRemaining <= 2 && progressPercent < 0.5) return 'at-risk';
  if (progressPercent > 0) return 'in-progress';
  return 'not-started';
};

const GoalStatusBadge = ({ goal }) => {
  const status = getGoalStatus(goal);

  if (status === 'completed') {
    return (
      <span style={styles.goalCompletedBadge}>
        ✓ Completed
      </span>
    );
  }

  if (status === 'at-risk') {
    return (
      <span style={styles.goalAtRiskBadge}>
        alert-triangle️ {goal.daysRemaining || 2} days left, {goal.current || 0}/{goal.max || '?'}
      </span>
    );
  }

  if (goal.max !== undefined && goal.current !== undefined) {
    const isWarning = goal.current === 0;
    return (
      <span style={{
        ...styles.goalProgressBadge,
        backgroundColor: isWarning ? 'var(--warning-muted)' : 'var(--bg-tertiary)',
        color: isWarning ? 'rgb(var(--status-warning))' : 'var(--text-secondary)',
      }}>
        {goal.current}/{goal.max} {goal.unit || ''}
      </span>
    );
  }

  return null;
};

/**
 * WeeklyGoalsWidget - Memoized for performance
 */
const WeeklyGoalsWidget = memo(({ goals, onToggle, onAddGoal, onViewAll, loading, error }) => {
  const completedCount = goals.filter(g => g.completed).length;
  const progressPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <DashboardWidget
      title="Weekly Goals"
      icon={Target}
      action={onViewAll}
      actionLabel="View training plan →"
      loading={loading}
      error={error}
      empty={goals.length === 0}
      emptyMessage="No goals set for this week"
      emptyAction={onAddGoal}
      emptyActionLabel="Add goal"
      noPadding
      headerRight={
        <Badge variant="default" size="sm" style={styles.goalCompletionBadge}>
          {completedCount}/{goals.length} completed
        </Badge>
      }
    >
      {/* Overall progress bar - thick 12px */}
      <div style={styles.goalsOverallProgress}>
        <div style={styles.goalsProgressBarThick}>
          <div style={{
            ...styles.goalsProgressFillThick,
            width: `${progressPercent}%`,
          }} />
        </div>
        <span style={styles.goalsProgressPercent}>{progressPercent}%</span>
      </div>

      {/* Goals list - expanded view with rich items */}
      <div style={styles.goalsList}>
        {goals.map(goal => {
          const status = getGoalStatus(goal);
          const IconComponent = goalTypeIcons[goal.type] || goalTypeIcons.default;

          return (
            <div
              key={goal.id}
              style={{
                ...styles.goalItem,
                backgroundColor: status === 'completed' ? 'var(--success-muted)' :
                                status === 'at-risk' ? 'var(--error-muted)' : 'transparent',
              }}
              onClick={() => onToggle?.(goal.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggle?.(goal.id);
                }
              }}
              role="checkbox"
              aria-checked={status === 'completed'}
              aria-label={`${goal.title}${status === 'completed' ? ' - completed' : status === 'at-risk' ? ' - at risk' : ''}`}
              tabIndex={0}
            >
              {/* Checkbox */}
              <div style={{
                ...styles.goalCheckbox,
                borderColor: status === 'completed' ? 'rgb(var(--status-success))' :
                            status === 'at-risk' ? 'rgb(var(--status-error))' : 'var(--border-default)',
                backgroundColor: status === 'completed' ? 'rgb(var(--status-success))' : 'transparent',
              }}>
                {status === 'completed' && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

              {/* Goal type icon */}
              <div style={{
                ...styles.goalTypeIcon,
                backgroundColor: status === 'completed' ? 'var(--success-muted)' :
                                status === 'at-risk' ? 'var(--error-muted)' : 'var(--bg-tertiary)',
                color: status === 'completed' ? 'rgb(var(--status-success))' :
                       status === 'at-risk' ? 'rgb(var(--status-error))' : 'var(--text-secondary)',
              }}>
                <IconComponent size={14} />
              </div>

              {/* Goal content */}
              <div style={styles.goalContent}>
                <p style={{
                  ...styles.goalTitle,
                  textDecoration: status === 'completed' ? 'line-through' : 'none',
                  color: status === 'completed' ? 'var(--text-tertiary)' : 'var(--text-primary)',
                }}>
                  {goal.title}
                </p>

                {/* Mini progress bar for in-progress goals */}
                {status === 'in-progress' && goal.max && (
                  <div style={styles.goalMiniProgressWrapper}>
                    <div style={styles.goalMiniProgress}>
                      <div style={{
                        ...styles.goalMiniProgressFill,
                        width: `${((goal.current || 0) / goal.max) * 100}%`,
                      }} />
                    </div>
                    <span style={styles.goalMiniProgressText}>
                      {goal.current || 0}/{goal.max}
                    </span>
                  </div>
                )}
              </div>

              {/* Status badge */}
              <GoalStatusBadge goal={goal} />
            </div>
          );
        })}
      </div>

      {/* Add goal button */}
      <button
        style={styles.addGoalBtn}
        onClick={onAddGoal}
        aria-label="Add new goal for the week"
      >
        <Plus size={16} aria-hidden="true" />
        <span>Add goal</span>
      </button>
    </DashboardWidget>
  );
});

WeeklyGoalsWidget.displayName = 'WeeklyGoalsWidget';

const ProfileCard = ({ player, stats, onViewProgress, onViewPlan, onViewProfile }) => {
  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'SP';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Category color mapping
  const getCategoryColor = (category) => {
    const colors = {
      'A': 'rgb(var(--status-success))',
      'B': 'var(--text-brand)',
      'C': 'rgb(var(--status-warning))',
      'D': 'var(--text-secondary)',
    };
    return colors[category] || colors['B'];
  };

  return (
    <div style={{ ...cardShell.base, padding: '0' }}>
      <div style={styles.profileContent}>
        {/* Left: Avatar and Info */}
        <div style={styles.profileLeft}>
          {/* Avatar */}
          <div style={styles.avatarContainer}>
            {player.avatarUrl ? (
              <img
                src={player.avatarUrl}
                alt={player.name}
                style={styles.avatarImage}
              />
            ) : (
              <div style={styles.avatarFallback}>
                {getInitials(player.name)}
              </div>
            )}
            <div style={{
              ...styles.categoryBadge,
              backgroundColor: getCategoryColor(player.category),
            }}>
              {player.category || 'B'}
            </div>
          </div>

          {/* Player Info */}
          <div style={styles.profileInfo}>
            <SectionTitle style={styles.profileName}>{player.name || 'Player'}</SectionTitle>
            <p style={styles.profileClub}>{player.club || 'Club not set'}</p>
            <div style={styles.profileMeta}>
              <Badge variant="accent" size="sm">Category {player.category || 'B'}</Badge>
              {player.memberSince && (
                <span style={styles.memberSince}>Member since {player.memberSince}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Stats */}
        <div style={styles.profileStats}>
          <div style={styles.profileStatItem}>
            <span style={styles.profileStatValue}>
              {stats?.scoringAverage?.toFixed(1) || '—'}
            </span>
            <span style={styles.profileStatLabel}>Avg</span>
          </div>
          <div style={styles.profileStatDivider} />
          <div style={styles.profileStatItem}>
            <span style={{
              ...styles.profileStatValue,
              color: (stats?.strokesGained || 0) >= 0 ? 'rgb(var(--status-success))' : 'rgb(var(--status-error))',
            }}>
              {stats?.strokesGained !== undefined
                ? `${stats.strokesGained >= 0 ? '+' : ''}${stats.strokesGained.toFixed(1)}`
                : '—'}
            </span>
            <span style={styles.profileStatLabel}>SG Total</span>
          </div>
          <div style={styles.profileStatDivider} />
          <div style={styles.profileStatItem}>
            <span style={styles.profileStatValue}>
              {stats?.totalSessions || '0'}
            </span>
            <span style={styles.profileStatLabel}>Sessions</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Row */}
      <div style={styles.profileActions} role="group" aria-label="Profile actions">
        <button
          style={styles.profileActionButton}
          onClick={onViewProgress}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="View your progress and statistics"
        >
          <TrendingUp size={14} aria-hidden="true" />
          <span>View progress</span>
        </button>
        <button
          style={styles.profileActionButton}
          onClick={onViewPlan}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Open your training plan"
        >
          <Calendar size={14} aria-hidden="true" />
          <span>Training plan</span>
        </button>
        <button
          style={{ ...styles.profileActionButton, borderRight: 'none' }}
          onClick={onViewProfile}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="View full profile"
        >
          <ChevronRight size={14} aria-hidden="true" />
          <span>Full profile</span>
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, subValue }) => (
  <div style={{ ...cardShell.base, padding: cardShell.padding.compact }}>
    <div style={styles.statContent}>
      <div style={styles.statIcon}>
        <Icon size={18} />
      </div>
      <div style={styles.statText}>
        <KPIValue style={{ fontSize: '24px' }}>{value}</KPIValue>
        <KPIMeta>{label}</KPIMeta>
        {subValue && <KPIMeta style={{ marginTop: '2px' }}>{subValue}</KPIMeta>}
      </div>
    </div>
  </div>
);

// ===== 7. NEXT TEST (Neste Test) =====

const TestPreparationItem = ({ completed, children }) => (
  <div style={styles.prepChecklistItem}>
    <div style={{
      ...styles.prepCheckbox,
      backgroundColor: completed ? 'rgb(var(--status-success))' : 'transparent',
      borderColor: completed ? 'rgb(var(--status-success))' : 'var(--border-default)',
    }}>
      {completed && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
    <span style={{
      ...styles.prepChecklistText,
      color: completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
      textDecoration: completed ? 'line-through' : 'none',
    }}>
      {children}
    </span>
  </div>
);

const NextTestCard = ({ title, date, location, preparation, onViewDetails, onPrepare }) => {
  const targetDate = new Date(date);
  const today = new Date();
  const diffTime = targetDate - today;
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const isProminent = diffDays <= 30;
  const isUrgent = diffDays <= 14;
  const isWarning = diffDays <= 21 && diffDays > 14;

  // Minimized version for >30 days
  if (!isProminent) {
    return (
      <div style={styles.testMinimized} role="region" aria-label="Next test">
        <div style={styles.testMinimizedLeft}>
          <Target size={16} style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
          <span style={styles.testMinimizedText}>
            Next test: {title || 'Not scheduled'} • {diffDays} days
          </span>
        </div>
        <button
          style={styles.testMinimizedBtn}
          onClick={onViewDetails}
          aria-label={`View details for ${title || 'next test'}`}
        >
          Details
        </button>
      </div>
    );
  }

  // Prominent version with preparation checklist
  return (
    <div style={{
      ...cardShell.base,
      padding: 0,
      borderLeft: isUrgent ? '4px solid rgb(var(--status-error))' :
                  isWarning ? '4px solid rgb(var(--status-warning))' : '4px solid var(--text-brand)',
    }}>
      {/* Header */}
      <div style={styles.testHeader}>
        <div style={styles.testHeaderLeft}>
          <div style={{
            ...styles.testIcon,
            backgroundColor: isUrgent ? 'var(--error-muted)' :
                            isWarning ? 'var(--warning-muted)' : 'var(--accent-muted)',
            color: isUrgent ? 'rgb(var(--status-error))' :
                   isWarning ? 'rgb(var(--status-warning))' : 'var(--text-brand)',
          }}>
            <Target size={18} />
          </div>
          <div>
            <p style={styles.testTitle}>{title || 'Category Test'}</p>
            {location && (
              <p style={styles.testLocation}>
                <MapPin size={12} /> {location}
              </p>
            )}
          </div>
        </div>
        <div style={{
          ...styles.testDaysBadge,
          backgroundColor: isUrgent ? 'rgb(var(--status-error))' :
                          isWarning ? 'rgb(var(--status-warning))' : 'var(--text-brand)',
        }}>
          In {diffDays} days
        </div>
      </div>

      {/* Preparation checklist */}
      <div style={styles.prepChecklist}>
        <p style={styles.prepChecklistTitle}>
          <ListChecks size={14} />
          Preparation
        </p>
        <TestPreparationItem completed={preparation?.reviewedMaterial}>
          Review test material
        </TestPreparationItem>
        <TestPreparationItem completed={preparation?.practicedWeakAreas}>
          Practice weak areas
        </TestPreparationItem>
        <TestPreparationItem completed={preparation?.takenPracticeTest}>
          Take a practice test
        </TestPreparationItem>
      </div>

      {/* CTA */}
      <div style={styles.testCTA}>
        <Button
          variant="primary"
          size="sm"
          onClick={onPrepare}
          leftIcon={<BookOpen size={14} />}
          fullWidth
        >
          Prepare for the test
        </Button>
      </div>
    </div>
  );
};

// ===== 9. NEXT TOURNAMENT (Neste Turnering) - Minimized if >30 days =====

/**
 * NextTournamentCard - Memoized for performance
 */
const NextTournamentCard = memo(({ title, date, location, onViewDetails }) => {
  const targetDate = new Date(date);
  const today = new Date();
  const diffTime = targetDate - today;
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const isMinimized = diffDays > 30;

  if (isMinimized) {
    // Minimized version - single row
    return (
      <div style={styles.tournamentMinimized} role="region" aria-label="Next tournament">
        <div style={styles.tournamentMinimizedLeft}>
          <Trophy size={16} style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
          <span style={styles.tournamentMinimizedText}>
            {title || 'Next tournament'} • {diffDays} days
          </span>
        </div>
        <button
          style={styles.tournamentMinimizedBtn}
          onClick={onViewDetails}
          aria-label={`View details for ${title || 'next tournament'}`}
        >
          Details
        </button>
      </div>
    );
  }

  // Full version when <= 30 days
  return (
    <div style={{ ...cardShell.base, padding: cardShell.padding.compact }}>
      <div style={styles.countdownContent}>
        <div style={styles.countdownLeft}>
          <div style={{
            ...styles.countdownIcon,
            backgroundColor: 'var(--accent-muted)',
            color: 'var(--text-brand)',
          }}>
            <Trophy size={18} />
          </div>
          <div>
            <KPIMeta style={{ textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: 500 }}>
              Next Tournament
            </KPIMeta>
            <p style={styles.countdownTitle}>{title || 'Not scheduled'}</p>
            {location && (
              <p style={styles.countdownLocation}>
                <MapPin size={12} /> {location}
              </p>
            )}
          </div>
        </div>
        <div style={styles.countdownRight}>
          <KPIValue style={{ fontSize: '28px', color: 'var(--text-brand)' }}>{diffDays}</KPIValue>
          <KPIMeta>days</KPIMeta>
        </div>
      </div>
    </div>
  );
});

NextTournamentCard.displayName = 'NextTournamentCard';

// ===== ZONE B: MIDDLE SECTION =====

const PlanProgressWidget = ({ completed, total, loading, error }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <DashboardWidget
      title="Completed sessions"
      subtitle="This week"
      icon={CheckCircle2}
      loading={loading}
      error={error}
      compact
    >
      <div style={styles.progressContent}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${percentage}%` }} />
        </div>
        <div style={styles.progressStats}>
          <KPIValue style={{ fontSize: '20px' }}>{completed}/{total}</KPIValue>
          <KPIMeta>{percentage}%</KPIMeta>
        </div>
      </div>
    </DashboardWidget>
  );
};

const HoursWidget = ({ hours, goal, loading, error }) => {
  const percentage = goal > 0 ? Math.round((hours / goal) * 100) : 0;

  return (
    <DashboardWidget
      title="Hours this week"
      subtitle={`Goal: ${goal}h`}
      icon={Clock}
      loading={loading}
      error={error}
      compact
    >
      <div style={styles.hoursContent}>
        <KPIValue style={{ fontSize: '24px', color: 'var(--text-brand)', minWidth: '48px' }}>{hours}h</KPIValue>
        <div style={styles.hoursProgress}>
          <div style={{ ...styles.hoursProgressFill, width: `${Math.min(percentage, 100)}%` }} />
        </div>
      </div>
    </DashboardWidget>
  );
};

// ===== 8. MESSAGES (Meldinger) - Prioritized =====

const MessageAvatar = ({ src, name }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (src) {
    return <img src={src} alt={name} style={styles.msgAvatar} />;
  }

  return (
    <div style={styles.msgAvatarFallback}>
      {getInitials(name)}
    </div>
  );
};

const MessagePriorityBadge = ({ priority, requiresResponse }) => {
  if (requiresResponse) {
    return (
      <span style={styles.msgBadgeUrgent}>Requires response</span>
    );
  }
  if (priority === 'high') {
    return (
      <span style={styles.msgBadgeHigh}>Important</span>
    );
  }
  if (priority === 'info') {
    return (
      <span style={styles.msgBadgeInfo}>FYI</span>
    );
  }
  return null;
};

/**
 * MessagesWidget - Memoized for performance
 */
const MessagesWidget = memo(({ messages, onViewAll, onMessageClick, onQuickReply, loading, error }) => {
  // Sort by priority: unread first, then by priority level
  const sortedMessages = [...messages].sort((a, b) => {
    if (a.unread !== b.unread) return a.unread ? -1 : 1;
    if (a.requiresResponse !== b.requiresResponse) return a.requiresResponse ? -1 : 1;
    if (a.priority !== b.priority) {
      const priorityOrder = { high: 0, medium: 1, low: 2, info: 3 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    }
    return 0;
  });

  const unreadCount = messages.filter(m => m.unread).length;

  return (
    <DashboardWidget
      title="Messages"
      icon={MessageCircle}
      action={onViewAll}
      actionLabel="View all →"
      loading={loading}
      error={error}
      empty={messages.length === 0}
      emptyMessage="No new messages"
      noPadding
      headerRight={
        unreadCount > 0 && (
          <Badge variant="accent" size="sm" style={styles.msgUnreadBadge}>
            {unreadCount}
          </Badge>
        )
      }
    >
      <div style={styles.messagesList}>
        {sortedMessages.slice(0, 4).map((msg, idx) => (
          <div
            key={msg.id || idx}
            style={{
              ...styles.messageItem,
              backgroundColor: msg.unread ? 'var(--accent-muted)' :
                              msg.requiresResponse ? 'var(--warning-muted)' : 'transparent',
            }}
            onClick={() => onMessageClick?.(msg)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onMessageClick?.(msg);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Message from ${msg.from || msg.sender}${msg.unread ? ' - unread' : ''}${msg.requiresResponse ? ' - requires response' : ''}`}
          >
            {/* Avatar */}
            <MessageAvatar src={msg.avatar} name={msg.from || msg.sender} />

            {/* Content */}
            <div style={styles.messageContent}>
              <div style={styles.messageHeader}>
                <p style={{
                  ...styles.messageSender,
                  fontWeight: msg.unread ? 600 : 500,
                }}>
                  {msg.from || msg.sender}
                </p>
                <MessagePriorityBadge
                  priority={msg.priority}
                  requiresResponse={msg.requiresResponse}
                />
              </div>
              <p style={styles.messagePreview}>{msg.message || msg.preview}</p>
              <div style={styles.messageMeta}>
                <span style={styles.messageTime}>{msg.time || 'Nylig'}</span>
                {msg.requiresResponse && onQuickReply && (
                  <button
                    style={styles.msgQuickReplyBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickReply(msg);
                    }}
                  >
                    Reply quickly →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
});

MessagesWidget.displayName = 'MessagesWidget';

// ===== ZONE C: BOTTOM SECTION =====

const TasksWidget = ({ tasks, onToggle, onViewAll, loading, error }) => {
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <DashboardWidget
      title="My Tasks"
      subtitle={`${completedCount}/${tasks.length} completed`}
      icon={Target}
      action={onViewAll}
      actionLabel="View all"
      loading={loading}
      error={error}
      empty={tasks.length === 0}
      emptyMessage="No tasks"
      emptyAction={onViewAll}
      emptyActionLabel="Add task"
      noPadding
    >
      <div style={styles.tasksList}>
        {tasks.slice(0, 5).map(task => (
          <div
            key={task.id}
            style={{
              ...styles.taskItem,
              backgroundColor: task.completed ? 'var(--success-muted)' : 'transparent',
            }}
            onClick={() => onToggle?.(task.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle?.(task.id);
              }
            }}
            role="checkbox"
            aria-checked={task.completed}
            tabIndex={0}
            aria-label={`${task.title}${task.completed ? ' - completed' : ''}${task.priority === 'high' ? ' - important' : ''}`}
          >
            <div style={{
              ...styles.taskCheckbox,
              borderColor: task.completed ? 'rgb(var(--status-success))' : 'var(--border-default)',
              backgroundColor: task.completed ? 'rgb(var(--status-success))' : 'transparent',
            }}>
              {task.completed && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <div style={styles.taskContent}>
              <p style={{
                ...styles.taskTitle,
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
              }}>
                {task.title}
              </p>
              <KPIMeta>{task.area}</KPIMeta>
            </div>
            {task.priority === 'high' && !task.completed && (
              <Badge variant="error" size="sm">Viktig</Badge>
            )}
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
};

const SessionsWidget = ({ sessions, onViewAll, onSessionClick, loading, error }) => (
  <DashboardWidget
    title="Today's Sessions"
    icon={Calendar}
    action={onViewAll}
    actionLabel="Calendar"
    loading={loading}
    error={error}
    empty={sessions.length === 0}
    emptyMessage="No sessions scheduled today"
    emptyAction={onViewAll}
    emptyActionLabel="Go to calendar"
    noPadding
  >
    <div style={styles.sessionsList}>
      {sessions.map(session => (
        <div
          key={session.id}
          style={styles.sessionItem}
          onClick={() => onSessionClick?.(session)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSessionClick?.(session);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`${session.title} kl ${session.time}, ${session.duration} minutter ved ${session.location}`}
        >
          <div style={styles.sessionIcon}>
            <Play size={16} />
          </div>
          <div style={styles.sessionContent}>
            <p style={styles.sessionTitle}>{session.title}</p>
            <KPIMeta style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={12} /> {session.time} &middot; <MapPin size={12} /> {session.location}
            </KPIMeta>
          </div>
          <div style={styles.sessionDuration}>
            <KPIMeta style={{ fontWeight: 500 }}>{session.duration} min</KPIMeta>
          </div>
        </div>
      ))}
    </div>
  </DashboardWidget>
);

// ===== MAIN DASHBOARD =====

// Quick action routes - defined outside component to avoid recreation
const QUICK_ACTION_ROUTES = {
  session: '/sessions/new',
  goal: '/maalsetninger/new',
  progress: '/progress',
  calendar: '/kalender',
};

// Default player fallback
const DEFAULT_PLAYER = { name: 'Andreas Holm', category: 'B', club: 'Slice Country Club', memberSince: '2023' };

// Default stats fallback
const DEFAULT_STATS = {
  sessionsCompleted: 8,
  sessionsTotal: 12,
  hoursThisWeek: 14.5,
  hoursGoal: 20,
  streak: 7,
  scoringAverage: 74.2,
  strokesGained: 1.3,
  totalSessions: 47,
  sessionsTrend: 2,
  hoursTrend: 3.5,
  streakTrend: 2,
  scoringTrend: -0.5,
};

// LocalStorage key for onboarding dismissal
const ONBOARDING_DISMISSED_KEY = 'tier-golf-onboarding-dismissed';

const TIERGolfDashboard = () => {
  const navigate = useNavigate();
  const { data: dashboardData, loading, error, refetch } = useDashboard();
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);

  // Onboarding state - check localStorage for dismissal
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem(ONBOARDING_DISMISSED_KEY) !== 'true';
    } catch {
      return true; // Show by default if localStorage unavailable
    }
  });

  // Sync goals with dashboard data
  useEffect(() => {
    if (dashboardData?.tasks) {
      setGoals(dashboardData.tasks);
    }
  }, [dashboardData]);

  // Dismiss onboarding handler
  const handleDismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true');
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Memoized toggle handler
  const toggleGoal = useCallback((id) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  }, []);

  // Memoized greeting - only recalculate when needed
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []); // Static for the component lifetime

  // Memoized quick action handler
  const handleQuickAction = useCallback((action) => {
    navigate(QUICK_ACTION_ROUTES[action] || '/');
  }, [navigate]);

  // Memoized data extraction with fallbacks
  const player = useMemo(() =>
    dashboardData?.player || DEFAULT_PLAYER,
    [dashboardData?.player]
  );

  const stats = useMemo(() =>
    dashboardData?.stats || DEFAULT_STATS,
    [dashboardData?.stats]
  );

  const nextTournament = dashboardData?.nextTournament;
  const nextTest = dashboardData?.nextTest;

  const messages = useMemo(() =>
    dashboardData?.notifications || [],
    [dashboardData?.notifications]
  );

  const todaySessions = useMemo(() =>
    dashboardData?.upcomingSessions || [],
    [dashboardData?.upcomingSessions]
  );

  // Onboarding completion status - derived from dashboard data
  const onboardingStatus = useMemo(() => ({
    // Profile is complete if user has name, verified email, and club
    profileComplete: !!(player.name && user?.email && player.club),
    hasGoals: goals.length > 0 || (dashboardData?.tasks?.length > 0),
    hasScheduledSession: todaySessions.length > 0 || stats.sessionsCompleted > 0,
    hasUpcomingTournament: !!nextTournament,
  }), [player, user?.email, goals, dashboardData?.tasks, todaySessions, stats.sessionsCompleted, nextTournament]);

  // Determine if user is new (show onboarding only for new users)
  const isNewUser = useMemo(() => {
    const requiredComplete = onboardingStatus.profileComplete &&
                            onboardingStatus.hasGoals &&
                            onboardingStatus.hasScheduledSession;
    return !requiredComplete;
  }, [onboardingStatus]);

  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* TIER-compliant PageHeader with tabs */}
      <PageHeader
        title="Dashboard"
        subtitle="Oversikt over din golfreise"
        helpText="Din hjemmeside med oversikt over dagens økter, ukens mål, kommende tester og turneringer. Se fremgang, treningsstatistikk og meldinger fra trener på ett sted."
        tabs={{
          items: [
            {
              id: 'oversikt',
              label: 'Oversikt',
              content: (
                <PageContainer paddingY="md" background="base" fullWidth={true}>
        <div id="dashboard-export" className="dashboard-layout" style={styles.dashboard}>
          {/* Export Button - Full Width */}
          <div className="dashboard-full-width" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-8px' }}>
            <ExportButton
              targetId="dashboard-export"
              filename={`oversikt-${player.name?.replace(/\s+/g, '-') || 'spiller'}-${new Date().toISOString().split('T')[0]}`}
              title={`Overview - ${player.name || 'Player'}`}
              variant="icon"
              size="sm"
            />
          </div>

          {/* Stale data banner - Full Width */}
          {error && dashboardData && (
            <div className="dashboard-full-width" style={styles.staleBanner}>
              <span>Showing cached data. Some information may be outdated.</span>
              <button style={styles.staleRetry} onClick={refetch}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          )}

          {/* Onboarding Checklist - Show for new users who haven't dismissed */}
          {showOnboarding && isNewUser && (
            <div className="dashboard-full-width">
              <OnboardingChecklist
                completionStatus={onboardingStatus}
                onDismiss={handleDismissOnboarding}
              />
            </div>
          )}

          {/* 1. HERO SECTION: Greeting + Smart Insight - Full Width */}
          <div className="dashboard-hero dashboard-full-width">
            <HeroSection
              player={player}
              greeting={greeting}
              stats={stats}
              nextTest={nextTest}
              todaySessions={todaySessions}
            />
          </div>

          {/* 2. TODAY'S ACTION CARD (if sessions exist) - Full Width */}
          <div className="dashboard-action-card dashboard-full-width">
            <TodayActionCard
              sessions={todaySessions}
              onStartSession={(s) => navigate(`/session/${s.id}/start`)}
              onViewCalendar={() => navigate('/kalender')}
            />
          </div>

          {/* 3. WEEKLY PERFORMANCE SUMMARY (4 KPIs) - Full Width */}
          <div className="dashboard-kpi-section dashboard-full-width">
            <WeeklyPerformanceSummary stats={stats} loading={loading} />
          </div>

          {/* 4. QUICK ACTIONS (Hurtigvalg) - Full Width */}
          <div className="dashboard-quick-actions-section dashboard-full-width">
            <QuickActions onAction={handleQuickAction} />
          </div>

          {/* ===== MAIN CONTENT AREA ===== */}
          <div className="dashboard-main">
            {/* 5. WEEKLY GOALS (Ukens Mål) - EXPANDED */}
            <div className="dashboard-main-full">
              <WeeklyGoalsWidget
                goals={goals}
                onToggle={toggleGoal}
                onAddGoal={() => navigate('/maalsetninger/new')}
                onViewAll={() => navigate('/kalender')}
                loading={loading}
              />
            </div>

            {/* 6. TODAY'S SESSIONS (Dagens Økter) */}
            <div className="dashboard-main-full">
              <SessionsWidget
                sessions={todaySessions}
                onViewAll={() => navigate('/kalender')}
                onSessionClick={(s) => navigate(`/session/${s.id}`)}
                loading={loading}
              />
            </div>

            {/* 7. NEXT TEST (Neste Test) */}
            {nextTest && (
              <div className="dashboard-main-full">
                <NextTestCard
                  title={nextTest.title}
                  date={nextTest.date || '2026-03-15'}
                  location={nextTest.location}
                  preparation={nextTest.preparation || {
                    reviewedMaterial: false,
                    practicedWeakAreas: false,
                    takenPracticeTest: false,
                  }}
                  onViewDetails={() => navigate('/tests')}
                  onPrepare={() => navigate('/tests/prepare')}
                />
              </div>
            )}
          </div>

          {/* ===== SIDEBAR AREA ===== */}
          <div className="dashboard-sidebar">
            {/* 8. MESSAGES (Meldinger) - Prioritized */}
            <MessagesWidget
              messages={messages}
              onViewAll={() => navigate('/meldinger')}
              onMessageClick={(m) => navigate(`/meldinger/${m.id}`)}
              onQuickReply={(m) => navigate(`/meldinger/${m.id}/reply`)}
              loading={loading}
            />

            {/* 9. NEXT TOURNAMENT (Neste Turnering) - Minimized if >30 days */}
            {nextTournament && (
              <NextTournamentCard
                title={nextTournament.title}
                date={nextTournament.date || '2026-06-15'}
                location={nextTournament.location}
                onViewDetails={() => navigate('/tournaments')}
              />
            )}
          </div>
        </div>
                </PageContainer>
              ),
            },
            {
              id: 'maal',
              label: 'Mål',
              content: (
                <PageContainer paddingY="md" background="base" fullWidth={true}>
                  <div className="text-center py-12">
                    <p className="text-tier-text-tertiary">Mål-visning kommer snart</p>
                  </div>
                </PageContainer>
              ),
            },
            {
              id: 'kalender',
              label: 'Kalender',
              content: (
                <PageContainer paddingY="md" background="base" fullWidth={true}>
                  <div className="text-center py-12">
                    <p className="text-tier-text-tertiary">Kalender-visning kommer snart</p>
                  </div>
                </PageContainer>
              ),
            },
            {
              id: 'turneringer',
              label: 'Turneringer',
              content: (
                <PageContainer paddingY="md" background="base" fullWidth={true}>
                  <div className="text-center py-12">
                    <p className="text-tier-text-tertiary">Turneringer-visning kommer snart</p>
                  </div>
                </PageContainer>
              ),
            },
          ],
          defaultTab: 'oversikt',
        }}
      />
    </div>
  );
};

// ===== STYLES =====

const styles = {
  dashboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px', // Consistent spacing
    width: '100%',
    padding: '0', // Layout handles padding
  },

  // Stale banner
  staleBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: 'var(--warning-muted)',
    borderRadius: '12px',
    borderLeft: '3px solid rgb(var(--status-warning))',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  staleRetry: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '4px 8px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  // 1. Hero Section
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  heroContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  greetingLabel: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
  },
  playerName: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  smartInsight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: '12px',
    marginTop: '8px',
  },
  insightIcon: {
    fontSize: '16px',
  },
  insightMessage: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  actionRecommendation: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },

  // 2. Today's Action Card
  actionCard: {
    backgroundColor: 'var(--accent-muted)',
    borderRadius: '16px',
    padding: '20px',
    border: '2px solid var(--text-brand)',
  },
  actionCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  actionCardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'var(--text-brand)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  actionCardLabel: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  actionCardTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  actionCardMeta: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  actionCardButtons: {
    display: 'flex',
    gap: '12px',
  },

  // 3. KPI Grid
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  kpiCard: {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    padding: '16px 20px',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  kpiIconRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
  },
  trendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
  kpiValue: {
    fontSize: '24px',
    fontWeight: 700,
    fontFeatureSettings: '"tnum"',
    color: 'var(--text-primary)',
  },
  kpiLabel: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  kpiProgressWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '4px',
  },
  kpiProgressBar: {
    height: '8px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  kpiProgressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  kpiProgressLabel: {
    fontSize: '11px',
    color: 'var(--text-tertiary)',
  },
  kpiContext: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    margin: 0,
    marginTop: '2px',
  },

  // 4. Quick Actions
  quickActionsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    margin: 0,
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  quickActionBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '16px 12px',
    minHeight: '44px', // WCAG AA touch target
    minWidth: '44px',  // WCAG AA touch target
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontWeight: 500,
  },

  // 5. Weekly Goals - Enhanced
  goalCompletionBadge: {
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
  },
  goalsOverallProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px 16px',
  },
  goalsProgressBarThick: {
    flex: 1,
    height: '12px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  goalsProgressFillThick: {
    height: '100%',
    backgroundColor: 'rgb(var(--status-success))',
    borderRadius: '6px',
    transition: 'width 0.3s ease',
  },
  goalsProgressPercent: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    minWidth: '36px',
  },
  goalsList: {
    display: 'flex',
    flexDirection: 'column',
  },
  goalItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 24px',
    minHeight: '44px', // WCAG AA touch target
    borderBottom: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, outline 0.15s ease',
    outline: 'none',
  },
  goalCheckbox: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  goalTypeIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  goalContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  goalTitle: {
    fontSize: '14px',
    fontWeight: 500,
    margin: 0,
    transition: 'color 0.15s ease',
  },
  goalMiniProgressWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px',
  },
  goalMiniProgress: {
    flex: 1,
    height: '6px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '3px',
    overflow: 'hidden',
    maxWidth: '100px',
  },
  goalMiniProgressFill: {
    height: '100%',
    backgroundColor: 'var(--text-brand)',
    borderRadius: '3px',
  },
  goalMiniProgressText: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  goalCompletedBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: 'var(--success-muted)',
    color: 'rgb(var(--status-success))',
  },
  goalAtRiskBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: 'var(--error-muted)',
    color: 'rgb(var(--status-error))',
  },
  goalProgressBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
  },
  addGoalBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '14px 24px',
    minHeight: '44px', // WCAG AA touch target
    backgroundColor: 'transparent',
    border: 'none',
    borderTop: '1px dashed var(--border-default)',
    color: 'var(--text-brand)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },

  // 7. Next Test - Enhanced
  testMinimized: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-subtle)',
  },
  testMinimizedLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  testMinimizedText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  testMinimizedBtn: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-brand)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    minHeight: '44px', // WCAG AA touch target
    minWidth: '44px',
    padding: '8px 12px',
  },
  testHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  testHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  testIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  },
  testLocation: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: '4px 0 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  testDaysBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'white',
  },
  prepChecklist: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  prepChecklistTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    margin: '0 0 4px 0',
  },
  prepChecklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  prepCheckbox: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  prepChecklistText: {
    fontSize: '14px',
  },
  testCTA: {
    padding: '0 20px 16px',
  },

  // 8. Messages - Enhanced with avatars
  msgUnreadBadge: {
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
  },
  messagesList: {
    display: 'flex',
    flexDirection: 'column',
  },
  messageItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 24px',
    minHeight: '44px', // WCAG AA touch target
    borderBottom: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, outline 0.15s ease',
    outline: 'none',
  },
  msgAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  },
  msgAvatarFallback: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-muted)',
    color: 'var(--text-brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    flexShrink: 0,
  },
  messageContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  messageSender: {
    fontSize: '14px',
    color: 'var(--text-primary)',
    margin: 0,
  },
  msgBadgeUrgent: {
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: 'rgb(var(--status-error))',
    color: 'white',
  },
  msgBadgeHigh: {
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: 'var(--warning-muted)',
    color: 'rgb(var(--status-warning))',
  },
  msgBadgeInfo: {
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '10px',
    fontWeight: 600,
    backgroundColor: 'var(--info-muted)',
    color: 'rgb(var(--status-info))',
  },
  messagePreview: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  messageMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '4px',
  },
  messageTime: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
  },
  msgQuickReplyBtn: {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-brand)',
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  // 9. Tournament minimized
  tournamentMinimized: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px',
    border: '1px solid var(--border-subtle)',
  },
  tournamentMinimizedLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  tournamentMinimizedText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  tournamentMinimizedBtn: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-brand)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  // Profile Card
  profileContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    gap: '24px',
    flexWrap: 'wrap',
  },
  profileLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatarContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  avatarImage: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid var(--border-subtle)',
  },
  avatarFallback: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent-muted)',
    color: 'var(--text-brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 700,
    border: '3px solid var(--border-subtle)',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    color: 'white',
    fontSize: '11px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--card)',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  profileName: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  profileClub: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  profileMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '4px',
  },
  memberSince: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
  },
  profileStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  profileStatItem: {
    textAlign: 'center',
    minWidth: '48px',
  },
  profileStatValue: {
    display: 'block',
    fontSize: '22px',
    fontWeight: 700,
    fontFeatureSettings: '"tnum"',
    color: 'var(--text-primary)',
    lineHeight: 1,
  },
  profileStatLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    marginTop: '4px',
  },
  profileStatDivider: {
    width: '1px',
    height: '32px',
    backgroundColor: 'var(--border-subtle)',
  },
  profileActions: {
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-tertiary)',
  },
  profileActionButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px 16px',
    minHeight: '44px', // WCAG AA touch target
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    borderRight: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },

  // Stats Row
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  statContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statIcon: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--accent-muted)',
    color: 'var(--text-brand)',
    borderRadius: '10px',
  },
  statText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  // Countdown Row
  countdownRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  countdownContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countdownLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  countdownIcon: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    borderRadius: '10px',
  },
  countdownTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '4px 0 0 0',
  },
  countdownLocation: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    margin: '4px 0 0 0',
  },
  countdownRight: {
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },

  // Zone B
  zoneB: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  zoneBGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },

  // Progress Widget
  progressContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  progressBar: {
    height: '8px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgb(var(--status-success))',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Hours Widget
  hoursContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  hoursProgress: {
    flex: 1,
    height: '8px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  hoursProgressFill: {
    height: '100%',
    backgroundColor: 'var(--tier-navy)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },

  // Notifications
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  notificationDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgb(var(--status-info))',
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
    color: 'var(--text-primary)',
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

  // Peer Section
  peerSection: {
    marginTop: '8px',
  },

  // Zone C
  zoneC: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  zoneCGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },

  // Tasks
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    minHeight: '44px', // WCAG AA touch target
    borderBottom: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, outline 0.15s ease',
    outline: 'none',
  },
  taskCheckbox: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  taskContent: {
    flex: 1,
    minWidth: 0,
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: 500,
    margin: 0,
    transition: 'color 0.15s ease',
  },

  // Sessions
  sessionsList: {
    display: 'flex',
    flexDirection: 'column',
  },
  sessionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    minHeight: '44px', // WCAG AA touch target
    borderBottom: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, outline 0.15s ease',
    outline: 'none',
  },
  sessionIcon: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--tier-navy)',
    color: 'white',
    borderRadius: '10px',
  },
  sessionContent: {
    flex: 1,
    minWidth: 0,
  },
  sessionTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    margin: 0,
  },
  sessionDuration: {
    padding: '4px 10px',
    backgroundColor: 'var(--accent-muted)',
    borderRadius: '6px',
  },

  // Primary CTA
  primaryCTA: {
    paddingTop: '8px',
  },
};

export default TIERGolfDashboard;
