-- Training Area Performance Tracking
-- Stores detailed performance metrics for each training area after sessions

CREATE TABLE IF NOT EXISTS "training_area_performance" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "player_id" UUID NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
  "session_id" UUID REFERENCES "training_sessions"("id") ON DELETE SET NULL,
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,

  -- Training Area (16 areas from AK-formula)
  "training_area" VARCHAR(50) NOT NULL, -- TEE, INN200, INN150, INN100, INN50, CHIP, PITCH, LOB, BUNKER, PUTT0-3, PUTT3-8, PUTT8-15, PUTT15-25, PUTT25-40, PUTT40+, SPILL

  -- Performance Date
  "performance_date" DATE NOT NULL,

  -- Performance Metrics (depends on training area)
  "success_rate" DECIMAL(5,2), -- % success (0-100)
  "accuracy" DECIMAL(6,3), -- meters/feet from target
  "consistency_score" INT, -- 1-10 rating
  "repetitions" INT, -- number of attempts
  "successful_reps" INT, -- successful attempts

  -- Specific metrics per area type
  "distance_meters" DECIMAL(6,2), -- for distance shots (TEE, INN areas)
  "carry_distance" DECIMAL(6,2), -- carry distance
  "dispersion" DECIMAL(6,2), -- shot dispersion in meters
  "average_distance_from_target" DECIMAL(6,2), -- avg distance from target
  "made_putts" INT, -- for putting areas
  "total_putts" INT, -- total putt attempts
  "up_and_down_success" INT, -- for short game
  "up_and_down_attempts" INT,

  -- Learning Phase context
  "learning_phase" VARCHAR(10), -- L-KROPP, L-ARM, L-KØLLE, L-BALL, L-AUTO
  "club_speed" VARCHAR(10), -- CS0-CS100
  "environment" VARCHAR(2), -- M0-M5
  "pressure" VARCHAR(3), -- PR1-PR5

  -- Session evaluation
  "feel_rating" INT, -- 1-10 how it felt
  "technical_rating" INT, -- 1-10 technical execution
  "mental_rating" INT, -- 1-10 mental state

  -- Notes
  "notes" TEXT,
  "key_learning" TEXT,
  "next_focus" TEXT,

  -- Timestamps
  "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Indexes for performance queries
CREATE INDEX IF NOT EXISTS "idx_tap_player" ON "training_area_performance"("player_id");
CREATE INDEX IF NOT EXISTS "idx_tap_area" ON "training_area_performance"("training_area");
CREATE INDEX IF NOT EXISTS "idx_tap_date" ON "training_area_performance"("performance_date");
CREATE INDEX IF NOT EXISTS "idx_tap_session" ON "training_area_performance"("session_id");
CREATE INDEX IF NOT EXISTS "idx_tap_tenant" ON "training_area_performance"("tenant_id");

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS "idx_tap_player_area_date" ON "training_area_performance"("player_id", "training_area", "performance_date" DESC);

COMMENT ON TABLE "training_area_performance" IS 'Tracks detailed performance metrics for each of the 16 training areas after training sessions';
COMMENT ON COLUMN "training_area_performance"."training_area" IS '16 training areas: TEE, INN200, INN150, INN100, INN50, CHIP, PITCH, LOB, BUNKER, PUTT0-3, PUTT3-8, PUTT8-15, PUTT15-25, PUTT25-40, PUTT40+, SPILL';
COMMENT ON COLUMN "training_area_performance"."success_rate" IS 'Percentage of successful attempts (0-100)';
COMMENT ON COLUMN "training_area_performance"."consistency_score" IS 'Consistency rating from 1-10';
