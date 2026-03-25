#!/bin/bash

# Apply Season Baseline Table Migration
# Run this script to add the season_baselines table to your database

echo "🔄 Applying Season Baseline table migration..."

cd "$(dirname "$0")"

# Apply the migration using Prisma
npx prisma migrate deploy

# Or if you prefer to use the custom migration file:
# PGPASSWORD=postgres psql -h localhost -U postgres -d ak_golf_iup -p 5432 -f prisma/migrations/20251216160000_add_season_baseline_table/migration.sql

echo "✅ Migration applied successfully!"
echo ""
echo "You can now test the Season API at:"
echo "  GET    /api/v1/season/recommendation?season=2025"
echo "  GET    /api/v1/season/baseline?season=2025"
echo "  POST   /api/v1/season/baseline"
