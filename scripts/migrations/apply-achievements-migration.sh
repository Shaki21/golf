#!/bin/bash

# Apply Achievements Table Migration
# Run this script to add the user_achievements table to your database

echo "🔄 Applying Achievements table migration..."

cd "$(dirname "$0")"

# Apply the migration using Prisma
npx prisma migrate deploy

# Or if you prefer to use the custom migration file:
# PGPASSWORD=postgres psql -h localhost -U postgres -d ak_golf_iup -p 5432 -f prisma/migrations/20251216150000_add_achievements_table/migration.sql

echo "✅ Migration applied successfully!"
echo ""
echo "You can now test the Achievements API at:"
echo "  GET    /api/v1/achievements"
echo "  GET    /api/v1/achievements/new"
echo "  GET    /api/v1/achievements/stats"
echo "  GET    /api/v1/achievements/recent"
echo "  GET    /api/v1/achievements/:id"
echo "  POST   /api/v1/achievements"
echo "  PATCH  /api/v1/achievements/:id/viewed"
echo "  POST   /api/v1/achievements/mark-all-viewed"
echo "  DELETE /api/v1/achievements/:id"
