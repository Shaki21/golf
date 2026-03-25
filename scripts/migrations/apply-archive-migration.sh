#!/bin/bash

# Apply Archive Table Migration
# Run this script to add the archived_items table to your database

echo "🔄 Applying Archive table migration..."

cd "$(dirname "$0")"

# Apply the migration using Prisma
npx prisma migrate deploy

# Or if you prefer to use the custom migration file:
# PGPASSWORD=postgres psql -h localhost -U postgres -d ak_golf_iup -p 5432 -f prisma/migrations/20251216140000_add_archive_table/migration.sql

echo "✅ Migration applied successfully!"
echo ""
echo "You can now test the Archive API at:"
echo "  GET    /api/v1/archive"
echo "  GET    /api/v1/archive/count"
echo "  GET    /api/v1/archive/:id"
echo "  POST   /api/v1/archive"
echo "  POST   /api/v1/archive/:id/restore"
echo "  POST   /api/v1/archive/bulk-delete"
echo "  DELETE /api/v1/archive/:id"
