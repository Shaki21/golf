-- Migration: Integrate Oppgave (school assignments) with Test protocol
-- Date: 2026-01-07
-- Description: Add optional testId and testDate fields to oppgaver table

-- Step 1: Add test_id column (nullable for non-test assignments)
ALTER TABLE "oppgaver" ADD COLUMN "test_id" UUID;

-- Step 2: Add test_date column (nullable, for when test is scheduled)
ALTER TABLE "oppgaver" ADD COLUMN "test_date" DATE;

-- Step 3: Create index on test_id for faster lookups
CREATE INDEX "oppgaver_test_id_idx" ON "oppgaver"("test_id");

-- Step 4: Create index on test_date for filtering by test date
CREATE INDEX "oppgaver_test_date_idx" ON "oppgaver"("test_date");

-- Step 5: Add foreign key constraint to tests table
-- Using ON DELETE SET NULL so if test is deleted, assignment remains but link is removed
ALTER TABLE "oppgaver"
  ADD CONSTRAINT "oppgaver_test_id_fkey"
  FOREIGN KEY ("test_id")
  REFERENCES "tests"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- No data migration needed - existing assignments have no test linkage
-- New assignments can optionally be linked to tests via testId field
