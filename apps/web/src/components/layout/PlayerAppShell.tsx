/**
 * TIER Golf - Player App Shell
 * Design System v3.1 - Navy × Gold (Premium Light)
 *
 * Layout wrapper for player portal routes.
 * V3: Uses PlayerSidebarV3 with flat 5-item navigation.
 */

import React, { useState, useEffect } from 'react';
import PlayerSidebarV3 from './PlayerSidebarV3';
import BackToTop from '../ui/BackToTop';
import { useAuth } from '../../contexts/AuthContext';
import { eventClient } from '../../analytics/eventClient';
import { usePlanAttentionCount } from '../../features/plan/hooks/usePlanDashboard';

// Skip to content link styles
const skipLinkStyles: React.CSSProperties = {
  position: 'absolute',
  top: '-40px',
  left: '0',
  padding: '8px 16px',
  backgroundColor: 'rgb(var(--tier-primary, 10 37 64))',
  color: 'var(--tier-surface-card)',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '14px',
  borderRadius: '0 0 8px 0',
  zIndex: 9999,
  transition: 'top 0.2s',
};

const skipLinkFocusStyles: React.CSSProperties = {
  ...skipLinkStyles,
  top: '0',
};

interface PlayerAppShellProps {
  children: React.ReactNode;
}

export default function PlayerAppShell({ children }: PlayerAppShellProps) {
  const [skipLinkFocused, setSkipLinkFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { user, logout } = useAuth();
  const { count: planAttentionCount } = usePlanAttentionCount();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch unread messages count
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/v1/notifications?unread=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadMessages(data.data?.notifications?.length || 0);
        }
      } catch (error) {
        // Silent fail - messages are non-critical
      }
    };

    fetchMessages();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMessages, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    eventClient.reset();
    await logout();
  };

  // Initialize eventClient when user is available
  useEffect(() => {
    if (user?.id) {
      eventClient.init(
        user.id,
        (user as { tenantId?: string }).tenantId || 'unknown',
        'player'
      );
    }
  }, [user]);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        backgroundColor: 'var(--tier-surface-page)',
      }}
    >
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        style={skipLinkFocused ? skipLinkFocusStyles : skipLinkStyles}
        onFocus={() => setSkipLinkFocused(true)}
        onBlur={() => setSkipLinkFocused(false)}
      >
        Hopp til hovedinnhold
      </a>

      <PlayerSidebarV3
        user={user || undefined}
        unreadMessages={unreadMessages}
        planAttentionCount={planAttentionCount}
        onLogout={handleLogout}
      />

      <main
        id="main-content"
        style={{
          flex: 1,
          minWidth: 0,
          marginTop: isMobile ? '60px' : 0,
        }}
        tabIndex={-1}
      >
        <div
          style={{
            height: isMobile ? 'calc(100vh - 60px)' : '100vh',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              width: '100%',
              padding: isMobile ? '16px' : '24px 32px',
            }}
          >
            {children}
          </div>
        </div>
      </main>

      <BackToTop />
    </div>
  );
}
