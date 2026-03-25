#!/bin/bash

# Apply Goals Table Migration
# Run this script to add the goals table to your database

echo "🔄 Applying Goals table migration..."

cd "$(dirname "$0")"

# Apply the migration using Prisma
npx prisma migrate deploy

# Or if you prefer to use the custom migration file:
# PGPASSWORD=postgres psql -h localhost -U postgres -d ak_golf_iup -p 5432 -f prisma/migrations/20251216130000_add_goals_table/migration.sql

echo "✅ Migration applied successfully!"
echo ""
echo "You can now test the Goals API at:"
echo "  GET    /api/v1/goals"
echo "  GET    /api/v1/goals/active"
echo "  GET    /api/v1/goals/completed"
echo "  GET    /api/v1/goals/:id"
echo "  POST   /api/v1/goals"
echo "  PUT    /api/v1/goals/:id"
echo "  PATCH  /api/v1/goals/:id/progress"
echo "  DELETE /api/v1/goals/:id"
