/**
 * SideNavigationDesktop
 *
 * Composite component combining NavRail and NavFlyout for desktop navigation.
 * Handles the interaction between rail and flyout panels.
 *
 * Visible on: >= 1024px (desktop only)
 * Structure: Fixed rail (64px) + flyout panel (240px on demand)
 */
import React, { useRef, useCallback } from 'react';
import NavRail from './NavRail';
import NavFlyout from './NavFlyout';
import { useNavigation } from './NavigationContext';
import './SideNavigationDesktop.css';

export default function SideNavigationDesktop() {
  const { closeFlyout } = useNavigation();
  const containerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const handleContainerMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      closeFlyout();
    }, 200);
  }, [closeFlyout]);

  const handleContainerMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="side-navigation-desktop"
      onMouseLeave={handleContainerMouseLeave}
      onMouseEnter={handleContainerMouseEnter}
    >
      <NavRail />
      <NavFlyout />
    </div>
  );
}
