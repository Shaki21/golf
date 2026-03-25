#!/bin/bash

# Apply Notes Table Migration
# Run this script to add the notes table to your database

echo "🔄 Applying Notes table migration..."

cd "$(dirname "$0")"

# Apply the migration using Prisma
npx prisma migrate deploy

# Or if you prefer to use the custom migration file:
# PGPASSWORD=postgres psql -h localhost -U postgres -d ak_golf_iup -p 5432 -f prisma/migrations/20251216120000_add_notes_table/migration.sql

echo "✅ Migration applied successfully!"
echo ""
echo "You can now test the Notes API at:"
echo "  GET    /api/v1/notes"
echo "  GET    /api/v1/notes/:id"
echo "  POST   /api/v1/notes"
echo "  PUT    /api/v1/notes/:id"
echo "  DELETE /api/v1/notes/:id"
