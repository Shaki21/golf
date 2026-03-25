/**
 * NavigationContext
 *
 * Central state management for the Left Rail + Flyout navigation system.
 * Manages active section, flyout visibility, and mobile drawer state.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(null);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);

  // Determine active section from current pathname
  // Updated to match player-navigation-v3.ts structure
  useEffect(() => {
    const path = location.pathname;

    // Map paths to sections (following player-navigation-v3.ts structure)
    if (path === '/' || path === '/dashboard') {
      setActiveSection('dashboard');
    } else if (path.startsWith('/trening') || path.startsWith('/ovelsesbibliotek')) {
      setActiveSection('trening');
    } else if (path.startsWith('/utvikling')) {
      setActiveSection('utvikling');
    } else if (path.startsWith('/plan')) {
      setActiveSection('plan');
    } else if (path.startsWith('/mer')) {
      setActiveSection('mer');
    } else if (path.startsWith('/coach')) {
      // Coach navigation
      if (path.startsWith('/coach/athletes')) {
        setActiveSection('athletes');
      } else if (path.startsWith('/coach/planning')) {
        setActiveSection('planning');
      } else if (path.startsWith('/coach/alerts')) {
        setActiveSection('alerts');
      } else if (path.startsWith('/coach/booking')) {
        setActiveSection('calendar');
      } else if (path.startsWith('/coach/messages')) {
        setActiveSection('messages');
      } else if (path.startsWith('/coach/exercises') || path.startsWith('/coach/training-system')) {
        setActiveSection('library');
      } else if (path.startsWith('/coach/stats')) {
        setActiveSection('insights');
      } else if (path.startsWith('/coach/tournaments')) {
        setActiveSection('tournaments');
      } else if (path.startsWith('/coach/groups') || path.startsWith('/coach/athlete-status') || path.startsWith('/coach/session-evaluations') || path.startsWith('/coach/modification-requests') || path.startsWith('/coach/samlinger') || path.startsWith('/coach/settings')) {
        setActiveSection('more');
      } else {
        setActiveSection('dashboard');
      }
    }
  }, [location.pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setFlyoutOpen(false);
  }, [location.pathname]);

  const openFlyout = useCallback((sectionId) => {
    setFlyoutOpen(true);
    setHoveredSection(sectionId);
  }, []);

  const closeFlyout = useCallback(() => {
    setFlyoutOpen(false);
    setHoveredSection(null);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const value = {
    activeSection,
    flyoutOpen,
    mobileOpen,
    hoveredSection,
    openFlyout,
    closeFlyout,
    toggleMobile,
    closeMobile,
    setHoveredSection,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

export default NavigationContext;
