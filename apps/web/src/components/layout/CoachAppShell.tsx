/**
 * TIER Golf - Coach App Shell
 * Design System v3.1 - Navy × Gold (Premium Light)
 *
 * Layout wrapper for coach portal routes.
 * V3: Uses CoachSidebarV3 with flat 5-item navigation.
 */

import React, { useState, useEffect } from 'react';
import CoachSidebarV3 from './CoachSidebarV3';
import BackToTop from '../ui/BackToTop';
import { useAuth } from '../../contexts/AuthContext';
import { eventClient } from '../../analytics/eventClient';
import { useCoachAttentionCount } from '../../features/coach-plan-dashboard';

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

interface CoachAppShellProps {
  children: React.ReactNode;
}

export default function CoachAppShell({ children }: CoachAppShellProps) {
  const [skipLinkFocused, setSkipLinkFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { user, logout } = useAuth();
  const { count: dashboardAttentionCount } = useCoachAttentionCount();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch unread messages/alerts count
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        // Try alerts first (coach specific)
        const alertsResponse = await fetch('/api/v1/coaches/me/alerts?unread=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (alertsResponse.ok) {
          const data = await alertsResponse.json();
          setUnreadMessages(data.data?.alerts?.length || 0);
          return;
        }

        // Fallback to general notifications
        const response = await fetch('/api/v1/notifications?unread=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadMessages(data.data?.notifications?.length || 0);
        }
      } catch {
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
        'coach'
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

      <CoachSidebarV3
        user={user || undefined}
        unreadMessages={unreadMessages}
        dashboardAttentionCount={dashboardAttentionCount}
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
