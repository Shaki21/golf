/**
 * TIER Golf - Admin App Shell
 * Design System v3.0 - Blue Palette 01
 *
 * Layout wrapper for admin portal routes.
 * Uses AdminSidebar for navigation.
 *
 * NON-NEGOTIABLE:
 * - Admin has NO access to player/athlete data
 * - Admin only manages system configuration
 */

import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import BackToTop from '../ui/BackToTop';
import { useAuth } from '../../contexts/AuthContext';

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

interface AdminAppShellProps {
  children: React.ReactNode;
}

export default function AdminAppShell({ children }: AdminAppShellProps) {
  const [skipLinkFocused, setSkipLinkFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openTickets, setOpenTickets] = useState(0);
  const [systemInfo, setSystemInfo] = useState({
    environment: 'production' as const,
    version: '1.0.0',
    uptime: '',
  });
  const { user, logout } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch system info and open tickets
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        // Fetch open tickets count
        const ticketsResponse = await fetch('/api/v1/admin/support/tickets?status=open');
        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json();
          setOpenTickets(ticketsData.total || 0);
        }

        // Fetch system info
        const systemResponse = await fetch('/api/v1/admin/system/info');
        if (systemResponse.ok) {
          const systemData = await systemResponse.json();
          setSystemInfo({
            environment: systemData.environment || 'production',
            version: systemData.version || '1.0.0',
            uptime: systemData.uptime || '',
          });
        }
      } catch (error) {
        // Silent fail - use defaults
      }
    };

    fetchSystemData();
    // Refresh every 10 minutes
    const interval = setInterval(fetchSystemData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        backgroundColor: 'rgb(var(--tier-surface-page, 245 247 249))',
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

      <AdminSidebar
        user={user || undefined}
        systemInfo={systemInfo}
        openTickets={openTickets}
        onLogout={handleLogout}
      />

      <main
        id="main-content"
        style={{
          flex: 1,
          minWidth: 0,
          marginTop: isMobile ? '56px' : 0,
        }}
        tabIndex={-1}
      >
        <div
          style={{
            height: isMobile ? 'calc(100vh - 56px)' : '100vh',
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
