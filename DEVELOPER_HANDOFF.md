# Developer Handoff Document

**Project:** TIER Golf - IUP Platform
**Date:** January 2026
**For:** Senior Developer

---

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 20+ (`node -v`)
- pnpm 8+ (`pnpm -v`)
- Docker Desktop running

### Setup Commands
```bash
# 1. Start PostgreSQL & Redis
cd apps/api
docker-compose up -d

# 2. Install dependencies (from root)
cd ../..
pnpm install

# 3. Generate Prisma client & run migrations
cd apps/api
npx prisma generate
npx prisma migrate deploy

# 4. Seed database with demo data
pnpm run prisma:seed

# 5. Start backend
pnpm dev
# API: http://localhost:4000

# 6. Start frontend (new terminal, from apps/web)
cd apps/web
pnpm dev
# Web: http://localhost:3000
```

### Demo Accounts
| Role   | Email            | Password  |
|--------|------------------|-----------|
| Admin  | admin@demo.com   | admin123  |
| Coach  | coach@demo.com   | coach123  |
| Player | player@demo.com  | player123 |

---

## Project Overview

**Domain:** Individual Development Plans (IUP) for junior golf training academies
**Architecture:** Multi-tenant SaaS supporting 50+ players per academy
**Stack:** React + Fastify + PostgreSQL + Redis

### What It Does
- Digitizes Team Norway's proven IUP methodology for junior golf development
- Tracks player progress across 11 categories (A-K) with 20+ standardized test protocols
- Enables data-driven coaching decisions through peer comparison and breaking point detection
- Provides booking system for coach-player session scheduling

---

## Architecture

### Monorepo Structure
```
IUP_Master_V1/
├── apps/
│   ├── api/              # Fastify backend (TypeScript)
│   │   ├── src/
│   │   │   ├── api/v1/   # REST endpoints
│   │   │   ├── domain/   # Business logic
│   │   │   ├── core/     # DB, auth, middleware
│   │   │   └── utils/    # Helpers
│   │   └── prisma/       # Database schema (113 models)
│   │
│   └── web/              # React frontend
│       ├── src/
│       │   ├── features/ # Feature modules
│       │   ├── components/
│       │   ├── ui/       # Design system components
│       │   └── contexts/ # React contexts
│       └── public/
│
├── CLAUDE.md             # AI assistant guidelines
├── INSTALLATION_INSTRUCTIONS.md
├── TIER_GOLF_DESIGN_SYSTEM.md
└── README.md
```

### Technology Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router, Axios     |
| Backend    | Fastify 4, Prisma 5, Zod          |
| Database   | PostgreSQL 16, Redis 7            |
| Auth       | JWT, Argon2, TOTP 2FA             |
| Storage    | AWS S3 / MinIO (local)            |
| Testing    | Jest, Vitest                      |

### Key Patterns

1. **Multi-Tenant Isolation**
   - `apps/api/src/middleware/tenant.middleware.ts`
   - Organization-scoped queries via Prisma middleware

2. **Three-Layer Design Tokens**
   - Primitives → Semantic Tokens → Tailwind Classes
   - `apps/web/src/design-tokens.js`

3. **Decision-First Dashboard Pattern**
   - State machine determines primary user action
   - See `apps/api/src/api/v1/plan-dashboard/service.ts`

---

## Key Directories

### Backend (`apps/api/src/`)

| Directory | Purpose |
|-----------|---------|
| `api/v1/` | REST API endpoints by feature |
| `domain/` | Business logic (performance, training plans) |
| `core/db/` | Prisma client setup |
| `core/auth/` | JWT authentication |
| `middleware/` | Request middleware |

### Frontend (`apps/web/src/`)

| Directory | Purpose |
|-----------|---------|
| `features/` | Feature modules (plan, training, analysis) |
| `components/` | Shared components |
| `ui/` | Design system primitives & composites |
| `contexts/` | Auth, notifications, etc. |
| `config/` | Navigation, feature flags |

---

## Database

### Key Models (113 total in Prisma schema)
- `User`, `Player`, `Coach`, `Tenant`
- `TrainingSession`, `TestResult`, `Goal`
- `AnnualTrainingPlan`, `Tournament`
- `Message`, `Notification`

### Commands
```bash
cd apps/api

# View schema
cat prisma/schema.prisma

# Open Prisma Studio (GUI)
npx prisma studio

# Generate client after schema changes
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name
```

---

## API Endpoints

Base URL: `http://localhost:4000/api/v1`

### Core Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/players` | List players |
| GET | `/players/:id` | Get player details |
| GET | `/plan-dashboard` | Player dashboard data |
| GET | `/coach-plan-dashboard` | Coach dashboard data |
| GET | `/training-sessions` | Training sessions |
| GET | `/test-results` | Test results |

### Authentication
```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@demo.com","password":"coach123"}' | jq -r '.accessToken')

# Use token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/v1/players
```

---

## Design System

**Theme:** TIER Golf - Nordic Minimalism v3.1

| Element | Value |
|---------|-------|
| Primary (Navy) | `#0A2540` |
| Accent (Gold) | `#C9A227` |
| Font | Inter |
| Border Radius | 12px (cards), 8px (buttons) |
| Spacing | 4px grid |

See `TIER_GOLF_DESIGN_SYSTEM.md` for complete specification.

---

## User Roles

| Role | Capabilities |
|------|--------------|
| **Player** | View own plan, log training, see progress |
| **Coach** | Manage players, create plans, review sessions |
| **Admin** | Full system access, user management |
| **Parent** | View child's progress (limited) |

---

## Development Commands

```bash
# From project root
pnpm install          # Install all dependencies
pnpm dev              # Start both API and web

# Backend only (apps/api)
pnpm dev              # Start API server
pnpm test             # Run tests
pnpm lint             # Lint code

# Frontend only (apps/web)
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm test             # Run tests
```

---

## Common Issues

### "Prisma Client Not Generated"
```bash
cd apps/api && npx prisma generate
```

### "Port Already in Use"
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

### "Docker Containers Won't Start"
```bash
docker-compose down -v
docker-compose up -d
```

---

## What's Working

- User authentication with JWT + 2FA
- Player and Coach dashboards
- Training session logging
- Test result tracking with 20+ protocols
- Annual plan management
- Booking system
- Real-time notifications
- Multi-tenant data isolation

---

## Code Quality

- Backend: 100% TypeScript strict mode
- Frontend: TypeScript + ESLint + Prettier
- Tests: Jest unit tests, 45% coverage
- CI/CD: GitHub Actions (lint, test, build)

---

## First Day Checklist

1. [ ] Run setup commands above
2. [ ] Login as coach@demo.com
3. [ ] Explore the coach dashboard
4. [ ] Review `apps/api/prisma/schema.prisma`
5. [ ] Browse `apps/api/src/api/v1/` endpoints
6. [ ] Check `apps/web/src/features/` modules
7. [ ] Read `TIER_GOLF_DESIGN_SYSTEM.md`

---

**The code is the documentation.** A 30-year developer will understand the patterns by reading the source. Key entry points:

- `apps/api/src/app.ts` - API entry point
- `apps/web/src/App.jsx` - Frontend entry point
- `apps/api/prisma/schema.prisma` - Data model

Welcome aboard!
