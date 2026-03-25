-- ============================================================================
-- AK GOLF ACADEMY - IUP SYSTEM EXTENSION
-- DATABASE SCHEMA EXTENSION
-- ============================================================================
-- Version: 1.0.0
-- Database: PostgreSQL 14+
-- Created: 14. desember 2025
-- Purpose: Extends base database with IUP-specific tables
-- ============================================================================
-- Run this AFTER database_setup.sql
-- ============================================================================

-- ============================================================================
-- TABELL 14: EXERCISES (Øvelsesbank - 300+ øvelser)
-- ============================================================================
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Grunnleggende info
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    purpose TEXT,

    -- Kategorisering
    exercise_type VARCHAR(50) NOT NULL CHECK (exercise_type IN (
        'technique_driver', 'technique_iron', 'technique_wedge',
        'shortgame_chipping', 'shortgame_pitching', 'shortgame_bunker',
        'putting_lag', 'putting_reading', 'putting_routine',
        'physical_strength', 'physical_mobility', 'physical_explosiveness', 'physical_endurance',
        'mental_focus', 'mental_routine', 'mental_visualization', 'mental_pressure',
        'strategic_club_selection', 'strategic_course_management'
    )),

    -- AK Golf parametere
    learning_phases VARCHAR(20)[], -- Array: ['L2', 'L3', 'L4']
    settings VARCHAR(10)[], -- Array: ['S1', 'S2', 'S3']
    club_speed_levels VARCHAR(10)[], -- Array: ['CS50', 'CS60', 'CS70']

    -- Egnethet
    categories VARCHAR(2)[] NOT NULL, -- Array: ['D', 'E', 'F']
    periods VARCHAR(1)[] NOT NULL, -- Array: ['G', 'S']

    -- Detaljer
    reps_or_time VARCHAR(100), -- '3x10 reps' eller '15 min'
    equipment JSONB, -- ["Klubber", "Baller", "Alignment sticks"]
    location VARCHAR(50) CHECK (location IN (
        'range', 'putting_green', 'shortgame_area', 'course', 'gym', 'indoor', 'home'
    )),

    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard', 'advanced')),

    -- Progresjon
    progression_steps TEXT,
    regression_steps TEXT,
    success_criteria TEXT,
    common_mistakes TEXT,
    coaching_cues TEXT,

    -- Bruddpunkt-fokus
    addresses_breaking_points VARCHAR(50)[], -- Array av bruddpunkt-typer

    -- Prosess (5-prosess pyramide)
    process_category VARCHAR(20) NOT NULL CHECK (process_category IN (
        'technical', 'physical', 'mental', 'strategic', 'social'
    )),

    -- Media
    video_url VARCHAR(500),
    image_url VARCHAR(500),

    -- Metadata
    source VARCHAR(255), -- 'Team Norway', 'AK Golf', etc.
    variants TEXT,
    player_feedback TEXT,

    tags VARCHAR(50)[], -- ['favoritt', 'high_effectiveness', 'low_equipment']

    usage_count INTEGER DEFAULT 0,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exercises_type ON exercises(exercise_type);
CREATE INDEX idx_exercises_categories ON exercises USING GIN (categories);
CREATE INDEX idx_exercises_periods ON exercises USING GIN (periods);
CREATE INDEX idx_exercises_learning_phases ON exercises USING GIN (learning_phases);
CREATE INDEX idx_exercises_active ON exercises(is_active);

-- ============================================================================
-- TABELL 15: SESSION_TEMPLATES (Treningsøkt-templates - 150 økter)
-- ============================================================================
CREATE TABLE session_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Grunnleggende info
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Kategorisering
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN (
        'technique_full_swing', 'technique_short_game',
        'putting_lag', 'putting_reading',
        'physical_strength', 'physical_mobility', 'physical_explosiveness',
        'mental_routines', 'mental_pressure',
        'play_range', 'play_course',
        'competition_tournament', 'test_benchmark', 'hybrid'
    )),

    -- Egnethet
    categories VARCHAR(2)[] NOT NULL,
    periods VARCHAR(1)[] NOT NULL,

    -- AK Golf formel
    learning_phase VARCHAR(2) CHECK (learning_phase IN ('L1', 'L2', 'L3', 'L4', 'L5')),
    setting VARCHAR(3) CHECK (setting IN ('S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10')),
    club_speed VARCHAR(5) CHECK (club_speed IN ('CS20', 'CS30', 'CS40', 'CS50', 'CS60', 'CS70', 'CS80', 'CS90', 'CS100')),

    -- Detaljer
    duration INTEGER NOT NULL, -- minutter
    main_focus VARCHAR(50)[] NOT NULL, -- ['Teknisk', 'Fysisk']
    sub_focus VARCHAR(50)[], -- ['Driver', 'Putting lag']

    location VARCHAR(50),
    intensity VARCHAR(20) CHECK (intensity IN ('low', 'moderate', 'high', 'max')),

    -- Øvelser som inngår
    exercise_ids UUID[], -- Array av exercise IDs
    exercise_sequence JSONB, -- Detaljert sekvens med timing
    -- {
    --   "warmup": [{"exercise_id": "uuid", "duration": 10}],
    --   "main": [{"exercise_id": "uuid", "duration": 30}],
    --   "cooldown": [{"exercise_id": "uuid", "duration": 5}]
    -- }

    -- Mål og struktur
    objectives TEXT[],
    structure TEXT, -- 'Warmup → Drill 1 → Drill 2 → Cooldown'
    success_criteria TEXT,

    equipment JSONB,

    -- Notater
    notes TEXT,
    variations TEXT,

    video_url VARCHAR(500),

    usage_count INTEGER DEFAULT 0,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_session_templates_type ON session_templates(session_type);
CREATE INDEX idx_session_templates_categories ON session_templates USING GIN (categories);
CREATE INDEX idx_session_templates_periods ON session_templates USING GIN (periods);
CREATE INDEX idx_session_templates_phase ON session_templates(learning_phase);

-- ============================================================================
-- TABELL 16: WEEK_PLAN_TEMPLATES (Ukeplan-templates - 88 templates)
-- ============================================================================
CREATE TABLE week_plan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identifikasjon
    name VARCHAR(255) NOT NULL, -- 'Cat D - Grunnperiode - Standard'

    -- Kategorisering
    category VARCHAR(2) NOT NULL CHECK (category IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K')),
    period VARCHAR(1) NOT NULL CHECK (period IN ('E', 'G', 'S', 'T')),
    variant VARCHAR(20) NOT NULL CHECK (variant IN ('standard', 'intensive', 'light')),

    -- Ukentlig struktur
    total_hours DECIMAL(4,1) NOT NULL,

    -- Sessions per dag (UUID array)
    monday_sessions UUID[], -- Array av session_template IDs
    tuesday_sessions UUID[],
    wednesday_sessions UUID[],
    thursday_sessions UUID[],
    friday_sessions UUID[],
    saturday_sessions UUID[],
    sunday_sessions UUID[],

    rest_day VARCHAR(10) CHECK (rest_day IN (
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'none'
    )),

    -- Distribusjon
    distribution JSONB, -- {"technique": 40, "physical": 30, "shortgame": 20, "mental": 10}

    main_focus VARCHAR(50)[] NOT NULL,

    -- Parametere
    learning_phase_focus VARCHAR(2),
    setting_range VARCHAR(10), -- 'S1-S3', 'S4-S6', 'S7-S10'
    intensity VARCHAR(1) CHECK (intensity IN ('E', 'G', 'S', 'T')),

    -- Mål
    week_goal TEXT,

    -- Tilpasning
    suitable_for_weeks VARCHAR(100), -- 'Weeks 47-52, 1-6'
    prerequisites TEXT,
    customization_notes TEXT,

    -- Bruk
    usage_count INTEGER DEFAULT 0,
    coach_rating VARCHAR(20) CHECK (coach_rating IN ('excellent', 'good', 'ok', 'needs_improvement')),

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(category, period, variant)
);

CREATE INDEX idx_week_templates_category ON week_plan_templates(category);
CREATE INDEX idx_week_templates_period ON week_plan_templates(period);
CREATE INDEX idx_week_templates_variant ON week_plan_templates(variant);

-- ============================================================================
-- TABELL 17: BREAKING_POINTS (Bruddpunkter)
-- ============================================================================
CREATE TABLE breaking_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

    -- Identifikasjon
    name VARCHAR(255) NOT NULL, -- 'Putting under press - 2m range'

    -- Kategorisering
    process_category VARCHAR(20) NOT NULL CHECK (process_category IN (
        'technical', 'physical', 'mental', 'strategic', 'social'
    )),

    specific_area VARCHAR(50) NOT NULL CHECK (specific_area IN (
        'driver_distance', 'driver_consistency', 'iron_accuracy', 'wedge_pei',
        'putting_pressure', 'putting_reading', 'bunker', 'shortgame_general',
        'physical_strength', 'physical_mobility', 'mental_strength', 'routines',
        'strategic_understanding', 'endurance', 'clubspeed', 'other'
    )),

    -- Alvorlighet
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    prevents_category_upgrade BOOLEAN DEFAULT FALSE,

    -- Målinger
    baseline_measurement VARCHAR(255), -- 'PEI: 0.09, Need: <0.07'
    target_measurement VARCHAR(255),
    current_measurement VARCHAR(255),
    progress_percent INTEGER CHECK (progress_percent BETWEEN 0 AND 100),

    -- Identifisering
    identified_date DATE NOT NULL DEFAULT CURRENT_DATE,
    identified_via VARCHAR(50) CHECK (identified_via IN (
        'benchmark_testing', 'tournament_observation', 'training_session',
        'coach_assessment', 'player_self_report', 'video_analysis'
    )),

    -- Treningsplan
    training_plan TEXT,
    assigned_exercise_ids UUID[], -- Array av exercise IDs
    hours_per_week DECIMAL(3,1),

    -- Status og fremdrift
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN (
        'not_started', 'in_progress_early', 'in_progress_progress',
        'near_resolution', 'resolved', 'setback'
    )),

    next_evaluation DATE,
    expected_resolution_date DATE,
    actual_resolution_date DATE,

    -- Notater
    coach_notes TEXT,
    player_feedback TEXT,
    success_history TEXT, -- Timeline av fremgang

    -- Relaterte tester
    related_test_ids UUID[], -- Array av test IDs som måler dette

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_breaking_points_player ON breaking_points(player_id);
CREATE INDEX idx_breaking_points_status ON breaking_points(status);
CREATE INDEX idx_breaking_points_severity ON breaking_points(severity);
CREATE INDEX idx_breaking_points_area ON breaking_points(specific_area);

-- ============================================================================
-- TABELL 18: PROGRESS_LOG (Daglig treningslogg)
-- ============================================================================
CREATE TABLE progress_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    date DATE NOT NULL,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

    -- Planlagt økt
    planned_session_id UUID, -- Kan være NULL hvis fri økt
    session_type VARCHAR(50),

    -- Gjennomføring
    completed BOOLEAN DEFAULT FALSE,
    not_completed_reason VARCHAR(50) CHECK (not_completed_reason IN (
        'sick', 'injured', 'weather', 'school_exam', 'other_event',
        'burnout_fatigue', 'facility_unavailable', 'other'
    )),

    -- Varighet
    planned_duration INTEGER, -- minutter
    actual_duration INTEGER,

    -- Intensitet
    planned_intensity VARCHAR(20),
    actual_intensity VARCHAR(20),

    -- Kvalitet
    quality INTEGER CHECK (quality BETWEEN 1 AND 5),
    focus INTEGER CHECK (focus BETWEEN 1 AND 5),
    energy_before INTEGER CHECK (energy_before BETWEEN 1 AND 5),
    energy_after INTEGER CHECK (energy_after BETWEEN 1 AND 5),

    -- Refleksjon
    what_worked_well TEXT,
    challenges TEXT,
    key_learning TEXT,
    next_focus TEXT,

    player_notes TEXT,
    coach_feedback TEXT,

    -- Måloppnåelse
    goal_achievement VARCHAR(20) CHECK (goal_achievement IN (
        'exceeded', 'achieved', 'partial', 'not_achieved', 'not_relevant'
    )),

    specific_results TEXT, -- 'Made 8/10 putts from 3m'

    -- Bruddpunkt-arbeid
    breaking_point_ids UUID[], -- Hvilke bruddpunkt ble addressert

    -- Øvelser utført
    exercise_ids UUID[],

    -- Detaljer
    location VARCHAR(50),
    weather VARCHAR(20) CHECK (weather IN ('perfect', 'good', 'ok', 'challenging', 'poor')),

    coach_present BOOLEAN DEFAULT FALSE,
    coach_id UUID REFERENCES coaches(id),

    injuries_issues TEXT,

    equipment_used JSONB,

    video_url VARCHAR(500),

    tags VARCHAR(50)[], -- ['breakthrough', 'frustration', 'fun']

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(player_id, date, planned_session_id)
);

CREATE INDEX idx_progress_log_player ON progress_log(player_id);
CREATE INDEX idx_progress_log_date ON progress_log(date);
CREATE INDEX idx_progress_log_completed ON progress_log(completed);
CREATE INDEX idx_progress_log_quality ON progress_log(quality);

-- ============================================================================
-- TABELL 19: REFERENCES (Referansebibliotek)
-- ============================================================================
CREATE TABLE references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Grunnleggende info
    title VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'article', 'video', 'pdf', 'book', 'research_paper',
        'podcast', 'website', 'course', 'webinar', 'internal_doc'
    )),

    -- Kategorisering
    categories VARCHAR(50)[] NOT NULL, -- ['Teknisk', 'Fysisk', 'Mental']
    topics VARCHAR(50)[], -- ['Swing mekanikk', 'Putting', 'Speed training']

    -- Innhold
    url VARCHAR(1000),
    author VARCHAR(255),
    source VARCHAR(255), -- Publication/website/publisher
    published_date DATE,

    summary TEXT,
    key_points TEXT,
    relevance_to_iup TEXT,

    -- Tilknytning
    used_in_session_template_ids UUID[],
    used_in_exercise_ids UUID[],

    player_categories VARCHAR(2)[], -- Hvilke kategorier er dette relevant for

    -- Kvalitet
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    evidence_level VARCHAR(50) CHECK (evidence_level IN (
        'peer_reviewed_research', 'expert_opinion', 'practical_experience',
        'anecdotal', 'theoretical'
    )),

    keywords VARCHAR(100)[],

    language VARCHAR(20) DEFAULT 'norwegian',

    accessibility VARCHAR(20) CHECK (accessibility IN ('free', 'paid', 'subscription', 'restricted', 'internal')),
    cost DECIMAL(8,2),

    recommended_for_players BOOLEAN DEFAULT FALSE,
    recommended_for_parents BOOLEAN DEFAULT FALSE,

    quotes TEXT,
    implemented BOOLEAN DEFAULT FALSE,
    implementation_notes TEXT,

    added_by UUID REFERENCES coaches(id),

    usage_count INTEGER DEFAULT 0,

    tags VARCHAR(50)[],

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_references_type ON references(type);
CREATE INDEX idx_references_categories ON references USING GIN (categories);
CREATE INDEX idx_references_quality ON references(quality_rating);
CREATE INDEX idx_references_keywords ON references USING GIN (keywords);

-- ============================================================================
-- TABELL 20: BENCHMARK_SESSIONS (Benchmark-økter hver 3. uke)
-- ============================================================================
CREATE TABLE benchmark_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

    -- Tidspunkt
    week_number INTEGER NOT NULL CHECK (week_number IN (3,6,9,12,15,18,21,24,27,30,33,36,39,42)),
    date DATE NOT NULL,
    period VARCHAR(1) CHECK (period IN ('E', 'G', 'S', 'T')),

    -- Kategori ved benchmark
    category_at_test VARCHAR(2) CHECK (category_at_test IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K')),

    -- Tester gjennomført
    test_result_ids UUID[], -- Array av test_result IDs
    tests_completed INTEGER,
    tests_passed INTEGER,
    pass_rate DECIMAL(5,2), -- Prosent

    -- Oppsummering
    summary TEXT,
    strengths TEXT,
    weaknesses TEXT,

    -- Bruddpunkter
    new_breaking_points VARCHAR(50)[],
    resolved_breaking_points VARCHAR(50)[],

    -- Justeringer
    training_plan_adjustments TEXT,
    focus_areas_next_3_weeks VARCHAR(50)[],

    -- Kategori-progresjon
    progression_status VARCHAR(50) CHECK (progression_status IN (
        'ready_for_upgrade', 'on_track', 'plateau_needs_adjustment',
        'concerning_trend', 'stable_in_category'
    )),

    upgrade_recommendation BOOLEAN DEFAULT FALSE,
    upgrade_notes TEXT,

    -- Coach
    coach_id UUID NOT NULL REFERENCES coaches(id),
    coach_signature VARCHAR(255),

    player_feedback TEXT,

    -- Rapport
    report_generated BOOLEAN DEFAULT FALSE,
    report_url VARCHAR(500),

    -- Neste benchmark
    next_benchmark_date DATE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(player_id, week_number, date)
);

CREATE INDEX idx_benchmark_sessions_player ON benchmark_sessions(player_id);
CREATE INDEX idx_benchmark_sessions_week ON benchmark_sessions(week_number);
CREATE INDEX idx_benchmark_sessions_date ON benchmark_sessions(date);
CREATE INDEX idx_benchmark_sessions_status ON benchmark_sessions(progression_status);

-- ============================================================================
-- EXTENDED VIEWS
-- ============================================================================

-- View: Player complete profile with IUP data
CREATE OR REPLACE VIEW player_iup_profile AS
SELECT
    p.*,
    c.first_name || ' ' || c.last_name as coach_name,
    COUNT(DISTINCT bp.id) FILTER (WHERE bp.status IN ('active', 'in_progress_early', 'in_progress_progress')) as active_breaking_points,
    COUNT(DISTINCT pl.id) FILTER (WHERE pl.date >= CURRENT_DATE - INTERVAL '30 days' AND pl.completed = true) as sessions_last_30_days,
    AVG(pl.quality) FILTER (WHERE pl.date >= CURRENT_DATE - INTERVAL '30 days') as avg_quality_last_30_days,
    MAX(bs.date) as last_benchmark_date,
    (SELECT week_number FROM benchmark_sessions WHERE player_id = p.id AND week_number > EXTRACT(WEEK FROM CURRENT_DATE) ORDER BY week_number LIMIT 1) as next_benchmark_week
FROM players p
LEFT JOIN coaches c ON p.coach_id = c.id
LEFT JOIN breaking_points bp ON p.id = bp.player_id
LEFT JOIN progress_log pl ON p.id = pl.player_id
LEFT JOIN benchmark_sessions bs ON p.id = bs.player_id
GROUP BY p.id, c.first_name, c.last_name;

-- View: Weekly training summary per player
CREATE OR REPLACE VIEW weekly_training_summary AS
SELECT
    p.id as player_id,
    p.first_name || ' ' || p.last_name as player_name,
    EXTRACT(WEEK FROM pl.date) as week_number,
    EXTRACT(YEAR FROM pl.date) as year,
    COUNT(*) as total_sessions,
    COUNT(*) FILTER (WHERE pl.completed = true) as completed_sessions,
    ROUND(COUNT(*) FILTER (WHERE pl.completed = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1) as completion_rate,
    SUM(pl.actual_duration) FILTER (WHERE pl.completed = true) / 60.0 as total_hours,
    AVG(pl.quality) FILTER (WHERE pl.completed = true) as avg_quality,
    AVG(pl.focus) FILTER (WHERE pl.completed = true) as avg_focus
FROM players p
LEFT JOIN progress_log pl ON p.id = pl.player_id
WHERE pl.date IS NOT NULL
GROUP BY p.id, p.first_name, p.last_name, EXTRACT(WEEK FROM pl.date), EXTRACT(YEAR FROM pl.date);

-- ============================================================================
-- ADDITIONAL TRIGGERS
-- ============================================================================

-- Trigger for exercises
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for session_templates
CREATE TRIGGER update_session_templates_updated_at BEFORE UPDATE ON session_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for week_plan_templates
CREATE TRIGGER update_week_plan_templates_updated_at BEFORE UPDATE ON week_plan_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for breaking_points
CREATE TRIGGER update_breaking_points_updated_at BEFORE UPDATE ON breaking_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for progress_log
CREATE TRIGGER update_progress_log_updated_at BEFORE UPDATE ON progress_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for references
CREATE TRIGGER update_references_updated_at BEFORE UPDATE ON references
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for benchmark_sessions
CREATE TRIGGER update_benchmark_sessions_updated_at BEFORE UPDATE ON benchmark_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'AK GOLF ACADEMY - IUP SYSTEM EXTENSION COMPLETE!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Additional tables created: 7';
    RAISE NOTICE 'Total tables: 20 (13 base + 7 IUP)';
    RAISE NOTICE 'Additional indexes created: 25';
    RAISE NOTICE 'Additional triggers created: 7';
    RAISE NOTICE 'Additional views created: 2';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'IUP-specific tables:';
    RAISE NOTICE '  - exercises (300+ øvelser)';
    RAISE NOTICE '  - session_templates (150 økter)';
    RAISE NOTICE '  - week_plan_templates (88 templates)';
    RAISE NOTICE '  - breaking_points (Bruddpunkt-system)';
    RAISE NOTICE '  - progress_log (Daglig logg)';
    RAISE NOTICE '  - references (Referansebibliotek)';
    RAISE NOTICE '  - benchmark_sessions (Hver 3. uke)';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run seed data scripts';
    RAISE NOTICE '2. Set up backend API';
    RAISE NOTICE '3. Configure RLS policies';
    RAISE NOTICE '============================================================================';
END $$;
