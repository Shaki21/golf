/**
 * TIER Golf - Verify Reset Token Page
 *
 * Archetype: D - System/Auth Page
 * Purpose: Verify password reset token before redirecting to reset form
 *
 * MIGRATED TO AUTH PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { AKLogo } from '../../components/branding/AKLogo';
import { AuthPage } from '../../ui/components';
import { Text } from '../../ui/primitives';
import { authAPI } from '../../services/api';

// ============================================================================
// TYPES
// ============================================================================

type VerifyStatus = 'verifying' | 'valid' | 'invalid' | 'expired';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VerifyResetToken: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerifyStatus>('verifying');
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setStatus('invalid');
        setError('Invalid or missing token');
        return;
      }

      try {
        const response = await authAPI.verifyResetToken(token);
        const { valid } = response.data;

        if (valid) {
          setStatus('valid');
          setTimeout(() => {
            navigate(`/reset-password?token=${token}&email=${email}`);
          }, 1500);
        } else {
          setStatus('expired');
          setError('This link has expired or has already been used');
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        const errorMessage = error.response?.data?.message || error.message;
        if (errorMessage?.includes('expired') || errorMessage?.includes('utløpt')) {
          setStatus('expired');
          setError('This link has expired or has already been used');
        } else {
          setStatus('invalid');
          setError(errorMessage || 'Could not verify token');
        }
      }
    };

    verifyToken();
  }, [token, email, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-tier-navy/15 flex items-center justify-center">
              <Loader size={40} className="text-tier-navy animate-spin" />
            </div>

            <Text variant="title2" color="primary" className="mb-3">
              Verifying link...
            </Text>

            <Text variant="body" color="secondary">
              Please wait while we verify your reset link
            </Text>
          </div>
        );

      case 'valid':
        return (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-tier-success-light flex items-center justify-center">
              <CheckCircle size={40} className="text-tier-success" />
            </div>

            <Text variant="title2" color="primary" className="mb-3">
              Link confirmed!
            </Text>

            <Text variant="body" color="secondary">
              Redirecting you to password reset...
            </Text>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-tier-warning-light flex items-center justify-center">
              <AlertCircle size={40} className="text-tier-warning" />
            </div>

            <Text variant="title2" color="primary" className="mb-3">
              Link has expired
            </Text>

            <Text variant="body" color="secondary" className="mb-6">
              {error || 'This reset link is no longer valid. Reset links expire after 1 hour for security reasons.'}
            </Text>

            <div className="p-4 bg-tier-surface-base rounded-lg mb-6">
              <Text variant="caption1" color="secondary">
                You can request a new link from the login page
              </Text>
            </div>

            <Link
              to="/forgot-password"
              className="inline-block px-6 py-3 bg-tier-navy text-white rounded-lg font-semibold no-underline hover:bg-tier-navy/90 transition-colors"
            >
              Request new link
            </Link>
          </div>
        );

      case 'invalid':
        return (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-tier-error-light flex items-center justify-center">
              <XCircle size={40} className="text-tier-error" />
            </div>

            <Text variant="title2" color="primary" className="mb-3">
              Invalid link
            </Text>

            <Text variant="body" color="secondary" className="mb-6">
              {error || 'This link is invalid or has been used. Please request a new link.'}
            </Text>

            <div className="flex gap-3 justify-center">
              <Link
                to="/forgot-password"
                className="inline-block px-6 py-3 bg-tier-navy text-white rounded-lg font-semibold no-underline hover:bg-tier-navy/90 transition-colors"
              >
                Request new link
              </Link>

              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-tier-surface-base text-tier-navy rounded-lg font-semibold no-underline border border-tier-border-default hover:bg-tier-surface-base/80 transition-colors"
              >
                Back to login
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthPage
      state={status === 'verifying' ? 'loading' : status === 'valid' ? 'success' : 'error'}
      maxWidth="md"
    >
      <AuthPage.Logo>
        <AKLogo size={60} className="text-tier-navy" />
      </AuthPage.Logo>

      <AuthPage.Card>{renderContent()}</AuthPage.Card>

      <AuthPage.Footer>
        Need help? Contact{' '}
        <a href="mailto:support@tiergolf.com" className="text-tier-navy no-underline">
          support@tiergolf.com
        </a>
      </AuthPage.Footer>
    </AuthPage>
  );
};

export default VerifyResetToken;
