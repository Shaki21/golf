/**
 * TIER Golf - Admin Sidebar
 * Design System v3.0 - Blue Palette 01
 *
 * Sidebar navigation for administrators.
 * Role-based navigation using adminNavigationConfig.
 *
 * NON-NEGOTIABLE:
 * - Admin has NO access to player/athlete data
 * - Admin only manages system configuration
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { adminNavigationConfig, adminSystemStatus } from '../../config/admin-navigation';

const { LogOut, ChevronDown, ChevronRight, Menu, X, Shield } = LucideIcons;

// Helper to get icon from string name
const getIcon = (iconName: string) => {
  return (LucideIcons as any)[iconName] || LucideIcons.Circle;
};

interface AdminSidebarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  systemInfo?: {
    environment?: 'production' | 'staging' | 'development';
    version?: string;
    uptime?: string;
  };
  openTickets?: number;
  onLogout?: () => void;
}

export default function AdminSidebar({
  user,
  systemInfo = { environment: 'production', version: '1.0.0' },
  openTickets = 0,
  onLogout,
}: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  // Map navigation items with icons
  const items = useMemo(() => {
    return adminNavigationConfig.map(item => ({
      ...item,
      Icon: getIcon(item.icon),
      // Replace dynamic badge values
      badge: item.badge === 'openTickets' && openTickets > 0 ? String(openTickets) : undefined,
    }));
  }, [openTickets]);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    navigate('/login');
  };

  // Environment badge color
  const getEnvColor = (env: string) => {
    switch (env) {
      case 'production':
        return 'var(--success)';
      case 'staging':
        return 'var(--warning)';
      default:
        return 'var(--text-secondary)';
    }
  };

  // Check if a path is active
  const isActive = (href: string) => pathname === href;
  const hasActiveChild = (submenu: Array<{ href: string }>) =>
    submenu.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'));

  // Render system status
  const renderSystemStatus = () => (
    <div
      style={{
        margin: '12px',
        padding: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Shield size={14} color={'var(--achievement)'} />
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          System Status
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {adminSystemStatus.showEnvironmentBadge && (
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: `${getEnvColor(systemInfo.environment || 'production')}20`,
              color: getEnvColor(systemInfo.environment || 'production'),
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {systemInfo.environment}
          </span>
        )}

        {adminSystemStatus.showVersion && (
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '11px',
              fontWeight: 500,
            }}
          >
            v{systemInfo.version}
          </span>
        )}
      </div>
    </div>
  );

  // Render navigation items
  const renderNavItems = () => {
    return items.map((item) => {
      if (item.submenu) {
        const isOpen = openSubmenus[item.label] || false;
        const activeChild = hasActiveChild(item.submenu);

        return (
          <div key={item.label}>
            <button
              onClick={() => setOpenSubmenus({ ...openSubmenus, [item.label]: !isOpen })}
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '10px',
                padding: '11px 14px',
                color: activeChild ? 'var(--bg-primary)' : 'rgba(255, 255, 255, 0.7)',
                backgroundColor: activeChild ? 'rgba(var(--accent-rgb), 0.8)' : 'transparent',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <item.Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {isOpen && (
              <div style={{ marginLeft: '26px', marginTop: '4px', marginBottom: '8px' }}>
                {item.submenu.map((subItem: { href: string; label: string }) => {
                  const active = isActive(subItem.href);
                  return (
                    <Link
                      key={subItem.href}
                      to={subItem.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderRadius: '8px',
                        padding: '9px 12px',
                        textDecoration: 'none',
                        color: active ? 'var(--bg-primary)' : 'rgba(255, 255, 255, 0.6)',
                        backgroundColor: active ? `${'rgba(var(--accent-rgb), 0.8)'}80` : 'transparent',
                        transition: 'all 0.2s',
                        fontSize: '13px',
                        fontWeight: 400,
                        marginBottom: '2px',
                      }}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          backgroundColor: active ? 'var(--achievement)' : 'rgba(255, 255, 255, 0.25)',
                        }}
                      />
                      {subItem.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      } else {
        const active = isActive(item.href!);
        return (
          <Link
            key={item.href}
            to={item.href!}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderRadius: '10px',
              padding: '11px 14px',
              textDecoration: 'none',
              color: active ? 'var(--bg-primary)' : 'rgba(255, 255, 255, 0.7)',
              backgroundColor: active ? 'rgba(var(--accent-rgb), 0.8)' : 'transparent',
              transition: 'all 0.2s',
              fontSize: '14px',
              fontWeight: 500,
              position: 'relative',
            }}
          >
            <item.Icon size={18} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span
                style={{
                  minWidth: 18,
                  height: 18,
                  borderRadius: '9px',
                  backgroundColor: 'var(--error)',
                  color: 'var(--bg-primary)',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 5px',
                }}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      }
    });
  };

  // Render user section
  const renderUserSection = () => (
    <div style={{ padding: '12px' }}>
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              backgroundColor: 'var(--error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--bg-primary)',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            {(user?.firstName?.[0] || 'A').toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bg-primary)' }}>
              {user?.firstName || 'Admin'} {user?.lastName || ''}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
              Administrator
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backgroundColor: 'transparent',
            padding: '9px 12px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <LogOut size={14} />
          <span>Logg ut</span>
        </button>
      </div>
    </div>
  );

  // Mobile view
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '56px',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            zIndex: 1000,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color={'var(--achievement)'} />
            <span style={{ color: 'var(--bg-primary)', fontWeight: 600, fontSize: '15px' }}>Admin</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--bg-primary)',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998,
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          style={{
            position: 'fixed',
            top: '56px',
            left: 0,
            bottom: 0,
            width: '280px',
            backgroundColor: 'var(--accent)',
            color: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
            zIndex: 999,
            overflowY: 'auto',
          }}
        >
          {renderSystemStatus()}
          <div style={{ padding: '0 12px', flex: 1 }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {renderNavItems()}
            </nav>
          </div>
          {renderUserSection()}
        </aside>
      </>
    );
  }

  // Desktop view
  return (
    <aside
      style={{
        width: '260px',
        height: '100vh',
        backgroundColor: 'rgb(var(--tier-primary, 10 37 64))',
        color: 'rgb(var(--tier-white))',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo / Header */}
      <div
        style={{
          padding: '18px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Link
          to="/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              backgroundColor: `${'var(--achievement)'}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={20} color={'var(--achievement)'} />
          </div>
          <div>
            <div style={{ color: 'var(--bg-primary)', fontWeight: 600, fontSize: '15px' }}>
              Admin Portal
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '11px' }}>
              TIER Golf
            </div>
          </div>
        </Link>
      </div>

      {/* System Status */}
      {renderSystemStatus()}

      {/* Navigation */}
      <div style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {renderNavItems()}
        </nav>
      </div>

      {/* Divider */}
      <div
        style={{
          margin: '8px 16px',
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        }}
      />

      {/* User Section */}
      {renderUserSection()}
    </aside>
  );
}
