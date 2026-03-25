/**
 * TIERGolfAarsplan Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 *
 * Features:
 * - Gantt-style timeline visualization
 * - Swimlane focus matrix
 * - Improved month cards
 */

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography';
import ExportButton from '../../components/ui/ExportButton';

// Period colors (Blue Palette 01)
const periodColors = {
  evaluering: 'var(--text-muted)',
  grunnlag: 'rgb(var(--tier-gold))',
  spesialisering: 'rgb(var(--tier-navy))',
  turnering: 'var(--achievement)',
};

// ===== ICONS =====
const Icons = {
  ChevronDown: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  ),
  Target: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Flag: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  Trophy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  GolfFlag: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  GolfBall: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
      <path d="M2 12h20"/>
    </svg>
  ),
  Crosshair: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="22" y1="12" x2="18" y2="12"/>
      <line x1="6" y1="12" x2="2" y2="12"/>
      <line x1="12" y1="6" x2="12" y2="2"/>
      <line x1="12" y1="22" x2="12" y2="18"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6"/>
      <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24"/>
      <path d="M1 12h6m6 0h6"/>
      <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24"/>
    </svg>
  ),
  Dumbbell: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.4 14.4 9.6 9.6"/>
      <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/>
      <path d="m21.5 21.5-1.4-1.4"/>
      <path d="M3.9 3.9 2.5 2.5"/>
      <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/>
    </svg>
  ),
};

// ===== GANTT TIMELINE COMPONENT =====
const GanttTimeline = ({ yearPlan, periodConfig, currentMonthIndex }) => {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  // Group consecutive months by period
  const periodBars = useMemo(() => {
    const bars = [];
    let currentPeriod = null;
    let startIdx = 0;

    yearPlan.forEach((month, idx) => {
      if (month.period !== currentPeriod) {
        if (currentPeriod !== null) {
          bars.push({
            period: currentPeriod,
            startIdx,
            endIdx: idx - 1,
            config: periodConfig[currentPeriod],
          });
        }
        currentPeriod = month.period;
        startIdx = idx;
      }
    });
    // Add final period
    if (currentPeriod !== null) {
      bars.push({
        period: currentPeriod,
        startIdx,
        endIdx: yearPlan.length - 1,
        config: periodConfig[currentPeriod],
      });
    }
    return bars;
  }, [yearPlan, periodConfig]);

  // Extract tournaments from all months
  const tournaments = useMemo(() => {
    const all = [];
    yearPlan.forEach((month, idx) => {
      if (month.tournaments && month.tournaments.length > 0) {
        month.tournaments.forEach(t => {
          all.push({ name: t, monthIdx: idx });
        });
      }
    });
    return all;
  }, [yearPlan]);

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      border: '1px solid var(--border-default)',
    }}>
      <SubSectionTitle style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
        Annual Wheel - Period Overview
      </SubSectionTitle>

      {/* Month labels */}
      <div style={{ display: 'flex', marginBottom: '8px', paddingLeft: '100px' }}>
        {months.map((m, idx) => (
          <div
            key={m}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: idx === currentMonthIndex ? 600 : 400,
              color: idx === currentMonthIndex ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            {m}
          </div>
        ))}
      </div>

      {/* Gantt bars */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        {/* Period row */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ width: '100px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Period
          </div>
          <div style={{ flex: 1, display: 'flex', height: '32px', gap: '2px' }}>
            {periodBars.map((bar, idx) => {
              const width = ((bar.endIdx - bar.startIdx + 1) / 12) * 100;
              return (
                <div
                  key={idx}
                  style={{
                    width: `${width}%`,
                    backgroundColor: bar.config.color,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgb(var(--tier-white))',
                    fontSize: '11px',
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  {bar.config.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current month indicator */}
        <div style={{
          position: 'absolute',
          left: `calc(100px + ${(currentMonthIndex + 0.5) / 12 * 100}% - ${100 / 12 / 2}%)`,
          top: 0,
          bottom: 0,
          width: '2px',
          backgroundColor: 'var(--accent)',
          zIndex: 10,
        }}>
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
          }} />
        </div>
      </div>

      {/* Tournaments row */}
      {tournaments.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '100px', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', paddingTop: '4px' }}>
            Tournaments
          </div>
          <div style={{ flex: 1, position: 'relative', minHeight: '28px' }}>
            {tournaments.map((t, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${(t.monthIdx / 12) * 100}%`,
                  top: `${(idx % 2) * 16}px`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--achievement)',
                }} />
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {t.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== SWIMLANE FOCUS MATRIX =====
const SwimlaneFocusMatrix = ({ yearPlan, focusAreas, priorityLabels }) => {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  // Get intensity color based on priority value
  const getIntensityStyle = (value) => {
    const colors = {
      0: { bg: 'var(--bg-tertiary)', opacity: 0.3 },
      1: { bg: 'var(--text-secondary)', opacity: 0.5 },
      2: { bg: 'var(--status-warning)', opacity: 0.7 },
      3: { bg: 'var(--status-success)', opacity: 1 },
    };
    return colors[value] || colors[0];
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      border: '1px solid var(--border-default)',
    }}>
      <SubSectionTitle style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
        Focus Matrix - Intensity Over the Year
      </SubSectionTitle>

      {/* Month headers */}
      <div style={{ display: 'flex', marginBottom: '8px' }}>
        <div style={{ width: '120px' }} />
        {months.map((m) => (
          <div
            key={m}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            {m}
          </div>
        ))}
      </div>

      {/* Focus area rows - reversed to show pyramid order (bottom to top) */}
      {[...focusAreas].reverse().map((area) => (
        <div key={area.key} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{
            width: '120px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>{area.icon}</span>
            {area.label}
          </div>
          <div style={{ flex: 1, display: 'flex', gap: '2px' }}>
            {yearPlan.map((month, idx) => {
              const value = month.focus[area.key];
              const intensity = getIntensityStyle(value);
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: '24px',
                    backgroundColor: intensity.bg,
                    opacity: intensity.opacity,
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={`${area.label}: ${priorityLabels[value]?.label || 'Pause'} (${month.month})`}
                >
                  {value > 0 && (
                    <span style={{ fontSize: '9px', fontWeight: 600, color: value >= 2 ? 'rgb(var(--tier-white))' : 'var(--text-secondary)' }}>
                      {value}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        {[3, 2, 1, 0].map(p => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '3px',
              backgroundColor: getIntensityStyle(p).bg,
              opacity: getIntensityStyle(p).opacity,
            }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {priorityLabels[p]?.label || 'Pause'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== IMPROVED MONTH CARD =====
const ImprovedMonthCard = ({ month, periodConfig, priorityLabels, focusAreas, isCurrentMonth, isExpanded, onToggle }) => {
  const period = periodConfig[month.period];
  const completedGoals = month.activities?.length || 0;

  return (
    <div
      onClick={onToggle}
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '12px',
        border: isCurrentMonth ? '2px solid var(--accent)' : '1px solid var(--border-default)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header with gradient */}
      <div style={{
        padding: '12px 14px',
        background: `linear-gradient(135deg, ${period.color}20, ${period.color}08)`,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {month.month}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Week {month.weeks[0]}-{month.weeks[month.weeks.length - 1]}
            </div>
          </div>
          <div style={{
            padding: '4px 10px',
            borderRadius: '6px',
            backgroundColor: period.bg,
            color: period.color,
            fontSize: '11px',
            fontWeight: 600,
          }}>
            {period.icon} {period.name}
          </div>
        </div>
      </div>

      {/* Focus bars - compact visualization */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {focusAreas.map((area) => {
            const value = month.focus[area.key];
            const pLabel = priorityLabels[value];
            return (
              <div key={area.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '70px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                }}>
                  {area.icon}
                  <span style={{ fontSize: '10px' }}>{area.label}</span>
                </div>
                <div style={{
                  flex: 1,
                  height: '6px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(value / 3) * 100}%`,
                    height: '100%',
                    backgroundColor: pLabel?.color || 'var(--border-default)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{
                  width: '14px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: pLabel?.color || 'var(--text-tertiary)',
                  textAlign: 'right',
                }}>
                  {value}
                </div>
              </div>
            );
          })}
        </div>

        {/* AK Parameters - compact row */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            flex: 1,
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '6px',
            padding: '6px 8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>L-Phase</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{month.learningPhase}</div>
          </div>
          <div style={{
            flex: 1,
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '6px',
            padding: '6px 8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>CS</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{month.clubSpeed}</div>
          </div>
          <div style={{
            flex: 1,
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '6px',
            padding: '6px 8px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Setting</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{month.setting}</div>
          </div>
        </div>

        {/* Benchmark indicator */}
        {month.benchmark && month.benchmark.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '10px',
            padding: '6px 10px',
            backgroundColor: 'var(--achievement)15',
            borderRadius: '6px',
          }}>
            <span style={{ fontSize: '12px' }}>B</span>
            <span style={{ fontSize: '11px', color: 'var(--achievement)', fontWeight: 500 }}>
              Benchmark: Week {month.benchmark.join(', ')}
            </span>
          </div>
        )}

        {/* Tournaments */}
        {month.tournaments && month.tournaments.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '8px',
            padding: '6px 10px',
            backgroundColor: 'var(--accent)10',
            borderRadius: '6px',
          }}>
            <span style={{ fontSize: '12px' }}>T</span>
            <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 500 }}>
              {month.tournaments.join(' · ')}
            </span>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && month.activities && (
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Activities
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {month.activities.map((activity, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                }}
              >
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: period.color }} />
                {activity}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== UI COMPONENTS =====
const Card = ({ children, className = '', padding = true }) => (
  <div className={`bg-white border border-tier-surface-base rounded-xl ${padding ? 'p-4' : ''} ${className}`}
       style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
    {children}
  </div>
);

const Badge = ({ children, color, bg }) => (
  <span
    className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-medium"
    style={{ backgroundColor: bg, color: color }}
  >
    {children}
  </span>
);

const Avatar = ({ name, size = 40 }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AK';
  return (
    <div
      className="rounded-full flex items-center justify-center font-medium text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: 'var(--accent)',
        fontSize: size * 0.4
      }}
    >
      {initials}
    </div>
  );
};

// ===== PRIORITY BAR COMPONENT =====
const PriorityBar = ({ value, maxValue = 3, color }) => (
  <div className="flex gap-0.5">
    {[...Array(maxValue)].map((_, i) => (
      <div
        key={i}
        className="h-2.5 w-2.5 rounded-sm transition-all duration-300"
        style={{
          backgroundColor: i < value ? color : 'var(--border-default)'
        }}
      />
    ))}
  </div>
);

// ===== MAIN ÅRSPLAN COMPONENT =====
/**
 * @param {object} player - Player profile data
 * @param {object} annualPlan - Annual plan data
 * @param {function} onRefresh - Callback to refresh data
 * @param {string} initialView - Initial view mode: 'overview' | 'periods' | 'focus' | 'timeline' | 'grid'
 */
const TIERGolfAarsplan = ({ player: apiPlayer = null, annualPlan: apiAnnualPlan = null, plans = [], onRefresh, initialView = 'overview' }) => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  // Map initialView to internal view state
  const mapInitialView = (view) => {
    switch (view) {
      case 'periods': return 'timeline'; // Periods view shows timeline with period focus
      case 'focus': return 'grid';       // Focus view shows grid with focus areas
      case 'overview':
      default: return 'timeline';
    }
  };
  const [selectedView, setSelectedView] = useState(mapInitialView(initialView)); // 'timeline' | 'grid'
  const [pageMode, setPageMode] = useState(initialView); // 'overview' | 'periods' | 'focus'

  // Default player profile (fallback if no API data)
  const defaultPlayer = {
    name: 'Ola Nordmann',
    category: 'B',
    avgScore: '74.2',
    targetScore: 72,
    club: 'Gamle Fredrikstad GK',
  };

  // Use API data if available, otherwise use default
  const player = apiPlayer || defaultPlayer;

  // Period definitions (Blue Palette 01)
  const periodConfig = {
    E: { name: 'Evaluation', color: 'var(--text-secondary)', bg: 'var(--bg-tertiary)', icon: 'E' },
    G: { name: 'Foundation', color: 'rgba(var(--accent-rgb), 0.8)', bg: `${'var(--status-success)'}20`, icon: 'G' },
    S: { name: 'Specialization', color: 'var(--status-success)', bg: `${'var(--status-success)'}15`, icon: 'S' },
    T: { name: 'Tournament', color: 'var(--achievement)', bg: `${'var(--achievement)'}15`, icon: 'T' },
  };

  // Priority labels (Blue Palette 01)
  const priorityLabels = {
    3: { label: 'Develop', color: 'var(--status-success)' },
    2: { label: 'Maintain', color: 'var(--status-warning)' },
    1: { label: 'Sustain', color: 'var(--text-secondary)' },
    0: { label: 'Rest', color: 'var(--border-default)' },
  };

  // Default annual plan data (Week 43 - Week 42) - fallback if no API data
  const defaultYearPlan = [
    {
      month: 'October',
      weeks: [43, 44],
      period: 'E',
      focus: { konkurranse: 0, spill: 1, golfslag: 2, teknikk: 3, fysisk: 2 },
      activities: ['Sesongevaluering', 'Fysiske tester', 'TrackMan-analyse', 'IUP-planlegging'],
      learningPhase: 'L3-L4',
      clubSpeed: 'CS60-80',
      setting: 'S2-S4',
      tournaments: [],
      benchmark: [44],
    },
    {
      month: 'November',
      weeks: [45, 46, 47, 48],
      period: 'G',
      focus: { konkurranse: 0, spill: 1, golfslag: 2, teknikk: 3, fysisk: 3 },
      activities: ['Teknikk-bygging', 'Styrketrening', 'Simulator-trening', 'Indre dialog'],
      learningPhase: 'L1-L3',
      clubSpeed: 'CS40-70',
      setting: 'S1-S3',
      tournaments: [],
      benchmark: [47],
    },
    {
      month: 'December',
      weeks: [49, 50, 51, 52],
      period: 'G',
      focus: { konkurranse: 0, spill: 1, golfslag: 2, teknikk: 3, fysisk: 3 },
      activities: ['Teknikk-fokus', 'Fysisk base', 'Mental trening', 'Vintersamling utland'],
      learningPhase: 'L1-L3',
      clubSpeed: 'CS50-80',
      setting: 'S1-S4',
      tournaments: [],
      benchmark: [50],
    },
    {
      month: 'January',
      weeks: [1, 2, 3, 4],
      period: 'G',
      focus: { konkurranse: 0, spill: 1, golfslag: 3, teknikk: 3, fysisk: 3 },
      activities: ['Teknikk-integrasjon', 'Styrke-utholdenhet', 'Putting-drill', 'Visualisering'],
      learningPhase: 'L2-L4',
      clubSpeed: 'CS60-90',
      setting: 'S2-S5',
      tournaments: [],
      benchmark: [3],
    },
    {
      month: 'February',
      weeks: [5, 6, 7, 8],
      period: 'S',
      focus: { konkurranse: 1, spill: 2, golfslag: 3, teknikk: 2, fysisk: 2 },
      activities: ['Spesifikk trening', 'Scoringsmål', 'Treningssamling', 'Spenningsregulering'],
      learningPhase: 'L3-L5',
      clubSpeed: 'CS70-100',
      setting: 'S4-S7',
      tournaments: ['Treningssamling Spania'],
      benchmark: [6],
    },
    {
      month: 'March',
      weeks: [9, 10, 11, 12, 13],
      period: 'S',
      focus: { konkurranse: 1, spill: 3, golfslag: 3, teknikk: 2, fysisk: 2 },
      activities: ['Konkurranseforberedelse', 'Banespill utland', 'Strategitrening', 'Rutinebygging'],
      learningPhase: 'L4-L5',
      clubSpeed: 'CS80-100',
      setting: 'S5-S8',
      tournaments: ['Treningssamling Portugal'],
      benchmark: [9, 12],
    },
    {
      month: 'April',
      weeks: [14, 15, 16, 17],
      period: 'S',
      focus: { konkurranse: 2, spill: 3, golfslag: 2, teknikk: 2, fysisk: 1 },
      activities: ['Sesongoppstart', 'Første turneringer', 'Banestrategi', 'Fokus-trening'],
      learningPhase: 'L4-L5',
      clubSpeed: 'CS90-100',
      setting: 'S6-S9',
      tournaments: ['Olyo Tour 1', 'Klubbmesterskap'],
      benchmark: [15],
    },
    {
      month: 'May',
      weeks: [18, 19, 20, 21, 22],
      period: 'T',
      focus: { konkurranse: 3, spill: 3, golfslag: 2, teknikk: 1, fysisk: 1 },
      activities: ['Olyo Tour', 'Klubbmesterskap', 'Vedlikeholdstrening', 'Resultatfokus'],
      learningPhase: 'L5',
      clubSpeed: 'CS100',
      setting: 'S8-S10',
      tournaments: ['Olyo Tour 2', 'Olyo Tour 3'],
      benchmark: [18, 21],
    },
    {
      month: 'June',
      weeks: [23, 24, 25, 26],
      period: 'T',
      focus: { konkurranse: 3, spill: 3, golfslag: 2, teknikk: 1, fysisk: 1 },
      activities: ['Hovedturneringer', 'Regionsmesterskap', 'Kortspill-vedlikehold', 'Mental styrke'],
      learningPhase: 'L5',
      clubSpeed: 'CS100',
      setting: 'S9-S10',
      tournaments: ['Regionsmesterskap', 'Junior Tour'],
      benchmark: [24],
    },
    {
      month: 'July',
      weeks: [27, 28, 29, 30, 31],
      period: 'T',
      focus: { konkurranse: 3, spill: 3, golfslag: 2, teknikk: 1, fysisk: 1 },
      activities: ['NM', 'Skandinavisk turnering', 'Toppform', 'Prestasjonsfokus'],
      learningPhase: 'L5',
      clubSpeed: 'CS100',
      setting: 'S10',
      tournaments: ['NM Junior', 'Skandinavisk Mesterskap', 'Olyo Tour Finale'],
      benchmark: [27, 30],
    },
    {
      month: 'August',
      weeks: [32, 33, 34, 35],
      period: 'T',
      focus: { konkurranse: 3, spill: 3, golfslag: 2, teknikk: 1, fysisk: 1 },
      activities: ['Avsluttende turneringer', 'Junior Tour finale', 'Sesongavslutning', 'Evaluering'],
      learningPhase: 'L5',
      clubSpeed: 'CS100',
      setting: 'S9-S10',
      tournaments: ['Junior Tour Finale'],
      benchmark: [33],
    },
    {
      month: 'September',
      weeks: [36, 37, 38, 39],
      period: 'E',
      focus: { konkurranse: 1, spill: 2, golfslag: 2, teknikk: 2, fysisk: 2 },
      activities: ['Sesongevaluering', 'Avsluttende turneringer', 'Restitusjon', 'Planlegging neste år'],
      learningPhase: 'L4-L5',
      clubSpeed: 'CS80-100',
      setting: 'S5-S8',
      tournaments: [],
      benchmark: [36, 39],
    },
  ];

  // Use API data if available, otherwise use default
  const yearPlan = apiAnnualPlan || defaultYearPlan;

  // Focus areas config
  const focusAreas = [
    { key: 'konkurranse', label: 'Competition', icon: <Icons.Trophy /> },
    { key: 'spill', label: 'Play', icon: <Icons.GolfFlag /> },
    { key: 'golfslag', label: 'Golf Shots', icon: <Icons.Crosshair /> },
    { key: 'teknikk', label: 'Technique', icon: <Icons.Settings /> },
    { key: 'fysisk', label: 'Physical', icon: <Icons.Dumbbell /> },
  ];

  // Current month calculation (simulated)
  const currentMonthIndex = 2; // December

  return (
    <div id="aarsplan-export" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
      {/* Header */}
      <PageHeader
        title="Annual Plan 2026"
        subtitle="Team Norway"
        helpText="Your 12-month training plan with periodization, focus areas and milestones. View monthly training, tournaments and camps throughout the season."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ExportButton
              targetId="aarsplan-export"
              filename={`aarsplan-${player.name?.replace(/\s+/g, '-') || 'spiller'}-2026`}
              title={`Annual Plan 2026 - ${player.name || 'Player'}`}
              variant="icon"
              size="sm"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', padding: '4px' }}>
              <button
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedView === 'timeline' ? 'var(--bg-primary)' : 'transparent',
                color: selectedView === 'timeline' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: selectedView === 'timeline' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              }}
              onClick={() => setSelectedView('timeline')}
            >
              Timeline
            </button>
            <button
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedView === 'grid' ? 'var(--bg-primary)' : 'transparent',
                color: selectedView === 'grid' ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: selectedView === 'grid' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              }}
              onClick={() => setSelectedView('grid')}
            >
              Grid
            </button>
            </div>
          </div>
        }
      />

      <div style={{ padding: '24px', width: '100%' }}>
        {/* Player Summary Card */}
        <Card className="mb-6 border-0" style={{ background: 'linear-gradient(135deg, rgb(var(--tier-navy)) 0%, rgb(var(--tier-navy-dark)) 100%)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={player.name} size={56} />
              <div>
                <SectionTitle className="text-[20px] font-bold" style={{ color: 'rgb(var(--tier-white))' }}>{player.name}</SectionTitle>
                <p className="text-[13px]" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{player.club}</p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-wide" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Category</p>
                <p className="text-[24px] font-bold" style={{ color: 'rgb(var(--tier-white))' }}>{player.category}</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-wide" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Average</p>
                <p className="text-[24px] font-bold" style={{ color: 'rgb(var(--tier-white))' }}>{player.avgScore}</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-wide" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Target Score</p>
                <p className="text-[24px] font-bold text-tier-gold">{player.targetScore}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* NEW: Gantt Timeline */}
        <GanttTimeline
          yearPlan={yearPlan}
          periodConfig={periodConfig}
          currentMonthIndex={currentMonthIndex}
        />

        {/* NEW: Swimlane Focus Matrix */}
        <SwimlaneFocusMatrix
          yearPlan={yearPlan}
          focusAreas={focusAreas}
          priorityLabels={priorityLabels}
        />

        {/* Period Legend - more compact */}
        <div className="mb-6 flex flex-wrap items-center gap-4 p-3 bg-white rounded-xl border border-tier-surface-base">
          <span className="text-[11px] text-tier-text-secondary font-medium uppercase tracking-wide">Periods:</span>
          {Object.entries(periodConfig).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val.color }} />
              <span className="text-[12px] text-tier-navy">{val.name}</span>
            </div>
          ))}
          <div className="h-3 w-px bg-tier-surface-base" />
          <span className="text-[11px] text-tier-text-secondary font-medium uppercase tracking-wide">Priority:</span>
          {[3, 2, 1].map(p => (
            <div key={p} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: priorityLabels[p].color }} />
              <span className="text-[12px] text-tier-navy">{priorityLabels[p].label}</span>
            </div>
          ))}
        </div>

        {/* Timeline/Grid View */}
        {selectedView === 'timeline' ? (
          // Timeline View
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[120px] top-0 bottom-0 w-0.5 bg-tier-surface-base" />

            <div className="space-y-4">
              {yearPlan.map((month, idx) => {
                const period = periodConfig[month.period];
                const isCurrentMonth = idx === currentMonthIndex;
                const isExpanded = selectedMonth === idx;

                return (
                  <div key={month.month} className="relative">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-[112px] w-4 h-4 rounded-full border-4 border-white z-10 ${
                        isCurrentMonth ? 'ring-4 ring-tier-navy/20' : ''
                      }`}
                      style={{ backgroundColor: period.color, top: '24px' }}
                    />

                    <div className="flex gap-4">
                      {/* Month Label */}
                      <div className="w-[100px] text-right pt-4">
                        <p className={`text-[15px] font-semibold ${isCurrentMonth ? 'text-tier-navy' : 'text-tier-navy'}`}>
                          {month.month}
                        </p>
                        <p className="text-[11px] text-tier-text-secondary">Week {month.weeks[0]}-{month.weeks[month.weeks.length - 1]}</p>
                      </div>

                      {/* Content Card */}
                      <Card
                        className={`flex-1 ml-8 cursor-pointer transition-all ${
                          isCurrentMonth ? 'ring-2 ring-tier-navy/20' : ''
                        } ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}`}
                        onClick={() => setSelectedMonth(isExpanded ? null : idx)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge color={period.color} bg={period.bg}>
                              {period.icon} {period.name}
                            </Badge>
                            {month.benchmark.length > 0 && (
                              <Badge color={'var(--achievement)'} bg={`${'var(--achievement)'}15`}>
                                Benchmark: Week {month.benchmark.join(', ')}
                              </Badge>
                            )}
                          </div>
                          <Icons.ChevronDown />
                        </div>

                        {/* Focus Areas */}
                        <div className="grid grid-cols-5 gap-4 mb-4">
                          {focusAreas.map(area => (
                            <div key={area.key} className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-tier-text-secondary">{area.icon}</span>
                                <span className="text-[12px] text-tier-navy font-medium">{area.label}</span>
                              </div>
                              <PriorityBar value={month.focus[area.key]} color={priorityLabels[month.focus[area.key]]?.color || 'var(--border-default)'} />
                            </div>
                          ))}
                        </div>

                        {/* AK Parameters */}
                        <div className="flex gap-4 mb-3">
                          <div className="bg-tier-white rounded-lg px-3 py-2 text-center">
                            <p className="text-[10px] text-tier-text-secondary uppercase">Learning Phase</p>
                            <p className="text-[13px] font-semibold text-tier-navy">{month.learningPhase}</p>
                          </div>
                          <div className="bg-tier-white rounded-lg px-3 py-2 text-center">
                            <p className="text-[10px] text-tier-text-secondary uppercase">Clubspeed</p>
                            <p className="text-[13px] font-semibold text-tier-navy">{month.clubSpeed}</p>
                          </div>
                          <div className="bg-tier-white rounded-lg px-3 py-2 text-center">
                            <p className="text-[10px] text-tier-text-secondary uppercase">Setting</p>
                            <p className="text-[13px] font-semibold text-tier-navy">{month.setting}</p>
                          </div>
                        </div>

                        {/* Tournaments */}
                        {month.tournaments.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <Icons.Flag />
                            <span className="text-[12px] text-tier-navy">
                              {month.tournaments.join(' · ')}
                            </span>
                          </div>
                        )}

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-tier-surface-base">
                            <CardTitle className="text-[12px] text-tier-text-secondary uppercase tracking-wide mb-2">Activities</CardTitle>
                            <div className="grid grid-cols-2 gap-2">
                              {month.activities.map((activity, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: period.color }} />
                                  <span className="text-[13px] text-tier-navy">{activity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Grid View - using improved month cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {yearPlan.map((month, idx) => {
              const isCurrentMonth = idx === currentMonthIndex;

              return (
                <ImprovedMonthCard
                  key={month.month}
                  month={month}
                  periodConfig={periodConfig}
                  priorityLabels={priorityLabels}
                  focusAreas={focusAreas}
                  isCurrentMonth={isCurrentMonth}
                  isExpanded={selectedMonth === idx}
                  onToggle={() => setSelectedMonth(selectedMonth === idx ? null : idx)}
                />
              );
            })}
          </div>
        )}

        {/* Five Process Summary */}
        <Card className="mt-8">
          <SectionTitle className="text-[18px] font-bold text-tier-navy mb-6 text-center">Five-Process Annual Overview</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { name: 'Technical', icon: 'TEK', color: 'var(--accent)', desc: 'Swing, shots, technique' },
              { name: 'Physical', icon: 'FYS', color: 'var(--status-success)', desc: 'Strength, endurance, mobility' },
              { name: 'Mental', icon: 'MEN', color: 'rgba(var(--accent-rgb), 0.8)', desc: 'Focus, visualization, routines' },
              { name: 'Strategic', icon: 'STR', color: 'var(--achievement)', desc: 'Course strategy, decisions' },
              { name: 'Social', icon: 'SOS', color: 'var(--status-warning)', desc: 'Team, communication, network' },
            ].map(process => (
              <div
                key={process.name}
                className="bg-tier-white rounded-xl p-4 text-center border border-tier-surface-base"
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${process.color}15` }}
                >
                  {process.icon}
                </div>
                <SubSectionTitle className="font-semibold text-tier-navy">{process.name}</SubSectionTitle>
                <p className="text-[11px] text-tier-text-secondary mt-1">{process.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center py-6">
        <p className="text-[12px] text-tier-text-secondary">
          Team Norway Golf — Individual Development Plan
        </p>
      </footer>
    </div>
  );
};

export default TIERGolfAarsplan;
