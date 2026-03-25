-- CreateTable
CREATE TABLE IF NOT EXISTS "collections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) NOT NULL DEFAULT 'general',
    "items" JSONB NOT NULL DEFAULT '[]',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "color" VARCHAR(20),
    "icon" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "support_cases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "category" VARCHAR(50),
    "reported_by_id" UUID,
    "resolution" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMPTZ(6),
    CONSTRAINT "support_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "feature_flags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rollout_percentage" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX IF NOT EXISTS "collections_user_id_idx" ON "collections"("user_id");
CREATE INDEX IF NOT EXISTS "collections_tenant_id_idx" ON "collections"("tenant_id");
CREATE INDEX IF NOT EXISTS "support_cases_status_idx" ON "support_cases"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "feature_flags_key_key" ON "feature_flags"("key");

-- AddForeignKey
DO $$
BEGIN
    ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
