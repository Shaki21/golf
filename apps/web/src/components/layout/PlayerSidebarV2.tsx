/**
 * ============================================================
 * PlayerSidebarV2 - Simplified 5-mode sidebar
 * TIER Golf Design System v3.0
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 * ============================================================
 *
 * New sidebar with only 5 top-level options:
 * 1. Home
 * 2. Train
 * 3. Plan
 * 4. Analyze
 * 5. Collaborate
 *
 * Changes from V1:
 * - Reduced from 13 to 5 top-level items
 * - Settings moved to ProfileDropdown
 * - SVG logo integrated (AKLogo)
 * - Cleaner visual hierarchy
 *
 * ============================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { playerNavigationV2, playerQuickActionsV2 } from '../../config/player-navigation-v2';
import { AKLogo } from '../branding/AKLogo';

// Design token values (hex for inline styles)
const tokenColors = {
  primary: '#10456A',
  white: 'rgb(var(--tier-white))',
  gold: 'rgb(var(--tier-gold))',
  ink: '#1C1C1E',
  error: '#C45B4E',
};

const { LogOut, ChevronDown, ChevronRight, Menu, X } = LucideIcons;

// Helper to get icon from string name
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getIcon = (iconName: string): React.ComponentType<any> => {
  return (LucideIcons as any)[iconName] || LucideIcons.Circle;
};

interface PlayerSidebarV2Props {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  unreadMessages?: number;
  hasSchoolAccess?: boolean;
  onLogout?: () => void;
}

export default function PlayerSidebarV2({
  user,
  unreadMessages = 0,
  hasSchoolAccess = false,
  onLogout,
}: PlayerSidebarV2Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  // Map navigation items with icons and badges
  const items = useMemo(() => {
    return playerNavigationV2.map(item => ({
      ...item,
      Icon: getIcon(item.icon),
      badgeValue: item.badge === 'unreadMessages' && unreadMessages > 0
        ? (unreadMessages > 99 ? '99+' : String(unreadMessages))
        : undefined,
      // Add school submenu item if user has access
      submenu: item.id === 'samhandle' && hasSchoolAccess
        ? [...(item.submenu || []), { href: '/samhandle/skole', label: 'Skole', icon: 'GraduationCap' }]
        : item.submenu,
    }));
  }, [unreadMessages, hasSchoolAccess]);

  // Quick actions with icons
  const quickActions = useMemo(() => {
    return playerQuickActionsV2.map(action => ({
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

  // Auto-expand active section
  useEffect(() => {
    items.forEach(item => {
      if (item.submenu) {
        const hasActiveChild = item.submenu.some(
          sub => pathname === sub.href || pathname.startsWith(sub.href + '/')
        );
        if (hasActiveChild && !openSubmenus[item.id]) {
          setOpenSubmenus(prev => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [pathname, items]);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    navigate('/login');
  };

  // Check if a path is active
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const hasActiveChild = (submenu: Array<{ href: string }>) =>
    submenu.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'));

  // Toggle submenu
  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Render navigation items
  const renderNavItems = () => {
    return items.map((item) => {
      if (item.submenu) {
        const isOpen = openSubmenus[item.id] || false;
        const activeChild = hasActiveChild(item.submenu);

        return (
          <div key={item.id}>
            <button
              onClick={() => toggleSubmenu(item.id)}
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '12px',
                padding: '12px 16px',
                color: activeChild ? tokenColors.white : 'rgba(255, 255, 255, 0.75)',
                backgroundColor: activeChild ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                transition: 'all 0.2s',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <item.Icon size={20} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badgeValue && (
                <span
                  style={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: '10px',
                    backgroundColor: tokenColors.error,
                    color: tokenColors.white,
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 6px',
                    marginRight: '4px',
                  }}
                >
                  {item.badgeValue}
                </span>
              )}
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isOpen && (
              <div style={{ marginLeft: '20px', marginTop: '4px', marginBottom: '8px' }}>
                {item.submenu.map((subItem) => {
                  const SubIcon = subItem.icon ? getIcon(subItem.icon) : null;
                  const active = isActive(subItem.href);
                  return (
                    <Link
                      key={subItem.href}
                      to={subItem.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        textDecoration: 'none',
                        color: active ? tokenColors.white : 'rgba(255, 255, 255, 0.65)',
                        backgroundColor: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        transition: 'all 0.2s',
                        fontSize: '14px',
                        fontWeight: active ? 500 : 400,
                        marginBottom: '2px',
                      }}
                    >
                      {SubIcon ? (
                        <SubIcon size={16} />
                      ) : (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: active ? tokenColors.gold : 'rgba(255, 255, 255, 0.3)',
                          }}
                        />
                      )}
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
            key={item.id}
            to={item.href!}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderRadius: '12px',
              padding: '12px 16px',
              textDecoration: 'none',
              color: active ? tokenColors.white : 'rgba(255, 255, 255, 0.75)',
              backgroundColor: active ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              transition: 'all 0.2s',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            <item.Icon size={20} />
            <span style={{ flex: 1 }}>{item.label}</span>
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
            backgroundColor: action.variant === 'primary' ? tokenColors.gold : 'rgba(255, 255, 255, 0.1)',
            color: action.variant === 'primary' ? tokenColors.ink : 'rgba(255, 255, 255, 0.9)',
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

  // Render user section (simplified - no settings, just logout)
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
              backgroundColor: tokenColors.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokenColors.ink,
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            {`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: tokenColors.white }}>
              {user?.firstName || 'Player'} {user?.lastName || ''}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.55)' }}>
              {user?.email || 'Player'}
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
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  // Render logo
  const renderLogo = () => (
    <Link
      to="/hjem"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
      }}
      aria-label="Go to Home"
    >
      <img
        src="/assets/tier-golf/tier-golf-icon.svg"
        alt="TIER Golf"
        style={{ width: '40px', height: '40px' }}
      />
      <div>
        <div style={{ color: tokenColors.white, fontWeight: 600, fontSize: '16px' }}>
          TIER Golf
        </div>
      </div>
    </Link>
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
            height: '60px',
            backgroundColor: tokenColors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            zIndex: 1000,
          }}
        >
          <Link
            to="/hjem"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
            aria-label="Go to Home"
          >
            <img
              src="/assets/tier-golf/tier-golf-icon.svg"
              alt="TIER Golf"
              style={{ width: '32px', height: '32px' }}
            />
            <span style={{ color: tokenColors.white, fontWeight: 600, fontSize: '16px' }}>
              TIER Golf
            </span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: tokenColors.white,
              cursor: 'pointer',
              padding: '8px',
            }}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
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
            backgroundColor: tokenColors.primary,
            color: tokenColors.white,
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
        backgroundColor: tokenColors.primary,
        color: tokenColors.white,
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
        {renderLogo()}
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
