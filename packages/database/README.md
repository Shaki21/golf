# packages/database

## Status: Legacy / Reference Only

This package contains the original SQL schema files that were created during the initial design phase of the IUP Golf Academy system. These files are kept for historical reference and documentation purposes.

**The canonical database schema is managed by Prisma and lives at:**
```
apps/api/prisma/schema.prisma
```

## Contents

```
packages/database/
├── schema/
│   ├── 01_base_setup.sql      # Original booking & calendar tables
│   └── 02_iup_extension.sql   # IUP-specific extensions (exercises, etc.)
└── seeds/
    └── (placeholder for seed data)
```

## Why This Exists

1. **Historical Reference**: Documents the original database design decisions
2. **PostgreSQL-Specific Features**: Shows use of extensions like `uuid-ossp` and `pgcrypto`
3. **Documentation**: The SQL comments provide domain context (Norwegian golf terminology)

## Current Database Management

All database operations should use Prisma:

```bash
# Generate Prisma client
pnpm --filter iup-golf-backend prisma:generate

# Run migrations
pnpm --filter iup-golf-backend prisma:migrate

# Seed database
pnpm --filter iup-golf-backend prisma:seed

# Open Prisma Studio
pnpm --filter iup-golf-backend prisma:studio
```

## Migration Path

If you need to add new tables or columns:

1. Edit `apps/api/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration-name>`
3. Update seed files in `apps/api/prisma/seeds/` if needed

Do **NOT** modify the SQL files in this package - they are for reference only.

## Related

- [Prisma Schema](../apps/api/prisma/schema.prisma) - The source of truth for database schema
- [Prisma Migrations](../apps/api/prisma/migrations/) - All database migrations
- [Seed Data](../apps/api/prisma/seeds/) - TypeScript seed files
