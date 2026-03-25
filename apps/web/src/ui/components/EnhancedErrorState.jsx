import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, WifiOff, Server, Lock } from 'lucide-react';
import Button from '../primitives/Button';
import { SubSectionTitle } from '../../components/typography';

/**
 * Enhanced error state component with specific error messages and retry logic
 * UI Canon compliant - uses semantic CSS variables
 */
export const EnhancedErrorState = ({ error, onRetry, showPartialData = false }) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Parse error to determine type
  const getErrorType = (errorMessage) => {
    const msg = errorMessage?.toLowerCase() || '';

    if (!isOnline || msg.includes('network') || msg.includes('fetch failed')) {
      return 'network';
    }
    if (msg.includes('unauthorized') || msg.includes('401') || msg.includes('403')) {
      return 'auth';
    }
    if (msg.includes('500') || msg.includes('server error')) {
      return 'server';
    }
    if (msg.includes('timeout')) {
      return 'timeout';
    }
    return 'unknown';
  };

  const errorType = getErrorType(error);

  // Error-specific messages and icons
  const errorConfig = {
    network: {
      icon: WifiOff,
      iconColor: 'var(--error)',
      title: 'No network connection',
      message: 'Check your internet connection and try again.',
      showRetry: true,
    },
    auth: {
      icon: Lock,
      iconColor: 'var(--warning)',
      title: 'Authentication error',
      message: 'Your session may have expired. Please log in again.',
      showRetry: false,
    },
    server: {
      icon: Server,
      iconColor: 'var(--error)',
      title: 'Server error',
      message: 'An error occurred on the server. We are working to resolve the issue.',
      showRetry: true,
    },
    timeout: {
      icon: AlertCircle,
      iconColor: 'var(--warning)',
      title: 'Timeout',
      message: 'The request took too long. Try again.',
      showRetry: true,
    },
    unknown: {
      icon: AlertCircle,
      iconColor: 'var(--error)',
      title: 'Something went wrong',
      message: error || 'An unknown error occurred. Try again later.',
      showRetry: true,
    },
  };

  const config = errorConfig[errorType];
  const IconComponent = config.icon;

  // Exponential backoff retry
  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);

    // Exponential backoff: 1s, 2s, 4s, 8s (max 8s)
    const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);

    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      await onRetry();
      setRetryCount(0); // Reset on success
    } catch (err) {
      setRetryCount(count => count + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'rgba(var(--error-rgb, 220, 38, 38), 0.1)',
      border: '1px solid rgba(var(--error-rgb, 220, 38, 38), 0.2)',
      borderRadius: 'var(--radius-lg)',
      padding: '32px',
      textAlign: 'center',
      maxWidth: '400px',
      margin: '0 auto',
    }}>
      {/* Icon */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '16px',
      }}>
        <IconComponent size={32} style={{ color: config.iconColor }} />
      </div>

      {/* Title */}
      <SubSectionTitle style={{
        fontSize: '16px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '8px',
        margin: '0 0 8px 0',
      }}>
        {config.title}
      </SubSectionTitle>

      {/* Message */}
      <p style={{
        fontSize: '14px',
        color: 'var(--text-secondary)',
        marginBottom: '16px',
        margin: '0 0 16px 0',
      }}>
        {config.message}
      </p>

      {/* Network status indicator */}
      {!isOnline && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px',
          fontSize: '13px',
          color: 'var(--error)',
        }}>
          <WifiOff size={16} />
          <span>Offline</span>
        </div>
      )}

      {/* Retry button */}
      {config.showRetry && onRetry && (
        <Button
          variant="primary"
          size="sm"
          onClick={handleRetry}
          disabled={isRetrying || !isOnline}
          leftIcon={<RefreshCw size={16} style={isRetrying ? { animation: 'spin 1s linear infinite' } : undefined} />}
        >
          {isRetrying ? 'Retrying...' : 'Try again'}
        </Button>
      )}

      {/* Retry count indicator */}
      {retryCount > 0 && (
        <p style={{
          fontSize: '12px',
          color: 'var(--text-tertiary)',
          marginTop: '12px',
          margin: '12px 0 0 0',
        }}>
          Attempt {retryCount + 1}
        </p>
      )}

      {/* Partial data notice */}
      {showPartialData && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'rgba(var(--warning-rgb, 245, 158, 11), 0.1)',
          border: '1px solid rgba(var(--warning-rgb, 245, 158, 11), 0.2)',
          borderRadius: 'var(--radius-md)',
        }}>
          <p style={{
            fontSize: '13px',
            color: 'var(--warning)',
            margin: 0,
          }}>
            Viser tidligere data. Noe informasjon kan være utdatert.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedErrorState;
