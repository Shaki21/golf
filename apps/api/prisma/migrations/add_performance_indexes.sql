-- Performance Optimization Index Migration
-- Created: December 23, 2024
-- Purpose: Add missing indexes identified in performance analysis

-- ============================================================================
-- PLAYERS TABLE INDEXES
-- ============================================================================

-- Tenant-based queries (most common filter)
CREATE INDEX IF NOT EXISTS idx_players_tenant_status
ON players(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_players_tenant_coach
ON players(tenant_id, coach_id)
WHERE coach_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_players_tenant_category
ON players(tenant_id, category);

-- Email lookups (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_players_email_lower
ON players(LOWER(email));

-- Sorting by creation date
CREATE INDEX IF NOT EXISTS idx_players_created_at
ON players(created_at DESC);

-- Full-text search for player names
CREATE INDEX IF NOT EXISTS idx_players_search
ON players USING gin(
  to_tsvector('english', COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
);

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- Authentication queries
CREATE INDEX IF NOT EXISTS idx_users_email_tenant
ON users(email, tenant_id);

CREATE INDEX IF NOT EXISTS idx_users_tenant_role
ON users(tenant_id, role, is_active);

-- Calendar token lookup
CREATE INDEX IF NOT EXISTS idx_users_calendar_token
ON users(calendar_token)
WHERE calendar_token IS NOT NULL;

-- ============================================================================
-- REFRESH TOKENS TABLE INDEXES
-- ============================================================================

-- Token validation queries
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_valid
ON refresh_tokens(user_id, is_revoked, expires_at);

-- Token cleanup queries
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at
ON refresh_tokens(expires_at)
WHERE is_revoked = false;

-- ============================================================================
-- TRAINING SESSIONS TABLE INDEXES
-- ============================================================================

-- Session queries by player and date
CREATE INDEX IF NOT EXISTS idx_training_sessions_player_date
ON training_sessions(player_id, session_date DESC);

-- Tenant-wide session queries
CREATE INDEX IF NOT EXISTS idx_training_sessions_tenant_date
ON training_sessions(tenant_id, session_date DESC);

-- Status-based queries
CREATE INDEX IF NOT EXISTS idx_training_sessions_status
ON training_sessions(status, session_date DESC);

-- Coach viewing all sessions
CREATE INDEX IF NOT EXISTS idx_training_sessions_coach_date
ON training_sessions(coach_id, session_date DESC)
WHERE coach_id IS NOT NULL;

-- ============================================================================
-- ANNUAL TRAINING PLANS TABLE INDEXES
-- ============================================================================

-- Plan lookups by player and status
CREATE INDEX IF NOT EXISTS idx_annual_plans_player_status
ON annual_training_plans(player_id, status);

-- Tenant-wide plan queries
CREATE INDEX IF NOT EXISTS idx_annual_plans_tenant_period
ON annual_training_plans(tenant_id, period_start_date, period_end_date);

-- Active plan lookup
CREATE INDEX IF NOT EXISTS idx_annual_plans_player_active
ON annual_training_plans(player_id, status)
WHERE status = 'active';

-- ============================================================================
-- DAILY TRAINING ASSIGNMENTS TABLE INDEXES
-- ============================================================================

-- High-volume queries for daily plans
CREATE INDEX IF NOT EXISTS idx_daily_assignments_plan_date
ON daily_training_assignments(annual_plan_id, training_date);

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_daily_assignments_date_range
ON daily_training_assignments(training_date)
WHERE training_date >= CURRENT_DATE - INTERVAL '7 days';

-- Completion tracking
CREATE INDEX IF NOT EXISTS idx_daily_assignments_completion
ON daily_training_assignments(annual_plan_id, actual_completed, training_date);

-- ============================================================================
-- MEDIA/VIDEOS TABLE INDEXES
-- ============================================================================

-- Video queries by player
CREATE INDEX IF NOT EXISTS idx_media_player_type
ON media(player_id, media_type)
WHERE player_id IS NOT NULL;

-- Tenant-wide media queries
CREATE INDEX IF NOT EXISTS idx_media_tenant_created
ON media(tenant_id, created_at DESC);

-- Processing status
CREATE INDEX IF NOT EXISTS idx_media_processing_status
ON media(processing_status, created_at)
WHERE processing_status != 'completed';

-- ============================================================================
-- TEST RESULTS TABLE INDEXES
-- ============================================================================

-- Test result queries by player and date
CREATE INDEX IF NOT EXISTS idx_test_results_player_date
ON test_results(player_id, test_date DESC);

-- Test type filtering
CREATE INDEX IF NOT EXISTS idx_test_results_tenant_type
ON test_results(tenant_id, test_type);

-- Latest test per player per type
CREATE INDEX IF NOT EXISTS idx_test_results_player_type_date
ON test_results(player_id, test_type, test_date DESC);

-- ============================================================================
-- COACHES TABLE INDEXES
-- ============================================================================

-- Tenant-based coach queries
CREATE INDEX IF NOT EXISTS idx_coaches_tenant
ON coaches(tenant_id);

-- User relationship lookup
CREATE INDEX IF NOT EXISTS idx_coaches_user
ON coaches(user_id);

-- ============================================================================
-- BREAKING POINTS TABLE INDEXES
-- ============================================================================

-- Breaking points by player and status
CREATE INDEX IF NOT EXISTS idx_breaking_points_player_status
ON breaking_points(player_id, status, category);

-- Date-based queries
CREATE INDEX IF NOT EXISTS idx_breaking_points_player_date
ON breaking_points(player_id, set_date DESC);

-- ============================================================================
-- PLAYER BADGES/ACHIEVEMENTS TABLE INDEXES
-- ============================================================================

-- Achievement queries
CREATE INDEX IF NOT EXISTS idx_player_badges_player_earned
ON player_badges(player_id, earned_at DESC);

-- Badge lookup
CREATE INDEX IF NOT EXISTS idx_player_badges_badge
ON player_badges(badge_id, earned_at DESC);

-- ============================================================================
-- TOURNAMENTS TABLE INDEXES
-- ============================================================================

-- Tournament queries by plan
CREATE INDEX IF NOT EXISTS idx_tournaments_plan
ON scheduled_tournaments(annual_plan_id, start_date);

-- Upcoming tournaments
CREATE INDEX IF NOT EXISTS idx_tournaments_upcoming
ON scheduled_tournaments(start_date)
WHERE start_date >= CURRENT_DATE
ORDER BY start_date ASC;

-- ============================================================================
-- WEEKLY/MONTHLY STATS TABLE INDEXES
-- ============================================================================

-- Weekly stats queries
CREATE INDEX IF NOT EXISTS idx_weekly_stats_player_week
ON weekly_training_stats(player_id, week_start DESC);

-- Monthly stats queries
CREATE INDEX IF NOT EXISTS idx_monthly_stats_player_month
ON monthly_training_stats(player_id, month_start DESC);

-- ============================================================================
-- EVENTS TABLE INDEXES
-- ============================================================================

-- Event queries by tenant and date
CREATE INDEX IF NOT EXISTS idx_events_tenant_date
ON events(tenant_id, event_date DESC);

-- Event type filtering
CREATE INDEX IF NOT EXISTS idx_events_type_date
ON events(event_type, event_date DESC);

-- ============================================================================
-- VERIFICATION AND STATISTICS
-- ============================================================================

-- Verify index creation
DO $$
DECLARE
  idx_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO idx_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';

  RAISE NOTICE 'Total custom indexes created: %', idx_count;
END $$;

-- Analyze tables to update statistics
ANALYZE players;
ANALYZE users;
ANALYZE refresh_tokens;
ANALYZE training_sessions;
ANALYZE annual_training_plans;
ANALYZE daily_training_assignments;
ANALYZE media;
ANALYZE test_results;
ANALYZE coaches;
ANALYZE breaking_points;
ANALYZE player_badges;
ANALYZE scheduled_tournaments;
ANALYZE weekly_training_stats;
ANALYZE monthly_training_stats;
ANALYZE events;

-- ============================================================================
-- INDEX USAGE MONITORING QUERY
-- ============================================================================

-- Run this query periodically to check index usage:
--
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan,
--   idx_tup_read,
--   idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
--   AND indexname LIKE 'idx_%'
-- ORDER BY idx_scan DESC;

-- ============================================================================
-- NOTES
-- ============================================================================

-- 1. This migration adds indexes without removing existing ones
-- 2. Index creation is set to IF NOT EXISTS to allow re-running safely
-- 3. Partial indexes are used where appropriate to reduce index size
-- 4. GIN indexes are used for full-text search
-- 5. All indexes are analyzed after creation to update statistics
-- 6. Monitor index usage to identify unused indexes for removal
