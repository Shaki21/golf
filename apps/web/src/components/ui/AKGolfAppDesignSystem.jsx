import React, { useState, useEffect } from 'react';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../typography';

// ============================================================================
// TIER Golf - LEGACY DESIGN SYSTEM ARCHIVE
// Version: 1.0 | December 2025
// NOTE: This file showcases the OLD AK Golf design system (Navy/Gold theme)
// For current TIER Golf Design System v3.0, see tier-tokens.css
// This file is for historical reference only and is not actively used.
// ============================================================================

// ============================================================================
// DESIGN TOKENS & THEME SYSTEM
// ============================================================================

const designSystem = {
  // Color Palette - Premium Golf Aesthetic
  colors: {
    // Primary brand colors
    primary: {
      900: '#0a1628',    // Deepest navy
      800: '#0d1b2a',    // Dark navy
      700: '#1a2f5a',    // Primary navy (main brand)
      600: '#244a87',    // Medium navy
      500: '#2d5fa8',    // Lighter navy
      400: '#4a7bc4',    // Light navy
      300: '#7a9ed4',    // Pale navy
      200: '#b3c7e6',    // Very light
      100: '#e6ecf5',    // Near white
    },
    // Accent - Performance Gold
    accent: {
      500: '#f4c542',    // Primary gold
      400: '#f7d36b',    // Light gold
      300: '#fae194',    // Pale gold
      600: '#d4a82e',    // Dark gold
    },
    // Success/Growth - Course Green
    success: {
      500: '#2d8a4e',    // Primary green
      400: '#3da564',    // Light green
      300: '#6bc88a',    // Pale green
      600: '#1f6b38',    // Dark green
    },
    // Warning - Attention Orange
    warning: {
      500: '#e67e22',
      400: '#f39c12',
      300: '#f5b041',
    },
    // Danger - Team Norway Red
    danger: {
      500: '#c41e3a',    // Primary red
      400: '#d94961',    // Light red
      300: '#e87a8f',    // Pale red
      600: '#a3182f',    // Dark red
    },
    // Neutral - Refined grays
    neutral: {
      950: '#09090b',
      900: '#18181b',
      800: '#27272a',
      700: '#3f3f46',
      600: '#52525b',
      500: '#71717a',
      400: '#a1a1aa',
      300: '#d4d4d8',
      200: '#e4e4e7',
      100: '#f4f4f5',
      50: '#fafafa',
    },
    // Semantic - Period colors
    periods: {
      evaluering: '#6b7280',
      grunnlag: '#3b82f6',
      spesialisering: '#8b5cf6',
      turnering: '#ef4444',
    },
    // Session type colors
    sessions: {
      teknikk: '#8b5cf6',
      golfslag: '#3b82f6',
      spill: '#10b981',
      konkurranse: '#ef4444',
      fysisk: '#f59e0b',
      mental: '#06b6d4',
    }
  },
  
  // Typography - Premium sport aesthetic
  typography: {
    fontFamily: {
      display: "'DM Sans', 'Inter', system-ui, sans-serif",
      body: "'Inter', 'DM Sans', system-ui, sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', monospace",
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.1,
      snug: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    }
  },
  
  // Spacing system (4px base)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
  },
  
  // Border radius
  radius: {
    sm: '0.25rem',
    base: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(244, 197, 66, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease',
    base: '200ms ease',
    slow: '300ms ease',
    spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  }
};

// ============================================================================
// REUSABLE UI COMPONENTS
// ============================================================================

// Icon components (using simple SVG paths)
const Icons = {
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12,6 12,12 16,14"/>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Target: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
      <polyline points="17,6 23,6 23,12"/>
    </svg>
  ),
  Activity: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Play: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21"/>
    </svg>
  ),
  Moon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  Heart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Zap: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
    </svg>
  ),
  Flag: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Home: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
};

// ============================================================================
// MAIN APP COMPONENT - PROTOTYPE SHOWCASE
// ============================================================================

const TIERGolfAppDesignSystem = () => {
  const [activeView, setActiveView] = useState('mobile-player');
  const [darkMode, setDarkMode] = useState(true);
  
  const theme = darkMode ? 'dark' : 'light';
  const colors = designSystem.colors;
  
  // Theme-aware colors
  const bg = darkMode ? colors.neutral[950] : colors.neutral[50];
  const bgCard = darkMode ? colors.neutral[900] : 'white';
  const bgElevated = darkMode ? colors.neutral[800] : colors.neutral[100];
  const text = darkMode ? colors.neutral[100] : colors.neutral[900];
  const textMuted = darkMode ? colors.neutral[400] : colors.neutral[500];
  const border = darkMode ? colors.neutral[800] : colors.neutral[200];

  // ============================================================================
  // MOBILE PLAYER APP
  // ============================================================================
  
  const MobilePlayerApp = () => {
    const [activeTab, setActiveTab] = useState('today');
    const [showSessionDetail, setShowSessionDetail] = useState(false);
    
    // Sample data
    const todaySessions = [
      { id: 1, time: '08:00', name: 'WANG Morgentrim', type: 'fysisk', duration: 30, status: 'completed', phase: 'L1', cs: 'CS0' },
      { id: 2, time: '10:00', name: 'Teknisk økt - Driver', type: 'teknikk', duration: 90, status: 'active', phase: 'L3', cs: 'CS60' },
      { id: 3, time: '14:00', name: 'Putting Lab', type: 'golfslag', duration: 60, status: 'upcoming', phase: 'L4', cs: 'CS40' },
    ];
    
    const weekStats = { completed: 8, total: 12, hours: '14.5', streak: 5 };

    return (
      <div style={{
        width: '375px',
        height: '812px',
        background: bg,
        borderRadius: '40px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        fontFamily: designSystem.typography.fontFamily.body,
      }}>
        {/* Phone notch */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '30px',
          background: darkMode ? '#000' : colors.neutral[900],
          borderRadius: '0 0 20px 20px',
          zIndex: 100,
        }} />
        
        {/* Status bar */}
        <div style={{
          padding: '44px 24px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          fontWeight: 600,
          color: text,
        }}>
          <span>9:41</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ width: '18px', height: '10px', border: `2px solid ${text}`, borderRadius: '3px', position: 'relative' }}>
              <div style={{ position: 'absolute', right: '-4px', top: '2px', width: '2px', height: '6px', background: text, borderRadius: '1px' }} />
              <div style={{ width: '70%', height: '100%', background: colors.success[500], borderRadius: '1px' }} />
            </div>
          </div>
        </div>

        {/* Header */}
        <div style={{ padding: '0 24px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: textMuted, fontSize: '14px', margin: 0 }}>Good morning</p>
              <PageTitle style={{ color: text, fontSize: '28px', fontWeight: 700, margin: '4px 0' }}>Jakob</PageTitle>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '22px',
              background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 0 3px ${colors.accent[500]}`,
            }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>JH</span>
            </div>
          </div>
          
          {/* Week progress card */}
          <div style={{
            marginTop: '20px',
            background: `linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.primary[800]} 100%)`,
            borderRadius: '20px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Decorative element */}
            <div style={{
              position: 'absolute',
              right: '-20px',
              top: '-20px',
              width: '100px',
              height: '100px',
              background: colors.accent[500],
              opacity: 0.1,
              borderRadius: '50%',
            }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Uke 50 • Grunnperiode</span>
              <span style={{
                background: colors.periods.grunnlag,
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
              }}>G</span>
            </div>
            
            {/* Progress bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                height: '8px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${(weekStats.completed / weekStats.total) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${colors.accent[500]}, ${colors.accent[400]})`,
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>Fullført</p>
                <p style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: '2px 0' }}>{weekStats.completed}/{weekStats.total}</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>Timer</p>
                <p style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: '2px 0' }}>{weekStats.hours}t</p>
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>Streak</p>
                <p style={{ color: colors.accent[500], fontSize: '20px', fontWeight: 700, margin: '2px 0' }}>{weekStats.streak} streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's sessions */}
        <div style={{ padding: '0 24px', flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <SectionTitle style={{ color: text, fontSize: '18px', fontWeight: 600, margin: 0 }}>I dag</SectionTitle>
            <span style={{ color: textMuted, fontSize: '14px' }}>Torsdag 12. des</span>
          </div>

          {todaySessions.map((session, idx) => (
            <div
              key={session.id}
              onClick={() => setShowSessionDetail(true)}
              style={{
                background: bgCard,
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '12px',
                border: session.status === 'active' ? `2px solid ${colors.accent[500]}` : `1px solid ${border}`,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: colors.sessions[session.type],
                    }} />
                    <span style={{ color: textMuted, fontSize: '13px' }}>{session.time}</span>
                    <span style={{
                      background: bgElevated,
                      color: textMuted,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontFamily: designSystem.typography.fontFamily.mono,
                    }}>{session.phase}</span>
                  </div>
                  <SubSectionTitle style={{ color: text, fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>{session.name}</SubSectionTitle>
                  <p style={{ color: textMuted, fontSize: '13px', margin: 0 }}>{session.duration} min • {session.cs}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  {session.status === 'completed' && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: colors.success[500],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Icons.Check />
                    </div>
                  )}
                  {session.status === 'active' && (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${colors.accent[500]}, ${colors.accent[400]})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: designSystem.shadows.glow,
                    }}>
                      <Icons.Play />
                    </div>
                  )}
                  {session.status === 'upcoming' && (
                    <div style={{ color: textMuted }}>
                      <Icons.ChevronRight />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Quick actions */}
          <div style={{ marginTop: '24px', marginBottom: '100px' }}>
            <SubSectionTitle style={{ color: text, fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Hurtigvalg</SubSectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { icon: <Icons.Moon />, label: 'Søvn', color: colors.primary[600] },
                { icon: <Icons.Heart />, label: 'Humør', color: colors.danger[500] },
                { icon: <Icons.Zap />, label: 'Energi', color: colors.accent[500] },
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: bgCard,
                  borderRadius: '16px',
                  padding: '16px',
                  textAlign: 'center',
                  border: `1px solid ${border}`,
                  cursor: 'pointer',
                }}>
                  <div style={{ color: item.color, marginBottom: '8px' }}>{item.icon}</div>
                  <p style={{ color: text, fontSize: '13px', margin: 0 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: bgCard,
          borderTop: `1px solid ${border}`,
          padding: '12px 24px 34px',
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          {[
            { icon: <Icons.Home />, label: 'Hjem', active: true },
            { icon: <Icons.Calendar />, label: 'Plan', active: false },
            { icon: <Icons.Target />, label: 'Mål', active: false },
            { icon: <Icons.TrendingUp />, label: 'Statistikk', active: false },
            { icon: <Icons.User />, label: 'Profil', active: false },
          ].map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: item.active ? colors.accent[500] : textMuted,
              cursor: 'pointer',
            }}>
              {item.icon}
              <span style={{ fontSize: '11px' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================================
  // WEB PLAYER APP - CALENDAR VIEW
  // ============================================================================

  const WebPlayerCalendar = () => {
    const [selectedDate, setSelectedDate] = useState(12);
    const [selectedSession, setSelectedSession] = useState(null);
    
    const weekDays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
    const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
    
    // Sample sessions for calendar
    const sessions = {
      9: [{ time: '08:00', name: 'WANG Trening', type: 'teknikk', duration: 120 }],
      10: [{ time: '16:00', name: 'Putting økt', type: 'golfslag', duration: 60 }],
      11: [{ time: '08:00', name: 'WANG Trening', type: 'teknikk', duration: 120 }, { time: '15:00', name: 'Fysisk trening', type: 'fysisk', duration: 45 }],
      12: [
        { time: '08:00', name: 'WANG Morgentrim', type: 'fysisk', duration: 30, phase: 'L1', cs: 'CS0' },
        { time: '10:00', name: 'Teknisk økt - Driver', type: 'teknikk', duration: 90, phase: 'L3', cs: 'CS60' },
        { time: '14:00', name: 'Putting Lab', type: 'golfslag', duration: 60, phase: 'L4', cs: 'CS40' },
      ],
      13: [{ time: '08:00', name: 'WANG Trening', type: 'teknikk', duration: 120 }],
      14: [{ time: '10:00', name: 'Spill 9 hull', type: 'spill', duration: 180 }],
      15: [{ time: '10:00', name: 'Benchmark test', type: 'test', duration: 120 }],
    };

    return (
      <div style={{
        background: bg,
        minHeight: '100vh',
        fontFamily: designSystem.typography.fontFamily.body,
      }}>
        {/* Top navigation */}
        <header style={{
          background: bgCard,
          borderBottom: `1px solid ${border}`,
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.accent[500]})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icons.Flag />
              </div>
              <div>
                <p style={{ color: textMuted, fontSize: '12px', margin: 0 }}>Individuell Utviklingsplan</p>
              </div>
            </div>
            
            <nav style={{ display: 'flex', gap: '8px', marginLeft: '32px' }}>
              {['Kalender', 'Årsplan', 'Mål', 'Statistikk', 'Tester'].map((item, idx) => (
                <button key={idx} style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: idx === 0 ? colors.primary[700] : 'transparent',
                  color: idx === 0 ? 'white' : textMuted,
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                  {item}
                </button>
              ))}
            </nav>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: colors.accent[500],
              color: colors.primary[900],
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Icons.Plus /> Ny økt
            </button>
            <div style={{ position: 'relative', color: textMuted, cursor: 'pointer' }}>
              <Icons.Bell />
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: colors.danger[500],
              }} />
            </div>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>JH</span>
            </div>
          </div>
        </header>

        <div style={{ display: 'flex', height: 'calc(100vh - 73px)' }}>
          {/* Left sidebar - Mini calendar */}
          <aside style={{
            width: '300px',
            background: bgCard,
            borderRight: `1px solid ${border}`,
            padding: '24px',
            overflowY: 'auto',
          }}>
            {/* Period indicator */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.periods.grunnlag}20, ${colors.periods.grunnlag}10)`,
              border: `1px solid ${colors.periods.grunnlag}40`,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{
                  background: colors.periods.grunnlag,
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>GRUNNPERIODE</span>
                <span style={{ color: textMuted, fontSize: '12px' }}>Uke 50</span>
              </div>
              <p style={{ color: text, fontSize: '13px', margin: 0 }}>Fokus: Teknikk og fysisk utvikling</p>
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: textMuted, fontSize: '12px' }}>Ukeprogressjon</span>
                  <span style={{ color: text, fontSize: '12px', fontWeight: 600 }}>67%</span>
                </div>
                <div style={{
                  height: '6px',
                  background: bgElevated,
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: '67%',
                    height: '100%',
                    background: colors.periods.grunnlag,
                    borderRadius: '3px',
                  }} />
                </div>
              </div>
            </div>

            {/* Mini calendar */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <SubSectionTitle style={{ color: text, fontSize: '16px', fontWeight: 600, margin: 0 }}>Desember 2025</SubSectionTitle>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer' }}>←</button>
                  <button style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer' }}>→</button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {weekDays.map(day => (
                  <div key={day} style={{ color: textMuted, fontSize: '11px', textAlign: 'center', padding: '4px' }}>{day}</div>
                ))}
                {/* Empty cells for days before month starts (December 2025 starts on Monday) */}
                {calendarDays.slice(0, 31).map(day => {
                  const hasSessions = sessions[day];
                  const isSelected = day === selectedDate;
                  const isToday = day === 12;
                  
                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isSelected ? colors.primary[700] : isToday ? colors.accent[500] + '20' : 'transparent',
                        border: isToday && !isSelected ? `2px solid ${colors.accent[500]}` : 'none',
                        color: isSelected ? 'white' : text,
                        fontSize: '13px',
                        fontWeight: isToday || isSelected ? 600 : 400,
                        position: 'relative',
                      }}
                    >
                      {day}
                      {hasSessions && (
                        <div style={{
                          display: 'flex',
                          gap: '2px',
                          position: 'absolute',
                          bottom: '4px',
                        }}>
                          {hasSessions.slice(0, 3).map((_, idx) => (
                            <div key={idx} style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              background: isSelected ? 'white' : colors.accent[500],
                            }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div style={{ marginBottom: '24px' }}>
              <CardTitle style={{ color: textMuted, fontSize: '12px', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Okttyper</CardTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries({
                  'teknikk': 'Teknikk',
                  'golfslag': 'Golfslag',
                  'spill': 'Spill',
                  'fysisk': 'Fysisk',
                  'mental': 'Mental',
                }).map(([key, label]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: colors.sessions[key] }} />
                    <span style={{ color: textMuted, fontSize: '13px' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main calendar view */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Week header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px repeat(7, 1fr)',
              borderBottom: `1px solid ${border}`,
              background: bgCard,
            }}>
              <div />
              {weekDays.map((day, idx) => (
                <div key={day} style={{
                  padding: '16px',
                  textAlign: 'center',
                  borderLeft: `1px solid ${border}`,
                }}>
                  <p style={{ color: textMuted, fontSize: '12px', margin: '0 0 4px' }}>{day}</p>
                  <p style={{
                    color: idx === 3 ? colors.accent[500] : text,
                    fontSize: '20px',
                    fontWeight: 600,
                    margin: 0,
                  }}>{9 + idx}</p>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', minHeight: '800px' }}>
                {/* Time labels */}
                <div>
                  {Array.from({ length: 14 }, (_, i) => i + 7).map(hour => (
                    <div key={hour} style={{
                      height: '60px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      color: textMuted,
                      fontSize: '12px',
                      paddingTop: '4px',
                    }}>
                      {hour}:00
                    </div>
                  ))}
                </div>
                
                {/* Day columns */}
                {Array.from({ length: 7 }, (_, dayIdx) => {
                  const dayNum = 9 + dayIdx;
                  const daySessions = sessions[dayNum] || [];
                  
                  return (
                    <div key={dayIdx} style={{
                      borderLeft: `1px solid ${border}`,
                      position: 'relative',
                    }}>
                      {/* Hour lines */}
                      {Array.from({ length: 14 }, (_, i) => (
                        <div key={i} style={{
                          height: '60px',
                          borderBottom: `1px solid ${border}`,
                        }} />
                      ))}
                      
                      {/* Sessions */}
                      {daySessions.map((session, sIdx) => {
                        const [hours, mins] = session.time.split(':').map(Number);
                        const top = (hours - 7) * 60 + mins;
                        const height = session.duration;
                        
                        return (
                          <div
                            key={sIdx}
                            onClick={() => setSelectedSession(session)}
                            style={{
                              position: 'absolute',
                              top: `${top}px`,
                              left: '4px',
                              right: '4px',
                              height: `${height}px`,
                              background: `linear-gradient(135deg, ${colors.sessions[session.type]}90, ${colors.sessions[session.type]}70)`,
                              borderRadius: '8px',
                              padding: '8px',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              borderLeft: `4px solid ${colors.sessions[session.type]}`,
                              boxShadow: designSystem.shadows.sm,
                            }}
                          >
                            <p style={{ color: 'white', fontSize: '12px', fontWeight: 600, margin: 0 }}>{session.name}</p>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', margin: '4px 0 0' }}>{session.time} • {session.duration}min</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </main>

          {/* Right sidebar - Session details */}
          <aside style={{
            width: '320px',
            background: bgCard,
            borderLeft: `1px solid ${border}`,
            padding: '24px',
            overflowY: 'auto',
          }}>
            <SubSectionTitle style={{ color: text, fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              {selectedDate}. desember
            </SubSectionTitle>

            {sessions[selectedDate]?.map((session, idx) => (
              <div key={idx} style={{
                background: bgElevated,
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                borderLeft: `4px solid ${colors.sessions[session.type]}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <p style={{ color: textMuted, fontSize: '13px', margin: '0 0 4px' }}>{session.time}</p>
                    <CardTitle style={{ color: text, fontSize: '15px', fontWeight: 600, margin: 0 }}>{session.name}</CardTitle>
                  </div>
                  <span style={{
                    background: colors.sessions[session.type],
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>{session.type}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <p style={{ color: textMuted, fontSize: '11px', margin: '0 0 2px' }}>Varighet</p>
                    <p style={{ color: text, fontSize: '14px', fontWeight: 500, margin: 0 }}>{session.duration} min</p>
                  </div>
                  {session.phase && (
                    <div>
                      <p style={{ color: textMuted, fontSize: '11px', margin: '0 0 2px' }}>Fase</p>
                      <p style={{ color: text, fontSize: '14px', fontWeight: 500, margin: 0, fontFamily: designSystem.typography.fontFamily.mono }}>{session.phase}</p>
                    </div>
                  )}
                  {session.cs && (
                    <div>
                      <p style={{ color: textMuted, fontSize: '11px', margin: '0 0 2px' }}>CS</p>
                      <p style={{ color: text, fontSize: '14px', fontWeight: 500, margin: 0, fontFamily: designSystem.typography.fontFamily.mono }}>{session.cs}</p>
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: colors.primary[700],
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}>Rediger</button>
                  <button style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${border}`,
                    background: 'transparent',
                    color: textMuted,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}>⋮</button>
                </div>
              </div>
            ))}
            
            {/* Add session button */}
            <button style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: `2px dashed ${border}`,
              background: 'transparent',
              color: textMuted,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <Icons.Plus /> Legg til økt
            </button>
          </aside>
        </div>
      </div>
    );
  };

  // ============================================================================
  // COACH DASHBOARD
  // ============================================================================

  const CoachDashboard = () => {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    
    // Sample player data
    const players = [
      { id: 1, name: 'Jakob Holm', level: 'B', avgScore: 74, status: 'active', lastSession: '2t siden', weekProgress: 67, alerts: 2 },
      { id: 2, name: 'Emma Nilsen', level: 'C', avgScore: 76, status: 'active', lastSession: '4t siden', weekProgress: 83, alerts: 0 },
      { id: 3, name: 'Oliver Berg', level: 'D', avgScore: 78, status: 'rest', lastSession: '1d siden', weekProgress: 45, alerts: 1 },
      { id: 4, name: 'Maja Hansen', level: 'E', avgScore: 79, status: 'active', lastSession: '30m siden', weekProgress: 92, alerts: 0 },
      { id: 5, name: 'Lucas Andersen', level: 'C', avgScore: 75, status: 'active', lastSession: '5t siden', weekProgress: 58, alerts: 0 },
    ];
    
    const alerts = [
      { id: 1, type: 'warning', player: 'Jakob Holm', message: 'Lav søvn registrert (under 5 timer) 3 av 4 siste dager', time: '10 min siden' },
      { id: 2, type: 'info', player: 'Oliver Berg', message: 'Restdag - ingen planlagt aktivitet', time: '2t siden' },
      { id: 3, type: 'success', player: 'Maja Hansen', message: 'Fullførte benchmark test med forbedring på alle områder', time: '3t siden' },
    ];

    return (
      <div style={{
        background: bg,
        minHeight: '100vh',
        fontFamily: designSystem.typography.fontFamily.body,
      }}>
        {/* Top navigation */}
        <header style={{
          background: colors.primary[800],
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${colors.accent[500]}, ${colors.accent[400]})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icons.Flag />
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>Coach Dashboard</p>
              </div>
            </div>
            
            <nav style={{ display: 'flex', gap: '4px', marginLeft: '48px' }}>
              {[
                { icon: <Icons.Home />, label: 'Oversikt', active: true },
                { icon: <Icons.Users />, label: 'Spillere', active: false },
                { icon: <Icons.Calendar />, label: 'Kalender', active: false },
                { icon: <Icons.BarChart />, label: 'Statistikk', active: false },
                { icon: <Icons.Target />, label: 'Turneringer', active: false },
              ].map((item, idx) => (
                <button key={idx} style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: item.active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: item.active ? 'white' : 'rgba(255,255,255,0.6)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
              <Icons.Bell />
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: colors.danger[500],
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}>3</span>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: colors.accent[500],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <span style={{ color: colors.primary[900], fontWeight: 700, fontSize: '15px' }}>AK</span>
            </div>
          </div>
        </header>

        <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
            {[
              { label: 'Aktive spillere', value: '15', icon: <Icons.Users />, color: colors.primary[600], change: '+2 denne måneden' },
              { label: 'Økter i dag', value: '23', icon: <Icons.Activity />, color: colors.success[500], change: '5 pågår nå' },
              { label: 'Gjennomsnitt uke', value: '89%', icon: <Icons.TrendingUp />, color: colors.accent[500], change: '+4% fra forrige' },
              { label: 'Varsler', value: '3', icon: <Icons.AlertTriangle />, color: colors.danger[500], change: '1 krever handling' },
            ].map((stat, idx) => (
              <div key={idx} style={{
                background: bgCard,
                borderRadius: '16px',
                padding: '24px',
                border: `1px solid ${border}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <p style={{ color: textMuted, fontSize: '14px', margin: '0 0 4px' }}>{stat.label}</p>
                    <SectionTitle style={{ color: text, fontSize: '32px', fontWeight: 700, margin: 0 }}>{stat.value}</SectionTitle>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                  }}>
                    {stat.icon}
                  </div>
                </div>
                <p style={{ color: textMuted, fontSize: '13px', margin: 0 }}>{stat.change}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Players list */}
            <div style={{
              background: bgCard,
              borderRadius: '16px',
              border: `1px solid ${border}`,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <SubSectionTitle style={{ color: text, fontSize: '18px', fontWeight: 600, margin: 0 }}>Mine spillere</SubSectionTitle>
                <button style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: colors.primary[700],
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>Se alle</button>
              </div>
              
              <div style={{ padding: '8px' }}>
                {players.map((player, idx) => (
                  <div
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: selectedPlayer?.id === player.id ? bgElevated : 'transparent',
                      marginBottom: '4px',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}>
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </span>
                        {player.status === 'active' && (
                          <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: colors.success[500],
                            border: `2px solid ${bgCard}`,
                          }} />
                        )}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <CardTitle style={{ color: text, fontSize: '15px', fontWeight: 600, margin: 0 }}>{player.name}</CardTitle>
                          <span style={{
                            background: colors.accent[500],
                            color: colors.primary[900],
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}>Nivå {player.level}</span>
                          {player.alerts > 0 && (
                            <span style={{
                              background: colors.danger[500],
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                            }}>{player.alerts}</span>
                          )}
                        </div>
                        <p style={{ color: textMuted, fontSize: '13px', margin: 0 }}>
                          Snitt: {player.avgScore} • Sist aktiv: {player.lastSession}
                        </p>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px',
                        }}>
                          <span style={{ color: textMuted, fontSize: '12px' }}>Uke</span>
                          <span style={{ color: text, fontSize: '14px', fontWeight: 600 }}>{player.weekProgress}%</span>
                        </div>
                        <div style={{
                          width: '80px',
                          height: '6px',
                          background: bgElevated,
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${player.weekProgress}%`,
                            height: '100%',
                            background: player.weekProgress >= 80 ? colors.success[500] : player.weekProgress >= 50 ? colors.accent[500] : colors.warning[500],
                            borderRadius: '3px',
                          }} />
                        </div>
                      </div>
                      
                      <div style={{ color: textMuted }}>
                        <Icons.ChevronRight />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts panel */}
            <div style={{
              background: bgCard,
              borderRadius: '16px',
              border: `1px solid ${border}`,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <SubSectionTitle style={{ color: text, fontSize: '18px', fontWeight: 600, margin: 0 }}>Varsler</SubSectionTitle>
                <span style={{
                  background: colors.danger[500],
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>3 nye</span>
              </div>
              
              <div style={{ padding: '16px' }}>
                {alerts.map((alert, idx) => (
                  <div key={alert.id} style={{
                    padding: '16px',
                    background: bgElevated,
                    borderRadius: '12px',
                    marginBottom: '12px',
                    borderLeft: `4px solid ${
                      alert.type === 'warning' ? colors.warning[500] :
                      alert.type === 'success' ? colors.success[500] :
                      colors.primary[500]
                    }`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ color: text, fontSize: '14px', fontWeight: 600 }}>{alert.player}</span>
                      <span style={{ color: textMuted, fontSize: '12px' }}>{alert.time}</span>
                    </div>
                    <p style={{ color: textMuted, fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{alert.message}</p>
                    {alert.type === 'warning' && (
                      <button style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: colors.warning[500],
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}>Ta kontakt</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // ONBOARDING FLOW
  // ============================================================================

  const OnboardingFlow = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
      name: '',
      age: '',
      club: '',
      avgScore: '',
      handicap: '',
      trainingHours: 10,
      goals: [],
    });

    const goals = [
      'Forbedre handicap',
      'Komme på landslaget',
      'Spille college golf',
      'Bli proff',
      'Ha det gøy',
    ];

    return (
      <div style={{
        width: '375px',
        height: '812px',
        background: bg,
        borderRadius: '40px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        fontFamily: designSystem.typography.fontFamily.body,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Phone notch */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '30px',
          background: darkMode ? '#000' : colors.neutral[900],
          borderRadius: '0 0 20px 20px',
          zIndex: 100,
        }} />

        {/* Header */}
        <div style={{
          paddingTop: '60px',
          padding: '60px 24px 24px',
          background: `linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.primary[800]} 100%)`,
        }}>
          {/* Progress */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: s <= step ? colors.accent[500] : 'rgba(255,255,255,0.2)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
          
          <PageTitle style={{ color: 'white', fontSize: '28px', fontWeight: 700, margin: '0 0 8px' }}>
            {step === 1 && 'Velkommen!'}
            {step === 2 && 'Din golfprofil'}
            {step === 3 && 'Dine mål'}
            {step === 4 && 'Treningsnivå'}
          </PageTitle>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', margin: 0 }}>
            {step === 1 && 'La oss komme i gang med din utviklingsplan'}
            {step === 2 && 'Fortell oss litt om spillet ditt'}
            {step === 3 && 'Hva ønsker du å oppnå?'}
            {step === 4 && 'Hvor mye tid kan du trene?'}
          </p>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Fullt navn</label>
                <input
                  type="text"
                  placeholder="Ola Nordmann"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${border}`,
                    background: bgCard,
                    color: text,
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Alder</label>
                <input
                  type="number"
                  placeholder="16"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${border}`,
                    background: bgCard,
                    color: text,
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ color: textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Golfklubb</label>
                <input
                  type="text"
                  placeholder="Gamle Fredrikstad GK"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${border}`,
                    background: bgCard,
                    color: text,
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Snittscore (18 hull)</label>
                <input
                  type="number"
                  placeholder="78"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${border}`,
                    background: bgCard,
                    color: text,
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: textMuted, fontSize: '13px', display: 'block', marginBottom: '8px' }}>Handicap</label>
                <input
                  type="text"
                  placeholder="+2.5"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${border}`,
                    background: bgCard,
                    color: text,
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{
                background: `${colors.primary[700]}15`,
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${colors.primary[700]}30`,
              }}>
                <p style={{ color: text, fontSize: '14px', margin: '0 0 8px', fontWeight: 600 }}>Tips</p>
                <p style={{ color: textMuted, fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                  Bruk ditt virkelige snittscore fra de siste 10 rundene. Dette hjelper oss å plassere deg i riktig treningskategori.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p style={{ color: textMuted, fontSize: '14px', marginBottom: '20px' }}>Velg ett eller flere mål:</p>
              {goals.map((goal, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    const newGoals = formData.goals.includes(goal)
                      ? formData.goals.filter(g => g !== goal)
                      : [...formData.goals, goal];
                    setFormData({ ...formData, goals: newGoals });
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${formData.goals.includes(goal) ? colors.accent[500] : border}`,
                    background: formData.goals.includes(goal) ? `${colors.accent[500]}15` : bgCard,
                    marginBottom: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${formData.goals.includes(goal) ? colors.accent[500] : border}`,
                    background: formData.goals.includes(goal) ? colors.accent[500] : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}>
                    {formData.goals.includes(goal) && <Icons.Check />}
                  </div>
                  <span style={{ color: text, fontSize: '15px', fontWeight: 500 }}>{goal}</span>
                </div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div>
              <p style={{ color: textMuted, fontSize: '14px', marginBottom: '24px' }}>
                Hvor mange timer per uke kan du trene golf?
              </p>
              
              <div style={{
                background: bgCard,
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '24px',
              }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: colors.accent[500],
                  marginBottom: '4px',
                }}>{formData.trainingHours}</div>
                <div style={{ color: textMuted, fontSize: '14px' }}>timer per uke</div>
              </div>
              
              <input
                type="range"
                min="5"
                max="30"
                value={formData.trainingHours}
                onChange={(e) => setFormData({ ...formData, trainingHours: Number(e.target.value) })}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  appearance: 'none',
                  background: `linear-gradient(to right, ${colors.accent[500]} 0%, ${colors.accent[500]} ${((formData.trainingHours - 5) / 25) * 100}%, ${bgElevated} ${((formData.trainingHours - 5) / 25) * 100}%, ${bgElevated} 100%)`,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ color: textMuted, fontSize: '12px' }}>5t</span>
                <span style={{ color: textMuted, fontSize: '12px' }}>30t+</span>
              </div>
              
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: bgElevated,
                borderRadius: '12px',
              }}>
                <p style={{ color: text, fontSize: '14px', fontWeight: 600, margin: '0 0 8px' }}>
                  {formData.trainingHours >= 20 ? 'Elite nivaa' : formData.trainingHours >= 12 ? 'Serios satsning' : 'Aktiv mosjonist'}
                </p>
                <p style={{ color: textMuted, fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                  {formData.trainingHours >= 20 
                    ? 'Du er klar for et profesjonelt treningsprogram med 20+ timer per uke.'
                    : formData.trainingHours >= 12 
                    ? 'Et solid treningsprogram som gir god utvikling over tid.'
                    : 'Et tilpasset program som passer din hverdag.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '24px', paddingBottom: '40px' }}>
          <button
            onClick={() => step < 4 ? setStep(step + 1) : null}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              border: 'none',
              background: `linear-gradient(135deg, ${colors.accent[500]}, ${colors.accent[400]})`,
              color: colors.primary[900],
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: designSystem.shadows.lg,
            }}
          >
            {step < 4 ? 'Fortsett' : 'Generer min plan'}
          </button>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'transparent',
                color: textMuted,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Tilbake
            </button>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors.neutral[950]} 0%, ${colors.primary[900]} 100%)`,
      minHeight: '100vh',
      padding: '40px',
      fontFamily: designSystem.typography.fontFamily.body,
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1600px', margin: '0 auto 40px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${colors.accent[500]}, ${colors.accent[400]})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: designSystem.shadows.glow,
          }}>
            <Icons.Flag />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ color: colors.neutral[400], fontSize: '16px', margin: 0 }}>App Design System & Prototypes</p>
          </div>
        </div>
        
        {/* View selector */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {[
            { id: 'mobile-player', label: 'Spiller App (Mobil)' },
            { id: 'web-player', label: 'Spiller App (Web)' },
            { id: 'coach-dashboard', label: 'Coach Dashboard' },
            { id: 'onboarding', label: 'Onboarding Flow' },
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: `2px solid ${activeView === view.id ? colors.accent[500] : colors.neutral[700]}`,
                background: activeView === view.id ? `${colors.accent[500]}15` : 'transparent',
                color: activeView === view.id ? colors.accent[500] : colors.neutral[400],
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {view.label}
            </button>
          ))}
        </div>
        
        {/* Theme toggle */}
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: `1px solid ${colors.neutral[700]}`,
              background: 'transparent',
              color: colors.neutral[400],
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </div>

      {/* Prototype display */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '40px',
      }}>
        {activeView === 'mobile-player' && <MobilePlayerApp />}
        {activeView === 'web-player' && (
          <div style={{
            width: '100%',
            maxWidth: '1400px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}>
            <WebPlayerCalendar />
          </div>
        )}
        {activeView === 'coach-dashboard' && (
          <div style={{
            width: '100%',
            maxWidth: '1600px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}>
            <CoachDashboard />
          </div>
        )}
        {activeView === 'onboarding' && <OnboardingFlow />}
      </div>

      {/* Design system info */}
      <div style={{
        maxWidth: '1200px',
        margin: '60px auto 0',
        background: colors.neutral[900],
        borderRadius: '20px',
        padding: '32px',
        border: `1px solid ${colors.neutral[800]}`,
      }}>
        <SectionTitle style={{ color: 'white', fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>
          Design System Overview
        </SectionTitle>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {/* Colors */}
          <div>
            <SubSectionTitle style={{ color: colors.neutral[400], fontSize: '14px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Brand Colors
            </SubSectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'Primary', color: colors.primary[700] },
                { name: 'Accent', color: colors.accent[500] },
                { name: 'Success', color: colors.success[500] },
                { name: 'Danger', color: colors.danger[500] },
              ].map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: c.color }} />
                  <span style={{ color: colors.neutral[300], fontSize: '14px' }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Typography */}
          <div>
            <SubSectionTitle style={{ color: colors.neutral[400], fontSize: '14px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Typography
            </SubSectionTitle>
            <div style={{ color: colors.neutral[300] }}>
              <p style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>DM Sans</p>
              <p style={{ fontSize: '16px', fontWeight: 400, margin: '0 0 8px' }}>Inter</p>
              <p style={{ fontSize: '14px', fontFamily: 'monospace', margin: 0 }}>JetBrains Mono</p>
            </div>
          </div>
          
          {/* Session Types */}
          <div>
            <SubSectionTitle style={{ color: colors.neutral[400], fontSize: '14px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Session Types
            </SubSectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(colors.sessions).map(([key, color]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: color }} />
                  <span style={{ color: colors.neutral[300], fontSize: '14px', textTransform: 'capitalize' }}>{key}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Periods */}
          <div>
            <SubSectionTitle style={{ color: colors.neutral[400], fontSize: '14px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Training Periods
            </SubSectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(colors.periods).map(([key, color]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: color }} />
                  <span style={{ color: colors.neutral[300], fontSize: '14px', textTransform: 'capitalize' }}>{key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TIERGolfAppDesignSystem;
