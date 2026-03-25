-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "subscription_tier" VARCHAR(50) NOT NULL DEFAULT 'free',
    "max_players" INTEGER NOT NULL DEFAULT 50,
    "max_coaches" INTEGER NOT NULL DEFAULT 5,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "specializations" JSONB NOT NULL DEFAULT '[]',
    "certifications" JSONB NOT NULL DEFAULT '[]',
    "working_hours" JSONB NOT NULL DEFAULT '{}',
    "max_players_per_session" INTEGER NOT NULL DEFAULT 4,
    "hourly_rate" DECIMAL(8,2),
    "role" VARCHAR(50),
    "color" VARCHAR(7) NOT NULL DEFAULT '#1E4B33',
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "profile_image_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "preferred_contact_method" VARCHAR(20) NOT NULL DEFAULT 'email',
    "notification_preferences" JSONB NOT NULL DEFAULT '{"training_reminders":true,"tournament_updates":true,"test_results":true,"billing":true}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "date_of_birth" DATE NOT NULL,
    "gender" VARCHAR(10) NOT NULL,
    "category" VARCHAR(2) NOT NULL,
    "average_score" DECIMAL(5,2),
    "handicap" DECIMAL(4,1),
    "wagr_rank" INTEGER,
    "club" VARCHAR(200),
    "coach_id" UUID,
    "parent_id" UUID,
    "current_period" VARCHAR(1) NOT NULL DEFAULT 'G',
    "weekly_training_hours" INTEGER DEFAULT 10,
    "season_start_date" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "profile_image_url" VARCHAR(500),
    "emergency_contact" JSONB,
    "medical_notes" TEXT,
    "goals" JSONB DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "event_type" VARCHAR(50) NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "all_day" BOOLEAN NOT NULL DEFAULT false,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Europe/Oslo',
    "location" TEXT,
    "location_details" JSONB,
    "coach_id" UUID,
    "max_participants" INTEGER,
    "current_count" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    "recurrence_rule" JSONB,
    "parent_event_id" UUID,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    "checked_in_at" TIMESTAMPTZ(6),
    "checked_out_at" TIMESTAMPTZ(6),
    "performance" JSONB,
    "notes" TEXT,
    "payment_status" VARCHAR(20) DEFAULT 'unpaid',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "tournament_type" VARCHAR(50) NOT NULL,
    "level" VARCHAR(50) NOT NULL,
    "course_name" VARCHAR(255) NOT NULL,
    "par" INTEGER NOT NULL,
    "course_rating" DECIMAL(4,1),
    "slope_rating" INTEGER,
    "format" VARCHAR(50) NOT NULL,
    "number_of_rounds" INTEGER NOT NULL DEFAULT 1,
    "entry_fee" DECIMAL(8,2),
    "prize_pool" DECIMAL(10,2),
    "registration_url" VARCHAR(500),
    "topping_weeks" INTEGER NOT NULL DEFAULT 0,
    "tapering_days" INTEGER NOT NULL DEFAULT 0,
    "focus_areas" JSONB DEFAULT '[]',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tournament_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "position" INTEGER,
    "total_score" INTEGER NOT NULL,
    "score_to_par" INTEGER NOT NULL,
    "round_scores" JSONB NOT NULL,
    "strokes_gained" JSONB,
    "fairways_hit" DECIMAL(5,2),
    "greens_in_regulation" DECIMAL(5,2),
    "putts_per_round" DECIMAL(4,2),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "test_number" INTEGER NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "test_type" VARCHAR(50) NOT NULL,
    "protocol_name" VARCHAR(255) NOT NULL,
    "protocol_version" VARCHAR(10) NOT NULL DEFAULT '1.0',
    "description" TEXT NOT NULL,
    "target_category" VARCHAR(2),
    "test_details" JSONB NOT NULL,
    "benchmark_week" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "test_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "test_date" DATE NOT NULL,
    "test_time" VARCHAR(5),
    "location" VARCHAR(255),
    "facility" VARCHAR(255),
    "environment" VARCHAR(20),
    "weather" VARCHAR(255),
    "equipment" VARCHAR(255),
    "results" JSONB NOT NULL,
    "value" DECIMAL(10,4) NOT NULL,
    "pei" DECIMAL(6,4),
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "category_requirement" DECIMAL(10,4),
    "percent_of_requirement" DECIMAL(6,2),
    "category_benchmark" BOOLEAN NOT NULL DEFAULT false,
    "improvement_from_last" DECIMAL(6,2),
    "video_url" VARCHAR(500),
    "tracker_data" JSONB,
    "coach_feedback" TEXT,
    "player_feedback" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID,
    "coach_id" UUID,
    "session_type" VARCHAR(50) NOT NULL,
    "session_date" TIMESTAMPTZ(6) NOT NULL,
    "duration" INTEGER NOT NULL,
    "learning_phase" VARCHAR(10),
    "club_speed" VARCHAR(10),
    "setting" VARCHAR(10),
    "surface" VARCHAR(50),
    "focus_area" VARCHAR(100),
    "drill_ids" JSONB,
    "period" VARCHAR(1),
    "intensity" INTEGER,
    "notes" TEXT,
    "daily_assignment_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "week_number" INTEGER NOT NULL,
    "period" VARCHAR(1) NOT NULL,
    "priority_competition" INTEGER NOT NULL DEFAULT 0,
    "priority_play" INTEGER NOT NULL DEFAULT 0,
    "priority_golf_shot" INTEGER NOT NULL DEFAULT 0,
    "priority_technique" INTEGER NOT NULL DEFAULT 0,
    "priority_physical" INTEGER NOT NULL DEFAULT 0,
    "learning_phase_min" VARCHAR(10),
    "learning_phase_max" VARCHAR(10),
    "club_speed_min" VARCHAR(10),
    "club_speed_max" VARCHAR(10),
    "planned_hours" INTEGER,
    "actual_hours" INTEGER DEFAULT 0,
    "notes" TEXT,
    "annual_plan_id" UUID,
    "period_phase" VARCHAR(20),
    "week_in_period" INTEGER,
    "volume_intensity" VARCHAR(20),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "periodization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "coach_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "slot_duration" INTEGER NOT NULL DEFAULT 60,
    "max_bookings" INTEGER NOT NULL DEFAULT 1,
    "session_type" VARCHAR(50),
    "valid_from" DATE NOT NULL,
    "valid_until" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "availability_id" UUID,
    "booked_by" UUID NOT NULL,
    "booking_type" VARCHAR(30) NOT NULL DEFAULT 'player_request',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "booked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "cancellation_reason" TEXT,
    "payment_status" VARCHAR(20) DEFAULT 'unpaid',
    "payment_amount" DECIMAL(8,2),
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_type" VARCHAR(20) NOT NULL,
    "recipient_id" UUID NOT NULL,
    "notification_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'normal',
    "channels" JSONB NOT NULL DEFAULT '["app"]',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "sent_at" TIMESTAMPTZ(6),
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "purpose" TEXT,
    "exercise_type" VARCHAR(50) NOT NULL,
    "learning_phases" VARCHAR(20)[],
    "settings" VARCHAR(10)[],
    "club_speed_levels" VARCHAR(10)[],
    "categories" VARCHAR(2)[],
    "periods" VARCHAR(1)[],
    "reps_or_time" VARCHAR(100),
    "equipment" JSONB,
    "location" VARCHAR(50),
    "difficulty" VARCHAR(20),
    "progression_steps" TEXT,
    "regression_steps" TEXT,
    "success_criteria" TEXT,
    "common_mistakes" TEXT,
    "coaching_cues" TEXT,
    "addresses_breaking_points" VARCHAR(50)[],
    "process_category" VARCHAR(20) NOT NULL,
    "video_url" VARCHAR(500),
    "image_url" VARCHAR(500),
    "source" VARCHAR(255),
    "variants" TEXT,
    "player_feedback" TEXT,
    "tags" VARCHAR(50)[],
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "session_type" VARCHAR(50) NOT NULL,
    "learning_phase" VARCHAR(10),
    "setting" VARCHAR(10),
    "club_speed" VARCHAR(10),
    "categories" VARCHAR(2)[],
    "periods" VARCHAR(1)[],
    "duration" INTEGER NOT NULL,
    "exercise_sequence" JSONB NOT NULL,
    "objectives" TEXT,
    "structure" TEXT,
    "success_criteria" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "week_plan_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(2) NOT NULL,
    "period" VARCHAR(1) NOT NULL,
    "variant" VARCHAR(50) NOT NULL,
    "monday_sessions" UUID[],
    "tuesday_sessions" UUID[],
    "wednesday_sessions" UUID[],
    "thursday_sessions" UUID[],
    "friday_sessions" UUID[],
    "saturday_sessions" UUID[],
    "sunday_sessions" UUID[],
    "distribution" JSONB NOT NULL,
    "rest_day" VARCHAR(20),
    "learning_phase_focus" VARCHAR(20),
    "setting_range" VARCHAR(20),
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "week_plan_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breaking_points" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "process_category" VARCHAR(20) NOT NULL,
    "specific_area" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "identified_date" DATE NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "baseline_measurement" VARCHAR(100),
    "target_measurement" VARCHAR(100),
    "current_measurement" VARCHAR(100),
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "assigned_exercise_ids" UUID[],
    "hours_per_week" INTEGER,
    "status" VARCHAR(30) NOT NULL DEFAULT 'not_started',
    "success_history" JSONB DEFAULT '[]',
    "resolved_date" DATE,
    "notes" TEXT,
    "source_type" VARCHAR(20) NOT NULL DEFAULT 'manual',
    "calibration_id" UUID,
    "club_type" VARCHAR(20),
    "deviation_percent" DECIMAL(5,2),
    "auto_detected" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breaking_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "log_date" DATE NOT NULL,
    "session_type" VARCHAR(50) NOT NULL,
    "planned_session" VARCHAR(255),
    "actual_session" VARCHAR(255),
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "completion_reason" VARCHAR(100),
    "duration" INTEGER,
    "quality" INTEGER,
    "focus" INTEGER,
    "energy_before" INTEGER,
    "energy_after" INTEGER,
    "what_worked_well" TEXT,
    "challenges" TEXT,
    "key_learning" TEXT,
    "breaking_point_work" UUID[],
    "weather" VARCHAR(100),
    "coach_present" BOOLEAN NOT NULL DEFAULT false,
    "injuries" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "week_number" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "category_at_test" VARCHAR(2) NOT NULL,
    "period" VARCHAR(1) NOT NULL,
    "tests_completed" UUID[],
    "pass_rate" DECIMAL(5,2),
    "strengths" VARCHAR(100)[],
    "weaknesses" VARCHAR(100)[],
    "new_breaking_points" UUID[],
    "resolved_breaking_points" UUID[],
    "progression_status" VARCHAR(50),
    "training_adjustments" TEXT,
    "coach_notes" TEXT,
    "pdf_report_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benchmark_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "aggregate_type" VARCHAR(100) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "key" VARCHAR(500) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "file_size" BIGINT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending_upload',
    "uploaded_by" UUID,
    "category" VARCHAR(50),
    "related_entity_type" VARCHAR(50),
    "related_entity_id" UUID,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_requirements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category" VARCHAR(2) NOT NULL,
    "gender" VARCHAR(1) NOT NULL,
    "test_number" INTEGER NOT NULL,
    "requirement" DECIMAL(10,4) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "comparison" VARCHAR(20) NOT NULL,
    "range_min" DECIMAL(10,4),
    "range_max" DECIMAL(10,4),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peer_comparisons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "test_result_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "test_number" INTEGER NOT NULL,
    "peer_count" INTEGER NOT NULL,
    "peer_mean" DECIMAL(10,4) NOT NULL,
    "peer_median" DECIMAL(10,4) NOT NULL,
    "peer_std_dev" DECIMAL(10,4) NOT NULL,
    "peer_min" DECIMAL(10,4) NOT NULL,
    "peer_max" DECIMAL(10,4) NOT NULL,
    "percentile_25" DECIMAL(10,4) NOT NULL,
    "percentile_75" DECIMAL(10,4) NOT NULL,
    "percentile_90" DECIMAL(10,4) NOT NULL,
    "player_value" DECIMAL(10,4) NOT NULL,
    "player_percentile" DECIMAL(5,2) NOT NULL,
    "player_rank" INTEGER NOT NULL,
    "player_z_score" DECIMAL(6,3) NOT NULL,
    "peer_criteria" JSONB NOT NULL,
    "comparison_text" VARCHAR(255) NOT NULL,
    "calculated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "peer_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datagolf_players" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "datagolf_id" VARCHAR(100) NOT NULL,
    "player_name" VARCHAR(255) NOT NULL,
    "sg_total" DECIMAL(6,3),
    "sg_off_tee" DECIMAL(6,3),
    "sg_approach" DECIMAL(6,3),
    "sg_around_green" DECIMAL(6,3),
    "sg_putting" DECIMAL(6,3),
    "driving_distance" DECIMAL(6,2),
    "driving_accuracy" DECIMAL(5,2),
    "gir_percent" DECIMAL(5,2),
    "scrambling_percent" DECIMAL(5,2),
    "putts_per_round" DECIMAL(4,2),
    "proximity_data" JSONB,
    "tour" VARCHAR(50),
    "season" INTEGER,
    "last_synced" TIMESTAMPTZ(6) NOT NULL,
    "iup_player_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "datagolf_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datagolf_tour_averages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tour" VARCHAR(50) NOT NULL,
    "season" INTEGER NOT NULL,
    "stats" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "datagolf_tour_averages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_filters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "coach_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "filter" JSONB NOT NULL,
    "last_used" TIMESTAMPTZ(6),
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_cache" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cache_key" VARCHAR(500) NOT NULL,
    "cache_type" VARCHAR(100) NOT NULL,
    "data" JSONB NOT NULL,
    "calculated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "analytics_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_speed_calibrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "calibration_date" TIMESTAMPTZ(6) NOT NULL,
    "driver_speed" DECIMAL(5,1) NOT NULL,
    "clubs_data" JSONB NOT NULL,
    "speed_profile" JSONB NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_speed_calibrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annual_training_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "player_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan_name" VARCHAR(255) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "baseline_average_score" DECIMAL(5,2) NOT NULL,
    "baseline_handicap" DECIMAL(4,1),
    "baseline_driver_speed" DECIMAL(5,1),
    "player_category" VARCHAR(2) NOT NULL,
    "base_period_weeks" INTEGER NOT NULL,
    "specialization_weeks" INTEGER NOT NULL,
    "tournament_weeks" INTEGER NOT NULL,
    "weekly_hours_target" INTEGER NOT NULL,
    "intensity_profile" JSONB NOT NULL,
    "generated_at" TIMESTAMPTZ(6) NOT NULL,
    "generated_by" UUID,
    "generation_algorithm" VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    "notes" TEXT,
    "last_modified_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "annual_training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_training_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "annual_plan_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "assigned_date" DATE NOT NULL,
    "week_number" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "session_template_id" UUID,
    "session_type" VARCHAR(50) NOT NULL,
    "estimated_duration" INTEGER NOT NULL,
    "period" VARCHAR(1) NOT NULL,
    "learning_phase" VARCHAR(10),
    "club_speed" VARCHAR(10),
    "intensity" INTEGER,
    "is_rest_day" BOOLEAN NOT NULL DEFAULT false,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "can_be_substituted" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(20) NOT NULL DEFAULT 'planned',
    "completed_session_id" UUID,
    "completed_at" TIMESTAMPTZ(6),
    "coach_notes" TEXT,
    "player_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_training_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_tournaments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "annual_plan_id" UUID NOT NULL,
    "tournament_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "importance" VARCHAR(20) NOT NULL,
    "week_number" INTEGER NOT NULL,
    "period" VARCHAR(1) NOT NULL,
    "topping_start_week" INTEGER,
    "topping_duration_weeks" INTEGER NOT NULL DEFAULT 0,
    "tapering_start_date" DATE,
    "tapering_duration_days" INTEGER NOT NULL DEFAULT 0,
    "focus_areas" JSONB DEFAULT '[]',
    "participated" BOOLEAN NOT NULL DEFAULT false,
    "result_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduled_tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speed_category_mappings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "min_driver_speed" DECIMAL(5,1) NOT NULL,
    "max_driver_speed" DECIMAL(5,1) NOT NULL,
    "club_speed_level" VARCHAR(10) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speed_category_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "coaches_tenant_id_idx" ON "coaches"("tenant_id");

-- CreateIndex
CREATE INDEX "coaches_status_idx" ON "coaches"("status");

-- CreateIndex
CREATE INDEX "coaches_email_idx" ON "coaches"("email");

-- CreateIndex
CREATE INDEX "parents_tenant_id_idx" ON "parents"("tenant_id");

-- CreateIndex
CREATE INDEX "players_tenant_id_idx" ON "players"("tenant_id");

-- CreateIndex
CREATE INDEX "players_category_idx" ON "players"("category");

-- CreateIndex
CREATE INDEX "players_status_idx" ON "players"("status");

-- CreateIndex
CREATE INDEX "players_coach_id_idx" ON "players"("coach_id");

-- CreateIndex
CREATE INDEX "events_tenant_id_idx" ON "events"("tenant_id");

-- CreateIndex
CREATE INDEX "events_event_type_idx" ON "events"("event_type");

-- CreateIndex
CREATE INDEX "events_start_time_idx" ON "events"("start_time");

-- CreateIndex
CREATE INDEX "events_coach_id_idx" ON "events"("coach_id");

-- CreateIndex
CREATE INDEX "event_participants_event_id_idx" ON "event_participants"("event_id");

-- CreateIndex
CREATE INDEX "event_participants_player_id_idx" ON "event_participants"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "tournaments_event_id_key" ON "tournaments"("event_id");

-- CreateIndex
CREATE INDEX "tournament_results_tournament_id_idx" ON "tournament_results"("tournament_id");

-- CreateIndex
CREATE INDEX "tournament_results_player_id_idx" ON "tournament_results"("player_id");

-- CreateIndex
CREATE INDEX "tests_tenant_id_idx" ON "tests"("tenant_id");

-- CreateIndex
CREATE INDEX "tests_test_type_idx" ON "tests"("test_type");

-- CreateIndex
CREATE UNIQUE INDEX "tests_tenant_id_test_number_key" ON "tests"("tenant_id", "test_number");

-- CreateIndex
CREATE INDEX "test_results_test_id_idx" ON "test_results"("test_id");

-- CreateIndex
CREATE INDEX "test_results_player_id_idx" ON "test_results"("player_id");

-- CreateIndex
CREATE INDEX "test_results_test_date_idx" ON "test_results"("test_date");

-- CreateIndex
CREATE INDEX "test_results_passed_idx" ON "test_results"("passed");

-- CreateIndex
CREATE INDEX "training_sessions_player_id_idx" ON "training_sessions"("player_id");

-- CreateIndex
CREATE INDEX "training_sessions_coach_id_idx" ON "training_sessions"("coach_id");

-- CreateIndex
CREATE INDEX "training_sessions_session_date_idx" ON "training_sessions"("session_date");

-- CreateIndex
CREATE INDEX "training_sessions_daily_assignment_id_idx" ON "training_sessions"("daily_assignment_id");

-- CreateIndex
CREATE INDEX "periodization_player_id_idx" ON "periodization"("player_id");

-- CreateIndex
CREATE INDEX "periodization_annual_plan_id_idx" ON "periodization"("annual_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "periodization_player_id_week_number_key" ON "periodization"("player_id", "week_number");

-- CreateIndex
CREATE INDEX "availability_coach_id_idx" ON "availability"("coach_id");

-- CreateIndex
CREATE INDEX "bookings_event_id_idx" ON "bookings"("event_id");

-- CreateIndex
CREATE INDEX "bookings_player_id_idx" ON "bookings"("player_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_booked_at_idx" ON "bookings"("booked_at");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_idx" ON "notifications"("recipient_id");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "exercises_tenant_id_idx" ON "exercises"("tenant_id");

-- CreateIndex
CREATE INDEX "exercises_exercise_type_idx" ON "exercises"("exercise_type");

-- CreateIndex
CREATE INDEX "exercises_is_active_idx" ON "exercises"("is_active");

-- CreateIndex
CREATE INDEX "session_templates_tenant_id_idx" ON "session_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "session_templates_session_type_idx" ON "session_templates"("session_type");

-- CreateIndex
CREATE INDEX "week_plan_templates_tenant_id_idx" ON "week_plan_templates"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "week_plan_templates_tenant_id_category_period_variant_key" ON "week_plan_templates"("tenant_id", "category", "period", "variant");

-- CreateIndex
CREATE INDEX "breaking_points_player_id_idx" ON "breaking_points"("player_id");

-- CreateIndex
CREATE INDEX "breaking_points_status_idx" ON "breaking_points"("status");

-- CreateIndex
CREATE INDEX "breaking_points_source_type_idx" ON "breaking_points"("source_type");

-- CreateIndex
CREATE INDEX "breaking_points_calibration_id_idx" ON "breaking_points"("calibration_id");

-- CreateIndex
CREATE INDEX "progress_log_player_id_idx" ON "progress_log"("player_id");

-- CreateIndex
CREATE INDEX "progress_log_log_date_idx" ON "progress_log"("log_date");

-- CreateIndex
CREATE UNIQUE INDEX "progress_log_player_id_log_date_session_type_key" ON "progress_log"("player_id", "log_date", "session_type");

-- CreateIndex
CREATE INDEX "benchmark_sessions_player_id_idx" ON "benchmark_sessions"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "benchmark_sessions_player_id_week_number_key" ON "benchmark_sessions"("player_id", "week_number");

-- CreateIndex
CREATE INDEX "outbox_events_tenant_id_idx" ON "outbox_events"("tenant_id");

-- CreateIndex
CREATE INDEX "outbox_events_created_at_idx" ON "outbox_events"("created_at");

-- CreateIndex
CREATE INDEX "outbox_events_processed_at_idx" ON "outbox_events"("processed_at");

-- CreateIndex
CREATE UNIQUE INDEX "media_key_key" ON "media"("key");

-- CreateIndex
CREATE INDEX "media_tenant_id_idx" ON "media"("tenant_id");

-- CreateIndex
CREATE INDEX "media_status_idx" ON "media"("status");

-- CreateIndex
CREATE INDEX "media_related_entity_type_related_entity_id_idx" ON "media"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE INDEX "category_requirements_category_idx" ON "category_requirements"("category");

-- CreateIndex
CREATE INDEX "category_requirements_test_number_idx" ON "category_requirements"("test_number");

-- CreateIndex
CREATE UNIQUE INDEX "category_requirements_category_gender_test_number_key" ON "category_requirements"("category", "gender", "test_number");

-- CreateIndex
CREATE INDEX "peer_comparisons_player_id_test_number_idx" ON "peer_comparisons"("player_id", "test_number");

-- CreateIndex
CREATE INDEX "peer_comparisons_calculated_at_idx" ON "peer_comparisons"("calculated_at");

-- CreateIndex
CREATE UNIQUE INDEX "datagolf_players_datagolf_id_key" ON "datagolf_players"("datagolf_id");

-- CreateIndex
CREATE UNIQUE INDEX "datagolf_players_iup_player_id_key" ON "datagolf_players"("iup_player_id");

-- CreateIndex
CREATE INDEX "datagolf_players_datagolf_id_idx" ON "datagolf_players"("datagolf_id");

-- CreateIndex
CREATE INDEX "datagolf_players_tour_season_idx" ON "datagolf_players"("tour", "season");

-- CreateIndex
CREATE INDEX "datagolf_tour_averages_tour_idx" ON "datagolf_tour_averages"("tour");

-- CreateIndex
CREATE UNIQUE INDEX "datagolf_tour_averages_tour_season_key" ON "datagolf_tour_averages"("tour", "season");

-- CreateIndex
CREATE INDEX "saved_filters_coach_id_idx" ON "saved_filters"("coach_id");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_cache_cache_key_key" ON "analytics_cache"("cache_key");

-- CreateIndex
CREATE INDEX "analytics_cache_cache_key_idx" ON "analytics_cache"("cache_key");

-- CreateIndex
CREATE INDEX "analytics_cache_expires_at_idx" ON "analytics_cache"("expires_at");

-- CreateIndex
CREATE INDEX "analytics_cache_cache_type_idx" ON "analytics_cache"("cache_type");

-- CreateIndex
CREATE UNIQUE INDEX "club_speed_calibrations_player_id_key" ON "club_speed_calibrations"("player_id");

-- CreateIndex
CREATE INDEX "club_speed_calibrations_player_id_idx" ON "club_speed_calibrations"("player_id");

-- CreateIndex
CREATE INDEX "club_speed_calibrations_tenant_id_idx" ON "club_speed_calibrations"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "annual_training_plans_player_id_key" ON "annual_training_plans"("player_id");

-- CreateIndex
CREATE INDEX "annual_training_plans_player_id_idx" ON "annual_training_plans"("player_id");

-- CreateIndex
CREATE INDEX "annual_training_plans_tenant_id_idx" ON "annual_training_plans"("tenant_id");

-- CreateIndex
CREATE INDEX "annual_training_plans_status_idx" ON "annual_training_plans"("status");

-- CreateIndex
CREATE INDEX "annual_training_plans_start_date_idx" ON "annual_training_plans"("start_date");

-- CreateIndex
CREATE INDEX "daily_training_assignments_annual_plan_id_idx" ON "daily_training_assignments"("annual_plan_id");

-- CreateIndex
CREATE INDEX "daily_training_assignments_player_id_idx" ON "daily_training_assignments"("player_id");

-- CreateIndex
CREATE INDEX "daily_training_assignments_assigned_date_idx" ON "daily_training_assignments"("assigned_date");

-- CreateIndex
CREATE INDEX "daily_training_assignments_week_number_idx" ON "daily_training_assignments"("week_number");

-- CreateIndex
CREATE INDEX "daily_training_assignments_status_idx" ON "daily_training_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "daily_training_assignments_annual_plan_id_assigned_date_ses_key" ON "daily_training_assignments"("annual_plan_id", "assigned_date", "session_type");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_tournaments_result_id_key" ON "scheduled_tournaments"("result_id");

-- CreateIndex
CREATE INDEX "scheduled_tournaments_annual_plan_id_idx" ON "scheduled_tournaments"("annual_plan_id");

-- CreateIndex
CREATE INDEX "scheduled_tournaments_start_date_idx" ON "scheduled_tournaments"("start_date");

-- CreateIndex
CREATE INDEX "scheduled_tournaments_week_number_idx" ON "scheduled_tournaments"("week_number");

-- CreateIndex
CREATE INDEX "speed_category_mappings_club_speed_level_idx" ON "speed_category_mappings"("club_speed_level");

-- CreateIndex
CREATE UNIQUE INDEX "speed_category_mappings_min_driver_speed_max_driver_speed_key" ON "speed_category_mappings"("min_driver_speed", "max_driver_speed");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parents" ADD CONSTRAINT "parents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodization" ADD CONSTRAINT "periodization_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodization" ADD CONSTRAINT "periodization_annual_plan_id_fkey" FOREIGN KEY ("annual_plan_id") REFERENCES "annual_training_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_availability_id_fkey" FOREIGN KEY ("availability_id") REFERENCES "availability"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_templates" ADD CONSTRAINT "session_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "week_plan_templates" ADD CONSTRAINT "week_plan_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breaking_points" ADD CONSTRAINT "breaking_points_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breaking_points" ADD CONSTRAINT "breaking_points_calibration_id_fkey" FOREIGN KEY ("calibration_id") REFERENCES "club_speed_calibrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_log" ADD CONSTRAINT "progress_log_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_sessions" ADD CONSTRAINT "benchmark_sessions_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_comparisons" ADD CONSTRAINT "peer_comparisons_test_result_id_fkey" FOREIGN KEY ("test_result_id") REFERENCES "test_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_filters" ADD CONSTRAINT "saved_filters_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_speed_calibrations" ADD CONSTRAINT "club_speed_calibrations_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_speed_calibrations" ADD CONSTRAINT "club_speed_calibrations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annual_training_plans" ADD CONSTRAINT "annual_training_plans_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annual_training_plans" ADD CONSTRAINT "annual_training_plans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_training_assignments" ADD CONSTRAINT "daily_training_assignments_annual_plan_id_fkey" FOREIGN KEY ("annual_plan_id") REFERENCES "annual_training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_training_assignments" ADD CONSTRAINT "daily_training_assignments_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_training_assignments" ADD CONSTRAINT "daily_training_assignments_session_template_id_fkey" FOREIGN KEY ("session_template_id") REFERENCES "session_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_training_assignments" ADD CONSTRAINT "daily_training_assignments_completed_session_id_fkey" FOREIGN KEY ("completed_session_id") REFERENCES "training_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_tournaments" ADD CONSTRAINT "scheduled_tournaments_annual_plan_id_fkey" FOREIGN KEY ("annual_plan_id") REFERENCES "annual_training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_tournaments" ADD CONSTRAINT "scheduled_tournaments_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_tournaments" ADD CONSTRAINT "scheduled_tournaments_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "tournament_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;
