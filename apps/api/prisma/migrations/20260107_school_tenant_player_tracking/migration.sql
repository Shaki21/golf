-- AlterTable: Add tenantId and playerId to fag table
ALTER TABLE "fag" ADD COLUMN "tenant_id" UUID;
ALTER TABLE "fag" ADD COLUMN "player_id" UUID;

-- Populate tenantId and playerId from existing userId
-- First, get tenantId from User table
UPDATE "fag"
SET "tenant_id" = (SELECT "tenant_id" FROM "users" WHERE "users"."id" = "fag"."user_id");

-- Then, get playerId from User->Player relationship (if user has a player role)
UPDATE "fag"
SET "player_id" = (SELECT "id" FROM "players" WHERE "players"."user_id" = "fag"."user_id");

-- For users who don't have a player record, we need to handle this
-- Option: Delete fag records for users without player records OR
-- Option: Keep them and require manual migration
-- We'll delete orphaned records for clean migration
DELETE FROM "fag" WHERE "player_id" IS NULL;

-- Make columns NOT NULL after data migration
ALTER TABLE "fag" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "fag" ALTER COLUMN "player_id" SET NOT NULL;

-- Drop old userId column and its index
DROP INDEX IF EXISTS "fag_user_id_idx";
ALTER TABLE "fag" DROP COLUMN "user_id";

-- Create new indexes
CREATE INDEX "fag_tenant_id_idx" ON "fag"("tenant_id");
CREATE INDEX "fag_player_id_idx" ON "fag"("player_id");

-- Add foreign key constraints
ALTER TABLE "fag" ADD CONSTRAINT "fag_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fag" ADD CONSTRAINT "fag_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Add new columns to oppgaver table
ALTER TABLE "oppgaver" ADD COLUMN "completed_at" TIMESTAMPTZ(6);
ALTER TABLE "oppgaver" ADD COLUMN "estimated_minutes" INTEGER;
ALTER TABLE "oppgaver" ADD COLUMN "actual_minutes" INTEGER;

-- Create index for completedAt
CREATE INDEX "oppgaver_completed_at_idx" ON "oppgaver"("completed_at");

-- Update completed_at for existing completed tasks (use updatedAt as fallback)
UPDATE "oppgaver"
SET "completed_at" = "updated_at"
WHERE "status" = 'completed' AND "completed_at" IS NULL;
