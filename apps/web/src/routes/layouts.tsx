/**
 * Route Layouts
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

// @ts-nocheck
import React, { ReactNode } from 'react';
import ApplicationLayoutTopNav from '../components/layout/ApplicationLayoutTopNav';
import PlayerAppShell from '../components/layout/PlayerAppShell';
import CoachAppShell from '../components/layout/CoachAppShell';
import AdminAppShell from '../components/layout/AdminAppShell';

// =============================================================================
// Layout Types
// =============================================================================

interface LayoutProps {
  children: ReactNode;
}

interface AuthenticatedLayoutProps extends LayoutProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

// =============================================================================
// Layout Components
// =============================================================================

/**
 * Layout component for authenticated pages using Sidebar (Player)
 * V3: Uses PlayerAppShell with flat 5-item navigation
 */
export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
}) => (
  <PlayerAppShell>
    {children}
  </PlayerAppShell>
);

/**
 * Dashboard layout - uses Sidebar navigation
 * V3: Uses PlayerAppShell with flat 5-item navigation
 */
export const DashboardLayout: React.FC<LayoutProps> = ({ children }) => (
  <PlayerAppShell>{children}</PlayerAppShell>
);

/**
 * Layout component for coach pages using CoachAppShell
 */
export const CoachLayout: React.FC<LayoutProps> = ({ children }) => (
  <CoachAppShell>{children}</CoachAppShell>
);

/**
 * Layout component for admin pages using AdminAppShell
 */
export const AdminLayout: React.FC<LayoutProps> = ({ children }) => (
  <AdminAppShell>{children}</AdminAppShell>
);

/**
 * Offline Banner Component
 */
export const OfflineBanner: React.FC = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--tier-status-error)',
    color: 'white',
    padding: '12px 16px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 9999,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  }}>
    alert-triangle️ Ingen internettforbindelse. Noen funksjoner kan være utilgjengelige.
  </div>
);
