import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Target, Dumbbell, Brain, ChevronRight, ChevronDown,
  Play, BarChart2, BookOpen, Plus, Video, Radar, FileText, Lightbulb,
  Gauge, ClipboardList, Star, TrendingUp, Activity, Award, Flame
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import Card from '../../ui/primitives/Card';
import { SectionTitle, SubSectionTitle } from '../../ui/primitives/typography';

// ============================================================================
// MOCK DATA - Will be replaced with API data
// ============================================================================

const TRAINING_STATS = {
  sessionsThisMonth: 15,
  hoursThisMonth: 24,
  exercisesCompleted: 87,
  testsCompleted: 3,
  currentStreak: 5,
  weeklyGoal: 5,
  sessionsThisWeek: 3,
};

// ============================================================================
// DYNAMIC GREETING
// ============================================================================

const getTrainingGreeting = (sessionsThisWeek, weeklyGoal) => {
  const remaining = weeklyGoal - sessionsThisWeek;
  const hour = new Date().getHours();

  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (remaining <= 0) {
    return {
      title: `${timeGreeting}!`,
      subtitle: 'Weekly goal reached! Fantastic effort.',
      emoji: '🏆',
      mood: 'celebration'
    };
  }
  if (remaining === 1) {
    return {
      title: `${timeGreeting}!`,
      subtitle: 'Just one session left to reach your weekly goal!',
      emoji: '🔥',
      mood: 'motivated'
    };
  }
  return {
    title: `${timeGreeting}!`,
    subtitle: `${sessionsThisWeek} of ${weeklyGoal} sessions this week`,
    emoji: '💪',
    mood: 'normal'
  };
};

// ============================================================================
// ANIMATED STAT COMPONENT
// ============================================================================

const AnimatedStat = ({ value, suffix = '', label, icon: Icon, color, trend }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <Card variant="default" padding="md" style={{ textAlign: 'center', flex: 1 }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        backgroundColor: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1,
      }}>
        {displayValue}{suffix}
      </div>
      <div style={{
        fontSize: '12px',
        color: 'var(--text-secondary)',
        marginTop: '4px',
      }}>
        {label}
      </div>
      {trend && (
        <div style={{
          fontSize: '11px',
          color: trend.direction === 'up' ? 'var(--success)' : 'var(--error)',
          marginTop: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
        }}>
          <TrendingUp size={12} style={{ transform: trend.direction === 'down' ? 'rotate(180deg)' : 'none' }} />
          {trend.percentage}%
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// TRAINING STREAK COMPONENT
// ============================================================================

const TrainingStreak = ({ currentStreak, recordStreak = 12 }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: currentStreak > 0 ? 'rgba(251, 146, 60, 0.1)' : 'var(--bg-secondary)',
    borderRadius: '12px',
    marginBottom: '20px',
  }}>
    <div style={{
      fontSize: '32px',
      animation: currentStreak > 0 ? 'flicker 0.3s ease-in-out infinite alternate' : 'none',
      filter: currentStreak > 0 ? 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.6))' : 'none',
    }}>
      🔥
    </div>
    <div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
        {currentStreak} days in a row
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        Record: {recordStreak} days
      </div>
    </div>
  </div>
);

// ============================================================================
// WEEKLY HEATMAP COMPONENT
// ============================================================================

const WeeklyHeatmap = ({ sessions = [60, 45, 0, 90, 30, 0, 0] }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getLevel = (minutes) => {
    if (minutes > 60) return 3;
    if (minutes > 30) return 2;
    if (minutes > 0) return 1;
    return 0;
  };

  const levelColors = {
    0: 'var(--bg-secondary)',
    1: 'rgba(16, 185, 129, 0.3)',
    2: 'rgba(16, 185, 129, 0.6)',
    3: 'var(--success)',
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '12px',
      }}>
        This week
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {days.map((day, i) => {
          const level = getLevel(sessions[i]);
          return (
            <div key={day} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                width: '100%',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: levelColors[level],
                marginBottom: '4px',
                transition: 'background-color 0.2s',
              }} />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// EXPANDABLE MENU ITEM COMPONENT
// ============================================================================

const ExpandableMenuItem = ({ item, isExpanded, onToggle }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.expandable && item.subItems) {
      onToggle();
    } else if (item.href) {
      navigate(item.href);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          borderRadius: '10px',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          backgroundColor: `${item.color || 'var(--accent)'}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {item.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
            {item.title}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {item.subtitle}
          </div>
        </div>
        {item.expandable ? (
          <ChevronDown
            size={18}
            color="var(--text-secondary)"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        ) : (
          <ChevronRight size={18} color="var(--text-secondary)" />
        )}
      </div>

      {/* Sub-items */}
      {isExpanded && item.subItems && (
        <div style={{
          marginLeft: '24px',
          paddingLeft: '16px',
          borderLeft: '2px solid var(--border-default)',
          marginTop: '4px',
        }}>
          {item.subItems.map((subItem, idx) => (
            <Link
              key={idx}
              to={subItem.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {subItem.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {subItem.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {subItem.subtitle}
                </div>
              </div>
              <ChevronRight size={16} color="var(--text-tertiary)" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// CATEGORY CARD COMPONENT
// ============================================================================

const CategoryCard = ({ title, color, links, expandedItems, onToggleExpand }) => (
  <Card variant="default" padding="none" style={{ overflow: 'hidden' }}>
    {/* Card Header */}
    <div style={{
      padding: '16px 20px',
      backgroundColor: `${color}08`,
      borderBottom: `2px solid ${color}`,
    }}>
      <SubSectionTitle style={{ marginBottom: 0, color: color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </SubSectionTitle>
    </div>

    {/* Card Links */}
    <div style={{ padding: '8px' }}>
      {links.map((link, idx) => (
        <ExpandableMenuItem
          key={idx}
          item={link}
          isExpanded={expandedItems[link.title]}
          onToggle={() => onToggleExpand(link.title)}
        />
      ))}
    </div>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TreningOversiktContainer = () => {
  const [stats] = useState(TRAINING_STATS);
  const [expandedItems, setExpandedItems] = useState({});

  const greeting = getTrainingGreeting(stats.sessionsThisWeek, stats.weeklyGoal);

  const handleToggleExpand = (itemTitle) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemTitle]: !prev[itemTitle],
    }));
  };

  // Category configurations based on work instruction
  const treningLinks = [
    {
      icon: <Calendar size={18} color="var(--success)" />,
      title: 'My Sessions',
      subtitle: 'Planned sessions',
      color: 'var(--success)',
      expandable: true,
      subItems: [
        {
          icon: <Plus size={16} color="var(--text-secondary)" />,
          title: 'Log Training Session',
          subtitle: 'Register training session',
          href: '/trening/logg',
        },
        {
          icon: <BookOpen size={16} color="var(--text-secondary)" />,
          title: 'Training History',
          subtitle: 'View training history',
          href: '/trening/dagbok',
        },
        {
          icon: <BarChart2 size={16} color="var(--text-secondary)" />,
          title: 'Training Analysis',
          subtitle: 'Weekly/monthly statistics',
          href: '/treningsstatistikk',
        },
      ],
    },
    {
      icon: <ClipboardList size={18} color="var(--success)" />,
      title: 'My Training Plan',
      subtitle: 'Weekly plan',
      href: '/trening/ukens',
      color: 'var(--success)',
    },
  ];

  const tekniskPlanLinks = [
    {
      icon: <Target size={18} color="var(--success)" />,
      title: 'Technique Plan',
      subtitle: 'Technical development plan',
      href: '/plan/teknisk-plan',
      color: 'var(--success)',
    },
    {
      icon: <Dumbbell size={18} color="var(--success)" />,
      title: 'Exercise Library',
      subtitle: 'All exercises + my exercises',
      href: '/ovelsesbibliotek',
      color: 'var(--success)',
    },
    {
      icon: <Video size={18} color="var(--success)" />,
      title: 'Video',
      subtitle: 'Videos and comparison',
      href: '/videos',
      color: 'var(--success)',
    },
    {
      icon: <Radar size={18} color="var(--success)" />,
      title: 'TrackMan Sync',
      subtitle: 'Sync TrackMan data',
      href: '/trening/trackman-sync',
      color: 'var(--success)',
    },
  ];

  const testingLinks = [
    {
      icon: <FileText size={18} color="var(--success)" />,
      title: 'Test Protocol',
      subtitle: 'Run tests',
      href: '/testprotokoll',
      color: 'var(--success)',
    },
    {
      icon: <Play size={18} color="var(--success)" />,
      title: 'Log Test',
      subtitle: 'Log test result',
      href: '/testing/registrer',
      color: 'var(--success)',
    },
  ];

  const kunnskapLinks = [
    {
      icon: <Gauge size={18} color="var(--text-secondary)" />,
      title: 'Category System',
      subtitle: 'A-K category explanation',
      href: '/testing/krav',
      color: 'var(--text-secondary)',
    },
    {
      icon: <Target size={18} color="var(--text-secondary)" />,
      title: 'Training Focus',
      subtitle: 'Focus areas',
      href: '/utvikling',
      color: 'var(--text-secondary)',
    },
    {
      icon: <Lightbulb size={18} color="var(--text-secondary)" />,
      title: 'Focus Engine',
      subtitle: 'AI recommendations',
      href: '/utvikling/breaking-points',
      color: 'var(--text-secondary)',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      <PageHeader
        title="Training"
        subtitle="Log training, view sessions, and register tests"
      />

      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <Card variant="elevated" padding="lg" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <span style={{ fontSize: '40px' }}>{greeting.emoji}</span>
            <div>
              <SectionTitle style={{ marginBottom: 0 }}>
                {greeting.title}
              </SectionTitle>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                margin: '4px 0 0 0',
              }}>
                {greeting.subtitle}
              </p>
            </div>
          </div>

          <TrainingStreak currentStreak={stats.currentStreak} />

          <WeeklyHeatmap />

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '12px',
          }}>
            <AnimatedStat
              value={stats.sessionsThisMonth}
              label="Sessions"
              icon={Activity}
              color="var(--accent)"
              trend={{ direction: 'up', percentage: 12 }}
            />
            <AnimatedStat
              value={stats.hoursThisMonth}
              suffix="h"
              label="Hours"
              icon={Clock}
              color="var(--success)"
              trend={{ direction: 'up', percentage: 8 }}
            />
            <AnimatedStat
              value={stats.exercisesCompleted}
              label="Exercises"
              icon={Dumbbell}
              color="var(--warning)"
            />
            <AnimatedStat
              value={stats.testsCompleted}
              label="Tests"
              icon={Target}
              color="var(--error)"
            />
          </div>
        </Card>

        {/* Category Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          marginBottom: '20px',
        }}>
          <CategoryCard
            title="TRAINING"
            color="var(--success)"
            links={treningLinks}
            expandedItems={expandedItems}
            onToggleExpand={handleToggleExpand}
          />
          <CategoryCard
            title="TECHNIQUE PLAN"
            color="var(--success)"
            links={tekniskPlanLinks}
            expandedItems={expandedItems}
            onToggleExpand={handleToggleExpand}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
        }}>
          <CategoryCard
            title="TESTING"
            color="var(--success)"
            links={testingLinks}
            expandedItems={expandedItems}
            onToggleExpand={handleToggleExpand}
          />
          <CategoryCard
            title="KNOWLEDGE"
            color="var(--text-secondary)"
            links={kunnskapLinks}
            expandedItems={expandedItems}
            onToggleExpand={handleToggleExpand}
          />
        </div>

        {/* Quick Action Button */}
        <Link
          to="/trening/logg"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '24px',
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: 'var(--accent)',
            color: 'white',
            fontSize: '15px',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
        >
          <Plus size={20} />
          Log new training session
        </Link>
      </div>

      {/* CSS Animation for streak flame */}
      <style>{`
        @keyframes flicker {
          from { transform: scale(1) rotate(-3deg); }
          to { transform: scale(1.15) rotate(3deg); }
        }

        @media (max-width: 768px) {
          .category-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TreningOversiktContainer;
