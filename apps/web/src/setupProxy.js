/**
 * Development Proxy Configuration
 *
 * This file configures the webpack dev server proxy and adds security headers.
 * Note: This runs during development with `npm start`
 *
 * Security Headers:
 * - Content-Security-Policy: Prevents loading of external scripts/resources
 * - X-Frame-Options: Prevents clickjacking
 * - X-Content-Type-Options: Prevents MIME sniffing
 *
 * IMPORTANT: These headers do NOT prevent browser extensions from injecting DOM.
 * Extensions operate at the browser level, outside of CSP scope.
 * See CONTRIBUTING.md for how to handle extension injection during development.
 */

module.exports = function(app) {
  // Add security headers to all responses
  app.use((req, res, next) => {
    // Content Security Policy
    // Allows: self, inline styles (for React), and eval (for dev server HMR)
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval'", // unsafe-eval needed for dev server HMR
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Google Fonts stylesheets
        "img-src 'self' data: blob:",
        "font-src 'self' data: https://fonts.gstatic.com", // Google Fonts files
        "connect-src 'self' http://localhost:* ws://localhost:* http://192.168.1.63:*", // Allow API and WebSocket
        "frame-ancestors 'none'", // Prevent embedding
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ')
    );

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Disable client-side caching for development
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    next();
  });

  // Proxy API requests to backend server
  const { createProxyMiddleware } = require('http-proxy-middleware');

  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      changeOrigin: true,
    })
  );
};
