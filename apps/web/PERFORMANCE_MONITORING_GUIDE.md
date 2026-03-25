# Performance Monitoring Guide

**Status:** ✅ Implemented
**Date:** 2026-01-12

---

## Overview

Comprehensive performance monitoring system that tracks:
- ✅ Core Web Vitals (LCP, FID, CLS, TTFB, FCP)
- ✅ Page load times
- ✅ Component render times
- ✅ API request durations
- ✅ Route transition times
- ✅ Custom performance marks

---

## Quick Start

### 1. Setup (in api.ts)

```typescript
import { addPerformanceInterceptor } from '../utils/performanceMonitor';

// Add performance tracking to axios
addPerformanceInterceptor(api);
```

### 2. Setup (in App.tsx)

```typescript
import { useRoutePerformance } from '../utils/performanceMonitor';

function App() {
  // Track route transitions automatically
  useRoutePerformance();

  return <Routes>...</Routes>;
}
```

### 3. Install web-vitals (Optional but Recommended)

```bash
npm install web-vitals
```

This enables accurate Core Web Vitals tracking. Without it, the monitor uses the Performance API as a fallback.

---

## Usage

### Track Component Render Time

```typescript
import { usePerformanceTracker } from '../utils/performanceMonitor';

function MyComponent() {
  // Automatically tracks mount time
  usePerformanceTracker('MyComponent');

  return <div>Content</div>;
}

// Output: [Performance] Render: MyComponent: 45.23 ms
```

### Track Custom Operations

```typescript
import { useOperationTracker } from '../utils/performanceMonitor';

function SearchComponent() {
  const { start, end } = useOperationTracker();

  const handleSearch = async (query: string) => {
    start('search');

    const results = await api.search(query);

    end('search', { query, resultsCount: results.length });

    return results;
  };

  return <SearchBar onSearch={handleSearch} />;
}

// Output: [Performance] search: 234.56 ms {query: "golf", resultsCount: 42}
```

### Manual Performance Marks

```typescript
import performanceMonitor from '../utils/performanceMonitor';

// Mark start
performanceMonitor.mark('data-processing');

// Do expensive operation
processData(largeDataset);

// Measure duration
performanceMonitor.measure('data-processing');

// Output: [Performance] data-processing: 156.78 ms
```

### Track API Requests (Automatic)

Once `addPerformanceInterceptor(api)` is added, all API requests are automatically tracked:

```typescript
// This request is automatically tracked
await api.get('/players');

// Output: [Performance] API: /players: 123.45 ms {status: 200}
```

### Generate Performance Report

```typescript
import { generatePerformanceReport } from '../utils/performanceMonitor';

// Generate report (useful for debugging)
const report = generatePerformanceReport();
console.log(report);

// Output:
// === Performance Report ===
//
// Core Web Vitals:
//   LCP: 1234ms ✅ Good
//   FID: 45ms ✅ Good
//   CLS: 0.05 ✅ Good
//   TTFB: 567ms ✅ Good
//   FCP: 890ms
//
// API Requests:
//   Average: 234ms
//   Total: 25
//
// Component Renders:
//   Render: Dashboard: 156ms
//   Render: TrainingHub: 123ms
//   Render: GoalsPage: 98ms
```

---

## Core Web Vitals

### What They Mean

**LCP (Largest Contentful Paint)**
- Time until largest content element is visible
- **Good:** < 2.5s
- **Needs Improvement:** 2.5s - 4s
- **Poor:** > 4s

**FID (First Input Delay)**
- Time from user interaction to browser response
- **Good:** < 100ms
- **Needs Improvement:** 100ms - 300ms
- **Poor:** > 300ms

**CLS (Cumulative Layout Shift)**
- Visual stability (how much content shifts)
- **Good:** < 0.1
- **Needs Improvement:** 0.1 - 0.25
- **Poor:** > 0.25

**TTFB (Time to First Byte)**
- Server response time
- **Good:** < 800ms
- **Needs Improvement:** 800ms - 1800ms
- **Poor:** > 1800ms

**FCP (First Contentful Paint)**
- Time until first content is visible
- **Good:** < 1.8s

### How to Improve

**Improve LCP:**
- Optimize images (use WebP, lazy load)
- Preload critical resources
- Reduce server response time
- Implement code splitting

**Improve FID:**
- Break up long JavaScript tasks
- Use web workers for heavy computations
- Implement code splitting
- Defer non-critical JavaScript

**Improve CLS:**
- Specify image dimensions
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use transform for animations (not top/left)

**Improve TTFB:**
- Use CDN
- Optimize server code
- Implement caching
- Use faster hosting

---

## React Integration

### Track Page Load

```typescript
import { useEffect } from 'react';
import performanceMonitor from '../utils/performanceMonitor';

function Dashboard() {
  usePerformanceTracker('Dashboard');

  useEffect(() => {
    // Track when data is ready
    performanceMonitor.mark('dashboard-ready');

    // Simulate data loading
    fetchDashboardData().then(() => {
      performanceMonitor.measure('dashboard-ready');
    });
  }, []);

  return <div>Dashboard Content</div>;
}
```

### Track User Interactions

```typescript
import performanceMonitor from '../utils/performanceMonitor';

function GoalForm() {
  const handleSubmit = async (data) => {
    performanceMonitor.mark('goal-creation');

    await api.post('/goals', data);

    performanceMonitor.measure('goal-creation');
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Debug Slow Components

```typescript
import { usePerformanceTracker } from '../utils/performanceMonitor';

function ExpensiveComponent() {
  usePerformanceTracker('ExpensiveComponent');

  // If this logs > 100ms, investigate:
  // - Unnecessary re-renders
  // - Heavy computations
  // - Large data processing

  return <div>...</div>;
}
```

---

## Monitoring in Production

### Setup Analytics Endpoint

```typescript
// In performanceMonitor.ts or environment config
export const performanceMonitor = new PerformanceMonitor({
  enabled: true,
  reportEndpoint: process.env.REACT_APP_PERFORMANCE_ENDPOINT,
});
```

### Google Analytics Integration

```typescript
import performanceMonitor from '../utils/performanceMonitor';

// Send Core Web Vitals to GA
const vitals = performanceMonitor.getWebVitals();

if (vitals.LCP) {
  ga('send', 'event', {
    eventCategory: 'Web Vitals',
    eventAction: 'LCP',
    eventValue: Math.round(vitals.LCP),
    nonInteraction: true,
  });
}
```

### Sentry Integration

```typescript
import * as Sentry from '@sentry/react';
import performanceMonitor from '../utils/performanceMonitor';

// Send performance data to Sentry
const vitals = performanceMonitor.getWebVitals();

Sentry.setMeasurement('lcp', vitals.LCP || 0, 'millisecond');
Sentry.setMeasurement('fid', vitals.FID || 0, 'millisecond');
Sentry.setMeasurement('cls', vitals.CLS || 0, 'none');
```

---

## Performance Budgets

Set performance budgets to maintain fast experience:

```typescript
// performance-budgets.ts
export const PERFORMANCE_BUDGETS = {
  // Core Web Vitals targets
  LCP: 2000, // 2 seconds
  FID: 50, // 50ms
  CLS: 0.05, // 0.05

  // Page load targets
  pageLoad: 3000, // 3 seconds
  timeToInteractive: 3500, // 3.5 seconds

  // Component render targets
  componentRender: 50, // 50ms
  routeTransition: 500, // 500ms

  // API request targets
  apiRequest: 300, // 300ms
};

// Check if within budget
const vitals = performanceMonitor.getWebVitals();

if (vitals.LCP && vitals.LCP > PERFORMANCE_BUDGETS.LCP) {
  console.warn('⚠️ LCP exceeds budget:', vitals.LCP, 'ms');
  // Send alert to monitoring service
}
```

---

## Debugging Performance Issues

### 1. Identify Slow Components

```typescript
// Get all render metrics
const metrics = performanceMonitor.getMetrics();
const renders = metrics.filter((m) => m.name.startsWith('Render:'));

// Sort by duration (slowest first)
const slowest = renders.sort((a, b) => b.value - a.value);

console.log('Slowest components:', slowest.slice(0, 5));

// Output:
// [
//   { name: 'Render: Dashboard', value: 234 },
//   { name: 'Render: TrainingHub', value: 189 },
//   { name: 'Render: VideoPlayer', value: 156 },
// ]
```

### 2. Identify Slow API Requests

```typescript
const apiMetrics = performanceMonitor.getMetrics().filter((m) => m.name.startsWith('API:'));

const slowAPIs = apiMetrics.filter((m) => m.value > 500); // > 500ms

console.log('Slow API requests:', slowAPIs);

// Optimize these endpoints:
// - Add caching
// - Optimize database queries
// - Reduce payload size
```

### 3. Track Route Performance

```typescript
// Route transitions are automatically tracked
const routeMetrics = performanceMonitor.getMetrics().filter((m) => m.name === 'Route Change');

const slowRoutes = routeMetrics.filter((m) => m.value > 500);

console.log('Slow route transitions:', slowRoutes);

// Optimize:
// - Add route prefetching
// - Lazy load heavy components
// - Reduce initial data fetching
```

---

## Performance Testing

### Lighthouse CI

Add to CI/CD pipeline:

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://staging.tiergolf.com
            https://staging.tiergolf.com/dashboard
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

### Budget Configuration

```json
// lighthouse-budget.json
{
  "budgets": [
    {
      "path": "/*",
      "timings": [
        {
          "metric": "interactive",
          "budget": 3500
        },
        {
          "metric": "first-contentful-paint",
          "budget": 1800
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 300
        },
        {
          "resourceType": "image",
          "budget": 500
        }
      ]
    }
  ]
}
```

---

## Best Practices

### ✅ DO

1. **Track critical user flows**
   ```typescript
   // Track important interactions
   performanceMonitor.mark('checkout-start');
   // ... checkout process
   performanceMonitor.measure('checkout-start');
   ```

2. **Monitor in production**
   ```typescript
   // Send metrics to analytics
   const vitals = performanceMonitor.getWebVitals();
   analytics.track('performance', vitals);
   ```

3. **Set performance budgets**
   ```typescript
   // Fail CI if budgets exceeded
   if (vitals.LCP > 2500) {
     throw new Error('LCP budget exceeded');
   }
   ```

4. **Track API performance**
   ```typescript
   // Already automatic with interceptor
   addPerformanceInterceptor(api);
   ```

### ❌ DON'T

1. **Don't track every component**
   ```typescript
   // ❌ Bad - too much noise
   usePerformanceTracker('TinyButton');

   // ✅ Good - track important pages
   usePerformanceTracker('Dashboard');
   ```

2. **Don't block user experience**
   ```typescript
   // ❌ Bad - synchronous reporting
   sendToAnalyticsSync(metrics);

   // ✅ Good - async reporting
   navigator.sendBeacon(endpoint, JSON.stringify(metrics));
   ```

3. **Don't over-report**
   ```typescript
   // ❌ Bad - report every metric
   metrics.forEach(m => sendToAnalytics(m));

   // ✅ Good - batch and sample
   if (Math.random() < 0.1) { // 10% sampling
     sendToAnalytics(metrics);
   }
   ```

---

## Summary

**Created:**
- ✅ Performance monitoring utility
- ✅ Core Web Vitals tracking
- ✅ React hooks for performance tracking
- ✅ Axios interceptor for API monitoring
- ✅ Performance report generation

**Key Metrics:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)
- Component render times
- API request durations
- Route transition times

**Next Steps:**
1. Add `addPerformanceInterceptor(api)` to api.ts
2. Add `useRoutePerformance()` to App.tsx
3. Install web-vitals: `npm install web-vitals`
4. Set up performance budgets
5. Configure monitoring endpoint for production
6. Run Lighthouse audits regularly

---

**Status:** Production Ready ✅
**Estimated Setup Time:** 15 minutes
**Impact:** Proactive performance monitoring and debugging
