import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { captureException } from '../../utils/errorReporter';
import { SectionTitle } from '../typography';

/**
 * Feature-level Error Boundary
 * Provides graceful error handling for individual features without crashing the entire app
 */
class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const { onError, featureName } = this.props;

    // Log error details
    console.error(`[${featureName || 'Feature'}] Error caught:`, error, errorInfo);

    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Send to error tracking service (Sentry)
    captureException(error, {
      source: 'FeatureErrorBoundary',
      action: 'feature_error',
      extra: {
        componentStack: errorInfo?.componentStack,
        featureName: featureName || 'unknown',
        errorCount: this.state.errorCount + 1,
      },
    });
  }

  handleReset = () => {
    const { onReset } = this.props;

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (onReset) {
      onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const {
      children,
      featureName = 'This feature',
      fallback,
      showHomeButton = false,
      minimal = false,
    } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback({ error, errorInfo, onReset: this.handleReset });
      }

      // Minimal error UI for compact spaces
      if (minimal) {
        return (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              backgroundColor: 'rgba(var(--error-rgb), 0.1)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${'var(--error)'}30`,
            }}
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle size={24} color={'var(--error)'} style={{ margin: '0 auto 12px' }} />
            <p
              style={{
                fontSize: '15px', lineHeight: '20px', fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 12px',
              }}
            >
              {featureName} could not be loaded
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: `${'8px'} ${'16px'}`,
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-primary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '15px', lineHeight: '20px', fontWeight: 600,
                fontWeight: 600,
              }}
            >
              Try again
            </button>
          </div>
        );
      }

      // Full error UI
      return (
        <div
          style={{
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
          }}
          role="alert"
          aria-live="assertive"
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                borderRadius: '50%',
                backgroundColor: `${'var(--error)'}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={40} color={'var(--error)'} />
            </div>

            <SectionTitle
              style={{
                fontSize: '22px', lineHeight: '28px', fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}
            >
              Something went wrong
            </SectionTitle>

            <p
              style={{
                fontSize: '15px', lineHeight: '20px', fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '24px',
                lineHeight: '24px',
              }}
            >
              {featureName} encountered a problem. Try reloading the page,
              or contact support if the problem persists.
            </p>

            {/* Show warning if error keeps happening */}
            {errorCount > 2 && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: `${'var(--warning)'}15`,
                  border: `1px solid ${'var(--warning)'}30`,
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '24px',
                }}
              >
                <p
                  style={{
                    fontSize: '13px', lineHeight: '18px',
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  <strong>Persistent problem:</strong> This error has occurred {errorCount} times.
                  Please contact support for assistance.
                </p>
              </div>
            )}

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && error && (
              <details
                style={{
                  marginBottom: '24px',
                  textAlign: 'left',
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    marginBottom: '12px',
                    fontWeight: 600,
                    fontSize: '15px', lineHeight: '20px', fontWeight: 600,
                    fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
                  }}
                >
                  Error details (development only)
                </summary>
                <p style={{ color: 'var(--error)', marginBottom: '8px' }}>
                  {error.toString()}
                </p>
                {errorInfo && (
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      margin: 0,
                    }}
                  >
                    {errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            {/* Action buttons */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: `${'16px'} ${'24px'}`,
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '17px', lineHeight: '22px', fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(var(--accent-rgb), 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent)';
                }}
              >
                <RefreshCw size={18} />
                Try again
              </button>

              {showHomeButton && (
                <button
                  onClick={this.handleGoHome}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: `${'16px'} ${'24px'}`,
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '17px', lineHeight: '22px', fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                >
                  <Home size={18} />
                  Go to home page
                </button>
              )}
            </div>

            {/* Support link */}
            <div
              style={{
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid var(--border-default)',
              }}
            >
              <p
                style={{
                  fontSize: '13px', lineHeight: '18px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                Need help? Contact{' '}
                <a
                  href="mailto:support@akgolf.no"
                  style={{
                    color: 'var(--accent)',
                    textDecoration: 'none',
                  }}
                >
                  support@akgolf.no
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default FeatureErrorBoundary;

/**
 * Hook for functional components to report errors to parent boundary
 */
export function useErrorHandler() {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  const WrappedComponent = (props) => (
    <FeatureErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </FeatureErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
