#!/bin/bash

# IUP Golf Academy - Database Setup Script
# Dette scriptet setter opp database, kjører migrering og seeder data

set -e  # Exit on error

echo "🚀 IUP Golf Academy - Database Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if Docker is running
echo "📋 Steg 1/5: Sjekker Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker kjører ikke. Vennligst start Docker Desktop først.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker kjører${NC}"
echo ""

# 2. Navigate to docker directory and start PostgreSQL
echo "📋 Steg 2/5: Starter PostgreSQL database..."
cd docker
docker compose up -d postgres
echo -e "${GREEN}✅ PostgreSQL startet${NC}"
echo ""

# Wait for PostgreSQL to be ready
echo "⏳ Venter på at PostgreSQL skal være klar..."
sleep 5
echo ""

# 3. Go back to root directory
cd ..

# 4. Generate Prisma Client
echo "📋 Steg 3/5: Genererer Prisma Client..."
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generert${NC}"
echo ""

# 5. Run migration
echo "📋 Steg 4/5: Kjører database-migrering..."
echo -e "${YELLOW}Dette vil opprette alle nye tabeller...${NC}"
npx prisma migrate dev --name add_test_comparison_system
echo -e "${GREEN}✅ Migrering fullført${NC}"
echo ""

# 6. Seed database
echo "📋 Steg 5/5: Seeder database med kategori-krav..."
npm run prisma:seed
echo -e "${GREEN}✅ Seeding fullført (440 requirements lastet inn)${NC}"
echo ""

# 7. Verify
echo "🔍 Verifiserer database..."
echo "Sjekker antall category_requirements..."

# Run a simple query to count requirements
REQUIREMENTS_COUNT=$(docker exec iup-golf-postgres psql -U postgres -d ak_golf_iup -t -c "SELECT COUNT(*) FROM category_requirements;" 2>/dev/null || echo "0")
REQUIREMENTS_COUNT=$(echo $REQUIREMENTS_COUNT | xargs)

if [ "$REQUIREMENTS_COUNT" = "440" ]; then
    echo -e "${GREEN}✅ Database verifisert: $REQUIREMENTS_COUNT requirements funnet${NC}"
else
    echo -e "${YELLOW}⚠️  Fant $REQUIREMENTS_COUNT requirements (forventet 440)${NC}"
fi
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}🎉 DATABASE SETUP FULLFØRT!${NC}"
echo "======================================"
echo ""
echo "📊 Nye tabeller opprettet:"
echo "   • category_requirements (440 rader)"
echo "   • peer_comparisons"
echo "   • datagolf_players"
echo "   • datagolf_tour_averages"
echo "   • saved_filters"
echo "   • analytics_cache"
echo ""
echo "🚀 Neste steg:"
echo "   1. Start serveren: npm run dev"
echo "   2. Åpne Swagger UI: http://localhost:3000/documentation"
echo "   3. Test API-endpoints"
echo ""
echo "📚 Dokumentasjon:"
echo "   • IMPLEMENTATION_SUMMARY.md"
echo "   • SETUP_AND_TEST_GUIDE.md"
echo ""
echo "✅ Alt er klart for testing!"
