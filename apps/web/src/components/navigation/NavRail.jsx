/**
 * NavRail
 *
 * Persistent left rail navigation (always visible on desktop).
 * Contains icon-only navigation items with optional labels.
 * Provides constant context: "where am I now"
 *
 * Width: 64px
 * Background: --background-white
 * Border: subtle right border
 */
import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useNavigation } from './NavigationContext';
import { navigationSections } from './navigationData';
import { AKLogo } from '../branding/AKLogo';
import './NavRail.css';

const getIcon = (iconName) => {
  return LucideIcons[iconName] || LucideIcons.Circle;
};

export default function NavRail({ onItemHover, onItemClick }) {
  const { activeSection, hoveredSection, openFlyout, closeFlyout } = useNavigation();
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = useCallback((sectionId, hasItems) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hasItems) {
      hoverTimeoutRef.current = setTimeout(() => {
        openFlyout(sectionId);
        onItemHover?.(sectionId);
      }, 150);
    }
  }, [openFlyout, onItemHover]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  }, []);

  const handleClick = useCallback((sectionId, hasItems, href) => {
    if (hasItems) {
      openFlyout(sectionId);
      onItemClick?.(sectionId);
    }
  }, [openFlyout, onItemClick]);

  return (
    <nav className="nav-rail" aria-label="Hovednavigasjon">
      {/* Logo */}
      <div className="nav-rail__logo">
        <Link to="/" aria-label="Gå til Oversikt" className="nav-rail__logo-link">
          <AKLogo size={32} />
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="nav-rail__items">
        {navigationSections.map((section) => {
          const Icon = getIcon(section.icon);
          const isActive = activeSection === section.id;
          const isHovered = hoveredSection === section.id;
          const hasItems = section.items && section.items.length > 0;

          // Direct link for sections without subsections
          if (!hasItems && section.href) {
            return (
              <Link
                key={section.id}
                to={section.href}
                className={`nav-rail__item ${isActive ? 'nav-rail__item--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                title={section.label}
              >
                <span className="nav-rail__indicator" />
                <Icon size={20} strokeWidth={1.5} className="nav-rail__icon" />
              </Link>
            );
          }

          // Button for sections with subsections (opens flyout)
          return (
            <button
              key={section.id}
              type="button"
              className={`nav-rail__item ${isActive ? 'nav-rail__item--active' : ''} ${isHovered ? 'nav-rail__item--hovered' : ''}`}
              onMouseEnter={() => handleMouseEnter(section.id, hasItems)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(section.id, hasItems, section.href)}
              aria-expanded={isHovered}
              aria-haspopup="true"
              title={section.label}
            >
              <span className="nav-rail__indicator" />
              <Icon size={20} strokeWidth={1.5} className="nav-rail__icon" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
