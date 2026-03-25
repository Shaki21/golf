# TIER Golf - IUP Platform

> Production-ready Individual Development Plan (IUP) platform for junior golf training academies

[![Status](https://img.shields.io/badge/Status-Production-success)]()
[![Version](https://img.shields.io/badge/Version-1.2.0-blue)]()
[![Node](https://img.shields.io/badge/Node-20+-green)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)]()
[![pnpm](https://img.shields.io/badge/pnpm-8.12+-orange)]()
[![Test Coverage](https://img.shields.io/badge/Coverage-45%25-brightgreen)]()
[![Security](https://img.shields.io/badge/Security-Good-green)]()

---

## 🚀 Latest Updates (January 2026)

### Recently Completed
- ✅ **TIER Design System Migration** (Jan 6) - Complete rebrand with Nordic Minimalism v3.1
- ✅ **OAuth & Stripe Integration** (Jan 7) - Full payment and authentication infrastructure
- ✅ **DataGolf API Integration** (Jan 7) - Live tournament data and player statistics
- ✅ **Project Documentation Overhaul** (Jan 8) - Developer handoff, roadmap, technical highlights

### For New Developers
- 📖 **Start Here:** [Developer Handoff](./DEVELOPER_HANDOFF.md) - Complete onboarding guide
- 🎨 **Design System:** [TIER Golf Design System](./TIER_GOLF_DESIGN_SYSTEM.md) - UI/UX specification
- ⚙️ **Installation:** [Installation Instructions](./INSTALLATION_INSTRUCTIONS.md) - Detailed setup

### Previous Updates (December 2025)
- **Video Analysis System** - Complete video upload with S3 multipart support, annotations, and comparisons
- **Two-Factor Authentication** - TOTP with backup codes
- **Test Coverage** - 45%+ with 240+ test cases
- **Performance Optimization** - 50+ database indexes, Redis caching strategy
- **Documentation Restructure** - Professional Google-style documentation standards

---

## Overview

Enterprise-grade coaching platform for TIER Golf with production-ready monitoring, security, and DevOps infrastructure.

## Project at a Glance

**Domain:** Individual Development Plans (IUP) for junior golf academies
**Scale:** Multi-tenant SaaS supporting 50+ players per academy
**Complexity:** 113 Prisma models, 70+ REST endpoints, 33 test files
**Status:** Production-ready with monitoring, 2FA, video analysis, real-time updates

**Core Values:**
- Digitizes Team Norway's proven IUP methodology for junior golf development
- Tracks progress across 11 categories (A-K) with 20+ standardized test protocols
- Enables data-driven coaching decisions through peer comparison and breaking point detection
- Replaces Excel-based tracking with a production-ready system

**Technical Sophistication:**
- Monorepo with shared design system and database layer
- Multi-tenant architecture with organization-level data isolation
- Real-time WebSocket updates for coach-player collaboration
- S3-based video analysis with annotation and comparison features
- Comprehensive observability (Prometheus, Grafana, Sentry)

### Key Features

- **Individual Development Plans** - Track progress across 11 categories (A-K) following Team Norway methodology
- **20+ Test Protocols** - Comprehensive testing for driver, approach, short game, putting, physical fitness
- **Advanced Analytics** - Peer comparison, breaking point detection, progress tracking
- **Training Plans** - Periodization with E/G/S/T phases and automated scheduling
- **Booking System** - Coach availability and session management with calendar integration
- **Real-time Updates** - WebSocket-based live updates for coaches and players
- **Multi-tenant Architecture** - Secure organization isolation with role-based access control
- **Video Analysis** - Complete video upload with S3 multipart support, annotations, comparisons, progress tracking, and coach review workflows
- **Two-Factor Authentication** - TOTP-based 2FA with backup codes for enhanced security
- **Audit Logging** - Comprehensive activity tracking for compliance and security

### Production Features

- **Monitoring & Observability** - Prometheus metrics, Grafana dashboards, Sentry error tracking
- **Security** - JWT authentication, rate limiting, CORS protection, SQL injection prevention
- **CI/CD Pipeline** - Automated testing, security scanning, deployment to staging/production
- **Documentation** - Comprehensive API docs, runbooks, and operational procedures

---

## Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop
- pnpm (`npm install -g pnpm`)

### Setup (5 minutes)

```bash
# 1. Start infrastructure
cd apps/api
docker-compose up -d

# 2. Setup database
pnpm install
npx prisma generate
npx prisma migrate deploy
pnpm run prisma:seed

# 3. Start backend
pnpm dev
# http://localhost:3000

# 4. Start frontend (new terminal)
cd ../web
pnpm install
pnpm start
# http://localhost:3001
```

### Demo Login

| Role   | Email            | Password  |
|--------|------------------|-----------|
| Admin  | admin@demo.com   | admin123  |
| Coach  | coach@demo.com   | coach123  |
| Player | player@demo.com  | player123 |

### Common Setup Issues

**Problem:** Prisma client error
```bash
# Solution: Regenerate Prisma client
cd apps/api
npx prisma generate
```

**Problem:** Port already in use (3000/3001)
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Problem:** Docker containers won't start
```bash
# Reset Docker state
docker-compose down -v
docker-compose up -d
```

**First-time setup taking too long?**
- Initial seed creates test data for 5 players with full history
- Expect 2-3 minutes for seed on first run
- Subsequent startups: <30 seconds

---

## Project Structure

```
IUP_Master_V1/
├── apps/
│   ├── api/              # Fastify backend (40+ endpoints)
│   ├── web/              # React frontend
│   └── golfer/           # Mobile app (Ionic/Capacitor)
│
├── packages/
│   ├── database/         # Shared Prisma schema
│   └── design-system/    # UI components & tokens
│
├── docs/                 # Documentation
│   ├── features/         # Feature-specific docs
│   ├── api/              # API documentation
│   ├── mockups/          # UI mockups
│   └── archive/          # Historical docs
│
├── scripts/              # Utility scripts
│   ├── migrations/       # Database migrations
│   └── testing/          # Test scripts
│
├── config/               # Infrastructure config
└── data/                 # Reference data
```

---

## Technology Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router 7, Axios   |
| Backend    | Fastify 4, Prisma 5, Zod          |
| Database   | PostgreSQL 16, Redis 7            |
| Storage    | AWS S3, MinIO (local dev)         |
| Auth       | JWT, Argon2, TOTP (Speakeasy)     |
| Security   | 2FA, Password Reset, Helmet.js    |
| Testing    | Jest, Playwright, K6              |
| Design     | Inter font, Blue Palette 01       |
| Build      | pnpm, Turbo, Docker               |

---

## Code Quality Indicators

### Test Coverage
- **45%+ total coverage** (240+ test cases)
- **33 test files** covering critical paths
- **3 security test suites** (XSS, SQL injection, RBAC)
- **Integration tests** for all major API modules
- **Unit tests** for domain logic (focus engine, badge evaluator, video services)

### CI/CD Pipeline
- **Automated on every PR:** Lint → Security Audit → Tests → Build
- **Design System Gate:** Blocks PRs that break design tokens (BLOCKING)
- **Security scanning:** Snyk + pnpm audit
- **Multi-stage deployment:** develop → staging → main → production
- **Test environments:** PostgreSQL 16 + Redis 7 in CI

### Code Standards
- **TypeScript strict mode** on backend (100% coverage, 270 files)
- **ESLint + Prettier** enforced in CI
- **Conventional commits** for changelog generation
- **ADRs for major decisions** (Architecture Decision Records)
- **PR reviews required** before merge

### Production Features
- **Zero-downtime migrations** via Prisma
- **Prometheus metrics** exported on `/metrics`
- **Sentry error tracking** with profiling
- **Rate limiting** per endpoint
- **CORS protection** with whitelist
- **Helmet.js security headers**
- **PII redaction** in logs

---

## Design System

**Design System:** Nordic Minimalism v3.1 | **Status:** Production Ready

| Element | Specification |
|---------|---------------|
| **Primary Color** | Current Blue (#10456A) |
| **Font** | Inter (Apple HIG scale) |
| **Border Radius** | 12px (standard), 8px (small) |
| **Spacing** | 4px grid system |
| **Shadows** | 6-level system with subtle blue tint |

### Design Resources

- **Design Tokens:** `apps/web/src/design-tokens.js`
- **UI Components:** `apps/web/src/ui/` (primitives + composites)
- **Design System Docs:** `docs/AK_GOLF_DESIGN_SYSTEM_COMPLETE.md`

---

## Documentation

| Category | Document | Description |
|----------|----------|-------------|
| **Getting Started** | [Quick Start](#quick-start) | Get up and running in 5 minutes |
| | [Documentation Index](./docs/README.md) | Complete documentation overview |
| | [Development Guide](./docs/guides/development.md) | Local development setup |
| **API** | [OpenAPI Spec](./apps/api/docs/openapi.yaml) | OpenAPI 3.1 specification |
| | [API Overview](./docs/api/README.md) | API documentation |
| | Interactive Docs | http://localhost:3000/docs (Swagger UI) |
| **Architecture** | [Architecture Overview](./docs/architecture/overview.md) | System architecture |
| | [ADRs](./docs/architecture/decisions/) | Architecture Decision Records |
| **Operations** | [Deployment Guide](./docs/guides/deployment.md) | Production deployment |
| | [Testing Guide](./docs/guides/testing.md) | Testing strategy |
| | [Monitoring](./docs/operations/monitoring.md) | Metrics and alerts |

### API Authentication

```bash
# Get access token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@demo.com","password":"coach123"}'

# Use token in requests
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/api/v1/players
```

---

## Monitoring & Observability

### Health Checks

```bash
# Application health
curl http://localhost:3001/health

# Readiness probe (Kubernetes)
curl http://localhost:3001/ready

# Liveness probe (Kubernetes)
curl http://localhost:3001/live

# Prometheus metrics
curl http://localhost:3001/metrics
```

### Key Metrics

| Metric | Target | Purpose |
|--------|--------|---------|
| Error Rate | < 0.1% | Application stability |
| Response Time (p95) | < 200ms | User experience |
| Uptime | > 99.9% | Service availability |
| Database Query Time (p95) | < 100ms | Database performance |

### Dashboards

- **Grafana:** Metrics visualization and alerting
- **Sentry:** Error tracking and performance monitoring
- **Prometheus:** Time-series metrics collection

See [Monitoring Guide](./docs/operations/monitoring.md) for dashboard setup instructions.

---

## Development

### Running Tests

```bash
# Backend tests
cd apps/api && pnpm test

# Frontend tests
cd apps/web && pnpm test

# E2E tests
pnpm test:e2e
```

### Database Operations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Seed database
pnpm run prisma:seed
```

---

## Deployment

### Environments

| Environment | Branch | Auto-Deploy | URL |
|------------|--------|-------------|-----|
| Development | feature/* | No | localhost:3001 |
| Staging | develop | Yes (CI/CD) | staging-api.iup-golf.com |
| Production | main | Manual | api.iup-golf.com |

### CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **Lint & Type Check** - ESLint and TypeScript validation
2. **Security Audit** - pnpm audit and Snyk security scan
3. **Test** - Unit, integration, and E2E tests
4. **Build** - Production build with artifact upload
5. **Deploy** - Automatic deployment to staging (develop) or production (main)

**Pipeline Status:** View in [GitHub Actions](.github/workflows/ci.yml)

### Deployment Process

```bash
# Deploy to staging
git checkout develop
git merge feature/your-feature
git push origin develop
# Auto-deploys via CI/CD

# Deploy to production
git checkout main
git merge develop
git push origin main
# Review and approve deployment via GitHub Actions
```

See [Deployment Guide](./docs/operations/deployment.md) for detailed procedures.

### Quick Deploy Commands

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Database migrations
pnpm --filter iup-golf-backend prisma migrate deploy
```

---

## Security

### Authentication & Authorization

- **JWT Tokens:** Access tokens (15 min) + Refresh tokens (7 days)
- **Password Hashing:** Argon2 with salt
- **Role-Based Access Control:** Admin, Coach, Player roles
- **Multi-tenant Isolation:** Secure organization-level data separation

### Security Features

- **Rate Limiting:** Configurable per endpoint
- **CORS Protection:** Whitelist-based origins
- **Helmet.js:** Security headers (CSP, XSS protection)
- **Input Validation:** Zod schema validation
- **SQL Injection Prevention:** Prisma ORM with parameterized queries
- **PII Redaction:** Automatic redaction in logs and error tracking

### Security Monitoring

- **Sentry:** Real-time error tracking and alerting
- **Security Audits:** Automated vulnerability scanning in CI/CD
- **Log Monitoring:** Structured logging with PII redaction

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Code Standards

- TypeScript for backend
- ESLint + Prettier formatting
- Conventional commits
- PR reviews required

---

## License

Proprietary - TIER Golf
© 2025 All Rights Reserved

---

**Built for Norwegian junior golfers following Team Norway IUP methodology**
