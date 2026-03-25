-- CreateTable
CREATE TABLE "goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "goal_type" VARCHAR(50) NOT NULL,
    "timeframe" VARCHAR(20) NOT NULL,
    "target_value" DECIMAL(10,2),
    "current_value" DECIMAL(10,2),
    "start_value" DECIMAL(10,2),
    "unit" VARCHAR(50),
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "start_date" DATE NOT NULL,
    "target_date" DATE NOT NULL,
    "completed_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "icon" VARCHAR(50),
    "color" VARCHAR(7),
    "notes" TEXT,
    "milestones" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goals_user_id_idx" ON "goals"("user_id");

-- CreateIndex
CREATE INDEX "goals_status_idx" ON "goals"("status");

-- CreateIndex
CREATE INDEX "goals_target_date_idx" ON "goals"("target_date");

-- CreateIndex
CREATE INDEX "goals_goal_type_idx" ON "goals"("goal_type");

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
