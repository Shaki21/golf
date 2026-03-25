import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StateCard from '../../ui/composites/StateCard';

/**
 * PublicRoute - Guard for public pages
 *
 * Redirects authenticated users to the dashboard.
 * Shows loading state while checking auth.
 * Renders children for unauthenticated users.
 */
const PublicRoute = ({ children, redirectTo = '/dashboard' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}>
        <StateCard variant="loading" title="Laster..." />
      </div>
    );
  }

  // Authenticated users go to dashboard
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Unauthenticated users see the public content
  return children;
};

export default PublicRoute;
