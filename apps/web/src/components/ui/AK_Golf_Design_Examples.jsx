/**
 * TIER Golf Design Examples
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState } from 'react';
import {
  Home, Calendar, BarChart3, User, Clock, ChevronRight,
  Trophy, Target, TrendingUp, Check, AlertCircle, Play,
  Moon, Zap, Smile, Flag, Plus, Search, Bell, Settings,
  Activity, Award, BookOpen, Dumbbell, Brain
} from 'lucide-react';
import { PageTitle, SectionTitle, SubSectionTitle } from '../typography';

// Session type colors (Blue Palette 01)
const sessionTypeColors = {
  teknikk: '#2C5F7F',
  golfslag: '#4A7C59',
  spill: '#10456A',
  kompetanse: 'rgb(var(--tier-gold))',
  fysisk: '#D4A84B',
  funksjonell: '#8E8E93',
};

// ============================================================================
// TIER GOLF – DESIGN SYSTEM EKSEMPLER v2.1
// Forest Theme - Design System v2.1
// ============================================================================

// Design Tokens (using Design System v2.1)
const theme = {
  colors: {
    // Primær
    primary: 'var(--accent)',
    primaryDark: 'var(--accent)',
    primaryLight: 'rgba(var(--accent-rgb), 0.8)',
    
    // Nøytrale
    gray900: 'var(--text-primary)',
    gray700: 'var(--text-primary)',
    gray600: 'var(--text-secondary)',
    gray500: 'var(--text-secondary)',
    gray400: 'var(--text-secondary)',
    gray300: 'var(--border-default)',
    gray200: 'var(--border-default)',
    gray100: 'var(--bg-tertiary)',
    gray50: 'var(--bg-secondary)',
    white: 'var(--bg-primary)',

    // Semantiske
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
    info: sessionTypeColors.golfslag,
    
    // Perioder
    periodE: 'var(--text-secondary)',
    periodG: 'rgba(var(--accent-rgb), 0.8)',
    periodS: 'var(--success)',
    periodT: 'var(--achievement)',

    // L-faser
    l1: 'var(--success)',
    l2: sessionTypeColors.spill,
    l3: 'var(--warning)',
    l4: sessionTypeColors.fysisk,
    l5: 'var(--error)',
    
    // Kategorier
    categories: {
      A: '#ef4444', B: '#f97316', C: '#f59e0b', D: '#eab308',
      E: '#84cc16', F: '#22c55e', G: '#10b981', H: '#14b8a6',
      I: '#06b6d4', J: '#3b82f6', K: '#6366f1',
    },
    
    // Økt-typer
    sessions: {
      teknikk: sessionTypeColors.teknikk,
      golfslag: sessionTypeColors.golfslag,
      spill: sessionTypeColors.spill,
      konkurranse: sessionTypeColors.kompetanse,
      fysisk: sessionTypeColors.fysisk,
      mental: sessionTypeColors.funksjonell,
    },
  },
  
  shadows: {
    xs: '0 1px 2px rgba(0,0,0,0.03)',
    sm: '0 1px 3px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
    primary: '0 4px 12px rgba(16,69,106,0.15)',
  },
};

// ============================================================================
// EKSEMPEL 1: STARTMENY / HJEM (Lys)
// ============================================================================
const HomeScreenLight = () => {
  const player = {
    name: 'Jakob',
    category: 'B',
    categoryName: 'Elite',
    avgScore: 74,
    handicap: 4.2,
    streak: 12,
    weekProgress: 67,
  };

  const todaySessions = [
    { time: '09:00', name: 'Driver Teknikk', type: 'teknikk', duration: '90 min', lPhase: 'L3', cs: 'CS80', done: true },
    { time: '14:00', name: 'Kort Spill', type: 'golfslag', duration: '60 min', lPhase: 'L4', cs: 'CS60', done: false, active: true },
    { time: '16:30', name: 'Putt Trening', type: 'golfslag', duration: '45 min', lPhase: 'L5', cs: null, done: false },
  ];

  const quickStats = [
    { icon: Moon, label: 'Søvn', value: '7.5t', color: theme.colors.sessions.teknikk },
    { icon: Smile, label: 'Humør', value: 'Bra', color: theme.colors.success },
    { icon: Zap, label: 'Energi', value: '85%', color: theme.colors.warning },
    { icon: Target, label: 'Fokus', value: 'Høy', color: theme.colors.error },
  ];

  return (
    <div style={{
      width: '390px',
      height: '844px',
      background: theme.colors.gray50,
      borderRadius: '44px',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: 'relative',
      border: `8px solid ${theme.colors.gray200}`,
    }}>
      {/* Status Bar */}
      <div style={{
        padding: '16px 28px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: theme.colors.gray900,
        fontSize: '15px',
        fontWeight: '600',
      }}>
        <span>09:41</span>
        <div style={{
          width: '126px',
          height: '34px',
          background: theme.colors.gray900,
          borderRadius: '17px',
        }}/>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Activity size={16} color={theme.colors.gray900} strokeWidth={1.5} />
          <div style={{ 
            width: '25px', height: '12px', 
            border: `1.5px solid ${theme.colors.gray900}`, 
            borderRadius: '3px',
            padding: '1px',
          }}>
            <div style={{ width: '80%', height: '100%', background: theme.colors.success, borderRadius: '1px' }}/>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', height: 'calc(100% - 140px)', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: theme.colors.gray500, fontSize: '14px', margin: '0 0 4px', fontWeight: '500' }}>
            Good morning,
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <PageTitle style={{ color: theme.colors.gray900, fontSize: '28px', fontWeight: '700', margin: 0 }}>
              {player.name}
            </PageTitle>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Bell size={24} color={theme.colors.gray500} strokeWidth={1.5} />
              <Settings size={24} color={theme.colors.gray500} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Kategori-kort */}
        <div style={{
          background: theme.colors.white,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          border: `1px solid ${theme.colors.gray200}`,
          boxShadow: theme.shadows.sm,
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: theme.colors.categories[player.category],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: theme.colors.white }}>
              {player.category}
            </span>
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: theme.colors.error,
              borderRadius: '8px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: '700',
              color: theme.colors.white,
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              border: `2px solid ${theme.colors.white}`,
            }}>
              {player.streak} streak
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ color: theme.colors.categories[player.category], fontSize: '16px', fontWeight: '700' }}>
                Kategori {player.category}
              </span>
              <span style={{ color: theme.colors.gray400, fontSize: '14px' }}>
                • {player.categoryName}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '16px', color: theme.colors.gray500, fontSize: '13px' }}>
              <span>Snitt {player.avgScore}</span>
              <span>HCP {player.handicap}</span>
            </div>
          </div>
          <ChevronRight size={20} color={theme.colors.gray400} strokeWidth={1.5} />
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          marginBottom: '24px',
        }}>
          {quickStats.map((stat, i) => (
            <div key={i} style={{
              background: theme.colors.white,
              borderRadius: '12px',
              padding: '12px 8px',
              textAlign: 'center',
              border: `1px solid ${theme.colors.gray200}`,
            }}>
              <stat.icon size={20} color={stat.color} strokeWidth={1.5} style={{ marginBottom: '4px' }} />
              <p style={{ color: theme.colors.gray500, fontSize: '10px', margin: '0 0 2px' }}>{stat.label}</p>
              <p style={{ color: theme.colors.gray900, fontSize: '13px', fontWeight: '600', margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Ukeprogresjon */}
        <div style={{
          background: theme.colors.primary,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0 0 4px', fontWeight: '500' }}>
                UKE 50 • GRUNNPERIODE
              </p>
              <p style={{ color: theme.colors.white, fontSize: '18px', fontWeight: '700', margin: 0 }}>
                Ukeprogresjon
              </p>
            </div>
            <div style={{
              background: theme.colors.warning,
              borderRadius: '10px',
              padding: '6px 12px',
            }}>
              <span style={{ color: theme.colors.gray900, fontSize: '14px', fontWeight: '700' }}>
                {player.weekProgress}%
              </span>
            </div>
          </div>
          <div style={{
            height: '6px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${player.weekProgress}%`,
              height: '100%',
              background: theme.colors.white,
              borderRadius: '3px',
            }}/>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '8px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '12px',
          }}>
            <span>4 av 6 økter</span>
            <span>12.5 av 18 timer</span>
          </div>
        </div>

        {/* Dagens økter */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <SectionTitle style={{ color: theme.colors.gray900, fontSize: '18px', fontWeight: '600', margin: 0 }}>
              Dagens økter
            </SectionTitle>
            <span style={{ color: theme.colors.primary, fontSize: '14px', fontWeight: '500' }}>
              Se alle
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todaySessions.map((session, i) => (
              <div key={i} style={{
                background: theme.colors.white,
                borderRadius: '14px',
                padding: '16px',
                border: session.active 
                  ? `2px solid ${theme.colors.primary}`
                  : `1px solid ${theme.colors.gray200}`,
                boxShadow: session.active ? theme.shadows.primary : theme.shadows.sm,
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}>
                {/* Type indicator */}
                <div style={{
                  width: '4px',
                  height: '48px',
                  borderRadius: '2px',
                  background: theme.colors.sessions[session.type],
                }}/>
                
                {/* Time */}
                <div style={{ width: '50px' }}>
                  <p style={{ color: theme.colors.gray900, fontSize: '15px', fontWeight: '600', margin: 0 }}>
                    {session.time}
                  </p>
                </div>
                
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ color: theme.colors.gray900, fontSize: '15px', fontWeight: '600', margin: '0 0 4px' }}>
                    {session.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} color={theme.colors.gray400} strokeWidth={1.5} />
                    <span style={{ color: theme.colors.gray500, fontSize: '13px' }}>{session.duration}</span>
                  </div>
                </div>
                
                {/* Badges */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {/* L-phase badge */}
                  <span style={{
                    background: `${theme.colors[session.lPhase.toLowerCase()]}20`,
                    color: theme.colors[session.lPhase.toLowerCase()],
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                  }}>
                    {session.lPhase}
                  </span>
                  
                  {/* CS badge */}
                  {session.cs && (
                    <span style={{
                      border: `1.5px solid ${theme.colors.gray400}`,
                      color: theme.colors.gray500,
                      padding: '3px 7px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '500',
                    }}>
                      {session.cs}
                    </span>
                  )}
                  
                  {/* Status */}
                  {session.done ? (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: theme.colors.success,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Check size={14} color={theme.colors.white} strokeWidth={2} />
                    </div>
                  ) : session.active ? (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: theme.colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Play size={12} color={theme.colors.white} strokeWidth={2} fill={theme.colors.white} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: theme.colors.white,
        borderTop: `1px solid ${theme.colors.gray200}`,
        padding: '8px 20px 28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[
            { icon: Home, label: 'Hjem', active: true },
            { icon: Calendar, label: 'Plan', active: false },
            { icon: Dumbbell, label: 'Trening', active: false },
            { icon: BarChart3, label: 'Tester', active: false },
            { icon: User, label: 'Profil', active: false },
          ].map((nav, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: '12px',
              background: nav.active ? `${theme.colors.primary}10` : 'transparent',
            }}>
              <nav.icon 
                size={24} 
                color={nav.active ? theme.colors.primary : theme.colors.gray400} 
                strokeWidth={1.5} 
              />
              <span style={{
                fontSize: '11px',
                fontWeight: nav.active ? '600' : '500',
                color: nav.active ? theme.colors.primary : theme.colors.gray400,
                marginTop: '4px',
              }}>
                {nav.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EKSEMPEL 2: KOMPONENTER OVERSIKT
// ============================================================================
const ComponentsShowcase = () => {
  const [inputValue, setInputValue] = useState('');
  
  return (
    <div style={{
      width: '390px',
      minHeight: '844px',
      background: theme.colors.gray50,
      borderRadius: '44px',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: '60px 24px 40px',
      border: `8px solid ${theme.colors.gray200}`,
    }}>
      <PageTitle style={{ color: theme.colors.gray900, fontSize: '24px', fontWeight: '700', marginBottom: '32px' }}>
        Komponenter
      </PageTitle>

      {/* Knapper */}
      <section style={{ marginBottom: '32px' }}>
        <SectionTitle style={{ color: theme.colors.gray700, fontSize: '13px', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.5px' }}>
          KNAPPER
        </SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button style={{
            background: theme.colors.primary,
            color: theme.colors.white,
            border: 'none',
            borderRadius: '12px',
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <Plus size={20} strokeWidth={1.5} />
            Primær knapp
          </button>
          
          <button style={{
            background: theme.colors.gray100,
            color: theme.colors.primary,
            border: `1px solid ${theme.colors.gray200}`,
            borderRadius: '12px',
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <Calendar size={20} strokeWidth={1.5} />
            Sekundær knapp
          </button>
          
          <button style={{
            background: 'transparent',
            color: theme.colors.gray500,
            border: 'none',
            borderRadius: '12px',
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <ChevronRight size={20} strokeWidth={1.5} />
            Ghost knapp
          </button>
        </div>
      </section>

      {/* Input */}
      <section style={{ marginBottom: '32px' }}>
        <SectionTitle style={{ color: theme.colors.gray700, fontSize: '13px', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.5px' }}>
          INPUT-FELT
        </SectionTitle>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ 
            display: 'block', 
            color: theme.colors.gray700, 
            fontSize: '13px', 
            fontWeight: '500',
            marginBottom: '6px',
          }}>
            Snittscore
          </label>
          <div style={{ position: 'relative' }}>
            <Target 
              size={20} 
              color={theme.colors.gray400} 
              strokeWidth={1.5}
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="78"
              style={{
                width: '100%',
                height: '48px',
                background: theme.colors.white,
                border: `1px solid ${theme.colors.gray300}`,
                borderRadius: '10px',
                padding: '0 14px 0 44px',
                fontSize: '15px',
                color: theme.colors.gray900,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <span style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.colors.gray400,
              fontSize: '14px',
            }}>
              slag
            </span>
          </div>
          <p style={{ color: theme.colors.gray500, fontSize: '12px', marginTop: '6px' }}>
            Bruk snittscore fra siste 10 runder
          </p>
        </div>
        
        {/* Error state */}
        <div>
          <label style={{ 
            display: 'block', 
            color: theme.colors.gray700, 
            fontSize: '13px', 
            fontWeight: '500',
            marginBottom: '6px',
          }}>
            Handicap
          </label>
          <input
            type="text"
            placeholder="Ugyldig verdi"
            style={{
              width: '100%',
              height: '48px',
              background: 'rgba(196, 91, 78, 0.1)',
              border: `1px solid ${theme.colors.error}`,
              borderRadius: '10px',
              padding: '0 14px',
              fontSize: '15px',
              color: theme.colors.gray900,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <p style={{ color: theme.colors.error, fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={14} strokeWidth={1.5} />
            Må være et tall mellom 0 og 54
          </p>
        </div>
      </section>

      {/* Badges */}
      <section style={{ marginBottom: '32px' }}>
        <SectionTitle style={{ color: theme.colors.gray700, fontSize: '13px', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.5px' }}>
          KATEGORI-BADGES
        </SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(theme.colors.categories).map(([letter, color]) => (
            <span key={letter} style={{
              background: color,
              color: theme.colors.white,
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
            }}>
              {letter}
            </span>
          ))}
        </div>
      </section>

      {/* Periode-badges */}
      <section style={{ marginBottom: '32px' }}>
        <SectionTitle style={{ color: theme.colors.gray700, fontSize: '13px', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.5px' }}>
          PERIODE-BADGES
        </SectionTitle>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { letter: 'E', name: 'Evaluering', color: theme.colors.periodE },
            { letter: 'G', name: 'Grunnlag', color: theme.colors.periodG },
            { letter: 'S', name: 'Spesialisering', color: theme.colors.periodS },
            { letter: 'T', name: 'Turnering', color: theme.colors.periodT },
          ].map((period) => (
            <span key={period.letter} style={{
              background: period.color,
              color: theme.colors.white,
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              {period.letter}
            </span>
          ))}
        </div>
      </section>

      {/* L-fase badges */}
      <section style={{ marginBottom: '32px' }}>
        <SectionTitle style={{ color: theme.colors.gray700, fontSize: '13px', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.5px' }}>
          L-FASE BADGES
        </SectionTitle>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { name: 'L1', color: theme.colors.l1 },
            { name: 'L2', color: theme.colors.l2 },
            { name: 'L3', color: theme.colors.l3 },
            { name: 'L4', color: theme.colors.l4 },
            { name: 'L5', color: theme.colors.l5 },
          ].map((phase) => (
            <span key={phase.name} style={{
              background: `${phase.color}20`,
              color: phase.color,
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              {phase.name}
            </span>
          ))}
        </div>
      </section>

      {/* CS badges */}
      <section style={{ marginBottom: '32px' }}>
        <SectionTitle style={{ color: theme.colors.gray700, fontSize: '13px', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.5px' }}>
          CS-BADGES (CLUBSPEED)
        </SectionTitle>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['CS20', 'CS40', 'CS60', 'CS80', 'CS100'].map((cs) => (
            <span key={cs} style={{
              border: `1.5px solid ${theme.colors.gray400}`,
              color: theme.colors.gray500,
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              background: 'transparent',
            }}>
              {cs}
            </span>
          ))}
        </div>
      </section>

      {/* Økt-type indikatorer */}
      <section>
        <SectionTitle style={{ color: theme.colors.gray700, fontSize: '13px', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.5px' }}>
          ØKT-TYPER
        </SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { icon: BookOpen, name: 'Teknikk', color: theme.colors.sessions.teknikk },
            { icon: Flag, name: 'Golfslag', color: theme.colors.sessions.golfslag },
            { icon: Target, name: 'Spill', color: theme.colors.sessions.spill },
            { icon: Trophy, name: 'Konkurranse', color: theme.colors.sessions.konkurranse },
            { icon: Dumbbell, name: 'Fysisk', color: theme.colors.sessions.fysisk },
            { icon: Brain, name: 'Mental', color: theme.colors.sessions.mental },
          ].map((type) => (
            <div key={type.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '4px',
                height: '24px',
                borderRadius: '2px',
                background: type.color,
              }}/>
              <type.icon size={20} color={type.color} strokeWidth={1.5} />
              <span style={{ color: theme.colors.gray700, fontSize: '14px', fontWeight: '500' }}>
                {type.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// EKSEMPEL 3: TRENINGSKORT
// ============================================================================
const TrainingCard = () => {
  return (
    <div style={{
      width: '342px',
      background: theme.colors.white,
      borderRadius: '16px',
      border: `1px solid ${theme.colors.gray200}`,
      boxShadow: theme.shadows.sm,
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${theme.colors.gray100}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '4px',
          height: '40px',
          borderRadius: '2px',
          background: theme.colors.sessions.teknikk,
        }}/>
        <div style={{ flex: 1 }}>
          <p style={{ color: theme.colors.gray500, fontSize: '12px', margin: '0 0 2px', fontWeight: '500' }}>
            09:00 – 10:30
          </p>
          <SubSectionTitle style={{ color: theme.colors.gray900, fontSize: '16px', fontWeight: '600', margin: 0 }}>
            Driver Teknikk
          </SubSectionTitle>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{
            background: `${theme.colors.l3}20`,
            color: theme.colors.l3,
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
          }}>
            L3
          </span>
          <span style={{
            border: `1.5px solid ${theme.colors.gray400}`,
            color: theme.colors.gray500,
            padding: '3px 7px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '500',
          }}>
            CS80
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
          <div>
            <p style={{ color: theme.colors.gray400, fontSize: '11px', margin: '0 0 2px' }}>Varighet</p>
            <p style={{ color: theme.colors.gray900, fontSize: '14px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} color={theme.colors.gray500} strokeWidth={1.5} />
              90 min
            </p>
          </div>
          <div>
            <p style={{ color: theme.colors.gray400, fontSize: '11px', margin: '0 0 2px' }}>Setting</p>
            <p style={{ color: theme.colors.gray900, fontSize: '14px', fontWeight: '600', margin: 0 }}>S4</p>
          </div>
          <div>
            <p style={{ color: theme.colors.gray400, fontSize: '11px', margin: '0 0 2px' }}>Fokus</p>
            <p style={{ color: theme.colors.gray900, fontSize: '14px', fontWeight: '600', margin: 0 }}>Rotasjon</p>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: theme.colors.gray500, fontSize: '12px' }}>Progresjon</span>
            <span style={{ color: theme.colors.primary, fontSize: '12px', fontWeight: '600' }}>2 av 4 øvelser</span>
          </div>
          <div style={{
            height: '6px',
            background: theme.colors.gray100,
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              background: theme.colors.primary,
              borderRadius: '3px',
            }}/>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        background: theme.colors.gray50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: theme.colors.gray500, fontSize: '13px' }}>
          Neste: Nedslag drill
        </span>
        <button style={{
          background: theme.colors.primary,
          color: theme.colors.white,
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Play size={14} strokeWidth={2} fill={theme.colors.white} />
          Fortsett
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// EKSEMPEL 4: SPILLERPROFIL-KORT
// ============================================================================
const PlayerProfileCard = () => {
  return (
    <div style={{
      width: '342px',
      background: theme.colors.white,
      borderRadius: '16px',
      border: `1px solid ${theme.colors.gray200}`,
      boxShadow: theme.shadows.sm,
      padding: '24px',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Avatar og info */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: theme.colors.gray200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          fontWeight: '700',
          color: theme.colors.gray500,
        }}>
          JH
        </div>
        <div style={{ flex: 1 }}>
          <SectionTitle style={{ color: theme.colors.gray900, fontSize: '20px', fontWeight: '700', margin: '0 0 4px' }}>
            Jakob Holm
          </SectionTitle>
          <p style={{ color: theme.colors.gray500, fontSize: '14px', margin: '0 0 8px' }}>
            GFGK • 16 år
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{
              background: theme.colors.categories.B,
              color: theme.colors.white,
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              Kategori B
            </span>
            <span style={{
              background: theme.colors.periodG,
              color: theme.colors.white,
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              Grunnperiode
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        padding: '16px 0',
        borderTop: `1px solid ${theme.colors.gray100}`,
        borderBottom: `1px solid ${theme.colors.gray100}`,
      }}>
        {[
          { label: 'Snitt', value: '74', icon: Target },
          { label: 'HCP', value: '4.2', icon: TrendingUp },
          { label: 'Streak', value: '12', icon: Award },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <stat.icon size={20} color={theme.colors.gray400} strokeWidth={1.5} style={{ marginBottom: '4px' }} />
            <p style={{ color: theme.colors.gray900, fontSize: '18px', fontWeight: '700', margin: '0 0 2px' }}>
              {stat.value}
            </p>
            <p style={{ color: theme.colors.gray500, fontSize: '11px', margin: 0 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Mål */}
      <div style={{ marginTop: '16px' }}>
        <p style={{ color: theme.colors.gray700, fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
          Hovedmål
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {['Landslag', 'College golf', 'HCP under 2'].map((goal) => (
            <span key={goal} style={{
              background: theme.colors.gray100,
              color: theme.colors.gray600,
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
            }}>
              {goal}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HOVEDEKSPORT
// ============================================================================
const DesignExamples = () => {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '40px',
      padding: '40px',
      background: '#D1D5DB',
      minHeight: '100vh',
    }}>
      <div>
        <SubSectionTitle style={{ marginBottom: '16px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
          STARTMENY / HJEM
        </SubSectionTitle>
        <HomeScreenLight />
      </div>

      <div>
        <SubSectionTitle style={{ marginBottom: '16px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
          KOMPONENTER
        </SubSectionTitle>
        <ComponentsShowcase />
      </div>

      <div>
        <SubSectionTitle style={{ marginBottom: '16px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
          TRENINGSKORT
        </SubSectionTitle>
        <TrainingCard />

        <SubSectionTitle style={{ marginTop: '32px', marginBottom: '16px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
          SPILLERPROFIL
        </SubSectionTitle>
        <PlayerProfileCard />
      </div>
    </div>
  );
};

export default DesignExamples;
