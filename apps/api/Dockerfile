# =============================================================================
# IUP Golf Academy API - Production Dockerfile
# Multi-stage build for optimized image size
# Build: 2026-01-03 v2 - Added SAMLING feature
# =============================================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Set build arg for DATABASE_URL
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Install dependencies needed for Prisma and native modules
RUN apk add --no-cache libc6-compat openssl

# Copy package files
COPY package.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install runtime dependencies
RUN apk add --no-cache libc6-compat openssl curl

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 api

# Copy built application
COPY --from=builder --chown=api:nodejs /app/dist ./dist
COPY --from=builder --chown=api:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /app/prisma ./prisma
COPY --from=builder --chown=api:nodejs /app/package.json ./

# Switch to non-root user
USER api

# Expose port
EXPOSE 3000

# Health check - use /live for lightweight liveness probe
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/live || exit 1

# Run database migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
