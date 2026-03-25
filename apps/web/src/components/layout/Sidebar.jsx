/**
 * Sidebar Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog from '../ui/ConfirmDialog';
import { AKLogo } from '../branding/AKLogo';
import { navigationConfig } from '../../config/navigation';
import { useNotifications } from '../../hooks/useNotifications';

// Design token values (hex for inline styles)
const tokenColors = {
  primary: '#10456A',
  primaryLight: '#2C5F7F',
  white: 'rgb(var(--tier-white))',
  ivory: '#FAF9F7',
  error: '#C45B4E',
};

const { LogOut, ChevronDown, ChevronRight, Menu, X } = LucideIcons;

// Helper function to get icon from string
const getIcon = (iconName) => {
  return LucideIcons[iconName] || LucideIcons.Circle;
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications({ polling: true });
  const pathname = location.pathname;
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Filter navigation items based on user role
  const items = useMemo(() => {
    const userRole = user?.role || 'player';
    return navigationConfig.filter(item => {
      if (!item.roles) return true; // Show for all if no role is specified
      return item.roles.includes(userRole);
    }).map(item => ({
      ...item,
      Icon: getIcon(item.icon),
    }));
  }, [user?.role]);

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Mobile header with hamburger menu
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div style={{
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
        }}>
          <Link
            to="/"
            aria-label="Go to Overview"
            style={{
              display: 'inline-block',
              padding: '4px',
              borderRadius: '8px',
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
            <AKLogo size={36} color={tokenColors.white} />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: tokenColors.white,
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
            }}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
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

        {/* Mobile Slide-out Menu */}
        <aside style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          bottom: 0,
          width: '280px',
          backgroundColor: tokenColors.primary,
          color: tokenColors.white,
          display: 'flex',
          flexDirection: 'column',
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 999,
          overflowY: 'auto',
        }}>
          <div style={{ padding: '16px 12px', flex: 1 }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} aria-label="Main navigation">
              {renderNavItems()}
            </nav>
          </div>
          {renderUserSection()}
        </aside>

        {/* Logout Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          title="Log out"
          message="Are you sure you want to log out of TIER Golf?"
          confirmLabel="Log out"
          cancelLabel="Cancel"
          variant="warning"
        />
      </>
    );
  }

  // Helper function to render nav items (used in both mobile and desktop)
  function renderNavItems() {
    return items.map((item) => {
      if (item.submenu) {
        const isOpen = openSubmenus[item.label] || false;
        const hasActiveChild = item.submenu.some(sub => pathname === sub.href);

        return (
          <div key={item.label}>
            <button
              onClick={() => setOpenSubmenus({...openSubmenus, [item.label]: !isOpen})}
              aria-expanded={isOpen}
              aria-controls={`submenu-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              aria-label={`${item.label} submenu`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderRadius: '16px',
                padding: '12px 16px',
                textDecoration: 'none',
                color: hasActiveChild ? tokenColors.white : 'rgba(255, 255, 255, 0.75)',
                backgroundColor: hasActiveChild ? tokenColors.primaryLight : 'transparent',
                transition: 'all 0.2s',
                fontSize: '15px',
                fontWeight: 500,
                userSelect: 'none',
                outline: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!hasActiveChild) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = tokenColors.white;
                }
              }}
              onMouseLeave={(e) => {
                if (!hasActiveChild) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                }
              }}
            >
              <item.Icon size={20} style={{ color: hasActiveChild ? tokenColors.white : 'rgba(255, 255, 255, 0.75)' }} />
              <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.label}
                {item.badge === 'unreadMessages' && unreadCount > 0 && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 5px',
                    backgroundColor: tokenColors.error,
                    color: tokenColors.white,
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '9px',
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </span>
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isOpen && (
              <div
                id={`submenu-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                style={{
                  marginLeft: '8px',
                  marginRight: '8px',
                  marginTop: '8px',
                  marginBottom: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
                role="menu"
              >
                {item.submenu.map(subItem => {
                  const active = pathname === subItem.href;
                  const SubIcon = subItem.icon ? getIcon(subItem.icon) : null;
                  return (
                    <Link
                      key={subItem.href}
                      to={subItem.href}
                      role="menuitem"
                      aria-current={active ? 'page' : undefined}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        borderRadius: '12px',
                        padding: '12px 8px',
                        textDecoration: 'none',
                        color: active ? tokenColors.white : 'rgba(255, 255, 255, 0.75)',
                        backgroundColor: active ? tokenColors.primaryLight : 'rgba(255, 255, 255, 0.06)',
                        border: active ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                        transition: 'all 0.2s',
                        fontSize: '12px',
                        fontWeight: 500,
                        textAlign: 'center',
                        minHeight: '60px',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.color = tokenColors.white;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                        }
                      }}
                    >
                      {SubIcon && <SubIcon size={18} style={{ opacity: 0.85 }} />}
                      <span style={{ lineHeight: '1.2' }}>{subItem.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      } else {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            aria-current={active ? 'page' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderRadius: '16px',
              padding: '12px 16px',
              textDecoration: 'none',
              color: active ? tokenColors.white : 'rgba(255, 255, 255, 0.75)',
              backgroundColor: active ? tokenColors.primaryLight : 'transparent',
              transition: 'all 0.2s',
              fontSize: '15px',
              fontWeight: 500,
            }}
          >
            <item.Icon size={20} style={{ color: active ? tokenColors.white : 'rgba(255, 255, 255, 0.75)' }} />
            <span style={{ flex: 1 }}>{item.label}</span>
          </Link>
        );
      }
    });
  }

  // Helper function to render user section
  function renderUserSection() {
    return (
      <div style={{ padding: '0 16px 24px' }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          borderRadius: '16px',
          padding: '16px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: tokenColors.white }}>
            {user?.firstName || 'Jørn'} {user?.lastName || 'Johnsen'}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.55)', marginTop: '2px' }}>
            {user?.email || 'jorn@akgolf.no'}
          </div>
          <button
            style={{
              marginTop: '12px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              backgroundColor: 'transparent',
              padding: '10px 12px',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.75)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => setShowLogoutConfirm(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = tokenColors.white;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
            }}
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <>
      <aside style={{
        width: '280px',
        height: '100vh',
        backgroundColor: tokenColors.primary,
        color: tokenColors.white,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Link
            to="/"
            aria-label="Go to Overview"
            style={{
              display: 'inline-block',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              textDecoration: 'none',
              borderRadius: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <AKLogo size={44} color={tokenColors.ivory} />
          </Link>
        </div>

        <div style={{
          padding: '0 12px',
          flex: 1,
          overflowY: 'auto'
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} aria-label="Main navigation">
            {renderNavItems()}
          </nav>
          <div style={{
            margin: '20px 0',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.10)'
          }} />
        </div>

        {renderUserSection()}
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Log out"
        message="Are you sure you want to log out of TIER Golf?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        variant="warning"
      />
    </>
  );
}
