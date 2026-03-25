import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import StateCard from '../../ui/composites/StateCard';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import { OnboardingGuard } from './OnboardingGuard';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Get appropriate home path based on user role
    const getHomePath = () => {
      switch (user.role) {
        case 'admin':
          return '/admin';
        case 'coach':
          return '/coach';
        default:
          return '/dashboard';
      }
    };

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: '24px',
      }}>
        <Card variant="default" padding="lg" style={{ maxWidth: '480px', width: '100%' }}>
          <StateCard
            variant="error"
            icon={ShieldX}
            title="Ingen tilgang"
            description="Du har ikke tilgang til denne siden. Kontakt administrator hvis du mener dette er feil."
            action={
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<ArrowLeft size={18} />}
                  onClick={() => navigate(-1)}
                >
                  Tilbake
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Home size={18} />}
                  onClick={() => navigate(getHomePath())}
                >
                  Til Dashboard
                </Button>
              </div>
            }
          />
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-default)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0 }}>
              Feilkode: 403 Forbidden
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <OnboardingGuard>
      {children}
    </OnboardingGuard>
  );
};

export default ProtectedRoute;
