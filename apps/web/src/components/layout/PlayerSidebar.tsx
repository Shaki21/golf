/**
 * TIER Golf - Player Sidebar
 * Design System v3.0 - Forest Green (Premium Light)
 *
 * Sidebar navigation for players.
 * Role-based navigation using navigationConfig.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { navigationConfig, playerQuickActions } from '../../config/navigation';

const { LogOut, ChevronDown, ChevronRight, Menu, X } = LucideIcons;

// Helper to get icon from string name
const getIcon = (iconName: string) => {
  return (LucideIcons as any)[iconName] || LucideIcons.Circle;
};

interface PlayerSidebarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  unreadMessages?: number;
  onLogout?: () => void;
}

export default function PlayerSidebar({ user, unreadMessages = 0, onLogout }: PlayerSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  // Map navigation items with icons
  const items = useMemo(() => {
    return navigationConfig.map(item => ({
      ...item,
      Icon: getIcon(item.icon),
      // Replace dynamic badge values
      badge: item.badge === 'unreadMessages' && unreadMessages > 0 ? String(unreadMessages) : undefined,
    }));
  }, [unreadMessages]);

  // Quick actions with icons
  const quickActions = useMemo(() => {
    return playerQuickActions.map(action => ({
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
                borderRadius: '12px',
                padding: '12px 16px',
                color: activeChild ? 'var(--bg-primary)' : 'rgba(255, 255, 255, 0.75)',
                backgroundColor: activeChild ? 'rgba(var(--accent-rgb), 0.8)' : 'transparent',
                transition: 'all 0.2s',
                fontSize: '15px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <item.Icon size={20} />
              <span style={{ flex: 1 }}>{item.label}</span>
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
                    marginRight: '8px',
                  }}
                >
                  {item.badge}
                </span>
              )}
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isOpen && (
              <div style={{ marginLeft: '28px', marginTop: '4px', marginBottom: '8px' }}>
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
                        padding: '10px 12px',
                        textDecoration: 'none',
                        color: active ? 'var(--bg-primary)' : 'rgba(255, 255, 255, 0.65)',
                        backgroundColor: active ? `${'rgba(var(--accent-rgb), 0.8)'}80` : 'transparent',
                        transition: 'all 0.2s',
                        fontSize: '14px',
                        fontWeight: 400,
                        marginBottom: '2px',
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: active ? 'var(--achievement)' : 'rgba(255, 255, 255, 0.3)',
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
              borderRadius: '12px',
              padding: '12px 16px',
              textDecoration: 'none',
              color: active ? 'var(--bg-primary)' : 'rgba(255, 255, 255, 0.75)',
              backgroundColor: active ? 'rgba(var(--accent-rgb), 0.8)' : 'transparent',
              transition: 'all 0.2s',
              fontSize: '15px',
              fontWeight: 500,
              position: 'relative',
            }}
          >
            <item.Icon size={20} />
            <span style={{ flex: 1 }}>{item.label}</span>
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
            {(user?.firstName?.[0] || 'S').toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--bg-primary)' }}>
              {user?.firstName || 'Player'} {user?.lastName || ''}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.55)' }}>
              Player
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
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            zIndex: 1000,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/assets/tier-golf/tier-golf-icon.svg"
              alt="TIER Golf"
              style={{ width: '32px', height: '32px' }}
            />
            <span style={{ color: 'var(--bg-primary)', fontWeight: 600 }}>TIER Golf</span>
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
        backgroundColor: 'var(--accent)',
        color: 'var(--bg-primary)',
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
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          <img
            src="/assets/tier-golf/tier-golf-icon.svg"
            alt="TIER Golf"
            style={{ width: '40px', height: '40px' }}
          />
          <div>
            <div style={{ color: 'var(--bg-primary)', fontWeight: 600, fontSize: '16px' }}>
              TIER Golf
            </div>
          </div>
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
