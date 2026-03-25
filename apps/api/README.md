# IUP Golf Academy Backend

Enterprise-grade backend for Individual Development Plan (IUP) system for golf training academies. Built with Fastify, Prisma, and TypeScript.

## Status

| Metric | Value |
|--------|-------|
| **Implementation** | Production Ready |
| **API Endpoints** | 70+ endpoints |
| **Test Coverage** | 45%+ |
| **Security Rating** | Good (7.5/10) |

## Quick Start

**New user? Start here**: [QUICK_START.md](./QUICK_START.md)

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Run: `./setup-database.sh`
3. Run: `npm run dev`
4. Open: http://localhost:3000/documentation

**Detailed guides**:
- [QUICK_START.md](./QUICK_START.md) - 5-minute setup guide
- [DOCKER_INSTALLATION_GUIDE.md](./DOCKER_INSTALLATION_GUIDE.md) - Docker installation for macOS
- [SETUP_AND_TEST_GUIDE.md](./SETUP_AND_TEST_GUIDE.md) - Testing guide with examples
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Complete technical documentation
- [INSTALLATION_STATUS.md](./INSTALLATION_STATUS.md) - Implementation status and next steps

## Core Features

- **Multi-tenancy**: Support multiple golf academies with complete data isolation
- **Auto-calculation**: Automatic test result calculation for all 20 IUP tests
- **Peer Comparison**: Percentile ranking and multi-level category comparison
- **Coach Analytics**: Player overview, team analytics, category progression tracking
- **Advanced Filtering**: Filter players by category, gender, age with saved presets
- **DataGolf Integration**: Compare IUP results to professional tour statistics
- **Event-driven architecture**: Transactional outbox pattern for reliable event delivery
- **Media pipeline**: Direct S3 upload with background processing
- **Real-time updates**: WebSocket support for live notifications
- **Type-safe**: Full TypeScript with Prisma ORM
- **High performance**: Fastify framework with Redis caching
- **Security**: JWT authentication, role-based access, rate limiting, audit logging

## New Enhanced APIs

### Test Results with Auto-Calculation
- `POST /api/v1/tests/results/enhanced` - Record test result with automatic calculation
- `GET /api/v1/tests/results/:id/enhanced` - Get result with peer comparison
- Supports all 20 IUP tests (driver distance, accuracy, short game, putting, etc.)
- Automatic PEI (Precision Efficiency Index) calculation for approach tests

### Peer Comparison System
- `GET /api/v1/peer-comparison` - Compare player to peers in same category
- `GET /api/v1/peer-comparison/multi-level` - Compare across all categories (A-K)
- `GET /api/v1/peer-comparison/peer-group` - Get peer group data
- Percentile ranking, z-scores, and statistical analysis

### Coach Analytics Dashboard
- `GET /api/v1/coach-analytics/players/:id/overview` - Complete player overview
- `GET /api/v1/coach-analytics/players/:id/category-progression` - Category readiness
- `POST /api/v1/coach-analytics/compare-players` - Multi-player comparison
- `GET /api/v1/coach-analytics/team/:coachId` - Team analytics
- `GET /api/v1/coach-analytics/dashboard/:coachId` - Coach dashboard

### Advanced Filter System
- `POST /api/v1/filters/apply` - Apply complex filter criteria
- `POST /api/v1/filters` - Create saved filter preset
- `GET /api/v1/filters/suggestions` - Get filter suggestions
- Filter by category, gender, age, completion rate, pass/fail status

### DataGolf Integration
- `GET /api/v1/datagolf/compare` - Compare player to PGA/European/Korn Ferry tour
- `GET /api/v1/datagolf/tour-averages` - Get tour statistics
- 20 IUP test to DataGolf metric mappings with correlation strengths

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Fastify 4.x |
| **ORM** | Prisma 5.x |
| **Database** | PostgreSQL 15+ |
| **Cache** | Redis 7+ |
| **Queue** | BullMQ |
| **Storage** | S3 / MinIO |
| **Auth** | JWT + Argon2 + TOTP (2FA) |
| **Validation** | Zod |
| **Logging** | Pino |
| **Testing** | Jest, Vitest |

## Project Structure

```
backend-fastify/
├── src/
│   ├── api/v1/              # API routes
│   ├── core/                # Infrastructure (DB, cache, queue, storage)
│   ├── domain/              # Business logic
│   ├── middleware/          # Auth, tenant, rate-limit, etc.
│   ├── plugins/             # Fastify plugins (Swagger, WebSocket)
│   ├── workers/             # Background workers
│   ├── utils/               # Utilities
│   ├── config/              # Configuration
│   ├── types/               # TypeScript types
│   ├── app.ts               # Fastify app setup
│   └── server.ts            # Entry point
├── prisma/                  # Database schema & migrations
├── tests/                   # Tests (unit, integration, e2e)
└── docker/                  # Docker configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+ (or npm 10+)
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Installation

1. **Clone and navigate**:
   ```bash
   cd backend-fastify
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your database, Redis, and S3 credentials.

4. **Start infrastructure** (Docker):
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

5. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

6. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

7. **Seed database** (optional):
   ```bash
   pnpm run prisma:seed
   ```

8. **Start development server**:
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:3000` with OpenAPI docs at `http://localhost:3000/docs`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Generate test coverage report |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma studio` | Open Prisma Studio |
| `pnpm run prisma:seed` | Seed database with test data |
| `pnpm lint` | Lint code |
| `pnpm format` | Format code with Prettier |

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/docs
- **OpenAPI Spec**: http://localhost:3000/docs/json

## Authentication

The API uses JWT-based authentication with access and refresh tokens.

**Login**:
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "coach@akgolf.no",
  "password": "your-password"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900,
    "user": {
      "id": "...",
      "email": "coach@akgolf.no",
      "role": "coach"
    }
  }
}
```

**Authenticated Requests**:
```bash
GET /api/v1/players
Authorization: Bearer <accessToken>
```

## Multi-Tenancy

All requests are scoped to a tenant. The tenant context is automatically injected from the JWT token.

- Each tenant has isolated data
- All database queries are automatically filtered by `tenant_id`
- Cross-tenant access is prevented at the application layer

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

## Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_ACCESS_SECRET` - JWT access token secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `S3_ENDPOINT` - S3 endpoint URL
- `S3_BUCKET` - S3 bucket name
- `S3_ACCESS_KEY_ID` - S3 access key
- `S3_SECRET_ACCESS_KEY` - S3 secret key

## Development

### Adding a New API Endpoint

1. Create route module in `src/api/v1/<resource>/`
2. Define Zod validation schemas in `schema.ts`
3. Implement business logic in `service.ts`
4. Register routes in `src/app.ts`

Example structure:
```
src/api/v1/players/
├── index.ts       # Route definitions
├── schema.ts      # Zod validation
├── controller.ts  # Request handlers
└── service.ts     # Business logic
```

### Database Changes

1. Update `prisma/schema.prisma`
2. Create migration: `npm run prisma:migrate`
3. Generate client: `npm run prisma:generate`

## Architecture

### Request Flow

```
Client Request
  → CORS & Helmet
  → Rate Limiting
  → Authentication (JWT)
  → Tenant Context Injection
  → Route Handler
  → Service Layer
  → Prisma (auto-filtered by tenant_id)
  → Database
```

### Event System (Outbox Pattern)

```
Business Operation
  → DB Transaction {
      - Write business data
      - Insert outbox event
    }
  → Commit
  → Outbox Relay Worker
  → BullMQ Queue
  → Event Handlers
```

### Media Upload

```
1. Client → POST /media/upload-url
2. API → Generate presigned URL
3. Client → Upload directly to S3
4. Client → POST /media/confirm-upload
5. API → Queue processing job
6. Worker → Generate thumbnails/transcode
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

4. Start the server:
   ```bash
   NODE_ENV=production npm start
   ```

### Docker Deployment

```bash
docker build -t iup-golf-backend -f docker/Dockerfile .
docker run -p 3000:3000 --env-file .env iup-golf-backend
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Ensure linting passes: `npm run lint`
5. Submit a pull request

## License

UNLICENSED - Proprietary

## Support

For issues or questions, contact the development team.
