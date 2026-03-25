/**
 * SideNavigationMobile
 *
 * Mobile navigation with header bar and off-canvas drawer.
 * Same information architecture as desktop, presented as drawer.
 *
 * Visible on: < 1024px
 * Structure: Fixed header (60px) + drawer (280px, slides from left)
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useNavigation } from './NavigationContext';
import { navigationSections } from './navigationData';
import { useAuth } from '../../contexts/AuthContext';
import { AKLogo } from '../branding/AKLogo';
import './SideNavigationMobile.css';

const { Menu, X, ChevronDown, ChevronRight, LogOut, Settings, User } = LucideIcons;

const getIcon = (iconName) => {
  return LucideIcons[iconName] || LucideIcons.Circle;
};

export default function SideNavigationMobile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mobileOpen, toggleMobile, closeMobile, activeSection } = useNavigation();
  const [expandedSections, setExpandedSections] = useState({});

  // Close drawer on route change
  useEffect(() => {
    closeMobile();
    setExpandedSections({});
  }, [location.pathname, closeMobile]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const isItemActive = (href) => {
    const basePath = href.split('?')[0];
    return location.pathname === basePath || location.pathname.startsWith(basePath + '/');
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="mobile-header">
        <button
          type="button"
          className="mobile-header__menu"
          onClick={toggleMobile}
          aria-label={mobileOpen ? 'Lukk meny' : 'Apne meny'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/" className="mobile-header__logo" aria-label="Gå til Oversikt">
          <AKLogo size={28} />
        </Link>

        <Link to="/profil" className="mobile-header__avatar" aria-label="Min profil">
          <span>{user?.firstName?.[0] || 'U'}</span>
        </Link>
      </header>

      {/* Overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'mobile-overlay--open' : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        className={`mobile-drawer ${mobileOpen ? 'mobile-drawer--open' : ''}`}
        aria-label="Hovednavigasjon"
      >
        <div className="mobile-drawer__content">
          {/* Navigation Sections */}
          <div className="mobile-drawer__sections">
            {navigationSections.map((section) => {
              const Icon = getIcon(section.icon);
              const isActive = activeSection === section.id;
              const isExpanded = expandedSections[section.id];
              const hasItems = section.items && section.items.length > 0;

              // Direct link for sections without subsections
              if (!hasItems && section.href) {
                return (
                  <Link
                    key={section.id}
                    to={section.href}
                    className={`mobile-drawer__item ${isActive ? 'mobile-drawer__item--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={20} strokeWidth={1.5} className="mobile-drawer__icon" />
                    <span className="mobile-drawer__label">{section.label}</span>
                  </Link>
                );
              }

              // Expandable section
              return (
                <div key={section.id} className="mobile-drawer__section">
                  <button
                    type="button"
                    className={`mobile-drawer__item mobile-drawer__item--expandable ${isActive ? 'mobile-drawer__item--active' : ''}`}
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={isExpanded}
                  >
                    <Icon size={20} strokeWidth={1.5} className="mobile-drawer__icon" />
                    <span className="mobile-drawer__label">{section.label}</span>
                    {isExpanded ? (
                      <ChevronDown size={16} className="mobile-drawer__chevron" />
                    ) : (
                      <ChevronRight size={16} className="mobile-drawer__chevron" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mobile-drawer__subitems">
                      {section.items.map((item) => {
                        const itemActive = isItemActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={`mobile-drawer__subitem ${itemActive ? 'mobile-drawer__subitem--active' : ''}`}
                            aria-current={itemActive ? 'page' : undefined}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mobile-drawer__divider" />

          {/* User Section */}
          <div className="mobile-drawer__user">
            <div className="mobile-drawer__user-info">
              <div className="mobile-drawer__user-avatar">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="mobile-drawer__user-details">
                <span className="mobile-drawer__user-name">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="mobile-drawer__user-email">
                  {user?.email}
                </span>
              </div>
            </div>

            <div className="mobile-drawer__actions">
              <Link to="/profil" className="mobile-drawer__action">
                <User size={18} strokeWidth={1.5} />
                <span>Profil</span>
              </Link>
              <Link to="/innstillinger" className="mobile-drawer__action">
                <Settings size={18} strokeWidth={1.5} />
                <span>Innstillinger</span>
              </Link>
              <button
                type="button"
                className="mobile-drawer__action mobile-drawer__action--logout"
                onClick={handleLogout}
              >
                <LogOut size={18} strokeWidth={1.5} />
                <span>Logg ut</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
