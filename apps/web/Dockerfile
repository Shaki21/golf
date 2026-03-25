# =============================================================================
# IUP Golf Academy Web - Production Dockerfile
# Multi-stage build with Nginx for serving
#
# IMPORTANT: Service Worker caching is DISABLED by default.
# To enable PWA, set REACT_APP_ENABLE_PWA=true in Railway.
# =============================================================================

# Stage 1: Build the React application
FROM node:20-alpine AS builder
WORKDIR /app

# Set production API URL
ENV REACT_APP_API_URL=https://iup-golf-backend-production.up.railway.app/api/v1

# Disable CI mode to allow build with ESLint warnings
ENV CI=false

# Build info - Railway automatically provides these as build args
# See: https://docs.railway.app/reference/variables#railway-provided-variables
ARG RAILWAY_GIT_COMMIT_SHA
ARG RAILWAY_GIT_BRANCH

# Cache buster - use commit SHA to invalidate Docker cache on new commits
# This ensures fresh builds when code changes
ARG CACHEBUST=${RAILWAY_GIT_COMMIT_SHA}
# Force rebuild: 2026-01-04-2311-fix-react-310

# Map Railway variables to CRA-compatible env vars (REACT_APP_* prefix required)
ENV REACT_APP_BUILD_SHA=${RAILWAY_GIT_COMMIT_SHA:-local}
ENV REACT_APP_BUILD_BRANCH=${RAILWAY_GIT_BRANCH:-local}

# PWA is DISABLED by default to prevent stale UI issues
# Set REACT_APP_ENABLE_PWA=true in Railway to enable offline support
ARG REACT_APP_ENABLE_PWA=false
ENV REACT_APP_ENABLE_PWA=${REACT_APP_ENABLE_PWA}

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Set build date at build time (dynamic)
RUN export REACT_APP_BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") && \
    echo "REACT_APP_BUILD_DATE=$REACT_APP_BUILD_DATE" >> .env.production.local && \
    echo "=== BUILD INFO ===" && \
    echo "Commit SHA: $REACT_APP_BUILD_SHA" && \
    echo "Branch: $REACT_APP_BUILD_BRANCH" && \
    echo "Build Date: $REACT_APP_BUILD_DATE" && \
    echo "PWA Enabled: $REACT_APP_ENABLE_PWA" && \
    echo "=================="

# Force cache invalidation by using CACHEBUST in a RUN command
# This ensures Docker rebuilds when the commit SHA changes
RUN echo "Building commit: ${REACT_APP_BUILD_SHA:-unknown}"

# Build the application
RUN npm run build

# =============================================================================
# CRITICAL: Inject BUILD_SHA into service worker for cache busting
# This ensures each deploy gets a unique cache name
# =============================================================================
RUN if [ -f /app/build/service-worker.js ]; then \
      echo "Injecting BUILD_SHA into service-worker.js..." && \
      sed -i "s/__BUILD_SHA__/${REACT_APP_BUILD_SHA}/g" /app/build/service-worker.js && \
      echo "Service worker updated with SHA: ${REACT_APP_BUILD_SHA}" && \
      head -20 /app/build/service-worker.js; \
    fi

# Stage 2: Serve with Nginx
FROM nginx:alpine AS runner

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# =============================================================================
# DEBUG: Inject build version into index.html for easy verification
# Check: view-source on the page and look for "build-sha" meta tag
# =============================================================================
ARG RAILWAY_GIT_COMMIT_SHA
RUN if [ -n "$RAILWAY_GIT_COMMIT_SHA" ] && [ -f /usr/share/nginx/html/index.html ]; then \
      sed -i "s/<head>/<head><meta name=\"build-sha\" content=\"${RAILWAY_GIT_COMMIT_SHA}\">/" /usr/share/nginx/html/index.html && \
      echo "Injected build SHA into index.html: $RAILWAY_GIT_COMMIT_SHA"; \
    fi

# =============================================================================
# CACHE CONTROL: Ensure browsers always get fresh HTML
# This is critical for service worker updates
# =============================================================================
RUN echo 'location = /index.html { add_header Cache-Control "no-cache, no-store, must-revalidate"; }' > /tmp/cache-headers.conf

# Add non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check - Railway handles this via healthcheckPath in railway.toml
# Using wget since it's available in nginx:alpine
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:${PORT:-80}/health || exit 1

# Run Nginx with envsubst to replace ${PORT} in config
CMD envsubst '${PORT}' < /etc/nginx/conf.d/default.conf > /tmp/nginx.conf && mv /tmp/nginx.conf /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
