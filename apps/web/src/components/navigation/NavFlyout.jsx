/**
 * NavFlyout
 *
 * Flyout panel that appears when a rail item with subsections is activated.
 * Contains section title, list of subsections, and user footer.
 *
 * Width: 240px
 * Position: Adjacent to rail (left: 64px)
 * Behavior: Opens on hover/click, closes on mouse leave or selection
 */
import React, { useRef, useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import { useNavigation } from './NavigationContext';
import { getSectionById } from './navigationData';
import { useAuth } from '../../contexts/AuthContext';
import { SectionTitle } from '../typography';
import './NavFlyout.css';

export default function NavFlyout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { flyoutOpen, hoveredSection, closeFlyout } = useNavigation();
  const flyoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const section = hoveredSection ? getSectionById(hoveredSection) : null;

  const handleMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      closeFlyout();
    }, 150);
  }, [closeFlyout]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && flyoutOpen) {
        closeFlyout();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [flyoutOpen, closeFlyout]);

  if (!flyoutOpen || !section) {
    return null;
  }

  const isItemActive = (href) => {
    const basePath = href.split('?')[0];
    return location.pathname === basePath || location.pathname.startsWith(basePath + '/');
  };

  return (
    <div
      ref={flyoutRef}
      className="nav-flyout"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="menu"
      aria-label={`${section.label} undermeny`}
    >
      {/* Section Header */}
      <div className="nav-flyout__header">
        <SectionTitle className="nav-flyout__title">{section.label}</SectionTitle>
      </div>

      {/* Section Items */}
      <div className="nav-flyout__content">
        <ul className="nav-flyout__list">
          {section.items?.map((item) => {
            const active = isItemActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`nav-flyout__item ${active ? 'nav-flyout__item--active' : ''}`}
                  role="menuitem"
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Divider */}
      <div className="nav-flyout__divider" />

      {/* User Footer */}
      <div className="nav-flyout__footer">
        <div className="nav-flyout__user">
          <div className="nav-flyout__user-avatar">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="nav-flyout__user-info">
            <span className="nav-flyout__user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="nav-flyout__user-email">
              {user?.email}
            </span>
          </div>
        </div>

        <div className="nav-flyout__actions">
          <Link to="/profil" className="nav-flyout__action">
            <User size={16} strokeWidth={1.5} />
            <span>Profil</span>
          </Link>
          <Link to="/innstillinger" className="nav-flyout__action">
            <Settings size={16} strokeWidth={1.5} />
            <span>Innstillinger</span>
          </Link>
          <button
            type="button"
            className="nav-flyout__action nav-flyout__action--logout"
            onClick={handleLogout}
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span>Logg ut</span>
          </button>
        </div>
      </div>
    </div>
  );
}
