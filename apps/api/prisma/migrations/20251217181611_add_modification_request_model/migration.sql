-- AlterTable
ALTER TABLE "notes" ALTER COLUMN "tags" DROP DEFAULT;

-- CreateTable
CREATE TABLE "player_intakes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "background" JSONB NOT NULL,
    "availability" JSONB NOT NULL,
    "goals" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "health" JSONB NOT NULL,
    "lifestyle" JSONB NOT NULL,
    "equipment" JSONB NOT NULL,
    "learning" JSONB NOT NULL,
    "completion_percentage" INTEGER NOT NULL DEFAULT 0,
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "generated_plan_id" UUID,
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_intakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modification_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "annual_plan_id" UUID NOT NULL,
    "requested_by" UUID NOT NULL,
    "concerns" VARCHAR(255)[],
    "notes" TEXT,
    "urgency" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "coach_response" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "resolved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "player_intakes_player_id_idx" ON "player_intakes"("player_id");

-- CreateIndex
CREATE INDEX "player_intakes_tenant_id_idx" ON "player_intakes"("tenant_id");

-- CreateIndex
CREATE INDEX "player_intakes_is_complete_idx" ON "player_intakes"("is_complete");

-- CreateIndex
CREATE UNIQUE INDEX "player_intakes_player_id_submitted_at_key" ON "player_intakes"("player_id", "submitted_at");

-- CreateIndex
CREATE INDEX "modification_requests_annual_plan_id_idx" ON "modification_requests"("annual_plan_id");

-- CreateIndex
CREATE INDEX "modification_requests_requested_by_idx" ON "modification_requests"("requested_by");

-- CreateIndex
CREATE INDEX "modification_requests_status_idx" ON "modification_requests"("status");

-- CreateIndex
CREATE INDEX "modification_requests_created_at_idx" ON "modification_requests"("created_at");

-- AddForeignKey
ALTER TABLE "player_intakes" ADD CONSTRAINT "player_intakes_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_intakes" ADD CONSTRAINT "player_intakes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modification_requests" ADD CONSTRAINT "modification_requests_annual_plan_id_fkey" FOREIGN KEY ("annual_plan_id") REFERENCES "annual_training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modification_requests" ADD CONSTRAINT "modification_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modification_requests" ADD CONSTRAINT "modification_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
