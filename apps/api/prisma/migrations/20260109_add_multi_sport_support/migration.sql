-- Multi-Sport Support Migration
-- This migration adds sport configuration support for multi-sport tenants

-- CreateEnum
CREATE TYPE "SportId" AS ENUM ('GOLF', 'RUNNING', 'HANDBALL', 'FOOTBALL', 'TENNIS', 'SWIMMING', 'JAVELIN');

-- AlterTable: Add sport_id to tenants (defaults to GOLF for existing tenants)
ALTER TABLE "tenants" ADD COLUMN "sport_id" "SportId" NOT NULL DEFAULT 'GOLF';

-- CreateTable: sport_configs for tenant-specific sport customization
CREATE TABLE "sport_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "sport_id" "SportId" NOT NULL,
    "training_areas_override" JSONB,
    "environments_override" JSONB,
    "phases_override" JSONB,
    "benchmarks_override" JSONB,
    "terminology_override" JSONB,
    "navigation_override" JSONB,
    "uses_handicap" BOOLEAN,
    "uses_club_speed" BOOLEAN,
    "uses_strokes_gained" BOOLEAN,
    "uses_ak_formula" BOOLEAN,
    "uses_benchmarks" BOOLEAN,
    "primary_color" VARCHAR(7),
    "secondary_color" VARCHAR(7),
    "logo_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sport_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique constraint on tenant_id (one config per tenant)
CREATE UNIQUE INDEX "sport_configs_tenant_id_key" ON "sport_configs"("tenant_id");

-- CreateIndex: Index on sport_id for filtering by sport
CREATE INDEX "sport_configs_sport_id_idx" ON "sport_configs"("sport_id");

-- AddForeignKey: Link sport_configs to tenants
ALTER TABLE "sport_configs" ADD CONSTRAINT "sport_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
