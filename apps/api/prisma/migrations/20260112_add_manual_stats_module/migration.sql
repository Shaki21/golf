-- Manual Stats & Strokes Gained Module Migration
-- Adds tables for round tracking, shot events, image extraction, and SG calculation

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE "LieCategory" AS ENUM (
  'TEE',
  'FAIRWAY',
  'ROUGH',
  'BUNKER',
  'RECOVERY',
  'GREEN',
  'PENALTY',
  'OTHER'
);

CREATE TYPE "ShotCategory" AS ENUM (
  'TEE',
  'APPROACH',
  'SHORT_GAME',
  'PUTTING'
);

CREATE TYPE "DistanceType" AS ENUM (
  'TOTAL',
  'CARRY'
);

CREATE TYPE "ExtractionStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REQUIRES_REVIEW'
);

CREATE TYPE "RoundStatus" AS ENUM (
  'DRAFT',
  'PENDING_EXTRACTION',
  'PENDING_REVIEW',
  'FINALIZED',
  'ARCHIVED'
);

-- ============================================================================
-- GOLF ROUNDS
-- ============================================================================

CREATE TABLE golf_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

  -- Round metadata
  round_date DATE NOT NULL,
  course_name VARCHAR(255),
  course_id UUID,
  tee_box VARCHAR(50),

  -- Scoring
  total_score INTEGER,
  total_par INTEGER DEFAULT 72,
  holes_played INTEGER NOT NULL DEFAULT 18,

  -- Data quality
  data_quality REAL,
  sg_computable BOOLEAN NOT NULL DEFAULT FALSE,

  -- Status
  status "RoundStatus" NOT NULL DEFAULT 'DRAFT',
  input_method VARCHAR(20) NOT NULL DEFAULT 'manual',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finalized_at TIMESTAMPTZ
);

CREATE INDEX idx_golf_rounds_tenant ON golf_rounds(tenant_id);
CREATE INDEX idx_golf_rounds_player ON golf_rounds(player_id);
CREATE INDEX idx_golf_rounds_date ON golf_rounds(round_date);
CREATE INDEX idx_golf_rounds_status ON golf_rounds(status);
CREATE INDEX idx_golf_rounds_player_date ON golf_rounds(player_id, round_date);

-- ============================================================================
-- ROUND IMAGES
-- ============================================================================

CREATE TABLE round_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES golf_rounds(id) ON DELETE CASCADE,

  -- Storage
  original_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  mime_type VARCHAR(50) NOT NULL,
  file_size_bytes INTEGER NOT NULL,

  -- Metadata
  image_order INTEGER NOT NULL DEFAULT 0,
  holes_on_image INTEGER[] DEFAULT '{}',

  -- Upload info
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_round_images_round ON round_images(round_id);

-- ============================================================================
-- IMAGE EXTRACTIONS
-- ============================================================================

CREATE TABLE image_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID UNIQUE NOT NULL REFERENCES round_images(id) ON DELETE CASCADE,

  -- Processing status
  status "ExtractionStatus" NOT NULL DEFAULT 'PENDING',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,

  -- Extraction results
  raw_extraction JSONB,
  parsed_data JSONB,

  -- Confidence
  overall_confidence REAL,
  fields_requiring_review INTEGER NOT NULL DEFAULT 0,

  -- AI model info
  model_version VARCHAR(50),
  prompt_version VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_image_extractions_status ON image_extractions(status);

-- ============================================================================
-- EXTRACTION HOLE DATA
-- ============================================================================

CREATE TABLE extraction_hole_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extraction_id UUID NOT NULL REFERENCES image_extractions(id) ON DELETE CASCADE,

  -- Hole info
  hole_number INTEGER NOT NULL,
  hole_length_m INTEGER,
  hole_par INTEGER,
  hole_score INTEGER,

  -- Tee shot
  tee_club VARCHAR(20),
  tee_distance_m INTEGER,
  tee_distance_type "DistanceType",
  tee_confidence REAL,

  -- Approach shot
  approach_start_distance_m INTEGER,
  approach_lie "LieCategory",
  approach_club VARCHAR(20),
  approach_end_distance_m INTEGER,
  approach_end_lie "LieCategory",
  approach_confidence REAL,

  -- Short game
  short_game_start_distance_m INTEGER,
  short_game_lie "LieCategory",
  short_game_club VARCHAR(20),
  short_game_end_distance_m INTEGER,
  short_game_confidence REAL,

  -- Putting
  first_putt_length_m INTEGER,
  putts_count INTEGER,
  putting_confidence REAL,

  -- Overall
  overall_confidence REAL,
  is_partial BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,

  -- Review flags
  requires_review BOOLEAN NOT NULL DEFAULT FALSE,
  review_fields TEXT[] DEFAULT '{}',

  UNIQUE(extraction_id, hole_number)
);

CREATE INDEX idx_extraction_hole_data_extraction ON extraction_hole_data(extraction_id);

-- ============================================================================
-- ROUND HOLE DATA (Finalized)
-- ============================================================================

CREATE TABLE round_hole_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES golf_rounds(id) ON DELETE CASCADE,

  -- Hole info
  hole_number INTEGER NOT NULL,
  hole_length_m INTEGER,
  hole_par INTEGER,
  hole_score INTEGER,

  -- Data quality
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  sg_computable BOOLEAN NOT NULL DEFAULT FALSE,
  data_source VARCHAR(20) NOT NULL DEFAULT 'manual',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(round_id, hole_number)
);

CREATE INDEX idx_round_hole_data_round ON round_hole_data(round_id);

-- ============================================================================
-- SHOT EVENTS
-- ============================================================================

CREATE TABLE shot_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES golf_rounds(id) ON DELETE CASCADE,

  -- Shot identification
  hole_number INTEGER NOT NULL,
  shot_number INTEGER NOT NULL,

  -- Start state
  start_distance_m INTEGER NOT NULL,
  start_lie "LieCategory" NOT NULL,

  -- End state
  end_distance_m INTEGER,
  end_lie "LieCategory",
  is_holed BOOLEAN NOT NULL DEFAULT FALSE,

  -- Shot details
  club VARCHAR(20),
  distance_type "DistanceType",

  -- Categorization
  shot_category "ShotCategory" NOT NULL,

  -- Data quality
  is_estimated BOOLEAN NOT NULL DEFAULT FALSE,
  data_source VARCHAR(20) NOT NULL DEFAULT 'manual',
  confidence REAL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(round_id, hole_number, shot_number)
);

CREATE INDEX idx_shot_events_round ON shot_events(round_id);
CREATE INDEX idx_shot_events_round_hole ON shot_events(round_id, hole_number);
CREATE INDEX idx_shot_events_club ON shot_events(club);
CREATE INDEX idx_shot_events_lie_distance ON shot_events(start_lie, start_distance_m);

-- ============================================================================
-- USER OVERRIDES (Audit Trail)
-- ============================================================================

CREATE TABLE user_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES golf_rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  -- What was changed
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  field_name VARCHAR(50) NOT NULL,

  -- Change details
  previous_value TEXT,
  new_value TEXT NOT NULL,

  -- Context
  reason VARCHAR(255),

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_overrides_round ON user_overrides(round_id);
CREATE INDEX idx_user_overrides_user ON user_overrides(user_id);
CREATE INDEX idx_user_overrides_entity ON user_overrides(entity_type, entity_id);

-- ============================================================================
-- SG EXPECTED STROKES BASELINE
-- ============================================================================

CREATE TABLE sg_expected_strokes_baseline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Version info
  version VARCHAR(20) NOT NULL,
  description VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Lookup key
  lie_category "LieCategory" NOT NULL,
  distance_bucket_min INTEGER NOT NULL,
  distance_bucket_max INTEGER NOT NULL,

  -- Expected strokes value
  expected_strokes REAL NOT NULL,

  -- Metadata
  sample_size INTEGER,
  source VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(version, lie_category, distance_bucket_min, distance_bucket_max)
);

CREATE INDEX idx_sg_baseline_version ON sg_expected_strokes_baseline(version, is_active);
CREATE INDEX idx_sg_baseline_lookup ON sg_expected_strokes_baseline(lie_category, distance_bucket_min);

-- ============================================================================
-- SG SHOT RESULTS
-- ============================================================================

CREATE TABLE sg_shot_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shot_id UUID UNIQUE NOT NULL REFERENCES shot_events(id) ON DELETE CASCADE,

  -- SG calculation
  expected_strokes_start REAL NOT NULL,
  expected_strokes_end REAL NOT NULL,
  strokes_gained REAL NOT NULL,

  -- Baseline used
  baseline_version VARCHAR(20) NOT NULL,

  -- Timestamps
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sg_shot_results_baseline ON sg_shot_results(baseline_version);

-- ============================================================================
-- SG ROUND RESULTS
-- ============================================================================

CREATE TABLE sg_round_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID UNIQUE NOT NULL REFERENCES golf_rounds(id) ON DELETE CASCADE,

  -- Aggregated SG by category
  sg_tee REAL,
  sg_approach REAL,
  sg_short_game REAL,
  sg_putting REAL,
  sg_total REAL,

  -- Shot counts
  shot_count_tee INTEGER NOT NULL DEFAULT 0,
  shot_count_approach INTEGER NOT NULL DEFAULT 0,
  shot_count_short_game INTEGER NOT NULL DEFAULT 0,
  shot_count_putting INTEGER NOT NULL DEFAULT 0,

  -- Coverage metrics
  holes_with_sg INTEGER NOT NULL DEFAULT 0,
  total_holes INTEGER NOT NULL DEFAULT 18,
  coverage_percent REAL NOT NULL,

  -- Baseline used
  baseline_version VARCHAR(20) NOT NULL,

  -- Timestamps
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sg_round_results_baseline ON sg_round_results(baseline_version);

-- ============================================================================
-- SG CATEGORY CONFIG
-- ============================================================================

CREATE TABLE sg_category_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Version
  version VARCHAR(20) UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Rules (JSON)
  rules JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ADD RELATION TO PLAYER TABLE
-- ============================================================================

-- Add reverse relation from Player to GolfRound
-- Note: This is handled by Prisma relations, no additional columns needed

-- ============================================================================
-- INSERT DEFAULT SG CATEGORY CONFIG
-- ============================================================================

INSERT INTO sg_category_configs (id, version, is_active, rules, created_at)
VALUES (
  gen_random_uuid(),
  'v1.0',
  true,
  '{"SHORT_GAME_MAX_DISTANCE_M": 50, "TEE_SHOT_NUMBER": 1, "PUTTING_START_LIE": ["GREEN"]}',
  NOW()
);
