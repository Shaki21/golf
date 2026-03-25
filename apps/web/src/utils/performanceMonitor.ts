/**
 * Performance Monitoring Utility
 *
 * Tracks and reports:
 * - Core Web Vitals (LCP, FID, CLS, TTFB)
 * - Page load times
 * - Component render times
 * - API request durations
 * - Custom performance marks
 * - Route transitions
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface CoreWebVitals {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  FCP?: number; // First Contentful Paint
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean;
  private reportEndpoint?: string;

  constructor(config: { enabled?: boolean; reportEndpoint?: string } = {}) {
    this.isEnabled = config.enabled ?? process.env.NODE_ENV === 'production';
    this.reportEndpoint = config.reportEndpoint;

    if (this.isEnabled) {
      this.initializeWebVitals();
      this.initializeNavigationTiming();
    }
  }

  /**
   * Initialize Core Web Vitals tracking
   */
  private initializeWebVitals(): void {
    // Use web-vitals library if available, otherwise use Performance API
    if (typeof window === 'undefined') return;

    try {
      // Try to use web-vitals library
      this.importWebVitals();
    } catch {
      // Fallback to Performance API
      this.trackWithPerformanceAPI();
    }
  }

  /**
   * Import and use web-vitals library
   */
  private async importWebVitals(): Promise<void> {
    try {
      const { onCLS, onFID, onLCP, onFCP, onTTFB } = await import('web-vitals');

      onCLS((metric) => this.recordMetric('CLS', metric.value, metric));
      onFID((metric) => this.recordMetric('FID', metric.value, metric));
      onLCP((metric) => this.recordMetric('LCP', metric.value, metric));
      onFCP((metric) => this.recordMetric('FCP', metric.value, metric));
      onTTFB((metric) => this.recordMetric('TTFB', metric.value, metric));
    } catch (error) {
      console.warn('[Performance] web-vitals library not available. Install with: npm install web-vitals');
      this.trackWithPerformanceAPI();
    }
  }

  /**
   * Track Core Web Vitals using Performance API
   */
  private trackWithPerformanceAPI(): void {
    if (!window.performance) return;

    // Wait for page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;

        if (navigation) {
          // TTFB
          const ttfb = navigation.responseStart - navigation.requestStart;
          this.recordMetric('TTFB', ttfb);

          // FCP
          const fcp = performance.getEntriesByName('first-contentful-paint')[0];
          if (fcp) {
            this.recordMetric('FCP', fcp.startTime);
          }
        }

        // LCP - observe largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime);
        });

        try {
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch {
          // LCP not supported
        }

        // CLS - observe layout shifts
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.recordMetric('CLS', clsValue);
        });

        try {
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch {
          // CLS not supported
        }
      }, 0);
    });
  }

  /**
   * Track navigation timing
   */
  private initializeNavigationTiming(): void {
    if (!window.performance || !window.performance.timing) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;

        // Page load time
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        this.recordMetric('Page Load Time', pageLoadTime);

        // DOM content loaded
        const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        this.recordMetric('DOM Content Loaded', domContentLoaded);

        // Time to Interactive (approximation)
        const tti = timing.domInteractive - timing.navigationStart;
        this.recordMetric('Time to Interactive', tti);
      }, 0);
    });
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}:`, value.toFixed(2), 'ms', metadata || '');
    }

    // Report to analytics/monitoring service
    this.report(metric);
  }

  /**
   * Mark start of a custom operation
   */
  mark(name: string): void {
    if (!this.isEnabled || !window.performance) return;
    performance.mark(`${name}-start`);
  }

  /**
   * Measure duration since mark
   */
  measure(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled || !window.performance) return;

    try {
      performance.measure(name, `${name}-start`);
      const measure = performance.getEntriesByName(name, 'measure')[0];

      if (measure) {
        this.recordMetric(name, measure.duration, metadata);
        performance.clearMarks(`${name}-start`);
        performance.clearMeasures(name);
      }
    } catch (error) {
      console.warn(`[Performance] Failed to measure ${name}:`, error);
    }
  }

  /**
   * Track component render time
   */
  trackRender(componentName: string, duration: number): void {
    this.recordMetric(`Render: ${componentName}`, duration);
  }

  /**
   * Track API request duration
   */
  trackAPIRequest(endpoint: string, duration: number, status: number): void {
    this.recordMetric(`API: ${endpoint}`, duration, { status });
  }

  /**
   * Track route transition
   */
  trackRouteChange(from: string, to: string, duration: number): void {
    this.recordMetric('Route Change', duration, { from, to });
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get Core Web Vitals summary
   */
  getWebVitals(): CoreWebVitals {
    const vitals: CoreWebVitals = {};

    const findMetric = (name: string) => {
      const metric = this.metrics.find((m) => m.name === name);
      return metric?.value;
    };

    vitals.LCP = findMetric('LCP');
    vitals.FID = findMetric('FID');
    vitals.CLS = findMetric('CLS');
    vitals.TTFB = findMetric('TTFB');
    vitals.FCP = findMetric('FCP');

    return vitals;
  }

  /**
   * Report metric to monitoring service
   */
  private report(metric: PerformanceMetric): void {
    if (!this.reportEndpoint) return;

    // Send to monitoring service (e.g., Google Analytics, Sentry, custom endpoint)
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.reportEndpoint, JSON.stringify(metric));
      } else {
        // Fallback to fetch
        fetch(this.reportEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric),
          keepalive: true,
        }).catch(() => {
          // Silently fail
        });
      }
    } catch {
      // Silently fail - don't block user experience
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// =============================================================================
// Export Singleton Instance
// =============================================================================

export const performanceMonitor = new PerformanceMonitor({
  enabled: true, // Always enable, will only report in production
  reportEndpoint: process.env.REACT_APP_PERFORMANCE_ENDPOINT,
});

// =============================================================================
// React Hooks
// =============================================================================

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to track component mount time
 *
 * @example
 * function MyComponent() {
 *   usePerformanceTracker('MyComponent');
 *   return <div>Content</div>;
 * }
 */
export function usePerformanceTracker(componentName: string): void {
  const mountTime = useRef<number>(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - mountTime.current;
    performanceMonitor.trackRender(componentName, renderTime);
  }, [componentName]);
}

/**
 * Hook to track route transitions
 */
export function useRoutePerformance(): void {
  const location = useLocation();
  const prevLocation = useRef<string>(location.pathname);
  const transitionStart = useRef<number>(Date.now());

  useEffect(() => {
    const duration = Date.now() - transitionStart.current;

    if (prevLocation.current !== location.pathname) {
      performanceMonitor.trackRouteChange(
        prevLocation.current,
        location.pathname,
        duration
      );

      prevLocation.current = location.pathname;
      transitionStart.current = Date.now();
    }
  }, [location]);
}

/**
 * Hook to track custom operation
 *
 * @example
 * function SearchComponent() {
 *   const { start, end } = useOperationTracker();
 *
 *   const handleSearch = async (query) => {
 *     start('search');
 *     const results = await api.search(query);
 *     end('search');
 *     return results;
 *   };
 * }
 */
export function useOperationTracker() {
  return {
    start: (name: string) => performanceMonitor.mark(name),
    end: (name: string, metadata?: Record<string, any>) =>
      performanceMonitor.measure(name, metadata),
  };
}

// =============================================================================
// Axios Interceptor Integration
// =============================================================================

import { AxiosInstance } from 'axios';

/**
 * Add performance tracking to axios instance
 */
export function addPerformanceInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use((config) => {
    // Record request start time
    (config as any).requestStartTime = Date.now();
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      const config = response.config as any;
      const duration = Date.now() - (config.requestStartTime || 0);

      performanceMonitor.trackAPIRequest(
        config.url || 'unknown',
        duration,
        response.status
      );

      return response;
    },
    (error) => {
      const config = error.config as any;
      const duration = Date.now() - (config?.requestStartTime || 0);

      performanceMonitor.trackAPIRequest(
        config?.url || 'unknown',
        duration,
        error.response?.status || 0
      );

      return Promise.reject(error);
    }
  );
}

// =============================================================================
// Performance Report
// =============================================================================

/**
 * Generate performance report
 */
export function generatePerformanceReport(): string {
  const metrics = performanceMonitor.getMetrics();
  const webVitals = performanceMonitor.getWebVitals();

  let report = '=== Performance Report ===\n\n';

  // Core Web Vitals
  report += 'Core Web Vitals:\n';
  if (webVitals.LCP) report += `  LCP: ${webVitals.LCP.toFixed(0)}ms ${getWebVitalRating('LCP', webVitals.LCP)}\n`;
  if (webVitals.FID) report += `  FID: ${webVitals.FID.toFixed(0)}ms ${getWebVitalRating('FID', webVitals.FID)}\n`;
  if (webVitals.CLS) report += `  CLS: ${webVitals.CLS.toFixed(3)} ${getWebVitalRating('CLS', webVitals.CLS)}\n`;
  if (webVitals.TTFB) report += `  TTFB: ${webVitals.TTFB.toFixed(0)}ms ${getWebVitalRating('TTFB', webVitals.TTFB)}\n`;
  if (webVitals.FCP) report += `  FCP: ${webVitals.FCP.toFixed(0)}ms\n`;

  report += '\n';

  // API Performance
  const apiMetrics = metrics.filter((m) => m.name.startsWith('API:'));
  if (apiMetrics.length > 0) {
    report += 'API Requests:\n';
    const avgDuration = apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length;
    report += `  Average: ${avgDuration.toFixed(0)}ms\n`;
    report += `  Total: ${apiMetrics.length}\n\n`;
  }

  // Component Renders
  const renderMetrics = metrics.filter((m) => m.name.startsWith('Render:'));
  if (renderMetrics.length > 0) {
    report += 'Component Renders:\n';
    renderMetrics
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .forEach((m) => {
        report += `  ${m.name}: ${m.value.toFixed(0)}ms\n`;
      });
    report += '\n';
  }

  return report;
}

/**
 * Get Web Vital rating (Good, Needs Improvement, Poor)
 */
function getWebVitalRating(metric: string, value: number): string {
  const thresholds: Record<string, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[metric];
  if (!threshold) return '';

  if (value <= threshold.good) return '✅ Good';
  if (value <= threshold.poor) return '⚠️ Needs Improvement';
  return '❌ Poor';
}

// =============================================================================
// Export Main Monitor Instance
// =============================================================================

export default performanceMonitor;
