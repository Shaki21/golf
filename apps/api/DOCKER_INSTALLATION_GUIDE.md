# Docker Installation Guide - macOS

> Guide for å installere Docker Desktop på macOS og kjøre IUP Golf Academy database

---

## Metode 1: Docker Desktop (Anbefalt)

Docker Desktop er den enkleste måten å få Docker på macOS.

### Steg 1: Last ned Docker Desktop

1. Gå til: https://www.docker.com/products/docker-desktop/
2. Klikk **"Download for Mac"**
3. Velg riktig versjon:
   - **Apple Silicon (M1/M2/M3)**: Download for Apple Silicon
   - **Intel Mac**: Download for Intel

### Steg 2: Installer Docker Desktop

1. Åpne den nedlastede `.dmg`-filen
2. Dra **Docker.app** til **Applications**-mappen
3. Åpne **Docker Desktop** fra Applications
4. Godta vilkårene
5. Vent til Docker starter (du ser whale-ikonet i menu bar)

### Steg 3: Verifiser installasjon

Åpne Terminal og kjør:

```bash
docker --version
docker compose version
```

Du skal se output som:
```
Docker version 24.x.x, build xxxxxx
Docker Compose version v2.x.x
```

### Steg 4: Kjør database setup

Nå kan du kjøre setup-scriptet:

```bash
cd "/Users/anderskristiansen/Library/Mobile Documents/com~apple~CloudDocs/01. Projects/Active/IUP_Master_V1/backend-fastify"
./setup-database.sh
```

---

## Metode 2: Homebrew + Docker Desktop

Hvis du har Homebrew installert kan du installere via kommandolinje.

### Installer Homebrew (hvis du ikke har det)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Installer Docker Desktop

```bash
brew install --cask docker
```

### Start Docker Desktop

```bash
open /Applications/Docker.app
```

Vent til Docker er klar (whale-ikon i menu bar viser "Docker Desktop is running").

### Kjør database setup

```bash
cd "/Users/anderskristiansen/Library/Mobile Documents/com~apple~CloudDocs/01. Projects/Active/IUP_Master_V1/backend-fastify"
./setup-database.sh
```

---

## Metode 3: Colima (Lightweight alternativ)

Colima er et lightweight alternativ til Docker Desktop.

### Installer via Homebrew

```bash
brew install colima docker docker-compose
```

### Start Colima

```bash
colima start
```

### Verifiser

```bash
docker --version
docker compose version
```

### Kjør database setup

```bash
cd "/Users/anderskristiansen/Library/Mobile Documents/com~apple~CloudDocs/01. Projects/Active/IUP_Master_V1/backend-fastify"
./setup-database.sh
```

---

## Feilsøking

### Problem: "Docker daemon is not running"

**Løsning:**
1. Åpne Docker Desktop fra Applications
2. Vent til whale-ikonet i menu bar viser "Docker Desktop is running"
3. Prøv kommandoen på nytt

### Problem: "Cannot connect to the Docker daemon"

**Løsning:**
```bash
# Restart Docker Desktop
killall Docker && open /Applications/Docker.app

# Eller restart Colima
colima restart
```

### Problem: "Port 5432 already in use"

En PostgreSQL instans kjører allerede på din maskin.

**Løsning 1** - Stopp eksisterende PostgreSQL:
```bash
# Finn prosessen
lsof -i :5432

# Stopp den (erstatt PID med riktig process ID)
kill -9 <PID>
```

**Løsning 2** - Endre port i docker-compose.yml:
```yaml
# docker/docker-compose.yml
postgres:
  ports:
    - "5433:5432"  # Endret fra 5432:5432
```

Oppdater også `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/ak_golf_iup"
```

### Problem: "Permission denied" når du kjører setup-database.sh

**Løsning:**
```bash
chmod +x setup-database.sh
./setup-database.sh
```

---

## Neste steg etter installasjon

Når Docker er installert og kjører:

### 1. Kjør database setup
```bash
./setup-database.sh
```

### 2. Verifiser at alt fungerer
```bash
# Sjekk at containers kjører
docker ps

# Skal vise:
# - iup-golf-postgres (port 5432)
# - iup-golf-redis (port 6379)
# - iup-golf-minio (port 9000, 9001)
```

### 3. Koble til database
```bash
# Via Docker
docker exec -it iup-golf-postgres psql -U postgres -d ak_golf_iup

# Eller via Prisma Studio
npx prisma studio
```

### 4. Start backend server
```bash
npm run dev
```

### 5. Test API
- **Swagger UI**: http://localhost:3000/documentation
- **Health check**: http://localhost:3000/health
- **Prisma Studio**: http://localhost:5555

---

## Ressurser

- **Docker Desktop dokumentasjon**: https://docs.docker.com/desktop/install/mac-install/
- **Docker Compose dokumentasjon**: https://docs.docker.com/compose/
- **Colima GitHub**: https://github.com/abiosoft/colima
- **Homebrew**: https://brew.sh/

---

## Quick Reference

```bash
# Start alle services
cd docker && docker compose up -d

# Stopp alle services
cd docker && docker compose down

# Restart alt
cd docker && docker compose restart

# Se logs
cd docker && docker compose logs -f postgres

# Fjern alt og start på nytt
cd docker && docker compose down -v
cd docker && docker compose up -d
```

---

**Status**: Følg én av metodene ovenfor for å installere Docker, deretter kjør `./setup-database.sh`
