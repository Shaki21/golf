/**
 * Onboarding Guard
 *
 * Ensures users complete onboarding before accessing the main application.
 * Redirects players to /onboarding and coaches to /coach/onboarding if
 * their onboardingComplete flag is false.
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingGuardProps {
  children: ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user } = useAuth();
  const location = useLocation();

  // No user means not authenticated - let ProtectedRoute handle that
  if (!user) {
    return <>{children}</>;
  }

  // Check if we're already on an onboarding page to prevent redirect loops
  const isOnboardingPage = location.pathname.startsWith('/onboarding') ||
                           location.pathname.startsWith('/coach/onboarding');

  if (isOnboardingPage) {
    return <>{children}</>;
  }

  // Players who haven't completed onboarding
  if (user.role === 'player' && user.onboardingComplete === false) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  // Coaches who haven't completed onboarding
  if (user.role === 'coach' && user.onboardingComplete === false) {
    return <Navigate to="/coach/onboarding" replace state={{ from: location }} />;
  }

  // User has completed onboarding or is admin/parent
  return <>{children}</>;
}

export default OnboardingGuard;
