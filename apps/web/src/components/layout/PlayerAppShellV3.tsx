/**
 * ============================================================
 * PlayerAppShellV3 - Color-coded 5-area layout
 * TIER Golf Design System v3.0
 * ============================================================
 *
 * Responsive layout with:
 * - Desktop: Sidebar (280px) with color-coded areas
 * - Mobile: Bottom navigation (64px) with 5 icons
 *
 * Areas:
 * 1. Dashboard (default/brand green)
 * 2. Training (green)
 * 3. My Development (blue)
 * 4. Plan (amber)
 * 5. More (purple)
 *
 * ============================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { playerNavigationV3, getAreaByPath, bottomNavItems } from '../../config/player-navigation-v3';
import { navigationColors, sidebarConfig, bottomNavConfig } from '../../config/navigation-tokens';
import { TIERGolfFullLogo } from '../branding/TIERGolfFullLogo';
import { useAuth } from '../../contexts/AuthContext';
import BackToTop from '../ui/BackToTop';

const { LogOut, ChevronDown, ChevronRight, Menu, X } = LucideIcons;

// Helper to get icon from string name
const getIcon = (iconName: string): React.ComponentType<{ size?: number }> => {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>;
  return icons[iconName] || LucideIcons.Circle;
};

interface PlayerAppShellV3Props {
  children: React.ReactNode;
}

export default function PlayerAppShellV3({ children }: PlayerAppShellV3Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const pathname = location.pathname;

  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Get current area based on path
  const currentArea = useMemo(() => getAreaByPath(pathname), [pathname]);
  const currentColors = currentArea
    ? navigationColors[currentArea.id as keyof typeof navigationColors] || navigationColors.dashboard
    : navigationColors.dashboard;

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < sidebarConfig.breakpoints.mobile);
      if (window.innerWidth >= sidebarConfig.breakpoints.mobile) {
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

  // Fetch unread messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/v1/notifications?unread=true', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadMessages(data.data?.notifications?.length || 0);
        }
      } catch {
        // Silent fail
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-expand active section
  useEffect(() => {
    if (currentArea?.sections) {
      setOpenSubmenus(prev => ({ ...prev, [currentArea.id]: true }));
    }
  }, [currentArea]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const toggleSubmenu = (areaId: string) => {
    setOpenSubmenus(prev => ({ ...prev, [areaId]: !prev[areaId] }));
  };

  // Render sidebar area items
  const renderSidebarAreas = () => {
    return playerNavigationV3.map((area) => {
      const AreaIcon = getIcon(area.icon);
      const areaColors = navigationColors[area.id as keyof typeof navigationColors] || navigationColors.dashboard;
      const isAreaActive = currentArea?.id === area.id;
      const isOpen = openSubmenus[area.id] || false;

      return (
        <div key={area.id} style={{ marginBottom: '4px' }}>
          {/* Area Header */}
          <button
            onClick={() => {
              if (area.sections && area.sections.length > 0) {
                toggleSubmenu(area.id);
              } else {
                navigate(area.hubPath);
              }
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderRadius: '12px',
              padding: '12px 16px',
              color: isAreaActive ? 'rgb(var(--tier-white))' : 'rgba(255, 255, 255, 0.75)',
              backgroundColor: isAreaActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              transition: 'all 0.2s',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: isAreaActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AreaIcon size={18} />
            </span>
            <span style={{ flex: 1 }}>{area.label}</span>
            {area.badge && unreadMessages > 0 && (
              <span
                style={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: '10px',
                  backgroundColor: 'rgb(var(--status-error))',
                  color: 'rgb(var(--tier-white))',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
                }}
              >
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </span>
            )}
            {area.sections && area.sections.length > 0 && (
              isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
          </button>

          {/* Submenu */}
          {isOpen && area.sections && (
            <div style={{ marginLeft: '24px', marginTop: '4px' }}>
              {area.sections.map((section) => (
                <div key={section.id} style={{ marginBottom: '8px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.45)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      padding: '8px 12px 4px',
                    }}
                  >
                    {section.label}
                  </div>
                  {section.items.map((item) => {
                    const ItemIcon = item.icon ? getIcon(item.icon) : null;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          textDecoration: 'none',
                          color: active ? 'rgb(var(--tier-white))' : 'rgba(255, 255, 255, 0.65)',
                          backgroundColor: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          transition: 'all 0.2s',
                          fontSize: '14px',
                          fontWeight: active ? 500 : 400,
                          marginBottom: '2px',
                        }}
                      >
                        {ItemIcon && <ItemIcon size={16} />}
                        <span style={{ flex: 1 }}>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  // Render bottom navigation (mobile)
  const renderBottomNav = () => (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: bottomNavConfig.height,
        backgroundColor: 'var(--tier-primary, #1A3D2E)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        zIndex: 1000,
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {bottomNavItems.map((item) => {
        const Icon = getIcon(item.icon);
        const isActive = currentArea?.id === item.id;
        const itemColors = navigationColors[item.id as keyof typeof navigationColors] || navigationColors.dashboard;

        return (
          <Link
            key={item.id}
            to={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '8px 12px',
              textDecoration: 'none',
              color: isActive ? itemColors.light : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s',
              transform: isActive ? `scale(${bottomNavConfig.activeScale})` : 'scale(1)',
              position: 'relative',
            }}
          >
            <span
              style={{
                width: 40,
                height: 32,
                borderRadius: '16px',
                backgroundColor: isActive ? `${itemColors.primary}30` : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Icon size={bottomNavConfig.iconSize} />
              {item.badge && unreadMessages > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: 2,
                    minWidth: 16,
                    height: 16,
                    borderRadius: '8px',
                    backgroundColor: 'rgb(var(--status-error))',
                    color: 'rgb(var(--tier-white))',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {unreadMessages > 9 ? '9+' : unreadMessages}
                </span>
              )}
            </span>
            <span
              style={{
                fontSize: bottomNavConfig.labelSize,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  // User section
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
              backgroundColor: currentColors.accent || '#B8860B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--tier-primary, #1A3D2E)',
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            {`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgb(var(--tier-white))' }}>
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

  // Mobile view
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'rgb(var(--tier-surface-page, 245 247 249))' }}>
        {/* Mobile Header */}
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            backgroundColor: currentColors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            zIndex: 1000,
          }}
        >
          <Link
            to="/dashboard"
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <TIERGolfFullLogo height={32} variant="light" />
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgb(var(--tier-white))',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 998,
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside
              style={{
                position: 'fixed',
                top: '60px',
                left: 0,
                bottom: bottomNavConfig.height,
                width: '300px',
                backgroundColor: 'var(--tier-primary, #1A3D2E)',
                color: 'rgb(var(--tier-white))',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 999,
                overflowY: 'auto',
              }}
            >
              <div style={{ padding: '16px 12px', flex: 1 }}>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {renderSidebarAreas()}
                </nav>
              </div>
              {renderUserSection()}
            </aside>
          </>
        )}

        {/* Main Content */}
        <main
          style={{
            paddingTop: '60px',
            paddingBottom: bottomNavConfig.height + 16,
            minHeight: '100vh',
          }}
        >
          <div style={{ padding: '16px' }}>
            {children}
          </div>
        </main>

        {/* Bottom Navigation */}
        {renderBottomNav()}

        <BackToTop />
      </div>
    );
  }

  // Desktop view
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'rgb(var(--tier-surface-page, 245 247 249))' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarConfig.width.expanded,
          height: '100vh',
          backgroundColor: 'rgb(var(--tier-primary, 10 37 64))',
          color: 'rgb(var(--tier-white))',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '20px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <TIERGolfFullLogo height={36} variant="light" />
          </Link>
        </div>

        {/* Navigation */}
        <div style={{ padding: '16px 12px', flex: 1 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {renderSidebarAreas()}
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

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            height: '100vh',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              width: '100%',
              padding: '24px 32px',
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
