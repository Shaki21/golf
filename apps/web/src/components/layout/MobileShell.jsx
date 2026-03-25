/**
 * MobileShell Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Home, Calendar, Activity, BookOpen } from 'lucide-react';
import { TIERGolfFullLogo } from '../branding/TIERGolfFullLogo';

export default function MobileShell() {
  const navItems = [
    { path: '/m/home', icon: Home, label: 'Hjem' },
    { path: '/m/plan', icon: BookOpen, label: 'Plan' },
    { path: '/m/templates', icon: Activity, label: 'Økter' },
    { path: '/m/calendar', icon: Calendar, label: 'Kalender' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'rgb(var(--tier-surface-page, 245 247 249))',
      fontFamily: 'var(--tier-font-family)',
    }}>
      {/* Mobile Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        backgroundColor: 'rgb(var(--tier-primary, 10 37 64))',
        borderBottom: '1px solid var(--tier-brand-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        boxShadow: 'var(--tier-shadow-elevated)',
      }}>
        <Link
          to="/"
          aria-label="Gå til Oversikt"
          style={{
            display: 'inline-block',
            padding: '8px',
            borderRadius: '12px',
            transition: 'opacity 0.2s',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <TIERGolfFullLogo height={32} variant="light" />
        </Link>
      </header>

      <main style={{
        flex: 1,
        paddingTop: 'calc(56px + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        overflowY: 'auto'
      }}>
        <Outlet />
      </main>
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: 'var(--tier-surface-card)',
        borderTop: '1px solid var(--tier-border-default)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: 'var(--tier-shadow-elevated)',
      }}>
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
            textDecoration: 'none',
            color: isActive ? 'var(--tier-primary)' : 'var(--tier-text-secondary)',
          })}>
            {({ isActive }) => (<>
              <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
              <span style={{
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
              }}>{label}</span>
            </>)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
