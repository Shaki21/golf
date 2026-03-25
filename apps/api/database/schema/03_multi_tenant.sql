-- ============================================================================
-- Multi-Tenancy Migration
-- Adds tenant_id to all tables and creates tenant management tables
-- ============================================================================

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table (replaces/extends existing user management)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'coach', 'player', 'parent')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create outbox events table (for event-driven architecture)
CREATE TABLE IF NOT EXISTS outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  aggregate_type VARCHAR(100) NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create media table (for S3/MinIO uploads)
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  key VARCHAR(500) NOT NULL UNIQUE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size BIGINT,
  status VARCHAR(20) DEFAULT 'pending_upload' CHECK (status IN ('pending_upload', 'uploaded', 'processing', 'ready', 'failed')),
  uploaded_by UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Add tenant_id to all existing tables
-- ============================================================================

-- Note: This script adds tenant_id columns. For existing data, you need to:
-- 1. Create a default tenant first
-- 2. Update all rows to use that tenant_id
-- 3. Then add the NOT NULL constraint

-- Coaches
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE coaches ALTER COLUMN tenant_id SET NOT NULL;

-- Players
ALTER TABLE players ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE players ALTER COLUMN tenant_id SET NOT NULL;

-- Parents
ALTER TABLE parents ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE parents ALTER COLUMN tenant_id SET NOT NULL;

-- Events
ALTER TABLE events ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE events ALTER COLUMN tenant_id SET NOT NULL;

-- Event Participants
ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE event_participants ALTER COLUMN tenant_id SET NOT NULL;

-- Tournaments
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE tournaments ALTER COLUMN tenant_id SET NOT NULL;

-- Tournament Results
ALTER TABLE tournament_results ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE tournament_results ALTER COLUMN tenant_id SET NOT NULL;

-- Tests
ALTER TABLE tests ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE tests ALTER COLUMN tenant_id SET NOT NULL;

-- Test Results
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE test_results ALTER COLUMN tenant_id SET NOT NULL;

-- Training Sessions
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE training_sessions ALTER COLUMN tenant_id SET NOT NULL;

-- Periodization
ALTER TABLE periodization ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE periodization ALTER COLUMN tenant_id SET NOT NULL;

-- Availability
ALTER TABLE availability ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE availability ALTER COLUMN tenant_id SET NOT NULL;

-- Notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE notifications ALTER COLUMN tenant_id SET NOT NULL;

-- Exercises
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE exercises ALTER COLUMN tenant_id SET NOT NULL;

-- Session Templates
ALTER TABLE session_templates ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE session_templates ALTER COLUMN tenant_id SET NOT NULL;

-- Week Plan Templates
ALTER TABLE week_plan_templates ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE week_plan_templates ALTER COLUMN tenant_id SET NOT NULL;

-- Breaking Points
ALTER TABLE breaking_points ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE breaking_points ALTER COLUMN tenant_id SET NOT NULL;

-- Progress Log
ALTER TABLE progress_log ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE progress_log ALTER COLUMN tenant_id SET NOT NULL;

-- Benchmark Sessions
ALTER TABLE benchmark_sessions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE benchmark_sessions ALTER COLUMN tenant_id SET NOT NULL;

-- References
ALTER TABLE references ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
-- After data migration: ALTER TABLE references ALTER COLUMN tenant_id SET NOT NULL;

-- ============================================================================
-- Create indexes for tenant_id on all tables
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_coaches_tenant ON coaches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_players_tenant ON players(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parents_tenant ON parents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_tenant ON event_participants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_tenant ON tournaments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_tenant ON tournament_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tests_tenant ON tests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_test_results_tenant ON test_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_tenant ON training_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_periodization_tenant ON periodization(tenant_id);
CREATE INDEX IF NOT EXISTS idx_availability_tenant ON availability(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_exercises_tenant ON exercises(tenant_id);
CREATE INDEX IF NOT EXISTS idx_session_templates_tenant ON session_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_week_plan_templates_tenant ON week_plan_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_breaking_points_tenant ON breaking_points(tenant_id);
CREATE INDEX IF NOT EXISTS idx_progress_log_tenant ON progress_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_sessions_tenant ON benchmark_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_references_tenant ON references(tenant_id);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_outbox_created ON outbox_events(created_at);
CREATE INDEX IF NOT EXISTS idx_outbox_processed ON outbox_events(processed_at);
CREATE INDEX IF NOT EXISTS idx_outbox_tenant ON outbox_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_tenant ON media(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_status ON media(status);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);

-- ============================================================================
-- Data migration script (to be run separately after creating default tenant)
-- ============================================================================

-- Example data migration (run after creating default tenant):
--
-- 1. Create default tenant:
-- INSERT INTO tenants (id, name, slug, subscription_tier, status)
-- VALUES ('00000000-0000-0000-0000-000000000001', 'Default Organization', 'default', 'free', 'active');
--
-- 2. Update all existing records with default tenant_id:
-- UPDATE coaches SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
-- UPDATE players SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
-- ... (repeat for all 20 tables)
--
-- 3. Add NOT NULL constraints:
-- ALTER TABLE coaches ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE players ALTER COLUMN tenant_id SET NOT NULL;
-- ... (repeat for all 20 tables)

-- ============================================================================
-- Triggers for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
