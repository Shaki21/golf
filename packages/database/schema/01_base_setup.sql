-- ============================================================================
-- AK GOLF ACADEMY - BOOKING & CALENDAR SYSTEM
-- DATABASE SETUP SCRIPT
-- ============================================================================
-- Version: 1.0.0
-- Database: PostgreSQL 14+
-- Created: 14. desember 2025
-- ============================================================================

-- ============================================================================
-- CLEANUP (OPTIONAL - KJØR KUN VED RESET)
-- ============================================================================
-- Uncomment these lines if you want to start fresh:
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS availability CASCADE;
-- DROP TABLE IF EXISTS periodization CASCADE;
-- DROP TABLE IF EXISTS training_sessions CASCADE;
-- DROP TABLE IF EXISTS test_results CASCADE;
-- DROP TABLE IF EXISTS tests CASCADE;
-- DROP TABLE IF EXISTS tournament_results CASCADE;
-- DROP TABLE IF EXISTS tournaments CASCADE;
-- DROP TABLE IF EXISTS event_participants CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS parents CASCADE;
-- DROP TABLE IF EXISTS players CASCADE;
-- DROP TABLE IF EXISTS coaches CASCADE;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABELL 1: COACHES (Trenere)
-- ============================================================================
CREATE TABLE coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),

    -- Spesialiseringer (JSON array)
    specializations JSONB DEFAULT '[]'::jsonb,
    -- Eksempel: ["teknikk", "shortgame", "putting", "mental", "fysisk"]

    -- Sertifiseringer
    certifications JSONB DEFAULT '[]'::jsonb,
    -- Eksempel: ["PGA Pro", "Team Norway Coach", "TPI Level 2"]

    -- Arbeidstider per dag
    working_hours JSONB DEFAULT '{}'::jsonb,
    -- Eksempel: {
    --   "monday": {"start": "08:00", "end": "18:00"},
    --   "tuesday": {"start": "09:00", "end": "17:00"}
    -- }

    max_players_per_session INTEGER DEFAULT 4,
    hourly_rate DECIMAL(8,2),

    role VARCHAR(50) CHECK (role IN ('head_coach', 'assistant_coach', 'specialist', 'guest')),
    color VARCHAR(7) DEFAULT '#1E4B33', -- Hex farge for kalender

    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vacation')),

    profile_image_url VARCHAR(500),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coaches_status ON coaches(status);
CREATE INDEX idx_coaches_email ON coaches(email);

-- ============================================================================
-- TABELL 2: PARENTS (Foreldre)
-- ============================================================================
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,

    -- Kommunikasjonspreferanser
    preferred_contact_method VARCHAR(20) DEFAULT 'email'
        CHECK (preferred_contact_method IN ('email', 'sms', 'phone', 'app')),

    notification_preferences JSONB DEFAULT '{
        "training_reminders": true,
        "tournament_updates": true,
        "test_results": true,
        "billing": true
    }'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parents_email ON parents(email);

-- ============================================================================
-- TABELL 3: PLAYERS (Spillere)
-- ============================================================================
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Personinfo
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),

    -- Golf-data
    category VARCHAR(2) NOT NULL CHECK (category IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K')),
    average_score DECIMAL(4,1),
    handicap DECIMAL(4,1),
    wagr_rank INTEGER,

    -- Klubb og tilknytning
    club VARCHAR(100),
    coach_id UUID REFERENCES coaches(id),
    parent_id UUID REFERENCES parents(id),

    -- Treningsstatus
    current_period VARCHAR(1) CHECK (current_period IN ('E', 'G', 'S', 'T')),
    -- E = Evaluering, G = Grunn, S = Spesial, T = Turnering

    weekly_training_hours DECIMAL(4,1) DEFAULT 0,
    season_start_date DATE,

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'injured', 'vacation')),

    -- Ekstra metadata
    profile_image_url VARCHAR(500),
    emergency_contact JSONB,
    medical_notes TEXT,
    equipment_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_players_category ON players(category);
CREATE INDEX idx_players_coach ON players(coach_id);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_players_avg_score ON players(average_score);

-- ============================================================================
-- TABELL 4: EVENTS (Hovedtabell for alle hendelser)
-- ============================================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Grunnleggende info
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Hendelsestype (kritisk for systemet)
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'tournament_result',      -- Resultat-turnering (topping + tapering)
        'tournament_development', -- Utviklingsturnering
        'tournament_training',    -- Treningsvturnering
        'individual_training',    -- Individuell trening 1-til-1
        'group_training',         -- Fellestrening/gruppeøkt
        'test_session',           -- Testdag/benchmark (hver 3. uke)
        'player_checkin',         -- Spiller check-in/oppfølging
        'parent_meeting',         -- Foreldremøte
        'team_meeting',           -- Teammøte
        'physical_training',      -- Fysisk trening
        'mental_training',        -- Mental trening
        'video_analysis',         -- Videoanalyse
        'equipment_fitting',      -- Utstyrsjustering
        'camp',                   -- Treningsleir
        'travel',                 -- Reise
        'other'                   -- Andre hendelser
    )),

    -- Tid
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(50) DEFAULT 'Europe/Oslo',

    -- Lokasjon
    location VARCHAR(255),
    location_details JSONB,
    -- Eksempel: {
    --   "address": "Vollsveien 10, 1366 Lysaker",
    --   "gps": {"lat": 59.9139, "lng": 10.6427},
    --   "course_name": "GFGK",
    --   "facility": "Range A"
    -- }

    -- Trener
    coach_id UUID REFERENCES coaches(id),

    -- Kapasitet
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,

    -- Status og prioritet
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN (
        'draft', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'postponed'
    )),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

    -- Gjentakelse
    recurrence_rule JSONB,
    -- Eksempel: {
    --   "frequency": "weekly",
    --   "interval": 1,
    --   "days_of_week": [1, 3], // Mandag og onsdag
    --   "end_date": "2026-09-30"
    -- }
    parent_event_id UUID REFERENCES events(id), -- For gjentakende hendelser

    -- Visuelle innstillinger
    color VARCHAR(7),

    -- Varsler
    notifications JSONB DEFAULT '{
        "reminder_24h": true,
        "reminder_1h": true,
        "on_change": true
    }'::jsonb,

    -- Ekstra metadata (varierer basert på event_type)
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Audit
    created_by UUID REFERENCES coaches(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_start ON events(start_time);
CREATE INDEX idx_events_end ON events(end_time);
CREATE INDEX idx_events_coach ON events(coach_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date_range ON events(start_time, end_time);

-- ============================================================================
-- TABELL 5: EVENT_PARTICIPANTS (Hendelse-deltakere)
-- ============================================================================
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id),

    -- Deltakerstatus
    status VARCHAR(20) DEFAULT 'invited' CHECK (status IN (
        'invited', 'confirmed', 'declined', 'waitlist', 'attended', 'no_show', 'cancelled'
    )),

    -- Check-in
    checkin_time TIMESTAMPTZ,
    checkout_time TIMESTAMPTZ,

    -- Notater og ytelse
    notes TEXT,
    performance JSONB,
    -- Eksempel for trening: {
    --   "focus_achieved": true,
    --   "coach_notes": "God fremgang på wedge-presisjon",
    --   "next_focus": "Arbeide med bunker-slag"
    -- }

    -- Betalingsstatus (for individuelle timer)
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'waived')),

    invitation_sent_at TIMESTAMPTZ,
    response_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(event_id, player_id)
);

CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_player ON event_participants(player_id);
CREATE INDEX idx_event_participants_status ON event_participants(status);

-- ============================================================================
-- TABELL 6: TOURNAMENTS (Utvidet turneringsinfo)
-- ============================================================================
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

    -- Turneringsinfo
    name VARCHAR(255) NOT NULL,
    tournament_type VARCHAR(20) NOT NULL CHECK (tournament_type IN ('result', 'development', 'training')),
    level VARCHAR(20) CHECK (level IN ('club', 'regional', 'national', 'international')),

    -- Arrangør og lokasjon
    organizer VARCHAR(255),
    course VARCHAR(255),
    course_par INTEGER DEFAULT 72,
    course_rating DECIMAL(4,1),
    slope_rating INTEGER,

    -- Format
    rounds INTEGER DEFAULT 1,
    format VARCHAR(100), -- 'Slagspill', 'Matchplay', 'Stableford', etc.

    -- Påmelding
    entry_deadline DATE,
    entry_fee DECIMAL(8,2),
    external_url VARCHAR(500), -- Link til golf.no eller arrangørside

    -- Tee-time
    tee_time TIME,

    -- Forberedelse (basert på turneringstype)
    topping_weeks INTEGER DEFAULT 2, -- Antall uker med topping før turnering
    tapering_days INTEGER DEFAULT 3, -- Dager med nedtrapping før start

    -- Fokusområder for turneringen
    focus_areas JSONB,
    -- Eksempel: ["course_management", "mental_focus", "scoring_zones"]

    -- Eksterne referanser
    golf_no_id VARCHAR(50),
    wagr_event BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tournaments_event ON tournaments(event_id);
CREATE INDEX idx_tournaments_type ON tournaments(tournament_type);
CREATE INDEX idx_tournaments_level ON tournaments(level);

-- ============================================================================
-- TABELL 7: TOURNAMENT_RESULTS (Turneringsresultater)
-- ============================================================================
CREATE TABLE tournament_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id),

    -- Resultat
    position INTEGER,
    total_score INTEGER,
    score_to_par INTEGER,
    round_scores JSONB, -- [72, 74, 71]

    -- Statistikk
    strokes_gained JSONB,
    -- {
    --   "total": 2.5,
    --   "off_tee": 0.8,
    --   "approach": 1.2,
    --   "around_green": 0.3,
    --   "putting": 0.2
    -- }

    fairways_hit DECIMAL(5,2), -- Prosent
    greens_in_regulation DECIMAL(5,2), -- Prosent
    putts_per_round DECIMAL(4,1),

    -- Notater
    notes TEXT,
    coach_analysis TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tournament_id, player_id)
);

CREATE INDEX idx_tournament_results_tournament ON tournament_results(tournament_id);
CREATE INDEX idx_tournament_results_player ON tournament_results(player_id);

-- ============================================================================
-- TABELL 8: TESTS (Benchmark-tester hver 3. uke)
-- ============================================================================
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

    -- Testtype
    test_type VARCHAR(50) NOT NULL CHECK (test_type IN (
        -- Golfslag-tester (fra Team Norway protokoll)
        'inspill_basic',
        'inspill_advanced',
        'wedge_basic',
        'wedge_advanced',
        'lob_basic',
        'bunker_basic',
        'chip_basic',
        'putt_basic',
        'utslag_basic',
        '8_balls_variation',
        'course_test',

        -- Fysiske tester
        'bench_press',
        'trap_bar_deadlift',
        'rotation_throw_4kg',
        'standing_long_jump',
        '3000m_run',
        'mobility_screen',
        'speed_test',
        'flexibility_test',

        -- Mentale evalueringer
        'mental_assessment',
        'competition_readiness',
        'focus_test'
    )),

    -- Protokoll
    protocol_name VARCHAR(100), -- 'Team Norway Inspill Basic'
    protocol_version VARCHAR(20),

    -- Målgruppe
    target_category VARCHAR(2) CHECK (target_category IN ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K')),

    -- Benchmark-uke
    benchmark_week INTEGER, -- Uke i sesongen (1-52)

    -- Testspesifikke detaljer
    test_details JSONB,
    -- Eksempel for inspill_basic: {
    --   "distances_men": [145, 160],
    --   "distances_women": [125, 145],
    --   "shots_per_distance": 5,
    --   "target_pei": {"A": 0.04, "B": 0.05, "C": 0.06}
    -- }

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tests_event ON tests(event_id);
CREATE INDEX idx_tests_type ON tests(test_type);
CREATE INDEX idx_tests_week ON tests(benchmark_week);

-- ============================================================================
-- TABELL 9: TEST_RESULTS (Testresultater)
-- ============================================================================
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id),

    -- Resultater (strukturert basert på testtype)
    results JSONB NOT NULL,
    -- Eksempel for inspill_basic: {
    --   "shots": [
    --     {"carry": 142, "side": 3, "target": 145, "pei": 0.048},
    --     {"carry": 147, "side": -2, "target": 145, "pei": 0.055}
    --   ],
    --   "average_pei": 0.052
    -- }

    -- Beregnede verdier
    pei_score DECIMAL(5,4), -- Performance Efficiency Index
    category_benchmark BOOLEAN, -- Oppfyller kategorikrav?
    improvement_from_last DECIMAL(5,2), -- Prosent forbedring

    -- Notater
    coach_notes TEXT,
    player_feedback TEXT,

    -- Vedlegg
    video_url VARCHAR(500),
    tracker_data JSONB, -- TrackMan/Trackman rådata

    tested_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(test_id, player_id)
);

CREATE INDEX idx_test_results_test ON test_results(test_id);
CREATE INDEX idx_test_results_player ON test_results(player_id);
CREATE INDEX idx_test_results_pei ON test_results(pei_score);

-- ============================================================================
-- TABELL 10: TRAINING_SESSIONS (Detaljert øktsinfo)
-- ============================================================================
CREATE TABLE training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

    -- Økttype
    session_type VARCHAR(30) CHECK (session_type IN (
        'technique', 'shortgame', 'putting', 'driving',
        'course_play', 'physical', 'mental', 'video', 'simulator'
    )),

    -- AK Golf Øktformel-parametere
    learning_phase VARCHAR(2) CHECK (learning_phase IN ('L1', 'L2', 'L3', 'L4', 'L5')),
    club_speed INTEGER CHECK (club_speed BETWEEN 20 AND 100), -- CS20-CS100
    setting VARCHAR(3) CHECK (setting IN ('S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10')),
    surface VARCHAR(20) CHECK (surface IN ('mat', 'grass', 'bunker', 'green', 'fairway', 'rough', 'simulator')),

    -- Fokus
    focus_area VARCHAR(255),

    -- Øvelser (referanse til øvelsesbank)
    drill_ids JSONB, -- Array av øvelses-IDer

    -- Periodekontekst
    period_context VARCHAR(1) CHECK (period_context IN ('E', 'G', 'S', 'T')),

    -- Intensitet
    intensity VARCHAR(20) CHECK (intensity IN ('low', 'medium', 'high', 'competition')),

    -- Varighet
    planned_duration INTEGER, -- Minutter
    actual_duration INTEGER,

    -- Mål og utstyr
    objectives JSONB,
    -- ["Forbedre anslagsvinkel", "Øke presisjon på 100m"]

    equipment JSONB,
    -- ["7-jern", "52° wedge", "Putter", "Alignment sticks"]

    -- Notater
    pre_session_notes TEXT,
    post_session_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_training_sessions_event ON training_sessions(event_id);
CREATE INDEX idx_training_sessions_type ON training_sessions(session_type);
CREATE INDEX idx_training_sessions_phase ON training_sessions(learning_phase);

-- ============================================================================
-- TABELL 11: PERIODIZATION (Periodisering per spiller)
-- ============================================================================
CREATE TABLE periodization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id),

    -- Sesong og uke
    season_year INTEGER NOT NULL, -- F.eks. 2026
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 52),

    -- Periode
    period VARCHAR(1) NOT NULL CHECK (period IN ('E', 'G', 'S', 'T')),

    -- Prioriteringer (0-3 skala)
    competition_priority INTEGER CHECK (competition_priority BETWEEN 0 AND 3),
    play_priority INTEGER CHECK (play_priority BETWEEN 0 AND 3),
    golf_shot_priority INTEGER CHECK (golf_shot_priority BETWEEN 0 AND 3),
    technique_priority INTEGER CHECK (technique_priority BETWEEN 0 AND 3),
    physical_priority INTEGER CHECK (physical_priority BETWEEN 0 AND 3),

    -- L-fase og CS-nivå for uken
    learning_phase_range VARCHAR(10), -- 'L3-L5'
    club_speed_range VARCHAR(10), -- '80-100'

    -- Timer
    planned_hours DECIMAL(4,1),
    actual_hours DECIMAL(4,1),

    -- Notater
    week_focus TEXT,
    week_goals JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(player_id, season_year, week_number)
);

CREATE INDEX idx_periodization_player ON periodization(player_id);
CREATE INDEX idx_periodization_season_week ON periodization(season_year, week_number);
CREATE INDEX idx_periodization_period ON periodization(period);

-- ============================================================================
-- TABELL 12: AVAILABILITY (Trener-tilgjengelighet)
-- ============================================================================
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES coaches(id),

    -- Dag og tid
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = søndag
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Booking-innstillinger
    slot_duration INTEGER DEFAULT 60, -- Minutter per slot
    max_bookings INTEGER DEFAULT 1, -- Samtidige bookinger

    -- Lokasjon
    location VARCHAR(255),

    -- Tillatte økttyper
    session_types JSONB,
    -- ["individual_training", "group_training", "video_analysis"]

    -- Gyldighetsperiode
    valid_from DATE NOT NULL,
    valid_to DATE,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_availability_coach ON availability(coach_id);
CREATE INDEX idx_availability_day ON availability(day_of_week);
CREATE INDEX idx_availability_active ON availability(is_active);

-- ============================================================================
-- TABELL 13: NOTIFICATIONS (Varsler)
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Mottaker
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('player', 'coach', 'parent')),
    recipient_id UUID NOT NULL,

    -- Tilknyttet hendelse
    event_id UUID REFERENCES events(id),

    -- Varseltype
    type VARCHAR(30) NOT NULL CHECK (type IN (
        'reminder', 'change', 'cancellation', 'new_booking',
        'result', 'test_due', 'message', 'payment', 'checkin'
    )),

    -- Innhold
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Kanal
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('app', 'email', 'sms', 'push')),

    -- Timing
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),

    -- Metadata
    metadata JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id);
CREATE INDEX idx_notifications_event ON notifications(event_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Funksjon for å oppdatere updated_at automatisk
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for coaches
CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON coaches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for players
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for events
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for event_participants
CREATE TRIGGER update_event_participants_updated_at BEFORE UPDATE ON event_participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for periodization
CREATE TRIGGER update_periodization_updated_at BEFORE UPDATE ON periodization
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funksjon for å oppdatere current_participants automatisk
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE events
        SET current_participants = (
            SELECT COUNT(*)
            FROM event_participants
            WHERE event_id = NEW.event_id
            AND status IN ('confirmed', 'attended')
        )
        WHERE id = NEW.event_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        UPDATE events
        SET current_participants = (
            SELECT COUNT(*)
            FROM event_participants
            WHERE event_id = OLD.event_id
            AND status IN ('confirmed', 'attended')
        )
        WHERE id = OLD.event_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for å oppdatere participant count
CREATE TRIGGER update_participant_count_on_change
    AFTER INSERT OR UPDATE OR DELETE ON event_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_event_participant_count();

-- ============================================================================
-- VIEWS (Nyttige forhåndsdefinerte queries)
-- ============================================================================

-- View: Upcoming events med deltakere
CREATE OR REPLACE VIEW upcoming_events_with_participants AS
SELECT
    e.*,
    c.first_name || ' ' || c.last_name as coach_name,
    c.color as coach_color,
    COUNT(ep.id) as participant_count,
    json_agg(
        json_build_object(
            'player_id', p.id,
            'player_name', p.first_name || ' ' || p.last_name,
            'category', p.category,
            'status', ep.status
        )
    ) FILTER (WHERE p.id IS NOT NULL) as participants
FROM events e
LEFT JOIN coaches c ON e.coach_id = c.id
LEFT JOIN event_participants ep ON e.id = ep.event_id
LEFT JOIN players p ON ep.player_id = p.id
WHERE e.start_time >= NOW()
GROUP BY e.id, c.first_name, c.last_name, c.color
ORDER BY e.start_time;

-- View: Player training summary
CREATE OR REPLACE VIEW player_training_summary AS
SELECT
    p.id as player_id,
    p.first_name || ' ' || p.last_name as player_name,
    p.category,
    COUNT(ep.id) FILTER (WHERE e.event_type = 'individual_training') as individual_sessions,
    COUNT(ep.id) FILTER (WHERE e.event_type = 'group_training') as group_sessions,
    COUNT(ep.id) FILTER (WHERE e.event_type LIKE 'tournament%') as tournaments,
    COUNT(ep.id) FILTER (WHERE ep.status = 'attended') as attended_count,
    COUNT(ep.id) FILTER (WHERE ep.status = 'no_show') as no_show_count,
    MAX(e.start_time) FILTER (WHERE ep.status = 'attended') as last_attended
FROM players p
LEFT JOIN event_participants ep ON p.id = ep.player_id
LEFT JOIN events e ON ep.event_id = e.id
GROUP BY p.id, p.first_name, p.last_name, p.category;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'AK GOLF ACADEMY - DATABASE SETUP COMPLETE!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Tables created: 13';
    RAISE NOTICE 'Indexes created: 23';
    RAISE NOTICE 'Triggers created: 6';
    RAISE NOTICE 'Views created: 2';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run RLS policies (see BACKEND_SETUP_GUIDE.md TRINN 3)';
    RAISE NOTICE '2. Insert seed data (see BACKEND_SETUP_GUIDE.md TRINN 4)';
    RAISE NOTICE '3. Configure environment variables';
    RAISE NOTICE '============================================================================';
END $$;
