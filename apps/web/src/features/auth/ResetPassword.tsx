/**
 * TIER Golf - Reset Password Page
 *
 * Archetype: D - System/Auth Page
 * Purpose: Set new password after reset request
 *
 * MIGRATED TO AUTH PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { AKLogo } from '../../components/branding/AKLogo';
import { AuthPage } from '../../ui/components';
import { Button, Text, Input } from '../../ui/primitives';
import { authAPI } from '../../services/api';

// ============================================================================
// PASSWORD REQUIREMENTS COMPONENT
// ============================================================================

interface PasswordValidation {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface PasswordRequirementsProps {
  validation: PasswordValidation;
}

function PasswordRequirements({ validation }: PasswordRequirementsProps) {
  const requirements = [
    { key: 'minLength' as const, label: 'At least 8 characters' },
    { key: 'hasUpperCase' as const, label: 'One uppercase letter' },
    { key: 'hasLowerCase' as const, label: 'One lowercase letter' },
    { key: 'hasNumber' as const, label: 'One number' },
    { key: 'hasSpecialChar' as const, label: 'One special character (!@#$...)' },
  ];

  return (
    <div className="p-4 bg-tier-surface-base rounded-lg mb-5">
      <Text variant="caption1" color="primary" className="font-semibold mb-3 block">
        Password requirements:
      </Text>
      <div className="flex flex-col gap-2">
        {requirements.map(({ key, label }) => (
          <div
            key={key}
            className={`flex items-center gap-2 text-xs ${
              validation[key] ? 'text-tier-success' : 'text-tier-text-secondary'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                validation[key] ? 'bg-tier-success' : 'bg-tier-border-default'
              }`}
            >
              {validation[key] && <CheckCircle size={12} className="text-white" />}
            </div>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password validation
  const passwordValidation: PasswordValidation = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const canSubmit = isPasswordValid && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    setError(null);
    setLoading(true);

    try {
      // token and email are guaranteed non-null here (checked in early return above)
      await authAPI.resetPassword(token as string, email as string, password);
      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Could not reset password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Invalid token/email state
  if (!token || !email) {
    return (
      <AuthPage state="error" maxWidth="md">
        <AuthPage.Logo>
          <AKLogo size={60} className="text-tier-navy" />
        </AuthPage.Logo>

        <AuthPage.Card>
          <div className="text-center">
            <AlertCircle size={48} className="text-tier-error mx-auto mb-4" />
            <Text variant="title2" color="primary" className="mb-3">
              Invalid request
            </Text>
            <Text variant="body" color="secondary" className="mb-6">
              The reset link is invalid or missing information.
            </Text>
            <Link
              to="/forgot-password"
              className="inline-block px-6 py-3 bg-tier-navy text-white rounded-lg font-semibold no-underline hover:bg-tier-navy/90 transition-colors"
            >
              Request new link
            </Link>
          </div>
        </AuthPage.Card>
      </AuthPage>
    );
  }

  return (
    <AuthPage state={loading ? 'loading' : success ? 'success' : 'idle'} maxWidth="md">
      <AuthPage.Logo title="Create new password" subtitle={`Choose a strong password for ${email}`}>
        <AKLogo size={60} className="text-tier-navy" />
      </AuthPage.Logo>

      <AuthPage.Card>
        {success ? (
          // Success State
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-tier-success-light flex items-center justify-center">
              <CheckCircle size={40} className="text-tier-success" />
            </div>

            <Text variant="title2" color="primary" className="mb-3">
              Password updated!
            </Text>

            <Text variant="body" color="secondary" className="mb-6">
              Your password has been reset. You will now be redirected to the login page...
            </Text>

            <div className="inline-flex items-center gap-2 text-tier-text-secondary">
              <div className="w-4 h-4 border-2 border-tier-navy border-t-transparent rounded-full animate-spin" />
              <Text variant="body">Redirecting...</Text>
            </div>
          </div>
        ) : (
          // Password Form
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-tier-error-light border border-tier-error/30 text-tier-error text-sm"
              >
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* New Password */}
            <div className="mb-5">
              <label htmlFor="password" className="block text-base font-semibold text-tier-navy mb-2">
                New password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-tier-text-secondary pointer-events-none"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  disabled={loading}
                  className="pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-tier-text-secondary bg-transparent border-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {password && <PasswordRequirements validation={passwordValidation} />}

            {/* Confirm Password */}
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-base font-semibold text-tier-navy mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-tier-text-secondary pointer-events-none"
                />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Enter password again"
                  disabled={loading}
                  className={`pl-12 pr-12 ${
                    confirmPassword && !passwordsMatch ? 'border-tier-error' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-tier-text-secondary bg-transparent border-none cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <Text variant="caption1" color="error" className="mt-2">
                  Passwords do not match
                </Text>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading || !canSubmit}
              loading={loading}
              className="w-full justify-center"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </Button>
          </form>
        )}
      </AuthPage.Card>

      {!success && (
        <AuthPage.Footer>
          Need help? Contact{' '}
          <a href="mailto:support@tiergolf.com" className="text-tier-navy no-underline">
            support@tiergolf.com
          </a>
        </AuthPage.Footer>
      )}
    </AuthPage>
  );
};

export default ResetPassword;
