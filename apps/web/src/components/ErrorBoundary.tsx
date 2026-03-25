/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 * Displays a fallback UI with tier branding
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Store error info in state
    this.setState({
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to error tracking service (Sentry)
    try {
      // Import errorReporter dynamically to avoid circular dependencies
      import('../utils/errorReporter').then(({ captureException }) => {
        captureException(error, {
          source: 'ErrorBoundary',
          action: 'component_error',
          extra: {
            componentStack: errorInfo?.componentStack,
          },
        });
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      const { showDetails = process.env.NODE_ENV === 'development' } = this.props;

      return (
        <div className="min-h-screen bg-tier-surface-base flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-xl border-2 border-tier-error shadow-lg">
            {/* Header */}
            <div className="bg-tier-error/10 border-b border-tier-error/20 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-tier-error/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="text-tier-error" size={24} />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-tier-navy mb-2">
                    Something went wrong
                  </h1>
                  <p className="text-tier-text-secondary">
                    An unexpected error occurred. Don't worry, your data is safe.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Details (Development only) */}
            {showDetails && error && (
              <div className="p-6 border-b border-tier-border-default">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-tier-navy mb-1">
                    Error Message:
                  </h3>
                  <p className="text-sm text-tier-error font-mono bg-tier-error/5 p-3 rounded border border-tier-error/20">
                    {error.toString()}
                  </p>
                </div>

                {errorInfo && (
                  <details className="text-sm">
                    <summary className="font-semibold text-tier-navy cursor-pointer hover:text-tier-navy-dark">
                      Component Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-tier-text-secondary font-mono bg-tier-surface-subtle p-3 rounded overflow-auto max-h-48">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors shadow-sm"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-tier-navy text-tier-navy font-semibold hover:bg-tier-navy/5 transition-colors"
                >
                  <RefreshCw size={18} />
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-tier-border-default text-tier-navy font-semibold hover:bg-tier-surface-subtle transition-colors"
                >
                  <Home size={18} />
                  Go Home
                </button>
              </div>

              {/* Help Text */}
              <p className="mt-4 text-sm text-tier-text-secondary text-center">
                If this problem persists, please contact support with the error details above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Page-level Error Boundary
 * More specific error boundary for individual pages/routes
 */
interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
  onReset?: () => void;
}

export function PageErrorBoundary({ children, pageName, onReset }: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-tier-error/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-tier-error" size={32} />
            </div>
            <h2 className="text-xl font-bold text-tier-navy mb-2">
              {pageName ? `Error loading ${pageName}` : 'Page Error'}
            </h2>
            <p className="text-tier-text-secondary mb-6">
              This page encountered an error and couldn't be displayed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  if (onReset) onReset();
                  window.location.reload();
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors"
              >
                <RefreshCw size={18} />
                Reload Page
              </button>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-tier-border-default text-tier-navy font-semibold hover:bg-tier-surface-subtle transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
