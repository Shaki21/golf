/**
 * Migration: 006_navigation_restructure
 *
 * Creates tables for:
 * - School plans (Skoleplan)
 * - Goal progression tracking
 *
 * Part of Phase 3: Navigation Restructuring
 */

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================================
-- SCHOOL PLANS (Skoleplan)
-- ============================================================================

CREATE TABLE IF NOT EXISTS school_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  type VARCHAR(50) CHECK (type IN ('exam', 'assignment', 'project', 'test', 'other')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for school_plans
CREATE INDEX IF NOT EXISTS idx_school_plans_player_id ON school_plans(player_id);
CREATE INDEX IF NOT EXISTS idx_school_plans_due_date ON school_plans(due_date);
CREATE INDEX IF NOT EXISTS idx_school_plans_status ON school_plans(status);

-- ============================================================================
-- GOAL PROGRESSION (Målprogresjon)
-- ============================================================================

CREATE TABLE IF NOT EXISTS goal_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one entry per goal per date
  UNIQUE(goal_id, date)
);

-- Indexes for goal_progression
CREATE INDEX IF NOT EXISTS idx_goal_progression_goal_id ON goal_progression(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progression_date ON goal_progression(date);
CREATE INDEX IF NOT EXISTS idx_goal_progression_goal_date ON goal_progression(goal_id, date DESC);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

-- Trigger for school_plans updated_at
CREATE TRIGGER update_school_plans_updated_at
  BEFORE UPDATE ON school_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for goal_progression updated_at
CREATE TRIGGER update_goal_progression_updated_at
  BEFORE UPDATE ON goal_progression
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- DROP TRIGGER IF EXISTS update_goal_progression_updated_at ON goal_progression;
-- DROP TRIGGER IF EXISTS update_school_plans_updated_at ON school_plans;
-- DROP TABLE IF EXISTS goal_progression;
-- DROP TABLE IF EXISTS school_plans;
