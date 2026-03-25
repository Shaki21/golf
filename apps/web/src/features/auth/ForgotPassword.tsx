/**
 * TIER Golf - Forgot Password Page
 *
 * Archetype: D - System/Auth Page
 * Purpose: Request password reset link
 *
 * MIGRATED TO AUTH PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { AKLogo } from '../../components/branding/AKLogo';
import { AuthPage } from '../../ui/components';
import { Button, Text, Input } from '../../ui/primitives';
import { authAPI } from '../../services/api';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authAPI.requestPasswordReset(email);
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Could not send reset link. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPage state={loading ? 'loading' : submitted ? 'success' : 'idle'} maxWidth="md">
      <AuthPage.Logo title="Reset Password" subtitle="We will send you a secure link to reset your password">
        <AKLogo size={60} className="text-tier-navy" />
      </AuthPage.Logo>

      <AuthPage.Card>
        {submitted ? (
          // Success State
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-tier-success-light flex items-center justify-center">
              <CheckCircle size={32} className="text-tier-success" />
            </div>

            <Text variant="title2" color="primary" className="mb-3">
              Check your email
            </Text>

            <Text variant="body" color="secondary" className="mb-6">
              We have sent a password reset link to <strong>{email}</strong>.
              The link is valid for 1 hour.
            </Text>

            <div className="p-4 bg-tier-surface-base rounded-lg mb-6">
              <Text variant="caption1" color="secondary">
                Didn't receive the email? Check your spam folder, or{' '}
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="text-tier-navy underline bg-transparent border-none cursor-pointer font-inherit"
                >
                  try again
                </button>
              </Text>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-tier-navy text-white rounded-lg font-semibold hover:bg-tier-navy/90 transition-colors no-underline"
            >
              <ArrowLeft size={18} />
              Back to login
            </Link>
          </div>
        ) : (
          // Email Form
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-tier-error-light border border-tier-error/30 text-tier-error text-sm"
              >
                <Mail size={20} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="email" className="block text-base font-semibold text-tier-navy mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-tier-text-secondary pointer-events-none"
                />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  disabled={loading}
                  className="pl-12"
                />
              </div>
              <Text variant="caption1" color="secondary" className="mt-2">
                Enter the email address associated with your account
              </Text>
            </div>

            <Button
              type="submit"
              variant="primary"
              leftIcon={<Mail size={20} />}
              disabled={loading || !email}
              loading={loading}
              className="w-full justify-center"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>

            <div className="mt-6 pt-6 border-t border-tier-border-default text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-tier-navy no-underline text-sm"
              >
                <ArrowLeft size={18} />
                Back to login
              </Link>
            </div>
          </form>
        )}
      </AuthPage.Card>

      <AuthPage.Footer>
        Need help? Contact{' '}
        <a href="mailto:support@tiergolf.com" className="text-tier-navy no-underline">
          support@tiergolf.com
        </a>
      </AuthPage.Footer>
    </AuthPage>
  );
};

export default ForgotPassword;
