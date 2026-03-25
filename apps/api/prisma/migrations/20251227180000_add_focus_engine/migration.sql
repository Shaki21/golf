-- CreateTable
CREATE TABLE "dg_player_seasons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" VARCHAR(255) NOT NULL,
    "season" INTEGER NOT NULL,
    "ott_true" DECIMAL(8,4),
    "app_true" DECIMAL(8,4),
    "arg_true" DECIMAL(8,4),
    "putt_true" DECIMAL(8,4),
    "t2g_true" DECIMAL(8,4),
    "total_true" DECIMAL(8,4),
    "rounds_played" INTEGER,
    "events_played" INTEGER,
    "wins" INTEGER,
    "x_wins" DECIMAL(6,3),
    "source_version" VARCHAR(64) NOT NULL,
    "ingested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dg_player_seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dg_approach_skills_l24" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" VARCHAR(255) NOT NULL,
    "bucket" VARCHAR(20) NOT NULL,
    "lie" VARCHAR(20) NOT NULL,
    "stat" VARCHAR(50) NOT NULL,
    "value" DECIMAL(10,4),
    "shot_count" INTEGER,
    "source_version" VARCHAR(64) NOT NULL,
    "ingested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dg_approach_skills_l24_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dg_component_weights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "window_start_season" INTEGER NOT NULL,
    "window_end_season" INTEGER NOT NULL,
    "w_ott" DECIMAL(6,4) NOT NULL,
    "w_app" DECIMAL(6,4) NOT NULL,
    "w_arg" DECIMAL(6,4) NOT NULL,
    "w_putt" DECIMAL(6,4) NOT NULL,
    "computed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dg_component_weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_component_mappings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "test_number" INTEGER NOT NULL,
    "component" VARCHAR(10) NOT NULL,
    "weight" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_component_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_focus_cache" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "focus_component" VARCHAR(10) NOT NULL,
    "focus_scores" JSONB NOT NULL,
    "recommended_split" JSONB NOT NULL,
    "reason_codes" TEXT[],
    "confidence" VARCHAR(10) NOT NULL,
    "computed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_focus_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dg_player_seasons_season_idx" ON "dg_player_seasons"("season");

-- CreateIndex
CREATE INDEX "dg_player_seasons_player_id_idx" ON "dg_player_seasons"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "dg_player_seasons_player_id_season_key" ON "dg_player_seasons"("player_id", "season");

-- CreateIndex
CREATE INDEX "dg_approach_skills_l24_player_id_idx" ON "dg_approach_skills_l24"("player_id");

-- CreateIndex
CREATE INDEX "dg_approach_skills_l24_bucket_idx" ON "dg_approach_skills_l24"("bucket");

-- CreateIndex
CREATE INDEX "dg_approach_skills_l24_stat_idx" ON "dg_approach_skills_l24"("stat");

-- CreateIndex
CREATE UNIQUE INDEX "dg_approach_skills_l24_player_id_bucket_lie_stat_key" ON "dg_approach_skills_l24"("player_id", "bucket", "lie", "stat");

-- CreateIndex
CREATE INDEX "dg_component_weights_is_active_idx" ON "dg_component_weights"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "dg_component_weights_window_start_season_window_end_season_key" ON "dg_component_weights"("window_start_season", "window_end_season");

-- CreateIndex
CREATE UNIQUE INDEX "test_component_mappings_test_number_key" ON "test_component_mappings"("test_number");

-- CreateIndex
CREATE UNIQUE INDEX "player_focus_cache_player_id_key" ON "player_focus_cache"("player_id");

-- CreateIndex
CREATE INDEX "player_focus_cache_expires_at_idx" ON "player_focus_cache"("expires_at");

-- Seed default test-to-component mappings
INSERT INTO "test_component_mappings" ("test_number", "component", "weight") VALUES
-- OTT (Off the Tee) - Tests 1, 2, 5, 6, 7
(1, 'OTT', 1.0),   -- Driver Avstand
(2, 'OTT', 0.8),   -- 3-tre Avstand
(5, 'OTT', 1.0),   -- Klubbhastighet
(6, 'OTT', 1.0),   -- Ballhastighet
(7, 'OTT', 0.8),   -- Smash Factor
-- APP (Approach) - Tests 3, 4, 8, 9, 10, 11
(3, 'APP', 0.8),   -- 5-jern Avstand
(4, 'APP', 0.6),   -- Wedge Avstand
(8, 'APP', 0.8),   -- Approach 25m
(9, 'APP', 0.9),   -- Approach 50m
(10, 'APP', 1.0),  -- Approach 75m
(11, 'APP', 1.0),  -- Approach 100m
-- ARG (Around the Green) - Tests 17, 18
(17, 'ARG', 1.0),  -- Chipping
(18, 'ARG', 1.0),  -- Bunker
-- PUTT (Putting) - Tests 15, 16
(15, 'PUTT', 1.0), -- Putting 3m
(16, 'PUTT', 1.0); -- Putting 6m
