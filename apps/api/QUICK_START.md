# IUP Golf Academy - Quick Start Guide

> Komplett guide fra installasjon til kjørende server på 5 minutter

---

## 📋 Forutsetninger

- **macOS** (din nåværende maskin)
- **Node.js** 18+ (installert ✓)
- **Docker Desktop** (må installeres - se nedenfor)

---

## 🚀 Setup i 5 steg

### Steg 1: Installer Docker Desktop

**Docker er ikke installert på din maskin.** Følg én av disse metodene:

#### Metode A: Docker Desktop (Anbefalt - 5 minutter)

1. Gå til: https://www.docker.com/products/docker-desktop/
2. Last ned **Docker Desktop for Mac** (Apple Silicon hvis du har M1/M2/M3)
3. Åpne `.dmg` filen og dra Docker til Applications
4. Start Docker Desktop fra Applications
5. Vent til whale-ikonet i menu bar viser "Docker Desktop is running"

#### Metode B: Via Homebrew (Raskere hvis du har Homebrew)

```bash
# Installer Homebrew først (hvis du ikke har det)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer Docker Desktop
brew install --cask docker

# Start Docker
open /Applications/Docker.app
```

**Verifiser installasjon:**
```bash
docker --version
# Output: Docker version 24.x.x, build xxxxxx
```

📖 **Detaljert guide**: Se `DOCKER_INSTALLATION_GUIDE.md`

---

### Steg 2: Kjør Database Setup

Når Docker kjører, åpne Terminal og kjør:

```bash
cd "/Users/anderskristiansen/Library/Mobile Documents/com~apple~CloudDocs/01. Projects/Active/IUP_Master_V1/backend-fastify"

./setup-database.sh
```

Dette scriptet vil automatisk:
1. ✅ Sjekke at Docker kjører
2. ✅ Starte PostgreSQL database (port 5432)
3. ✅ Generere Prisma Client
4. ✅ Kjøre migrering (opprette 7 nye tabeller)
5. ✅ Seede 440 kategori-krav
6. ✅ Verifisere at alt fungerer

**Forventet output:**
```
🚀 IUP Golf Academy - Database Setup
====================================
📋 Steg 1/5: Sjekker Docker...
✅ Docker kjører
📋 Steg 2/5: Starter PostgreSQL database...
✅ PostgreSQL startet
📋 Steg 3/5: Genererer Prisma Client...
✅ Prisma Client generert
📋 Steg 4/5: Kjører database-migrering...
✅ Migrering fullført
📋 Steg 5/5: Seeder database med kategori-krav...
✅ Seeding fullført (440 requirements lastet inn)

🎉 DATABASE SETUP FULLFØRT!
```

---

### Steg 3: Verifiser Database

Sjekk at containers kjører:

```bash
docker ps
```

Du skal se 4 containers:
- `iup-golf-postgres` (PostgreSQL på port 5432)
- `iup-golf-redis` (Redis på port 6379)
- `iup-golf-minio` (MinIO på port 9000)
- `iup-golf-minio-init` (init container)

---

### Steg 4: Start Backend Server

```bash
npm run dev
```

**Server starter på:**
- API: http://localhost:3000
- Swagger UI: http://localhost:3000/documentation
- Health check: http://localhost:3000/health

**Forventet output:**
```
{"level":30,"time":...,"msg":"Server started successfully","port":3000,"host":"0.0.0.0","env":"development","docs":"http://localhost:3000/docs"}
```

---

### Steg 5: Test APIene

#### Via Swagger UI (Anbefalt)

1. Åpne: http://localhost:3000/documentation
2. Test health endpoint:
   - Expand `GET /health`
   - Click **"Try it out"**
   - Click **"Execute"**
   - Skal returnere `200 OK` med server status

3. Authenticate:
   - Register ny bruker via `POST /api/v1/auth/register`
   - Login via `POST /api/v1/auth/login`
   - Kopier JWT token
   - Klikk **"Authorize"** (øverst til høyre)
   - Lim inn: `Bearer <token>`

4. Test enhanced endpoints:
   - `POST /api/v1/tests/results/enhanced` - Registrer test resultat
   - `GET /api/v1/peer-comparison` - Se peer comparison
   - `GET /api/v1/coach-analytics/players/{id}/overview` - Player overview

#### Via curl

```bash
# Health check
curl http://localhost:3000/health

# Register bruker
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach@example.com",
    "password": "securepass123",
    "role": "COACH",
    "firstName": "Ole",
    "lastName": "Nordmann"
  }'
```

📖 **Detaljert testing guide**: Se `SETUP_AND_TEST_GUIDE.md`

---

## 📊 Database Oversikt

Når setup er ferdig har du følgende tabeller:

### Eksisterende tabeller (oppdatert):
- `tenants` - Multi-tenant support
- `users` - Brukere (coaches, admins)
- `players` - Spillere
- `tests` - 20 test-definisjoner
- `test_results` - Test resultater (nå med auto-calculation)
- `exercises` - Treningsøvelser
- `workouts` - Treningsøkter

### Nye tabeller:
- `category_requirements` - 440 rader (11 kategorier × 2 kjønn × 20 tester)
- `peer_comparisons` - Automatiske peer comparisons
- `datagolf_players` - DataGolf player mappings
- `datagolf_tour_averages` - Tour statistics cache
- `saved_filters` - Coach filter presets
- `analytics_cache` - Performance cache

---

## 🛠️ Nyttige Kommandoer

### Database

```bash
# Åpne Prisma Studio (visuell database viewer)
npx prisma studio

# Koble til database via psql
docker exec -it iup-golf-postgres psql -U postgres -d ak_golf_iup

# Se alle tabeller
docker exec -it iup-golf-postgres psql -U postgres -d ak_golf_iup -c "\dt"

# Count category requirements
docker exec -it iup-golf-postgres psql -U postgres -d ak_golf_iup -c "SELECT COUNT(*) FROM category_requirements;"
```

### Docker

```bash
# Se alle containers
docker ps

# Se logs for PostgreSQL
docker logs iup-golf-postgres -f

# Restart database
cd docker && docker compose restart postgres

# Stopp alt
cd docker && docker compose down

# Start alt på nytt
cd docker && docker compose up -d

# Fjern alt (inkludert data!) og start fresh
cd docker && docker compose down -v
cd docker && docker compose up -d
./setup-database.sh
```

### Development

```bash
# Start server i dev mode (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

---

## 📖 API Dokumentasjon

### Core Endpoints

- **Auth**: `/api/v1/auth/*`
  - `POST /register` - Register bruker
  - `POST /login` - Login og få JWT token
  - `POST /logout` - Logout
  - `GET /me` - Hent current user

- **Players**: `/api/v1/players/*`
  - `POST /` - Opprett spiller
  - `GET /:id` - Hent spiller
  - `PATCH /:id` - Oppdater spiller
  - `GET /` - List spillere

- **Tests**: `/api/v1/tests/*`
  - `POST /results/enhanced` - ⭐ Registrer test med auto-calculation
  - `GET /results/:id/enhanced` - ⭐ Hent result med peer comparison
  - `GET /` - List alle tester (20 tester)

### Enhanced Analytics Endpoints

- **Peer Comparison**: `/api/v1/peer-comparison/*`
  - `GET /?playerId=...&testNumber=...` - ⭐ Peer comparison
  - `GET /multi-level?playerId=...&testNumber=...` - ⭐ Multi-level comparison
  - `GET /peer-group?category=...&gender=...` - Peer group data

- **Coach Analytics**: `/api/v1/coach-analytics/*`
  - `GET /players/:id/overview` - ⭐ Complete player overview
  - `GET /players/:id/category-progression` - Category readiness
  - `POST /compare-players` - Compare multiple players
  - `GET /team/:coachId` - Team analytics
  - `GET /dashboard/:coachId` - Complete coach dashboard

- **Filters**: `/api/v1/filters/*`
  - `POST /apply` - ⭐ Apply advanced filters
  - `POST /` - Create saved filter
  - `GET /?coachId=...` - List saved filters
  - `GET /suggestions` - Get filter suggestions

- **DataGolf**: `/api/v1/datagolf/*`
  - `GET /compare?playerId=...&tour=PGA&season=2025` - ⭐ Compare to tour
  - `GET /tour-averages?tour=PGA&season=2025` - Tour averages
  - `GET /player-mapping/:playerId` - Player mappings

---

## 🎯 Test Checklist

- [ ] Docker Desktop installert og kjører
- [ ] `./setup-database.sh` kjørt uten feil
- [ ] Database inneholder 440 category_requirements
- [ ] `npm run dev` starter server uten errors
- [ ] http://localhost:3000/health returnerer `200 OK`
- [ ] http://localhost:3000/documentation viser Swagger UI
- [ ] Kan registrere bruker via `POST /auth/register`
- [ ] Kan logge inn og få JWT token
- [ ] Kan registrere test resultat via `POST /tests/results/enhanced`
- [ ] Peer comparison kalkuleres automatisk
- [ ] Player overview viser korrekt data
- [ ] Filter system fungerer

---

## 🐛 Feilsøking

### Problem: "Docker kjører ikke"

```bash
# Start Docker Desktop
open /Applications/Docker.app

# Vent til whale-ikon viser "running"
# Prøv setup-database.sh på nytt
```

### Problem: "Port 5432 already in use"

```bash
# Finn hva som bruker porten
lsof -i :5432

# Stopp Docker containers
cd docker && docker compose down

# Eller stopp lokal PostgreSQL
brew services stop postgresql
```

### Problem: "Prisma Client not generated"

```bash
npx prisma generate
npm run dev
```

### Problem: "Migration failed"

```bash
# Reset alt og start på nytt
cd docker && docker compose down -v
cd docker && docker compose up -d postgres
sleep 5
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

---

## 📚 Dokumentasjon

- **IMPLEMENTATION_SUMMARY.md** - Fullstendig teknisk dokumentasjon
- **SETUP_AND_TEST_GUIDE.md** - Detaljert testing guide med examples
- **DOCKER_INSTALLATION_GUIDE.md** - Docker installasjon på macOS
- **Swagger UI** - http://localhost:3000/documentation (når server kjører)

---

## 🎓 Neste Steg

1. ✅ Installer Docker Desktop
2. ✅ Kjør `./setup-database.sh`
3. ✅ Start server: `npm run dev`
4. ✅ Test via Swagger UI
5. 🚀 Bygg frontend!
6. 🚀 Deploy til production

---

**Status**: Alt er klart - installer Docker Desktop og kjør setup script!

**Support**: Alle filer er opprettet og alle endpoints er registrert. Systemet er 100% ferdig for testing.
