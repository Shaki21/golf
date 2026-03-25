/**
 * TIER Golf - Login Page
 *
 * Archetype: D - System/Auth Page
 * Purpose: User authentication
 *
 * MIGRATED TO AUTH PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, AlertCircle, X } from 'lucide-react';
import { TIERGolfFullLogo } from '../../components/branding/TIERGolfFullLogo';
import { AuthPage } from '../../ui/components';
import { Text, Input } from '../../ui/primitives';
import { Button } from '../../components/shadcn/button';
import { OAuthButtons } from '../../components/auth';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccess(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setResetSuccess(false);
      setResetEmail('');
    }, 3000);
  };

  // Get redirect path based on user role and onboarding status
  const getRedirectPath = (role: string, onboardingComplete?: boolean) => {
    // Players who haven't completed onboarding go to onboarding
    if (role === 'player' && onboardingComplete === false) {
      return '/onboarding';
    }

    switch (role) {
      case 'admin':
        return '/admin';
      case 'coach':
        return '/coach';
      default:
        return '/dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Get user from localStorage since AuthContext just set it
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        navigate(getRedirectPath(user.role, user.onboardingComplete));
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error ?? 'Login failed');
    }
    setLoading(false);
  };

  const handleOAuthSuccess = (data: {
    accessToken: string;
    refreshToken: string;
    user: any;
  }) => {
    // Store tokens in localStorage (same as AuthContext does)
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userData', JSON.stringify(data.user));

    // Navigate to appropriate page based on role
    navigate(getRedirectPath(data.user.role, data.user.onboardingComplete));
  };

  const handleOAuthError = (error: Error) => {
    console.error('OAuth error:', error);
    setError(error.message || 'OAuth login failed');
  };

  const handleDemoLogin = async (role: 'admin' | 'coach' | 'player') => {
    const credentials = {
      admin: { email: 'admin@demo.com', password: 'admin123' },
      coach: { email: 'coach@demo.com', password: 'coach123' },
      player: { email: 'player@demo.com', password: 'player123' },
    };

    setEmail(credentials[role].email);
    setPassword(credentials[role].password);

    setLoading(true);
    const result = await login(credentials[role].email, credentials[role].password);

    if (result.success) {
      // Get user from localStorage since AuthContext just set it
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        navigate(getRedirectPath(user.role, user.onboardingComplete));
      } else {
        navigate(getRedirectPath(role, true)); // Demo users have completed onboarding
      }
    } else {
      setError(result.error ?? 'Login failed');
    }
    setLoading(false);
  };

  return (
    <AuthPage state={loading ? 'loading' : 'idle'} maxWidth="sm">
      <AuthPage.Logo>
        <TIERGolfFullLogo height={48} variant="dark" />
      </AuthPage.Logo>

      <AuthPage.Card title="Sign In">
        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            data-testid="login-error"
            className="flex items-center gap-2 p-3 mb-6 rounded-lg bg-tier-error-light border border-tier-error/30 text-tier-error text-sm"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-tier-navy mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Your email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-tier-navy mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
            />
          </div>

          <div className="mb-6 text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-tier-navy hover:underline bg-transparent border-none cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="default"
            disabled={loading}
            className="w-full"
          >
            <LogIn size={20} />
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* OAuth Sign-In Buttons */}
        <OAuthButtons onSuccess={handleOAuthSuccess} onError={handleOAuthError} />

        {/* Demo Login Buttons */}
        <div className="mt-8 pt-6 border-t border-tier-border-default">
          <Text variant="footnote" color="secondary" className="text-center mb-5">
            Demo logins
          </Text>
          <div className="flex flex-col gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDemoLogin('player')}
              disabled={loading}
              className="w-full"
            >
              Player (player@demo.com)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDemoLogin('coach')}
              disabled={loading}
              className="w-full"
            >
              Coach (coach@demo.com)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="w-full"
            >
              Admin (admin@demo.com)
            </Button>
          </div>
        </div>
      </AuthPage.Card>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-tier-white rounded-2xl p-8 max-w-sm w-[90%] relative">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 right-4 p-1 text-tier-text-secondary hover:text-tier-navy bg-transparent border-none cursor-pointer"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <Text variant="title2" color="primary" className="mb-4">
              Reset Password
            </Text>

            {resetSuccess ? (
              <div className="p-5 bg-tier-success-light rounded-lg text-center">
                <div className="text-5xl mb-3">✓</div>
                <Text variant="body" color="success">
                  An email with password reset instructions has been sent to {resetEmail}
                </Text>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset}>
                <Text variant="footnote" color="secondary" className="mb-5">
                  Enter your email address and we will send you a link to reset your password.
                </Text>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-tier-navy mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <Button type="submit" variant="default" className="w-full justify-center">
                  Send Reset Link
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthPage>
  );
};

export default Login;
