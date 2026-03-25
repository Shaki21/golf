#!/bin/bash

# IUP Master V1 - Complete Export Script
# Lager ZIP-arkiv med komplett implementasjon for gjennomgang

set -e

REPO_ROOT="/Users/anderskristiansen/Developer/IUP_Master_V1"
EXPORT_DIR="$HOME/Desktop/IUP_Export_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$EXPORT_DIR"

echo "🎯 IUP Master V1 - Complete Export"
echo "📦 Export destinasjon: $EXPORT_DIR"
echo ""

# ============================================================================
# ALTERNATIV 1: HELE REPOET (anbefalt)
# ============================================================================

create_full_export() {
    echo "📦 Lager komplett repo-eksport..."

    cd "$REPO_ROOT"

    # Ekskluder store/unødvendige filer
    zip -r "$EXPORT_DIR/IUP_FULL_REPO.zip" . \
        -x "node_modules/*" \
        -x "*/node_modules/*" \
        -x "*/.next/*" \
        -x "*/dist/*" \
        -x "*/build/*" \
        -x "*/.turbo/*" \
        -x "*/coverage/*" \
        -x "*.log" \
        -x ".git/*" \
        -x "*.mp4" \
        -x "*.mov" \
        -x "*.avi" \
        -x "apps/api/.env" \
        -x ".env" \
        -x "apps/web/.env.local" \
        2>/dev/null || true

    echo "✅ Fullstendig repo eksportert til: IUP_FULL_REPO.zip"
    ls -lh "$EXPORT_DIR/IUP_FULL_REPO.zip"
}

# ============================================================================
# ALTERNATIV 2: DELT I MODULER (hvis alternativ 1 blir for stort)
# ============================================================================

create_modular_export() {
    echo "📦 Lager modulær eksport..."

    cd "$REPO_ROOT"

    # (A) Backend API
    echo "  → Backend (API)..."
    zip -r "$EXPORT_DIR/1_BACKEND_API.zip" \
        apps/api/src \
        apps/api/prisma \
        apps/api/tests \
        apps/api/scripts \
        apps/api/package.json \
        apps/api/tsconfig.json \
        apps/api/Dockerfile \
        apps/api/.env.example \
        apps/api/README.md \
        apps/api/*.md \
        2>/dev/null || true

    # (B) Datamodell
    echo "  → Datamodell..."
    zip -r "$EXPORT_DIR/2_DATAMODELL.zip" \
        apps/api/prisma/schema.prisma \
        apps/api/prisma/migrations \
        apps/api/prisma/seed*.ts \
        packages/database \
        2>/dev/null || true

    # (C) Web Frontend
    echo "  → Web Frontend..."
    zip -r "$EXPORT_DIR/3_WEB_FRONTEND.zip" \
        apps/web/src \
        apps/web/public \
        apps/web/package.json \
        apps/web/tsconfig.json \
        apps/web/next.config.js \
        apps/web/tailwind.config.js \
        apps/web/.env.example \
        2>/dev/null || true

    # (D) Mobil (hvis finnes)
    if [ -d "apps/golfer" ]; then
        echo "  → Mobil App..."
        zip -r "$EXPORT_DIR/4_MOBILE_APP.zip" \
            apps/golfer \
            -x "apps/golfer/node_modules/*" \
            -x "apps/golfer/platforms/*" \
            2>/dev/null || true
    fi

    # (E) Rot-konfigurasjon
    echo "  → Rot-konfigurasjon..."
    zip -r "$EXPORT_DIR/5_ROOT_CONFIG.zip" \
        package.json \
        pnpm-lock.yaml \
        pnpm-workspace.yaml \
        turbo.json \
        tsconfig.json \
        .env.example \
        .env.production \
        .env.staging \
        docker-compose.yml \
        Makefile \
        README.md \
        CONTRIBUTING.md \
        2>/dev/null || true

    # (F) Dokumentasjon
    echo "  → Dokumentasjon..."
    zip -r "$EXPORT_DIR/6_DOCUMENTATION.zip" \
        docs \
        2>/dev/null || true

    # (G) Shared packages
    echo "  → Shared Packages..."
    zip -r "$EXPORT_DIR/7_PACKAGES.zip" \
        packages \
        -x "packages/*/node_modules/*" \
        2>/dev/null || true

    # (H) Scripts og tooling
    echo "  → Scripts..."
    zip -r "$EXPORT_DIR/8_SCRIPTS.zip" \
        scripts \
        .husky \
        .github \
        config \
        2>/dev/null || true

    echo "✅ Modulær eksport fullført:"
    ls -lh "$EXPORT_DIR"/*.zip
}

# ============================================================================
# BONUS: Generer README for eksporten
# ============================================================================

create_export_readme() {
    cat > "$EXPORT_DIR/README.txt" <<'EOF'
IUP MASTER V1 - KODEBASE EKSPORT
================================

Dato: $(date +%Y-%m-%d\ %H:%M:%S)

INNHOLD
-------

ALTERNATIV 1 - Fullstendig eksport:
  • IUP_FULL_REPO.zip
    └─ Hele repoet minus node_modules/build/dist/video

ALTERNATIV 2 - Modulær eksport:
  • 1_BACKEND_API.zip       - API-kode, routes, services, middleware
  • 2_DATAMODELL.zip        - Prisma schema, migrations, seeds
  • 3_WEB_FRONTEND.zip      - Next.js app, components, features
  • 4_MOBILE_APP.zip        - Ionic/Capacitor app (hvis tilgjengelig)
  • 5_ROOT_CONFIG.zip       - package.json, turbo.json, docker-compose.yml
  • 6_DOCUMENTATION.zip     - docs/ katalog
  • 7_PACKAGES.zip          - Shared packages (database, design-system)
  • 8_SCRIPTS.zip           - Build/deploy scripts, CI/CD

EKSKLUDERT
----------
  • node_modules/
  • .next/, dist/, build/
  • .turbo/, coverage/
  • .git/ (versjonskontroll)
  • Video-filer (*.mp4, *.mov)
  • Hemmelige .env-filer (kun .env.example inkludert)

NEXT STEPS
----------
1. Pakk ut relevant ZIP(er)
2. Installer avhengigheter: pnpm install
3. Kopier .env.example → .env og konfigurer
4. Kjør database: docker-compose up -d postgres
5. Migrer database: cd apps/api && npx prisma migrate deploy
6. Start dev: pnpm dev

KONTAKT
-------
Repo: /Users/anderskristiansen/Developer/IUP_Master_V1
EOF

    echo "📄 README.txt opprettet"
}

# ============================================================================
# EKSTRA: Lag inventarliste
# ============================================================================

create_inventory() {
    echo "📋 Genererer inventarliste..."

    cd "$REPO_ROOT"

    {
        echo "IUP MASTER V1 - KODEBASE INVENTAR"
        echo "=================================="
        echo ""
        echo "Generert: $(date)"
        echo ""

        echo "API ENDPOINTS"
        echo "-------------"
        find apps/api/src/api -name "index.ts" -o -name "routes.ts" | sort
        echo ""

        echo "WEB FEATURES"
        echo "------------"
        ls -1 apps/web/src/features/ 2>/dev/null || echo "Ingen features funnet"
        echo ""

        echo "PRISMA MODELS"
        echo "-------------"
        grep "^model " apps/api/prisma/schema.prisma 2>/dev/null || echo "Schema ikke funnet"
        echo ""

        echo "PACKAGE.JSON SCRIPTS"
        echo "--------------------"
        cat package.json | grep -A 50 '"scripts"' | grep -E '^\s+"[^"]+":' || echo "Ingen scripts"

    } > "$EXPORT_DIR/INVENTORY.txt"

    echo "✅ Inventarliste: INVENTORY.txt"
}

# ============================================================================
# HOVEDMENY
# ============================================================================

echo "Velg eksportmetode:"
echo "  1) Fullstendig repo (anbefalt)"
echo "  2) Modulær eksport (8 separate ZIPs)"
echo "  3) Begge deler"
echo ""
read -p "Valg [1-3]: " choice

case $choice in
    1)
        create_full_export
        ;;
    2)
        create_modular_export
        ;;
    3)
        create_full_export
        echo ""
        create_modular_export
        ;;
    *)
        echo "❌ Ugyldig valg"
        exit 1
        ;;
esac

create_export_readme
create_inventory

echo ""
echo "✅ EKSPORT FULLFØRT!"
echo "📁 Plassering: $EXPORT_DIR"
echo ""
echo "Filer opprettet:"
ls -lh "$EXPORT_DIR"

# Åpne mappen i Finder
open "$EXPORT_DIR"
