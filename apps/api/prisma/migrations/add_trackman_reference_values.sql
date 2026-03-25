-- CreateTable: TrackMan Reference Values
CREATE TABLE IF NOT EXISTS "trackman_reference_values" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "club" VARCHAR(50) NOT NULL,
    "parameter" VARCHAR(50) NOT NULL,
    "target_value" DECIMAL(10,2) NOT NULL,
    "tolerance" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trackman_reference_values_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "trackman_reference_values_player_club_parameter_key" UNIQUE ("player_id", "club", "parameter")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "trackman_reference_values_player_id_idx" ON "trackman_reference_values"("player_id");
CREATE INDEX IF NOT EXISTS "trackman_reference_values_club_idx" ON "trackman_reference_values"("club");

-- AddForeignKey
ALTER TABLE "trackman_reference_values" ADD CONSTRAINT "trackman_reference_values_player_id_fkey"
FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
