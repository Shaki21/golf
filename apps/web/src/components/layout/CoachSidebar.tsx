/**
 * TIER Golf - Coach Sidebar
 * Design System v3.0 - Premium Light
 *
 * Sidebar navigation for coaches.
 * Role-based navigation using coachNavigationConfig.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { coachNavigationConfig, coachQuickActions, type NavItem } from '../../config/coach-navigation';
import { TIERGolfFullLogo } from '../branding/TIERGolfFullLogo';
import { loadSidebarState, saveSidebarState } from '../../utils/sidebar-state';

const { LogOut, ChevronDown, ChevronRight, Menu, X } = LucideIcons;

// Helper to get icon from string name
const getIcon = (iconName: string) => {
  return (LucideIcons as any)[iconName] || LucideIcons.Circle;
};

interface CoachSidebarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  unreadAlerts?: number;
  onLogout?: () => void;
  isMobileOverlay?: boolean;
}

export default function CoachSidebar({ user, unreadAlerts = 0, onLogout, isMobileOverlay = false }: CoachSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Load initial sidebar state from sessionStorage to preserve menu state across navigation
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(() => loadSidebarState());

  // Map navigation items with icons
  const items = useMemo(() => {
    return coachNavigationConfig.map(item => ({
      ...item,
      Icon: getIcon(item.icon),
      // Replace dynamic badge values
      badge: item.badge === 'unreadCount' && unreadAlerts > 0 ? String(unreadAlerts) : undefined,
    }));
  }, [unreadAlerts]);

  // Quick actions with icons
  const quickActions = useMemo(() => {
    return coachQuickActions.map(action => ({
      ...action,
      Icon: getIcon(action.icon),
    }));
  }, []);

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

  // Check if a path is active
  const isActive = (href: string) => pathname === href;
  const hasActiveChild = (submenu: Array<{ href: string }>) =>
    submenu.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'));

  // Render navigation items
  const renderNavItems = () => {
    return items
      .filter(item => !item.hideFromSidebar) // Filter out items hidden from sidebar
      .map((item) => {
      if (item.submenu) {
        const isOpen = openSubmenus[item.labelNO] || false;
        const activeChild = hasActiveChild(item.submenu);

        return (
          <div key={item.labelNO}>
            <button
              onClick={() => {
                const newState = { ...openSubmenus, [item.labelNO]: !isOpen };
                setOpenSubmenus(newState);
                saveSidebarState(newState);
              }}
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '12px',
                padding: '12px 16px',
                color: activeChild ? 'rgb(var(--tier-white))' : 'rgba(255, 255, 255, 0.75)',
                backgroundColor: activeChild ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                transition: 'all 0.2s',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <item.Icon size={20} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.labelNO}</span>
              {isOpen ? <ChevronDown size={16} style={{ flexShrink: 0 }} /> : <ChevronRight size={16} style={{ flexShrink: 0 }} />}
            </button>

            {isOpen && (
              <div style={{
                marginLeft: '8px',
                marginRight: '8px',
                marginTop: '8px',
                marginBottom: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
              }}>
                {item.submenu.map((subItem) => {
                  const active = isActive(subItem.href);
                  const SubIcon = subItem.icon ? getIcon(subItem.icon) : null;
                  return (
                    <Link
                      key={subItem.href}
                      to={subItem.href}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        borderRadius: '12px',
                        padding: '12px 8px',
                        textDecoration: 'none',
                        color: active ? 'rgb(var(--tier-white))' : 'rgba(255, 255, 255, 0.75)',
                        backgroundColor: active ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                        border: active ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.2s',
                        fontSize: '12px',
                        fontWeight: 500,
                        textAlign: 'center',
                        minHeight: '60px',
                      }}
                    >
                      {SubIcon && <SubIcon size={18} style={{ opacity: 0.85 }} />}
                      <span style={{ lineHeight: '1.2' }}>{subItem.labelNO || subItem.label}</span>
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
              borderRadius: '12px',
              padding: '12px 16px',
              textDecoration: 'none',
              color: active ? 'rgb(var(--tier-white))' : 'rgba(255, 255, 255, 0.75)',
              backgroundColor: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              transition: 'all 0.2s',
              fontSize: '15px',
              fontWeight: 600,
              position: 'relative',
            }}
          >
            <item.Icon size={20} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{item.labelNO}</span>
            {item.badge && (
              <span
                style={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: '10px',
                  backgroundColor: 'var(--error)',
                  color: 'var(--bg-primary)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
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

  // Render quick actions
  const renderQuickActions = () => (
    <div style={{ padding: '0 12px 16px', display: 'flex', gap: '8px' }}>
      {quickActions.map((action) => (
        <Link
          key={action.label}
          to={action.href || '#'}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 12px',
            borderRadius: '10px',
            textDecoration: 'none',
            backgroundColor: action.variant === 'primary' ? 'var(--achievement)' : 'rgba(255, 255, 255, 0.1)',
            color: action.variant === 'primary' ? 'var(--text-primary)' : 'rgba(255, 255, 255, 0.9)',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          <action.Icon size={16} />
          {action.label}
        </Link>
      ))}
    </div>
  );

  // Render user section
  const renderUserSection = () => (
    <div style={{ padding: '16px' }}>
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              backgroundColor: 'var(--achievement)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            {(user?.firstName?.[0] || 'T').toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.95)' }}>
              {user?.firstName || 'Trener'} {user?.lastName || ''}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.55)' }}>
              Coach
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
            gap: '8px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: 'transparent',
            padding: '10px 12px',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.75)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <LogOut size={16} />
          <span>Logg ut</span>
        </button>
      </div>
    </div>
  );

  // Mobile overlay view (used by CoachAppShell's mobile menu)
  if (isMobileOverlay) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          color: 'var(--bg-primary)',
        }}
      >
        {renderQuickActions()}
        <div style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {renderNavItems()}
          </nav>
        </div>
        {renderUserSection()}
      </div>
    );
  }

  // Legacy mobile view (kept for backwards compatibility but no longer used)
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
            height: '60px',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            zIndex: 1000,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: 'var(--achievement)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                color: 'var(--text-primary)',
              }}
            >
              AK
            </div>
            <span style={{ color: 'var(--bg-primary)', fontWeight: 600 }}>Coach Portal</span>
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
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
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
            top: '60px',
            left: 0,
            bottom: 0,
            width: '300px',
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
          {renderQuickActions()}
          <div style={{ padding: '0 12px', flex: 1 }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
        width: '280px',
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
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Link
          to="/coach"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          <TIERGolfFullLogo height={36} variant="light" />
        </Link>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '16px 12px 8px' }}>
        {renderQuickActions()}
      </div>

      {/* Navigation */}
      <div style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {renderNavItems()}
        </nav>
      </div>

      {/* Divider */}
      <div
        style={{
          margin: '8px 16px',
          height: '1px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        }}
      />

      {/* User Section */}
      {renderUserSection()}
    </aside>
  );
}
