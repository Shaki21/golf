import React, { useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';

/**
 * OAuth Buttons Component
 *
 * Provides Google Sign-In and Apple Sign-In buttons with production OAuth integration.
 *
 * Features:
 * - Google OAuth 2.0 authentication
 * - Apple Sign-In authentication
 * - Loading states
 * - Error handling
 * - Automatic token exchange with backend
 *
 * @example
 * <OAuthButtons
 *   onSuccess={(tokens) => {
 *     localStorage.setItem('accessToken', tokens.accessToken);
 *     navigate('/dashboard');
 *   }}
 *   onError={(error) => console.error(error)}
 * />
 */

interface OAuthButtonsProps {
  onSuccess: (data: {
    accessToken: string;
    refreshToken: string;
    user: any;
  }) => void;
  onError?: (error: Error) => void;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const APPLE_CLIENT_ID = process.env.REACT_APP_APPLE_CLIENT_ID || '';

const GoogleSignInButton: React.FC<OAuthButtonsProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Exchange Google token for backend JWT
        const response = await fetch(`${API_URL}/auth/google/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: tokenResponse.access_token,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Google sign-in feilet');
        }

        const data = await response.json();
        onSuccess(data);
      } catch (error) {
        console.error('Google OAuth error:', error);
        onError?.(error as Error);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      onError?.(new Error('Google innlogging avbrutt'));
    },
  });

  if (!GOOGLE_CLIENT_ID) {
    return null; // Hide button if not configured
  }

  return (
    <button
      onClick={() => googleLogin()}
      disabled={loading}
      className="oauth-button google-button"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '12px 24px',
        backgroundColor: '#fff',
        border: '1px solid #dadce0',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#3c4043',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#fff';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {loading ? (
        <span>Laster...</span>
      ) : (
        <>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            style={{ marginRight: '12px' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Fortsett med Google
        </>
      )}
    </button>
  );
};

const AppleSignInButton: React.FC<OAuthButtonsProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  if (!APPLE_CLIENT_ID) {
    return null; // Hide button if not configured
  }

  return (
    <AppleSignin
      authOptions={{
        clientId: APPLE_CLIENT_ID,
        scope: 'email name',
        redirectURI: `${API_URL}/auth/apple/callback`,
        state: 'state',
        nonce: 'nonce',
        usePopup: true,
      }}
      uiType="dark"
      onSuccess={async (response: any) => {
        setLoading(true);
        try {
          // Exchange Apple ID token for backend JWT
          const backendResponse = await fetch(`${API_URL}/auth/apple/signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              idToken: response.authorization.id_token,
              firstName: response.user?.name?.firstName,
              lastName: response.user?.name?.lastName,
            }),
          });

          if (!backendResponse.ok) {
            const error = await backendResponse.json();
            throw new Error(error.message || 'Apple sign-in feilet');
          }

          const data = await backendResponse.json();
          onSuccess(data);
        } catch (error) {
          console.error('Apple OAuth error:', error);
          onError?.(error as Error);
        } finally {
          setLoading(false);
        }
      }}
      onError={(error: any) => {
        console.error('Apple OAuth error:', error);
        onError?.(new Error('Apple innlogging avbrutt'));
      }}
      render={(props: any) => (
        <button
          {...props}
          disabled={loading}
          className="oauth-button apple-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '12px 24px',
            backgroundColor: '#000',
            border: '1px solid #000',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#000';
          }}
        >
          {loading ? (
            <span>Laster...</span>
          ) : (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                style={{ marginRight: '12px' }}
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M14.315 0c.101 1.454-.497 2.818-1.326 3.82-.85 1.031-2.184 1.854-3.587 1.763-.123-1.378.525-2.794 1.314-3.676C11.572.876 13.054.063 14.315 0zM17.999 13.271c-.252 1.02-.577 1.86-1.02 2.646-.725 1.293-1.768 2.91-3.24 2.93-1.283.018-1.638-.815-3.342-.828-1.704-.014-2.094.832-3.377.865-1.472.034-2.447-1.524-3.173-2.817C2.23 13.39 1.17 9.517 2.844 6.736c.837-1.39 2.19-2.27 3.63-2.291 1.419-.02 2.65.865 3.48.865.828 0 2.377-1.07 4.153-.913.687.026 2.676.251 3.943 2.046-.095.063-2.353 1.246-2.332 3.72.02 2.953 2.688 3.952 2.716 3.967-.02.05-.421 1.306-1.435 2.594z" />
              </svg>
              Fortsett med Apple
            </>
          )}
        </button>
      )}
    />
  );
};

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onSuccess, onError }) => {
  // Check if OAuth is enabled
  const isOAuthEnabled = GOOGLE_CLIENT_ID || APPLE_CLIENT_ID;

  if (!isOAuthEnabled) {
    return null; // Hide entire component if OAuth not configured
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="oauth-buttons-container" style={{ width: '100%' }}>
        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0',
            gap: '16px',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#e0e0e0',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: '#666',
              textTransform: 'uppercase',
            }}
          >
            Eller
          </span>
          <div
            style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#e0e0e0',
            }}
          />
        </div>

        {/* OAuth Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {GOOGLE_CLIENT_ID && (
            <GoogleSignInButton onSuccess={onSuccess} onError={onError} />
          )}
          {APPLE_CLIENT_ID && (
            <AppleSignInButton onSuccess={onSuccess} onError={onError} />
          )}
        </div>

        {/* Privacy Notice */}
        <p
          style={{
            fontSize: '12px',
            color: '#666',
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          Ved å fortsette godtar du våre{' '}
          <a href="/terms" style={{ color: '#10456A', textDecoration: 'none' }}>
            vilkår
          </a>{' '}
          og{' '}
          <a href="/privacy" style={{ color: '#10456A', textDecoration: 'none' }}>
            personvernregler
          </a>
          .
        </p>
      </div>
    </GoogleOAuthProvider>
  );
};

export default OAuthButtons;
