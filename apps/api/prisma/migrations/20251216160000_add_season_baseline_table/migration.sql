-- CreateTable
CREATE TABLE "season_baselines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "season" INTEGER NOT NULL,
    "baseline_type" VARCHAR(20) NOT NULL,
    "baseline_score" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "season_baselines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "season_baselines_user_id_season_key" ON "season_baselines"("user_id", "season");

-- CreateIndex
CREATE INDEX "season_baselines_user_id_idx" ON "season_baselines"("user_id");

-- CreateIndex
CREATE INDEX "season_baselines_season_idx" ON "season_baselines"("season");

-- AddForeignKey
ALTER TABLE "season_baselines" ADD CONSTRAINT "season_baselines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
